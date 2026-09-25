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

function irA(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
  const [consulta, setConsulta] = useState<Consulta | null>(null);

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
    </AccionesProvider>
  );
}
