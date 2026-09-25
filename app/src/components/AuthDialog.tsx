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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-zinc-950">Accede a tu cuenta</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Publica carga o encuentra transporte disponible.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} onValueChange={() => setError(null)}>
          <TabsList className="h-11 w-full rounded-xl p-1">
            <TabsTrigger value="login" className="flex-1 rounded-lg font-semibold">Ingresar</TabsTrigger>
            <TabsTrigger value="registro" className="flex-1 rounded-lg font-semibold">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            {modoOlvide ? (
              mensajeOlvide ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-700">{mensajeOlvide}</p>
                  <Button
                    variant="ghost"
                    className="w-full text-zinc-600"
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
                  <p className="text-sm text-zinc-600">
                    Escribe tu correo y te enviamos un enlace para elegir una nueva contraseña.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="olvide-email" className="text-zinc-700">Correo</Label>
                    <Input id="olvide-email" name="email" type="email" autoComplete="email" required />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" disabled={cargando} className="h-12 w-full rounded-xl text-[15px] font-semibold">
                    {cargando ? 'Enviando…' : 'Enviar enlace'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-zinc-600" onClick={() => setModoOlvide(false)}>
                    Volver
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-zinc-700">Correo</Label>
                  <Input id="login-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-zinc-700">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={cargando} className="h-12 w-full rounded-xl text-[15px] font-semibold">
                  {cargando ? 'Ingresando…' : 'Ingresar'}
                </Button>
                <button
                  type="button"
                  onClick={() => setModoOlvide(true)}
                  className="w-full text-center text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="registro" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="registro-tipo" className="text-zinc-700">Soy…</Label>
                <Select name="tipo" defaultValue={defaultTipo}>
                  <SelectTrigger id="registro-tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSPORTADOR">Transportador — busco carga</SelectItem>
                    <SelectItem value="PUBLICADOR">Publicador — tengo carga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="registro-nombre" className="text-zinc-700">Nombre</Label>
                  <Input id="registro-nombre" name="nombre" autoComplete="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registro-ciudad" className="text-zinc-700">Ciudad</Label>
                  <Input id="registro-ciudad" name="ciudad" autoComplete="address-level2" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="registro-telefono" className="text-zinc-700">Teléfono</Label>
                  <Input id="registro-telefono" name="telefono" autoComplete="tel" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registro-documento" className="text-zinc-700">Cédula</Label>
                  <Input id="registro-documento" name="documento" autoComplete="off" required minLength={6} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registro-email" className="text-zinc-700">Correo</Label>
                <Input id="registro-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registro-password" className="text-zinc-700">Contraseña</Label>
                <Input id="registro-password" name="password" type="password" autoComplete="new-password" required minLength={8} />
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="acepta-terminos"
                  checked={aceptaTerminos}
                  onCheckedChange={(v) => setAceptaTerminos(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="acepta-terminos" className="block text-xs font-normal leading-relaxed text-zinc-600">
                  Acepto los{' '}
                  <a href="/legal/terminos.html" target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline">
                    Términos y Condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/legal/politica-datos.html" target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline">
                    Política de Tratamiento de Datos
                  </a>
                  .
                </Label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                type="submit"
                disabled={cargando || !aceptaTerminos}
                className="h-12 w-full rounded-xl text-[15px] font-semibold"
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
