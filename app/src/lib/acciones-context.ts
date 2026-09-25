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
}

export const AccionesContext = createContext<AccionesCarga | null>(null);
