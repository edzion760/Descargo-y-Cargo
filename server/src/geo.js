// Geocodificación y ruteo con OpenStreetMap (Nominatim + OSRM) — gratis, sin
// tarjeta ni cuenta, a diferencia de Google Maps. Los servidores públicos
// piden identificarse y limitan a ~1 req/seg; por eso el llamado es
// secuencial (nunca en paralelo) y con caché en memoria.
//
// La tarifa SICE-TAC sigue siendo la misma referencia de
// app/src/data/mock.ts (RUTAS) — solo que aquí se interpola por distancia
// real en vez de limitarse a 8 rutas fijas. Sigue siendo REFERENCIAL, no oficial.

const USER_AGENT = 'DescargoYCargo/1.0 (+https://descargoycargo.com)';

// Mismos puntos de referencia que app/src/data/mock.ts (RUTAS), ordenados por km.
const REFERENCIA_SICE_TAC = [
  { km: 138, tarifaPorTon: 106000 },
  { km: 290, tarifaPorTon: 145000 },
  { km: 380, tarifaPorTon: 178000 },
  { km: 415, tarifaPorTon: 185000 },
  { km: 415, tarifaPorTon: 190000 },
  { km: 460, tarifaPorTon: 198000 },
  { km: 990, tarifaPorTon: 385000 },
  { km: 1050, tarifaPorTon: 402000 },
].sort((a, b) => a.km - b.km);

// Interpola linealmente la tarifa/ton para una distancia cualquiera, usando
// los 8 puntos de referencia. Fuera de rango, se recorta al extremo conocido
// (evita extrapolar a números absurdos).
export function tarifaPorTonInterpolada(km) {
  const puntos = REFERENCIA_SICE_TAC;
  if (km <= puntos[0].km) return puntos[0].tarifaPorTon;
  if (km >= puntos[puntos.length - 1].km) return puntos[puntos.length - 1].tarifaPorTon;

  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i];
    const b = puntos[i + 1];
    if (km >= a.km && km <= b.km) {
      if (a.km === b.km) return (a.tarifaPorTon + b.tarifaPorTon) / 2;
      const t = (km - a.km) / (b.km - a.km);
      return a.tarifaPorTon + t * (b.tarifaPorTon - a.tarifaPorTon);
    }
  }
  return puntos[puntos.length - 1].tarifaPorTon; // inalcanzable, por defensa
}

const cacheGeocodificacion = new Map(); // ponytail: en memoria, se pierde al reiniciar; pasar a Redis si el tráfico lo justifica.

export async function geocodificar(lugar) {
  const clave = lugar.trim().toLowerCase();
  if (cacheGeocodificacion.has(clave)) return cacheGeocodificacion.get(clave);

  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: `${lugar}, Colombia`,
    format: 'json',
    limit: '1',
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error('No se pudo geocodificar la ubicación');
  const [resultado] = await res.json();
  if (!resultado) throw new Error(`No se encontró "${lugar}"`);

  const coords = { lat: Number(resultado.lat), lon: Number(resultado.lon) };
  cacheGeocodificacion.set(clave, coords);
  return coords;
}

export async function distanciaKm(origen, destino) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origen.lon},${origen.lat};${destino.lon},${destino.lat}?overview=false`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error('No se pudo calcular la ruta');
  const data = await res.json();
  const metros = data.routes?.[0]?.distance;
  if (!metros) throw new Error('No hay ruta terrestre entre esos puntos');
  return metros / 1000;
}

// Solo geocodifica y calcula la tarifa/ton — la multiplicación por toneladas
// y tipo de carga la hace el frontend (así el slider de toneladas no dispara
// una llamada de red por cada cambio, solo el cambio de origen/destino).
export async function calcularTarifaRuta(origen, destino) {
  const coordsOrigen = await geocodificar(origen);
  const coordsDestino = await geocodificar(destino); // secuencial, no Promise.all (política de Nominatim)
  const km = await distanciaKm(coordsOrigen, coordsDestino);
  return { km: Math.round(km), tarifaPorTon: Math.round(tarifaPorTonInterpolada(km)) };
}
