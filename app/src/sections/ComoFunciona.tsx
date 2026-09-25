import { FileText, LockOpen, Truck, ShieldCheck, Fingerprint, Award, Check } from 'lucide-react';

const PASOS = [
  {
    icono: FileText,
    titulo: 'Publica gratis',
    texto: 'Registra tu carga en minutos: origen, destino, toneladas y vehículo. La calculadora te muestra el piso legal y no te deja ofrecer por debajo.',
  },
  {
    icono: LockOpen,
    titulo: 'El transportador desbloquea',
    texto: 'Ve la carga completa menos el contacto. Paga el desbloqueo (6%, entre $15.000 y $100.000) o lo usa de su membresía. Al que publica no se le cobra nada.',
  },
  {
    icono: Truck,
    titulo: 'Acuerdan y viajan',
    texto: 'Hablan directo, con el flete pactado siempre sobre el piso SICE-TAC y alertas de accidentes y cierres de vía en tiempo real.',
  },
];

// Honesto sobre el estado real: hoy el registro pide correo, teléfono y
// cédula (autodeclarada, ver schema.prisma). Las validaciones contra RNEC,
// RUNT, etc. todavía no existen -- se marcan "Próximamente", no como hechas.
const NIVELES = [
  {
    icono: ShieldCheck,
    nivel: 'Nivel 1 · Básico',
    para: 'Para todos',
    disponible: true,
    items: ['Correo y teléfono de contacto', 'Cédula registrada', 'Aceptación de términos (Ley 1581)'],
  },
  {
    icono: Fingerprint,
    nivel: 'Nivel 2 · Verificado',
    para: 'Para desbloquear cargas',
    disponible: false,
    items: ['Validación documental RNEC', 'Consulta RUNT del vehículo', 'SOAT y tecnomecánica vigentes', 'Habilitación MinTransporte'],
  },
  {
    icono: Award,
    nivel: 'Nivel 3 · Premium',
    para: 'Opcional',
    disponible: false,
    items: ['Antecedentes judiciales', 'Licencia de conducción vigente', 'Prioridad en el listado'],
  },
];

export default function ComoFuncionaYVerificacion() {
  return (
    <>
      <section id="como-funciona" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-600">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
              De la publicación al viaje, en 3 pasos
            </h2>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <paso.icono className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-zinc-400">Paso {i + 1}</span>
                  {i < PASOS.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-zinc-200 md:block" />}
                </div>
                <h3 className="mt-5 text-xl font-bold text-zinc-950">{paso.titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="verificacion" className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-600">Confianza</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-[2.5rem] sm:leading-tight">
              Verificación en 3 niveles
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
              La confianza que hoy solo da "el conocido de la cooperativa", ahora en un perfil verificable.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {NIVELES.map((n) => (
              <div key={n.nivel} className="flex flex-col rounded-[28px] bg-white p-7 shadow-suave">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950">
                    <n.icono className="h-5 w-5" />
                  </span>
                  {n.disponible ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Activo</span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">Próximamente</span>
                  )}
                </div>
                <h3 className="mt-5 text-lg font-bold text-zinc-950">{n.nivel}</h3>
                <p className="text-sm text-zinc-500">{n.para}</p>
                <ul className="mt-5 space-y-2.5">
                  {n.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${n.disponible ? 'text-emerald-600' : 'text-zinc-400'}`} strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-xs text-zinc-500">
            Los datos sensibles se tratarán solo con consentimiento expreso y separado, conforme a la Ley 1581
            de 2012, y nunca serán obligatorios para usar la plataforma.
          </p>
        </div>
      </section>
    </>
  );
}
