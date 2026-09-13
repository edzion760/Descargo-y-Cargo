import { Router } from 'express';
import { prisma } from '../db.js';
import { checksumValido } from '../wompi.js';
import { enviarPagoConfirmado } from '../email.js';

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

  const pago = await prisma.pagoDesbloqueo.findUnique({
    where: { referencia: transaccion.reference },
    include: { carga: true, transportador: { include: { usuario: true } } },
  });
  if (!pago) return res.status(200).json({ ok: true });

  const yaEstabaVerificado = pago.estado === 'VERIFICADO';
  await prisma.pagoDesbloqueo.update({ where: { id: pago.id }, data: { estado } });

  // Wompi puede reintentar el mismo webhook -- solo se envía una vez por pago.
  if (estado === 'VERIFICADO' && !yaEstabaVerificado) {
    await enviarPagoConfirmado(pago.transportador.usuario.email, {
      monto: pago.monto,
      carga: pago.carga.titulo,
    });
  }

  res.status(200).json({ ok: true });
});
