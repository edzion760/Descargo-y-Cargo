import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireTipo } from '../middleware/auth.js';

export const membresiasRouter = Router();

export const PLANES = [
  { tipo: 'GRATIS', nombre: 'Gratis', precio: 0, descripcion: 'Explora el mercado' },
  { tipo: 'BASICA', nombre: 'Básica', precio: 99000, descripcion: '10 cargas / mes' },
  { tipo: 'GOLD', nombre: 'Gold 2.0', precio: 179000, descripcion: '20 cargas / mes' },
  { tipo: 'ILIMITADA', nombre: 'Ilimitada', precio: 249000, descripcion: 'Desbloqueos sin límite' },
];

membresiasRouter.get('/planes', (_req, res) => res.json(PLANES));

membresiasRouter.get('/actual', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const transportador = await prisma.transportador.findUnique({
    where: { usuarioId: req.user.sub },
    include: { membresia: true },
  });
  res.json(transportador.membresia);
});

// Simulado: cambia de plan sin pasarela de pago real todavía (ver Wompi en PLAN_INTEGRAL_V3.md §5).
membresiasRouter.post('/actual', requireAuth, requireTipo('TRANSPORTADOR'), async (req, res) => {
  const tipo = PLANES.find((p) => p.tipo === req.body?.tipo)?.tipo;
  if (!tipo) return res.status(400).json({ error: 'Plan inválido' });

  const transportador = await prisma.transportador.findUnique({ where: { usuarioId: req.user.sub } });
  const membresia = await prisma.membresia.update({
    where: { transportadorId: transportador.id },
    data: { tipo },
  });
  res.json(membresia);
});
