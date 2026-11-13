import { formatCOP } from '@/data/mock';

// Enlaces para mandar por WhatsApp: una carga puntual (?carga=<id>, abre su
// ficha) e invitación a publicar (?publicar, abre el formulario).
const SITIO = 'https://descargoycargo.com';

export const ENLACE_PUBLICAR = `${SITIO}/?publicar`;

export function enlaceCarga(id: number) {
  return `${SITIO}/?carga=${id}`;
}

interface CargaParaCompartir {
  id: number;
  titulo: string;
  origen: string;
  destino: string;
  toneladas: number;
  precio: number;
}

// Abre WhatsApp con el mensaje listo; la persona elige a quién mandarlo
// (por ejemplo, transportadores que ya le han cargado).
export function compartirCargaWhatsApp(c: CargaParaCompartir) {
  const texto =
    `🚚 Carga disponible: ${c.titulo}\n` +
    `${c.origen} → ${c.destino}\n` +
    `${c.toneladas} ton · ${formatCOP(c.precio)}\n\n` +
    `Mírala y toma el contacto en Descargo & Cargo:\n${enlaceCarga(c.id)}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
}
