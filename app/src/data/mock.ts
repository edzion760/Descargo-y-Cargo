// Datos de referencia todavía sin modelar en el backend (server/) — las
// cargas y membresías ya vienen de la API real; ver
// src/sections/Marketplace.tsx y Membresias.tsx. Las noticias de vía ya son
// reales, ver server/src/noticias.js y src/lib/use-noticias.ts.
// (La lista fija RUTAS de 8 pares origen/destino se eliminó: tanto la
// Calculadora como Publicar carga calculan la ruta real para CUALQUIER
// ciudad vía /api/geo/ruta -- ver Calculadora.tsx y PublicarCargaDialog.tsx.)

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

// Categorías reales de NATURALEZACARGA del RNDC (datos.gov.co/resource/v7bz-7nq2),
// confirmadas por conteo real de despachos, no inventadas. Los factores (%)
// SÍ son una decisión de negocio nuestra -- MinTransporte no publica una
// tabla oficial de recargo por tipo de carga, solo el costo eficiente total
// que calcula su propia herramienta SICE-TAC.
export const MULTIPLICADORES_TIPO_CARGA = [
  { id: 'normal', label: 'Carga Normal', factor: 1.0 },
  { id: 'refrigerada', label: 'Refrigerada', factor: 1.1 },
  { id: 'peligrosa', label: 'Carga Peligrosa', factor: 1.2 },
  { id: 'semovientes', label: 'Semovientes', factor: 1.15 },
  { id: 'extrapesada', label: 'Carga Extrapesada', factor: 1.25 },
  { id: 'extradimensionada', label: 'Carga Extradimensionada', factor: 1.3 },
  { id: 'desechos-peligrosos', label: 'Desechos Peligrosos', factor: 1.3 },
] as const;

export function formatCOP(valor: number): string {
  return '$' + valor.toLocaleString('es-CO');
}

// Cobro por uso sin plan: 6% del flete, mínimo $15.000 y máximo $100.000 COP.
// Solo para mostrar el precio en la tarjeta: el cobro real lo calcula el
// servidor (server/src/routes/cargas.js) -- si cambia uno, cambiar el otro.
export function tarifaDesbloqueo(precioCarga: number): number {
  return Math.min(Math.max(Math.round(precioCarga * 0.06), 15000), 100000);
}
