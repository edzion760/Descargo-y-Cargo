import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarifaDesbloqueo } from './cargas.js';

test('4% del flete', () => {
  assert.equal(tarifaDesbloqueo(5600000, null), 224000);
});

test('mínimo 15.000 en fletes bajos', () => {
  assert.equal(tarifaDesbloqueo(100000, null), 15000);
});

test('gratis con membresía ILIMITADA', () => {
  assert.equal(tarifaDesbloqueo(5600000, 'ILIMITADA'), 0);
});
