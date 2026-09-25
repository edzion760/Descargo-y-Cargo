import { Truck } from 'lucide-react';

// Camión blanco sobre fondo negro: la misma idea del logo registrado ante la
// SIC (certificado No. 718651), en versión simplificada para pantalla.
export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          claro ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
        }`}
      >
        <Truck className="h-[18px] w-[18px]" strokeWidth={2.4} />
      </span>
      <span className={`whitespace-nowrap text-[17px] font-extrabold tracking-tight ${claro ? 'text-white' : 'text-zinc-950'}`}>
        Descargo <span className="text-orange-500">&amp;</span> Cargo
      </span>
    </span>
  );
}
