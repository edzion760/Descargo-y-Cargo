import { useMemo, useState } from 'react';
import { Calculator, Scale, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RUTAS, MULTIPLICADORES_TIPO_CARGA, formatCOP } from '@/data/mock';

export default function Calculadora() {
  const [rutaIdx, setRutaIdx] = useState(0);
  const [toneladas, setToneladas] = useState(20);
  const [tipoCarga, setTipoCarga] = useState<string>('general');

  const resultado = useMemo(() => {
    const ruta = RUTAS[rutaIdx];
    const factor = MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.factor ?? 1;
    const piso = Math.round(ruta.tarifaPorTon * toneladas * factor);
    const justo = Math.round(piso * 1.08);
    const premium = Math.round(piso * 1.2);
    return { ruta, piso, justo, premium, max: premium };
  }, [rutaIdx, toneladas, tipoCarga]);

  const barra = (v: number) => `${Math.max((v / resultado.max) * 100, 8)}%`;

  return (
    <section id="calculadora" className="border-b border-zinc-800 bg-zinc-900/40 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Calculadora inteligente</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Precio justo, <span className="text-emerald-400">siempre legal</span>
          </h2>
          <p className="mt-3 text-zinc-400">
            Desde el Decreto 1017 de 2025, pactar un flete por debajo del mínimo SICE-TAC
            bloquea el despacho en el RNDC. Nuestra calculadora nunca te deja bajar del piso.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Controles */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-2 text-white">
                <Calculator className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold">Calcula tu flete</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Ruta</Label>
                <Select value={String(rutaIdx)} onValueChange={(v) => setRutaIdx(Number(v))}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-950 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                    {RUTAS.map((r, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {r.origen} → {r.destino} ({r.km} km)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Tipo de carga</Label>
                <Select value={tipoCarga} onValueChange={setTipoCarga}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-950 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                    {MULTIPLICADORES_TIPO_CARGA.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label} {t.factor > 1 && `(+${Math.round((t.factor - 1) * 100)}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-zinc-400">Toneladas</Label>
                  <span className="text-sm font-semibold text-white">{toneladas} ton</span>
                </div>
                <Slider
                  value={[toneladas]}
                  onValueChange={([v]) => setToneladas(v)}
                  min={1}
                  max={34}
                  step={1}
                />
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-500">
                Referencia: {formatCOP(resultado.ruta.tarifaPorTon)}/ton · {resultado.ruta.km} km ·
                tarifa SICE-TAC referencial (demo, no oficial)
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="flex h-full flex-col justify-center space-y-5 p-6">
              <div className="flex items-center gap-2 text-white">
                <Scale className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold">Tres precios, cero ilegalidad</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-emerald-400">🟢 Mínimo legal (piso SICE-TAC)</span>
                    <span className="font-bold text-white">{formatCOP(resultado.piso)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: barra(resultado.piso) }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-amber-400">🟡 Justo (mercado +8%)</span>
                    <span className="font-bold text-white">{formatCOP(resultado.justo)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: barra(resultado.justo) }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-orange-400">🔴 Premium (+20%)</span>
                    <span className="font-bold text-white">{formatCOP(resultado.premium)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: barra(resultado.premium) }} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-zinc-400">
                  Cualquier oferta por debajo de{' '}
                  <strong className="text-red-400">{formatCOP(resultado.piso)}</strong> es{' '}
                  <strong className="text-red-400">ilegal</strong> para esta operación y el RNDC
                  puede bloquear el despacho. La plataforma no permite publicarla.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
