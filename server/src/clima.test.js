import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearDeslizamientos, clasificarHora, distanciaATramoKm, distanciaARutaKm, muestrearRuta, guardarDeslizamientos } from './clima.js';
import { tokenValido } from './routes/clima.js';

test('sincronización IDEAM: rechaza archivos que no son el CSV esperado y exige el token', () => {
  assert.throws(() => guardarDeslizamientos('<html>Error</html>'), /formato de alertas/);
  assert.throws(() => guardarDeslizamientos(''), /formato de alertas/);
  assert.equal(tokenValido('abc', 'abc'), true);
  assert.equal(tokenValido('abd', 'abc'), false);
  assert.equal(tokenValido('abc', undefined), false); // sin token configurado nadie entra
  assert.equal(tokenValido(undefined, 'abc'), false);
});

test('IDEAM: toma solo la última fecha y normaliza el código DANE', () => {
  const csv =
    '﻿OBJECTID;REGION;DEPARTAMENTO;MUNICIPIO;COD_DANE;TEXTO_AMENAZA;ACUMULADO_TRES;ACUMULADO_DIEZ;DIAS_LLUVIA;FECHA_EJECUCION\n' +
    '1;ANDINA;SANTANDER;SAN GIL;68679;ALTA;90.1;120;5;28/09/2026\n' +
    '2;ANDINA;SANTANDER;SAN GIL;68679;MODERADA;40.2;80;4;29/09/2026\n' +
    '3;ANDINA;ANTIOQUIA;ANGOSTURA;5038;ALTA;87.6;87.6;14;29/09/2026\n';
  const { fecha, alertas } = parsearDeslizamientos(csv);
  assert.equal(fecha, '2026-09-29');
  assert.equal(alertas.size, 2);
  assert.deepEqual(alertas.get('68679'), { municipio: 'SAN GIL', departamento: 'SANTANDER', nivel: 'MODERADA', lluvia3DiasMm: 40.2 });
  assert.equal(alertas.get('05038').nivel, 'ALTA');
});

test('pronóstico: tormenta > lluvia fuerte > niebla; lluvia leve no alerta', () => {
  assert.equal(clasificarHora('rainandthunder', 1), 'TORMENTA');
  assert.equal(clasificarHora('heavyrainshowers_day', 2), 'LLUVIA_FUERTE');
  assert.equal(clasificarHora('rain', 5), 'LLUVIA_FUERTE');
  assert.equal(clasificarHora('fog', 0), 'NIEBLA');
  assert.equal(clasificarHora('lightrain', 0.4), null);
});

test('geometría: distancia a un tramo y a la ruta', () => {
  // Tramo recto norte-sur sobre el meridiano -73; un punto 0.1° al este queda a ~11 km.
  const a = { lat: 6, lon: -73 }, b = { lat: 5, lon: -73 };
  const d = distanciaATramoKm({ lat: 5.5, lon: -72.9 }, a, b);
  assert.ok(d > 10.5 && d < 11.5, `esperaba ~11 km, dio ${d}`);
  // Más allá del extremo, la distancia es al vértice, no a la recta infinita.
  assert.ok(distanciaATramoKm({ lat: 7, lon: -73 }, a, b) > 100);
  assert.ok(distanciaARutaKm({ lat: 5.5, lon: -73 }, [a, b]) < 0.01);
});

test('muestreo: incluye extremos y respeta el máximo', () => {
  const ruta = Array.from({ length: 50 }, (_, i) => ({ lat: 4 + i * 0.1, lon: -74 })); // ~545 km
  const p = muestrearRuta(ruta, 40, 12);
  assert.equal(p.length, 12);
  assert.deepEqual(p[0], ruta[0]);
  assert.deepEqual(p.at(-1), ruta.at(-1));
});
