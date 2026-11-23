// Service worker: saves the site on the device so it works with no internet.
// Bump VERSION if you ever want to force every device to re-download everything.
const VERSION = 'v1';
const CACHE = 'song-library-' + VERSION;

const CORE = [
  './',
  'index.html',
  'song.html',
  'app.js',
  'style.css',
  'songs.tsv',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

// Read songs.tsv and return every sheet-music image path in it,
// so all sheet music is saved up front, not just the pages you've opened.
async function sheetMusicPaths(tsvResponse) {
  const lines = (await tsvResponse.text()).replace(/\r/g, '').split('\n').filter(l => l.trim());
  const headers = lines.shift().split('\t').map(h => h.trim());
  const col = headers.indexOf('Sheet Music');
  if (col < 0) return [];
  const paths = new Set();
  for (const line of lines) {
    (line.split('\t')[col] || '').split(';').map(p => p.trim()).filter(Boolean)
      .forEach(p => paths.add(p));
  }
  return [...paths];
}

async function cacheSheetMusic(cache, tsvResponse) {
  const paths = await sheetMusicPaths(tsvResponse);
  // Fetch each separately so one missing image doesn't stop the rest.
  await Promise.all(paths.map(async p => {
    try {
      const r = await fetch(p, { cache: 'no-cache' });
      if (r.ok) await cache.put(p, r);
    } catch (_) { /* offline or missing: skip */ }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(u => new Request(u, { cache: 'no-cache' })));
    const tsv = await cache.match('songs.tsv');
    if (tsv) await cacheSheetMusic(cache, tsv);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('song-library-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // e.g. Hooktheory links

  // Song data: try the network first so edits show up, fall back to the saved copy.
  if (url.pathname.endsWith('/songs.tsv')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (fresh.ok) {
          await cache.put('songs.tsv', fresh.clone());
          cacheSheetMusic(cache, fresh.clone()); // pick up any newly added sheet music
        }
        return fresh;
      } catch (_) {
        return (await cache.match('songs.tsv')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: answer instantly from the saved copy, refresh it in the background.
  // ignoreSearch lets song.html?id=anything use the one saved song.html.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(r => {
      if (r.ok) cache.put(req.url.split('?')[0], r.clone());
      return r;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    return (await network) || (req.mode === 'navigate' && await cache.match('index.html')) || Response.error();
  })());
});
