import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extraerBasico } from './dictado.js';

test('sin IA saca celular y correo dictados y deja todo en notas', () => {
  const texto = 'Café La Mesa, Juan Pérez, celular 310 555 1234, correo juan arroba cafelamesa punto com, despachan a Buenaventura';
  const r = extraerBasico(texto);
  assert.equal(r.telefono, '3105551234');
  assert.equal(r.email, 'juan@cafelamesa.com');
  assert.equal(r.notas, texto);
  assert.equal(r.empresa, '');
});

test('acepta +57 y no confunde otros números', () => {
  assert.equal(extraerBasico('llamar al +57 315 222 3344 el lunes').telefono, '3152223344');
  assert.equal(extraerBasico('mandan 20 toneladas al mes').telefono, '');
});
