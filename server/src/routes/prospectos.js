import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { firmaValida } from '../enlacesProspecto.js';

export const prospectosRouter = Router();

// Captura de contactos en ferias (formulario /effix): la persona deja sus
// datos ella misma y autoriza el tratamiento, así que queda como Publicador
// con consentimientoEn. Si el teléfono ya existía, solo se anota la fecha del
// consentimiento (ver accionLead).
// Compartido con el registro manual/QR del panel admin (routes/admin.js).
export const telefonoSchema = z
  .string()
  .transform((t) => t.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^\d{7,10}$/, 'Teléfono inválido'));

export const leadSchema = z.object({
  empresa: z.string().trim().min(2).max(120),
  contacto: z.string().trim().min(2).max(80),
  cargo: z.string().trim().max(80).optional().default(''),
  telefono: telefonoSchema,
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
  };

  // El formulario es público: nunca sobrescribe ni reactiva a alguien que ya
  // está en la lista (cualquiera podría escribir el teléfono de otro).
  const candidatos = await prisma.prospecto.findMany({ where: { telefonos: { contains: d.telefono } } });
  const existente = candidatos.find((p) => telefonoCoincide(p.telefonos, d.telefono));
  const accion = accionLead(existente);
  if (accion === 'crear') {
    await prisma.prospecto.create({
      data: { ...datos, noContactar: false, tipoInteres: 'PUBLICADOR', fuente: d.fuente, telefonos: d.telefono },
    });
  } else if (accion === 'consentimiento') {
    await prisma.prospecto.update({ where: { id: existente.id }, data: { consentimientoEn: datos.consentimientoEn } });
  }
  res.status(201).json({ ok: true });
});

// "3001234567,3109876543" contiene 3001234567 exacto, no solo "300123".
export const telefonoCoincide = (telefonos, tel) =>
  String(telefonos ?? '')
    .split(',')
    .map((t) => t.trim())
    .includes(tel);

// crear: no existe · consentimiento: existe y acepta contacto (solo se anota
// la fecha) · ignorar: pidió no ser contactado, queda intacto.
export function accionLead(existente) {
  if (!existente) return 'crear';
  return existente.noContactar ? 'ignorar' : 'consentimiento';
}

const pagina = (titulo, cuerpo) => `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head>
  <body style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;padding:0 16px;text-align:center;color:#18181b">
    ${cuerpo}
  </body></html>`;

// Página de confirmación de la baja. id y firma ya validados por formato.
export function paginaConfirmarBaja(id, firma) {
  const accion = `/api/prospectos/baja?id=${id}${firma ? `&f=${firma}` : ''}`;
  return pagina(
    'Confirmar baja',
    `<h1 style="font-size:18px">¿No quieres recibir más correos de Descargo &amp; Cargo?</h1>
    <form method="post" action="${accion}">
      <button type="submit" style="margin-top:16px;background:#18181b;color:#fff;border:0;border-radius:999px;padding:12px 24px;font-size:15px;font-weight:600;cursor:pointer">Confirmar baja</button>
    </form>`
  );
}

const idQuery = (q) => (/^\d{1,9}$/.test(String(q.id ?? '')) ? Number(q.id) : null);
const firmaQuery = (q) => (typeof q.f === 'string' && /^[0-9a-f]{16}$/.test(q.f) ? q.f : null);

// Derecho de oposición a mercadeo directo (Ley 1581 de 2012, art. 8).
// El GET no cambia nada: los filtros de correo abren los enlaces solos. La
// baja la hace el POST (botón de la página o "Cancelar suscripción" de
// Gmail/Outlook vía List-Unsubscribe-Post).
prospectosRouter.get('/baja', (req, res) => {
  const id = idQuery(req.query);
  if (!id) return res.status(404).send(pagina('Enlace inválido', '<h1 style="font-size:18px">Enlace inválido</h1>'));
  res.send(paginaConfirmarBaja(id, firmaQuery(req.query)));
});

// Correos ya enviados traen el enlace sin firma: sin "f" se acepta igual,
// pero solo para dar de baja (nunca reactiva). Una firma que no cuadra se ignora.
prospectosRouter.post('/baja', async (req, res) => {
  const id = idQuery(req.query);
  const f = req.query.f;
  if (id && (f === undefined || firmaValida(id, f))) {
    await prisma.prospecto.updateMany({ where: { id }, data: { noContactar: true } });
  }
  res.send(
    pagina(
      'Baja confirmada',
      `<h1 style="font-size:18px">Listo, no te volveremos a escribir</h1>
      <p style="color:#71717a;font-size:14px">Tu empresa fue removida de la lista de invitación de Descargo &amp; Cargo.</p>`
    )
  );
});

// El botón del correo de la campaña pasa por aquí antes de llegar al sitio.
// Solo se anota la visita con firma válida; la redirección ocurre siempre.
prospectosRouter.get('/visita', async (req, res) => {
  const id = idQuery(req.query);
  if (id && firmaValida(id, req.query.f)) {
    await prisma.prospecto.updateMany({ where: { id, visitadoEn: null }, data: { visitadoEn: new Date() } });
  }
  res.redirect(302, 'https://descargoycargo.com');
});
