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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/use-auth';
import { ApiError } from '@/lib/api';

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
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Correo</Label>
                <Input name="email" type="email" required className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Contraseña</Label>
                <Input name="password" type="password" required className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                {cargando ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="registro" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Soy…</Label>
                <Select name="tipo" defaultValue={defaultTipo}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-900 text-white">
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
                  <Label className="text-zinc-400">Nombre</Label>
                  <Input name="nombre" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400">Ciudad</Label>
                  <Input name="ciudad" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-400">Teléfono</Label>
                  <Input name="telefono" required className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400">Cédula</Label>
                  <Input name="documento" required minLength={6} className="border-zinc-700 bg-zinc-900 text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Correo</Label>
                <Input name="email" type="email" required className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Contraseña</Label>
                <Input name="password" type="password" required minLength={8} className="border-zinc-700 bg-zinc-900 text-white" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={cargando} className="w-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400">
                {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
