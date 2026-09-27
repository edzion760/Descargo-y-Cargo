import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// Contactos que dejaron sus datos ellos mismos (formulario /effix y
// similares), no la base 2023: esos son los únicos con consentimientoEn.
async function leads() {
  return prisma.prospecto.findMany({
    where: { consentimientoEn: { not: null } },
    select: { id: true, nombre: true, telefonos: true, email: true, ciudad: true, fuente: true, notas: true, consentimientoEn: true },
    orderBy: { consentimientoEn: 'desc' },
  });
}

adminRouter.get('/leads', async (_req, res) => {
  res.json(await leads());
});

// Excel en Colombia abre CSV con ";" como separador; el BOM hace que lea
// UTF-8 (sin él las tildes salen dañadas). Sin librería de xlsx: no hace falta.
export function aCsv(filas) {
  const celda = (v) => {
    const t = v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 16).replace('T', ' ') : String(v);
    return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const columnas = ['Fecha (UTC)', 'Empresa', 'Celular', 'Correo', 'Ciudad', 'Detalle', 'Fuente'];
  const lineas = filas.map((f) =>
    [f.consentimientoEn, f.nombre, f.telefonos, f.email, f.ciudad, f.notas, f.fuente].map(celda).join(';')
  );
  return '﻿' + [columnas.join(';'), ...lineas].join('\r\n');
}

adminRouter.get('/leads.csv', async (_req, res) => {
  const fecha = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="contactos-${fecha}.csv"`);
  res.send(aCsv(await leads()));
});
