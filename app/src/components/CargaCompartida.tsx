import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { TarjetaCarga, type Carga } from '@/sections/Marketplace';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useAcciones } from '@/lib/use-acciones';

// Abre la ficha de la carga que llegó por enlace (?carga=<id>, el que el
// publicador manda por WhatsApp). Si el transportador debe ingresar para
// desbloquearla, la ficha se vuelve a abrir apenas queda con sesión.
export default function CargaCompartida() {
  const [id] = useState(() => new URLSearchParams(window.location.search).get('carga'));
  const [carga, setCarga] = useState<Carga | null>(null);
  const [abierta, setAbierta] = useState(true);
  const { autenticado, cargando } = useAuth();
  const { registrarse } = useAcciones();

  // Se vuelve a pedir al cambiar la sesión: cambian desbloqueada y esMia.
  useEffect(() => {
    if (!id || cargando) return;
    apiFetch<Carga & { estado: string }>(`/api/cargas/${id}`)
      .then((c) => {
        if (c.estado !== 'DISPONIBLE') {
          toast.info('Esta carga ya no está disponible', { description: 'Mira las demás ofertas publicadas.' });
          return;
        }
        setCarga(c);
        setAbierta(true);
      })
      .catch(() => toast.error('No encontramos esa carga'));
  }, [id, cargando, autenticado]);

  if (!carga) return null;

  return (
    <Drawer open={abierta} onOpenChange={setAbierta}>
      <DrawerContent className="mx-auto max-w-xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <DrawerTitle className="sr-only">Carga compartida</DrawerTitle>
        <DrawerDescription className="sr-only">Ruta, flete y contacto de la carga</DrawerDescription>
        <div className="max-h-[80vh] overflow-y-auto pt-4">
          <TarjetaCarga
            carga={carga}
            onDesbloqueada={() => setCarga({ ...carga, desbloqueada: true })}
            onRequireAuth={() => {
              setAbierta(false);
              registrarse();
            }}
            onEditar={() => setAbierta(false)}
            onCancelada={() => {
              setAbierta(false);
              setCarga(null);
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
