import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

process.env.WOMPI_INTEGRITY_SECRET = 'test_integrity_secret';
process.env.WOMPI_EVENTS_SECRET = 'test_events_secret';
process.env.WOMPI_PUBLIC_KEY = 'pub_test_123';

const { firmarTransaccion, checksumValido, urlCheckout, montoCoincide } = await import('./wompi.js');

test('firma de integridad sigue la fórmula de Wompi: referencia+monto+moneda+secreto', () => {
  const esperado = crypto
    .createHash('sha256')
    .update('REF-1224000COPtest_integrity_secret')
    .digest('hex');
  assert.equal(firmarTransaccion('REF-1', 224000), esperado);
});

test('urlCheckout incluye la llave pública y la firma calculada', () => {
  const url = urlCheckout({ referencia: 'REF-1', montoEnCentavos: 224000, redirectUrl: 'https://x.co' });
  assert.match(url, /public-key=pub_test_123/);
  assert.match(url, /reference=REF-1/);
  assert.match(url, /signature%3Aintegrity=/);
});

test('checksumValido acepta un checksum calculado correctamente', () => {
  const timestamp = 1700000000;
  const body = {
    timestamp,
    data: { transaction: { id: 'tx-1', status: 'APPROVED' } },
    signature: { properties: ['transaction.id', 'transaction.status'], checksum: '' },
  };
  body.signature.checksum = crypto
    .createHash('sha256')
    .update(`tx-1APPROVED${timestamp}test_events_secret`)
    .digest('hex');

  assert.equal(checksumValido(body), true);
});

test('checksumValido rechaza un checksum manipulado', () => {
  const body = {
    timestamp: 1700000000,
    data: { transaction: { id: 'tx-1', status: 'APPROVED' } },
    signature: { properties: ['transaction.id', 'transaction.status'], checksum: 'no-coincide' },
  };
  assert.equal(checksumValido(body), false);
});

test('checksumValido no revienta con properties raras ni sin secreto', () => {
  const base = { timestamp: 1, data: { transaction: { id: 'tx-1' } } };
  assert.equal(checksumValido({ ...base, signature: { properties: 'transaction.id', checksum: 'x' } }), false);
  assert.equal(checksumValido({ ...base, signature: { properties: [1, 2], checksum: 'x' } }), false);
  assert.equal(checksumValido(undefined), false);
  const secreto = process.env.WOMPI_EVENTS_SECRET;
  delete process.env.WOMPI_EVENTS_SECRET;
  const checksum = crypto.createHash('sha256').update('tx-11undefined').digest('hex');
  assert.equal(checksumValido({ ...base, signature: { properties: ['transaction.id'], checksum } }), false);
  process.env.WOMPI_EVENTS_SECRET = secreto;
});

test('un pago solo se verifica si el monto y la moneda coinciden', () => {
  assert.equal(montoCoincide({ amount_in_cents: 1500000, currency: 'COP' }, 15000), true);
  assert.equal(montoCoincide({ amount_in_cents: 150000, currency: 'COP' }, 15000), false);
  assert.equal(montoCoincide({ amount_in_cents: 1500000, currency: 'USD' }, 15000), false);
  assert.equal(montoCoincide(undefined, 15000), false);
});
