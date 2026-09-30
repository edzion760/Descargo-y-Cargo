// Revisión periódica del clima en la ruta de los viajes de hoy y mañana, con
// aviso push al transportador cuando aparece algo nuevo e importante. Solo
// avisa lo que cambia una decisión de manejo: riesgo ALTO de deslizamiento
// (IDEAM) o tormenta / lluvia fuerte en las próximas horas (MET Norway). Lo
// MODERADO y la niebla se ven en la pantalla del viaje, sin notificación.
import { prisma } from './db.js';
import { climaEnRuta } from './clima.js';
import { enviarPush } from './push.js';

const ETIQUETA_CLIMA = { TORMENTA: 'Tormenta', LLUVIA_FUERTE: 'Lluvia fuerte' };

// ponytail: en memoria, como las alertas de vía; tras un reinicio se puede
// repetir un aviso ya enviado. Pasar a una tabla si eso molesta.
const yaAvisado = new Set();

const horaColombia = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' });

// Arma el texto con lo NUEVO de una revisión; null si no hay nada que avisar.
export function avisoNuevo(viajeId, usuarioId, resultado, avisados) {
  const partes = [];
  for (const a of resultado.deslizamientos.alertas) {
    const clave = `${usuarioId}:${viajeId}:d:${a.codigo}:${resultado.deslizamientos.fecha}`;
    if (a.nivel !== 'ALTA' || avisados.has(clave)) continue;
    avisados.add(clave);
    partes.push(`Riesgo ALTO de derrumbes en ${titulo(a.municipio)} (IDEAM)`);
  }
  for (const c of resultado.clima) {
    const clave = `${usuarioId}:${viajeId}:c:${c.lugar}:${c.hora}`;
    if (!ETIQUETA_CLIMA[c.tipo] || avisados.has(clave)) continue;
    avisados.add(clave);
    partes.push(`${ETIQUETA_CLIMA[c.tipo]} cerca de ${titulo(c.lugar)} hacia las ${horaColombia(c.hora)}`);
  }
  return partes.length ? partes.join('. ') + '.' : null;
}

// "SAN JOSÉ DE PARE" -> "San José de Pare", "BOGOTÁ, D.C." -> "Bogotá, D.C."
export const titulo = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s\-.])\p{L}/gu, (m) => m.toUpperCase())
    .replace(/(?<=\s)(De|Del|La|Las|Los|Y)(?=\s)/g, (m) => m.toLowerCase());

export async function revisarClimaEnRutas() {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const desde = new Date(`${hoy}T00:00:00Z`);
  const hasta = new Date(desde.getTime() + 2 * 86400_000); // hoy y mañana

  const viajes = await prisma.viaje.findMany({
    where: { fecha: { gte: desde, lt: hasta }, transportador: { usuario: { eliminadoEn: null, suscripciones: { some: {} } } } },
    include: { transportador: { include: { usuario: { include: { suscripciones: true } } } } },
  });

  for (const v of viajes) {
    const usuario = v.transportador.usuario;
    try {
      const cuerpo = avisoNuevo(v.id, usuario.id, await climaEnRuta(v.origen, v.destino), yaAvisado);
      if (!cuerpo) continue;
      for (const sub of usuario.suscripciones) {
        await enviarPush(sub, { titulo: `Alerta en tu ruta ${v.origen} → ${v.destino}`, cuerpo, url: '/viajes' });
      }
    } catch (err) {
      console.error(`Clima en ruta (viaje ${v.id}):`, err.message);
    }
  }
}
