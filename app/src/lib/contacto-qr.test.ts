// Correr con: node --test src/lib/contacto-qr.test.ts (Node 22.6+ quita los tipos solo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerContactoQR } from './contacto-qr.ts';

test('vCard de tarjeta digital, con línea plegada y +57', () => {
  const c = leerContactoQR(
    'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Pérez;Ana;;;\r\nFN:Ana Pérez\r\nORG:Lácteos del Valle S.A.S.;Logística\r\n' +
      'TITLE:Jefe de logís\r\n tica\r\nTEL;TYPE=CELL:+57 310 555 1234\r\nEMAIL:ana@lacteos.co\r\n' +
      'ADR;TYPE=WORK:;;Cra 50 # 10-20;Medellín;Antioquia;;Colombia\r\nURL:https://lacteos.co\r\nEND:VCARD'
  );
  assert.deepEqual(c, {
    empresa: 'Lácteos del Valle S.A.S.',
    contacto: 'Ana Pérez',
    cargo: 'Jefe de logística',
    telefono: '3105551234',
    email: 'ana@lacteos.co',
    web: 'https://lacteos.co',
    ciudad: 'Medellín',
    notas: '',
  });
});

test('MECARD', () => {
  const c = leerContactoQR('MECARD:N:Ruiz,Carlos;TEL:3187778899;EMAIL:carlos@agregados.co;ORG:Agregados San Gil;;');
  assert.equal(c.contacto, 'Carlos Ruiz');
  assert.equal(c.telefono, '3187778899');
  assert.equal(c.empresa, 'Agregados San Gil');
});

test('enlaces: WhatsApp, web y texto suelto', () => {
  assert.equal(leerContactoQR('https://wa.me/573001112233?text=hola').telefono, '3001112233');
  assert.equal(leerContactoQR('https://linktr.ee/cafesantander').web, 'https://linktr.ee/cafesantander');
  assert.equal(leerContactoQR('Stand 45 - Pabellón azul').notas, 'Stand 45 - Pabellón azul');
});
