import { useState } from 'react';
import { ArrowUpRight, Bell, BellRing, Fuel, ShieldPlus, Wrench, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNoticiasVia, type Noticia } from '@/lib/use-noticias';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';
import { activarAlertasDeVia } from '@/lib/push';

const TIPO_ESTILO: Record<Noticia['tipo'], { etiqueta: string; punto: string }> = {
  ACCIDENTE: { etiqueta: 'Accidente', punto: 'bg-red-500' },
  CIERRE_VIA: { etiqueta: 'Cierre de vía', punto: 'bg-amber-500' },
  VIA_LIBRE: { etiqueta: 'Vía libre', punto: 'bg-emerald-500' },
  CONDICION_CLIMA: { etiqueta: 'Clima', punto: 'bg-sky-500' },
  INFO: { etiqueta: 'Vías', punto: 'bg-zinc-400' },
};

// Ninguna alianza está firmada todavía: se muestran como hoja de ruta, no
// como beneficio vigente.
const ALIANZAS = [
  { icono: Fuel, nombre: 'Combustible', texto: 'Descuentos en estaciones aliadas a lo largo de tu ruta.' },
  { icono: ShieldPlus, nombre: 'Seguros', texto: 'Póliza de carga por viaje, contratada en 2 clics.' },
  { icono: CreditCard, nombre: 'Financiación', texto: 'Anticipo de fletes con aliado financiero regulado.' },
  { icono: Wrench, nombre: 'Talleres', texto: 'Red de talleres y mantenimiento con tarifa preferencial.' },
];

export default function NoticiasYAlianzas() {
  const noticias = useNoticiasVia();
  const { autenticado, tipo } = useAuth();
  const { ingresar } = useAcciones();
  const [estadoAlertas, setEstadoAlertas] = useState<'inactivo' | 'cargando' | 'activo' | 'error'>('inactivo');
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null);

  async function activar() {
    if (!autenticado) return ingresar();
    setEstadoAlertas('cargando');
    setErrorAlertas(null);
    try {
      await activarAlertasDeVia();
      setEstadoAlertas('activo');
    } catch (err) {
      setEstadoAlertas('error');
      setErrorAlertas(err instanceof Error ? err.message : 'No se pudo activar');
    }
  }

  return (
    <>
      <section id="alertas" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-600">Alertas de carretera</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
              Lo que pasa en la vía, en tiempo real
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
              Titulares reales sobre cierres, accidentes y estado de las principales vías del país,
              actualizados automáticamente.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {noticias.length === 0 &&
              Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[116px] animate-pulse rounded-2xl bg-zinc-100" />)}
            {noticias.slice(0, 8).map((n) => {
              const estilo = TIPO_ESTILO[n.tipo];
              return (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noopener"
                  className="group flex flex-col rounded-2xl border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:shadow-flotante"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-zinc-800">
                      <span className={`h-2 w-2 rounded-full ${estilo.punto}`} /> {estilo.etiqueta}
                    </span>
                    <span className="text-zinc-500">{n.hace}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-semibold leading-snug text-zinc-950">{n.titulo}</h3>
                  <p className="mt-auto flex items-center gap-1 pt-3 text-sm text-zinc-500 group-hover:text-zinc-800">
                    {n.fuente} <ArrowUpRight className="h-3.5 w-3.5" />
                  </p>
                </a>
              );
            })}
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Titulares recopilados de medios colombianos por palabras clave de vías y carreteras — no son
            reportes oficiales de INVÍAS ni de la plataforma. Verifica siempre en la fuente citada.
          </p>

          {/* Alertas push reales, geolocalizadas: ver server/src/push.js */}
          <div className="relative mt-12 overflow-hidden rounded-[28px] bg-zinc-950 p-8 sm:p-12">
            <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <BellRing className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">Te avisamos si algo pasa cerca de ti</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
                  Si hay un accidente o un cierre a menos de 50 km, te llega una notificación aunque no tengas la
                  página abierta. Pide permiso de ubicación y de notificaciones.
                </p>
              </div>
              <div className="shrink-0">
                {tipo && estadoAlertas === 'activo' ? (
                  <p className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white">
                    <Bell className="h-4 w-4" /> Alertas activas
                  </p>
                ) : (
                  <Button
                    size="lg"
                    onClick={activar}
                    disabled={estadoAlertas === 'cargando'}
                    className="gap-2 bg-white text-zinc-950 hover:bg-zinc-200"
                  >
                    {estadoAlertas === 'cargando' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                    {!tipo ? 'Ingresa para activar alertas' : estadoAlertas === 'cargando' ? 'Activando…' : 'Activar alertas de vía'}
                  </Button>
                )}
                {errorAlertas && <p className="mt-3 max-w-xs text-xs text-red-400">{errorAlertas}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-orange-600">Ecosistema</p>
              <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
                Más que un listado de cargas
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                Estamos armando una red de aliados para que moverte por la plataforma te cueste menos que
                negociar por fuera.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-zinc-200/70 px-3.5 py-1.5 text-xs font-semibold text-zinc-700">
              Hoja de ruta
            </span>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ALIANZAS.map((a) => (
              <div key={a.nombre} className="rounded-[28px] bg-white p-7 shadow-suave">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <a.icono className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">Próximamente</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-zinc-950">{a.nombre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{a.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
