import MapaColombia from '@/components/MapaColombia';
import NoticiaEnVivo from '@/components/NoticiaEnVivo';
import PanelCargas from '@/components/PanelCargas';

// Primera pantalla de la web: las ofertas (igual que en la app) a la izquierda,
// 25% más anchas que el mapa de la derecha (5fr : 4fr). En celular el mapa se
// oculta para que la lista y el titular queden arriba.
export default function PortadaCargas() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[5fr_4fr] lg:gap-8 lg:pt-10">
        <div className="min-w-0 animate-aparecer">
          <PanelCargas variante="web" />
        </div>
        <div className="relative z-10 hidden min-w-0 animate-aparecer [animation-delay:120ms] lg:block">
          <MapaColombia className="h-[560px]" />
          <div className="absolute inset-x-4 top-14 z-10">
            <NoticiaEnVivo className="shadow-suave" />
          </div>
          <div className="absolute -bottom-5 left-6 z-10 w-72 rounded-2xl bg-white p-4 shadow-elevada">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cobertura</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">32 departamentos · 1.122 municipios</p>
            <p className="mt-0.5 text-xs text-zinc-500">Calcula ruta y piso legal entre cualquier par de ciudades.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
