import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plantillaBienvenida, plantillaPagoConfirmado } from './email.js';

test('plantilla de bienvenida menciona el nombre y el rol correcto', () => {
  const html = plantillaBienvenida({ nombre: 'Ana', tipo: 'PUBLICADOR' });
  assert.match(html, /Ana/);
  assert.match(html, /publicador de carga/);
});

test('plantilla de bienvenida distingue transportador', () => {
  const html = plantillaBienvenida({ nombre: 'Luis', tipo: 'TRANSPORTADOR' });
  assert.match(html, /transportador/);
  assert.doesNotMatch(html, /publicador de carga/);
});

test('plantilla de pago confirmado formatea el monto en COP', () => {
  const html = plantillaPagoConfirmado({ monto: 224000, carga: 'Café pergamino en sacos' });
  assert.match(html, /224\.000/);
  assert.match(html, /Café pergamino en sacos/);
});
