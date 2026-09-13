// Datos de referencia todavía sin modelar en el backend (server/) — las
// rutas SICE-TAC son de referencia, no datos de usuario, así que se quedan
// aquí por ahora. Las cargas y membresías ya vienen de la API real; ver
// src/sections/Marketplace.tsx y Membresias.tsx. Las noticias de vía ya son
// reales, ver server/src/noticias.js y src/lib/use-noticias.ts.
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

export function formatCOP(valor: number): string {
  return '$' + valor.toLocaleString('es-CO');
}

// Cobro por uso sin plan: 4% del flete, mínimo $15.000 COP
export function tarifaDesbloqueo(precioCarga: number): number {
  return Math.max(Math.round(precioCarga * 0.04), 15000);
}
