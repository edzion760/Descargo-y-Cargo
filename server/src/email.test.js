import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plantillaBienvenida, plantillaPagoConfirmado, plantillaAvisoPublicador } from './email.js';

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
  assert.match(html, /\?mis_contactos/);
  assert.match(html, /Ir a Mis contactos/);
});

test('los tips de pago con Nequi van solo en la bienvenida del transportador', () => {
  assert.match(plantillaBienvenida({ nombre: 'Ana', tipo: 'TRANSPORTADOR' }), /Nequi/);
  assert.doesNotMatch(plantillaBienvenida({ nombre: 'Ana', tipo: 'PUBLICADOR' }), /Nequi/);
});

test('aviso al publicador muestra nombre, ciudad y teléfono del transportador, no el documento', () => {
  const html = plantillaAvisoPublicador({
    carga: 'Arena de peña',
    transportador: { nombre: 'Alberto Pérez', ciudad: 'San Gil', telefono: '3165533911', documento: '123456', placa: 'SXT482' },
  });
  assert.match(html, /Alberto Pérez desbloqueó tu carga/);
  assert.match(html, /San Gil/);
  assert.match(html, /tel:3165533911/);
  assert.match(html, /SXT482/);
  assert.match(html, /rndc\.mintransporte\.gov\.co/);
  assert.doesNotMatch(html, /123456/);
});
