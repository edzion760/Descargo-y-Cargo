import { Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-zinc-950">
                <Truck className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <p className="text-base font-bold text-white">
                Descargo <span className="text-orange-400">&</span> Cargo
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm text-zinc-500">
              Plataforma de intermediación tecnológica para el transporte de carga en Colombia.
              No somos empresa de transporte: conectamos publicadores y transportadores
              con herramientas de cumplimiento legal.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Plataforma</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><a href="#cargas" className="hover:text-orange-400">Cargas disponibles</a></li>
              <li><a href="#calculadora" className="hover:text-orange-400">Calculadora SICE-TAC</a></li>
              <li><a href="#membresias" className="hover:text-orange-400">Membresías</a></li>
              <li><a href="#alertas" className="hover:text-orange-400">Alertas de vía</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-orange-400">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-orange-400">Política de tratamiento de datos</a></li>
              <li><a href="#" className="hover:text-orange-400">Eliminar mi cuenta</a></li>
              <li><a href="#" className="hover:text-orange-400">PQRS</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          © 2026 Descargo & Cargo · Prototipo de demostración — datos y tarifas referenciales, no oficiales.
        </div>
      </div>
    </footer>
  );
}
