import Phaser from 'phaser';
import { unit } from './scenery';

/**
 * La vie du ciel de l'accueil : des météorites qui filent (la nuit, des
 * étoiles filantes).
 * À appeler après `drawBackdrop`.
 */
export function drawSkyLife(scene: Phaser.Scene, night: boolean) {
  const every = (min: number, max: number, first: number, fn: () => void) => {
    const next = (delay: number) => scene.time.delayedCall(delay, () => {
      fn();
      next(Phaser.Math.Between(min, max));
    });
    next(first);
  };
  every(night ? 5000 : 12000, night ? 9000 : 20000, night ? 2500 : 7000, () => meteor(scene, night));
}

/** Une météorite (le jour) ou une étoile filante (la nuit) traverse le ciel en diagonale. */
function meteor(scene: Phaser.Scene, night: boolean) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const fromLeft = Math.random() < 0.5;
  const start = { x: fromLeft ? -u * 0.1 : W + u * 0.1, y: H * Phaser.Math.FloatBetween(0.02, 0.15) };
  const end = { x: fromLeft ? W * 0.7 : W * 0.3, y: start.y + H * 0.3 };
  const rock = night
    ? scene.add.star(start.x, start.y, 5, u * 0.008, u * 0.02, 0xfff7c2)
    : scene.add.circle(start.x, start.y, u * 0.014, 0x8a6a55).setStrokeStyle(2, 0x2d3354);
  rock.setDepth(-11.8);
  const trail = scene.add.particles(0, 0, 'puff', {
    follow: rock, lifespan: 500, frequency: 25, scale: { start: u * 0.00025, end: 0 }, alpha: { start: 0.9, end: 0 },
    tint: night ? [0xffffff, 0xfff7c2] : [0xffd23f, 0xff9f43, 0xff5a1f],
  }).setDepth(-11.85);
  scene.tweens.add({
    targets: rock, x: end.x, y: end.y, angle: 360, duration: 1800, ease: 'Quad.easeIn',
    onComplete: () => {
      rock.destroy();
      trail.stop();
      scene.time.delayedCall(600, () => trail.destroy());
    },
  });
}


