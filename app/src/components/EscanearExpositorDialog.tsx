import { useEffect, useRef, useState, type FormEvent } from 'react';
import '@/lib/lector-qr';
import QrScanner from 'qr-scanner';
import { Camera, ImageUp, Loader2, Mic, PenLine, Sparkles, Square } from 'lucide-react';
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
  const [dictando, setDictando] = useState(false);
  if (datos) {
    return <Formulario datos={datos} onGuardado={onGuardado} onOtro={() => { setDatos(null); setDictando(false); }} />;
  }
  // Al pasar a dictar se desmonta el escáner y se apaga la cámara.
  if (dictando) return <Dictado onListo={setDatos} onManual={() => setDatos(leerContactoQR(''))} />;
  return <Escaner onLeido={(texto) => setDatos(leerContactoQR(texto))} onDictar={() => setDictando(true)} />;
}

// Web Speech API: Chrome y Safari la exponen con prefijo; no está en los tipos del DOM.
interface Reconocedor {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
const w = window as unknown as Record<string, (new () => Reconocedor) | undefined>;
const ReconocedorVoz = w.SpeechRecognition ?? w.webkitSpeechRecognition;

// Dicta los datos del contacto y la IA los reparte en el formulario. Si el
// navegador no deja usar el reconocimiento de voz, el micrófono del teclado
// escribe en el mismo cuadro.
function Dictado({ onListo, onManual }: { onListo: (datos: ContactoQR) => void; onManual: () => void }) {
  const [texto, setTexto] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [organizando, setOrganizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Reconocedor | null>(null);
  const cuadro = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => rec.current?.stop(), []);

  function alternar() {
    if (escuchando) return rec.current?.stop();
    if (!ReconocedorVoz) {
      setError('Aquí no se puede usar el micrófono directo: toca el 🎤 del teclado y dicta en el cuadro.');
      return cuadro.current?.focus();
    }
    const r = new ReconocedorVoz();
    r.lang = 'es-CO';
    r.continuous = true;
    r.interimResults = true;
    const previo = texto.trim() ? texto.trimEnd() + ' ' : '';
    r.onresult = (e) => setTexto(previo + Array.from(e.results, (res) => res[0].transcript).join(''));
    r.onerror = (e) =>
      setError(e.error === 'not-allowed'
        ? 'Permite el micrófono para este sitio, o usa el 🎤 del teclado.'
        : 'No te escuché bien. Toca el micrófono otra vez o usa el 🎤 del teclado.');
    r.onend = () => setEscuchando(false);
    rec.current = r;
    setError(null);
    r.start();
    setEscuchando(true);
  }

  async function organizar() {
    rec.current?.stop();
    setError(null);
    setOrganizando(true);
    try {
      onListo(await apiFetch<ContactoQR>('/api/admin/leads/dictado', { method: 'POST', body: { texto } }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo organizar el dictado');
      setOrganizando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 py-2">
        <button
          type="button"
          onClick={alternar}
          aria-label={escuchando ? 'Dejar de escuchar' : 'Empezar a dictar'}
          className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
            escuchando ? 'animate-pulse bg-red-600' : 'bg-zinc-950 hover:bg-zinc-800'
          }`}
        >
          {escuchando ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
        </button>
        <p className="text-center text-sm text-zinc-600">
          {escuchando ? 'Te escucho… toca para terminar.' : 'Toca y di: empresa, persona, cargo, celular, correo y lo que hablaron.'}
        </p>
      </div>
      <Textarea
        ref={cuadro}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        placeholder="Ej. Café La Mesa, hablé con Juan Pérez, gerente de logística, celular 310 555 1234, despachan 20 toneladas al mes a Buenaventura, llamarlo el lunes."
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onManual} className="gap-2 text-zinc-700">
          <PenLine className="h-4 w-4" /> Llenar a mano
        </Button>
        <Button type="button" onClick={organizar} disabled={organizando || texto.trim().length < 3} className="gap-2">
          {organizando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {organizando ? 'Organizando…' : 'Organizar datos'}
        </Button>
      </div>
    </div>
  );
}

function Escaner({ onLeido, onDictar }: { onLeido: (texto: string) => void; onDictar: () => void }) {
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
      // Por defecto reduce el recuadro a 400 px y los QR densos (vCard) se
      // vuelven ilegibles; se lee casi todo el cuadro a resolución real.
      calculateScanRegion: (v) => {
        const lado = Math.round(Math.min(v.videoWidth, v.videoHeight) * 0.9);
        const escala = Math.min(1, 1080 / lado);
        return {
          x: Math.round((v.videoWidth - lado) / 2),
          y: Math.round((v.videoHeight - lado) / 2),
          width: lado,
          height: lado,
          downScaledWidth: Math.round(lado * escala),
          downScaledHeight: Math.round(lado * escala),
        };
      },
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
        <Button variant="outline" onClick={onDictar} className="gap-2 border-zinc-300">
          <Mic className="h-4 w-4" /> Dictar datos
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
      const r = await apiFetch<{ cartaEnviada: boolean }>('/api/admin/leads', {
        method: 'POST',
        body: { ...form, enviarCarta: form.enviarCarta === 'on' },
      });
      if (form.enviarCarta === 'on' && form.email && !r.cartaEnviada) {
        toast.warning('Contacto guardado, pero la carta no salió', { description: 'Puedes reenviarla desde el panel.' });
      } else {
        toast.success(r.cartaEnviada ? 'Contacto guardado y carta enviada' : 'Contacto guardado', { description: form.empresa });
      }
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
      <label className="flex items-start gap-2 text-sm text-zinc-700">
        <input type="checkbox" name="enviarCarta" defaultChecked className="mt-0.5 h-4 w-4 accent-zinc-950" />
        <span>
          Enviar la carta de invitación por correo al guardar
          <span className="block text-xs text-zinc-500">Una sola carta, con enlace para darse de baja. No entra a campañas masivas.</span>
        </span>
      </label>
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
