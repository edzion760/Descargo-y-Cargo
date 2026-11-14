import { useCallback, useEffect, useState } from 'react';
import MapaColombia, { type RutaCarga } from '@/components/MapaColombia';
import NoticiaEnVivo from '@/components/NoticiaEnVivo';
import PanelCargas from '@/components/PanelCargas';
import { apiFetch } from '@/lib/api';

// Primera pantalla de la web: las ofertas (igual que en la app) a la izquierda,
// 25% más anchas que el mapa de la derecha (5fr : 4fr). El mapa dibuja las
// rutas reales de las cargas y resalta la que se señala en la lista. En
// celular el mapa se oculta para que la lista y el titular queden arriba.
export default function PortadaCargas() {
  const [rutas, setRutas] = useState<RutaCarga[]>([]);
  const [resaltada, setResaltada] = useState<number | null>(null);

  const cargarRutas = useCallback(() => {
    apiFetch<RutaCarga[]>('/api/cargas/rutas')
      .then(setRutas)
      .catch(() => {}); // sin rutas el mapa sigue con su ambiente ilustrativo
  }, []);

  useEffect(() => {
    cargarRutas();
    window.addEventListener('cargas:publicada', cargarRutas);
    return () => window.removeEventListener('cargas:publicada', cargarRutas);
  }, [cargarRutas]);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[5fr_4fr] lg:gap-8 lg:pt-10">
        <div className="min-w-0 animate-aparecer">
          <PanelCargas variante="web" onResaltar={setResaltada} />
        </div>
        <div className="relative hidden min-w-0 animate-aparecer [animation-delay:120ms] lg:block">
          {/* margenSuperior deja libre la franja de la leyenda y la noticia. */}
          <MapaColombia className="h-[560px]" rutas={rutas} resaltada={resaltada} margenSuperior={112} />
          <div className="absolute inset-x-3 top-14 z-10">
            <NoticiaEnVivo className="shadow-suave" />
          </div>
          {/* Una línea abajo a la derecha (ahí solo está Brasil): no tapa el país. */}
          <p className="absolute bottom-3 right-3 z-10 rounded-full bg-white/95 px-3.5 py-2 text-xs text-zinc-600 shadow-suave backdrop-blur">
            <span className="font-semibold text-zinc-950">Cobertura:</span> 32 departamentos · 1.122 municipios
          </p>
        </div>
      </div>
    </section>
  );
}
