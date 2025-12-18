
const CACHE_NAME = 'turnos-app-v5';

// Lista exhaustiva de todos los recursos necesarios para que la app cargue
const ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/manifest.json',
  '/utils/localStorageUtils.ts',
  '/utils/calendarUtils.ts',
  '/components/CalendarView.tsx',
  '/components/ShiftSetupModal.tsx',
  '/components/OvertimeModal.tsx',
  '/components/MonthlySummary.tsx',
  '/contexts/LanguageContext.tsx',
  '/contexts/ThemeContext.tsx',
  '/contexts/AuthContext.tsx',
  '/hooks/useLanguage.ts',
  '/locales/translations.ts',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0',
  'https://esm.sh/react@^19.2.3/',
  'https://esm.sh/react-dom@^19.2.3/',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cacheando recursos...');
      return cache.addAll(ASSETS).catch(err => {
        console.error('SW: Error cacheando archivos críticos', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First (Priorizar caché) para carga rápida y offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está en caché, lo devolvemos inmediatamente
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no, intentamos ir a la red
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Guardamos en caché lo nuevo que hayamos pedido
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Si la red falla y es una navegación, devolver el index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
