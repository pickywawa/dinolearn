import Phaser from 'phaser';
import { Sfx } from '../core/sfx';
import { unit } from './scenery';

/**
 * Décor préhistorique animé (écrans de départ et d'accueil) : volcan qui
 * fume et entre en éruption, dinosaure qui marche au loin, bébé T-rex qui
 * jette un œil derrière la colline, ptérodactyle qui traverse le ciel,
 * papillons, palmier et fougères qui se balancent.
 * Tout est interactif : toucher le volcan, le ptérodactyle ou les dinos les fait réagir.
 * À appeler juste après `drawScenery`.
 */
export function drawPrehistoric(scene: Phaser.Scene) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const horizon = H * 0.86;
  ensureParticleTextures(scene);

  // Volcan au fond à droite, entre le ciel (-12) et la colline (-10).
  const volcano = scene.add.image(W * 0.8, horizon + u * 0.02, 'volcano').setOrigin(0.5, 1).setDepth(-11);
  volcano.setScale((u * 0.52) / volcano.width);
  const crater = { x: volcano.x + volcano.displayWidth * 0.02, y: volcano.y - volcano.displayHeight * 0.78 };
  scene.add.particles(crater.x, crater.y, 'puff', {
    speedY: { min: -60, max: -30 }, speedX: { min: -12, max: 22 },
    scale: { start: u * 0.0006, end: u * 0.0016 }, alpha: { start: 0.7, end: 0 },
    lifespan: 3200, frequency: 260, tint: [0xffffff, 0xe6e6e6, 0xcfcfcf],
  }).setDepth(-11.5);
  const lava = scene.add.particles(crater.x, crater.y, 'lava', {
    speedY: { min: -420, max: -240 }, speedX: { min: -140, max: 140 }, gravityY: 600,
    scale: { start: u * 0.0012, end: u * 0.0004 }, lifespan: 1300, emitting: false,
    tint: [0xff5a1f, 0xff9f43, 0xffd23f],
  }).setDepth(-11.4);
  const baseScaleY = volcano.scaleY;
  const erupt = () => {
    lava.explode(26);
    Sfx.play('boing');
    scene.tweens.add({ targets: volcano, scaleY: { from: baseScaleY, to: baseScaleY * 1.04 }, duration: 120, yoyo: true, repeat: 2 });
  };
  scene.time.addEvent({ delay: 7000, loop: true, startAt: 4000, callback: erupt });
  volcano.setInteractive({ pixelPerfect: true }).on('pointerup', erupt);

  // Palmier à gauche et dinosaure qui marche sur l'horizon.
  const palm = scene.add.image(W * 0.08, horizon + u * 0.03, 'decor-palm-tree').setOrigin(0.5, 1).setDepth(-11);
  palm.setScale((u * 0.34) / palm.height);
  scene.tweens.add({ targets: palm, angle: { from: -2, to: 3 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  const walker = scene.add.image(-u * 0.2, horizon + u * 0.01, 'decor-sauropod').setOrigin(0.5, 1).setDepth(-10.5);
  walker.setScale((u * 0.2) / walker.width).setFlipX(true);
  scene.tweens.add({ targets: walker, x: W + u * 0.2, duration: 38000, repeat: -1, repeatDelay: 4000 });
  scene.tweens.add({ targets: walker, y: walker.y - u * 0.01, duration: 380, yoyo: true, repeat: -1 });
  walker.setInteractive().on('pointerup', () => {
    Sfx.play('roar');
    scene.tweens.add({ targets: walker, angle: { from: 0, to: -12 }, duration: 200, yoyo: true });
  });

  peekingBaby(scene, u, horizon);
  butterflies(scene, u);

  // Fougères au premier plan, dans les coins du bas.
  for (const [x, flip] of [[W * 0.04, false], [W * 0.96, true]] as const) {
    const fern = scene.add.image(x, H + u * 0.02, 'fern').setOrigin(0.5, 1).setDepth(-1).setFlipX(flip);
    fern.setScale((u * 0.36) / fern.height);
    scene.tweens.add({
      targets: fern, angle: { from: flip ? 3 : -3, to: flip ? -4 : 4 }, duration: 1800 + (flip ? 400 : 0),
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  flyPterodactyl(scene, u, H);
}

/** Un ptérodactyle traverse le ciel en battant des ailes, de temps en temps. */
function flyPterodactyl(scene: Phaser.Scene, u: number, H: number) {
  const { width: W } = scene.scale;
  const ptero = scene.add.image(-u * 0.3, H * 0.12, 'ptero-up').setDepth(-9);
  ptero.setScale((u * 0.22) / ptero.width);
  let up = true;
  scene.time.addEvent({
    delay: 200, loop: true,
    callback: () => { up = !up; ptero.setTexture(up ? 'ptero-up' : 'ptero-down'); },
  });
  // Le toucher : il pousse un cri et fait un looping.
  ptero.setInteractive().on('pointerup', () => {
    Sfx.play('squawk');
    scene.tweens.add({ targets: ptero, angle: ptero.flipX ? -360 : 360, duration: 700, onComplete: () => ptero.setAngle(0) });
  });
  const crossing = (leftToRight: boolean) => {
    const y = H * Phaser.Math.FloatBetween(0.06, 0.16);
    ptero.setFlipX(!leftToRight).setPosition(leftToRight ? -u * 0.3 : W + u * 0.3, y);
    scene.tweens.add({ targets: ptero, x: leftToRight ? W + u * 0.3 : -u * 0.3, duration: 9000, ease: 'Linear' });
    scene.tweens.add({ targets: ptero, y: y + u * 0.05, duration: 900, yoyo: true, repeat: 4, ease: 'Sine.easeInOut' });
    scene.time.delayedCall(9000 + Phaser.Math.Between(3000, 7000), () => crossing(!leftToRight));
  };
  scene.time.delayedCall(1500, () => crossing(true));
}

/** Un bébé T-rex sort de derrière la colline de temps en temps, regarde, et repart. */
function peekingBaby(scene: Phaser.Scene, u: number, horizon: number) {
  const { width: W } = scene.scale;
  const baby = scene.add.image(W * 0.6, horizon + u * 0.12, 'decor-t-rex').setOrigin(0.5, 1).setDepth(-10.6);
  baby.setScale((u * 0.14) / baby.width);
  const hidden = baby.y;
  const peek = () => {
    baby.setX(W * Phaser.Math.FloatBetween(0.45, 0.65)).setFlipX(Math.random() < 0.5);
    scene.tweens.chain({
      targets: baby,
      tweens: [
        { y: hidden - u * 0.11, duration: 500, ease: 'Back.easeOut' },
        { angle: 10, duration: 300, yoyo: true, repeat: 1, hold: 300 },
        { y: hidden, duration: 400, delay: 900, ease: 'Sine.easeIn' },
      ],
    });
  };
  scene.time.addEvent({ delay: 11000, loop: true, startAt: 6000, callback: peek });
  baby.setInteractive().on('pointerup', () => {
    Sfx.play('squawk');
    scene.tweens.add({ targets: baby, y: '-=30', duration: 180, yoyo: true, repeat: 1 });
  });
}

/** Deux papillons qui volettent au hasard au-dessus de l'herbe. */
function butterflies(scene: Phaser.Scene, u: number) {
  const { width: W, height: H } = scene.scale;
  for (let i = 0; i < 2; i++) {
    const b = scene.add.image(W * (0.25 + i * 0.5), H * 0.7, 'decor-butterfly').setDepth(-2);
    const size = (u * 0.07) / b.width;
    b.setScale(size);
    // Battement d'ailes : on écrase l'image en largeur.
    scene.tweens.add({ targets: b, scaleX: size * 0.3, duration: 140, yoyo: true, repeat: -1, delay: i * 70 });
    const wander = () => {
      scene.tweens.add({
        targets: b, x: W * Phaser.Math.FloatBetween(0.1, 0.9), y: H * Phaser.Math.FloatBetween(0.5, 0.82),
        duration: Phaser.Math.Between(2500, 4000), ease: 'Sine.easeInOut', onComplete: wander,
      });
    };
    wander();
  }
}

function ensureParticleTextures(scene: Phaser.Scene) {
  if (!scene.textures.exists('puff')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1).fillCircle(64, 64, 64);
    g.generateTexture('puff', 128, 128);
    g.clear().fillStyle(0xffffff, 1).fillCircle(32, 32, 32).lineStyle(6, 0x2d3354, 1).strokeCircle(32, 32, 28);
    g.generateTexture('lava', 64, 64);
    g.destroy();
  }
}
