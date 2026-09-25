import { useState, type FormEvent } from 'react';
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
import { CONFIGURACIONES_VEHICULO, formatCOP } from '@/data/mock';
import { apiFetch, ApiError } from '@/lib/api';

export interface CargaEditable {
  id: number;
  titulo: string;
  precio: number;
  pisoSiceTac: number;
  fechaCarga: string;
  tipoPublicacion: 'NACIONAL' | 'URBANA' | 'BARBACHA';
  vehiculoRequerido: string;
}

export default function EditarCargaDialog({
  open,
  onOpenChange,
  carga,
  onEditada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carga: CargaEditable | null;
  onEditada: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!carga) return;
    setError(null);

    const form = new FormData(e.currentTarget);
    const precio = Number(form.get('precio'));
    if (precio < carga.pisoSiceTac) {
      setError(`El precio no puede ser menor al piso SICE-TAC: ${formatCOP(carga.pisoSiceTac)}`);
      return;
    }

    setCargando(true);
    try {
      await apiFetch(`/api/cargas/${carga.id}`, {
        method: 'PATCH',
        body: {
          titulo: String(form.get('titulo')),
          precio,
          fechaCarga: String(form.get('fechaCarga')),
          tipoPublicacion: String(form.get('tipoPublicacion')),
          vehiculoRequerido: String(form.get('vehiculoRequerido')),
        },
      });
      onEditada();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el cambio');
    } finally {
      setCargando(false);
    }
  }

  if (!carga) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-zinc-950">Editar carga</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Origen, destino y toneladas no se pueden cambiar aquí -- eso determina el piso legal.
            Si necesitas cambiarlos, cancela esta publicación y crea una nueva.
          </DialogDescription>
        </DialogHeader>

        <form key={carga.id} onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="editar-titulo" className="text-zinc-700">Título</Label>
            <Input
              id="editar-titulo"
              name="titulo"
              required
              defaultValue={carga.titulo}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editar-tipo-publicacion" className="text-zinc-700">Tipo de publicación</Label>
              <Select name="tipoPublicacion" defaultValue={carga.tipoPublicacion}>
                <SelectTrigger id="editar-tipo-publicacion" className="w-full">
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
              <Label htmlFor="editar-fecha" className="text-zinc-700">Fecha de carga</Label>
              <Input
                id="editar-fecha"
                name="fechaCarga"
                type="date"
                required
                defaultValue={carga.fechaCarga.slice(0, 10)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editar-vehiculo" className="text-zinc-700">Vehículo requerido</Label>
            <Select name="vehiculoRequerido" defaultValue={carga.vehiculoRequerido} required>
              <SelectTrigger id="editar-vehiculo" className="w-full">
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
              <Label htmlFor="editar-precio" className="text-zinc-700">Flete ofrecido (COP)</Label>
              <span className="text-xs font-medium text-zinc-500">Piso SICE-TAC: {formatCOP(carga.pisoSiceTac)}</span>
            </div>
            <Input
              id="editar-precio"
              name="precio"
              type="number"
              min={carga.pisoSiceTac}
              required
              defaultValue={carga.precio}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={cargando} className="h-12 w-full rounded-xl text-[15px] font-semibold">
            {cargando ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
