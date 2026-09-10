import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLANES, formatCOP } from '@/data/mock';

export default function Membresias() {
  return (
    <section id="membresias" className="border-b border-zinc-800 bg-zinc-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Membresías</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Paga menos por desbloquear más</h2>
          <p className="mt-3 text-zinc-400">
            Un desbloqueo sin plan cuesta 4% del flete (mínimo $15.000). Con membresía,
            cada contacto te sale hasta en $9.900.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANES.map((plan) => (
            <Card
              key={plan.nombre}
              className={`relative border-zinc-800 bg-zinc-900/60 ${
                plan.destacado ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''
              }`}
            >
              {plan.destacado && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-zinc-950">
                  Más popular
                </Badge>
              )}
              <CardContent className="flex h-full flex-col p-6">
                <h3 className="text-lg font-semibold text-white">{plan.nombre}</h3>
                <p className="text-sm text-zinc-500">{plan.descripcion}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">
                    {plan.precio === 0 ? 'Gratis' : formatCOP(plan.precio)}
                  </span>
                  {plan.precio > 0 && <span className="text-sm text-zinc-500"> /mes</span>}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full font-semibold ${
                    plan.destacado
                      ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                      : 'border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                  }`}
                  variant={plan.destacado ? 'default' : 'outline'}
                >
                  {plan.precio === 0 ? 'Crear cuenta gratis' : `Empezar con ${plan.nombre}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Renovación automática cancelable en cualquier momento desde tu cuenta. Facturación electrónica DIAN incluida.
        </p>
      </div>
    </section>
  );
}
