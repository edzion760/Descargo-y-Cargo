import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

// Una sesión (JWT) vale si la cuenta sigue activa y su versión de sesión no
// cambió: al restablecer la contraseña se sube sesionVersion y todas las
// sesiones abiertas en otros aparatos quedan inválidas de inmediato. Los
// tokens emitidos antes de existir la versión no traen `sv` y cuentan como 0.
export function sesionVigente(payload, usuario) {
  return Boolean(usuario) && !usuario.eliminadoEn && (payload.sv ?? 0) === usuario.sesionVersion;
}

// Verifica firma y vencimiento, y luego el estado de la cuenta en la BD (una
// consulta por petición: es el precio de poder cerrar sesiones a distancia).
async function leerSesion(req) {
  const token = req.cookies?.dyc_token;
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    select: { id: true, tipo: true, eliminadoEn: true, sesionVersion: true },
  });
  return sesionVigente(payload, usuario) ? { payload, usuario } : null;
}

export async function requireAuth(req, res, next) {
  const sesion = await leerSesion(req);
  if (!sesion) return res.status(401).json({ error: 'Tu sesión venció. Ingresa de nuevo.' });
  req.user = sesion.payload;
  req.usuarioSesion = sesion.usuario;
  next();
}

// Para rutas públicas que se comportan distinto si hay sesión (ej. marcar
// qué cargas ya desbloqueaste) pero deben seguir funcionando para un
// visitante anónimo: una sesión ausente, vencida o inválida (ej. tras rotar
// JWT_SECRET o cambiar la contraseña) se trata como "sin sesión", nunca 401.
export async function optionalAuth(req, _res, next) {
  const sesion = await leerSesion(req);
  if (sesion) {
    req.user = sesion.payload;
    req.usuarioSesion = sesion.usuario;
  }
  next();
}

export function requireTipo(tipo) {
  return (req, res, next) => {
    if (req.user.tipo !== tipo) {
      return res.status(403).json({ error: `Esta acción requiere una cuenta de tipo ${tipo}` });
    }
    next();
  };
}

// Se lee esAdmin de la BD en cada petición en vez de ponerlo en el JWT: si se
// le quita el permiso a alguien, pierde el acceso de inmediato.
export async function requireAdmin(req, res, next) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.sub }, select: { esAdmin: true, eliminadoEn: true } });
  if (!usuario?.esAdmin || usuario.eliminadoEn) return res.status(403).json({ error: 'Solo administradores' });
  next();
}
