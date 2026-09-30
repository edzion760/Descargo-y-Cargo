import { useState } from 'react';
import { BellRing, CloudRain, Loader2, Mountain, Share, SquarePlus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { activarAlertasDeVia, estadoAvisos } from '@/lib/push';

export type MotivoAvisos = 'registro' | 'viaje' | 'manual';

// Una sola ventana para activar los avisos, pedida en el momento en que
// tienen sentido (al registrarse como transportador, al crear el primer
// viaje, o desde un botón). El permiso siempre lo da la persona: el sistema
// del celular exige su toque en "Permitir".
export default function ActivarAvisosDialog({
  open,
  onOpenChange,
  motivo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  motivo: MotivoAvisos;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* key: el estado del permiso se vuelve a leer en cada apertura, sin
            depender de que la animación de cierre desmonte el contenido. */}
        <Contenido key={String(open)} motivo={motivo} cerrar={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Contenido({ motivo, cerrar }: { motivo: MotivoAvisos; cerrar: () => void }) {
  const [estado] = useState(estadoAvisos);
  const [activando, setActivando] = useState(false);

  async function activar() {
    setActivando(true);
    try {
      await activarAlertasDeVia();
      toast.success('Listo: te avisaremos en el celular');
      cerrar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron activar los avisos');
      setActivando(false);
    }
  }

  const titulo =
    motivo === 'registro' ? '¿Te avisamos de lo que pasa en tu ruta?' : motivo === 'viaje' ? 'Avisos para este viaje' : 'Avisos en el celular';

  return (
    <>
      <DialogHeader>
        <DialogTitle>{titulo}</DialogTitle>
        <DialogDescription>Solo te escribimos cuando algo puede cambiar tu viaje.</DialogDescription>
      </DialogHeader>

      <ul className="space-y-2.5 text-sm text-zinc-700">
        <li className="flex gap-2.5">
          <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> Riesgo alto de derrumbes en tu ruta (IDEAM)
        </li>
        <li className="flex gap-2.5">
          <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" /> Tormenta o lluvia fuerte en las próximas horas
        </li>
        <li className="flex gap-2.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> Accidentes y cierres de vía cerca de ti
        </li>
      </ul>

      {estado === 'disponibles' && (
        <>
          <p className="text-xs text-zinc-500">
            El celular te pedirá permiso para las notificaciones y la ubicación. Si no das la ubicación, igual recibes los
            avisos de clima de tus viajes.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={cerrar}>
              Ahora no
            </Button>
            <Button onClick={activar} disabled={activando} className="gap-2">
              {activando ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />} Sí, activar
            </Button>
          </div>
        </>
      )}

      {estado === 'ios-instalar' && (
        <>
          <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-800">
            <p className="font-semibold">En iPhone, primero agrega Descargo &amp; Cargo a tu pantalla de inicio:</p>
            <ol className="mt-2 space-y-2">
              <li className="flex items-center gap-2">
                <span className="font-bold">1.</span> Toca <Share className="h-4 w-4" /> <strong>Compartir</strong> en Safari.
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">2.</span> Elige <SquarePlus className="h-4 w-4" /> <strong>Agregar a inicio</strong>.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span> Abre la app desde ese ícono y activa los avisos desde tu viaje.
              </li>
            </ol>
            <p className="mt-2 text-xs text-zinc-500">Apple solo permite notificaciones así; en Android funcionan directo.</p>
          </div>
          <Button onClick={cerrar}>Entendido</Button>
        </>
      )}

      {estado === 'bloqueados' && (
        <>
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Las notificaciones de este sitio están bloqueadas en tu navegador. Para activarlas, toca el ícono junto a la
            dirección (candado o ajustes) → <strong>Notificaciones</strong> → <strong>Permitir</strong>, y vuelve a intentarlo.
          </p>
          <Button onClick={cerrar}>Entendido</Button>
        </>
      )}

      {estado === 'no-soportado' && (
        <>
          <p className="text-sm text-zinc-700">
            Este navegador no permite notificaciones. Prueba desde Chrome en Android o agregando el sitio a la pantalla de
            inicio en iPhone.
          </p>
          <Button onClick={cerrar}>Entendido</Button>
        </>
      )}

      {estado === 'activos' && (
        <>
          <p className="text-sm text-emerald-700">Ya tienes los avisos activos en este celular.</p>
          <Button onClick={cerrar}>Listo</Button>
        </>
      )}
    </>
  );
}
