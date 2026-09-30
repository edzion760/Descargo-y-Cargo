// Alertas de clima en la ruta del transportador. Tres fuentes, todas con uso
// comercial permitido:
// - IDEAM (Colombia): alertas diarias de deslizamientos detonados por lluvia,
//   por municipio. Datos abiertos del Estado.
// - DANE (DIVIPOLA, vía datos.gov.co): coordenadas de los 1.122 municipios,
//   con el mismo código que usa el IDEAM.
// - MET Norway (api.met.no): pronóstico hora a hora. Licencia CC BY 4.0 /
//   NLOD: gratis y comercial con atribución ("Datos de MET Norway").
// El trazado de la carretera sale de OSRM (el mismo de geo.js).
//
// Todo es REFERENCIAL: se muestra con la fuente y la hora, nunca como
// garantía de que la vía está bien o mal.

import fs from 'node:fs';
import path from 'node:path';
import { geocodificar } from './geo.js';
import { distanciaHaversineKm as distanciaKm } from './push.js';

const USER_AGENT = 'DescargoYCargo/1.0 (+https://descargoycargo.com; descargoycargo@gmail.com)';
const URL_DESLIZAMIENTOS = 'https://bart.ideam.gov.co/ospa/DatosAbiertos/Alertas_Deslizamientos/alertas_deslizamientos.csv';
const URL_MUNICIPIOS = 'https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=2000';

const RADIO_MUNICIPIO_KM = 12; // un municipio "está en la ruta" si su cabecera queda a menos de esto de la vía
const PUNTOS_PRONOSTICO_CADA_KM = 40;
const MAX_PUNTOS_PRONOSTICO = 12;
const HORAS_PRONOSTICO = 6;

// ---------- geometría ----------

const aRad = (g) => (g * Math.PI) / 180;


// Distancia de un punto a un tramo recto, con proyección plana local
// (equirectangular): de sobra precisa para tramos de pocos km en Colombia.
export function distanciaATramoKm(p, a, b) {
  const kx = 111.32 * Math.cos(aRad(p.lat));
  const ky = 110.57;
  const ax = (a.lon - p.lon) * kx, ay = (a.lat - p.lat) * ky;
  const bx = (b.lon - p.lon) * kx, by = (b.lat - p.lat) * ky;
  const dx = bx - ax, dy = by - ay;
  const largo2 = dx * dx + dy * dy;
  const t = largo2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / largo2));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

export function distanciaARutaKm(p, ruta) {
  let min = Infinity;
  for (let i = 0; i < ruta.length - 1; i++) min = Math.min(min, distanciaATramoKm(p, ruta[i], ruta[i + 1]));
  return min;
}

// Puntos cada `cadaKm` a lo largo de la ruta (incluye origen y destino).
export function muestrearRuta(ruta, cadaKm, maximo) {
  const puntos = [ruta[0]];
  let acumulado = 0;
  for (let i = 1; i < ruta.length; i++) {
    acumulado += distanciaKm(ruta[i - 1], ruta[i]);
    if (acumulado >= cadaKm) {
      puntos.push(ruta[i]);
      acumulado = 0;
    }
  }
  puntos.push(ruta[ruta.length - 1]);
  if (puntos.length <= maximo) return puntos;
  const paso = (puntos.length - 1) / (maximo - 1);
  return Array.from({ length: maximo }, (_, i) => puntos[Math.round(i * paso)]);
}

// ---------- IDEAM: alertas de deslizamientos ----------

// El CSV acumula todo el año (decenas de miles de filas); solo sirve la
// última fecha de ejecución. Formato: ;-separado, fecha dd/mm/aaaa.
export function parsearDeslizamientos(csv) {
  const lineas = csv.replace(/^﻿/, '').trim().split(/\r?\n/);
  const cab = lineas[0].split(';');
  const col = (n) => cab.indexOf(n);
  const [iDpto, iMpio, iDane, iNivel, iAc3, iFecha] = ['DEPARTAMENTO', 'MUNICIPIO', 'COD_DANE', 'TEXTO_AMENAZA', 'ACUMULADO_TRES', 'FECHA_EJECUCION'].map(col);
  const filas = lineas.slice(1).map((l) => l.split(';'));
  const aISO = (f) => f.split('/').reverse().join('-');
  const ultima = filas.reduce((max, f) => (aISO(f[iFecha] ?? '') > max ? aISO(f[iFecha]) : max), '');
  const alertas = new Map();
  for (const f of filas) {
    if (aISO(f[iFecha] ?? '') !== ultima) continue;
    alertas.set(f[iDane].padStart(5, '0'), {
      municipio: f[iMpio],
      departamento: f[iDpto],
      nivel: f[iNivel], // ALTA | MODERADA | BAJA (los municipios sin alerta no aparecen)
      lluvia3DiasMm: Number(f[iAc3]),
    });
  }
  return { fecha: ultima, alertas };
}

// ---------- MET Norway: pronóstico ----------

// Clasifica una hora del pronóstico en lo que le importa a un conductor.
export function clasificarHora(simbolo = '', mm = 0) {
  if (simbolo.includes('thunder')) return 'TORMENTA';
  if (simbolo.includes('heavy') || mm >= 4) return 'LLUVIA_FUERTE';
  if (simbolo.includes('fog')) return 'NIEBLA';
  return null;
}

// ---------- cachés ----------
// ponytail: en memoria, se pierden al reiniciar (se recargan solas). El
// IDEAM publica una vez al día; MET Norway pide no consultar un mismo punto
// más seguido que su Expires (~30 min).

const cache = new Map();
async function conCache(clave, ttlMs, cargar) {
  const hit = cache.get(clave);
  if (hit && Date.now() - hit.en < ttlMs) return hit.valor;
  const valor = await cargar();
  cache.set(clave, { valor, en: Date.now() });
  return valor;
}

async function obtener(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${new URL(url).host} respondió ${res.status}`);
  return res;
}

// El IDEAM rechaza conexiones desde fuera de Colombia y el servidor está en
// Alemania: un computador en Colombia descarga el CSV a diario y lo envía a
// POST /api/clima/ideam (ver guardarDeslizamientos). Si no hay copia (p. ej.
// en desarrollo, desde Colombia), se intenta directo con un tiempo corto.
const ARCHIVO_IDEAM = path.join(process.env.DATA_DIR ?? path.join(import.meta.dirname, '../data'), 'ideam-deslizamientos.csv');

const deslizamientos = () =>
  conCache('ideam', 3600_000, async () => {
    if (fs.existsSync(ARCHIVO_IDEAM)) return parsearDeslizamientos(fs.readFileSync(ARCHIVO_IDEAM, 'utf8'));
    const res = await fetch(URL_DESLIZAMIENTOS, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`IDEAM respondió ${res.status}`);
    return parsearDeslizamientos(await res.text());
  });

// Recibe el CSV del IDEAM (completo o solo la última fecha), lo valida y lo
// guarda. Devuelve la fecha y cuántos municipios traen alerta.
export function guardarDeslizamientos(csv) {
  const datos = parsearDeslizamientos(csv);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || datos.alertas.size === 0) {
    throw new Error('El archivo no tiene el formato de alertas de deslizamiento del IDEAM');
  }
  fs.mkdirSync(path.dirname(ARCHIVO_IDEAM), { recursive: true });
  fs.writeFileSync(ARCHIVO_IDEAM, csv);
  cache.set('ideam', { valor: datos, en: Date.now() });
  return { fecha: datos.fecha, municipios: datos.alertas.size };
}

const municipios = () =>
  conCache('divipola', 7 * 24 * 3600_000, async () =>
    (await (await obtener(URL_MUNICIPIOS)).json()).map((m) => ({
      codigo: m.cod_mpio,
      nombre: m.nom_mpio,
      departamento: m.dpto,
      lat: Number(String(m.latitud).replace(',', '.')),
      lon: Number(String(m.longitud).replace(',', '.')),
    }))
  );

const trazado = (o, d) =>
  conCache(`osrm:${o.lat},${o.lon};${d.lat},${d.lon}`, 24 * 3600_000, async () => {
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=simplified&geometries=geojson`;
    const ruta = (await (await obtener(url)).json()).routes?.[0];
    if (!ruta) throw new Error('No hay ruta terrestre entre esos puntos');
    return ruta.geometry.coordinates.map(([lon, lat]) => ({ lat, lon }));
  });

const pronostico = (p) =>
  conCache(`met:${p.lat.toFixed(2)},${p.lon.toFixed(2)}`, 30 * 60_000, async () => {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${p.lat.toFixed(2)}&lon=${p.lon.toFixed(2)}`;
    return (await (await obtener(url)).json()).properties.timeseries;
  });

// ---------- consulta principal ----------

export async function climaEnRuta(origen, destino, ahora = new Date()) {
  const o = await geocodificar(origen);
  const d = await geocodificar(destino); // secuencial: política de Nominatim
  // Si no hay alertas del IDEAM disponibles, el pronóstico de lluvia sigue sirviendo.
  const [ruta, lista, ideam] = await Promise.all([
    trazado(o, d),
    municipios(),
    deslizamientos().catch((err) => (console.error('IDEAM no disponible:', err.message), null)),
  ]);

  const enRuta = lista.filter((m) => distanciaARutaKm(m, ruta) <= RADIO_MUNICIPIO_KM);
  const municipioMasCercano = (p) => lista.reduce((a, b) => (distanciaKm(p, a) <= distanciaKm(p, b) ? a : b));

  // BAJA también viene en el CSV, pero para un conductor es ruido: solo
  // ALTA y MODERADA, de mayor a menor riesgo.
  const RANGO = { ALTA: 0, MODERADA: 1 };
  const alertasDeslizamiento = enRuta
    .map((m) => ideam?.alertas.get(m.codigo) && { ...ideam.alertas.get(m.codigo), codigo: m.codigo })
    .filter((a) => a && a.nivel in RANGO)
    .sort((a, b) => RANGO[a.nivel] - RANGO[b.nivel] || b.lluvia3DiasMm - a.lluvia3DiasMm);

  // Pronóstico: puntos a lo largo de la vía, próximas horas. Secuencial para
  // no golpear a MET Norway en ráfaga.
  const limite = ahora.getTime() + HORAS_PRONOSTICO * 3600_000;
  const clima = [];
  for (const p of muestrearRuta(ruta, PUNTOS_PRONOSTICO_CADA_KM, MAX_PUNTOS_PRONOSTICO)) {
    const serie = await pronostico(p).catch(() => []);
    const peor = serie
      .filter((t) => new Date(t.time).getTime() <= limite && new Date(t.time).getTime() >= ahora.getTime() - 3600_000)
      .map((t) => ({
        hora: t.time,
        mm: t.data.next_1_hours?.details?.precipitation_amount ?? 0,
        tipo: clasificarHora(t.data.next_1_hours?.summary?.symbol_code, t.data.next_1_hours?.details?.precipitation_amount),
      }))
      .find((h) => h.tipo);
    const m = peor && municipioMasCercano(p);
    // Dos puntos de la vía pueden caer junto al mismo municipio: uno basta.
    if (peor && !clima.some((c) => c.lugar === m.nombre)) {
      clima.push({ ...peor, lugar: m.nombre, departamento: m.departamento });
    }
  }

  return {
    municipiosEnRuta: enRuta.length,
    // fecha null = no hay alertas del IDEAM disponibles (la pantalla lo dice).
    deslizamientos: { fecha: ideam?.fecha ?? null, alertas: alertasDeslizamiento },
    clima,
    fuentes: 'Alertas de deslizamiento: IDEAM. Pronóstico: datos de MET Norway (CC BY 4.0).',
  };
}
