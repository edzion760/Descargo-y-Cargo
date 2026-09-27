import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import AuthDialog from '@/components/AuthDialog';
import MisContactosDialog from '@/components/MisContactosDialog';
import PublicarCargaDialog from '@/components/PublicarCargaDialog';
import TerminosDialog from '@/components/TerminosDialog';
import { AccionesContext } from '@/lib/acciones-context';
import type { Tipo } from '@/lib/auth-context';
import { useAuth } from '@/lib/use-auth';

export default function AccionesProvider({ children }: { children: ReactNode }) {
  const { tipo, cargando } = useAuth();
  const [auth, setAuth] = useState<{ abierto: boolean; tab: 'login' | 'registro'; tipo: Tipo }>({
    abierto: false,
    tab: 'registro',
    tipo: 'PUBLICADOR',
  });
  const [publicarAbierto, setPublicarAbierto] = useState(false);
  const [contactosAbierto, setContactosAbierto] = useState(false);
  // El botón del correo "Pago confirmado" llega con ?mis_contactos. Si no hay
  // sesión (otro dispositivo), se pide ingresar y se abre al quedar logueado
  // como transportador.
  const [contactosPendiente, setContactosPendiente] = useState(() =>
    new URLSearchParams(window.location.search).has('mis_contactos')
  );
  const verContactos = contactosAbierto || (contactosPendiente && tipo === 'TRANSPORTADOR');
  const loginPedido = useRef(false);

  function abrirAuth(tab: 'login' | 'registro', tipoCuenta: Tipo) {
    setAuth({ abierto: true, tab, tipo: tipoCuenta });
  }

  function misContactos() {
    if (tipo === 'TRANSPORTADOR') return setContactosAbierto(true);
    loginPedido.current = false;
    setContactosPendiente(true);
  }

  // Espera a que la sesión se restaure antes de decidir. El login se abre
  // una sola vez: si lo cierra sin ingresar no se le reabre en bucle.
  useEffect(() => {
    if (!contactosPendiente || cargando) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (tipo === 'PUBLICADOR') {
      toast.info('Tu cuenta es de publicador', {
        description: 'Ingresa con la cuenta de transportador con la que pagaste.',
      });
    } else if (!tipo && !loginPedido.current) {
      loginPedido.current = true;
      // Reacciona a un evento externo (terminó de restaurarse la sesión) y
      // corre una sola vez por el ref: no hay renders en cascada.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      abrirAuth('login', 'TRANSPORTADOR');
    }
  }, [contactosPendiente, tipo, cargando]);

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
        misContactos,
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
      <TerminosDialog />
      <MisContactosDialog
        open={verContactos}
        onOpenChange={(abierto) => {
          setContactosAbierto(abierto);
          if (!abierto) setContactosPendiente(false);
        }}
      />
    </AccionesContext.Provider>
  );
}
