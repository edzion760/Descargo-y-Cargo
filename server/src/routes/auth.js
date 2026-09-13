import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const TERMINOS_VERSION = '1.0';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  tipo: z.enum(['PUBLICADOR', 'TRANSPORTADOR']),
  nombre: z.string().min(2),
  ciudad: z.string().min(2),
  telefono: z.string().min(7),
  documento: z.string().min(6, 'Documento de identidad inválido'),
  aceptaTerminos: z.literal(true, { message: 'Debes aceptar los Términos y la Política de Datos' }),
});

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

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, tipo, nombre, ciudad, telefono, documento } = parsed.data;
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
        terminosVersion: TERMINOS_VERSION,
        terminosAceptadosEn: new Date(),
        terminosIp: ip,
        ...(tipo === 'PUBLICADOR'
          ? { publicador: { create: { nombre, ciudad, telefono, documento } } }
          : {
              transportador: {
                create: { nombre, ciudad, telefono, documento, membresia: { create: { tipo: 'GRATIS' } } },
              },
            }),
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const campo = err.meta?.target?.includes('documento') ? 'documento' : 'correo';
      return res.status(409).json({ error: `Ya existe una cuenta con ese ${campo}` });
    }
    throw err;
  }

  res.status(201).json({ token: signToken(usuario), tipo: usuario.tipo });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }
  if (usuario.eliminadoEn) {
    return res.status(401).json({ error: 'Esta cuenta fue eliminada' });
  }

  res.json({ token: signToken(usuario), tipo: usuario.tipo });
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
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      email,
      passwordHash,
      eliminadoEn: new Date(),
      publicador:
        usuario.tipo === 'PUBLICADOR'
          ? { update: { nombre: 'Usuario eliminado', telefono: '', documento: marca } }
          : undefined,
      transportador:
        usuario.tipo === 'TRANSPORTADOR'
          ? { update: { nombre: 'Usuario eliminado', telefono: '', documento: marca } }
          : undefined,
    },
  });

  res.json({ ok: true });
});
