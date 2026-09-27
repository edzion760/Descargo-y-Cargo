import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const prospectosRouter = Router();

// Captura de contactos en ferias (formulario /effix): la persona deja sus
// datos ella misma y autoriza el tratamiento, así que queda como Publicador
// con consentimientoEn. Si el teléfono ya existía, se actualiza en vez de
// duplicar.
export const leadSchema = z.object({
  empresa: z.string().trim().min(2).max(120),
  contacto: z.string().trim().min(2).max(80),
  cargo: z.string().trim().max(80).optional().default(''),
  telefono: z
    .string()
    .transform((t) => t.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, ''))
    .pipe(z.string().regex(/^\d{7,10}$/, 'Teléfono inválido')),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  ciudad: z.string().trim().max(80).optional().default(''),
  despacha: z.string().trim().max(200).optional().default(''),
  frecuencia: z.enum(['', 'semanal', 'mensual', 'ocasional']).optional().default(''),
  fuente: z.string().trim().max(60).optional().default('Effix 2026'),
  // refine en vez de z.literal(true, {message}): en zod 3 el mensaje propio
  // no aplica a literal y el usuario veía "Invalid literal value" en inglés.
  acepta: z.boolean({ required_error: 'Debes autorizar el tratamiento de datos' }).refine((v) => v, {
    message: 'Debes autorizar el tratamiento de datos',
  }),
});

prospectosRouter.post('/lead', async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;

  const notas = [
    `Contacto: ${d.contacto}${d.cargo ? ` (${d.cargo})` : ''}`,
    d.despacha && `Despacha: ${d.despacha}`,
    d.frecuencia && `Frecuencia: ${d.frecuencia}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const datos = {
    nombre: d.empresa,
    email: d.email || null,
    ciudad: d.ciudad || null,
    notas,
    consentimientoEn: new Date(),
    noContactar: false,
  };

  const existente = await prisma.prospecto.findFirst({ where: { telefonos: { contains: d.telefono } } });
  if (existente) {
    await prisma.prospecto.update({ where: { id: existente.id }, data: { ...datos, tipoInteres: 'PUBLICADOR' } });
  } else {
    await prisma.prospecto.create({
      data: { ...datos, tipoInteres: 'PUBLICADOR', fuente: d.fuente, telefonos: d.telefono },
    });
  }
  res.status(201).json({ ok: true });
});

// Derecho de oposición a mercadeo directo (Ley 1581 de 2012, art. 8): un
// clic desde el correo, sin cuenta ni token. ponytail: el id es adivinable
// y no requiere autenticación -- riesgo bajo a propósito (lo peor que puede
// pasar es que alguien más dé de baja a una empresa de la lista de
// mercadeo, no expone ni cambia ningún dato sensible).
prospectosRouter.get('/baja', async (req, res) => {
  const id = Number(req.query.id);
  if (id) {
    await prisma.prospecto.updateMany({ where: { id }, data: { noContactar: true } });
  }
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Baja confirmada</title></head>
    <body style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;text-align:center;color:#18181b">
      <h1 style="font-size:18px">Listo, no te volveremos a escribir</h1>
      <p style="color:#71717a;font-size:14px">Tu empresa fue removida de la lista de invitación de Descargo &amp; Cargo.</p>
    </body></html>`);
});

// El botón del correo de la campaña pasa por aquí antes de llegar al sitio.
// Igual que /baja: sin auth a propósito, riesgo bajo (en el peor caso alguien
// marca una visita que no ocurrió, no expone ni cambia datos sensibles).
prospectosRouter.get('/visita', async (req, res) => {
  const id = Number(req.query.id);
  if (id) {
    await prisma.prospecto.updateMany({ where: { id, visitadoEn: null }, data: { visitadoEn: new Date() } });
  }
  res.redirect(302, 'https://descargoycargo.com');
});
