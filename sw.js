
const CACHE_NAME = 'turnos-app-v2';

// Archivos críticos de nuestra app
const APP_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/locales/es.json',
  '/locales/en.json'
];

// Dependencias externas que normalmente requerirían internet
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('App lista para uso Offline');
      return cache.addAll([...APP_ASSETS, ...EXTERNAL_ASSETS]);
    })
  );
});

// Estrategia: "Cache First" (Primero buscar en memoria, si no está, ir a internet)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Guardar nuevas peticiones en caché (por si acaso)
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    }).catch(() => {
      // Si falla todo (no hay internet ni cache), podrías devolver una página offline básica
      return caches.match('/');
    })
  );
});

// Limpiar cachés antiguas al actualizar la app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});
