import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { telefonoSchema } from './prospectos.js';
import { enviarCartaExpositor } from '../email.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// Contactos tomados del QR del stand de un expositor. Él publicó sus datos
// para que lo contacten, así que el seguimiento directo (llamada, WhatsApp,
// una carta individual con enlace de baja) es legítimo; pero no marcó una
// autorización como en /effix, así que NO entran a campañas masivas (ver
// scripts/enviar-campana-prospectos.js).
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
      contactadoEn: true,
      noContactar: true,
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
    enviarCarta: z.boolean().optional().default(false),
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
  // "Guardar y enviar" en un solo paso desde el escáner. Si el correo falla,
  // el contacto igual queda guardado y la carta se puede reenviar después.
  const cartaEnviada = d.enviarCarta && d.email ? await enviarCarta(prospecto, d.contacto) : false;
  res.status(201).json({ id: prospecto.id, cartaEnviada });
});

async function enviarCarta(p, contacto) {
  const evento = p.fuente.split(' · ')[0];
  const enviado = await enviarCartaExpositor(p.email, { empresa: p.nombre ?? 'su empresa', contacto, evento, id: p.id });
  if (enviado) await prisma.prospecto.update({ where: { id: p.id }, data: { contactadoEn: new Date() } });
  return enviado;
}

// Carta de invitación individual: una sola por contacto (contactadoEn) y
// nunca a quien pidió no ser contactado. Se marca solo si Resend la aceptó.
adminRouter.post('/leads/:id/carta', async (req, res) => {
  const p = await prisma.prospecto.findUnique({ where: { id: Number(req.params.id) || 0 } });
  if (!p) return res.status(404).json({ error: 'Contacto no encontrado' });
  if (!p.email) return res.status(400).json({ error: 'Este contacto no tiene correo' });
  if (p.noContactar) return res.status(409).json({ error: 'Pidió no ser contactado' });
  if (p.contactadoEn) return res.status(409).json({ error: 'Ya se le envió la carta' });

  const contacto = p.notas?.match(/^Contacto: ([^(·]+)/)?.[1].trim() ?? '';
  if (!(await enviarCarta(p, contacto))) return res.status(502).json({ error: 'No se pudo enviar el correo. Intenta más tarde.' });
  res.json({ contactadoEn: new Date() });
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
