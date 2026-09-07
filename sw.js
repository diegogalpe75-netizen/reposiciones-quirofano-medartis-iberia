/* Service Worker — App Reposiciones Quirófano Medartis
   IMPORTANTE: cambiar CACHE_VERSION en cada actualización de la app
   para que los móviles (Android/iOS) descarguen la versión nueva. */
const CACHE_VERSION = 'medartis-app-v16-2026-09-07';

const CORE = [
  './',
  'index.html'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      return Promise.all(CORE.map(function(url){
        return cache.add(url).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  // manifest e iconos: siempre a red directa, sin pasar por el SW.
  // Chrome los lee al generar el WebAPK y una copia vieja rompe el icono.
  var u = new URL(e.request.url);
  if(/manifest\.json$/.test(u.pathname) || /\/icons\//.test(u.pathname)) return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      const copy = resp.clone();
      caches.open(CACHE_VERSION).then(function(cache){ cache.put(e.request, copy); });
      return resp;
    }).catch(function(){
      return caches.match(e.request, {ignoreSearch:true}).then(function(hit){
        return hit || caches.match('index.html');
      });
    })
  );
});
