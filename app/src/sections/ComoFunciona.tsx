import { FileText, Lock, Truck, ShieldCheck, Fingerprint, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const PASOS = [
  {
    icono: FileText,
    titulo: '1. Publica gratis',
    texto: 'El publicador registra su carga en 5 minutos: origen, destino, toneladas y fotos. La calculadora SICE-TAC le sugiere el precio justo y legal.',
  },
  {
    icono: Lock,
    titulo: '2. Desbloquea el contacto',
    texto: 'El transportador ve la carga completa menos el contacto. Paga el desbloqueo (3% o mínimo $15.000) o usa su membresía. Así monetizamos sin cobrarle al que publica.',
  },
  {
    icono: Truck,
    titulo: '3. Viaja con cumplimiento',
    texto: 'Contrato digital firmado (Ley 527), datos listos para el manifiesto RNDC, GPS reportando tiempos de cargue/descargue y entrega confirmada con OTP + foto + firma.',
  },
];

const NIVELES = [
  {
    icono: ShieldCheck,
    nivel: 'Nivel 1 · Básico',
    obligatorio: 'Para todos',
    color: 'border-zinc-700',
    items: ['Email verificado (OTP)', 'Teléfono verificado (SMS)', 'Documento de identidad'],
  },
  {
    icono: Fingerprint,
    nivel: 'Nivel 2 · Verificado',
    obligatorio: 'Para desbloquear cargas',
    color: 'border-emerald-500/40',
    items: ['Validación documental RNEC', 'Consulta RUNT del vehículo', 'SOAT y tecnomecánica vigentes', 'Habilitación MinTransporte'],
  },
  {
    icono: Award,
    nivel: 'Nivel 3 · Premium',
    obligatorio: 'Opcional · badge dorado',
    color: 'border-amber-500/40',
    items: ['Antecedentes judiciales', 'Biometría facial (opcional)', 'Licencia y certificado de salud', 'Prioridad en el listado'],
  },
];

export default function ComoFuncionaYVerificacion() {
  return (
    <>
      {/* Cómo funciona */}
      <section className="border-b border-zinc-800 bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Cómo funciona</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">De la publicación a la entrega, en 3 pasos</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASOS.map((paso) => (
              <Card key={paso.titulo} className="border-zinc-800 bg-zinc-900/60">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <paso.icono className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{paso.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{paso.texto}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verificación KYC */}
      <section id="verificacion" className="border-b border-zinc-800 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Confianza gremial</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Verificación en 3 niveles</h2>
            <p className="mt-3 text-zinc-400">
              Identidad + habilitación MinTransporte + documentos del vehículo.
              La confianza que hoy solo da "el conocido de la cooperativa", ahora en un perfil verificable.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {NIVELES.map((n) => (
              <Card key={n.nivel} className={`border-zinc-800 bg-zinc-900/60 ${n.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                      <n.icono className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-400">{n.obligatorio}</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{n.nivel}</h3>
                  <ul className="mt-3 space-y-2">
                    {n.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="mt-1 text-emerald-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-zinc-600">
            Los datos sensibles (biometría, antecedentes) se tratan solo con consentimiento expreso
            y separado, conforme a la Ley 1581 de 2012. Nunca son obligatorios para usar la plataforma.
          </p>
        </div>
      </section>
    </>
  );
}
