import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

interface Options {
  base: string;
}

const EXCLUDED = new Set(['sw.js']);

function walk(dir: string, root = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, root));
    else out.push(relative(root, full).split(sep).join(posix.sep));
  }
  return out;
}

/**
 * Emits a hand-written service worker with a precache manifest of the real
 * build output. Kept dependency-free on purpose: the caching rules here are
 * small enough to read in one sitting, which matters more than Workbox's
 * generality for a single-page offline app.
 */
export function serviceWorkerPlugin({ base }: Options): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'sparkboard:service-worker',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      const outDir = join(config.root, config.build.outDir);
      const files = walk(outDir).filter((f) => !EXCLUDED.has(f));

      // Precache the shell: HTML, JS, CSS, manifest and icons. Everything else
      // falls back to the runtime stale-while-revalidate cache.
      const precache = files
        .filter((f) => /\.(html|js|css|webmanifest|png|svg|woff2?)$/i.test(f))
        .map((f) => base + f);

      const hash = createHash('sha256');
      for (const f of files.sort()) hash.update(f).update(readFileSync(join(outDir, f)));
      const revision = hash.digest('hex').slice(0, 12);

      const sw = renderServiceWorker({ base, revision, precache });
      writeFileSync(join(outDir, 'sw.js'), sw, 'utf8');
      config.logger.info(
        `sparkboard: service worker written (rev ${revision}, ${precache.length} precached files)`,
      );
    },
  };
}

function renderServiceWorker(opts: { base: string; revision: string; precache: string[] }): string {
  const { base, revision, precache } = opts;
  return `/* Generated at build time by scripts/vite-plugin-service-worker.ts — do not edit. */
const REVISION = ${JSON.stringify(revision)};
const BASE = ${JSON.stringify(base)};
const PRECACHE = ${JSON.stringify(precache, null, 2)};
const PRECACHE_NAME = 'sparkboard-shell-' + REVISION;
const RUNTIME_NAME = 'sparkboard-runtime-v1';
const SHELL_URL = BASE + 'index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE)),
  );
  // Deliberately NOT calling skipWaiting(): the page shows an "update ready"
  // prompt and posts SKIP_WAITING when the user accepts.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('sparkboard-shell-') && k !== PRECACHE_NAME)
          .map((k) => caches.delete(k)),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.disable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0] && event.ports[0].postMessage({ revision: REVISION });
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never cache cross-origin (incl. AI calls)

  // App-shell navigation: serve the cached shell so the app opens offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(SHELL_URL);
        if (cached) return cached;
        try {
          return await fetch(request);
        } catch {
          return new Response('Offline and no cached app shell available.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })(),
    );
    return;
  }

  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, PRECACHE_NAME));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
`;
}
