// Semilla con los mismos datos de demo que hoy vive en app/src/data/mock.ts,
// para que el frontend pueda apuntar a la API real sin perder el contenido
// de la maqueta visual.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CARGAS = [
  { titulo: 'Café pergamino en sacos', tipoCarga: 'General', origen: 'Manizales', destino: 'Buenaventura', toneladas: 28, precio: 5600000, pisoSiceTac: 5320000, fechaCarga: '2026-07-28', tipoPublicacion: 'NACIONAL', vehiculoRequerido: 'Tractocamión', destacada: true, verificado: true },
  { titulo: 'Paletas de gaseosas', tipoCarga: 'General', origen: 'Bogotá', destino: 'Medellín', toneladas: 16, precio: 3100000, pisoSiceTac: 2960000, fechaCarga: '2026-07-26', tipoPublicacion: 'NACIONAL', vehiculoRequerido: 'Camión 3 ejes', verificado: true },
  { titulo: 'Aguacate Hass exportación', tipoCarga: 'Perecedera', origen: 'Rionegro', destino: 'Cartagena', toneladas: 22, precio: 4950000, pisoSiceTac: 4680000, fechaCarga: '2026-07-27', tipoPublicacion: 'NACIONAL', vehiculoRequerido: 'Refrigerado', destacada: true, verificado: true },
  { titulo: 'Material de construcción', tipoCarga: 'General', origen: 'Bogotá', destino: 'Tunja', toneladas: 8, precio: 890000, pisoSiceTac: 850000, fechaCarga: '2026-07-25', tipoPublicacion: 'URBANA', vehiculoRequerido: 'Camión 1 eje', verificado: false },
  { titulo: 'Arena de peña', tipoCarga: 'Agregados', origen: 'Sibaté', destino: 'Soacha', toneladas: 12, precio: 420000, pisoSiceTac: 400000, fechaCarga: '2026-07-25', tipoPublicacion: 'BARBACHA', vehiculoRequerido: 'Volqueta', verificado: true },
  { titulo: 'Fertilizante a granel', tipoCarga: 'Peligrosa', origen: 'Barranquilla', destino: 'Valledupar', toneladas: 25, precio: 4300000, pisoSiceTac: 4150000, fechaCarga: '2026-07-29', tipoPublicacion: 'NACIONAL', vehiculoRequerido: 'Estacas', verificado: true },
];

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const usuarioPublicador = await prisma.usuario.upsert({
    where: { email: 'publicador-demo@descargoycargo.co' },
    update: {},
    create: {
      email: 'publicador-demo@descargoycargo.co',
      passwordHash,
      tipo: 'PUBLICADOR',
      publicador: {
        create: { nombre: 'Comercializadora Demo S.A.S.', ciudad: 'Bogotá', telefono: '+57 310 555 4521' },
      },
    },
    include: { publicador: true },
  });

  await prisma.usuario.upsert({
    where: { email: 'transportador-demo@descargoycargo.co' },
    update: {},
    create: {
      email: 'transportador-demo@descargoycargo.co',
      passwordHash,
      tipo: 'TRANSPORTADOR',
      transportador: {
        create: {
          nombre: 'Juan Pérez',
          ciudad: 'Medellín',
          telefono: '+57 300 555 1234',
          membresia: { create: { tipo: 'GRATIS' } },
        },
      },
    },
  });

  for (const carga of CARGAS) {
    await prisma.carga.create({
      data: { ...carga, fechaCarga: new Date(carga.fechaCarga), publicadorId: usuarioPublicador.publicador.id },
    });
  }

  console.log('Seed completo. Cuentas demo (password: demo1234):');
  console.log('  publicador-demo@descargoycargo.co');
  console.log('  transportador-demo@descargoycargo.co');
}

main().finally(() => prisma.$disconnect());
