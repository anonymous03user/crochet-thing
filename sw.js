/* Cricket's Crochet Toolkit — ONE service worker for the whole toolkit.
   Registered (as ../sw.js) from the hub AND from every tool page, so a single install
   caches the hub + all three tools and the whole toolkit opens offline.
   Strategy: network-first (updates arrive when online), cache fallback offline. */
var CACHE = 'crochet-toolkit-v1';
var ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'stash/', 'stash/index.html', 'stash/icons/icon-192.png',
  'chart/', 'chart/index.html', 'chart/icons/icon-192.png',
  'substitute/', 'substitute/index.html', 'substitute/icons/icon-192.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      // clear this worker's old versions AND the three retired per-app caches
      return Promise.all(keys.map(function(k){ if(k !== CACHE && k.indexOf('crochet-') === 0) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(req.url.indexOf('http') !== 0) return;
  // never intercept cross-origin requests (e.g. the Ravelry proxy)
  if(new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ try{ c.put(req, copy); }catch(_){} });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){
        if(m) return m;
        // offline navigation: try the directory's index.html, then the hub
        if(req.mode === 'navigate'){
          var p = new URL(req.url).pathname;
          if(p.charAt(p.length-1) === '/') p += 'index.html';
          return caches.match(p).then(function(m2){ return m2 || caches.match('./'); });
        }
      });
    })
  );
});
