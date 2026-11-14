import Navbar from '@/sections/Navbar';
import PanelCargas from '@/components/PanelCargas';
import { useVerificarPagoWompi } from '@/lib/use-verificar-pago';

// Pantalla de inicio cuando se abre como app (Android/iPhone desde el ícono):
// la lista compacta de ofertas con pestañas abajo, como la app de 2022, en
// lugar de la página web completa.
export default function AppInicio() {
  const verificandoPago = useVerificarPagoWompi(() => window.dispatchEvent(new Event('cargas:publicada')));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <PanelCargas variante="app" verificandoPago={verificandoPago} />
    </div>
  );
}
