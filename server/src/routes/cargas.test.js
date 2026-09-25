import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarifaDesbloqueo } from './cargas.js';

test('6% del flete', () => {
  assert.equal(tarifaDesbloqueo(1232712, null), 73963);
});

test('tope de 100.000 en fletes altos', () => {
  assert.equal(tarifaDesbloqueo(5600000, null), 100000);
  assert.equal(tarifaDesbloqueo(1666667, null), 100000);
  assert.equal(tarifaDesbloqueo(1600000, null), 96000);
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
