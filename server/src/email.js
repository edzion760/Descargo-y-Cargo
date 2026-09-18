// Correos transaccionales vía Resend (API HTTP simple, sin SDK -- fetch
// alcanza, mismo criterio que wompi.js y geo.js). Requiere RESEND_API_KEY y
// que descargoycargo.com esté verificado como dominio remitente en Resend;
// mientras tanto (sandbox), Resend solo entrega al correo de la cuenta.
//
// ponytail: si un correo falla, se registra y se sigue -- nunca debe
// bloquear un registro o un pago porque el envío de correo falló.

const REMITENTE = 'Descargo & Cargo <notificaciones@descargoycargo.com>';

// Devuelve si el envío realmente se entregó a Resend (2xx). Los llamadores
// transaccionales (registro, pago) ignoran el valor a propósito -- un correo
// caído nunca debe bloquear esos flujos. La campaña de prospectos sí lo usa:
// necesita saber qué marcar como contactado de verdad.
async function enviarCorreo({ para, asunto, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada -- correo no enviado:', asunto);
    return false;
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
    if (!res.ok) {
      console.error('Resend rechazó el correo:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('No se pudo enviar el correo:', err);
    return false;
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

// Campaña a Prospecto (empresas de la prospección 2023 + WhatsApp del
// gremio, ver server/scripts/normalizar_prospectos.py). HTML con tablas y
// estilos en línea a propósito -- Outlook de escritorio renderiza con el
// motor de Word y ignora flexbox/grid, así que el layout "bonito" del
// mockup (ver campana-email-muestra.html) se simplifica aquí para que
// llegue igual en cualquier cliente.
export function plantillaInvitacionProspecto({ nombre, id }) {
  const bajaUrl = `https://descargoycargo.com/api/prospectos/baja?id=${id}`;
  const visitaUrl = `https://descargoycargo.com/api/prospectos/visita?id=${id}`;
  return `
  <div style="max-width:520px;margin:0 auto;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" style="background:#09090b;padding:24px 28px" cellpadding="0" cellspacing="0"><tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:34px;height:34px;background:#f97316;border-radius:8px;text-align:center;vertical-align:middle;font-size:16px" title="Descargo &amp; Cargo">🚚</td>
        <td style="padding-left:10px;font-size:17px;font-weight:bold;color:#ffffff">Descargo &amp; Cargo</td>
      </tr></table>
    </td></tr></table>

    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">Para empresas que despachan carga</p>
      <h1 style="font-size:19px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">
        Hola ${nombre}, publiquen su carga gratis y elijan transportador verificado
      </h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 22px">
        Publicar en un grupo de WhatsApp significa recibir mensajes de cualquiera, sin saber si el
        vehículo o el conductor son reales. En <strong>Descargo &amp; Cargo</strong> cada transportador
        está verificado y tu carga nunca sale por debajo del piso legal SICE-TAC.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr>
        <td width="33%" style="background:#fafafa;border:1px solid #e4e4e7;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">400+</div>
          <div style="font-size:10px;color:#71717a;margin-top:2px">cargas / mes</div>
        </td>
        <td width="34%" style="background:#fafafa;border:1px solid #e4e4e7;border-left:none;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">100%</div>
          <div style="font-size:10px;color:#71717a;margin-top:2px">sobre piso SICE-TAC</div>
        </td>
        <td width="33%" style="background:#fafafa;border:1px solid #e4e4e7;border-left:none;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">15 min</div>
          <div style="font-size:10px;color:#71717a;margin-top:2px">crear tu cuenta</div>
        </td>
      </tr></table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px"><tr><td align="center">
        <a href="${visitaUrl}" style="display:inline-block;background:#f97316;color:#09090b;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 30px;border-radius:8px">Publicar mi carga gratis →</a>
        <p style="font-size:11px;color:#a1a1aa;margin:10px 0 0">Publicar y ver el listado no cuesta nada — solo pagan al desbloquear un contacto.</p>
      </td></tr></table>

      <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 22px" />

      <p style="font-size:11px;font-weight:bold;letter-spacing:.5px;text-transform:uppercase;color:#71717a;margin:0 0 12px">Lo que sigue pasando en un grupo de WhatsApp</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr>
        <td style="font-size:13px;color:#3f3f46;padding:0 10px 8px 0;vertical-align:top" width="50%">✕ No saben si el conductor es quien dice ser</td>
        <td style="font-size:13px;color:#3f3f46;padding:0 0 8px 0;vertical-align:top" width="50%">✕ Sin registro ni respaldo si algo sale mal</td>
      </tr><tr>
        <td style="font-size:13px;color:#3f3f46;padding:0 10px 0 0;vertical-align:top" width="50%">✕ Fletes sin ningún piso de referencia</td>
        <td style="font-size:13px;color:#3f3f46;padding:0;vertical-align:top" width="50%">✕ Cero trazabilidad del viaje</td>
      </tr></table>
    </td></tr></table>

    <table role="presentation" width="100%" style="background:#ffffff;border-top:1px solid #e4e4e7" cellpadding="0" cellspacing="0"><tr><td style="padding:20px 28px 30px">
      <p style="font-size:11px;color:#a1a1aa;margin:0 0 6px"><strong>Descargo &amp; Cargo SAS</strong> · NIT 901.563.460-9 · San Gil, Santander</p>
      <p style="font-size:11px;color:#a1a1aa;margin:0">Te escribimos porque tu empresa aparece en el registro público de transporte de carga. Si no quieres volver a recibir estos correos, <a href="${bajaUrl}" style="color:#71717a">haz clic aquí</a> y no te volvemos a escribir.</p>
    </td></tr></table>
  </div>`;
}

export function enviarInvitacionProspecto(para, datos) {
  return enviarCorreo({
    para,
    asunto: `${datos.nombre}, publiquen su carga gratis y elijan transportador verificado`,
    html: plantillaInvitacionProspecto(datos),
  });
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
