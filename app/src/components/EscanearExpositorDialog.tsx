import { useEffect, useRef, useState, type FormEvent } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, ImageUp, Loader2, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiFetch } from '@/lib/api';
import { leerContactoQR, type ContactoQR } from '@/lib/contacto-qr';

// Escanea el QR del stand de un expositor en una feria y lo guarda como
// contacto (fuente "… · QR expositor"). La cámara en vivo necesita permiso
// del navegador; si se niega o falla (pasa en algunos iPhone), queda
// "Tomar foto del QR", que usa la cámara nativa y lee la imagen.
export default function EscanearExpositorDialog({
  open,
  onOpenChange,
  onGuardado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardado: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear QR de expositor</DialogTitle>
          <DialogDescription>Apunta la cámara al código del stand. Revisa los datos antes de guardar.</DialogDescription>
        </DialogHeader>
        {/* DialogContent se desmonta al cerrar: cada apertura arranca de cero y apaga la cámara. */}
        <Flujo
          onGuardado={() => {
            onGuardado();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Flujo({ onGuardado }: { onGuardado: () => void }) {
  const [datos, setDatos] = useState<ContactoQR | null>(null);
  if (!datos) return <Escaner onLeido={(texto) => setDatos(leerContactoQR(texto))} onManual={() => setDatos(leerContactoQR(''))} />;
  return <Formulario datos={datos} onGuardado={onGuardado} onOtro={() => setDatos(null)} />;
}

function Escaner({ onLeido, onManual }: { onLeido: (texto: string) => void; onManual: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [leyendoFoto, setLeyendoFoto] = useState(false);
  const onLeidoRef = useRef(onLeido);
  onLeidoRef.current = onLeido;

  useEffect(() => {
    const scanner = new QrScanner(video.current!, (r) => onLeidoRef.current(r.data), {
      preferredCamera: 'environment',
      highlightScanRegion: true,
      returnDetailedScanResult: true,
    });
    scanner.start().catch(() => setError('No se pudo abrir la cámara. Permite el acceso o usa "Tomar foto del QR".'));
    return () => scanner.destroy();
  }, []);

  async function leerFoto(archivo: File | undefined) {
    if (!archivo) return;
    setLeyendoFoto(true);
    try {
      const r = await QrScanner.scanImage(archivo, { returnDetailedScanResult: true });
      onLeido(r.data);
    } catch {
      setError('No encontramos un QR en esa foto. Intenta más cerca y con buena luz.');
    } finally {
      setLeyendoFoto(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-950">
        <video ref={video} muted playsInline className="h-full w-full object-cover" />
        {!error && (
          <span className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 text-xs font-medium text-white/80">
            <Camera className="h-3.5 w-3.5" /> Buscando un código QR…
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" className="gap-2 border-zinc-300">
          <label>
            {leyendoFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
            Tomar foto del QR
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => leerFoto(e.target.files?.[0])}
            />
          </label>
        </Button>
        <Button variant="ghost" onClick={onManual} className="gap-2 text-zinc-700">
          <PenLine className="h-4 w-4" /> Llenar a mano
        </Button>
      </div>
    </div>
  );
}

function Formulario({ datos, onGuardado, onOtro }: { datos: ContactoQR; onGuardado: () => void; onOtro: () => void }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await apiFetch('/api/admin/leads', { method: 'POST', body: form });
      toast.success('Contacto guardado', { description: form.empresa });
      onGuardado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
      setGuardando(false);
    }
  }

  const campo = (name: keyof ContactoQR, etiqueta: string, props: Record<string, unknown> = {}) => (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={`qr-${name}`} className="text-zinc-700">{etiqueta}</Label>
      <Input id={`qr-${name}`} name={name} defaultValue={datos[name]} {...props} />
    </div>
  );

  return (
    <form onSubmit={guardar} className="space-y-3">
      {campo('empresa', 'Empresa *', { required: true, minLength: 2 })}
      <div className="grid grid-cols-2 gap-3">
        {campo('contacto', 'Persona')}
        {campo('cargo', 'Cargo')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {campo('telefono', 'Celular', { inputMode: 'tel' })}
        {campo('ciudad', 'Ciudad')}
      </div>
      {campo('email', 'Correo', { type: 'email' })}
      {campo('web', 'Web / enlace')}
      <div className="space-y-1.5">
        <Label htmlFor="qr-notas" className="text-zinc-700">Notas de la conversación</Label>
        <Textarea
          id="qr-notas"
          name="notas"
          defaultValue={datos.notas}
          placeholder="Ej. despachan café a Buenaventura, llamar el lunes"
          rows={3}
        />
      </div>
      <p className="text-xs text-zinc-500">
        Para seguimiento directo: llamada, WhatsApp o una carta de invitación individual desde el panel. No entra a
        campañas masivas de correo.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onOtro}>
          Escanear otro
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar contacto'}
        </Button>
      </div>
    </form>
  );
}
