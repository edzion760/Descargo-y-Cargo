import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { optionalAuth } from './auth.js';

process.env.JWT_SECRET ??= 'test-secret';

function llamar(token) {
  const req = { cookies: token ? { dyc_token: token } : {} };
  let siguiente = false;
  optionalAuth(req, {}, () => (siguiente = true));
  return { req, siguiente };
}

test('sin token: sigue como anónimo, no bloquea', () => {
  const { req, siguiente } = llamar(null);
  assert.equal(siguiente, true);
  assert.equal(req.user, undefined);
});

test('token inválido/de otro secreto: sigue como anónimo, no 401', () => {
  const tokenViejo = jwt.sign({ sub: 1 }, 'otro-secreto-distinto');
  const { req, siguiente } = llamar(tokenViejo);
  assert.equal(siguiente, true);
  assert.equal(req.user, undefined);
});

test('token válido: sí identifica al usuario', () => {
  const token = jwt.sign({ sub: 7, tipo: 'TRANSPORTADOR' }, process.env.JWT_SECRET);
  const { req, siguiente } = llamar(token);
  assert.equal(siguiente, true);
  assert.equal(req.user.sub, 7);
});
