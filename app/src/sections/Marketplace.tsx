import { useState } from 'react';
import { Lock, LockOpen, MapPin, Weight, CalendarDays, Star, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CARGAS, formatCOP, tarifaDesbloqueo, type Carga } from '@/data/mock';

function TarjetaCarga({ carga }: { carga: Carga }) {
  const [desbloqueada, setDesbloqueada] = useState(false);
  const tarifa = tarifaDesbloqueo(carga.precio);
  const sobrePiso = carga.precio - carga.pisoSiceTac;

  return (
    <Card className={`relative overflow-hidden border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700 ${carga.destacada ? 'ring-1 ring-amber-500/40' : ''}`}>
      {carga.destacada && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-950">
          Destacada
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{carga.titulo}</h3>
              {carga.verificado && <BadgeCheck className="h-4 w-4 text-emerald-400" />}
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">{carga.tipoCarga} · {carga.vehiculoRequerido}</p>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">{carga.tipoPublicacion}</Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span>{carga.origen}</span>
          <span className="text-zinc-600">→</span>
          <span>{carga.destino}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> {carga.toneladas} ton</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Carga: {carga.fechaCarga}</span>
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" /> 4.8</span>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Flete ofrecido</p>
              <p className="text-xl font-bold text-white">{formatCOP(carga.precio)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Piso SICE-TAC</p>
              <p className="text-sm font-semibold text-emerald-400">{formatCOP(carga.pisoSiceTac)} ✓</p>
              <p className="text-[10px] text-zinc-500">+{formatCOP(sobrePiso)} sobre el mínimo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {desbloqueada ? (
            <div className="relative w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              {/* Marca de agua anti-pantallazo: identifica al usuario que revela el dato */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
                <span className="rotate-[-15deg] text-xs font-bold tracking-widest text-emerald-300">
                  USUARIO-4821 · USUARIO-4821 · USUARIO-4821
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold text-emerald-300">Contacto desbloqueado</p>
                  <p className="text-xs text-zinc-400">+57 310 *** 4521 · chat interno habilitado</p>
                  <p className="text-[10px] text-zinc-500">Visible solo para ti · queda registrado en auditoría</p>
                </div>
                <LockOpen className="h-4 w-4 shrink-0 text-emerald-400" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Lock className="h-4 w-4 text-zinc-600" />
                <span className="blur-sm select-none">+57 310 555 4521</span>
              </div>
              <Button
                size="sm"
                onClick={() => setDesbloqueada(true)}
                className="bg-emerald-500 font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                Desbloquear · {formatCOP(tarifa)}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Marketplace() {
  const [filtro, setFiltro] = useState('TODAS');
  const cargasFiltradas = filtro === 'TODAS' ? CARGAS : CARGAS.filter((c) => c.tipoPublicacion === filtro);

  return (
    <section id="cargas" className="border-b border-zinc-800 bg-zinc-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Marketplace</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Cargas disponibles ahora</h2>
            <p className="mt-2 max-w-xl text-zinc-400">
              Publicar es gratis. Ver el listado es gratis. Solo pagas cuando encuentras
              la carga que quieres y desbloqueas el contacto.
            </p>
          </div>
          <Tabs value={filtro} onValueChange={setFiltro}>
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="TODAS">Todas</TabsTrigger>
              <TabsTrigger value="NACIONAL">Nacional</TabsTrigger>
              <TabsTrigger value="URBANA">Urbana</TabsTrigger>
              <TabsTrigger value="BARBACHA">Barbacha</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cargasFiltradas.map((carga) => (
            <TarjetaCarga key={carga.id} carga={carga} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          * Prototipo: el desbloqueo es simulado. En producción se procesa con Wompi (PSE, tarjeta, Nequi)
          y el contacto se habilita tras confirmación del pago.
        </p>

        {/* Protección anti-fuga del dato de contacto */}
        <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm font-semibold text-white">🛡️ El contacto desbloqueado está protegido</p>
          <div className="mt-3 grid gap-3 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
            <p>📵 <strong className="text-zinc-200">Bloqueo de capturas</strong> en la app móvil (FLAG_SECURE en Android, detección en iOS)</p>
            <p>💧 <strong className="text-zinc-200">Marca de agua</strong> con tu ID de usuario sobre cada dato revelado — si se filtra, sabemos quién lo hizo</p>
            <p>📞 <strong className="text-zinc-200">Número enmascarado</strong>: la llamada y el chat pasan por la plataforma, el número real no se muestra completo</p>
            <p>📝 <strong className="text-zinc-200">Auditoría + TyC</strong>: cada revelación queda registrada; compartir el dato con no registrados es causal de expulsión</p>
          </div>
        </div>
      </div>
    </section>
  );
}
