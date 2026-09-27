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
async function enviarCorreo({ para, asunto, html, responderA }) {
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
        // notificaciones@ no tiene buzón: si el correo invita a responder,
        // la respuesta debe llegar al correo de la empresa.
        ...(responderA ? { reply_to: responderA } : {}),
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

// Cabecera y pie compartidos por todas las plantillas transaccionales --
// mismo lenguaje visual que plantillaInvitacionProspecto (tabla+estilos en
// línea a propósito, ver comentario más abajo), para que un correo de
// registro/pago/recuperación se vea con el mismo nivel que el de campaña,
// no como un aviso de texto plano.
// Logo blanco sobre negro como imagen (app/public/email/logo.png, 500x96 = 2x para pantallas
// retina): un emoji o una fuente web se ven distinto en cada cliente de correo,
// la imagen se ve igual en todos. Si el cliente bloquea imágenes queda el alt.
function cabecera() {
  return `
    <table role="presentation" width="100%" style="background:#09090b" cellpadding="0" cellspacing="0"><tr><td style="padding:22px 28px">
      <img src="https://descargoycargo.com/email/logo.png" width="198" height="38" alt="Descargo &amp; Cargo" style="display:block;border:0;outline:none;text-decoration:none;font-size:18px;font-weight:bold;color:#ffffff">
    </td></tr></table>`;
}

function pie() {
  return `
    <table role="presentation" width="100%" style="background:#ffffff;border-top:1px solid #e4e4e7" cellpadding="0" cellspacing="0"><tr><td style="padding:18px 28px 26px">
      <p style="font-size:11px;color:#a1a1aa;margin:0">Descargo &amp; Cargo SAS · NIT 901.563.460-9 · San Gil, Santander</p>
    </td></tr></table>`;
}

function botonCTA(url, texto) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px"><tr><td align="center">
      <a href="${url}" style="display:inline-block;background:#f97316;color:#09090b;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 30px;border-radius:8px">${texto}</a>
    </td></tr></table>`;
}

// Pasos para pagar un desbloqueo sin perderse entre Wompi y Nequi. Va en la
// bienvenida del transportador (antes de su primer pago) y en el de pago
// confirmado (para el siguiente). La misma guía se muestra en la página antes
// de mandarlo a Wompi (Marketplace.tsx, ConfirmarPago).
function tipsPago(titulo) {
  const paso = (n, texto) => `
    <tr><td style="width:26px;vertical-align:top;padding:0 0 10px"><span style="display:inline-block;width:20px;height:20px;line-height:20px;border-radius:10px;background:#09090b;color:#ffffff;font-size:11px;font-weight:bold;text-align:center">${n}</span></td>
    <td style="font-size:13px;line-height:1.55;color:#3f3f46;padding:0 0 10px">${texto}</td></tr>`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 8px"><tr>
      <td style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:16px 18px">
        <p style="font-size:13px;font-weight:bold;color:#18181b;margin:0 0 12px">${titulo}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${paso(1, 'Si vas a pagar con <strong>Nequi</strong>, ten el celular a mano con la app de Nequi abierta.')}
          ${paso(2, 'Wompi te envía una notificación a Nequi. Ábrela (o entra a <strong>Notificaciones</strong>, la campanita de la app) y <strong>acepta el pago</strong> enseguida: la solicitud vence si esperas mucho.')}
          ${paso(3, 'No cierres la ventana de Wompi hasta que diga <strong>“¡Pago aprobado!”</strong>.')}
          ${paso(4, 'Tu contacto queda en <strong>Mis contactos</strong>: en descargoycargo.com, toca el menú de tu cuenta (arriba a la derecha) › Mis contactos.')}
        </table>
      </td>
    </tr></table>`;
}

export function plantillaBienvenida({ nombre, tipo }) {
  const esPublicador = tipo === 'PUBLICADOR';
  const rol = esPublicador ? 'publicador de carga' : 'transportador';
  return `
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}
    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">Cuenta creada</p>
      <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">¡Bienvenido, ${nombre}! 🎉</h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 4px">
        Tu cuenta de <strong>${rol}</strong> en Descargo &amp; Cargo ya está lista. Ya puedes
        ${esPublicador ? 'publicar tu primera carga gratis y elegir transportador verificado' : 'buscar cargas disponibles cerca de ti'}.
      </p>
      ${botonCTA('https://descargoycargo.com', esPublicador ? 'Publicar mi primera carga →' : 'Buscar cargas disponibles →')}
      ${esPublicador ? '' : tipsPago('Cuando desbloquees tu primer contacto')}
    </td></tr></table>
    ${pie()}
  </div>`;
}

export function plantillaPagoConfirmado({ monto, carga }) {
  return `
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}
    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#16a34a;margin:0 0 10px">Pago confirmado ✓</p>
      <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">Ya tienes el contacto desbloqueado</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 18px">
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">Carga</p>
          <p style="font-size:15px;font-weight:bold;color:#18181b;margin:0 0 10px">${carga}</p>
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">Monto pagado</p>
          <p style="font-size:18px;font-weight:800;color:#16a34a;margin:0">$${monto.toLocaleString('es-CO')} COP</p>
        </td>
      </tr></table>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:16px 0 0">
        El nombre y el teléfono del publicador quedaron guardados en <strong>Mis contactos</strong>.
        Tócalo abajo o, en descargoycargo.com, abre el menú de tu cuenta (arriba a la derecha) › <strong>Mis contactos</strong>.
        Ahí siguen aunque la carga se cierre.
      </p>
      ${botonCTA('https://descargoycargo.com/?mis_contactos', 'Ir a Mis contactos →')}
      ${tipsPago('Para tu próximo desbloqueo')}
    </td></tr></table>
    ${pie()}
  </div>`;
}

// Aviso al publicador cuando un transportador paga el desbloqueo de su carga.
// Solo nombre, ciudad y teléfono (nunca el documento). El transportador ve
// antes de pagar que estos datos se le comparten (Marketplace.tsx).
export function plantillaAvisoPublicador({ carga, transportador, pagoId }) {
  return `
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}
    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">Transportador interesado</p>
      <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">${transportador.nombre} desbloqueó tu carga</h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 16px">
        Pagó por tu contacto para la carga <strong>${carga}</strong>, así que probablemente te llame pronto. También puedes llamarlo tú.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr>
        <td style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:16px 18px">
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">Transportador</p>
          <p style="font-size:15px;font-weight:bold;color:#18181b;margin:0 0 10px">${transportador.nombre} · ${transportador.ciudad}</p>
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">Teléfono</p>
          <p style="font-size:18px;font-weight:800;margin:0 0 10px"><a href="tel:${transportador.telefono}" style="color:#ea580c;text-decoration:none">${transportador.telefono}</a></p>
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">Placa del vehículo (declarada por el transportador)</p>
          <p style="font-size:18px;font-weight:800;color:#18181b;letter-spacing:2px;margin:0">${transportador.placa}</p>
        </td>
      </tr></table>

      <p style="font-size:14px;font-weight:bold;color:#18181b;margin:22px 0 8px">Antes de entregar la carga</p>
      <p style="font-size:13px;line-height:1.6;color:#3f3f46;margin:0 0 4px">
        Pídele y revisa su licencia de conducción, SOAT, revisión técnico-mecánica y la tarjeta de propiedad.
        Confirma que la placa <strong>${transportador.placa}</strong> coincide con el vehículo que llega y consúltala en el RUNT.
      </p>
      ${botonCTA('https://www.runt.gov.co/consultaCiudadana/', 'Consultar placa en el RUNT →')}

      <p style="font-size:14px;font-weight:bold;color:#18181b;margin:22px 0 8px">Constancia de entrega</p>
      <p style="font-size:13px;line-height:1.6;color:#3f3f46;margin:0 0 4px">
        Descarga una constancia con los datos de la carga y del transportador, lista para imprimir y que ambos la
        firmen al cargar. Es un respaldo privado entre ustedes: no reemplaza el manifiesto.
      </p>
      ${botonCTA(`https://descargoycargo.com/constancia?pago=${pagoId}`, 'Descargar constancia de entrega →')}

      <p style="font-size:14px;font-weight:bold;color:#18181b;margin:22px 0 8px">Manifiesto de carga (RNDC)</p>
      <p style="font-size:13px;line-height:1.6;color:#3f3f46;margin:0 0 4px">
        Todo despacho de carga por carretera debe quedar registrado en el RNDC del Ministerio de Transporte con su
        manifiesto electrónico, que expide una empresa de transporte habilitada. Si el transportador trabaja con una
        empresa, pídele el número de manifiesto antes de cargar. Si ninguno de los dos tiene empresa, busquen una
        habilitada que expida el manifiesto: sin él, el vehículo no puede transitar legalmente con la carga.
      </p>
      ${botonCTA('https://rndc.mintransporte.gov.co/', 'Ir al portal RNDC →')}
      <p style="font-size:12px;line-height:1.6;color:#71717a;margin:8px 0 0">
        Mesa de ayuda RNDC: (601) 324 0800 opción 2 · rndc@mintransporte.gov.co
      </p>
    </td></tr></table>
    ${pie()}
  </div>`;
}

export function plantillaRecuperarPassword({ url }) {
  return `
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}
    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">Recuperar contraseña</p>
      <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">¿Olvidaste tu contraseña?</h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 4px">
        Alguien (esperamos que hayas sido tú) pidió restablecer la contraseña de tu cuenta en Descargo &amp; Cargo.
      </p>
      ${botonCTA(url, 'Elegir nueva contraseña →')}
      <p style="font-size:12px;color:#a1a1aa;margin:14px 0 0">Este enlace vence en 1 hora. Si no fuiste tú, ignora este correo — tu contraseña actual sigue funcionando.</p>
    </td></tr></table>
    ${pie()}
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
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}

    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">Para empresas que despachan carga</p>
      <h1 style="font-size:19px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">
        Hola ${nombre}, publiquen su carga gratis y sepan con quién la mueven
      </h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 14px">
        Publicar en un grupo de WhatsApp significa recibir mensajes de cualquiera, sin saber si el
        vehículo o el conductor son reales. En <strong>Descargo &amp; Cargo</strong> cada transportador se
        registra con su cédula y la placa de su vehículo, que ustedes pueden consultar en el RUNT antes de
        entregarle la carga, y ningún flete se publica por debajo del piso legal SICE-TAC.
      </p>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 22px">
        Les somos sinceros: la plataforma está recién lanzada y estamos buscando las primeras empresas que
        publiquen su carga. Por eso publicar es gratis, y cualquier comentario suyo nos ayuda a mejorarla.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr>
        <td width="33%" style="background:#fafafa;border:1px solid #e4e4e7;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">$0</div>
          <div style="font-size:10px;color:#71717a;margin-top:2px">publicar su carga</div>
        </td>
        <td width="34%" style="background:#fafafa;border:1px solid #e4e4e7;border-left:none;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">100%</div>
          <div style="font-size:10px;color:#71717a;margin-top:2px">sobre piso SICE-TAC</div>
        </td>
        <td width="33%" style="background:#fafafa;border:1px solid #e4e4e7;border-left:none;text-align:center;padding:14px 6px">
          <div style="font-size:17px;font-weight:800;color:#18181b">5 min</div>
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

// Carta individual a un expositor cuyo QR/tarjeta escaneamos en una feria.
// Se envía una sola vez, a mano desde el panel admin, con enlace de baja.
// Sin cifras ni promesas que no podamos sostener: la plataforma está arrancando.
export function plantillaCartaExpositor({ empresa, contacto, evento, id }) {
  const bajaUrl = `https://descargoycargo.com/api/prospectos/baja?id=${id}`;
  const visitaUrl = `https://descargoycargo.com/api/prospectos/visita?id=${id}`;
  const saludo = contacto ? `Hola ${contacto}` : `Hola, equipo de ${empresa}`;
  const paso = (n, titulo, texto) => `
    <tr><td style="width:30px;vertical-align:top;padding:0 0 14px"><span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:11px;background:#f97316;color:#09090b;font-size:12px;font-weight:bold;text-align:center">${n}</span></td>
    <td style="font-size:14px;line-height:1.55;color:#3f3f46;padding:0 0 14px"><strong style="color:#18181b">${titulo}</strong><br>${texto}</td></tr>`;
  return `
  <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif">
    ${cabecera()}
    <table role="presentation" width="100%" style="background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px 8px">
      <p style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ea580c;margin:0 0 10px">${evento}</p>
      <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0 0 14px;line-height:1.3">${saludo}, gracias por compartirnos su contacto</h1>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 14px">
        Pasamos por el stand de <strong>${empresa}</strong> en ${evento} y quisimos contarles, en pocas líneas,
        qué es Descargo &amp; Cargo: una plataforma colombiana para que las empresas que despachan mercancía
        publiquen su carga y encuentren transportador, sin pactar nunca un flete por debajo del piso legal SICE-TAC.
      </p>
      <p style="font-size:14px;line-height:1.65;color:#3f3f46;margin:0 0 20px">
        Les somos sinceros: la plataforma está recién lanzada y buscamos a las primeras empresas que la usen.
        Por eso publicar es gratis, y sus comentarios nos ayudan a mejorarla.
      </p>

      <p style="font-size:14px;font-weight:bold;color:#18181b;margin:0 0 12px">Cómo funciona</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${paso(1, 'Publican su carga gratis', 'Origen, destino, peso y fecha. La plataforma calcula la distancia real y no deja publicar por debajo del piso SICE-TAC.')}
        ${paso(2, 'Los transportadores la ven', 'Cada transportador se registra con su cédula y la placa de su vehículo. El que se interesa paga por ver su contacto; a ustedes no se les cobra nada.')}
        ${paso(3, 'Reciben un aviso para verificarlo', 'Les llega un correo con su nombre, teléfono y placa, un enlace para consultarla en el RUNT y una constancia de entrega lista para firmar.')}
      </table>

      ${botonCTA(visitaUrl, 'Publicar mi primera carga →')}
      <p style="font-size:13px;line-height:1.6;color:#71717a;margin:10px 0 0;text-align:center">
        ¿Preguntas? Respondan este correo y les escribimos de vuelta.
      </p>
    </td></tr></table>

    <table role="presentation" width="100%" style="background:#ffffff;border-top:1px solid #e4e4e7" cellpadding="0" cellspacing="0"><tr><td style="padding:20px 28px 30px">
      <p style="font-size:11px;color:#a1a1aa;margin:0 0 6px"><strong>Descargo &amp; Cargo SAS</strong> · NIT 901.563.460-9 · San Gil, Santander</p>
      <p style="font-size:11px;color:#a1a1aa;margin:0">Les escribimos una sola vez porque compartieron su contacto con nosotros en ${evento}. Si no quieren recibir más correos nuestros, <a href="${bajaUrl}" style="color:#71717a">hagan clic aquí</a> y no les volvemos a escribir.</p>
    </td></tr></table>
  </div>`;
}

export function enviarCartaExpositor(para, datos) {
  return enviarCorreo({
    para,
    asunto: `${datos.empresa}: así funciona Descargo & Cargo (nos vimos en ${datos.evento})`,
    html: plantillaCartaExpositor(datos),
    responderA: 'descargoycargo@gmail.com',
  });
}

export function enviarInvitacionProspecto(para, datos) {
  return enviarCorreo({
    para,
    asunto: `${datos.nombre}, publiquen su carga gratis y sepan con quién la mueven`,
    html: plantillaInvitacionProspecto(datos),
  });
}

export function enviarBienvenida(para, datos) {
  return enviarCorreo({ para, asunto: 'Bienvenido a Descargo & Cargo', html: plantillaBienvenida(datos) });
}

export function enviarPagoConfirmado(para, datos) {
  return enviarCorreo({ para, asunto: 'Pago confirmado — Descargo & Cargo', html: plantillaPagoConfirmado(datos) });
}

export function enviarAvisoPublicador(para, datos) {
  return enviarCorreo({
    para,
    asunto: `${datos.transportador.nombre} desbloqueó tu carga — Descargo & Cargo`,
    html: plantillaAvisoPublicador(datos),
  });
}

export function enviarRecuperarPassword(para, datos) {
  return enviarCorreo({
    para,
    asunto: 'Recupera tu contraseña — Descargo & Cargo',
    html: plantillaRecuperarPassword(datos),
  });
}
