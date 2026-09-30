import { createContext } from 'react';

// Acciones que se disparan desde varias secciones (navbar, hero, "para
// quién", CTA final, marketplace, membresías). Un solo proveedor monta UN
// AuthDialog y UN PublicarCargaDialog para toda la página, en vez de que
// cada sección tenga su propia copia de la misma lógica.
export interface AccionesCarga {
  publicar: () => void;
  soyTransportador: () => void;
  ingresar: () => void;
  registrarse: () => void;
  misContactos: () => void;
  // Abre la ventana de avisos al celular (desde un botón).
  activarAvisos: () => void;
  // La ofrece una sola vez por motivo (registro, primer viaje), y solo si el
  // celular puede activarlos y aún no están activos.
  ofrecerAvisos: (motivo: 'registro' | 'viaje') => void;
}

export const AccionesContext = createContext<AccionesCarga | null>(null);
