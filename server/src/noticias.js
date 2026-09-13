// Alertas de carretera reales, sin IA: Google News RSS es gratis, sin
// tarjeta ni cuenta, y ya trae título/fuente/fecha reales. La clasificación
// de tipo (accidente/cierre/clima/vía libre) es por palabras clave del
// titular, NO un modelo de IA -- si el titular no calza con ninguna, se
// muestra como 'INFO' en vez de inventar una categoría.
//
// ponytail: parseo de RSS por regex en vez de un parser XML -- Google News
// RSS tiene una estructura fija y simple (title/link/pubDate/source por
// <item>); si algún día se agrega otra fuente con XML más irregular, pasar
// a un parser real (ej. fast-xml-parser).

import { geocodificar } from './geo.js';

const USER_AGENT = 'DescargoYCargo/1.0 (+https://descargoycargo.com)';
const QUERY = '("derrumbe" OR "cierre" OR "trancón" OR "accidente") ("vía" OR "vial" OR "carretera" OR "corredor") Colombia';
const RSS_URL = `https://news.google.com/rss/search?${new URLSearchParams({
  q: QUERY,
  hl: 'es-419',
  gl: 'CO',
  ceid: 'CO:es-419',
})}`;

const PALABRAS_TIPO = [
  { tipo: 'ACCIDENTE', palabras: ['accidente', 'choque', 'volcamiento', 'colisión'] },
  { tipo: 'CIERRE_VIA', palabras: ['cierre', 'cerrad', 'derrumbe', 'trancón', 'trancon', 'bloqueo'] },
  { tipo: 'CONDICION_CLIMA', palabras: ['lluvia', 'niebla', 'neblina', 'clima', 'inundaci'] },
  { tipo: 'VIA_LIBRE', palabras: ['reabr', 'habilitad', 'normalidad', 'restablec'] },
];

// El buscador de Google News no es un booleano estricto: puede devolver
// resultados que solo coinciden por texto del cuerpo, no del titular (ej. un
// accidente de moto en San Marino, o una nota roja que menciona "vía al
// Llano" como ubicación). Se filtra en dos pasos sobre el TITULAR, que es lo
// único que se muestra: debe mencionar una vía/carretera, y no debe ser una
// noticia de sucesos que no aporta nada a un transportador.
const PALABRAS_VIA = ['vía', 'vial', 'carretera', 'corredor', 'autopista', 'trocha'];
const PALABRAS_EXCLUIR = ['cadáver', 'asesinat', 'feminicid', 'captur', 'homicid', 'secuestr'];

export function esRelevante(titulo) {
  const t = titulo.toLowerCase();
  if (PALABRAS_EXCLUIR.some((p) => t.includes(p))) return false;
  return PALABRAS_VIA.some((p) => t.includes(p));
}

export function clasificarTipo(titulo) {
  const t = titulo.toLowerCase();
  for (const { tipo, palabras } of PALABRAS_TIPO) {
    if (palabras.some((p) => t.includes(p))) return tipo;
  }
  return 'INFO';
}

// Corredores/ciudades más nombrados en noticias de vía en Colombia -- lista
// curada a mano, no exhaustiva (crece según lo que se vea en producción).
// Sin esto no se puede geolocalizar una noticia para las alertas push; con
// esto solo se geolocalizan las que mencionan uno de estos lugares, el
// resto se muestra igual en el feed pero sin alerta de proximidad.
const CORREDORES = [
  { patron: /vía al llano|bogotá\s*[-–]?\s*villavicencio|villavicencio\s*[-–]?\s*bogotá/i, lugar: 'Villavicencio' },
  { patron: /la línea|calarcá|cajamarca/i, lugar: 'Calarcá' },
  { patron: /medellín\s*[-–]?\s*manizales|manizales\s*[-–]?\s*medellín/i, lugar: 'Manizales' },
  { patron: /buenaventura/i, lugar: 'Buenaventura' },
  { patron: /barranquilla/i, lugar: 'Barranquilla' },
  { patron: /cartagena/i, lugar: 'Cartagena' },
  { patron: /bucaramanga/i, lugar: 'Bucaramanga' },
  { patron: /pasto/i, lugar: 'Pasto' },
  { patron: /ibagué/i, lugar: 'Ibagué' },
  { patron: /medellín/i, lugar: 'Medellín' },
  { patron: /bogotá/i, lugar: 'Bogotá' },
  { patron: /\bcali\b/i, lugar: 'Cali' },
];

export function detectarLugar(titulo) {
  for (const { patron, lugar } of CORREDORES) {
    if (patron.test(titulo)) return lugar;
  }
  return null;
}

export function tiempoRelativo(pubDate, ahora = new Date()) {
  const minutos = Math.max(0, Math.round((ahora - new Date(pubDate)) / 60000));
  if (minutos < 1) return 'justo ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.round(horas / 24)} d`;
}

function extraerTag(bloque, tag) {
  const m = bloque.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return '';
  return m[1]
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function parsearItemsRss(xml) {
  const bloques = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return bloques.map((bloque) => ({
    titulo: extraerTag(bloque, 'title'),
    link: extraerTag(bloque, 'link'),
    pubDate: extraerTag(bloque, 'pubDate'),
    fuente: extraerTag(bloque, 'source'),
  }));
}

let cache = { datos: null, obtenidoEn: 0 };
const TTL_MS = 10 * 60 * 1000; // 10 min -- no tiene sentido pedirle a Google News en cada visita

export async function obtenerNoticiasVia() {
  if (cache.datos && Date.now() - cache.obtenidoEn < TTL_MS) return cache.datos;

  const res = await fetch(RSS_URL, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error('No se pudo obtener noticias de vía');
  const xml = await res.text();

  const items = parsearItemsRss(xml)
    .filter((item) => esRelevante(item.titulo))
    .slice(0, 8);
  const ahora = new Date();

  const noticias = [];
  for (const [i, item] of items.entries()) {
    const titulo = item.titulo.replace(new RegExp(`\\s*-\\s*${item.fuente}$`), '');
    const lugar = detectarLugar(titulo);
    let coords = null;
    if (lugar) {
      // Secuencial (no Promise.all): mismo límite de Nominatim que geo.js.
      coords = await geocodificar(lugar).catch(() => null);
    }
    noticias.push({
      id: i + 1,
      tipo: clasificarTipo(titulo),
      titulo,
      fuente: item.fuente,
      url: item.link,
      hace: tiempoRelativo(item.pubDate, ahora),
      lat: coords?.lat ?? null,
      lon: coords?.lon ?? null,
    });
  }

  cache = { datos: noticias, obtenidoEn: Date.now() };
  return noticias;
}
