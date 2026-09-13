import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanciaHaversineKm } from './push.js';

test('distancia cero entre el mismo punto', () => {
  assert.equal(distanciaHaversineKm({ lat: 4.711, lon: -74.0721 }, { lat: 4.711, lon: -74.0721 }), 0);
});

test('distancia Bogotá-Medellín es realista (~240km en línea recta)', () => {
  const d = distanciaHaversineKm({ lat: 4.711, lon: -74.0721 }, { lat: 6.2442, lon: -75.5812 });
  assert.ok(d > 200 && d < 260, `esperaba ~240km, dio ${d}`);
});
