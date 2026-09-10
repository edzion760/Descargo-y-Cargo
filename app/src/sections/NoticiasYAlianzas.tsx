import { Radio, MapPin, Sparkles, Fuel, ShieldPlus, Wrench, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NOTICIAS, type Noticia } from '@/data/mock';

const TIPO_ESTILO: Record<Noticia['tipo'], { etiqueta: string; clase: string }> = {
  ACCIDENTE: { etiqueta: 'Accidente', clase: 'bg-red-500/15 text-red-400 border-red-500/30' },
  CIERRE_VIA: { etiqueta: 'Cierre de vía', clase: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  VIA_LIBRE: { etiqueta: 'Vía libre', clase: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CONDICION_CLIMA: { etiqueta: 'Clima', clase: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
};

const ALIANZAS = [
  { icono: Fuel, nombre: 'Combustible', texto: 'Descuentos geolocalizados en estaciones aliadas por ruta.' },
  { icono: ShieldPlus, nombre: 'Seguros', texto: 'Póliza de carga por viaje, contratada en 2 clics.' },
  { icono: CreditCard, nombre: 'Financiación', texto: 'Anticipo de fletes con aliado financiero regulado (próximamente).' },
  { icono: Wrench, nombre: 'Talleres', texto: 'Red de talleres y mantenimiento con tarifa preferencial.' },
];

export default function NoticiasYAlianzas() {
  return (
    <>
      {/* Noticias IA */}
      <section id="alertas" className="border-b border-zinc-800 bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Alertas de carretera</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Noticias de la vía, <span className="text-emerald-400">verificadas por IA</span>
              </h2>
              <p className="mt-3 text-zinc-400">
                Cada 15 minutos la IA evalúa fuentes públicas (INVÍAS, noticias, reportes), descarta
                rumores y geolocaliza el evento. Solo recibes alertas en tu radio de ruta.
              </p>
            </div>
            <Badge className="gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-400" variant="outline">
              <Sparkles className="h-3.5 w-3.5" /> Solo se publica con confianza ≥ 75%
            </Badge>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {NOTICIAS.map((n) => {
              const estilo = TIPO_ESTILO[n.tipo];
              return (
                <Card key={n.id} className="border-zinc-800 bg-zinc-900/60">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={estilo.clase}>{estilo.etiqueta}</Badge>
                      <span className="text-xs text-zinc-500">{n.hace}</span>
                    </div>
                    <h3 className="mt-3 font-semibold text-white">{n.titulo}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" /> {n.via} · {n.zona}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={n.confianza * 100} className="h-1.5 flex-1 bg-zinc-800" />
                      <span className="text-xs font-semibold text-zinc-300">{Math.round(n.confianza * 100)}%</span>
                      {n.verificada ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400">✓ Verificada IA</Badge>
                      ) : (
                        <Badge className="bg-zinc-700/50 text-zinc-300">Sin verificar</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <Radio className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-zinc-400">
              Los transportadores suscritos reciben estas alertas por push en un radio de 50 km de su
              ruta activa. Los reportes de la comunidad se cruzan con fuentes oficiales antes de publicarse.
            </p>
          </div>

          {/* Notificación geolocalizada de carga — apunte del fundador */}
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="rounded-2xl border border-emerald-500/30 bg-zinc-900 p-5 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-2xl">
                  🚛
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descargo & Cargo · ahora</p>
                    <span className="text-[10px] text-zinc-600">push</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Carga nueva en <span className="text-emerald-400">Bucaramanga, Santander</span>
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    28 ton · Tractocamión · $5.4M (sobre el piso SICE-TAC ✓) ·{' '}
                    <strong className="text-zinc-200">estás a 96 km</strong> — ¿la tomas?
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-600">
              Sí: si hay carga ofertada y vienes pasando a menos de 100 km, la notificación llega a tu celular.
              El radio es configurable (25 / 50 / 100 km) y solo se activa cuando marcas tu camión como "disponible".
            </p>
          </div>
        </div>
      </section>

      {/* Alianzas */}
      <section className="border-b border-zinc-800 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Ecosistema</p>
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
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
