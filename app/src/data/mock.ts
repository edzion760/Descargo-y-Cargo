// Datos de demostración — Descargo & Cargo 2.0 (prototipo visual)
// Las tarifas SICE-TAC aquí son REFERENCIALES para el demo, no oficiales.

export interface Carga {
  id: number;
  titulo: string;
  tipoCarga: string;
  origen: string;
  destino: string;
  toneladas: number;
  precio: number;
  pisoSiceTac: number;
  fechaCarga: string;
  tipoPublicacion: 'NACIONAL' | 'URBANA' | 'BARBACHA';
  vehiculoRequerido: string;
  destacada?: boolean;
  verificado: boolean;
}

export const CARGAS: Carga[] = [
  {
    id: 1,
    titulo: 'Café pergamino en sacos',
    tipoCarga: 'General',
    origen: 'Manizales',
    destino: 'Buenaventura',
    toneladas: 28,
    precio: 5600000,
    pisoSiceTac: 5320000,
    fechaCarga: '2026-07-28',
    tipoPublicacion: 'NACIONAL',
    vehiculoRequerido: 'Tractocamión',
    destacada: true,
    verificado: true,
  },
  {
    id: 2,
    titulo: 'Paletas de gaseosas',
    tipoCarga: 'General',
    origen: 'Bogotá',
    destino: 'Medellín',
    toneladas: 16,
    precio: 3100000,
    pisoSiceTac: 2960000,
    fechaCarga: '2026-07-26',
    tipoPublicacion: 'NACIONAL',
    vehiculoRequerido: 'Camión 3 ejes',
    verificado: true,
  },
  {
    id: 3,
    titulo: 'Aguacate Hass exportación',
    tipoCarga: 'Perecedera',
    origen: 'Rionegro',
    destino: 'Cartagena',
    toneladas: 22,
    precio: 4950000,
    pisoSiceTac: 4680000,
    fechaCarga: '2026-07-27',
    tipoPublicacion: 'NACIONAL',
    vehiculoRequerido: 'Refrigerado',
    destacada: true,
    verificado: true,
  },
  {
    id: 4,
    titulo: 'Material de construcción',
    tipoCarga: 'General',
    origen: 'Bogotá',
    destino: 'Tunja',
    toneladas: 8,
    precio: 890000,
    pisoSiceTac: 850000,
    fechaCarga: '2026-07-25',
    tipoPublicacion: 'URBANA',
    vehiculoRequerido: 'Camión 1 eje',
    verificado: false,
  },
  {
    id: 5,
    titulo: 'Arena de peña',
    tipoCarga: 'Agregados',
    origen: 'Sibaté',
    destino: 'Soacha',
    toneladas: 12,
    precio: 420000,
    pisoSiceTac: 400000,
    fechaCarga: '2026-07-25',
    tipoPublicacion: 'BARBACHA',
    vehiculoRequerido: 'Volqueta',
    verificado: true,
  },
  {
    id: 6,
    titulo: 'Fertilizante a granel',
    tipoCarga: 'Peligrosa',
    origen: 'Barranquilla',
    destino: 'Valledupar',
    toneladas: 25,
    precio: 4300000,
    pisoSiceTac: 4150000,
    fechaCarga: '2026-07-29',
    tipoPublicacion: 'NACIONAL',
    vehiculoRequerido: 'Estacas',
    verificado: true,
  },
];

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

export const PLANES = [
  {
    nombre: 'Gratis',
    precio: 0,
    descripcion: 'Explora el mercado',
    features: ['Ver listado de cargas', 'Alertas de carretera', 'Calculadora SICE-TAC'],
    destacado: false,
  },
  {
    nombre: 'Básica',
    precio: 99000,
    descripcion: '10 cargas / mes',
    features: [
      '10 contactos desbloqueados',
      'Descuento 10% en seguro de carga',
      'Notificaciones prioritarias',
      'Soporte por WhatsApp',
    ],
    destacado: false,
  },
  {
    nombre: 'Gold 2.0',
    precio: 179000,
    descripcion: '20 cargas / mes',
    features: [
      '20 contactos desbloqueados',
      'Descuento 15% en combustible aliado',
      'Descuento 15% en seguro de carga',
      'Alertas geolocalizadas a 100 km',
      'Insignia Gold en tu perfil',
    ],
    destacado: true,
  },
  {
    nombre: 'Ilimitada',
    precio: 249000,
    descripcion: 'Desbloqueos sin límite',
    features: [
      'Desbloqueos ilimitados',
      'Descuento 20% en combustible aliado',
      'Descuento 20% en seguro de carga',
      'Reporte RNDC asistido',
      'Soporte prioritario',
    ],
    destacado: false,
  },
];

export function formatCOP(valor: number): string {
  return '$' + valor.toLocaleString('es-CO');
}

// Cobro por uso sin plan: 4% del flete, mínimo $15.000 COP
export function tarifaDesbloqueo(precioCarga: number): number {
  return Math.max(Math.round(precioCarga * 0.04), 15000);
}
