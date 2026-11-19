const VERSION="aquaseven-v3-cache-20261119-1";
const ASSETS=["./","./index.html","./style.css","./app.js","./model.js","./reports.js","./components.js","./plant3d.js","./icon.svg","./manifest.webmanifest"];
self.addEventListener("install",event=>event.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("aquaseven-v3-cache-")&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
const req=event.request, url=new URL(req.url);
if(req.method!=="GET")return;
const origin=self.location.origin;
if(url.origin!==origin&&!url.hostname.endsWith("esm.sh"))return;
if(req.mode==="navigate"){
event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(req,copy)))}return response}).catch(async()=>await caches.match(req)||await caches.match("./index.html")));
return;}
event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok||response.type==="opaque"){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(req,copy)))}return response})));
});