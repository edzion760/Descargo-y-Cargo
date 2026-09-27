import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aCsv } from './admin.js';

test('CSV para Excel: BOM, separador ; y celdas con ; o comillas escapadas', () => {
  const csv = aCsv([
    {
      consentimientoEn: new Date('2026-10-15T14:30:00Z'),
      nombre: 'Lácteos "El Valle"',
      telefonos: '3105551234',
      email: null,
      ciudad: 'Medellín',
      notas: 'Contacto: Ana · Despacha: leche; queso',
      fuente: 'Effix 2026',
    },
  ]);
  assert.ok(csv.startsWith('﻿'));
  const [, fila] = csv.slice(1).split('\r\n');
  assert.equal(fila, '2026-10-15 14:30;"Lácteos ""El Valle""";3105551234;;Medellín;"Contacto: Ana · Despacha: leche; queso";Effix 2026');
});
