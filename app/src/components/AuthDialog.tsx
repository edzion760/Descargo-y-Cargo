import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/use-auth';
import { ApiError, apiFetch } from '@/lib/api';

export default function AuthDialog({
  open,
  onOpenChange,
  defaultTab = 'login',
  defaultTipo = 'TRANSPORTADOR',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'registro';
  defaultTipo?: 'PUBLICADOR' | 'TRANSPORTADOR';
}) {
  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [modoOlvide, setModoOlvide] = useState(false);
  const [mensajeOlvide, setMensajeOlvide] = useState<string | null>(null);

  async function handleOlvide(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch<{ mensaje: string }>('/api/auth/olvide-password', {
        method: 'POST',
        body: { email: String(form.get('email')) },
      });
      setMensajeOlvide(data.mensaje);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo procesar la solicitud');
    } finally {
      setCargando(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get('email')), String(form.get('password')));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const form = new FormData(e.currentTarget);
    try {
      await register({
        email: String(form.get('email')),
        password: String(form.get('password')),
        tipo: String(form.get('tipo')) as 'PUBLICADOR' | 'TRANSPORTADOR',
        nombre: String(form.get('nombre')),
        ciudad: String(form.get('ciudad')),
        telefono: String(form.get('telefono')),
        documento: String(form.get('documento')),
        aceptaTerminos,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Accede a tu cuenta</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Publica carga o encuentra transporte disponible.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} onValueChange={() => setError(null)}>
          <TabsList className="w-full bg-zinc-900">
            <TabsTrigger value="login" className="flex-1">Ingresar</TabsTrigger>
            <TabsTrigger value="registro" className="flex-1">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            {modoOlvide ? (
              mensajeOlvide ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300">{mensajeOlvide}</p>
                  <Button
                    variant="ghost"
                    className="w-full text-zinc-400"
                    onClick={() => {
                      setModoOlvide(false);
                      setMensajeOlvide(null);
                    }}
                  >
                    Volver a ingresar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleOlvide} className="space-y-3">
                  <p className="text-sm text-zinc-400">
                    Escribe tu correo y te enviamos un enlace para elegir una nueva contraseña.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="olvide-email" className="text-zinc-400">Correo</Label>
                    <Input id="olvide-email" name="email" type="email" autoComplete="email" required className="border-zinc-700 bg-zinc-900 text-white" />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                    {cargando ? 'Enviando…' : 'Enviar enlace'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-zinc-400" onClick={() => setModoOlvide(false)}>
                    Volver
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-zinc-400">Correo</Label>
                  <Input id="login-email" name="email" type="email" autoComplete="email" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-zinc-400">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" autoComplete="current-password" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                  {cargando ? 'Ingresando…' : 'Ingresar'}
                </Button>
                <button
                  type="button"
                  onClick={() => setModoOlvide(true)}
                  className="w-full text-center text-xs text-zinc-500 hover:text-orange-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="registro" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="registro-tipo" className="text-zinc-400">Soy…</Label>
                <Select name="tipo" defaultValue={defaultTipo}>
                  <SelectTrigger id="registro-tipo" className="border-zinc-700 bg-zinc-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                    <SelectItem value="TRANSPORTADOR">Transportador — busco carga</SelectItem>
                    <SelectItem value="PUBLICADOR">Publicador — tengo carga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="registro-nombre" className="text-zinc-400">Nombre</Label>
                  <Input id="registro-nombre" name="nombre" autoComplete="name" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registro-ciudad" className="text-zinc-400">Ciudad</Label>
                  <Input id="registro-ciudad" name="ciudad" autoComplete="address-level2" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="registro-telefono" className="text-zinc-400">Teléfono</Label>
                  <Input id="registro-telefono" name="telefono" autoComplete="tel" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registro-documento" className="text-zinc-400">Cédula</Label>
                  <Input id="registro-documento" name="documento" autoComplete="off" required minLength={6} className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registro-email" className="text-zinc-400">Correo</Label>
                <Input id="registro-email" name="email" type="email" autoComplete="email" required className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registro-password" className="text-zinc-400">Contraseña</Label>
                <Input id="registro-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="acepta-terminos"
                  checked={aceptaTerminos}
                  onCheckedChange={(v) => setAceptaTerminos(v === true)}
                  className="mt-0.5 border-zinc-600"
                />
                <Label htmlFor="acepta-terminos" className="text-xs font-normal leading-snug text-zinc-400">
                  Acepto los{' '}
                  <a href="/legal/terminos.html" target="_blank" rel="noopener" className="text-orange-400 underline">
                    Términos y Condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/legal/politica-datos.html" target="_blank" rel="noopener" className="text-orange-400 underline">
                    Política de Tratamiento de Datos
                  </a>
                  .
                </Label>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                disabled={cargando || !aceptaTerminos}
                className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400"
              >
                {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
