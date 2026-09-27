// Lee lo que traen los QR de los stands en ferias y lo convierte en campos
// de contacto para prellenar el formulario del panel admin. Formatos
// comunes: vCard (BEGIN:VCARD, el de "tarjeta de presentación digital"),
// MECARD (el de muchos generadores gratuitos), enlaces wa.me / tel: /
// mailto: y cualquier otra URL (web, Linktree). Lo que no se reconoce se
// deja en notas para no perder nada.

export interface ContactoQR {
  empresa: string;
  contacto: string;
  cargo: string;
  telefono: string;
  email: string;
  web: string;
  ciudad: string;
  notas: string;
}

const vacio = (): ContactoQR => ({ empresa: '', contacto: '', cargo: '', telefono: '', email: '', web: '', ciudad: '', notas: '' });

// Deja 10 dígitos para celulares colombianos (quita +57 / 57 inicial).
function soloTelefono(t: string) {
  return t.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');
}

function desescapar(v: string) {
  return v.replace(/\\([,;:\\])/g, '$1').replace(/\\n/gi, ' ').trim();
}

function leerVCard(texto: string): ContactoQR {
  const c = vacio();
  // Las líneas largas pueden venir "plegadas" (siguiente línea empieza con espacio).
  const lineas = texto.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  for (const linea of lineas) {
    const i = linea.indexOf(':');
    if (i < 0) continue;
    const clave = linea.slice(0, i).split(';')[0].split('.').pop()!.toUpperCase();
    const valor = linea.slice(i + 1);
    if (clave === 'FN') c.contacto = desescapar(valor);
    else if (clave === 'N' && !c.contacto) {
      const [apellido, nombre] = valor.split(';');
      c.contacto = desescapar([nombre, apellido].filter(Boolean).join(' '));
    } else if (clave === 'ORG') c.empresa = desescapar(valor.split(';')[0]);
    else if (clave === 'TITLE') c.cargo = desescapar(valor);
    else if (clave === 'TEL' && !c.telefono) c.telefono = soloTelefono(valor);
    else if (clave === 'EMAIL' && !c.email) c.email = desescapar(valor);
    else if (clave === 'URL' && !c.web) c.web = desescapar(valor);
    else if (clave === 'ADR' && !c.ciudad) c.ciudad = desescapar(valor.split(';')[3] ?? '');
    else if (clave === 'NOTE') c.notas = desescapar(valor);
  }
  return c;
}

function leerMeCard(texto: string): ContactoQR {
  const c = vacio();
  // MECARD:N:Pérez,Ana;TEL:3105551234;EMAIL:a@b.co;URL:...;ORG:...;;
  for (const parte of texto.slice('MECARD:'.length).split(/(?<!\\);/)) {
    const i = parte.indexOf(':');
    if (i < 0) continue;
    const clave = parte.slice(0, i).toUpperCase();
    const valor = desescapar(parte.slice(i + 1));
    if (clave === 'N') {
      const [apellido, nombre] = valor.split(',');
      c.contacto = [nombre, apellido].filter(Boolean).join(' ').trim();
    } else if (clave === 'ORG') c.empresa = valor;
    else if (clave === 'TEL' && !c.telefono) c.telefono = soloTelefono(valor);
    else if (clave === 'EMAIL' && !c.email) c.email = valor;
    else if (clave === 'URL' && !c.web) c.web = valor;
    else if (clave === 'ADR' && !c.ciudad) c.ciudad = valor;
    else if (clave === 'NOTE') c.notas = valor;
  }
  return c;
}

export function leerContactoQR(textoCrudo: string): ContactoQR {
  const texto = textoCrudo.trim();
  if (/^BEGIN:VCARD/i.test(texto)) return leerVCard(texto);
  if (/^MECARD:/i.test(texto)) return leerMeCard(texto);

  const c = vacio();
  const wa = texto.match(/^https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?\+?(\d{7,15})/i);
  if (wa) return { ...c, telefono: soloTelefono(wa[1]) };
  if (/^tel:/i.test(texto)) return { ...c, telefono: soloTelefono(texto) };
  if (/^mailto:/i.test(texto)) return { ...c, email: texto.slice(7).split('?')[0] };
  if (/^https?:\/\//i.test(texto) || /^www\./i.test(texto)) return { ...c, web: texto };
  return { ...c, notas: texto };
}
