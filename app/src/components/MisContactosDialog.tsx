import { useEffect, useState } from 'react';
import { Loader2, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCOP } from '@/data/mock';
import { apiFetch } from '@/lib/api';

interface ContactoPagado {
  id: number;
  titulo: string;
  origen: string;
  destino: string;
  fechaCarga: string;
  estado: string;
  pagoId: number;
  monto: number;
  contacto: { nombre: string; telefono: string };
}

export default function MisContactosDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mis contactos</DialogTitle>
          <DialogDescription>Los contactos que ya desbloqueaste. Quedan aquí aunque la carga se cierre.</DialogDescription>
        </DialogHeader>
        {/* DialogContent se desmonta al cerrar, así que cada apertura pide la lista de nuevo. */}
        <Lista />
      </DialogContent>
    </Dialog>
  );
}

function Lista() {
  const [items, setItems] = useState<ContactoPagado[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<ContactoPagado[]>('/api/cargas/mis-contactos')
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-red-600">No pudimos cargar tus contactos. Inténtalo de nuevo.</p>;
  if (!items)
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
      </p>
    );
  if (items.length === 0)
    return <p className="text-sm text-zinc-600">Aún no has desbloqueado contactos. Cuando pagues uno, aparecerá aquí.</p>;

  return (
    <ul className="grid grid-cols-1 gap-3">
      {items.map((c) => (
        <li key={c.id} className="min-w-0 rounded-xl border border-zinc-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-950">{c.titulo}</p>
              <p className="truncate text-sm text-zinc-500">
                {c.origen} → {c.destino} ·{' '}
                {new Date(c.fechaCarga).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
              </p>
            </div>
            {c.estado !== 'DISPONIBLE' && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {c.estado === 'CANCELADA' ? 'Cancelada' : 'Cerrada'}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <span className="min-w-0 truncate text-sm font-semibold text-zinc-950">{c.contacto.nombre}</span>
            <a href={`tel:${c.contacto.telefono}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Phone className="h-3.5 w-3.5" /> {c.contacto.telefono}
            </a>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-500">Pagaste {formatCOP(c.monto)}</span>
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              <a href={`/viajes?carga=${c.id}`} className="font-semibold text-zinc-950 underline">
                Gastos del viaje
              </a>
              <a href={`/constancia?pago=${c.pagoId}`} className="font-semibold text-zinc-950 underline">
                Constancia de entrega
              </a>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
