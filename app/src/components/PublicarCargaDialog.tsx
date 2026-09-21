import { useMemo, useState, type FormEvent } from 'react';
import { MapPin } from 'lucide-react';
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
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        {publicada ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold text-white">¡Carga publicada!</p>
            <p className="mt-2 text-sm text-zinc-400">
              Ya aparece en el marketplace, sobre el piso SICE-TAC de {piso != null ? formatCOP(piso) : ''}.
            </p>
            <Button className="mt-6 bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400" onClick={() => cerrar(false)}>
              Listo
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">Publicar carga</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Gratis. Nunca podrás publicar por debajo del piso legal SICE-TAC.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="carga-titulo" className="text-zinc-400">Título</Label>
                <Input id="carga-titulo" name="titulo" required placeholder="Ej. Café pergamino en sacos" className="border-zinc-700 bg-zinc-900 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga-origen" className="text-zinc-400">Origen</Label>
                  <Input
                    id="carga-origen"
                    value={origen}
                    onChange={(e) => { setOrigen(e.target.value); setRuta(null); }}
                    placeholder="Ej. Bogotá"
                    required
                    className="border-zinc-700 bg-zinc-900 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga-destino" className="text-zinc-400">Destino</Label>
                  <Input
                    id="carga-destino"
                    value={destino}
                    onChange={(e) => { setDestino(e.target.value); setRuta(null); }}
                    placeholder="Ej. Medellín"
                    required
                    className="border-zinc-700 bg-zinc-900 text-white"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={calcularRuta}
                disabled={cargandoRuta || !origen.trim() || !destino.trim()}
                variant="outline"
                className="h-auto w-full gap-2 whitespace-normal border-zinc-700 py-2 text-zinc-200 hover:bg-zinc-800"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                {cargandoRuta ? 'Calculando ruta…' : ruta ? `${ruta.km} km reales · piso ${formatCOP(ruta.tarifaPorTon)}/ton` : 'Calcular distancia real'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga-tipo" className="text-zinc-400">Tipo de carga</Label>
                  <Select value={tipoCarga} onValueChange={setTipoCarga}>
                    <SelectTrigger id="carga-tipo" className="border-zinc-700 bg-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                      {MULTIPLICADORES_TIPO_CARGA.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga-toneladas" className="text-zinc-400">Toneladas</Label>
                  <Input
                    id="carga-toneladas"
                    type="number"
                    min={1}
                    max={34}
                    value={toneladas}
                    onChange={(e) => setToneladas(Number(e.target.value))}
                    className="border-zinc-700 bg-zinc-900 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga-tipo-publicacion" className="text-zinc-400">Tipo de publicación</Label>
                  <Select name="tipoPublicacion" defaultValue="NACIONAL">
                    <SelectTrigger id="carga-tipo-publicacion" className="border-zinc-700 bg-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                      <SelectItem value="NACIONAL">Nacional</SelectItem>
                      <SelectItem value="URBANA">Urbana</SelectItem>
                      <SelectItem value="BARBACHA">Barbacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga-fecha" className="text-zinc-400">Fecha de carga</Label>
                  <Input id="carga-fecha" name="fechaCarga" type="date" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="carga-vehiculo" className="text-zinc-400">Vehículo requerido</Label>
                <Select name="vehiculoRequerido" defaultValue={CONFIGURACIONES_VEHICULO[0].label} required>
                  <SelectTrigger id="carga-vehiculo" className="border-zinc-700 bg-zinc-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                    {CONFIGURACIONES_VEHICULO.map((v) => (
                      <SelectItem key={v.codigo} value={v.label}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="carga-precio" className="text-zinc-400">Flete ofrecido (COP)</Label>
                  {piso != null && <span className="text-xs text-zinc-500">Piso SICE-TAC: {formatCOP(piso)}</span>}
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
                  className="border-zinc-700 bg-zinc-900 text-white disabled:opacity-50"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={cargando || piso == null} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                {cargando ? 'Publicando…' : 'Publicar carga gratis'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
