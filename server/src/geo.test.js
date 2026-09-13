import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarifaPorTonInterpolada } from './geo.js';

test('coincide exacto en un punto de referencia conocido (138km Bogotá-Tunja)', () => {
  assert.equal(tarifaPorTonInterpolada(138), 106000);
});

test('interpola entre dos puntos conocidos', () => {
  // 138km->106000, 290km->145000: a mitad de camino (214km) el valor debe quedar entre ambos
  const valor = tarifaPorTonInterpolada(214);
  assert.ok(valor > 106000 && valor < 145000);
});

test('recorta al mínimo conocido para distancias muy cortas', () => {
  assert.equal(tarifaPorTonInterpolada(10), 106000);
});

test('recorta al máximo conocido para distancias muy largas', () => {
  assert.equal(tarifaPorTonInterpolada(5000), 402000);
});
