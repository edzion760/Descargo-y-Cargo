import { useState } from 'react';
import AccionesProvider from '@/components/AccionesProvider';
import Navbar from '@/sections/Navbar';
import Hero from '@/sections/Hero';
import Marketplace, { type Busqueda } from '@/sections/Marketplace';
import ParaQuien from '@/sections/ParaQuien';
import Calculadora, { type Consulta } from '@/sections/Calculadora';
import ComoFuncionaYVerificacion from '@/sections/ComoFunciona';
import NoticiasYAlianzas from '@/sections/NoticiasYAlianzas';
import Membresias from '@/sections/Membresias';
import CtaFinal from '@/sections/CtaFinal';
import Footer from '@/sections/Footer';
import AppInicio from './AppInicio';
import CargaCompartida from '@/components/CargaCompartida';

// Abierta como app instalada (ícono en Android/iPhone): el manifiesto la abre
// con ?fuente=app y en modo standalone. Se recuerda en la sesión porque al
// volver de Wompi la URL ya no trae ?fuente=app.
function esModoApp() {
  const params = new URLSearchParams(window.location.search);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (params.get('fuente') === 'app' || standalone) {
    try {
      sessionStorage.setItem('modo-app', '1');
    } catch {
      /* sin almacenamiento: se decide solo por la URL */
    }
    return true;
  }
  try {
    return sessionStorage.getItem('modo-app') === '1';
  } catch {
    return false;
  }
}

function irA(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [modoApp] = useState(esModoApp);

  if (modoApp) {
    return (
      <AccionesProvider>
        <AppInicio />
        <CargaCompartida />
      </AccionesProvider>
    );
  }

  return (
    <AccionesProvider>
      <div className="min-h-screen bg-white text-zinc-950">
        <a
          href="#cargas"
          className="sr-only z-[60] rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al listado de cargas
        </a>
        <Navbar />
        <main>
          <Hero
            onCotizar={(origen, destino) => {
              setConsulta({ origen, destino, n: Date.now() });
              irA('#calculadora');
            }}
            onBuscar={(origen, destino) => {
              setBusqueda(origen || destino ? { origen, destino } : null);
              irA('#cargas');
            }}
          />
          <Marketplace busqueda={busqueda} onLimpiarBusqueda={() => setBusqueda(null)} />
          <ParaQuien />
          <Calculadora consulta={consulta} />
          <ComoFuncionaYVerificacion />
          <NoticiasYAlianzas />
          <Membresias />
          <CtaFinal />
        </main>
        <Footer />
      </div>
      <CargaCompartida />
    </AccionesProvider>
  );
}
