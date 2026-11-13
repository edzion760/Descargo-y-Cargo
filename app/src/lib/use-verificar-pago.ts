import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from './api';
import { useAcciones } from './use-acciones';

// Al volver de pagar en Wompi (?wompi_carga=<id>): el webhook puede tardar
// unos segundos en confirmar, así que se reintenta unas cuantas veces y, al
// confirmarse, se abre "Mis contactos" en vez de dejarlo buscando la tarjeta.
// Lo usan el listado de la web y la pantalla de la app.
export function useVerificarPagoWompi(onConfirmado: () => void) {
  const { misContactos } = useAcciones();
  const [verificandoPago, setVerificandoPago] = useState(false);
  useEffect(() => {
    const cargaId = new URLSearchParams(window.location.search).get('wompi_carga');
    if (!cargaId) return;
    window.history.replaceState({}, '', window.location.pathname);
    setVerificandoPago(true);

    let intentos = 0;
    const intervalo = setInterval(async () => {
      intentos += 1;
      const carga = await apiFetch<{ desbloqueada: boolean }>(`/api/cargas/${cargaId}`).catch(() => null);
      if (carga?.desbloqueada || intentos >= 8) {
        clearInterval(intervalo);
        setVerificandoPago(false);
        if (carga?.desbloqueada) {
          onConfirmado();
          misContactos();
        } else {
          toast.info('Wompi aún no confirma tu pago', {
            description: 'Te llegará un correo apenas se confirme. Tus contactos quedan en el menú › Mis contactos.',
          });
        }
      }
    }, 2500);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return verificandoPago;
}
