import Phaser from 'phaser';
import { app } from './core/app';
import { AgeScene } from './scenes/AgeScene';
import { BootScene } from './scenes/BootScene';
import { ChooseScene } from './scenes/ChooseScene';
import { EndScene } from './scenes/EndScene';
import { GameScene } from './scenes/GameScene';
import { HomeScene } from './scenes/HomeScene';
import { StartScene } from './scenes/StartScene';

/** Taille logique : 720 px sur le petit côté, l'autre suit le format de l'écran. */
function gameSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Phaser.Math.Clamp(Math.max(w, h) / Math.min(w, h), 1.25, 2.3);
  const long = Math.round(720 * ratio);
  return h >= w ? { width: 720, height: long } : { width: long, height: 720 };
}

const size = gameSize();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#bfe6ff',
  ...size,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, StartScene, AgeScene, HomeScene, ChooseScene, GameScene, EndScene],
});

// Rotation de l'écran : on adapte la taille logique et on relance la scène active.
let portrait = size.height >= size.width;
window.addEventListener('resize', () => {
  const next = gameSize();
  const nowPortrait = next.height >= next.width;
  if (nowPortrait === portrait) return;
  portrait = nowPortrait;
  game.scale.setGameSize(next.width, next.height);
  for (const scene of game.scene.getScenes(true)) {
    if (scene.scene.key === 'Game' || scene.scene.key === 'End') scene.scene.start('Home');
    else if (scene.scene.key !== 'Boot') scene.scene.restart();
  }
});

void app.voice.init();
