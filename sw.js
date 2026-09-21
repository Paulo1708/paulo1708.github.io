/* Service worker: o app inteiro fica em cache na primeira visita.
   A partir daí abre sem rede — que é o ponto de um app de escrita. */
const VERSION = 'ad9491a152';
const CACHE = 'ars-' + VERSION;
const ASSETS = [
  "./404/",
  "./_next/static/LALXGh_zyWdCSed9nPETp/_buildManifest.js",
  "./_next/static/LALXGh_zyWdCSed9nPETp/_ssgManifest.js",
  "./_next/static/chunks/255-fe5c522e6d28d73f.js",
  "./_next/static/chunks/4bd1b696-c023c6e3521b1417.js",
  "./_next/static/chunks/app/_not-found/page-21f8a9b7dd75ffcf.js",
  "./_next/static/chunks/app/layout-9f0ef21ac9f3f50c.js",
  "./_next/static/chunks/app/page-48454625aea0b9cc.js",
  "./_next/static/chunks/framework-b1e5f14688f9ffe6.js",
  "./_next/static/chunks/main-0c4bcb6ea448b40d.js",
  "./_next/static/chunks/main-app-a83671f680a79292.js",
  "./_next/static/chunks/pages/_app-7d307437aca18ad4.js",
  "./_next/static/chunks/pages/_error-cb2a52f75f2162e2.js",
  "./_next/static/chunks/polyfills-42372ed130431b0a.js",
  "./_next/static/chunks/webpack-7165e3a2c6e43199.js",
  "./_next/static/css/d0279ff30bbcac50.css",
  "./_next/static/media/open-sans-latin-300-normal.45b1b398.woff",
  "./_next/static/media/open-sans-latin-300-normal.4be9076b.woff2",
  "./_next/static/media/open-sans-latin-400-normal.38815393.woff",
  "./_next/static/media/open-sans-latin-400-normal.b5db02f0.woff2",
  "./_next/static/media/open-sans-latin-600-normal.4840173a.woff2",
  "./_next/static/media/open-sans-latin-600-normal.c4131161.woff",
  "./_next/static/media/open-sans-latin-700-normal.03f17d7c.woff2",
  "./_next/static/media/open-sans-latin-700-normal.9c59ab61.woff",
  "./_next/static/media/open-sans-latin-800-normal.2f5bb5cc.woff",
  "./_next/static/media/open-sans-latin-800-normal.524dcb5b.woff2",
  "./_next/static/media/patrick-hand-latin-400-normal.c7f01246.woff2",
  "./_next/static/media/patrick-hand-latin-400-normal.e9bbf8f3.woff",
  "./_next/static/media/poppins-latin-300-normal.599ec7be.woff",
  "./_next/static/media/poppins-latin-300-normal.c0455185.woff2",
  "./_next/static/media/poppins-latin-400-normal.916d3686.woff2",
  "./_next/static/media/poppins-latin-400-normal.cbe785df.woff",
  "./_next/static/media/poppins-latin-600-normal.c070cf14.woff",
  "./_next/static/media/poppins-latin-600-normal.d8692086.woff2",
  "./_next/static/media/poppins-latin-700-normal.9a881e2a.woff2",
  "./_next/static/media/poppins-latin-700-normal.c83dad1a.woff",
  "./brand/ars-book.png",
  "./brand/ars-sticker.png",
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
