import { useMemo, useState, type FormEvent } from 'react';
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
import { RUTAS, MULTIPLICADORES_TIPO_CARGA, CONFIGURACIONES_VEHICULO, formatCOP } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';

export default function PublicarCargaDialog({
  open,
  onOpenChange,
  onPublicada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublicada: () => void;
}) {
  const { token } = useAuth();
  const [rutaIdx, setRutaIdx] = useState(0);
  const [tipoCarga, setTipoCarga] = useState<string>('general');
  const [toneladas, setToneladas] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [publicada, setPublicada] = useState(false);

  const piso = useMemo(() => {
    const ruta = RUTAS[rutaIdx];
    const factor = MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.factor ?? 1;
    return Math.round(ruta.tarifaPorTon * toneladas * factor);
  }, [rutaIdx, tipoCarga, toneladas]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
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
        token,
        body: {
          titulo: String(form.get('titulo')),
          tipoCarga: MULTIPLICADORES_TIPO_CARGA.find((t) => t.id === tipoCarga)?.label ?? tipoCarga,
          origen: RUTAS[rutaIdx].origen,
          destino: RUTAS[rutaIdx].destino,
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
    if (!open) setPublicada(false);
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        {publicada ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold text-white">¡Carga publicada!</p>
            <p className="mt-2 text-sm text-zinc-400">
              Ya aparece en el marketplace, sobre el piso SICE-TAC de {formatCOP(piso)}.
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

              <div className="space-y-1.5">
                <Label htmlFor="carga-ruta" className="text-zinc-400">Ruta</Label>
                <Select value={String(rutaIdx)} onValueChange={(v) => setRutaIdx(Number(v))}>
                  <SelectTrigger id="carga-ruta" className="border-zinc-700 bg-zinc-900 text-white">
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
                  <span className="text-xs text-zinc-500">Piso SICE-TAC: {formatCOP(piso)}</span>
                </div>
                <Input id="carga-precio" name="precio" type="number" min={piso} required defaultValue={piso} className="border-zinc-700 bg-zinc-900 text-white" />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                {cargando ? 'Publicando…' : 'Publicar carga gratis'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
