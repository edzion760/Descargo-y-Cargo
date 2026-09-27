import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Printer, Loader2 } from 'lucide-react';
import AccionesProvider from '@/components/AccionesProvider';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/data/mock';
import { ApiError, apiFetch } from '@/lib/api';
import { useAcciones } from '@/lib/use-acciones';
import { useAuth } from '@/lib/use-auth';

interface Parte {
  nombre: string;
  ciudad: string;
  telefono: string;
  placa?: string | null;
}

interface DatosConstancia {
  numero: string;
  fechaDesbloqueo: string;
  carga: {
    titulo: string;
    tipoCarga: string;
    origen: string;
    destino: string;
    toneladas: number;
    precio: number;
    fechaCarga: string;
    vehiculoRequerido: string;
  };
  publicador: Parte;
  transportador: Parte;
}

// Constancia privada entre publicador y transportador para firmar al cargar.
// Se imprime o se guarda como PDF con el diálogo de impresión del navegador
// (window.print): sin librería de PDF, el navegador ya lo hace bien.
export default function Constancia() {
  return (
    <AccionesProvider>
      <Contenido />
    </AccionesProvider>
  );
}

function Contenido() {
  const [params] = useSearchParams();
  const pagoId = params.get('pago') ?? '';
  const { autenticado, cargando } = useAuth();
  const { ingresar } = useAcciones();

  if (cargando) return <Centro><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></Centro>;
  if (!autenticado)
    return (
      <Centro>
        <p className="max-w-sm text-center text-sm text-zinc-600">
          Inicia sesión con la cuenta del publicador o del transportador de esta carga para ver la constancia.
        </p>
        <Button onClick={ingresar}>Ingresar</Button>
      </Centro>
    );
  return <Documento pagoId={pagoId} />;
}

function Centro({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4">{children}</div>;
}

function Documento({ pagoId }: { pagoId: string }) {
  const [datos, setDatos] = useState<DatosConstancia | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DatosConstancia>(`/api/cargas/constancia/${pagoId}`)
      .then(setDatos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar la constancia'));
  }, [pagoId]);

  if (error)
    return (
      <Centro>
        <p className="text-sm text-zinc-700">{error}</p>
        <Link to="/" className="text-sm font-semibold underline">Volver a Descargo &amp; Cargo</Link>
      </Centro>
    );
  if (!datos) return <Centro><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></Centro>;

  const { carga, publicador, transportador } = datos;
  const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'long', timeZone: 'UTC' });

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 print:bg-white print:p-0">
      <style>{'@page { size: A4; margin: 12mm; }'}</style>

      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Volver</Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Imprimir o guardar PDF
        </Button>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white p-8 text-[13px] leading-snug text-zinc-900 shadow-suave print:max-w-none print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-orange-500 pb-4">
          <Logo />
          <div className="text-right">
            <h1 className="text-lg font-extrabold tracking-tight">Constancia de entrega de carga</h1>
            <p className="text-xs text-zinc-500">
              No. {datos.numero} · Desbloqueo del {fecha(datos.fechaDesbloqueo)}
            </p>
          </div>
        </header>

        <p className="mt-4 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700 print:border print:border-zinc-300 print:bg-white">
          Documento privado entre las partes, para dejar constancia de la entrega de la mercancía al transportador.{' '}
          <strong>No reemplaza el manifiesto electrónico de carga</strong>, que debe registrarse en el RNDC del
          Ministerio de Transporte y expedirlo una empresa de transporte habilitada.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-2">
          <Seccion titulo="Remitente (quien entrega)">
            <Dato etiqueta="Nombre / razón social" valor={publicador.nombre} />
            <Dato etiqueta="Ciudad" valor={publicador.ciudad} />
            <Dato etiqueta="Teléfono" valor={publicador.telefono} />
            <Dato etiqueta="C.C. / NIT" />
          </Seccion>
          <Seccion titulo="Transportador (quien recibe)">
            <Dato etiqueta="Nombre" valor={transportador.nombre} />
            <Dato etiqueta="Teléfono" valor={transportador.telefono} />
            <Dato etiqueta="Placa del vehículo (declarada)" valor={transportador.placa ?? undefined} />
            <Dato etiqueta="Placa del remolque (si aplica)" />
            <Dato etiqueta="C.C." />
            <Dato etiqueta="Licencia de conducción No." />
          </Seccion>
        </div>

        <Seccion titulo="Carga" className="mt-5">
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 print:grid-cols-2">
            <Dato etiqueta="Descripción" valor={carga.titulo} />
            <Dato etiqueta="Tipo de carga" valor={carga.tipoCarga} />
            <Dato etiqueta="Ruta" valor={`${carga.origen} → ${carga.destino}`} />
            <Dato etiqueta="Peso publicado" valor={`${carga.toneladas} ton`} />
            <Dato etiqueta="Fecha de cargue publicada" valor={fecha(carga.fechaCarga)} />
            <Dato etiqueta="Vehículo requerido" valor={carga.vehiculoRequerido} />
            <Dato etiqueta="Flete publicado" valor={formatCOP(carga.precio)} />
            <Dato etiqueta="Flete pactado" />
            <Dato etiqueta="Unidades / empaque" />
            <Dato etiqueta="Peso real cargado" />
          </div>
        </Seccion>

        <Seccion titulo="Manifiesto de carga (RNDC)" className="mt-5">
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 print:grid-cols-2">
            <Dato etiqueta="No. de manifiesto" />
            <Dato etiqueta="Empresa de transporte que lo expide" />
          </div>
        </Seccion>

        <Seccion titulo="Estado de la mercancía y observaciones" className="mt-5">
          <Linea />
          <Linea />
          <Linea />
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 print:grid-cols-2">
            <Dato etiqueta="Fecha de entrega" />
            <Dato etiqueta="Hora" />
          </div>
        </Seccion>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 print:grid-cols-2">
          <Firma titulo="Entrega — remitente" />
          <Firma titulo="Recibe — transportador" />
        </div>

        <footer className="mt-8 border-t border-zinc-200 pt-3 text-[10.5px] text-zinc-500">
          Generada en descargoycargo.com a partir del desbloqueo {datos.numero}. Descargo &amp; Cargo SAS (NIT
          901.563.460-9) es una plataforma de intermediación: no es parte del contrato de transporte ni responde por
          la mercancía.
        </footer>
      </article>
    </div>
  );
}

function Seccion({ titulo, className = '', children }: { titulo: string; className?: string; children: ReactNode }) {
  return (
    <section className={`break-inside-avoid ${className}`}>
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-orange-600">{titulo}</h2>
      {children}
    </section>
  );
}

// Con valor: dato impreso. Sin valor: renglón en blanco para llenar a mano.
function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div className="flex min-w-0 items-end gap-2 border-b border-zinc-300 py-1.5">
      <span className="shrink-0 text-[11px] text-zinc-500">{etiqueta}:</span>
      <span className="min-w-0 truncate font-semibold">{valor ?? ''}</span>
    </div>
  );
}

function Linea() {
  return <div className="h-7 border-b border-zinc-300" />;
}

function Firma({ titulo }: { titulo: string }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex items-end gap-3">
        <div className="h-16 flex-1 border-b border-zinc-900" />
        <div className="flex h-20 w-16 shrink-0 items-end justify-center border border-zinc-300 pb-1 text-[9px] text-zinc-400">
          Huella
        </div>
      </div>
      <p className="mt-1 text-xs font-semibold">{titulo}</p>
      <p className="text-[11px] text-zinc-500">Nombre y C.C.: ______________________</p>
    </div>
  );
}
