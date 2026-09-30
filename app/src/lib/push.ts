import { apiFetch } from './api';

// application server key para PushManager.subscribe() debe ser un Uint8Array,
// pero el backend la da en base64url (formato estándar VAPID) -- conversión
// estándar, no hay forma más corta sin agregar una librería para esto.
function base64UrlAUint8Array(base64Url: string): Uint8Array {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export type EstadoAvisos = 'activos' | 'disponibles' | 'ios-instalar' | 'bloqueados' | 'no-soportado';

// En iPhone/iPad, Apple solo permite notificaciones web si el sitio está
// agregado a la pantalla de inicio (y se abre desde ese ícono).
export function estadoAvisos(): EstadoAvisos {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (ios && !instalada) return 'ios-instalar';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') return 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueados';
  if (Notification.permission === 'granted') return 'activos';
  return 'disponibles';
}

export async function activarAlertasDeVia(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Este navegador no soporta notificaciones push');
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('Permiso de notificaciones denegado');

  const registro = await navigator.serviceWorker.register('/sw.js');
  const { publicKey } = await apiFetch<{ publicKey: string | null }>('/api/push/clave-publica');
  if (!publicKey) throw new Error('El servidor no tiene configuradas las llaves push todavía');

  const suscripcion = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlAUint8Array(publicKey) as BufferSource,
  });

  const json = suscripcion.toJSON();
  await apiFetch('/api/push/suscribir', {
    method: 'POST',
    body: { endpoint: json.endpoint, keys: json.keys },
  });

  // La ubicación es opcional: sin ella igual llegan los avisos de clima en la
  // ruta de sus viajes; solo se pierden los de accidentes cercanos.
  const posicion = await new Promise<GeolocationPosition | null>((resolve) =>
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: false, timeout: 10000 })
  );
  if (posicion) {
    await apiFetch('/api/push/ubicacion', {
      method: 'POST',
      body: { lat: posicion.coords.latitude, lon: posicion.coords.longitude },
    });
  }
  window.dispatchEvent(new Event('avisos:activados'));
}
