import crypto from 'node:crypto';

// Enlaces de baja y visita de los correos a prospectos, firmados con HMAC
// para que nadie arme el enlace de otra empresa cambiando el id.

function secreto() {
  const s = process.env.ENLACES_SECRET ?? process.env.JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('Falta ENLACES_SECRET o JWT_SECRET');
  return 'solo-desarrollo';
}

export function firmaProspecto(id) {
  return crypto.createHmac('sha256', secreto()).update(String(id)).digest('hex').slice(0, 16);
}

export function firmaValida(id, firma) {
  if (typeof firma !== 'string' || !/^[0-9a-f]{16}$/.test(firma)) return false;
  return crypto.timingSafeEqual(Buffer.from(firmaProspecto(id)), Buffer.from(firma));
}

const BASE = 'https://descargoycargo.com/api/prospectos';
export const urlBaja = (id) => `${BASE}/baja?id=${id}&f=${firmaProspecto(id)}`;
export const urlVisita = (id) => `${BASE}/visita?id=${id}&f=${firmaProspecto(id)}`;
