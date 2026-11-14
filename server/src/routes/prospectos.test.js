import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema } from './prospectos.js';

const base = { empresa: 'Lácteos del Valle', contacto: 'Ana Pérez', telefono: '310 555 1234', acepta: true };

test('normaliza el teléfono (espacios, +57) a 10 dígitos', () => {
  assert.equal(leadSchema.parse(base).telefono, '3105551234');
  assert.equal(leadSchema.parse({ ...base, telefono: '+57 310-555-1234' }).telefono, '3105551234');
});

test('sin autorización de datos no se guarda', () => {
  const r = leadSchema.safeParse({ ...base, acepta: false });
  assert.equal(r.success, false);
  assert.equal(r.error.issues[0].message, 'Debes autorizar el tratamiento de datos');
  const { acepta: _, ...sinAcepta } = base;
  assert.equal(leadSchema.safeParse(sinAcepta).success, false);
});

test('rechaza teléfono inválido y correo mal escrito', () => {
  assert.equal(leadSchema.safeParse({ ...base, telefono: '123' }).success, false);
  assert.equal(leadSchema.safeParse({ ...base, email: 'no-es-correo' }).success, false);
  assert.equal(leadSchema.safeParse({ ...base, email: '' }).success, true);
});

test('firma de enlaces: válida, alterada y de otro id', async () => {
  const { firmaProspecto, firmaValida, urlBaja } = await import('../enlacesProspecto.js');
  const f = firmaProspecto(42);
  assert.match(f, /^[0-9a-f]{16}$/);
  assert.equal(firmaValida(42, f), true);
  assert.equal(firmaValida(43, f), false);
  assert.equal(firmaValida(42, f.replace(/.$/, (c) => (c === '0' ? '1' : '0'))), false);
  assert.equal(firmaValida(42, undefined), false);
  assert.equal(firmaValida(42, ['x']), false);
  assert.match(urlBaja(42), new RegExp(`id=42&f=${f}$`));
});

test('la página de baja (GET) solo muestra un botón que hace POST', async () => {
  const { paginaConfirmarBaja } = await import('./prospectos.js');
  const html = paginaConfirmarBaja(42, 'abcdef0123456789');
  assert.match(html, /<form method="post" action="\/api\/prospectos\/baja\?id=42&f=abcdef0123456789">/);
  assert.match(html, /Confirmar baja/);
});

test('el formulario público no reactiva ni sobrescribe a nadie', async () => {
  const { accionLead, telefonoCoincide } = await import('./prospectos.js');
  assert.equal(accionLead(null), 'crear');
  assert.equal(accionLead({ noContactar: false }), 'consentimiento');
  assert.equal(accionLead({ noContactar: true }), 'ignorar');
  assert.equal(telefonoCoincide('3001234567,3109876543', '3109876543'), true);
  assert.equal(telefonoCoincide('3001234567', '300123'), false);
});
