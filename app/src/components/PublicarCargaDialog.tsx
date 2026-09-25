import { useMemo, useState, type FormEvent } from 'react';
import { MapPin, Check, Loader2 } from 'lucide-react';
import RutaInputs from '@/components/RutaInputs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MULTIPLICADORES_TIPO_CARGA, CONFIGURACIONES_VEHICULO, formatCOP } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';

interface TarifaRuta {
  km: number;
  tarifaPorTon: number;
}

export default function PublicarCargaDialog({
  open,
  onOpenChange,
  onPublicada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublicada: () => void;
}) {
  const { autenticado } = useAuth();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [ruta, setRuta] = useState<TarifaRuta | null>(null);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const [tipoCarga, setTipoCarga] = useState<string>('normal');
  const [toneladas, setToneladas] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [publicada, setPublicada] = useState(false);

  async function calcularRuta() {
    if (!origen.trim() || !destino.trim()) return;
    setCargandoRuta(true);
    setError(null);
    setRuta(null);
    try {
      const data = await apiFetch<TarifaRuta>(
        `/api/geo/ruta?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`
      );
      setRuta(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo calcular la ruta');
    } finally {
      setCargandoRuta(false);
    }
  }

  const piso = useMemo(() => {
    if (!ruta) return null;
    const factor = MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.factor ?? 1;
    return Math.round(ruta.tarifaPorTon * toneladas * factor);
  }, [ruta, tipoCarga, toneladas]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!autenticado || piso == null) return;
    setError(null);

    const form = new FormData(e.currentTarget);
    const precio = Number(form.get('precio'));
    if (precio < piso) {
      setError(`El precio no puede ser menor al piso SICE-TAC: ${formatCOP(piso)}`);
      return;
    }

    setCargando(true);
    try {
      await apiFetch('/api/cargas', {
        method: 'POST',
        body: {
          titulo: String(form.get('titulo')),
          tipoCarga: MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.label ?? tipoCarga,
          origen: origen.trim(),
          destino: destino.trim(),
          toneladas,
          precio,
          pisoSiceTac: piso,
          fechaCarga: String(form.get('fechaCarga')),
          tipoPublicacion: String(form.get('tipoPublicacion')),
          vehiculoRequerido: String(form.get('vehiculoRequerido')),
        },
      });
      setPublicada(true);
      onPublicada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo publicar la carga');
    } finally {
      setCargando(false);
    }
  }

  function cerrar(open: boolean) {
    if (!open) {
      setPublicada(false);
      setOrigen('');
      setDestino('');
      setRuta(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-lg">
        {publicada ? (
          <div className="py-6 text-center">
            <p className="text-2xl font-extrabold tracking-tight text-zinc-950">¡Carga publicada!</p>
            <p className="mt-2 text-sm text-zinc-600">
              Ya aparece en el marketplace, sobre el piso SICE-TAC de {piso != null ? formatCOP(piso) : ''}.
            </p>
            <Button className="mt-6 h-12 rounded-xl px-8 font-semibold" onClick={() => cerrar(false)}>
              Listo
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-zinc-950">Publicar carga</DialogTitle>
              <DialogDescription className="text-zinc-500">
                Gratis. Nunca podrás publicar por debajo del piso legal SICE-TAC.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="carga-titulo" className="text-zinc-700">Título</Label>
                <Input id="carga-titulo" name="titulo" required placeholder="Ej. Café pergamino en sacos" />
              </div>

              <div className="space-y-1.5">
                <span className="text-sm font-medium text-zinc-700">Ruta</span>
                <RutaInputs
                  idPrefijo="carga"
                  origen={origen}
                  destino={destino}
                  onOrigen={(v) => { setOrigen(v); setRuta(null); }}
                  onDestino={(v) => { setDestino(v); setRuta(null); }}
                  requerido
                />
              </div>

              <Button
                type="button"
                onClick={calcularRuta}
                disabled={cargandoRuta || !origen.trim() || !destino.trim()}
                variant={ruta ? 'secondary' : 'outline'}
                className={`h-auto min-h-11 w-full gap-2 whitespace-normal rounded-xl py-2.5 font-semibold ${
                  ruta ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50' : 'border-zinc-300'
                }`}
              >
                {cargandoRuta ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : ruta ? <Check className="h-4 w-4 shrink-0" /> : <MapPin className="h-4 w-4 shrink-0" />}
                {cargandoRuta ? 'Calculando ruta…' : ruta ? `${ruta.km} km reales · referencia ${formatCOP(ruta.tarifaPorTon)}/ton` : 'Calcular distancia real'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga-tipo" className="text-zinc-700">Tipo de carga</Label>
                  <Select value={tipoCarga} onValueChange={setTipoCarga}>
                    <SelectTrigger id="carga-tipo" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MULTIPLICADORES_TIPO_CARGA.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga-toneladas" className="text-zinc-700">Toneladas</Label>
                  <Input
                    id="carga-toneladas"
                    type="number"
                    min={1}
                    max={34}
                    value={toneladas}
                    onChange={(e) => setToneladas(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga-tipo-publicacion" className="text-zinc-700">Tipo de publicación</Label>
                  <Select name="tipoPublicacion" defaultValue="NACIONAL">
                    <SelectTrigger id="carga-tipo-publicacion" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NACIONAL">Nacional</SelectItem>
                      <SelectItem value="URBANA">Urbana</SelectItem>
                      <SelectItem value="BARBACHA">Barbacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga-fecha" className="text-zinc-700">Fecha de carga</Label>
                  <Input id="carga-fecha" name="fechaCarga" type="date" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="carga-vehiculo" className="text-zinc-700">Vehículo requerido</Label>
                <Select name="vehiculoRequerido" defaultValue={CONFIGURACIONES_VEHICULO[0].label} required>
                  <SelectTrigger id="carga-vehiculo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIGURACIONES_VEHICULO.map((v) => (
                      <SelectItem key={v.codigo} value={v.label}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <Label htmlFor="carga-precio" className="text-zinc-700">Flete ofrecido (COP)</Label>
                  {piso != null && <span className="text-xs font-medium text-zinc-500">Piso SICE-TAC: {formatCOP(piso)}</span>}
                </div>
                <Input
                  key={piso ?? 'sin-piso'}
                  id="carga-precio"
                  name="precio"
                  type="number"
                  min={piso ?? 0}
                  required
                  disabled={piso == null}
                  defaultValue={piso ?? ''}
                  placeholder={piso == null ? 'Calcula la ruta primero' : undefined}
                  className="disabled:bg-zinc-50"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={cargando || piso == null} className="h-12 w-full rounded-xl text-[15px] font-semibold">
                {cargando ? 'Publicando…' : 'Publicar carga gratis'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
