/**
 * Au démarrage sur téléphone ou tablette (dans le navigateur) : on propose
 * d'installer le jeu comme une appli. Installé, il s'ouvre en plein écran,
 * sans les barres du navigateur, et en paysage (manifest.webmanifest).
 *
 * - Android (Chrome, Edge, Samsung…) : le navigateur prévient qu'il peut
 *   installer (`beforeinstallprompt`) ; notre bouton « Installer » ouvre sa
 *   vraie fenêtre d'installation.
 * - iPhone / iPad (Safari) : pas d'installation automatique possible ; on
 *   explique les deux gestes (Partager, puis « Sur l'écran d'accueil »).
 *
 * « Plus tard » : on reproposera au prochain lancement. « Ne plus demander » :
 * c'est fini sur cet appareil.
 */

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const NEVER_KEY = 'dinolearn.install.never';

const CSS = `
.install { position: fixed; inset: 0; z-index: 1300; display: flex; align-items: center; justify-content: center;
  background: rgba(20, 30, 60, 0.55); padding: 16px; font-family: 'Baloo 2', 'Arial Rounded MT Bold', Arial, sans-serif; }
.install .card { width: 100%; max-width: 400px; max-height: 94vh; overflow-y: auto; background: #fffaf0; color: #2d3354;
  border-radius: 22px; padding: 18px 20px 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,.25);
  border: 4px solid #fff; }
.install img.icon { width: 84px; height: 84px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,.18); }
.install h2 { margin: 8px 0 4px; font-size: 22px; line-height: 1.15; }
.install p { margin: 0 0 12px; font: 600 15px/1.35 Arial, sans-serif; color: #4b5563; }
.install ol { text-align: left; margin: 0 0 12px; padding-left: 22px; font: 600 15px/1.5 Arial, sans-serif; }
.install ol b { color: #2d3354; }
.install .share { display: inline-block; vertical-align: -4px; width: 20px; height: 20px; }
.install button { display: block; width: 100%; border: 0; border-radius: 999px; font: 800 18px 'Baloo 2', Arial, sans-serif;
  padding: 10px 14px; margin-top: 8px; cursor: pointer; }
.install .go { background: linear-gradient(#6fd64e, #3fae2a); color: #fff; box-shadow: 0 4px 0 #2c8a1c; }
.install .later { background: #e8eef7; color: #2d3354; }
.install .never { background: none; color: #6b7280; font: 600 13px Arial, sans-serif; padding: 6px; margin-top: 4px; }
`;

/** Icône « Partager » de Safari (carré avec une flèche vers le haut). */
const SHARE_SVG = `<svg class="share" viewBox="0 0 24 24" fill="none" stroke="#2f7cf6" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>`;

let deferred: InstallPrompt | undefined;
let shown = false;

/** Le jeu tourne déjà comme une appli installée (écran d'accueil). */
export const isInstalledApp = () =>
  matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches
  || (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isMobile = () => matchMedia('(pointer: coarse)').matches;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function never(): boolean {
  try { return localStorage.getItem(NEVER_KEY) === '1'; } catch { return false; }
}

function dialog(build: (card: HTMLDivElement, close: () => void) => void) {
  if (shown) return;
  shown = true;
  if (!document.getElementById('install-css')) {
    const style = document.createElement('style');
    style.id = 'install-css';
    style.textContent = CSS;
    document.head.append(style);
  }
  const root = document.createElement('div');
  root.className = 'install';
  root.setAttribute('role', 'dialog');
  const card = document.createElement('div');
  card.className = 'card';
  root.append(card);
  // Les touchers dans la fenêtre ne passent pas au jeu.
  root.addEventListener('pointerdown', (e) => e.stopPropagation());
  const close = () => root.remove();
  build(card, close);
  document.body.append(root);
}

function head(card: HTMLDivElement, text: string) {
  const icon = document.createElement('img');
  icon.className = 'icon';
  icon.src = 'icons/icon-192.png';
  icon.alt = '';
  const h = document.createElement('h2');
  h.textContent = 'Installe DinoLearn sur ton téléphone';
  const p = document.createElement('p');
  p.textContent = text;
  card.append(icon, h, p);
}

function buttons(card: HTMLDivElement, close: () => void, main?: { label: string; onTap: () => void }) {
  if (main) {
    const go = document.createElement('button');
    go.className = 'go';
    go.textContent = main.label;
    go.addEventListener('click', main.onTap);
    card.append(go);
  }
  const later = document.createElement('button');
  later.className = 'later';
  later.textContent = main ? 'Plus tard' : 'D\'accord';
  later.addEventListener('click', close);
  const no = document.createElement('button');
  no.className = 'never';
  no.textContent = 'Ne plus demander';
  no.addEventListener('click', () => {
    try { localStorage.setItem(NEVER_KEY, '1'); } catch { /* stockage indisponible */ }
    close();
  });
  card.append(later, no);
}

function offerAndroid() {
  dialog((card, close) => {
    head(card, 'Il s\'ouvrira en plein écran, bien en paysage, comme une vraie appli. Rien d\'autre à télécharger.');
    buttons(card, close, {
      label: 'Installer',
      onTap: async () => {
        const prompt = deferred;
        deferred = undefined;
        close();
        if (!prompt) return;
        await prompt.prompt().catch(() => undefined);
      },
    });
  });
}

function offerIOS() {
  dialog((card, close) => {
    head(card, 'Il s\'ouvrira en plein écran, sans les barres de Safari, comme une vraie appli.');
    const steps = document.createElement('ol');
    steps.innerHTML = `<li>Touche ${SHARE_SVG} <b>Partager</b> (en bas ou en haut de Safari).</li>`
      + '<li>Choisis <b>« Sur l\'écran d\'accueil »</b>, puis <b>Ajouter</b>.</li>'
      + '<li>Ouvre le jeu avec l\'icône du dino.</li>';
    card.append(steps);
    buttons(card, close);
  });
}

/**
 * À appeler au lancement. Sur mobile, dans le navigateur : propose
 * l'installation (dès que le navigateur le permet, ou tout de suite sur iPhone).
 */
export function offerInstall() {
  // Service worker minimal : demandé par certains navigateurs pour proposer l'installation.
  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    void navigator.serviceWorker.register('sw.js').catch(() => undefined);
  }
  if (isInstalledApp() || !isMobile() || never()) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    offerAndroid();
  });
  window.addEventListener('appinstalled', () => { deferred = undefined; });
  if (isIOS()) setTimeout(offerIOS, 1200);
}
