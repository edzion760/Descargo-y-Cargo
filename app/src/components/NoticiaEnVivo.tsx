import { useEffect, useState } from 'react';
import { useNoticiasVia } from '@/lib/use-noticias';

const TIPO_NOTICIA: Record<string, string> = {
  ACCIDENTE: 'Accidente',
  CIERRE_VIA: 'Cierre de vía',
  VIA_LIBRE: 'Vía libre',
  CONDICION_CLIMA: 'Clima',
  INFO: 'Vías',
};

// Chip "En vivo" que rota las noticias de vías cada 5 s.
export default function NoticiaEnVivo({ className = '' }: { className?: string }) {
  const noticias = useNoticiasVia();
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (noticias.length < 2) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % noticias.length), 5000);
    return () => clearInterval(t);
  }, [noticias.length]);

  const noticia = noticias[indice % Math.max(noticias.length, 1)];
  if (!noticia) return null;

  return (
    <a
      href={noticia.url}
      target="_blank"
      rel="noopener"
      key={noticia.id}
      className={`group inline-flex max-w-full items-center gap-2.5 rounded-full bg-zinc-100 py-1.5 pl-1.5 pr-4 text-sm transition-colors hover:bg-zinc-200 ${className}`}
    >
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-zinc-950 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        En vivo
      </span>
      <span className="truncate text-zinc-700">
        <span className="font-semibold text-zinc-950">{TIPO_NOTICIA[noticia.tipo]}:</span> {noticia.titulo}
      </span>
    </a>
  );
}
