import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireTipo } from '../middleware/auth.js';

export const membresiasRouter = Router();

export const PLANES = [
  {
    tipo: 'GRATIS',
    nombre: 'Gratis',
    precio: 0,
    descripcion: 'Explora el mercado',
    features: ['Ver listado de cargas', 'Alertas de carretera', 'Calculadora SICE-TAC'],
    destacado: false,
  },
  {
    tipo: 'BASICA',
    nombre: 'Básica',
    precio: 99000,
    descripcion: '10 cargas / mes',
    features: [
      '10 contactos desbloqueados',
      'Descuento 10% en seguro de carga',
      'Notificaciones prioritarias',
      'Soporte por WhatsApp',
    ],
    destacado: false,
  },
  {
    tipo: 'GOLD',
    nombre: 'Gold 2.0',
    precio: 179000,
    descripcion: '20 cargas / mes',
    features: [
      '20 contactos desbloqueados',
      'Descuento 15% en combustible aliado',
      'Descuento 15% en seguro de carga',
      'Alertas geolocalizadas a 100 km',
      'Insignia Gold en tu perfil',
    ],
    destacado: true,
  },
  {
    tipo: 'ILIMITADA',
    nombre: 'Ilimitada',
    precio: 249000,
    descripcion: 'Desbloqueos sin límite',
    features: [
      'Desbloqueos ilimitados',
      'Descuento 20% en combustible aliado',
      'Descuento 20% en seguro de carga',
      'Reporte RNDC asistido',
      'Soporte prioritario',
    ],
    destacado: false,
  },
];

membresiasRouter.get('/planes', (_req, res) => res.json(PLANES));

membresiasRouter.get('/actual', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const transportador = await prisma.transportador.findUnique({
    where: { usuarioId: req.user.sub },
    include: { membresia: true },
  });
  res.json(transportador.membresia);
});

// Todavía no hay cobro de membresías por Wompi. Antes este endpoint dejaba
// pasar a cualquier plan sin pagar -- y con ILIMITADA el desbloqueo cuesta
// $0 (ver tarifaDesbloqueo en cargas.js), o sea que cualquiera se saltaba el
// cobro por contacto. Hasta que exista el pago real, solo se permite GRATIS.
membresiasRouter.post('/actual', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const tipo = PLANES.find((p) => p.tipo === req.body?.tipo)?.tipo;
  if (!tipo) return res.status(400).json({ error: 'Plan inválido' });
  if (tipo !== 'GRATIS') {
    return res.status(403).json({ error: 'Los planes pagos estarán disponibles muy pronto.' });
  }

  const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
  const membresia = await prisma.membresia.update({
    where: { transportadorId: transportador.id },
    data: { tipo },
  });
  res.json(membresia);
});
