import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datosAnonimizados, placaSchema } from './auth.js';

test('anonimización única por usuario', () => {
  const a = datosAnonimizados(1);
  const b = datosAnonimizados(2);
  assert.notEqual(a.email, b.email);
  assert.match(a.email, /^ELIMINADO-1@descargoycargo\.invalid$/);
});

test('no revela datos reales del usuario', () => {
  const { email, passwordHash, marca } = datosAnonimizados(42);
  assert.equal(passwordHash, marca);
  assert.ok(email.endsWith('.invalid'));
});

test('placa: normaliza y valida formato colombiano', () => {
  assert.equal(placaSchema.parse('sxt-482'), 'SXT482');
  assert.equal(placaSchema.parse('abc 12d'), 'ABC12D');
  assert.equal(placaSchema.safeParse('AB1234').success, false);
  assert.equal(placaSchema.safeParse('').success, false);
});
