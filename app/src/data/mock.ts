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

// Configuración vehicular OFICIAL del RNDC (Registro Nacional de Despachos
// de Carga, Ministerio de Transporte) -- confirmado contra el dato abierto
// del propio RNDC (datos.gov.co, dataset v7bz-7nq2, campos
// cod_config_vehiculo/config_vehiculo), no inventado. Es la clasificación
// que se usa para el manifiesto RNDC y el piso SICE-TAC por eje.
export const CONFIGURACIONES_VEHICULO = [
  { codigo: 'CA', label: 'Camioneta (2 ejes)' },
  { codigo: '2', label: 'Camión rígido de 2 ejes' },
  { codigo: '3', label: 'Camión rígido de 3 ejes' },
  { codigo: '4', label: 'Camión rígido de 4 ejes' },
  { codigo: 'V2', label: 'Volqueta de 2 ejes' },
  { codigo: 'V3', label: 'Volqueta de 3 ejes' },
  { codigo: '2S1', label: 'Tractocamión 2 ejes + semirremolque 1 eje (2S1)' },
  { codigo: '2S2', label: 'Tractocamión 2 ejes + semirremolque 2 ejes (2S2)' },
  { codigo: '2S3', label: 'Tractocamión 2 ejes + semirremolque 3 ejes (2S3)' },
  { codigo: '3S1', label: 'Tractocamión 3 ejes + semirremolque 1 eje (3S1)' },
  { codigo: '3S2', label: 'Tractocamión 3 ejes + semirremolque 2 ejes (3S2)' },
  { codigo: '3S3', label: 'Tractomula: 3 ejes + semirremolque 3 ejes (3S3)' },
  { codigo: '3S4', label: 'Tractocamión 3 ejes + semirremolque 4+ ejes (3S4)' },
  { codigo: '2R2', label: 'Camión rígido 2 ejes + remolque 2 ejes (2R2)' },
  { codigo: '2R3', label: 'Camión rígido 2 ejes + remolque 3 ejes (2R3)' },
  { codigo: '3R2', label: 'Camión rígido 3 ejes + remolque 2 ejes (3R2)' },
  { codigo: '3R3', label: 'Camión rígido 3 ejes + remolque 3 ejes (3R3)' },
  { codigo: '4R2', label: 'Camión rígido 4 ejes + remolque 2 ejes (4R2)' },
  { codigo: '2B1', label: 'Camión rígido 2 ejes + remolque balanceado 1 eje (2B1)' },
  { codigo: '2B2', label: 'Camión rígido 2 ejes + remolque balanceado 2 ejes (2B2)' },
  { codigo: '3B3', label: 'Camión rígido 3 ejes + remolque balanceado 3 ejes (3B3)' },
] as const;

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
