import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avisoNuevo, titulo } from './alertasClima.js';

test('nombres de municipio legibles', () => {
  assert.equal(titulo('SAN JOSÉ DE PARE'), 'San José de Pare');
  assert.equal(titulo('BOGOTÁ, D.C.'), 'Bogotá, D.C.');
  assert.equal(titulo('EL CARMEN DE VIBORAL'), 'El Carmen de Viboral');
});

const resultado = {
  deslizamientos: {
    fecha: '2026-09-29',
    alertas: [
      { codigo: '68770', municipio: 'SUAITA', nivel: 'ALTA', lluvia3DiasMm: 51 },
      { codigo: '15686', municipio: 'SANTANA', nivel: 'MODERADA', lluvia3DiasMm: 78 },
    ],
  },
  clima: [
    { hora: '2026-09-30T20:00:00Z', tipo: 'TORMENTA', lugar: 'BARBOSA' },
    { hora: '2026-09-30T05:00:00Z', tipo: 'NIEBLA', lugar: 'SAN GIL' },
  ],
};

test('avisa solo lo importante (ALTA, tormenta/lluvia fuerte) y no lo repite', () => {
  const avisados = new Set();
  const cuerpo = avisoNuevo(1, 7, resultado, avisados);
  assert.match(cuerpo, /^Riesgo ALTO de derrumbes en Suaita \(IDEAM\)\. Tormenta cerca de Barbosa hacia las 3:00/);
  assert.doesNotMatch(cuerpo, /Santana|San Gil/);
  assert.equal(avisoNuevo(1, 7, resultado, avisados), null); // segunda revisión: nada nuevo
  assert.notEqual(avisoNuevo(2, 7, resultado, avisados), null); // otro viaje sí se avisa
});
