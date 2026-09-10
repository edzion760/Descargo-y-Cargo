import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Falta el token de autenticación' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireTipo(tipo) {
  return (req, res, next) => {
    if (req.user.tipo !== tipo) {
      return res.status(403).json({ error: `Esta acción requiere una cuenta de tipo ${tipo}` });
    }
    next();
  };
}
