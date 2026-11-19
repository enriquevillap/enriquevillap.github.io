// Almacenamiento del shell académico en el dispositivo; no sincronización de telemetría.
const CACHE="zni-simulator-v2-shell-20261118-1";
const APP_FILES=["./","./index.html","./style.css","./app.js","./model.js","./reports.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("zni-simulator-v2-shell-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==="navigate"){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
   return response;
  }).catch(async()=>await caches.match(req)||await caches.match("./index.html")));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
   if(response.ok&&new URL(req.url).pathname.startsWith(new URL(self.registration.scope).pathname)){
    const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));
   }
   return response;
 })));
});
