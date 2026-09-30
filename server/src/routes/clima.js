import crypto from 'node:crypto';
import express, { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { climaEnRuta, guardarDeslizamientos } from '../clima.js';

export const climaRouter = Router();

const consulta = z.object({
  origen: z.string().trim().min(2).max(80),
  destino: z.string().trim().min(2).max(80),
});

// Con sesión: cada consulta dispara llamadas a servicios públicos (Nominatim,
// OSRM, MET Norway) que piden uso moderado; así no queda abierta a cualquiera.
// El computador en Colombia que descarga las alertas del IDEAM las sube aquí
// (el IDEAM no responde al servidor, que está fuera del país). Se autentica
// con un token compartido (IDEAM_SYNC_TOKEN), no con sesión de usuario.
export function tokenValido(recibido, esperado) {
  if (!esperado || typeof recibido !== 'string') return false;
  const a = Buffer.from(recibido), b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

climaRouter.post('/ideam', express.text({ type: 'text/csv', limit: '10mb' }), (req, res) => {
  if (!tokenValido(req.get('X-Sync-Token'), process.env.IDEAM_SYNC_TOKEN)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    res.json(guardarDeslizamientos(String(req.body ?? '')));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

climaRouter.get('/ruta', requireAuth, async (req, res) => {
  const parsed = consulta.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Indica origen y destino' });
  try {
    res.json(await climaEnRuta(parsed.data.origen, parsed.data.destino));
  } catch (err) {
    res.status(502).json({ error: `No pudimos consultar el clima de la ruta: ${err.message}` });
  }
});
