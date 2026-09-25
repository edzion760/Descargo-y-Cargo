import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarifaDesbloqueo } from './cargas.js';

test('6% del flete', () => {
  assert.equal(tarifaDesbloqueo(5600000, null), 336000);
});

test('mínimo 15.000 en fletes bajos', () => {
  assert.equal(tarifaDesbloqueo(100000, null), 15000);
  // 250.000 × 6% = 15.000 justo: el mínimo aplica hasta ahí
  assert.equal(tarifaDesbloqueo(250000, null), 15000);
  assert.equal(tarifaDesbloqueo(300000, null), 18000);
});

test('gratis con membresía ILIMITADA', () => {
  assert.equal(tarifaDesbloqueo(5600000, 'ILIMITADA'), 0);
});
