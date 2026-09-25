import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcciones } from '@/lib/use-acciones';

export default function CtaFinal() {
  const { publicar, soyTransportador } = useAcciones();

  return (
    <section className="bg-white px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-zinc-950 px-6 py-14 sm:px-14 sm:py-20">
        <div aria-hidden className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-500/25 blur-3xl" />
        <div aria-hidden className="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Tu próxima carga, al precio justo y legal
          </h2>
          <p className="mt-4 text-lg text-zinc-400">Publicar es gratis. Ver el listado también.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={publicar} className="gap-2 bg-white text-zinc-950 hover:bg-zinc-200">
              Publicar carga gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={soyTransportador}
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Soy transportador
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
