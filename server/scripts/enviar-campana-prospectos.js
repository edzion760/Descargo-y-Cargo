// Envía la invitación real a los Prospecto (PUBLICADOR, con email, que no
// hayan pedido baja ni hayan sido contactados ya -- idempotente, correr
// dos veces no duplica envíos).
//
// Uso:
//   node scripts/enviar-campana-prospectos.js --test tu@correo.com   (una sola prueba, no toca la BD)
//   node scripts/enviar-campana-prospectos.js --limit 20             (primeros 20, para un piloto real)
//   node scripts/enviar-campana-prospectos.js                        (todos los pendientes)
import { PrismaClient } from '@prisma/client';
import { enviarInvitacionProspecto } from '../src/email.js';

const prisma = new PrismaClient();
const args = process.argv.slice(2);

async function main() {
  const testArg = args.indexOf('--test');
  if (testArg !== -1) {
    const correo = args[testArg + 1];
    await enviarInvitacionProspecto(correo, { nombre: 'Transportes de Prueba S.A.S.', id: 0 });
    console.log('Correo de prueba enviado a', correo);
    return;
  }

  const limitArg = args.indexOf('--limit');
  const limite = limitArg !== -1 ? Number(args[limitArg + 1]) : undefined;

  const pendientes = await prisma.prospecto.findMany({
    where: { tipoInteres: 'PUBLICADOR', email: { not: null }, noContactar: false, contactadoEn: null },
    take: limite,
    orderBy: { id: 'asc' },
  });

  console.log(`Enviando a ${pendientes.length} prospectos...`);

  let enviados = 0;
  for (const p of pendientes) {
    await enviarInvitacionProspecto(p.email, { nombre: p.nombre ?? 'equipo', id: p.id });
    await prisma.prospecto.update({ where: { id: p.id }, data: { contactadoEn: new Date() } });
    enviados++;
    if (enviados % 50 === 0) console.log(`${enviados}/${pendientes.length}...`);
    await new Promise((r) => setTimeout(r, 550)); // ~2/seg, dentro del límite gratuito de Resend
  }

  console.log(`Listo: ${enviados} correos enviados.`);
}

await main();
await prisma.$disconnect();
