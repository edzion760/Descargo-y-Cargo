import { Router } from 'express';
import { prisma } from '../db.js';
import { checksumValido } from '../wompi.js';

export const webhooksRouter = Router();

const ESTADO_WOMPI = {
  APPROVED: 'VERIFICADO',
  DECLINED: 'RECHAZADO',
  VOIDED: 'RECHAZADO',
  ERROR: 'RECHAZADO',
};

// Wompi llama esto cuando una transacción cambia de estado. Sin auth (lo llama
// Wompi, no un usuario) — la firma (checksum) es lo que prueba que es legítimo.
webhooksRouter.post('/wompi', async (req, res) => {
  if (!checksumValido(req.body)) return res.status(401).json({ error: 'Firma inválida' });

  const transaccion = req.body.data?.transaction;
  const estado = ESTADO_WOMPI[transaccion?.status];
  if (!estado || !transaccion?.reference) return res.status(200).json({ ok: true });

  await prisma.pagoDesbloqueo.updateMany({
    where: { referencia: transaccion.reference },
    data: { estado },
  });

  res.status(200).json({ ok: true });
});
