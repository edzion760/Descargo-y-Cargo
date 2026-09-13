// Corrige la clasificación: el usuario confirmó que estaba invertida --
// los 3.823 de "Empresas Trans" (registro MinTransporte) son PUBLICADOR y
// los 179 de "Empresas Publicar" son TRANSPORTADOR.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SQLite no tiene un swap atómico de dos valores en una sola sentencia
// simple -- se hace en dos pasos con un valor temporal para no chocar.
await prisma.$executeRaw`UPDATE Prospecto SET tipoInteres = 'TEMP' WHERE tipoInteres = 'TRANSPORTADOR'`;
await prisma.$executeRaw`UPDATE Prospecto SET tipoInteres = 'TRANSPORTADOR' WHERE tipoInteres = 'PUBLICADOR'`;
await prisma.$executeRaw`UPDATE Prospecto SET tipoInteres = 'PUBLICADOR' WHERE tipoInteres = 'TEMP'`;

const conteo = await prisma.prospecto.groupBy({ by: ['tipoInteres'], _count: true });
console.log(conteo);
await prisma.$disconnect();
