import Phaser from 'phaser';
import { Sfx } from '../core/sfx';
import { unit } from './scenery';

/**
 * La vie du ciel de l'accueil : des météorites qui filent, des oiseaux qui
 * passent, et de temps en temps le soleil qui se montre, ou un nuage de pluie
 * (suivi d'un arc-en-ciel). La nuit : seulement des étoiles filantes.
 * À appeler après `drawScenery` (le décor se glisse entre le ciel et la colline).
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
  if (night) return;
  every(14000, 24000, 3500, () => bird(scene));
  every(26000, 36000, 10000, () => (Math.random() < 0.5 ? sunshine(scene) : rain(scene)));
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

/** Un oiseau traverse le ciel en battant des ailes ; touché, il pépie et fait un petit saut. */
function bird(scene: Phaser.Scene) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const leftToRight = Math.random() < 0.5;
  const y = H * Phaser.Math.FloatBetween(0.18, 0.32);
  const b = scene.add.image(leftToRight ? -u * 0.1 : W + u * 0.1, y, 'decor-bird').setDepth(-9.2).setFlipX(leftToRight);
  const size = (u * 0.07) / b.width;
  b.setScale(size);
  scene.tweens.add({ targets: b, scaleY: size * 0.55, duration: 160, yoyo: true, repeat: -1 });
  scene.tweens.add({ targets: b, y: y - u * 0.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({
    targets: b, x: leftToRight ? W + u * 0.1 : -u * 0.1, duration: 8000,
    onComplete: () => { scene.tweens.killTweensOf(b); b.destroy(); },
  });
  b.setInteractive().on('pointerup', () => {
    Sfx.play('squawk');
    scene.tweens.add({ targets: b, y: b.y - u * 0.08, duration: 200, yoyo: true });
  });
}

/** Le soleil se lève derrière un coin du ciel, brille un moment, puis repart. */
function sunshine(scene: Phaser.Scene) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const x = W * 0.82;
  const y = H * 0.2;
  const rays = scene.add.star(x, y + u * 0.25, 12, u * 0.07, u * 0.12, 0xffd23f, 0.6).setDepth(-11.7);
  const sun = scene.add.image(x, y + u * 0.25, 'decor-sun').setDepth(-11.6);
  sun.setScale((u * 0.16) / sun.width);
  scene.tweens.add({ targets: [sun, rays], y, duration: 2000, ease: 'Sine.easeOut' });
  scene.tweens.add({ targets: rays, angle: 360, duration: 12000, repeat: -1 });
  scene.tweens.add({ targets: rays, scale: 1.12, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.time.delayedCall(14000, () => scene.tweens.add({
    targets: [sun, rays], y: y + u * 0.3, alpha: 0, duration: 2000, ease: 'Sine.easeIn',
    onComplete: () => { scene.tweens.killTweensOf(rays); sun.destroy(); rays.destroy(); },
  }));
}

/** Un nuage gris arrive, il pleut quelques secondes, puis un arc-en-ciel apparaît. */
function rain(scene: Phaser.Scene) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const y = H * 0.14;
  const cloud = scene.add.image(-u * 0.3, y, 'ui-cloud').setTint(0x8f9bb3).setDepth(-9);
  cloud.setScale((u * 0.34) / cloud.width);
  if (!scene.textures.exists('raindrop')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x5aa9f0, 1).fillEllipse(6, 14, 8, 22);
    g.generateTexture('raindrop', 12, 28);
    g.destroy();
  }
  const middle = W * Phaser.Math.FloatBetween(0.3, 0.6);
  scene.tweens.add({
    targets: cloud, x: middle, duration: 3000, ease: 'Sine.easeOut',
    onComplete: () => {
      const drops = scene.add.particles(0, 0, 'raindrop', {
        x: { min: middle - cloud.displayWidth * 0.4, max: middle + cloud.displayWidth * 0.4 }, y: y + cloud.displayHeight * 0.3,
        speedY: { min: 420, max: 560 }, lifespan: (H * 0.75 / 480) * 1000, frequency: 40, scale: u / 1400, alpha: 0.8,
      }).setDepth(-9.5);
      scene.time.delayedCall(7000, () => {
        drops.stop();
        scene.time.delayedCall(2000, () => drops.destroy());
        const rainbow = scene.add.image(middle, y + u * 0.2, 'decor-rainbow').setDepth(-11.5).setAlpha(0);
        rainbow.setScale((u * 0.5) / rainbow.width);
        scene.tweens.add({ targets: rainbow, alpha: 0.85, duration: 1500, yoyo: true, hold: 6000, onComplete: () => rainbow.destroy() });
        scene.tweens.add({ targets: cloud, x: W + u * 0.3, duration: 5000, ease: 'Sine.easeIn', onComplete: () => cloud.destroy() });
      });
    },
  });
}
