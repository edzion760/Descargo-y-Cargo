import { Router } from 'express';
import { despachosRealesRndc } from '../rndc.js';

export const rndcRouter = Router();

rndcRouter.get('/referencia', async (req, res) => {
  const { origen, destino } = req.query;
  if (!origen || !destino) return res.status(400).json({ error: 'Faltan origen y destino' });

  try {
    res.json(await despachosRealesRndc(String(origen), String(destino)));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});
