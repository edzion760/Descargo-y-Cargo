import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despachosRealesRndc } from './rndc.js';

test('sin origen o destino devuelve vacío, no rompe', async () => {
  assert.deepEqual(await despachosRealesRndc('', 'Bogotá'), []);
  assert.deepEqual(await despachosRealesRndc('Bogotá', ''), []);
});
