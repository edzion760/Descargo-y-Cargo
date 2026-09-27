import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/use-auth';

// Se muestra a quien aceptó una versión anterior de los Términos. No se
// puede cerrar sin decidir: acepta o cierra sesión (Ley 1581: el uso de
// datos para una finalidad nueva requiere autorización).
export default function TerminosDialog() {
  const { autenticado, terminosPendientes, aceptarTerminos, logout } = useAuth();
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  async function aceptar() {
    setEnviando(true);
    setError(false);
    try {
      await aceptarTerminos();
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AlertDialog open={autenticado && terminosPendientes}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Actualizamos los Términos</AlertDialogTitle>
          <AlertDialogDescription>Versión 1.1 · 26 de septiembre de 2026. Esto cambió:</AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            Cuando un transportador desbloquea una carga, el publicador recibe por correo su{' '}
            <strong className="text-zinc-950">nombre, ciudad, teléfono y placa del vehículo</strong> (nunca la cédula).
          </li>
          <li>Los transportadores registran la placa de su vehículo.</li>
          <li>Incluimos a Resend, el servicio con el que enviamos los correos, en la lista de proveedores.</li>
        </ul>
        <div className="flex items-start gap-2 pt-1">
          <Checkbox id="acepta-v11" checked={acepta} onCheckedChange={(v) => setAcepta(v === true)} className="mt-0.5" />
          <Label htmlFor="acepta-v11" className="block text-xs font-normal leading-relaxed text-zinc-600">
            Acepto los{' '}
            <a href="/legal/terminos.html" target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline">
              Términos y Condiciones
            </a>{' '}
            y la{' '}
            <a href="/legal/politica-datos.html" target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline">
              Política de Tratamiento de Datos
            </a>{' '}
            versión 1.1.
          </Label>
        </div>
        {error && <p className="text-sm text-red-600">No se pudo guardar. Inténtalo de nuevo.</p>}
        <AlertDialogFooter>
          <Button variant="ghost" onClick={logout}>
            Cerrar sesión
          </Button>
          <Button onClick={aceptar} disabled={!acepta || enviando}>
            {enviando ? 'Guardando…' : 'Aceptar y continuar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
