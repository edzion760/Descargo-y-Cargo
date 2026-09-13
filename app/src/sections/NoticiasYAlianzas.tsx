import { useState } from 'react';
import { Radio, ExternalLink, Bell, Fuel, ShieldPlus, Wrench, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNoticiasVia, type Noticia } from '@/lib/use-noticias';
import { useAuth } from '@/lib/use-auth';
import { activarAlertasDeVia } from '@/lib/push';

const TIPO_ESTILO: Record<Noticia['tipo'], { etiqueta: string; clase: string }> = {
  ACCIDENTE: { etiqueta: 'Accidente', clase: 'bg-red-500/15 text-red-400 border-red-500/30' },
  CIERRE_VIA: { etiqueta: 'Cierre de vía', clase: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  VIA_LIBRE: { etiqueta: 'Vía libre', clase: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  CONDICION_CLIMA: { etiqueta: 'Clima', clase: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  INFO: { etiqueta: 'Vías', clase: 'bg-zinc-700/50 text-zinc-300 border-zinc-600/40' },
};

const ALIANZAS = [
  { icono: Fuel, nombre: 'Combustible', texto: 'Descuentos geolocalizados en estaciones aliadas por ruta.' },
  { icono: ShieldPlus, nombre: 'Seguros', texto: 'Póliza de carga por viaje, contratada en 2 clics.' },
  { icono: CreditCard, nombre: 'Financiación', texto: 'Anticipo de fletes con aliado financiero regulado (próximamente).' },
  { icono: Wrench, nombre: 'Talleres', texto: 'Red de talleres y mantenimiento con tarifa preferencial.' },
];

export default function NoticiasYAlianzas() {
  const noticias = useNoticiasVia();
  const { token, tipo } = useAuth();
  const [estadoAlertas, setEstadoAlertas] = useState<'inactivo' | 'cargando' | 'activo' | 'error'>('inactivo');
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null);

  async function activar() {
    if (!token) return;
    setEstadoAlertas('cargando');
    setErrorAlertas(null);
    try {
      await activarAlertasDeVia(token);
      setEstadoAlertas('activo');
    } catch (err) {
      setEstadoAlertas('error');
      setErrorAlertas(err instanceof Error ? err.message : 'No se pudo activar');
    }
  }

  return (
    <>
      {/* Noticias de vía */}
      <section id="alertas" className="border-b border-zinc-800 bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Alertas de carretera</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Noticias de la vía en Colombia</h2>
            <p className="mt-3 text-zinc-400">
              Titulares reales sobre cierres, accidentes y estado de las principales vías del país,
              actualizados automáticamente cada pocos minutos.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {noticias.length === 0 && (
              <p className="text-sm text-zinc-500 md:col-span-2">Cargando noticias de vía…</p>
            )}
            {noticias.map((n) => {
              const estilo = TIPO_ESTILO[n.tipo];
              return (
                <a key={n.id} href={n.url} target="_blank" rel="noopener" className="block">
                  <Card className="border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-600">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={estilo.clase}>{estilo.etiqueta}</Badge>
                        <span className="text-xs text-zinc-500">{n.hace}</span>
                      </div>
                      <h3 className="mt-3 font-semibold text-white">{n.titulo}</h3>
                      <p className="mt-2 flex items-center gap-1 text-sm text-zinc-500">
                        <ExternalLink className="h-3.5 w-3.5" /> {n.fuente}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <Radio className="h-5 w-5 shrink-0 text-orange-400" />
            <p className="text-sm text-zinc-400">
              Titulares recopilados de medios colombianos por palabras clave de vías y carreteras — no
              son reportes oficiales de INVÍAS ni de la Plataforma. Verifica siempre en la fuente citada.
            </p>
          </div>

          {/* Alertas push reales, geolocalizadas: ver server/src/push.js */}
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-orange-500/30 bg-zinc-900 p-5 text-center shadow-2xl">
            {!tipo ? (
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-white">Inicia sesión</span> para activar notificaciones cuando
                haya una alerta de vía a menos de 50 km de ti.
              </p>
            ) : estadoAlertas === 'activo' ? (
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-400">
                <Bell className="h-4 w-4" /> Alertas activas — te avisamos si hay algo a menos de 50 km
              </p>
            ) : (
              <>
                <Button
                  onClick={activar}
                  disabled={estadoAlertas === 'cargando'}
                  className="gap-2 bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400"
                >
                  <Bell className="h-4 w-4" />
                  {estadoAlertas === 'cargando' ? 'Activando…' : 'Activar alertas de vía cerca de mí'}
                </Button>
                <p className="mt-3 text-xs text-zinc-500">
                  Pide permiso de ubicación y de notificaciones del navegador. Si hay una noticia de vía a menos de
                  50 km de ti, te llega un aviso aunque no tengas la página abierta.
                </p>
                {errorAlertas && <p className="mt-2 text-xs text-red-400">{errorAlertas}</p>}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Alianzas */}
      <section className="border-b border-zinc-800 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Ecosistema</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Beneficios que se pierden al salirse</h2>
            <p className="mt-3 text-zinc-400">
              Nuestra respuesta a la fuga por WhatsApp: quien negocia por fuera pierde descuentos,
              seguro por viaje, historial de calificaciones y el soporte de cumplimiento RNDC.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ALIANZAS.map((a) => (
              <Card key={a.nombre} className="border-zinc-800 bg-zinc-900/60">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                    <a.icono className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{a.nombre}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{a.texto}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
