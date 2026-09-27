import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { telefonoSchema } from './prospectos.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// Contactos tomados del QR del stand de un expositor. Él publicó sus datos
// para que lo contacten, así que el seguimiento directo (llamada, WhatsApp)
// es legítimo; pero no marcó una autorización como en /effix, así que NO
// entran a campañas masivas (ver scripts/enviar-campana-prospectos.js).
export const FUENTE_QR = 'QR expositor';

// Contactos de ferias: los del formulario (con consentimientoEn) y los
// escaneados en stands. No incluye la base 2023.
async function leads() {
  const filas = await prisma.prospecto.findMany({
    where: { OR: [{ consentimientoEn: { not: null } }, { fuente: { endsWith: FUENTE_QR } }] },
    select: {
      id: true,
      nombre: true,
      telefonos: true,
      email: true,
      ciudad: true,
      fuente: true,
      notas: true,
      consentimientoEn: true,
      createdAt: true,
    },
  });
  return filas
    .map(({ createdAt, consentimientoEn, ...f }) => ({ ...f, autorizoCampanas: !!consentimientoEn, fecha: consentimientoEn ?? createdAt }))
    .sort((a, b) => b.fecha - a.fecha);
}

const leadQrSchema = z
  .object({
    empresa: z.string().trim().min(2, 'Escribe el nombre de la empresa').max(120),
    contacto: z.string().trim().max(80).optional().default(''),
    cargo: z.string().trim().max(80).optional().default(''),
    telefono: z.union([telefonoSchema, z.literal('')]).optional().default(''),
    email: z.union([z.string().trim().email('Correo inválido').max(120), z.literal('')]).optional().default(''),
    web: z.string().trim().max(300).optional().default(''),
    ciudad: z.string().trim().max(80).optional().default(''),
    notas: z.string().trim().max(1000).optional().default(''),
    evento: z.string().trim().max(60).optional().default('Effix 2026'),
  })
  .refine((d) => d.telefono || d.email, { message: 'Hace falta al menos un teléfono o un correo' });

adminRouter.post('/leads', async (req, res) => {
  const parsed = leadQrSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const notas = [
    d.contacto && `Contacto: ${d.contacto}${d.cargo ? ` (${d.cargo})` : ''}`,
    d.web && `Web: ${d.web}`,
    d.notas,
  ]
    .filter(Boolean)
    .join(' · ');
  const prospecto = await prisma.prospecto.create({
    data: {
      nombre: d.empresa,
      tipoInteres: 'PUBLICADOR',
      fuente: `${d.evento} · ${FUENTE_QR}`,
      telefonos: d.telefono,
      email: d.email || null,
      ciudad: d.ciudad || null,
      notas,
    },
  });
  res.status(201).json({ id: prospecto.id });
});

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
  const columnas = ['Fecha (UTC)', 'Empresa', 'Celular', 'Correo', 'Ciudad', 'Detalle', 'Fuente', 'Autorizó campañas'];
  const lineas = filas.map((f) =>
    [f.fecha, f.nombre, f.telefonos, f.email, f.ciudad, f.notas, f.fuente, f.autorizoCampanas ? 'Sí' : 'No'].map(celda).join(';')
  );
  return '﻿' + [columnas.join(';'), ...lineas].join('\r\n');
}

adminRouter.get('/leads.csv', async (_req, res) => {
  const fecha = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="contactos-${fecha}.csv"`);
  res.send(aCsv(await leads()));
});
