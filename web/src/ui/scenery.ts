import Phaser from 'phaser';
import { Dino } from '../dino/Dino';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Bubble } from './Bubble';

/** Ciel en dégradé, colline et nuages qui dérivent. */
export function drawScenery(scene: Phaser.Scene, skyTop = 0x9fd8ff, skyBottom = 0xe8f7ff, clouds = 3) {
  const { width: W, height: H } = scene.scale;
  // Ciel (-12) et colline (-10) séparés : le décor du fond se glisse entre les deux.
  scene.add.graphics().setDepth(-12)
    .fillGradientStyle(skyTop, skyTop, skyBottom, skyBottom, 1).fillRect(0, 0, W, H);
  scene.add.graphics().setDepth(-10)
    .fillStyle(0x9ad66b, 1).fillEllipse(W / 2, H + H * 0.05, W * 1.8, H * 0.42)
    .fillStyle(0x7cc451, 1).fillEllipse(W * 0.15, H + H * 0.1, W * 0.9, H * 0.3);
  const short = Math.min(W, H);
  for (let i = 0; i < clouds; i++) {
    const cloud = scene.add.image(Phaser.Math.Between(0, W), H * (0.08 + i * 0.11), 'ui-cloud')
      .setAlpha(0.85).setDepth(-9);
    cloud.setScale((short * (0.16 + i * 0.03)) / cloud.width);
    scene.tweens.add({
      targets: cloud, x: { from: -cloud.displayWidth, to: W + cloud.displayWidth },
      duration: 40000 + i * 15000, repeat: -1, delay: -i * 9000,
    });
  }
}

/** Ciel de nuit : la lune et des étoiles qui scintillent (à dessiner après `drawScenery`). */
export function drawNightSky(scene: Phaser.Scene) {
  const { width: W, height: H } = scene.scale;
  const u = Math.min(W, H);
  for (let i = 0; i < 40; i++) {
    const star = scene.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.6),
      Phaser.Math.FloatBetween(1.5, 4), 0xfff7c2).setDepth(-11.5);
    scene.tweens.add({ targets: star, alpha: 0.2, duration: Phaser.Math.Between(700, 1800), yoyo: true, repeat: -1,
      delay: Phaser.Math.Between(0, 1500) });
  }
  const moon = scene.add.image(W * 0.28, H * 0.17, 'ui-moon').setDepth(-11.5);
  moon.setScale((u * 0.18) / moon.width);
  scene.tweens.add({ targets: moon, angle: { from: -6, to: 6 }, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

/** Le dino grandit avec son niveau (1 à 40) : facteur de taille d'affichage. */
export const growthFactor = (level: number, age = app.progress.age) =>
  (0.8 + Math.min(40, level) * 0.01) * ageSize(age);

/** Taille du dino à l'éclosion selon l'âge de l'enfant : un peu plus grand pour les plus grands. */
export const ageSize = (age: number) => 0.85 + (Math.min(7, Math.max(3, age)) - 3) * 0.05;

export const isPortrait = (scene: Phaser.Scene) => scene.scale.height >= scene.scale.width;

/** Taille de référence : le plus petit côté de l'écran. */
export const unit = (scene: Phaser.Scene) => Math.min(scene.scale.width, scene.scale.height);

/** Fondu enchaîné vers une autre scène. */
export function goTo(scene: Phaser.Scene, key: string, data?: object) {
  app.voice.stop();
  scene.input.enabled = false;
  scene.cameras.main.fadeOut(220, 255, 255, 255);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(key, data));
}

/** Petit bouton « maison » en haut à gauche. */
export function homeButton(scene: Phaser.Scene, onTap: () => void) {
  const r = unit(scene) * 0.07;
  return new Bubble(scene, r * 1.4, r * 1.4, r, 0xffd23f, 'ui-home', onTap, 0.7);
}

/** Le dino réagit quand on le touche (chatouilles). */
export function makeTickable(dino: Dino) {
  const zone = dino.scene.add.zone(0, -Dino.HEIGHT / 2, 300, Dino.HEIGHT).setInteractive();
  dino.add(zone);
  zone.on('pointerup', () => {
    Sfx.play('boing');
    dino.react('tickle');
    void app.voice.line('tickle');
  });
}
