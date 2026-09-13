// Importa el JSON generado por normalizar_prospectos.py a la tabla Prospecto.
// Uso: node scripts/importar-prospectos.js <ruta-al-json>
// No crea cuentas de Usuario -- ver el comentario en schema.prisma sobre por qué.
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const ruta = process.argv[2];
if (!ruta) {
  console.error('Uso: node scripts/importar-prospectos.js <ruta-al-json>');
  process.exit(1);
}

const prisma = new PrismaClient();
const registros = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

let creados = 0;
for (const r of registros) {
  await prisma.prospecto.create({
    data: {
      nombre: r.nombre,
      tipoInteres: r.tipoInteres,
      fuente: r.fuente,
      telefonos: r.telefonos.join(','),
      email: r.email,
      nit: r.nit,
      direccion: r.direccion,
      ciudad: r.ciudad,
      departamento: r.departamento,
      sector: r.sector,
    },
  });
  creados++;
  if (creados % 500 === 0) console.log(`${creados}/${registros.length}...`);
}

console.log(`Importados ${creados} prospectos.`);
await prisma.$disconnect();
