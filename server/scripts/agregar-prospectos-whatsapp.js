// Empresas vistas activas HOY en el grupo de WhatsApp "Conductores Trans
// Carga" (publicando rutas/flyers esta semana) -- más valiosas que la base
// de 2023 porque su actividad es reciente y verificable.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nuevos = [
  {
    nombre: 'El Mundo de la Mudanza',
    tipoInteres: 'TRANSPORTADOR',
    telefonos: '3162822401',
    ciudad: 'Valledupar',
    sector: 'Mudanzas y trasteos',
  },
  {
    nombre: 'Amudar De Colombia SAS',
    tipoInteres: 'TRANSPORTADOR',
    telefonos: '3114808904',
    email: 'amudardecombia.mudanzas@gmail.com',
    ciudad: 'Bogotá',
    sector: 'Trasteos y mudanzas',
  },
  {
    nombre: 'Mudanzas y Fletes por Colombia (Yimy Hernandez)',
    tipoInteres: 'TRANSPORTADOR',
    telefonos: '3008761289',
    sector: 'Mudanzas y fletes',
  },
  {
    nombre: 'Grúas Moro',
    tipoInteres: 'TRANSPORTADOR',
    telefonos: '3108902939',
    sector: 'Grúas',
  },
  {
    nombre: 'Milan Cargo',
    tipoInteres: 'PUBLICADOR',
    telefonos: '3021169343',
    sector: 'Lácteos / refrigerados',
  },
];

for (const r of nuevos) {
  const yaExiste = await prisma.prospecto.findFirst({ where: { telefonos: { contains: r.telefonos } } });
  if (yaExiste) {
    console.log('Ya existía, se omite:', r.nombre);
    continue;
  }
  await prisma.prospecto.create({
    data: { ...r, fuente: 'WhatsApp Conductores Trans Carga 2026' },
  });
  console.log('Agregado:', r.nombre);
}

await prisma.$disconnect();
