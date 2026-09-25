import Logo from '@/components/Logo';

const COLUMNAS = [
  {
    titulo: 'Plataforma',
    links: [
      { href: '#cargas', label: 'Cargas disponibles' },
      { href: '#calculadora', label: 'Calculadora SICE-TAC' },
      { href: '#como-funciona', label: 'Cómo funciona' },
      { href: '#alertas', label: 'Alertas de vía' },
      { href: '#membresias', label: 'Membresías' },
    ],
  },
  {
    titulo: 'Legal',
    links: [
      { href: '/legal/terminos.html', label: 'Términos y condiciones', externo: true },
      { href: '/legal/politica-datos.html', label: 'Política de tratamiento de datos', externo: true },
      { href: '/legal/eliminar-cuenta.html', label: 'Eliminar mi cuenta', externo: true },
    ],
  },
  {
    titulo: 'Contacto',
    links: [
      { href: 'mailto:descargoycargo@gmail.com', label: 'descargoycargo@gmail.com' },
      { href: 'mailto:descargoycargo@gmail.com?subject=PQRS', label: 'PQRS' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600">
              Plataforma de intermediación tecnológica para el transporte de carga en Colombia. No somos
              empresa de transporte: conectamos a quien despacha con quien transporta, con herramientas de
              cumplimiento legal.
            </p>
          </div>

          {COLUMNAS.map((col) => (
            <div key={col.titulo}>
              <p className="text-sm font-bold text-zinc-950">{col.titulo}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...('externo' in l && l.externo ? { target: '_blank', rel: 'noopener' } : {})}
                      className="text-zinc-600 transition-colors hover:text-zinc-950 hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>© 2026 Descargo &amp; Cargo S.A.S. · NIT 901.563.460-9 · San Gil, Santander</p>
          <p>Marca registrada SIC No. 718651 · Tarifas SICE-TAC de referencia, no oficiales.</p>
        </div>
      </div>
    </footer>
  );
}
