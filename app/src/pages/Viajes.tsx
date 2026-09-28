import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Download, Loader2, Plus, Truck } from 'lucide-react';
import AccionesProvider from '@/components/AccionesProvider';
import Logo from '@/components/Logo';
import DetalleViaje from '@/components/viajes/DetalleViaje';
import NuevoViajeDialog from '@/components/viajes/NuevoViajeDialog';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/data/mock';
import { API_URL, ApiError, apiFetch } from '@/lib/api';
import { useAcciones } from '@/lib/use-acciones';
import { useAuth } from '@/lib/use-auth';
import { fechaCorta, totalGastos, type Viaje } from '@/lib/viajes';

// "Mis viajes y gastos" del transportador: cuánto le quedó de cada flete.
// ?carga=<id> (botón "Gastos del viaje" en Mis contactos) abre ese viaje,
// creándolo la primera vez.
export default function Viajes() {
  return (
    <AccionesProvider>
      <Contenido />
    </AccionesProvider>
  );
}

function Contenido() {
  const { autenticado, cargando, tipo } = useAuth();
  const { ingresar } = useAcciones();

  if (cargando) return <Centro><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></Centro>;
  if (!autenticado)
    return (
      <Centro>
        <p className="text-sm text-zinc-600">Ingresa con tu cuenta de transportador para ver tus viajes y gastos.</p>
        <Button onClick={ingresar}>Ingresar</Button>
      </Centro>
    );
  if (tipo !== 'TRANSPORTADOR')
    return (
      <Centro>
        <p className="text-sm text-zinc-600">El registro de gastos es para cuentas de transportador.</p>
        <Link to="/" className="text-sm font-semibold underline">Volver a Descargo &amp; Cargo</Link>
      </Centro>
    );
  return <Panel />;
}

function Centro({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">{children}</div>;
}

function Panel() {
  const [params, setParams] = useSearchParams();
  const [viajes, setViajes] = useState<Viaje[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abiertoId, setAbiertoId] = useState<number | null>(null);
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    const cargaId = params.get('carga');
    (async () => {
      if (cargaId) {
        const v = await apiFetch<Viaje>('/api/viajes', { method: 'POST', body: { cargaId: Number(cargaId) } });
        setAbiertoId(v.id);
        setParams({}, { replace: true });
      }
      setViajes(await apiFetch<Viaje[]>('/api/viajes'));
    })().catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus viajes'));
    // Solo al entrar: ?carga se consume una vez y se borra de la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mes = useMemo(() => {
    const clave = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).slice(0, 7);
    const delMes = (viajes ?? []).filter((v) => v.fecha.slice(0, 7) === clave);
    const fletes = delMes.reduce((s, v) => s + v.flete, 0);
    const gastos = delMes.reduce((s, v) => s + totalGastos(v), 0);
    return { viajes: delMes.length, fletes, gastos, nombre: new Date().toLocaleDateString('es-CO', { month: 'long', timeZone: 'America/Bogota' }) };
  }, [viajes]);

  const abierto = viajes?.find((v) => v.id === abiertoId);
  const reemplazar = (v: Viaje) => setViajes((vs) => vs?.map((x) => (x.id === v.id ? v : x)) ?? null);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/"><Logo /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!viajes && !error && (
          <p className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </p>
        )}

        {abierto ? (
          <DetalleViaje
            viaje={abierto}
            onCambio={reemplazar}
            onVolver={() => setAbiertoId(null)}
            onEliminado={() => {
              setViajes((vs) => vs?.filter((x) => x.id !== abierto.id) ?? null);
              setAbiertoId(null);
            }}
          />
        ) : (
          viajes && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Mis viajes y gastos</h1>
                  <p className="mt-1 text-sm text-zinc-600">Anota lo que gastas en cada viaje y mira cuánto te quedó del flete.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setNuevo(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Nuevo viaje
                  </Button>
                  {viajes.length > 0 && (
                    <Button asChild variant="outline" className="gap-2 border-zinc-300">
                      <a href={`${API_URL}/api/viajes/gastos.csv`}>
                        <Download className="h-4 w-4" /> Excel
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <section className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {mes.nombre} · {mes.viajes} {mes.viajes === 1 ? 'viaje' : 'viajes'}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Cifra etiqueta="Fletes" valor={formatCOP(mes.fletes)} />
                  <Cifra etiqueta="Gastos" valor={formatCOP(mes.gastos)} />
                  <Cifra etiqueta="Te quedaron" valor={formatCOP(mes.fletes - mes.gastos)} resaltar />
                </div>
              </section>

              {viajes.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
                  <Truck className="mx-auto h-8 w-8 text-zinc-400" />
                  <p className="mt-3 text-sm text-zinc-600">
                    Aún no tienes viajes. Crea uno con <strong>Nuevo viaje</strong>, o desde <strong>Mis contactos</strong> con el botón
                    “Gastos del viaje” de una carga que desbloqueaste.
                  </p>
                </div>
              ) : (
                <ul className="mt-6 grid grid-cols-1 gap-3">
                  {viajes.map((v) => {
                    const queda = v.flete - totalGastos(v);
                    return (
                      <li key={v.id}>
                        <button
                          onClick={() => setAbiertoId(v.id)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-suave transition hover:shadow-flotante"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-zinc-950">
                              {v.origen} → {v.destino}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {fechaCorta(v.fecha)} · {v.gastos.length} {v.gastos.length === 1 ? 'gasto' : 'gastos'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`font-bold tabular-nums ${queda >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              {formatCOP(queda)}
                            </p>
                            <p className="text-xs text-zinc-500">de {formatCOP(v.flete)}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )
        )}
      </main>

      <NuevoViajeDialog
        open={nuevo}
        onOpenChange={setNuevo}
        onCreado={(v) => {
          setViajes((vs) => [v, ...(vs ?? [])]);
          setAbiertoId(v.id);
        }}
      />
    </div>
  );
}

function Cifra({ etiqueta, valor, resaltar = false }: { etiqueta: string; valor: string; resaltar?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`truncate text-base font-extrabold tabular-nums sm:text-xl ${resaltar ? 'text-orange-400' : 'text-white'}`}>{valor}</p>
      <p className="text-xs text-zinc-400">{etiqueta}</p>
    </div>
  );
}
