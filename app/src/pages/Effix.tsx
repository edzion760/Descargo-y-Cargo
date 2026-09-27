import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/Logo';
import { apiFetch, ApiError } from '@/lib/api';

const FRECUENCIAS = [
  ['semanal', 'Cada semana'],
  ['mensual', 'Cada mes'],
  ['ocasional', 'De vez en cuando'],
] as const;

// Captura de contactos en ferias: la persona (o nosotros con ella al lado)
// llena esto desde el celular vía el QR del stand/visita. ?fuente= permite
// reutilizarla en otros eventos sin tocar código.
export default function Effix() {
  const [params] = useSearchParams();
  const fuente = params.get('fuente') || 'Effix 2026';
  const [frecuencia, setFrecuencia] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<string | null>(null);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const contacto = String(f.get('contacto'));
    setEnviando(true);
    try {
      await apiFetch('/api/prospectos/lead', {
        method: 'POST',
        body: {
          empresa: String(f.get('empresa')),
          contacto,
          cargo: String(f.get('cargo')),
          telefono: String(f.get('telefono')),
          email: String(f.get('email')),
          ciudad: String(f.get('ciudad')),
          despacha: String(f.get('despacha')),
          frecuencia,
          fuente,
          acepta,
        },
      });
      setListo(contacto.split(' ')[0]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar. Revisa tu conexión.');
    } finally {
      setEnviando(false);
    }
  }

  function otro() {
    setListo(null);
    setFrecuencia('');
    setAcepta(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="rounded-[28px] bg-white p-6 shadow-suave sm:p-8">
          {listo ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </span>
              <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-950">¡Gracias, {listo}!</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                Te escribimos por WhatsApp para mostrarte cómo publicar tu primera carga gratis.
              </p>
              <div className="mt-7 flex flex-col gap-2">
                <Button asChild size="lg">
                  <Link to="/">Ver cargas y calcular un flete</Link>
                </Button>
                <Button size="lg" variant="outline" onClick={otro} className="border-zinc-300">
                  Registrar otro contacto
                </Button>
              </div>
            </div>
          ) : (
            <form key={String(listo)} onSubmit={enviar} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-orange-600">{fuente}</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-zinc-950">Hablemos de tu carga</h1>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Publicar es gratis y nunca pagas un flete por debajo del piso legal. Déjanos tus datos y
                  te contactamos.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="empresa" className="text-zinc-700">Empresa *</Label>
                <Input id="empresa" name="empresa" required autoComplete="organization" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contacto" className="text-zinc-700">Tu nombre *</Label>
                  <Input id="contacto" name="contacto" required autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cargo" className="text-zinc-700">Cargo</Label>
                  <Input id="cargo" name="cargo" autoComplete="organization-title" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-zinc-700">Celular / WhatsApp *</Label>
                <Input id="telefono" name="telefono" type="tel" inputMode="tel" required autoComplete="tel" placeholder="310 000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-700">Correo</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ciudad" className="text-zinc-700">Ciudad</Label>
                  <Input id="ciudad" name="ciudad" autoComplete="address-level2" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="despacha" className="text-zinc-700">¿Qué mercancía despachan?</Label>
                <Input id="despacha" name="despacha" placeholder="Ej. alimentos, ropa, materiales" />
              </div>

              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium text-zinc-700">¿Cada cuánto despachan en camión?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {FRECUENCIAS.map(([valor, etiqueta]) => (
                    <button
                      key={valor}
                      type="button"
                      aria-pressed={frecuencia === valor}
                      onClick={() => setFrecuencia(frecuencia === valor ? '' : valor)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                        frecuencia === valor ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-3">
                <Checkbox id="acepta" checked={acepta} onCheckedChange={(v) => setAcepta(v === true)} className="mt-0.5" />
                <Label htmlFor="acepta" className="block text-xs font-normal leading-relaxed text-zinc-600">
                  Autorizo a DESCARGO Y CARGO S.A.S. a tratar mis datos para contactarme sobre sus servicios, según
                  la{' '}
                  <a href="/legal/politica-datos.html" target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline">
                    Política de Tratamiento de Datos
                  </a>
                  . Puedo pedir que me borren en cualquier momento.
                </Label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" size="lg" disabled={enviando || !acepta} className="w-full gap-2">
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                {enviando ? 'Enviando…' : 'Enviar mis datos'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
