import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { climaEnRuta } from '../clima.js';

export const climaRouter = Router();

const consulta = z.object({
  origen: z.string().trim().min(2).max(80),
  destino: z.string().trim().min(2).max(80),
});

// Con sesión: cada consulta dispara llamadas a servicios públicos (Nominatim,
// OSRM, MET Norway) que piden uso moderado; así no queda abierta a cualquiera.
climaRouter.get('/ruta', requireAuth, async (req, res) => {
  const parsed = consulta.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Indica origen y destino' });
  try {
    res.json(await climaEnRuta(parsed.data.origen, parsed.data.destino));
  } catch (err) {
    res.status(502).json({ error: `No pudimos consultar el clima de la ruta: ${err.message}` });
  }
});
