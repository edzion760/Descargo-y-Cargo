import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csv } from './csv.js';

test('un texto con fórmula sale como texto y entrecomillado', () => {
  const out = csv(['nombre'], [['=HYPERLINK("x")']]);
  assert.match(out, /"'=HYPERLINK\(""x""\)"/);
});

test('los demás prefijos peligrosos también se neutralizan; los números no', () => {
  const out = csv(['a', 'b', 'c', 'd'], [['+57 300', '@x', '-1+1', -5]]);
  const fila = out.split('\r\n')[1];
  assert.equal(fila, "'+57 300;'@x;'-1+1;-5");
});
