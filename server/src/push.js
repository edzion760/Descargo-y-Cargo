// Notificaciones push del navegador (Web Push estándar, W3C) para alertas de
// vía geolocalizadas -- no es un servicio de terceros pago: la entrega la
// hace el propio navegador/SO del usuario (igual que YouTube o Gmail), solo
// se necesita un par de llaves VAPID (gratis, autogeneradas, ver .env.example).
import webpush from 'web-push';
import { prisma } from './db.js';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:descargoycargo@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const RADIO_KM = 50;
const UBICACION_VIGENTE_MS = 2 * 60 * 60 * 1000; // 2h: una ubicación más vieja ya no sirve para "estás cerca"

const ETIQUETA_TIPO = {
  ACCIDENTE: 'Accidente',
  CIERRE_VIA: 'Cierre de vía',
  CONDICION_CLIMA: 'Clima',
  VIA_LIBRE: 'Vía libre',
  INFO: 'Alerta de vía',
};

export function distanciaHaversineKm(a, b) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Clave "usuarioId:url" -- por PAR usuario+noticia, no solo por noticia: un
// usuario puede entrar al radio más tarde (viene manejando) y sí debe
// recibir la alerta aunque la noticia ya se haya revisado para otros.
// ponytail: set en memoria, se resetea al reiniciar el servidor (peor caso:
// se reenvía una alerta ya vista). Pasar a una tabla si eso molesta.
const yaNotificadas = new Set();

export async function notificarNoticiasCercanas(noticias) {
  const geolocalizadas = noticias.filter((n) => n.lat != null);
  if (geolocalizadas.length === 0) return;

  const desde = new Date(Date.now() - UBICACION_VIGENTE_MS);
  const usuarios = await prisma.usuario.findMany({
    where: { ultimaUbicacionEn: { gte: desde }, suscripciones: { some: {} } },
    include: { suscripciones: true },
  });
  if (usuarios.length === 0) return;

  for (const noticia of geolocalizadas) {
    for (const usuario of usuarios) {
      const clave = `${usuario.id}:${noticia.url}`;
      if (yaNotificadas.has(clave)) continue;

      const distancia = distanciaHaversineKm(
        { lat: usuario.ultimaLat, lon: usuario.ultimaLon },
        { lat: noticia.lat, lon: noticia.lon }
      );
      if (distancia > RADIO_KM) continue;

      for (const sub of usuario.suscripciones) {
        await enviarPush(sub, noticia, distancia);
      }
      yaNotificadas.add(clave);
    }
  }
}

async function enviarPush(sub, noticia, distanciaKm) {
  const payload = JSON.stringify({
    titulo: `${ETIQUETA_TIPO[noticia.tipo] ?? 'Alerta de vía'} a ${Math.round(distanciaKm)} km`,
    cuerpo: noticia.titulo,
    url: noticia.url,
  });
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await prisma.suscripcionPush.delete({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.error('Push falló:', err.message);
    }
  }
}
