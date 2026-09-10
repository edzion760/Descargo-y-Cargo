// Datos de referencia todavía sin modelar en el backend (server/) — rutas
// SICE-TAC y noticias de carretera son datos de referencia/IA, no datos de
// usuario, así que se quedan aquí por ahora. Las cargas y membresías ya
// vienen de la API real; ver src/sections/Marketplace.tsx y Membresias.tsx.
// Las tarifas SICE-TAC aquí son REFERENCIALES para el demo, no oficiales.

export interface Ruta {
  origen: string;
  destino: string;
  km: number;
  tarifaPorTon: number; // SICE-TAC referencial COP/ton (demo)
}

export const RUTAS: Ruta[] = [
  { origen: 'Bogotá', destino: 'Medellín', km: 415, tarifaPorTon: 185000 },
  { origen: 'Bogotá', destino: 'Cali', km: 460, tarifaPorTon: 198000 },
  { origen: 'Bogotá', destino: 'Barranquilla', km: 990, tarifaPorTon: 385000 },
  { origen: 'Medellín', destino: 'Buenaventura', km: 415, tarifaPorTon: 190000 },
  { origen: 'Manizales', destino: 'Buenaventura', km: 290, tarifaPorTon: 145000 },
  { origen: 'Bogotá', destino: 'Cartagena', km: 1050, tarifaPorTon: 402000 },
  { origen: 'Cali', destino: 'Pasto', km: 380, tarifaPorTon: 178000 },
  { origen: 'Bogotá', destino: 'Tunja', km: 138, tarifaPorTon: 106000 },
];

export const MULTIPLICADORES_TIPO_CARGA = [
  { id: 'general', label: 'General', factor: 1.0 },
  { id: 'perecedera', label: 'Perecedera / Refrigerada', factor: 1.1 },
  { id: 'peligrosa', label: 'Peligrosa', factor: 1.2 },
] as const;

export interface Noticia {
  id: number;
  tipo: 'ACCIDENTE' | 'CIERRE_VIA' | 'VIA_LIBRE' | 'CONDICION_CLIMA';
  titulo: string;
  via: string;
  zona: string;
  confianza: number;
  verificada: boolean;
  hace: string;
}

export const NOTICIAS: Noticia[] = [
  {
    id: 1,
    tipo: 'ACCIDENTE',
    titulo: 'Accidente de tractocamión, paso reducido a un carril',
    via: 'Ruta 45 · Bogotá–Medellín, km 67',
    zona: 'Cundinamarca',
    confianza: 0.94,
    verificada: true,
    hace: 'hace 12 min',
  },
  {
    id: 2,
    tipo: 'CIERRE_VIA',
    titulo: 'Cierre total por derrumbe, INVÍAS en el sitio',
    via: 'Vía al Llano, km 58',
    zona: 'Meta',
    confianza: 0.91,
    verificada: true,
    hace: 'hace 40 min',
  },
  {
    id: 3,
    tipo: 'CONDICION_CLIMA',
    titulo: 'Neblina densa, precaución en la Línea',
    via: 'Calarcá–La Línea',
    zona: 'Quindío / Tolima',
    confianza: 0.68,
    verificada: false,
    hace: 'hace 1 h',
  },
  {
    id: 4,
    tipo: 'VIA_LIBRE',
    titulo: 'Se reabre paso vehicular tras mantenimiento',
    via: 'Autopista Medellín–Bogotá, km 12',
    zona: 'Antioquia',
    confianza: 0.97,
    verificada: true,
    hace: 'hace 2 h',
  },
];

export function formatCOP(valor: number): string {
  return '$' + valor.toLocaleString('es-CO');
}

// Cobro por uso sin plan: 4% del flete, mínimo $15.000 COP
export function tarifaDesbloqueo(precioCarga: number): number {
  return Math.max(Math.round(precioCarga * 0.04), 15000);
}
