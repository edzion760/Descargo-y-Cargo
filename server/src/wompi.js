import crypto from 'node:crypto';

// Integración Wompi (Web Checkout, redirect) — sandbox y producción usan el
// mismo código, solo cambian las llaves en .env. Docs: https://docs.wompi.co

const CHECKOUT_URL = 'https://checkout.wompi.co/p/';

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Firma de integridad que exige Wompi para que nadie manipule el monto en el navegador.
export function firmarTransaccion(referencia, montoEnCentavos) {
  return sha256(`${referencia}${montoEnCentavos}COP${process.env.WOMPI_INTEGRITY_SECRET}`);
}

export function urlCheckout({ referencia, montoEnCentavos, redirectUrl }) {
  const params = new URLSearchParams({
    'public-key': process.env.WOMPI_PUBLIC_KEY,
    currency: 'COP',
    'amount-in-cents': String(montoEnCentavos),
    reference: referencia,
    'signature:integrity': firmarTransaccion(referencia, montoEnCentavos),
    'redirect-url': redirectUrl,
  });
  return `${CHECKOUT_URL}?${params.toString()}`;
}

// Valida el checksum que Wompi manda en cada webhook (evento "transaction.updated").
export function checksumValido(body) {
  const secreto = process.env.WOMPI_EVENTS_SECRET;
  const { signature, timestamp, data } = body ?? {};
  if (!secreto || typeof signature?.checksum !== 'string') return false;
  const { properties } = signature;
  if (!Array.isArray(properties) || !properties.every((p) => typeof p === 'string')) return false;

  // ruta tipo "transaction.id" -> data.transaction.id
  const valores = properties.map((ruta) => ruta.split('.').reduce((obj, key) => obj?.[key], data));

  const esperado = Buffer.from(sha256(`${valores.join('')}${timestamp}${secreto}`));
  const recibido = Buffer.from(signature.checksum);
  return esperado.length === recibido.length && crypto.timingSafeEqual(esperado, recibido);
}

// Antes de dar un pago por bueno: Wompi cobró exactamente lo que pedimos, en pesos.
export function montoCoincide(transaccion, montoPesos) {
  return transaccion?.amount_in_cents === montoPesos * 100 && transaccion?.currency === 'COP';
}
