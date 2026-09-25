import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Lock,
  Phone,
  BadgeCheck,
  Pencil,
  Share2,
  Star,
  ShieldCheck,
  LayoutGrid,
  Route,
  Building2,
  Tractor,
  X,
  PackageSearch,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { formatCOP, tarifaDesbloqueo } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';
import EditarCargaDialog from '@/components/EditarCargaDialog';

interface Carga {
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
  destacada: boolean;
  verificado: boolean;
  desbloqueada: boolean;
  esMia: boolean;
}

interface Contacto {
  nombre: string;
  telefono: string;
}

export interface Busqueda {
  origen: string;
  destino: string;
}

const CATEGORIAS = [
  { valor: 'TODAS', etiqueta: 'Todas', icono: LayoutGrid },
  { valor: 'NACIONAL', etiqueta: 'Nacional', icono: Route },
  { valor: 'URBANA', etiqueta: 'Urbana', icono: Building2 },
  { valor: 'BARBACHA', etiqueta: 'Barbacha', icono: Tractor },
] as const;

const ETIQUETA_PUBLICACION: Record<Carga['tipoPublicacion'], string> = {
  NACIONAL: 'Nacional',
  URBANA: 'Urbana',
  BARBACHA: 'Barbacha',
};

// Literales completos: Tailwind solo genera clases que ve escritas tal cual.
const PALETAS = [
  'from-orange-100 to-amber-50',
  'from-sky-100 to-indigo-50',
  'from-emerald-100 to-teal-50',
  'from-rose-100 to-orange-50',
  'from-violet-100 to-sky-50',
  'from-lime-100 to-emerald-50',
];

// fechaCarga se guarda como medianoche UTC; formatearla en hora de Colombia
// (UTC-5) la corría un día hacia atrás ("27 jul" se veía "26 jul").
function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function sinTildes(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// "Foto" de la tarjeta sin fotos: la ruta dibujada, con un color estable por
// carga para que el listado se sienta vivo como uno de Airbnb.
function PortadaRuta({ carga }: { carga: Carga }) {
  const paleta = PALETAS[carga.id % PALETAS.length];
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${paleta}`}>
      <svg aria-hidden viewBox="0 0 400 300" className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
        <defs>
          <pattern id={`grid-${carga.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#09090b" strokeOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#grid-${carga.id})`} />
        <path d="M70 212 C 150 212, 190 96, 330 92" fill="none" stroke="#09090b" strokeOpacity="0.18" strokeWidth="10" strokeLinecap="round" />
        <path d="M70 212 C 150 212, 190 96, 330 92" fill="none" stroke="#09090b" strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round" />
        <circle cx="70" cy="212" r="9" fill="#fff" stroke="#09090b" strokeWidth="4" />
        <rect x="321" y="83" width="18" height="18" fill="#09090b" />
      </svg>
      <span className="absolute left-[8%] top-[76%] max-w-[46%] truncate rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-zinc-950 shadow-suave">
        {carga.origen}
      </span>
      {/* Bajo el cuadrado de destino (y=92..110 del viewBox), no arriba: arriba
          a la derecha va el botón de compartir. */}
      <span className="absolute right-[7%] top-[38%] max-w-[46%] truncate rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-bold text-white shadow-suave">
        {carga.destino}
      </span>
    </div>
  );
}

function TarjetaCarga({
  carga,
  onDesbloqueada,
  onRequireAuth,
  onEditar,
  onCancelada,
}: {
  carga: Carga;
  onDesbloqueada: (cargaId: number) => void;
  onRequireAuth: () => void;
  onEditar: (carga: Carga) => void;
  onCancelada: (cargaId: number) => void;
}) {
  const { autenticado, miId, tipo } = useAuth();
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tarifa = tarifaDesbloqueo(carga.precio);
  const sobrePiso = carga.precio - carga.pisoSiceTac;

  // Ya desbloqueada (p. ej. tras recargar la página): el listado no trae el
  // contacto, así que se pide al detalle en vez de mostrar un mensaje vacío.
  useEffect(() => {
    if (!carga.desbloqueada || contacto || !autenticado) return;
    let cancelado = false;
    apiFetch<{ contacto: Contacto | null }>(`/api/cargas/${carga.id}`)
      .then((data) => {
        if (!cancelado && data.contacto) setContacto(data.contacto);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [carga.desbloqueada, carga.id, contacto, autenticado]);

  async function desbloquear() {
    if (!autenticado) return onRequireAuth();
    if (tipo !== 'TRANSPORTADOR') {
      setError('Solo los transportadores pueden desbloquear contactos.');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const data = await apiFetch<{ monto: number; contacto?: Contacto; checkoutUrl?: string }>(
        `/api/cargas/${carga.id}/desbloqueo`,
        { method: 'POST' }
      );
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // paga en Wompi, vuelve a esta página
        return;
      }
      if (data.contacto) {
        setContacto(data.contacto);
        onDesbloqueada(carga.id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desbloquear el contacto');
    } finally {
      setCargando(false);
    }
  }

  async function cancelarPublicacion() {
    setCancelando(true);
    setError(null);
    try {
      await apiFetch(`/api/cargas/${carga.id}`, { method: 'DELETE' });
      toast.success('Publicación cancelada', { description: 'Ya no aparece en el marketplace.' });
      onCancelada(carga.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cancelar la publicación');
      setCancelando(false);
    }
  }

  function compartirWhatsApp() {
    const texto =
      `🚚 Carga disponible: ${carga.titulo}\n` +
      `${carga.origen} → ${carga.destino}\n` +
      `${carga.toneladas} ton · ${formatCOP(carga.precio)}\n\n` +
      `Publicada en Descargo & Cargo (piso SICE-TAC garantizado).\n` +
      `https://descargoycargo.com/#cargas`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  }

  const desbloqueada = carga.desbloqueada || !!contacto;

  return (
    <article className="group animate-aparecer">
      <div className="relative">
        <PortadaRuta carga={carga} />
        {carga.destacada && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-suave">
            <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" /> Destacada
          </span>
        )}
        <button
          type="button"
          onClick={compartirWhatsApp}
          aria-label={`Compartir "${carga.titulo}" por WhatsApp`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-suave transition hover:scale-105 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-suave">
          {ETIQUETA_PUBLICACION[carga.tipoPublicacion]}
        </span>
      </div>

      <div className="mt-3.5 space-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-semibold text-zinc-950">{carga.titulo}</h3>
          {carga.verificado && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-700">
              <BadgeCheck className="h-4 w-4 text-orange-500" /> Verificada
            </span>
          )}
        </div>
        <p className="truncate text-sm text-zinc-500">
          {carga.origen} → {carga.destino}
        </p>
        <p className="truncate text-sm text-zinc-500">
          {carga.toneladas} ton · {carga.tipoCarga} · {fechaCorta(carga.fechaCarga)}
        </p>
        <p className="truncate text-sm text-zinc-500">{carga.vehiculoRequerido}</p>
        <p className="pt-2 text-[15px] text-zinc-950">
          <span className="font-bold">{formatCOP(carga.precio)}</span> <span className="text-zinc-500">flete ofrecido</span>
        </p>
        <p className="flex items-center gap-1 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          {formatCOP(sobrePiso)} sobre el piso legal de {formatCOP(carga.pisoSiceTac)}
        </p>
      </div>

      <div className="mt-4">
        {carga.esMia ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEditar(carga)} className="flex-1 gap-1.5 border-zinc-300">
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmarCancelar(true)}
              disabled={cancelando}
              className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-600"
            >
              {cancelando ? 'Cancelando…' : 'Cancelar'}
            </Button>
          </div>
        ) : desbloqueada ? (
          <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            {miId != null && (
              <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden opacity-[0.07]">
                <span className="rotate-[-12deg] whitespace-nowrap text-xs font-bold tracking-widest text-emerald-900">
                  USUARIO-{miId} · USUARIO-{miId} · USUARIO-{miId}
                </span>
              </div>
            )}
            <p className="relative text-xs font-semibold uppercase tracking-wide text-emerald-800">Contacto desbloqueado</p>
            {contacto ? (
              <div className="relative mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-zinc-950">{contacto.nombre}</span>
                <a
                  href={`tel:${contacto.telefono}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  <Phone className="h-3.5 w-3.5" /> {contacto.telefono}
                </a>
              </div>
            ) : (
              <p className="relative mt-1 text-sm text-zinc-600">Cargando contacto…</p>
            )}
          </div>
        ) : (
          <Button onClick={desbloquear} disabled={cargando} className="h-11 w-full gap-2 rounded-xl font-semibold">
            {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {cargando ? 'Procesando…' : `Desbloquear contacto · ${formatCOP(tarifa)}`}
          </Button>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <AlertDialog open={confirmarCancelar} onOpenChange={setConfirmarCancelar}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>
              "{carga.titulo}" dejará de aparecer en el marketplace. Si necesitas cambiar la ruta o las
              toneladas, cancélala y publica una nueva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Volver</AlertDialogCancel>
            <AlertDialogAction onClick={cancelarPublicacion} className="rounded-xl bg-red-600 text-white hover:bg-red-500">
              Sí, cancelar publicación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function TarjetaEsqueleto() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-zinc-200" />
      <div className="mt-4 h-4 w-3/4 rounded-full bg-zinc-200" />
      <div className="mt-2.5 h-3.5 w-1/2 rounded-full bg-zinc-100" />
      <div className="mt-2 h-3.5 w-2/3 rounded-full bg-zinc-100" />
      <div className="mt-4 h-11 rounded-xl bg-zinc-100" />
    </div>
  );
}

export default function Marketplace({
  busqueda,
  onLimpiarBusqueda,
}: {
  busqueda: Busqueda | null;
  onLimpiarBusqueda: () => void;
}) {
  const [filtro, setFiltro] = useState<(typeof CATEGORIAS)[number]['valor']>('TODAS');
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargaEditando, setCargaEditando] = useState<Carga | null>(null);
  const { autenticado } = useAuth();
  const { ingresar } = useAcciones();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const query = filtro !== 'TODAS' ? `?tipoPublicacion=${filtro}` : '';
      const data = await apiFetch<Carga[]>(`/api/cargas${query}`);
      setCargas(data);
    } catch {
      setError('No pudimos cargar el listado. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    // autenticado no se usa dentro, pero al iniciar/cerrar sesión hay que
    // volver a pedir el listado: el backend cambia desbloqueada/esMia según
    // quién pregunta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, autenticado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Refresca el listado cuando se publica una carga nueva desde otra sección
  // sin necesitar un store global para algo tan puntual.
  useEffect(() => {
    window.addEventListener('cargas:publicada', cargar);
    return () => window.removeEventListener('cargas:publicada', cargar);
  }, [cargar]);

  // Al volver de pagar en Wompi (?wompi_carga=<id>): el webhook puede tardar
  // unos segundos en confirmar, así que se reintenta unas cuantas veces.
  const [verificandoPago, setVerificandoPago] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('wompi_carga')) return;
    window.history.replaceState({}, '', window.location.pathname);
    setVerificandoPago(true);

    let intentos = 0;
    const intervalo = setInterval(async () => {
      intentos += 1;
      await cargar();
      if (intentos >= 5) {
        clearInterval(intervalo);
        setVerificandoPago(false);
      }
    }, 2500);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibles = useMemo(() => {
    if (!busqueda) return cargas;
    const o = sinTildes(busqueda.origen);
    const d = sinTildes(busqueda.destino);
    return cargas.filter((c) => (!o || sinTildes(c.origen).includes(o)) && (!d || sinTildes(c.destino).includes(d)));
  }, [cargas, busqueda]);

  function marcarDesbloqueada(cargaId: number) {
    setCargas((prev) => prev.map((c) => (c.id === cargaId ? { ...c, desbloqueada: true } : c)));
  }

  function marcarCancelada(cargaId: number) {
    setCargas((prev) => prev.filter((c) => c.id !== cargaId));
  }

  const textoBusqueda = busqueda && [busqueda.origen || 'Cualquier origen', busqueda.destino || 'cualquier destino'].join(' → ');

  return (
    <section id="cargas" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">Cargas disponibles</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
              Publicar y ver el listado es gratis. Solo pagas cuando desbloqueas el contacto de la carga
              que te interesa.
            </p>
          </div>
          {!cargando && !error && (
            <p className="shrink-0 text-sm font-medium text-zinc-500">
              {visibles.length} {visibles.length === 1 ? 'carga' : 'cargas'}
            </p>
          )}
        </div>

        {/* Barra de categorías tipo Airbnb */}
        <div role="tablist" aria-label="Tipo de publicación" className="mt-8 flex gap-2 overflow-x-auto border-b border-zinc-200 [scrollbar-width:none]">
          {CATEGORIAS.map(({ valor, etiqueta, icono: Icono }) => {
            const activo = filtro === valor;
            return (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setFiltro(valor)}
                className={`-mb-px flex shrink-0 flex-col items-center gap-1.5 border-b-2 px-4 pb-3 pt-1 text-xs font-semibold transition-colors ${
                  activo ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800'
                }`}
              >
                <Icono className="h-6 w-6" strokeWidth={activo ? 2 : 1.6} />
                {etiqueta}
              </button>
            );
          })}
        </div>

        {busqueda && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Resultados para</span>
            <button
              type="button"
              onClick={onLimpiarBusqueda}
              className="flex items-center gap-2 rounded-full bg-zinc-950 py-1.5 pl-4 pr-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              {textoBusqueda}
              <X className="h-4 w-4" aria-label="Quitar búsqueda" />
            </button>
          </div>
        )}

        {verificandoPago && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-zinc-100 p-4 text-sm font-medium text-zinc-800">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando tu pago con Wompi…
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-zinc-200 p-8 text-center">
            <p className="text-sm text-zinc-700">{error}</p>
            <Button variant="outline" onClick={cargar} className="mt-4 rounded-full border-zinc-300">
              Reintentar
            </Button>
          </div>
        )}

        {!error && (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cargando
              ? Array.from({ length: 4 }, (_, i) => <TarjetaEsqueleto key={i} />)
              : visibles.map((carga) => (
                  <TarjetaCarga
                    key={carga.id}
                    carga={carga}
                    onDesbloqueada={marcarDesbloqueada}
                    onRequireAuth={ingresar}
                    onEditar={setCargaEditando}
                    onCancelada={marcarCancelada}
                  />
                ))}
          </div>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
              <PackageSearch className="h-7 w-7 text-zinc-700" />
            </div>
            <p className="mt-4 font-semibold text-zinc-950">
              {busqueda ? 'No hay cargas para esa ruta todavía' : 'No hay cargas en esta categoría todavía'}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Vuelve pronto: se publican cargas nuevas todo el tiempo.</p>
            {(busqueda || filtro !== 'TODAS') && (
              <Button
                variant="outline"
                onClick={() => {
                  onLimpiarBusqueda();
                  setFiltro('TODAS');
                }}
                className="mt-5 rounded-full border-zinc-300"
              >
                Ver todas las cargas
              </Button>
            )}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-zinc-500">
          El desbloqueo cobra el 4% del flete (mínimo $15.000 COP) vía Wompi: PSE, tarjeta o Nequi.
        </p>

        {/* Medidas de protección del contacto revelado (uso interno, no se le
            explica al cliente cómo funciona la seguridad):
            - Marca de agua con el ID del usuario sobre el contacto (ver
              TarjetaCarga más arriba) — sí es real y visible a propósito,
              actúa como disuasivo.
            - Cada desbloqueo queda registrado en PagoDesbloqueo, asociado a
              la cuenta y al pago.
            - Pendiente (no implementado, no anunciar): número enmascarado /
              llamadas por la plataforma, bloqueo de capturas en una futura
              app móvil. */}
      </div>

      <EditarCargaDialog
        open={cargaEditando != null}
        onOpenChange={(open) => {
          if (!open) setCargaEditando(null);
        }}
        carga={cargaEditando}
        onEditada={cargar}
      />
    </section>
  );
}
