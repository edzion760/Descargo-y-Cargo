import { useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router';
import Logo from '@/components/Logo';
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="rounded-[28px] bg-white p-7 shadow-suave">
          {!token ? (
            <p className="text-sm text-red-600">
              Este enlace no es válido. Vuelve a solicitar la recuperación desde el botón de ingresar.
            </p>
          ) : listo ? (
            <div className="space-y-5 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-zinc-950">Listo</p>
              <p className="text-sm text-zinc-600">Tu contraseña se actualizó correctamente.</p>
              <Button asChild size="lg" className="w-full">
                <Link to="/">Ir a ingresar</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Elige tu nueva contraseña</h1>
              <div className="space-y-1.5">
                <Label htmlFor="nueva-password" className="text-zinc-700">Nueva contraseña</Label>
                <Input id="nueva-password" name="password" type="password" autoComplete="new-password" required minLength={8} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmar-password" className="text-zinc-700">Confirmar contraseña</Label>
                <Input id="confirmar-password" name="confirmar" type="password" autoComplete="new-password" required minLength={8} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="lg" disabled={cargando} className="w-full">
                {cargando ? 'Guardando…' : 'Guardar nueva contraseña'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
