import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  tipo: z.enum(['PUBLICADOR', 'TRANSPORTADOR']),
  nombre: z.string().min(2),
  ciudad: z.string().min(2),
  telefono: z.string().min(7),
});

function signToken(usuario) {
  return jwt.sign({ sub: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, tipo, nombre, ciudad, telefono } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      email,
      passwordHash,
      tipo,
      ...(tipo === 'PUBLICADOR'
        ? { publicador: { create: { nombre, ciudad, telefono } } }
        : {
            transportador: {
              create: { nombre, ciudad, telefono, membresia: { create: { tipo: 'GRATIS' } } },
            },
          }),
    },
  });

  res.status(201).json({ token: signToken(usuario), tipo: usuario.tipo });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  res.json({ token: signToken(usuario), tipo: usuario.tipo });
});
