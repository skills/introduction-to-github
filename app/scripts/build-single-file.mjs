/**
 * Bundles the production build into one self-contained HTML fragment.
 *
 * Used for hosting the app where only a single file can be served, so there is
 * no separate sw.js or manifest to link. Offline caching and PWA installation
 * are unavailable in that mode; everything else, including IndexedDB storage,
 * works exactly as it does in the full build.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const out = process.argv[2] ?? join(dist, 'sparkboard-standalone.html');

const html = readFileSync(join(dist, 'index.html'), 'utf8');

const asset = (pattern) => {
  const match = pattern.exec(html);
  if (!match) throw new Error(`Could not find an asset matching ${pattern}`);
  return readFileSync(join(dist, match[1].replace(/^\/+/, '').replace(/^dist\//, '')), 'utf8');
};

const css = asset(/href="[^"]*?\/?(assets\/[^"]+\.css)"/);
const js = asset(/src="[^"]*?\/?(assets\/[^"]+\.js)"/);

// A literal </script> inside a string in the bundle would close the tag early.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

// The theme bootstrap from index.html, kept so the page never flashes the
// wrong theme before React mounts.
const bootstrap = `(function () {
  try {
    var stored = localStorage.getItem('sparkboard.theme');
    var mode = stored === 'light' || stored === 'dark' ? stored : null;
    var resolved = mode || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

const page = `<title>Sparkboard</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
<meta name="color-scheme" content="light dark" />
<style>
${css}
</style>
<div id="root"></div>
<noscript>
  <p style="font: 16px/1.6 system-ui; padding: 2rem">
    Sparkboard needs JavaScript to run. It stores everything locally in your browser and never
    requires an account.
  </p>
</noscript>
<script>${bootstrap}</script>
<script type="module">
${safeJs}
</script>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page, 'utf8');
console.log(`single-file: wrote ${out} (${(page.length / 1024).toFixed(0)} kB)`);
