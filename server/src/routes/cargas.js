import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireTipo, optionalAuth } from '../middleware/auth.js';
import { urlCheckout } from '../wompi.js';

export const cargasRouter = Router();

// Cobro por uso sin plan: 6% del flete, mínimo $15.000 y máximo $100.000 COP
// (el tope aplica desde fletes de ~$1.666.667).
// Con membresía ILIMITADA el desbloqueo es gratis.
// El frontend repite la fórmula solo para MOSTRAR el precio (app/src/data/mock.ts);
// el monto que se cobra en Wompi sale siempre de aquí.
export function tarifaDesbloqueo(precio, tipoMembresia) {
  if (tipoMembresia === 'ILIMITADA') return 0;
  return Math.min(Math.max(Math.round(precio * 0.06), 15000), 100000);
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

cargasRouter.get('/', optionalAuth, async (req, res) => {
  const { tipoPublicacion } = req.query;
  const cargas = await prisma.carga.findMany({
    where: {
      estado: 'DISPONIBLE',
      ...(tipoPublicacion ? { tipoPublicacion: String(tipoPublicacion) } : {}),
    },
    select: { ...cargaPublica, publicadorId: true },
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

  let miPublicadorId = null;
  if (req.user?.tipo === 'PUBLICADOR') {
    const publicador = await prisma.publicador.findUnique({ where: { usuarioId: req.user.sub } });
    miPublicadorId = publicador.id;
  }

  res.json(
    cargas.map(({ publicadorId, ...c }) => ({
      ...c,
      desbloqueada: desbloqueadas.has(c.id),
      esMia: miPublicadorId != null && publicadorId === miPublicadorId,
    }))
  );
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

const cargaEdicionSchema = z.object({
  titulo: z.string().min(3),
  precio: z.number().int().positive(),
  fechaCarga: z.string().datetime().or(z.string().min(8)),
  tipoPublicacion: z.enum(['NACIONAL', 'URBANA', 'BARBACHA']),
  vehiculoRequerido: z.string().min(2),
});

// Solo se pueden editar los campos que NO afectan el piso legal (título,
// fecha, tipo de publicación, vehículo, precio). Origen/destino/toneladas
// quedan fijos -- si esos cambian hay que republicar para que el piso
// SICE-TAC se recalcule con datos reales, no ajustarlo a mano aquí.
cargasRouter.patch('/:id', requireAuth, requireTipo('PUBLICADOR'), async (req, res) => {
  const id = Number(req.params.id);
  const publicador = await prisma.publicador.findUnique({ where: { usuarioId: req.user.sub } });
  const carga = await prisma.carga.findUnique({ where: { id } });
  if (!carga || carga.publicadorId !== publicador.id) {
    return res.status(404).json({ error: 'Carga no encontrada' });
  }

  const parsed = cargaEdicionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (parsed.data.precio < carga.pisoSiceTac) {
    return res.status(422).json({ error: 'El precio no puede estar por debajo del piso SICE-TAC' });
  }

  const actualizada = await prisma.carga.update({
    where: { id },
    data: { ...parsed.data, fechaCarga: new Date(parsed.data.fechaCarga) },
  });
  res.json(actualizada);
});

// Baja lógica (estado CANCELADA), no se borra la fila -- conserva el
// historial por si algún transportador ya pagó un desbloqueo sobre ella.
cargasRouter.delete('/:id', requireAuth, requireTipo('PUBLICADOR'), async (req, res) => {
  const id = Number(req.params.id);
  const publicador = await prisma.publicador.findUnique({ where: { usuarioId: req.user.sub } });
  const carga = await prisma.carga.findUnique({ where: { id } });
  if (!carga || carga.publicadorId !== publicador.id) {
    return res.status(404).json({ error: 'Carga no encontrada' });
  }

  await prisma.carga.update({ where: { id }, data: { estado: 'CANCELADA' } });
  res.status(204).end();
});

cargasRouter.get('/:id', optionalAuth, async (req, res) => {
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

  // Gratis por membresía ILIMITADA: no hay nada que cobrar, se confirma de una vez.
  if (monto === 0) {
    await prisma.pagoDesbloqueo.upsert({
      where: { cargaId_transportadorId: { cargaId, transportadorId: transportador.id } },
      update: { estado: 'VERIFICADO' },
      create: { cargaId, transportadorId: transportador.id, monto, estado: 'VERIFICADO' },
    });
    const publicador = await prisma.publicador.findUnique({
      where: { id: carga.publicadorId },
      select: { nombre: true, telefono: true },
    });
    return res.status(201).json({ monto, contacto: publicador });
  }

  // Con costo: se manda a pagar a Wompi. El webhook (/api/webhooks/wompi) confirma
  // el pago y recién ahí queda VERIFICADO — ver GET /:id para el estado real.
  const referencia = `carga${cargaId}-t${transportador.id}-${Date.now()}`;
  await prisma.pagoDesbloqueo.upsert({
    where: { cargaId_transportadorId: { cargaId, transportadorId: transportador.id } },
    update: { monto, referencia, estado: 'PENDIENTE' },
    create: { cargaId, transportadorId: transportador.id, monto, referencia, estado: 'PENDIENTE' },
  });

  const appUrl = process.env.APP_URL ?? 'http://localhost:4000';
  const checkoutUrl = urlCheckout({
    referencia,
    montoEnCentavos: monto * 100,
    redirectUrl: `${appUrl}/?wompi_carga=${cargaId}`,
  });

  res.status(201).json({ monto, checkoutUrl });
});
