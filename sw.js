/* Service Worker: macht das Dashboard installierbar.
   Immer zuerst das Neueste aus dem Netz holen (prüft bei jedem Aufruf, ob es neue Dateien gibt).
   Nur wenn das Netz fehlt, kommen die Dateien aus dem Zwischenspeicher. Daten von Supabase und
   fremde Server (Bootstrap, Schriften) werden nie angefasst. */
const CACHE = 'ls25-app-v1';
const SHELL = ["./", "aufgaben.html", "dashboard.html", "einstellungen.html", "index.html", "infos.html", "logs.html", "mitarbeiter.html", "uebersicht.html", "updatelogs.html", "css/responsive.css", "css/styles.css", "css/theme.css", "js/config.js", "js/data.js", "js/nav.js", "js/script.js", "js/theme-init.js", "js/version.js", "img/logo-nav.png", "img/logo-login.png", "manifest.webmanifest", "img/icons/apple-touch-icon.png", "img/icons/icon-192.png", "img/icons/icon-512.png", "img/icons/icon-maskable-512.png"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req.url, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
