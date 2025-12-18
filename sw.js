
const CACHE_NAME = 'turnos-app-v4';

// Lista completa de archivos locales (código fuente y assets)
const APP_ASSETS = [
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
  '/locales/translations.ts'
];

// Dependencias externas (deben coincidir EXACTAMENTE con el importmap de index.html)
const EXTERNAL_ASSETS = [
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
      console.log('Cacheando archivos para uso offline...');
      // Usamos un enfoque más robusto: intentar cachear todo, pero no fallar si uno solo falla
      return Promise.allSettled(
        [...APP_ASSETS, ...EXTERNAL_ASSETS].map(url => 
          cache.add(url).catch(err => console.warn(`Fallo al cachear: ${url}`, err))
        )
      );
    })
  );
  // Fuerza al SW a activarse inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Si la respuesta es válida, la guardamos en caché para la próxima vez
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Si falla el fetch (offline) y no está en caché, devolvemos el index.html
        // Esto ayuda con las rutas de la SPA
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
