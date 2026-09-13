import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const pushRouter = Router();

pushRouter.get('/clave-publica', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null });
});

pushRouter.post('/suscribir', requireAuth, async (req, res) => {
  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Suscripción inválida' });
  }

  await prisma.suscripcionPush.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, usuarioId: req.user.sub },
    update: { p256dh: keys.p256dh, auth: keys.auth, usuarioId: req.user.sub },
  });
  res.status(201).json({ ok: true });
});

pushRouter.post('/ubicacion', requireAuth, async (req, res) => {
  const { lat, lon } = req.body ?? {};
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return res.status(400).json({ error: 'lat/lon inválidos' });
  }

  await prisma.usuario.update({
    where: { id: req.user.sub },
    data: { ultimaLat: lat, ultimaLon: lon, ultimaUbicacionEn: new Date() },
  });
  res.json({ ok: true });
});
