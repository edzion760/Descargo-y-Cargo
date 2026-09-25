import { useEffect, useState } from 'react';
import { Menu, UserRound, LogOut, Trash2, PackagePlus, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';

const LINKS = [
  { href: '#cargas', label: 'Cargas' },
  { href: '#calculadora', label: 'Calcular flete' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#alertas', label: 'Alertas de vía' },
  { href: '#membresias', label: 'Membresías' },
];

export default function Navbar() {
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const { tipo, logout, eliminarCuenta } = useAuth();
  const { publicar, ingresar, registrarse } = useAcciones();

  // Borde/sombra solo al hacer scroll, como Airbnb: arriba del todo el navbar
  // se funde con el hero.
  useEffect(() => {
    const alScroll = () => setConSombra(window.scrollY > 8);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  async function confirmarEliminar() {
    await eliminarCuenta();
    setEliminarAbierto(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-shadow ${
        conSombra ? 'shadow-[0_1px_0_rgb(0_0_0/0.06),0_4px_12px_rgb(0_0_0/0.04)]' : ''
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Descargo & Cargo, inicio" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button onClick={publicar} className="hidden h-11 rounded-full px-5 font-semibold sm:inline-flex">
            Publicar carga
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menú de cuenta"
                className="flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white pl-3.5 pr-1.5 transition-shadow hover:shadow-flotante focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <Menu className="h-4 w-4 text-zinc-700" />
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    tipo ? 'bg-zinc-950 text-white' : 'bg-zinc-500 text-white'
                  }`}
                >
                  {tipo ? (tipo === 'PUBLICADOR' ? 'P' : 'T') : <UserRound className="h-[18px] w-[18px]" />}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl p-2 shadow-elevada">
              {tipo ? (
                <DropdownMenuLabel className="px-3 py-2">
                  <span className="block text-xs font-medium text-zinc-500">Sesión iniciada como</span>
                  <span className="text-sm font-semibold text-zinc-950">
                    {tipo === 'PUBLICADOR' ? 'Publicador de carga' : 'Transportador'}
                  </span>
                </DropdownMenuLabel>
              ) : (
                <>
                  <DropdownMenuItem onSelect={ingresar} className="rounded-lg px-3 py-2.5 font-semibold">
                    <LogIn /> Ingresar
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={registrarse} className="rounded-lg px-3 py-2.5">
                    <UserPlus /> Crear cuenta
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onSelect={publicar} className="rounded-lg px-3 py-2.5 sm:hidden">
                <PackagePlus /> Publicar carga
              </DropdownMenuItem>
              {LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-3 py-2.5 lg:hidden">
                  <a href={link.href}>{link.label}</a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5">
                <a href="mailto:descargoycargo@gmail.com">Ayuda y PQRS</a>
              </DropdownMenuItem>

              {tipo && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onSelect={logout} className="rounded-lg px-3 py-2.5">
                    <LogOut /> Cerrar sesión
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setEliminarAbierto(true)}
                    className="rounded-lg px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    <Trash2 className="text-red-600" /> Eliminar mi cuenta
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={eliminarAbierto} onOpenChange={setEliminarAbierto}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu nombre, teléfono y documento se eliminan de la plataforma de inmediato y no podrás volver a
              iniciar sesión con esta cuenta. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEliminar} className="rounded-xl bg-red-600 text-white hover:bg-red-500">
              Sí, eliminar mi cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
