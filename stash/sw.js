/* RETIRED — the toolkit now uses ONE service worker at ../sw.js (Cricket's Crochet Toolkit).
   This file stays only so previously-installed copies fetch it on their next update check,
   clean up after themselves, and hand control to the toolkit-wide worker. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.filter(function(k){ return k.indexOf('crochet-stash') === 0; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({ type: 'window' }); })
      .then(function(clients){ clients.forEach(function(c){ try{ c.navigate(c.url); }catch(_){} }); })
  );
});
