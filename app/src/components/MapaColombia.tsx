import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mapa ilustrativo de actividad en la red — las posiciones y el movimiento
// son animación de ambiente (no telemetría real todavía; eso llega con
// Oferta/Viaje). Las ciudades sí son coordenadas reales de Colombia.

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
];

const EMPRESAS_ACTIVAS = [0, 1, 2, 3, 4, 5, 7, 9]; // índices en CIUDADES

const RUTAS_CAMIONES: { origen: number; destino: number; duracionMs: number; inicio: number }[] = [
  { origen: 0, destino: 1, duracionMs: 9000, inicio: 0.1 },
  { origen: 1, destino: 5, duracionMs: 11000, inicio: 0.4 },
  { origen: 0, destino: 2, duracionMs: 12000, inicio: 0.7 },
  { origen: 3, destino: 4, duracionMs: 6000, inicio: 0.2 },
  { origen: 0, destino: 9, duracionMs: 8000, inicio: 0.55 },
];

const iconoEmpresa = L.divIcon({
  className: '',
  html: `<span class="relative flex h-3 w-3">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
    <span class="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
  </span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const iconoCamion = L.divIcon({
  className: '',
  html: `<span class="text-lg drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">🚛</span>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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

  return <Marker position={posicion} icon={iconoCamion} />;
}

export default function MapaColombia() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/60">
      <div className="h-56 w-full lg:h-full lg:min-h-[220px]">
        <MapContainer
          center={[4.5, -74.5]}
          zoom={5.4}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {EMPRESAS_ACTIVAS.map((i) => (
            <Marker key={CIUDADES[i].nombre} position={[CIUDADES[i].lat, CIUDADES[i].lon]} icon={iconoEmpresa} />
          ))}
          {RUTAS_CAMIONES.map((ruta, i) => (
            <CamionAnimado key={i} {...ruta} />
          ))}
        </MapContainer>
      </div>
      <div className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-2 text-[10px] text-zinc-500">
        🟠 Empresas publicando · 🚛 Transportadores en vía — actividad ilustrativa de cómo se ve la red
      </div>
    </div>
  );
}
