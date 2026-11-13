import { safeArea } from './safeArea';
import Phaser from 'phaser';
import { Dino } from '../dino/Dino';
import { app } from '../core/app';
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

/** Petit bouton « maison » (ou flèche de retour) en haut à gauche. */
export function homeButton(scene: Phaser.Scene, onTap: () => void, icon = 'ui-home') {
  const r = unit(scene) * 0.07;
  const inset = safeArea(scene);
  return new Bubble(scene, inset.left + r * 1.3, inset.top + r * 1.3, r * 0.85, 0xffffff, icon, onTap, 0.66);
}

/**
 * Catégorie des missions d'où vient la série en cours : le bouton du haut devient une flèche qui y
 * ramène (au lieu de la maison). Effacée à l'accueil, d'où partent les séries au hasard.
 */
let missionCategory: string | undefined;
export const missionOrigin = {
  get: () => missionCategory,
  set: (category: string | undefined) => { missionCategory = category; },
};

/**
 * Bouton de sortie d'une série : flèche vers la catégorie des missions si l'enfant l'a choisie
 * là, sinon la maison. `before` est appelé avant de partir (abandon de la série…).
 */
export function exitButton(scene: Phaser.Scene, before: () => void = () => undefined) {
  const category = missionCategory;
  return homeButton(scene, () => {
    before();
    if (category) goTo(scene, 'Choose', { category });
    else goTo(scene, 'Home');
  }, category ? 'pk-back' : 'ui-home');
}

/** Le dino réagit quand on le touche (chatouilles). */
export function makeTickable(dino: Dino) {
  const zone = dino.scene.add.zone(0, -Dino.HEIGHT / 2, 300, Dino.HEIGHT).setInteractive();
  dino.add(zone);
  // Eligibility is captured before Home's scene-level pointerdown wakes the dino.
  const touches = new Set<number>();
  zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (!dino.isSleeping) touches.add(pointer.id);
  });
  zone.on('pointerout', (pointer: Phaser.Input.Pointer) => touches.delete(pointer.id));
  zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    const eligible = touches.delete(pointer.id);
    if (!eligible || dino.isSleeping) return;
    // Pas de bruit avant la phrase : le dino rit, c'est tout.
    dino.react('tickle');
    void app.voice.line('tickle');
  });
}
