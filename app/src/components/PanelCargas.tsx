import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Check, Loader2, Map, Plus, Search, Tractor, Truck, X } from 'lucide-react';
import { TarjetaCarga, type Carga } from '@/sections/Marketplace';
import { sinTildes } from '@/lib/utils';
import EditarCargaDialog from '@/components/EditarCargaDialog';
import IconoMotocarguero from '@/components/IconoMotocarguero';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { formatCOP, VEHICULO_MOTOCARGUERO } from '@/data/mock';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';

// Lista compacta de ofertas con buscador y pestañas por tipo, como la app de
// 2022. La usan la pantalla de la app (pestañas fijas abajo) y la portada de
// la web (pestañas arriba, dentro de un contenedor junto al mapa).

const PESTANAS = [
  { valor: 'NACIONAL', etiqueta: 'Nacional', titulo: 'Ofertas a nivel nacional', icono: Map },
  { valor: 'URBANA', etiqueta: 'Urbana', titulo: 'Acarreos urbanos', icono: Building2 },
  { valor: 'BARBACHA', etiqueta: 'Barbacha', titulo: 'Acarreos de barbacha', icono: Tractor },
  { valor: 'MOTOCARGUERO', etiqueta: 'Carguero', titulo: 'Para motocargueros', icono: IconoMotocarguero },
] as const;

type Pestana = (typeof PESTANAS)[number]['valor'];

function consulta(pestana: Pestana) {
  return pestana === 'MOTOCARGUERO'
    ? `?vehiculoRequerido=${encodeURIComponent(VEHICULO_MOTOCARGUERO)}`
    : `?tipoPublicacion=${pestana}`;
}

function FilaCarga({ carga, onAbrir }: { carga: Carga; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="grid w-full grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-full bg-white px-4 py-3.5 text-left shadow-[0_2px_10px_rgb(0_0_0/0.08)] transition hover:shadow-[0_4px_14px_rgb(0_0_0/0.12)] active:scale-[0.99]"
    >
      <span className="truncate text-sm text-zinc-700">{carga.origen}</span>
      <span className="text-sm font-bold text-zinc-950">{formatCOP(carga.precio)}</span>
      <span className="truncate text-right text-sm text-zinc-700">{carga.destino}</span>
      <span className="flex items-center gap-1.5 pl-1">
        {carga.desbloqueada ? (
          <Check className="h-4 w-4 text-emerald-600" aria-label="Contacto desbloqueado" />
        ) : (
          <Truck className="h-4 w-4 text-zinc-400" aria-hidden />
        )}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-white">
          <Plus className="h-4 w-4" aria-label="Ver detalle" />
        </span>
      </span>
    </button>
  );
}

export default function PanelCargas({
  variante,
  verificandoPago = false,
}: {
  variante: 'app' | 'web';
  verificandoPago?: boolean;
}) {
  const [pestana, setPestana] = useState<Pestana>('NACIONAL');
  const [texto, setTexto] = useState('');
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [abierta, setAbierta] = useState<Carga | null>(null);
  const [editando, setEditando] = useState<Carga | null>(null);
  const { autenticado } = useAuth();
  const { publicar, ingresar } = useAcciones();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(false);
    try {
      setCargas(await apiFetch<Carga[]>(`/api/cargas${consulta(pestana)}`));
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
    // autenticado: al iniciar/cerrar sesión cambian desbloqueada/esMia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana, autenticado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Se avisa al publicar una carga o al confirmarse un pago de Wompi.
  useEffect(() => {
    window.addEventListener('cargas:publicada', cargar);
    return () => window.removeEventListener('cargas:publicada', cargar);
  }, [cargar]);

  const visibles = useMemo(() => {
    const t = sinTildes(texto);
    if (!t) return cargas;
    return cargas.filter((c) => sinTildes(`${c.origen} ${c.destino}`).includes(t));
  }, [cargas, texto]);

  const titulo = PESTANAS.find((p) => p.valor === pestana)!.titulo;

  function actualizar(cambio: (c: Carga) => Carga | null) {
    setCargas((prev) => prev.flatMap((c) => (c.id === abierta?.id ? [cambio(c)].filter((x): x is Carga => !!x) : [c])));
  }

  const buscador = (
    <label className="flex items-center gap-2 rounded-2xl bg-white px-4 shadow-[0_1px_4px_rgb(0_0_0/0.06)]">
      <Search className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar ciudad"
        aria-label="Buscar ciudad"
        className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
      />
      {texto && (
        <button type="button" onClick={() => setTexto('')} aria-label="Borrar búsqueda" className="text-zinc-500">
          <X className="h-5 w-5" />
        </button>
      )}
    </label>
  );

  const lista = (
    <>
      {verificandoPago && (
        <p className="flex items-center gap-2 rounded-2xl bg-zinc-100 p-3 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando tu pago con Wompi…
        </p>
      )}

      {cargas.some((c) => c.ejemplo) && (
        <p className="rounded-2xl bg-orange-50 px-4 py-3 text-xs text-zinc-700">
          <strong>Estamos arrancando:</strong> algunas cargas son de <strong>ejemplo</strong> y no se pueden desbloquear.
        </p>
      )}

      {cargando &&
        Array.from({ length: 6 }, (_, i) => <div key={i} aria-hidden className="h-[52px] animate-pulse rounded-full bg-zinc-200/70" />)}

      {!cargando && error && (
        <div className="py-10 text-center">
          <p className="text-sm text-zinc-600">No pudimos cargar las ofertas. Revisa tu conexión.</p>
          <Button variant="outline" onClick={cargar} className="mt-3 rounded-full">
            Reintentar
          </Button>
        </div>
      )}

      {!cargando && !error && visibles.map((c) => <FilaCarga key={c.id} carga={c} onAbrir={() => setAbierta(c)} />)}

      {!cargando && !error && visibles.length === 0 && (
        <div className="py-12 text-center">
          <p className="font-semibold">{texto ? `No hay ofertas para "${texto}"` : 'Todavía no hay ofertas aquí'}</p>
          <p className="mt-1 text-sm text-zinc-500">Se publican cargas nuevas todo el tiempo.</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {variante === 'app' ? (
        <>
          <main className="mx-auto max-w-xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-2">
            <h1 className="text-center text-2xl font-extrabold">{titulo}</h1>
            <div className="mt-4">{buscador}</div>
            <div className="mt-4 space-y-3">{lista}</div>
          </main>

          <nav
            aria-label="Tipo de carga"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          >
            <div className="mx-auto grid max-w-xl grid-cols-5 items-end">
              {[PESTANAS[0], PESTANAS[1], null, PESTANAS[3], PESTANAS[2]].map((p) =>
                p ? (
                  <button
                    key={p.valor}
                    type="button"
                    onClick={() => setPestana(p.valor)}
                    aria-current={pestana === p.valor ? 'page' : undefined}
                    className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                      pestana === p.valor ? 'text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    <p.icono className="h-6 w-6" strokeWidth={pestana === p.valor ? 2.2 : 1.7} />
                    {p.etiqueta}
                  </button>
                ) : (
                  <button
                    key="publicar"
                    type="button"
                    onClick={publicar}
                    className="flex flex-col items-center gap-1 pb-2.5 text-[11px] font-semibold text-zinc-950"
                  >
                    <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                      <Plus className="h-7 w-7" />
                    </span>
                    Publicar
                  </button>
                )
              )}
            </div>
          </nav>
        </>
      ) : (
        <div className="flex max-h-[520px] flex-col rounded-3xl lg:h-[560px] lg:max-h-none bg-zinc-50 p-4 ring-1 ring-zinc-200 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">{titulo}</h2>
            <Button onClick={publicar} size="sm" className="shrink-0 gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4" /> Publicar
            </Button>
          </div>

          <div role="tablist" aria-label="Tipo de carga" className="mt-3 grid grid-cols-4 gap-1 rounded-2xl bg-zinc-200/60 p-1">
            {PESTANAS.map((p) => (
              <button
                key={p.valor}
                type="button"
                role="tab"
                aria-selected={pestana === p.valor}
                onClick={() => setPestana(p.valor)}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition sm:flex-row sm:gap-1.5 sm:px-2 sm:py-2 sm:text-sm ${
                  pestana === p.valor ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                <p.icono className="h-4 w-4 shrink-0" />
                {p.etiqueta}
              </button>
            ))}
          </div>

          <div className="mt-3">{buscador}</div>
          <div className="-mx-1 mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto px-1 pb-1">{lista}</div>
        </div>
      )}

      <Drawer open={abierta != null} onOpenChange={(o) => !o && setAbierta(null)}>
        <DrawerContent className="mx-auto max-w-xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <DrawerTitle className="sr-only">Detalle de la carga</DrawerTitle>
          <DrawerDescription className="sr-only">Ruta, flete y contacto de la carga</DrawerDescription>
          <div className="max-h-[80vh] overflow-y-auto pt-4">
            {abierta && (
              <TarjetaCarga
                carga={abierta}
                onDesbloqueada={() => actualizar((c) => ({ ...c, desbloqueada: true }))}
                onRequireAuth={() => {
                  setAbierta(null);
                  ingresar();
                }}
                onEditar={(c) => {
                  setAbierta(null);
                  setEditando(c);
                }}
                onCancelada={() => {
                  actualizar(() => null);
                  setAbierta(null);
                }}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <EditarCargaDialog
        open={editando != null}
        onOpenChange={(o) => !o && setEditando(null)}
        carga={editando}
        onEditada={cargar}
      />
    </>
  );
}
