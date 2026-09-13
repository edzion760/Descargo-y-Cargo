import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clasificarTipo, tiempoRelativo, parsearItemsRss, esRelevante } from './noticias.js';

test('rechaza noticias sin mención de vía/carretera aunque digan "accidente"', () => {
  assert.equal(esRelevante('David Alonso sufrió un duro accidente en la Moto 2 en San Marino'), false);
});

test('rechaza nota roja aunque mencione una vía', () => {
  assert.equal(esRelevante('Hombre transportaba un cadáver en la vía al Llano'), false);
});

test('acepta un cierre vial real', () => {
  assert.equal(esRelevante('Cierre total en la vía Bogotá-Villavicencio por derrumbe'), true);
});

test('clasifica accidente por palabra clave', () => {
  assert.equal(clasificarTipo('Accidente de tractocamión deja un herido'), 'ACCIDENTE');
});

test('clasifica cierre de vía', () => {
  assert.equal(clasificarTipo('Cierre total por derrumbe en la vía al Llano'), 'CIERRE_VIA');
});

test('titular sin palabras clave conocidas cae en INFO, no inventa categoría', () => {
  assert.equal(clasificarTipo('INVÍAS anuncia mantenimiento programado'), 'INFO');
});

test('tiempo relativo en minutos', () => {
  const ahora = new Date('2026-01-01T12:00:00Z');
  const hace10 = new Date('2026-01-01T11:50:00Z').toISOString();
  assert.equal(tiempoRelativo(hace10, ahora), 'hace 10 min');
});

test('tiempo relativo en horas', () => {
  const ahora = new Date('2026-01-01T12:00:00Z');
  const hace3h = new Date('2026-01-01T09:00:00Z').toISOString();
  assert.equal(tiempoRelativo(hace3h, ahora), 'hace 3 h');
});

test('parsea items de un RSS con CDATA', () => {
  const xml = `<rss><channel>
    <item>
      <title><![CDATA[Cierre vial en la vía al Llano - El Tiempo]]></title>
      <link>https://news.google.com/articles/xyz</link>
      <pubDate>Mon, 01 Jan 2026 10:00:00 GMT</pubDate>
      <source url="https://eltiempo.com">El Tiempo</source>
    </item>
  </channel></rss>`;
  const items = parsearItemsRss(xml);
  assert.equal(items.length, 1);
  assert.equal(items[0].titulo, 'Cierre vial en la vía al Llano - El Tiempo');
  assert.equal(items[0].fuente, 'El Tiempo');
  assert.equal(items[0].link, 'https://news.google.com/articles/xyz');
});
