import { useState } from 'react';
import { Truck, ShieldCheck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import AuthDialog from '@/components/AuthDialog';
import { useAuth } from '@/lib/use-auth';

const LINKS = [
  { href: '#cargas', label: 'Cargas' },
  { href: '#calculadora', label: 'Calculadora' },
  { href: '#verificacion', label: 'Verificación' },
  { href: '#alertas', label: 'Alertas vía' },
  { href: '#membresias', label: 'Membresías' },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [authAbierto, setAuthAbierto] = useState(false);
  const { tipo, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950">
            <Truck className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-white">
              Descargo <span className="text-emerald-400">&</span> Cargo
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Logística legal · Colombia</p>
          </div>
          <Badge className="ml-2 hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 sm:flex" variant="outline">
            <ShieldCheck className="h-3 w-3" /> Piso SICE-TAC garantizado
          </Badge>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {tipo ? (
            <Button variant="ghost" className="hidden text-zinc-300 sm:inline-flex" onClick={logout}>
              {tipo === 'PUBLICADOR' ? 'Publicador' : 'Transportador'} · Salir
            </Button>
          ) : (
            <Button variant="ghost" className="hidden text-zinc-300 sm:inline-flex" onClick={() => setAuthAbierto(true)}>
              Ingresar
            </Button>
          )}
          <Button className="bg-emerald-500 font-semibold text-zinc-950 hover:bg-emerald-400">
            Publicar carga gratis
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetContent side="right" className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <SheetHeader>
            <SheetTitle className="text-white">Menú</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {LINKS.map((link) => (
              <SheetClose asChild key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  {link.label}
                </a>
              </SheetClose>
            ))}
            <SheetClose asChild>
              {tipo ? (
                <Button variant="ghost" className="mt-2 justify-start text-zinc-300" onClick={logout}>
                  {tipo === 'PUBLICADOR' ? 'Publicador' : 'Transportador'} · Salir
                </Button>
              ) : (
                <Button variant="ghost" className="mt-2 justify-start text-zinc-300" onClick={() => setAuthAbierto(true)}>
                  Ingresar
                </Button>
              )}
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>

      <AuthDialog open={authAbierto} onOpenChange={setAuthAbierto} />
    </header>
  );
}
