/* অফলাইনে চালানোর ফাইল। অ্যাপ নতুন করে দিলে V-এর সংখ্যা বাড়ান। */
var V='hisab-fb-v9',EXT='hisab-fb-ext';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];
var CDN=/(^|\.)(gstatic\.com|fonts\.googleapis\.com|cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com)$/;
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!==EXT}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
var r=e.request,u=new URL(r.url);
if(r.method!=='GET')return;
/* ফায়ারবেসের ডেটা/লগইন অনুরোধ কখনো জমা রাখা হয় না */
if(u.origin!==location.origin&&!CDN.test(u.hostname))return;
if(r.mode==='navigate'){
e.respondWith((async function(){
var cache=await caches.open(V);
var net=fetch(r).then(function(res){if(res&&res.ok)cache.put('index.html',res.clone());return res}).catch(function(){return null});
var hit=await cache.match('index.html');
var first=await Promise.race([net,new Promise(function(ok){setTimeout(function(){ok(null)},hit?4000:20000)})]);
return first||hit||(await net)||Response.error()})());
return}
if(u.origin===location.origin){
e.respondWith(caches.match(r).then(function(h){return h||fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res})}));
return}
e.respondWith(caches.open(EXT).then(function(c){return c.match(r).then(function(h){
var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(function(){return h});
return h||net})}))});
