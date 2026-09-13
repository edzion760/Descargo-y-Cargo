import { useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApiError, apiFetch } from '@/lib/api';

export default function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    const confirmar = String(form.get('confirmar'));
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    try {
      await apiFetch('/api/auth/restablecer-password', { method: 'POST', body: { token, password } });
      setListo(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-zinc-950">
            <Truck className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <p className="text-base font-bold text-white">
            Descargo <span className="text-orange-400">&amp;</span> Cargo
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          {!token ? (
            <p className="text-sm text-red-400">
              Este enlace no es válido. Vuelve a solicitar la recuperación desde el botón de ingresar.
            </p>
          ) : listo ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-zinc-300">Tu contraseña se actualizó correctamente.</p>
              <Link to="/">
                <Button className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                  Ir a ingresar
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <h1 className="text-lg font-semibold text-white">Elige tu nueva contraseña</h1>
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Nueva contraseña</Label>
                <Input name="password" type="password" required minLength={8} className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Confirmar contraseña</Label>
                <Input name="confirmar" type="password" required minLength={8} className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                {cargando ? 'Guardando…' : 'Guardar nueva contraseña'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
