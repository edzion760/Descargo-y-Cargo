import { useState, type FormEvent } from 'react';
import { ArrowLeft, Camera, ImageIcon, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClimaRuta from '@/components/viajes/ClimaRuta';
import { formatCOP } from '@/data/mock';
import { ApiError, apiFetch } from '@/lib/api';
import {
  TIPOS_GASTO,
  aPesos,
  fechaCorta,
  hoyISO,
  subirRecibo,
  totalGastos,
  urlRecibo,
  type Gasto,
  type TipoGasto,
  type Viaje,
} from '@/lib/viajes';

export default function DetalleViaje({
  viaje,
  onCambio,
  onVolver,
  onEliminado,
}: {
  viaje: Viaje;
  onCambio: (v: Viaje) => void;
  onVolver: () => void;
  onEliminado: () => void;
}) {
  const gastos = totalGastos(viaje);
  const queda = viaje.flete - gastos;
  const [editandoFlete, setEditandoFlete] = useState(false);

  async function guardarFlete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const flete = aPesos(String(new FormData(e.currentTarget).get('flete')));
    try {
      await apiFetch(`/api/viajes/${viaje.id}`, { method: 'PATCH', body: { flete } });
      onCambio({ ...viaje, flete });
      setEditandoFlete(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  }

  async function eliminarViaje() {
    if (!window.confirm('¿Eliminar este viaje y todos sus gastos?')) return;
    await apiFetch(`/api/viajes/${viaje.id}`, { method: 'DELETE' });
    onEliminado();
  }

  const actualizarGasto = (g: Gasto) => onCambio({ ...viaje, gastos: viaje.gastos.map((x) => (x.id === g.id ? g : x)) });

  return (
    <div>
      <button onClick={onVolver} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-950">
        <ArrowLeft className="h-4 w-4" /> Mis viajes
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            {viaje.origen} → {viaje.destino}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {[viaje.descripcion, fechaCorta(viaje.fecha), viaje.cargaId ? 'Carga de Descargo & Cargo' : 'Viaje por fuera']
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={eliminarViaje} className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" /> Eliminar viaje
        </Button>
      </div>

      {/* Resumen: lo que el transportador quiere saber de un vistazo. */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className={`min-w-0 rounded-2xl bg-white p-3 shadow-suave sm:p-4 ${editandoFlete ? 'col-span-2 sm:col-span-3' : ''}`}>
          <p className="text-xs text-zinc-500">Flete pactado</p>
          {editandoFlete ? (
            <form onSubmit={guardarFlete} className="mt-1 flex gap-2">
              <Input name="flete" inputMode="numeric" defaultValue={viaje.flete.toLocaleString('es-CO')} autoFocus className="h-9" />
              <Button type="submit" size="sm">OK</Button>
            </form>
          ) : (
            <button onClick={() => setEditandoFlete(true)} className="mt-1 inline-flex max-w-full items-center gap-1.5 text-base font-extrabold tabular-nums text-zinc-950 sm:text-xl">
              {formatCOP(viaje.flete)} <Pencil className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          )}
        </div>
        <div className="min-w-0 rounded-2xl bg-white p-3 shadow-suave sm:p-4">
          <p className="text-xs text-zinc-500">Gastos</p>
          <p className="mt-1 truncate text-base font-extrabold tabular-nums text-zinc-950 sm:text-xl">{formatCOP(gastos)}</p>
        </div>
        <div className={`col-span-2 min-w-0 rounded-2xl p-3 shadow-suave sm:col-span-1 sm:p-4 ${queda >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className="text-xs text-zinc-600">{queda >= 0 ? 'Te quedan' : 'Vas perdiendo'}</p>
          <p className={`mt-1 truncate text-base font-extrabold tabular-nums sm:text-xl ${queda >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCOP(Math.abs(queda))}
          </p>
        </div>
      </div>

      {viaje.carga && (
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          Piso legal SICE-TAC de esta carga: <strong className="text-zinc-700">{formatCOP(viaje.carga.pisoSiceTac)}</strong>. Es lo
          que el Ministerio de Transporte calcula como costo eficiente de operar este viaje; si tus gastos se le acercan, el flete
          está apretado.
        </p>
      )}

      <ClimaRuta origen={viaje.origen} destino={viaje.destino} />

      <NuevoGasto viajeId={viaje.id} onCreado={(g) => onCambio({ ...viaje, gastos: [...viaje.gastos, g] })} />

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-zinc-500">Gastos registrados</h2>
      {viaje.gastos.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Todavía no hay gastos en este viaje.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100 rounded-2xl bg-white shadow-suave">
          {viaje.gastos.map((g) => (
            <FilaGasto
              key={g.id}
              gasto={g}
              onActualizado={actualizarGasto}
              onEliminado={() => onCambio({ ...viaje, gastos: viaje.gastos.filter((x) => x.id !== g.id) })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NuevoGasto({ viajeId, onCreado }: { viajeId: number; onCreado: (g: Gasto) => void }) {
  const [tipo, setTipo] = useState<TipoGasto>('ACPM');
  const [foto, setFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const f = new FormData(formulario);
    const archivo = f.get('foto') as File | null;
    setError(null);
    setGuardando(true);
    try {
      let g = await apiFetch<Gasto>(`/api/viajes/${viajeId}/gastos`, {
        method: 'POST',
        body: { tipo, valor: aPesos(String(f.get('valor'))), fecha: String(f.get('fecha')), nota: String(f.get('nota')) },
      });
      if (archivo && archivo.size > 0) {
        try {
          g = await subirRecibo(g.id, archivo);
        } catch {
          toast.warning('Gasto guardado, pero la foto no subió', { description: 'Puedes agregarla desde la lista.' });
        }
      }
      onCreado(g);
      formulario.reset();
      setFoto(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el gasto');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-suave">
      <p className="font-semibold text-zinc-950">Agregar gasto</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de gasto">
        {(Object.keys(TIPOS_GASTO) as TipoGasto[]).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tipo === t}
            onClick={() => setTipo(t)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              tipo === t ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
            }`}
          >
            {TIPOS_GASTO[t]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="g-valor">Valor</Label>
          <Input id="g-valor" name="valor" inputMode="numeric" required placeholder="$ 0" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="g-fecha">Fecha</Label>
          <Input id="g-fecha" name="fecha" type="date" required defaultValue={hoyISO()} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="g-nota">Nota (opcional)</Label>
        <Input id="g-nota" name="nota" placeholder="Ej. peaje Pescadero" />
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-600 hover:border-zinc-400">
        <Camera className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{foto ? `Foto: ${foto}` : 'Tomar foto del recibo (opcional)'}</span>
        <input
          type="file"
          name="foto"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => setFoto(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={guardando} className="h-11 w-full">
        {guardando ? 'Guardando…' : 'Guardar gasto'}
      </Button>
    </form>
  );
}

function FilaGasto({
  gasto,
  onActualizado,
  onEliminado,
}: {
  gasto: Gasto;
  onActualizado: (g: Gasto) => void;
  onEliminado: () => void;
}) {
  const [subiendo, setSubiendo] = useState(false);

  async function agregarFoto(archivo: File | undefined) {
    if (!archivo) return;
    setSubiendo(true);
    try {
      onActualizado(await subirRecibo(gasto.id, archivo));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo subir la foto');
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar() {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await apiFetch(`/api/viajes/gastos/${gasto.id}`, { method: 'DELETE' });
    onEliminado();
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-950">{TIPOS_GASTO[gasto.tipo] ?? gasto.tipo}</p>
        <p className="truncate text-xs text-zinc-500">{[fechaCorta(gasto.fecha), gasto.nota].filter(Boolean).join(' · ')}</p>
      </div>
      <span className="shrink-0 font-semibold tabular-nums text-zinc-950">{formatCOP(gasto.valor)}</span>
      {gasto.recibo ? (
        <a href={urlRecibo(gasto.id)} target="_blank" rel="noopener" aria-label="Ver recibo" className="shrink-0 text-emerald-700">
          <ImageIcon className="h-4 w-4" />
        </a>
      ) : (
        <label aria-label="Agregar foto del recibo" className="shrink-0 cursor-pointer text-zinc-400 hover:text-zinc-700">
          {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => agregarFoto(e.target.files?.[0])} />
        </label>
      )}
      <button onClick={eliminar} aria-label="Eliminar gasto" className="shrink-0 text-zinc-400 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
