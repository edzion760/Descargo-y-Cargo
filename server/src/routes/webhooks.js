import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../db.js';
import { checksumValido, montoCoincide } from '../wompi.js';
import { enviarAvisoPublicador, enviarPagoConfirmado } from '../email.js';
import { avisarPublicador, usarCreditoAcarreo } from './cargas.js';

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

// Paquete de acarreos pagado: suma los créditos una sola vez (Wompi puede
// reintentar el webhook) y, si se compró desde una carga, la desbloquea
// con el primer crédito en la misma transacción.
async function acreditarPaquete(compra, estado) {
  if (compra.estado === 'VERIFICADO') return;
  const pago = await prisma.$transaction(async (tx) => {
    const { count } = await tx.compraPaquete.updateMany({
      where: { id: compra.id, estado: { not: 'VERIFICADO' } },
      data: { estado },
    });
    if (!count || estado !== 'VERIFICADO') return null;
    await tx.transportador.update({
      where: { id: compra.transportadorId },
      data: { creditosAcarreo: { increment: compra.creditos } },
    });
    if (!compra.cargaId) return null;
    const carga = await tx.carga.findUnique({ where: { id: compra.cargaId } });
    if (!carga) return null;
    const previo = await tx.pagoDesbloqueo.findUnique({
      where: { cargaId_transportadorId: { cargaId: compra.cargaId, transportadorId: compra.transportadorId } },
    });
    if (previo?.estado === 'VERIFICADO') return null;
    return usarCreditoAcarreo(tx, compra.transportadorId, compra.cargaId);
  });
  if (estado !== 'VERIFICADO') return;
  await enviarPagoConfirmado(compra.transportador.usuario.email, {
    monto: compra.monto,
    carga: `Paquete de ${compra.creditos} desbloqueos de acarreo`,
  });
  if (pago) await avisarPublicador(pago.id);
}

// Wompi llama esto cuando una transacción cambia de estado. Sin auth (lo llama
// Wompi, no un usuario) — la firma (checksum) es lo que prueba que es legítimo.
webhooksRouter.post('/wompi', async (req, res) => {
  if (!checksumValido(req.body)) return res.status(401).json({ error: 'Firma inválida' });

  const transaccion = req.body.data?.transaction;
  const estado = ESTADO_WOMPI[transaccion?.status];
  if (!estado || !transaccion?.reference) return res.status(200).json({ ok: true });

  const compra = await prisma.compraPaquete.findUnique({
    where: { referencia: transaccion.reference },
    include: { transportador: { include: { usuario: true } } },
  });
  if (compra) {
    if (estado === 'VERIFICADO' && !montoCoincide(transaccion, compra.monto)) {
      console.error('Wompi: monto o moneda no coinciden con el paquete', compra.referencia);
      return res.status(200).json({ ok: true });
    }
    await acreditarPaquete(compra, estado);
    return res.status(200).json({ ok: true });
  }

  const pago = await prisma.pagoDesbloqueo.findUnique({
    where: { referencia: transaccion.reference },
    include: {
      carga: { include: { publicador: { include: { usuario: true } } } },
      transportador: { include: { usuario: true } },
    },
  });
  if (!pago) return res.status(200).json({ ok: true });

  if (estado === 'VERIFICADO' && !montoCoincide(transaccion, pago.monto)) {
    console.error('Wompi: monto o moneda no coinciden con el desbloqueo', pago.referencia);
    return res.status(200).json({ ok: true });
  }

  // Un pago ya verificado no vuelve atrás (un DECLINED tardío no lo degrada),
  // y Wompi puede reintentar el mismo webhook: los correos salen una sola vez.
  const { count } = await prisma.pagoDesbloqueo.updateMany({
    where: { id: pago.id, estado: { not: 'VERIFICADO' } },
    data: { estado },
  });

  if (count === 1 && estado === 'VERIFICADO') {
    await enviarPagoConfirmado(pago.transportador.usuario.email, {
      monto: pago.monto,
      carga: pago.carga.titulo,
    });
    // Cuenta del publicador dada de baja (anonimizada): no hay a quién avisar.
    if (!pago.carga.publicador.usuario.eliminadoEn) {
      await enviarAvisoPublicador(pago.carga.publicador.usuario.email, {
        carga: pago.carga.titulo,
        transportador: pago.transportador,
        pagoId: pago.id,
      });
    }
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
