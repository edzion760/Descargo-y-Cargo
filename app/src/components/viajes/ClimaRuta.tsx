import { useEffect, useState } from 'react';
import { BellRing, CloudFog, CloudLightning, CloudRain, Loader2, Mountain } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiError, apiFetch } from '@/lib/api';
import { activarAlertasDeVia } from '@/lib/push';

interface Clima {
  deslizamientos: {
    fecha: string;
    alertas: { codigo: string; municipio: string; departamento: string; nivel: 'ALTA' | 'MODERADA'; lluvia3DiasMm: number }[];
  };
  clima: { hora: string; mm: number; tipo: 'TORMENTA' | 'LLUVIA_FUERTE' | 'NIEBLA'; lugar: string; departamento: string }[];
  fuentes: string;
}

const CLIMA = {
  TORMENTA: { texto: 'Tormenta', Icono: CloudLightning },
  LLUVIA_FUERTE: { texto: 'Lluvia fuerte', Icono: CloudRain },
  NIEBLA: { texto: 'Niebla', Icono: CloudFog },
} as const;

// Igual que titulo() en server/src/alertasClima.js: "SAN JOSÉ DE PARE" -> "San José de Pare".
const nombre = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s\-.])\p{L}/gu, (m) => m.toUpperCase())
    .replace(/(?<=\s)(De|Del|La|Las|Los|Y)(?=\s)/g, (m) => m.toLowerCase());
const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' });
const fechaIdeam = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// Alertas de deslizamiento (IDEAM) y pronóstico de lluvia (MET Norway) sobre
// la carretera real del viaje. El servidor hace el cruce; aquí solo se muestra.
export default function ClimaRuta({ origen, destino }: { origen: string; destino: string }) {
  const [datos, setDatos] = useState<Clima | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activando, setActivando] = useState(false);
  const [avisosActivos, setAvisosActivos] = useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  useEffect(() => {
    const q = new URLSearchParams({ origen, destino });
    apiFetch<Clima>(`/api/clima/ruta?${q}`)
      .then(setDatos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No pudimos consultar el clima de la ruta'));
  }, [origen, destino]);

  async function activarAvisos() {
    setActivando(true);
    try {
      await activarAlertasDeVia();
      setAvisosActivos(true);
      toast.success('Listo: te avisaremos en el celular', {
        description: 'Riesgo alto de derrumbes y lluvia fuerte en la ruta de tus viajes de hoy y mañana.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron activar los avisos');
    } finally {
      setActivando(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-suave">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-zinc-950">Clima y alertas en tu ruta</h2>
        {avisosActivos ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <BellRing className="h-3.5 w-3.5" /> Avisos activos
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={activarAvisos} disabled={activando} className="gap-1.5 border-zinc-300">
            {activando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
            Avisarme en el celular
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {!datos && !error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Consultando IDEAM y el pronóstico sobre la vía…
        </p>
      )}

      {datos && (
        <>
          {datos.deslizamientos.alertas.length === 0 && datos.clima.length === 0 && (
            <p className="mt-3 text-sm text-emerald-700">
              Sin alertas de derrumbe ni lluvia fuerte en tu ruta para las próximas 6 horas.
            </p>
          )}

          {datos.deslizamientos.alertas.length > 0 && (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Mountain className="h-3.5 w-3.5" /> Riesgo de derrumbes por lluvia
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-1.5">
                {datos.deslizamientos.alertas.map((a) => (
                  <li key={a.codigo} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-zinc-800">
                      {nombre(a.municipio)} <span className="text-zinc-400">· {nombre(a.departamento)}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        a.nivel === 'ALTA' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.nivel === 'ALTA' ? 'Alto' : 'Moderado'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {datos.clima.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Próximas 6 horas</p>
              <ul className="mt-2 grid grid-cols-1 gap-1.5">
                {datos.clima.map((c) => {
                  const { texto, Icono } = CLIMA[c.tipo];
                  return (
                    <li key={`${c.lugar}-${c.hora}`} className="flex items-center gap-2 text-sm text-zinc-800">
                      <Icono className="h-4 w-4 shrink-0 text-sky-700" />
                      <span className="min-w-0 truncate">
                        <strong>{texto}</strong> cerca de {nombre(c.lugar)} · {hora(c.hora)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
            Referencial: confirma el estado de la vía con las autoridades de tránsito. Alertas del IDEAM del{' '}
            {fechaIdeam(datos.deslizamientos.fecha)}. {datos.fuentes.replace(/^.*?Pronóstico: /, 'Pronóstico: ')}
          </p>
        </>
      )}
    </section>
  );
}
