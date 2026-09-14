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
  let fallidosSeguidos = 0;
  for (const p of pendientes) {
    const ok = await enviarInvitacionProspecto(p.email, { nombre: p.nombre ?? 'equipo', id: p.id });
    if (ok) {
      await prisma.prospecto.update({ where: { id: p.id }, data: { contactadoEn: new Date() } });
      enviados++;
      fallidosSeguidos = 0;
      if (enviados % 50 === 0) console.log(`${enviados}/${pendientes.length}...`);
    } else {
      // No marcamos contactadoEn: si no se marcara así, la próxima corrida
      // (idempotente) los saltaría para siempre creyendo que ya se enviaron.
      fallidosSeguidos++;
      // 5 fallos seguidos = típicamente cuota diaria de Resend agotada, no
      // un problema puntual de un correo -- seguir insistiendo solo quema
      // tiempo (y en el log, ruido) hasta que se reinicie mañana.
      if (fallidosSeguidos >= 5) {
        console.error(`Se cortó tras ${fallidosSeguidos} fallos seguidos (¿cuota diaria de Resend agotada?). Reintenta más tarde.`);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 550)); // ~2/seg, dentro del límite gratuito de Resend
  }

  console.log(`Listo: ${enviados} correos realmente enviados (de ${pendientes.length} intentados).`);
}

await main();
await prisma.$disconnect();
