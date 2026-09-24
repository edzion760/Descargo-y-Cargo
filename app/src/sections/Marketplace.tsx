import { useEffect, useState, useCallback } from 'react';
import { Lock, LockOpen, MapPin, Weight, CalendarDays, Star, BadgeCheck, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCOP, tarifaDesbloqueo } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import AuthDialog from '@/components/AuthDialog';
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

function TarjetaCarga({
  carga,
  onDesbloqueada,
  onRequireAuth,
  onEditar,
  onCancelada,
}: {
  carga: Carga;
  onDesbloqueada: (cargaId: number, contacto: Contacto) => void;
  onRequireAuth: () => void;
  onEditar: (carga: Carga) => void;
  onCancelada: (cargaId: number) => void;
}) {
  const { autenticado, miId, tipo } = useAuth();
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
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
      setError('Solo los transportadores pueden desbloquear contactos');
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
        onDesbloqueada(carga.id, data.contacto);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desbloquear el contacto');
    } finally {
      setCargando(false);
    }
  }

  async function cancelarPublicacion() {
    if (!confirm('¿Cancelar esta publicación? Ya no aparecerá en el marketplace.')) return;
    setCancelando(true);
    setError(null);
    try {
      await apiFetch(`/api/cargas/${carga.id}`, { method: 'DELETE' });
      onCancelada(carga.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cancelar la publicación');
      setCancelando(false);
    }
  }

  const desbloqueada = carga.desbloqueada || !!contacto;

  return (
    <Card className={`relative overflow-hidden border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700 ${carga.destacada ? 'ring-1 ring-amber-500/40' : ''}`}>
      {carga.destacada && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-950">
          Destacada
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{carga.titulo}</h3>
              {carga.verificado && <BadgeCheck className="h-4 w-4 text-orange-400" />}
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">{carga.tipoCarga} · {carga.vehiculoRequerido}</p>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">{carga.tipoPublicacion}</Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
          <MapPin className="h-4 w-4 text-orange-400" />
          <span>{carga.origen}</span>
          <span className="text-zinc-600">→</span>
          <span>{carga.destino}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> {carga.toneladas} ton</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Carga: {new Date(carga.fechaCarga).toLocaleDateString('es-CO')}</span>
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" /> 4.8</span>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Flete ofrecido</p>
              <p className="text-xl font-bold text-white">{formatCOP(carga.precio)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Piso SICE-TAC</p>
              <p className="text-sm font-semibold text-orange-400">{formatCOP(carga.pisoSiceTac)} ✓</p>
              <p className="text-[10px] text-zinc-500">+{formatCOP(sobrePiso)} sobre el mínimo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {carga.esMia ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditar(carga)}
                className="gap-1.5 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelarPublicacion}
                disabled={cancelando}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                {cancelando ? 'Cancelando…' : 'Cancelar publicación'}
              </Button>
            </>
          ) : desbloqueada ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2">
              {miId != null && (
                <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden opacity-10">
                  <span className="rotate-[-15deg] whitespace-nowrap text-xs font-bold tracking-widest text-orange-200">
                    USUARIO-{miId} · USUARIO-{miId} · USUARIO-{miId}
                  </span>
                </div>
              )}
              <div className="relative flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold text-orange-300">Contacto desbloqueado</p>
                  <p className="text-xs text-zinc-400">
                    {contacto ? (
                      <>
                        {contacto.nombre} ·{' '}
                        <a href={`tel:${contacto.telefono}`} className="underline">
                          {contacto.telefono}
                        </a>
                      </>
                    ) : (
                      'Cargando contacto…'
                    )}
                  </p>
                </div>
                <LockOpen className="h-4 w-4 shrink-0 text-orange-400" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Lock className="h-4 w-4 text-zinc-600" />
                <span className="blur-sm select-none">+57 310 555 4521</span>
              </div>
              <Button
                size="sm"
                onClick={desbloquear}
                disabled={cargando}
                className="bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400"
              >
                {cargando ? 'Procesando…' : `Desbloquear · ${formatCOP(tarifa)}`}
              </Button>
            </>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}

export default function Marketplace() {
  const [filtro, setFiltro] = useState('TODAS');
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authAbierto, setAuthAbierto] = useState(false);
  const [cargaEditando, setCargaEditando] = useState<Carga | null>(null);
  const { autenticado } = useAuth();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const query = filtro !== 'TODAS' ? `?tipoPublicacion=${filtro}` : '';
      const data = await apiFetch<Carga[]>(`/api/cargas${query}`);
      setCargas(data);
    } catch {
      setError('No se pudo conectar con la API. ¿Está corriendo el servidor (server/) en el puerto 4000?');
    } finally {
      setCargando(false);
    }
  }, [filtro, autenticado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Refresca el listado cuando se publica una carga nueva desde otra sección
  // (Navbar / PanelInicio) sin necesitar un store global para algo tan puntual.
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

  function marcarDesbloqueada(cargaId: number) {
    setCargas((prev) => prev.map((c) => (c.id === cargaId ? { ...c, desbloqueada: true } : c)));
  }

  function marcarCancelada(cargaId: number) {
    setCargas((prev) => prev.filter((c) => c.id !== cargaId));
  }

  return (
    <section id="cargas" className="border-b border-zinc-800 bg-zinc-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Marketplace</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Cargas disponibles ahora</h2>
            <p className="mt-2 max-w-xl text-zinc-400">
              Publicar es gratis. Ver el listado es gratis. Solo pagas cuando encuentras
              la carga que quieres y desbloqueas el contacto.
            </p>
          </div>
          <Tabs value={filtro} onValueChange={setFiltro}>
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="TODAS">Todas</TabsTrigger>
              <TabsTrigger value="NACIONAL">Nacional</TabsTrigger>
              <TabsTrigger value="URBANA">Urbana</TabsTrigger>
              <TabsTrigger value="BARBACHA">Barbacha</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {cargando && <p className="mt-10 text-center text-sm text-zinc-500">Cargando cargas…</p>}
        {error && <p className="mt-10 text-center text-sm text-red-400">{error}</p>}
        {verificandoPago && (
          <p className="mt-10 text-center text-sm text-orange-400">Verificando tu pago con Wompi…</p>
        )}

        {!cargando && !error && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cargas.map((carga) => (
              <TarjetaCarga
                key={carga.id}
                carga={carga}
                onDesbloqueada={marcarDesbloqueada}
                onRequireAuth={() => setAuthAbierto(true)}
                onEditar={setCargaEditando}
                onCancelada={marcarCancelada}
              />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-zinc-600">
          * El desbloqueo cobra 4% del flete (mín. $15.000 COP) vía Wompi (PSE, tarjeta, Nequi) — en
          modo de pruebas mientras se lanza al público.
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

      <AuthDialog open={authAbierto} onOpenChange={setAuthAbierto} />
      <EditarCargaDialog
        open={cargaEditando != null}
        onOpenChange={(open) => { if (!open) setCargaEditando(null); }}
        carga={cargaEditando}
        onEditada={cargar}
      />
    </section>
  );
}
