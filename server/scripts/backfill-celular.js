// Llena Usuario.celular en las cuentas creadas antes de poder entrar con el
// celular. Idempotente: solo toca cuentas activas sin celular. Si dos
// cuentas tienen el mismo número, lo conserva la más antigua (menor id); la
// otra sigue entrando con su correo.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const normalizar = (t) => (t ?? '').replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');

const usuarios = await prisma.usuario.findMany({
  where: { eliminadoEn: null, celular: null },
  orderBy: { id: 'asc' },
  select: { id: true, email: true, publicador: { select: { telefono: true } }, transportador: { select: { telefono: true } } },
});

for (const u of usuarios) {
  const celular = normalizar(u.publicador?.telefono ?? u.transportador?.telefono);
  if (!/^\d{7,10}$/.test(celular)) {
    console.log(`sin número válido: ${u.email}`);
    continue;
  }
  const dueño = await prisma.usuario.findUnique({ where: { celular }, select: { email: true } });
  if (dueño) {
    console.log(`${celular} ya es de ${dueño.email}; ${u.email} sigue entrando con correo`);
    continue;
  }
  await prisma.usuario.update({ where: { id: u.id }, data: { celular } });
  console.log(`${u.email} -> ${celular}`);
}
await prisma.$disconnect();
