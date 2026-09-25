import { Check, PackagePlus, Truck, Scale, ShieldCheck, Route, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcciones } from '@/lib/use-acciones';

// Bloques alternos texto/visual, como las secciones "Conduce" / "Viaja" de
// Uber. Los paneles visuales son composiciones con íconos a propósito: no hay
// fotos reales todavía y no se usan fotos de stock que parezcan clientes.
// Cuando lleguen fotos propias, basta con reemplazar el <Panel> por un <img>.

function Panel({ tono, children }: { tono: 'naranja' | 'gris'; children: React.ReactNode }) {
  return (
    <div
      className={`relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[28px] ${
        tono === 'naranja' ? 'bg-gradient-to-br from-orange-100 via-amber-50 to-white' : 'bg-gradient-to-br from-zinc-200 via-zinc-100 to-white'
      }`}
    >
      <svg aria-hidden className="absolute inset-0 h-full w-full text-zinc-950/[0.06]">
        <defs>
          <pattern id={`cuadricula-${tono}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#cuadricula-${tono})`} />
      </svg>
      {children}
    </div>
  );
}

function Chip({ icono: Icono, children }: { icono: typeof Check; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-flotante">
      <Icono className="h-4 w-4" /> {children}
    </span>
  );
}

function Bloque({
  eyebrow,
  titulo,
  puntos,
  cta,
  onCta,
  panel,
  invertido,
}: {
  eyebrow: string;
  titulo: string;
  puntos: string[];
  cta: string;
  onCta: () => void;
  panel: React.ReactNode;
  invertido?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={invertido ? 'lg:order-2' : ''}>{panel}</div>
      <div className={invertido ? 'lg:order-1' : ''}>
        <p className="text-sm font-semibold text-orange-600">{eyebrow}</p>
        <h3 className="mt-3 text-3xl font-extrabold leading-tight text-zinc-950 sm:text-[2.5rem]">{titulo}</h3>
        <ul className="mt-6 space-y-3.5">
          {puntos.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] leading-relaxed text-zinc-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <Button size="lg" onClick={onCta} className="mt-8">
          {cta}
        </Button>
      </div>
    </div>
  );
}

export default function ParaQuien() {
  const { publicar } = useAcciones();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:space-y-32">
        <Bloque
          eyebrow="Para empresas que despachan carga"
          titulo="Publica tu carga gratis y elige con quién viaja"
          puntos={[
            'Publicar y ver el listado no cuesta nada, nunca.',
            'La plataforma no te deja ofrecer un flete por debajo del piso legal SICE-TAC.',
            'Distancia real calculada para cualquier par de ciudades del país.',
          ]}
          cta="Publicar carga gratis"
          onCta={publicar}
          panel={
            <Panel tono="naranja">
              {/* Maqueta de la interfaz (sin datos de clientes): cómo se ve publicar. */}
              <div className="relative w-[80%] max-w-sm">
                <div className="rounded-3xl bg-white p-5 shadow-elevada">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
                      <PackagePlus className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-950">Tu carga</p>
                      <p className="truncate text-xs text-zinc-500">Origen → Destino</p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Publicada</span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3.5 py-3">
                      <span className="text-zinc-500">Piso SICE-TAC</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700"><Check className="h-3.5 w-3.5" /> Cumple</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3.5 py-3">
                      <span className="text-zinc-500">Costo de publicar</span>
                      <span className="font-bold text-zinc-950">$0</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-3 flex gap-2 sm:-right-8">
                  <Chip icono={Scale}>Piso legal</Chip>
                  <Chip icono={Route}>Ruta real</Chip>
                </div>
              </div>
            </Panel>
          }
        />
        <Bloque
          invertido
          eyebrow="Para transportadores"
          titulo="Encuentra carga cerca y cobra lo justo"
          puntos={[
            'Ve todas las cargas disponibles antes de pagar nada.',
            'Pagas solo cuando desbloqueas el contacto de la carga que te interesa.',
            'Recibe alertas de accidentes y cierres de vía cerca de ti.',
          ]}
          cta="Ver cargas disponibles"
          onCta={() => document.querySelector('#cargas')?.scrollIntoView({ behavior: 'smooth' })}
          panel={
            <Panel tono="gris">
              {/* Maqueta: una alerta de vía (función real, radio real de 50 km) y el desbloqueo. */}
              <div className="relative w-[80%] max-w-sm space-y-3">
                <div className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-elevada">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <BellRing className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-950">Alerta de vía</p>
                    <p className="text-xs text-zinc-500">Cierre reportado a menos de 50 km de ti</p>
                  </div>
                  <span className="ml-auto text-[11px] text-zinc-400">ahora</span>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-elevada">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                      <Truck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-950">Carga disponible</p>
                      <p className="text-xs text-zinc-500">Flete sobre el piso legal</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex h-10 items-center justify-center rounded-xl bg-zinc-950 text-xs font-semibold text-white">
                    Desbloquear contacto
                  </div>
                </div>
              </div>
            </Panel>
          }
        />
      </div>
    </section>
  );
}
