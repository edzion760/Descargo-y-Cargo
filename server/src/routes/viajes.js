import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express, { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireTipo } from '../middleware/auth.js';
import { csv, enviarCsv } from '../csv.js';

// Registro de gastos por viaje del transportador (ACPM, peajes, etc.) para
// que sepa cuánto le quedó de cada flete. Todo es privado: cada consulta
// filtra por el transportador de la sesión.
export const viajesRouter = Router();
viajesRouter.use(requireAuth, requireTipo('TRANSPORTADOR'));

export const TIPOS_GASTO = ['ACPM', 'PEAJES', 'COMIDA', 'HOSPEDAJE', 'CARGUE', 'TALLER', 'OTROS'];

// ponytail: fotos en el disco del VPS, fuera de la BD y del backup diario
// (que solo copia dev.db). Si los recibos se vuelven críticos, subirlos a
// Cloudflare R2 o incluir la carpeta en el backup.
const RECIBOS_DIR = path.join(process.env.UPLOADS_DIR ?? path.join(import.meta.dirname, '../../uploads'), 'recibos');

export function borrarRecibos(nombres) {
  for (const n of nombres) if (n) fs.rm(path.join(RECIBOS_DIR, n), { force: true }, () => {});
}

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').transform((f) => new Date(`${f}T00:00:00Z`));

const viajeSchema = z.object({
  origen: z.string().trim().min(2, 'Escribe el origen').max(80),
  destino: z.string().trim().min(2, 'Escribe el destino').max(80),
  descripcion: z.string().trim().max(120).optional().default(''),
  flete: z.number().int().min(0).max(1_000_000_000),
  fecha: fechaSchema,
});

export const gastoSchema = z.object({
  tipo: z.enum(TIPOS_GASTO, { message: 'Tipo de gasto inválido' }),
  valor: z.number().int().positive('El valor debe ser mayor a 0').max(100_000_000),
  fecha: fechaSchema,
  nota: z.string().trim().max(200).optional().default(''),
});

async function miTransportador(req) {
  return prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
}

async function miViaje(req, id) {
  const t = await miTransportador(req);
  return prisma.viaje.findFirst({ where: { id: Number(id) || 0, transportadorId: t.id } });
}

async function miGasto(req, id) {
  const t = await miTransportador(req);
  return prisma.gasto.findFirst({ where: { id: Number(id) || 0, viaje: { transportadorId: t.id } } });
}

const conGastos = {
  gastos: { orderBy: [{ fecha: 'asc' }, { id: 'asc' }] },
  carga: { select: { titulo: true, pisoSiceTac: true } },
};

viajesRouter.get('/', async (req, res) => {
  const t = await miTransportador(req);
  const viajes = await prisma.viaje.findMany({
    where: { transportadorId: t.id },
    include: conGastos,
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
  });
  res.json(viajes);
});

// Crea un viaje: desde una carga desbloqueada ({ cargaId }) o uno conseguido
// por fuera de la plataforma. Para una carga, si ya existe se devuelve el
// mismo (el botón "Gastos del viaje" se puede tocar muchas veces).
viajesRouter.post('/', async (req, res) => {
  const t = await miTransportador(req);

  if (req.body?.cargaId) {
    const cargaId = Number(req.body.cargaId);
    const existente = await prisma.viaje.findUnique({
      where: { transportadorId_cargaId: { transportadorId: t.id, cargaId } },
    });
    if (existente) return res.json(existente);
    const pago = await prisma.pagoDesbloqueo.findUnique({
      where: { cargaId_transportadorId: { cargaId, transportadorId: t.id } },
      include: { carga: true },
    });
    if (pago?.estado !== 'VERIFICADO') return res.status(404).json({ error: 'No desbloqueaste esa carga' });
    const viaje = await prisma.viaje.create({
      data: {
        transportadorId: t.id,
        cargaId,
        origen: pago.carga.origen,
        destino: pago.carga.destino,
        descripcion: pago.carga.titulo,
        flete: pago.carga.precio,
        fecha: pago.carga.fechaCarga,
      },
    });
    return res.status(201).json(viaje);
  }

  const parsed = viajeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const viaje = await prisma.viaje.create({ data: { ...parsed.data, transportadorId: t.id } });
  res.status(201).json(viaje);
});

viajesRouter.patch('/:id', async (req, res) => {
  const viaje = await miViaje(req, req.params.id);
  if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
  const parsed = viajeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  res.json(await prisma.viaje.update({ where: { id: viaje.id }, data: parsed.data }));
});

viajesRouter.delete('/:id', async (req, res) => {
  const viaje = await miViaje(req, req.params.id);
  if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
  const recibos = await prisma.gasto.findMany({ where: { viajeId: viaje.id, recibo: { not: null } }, select: { recibo: true } });
  await prisma.viaje.delete({ where: { id: viaje.id } });
  borrarRecibos(recibos.map((g) => g.recibo));
  res.status(204).end();
});

viajesRouter.post('/:id/gastos', async (req, res) => {
  const viaje = await miViaje(req, req.params.id);
  if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
  const parsed = gastoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const gasto = await prisma.gasto.create({ data: { ...parsed.data, nota: parsed.data.nota || null, viajeId: viaje.id } });
  res.status(201).json(gasto);
});

viajesRouter.delete('/gastos/:gastoId', async (req, res) => {
  const gasto = await miGasto(req, req.params.gastoId);
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
  await prisma.gasto.delete({ where: { id: gasto.id } });
  borrarRecibos([gasto.recibo]);
  res.status(204).end();
});

// Foto del recibo: el navegador la reduce y la manda como JPEG en el cuerpo
// (sin multipart ni librería de subida). Nombre aleatorio: no se puede adivinar.
viajesRouter.put('/gastos/:gastoId/recibo', express.raw({ type: 'image/jpeg', limit: '3mb' }), async (req, res) => {
  const gasto = await miGasto(req, req.params.gastoId);
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
  if (!Buffer.isBuffer(req.body) || req.body.length < 100) return res.status(400).json({ error: 'Imagen inválida' });

  fs.mkdirSync(RECIBOS_DIR, { recursive: true });
  const nombre = `${crypto.randomUUID()}.jpg`;
  fs.writeFileSync(path.join(RECIBOS_DIR, nombre), req.body);
  borrarRecibos([gasto.recibo]);
  res.json(await prisma.gasto.update({ where: { id: gasto.id }, data: { recibo: nombre } }));
});

// Recibos privados: se sirven solo al dueño, nunca como archivo público.
viajesRouter.get('/gastos/:gastoId/recibo', async (req, res) => {
  const gasto = await miGasto(req, req.params.gastoId);
  if (!gasto?.recibo) return res.status(404).json({ error: 'Sin recibo' });
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.sendFile(path.join(RECIBOS_DIR, gasto.recibo));
});

const NOMBRE_TIPO = {
  ACPM: 'ACPM',
  PEAJES: 'Peajes',
  COMIDA: 'Comida',
  HOSPEDAJE: 'Hospedaje',
  CARGUE: 'Cargue / descargue',
  TALLER: 'Llantas y taller',
  OTROS: 'Otros',
};

export function gastosCsv(viajes) {
  const filas = viajes.flatMap((v) =>
    v.gastos.map((g) => [
      g.fecha.toISOString().slice(0, 10),
      `${v.origen} → ${v.destino}`,
      NOMBRE_TIPO[g.tipo] ?? g.tipo,
      g.valor,
      g.nota,
      g.recibo ? 'Sí' : 'No',
    ])
  );
  return csv(['Fecha', 'Viaje', 'Tipo de gasto', 'Valor (COP)', 'Nota', 'Tiene recibo'], filas);
}

viajesRouter.get('/gastos.csv', async (req, res) => {
  const t = await miTransportador(req);
  const viajes = await prisma.viaje.findMany({
    where: { transportadorId: t.id },
    include: { gastos: { orderBy: { fecha: 'asc' } } },
    orderBy: { fecha: 'asc' },
  });
  enviarCsv(res, `mis-gastos-${new Date().toISOString().slice(0, 10)}.csv`, gastosCsv(viajes));
});
