import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { enviarBienvenida, enviarRecuperarPassword } from '../email.js';
import { borrarRecibos } from './viajes.js';
import { telefonoSchema } from './prospectos.js';

export const authRouter = Router();

// Al subir la versión, los usuarios con otra versión aceptada deben aceptar
// de nuevo al entrar (GET /me -> terminosPendientes, POST /terminos).
export const TERMINOS_VERSION = '1.1';

// Placas colombianas: ABC123 (carros/camiones) o ABC12D (motos). Se aceptan
// espacios, guiones y minúsculas y se guardan normalizadas.
export const placaSchema = z
  .string()
  .transform((p) => p.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .pipe(z.string().regex(/^[A-Z]{3}\d{2}[A-Z0-9]$/, 'Placa inválida (ej. ABC123)'));

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  tipo: z.enum(['PUBLICADOR', 'TRANSPORTADOR']),
  nombre: z.string().min(2),
  ciudad: z.string().min(2),
  telefono: telefonoSchema,
  documento: z.string().min(6, 'Documento de identidad inválido'),
  aceptaTerminos: z.literal(true, { message: 'Debes aceptar los Términos y la Política de Datos' }),
  placa: placaSchema.optional(),
}).refine((d) => d.tipo !== 'TRANSPORTADOR' || d.placa, { message: 'La placa del vehículo es obligatoria', path: ['placa'] });

// Extraído para poder probarlo sin levantar la base de datos: el valor debe
// ser único (choca con el @unique de documento/email si dos bajas coinciden).
export function datosAnonimizados(usuarioId) {
  const marca = `ELIMINADO-${usuarioId}`;
  return { marca, email: `${marca}@descargoycargo.invalid`, passwordHash: marca };
}

function signToken(usuario) {
  return jwt.sign({ sub: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// httpOnly: inaccesible para JS del navegador -- si algún día aparece un XSS,
// no puede robar la sesión leyendo localStorage (así vivía el token antes).
// secure: req.secure ya considera el X-Forwarded-Proto del Cloudflare Tunnel
// (ver 'trust proxy' en index.js), así que sigue funcionando en local (http).
function ponerCookieSesion(req, res, usuario) {
  res.cookie('dyc_token', signToken(usuario), {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, tipo, nombre, ciudad, telefono, documento, placa } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  // Cloudflare Tunnel hace de proxy: la IP real del cliente llega en este
  // header, no en req.socket (ver server/.cloudflared/config.yml).
  const ip = req.headers['cf-connecting-ip'] || req.ip;

  let usuario;
  try {
    usuario = await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        tipo,
        celular: telefono,
        terminosVersion: TERMINOS_VERSION,
        terminosAceptadosEn: new Date(),
        terminosIp: ip,
        ...(tipo === 'PUBLICADOR'
          ? { publicador: { create: { nombre, ciudad, telefono, documento } } }
          : {
              transportador: {
                create: { nombre, ciudad, telefono, documento, placa, membresia: { create: { tipo: 'GRATIS' } } },
              },
            }),
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const target = String(err.meta?.target ?? '');
      const campo = target.includes('documento') ? 'documento' : target.includes('celular') ? 'celular' : 'correo';
      return res.status(409).json({ error: `Ya existe una cuenta con ese ${campo}` });
    }
    throw err;
  }

  // No se espera (await) para no retrasar la respuesta -- enviarCorreo ya
  // atrapa sus propios errores, un correo caído nunca debe romper el registro.
  enviarBienvenida(email, { nombre, tipo });

  ponerCookieSesion(req, res, usuario);
  res.status(201).json({ id: usuario.id, tipo: usuario.tipo });
});

// Se puede entrar con el correo o con el celular: si trae "@" es correo; si
// no, se normaliza como teléfono (quita espacios, guiones y +57).
export function identificadorLogin(texto) {
  const t = String(texto ?? '').trim();
  if (t.includes('@')) return { email: t };
  const celular = t.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');
  return celular.length >= 7 ? { celular } : null;
}

async function buscarPorIdentificador(texto) {
  const where = identificadorLogin(texto);
  return where ? prisma.usuario.findUnique({ where }) : null;
}

authRouter.post('/login', async (req, res) => {
  // El campo sigue llamándose "email" por compatibilidad; acepta también celular.
  const { email: identificador, password } = req.body ?? {};
  if (!identificador || !password) return res.status(400).json({ error: 'Correo o celular y contraseña son obligatorios' });

  const usuario = await buscarPorIdentificador(identificador);
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: 'Datos de ingreso o contraseña incorrectos' });
  }
  if (usuario.eliminadoEn) {
    return res.status(401).json({ error: 'Esta cuenta fue eliminada' });
  }

  ponerCookieSesion(req, res, usuario);
  res.json({ id: usuario.id, tipo: usuario.tipo });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('dyc_token', { path: '/' });
  res.json({ ok: true });
});

// El frontend ya no puede leer el JWT (vive en cookie httpOnly) -- esta es
// la forma de saber, al cargar la página, si hay sesión y quién es.
authRouter.get('/me', requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
    select: { terminosVersion: true, eliminadoEn: true, esAdmin: true, transportador: { select: { placa: true } } },
  });
  if (!usuario || usuario.eliminadoEn) return res.status(401).json({ error: 'Sesión inválida' });
  res.json({
    id: req.user.sub,
    tipo: req.user.tipo,
    terminosPendientes: usuario.terminosVersion !== TERMINOS_VERSION,
    placa: usuario.transportador?.placa ?? null,
    esAdmin: usuario.esAdmin,
  });
});

// Re-aceptación de Términos/Política cuando cambia la versión: mismo
// registro que en el alta (versión, fecha, IP).
authRouter.post('/terminos', requireAuth, async (req, res) => {
  if (req.body?.acepta !== true) return res.status(400).json({ error: 'Debes aceptar para continuar' });
  await prisma.usuario.update({
    where: { id: req.user.sub },
    data: {
      terminosVersion: TERMINOS_VERSION,
      terminosAceptadosEn: new Date(),
      terminosIp: req.headers['cf-connecting-ip'] || req.ip,
    },
  });
  res.json({ ok: true });
});

const RESET_VIGENCIA_MS = 60 * 60 * 1000; // 1 hora

// Siempre responde igual exista o no la cuenta -- si no, se filtra qué
// correos están registrados (enumeración de usuarios).
authRouter.post('/olvide-password', async (req, res) => {
  const { email } = req.body ?? {};
  const respuestaGenerica = {
    ok: true,
    mensaje: 'Si la cuenta existe, te enviamos al correo registrado un enlace para recuperar tu contraseña.',
  };
  if (!email) return res.json(respuestaGenerica);

  // Acepta correo o celular; el enlace siempre va al correo de la cuenta.
  const usuario = await buscarPorIdentificador(email);
  if (usuario && !usuario.eliminadoEn) {
    const resetToken = randomBytes(32).toString('hex');
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken, resetTokenExpira: new Date(Date.now() + RESET_VIGENCIA_MS) },
    });
    const url = `${process.env.APP_URL}/restablecer?token=${resetToken}`;
    enviarRecuperarPassword(usuario.email, { url });
  }

  res.json(respuestaGenerica);
});

authRouter.post('/restablecer-password', async (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token o contraseña inválidos (mínimo 8 caracteres)' });
  }

  const usuario = await prisma.usuario.findUnique({ where: { resetToken: token } });
  if (!usuario || !usuario.resetTokenExpira || usuario.resetTokenExpira < new Date()) {
    return res.status(400).json({ error: 'El enlace es inválido o ya venció. Solicita uno nuevo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash, resetToken: null, resetTokenExpira: null },
  });

  res.json({ ok: true });
});

// Derecho de supresión (Ley 1581 de 2012, art. 8): el usuario puede darse de
// baja en cualquier momento. No se borra la fila -- hay Cargas y
// PagoDesbloqueo ligados que deben conservarse por obligación contable/fiscal
// (Política de Datos §11.2) -- se anonimiza y se bloquea el login.
// ponytail: el JWT ya emitido (hasta 7 días) sigue siendo válido en otras
// rutas tras esta baja -- no hay lista de revocación. Si esto importa antes
// de 7 días, añadir un check de eliminadoEn en requireAuth (una consulta más
// por request) o pasar a tokens de vida corta + refresh.
authRouter.delete('/me', requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.sub } });
  if (!usuario || usuario.eliminadoEn) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  const { marca, email, passwordHash } = datosAnonimizados(usuario.id);
  // Sus viajes, gastos y fotos de recibos son datos personales sin deber
  // legal de conservarlos (no son facturación nuestra): se borran del todo.
  const recibos = await prisma.gasto.findMany({
    where: { viaje: { transportador: { usuarioId: usuario.id } }, recibo: { not: null } },
    select: { recibo: true },
  });
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      email,
      passwordHash,
      celular: null,
      eliminadoEn: new Date(),
      // Sus cargas publicadas se cancelan: sin esto seguirían en el listado y
      // un transportador podría pagar por un contacto que ya no existe.
      publicador:
        usuario.tipo === 'PUBLICADOR'
          ? {
              update: {
                nombre: 'Usuario eliminado',
                telefono: '',
                documento: marca,
                cargas: { updateMany: { where: { estado: 'DISPONIBLE' }, data: { estado: 'CANCELADA' } } },
              },
            }
          : undefined,
      transportador:
        usuario.tipo === 'TRANSPORTADOR'
          ? {
              update: { nombre: 'Usuario eliminado', telefono: '', documento: marca, placa: null, viajes: { deleteMany: {} } },
            }
          : undefined,
    },
  });
  borrarRecibos(recibos.map((g) => g.recibo));

  res.json({ ok: true });
});
