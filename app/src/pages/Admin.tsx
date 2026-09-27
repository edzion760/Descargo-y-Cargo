import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Download, Loader2, MessageCircle, Mail, MapPin, ScanLine, Send } from 'lucide-react';
import { toast } from 'sonner';
import AccionesProvider from '@/components/AccionesProvider';
import EscanearExpositorDialog from '@/components/EscanearExpositorDialog';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { API_URL, ApiError, apiFetch } from '@/lib/api';
import { useAcciones } from '@/lib/use-acciones';
import { useAuth } from '@/lib/use-auth';

interface Lead {
  id: number;
  nombre: string | null;
  telefonos: string;
  email: string | null;
  ciudad: string | null;
  fuente: string;
  notas: string | null;
  fecha: string;
  autorizoCampanas: boolean;
  contactadoEn: string | null;
  noContactar: boolean;
}

// Panel interno. El acceso real lo decide el servidor (requireAdmin); aquí
// solo se evita mostrar la página vacía a quien no es administrador.
export default function Admin() {
  return (
    <AccionesProvider>
      <Contenido />
    </AccionesProvider>
  );
}

function Contenido() {
  const { autenticado, cargando, esAdmin } = useAuth();
  const { ingresar } = useAcciones();

  if (cargando) return <Centro><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></Centro>;
  if (!autenticado)
    return (
      <Centro>
        <p className="text-sm text-zinc-600">Inicia sesión con tu cuenta de administrador.</p>
        <Button onClick={ingresar}>Ingresar</Button>
      </Centro>
    );
  if (!esAdmin)
    return (
      <Centro>
        <p className="text-sm text-zinc-600">Esta sección es solo para administradores.</p>
        <Link to="/" className="text-sm font-semibold underline">Volver a Descargo &amp; Cargo</Link>
      </Centro>
    );
  return <Panel />;
}

function Centro({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">{children}</div>;
}

function Panel() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    apiFetch<Lead[]>('/api/admin/leads')
      .then(setLeads)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los contactos'));
  }, [version]);

  const hoy = useMemo(() => {
    const dia = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
    const hoyStr = dia(new Date().toISOString());
    return leads?.filter((l) => dia(l.fecha) === hoyStr).length ?? 0;
  }, [leads]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/"><Logo /></Link>
          <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">Administrador</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Contactos de ferias y formularios</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Los que llenaron el formulario del QR y los que escaneaste en los stands.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEscaneando(true)} className="gap-2">
              <ScanLine className="h-4 w-4" /> Escanear QR de expositor
            </Button>
            <Button asChild variant="outline" className="gap-2 border-zinc-300">
              <a href={`${API_URL}/api/admin/leads.csv`}>
                <Download className="h-4 w-4" /> Descargar Excel
              </a>
            </Button>
          </div>
        </div>
        <EscanearExpositorDialog open={escaneando} onOpenChange={setEscaneando} onGuardado={() => setVersion((v) => v + 1)} />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
          <Cifra valor={leads?.length ?? '—'} etiqueta="contactos en total" />
          <Cifra valor={leads ? hoy : '—'} etiqueta="registrados hoy" />
        </div>

        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}
        {!leads && !error && (
          <p className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </p>
        )}
        {leads?.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600">
            Todavía no hay contactos. Aparecen aquí cuando alguien llena el formulario (descargoycargo.com/effix) o cuando escaneas el QR de un stand.
          </p>
        )}

        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {leads?.map((l) => (
            <LeadCard key={l.id} lead={l} />
          ))}
        </ul>
      </main>
    </div>
  );
}

function Cifra({ valor, etiqueta }: { valor: number | string; etiqueta: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-suave">
      <p className="text-2xl font-extrabold tabular-nums text-zinc-950">{valor}</p>
      <p className="text-xs text-zinc-500">{etiqueta}</p>
    </div>
  );
}

// Mensaje de presentación que se abre ya escrito en el WhatsApp de quien
// administra; se puede editar antes de enviarlo.
function mensajeWhatsApp(lead: Lead) {
  const contacto = lead.notas?.match(/^Contacto: ([^(·]+)/)?.[1].trim();
  const evento = lead.fuente.split(' · ')[0];
  return (
    `Hola${contacto ? ` ${contacto}` : ''}, le escribo de Descargo & Cargo. Nos conocimos en ${evento}` +
    `${lead.nombre ? ` (stand de ${lead.nombre})` : ''}. Le comparto nuestra plataforma para publicar su carga gratis ` +
    `y encontrar transportador sin pactar fletes por debajo del piso SICE-TAC: https://descargoycargo.com

` +
    `Está recién lanzada y sus comentarios nos ayudan mucho. Si prefiere que no le escribamos más, me dice y listo.`
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [cartaEn, setCartaEn] = useState(lead.contactadoEn);
  const [enviando, setEnviando] = useState(false);
  const telefono = lead.telefonos.split(',')[0].trim();
  async function enviarCarta() {
    setEnviando(true);
    try {
      const r = await apiFetch<{ contactadoEn: string }>(`/api/admin/leads/${lead.id}/carta`, { method: 'POST' });
      setCartaEn(r.contactadoEn);
      toast.success('Carta enviada', { description: lead.email ?? undefined });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo enviar la carta');
    } finally {
      setEnviando(false);
    }
  }

  const fecha = new Date(lead.fecha).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <li className="min-w-0 rounded-2xl bg-white p-4 shadow-suave">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate font-semibold text-zinc-950">{lead.nombre ?? 'Sin nombre'}</p>
        <span className="shrink-0 text-xs text-zinc-500">{fecha}</span>
      </div>
      {lead.notas && <p className="mt-1 text-sm text-zinc-600">{lead.notas}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {telefono && (
          <a
            href={`https://wa.me/57${telefono}?text=${encodeURIComponent(mensajeWhatsApp(lead))}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-700"
          >
            <MessageCircle className="h-4 w-4" /> {telefono}
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="inline-flex min-w-0 items-center gap-1.5 text-zinc-700">
            <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{lead.email}</span>
          </a>
        )}
        {lead.ciudad && (
          <span className="inline-flex items-center gap-1.5 text-zinc-500">
            <MapPin className="h-4 w-4" /> {lead.ciudad}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{lead.fuente}</span>
        {!lead.autorizoCampanas && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Solo seguimiento directo
          </span>
        )}
      </div>
      {lead.email && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          {lead.noContactar ? (
            <p className="text-xs font-medium text-red-600">Pidió no recibir más correos</p>
          ) : cartaEn ? (
            <p className="text-xs text-zinc-500">
              Carta de invitación enviada el{' '}
              {new Date(cartaEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' })}
            </p>
          ) : (
            <Button size="sm" variant="outline" onClick={enviarCarta} disabled={enviando} className="gap-1.5 border-zinc-300">
              {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Enviar carta de invitación
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
