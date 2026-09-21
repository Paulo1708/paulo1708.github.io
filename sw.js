/* Service worker: o app inteiro fica em cache na primeira visita.
   A partir daí abre sem rede — que é o ponto de um app de escrita. */
const VERSION = 'f87c4b70df';
const CACHE = 'senezem-' + VERSION;
const ASSETS = [
  "./404/",
  "./_next/static/1JfQRFi4uzxW8ukmVgrCo/_buildManifest.js",
  "./_next/static/1JfQRFi4uzxW8ukmVgrCo/_ssgManifest.js",
  "./_next/static/chunks/255-fe5c522e6d28d73f.js",
  "./_next/static/chunks/4bd1b696-c023c6e3521b1417.js",
  "./_next/static/chunks/app/_not-found/page-21f8a9b7dd75ffcf.js",
  "./_next/static/chunks/app/layout-fad1c91f3e541baf.js",
  "./_next/static/chunks/app/page-585edddd542b16f7.js",
  "./_next/static/chunks/framework-b1e5f14688f9ffe6.js",
  "./_next/static/chunks/main-0c4bcb6ea448b40d.js",
  "./_next/static/chunks/main-app-a83671f680a79292.js",
  "./_next/static/chunks/pages/_app-7d307437aca18ad4.js",
  "./_next/static/chunks/pages/_error-cb2a52f75f2162e2.js",
  "./_next/static/chunks/polyfills-42372ed130431b0a.js",
  "./_next/static/chunks/webpack-2ae2bb2e3d218c06.js",
  "./_next/static/css/4a4942d4cb6eeb04.css",
  "./_next/static/media/nunito-latin-300-normal.a7a864d9.woff2",
  "./_next/static/media/nunito-latin-300-normal.ebc44dc7.woff",
  "./_next/static/media/nunito-latin-400-normal.94ef06ef.woff2",
  "./_next/static/media/nunito-latin-400-normal.be14daf6.woff",
  "./_next/static/media/nunito-latin-600-normal.1f307960.woff2",
  "./_next/static/media/nunito-latin-600-normal.39ad3ad8.woff",
  "./_next/static/media/nunito-latin-700-normal.0b62b606.woff2",
  "./_next/static/media/nunito-latin-700-normal.73c7551b.woff",
  "./_next/static/media/nunito-latin-800-normal.710bec48.woff",
  "./_next/static/media/nunito-latin-800-normal.cac5ced1.woff2",
  "./_next/static/media/nunito-latin-900-normal.85ea3320.woff",
  "./_next/static/media/nunito-latin-900-normal.8b5d13b8.woff2",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./",
  "./index.txt",
  "./manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  /* Navegação sempre devolve a casca: é uma aplicação de página única. */
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./').then((r) => r || fetch(req).catch(() => caches.match('./index.html'))));
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
