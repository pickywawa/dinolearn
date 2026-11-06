import Phaser from 'phaser';
import { app } from '../core/app';
import { Dino } from '../dino/Dino';
import { unit } from './scenery';

/** Une mouche visite le dino environ une fois par minute et repart librement. */
export function buzzingFlies(scene: Phaser.Scene, dino: Dino) {
  const next = (delay: number) => scene.time.delayedCall(delay, () => {
    if (dino.active) fly(scene, dino, () => next(Phaser.Math.Between(55000, 65000)));
  });
  next(Phaser.Math.Between(55000, 65000));
}

function fly(scene: Phaser.Scene, dino: Dino, done: () => void) {
  const { width: W } = scene.scale;
  const u = unit(scene);
  const fromLeft = Math.random() < 0.5;
  const head = dino.mouthWorldPoint();
  const f = scene.add.image(fromLeft ? -u * 0.05 : W + u * 0.05, head.y - u * 0.2, 'decor-fly').setDepth(dino.depth + 2);
  const size = (u * 0.045) / f.width;
  f.setScale(size);
  // Ailes qui vibrent et petit zigzag.
  scene.tweens.add({ targets: f, scaleX: size * 0.8, duration: 40, yoyo: true, repeat: -1 });
  let gone = false;
  const leave = (fast = false) => {
    if (gone) return;
    gone = true;
    scene.tweens.killTweensOf(f);
    scene.tweens.add({
      targets: f, x: fromLeft ? W + u * 0.1 : -u * 0.1, y: f.y - u * 0.3, duration: fast ? 600 : 2500,
      onComplete: () => { f.destroy(); done(); },
    });
  };
  f.setInteractive().on('pointerdown', () => leave(true));

  // Un tour autour de la tête du dino : quelques points au hasard, et parfois tout près de la bouche.
  const reach = dino.scale * Dino.HEIGHT;
  const stops = Array.from({ length: Phaser.Math.Between(4, 7) }, () => {
    const close = Math.random() < 0.3;
    return close
      ? { x: head.x + Phaser.Math.FloatBetween(-0.08, 0.08) * reach, y: head.y + Phaser.Math.FloatBetween(-0.06, 0.04) * reach }
      : { x: head.x + Phaser.Math.FloatBetween(-0.6, 0.6) * reach, y: head.y + Phaser.Math.FloatBetween(-0.5, 0.1) * reach };
  });
  const hop = (i: number) => {
    if (gone) return;
    if (i >= stops.length) {
      leave();
      return;
    }
    scene.tweens.add({ targets: f, x: stops[i].x, y: stops[i].y, duration: Phaser.Math.Between(600, 1100), ease: 'Sine.easeInOut',
      onUpdate: () => { f.setFlipX(f.x < stops[i].x); }, onComplete: () => hop(i + 1) });
  };
  hop(0);

  if (app.awake && dino.free && !app.voice.talking) void app.voice.line('fly.visit');
}
