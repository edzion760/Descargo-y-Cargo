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
  const { signature, timestamp, data } = body;
  if (!signature?.checksum || !signature?.properties) return false;

  const valores = signature.properties.map((ruta) => {
    // ruta tipo "transaction.id" -> data.transaction.id
    return ruta.split('.').reduce((obj, key) => obj?.[key], data);
  });

  const esperado = sha256(`${valores.join('')}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`);
  return esperado === signature.checksum;
}
