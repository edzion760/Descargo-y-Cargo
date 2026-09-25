// Origen/destino al estilo de "recogida → destino" de Uber: un círculo y un
// cuadrado unidos por una línea, en un solo bloque. Se usa en el hero, la
// calculadora y el formulario de publicar, para que se sienta igual en todo el sitio.
export default function RutaInputs({
  idPrefijo,
  origen,
  destino,
  onOrigen,
  onDestino,
  requerido = false,
}: {
  idPrefijo: string;
  origen: string;
  destino: string;
  onOrigen: (v: string) => void;
  onDestino: (v: string) => void;
  requerido?: boolean;
}) {
  const campo =
    'h-14 w-full bg-transparent pl-12 pr-4 text-[15px] font-medium text-zinc-950 placeholder:font-normal placeholder:text-zinc-500 outline-none';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-inset ring-transparent transition focus-within:bg-white focus-within:ring-zinc-950">
      {/* Conector visual origen → destino */}
      {/* Centros: origen a 28px, destino a 85px (dos campos de 56px + divisor de 1px). */}
      <span aria-hidden className="pointer-events-none absolute left-[22px] top-[28px] h-[57px] w-px bg-zinc-400" />
      <span aria-hidden className="pointer-events-none absolute left-[18px] top-[23px] h-2.5 w-2.5 rounded-full border-[2.5px] border-zinc-950 bg-white" />
      <span aria-hidden className="pointer-events-none absolute left-[18px] top-[80px] h-2.5 w-2.5 bg-zinc-950" />

      <label htmlFor={`${idPrefijo}-origen`} className="sr-only">Origen</label>
      <input
        id={`${idPrefijo}-origen`}
        value={origen}
        onChange={(e) => onOrigen(e.target.value)}
        placeholder="Ciudad de origen"
        autoComplete="address-level2"
        required={requerido}
        className={campo}
      />
      <div className="ml-12 mr-4 h-px bg-zinc-200" />
      <label htmlFor={`${idPrefijo}-destino`} className="sr-only">Destino</label>
      <input
        id={`${idPrefijo}-destino`}
        value={destino}
        onChange={(e) => onDestino(e.target.value)}
        placeholder="Ciudad de destino"
        autoComplete="address-level2"
        required={requerido}
        className={campo}
      />
    </div>
  );
}
