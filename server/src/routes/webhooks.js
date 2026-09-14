import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../db.js';
import { checksumValido } from '../wompi.js';
import { enviarPagoConfirmado } from '../email.js';

export const webhooksRouter = Router();

// Resend firma sus webhooks con el esquema Svix (no requiere el paquete
// "svix" -- es solo HMAC-SHA256 sobre "id.timestamp.body" con la parte
// base64 del secreto whsec_...). Ver resend.com/docs/dashboard/webhooks.
function firmaResendValida(req) {
  const secreto = process.env.RESEND_WEBHOOK_SECRET;
  const id = req.headers['svix-id'];
  const timestamp = req.headers['svix-timestamp'];
  const firma = req.headers['svix-signature'];
  if (!secreto || !id || !timestamp || !firma || !req.rawBody) return false;

  const claveSecreta = Buffer.from(secreto.split('_')[1], 'base64');
  const contenidoFirmado = `${id}.${timestamp}.${req.rawBody}`;
  const esperada = crypto.createHmac('sha256', claveSecreta).update(contenidoFirmado).digest('base64');

  return firma.split(' ').some((parte) => {
    const valor = parte.split(',')[1];
    if (!valor) return false;
    const a = Buffer.from(valor);
    const b = Buffer.from(esperada);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

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

// Resend llama esto cuando el destinatario abre un correo (requiere open
// tracking activado en el dominio). Solo nos importa para los Prospecto de
// la campaña -- si el correo era de otro tipo (bienvenida, etc.) el email
// simplemente no coincide con ningún Prospecto y no pasa nada.
webhooksRouter.post('/resend', async (req, res) => {
  if (!firmaResendValida(req)) return res.status(401).json({ error: 'Firma inválida' });

  if (req.body?.type === 'email.opened') {
    const destinatario = req.body.data?.to?.[0];
    if (destinatario) {
      await prisma.prospecto.updateMany({
        where: { email: destinatario, abiertoEn: null },
        data: { abiertoEn: new Date() },
      });
    }
  }

  res.status(200).json({ ok: true });
});
