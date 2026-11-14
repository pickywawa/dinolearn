import '@fontsource/andika/700.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/playwrite-fr-moderne/400.css';
import Phaser from 'phaser';
import { app } from './core/app';
import { enableInstalledVoices } from './core/packs';
import './core/review';
import { BootScene } from './scenes/BootScene';
import { ChooseScene } from './scenes/ChooseScene';
import { EndScene } from './scenes/EndScene';
import { GameScene } from './scenes/GameScene';
import { MemoryScene } from './scenes/MemoryScene';
import { CodeScene } from './scenes/CodeScene';
import { SudokuScene } from './scenes/SudokuScene';
import { CakeScene } from './scenes/CakeScene';
import { HomeScene } from './scenes/HomeScene';
import { StartScene } from './scenes/StartScene';
import { TraceScene } from './scenes/TraceScene';
import { WardrobeScene } from './scenes/WardrobeScene';
import { isInstalledApp, offerInstall } from './ui/install';
import { appLanguage } from './core/appSettings';
import { isFr, setLang, t } from './i18n';
import { Music } from './core/music';

// La musique démarre dès l'écran de chargement (au premier toucher si l'appareil l'exige).
Music.autostart();

// Langue de l'application (celle de l'appareil au premier lancement) : son catalogue avant tout le reste.
await setLang(appLanguage());
// Textes de la page (écran de chargement, « tourne ta tablette ») dans la langue de l'application.
for (const [selector, key] of [['.loading-what', 'ui.loading'], ['#rotate .turn', 'ui.rotate'], ['#rotate .tap', 'ui.tap']] as const) {
  const node = document.querySelector(selector);
  if (node && !isFr()) node.textContent = t(key);
}

/**
 * Le jeu se joue en paysage : 720 px de haut, la largeur suit le format de
 * l'écran (de 4:3 à ~21:9). Tenu en portrait, un message demande de tourner
 * la tablette (voir index.html).
 */
function gameSize() {
  const bounds = document.getElementById('game')!.getBoundingClientRect();
  const w = bounds.width;
  const h = bounds.height;
  const ratio = Phaser.Math.Clamp(Math.max(w, h) / Math.min(w, h), 1.33, 2.4);
  return { width: Math.round(720 * ratio), height: 720 };
}

// Polices des jeux de lecture : chargées tout de suite, prêtes bien avant la première question.
void document.fonts?.load('bold 40px Andika');
void document.fonts?.load("800 40px 'Baloo 2'");
void document.fonts?.load("700 40px 'Baloo 2'");
void document.fonts?.load('40px "Playwrite FR Moderne"');

const size = gameSize();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#bfe6ff',
  ...size,
  // Remplit tout l'écran (pas de bandes sur les côtés) : la largeur du jeu suit le format de l'écran,
  // et les petits écarts (barre d'adresse, plein écran) sont rognés de quelques pixels.
  scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, StartScene, HomeScene, ChooseScene, GameScene, EndScene, WardrobeScene, TraceScene, MemoryScene, CodeScene, SudokuScene, CakeScene],
});

// Fullscreen and browser chrome changes can resize the drawable area without a window resize.
const viewportObserver = new ResizeObserver(() => game.scale.refresh());
viewportObserver.observe(document.getElementById('game')!);
document.addEventListener('fullscreenchange', () => requestAnimationFrame(() => game.scale.refresh()));

// En développement seulement : accès au jeu depuis la console (tests dans le navigateur).
if (import.meta.env.DEV) Object.assign(window, { game, app });

// Taille de l'écran changée (autre format, barre d'adresse…) : on adapte la largeur et on relance la scène.
let current = size.width;
window.addEventListener('resize', () => {
  const next = gameSize();
  if (Math.abs(next.width - current) < 40) {
    game.scale.refresh();
    return;
  }
  current = next.width;
  game.scale.setGameSize(next.width, next.height);
  for (const scene of game.scene.getScenes(true)) {
    if (scene.scene.key === 'Game' || scene.scene.key === 'End') scene.scene.start('Home');
    else if (scene.scene.key !== 'Boot') scene.scene.restart();
  }
});

/**
 * Plein écran et paysage, sur les appareils tactiles qui le permettent (Android…) : au
 * premier toucher (les navigateurs l'exigent), le jeu passe en plein écran — plus de barres
 * du navigateur — et l'écran est verrouillé en paysage, même si l'appareil est tenu droit.
 * S'il quitte le plein écran (bouton retour), le toucher suivant y revient. Sur iPhone,
 * Safari ne le permet pas : on demande de tourner l'appareil (voir index.html), et le jeu
 * ajouté à l'écran d'accueil s'ouvre sans barres (manifest.webmanifest).
 * En appli installée : le paysage est verrouillé dès l'ouverture, sans attendre de toucher.
 */
const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
const touch = matchMedia('(pointer: coarse)').matches;
const standalone = isInstalledApp();
const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
const canLock = touch && !!(root.requestFullscreen ?? root.webkitRequestFullscreen) && !!orientation?.lock;
if (canLock) document.documentElement.classList.add('can-lock');
if (standalone) document.documentElement.classList.add('installed');

async function goLandscape() {
  if (!touch) return;
  const doc = document as Document & { webkitFullscreenElement?: Element };
  if (!standalone && !(doc.fullscreenElement ?? doc.webkitFullscreenElement)) {
    try {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' });
      else await root.webkitRequestFullscreen?.();
    } catch {
      // Refusé (pas de geste, navigateur intégré…) : on garde la page telle quelle.
    }
  }
  await orientation?.lock?.('landscape').catch(() => undefined);
}
void goLandscape();
window.addEventListener('pointerdown', (e) => {
  // Pas pendant la proposition d'installation : son bouton ouvre la fenêtre du navigateur.
  if ((e.target as Element | null)?.closest?.('.install')) return;
  void goLandscape();
}, { capture: true });
// Appli installée : on reverrouille aussi quand elle revient au premier plan.
if (standalone) document.addEventListener('visibilitychange', () => { if (!document.hidden) void goLandscape(); });
// Sur mobile, dans le navigateur : proposer d'installer le jeu comme une appli.
offerInstall();

void app.voice.init();
// Les voix du dino déjà téléchargées remplacent la voix du téléphone.
void enableInstalledVoices();
