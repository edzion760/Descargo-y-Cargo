import { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import colombiaGeoJson from '@/data/colombia.geo.json';

// Mapa ilustrativo de actividad en la red — las posiciones y el movimiento
// son animación de ambiente (no telemetría real todavía; eso llega con
// Oferta/Viaje). Las ciudades sí son coordenadas reales de Colombia.
//
// El fondo NO usa tiles de un servidor externo: primero tile.openstreetmap.org
// devolvió 403 en producción (esos servidores son solo para uso ligero, ver
// osm.wiki/Tile_usage_policy), y las tiles gratis de CARTO resultaron pedir
// una API key para tráfico real. Tampoco usa una imagen estática con bounds
// calculados a mano -- ese primer intento (ImageOverlay + coordenadas
// estimadas) dejó camiones y ciudades "flotando" fuera de la silueta porque
// el recuadro geográfico de la imagen era una aproximación, no un dato real.
// En vez de eso, se dibuja el contorno real de Colombia como geometría
// (GeoJSON, Natural Earth 1:50m, solo el polígono continental, dominio
// público) vía <GeoJSON> de Leaflet:
// los marcadores usan las mismas coordenadas lat/lon reales que el contorno,
// así que quedan alineados por construcción, sin calibrar nada a mano.
const ESTILO_COLOMBIA: L.PathOptions = {
  fillColor: '#e4e4e7',
  fillOpacity: 1,
  color: '#ffffff',
  weight: 1.5,
};

const ESTILO_RUTA: L.PathOptions = {
  color: '#a1a1aa',
  weight: 1.5,
  dashArray: '3 6',
  lineCap: 'round',
  interactive: false,
};

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

const iconoEmpresa = L.divIcon({
  className: '',
  html: `<span class="relative flex h-2.5 w-2.5">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
    <span class="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 shadow"></span>
  </span>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// SVG propio (no emoji): un emoji de camión se ve distinto — o directamente
// como una caja vacía — según la fuente de cada sistema operativo.
// Negro con borde blanco, como los carros en el mapa de Uber.
const iconoCamion = L.divIcon({
  className: '',
  html: `<div class="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-white bg-zinc-950 shadow-md shadow-black/30">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Encuadra automáticamente todas las ciudades sin importar el tamaño real
// del contenedor (varía entre móvil y escritorio) — más confiable que fijar
// center/zoom a mano.
function AjustarVista() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(CIUDADES.map((c) => [c.lat, c.lon]));
    // Más margen arriba: ahí va la leyenda flotante.
    map.fitBounds(bounds, { paddingTopLeft: [28, 64], paddingBottomRight: [28, 28] });
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

export default function MapaColombia({ className = 'h-72' }: { className?: string }) {
  return (
    // isolate: Leaflet pone z-index 400-700 en sus panes internos (tiles,
    // marcadores, popups) y su .leaflet-container no abre un contexto de
    // apilamiento propio -- sin "isolate" esos z-index compiten directo
    // contra overlays fixed de toda la página (p. ej. z-50 de los Dialog de
    // shadcn) y el mapa termina pintándose ENCIMA de un modal abierto.
    <div
      className={`relative isolate overflow-hidden rounded-[28px] bg-zinc-50 [background-image:radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:18px_18px] ${className}`}
    >
      <div className="absolute inset-0">
        <MapContainer
          center={[4.5, -74.5]}
          zoom={5}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
          // Zoom fraccional: con el zoomSnap=1 por defecto, fitBounds solo puede
          // usar niveles enteros y Colombia quedaba chiquita en la tarjeta grande.
          zoomSnap={0.1}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          className="h-full w-full"
          style={{ background: 'transparent' }}
        >
          <AjustarVista />
          <GeoJSON data={colombiaGeoJson as GeoJSON.GeoJsonObject} style={ESTILO_COLOMBIA} interactive={false} />
          {RUTAS_CAMIONES.map((r, i) => (
            <Polyline
              key={`ruta-${i}`}
              positions={[
                [CIUDADES[r.origen].lat, CIUDADES[r.origen].lon],
                [CIUDADES[r.destino].lat, CIUDADES[r.destino].lon],
              ]}
              pathOptions={ESTILO_RUTA}
            />
          ))}
          {EMPRESAS_ACTIVAS.map((i) => (
            <Marker key={CIUDADES[i].nombre} position={[CIUDADES[i].lat, CIUDADES[i].lon]} icon={iconoEmpresa} interactive={false} keyboard={false} />
          ))}
          {RUTAS_CAMIONES.map((ruta, i) => (
            <CamionAnimado key={i} {...ruta} />
          ))}
        </MapContainer>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/90 px-3.5 py-2 text-[11px] font-medium text-zinc-600 shadow-suave backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Empresas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-950" /> Transportadores
        </span>
        <span className="text-zinc-400">· ilustrativo</span>
      </div>
    </div>
  );
}
