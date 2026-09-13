// Service worker mínimo: solo escucha push y muestra la notificación del
// navegador (estilo YouTube/Gmail). No cachea nada, no intercepta fetch.
self.addEventListener('push', (event) => {
  const datos = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(datos.titulo || 'Descargo & Cargo', {
      body: datos.cuerpo || '',
      data: { url: datos.url || '/' },
      tag: datos.url, // reemplaza una notificación previa de la misma noticia en vez de apilar
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/'));
});
