import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireTipo } from '../middleware/auth.js';

export const cargasRouter = Router();

// Cobro por uso sin plan: 4% del flete, mínimo $15.000 COP.
// Con membresía ILIMITADA el desbloqueo es gratis.
export function tarifaDesbloqueo(precio, tipoMembresia) {
  if (tipoMembresia === 'ILIMITADA') return 0;
  return Math.max(Math.round(precio * 0.04), 15000);
}

function maybeAuth(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  requireAuth(req, _res, next);
}

const cargaPublica = {
  id: true,
  titulo: true,
  tipoCarga: true,
  origen: true,
  destino: true,
  toneladas: true,
  precio: true,
  pisoSiceTac: true,
  fechaCarga: true,
  tipoPublicacion: true,
  vehiculoRequerido: true,
  verificado: true,
  destacada: true,
  estado: true,
};

cargasRouter.get('/', maybeAuth, async (req, res) => {
  const { tipoPublicacion } = req.query;
  const cargas = await prisma.carga.findMany({
    where: {
      estado: 'DISPONIBLE',
      ...(tipoPublicacion ? { tipoPublicacion: String(tipoPublicacion) } : {}),
    },
    select: cargaPublica,
    orderBy: [{ destacada: 'desc' }, { createdAt: 'desc' }],
  });

  let desbloqueadas = new Set();
  if (req.user?.tipo === 'TRANSPORTADOR') {
    const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
    const pagos = await prisma.pagoDesbloqueo.findMany({
      where: { transportadorId: transportador.id, estado: 'VERIFICADO' },
      select: { cargaId: true },
    });
    desbloqueadas = new Set(pagos.map((p) => p.cargaId));
  }

  res.json(cargas.map((c) => ({ ...c, desbloqueada: desbloqueadas.has(c.id) })));
});

const cargaSchema = z.object({
  titulo: z.string().min(3),
  tipoCarga: z.string().min(2),
  origen: z.string().min(2),
  destino: z.string().min(2),
  toneladas: z.number().positive(),
  precio: z.number().int().positive(),
  pisoSiceTac: z.number().int().positive(),
  fechaCarga: z.string().datetime().or(z.string().min(8)),
  tipoPublicacion: z.enum(['NACIONAL', 'URBANA', 'BARBACHA']),
  vehiculoRequerido: z.string().min(2),
});

cargasRouter.post('/', requireAuth, requireTipo('PUBLICADOR'), async (req, res) => {
  const parsed = cargaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const publicador = await prisma.publicador.findUnique({ where: { usuarioId: req.user.sub } });
  if (parsed.data.precio < parsed.data.pisoSiceTac) {
    return res.status(422).json({ error: 'El precio no puede estar por debajo del piso SICE-TAC' });
  }

  const carga = await prisma.carga.create({
    data: { ...parsed.data, fechaCarga: new Date(parsed.data.fechaCarga), publicadorId: publicador.id },
  });
  res.status(201).json(carga);
});

cargasRouter.get('/:id', maybeAuth, async (req, res) => {
  const id = Number(req.params.id);
  const carga = await prisma.carga.findUnique({
    where: { id },
    select: { ...cargaPublica, publicador: { select: { nombre: true, telefono: true } } },
  });
  if (!carga) return res.status(404).json({ error: 'Carga no encontrada' });

  let desbloqueada = false;
  if (req.user?.tipo === 'TRANSPORTADOR') {
    const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
    const pago = await prisma.pagoDesbloqueo.findUnique({
      where: { cargaId_transportadorId: { cargaId: id, transportadorId: transportador.id } },
    });
    desbloqueada = pago?.estado === 'VERIFICADO';
  }

  const { publicador, ...resto } = carga;
  res.json({ ...resto, desbloqueada, contacto: desbloqueada ? publicador : null });
});

cargasRouter.post('/:id/desbloqueo', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const cargaId = Number(req.params.id);
  const carga = await prisma.carga.findUnique({ where: { id: cargaId } });
  if (!carga) return res.status(404).json({ error: 'Carga no encontrada' });

  const transportador = await prisma.transportador.findUnique({
    where: { usuarioId: req.user.sub },
    include: { membresia: true },
  });

  const monto = tarifaDesbloqueo(carga.precio, transportador.membresia?.tipo);

  // Simulado: en producción esto se crea en PENDIENTE y se verifica por webhook de Wompi.
  const pago = await prisma.pagoDesbloqueo.upsert({
    where: { cargaId_transportadorId: { cargaId, transportadorId: transportador.id } },
    update: {},
    create: { cargaId, transportadorId: transportador.id, monto, estado: 'VERIFICADO' },
  });

  const publicador = await prisma.publicador.findUnique({
    where: { id: carga.publicadorId },
    select: { nombre: true, telefono: true },
  });

  res.status(201).json({ monto: pago.monto, contacto: publicador });
});
