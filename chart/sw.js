/* Crochet Toolkit — Chart Generator — offline service worker.
   Caches the app shell so the Home-Screen app opens with no internet.
   Strategy: network-first (so updates show when online), fall back to cache offline. */
var CACHE = 'crochet-chart-v1';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(req.url.indexOf('http') !== 0) return;
  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ try{ c.put(req, copy); }catch(_){} });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match('index.html') || caches.match('./'); });
    })
  );
});
