import { Router } from 'express';
import { obtenerNoticiasVia } from '../noticias.js';
import { notificarNoticiasCercanas } from '../push.js';

export const noticiasRouter = Router();

noticiasRouter.get('/via', async (_req, res) => {
  try {
    const noticias = await obtenerNoticiasVia();
    res.json(noticias);
    // Después de responder: si el feed se refrescó, revisa si hay alguien
    // suscrito cerca de una noticia nueva. ponytail: se dispara con la
    // visita de cualquier usuario en vez de un cron aparte -- si el sitio
    // no tiene tráfico por horas, las alertas se demoran hasta la próxima
    // visita en vez de llegar exactamente al minuto.
    notificarNoticiasCercanas(noticias).catch((err) => console.error('notificarNoticiasCercanas:', err));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});
