import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';

interface Plan {
  tipo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  features: string[];
  destacado: boolean;
}

export default function Membresias() {
  const { autenticado, tipo: tipoUsuario } = useAuth();
  const { registrarse } = useAcciones();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planActual, setPlanActual] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Plan[]>('/api/membresias/planes').then(setPlanes).catch(() => setPlanes([]));
  }, []);

  useEffect(() => {
    if (autenticado && tipoUsuario === 'TRANSPORTADOR') {
      apiFetch<{ tipo: string }>('/api/membresias/actual')
        .then((m) => setPlanActual(m.tipo))
        .catch(() => setPlanActual(null));
    } else {
      setPlanActual(null);
    }
  }, [autenticado, tipoUsuario]);

  async function elegirPlan(plan: Plan) {
    if (!autenticado) return registrarse();
    if (plan.precio > 0) return; // sin cobro real de membresías todavía, ver server/src/routes/membresias.js
    if (tipoUsuario !== 'TRANSPORTADOR') {
      toast.info('Las membresías son para transportadores', {
        description: 'Publicar carga es gratis y no necesita plan.',
      });
      return;
    }
    setCambiando(plan.tipo);
    try {
      await apiFetch('/api/membresias/actual', { method: 'POST', body: { tipo: plan.tipo } });
      setPlanActual(plan.tipo);
      toast.success(`Ahora tienes el plan ${plan.nombre}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo cambiar de plan');
    } finally {
      setCambiando(null);
    }
  }

  return (
    <section id="membresias" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-orange-600">Membresías para transportadores</p>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
            Paga menos por desbloquear más
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
            Sin plan, cada desbloqueo cuesta el 6% del flete (mínimo $15.000). Con Ilimitada, desbloquear es gratis.
          </p>
        </div>

        <div className="mx-auto mt-14 grid grid-cols-1 max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {planes.length === 0 &&
            Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[420px] animate-pulse rounded-[28px] bg-zinc-100" />)}
          {planes.map((plan) => {
            const oscuro = plan.destacado;
            const actual = planActual === plan.tipo;
            return (
              <div
                key={plan.nombre}
                className={`relative flex flex-col rounded-[28px] p-7 ${
                  oscuro ? 'bg-zinc-950 text-white shadow-elevada lg:-my-3 lg:py-10' : 'border border-zinc-200 bg-white'
                }`}
              >
                {oscuro && (
                  <span className="absolute -top-3 left-7 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                    Más popular
                  </span>
                )}
                <h3 className={`text-lg font-bold ${oscuro ? 'text-white' : 'text-zinc-950'}`}>{plan.nombre}</h3>
                <p className={`mt-0.5 text-sm ${oscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.descripcion}</p>
                <p className="mt-6">
                  <span className="text-[2.25rem] font-extrabold tracking-tight">
                    {plan.precio === 0 ? 'Gratis' : formatCOP(plan.precio)}
                  </span>
                  {plan.precio > 0 && <span className={`text-sm ${oscuro ? 'text-zinc-400' : 'text-zinc-500'}`}> /mes</span>}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${oscuro ? 'text-zinc-200' : 'text-zinc-700'}`}>
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${oscuro ? 'text-orange-400' : 'text-zinc-950'}`} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  onClick={() => elegirPlan(plan)}
                  disabled={cambiando === plan.tipo || actual || plan.precio > 0}
                  variant={oscuro ? 'secondary' : 'default'}
                  className={`mt-8 w-full ${oscuro ? 'bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-70' : ''}`}
                >
                  {actual
                    ? 'Tu plan actual'
                    : plan.precio > 0
                      ? 'Próximamente'
                      : cambiando === plan.tipo
                        ? 'Cambiando…'
                        : autenticado
                          ? 'Elegir Gratis'
                          : 'Crear cuenta gratis'}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-500">
          Los planes pagos se activan muy pronto. Mientras tanto, cada desbloqueo se paga por separado vía Wompi.
        </p>
      </div>
    </section>
  );
}
