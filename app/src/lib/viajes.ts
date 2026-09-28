import { API_URL, ApiError } from './api';

export interface Gasto {
  id: number;
  tipo: TipoGasto;
  valor: number;
  fecha: string;
  nota: string | null;
  recibo: string | null;
}

export interface Viaje {
  id: number;
  cargaId: number | null;
  origen: string;
  destino: string;
  descripcion: string | null;
  flete: number;
  fecha: string;
  gastos: Gasto[];
  carga: { titulo: string; pisoSiceTac: number } | null;
}

// Mismo orden y claves que TIPOS_GASTO en server/src/routes/viajes.js.
export const TIPOS_GASTO = {
  ACPM: 'ACPM',
  PEAJES: 'Peajes',
  COMIDA: 'Comida',
  HOSPEDAJE: 'Hospedaje',
  CARGUE: 'Cargue / descargue',
  TALLER: 'Llantas y taller',
  OTROS: 'Otros',
} as const;
export type TipoGasto = keyof typeof TIPOS_GASTO;

export const totalGastos = (v: Viaje) => v.gastos.reduce((s, g) => s + g.valor, 0);

// Los usuarios escriben "650.000" o "650000": se queda solo con los dígitos.
export const aPesos = (texto: string) => Number(texto.replace(/\D/g, '')) || 0;

// Fechas de viaje y gasto se guardan a medianoche UTC (solo importa el día).
export const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const urlRecibo = (gastoId: number) => `${API_URL}/api/viajes/gastos/${gastoId}/recibo`;

// La foto del celular pesa varios MB: se reduce a 1600 px y JPEG antes de
// subirla (el servidor acepta hasta 3 MB). createImageBitmap también abre
// las fotos HEIC del iPhone en Safari.
export async function subirRecibo(gastoId: number, archivo: File) {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, 1600 / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext('2d')!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  const jpeg = await new Promise<Blob>((ok, falla) =>
    lienzo.toBlob((b) => (b ? ok(b) : falla(new Error('No se pudo procesar la foto'))), 'image/jpeg', 0.75)
  );
  const res = await fetch(urlRecibo(gastoId), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'image/jpeg' },
    body: jpeg,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? 'No se pudo subir la foto');
  return data as Gasto;
}
