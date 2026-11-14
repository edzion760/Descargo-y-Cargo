import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireTipo, optionalAuth } from '../middleware/auth.js';
import { urlCheckout } from '../wompi.js';
import { enviarAvisoPublicador } from '../email.js';
import { placaSchema } from './auth.js';
import { ubicarCiudad } from '../clima.js';
import { calcularTarifaRuta } from '../geo.js';

export const cargasRouter = Router();

// Cobro por uso sin plan:
// - NACIONAL: 6% del flete, mínimo $15.000 y máximo $100.000 COP
//   (el tope aplica desde fletes de ~$1.666.667).
// - URBANA y BARBACHA (acarreos): $1.000 por contacto -- un acarreo municipal
//   puede valer $15.000 en total, el mínimo nacional no le cabe. Wompi no
//   cobra montos tan bajos (mínimo ~$1.500 y su comisión se comería el
//   valor), así que se venden en paquete de 5 por $5.000 (créditos).
// Con membresía ILIMITADA el desbloqueo es gratis.
// El frontend repite la fórmula solo para MOSTRAR el precio (app/src/data/mock.ts);
// el monto que se cobra en Wompi sale siempre de aquí.
export const PAQUETE_ACARREO = { creditos: 5, precio: 5000 };

export const esAcarreo = (tipoPublicacion) => tipoPublicacion === 'URBANA' || tipoPublicacion === 'BARBACHA';

export function tarifaDesbloqueo(precio, tipoMembresia, tipoPublicacion) {
  if (tipoMembresia === 'ILIMITADA') return 0;
  if (esAcarreo(tipoPublicacion)) return PAQUETE_ACARREO.precio / PAQUETE_ACARREO.creditos;
  return Math.min(Math.max(Math.round(precio * 0.06), 15000), 100000);
}

// Gasta un crédito de acarreo y deja el contacto desbloqueado, todo o nada.
// Devuelve el pago, o null si no le quedan créditos. El decremento lleva la
// condición "> 0" para que dos clics simultáneos no dejen el saldo negativo.
export async function usarCreditoAcarreo(tx, transportadorId, cargaId) {
  const { count } = await tx.transportador.updateMany({
    where: { id: transportadorId, creditosAcarreo: { gt: 0 } },
    data: { creditosAcarreo: { decrement: 1 } },
  });
  if (!count) return null;
  const monto = tarifaDesbloqueo(0, null, 'URBANA');
  return tx.pagoDesbloqueo.upsert({
    where: { cargaId_transportadorId: { cargaId, transportadorId } },
    update: { monto, estado: 'VERIFICADO' },
    create: { cargaId, transportadorId, monto, estado: 'VERIFICADO' },
  });
}

// Le cuenta al publicador quién desbloqueó su carga (nombre, teléfono, placa).
export async function avisarPublicador(pagoId) {
  const pago = await prisma.pagoDesbloqueo.findUnique({
    where: { id: pagoId },
    include: { carga: { include: { publicador: { include: { usuario: true } } } }, transportador: true },
  });
  // Cuenta del publicador dada de baja (anonimizada): no hay a quién avisar.
  if (!pago || pago.carga.publicador.usuario.eliminadoEn) return;
  await enviarAvisoPublicador(pago.carga.publicador.usuario.email, {
    carga: pago.carga.titulo,
    transportador: pago.transportador,
    pagoId: pago.id,
  });
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
  ejemplo: true,
  estado: true,
};

// Rutas de las cargas disponibles para el mapa de la portada. Secuencial: el
// respaldo con Nominatim pide máximo 1 consulta por segundo (y queda en caché).
cargasRouter.get('/rutas', async (_req, res) => {
  const cargas = await prisma.carga.findMany({
    where: { estado: 'DISPONIBLE' },
    select: { id: true, origen: true, destino: true },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
  const rutas = [];
  for (const c of cargas) {
    const origen = await ubicarCiudad(c.origen);
    const destino = await ubicarCiudad(c.destino);
    if (origen && destino) rutas.push({ id: c.id, origen, destino });
  }
  res.json(rutas);
});

cargasRouter.get('/', optionalAuth, async (req, res) => {
  const { tipoPublicacion, vehiculoRequerido } = req.query;
  const cargas = await prisma.carga.findMany({
    where: {
      estado: 'DISPONIBLE',
      ...(tipoPublicacion ? { tipoPublicacion: String(tipoPublicacion) } : {}),
      ...(vehiculoRequerido ? { vehiculoRequerido: String(vehiculoRequerido) } : {}),
    },
    select: { ...cargaPublica, publicadorId: true },
    orderBy: [{ ejemplo: 'asc' }, { destacada: 'desc' }, { createdAt: 'desc' }],
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

// "san gil" / "SAN GIL" -> "San Gil"; los conectores quedan en minúscula
// ("Cartagena de Indias"). Así la lista, el buscador y el mapa ven un solo nombre.
const CONECTORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y']);
export function nombreCiudad(texto) {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && CONECTORES.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

// Recargo por tipo de carga: los mismos factores de app/src/data/mock.ts
// (MULTIPLICADORES_TIPO_CARGA). El formulario envía la etiqueta.
export const FACTOR_TIPO_CARGA = {
  'Carga Normal': 1.0,
  Refrigerada: 1.1,
  'Carga Peligrosa': 1.2,
  Semovientes: 1.15,
  'Carga Extrapesada': 1.25,
  'Carga Extradimensionada': 1.3,
  'Desechos Peligrosos': 1.3,
};

// Misma fórmula que muestra el formulario, para que el número coincida.
export function pisoLegal(tarifaPorTon, toneladas, tipoCarga) {
  return Math.round(tarifaPorTon * toneladas * FACTOR_TIPO_CARGA[tipoCarga]);
}

// Urbana y Barbacha son acarreos cortos (p. ej. San Gil → Socorro, ~45 km):
// más allá de 60 km por carretera es un viaje nacional y paga como tal.
export const KM_MAX_ACARREO = 60;
export const acarreoValido = (tipoPublicacion, km) => tipoPublicacion === 'NACIONAL' || km <= KM_MAX_ACARREO;
const ERROR_ACARREO = `Los acarreos urbanos y de barbacha son de máximo ${KM_MAX_ACARREO} km. Para un recorrido más largo, publícala como Nacional.`;

// El piso SICE-TAC no viene del navegador: si llega, zod lo descarta.
export const cargaSchema = z.object({
  titulo: z.string().min(3),
  tipoCarga: z.enum(Object.keys(FACTOR_TIPO_CARGA)),
  origen: z.string().min(2).transform(nombreCiudad),
  destino: z.string().min(2).transform(nombreCiudad),
  toneladas: z.number().positive(),
  precio: z.number().int().positive(),
  fechaCarga: z.string().datetime().or(z.string().min(8)),
  tipoPublicacion: z.enum(['NACIONAL', 'URBANA', 'BARBACHA']),
  vehiculoRequerido: z.string().min(2),
});

cargasRouter.post('/', requireAuth, requireTipo('PUBLICADOR'), async (req, res) => {
  const parsed = cargaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;

  let ruta;
  try {
    ruta = await calcularTarifaRuta(d.origen, d.destino);
  } catch (err) {
    console.error('Piso SICE-TAC al publicar:', err.message);
    return res.status(422).json({
      error: `No pudimos calcular la ruta ${d.origen} → ${d.destino}. Revisa los nombres de las ciudades e intenta de nuevo.`,
    });
  }
  if (!acarreoValido(d.tipoPublicacion, ruta.km)) {
    return res.status(422).json({ error: ERROR_ACARREO });
  }
  const pisoSiceTac = pisoLegal(ruta.tarifaPorTon, d.toneladas, d.tipoCarga);
  if (d.precio < pisoSiceTac) {
    return res.status(422).json({ error: 'El precio no puede estar por debajo del piso SICE-TAC' });
  }

  const publicador = await prisma.publicador.findUnique({ where: { usuarioId: req.user.sub } });
  const carga = await prisma.carga.create({
    data: { ...d, pisoSiceTac, fechaCarga: new Date(d.fechaCarga), publicadorId: publicador.id },
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
  // Pasar a acarreo exige que la ruta guardada sea corta.
  if (parsed.data.tipoPublicacion !== 'NACIONAL' && parsed.data.tipoPublicacion !== carga.tipoPublicacion) {
    const km = await calcularTarifaRuta(carga.origen, carga.destino).then((r) => r.km).catch(() => null);
    if (km == null || !acarreoValido(parsed.data.tipoPublicacion, km)) {
      return res.status(422).json({ error: ERROR_ACARREO });
    }
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

// Contactos que el transportador ya pagó, aunque la carga ya no esté
// DISPONIBLE (cancelada o asignada): lo pagado no se pierde. Va antes de
// /:id para que Express no lo tome como un id.
cargasRouter.get('/mis-contactos', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
  const pagos = await prisma.pagoDesbloqueo.findMany({
    where: { transportadorId: transportador.id, estado: 'VERIFICADO' },
    select: {
      id: true,
      monto: true,
      carga: {
        select: {
          id: true,
          titulo: true,
          origen: true,
          destino: true,
          fechaCarga: true,
          estado: true,
          publicador: { select: { nombre: true, telefono: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(
    pagos.map(({ id, monto, carga: { publicador, ...carga } }) => ({ ...carga, pagoId: id, monto, contacto: publicador }))
  );
});

// Datos para la "Constancia de entrega de carga" imprimible (/constancia).
// Solo las dos partes de un desbloqueo pagado pueden verla: trae teléfonos y
// placa. La cédula no se guarda aquí -- se escribe a mano en el papel.
cargasRouter.get('/constancia/:pagoId', requireAuth, async (req, res) => {
  const pago = await prisma.pagoDesbloqueo.findUnique({
    where: { id: Number(req.params.pagoId) || 0 },
    select: {
      id: true,
      estado: true,
      createdAt: true,
      carga: {
        select: {
          id: true,
          titulo: true,
          tipoCarga: true,
          origen: true,
          destino: true,
          toneladas: true,
          precio: true,
          fechaCarga: true,
          vehiculoRequerido: true,
          publicador: { select: { usuarioId: true, nombre: true, ciudad: true, telefono: true } },
        },
      },
      transportador: { select: { usuarioId: true, nombre: true, ciudad: true, telefono: true, placa: true } },
    },
  });
  const esParte =
    pago && [pago.carga.publicador.usuarioId, pago.transportador.usuarioId].includes(req.user.sub);
  if (!esParte || pago.estado !== 'VERIFICADO') return res.status(404).json({ error: 'Constancia no encontrada' });

  const sinId = ({ usuarioId: _, ...datos }) => datos;
  const { publicador, ...carga } = pago.carga;
  res.json({
    numero: `DYC-${pago.id}`,
    fechaDesbloqueo: pago.createdAt,
    carga,
    publicador: sinId(publicador),
    transportador: sinId(pago.transportador),
  });
});

cargasRouter.get('/:id', optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  const carga = await prisma.carga.findUnique({
    where: { id },
    select: { ...cargaPublica, publicador: { select: { nombre: true, telefono: true, usuarioId: true } } },
  });
  if (!carga) return res.status(404).json({ error: 'Carga no encontrada' });
  // Al abrir el enlace compartido, el dueño ve sus botones (editar, reenviar).
  const esMia = req.user?.tipo === 'PUBLICADOR' && carga.publicador.usuarioId === req.user.sub;

  let desbloqueada = false;
  if (req.user?.tipo === 'TRANSPORTADOR') {
    const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
    const pago = await prisma.pagoDesbloqueo.findUnique({
      where: { cargaId_transportadorId: { cargaId: id, transportadorId: transportador.id } },
    });
    desbloqueada = pago?.estado === 'VERIFICADO';
  }

  const { publicador: { usuarioId: _usuarioId, ...publicador }, ...resto } = carga;
  res.json({ ...resto, desbloqueada, esMia, contacto: desbloqueada ? publicador : null });
});

cargasRouter.post('/:id/desbloqueo', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const cargaId = Number(req.params.id);
  const carga = await prisma.carga.findUnique({ where: { id: cargaId } });
  if (!carga) return res.status(404).json({ error: 'Carga no encontrada' });
  if (carga.ejemplo) return res.status(409).json({ error: 'Es una carga de ejemplo: no tiene un contacto real para desbloquear' });

  let transportador = await prisma.transportador.findUnique({
    where: { usuarioId: req.user.sub },
    include: { membresia: true },
  });

  // La placa va en el aviso al publicador. Las cuentas creadas antes de
  // pedirla en el registro la envían aquí, en su primer desbloqueo.
  if (req.body?.placa) {
    const placa = placaSchema.safeParse(req.body.placa);
    if (!placa.success) return res.status(400).json({ error: placa.error.issues[0].message });
    transportador = await prisma.transportador.update({
      where: { id: transportador.id },
      data: { placa: placa.data },
      include: { membresia: true },
    });
  }
  if (!transportador.placa) return res.status(400).json({ error: 'Registra la placa de tu vehículo' });

  const monto = tarifaDesbloqueo(carga.precio, transportador.membresia?.tipo, carga.tipoPublicacion);

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

  const appUrl = process.env.APP_URL ?? 'http://localhost:4000';

  // Acarreo: se paga con un crédito del paquete. Sin créditos, se compra el
  // paquete y el webhook desbloquea esta carga con el primero.
  if (esAcarreo(carga.tipoPublicacion)) {
    const previo = await prisma.pagoDesbloqueo.findUnique({
      where: { cargaId_transportadorId: { cargaId, transportadorId: transportador.id } },
    });
    const pago =
      previo?.estado === 'VERIFICADO'
        ? previo
        : await prisma.$transaction((tx) => usarCreditoAcarreo(tx, transportador.id, cargaId));
    if (pago) {
      if (pago !== previo) await avisarPublicador(pago.id);
      const [publicador, saldo] = await Promise.all([
        prisma.publicador.findUnique({ where: { id: carga.publicadorId }, select: { nombre: true, telefono: true } }),
        prisma.transportador.findUnique({ where: { id: transportador.id }, select: { creditosAcarreo: true } }),
      ]);
      return res.status(201).json({ monto: pago.monto, contacto: publicador, creditosAcarreo: saldo.creditosAcarreo });
    }

    const referencia = `paq-t${transportador.id}-c${cargaId}-${Date.now()}`;
    await prisma.compraPaquete.create({
      data: {
        transportadorId: transportador.id,
        cargaId,
        creditos: PAQUETE_ACARREO.creditos,
        monto: PAQUETE_ACARREO.precio,
        referencia,
      },
    });
    const checkoutUrl = urlCheckout({
      referencia,
      montoEnCentavos: PAQUETE_ACARREO.precio * 100,
      redirectUrl: `${appUrl}/?wompi_carga=${cargaId}`,
    });
    return res.status(201).json({ monto: PAQUETE_ACARREO.precio, checkoutUrl });
  }

  // Con costo: se manda a pagar a Wompi. El webhook (/api/webhooks/wompi) confirma
  // el pago y recién ahí queda VERIFICADO — ver GET /:id para el estado real.
  const referencia = `carga${cargaId}-t${transportador.id}-${Date.now()}`;
  await prisma.pagoDesbloqueo.upsert({
    where: { cargaId_transportadorId: { cargaId, transportadorId: transportador.id } },
    update: { monto, referencia, estado: 'PENDIENTE' },
    create: { cargaId, transportadorId: transportador.id, monto, referencia, estado: 'PENDIENTE' },
  });

  const checkoutUrl = urlCheckout({
    referencia,
    montoEnCentavos: monto * 100,
    redirectUrl: `${appUrl}/?wompi_carga=${cargaId}`,
  });

  res.status(201).json({ monto, checkoutUrl });
});
