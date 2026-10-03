/* ---------- ajudante do app (service worker) ----------
   Com internet: sempre busca a versão nova do site (as atualizações chegam na hora) e guarda uma cópia.
   Sem internet: abre a cópia guardada. Login, ranking (Firebase), YouTube e Spotify não passam por aqui. */
const CACHE = 'pomodoro-app-v4';
const BASE = ['./', './index.html', './privacidade.html', './css/style.css', './manifest.webmanifest', './icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // só os arquivos do próprio site
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
