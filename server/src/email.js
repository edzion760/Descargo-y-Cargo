// Correos transaccionales vía Resend (API HTTP simple, sin SDK -- fetch
// alcanza, mismo criterio que wompi.js y geo.js). Requiere RESEND_API_KEY y
// que descargoycargo.com esté verificado como dominio remitente en Resend;
// mientras tanto (sandbox), Resend solo entrega al correo de la cuenta.
//
// ponytail: si un correo falla, se registra y se sigue -- nunca debe
// bloquear un registro o un pago porque el envío de correo falló.

const REMITENTE = 'Descargo & Cargo <notificaciones@descargoycargo.com>';

async function enviarCorreo({ para, asunto, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada -- correo no enviado:', asunto);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: para,
        subject: asunto,
        // Sin el <meta charset> algunos clientes (Gmail app) asumen Latin-1
        // y las tildes/ñ llegan como "�". El fragmento de cada plantilla
        // solo trae el <div>; aquí se envuelve en un documento completo.
        html: `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`,
      }),
    });
    if (!res.ok) console.error('Resend rechazó el correo:', res.status, await res.text());
  } catch (err) {
    console.error('No se pudo enviar el correo:', err);
  }
}

export function plantillaBienvenida({ nombre, tipo }) {
  const rol = tipo === 'PUBLICADOR' ? 'publicador de carga' : 'transportador';
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h1 style="color:#18181b">¡Bienvenido, ${nombre}!</h1>
      <p>Tu cuenta de ${rol} en <strong>Descargo &amp; Cargo</strong> ya está lista.</p>
      <p>Puedes ${tipo === 'PUBLICADOR' ? 'publicar tu primera carga' : 'buscar cargas disponibles'} ahora mismo en
        <a href="https://descargoycargo.com">descargoycargo.com</a>.</p>
      <p style="color:#71717a;font-size:12px">Descargo &amp; Cargo SAS · NIT 901.563.460-9</p>
    </div>`;
}

export function plantillaPagoConfirmado({ monto, carga }) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h1 style="color:#18181b">Pago confirmado</h1>
      <p>Tu desbloqueo de contacto para <strong>${carga}</strong> por $${monto.toLocaleString('es-CO')} COP fue confirmado.</p>
      <p>Ya puedes ver los datos de contacto en <a href="https://descargoycargo.com">descargoycargo.com</a>.</p>
      <p style="color:#71717a;font-size:12px">Descargo &amp; Cargo SAS · NIT 901.563.460-9</p>
    </div>`;
}

export function plantillaRecuperarPassword({ url }) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h1 style="color:#18181b">Recupera tu contraseña</h1>
      <p>Alguien (esperamos que hayas sido tú) pidió restablecer la contraseña de tu cuenta en Descargo &amp; Cargo.</p>
      <p><a href="${url}" style="background:#f97316;color:#09090b;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Elegir nueva contraseña</a></p>
      <p style="color:#71717a;font-size:12px">Este enlace vence en 1 hora. Si no fuiste tú, ignora este correo -- tu contraseña actual sigue funcionando.</p>
      <p style="color:#71717a;font-size:12px">Descargo &amp; Cargo SAS · NIT 901.563.460-9</p>
    </div>`;
}

export function enviarBienvenida(para, datos) {
  return enviarCorreo({ para, asunto: 'Bienvenido a Descargo & Cargo', html: plantillaBienvenida(datos) });
}

export function enviarPagoConfirmado(para, datos) {
  return enviarCorreo({ para, asunto: 'Pago confirmado — Descargo & Cargo', html: plantillaPagoConfirmado(datos) });
}

export function enviarRecuperarPassword(para, datos) {
  return enviarCorreo({
    para,
    asunto: 'Recupera tu contraseña — Descargo & Cargo',
    html: plantillaRecuperarPassword(datos),
  });
}
