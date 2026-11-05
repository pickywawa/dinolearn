import '@fontsource/andika/700.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/playwrite-fr-moderne/400.css';
import Phaser from 'phaser';
import { app } from './core/app';
import { enableInstalledVoices } from './core/packs';
import { BootScene } from './scenes/BootScene';
import { ChooseScene } from './scenes/ChooseScene';
import { EndScene } from './scenes/EndScene';
import { GameScene } from './scenes/GameScene';
import { HelloScene } from './scenes/HelloScene';
import { MemoryScene } from './scenes/MemoryScene';
import { HomeScene } from './scenes/HomeScene';
import { StartScene } from './scenes/StartScene';
import { TraceScene } from './scenes/TraceScene';
import { WardrobeScene } from './scenes/WardrobeScene';

/**
 * Le jeu se joue en paysage : 720 px de haut, la largeur suit le format de
 * l'écran (de 4:3 à ~21:9). Tenu en portrait, un message demande de tourner
 * la tablette (voir index.html).
 */
function gameSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Phaser.Math.Clamp(Math.max(w, h) / Math.min(w, h), 1.33, 2.3);
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
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, StartScene, HelloScene, HomeScene, ChooseScene, GameScene, EndScene, WardrobeScene, TraceScene, MemoryScene],
});

// En développement seulement : accès au jeu depuis la console (tests dans le navigateur).
if (import.meta.env.DEV) Object.assign(window, { game, app });

// Taille de l'écran changée (autre format, barre d'adresse…) : on adapte la largeur et on relance la scène.
let current = size.width;
window.addEventListener('resize', () => {
  const next = gameSize();
  if (Math.abs(next.width - current) < 40) return;
  current = next.width;
  game.scale.setGameSize(next.width, next.height);
  for (const scene of game.scene.getScenes(true)) {
    if (scene.scene.key === 'Game' || scene.scene.key === 'End') scene.scene.start('Home');
    else if (scene.scene.key !== 'Boot') scene.scene.restart();
  }
});

// Sur les appareils qui le permettent (appli installée, plein écran), on verrouille le paysage.
const lockLandscape = () => {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  orientation?.lock?.('landscape').catch(() => undefined);
};
lockLandscape();
window.addEventListener('pointerdown', lockLandscape, { once: true });

void app.voice.init();
// Les voix du dino déjà téléchargées remplacent la voix du téléphone.
void enableInstalledVoices();
