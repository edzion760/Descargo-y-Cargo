import { ArrowRight, ShieldCheck, Scale, Radio, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATS = [
  { valor: '400+', label: 'cargas publicadas / mes' },
  { valor: '100%', label: 'fletes sobre el piso legal' },
  { valor: '15 min', label: 'para crear tu cuenta' },
  { valor: '24/7', label: 'alertas de carretera IA' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col justify-center">
          <Badge className="mb-6 w-fit gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-400" variant="outline">
            <Scale className="h-3.5 w-3.5" />
            Nueva norma · Decreto 1017 de 2025: nosotros te dejamos legal
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Consigue carga.
            <br />
            Cobra lo <span className="text-orange-400">justo</span>.
            <br />
            Viaja <span className="text-orange-400">legal</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-zinc-400">
            El marketplace de transporte de carga de Colombia con piso tarifario{' '}
            <strong className="text-zinc-200">SICE-TAC garantizado</strong>, verificación de
            transportadores, manifiesto RNDC asistido y alertas de carretera verificadas por IA.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2 bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
              Soy transportador <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
              Publicar mi carga gratis
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.valor}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel visual derecho */}
        <div className="relative hidden items-center justify-center lg:flex">
          <div className="w-full max-w-md space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Viaje #4821 · En curso</p>
                    <p className="text-xs text-zinc-500">Bogotá → Medellín · 28 ton</p>
                  </div>
                </div>
                <Badge className="bg-orange-500/15 text-orange-400">RNDC OK</Badge>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-2/3 rounded-full bg-orange-500" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>GPS reportando tiempos · Decreto 1017</span>
                <span className="text-orange-400">66%</span>
              </div>
            </div>

            <div className="ml-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <Radio className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">⚠️ Accidente Ruta 45, km 67</p>
                  <p className="text-xs text-zinc-500">Verificado por IA · confianza 94% · a 18 km de tu ruta</p>
                </div>
              </div>
            </div>

            <div className="ml-16 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Flete pactado: $5.6M</p>
                  <p className="text-xs text-zinc-500">
                    Piso SICE-TAC: $5.32M · <span className="text-orange-400">+$280k sobre el mínimo legal ✓</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
