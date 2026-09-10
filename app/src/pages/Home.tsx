import Navbar from '@/sections/Navbar';
import PanelInicio from '@/sections/PanelInicio';
import Hero from '@/sections/Hero';
import Marketplace from '@/sections/Marketplace';
import Calculadora from '@/sections/Calculadora';
import ComoFuncionaYVerificacion from '@/sections/ComoFunciona';
import NoticiasYAlianzas from '@/sections/NoticiasYAlianzas';
import Membresias from '@/sections/Membresias';
import Footer from '@/sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <Navbar />
      <main>
        <PanelInicio />
        <Hero />
        <Marketplace />
        <Calculadora />
        <ComoFuncionaYVerificacion />
        <NoticiasYAlianzas />
        <Membresias />
      </main>
      <Footer />
    </div>
  );
}
