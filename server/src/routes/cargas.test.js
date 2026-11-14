import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarifaDesbloqueo, nombreCiudad, cargaSchema, pisoLegal } from './cargas.js';

const cargaBase = {
  titulo: 'Arroz',
  tipoCarga: 'Carga Normal',
  origen: 'Cali',
  destino: 'San Gil',
  toneladas: 10,
  precio: 1000,
  fechaCarga: '2026-12-01',
  tipoPublicacion: 'NACIONAL',
  vehiculoRequerido: 'Tractomula',
};

test('el piso SICE-TAC enviado por el navegador se descarta', () => {
  const d = cargaSchema.parse({ ...cargaBase, pisoSiceTac: 1 });
  assert.equal('pisoSiceTac' in d, false);
});

test('piso legal: tarifa x toneladas x recargo, redondeado como el formulario', () => {
  assert.equal(pisoLegal(145000, 10, 'Carga Normal'), 1450000);
  assert.equal(pisoLegal(145000, 10, 'Refrigerada'), 1595000);
  assert.equal(pisoLegal(106000, 2.5, 'Carga Peligrosa'), 318000);
  // un precio de 1.000 queda muy por debajo: el POST responde 422
  assert.ok(cargaBase.precio < pisoLegal(145000, cargaBase.toneladas, cargaBase.tipoCarga));
});

test('tipo de carga desconocido no pasa (sin recargo no hay piso)', () => {
  assert.equal(cargaSchema.safeParse({ ...cargaBase, tipoCarga: 'Inventado' }).success, false);
});

test('nombre de ciudad con mayúsculas uniformes', () => {
  assert.equal(nombreCiudad('San gil'), 'San Gil');
  assert.equal(nombreCiudad('  BUCARAMANGA '), 'Bucaramanga');
  assert.equal(nombreCiudad('cartagena  de indias'), 'Cartagena de Indias');
  assert.equal(nombreCiudad('el carmen de bolívar'), 'El Carmen de Bolívar');
});

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
  assert.equal(tarifaDesbloqueo(15000, 'ILIMITADA', 'URBANA'), 0);
});

test('acarreos URBANA y BARBACHA: fijo 1.000', () => {
  assert.equal(tarifaDesbloqueo(15000, null, 'URBANA'), 1000);
  assert.equal(tarifaDesbloqueo(420000, null, 'BARBACHA'), 1000);
  assert.equal(tarifaDesbloqueo(5600000, null, 'URBANA'), 1000);
  assert.equal(tarifaDesbloqueo(100000, null, 'NACIONAL'), 15000);
});
