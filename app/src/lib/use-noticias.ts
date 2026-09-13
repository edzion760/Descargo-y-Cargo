import { useEffect, useState } from 'react';
import { apiFetch } from './api';

export interface Noticia {
  id: number;
  tipo: 'ACCIDENTE' | 'CIERRE_VIA' | 'CONDICION_CLIMA' | 'VIA_LIBRE' | 'INFO';
  titulo: string;
  fuente: string;
  url: string;
  hace: string;
}

// Titulares reales de Google News (filtrados por palabras clave de vías/
// carreteras en el backend, ver server/src/noticias.js), no simulados. Si el
// backend no responde, se deja la lista vacía en vez de mostrar algo falso.
export function useNoticiasVia() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    apiFetch<Noticia[]>('/api/noticias/via')
      .then(setNoticias)
      .catch(() => setNoticias([]));
  }, []);

  return noticias;
}
