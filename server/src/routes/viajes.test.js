import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gastoSchema, gastosCsv } from './viajes.js';

test('gasto: valida tipo y valor, y guarda la fecha en UTC', () => {
  const g = gastoSchema.parse({ tipo: 'ACPM', valor: 450000, fecha: '2026-10-02' });
  assert.equal(g.fecha.toISOString(), '2026-10-02T00:00:00.000Z');
  assert.equal(gastoSchema.safeParse({ tipo: 'CERVEZA', valor: 1000, fecha: '2026-10-02' }).success, false);
  assert.equal(gastoSchema.safeParse({ tipo: 'PEAJES', valor: 0, fecha: '2026-10-02' }).success, false);
  assert.equal(gastoSchema.safeParse({ tipo: 'PEAJES', valor: 12.5, fecha: '2026-10-02' }).success, false);
});

test('CSV de gastos: una fila por gasto con la ruta del viaje', () => {
  const out = gastosCsv([
    {
      origen: 'San Gil',
      destino: 'Bogotá',
      gastos: [
        { fecha: new Date('2026-10-02T00:00:00Z'), tipo: 'PEAJES', valor: 38000, nota: null, recibo: 'x.jpg' },
        { fecha: new Date('2026-10-02T00:00:00Z'), tipo: 'CARGUE', valor: 50000, nota: 'dos coteros', recibo: null },
      ],
    },
  ]);
  const filas = out.slice(1).split('\r\n');
  assert.equal(filas.length, 3);
  assert.equal(filas[1], '2026-10-02;San Gil → Bogotá;Peajes;38000;;Sí');
  assert.equal(filas[2], '2026-10-02;San Gil → Bogotá;Cargue / descargue;50000;dos coteros;No');
});
