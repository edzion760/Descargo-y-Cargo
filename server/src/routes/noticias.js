import { Router } from 'express';
import { obtenerNoticiasVia } from '../noticias.js';

export const noticiasRouter = Router();

noticiasRouter.get('/via', async (_req, res) => {
  try {
    res.json(await obtenerNoticiasVia());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});
