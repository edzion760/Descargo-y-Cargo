import { Router } from 'express';
import { prisma } from '../db.js';

export const prospectosRouter = Router();

// Derecho de oposición a mercadeo directo (Ley 1581 de 2012, art. 8): un
// clic desde el correo, sin cuenta ni token. ponytail: el id es adivinable
// y no requiere autenticación -- riesgo bajo a propósito (lo peor que puede
// pasar es que alguien más dé de baja a una empresa de la lista de
// mercadeo, no expone ni cambia ningún dato sensible).
prospectosRouter.get('/baja', async (req, res) => {
  const id = Number(req.query.id);
  if (id) {
    await prisma.prospecto.updateMany({ where: { id }, data: { noContactar: true } });
  }
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Baja confirmada</title></head>
    <body style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;text-align:center;color:#18181b">
      <h1 style="font-size:18px">Listo, no te volveremos a escribir</h1>
      <p style="color:#71717a;font-size:14px">Tu empresa fue removida de la lista de invitación de Descargo &amp; Cargo.</p>
    </body></html>`);
});
