// Capture d'une page du serveur de dev : node tools/shots/shot.cjs <url> <sortie.png> [largeur] [hauteur]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w = 1280, h = 720] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto(url);
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 60000 }).catch(() => console.log('timeout'));
  await p.screenshot({ path: out });
  await b.close();
})();
