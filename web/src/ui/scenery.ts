import Phaser from 'phaser';
import { Dino } from '../dino/Dino';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Bubble } from './Bubble';

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
  return new Bubble(scene, r * 1.3, r * 1.3, r * 0.85, 0xffffff, 'ui-home', onTap, 0.66);
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
