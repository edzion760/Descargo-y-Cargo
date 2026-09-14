import { useEffect, useRef, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mapa ilustrativo de actividad en la red — las posiciones y el movimiento
// son animación de ambiente (no telemetría real todavía; eso llega con
// Oferta/Viaje). Las ciudades sí son coordenadas reales de Colombia.
//
// El fondo NO usa tiles de un servidor externo: primero tile.openstreetmap.org
// devolvió 403 en producción (esos servidores son solo para uso ligero, ver
// osm.wiki/Tile_usage_policy), y las tiles gratis de CARTO resultaron pedir
// una API key para tráfico real. En vez de seguir dependiendo de un tercero,
// se usa una imagen estática propia (app/public/mapas/colombia-oscuro.png,
// recoloreada del blanco original a partir de "Colombiamapblank.png" de
// Wikimedia Commons, dominio público) posicionada con coordenadas reales
// vía ImageOverlay -- cero llamadas de red, cero riesgo de que la bloqueen.
const MAPA_BOUNDS: [[number, number], [number, number]] = [
  [-4.5, -81.35],
  [12.5, -66.65],
];

interface Ciudad {
  nombre: string;
  lat: number;
  lon: number;
}

const CIUDADES: Ciudad[] = [
  { nombre: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { nombre: 'Medellín', lat: 6.2442, lon: -75.5812 },
  { nombre: 'Cali', lat: 3.4516, lon: -76.532 },
  { nombre: 'Barranquilla', lat: 10.9685, lon: -74.7813 },
  { nombre: 'Cartagena', lat: 10.391, lon: -75.4794 },
  { nombre: 'Bucaramanga', lat: 7.1193, lon: -73.1227 },
  { nombre: 'Pereira', lat: 4.8133, lon: -75.6961 },
  { nombre: 'Manizales', lat: 5.0703, lon: -75.5138 },
  { nombre: 'Villavicencio', lat: 4.142, lon: -73.6266 },
  { nombre: 'Neiva', lat: 2.9273, lon: -75.2819 },
  { nombre: 'Santa Marta', lat: 11.2408, lon: -74.199 },
  { nombre: 'Montería', lat: 8.7479, lon: -75.8814 },
  { nombre: 'Buenaventura', lat: 3.8801, lon: -77.0312 },
  { nombre: 'Leticia', lat: -4.2153, lon: -69.9406 },
  { nombre: 'Maicao', lat: 11.3548, lon: -72.24 },
  { nombre: 'Arauca', lat: 7.0847, lon: -70.759 },
  { nombre: 'Inírida', lat: 3.8653, lon: -67.9239 },
  { nombre: 'Puerto Carreño', lat: 6.1891, lon: -67.4859 },
];

// índices en CIUDADES — incluye las periféricas para que el mapa muestre
// cobertura de todo el país, no solo el centro andino.
const EMPRESAS_ACTIVAS = [0, 1, 2, 3, 4, 5, 7, 9, 12, 13, 14, 15, 16, 17];

const RUTAS_CAMIONES: { origen: number; destino: number; duracionMs: number; inicio: number }[] = [
  { origen: 0, destino: 1, duracionMs: 9000, inicio: 0.1 },
  { origen: 1, destino: 5, duracionMs: 11000, inicio: 0.4 },
  { origen: 0, destino: 2, duracionMs: 12000, inicio: 0.7 },
  { origen: 3, destino: 4, duracionMs: 6000, inicio: 0.2 },
  { origen: 0, destino: 9, duracionMs: 8000, inicio: 0.55 },
  { origen: 2, destino: 12, duracionMs: 7000, inicio: 0.3 }, // Cali-Buenaventura: corredor portuario real
  { origen: 0, destino: 15, duracionMs: 14000, inicio: 0.15 }, // Bogotá-Arauca
  { origen: 3, destino: 14, duracionMs: 10000, inicio: 0.6 }, // Barranquilla-Maicao
];

// Verde esmeralda: el color de marca original (antes del cambio a naranja),
// contrasta bien contra los camiones naranjas y contra el mapa.
const iconoEmpresa = L.divIcon({
  className: '',
  html: `<span class="relative flex h-1.5 w-1.5">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
  </span>`,
  iconSize: [6, 6],
  iconAnchor: [3, 3],
});

// SVG propio (no emoji): un emoji de camión se ve distinto — o directamente
// como una caja vacía — según la fuente de cada sistema operativo.
// Tamaño 45% más chico que el original (24px -> 13px).
const iconoCamion = L.divIcon({
  className: '',
  html: `<div class="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-orange-500 shadow-md shadow-black/50">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [13, 13],
  iconAnchor: [6.5, 6.5],
});

// Encuadra automáticamente todas las ciudades sin importar el tamaño real
// del contenedor (varía entre móvil y escritorio) — más confiable que fijar
// center/zoom a mano.
function AjustarVista() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(CIUDADES.map((c) => [c.lat, c.lon]));
    map.fitBounds(bounds, { padding: [16, 16] });
  }, [map]);
  return null;
}

function interpolar(a: Ciudad, b: Ciudad, t: number): [number, number] {
  return [a.lat + (b.lat - a.lat) * t, a.lon + (b.lon - a.lon) * t];
}

function CamionAnimado({ origen, destino, duracionMs, inicio }: (typeof RUTAS_CAMIONES)[number]) {
  const [posicion, setPosicion] = useState<[number, number]>(() =>
    interpolar(CIUDADES[origen], CIUDADES[destino], inicio)
  );
  const marcoRef = useRef<number>(0);

  useEffect(() => {
    const a = CIUDADES[origen];
    const b = CIUDADES[destino];
    const inicioMs = performance.now() - inicio * duracionMs;

    function tick(ahora: number) {
      const progreso = ((ahora - inicioMs) % duracionMs) / duracionMs;
      // va y vuelve (0->1->0) para que el camión recorra la vía en ambos sentidos
      const t = progreso < 0.5 ? progreso * 2 : (1 - progreso) * 2;
      setPosicion(interpolar(a, b, t));
      marcoRef.current = requestAnimationFrame(tick);
    }
    marcoRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(marcoRef.current);
  }, [origen, destino, duracionMs, inicio]);

  return <Marker position={posicion} icon={iconoCamion} interactive={false} keyboard={false} />;
}

export default function MapaColombia() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/60">
      <div className="h-56 w-full lg:h-full lg:min-h-[220px]">
        <MapContainer
          center={[4.5, -74.5]}
          zoom={5}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full"
        >
          <AjustarVista />
          <ImageOverlay url="/mapas/colombia-oscuro.png" bounds={MAPA_BOUNDS} />
          {EMPRESAS_ACTIVAS.map((i) => (
            <Marker key={CIUDADES[i].nombre} position={[CIUDADES[i].lat, CIUDADES[i].lon]} icon={iconoEmpresa} interactive={false} keyboard={false} />
          ))}
          {RUTAS_CAMIONES.map((ruta, i) => (
            <CamionAnimado key={i} {...ruta} />
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-800 bg-zinc-950/80 px-3 py-2 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Empresas publicando
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> Transportadores en vía
        </span>
        <span>— actividad ilustrativa de cómo se ve la red</span>
      </div>
    </div>
  );
}
