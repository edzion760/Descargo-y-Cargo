import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ShieldCheck, Scale, Zap, TriangleAlert, Landmark, Loader2, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RutaInputs from '@/components/RutaInputs';
import { MULTIPLICADORES_TIPO_CARGA, formatCOP } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAcciones } from '@/lib/use-acciones';

interface TarifaRuta {
  km: number;
  tarifaPorTon: number;
}

interface DespachoRndc {
  mes: string;
  configuracionVehiculo: string;
  mercancia: string;
  municipioOrigen: string;
  municipioDestino: string;
  valorPagado: number | null;
}

export interface Consulta {
  origen: string;
  destino: string;
  // Cambia en cada envío desde el hero, para recalcular aunque se repita la ruta.
  n: number;
}

type Opcion = 'piso' | 'justo' | 'premium';

export default function Calculadora({ consulta }: { consulta: Consulta | null }) {
  const [origen, setOrigen] = useState('Bogotá');
  const [destino, setDestino] = useState('Medellín');
  const [toneladas, setToneladas] = useState(20);
  const [tipoCarga, setTipoCarga] = useState<string>('normal');
  const [ruta, setRuta] = useState<TarifaRuta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opcion, setOpcion] = useState<Opcion>('justo');
  const [despachosRndc, setDespachosRndc] = useState<DespachoRndc[] | null>(null);
  const [cargandoRndc, setCargandoRndc] = useState(false);
  const { publicar } = useAcciones();

  async function verDespachosRndc() {
    setCargandoRndc(true);
    try {
      const data = await apiFetch<DespachoRndc[]>(
        `/api/rndc/referencia?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`
      );
      setDespachosRndc(data);
    } catch {
      setDespachosRndc([]);
    } finally {
      setCargandoRndc(false);
    }
  }

  async function calcularRuta(o = origen, d = destino) {
    setCargando(true);
    setError(null);
    setDespachosRndc(null);
    try {
      const data = await apiFetch<TarifaRuta>(
        `/api/geo/ruta?origen=${encodeURIComponent(o)}&destino=${encodeURIComponent(d)}`
      );
      setRuta(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo calcular la ruta');
      setRuta(null);
    } finally {
      setCargando(false);
    }
  }

  // Calcula la ruta por defecto una vez al cargar la página.
  useEffect(() => {
    calcularRuta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ruta enviada desde el formulario del hero ("Ver precio legal").
  useEffect(() => {
    if (!consulta) return;
    setOrigen(consulta.origen);
    setDestino(consulta.destino);
    calcularRuta(consulta.origen, consulta.destino);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta]);

  const resultado = useMemo(() => {
    if (!ruta) return null;
    const factor = MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.factor ?? 1;
    const piso = Math.round(ruta.tarifaPorTon * toneladas * factor);
    return { piso, justo: Math.round(piso * 1.08), premium: Math.round(piso * 1.2) };
  }, [ruta, toneladas, tipoCarga]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    calcularRuta();
  }

  const opciones: { id: Opcion; icono: typeof ShieldCheck; nombre: string; detalle: string; valor: number }[] = resultado
    ? [
        { id: 'piso', icono: ShieldCheck, nombre: 'Mínimo legal', detalle: 'Piso SICE-TAC. Nada por debajo.', valor: resultado.piso },
        { id: 'justo', icono: Scale, nombre: 'Justo', detalle: 'Piso +8%, referencia de mercado.', valor: resultado.justo },
        { id: 'premium', icono: Zap, nombre: 'Premium', detalle: '+20%. Suele tomarse más rápido.', valor: resultado.premium },
      ]
    : [];

  return (
    <section id="calculadora" className="bg-zinc-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-orange-600">Calculadora SICE-TAC</p>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
            Conoce el precio justo antes de negociar
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
            Desde el Decreto 1017 de 2025, pactar un flete por debajo del mínimo SICE-TAC bloquea el
            despacho en el RNDC. Calcula el tuyo con la distancia real de la ruta.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Datos del viaje */}
          <form onSubmit={enviar} className="space-y-6 rounded-[28px] bg-white p-6 shadow-suave sm:p-8">
            <div>
              <p className="mb-3 text-lg font-bold text-zinc-950">Tu viaje</p>
              <RutaInputs idPrefijo="calc" origen={origen} destino={destino} onOrigen={setOrigen} onDestino={setDestino} requerido />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calc-tipo-carga" className="text-zinc-700">Tipo de carga</Label>
                <Select value={tipoCarga} onValueChange={setTipoCarga}>
                  <SelectTrigger id="calc-tipo-carga" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MULTIPLICADORES_TIPO_CARGA.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label} {t.factor > 1 && `(+${Math.round((t.factor - 1) * 100)}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label className="text-zinc-700">Toneladas</Label>
                  <span className="text-sm font-bold text-zinc-950">{toneladas} ton</span>
                </div>
                <div className="flex h-11 items-center">
                  <Slider value={[toneladas]} onValueChange={([v]) => setToneladas(v)} min={1} max={34} step={1} aria-label="Toneladas" />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={cargando} className="w-full gap-2">
              {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {cargando ? 'Calculando ruta…' : 'Calcular precio'}
            </Button>

            <p className="text-xs leading-relaxed text-zinc-500">
              {error ? (
                <span className="font-medium text-red-600">{error}</span>
              ) : ruta ? (
                <>
                  <span className="font-semibold text-zinc-800">{ruta.km} km reales</span> (OpenStreetMap) · referencia{' '}
                  {formatCOP(ruta.tarifaPorTon)}/ton · tarifa SICE-TAC referencial, no oficial.
                </>
              ) : (
                'Escribe origen y destino para calcular.'
              )}
            </p>

            {ruta && (
              <div className="border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={verDespachosRndc}
                  disabled={cargandoRndc}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-zinc-50 disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                    {cargandoRndc ? <Loader2 className="h-5 w-5 animate-spin" /> : <Landmark className="h-5 w-5" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-zinc-950">Ver despachos reales del RNDC</span>
                    <span className="block text-xs text-zinc-500">Dato abierto oficial del Ministerio de Transporte</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </button>

                {despachosRndc && (
                  <div className="mt-3 space-y-2 text-xs">
                    {despachosRndc.length === 0 ? (
                      <p className="rounded-xl bg-zinc-50 p-3 text-zinc-600">
                        El RNDC no tiene despachos públicos registrados para esta ruta exacta.
                      </p>
                    ) : (
                      despachosRndc.map((d, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 text-zinc-600">
                          <span className="min-w-0">
                            <span className="font-semibold text-zinc-900">{d.mes}</span> · {d.configuracionVehiculo}
                          </span>
                          {d.valorPagado ? <span className="shrink-0 font-semibold text-zinc-900">{formatCOP(d.valorPagado)}</span> : null}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Opciones de precio, como "elige tu viaje" de Uber */}
          <div className="rounded-[28px] bg-white p-6 shadow-suave sm:p-8">
            <p className="text-lg font-bold text-zinc-950">Elige tu precio</p>
            <p className="mt-1 text-sm text-zinc-500">
              {ruta ? `${toneladas} ton · ${origen} → ${destino} · ${ruta.km} km` : 'Calcula una ruta para ver los precios.'}
            </p>

            <div role="radiogroup" aria-label="Opciones de precio" className="mt-5 space-y-3">
              {!resultado &&
                Array.from({ length: 3 }, (_, i) => <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-zinc-100" />)}
              {opciones.map(({ id, icono: Icono, nombre, detalle, valor }) => {
                const activa = opcion === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={activa}
                    onClick={() => setOpcion(id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      activa ? 'border-zinc-950 bg-zinc-50' : 'border-transparent bg-white ring-1 ring-zinc-200 hover:ring-zinc-300'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        id === 'piso' ? 'bg-emerald-50 text-emerald-700' : id === 'justo' ? 'bg-orange-50 text-orange-600' : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <Icono className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-bold text-zinc-950">
                        {nombre}
                        {id === 'justo' && (
                          <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Recomendado
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-sm text-zinc-500">{detalle}</span>
                    </span>
                    <span className="shrink-0 text-right text-lg font-extrabold tracking-tight text-zinc-950">{formatCOP(valor)}</span>
                  </button>
                );
              })}
            </div>

            {resultado && (
              <>
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm text-red-900">
                    Una oferta por debajo de <strong>{formatCOP(resultado.piso)}</strong> es ilegal para este
                    viaje y el RNDC puede bloquear el despacho. La plataforma no permite publicarla.
                  </p>
                </div>
                <Button size="lg" onClick={publicar} className="mt-5 w-full gap-2">
                  Publicar esta carga gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
