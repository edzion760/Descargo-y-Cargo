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
