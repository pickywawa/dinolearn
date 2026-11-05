// Capture du jeu (serveur de dev) : node tools/shots/game.cjs <sortie.png> [script JS] [attente ms] [largeur] [hauteur]
// Le script JS a accès à `game` et `app` (exposés en développement).
const { chromium } = require('playwright');
(async () => {
  const [out, script = '', wait = 2500, w = 1280, h = 720] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log('console:', m.text().slice(0, 300)));
  p.on('pageerror', (e) => console.log('pageerror:', e.message, e.stack?.split('\n').slice(0, 4).join(' | ')));
  // Premier lancement déjà fait (pas de fenêtre de téléchargement) ; HATCH=couleur pour un dino déjà éclos.
  await p.addInitScript((hatch) => {
    if (!sessionStorage.getItem('shot')) {
      sessionStorage.setItem('shot', '1');
      localStorage.clear();
      localStorage.setItem('dinolearn.app.v1', JSON.stringify({ language: 'fr', packsAsked: true }));
    }
  }, process.env.HATCH ?? '');
  await p.goto(process.env.URL ?? 'http://localhost:5173/');
  await p.waitForFunction(() => window.game && window.game.scene.getScenes(true).some((s) => s.scene.key !== 'Boot'), null, { timeout: 60000 });
  // HATCH=couleur : un enfant « Léo, 5 ans » avec son dino déjà éclos ; SCENE=scène à ouvrir.
  if (process.env.HATCH) {
    await p.evaluate(([color, scene]) => {
      if (!app.profiles.pin) app.profiles.setPin('1234');
      if (!app.profiles.count) {
        const id = app.profiles.add({ name: 'Léo', age: 5, country: 'fr', dailyMinutes: 0, nightTime: null });
        app.profiles.setActive(id);
      }
      app.progress.hatch(+color);
      const active = game.scene.getScenes(true)[0];
      game.scene.stop(active.scene.key);
      game.scene.start(scene || 'Home');
    }, [process.env.HATCH, process.env.SCENE ?? '']);
    await p.waitForTimeout(800);
  }
  if (script) await p.evaluate(script);
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: out });
  const active = await p.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(','));
  console.log('scènes actives :', active);
  await b.close();
})();
