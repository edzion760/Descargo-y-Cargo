import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoticiaEnVivo from '@/components/NoticiaEnVivo';
import RutaInputs from '@/components/RutaInputs';
import { useAcciones } from '@/lib/use-acciones';

type Modo = 'carga' | 'transporte';

// Solo datos que se pueden sostener: publicar sí es gratis, el piso legal sí
// se exige en el backend (422 si el precio queda por debajo), y las alertas
// de vía sí son automáticas. Nada de "400+ cargas/mes" mientras no sea real.
const DATOS = [
  { valor: '$0', etiqueta: 'para publicar tu carga' },
  { valor: '100%', etiqueta: 'de fletes sobre el piso legal' },
  { valor: '5 min', etiqueta: 'para publicar tu primera carga' },
  { valor: '24/7', etiqueta: 'alertas de vía en vivo' },
];

export default function Hero({
  onCotizar,
  onBuscar,
}: {
  onCotizar: (origen: string, destino: string) => void;
  onBuscar: (origen: string, destino: string) => void;
}) {
  const [modo, setModo] = useState<Modo>('carga');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const { publicar, soyTransportador } = useAcciones();

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (modo === 'carga') onCotizar(origen.trim(), destino.trim());
    else onBuscar(origen.trim(), destino.trim());
  }

  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
        {/* min-w-0: sin esto, un titular largo en el chip "En vivo" (con
            truncate/nowrap) ensancha la columna del grid y aplasta el mapa. */}
        <div className="min-w-0 animate-aparecer">
          {/* En computador la noticia va dentro del mapa (PortadaCargas). */}
          <NoticiaEnVivo className="mb-6 lg:hidden" />

          <h1 className="text-[2.75rem] font-extrabold leading-[1.02] text-zinc-950 sm:text-6xl lg:text-[4.25rem]">
            Mueve tu carga por Colombia
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600">
            Publica gratis, encuentra transportador y nunca pactes un flete por debajo del
            piso legal SICE-TAC.
          </p>

          <div role="tablist" aria-label="¿Qué necesitas?" className="mt-8 inline-flex rounded-full bg-zinc-100 p-1">
            {(
              [
                ['carga', 'Tengo carga'],
                ['transporte', 'Soy transportador'],
              ] as const
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={modo === valor}
                onClick={() => setModo(valor)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  modo === valor ? 'bg-white text-zinc-950 shadow-suave' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-4 max-w-md space-y-3">
            <RutaInputs
              idPrefijo="hero"
              origen={origen}
              destino={destino}
              onOrigen={setOrigen}
              onDestino={setDestino}
              requerido={modo === 'carga'}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* sm:flex-1 y no flex-1: en columna (móvil), flex-1 pone la base de
                  ALTURA en 0 y los botones salían aplastados. */}
              <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto sm:flex-1">
                {modo === 'carga' ? 'Ver precio legal' : 'Buscar cargas'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={modo === 'carga' ? publicar : soyTransportador}
                className="w-full border-zinc-300 sm:w-auto sm:flex-1"
              >
                {modo === 'carga' ? 'Publicar gratis' : 'Crear mi cuenta'}
              </Button>
            </div>
          </form>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
            {['Publicar es gratis', 'Piso SICE-TAC garantizado', 'Distancias reales'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} /> {t}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* gap-px sobre fondo gris = líneas divisorias exactas en 2 o 4 columnas. */}
      <div className="border-y border-zinc-200">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-zinc-200 lg:grid-cols-4">
          {DATOS.map((d) => (
            <div key={d.etiqueta} className="bg-white px-4 py-6 sm:px-6 lg:py-8">
              <dt className="sr-only">{d.etiqueta}</dt>
              <dd className="text-3xl font-extrabold tracking-tight text-zinc-950">{d.valor}</dd>
              <dd className="mt-1 text-sm text-zinc-500">{d.etiqueta}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
