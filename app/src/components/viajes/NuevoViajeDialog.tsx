import { useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, apiFetch } from '@/lib/api';
import { aPesos, hoyISO, type Viaje } from '@/lib/viajes';

// Viaje conseguido por fuera de la plataforma (los de cargas desbloqueadas
// se crean solos desde "Mis contactos").
export default function NuevoViajeDialog({
  open,
  onOpenChange,
  onCreado,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreado: (v: Viaje) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const f = new FormData(e.currentTarget);
    try {
      const v = await apiFetch<Viaje>('/api/viajes', {
        method: 'POST',
        body: {
          origen: String(f.get('origen')),
          destino: String(f.get('destino')),
          descripcion: String(f.get('descripcion')),
          flete: aPesos(String(f.get('flete'))),
          fecha: String(f.get('fecha')),
        },
      });
      onCreado({ ...v, gastos: [], carga: null });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el viaje');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo viaje</DialogTitle>
          <DialogDescription>Para un viaje que conseguiste por fuera de Descargo &amp; Cargo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={crear} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="nv-origen">Origen</Label>
              <Input id="nv-origen" name="origen" required minLength={2} placeholder="San Gil" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="nv-destino">Destino</Label>
              <Input id="nv-destino" name="destino" required minLength={2} placeholder="Bogotá" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nv-desc">Qué llevas (opcional)</Label>
            <Input id="nv-desc" name="descripcion" placeholder="Cemento, 10 ton" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="nv-flete">Flete pactado</Label>
              <Input id="nv-flete" name="flete" inputMode="numeric" required placeholder="1.800.000" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="nv-fecha">Fecha</Label>
              <Input id="nv-fecha" name="fecha" type="date" required defaultValue={hoyISO()} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={guardando} className="h-11 w-full">
            {guardando ? 'Creando…' : 'Crear viaje'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
