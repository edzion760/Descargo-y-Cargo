import { Router } from 'express';
import { z } from 'zod';
import { calcularTarifaRuta } from '../geo.js';

export const geoRouter = Router();

const querySchema = z.object({
  origen: z.string().min(2),
  destino: z.string().min(2),
});

geoRouter.get('/ruta', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const resultado = await calcularTarifaRuta(parsed.data.origen, parsed.data.destino);
    res.json(resultado);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});
