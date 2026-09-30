import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { optionalAuth, sesionVigente } from './auth.js';

process.env.JWT_SECRET ??= 'test-secret';

async function llamar(token) {
  const req = { cookies: token ? { dyc_token: token } : {} };
  let siguiente = false;
  await optionalAuth(req, {}, () => (siguiente = true));
  return { req, siguiente };
}

test('sin token: sigue como anónimo, no bloquea', async () => {
  const { req, siguiente } = await llamar(null);
  assert.equal(siguiente, true);
  assert.equal(req.user, undefined);
});

test('token inválido/de otro secreto: sigue como anónimo, no 401', async () => {
  const tokenViejo = jwt.sign({ sub: 1 }, 'otro-secreto-distinto');
  const { req, siguiente } = await llamar(tokenViejo);
  assert.equal(siguiente, true);
  assert.equal(req.user, undefined);
});

test('sesión vigente: cuenta activa y misma versión; tokens viejos sin versión cuentan como 0', () => {
  const activo = { eliminadoEn: null, sesionVersion: 0 };
  assert.equal(sesionVigente({ sub: 7 }, activo), true); // token emitido antes de la versión
  assert.equal(sesionVigente({ sub: 7, sv: 0 }, activo), true);
  // Tras restablecer la contraseña la versión sube: la sesión vieja deja de valer.
  assert.equal(sesionVigente({ sub: 7, sv: 0 }, { eliminadoEn: null, sesionVersion: 1 }), false);
  assert.equal(sesionVigente({ sub: 7, sv: 0 }, { eliminadoEn: new Date(), sesionVersion: 0 }), false);
  assert.equal(sesionVigente({ sub: 7, sv: 0 }, null), false);
});
