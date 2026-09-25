import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import AuthDialog from '@/components/AuthDialog';
import PublicarCargaDialog from '@/components/PublicarCargaDialog';
import { AccionesContext } from '@/lib/acciones-context';
import type { Tipo } from '@/lib/auth-context';
import { useAuth } from '@/lib/use-auth';

export default function AccionesProvider({ children }: { children: ReactNode }) {
  const { tipo } = useAuth();
  const [auth, setAuth] = useState<{ abierto: boolean; tab: 'login' | 'registro'; tipo: Tipo }>({
    abierto: false,
    tab: 'registro',
    tipo: 'PUBLICADOR',
  });
  const [publicarAbierto, setPublicarAbierto] = useState(false);

  function abrirAuth(tab: 'login' | 'registro', tipoCuenta: Tipo) {
    setAuth({ abierto: true, tab, tipo: tipoCuenta });
  }

  function publicar() {
    if (!tipo) return abrirAuth('registro', 'PUBLICADOR');
    if (tipo === 'TRANSPORTADOR') {
      toast.info('Tu cuenta es de transportador', {
        description: 'Para publicar carga, ingresa con una cuenta de publicador.',
      });
      return;
    }
    setPublicarAbierto(true);
  }

  function soyTransportador() {
    if (tipo) {
      document.querySelector('#cargas')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    abrirAuth('registro', 'TRANSPORTADOR');
  }

  return (
    <AccionesContext.Provider
      value={{
        publicar,
        soyTransportador,
        ingresar: () => abrirAuth('login', 'TRANSPORTADOR'),
        registrarse: () => abrirAuth('registro', 'TRANSPORTADOR'),
      }}
    >
      {children}
      {/* key: el formulario de registro usa defaultValue (no controlado), así
          que se remonta al cambiar de pestaña/tipo para tomar el valor nuevo. */}
      <AuthDialog
        key={auth.tab + auth.tipo}
        open={auth.abierto}
        onOpenChange={(abierto) => setAuth((a) => ({ ...a, abierto }))}
        defaultTab={auth.tab}
        defaultTipo={auth.tipo}
      />
      <PublicarCargaDialog
        open={publicarAbierto}
        onOpenChange={setPublicarAbierto}
        onPublicada={() => window.dispatchEvent(new Event('cargas:publicada'))}
      />
    </AccionesContext.Provider>
  );
}
