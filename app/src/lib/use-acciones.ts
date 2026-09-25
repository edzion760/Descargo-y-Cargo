import { useContext } from 'react';
import { AccionesContext } from './acciones-context';

export function useAcciones() {
  const ctx = useContext(AccionesContext);
  if (!ctx) throw new Error('useAcciones debe usarse dentro de <AccionesProvider>');
  return ctx;
}
