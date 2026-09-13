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

export async function activarAlertasDeVia(token: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Este navegador no soporta notificaciones push');
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('Permiso de notificaciones denegado');

  const posicion = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000 })
  );

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
    token,
    body: { endpoint: json.endpoint, keys: json.keys },
  });
  await apiFetch('/api/push/ubicacion', {
    method: 'POST',
    token,
    body: { lat: posicion.coords.latitude, lon: posicion.coords.longitude },
  });
}
