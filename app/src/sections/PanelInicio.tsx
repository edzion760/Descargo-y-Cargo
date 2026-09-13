import { useEffect, useState } from 'react';
import { Truck, PackagePlus, Radio, MapPin, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AuthDialog from '@/components/AuthDialog';
import PublicarCargaDialog from '@/components/PublicarCargaDialog';
import MapaColombia from '@/components/MapaColombia';
import { useAuth } from '@/lib/use-auth';
import { useNoticiasVia } from '@/lib/use-noticias';

const TIPO_COLOR: Record<string, string> = {
  ACCIDENTE: 'text-red-400',
  CIERRE_VIA: 'text-amber-400',
  VIA_LIBRE: 'text-orange-400',
  CONDICION_CLIMA: 'text-sky-400',
  INFO: 'text-zinc-400',
};

/**
 * Primera pantalla (PC y celular) según apunte del fundador:
 * - Sección de noticias para el transportador (rotativa)
 * - Botón grande: Quiero transportar (buscar cargas)
 * - Botón grande: Publicar carga
 * - El contenido rota entre pantallas (carrusel automático)
 */
export default function PanelInicio() {
  const [indice, setIndice] = useState(0);
  const [authAbierto, setAuthAbierto] = useState(false);
  const [publicarAbierto, setPublicarAbierto] = useState(false);
  const { tipo } = useAuth();
  const noticias = useNoticiasVia();

  function abrirPublicar() {
    if (!tipo) return setAuthAbierto(true);
    if (tipo === 'TRANSPORTADOR') {
      alert('Esta cuenta es de transportador. Inicia sesión con una cuenta de publicador para publicar carga.');
      return;
    }
    setPublicarAbierto(true);
  }

  useEffect(() => {
    if (noticias.length === 0) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % noticias.length), 4000);
    return () => clearInterval(t);
  }, [noticias.length]);

  const noticia = noticias[indice];

  return (
    <section className="border-b border-zinc-800 bg-zinc-950">
      {/* Ticker de noticias rotativo — titulares reales, ver useNoticiasVia */}
      {noticia && (
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2.5">
            <Badge variant="outline" className="shrink-0 gap-1.5 border-orange-500/30 bg-orange-500/10 text-orange-400">
              <Radio className="h-3 w-3 animate-pulse" /> En vivo
            </Badge>
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener"
              key={indice}
              className="flex min-w-0 items-center gap-2 animate-pulse-once hover:underline"
            >
              <span className={`shrink-0 text-xs font-bold uppercase ${TIPO_COLOR[noticia.tipo]}`}>
                {noticia.tipo.replace('_', ' ')}
              </span>
              <p className="truncate text-sm text-zinc-300">
                {noticia.titulo} — <span className="text-zinc-500">{noticia.fuente}</span>
              </p>
            </a>
            <div className="ml-auto hidden shrink-0 gap-1 sm:flex">
              {noticias.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === indice ? 'w-4 bg-orange-400' : 'w-1.5 bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dos acciones principales + mapa de actividad */}
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <a
            href="#cargas"
            className="group flex items-center justify-between rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-transparent p-6 transition-all hover:border-orange-400/60 hover:from-orange-500/25"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-zinc-950">
                <Truck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Quiero transportar</p>
                <p className="text-sm text-zinc-400">Buscar cargas disponibles cerca de mí</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-orange-400 transition-transform group-hover:translate-x-1" />
          </a>

          <button
            type="button"
            onClick={abrirPublicar}
            className="group flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6 text-left transition-all hover:border-zinc-500 hover:bg-zinc-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-orange-400">
                <PackagePlus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Publicar carga</p>
                <p className="text-sm text-zinc-400">Gratis · llega a miles de transportadores</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-zinc-500 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <MapaColombia />
      </div>

      {/* Cobertura nacional */}
      <div className="mx-auto max-w-7xl px-4 pb-6">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5 text-orange-400" />
          <span>
            Cobertura: <strong className="text-zinc-300">32 departamentos</strong> y{' '}
            <strong className="text-zinc-300">1.122 municipios</strong> de Colombia
          </span>
        </div>
      </div>

      <AuthDialog open={authAbierto} onOpenChange={setAuthAbierto} defaultTab="registro" defaultTipo="PUBLICADOR" />
      <PublicarCargaDialog
        open={publicarAbierto}
        onOpenChange={setPublicarAbierto}
        onPublicada={() => window.dispatchEvent(new Event('cargas:publicada'))}
      />
    </section>
  );
}
