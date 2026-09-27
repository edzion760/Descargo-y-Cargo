import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.cookies?.dyc_token;
  if (!token) return res.status(401).json({ error: 'Falta el token de autenticación' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Para rutas públicas que se comportan distinto si hay sesión (ej. marcar
// qué cargas ya desbloqueaste) pero deben seguir funcionando para un
// visitante anónimo. A diferencia de requireAuth: un token ausente,
// vencido o inválido (ej. tras rotar JWT_SECRET) simplemente se trata como
// "sin sesión" -- nunca bloquea la respuesta con 401.
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.dyc_token;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // token inválido/vencido: seguir como anónimo, no rechazar la ruta.
    }
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
// le quita el permiso a alguien, pierde el acceso de inmediato, no en 7 días.
export async function requireAdmin(req, res, next) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.sub }, select: { esAdmin: true, eliminadoEn: true } });
  if (!usuario?.esAdmin || usuario.eliminadoEn) return res.status(403).json({ error: 'Solo administradores' });
  next();
}
