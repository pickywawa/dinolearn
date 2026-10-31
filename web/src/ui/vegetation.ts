import Phaser from 'phaser';
import { Sfx } from '../core/sfx';
import { PART_RESOLUTION } from '../dino/parts';
import { unit } from './scenery';

type Rng = () => number;

/** Couleurs du caméléon (il en change de temps en temps). */
const CHAMELEON_COLORS = [0x9be36b, 0x5fc7a8, 0xf2b84b, 0xe58ac0, 0x7fb3ff, 0xff9466];

/**
 * Décor d'une série de questions, tiré au hasard à chaque série : au loin des
 * montagnes (parfois), et au pied de la colline des fougères, des palmiers,
 * des cailloux, et parfois un caméléon qui roule des yeux, sort la langue et
 * change de couleur. Tout reste derrière les cartes (profondeur négative).
 * À appeler juste après `drawScenery`. `avoid` : la zone du dino (fractions de largeur).
 */
export function drawVegetation(scene: Phaser.Scene, rng: Rng = Math.random, avoid: [number, number] = [0.05, 0.32]) {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);

  if (rng() < 0.55) {
    const m = scene.add.image(W * (0.25 + rng() * 0.5), H * 0.88, 'mountains').setOrigin(0.5, 1).setDepth(-11).setAlpha(0.9);
    m.setScale((u * (0.8 + rng() * 0.4)) / m.width).setFlipX(rng() < 0.5);
  }

  // Quelques places au sol, en dehors de la zone du dino.
  const slots = [0.06, 0.38, 0.55, 0.72, 0.9].filter((x) => x < avoid[0] || x > avoid[1]);
  Phaser.Utils.Array.Shuffle(slots);
  const count = 2 + Math.floor(rng() * Math.min(3, slots.length - 1));
  let chameleon = rng() < 0.5;
  for (const x of slots.slice(0, count)) {
    const px = W * x + (rng() - 0.5) * u * 0.06;
    const ground = H * (0.92 + rng() * 0.06);
    if (chameleon && x >= 0.5) {
      chameleon = false;
      drawChameleon(scene, px, ground, u * (0.32 + rng() * 0.06), rng);
      continue;
    }
    const kind = rng();
    if (kind < 0.4) {
      const fern = scene.add.image(px, ground + u * 0.03, 'fern').setOrigin(0.5, 1).setDepth(-9).setFlipX(rng() < 0.5);
      fern.setScale((u * (0.18 + rng() * 0.12)) / fern.height);
      scene.tweens.add({ targets: fern, angle: { from: -3, to: 3 }, duration: 1600 + rng() * 800, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut' });
    } else if (kind < 0.7) {
      const palm = scene.add.image(px, ground + u * 0.02, 'decor-palm-tree').setOrigin(0.5, 1).setDepth(-9.5).setFlipX(rng() < 0.5);
      palm.setScale((u * (0.26 + rng() * 0.12)) / palm.height);
      scene.tweens.add({ targets: palm, angle: { from: -2, to: 3 }, duration: 2400 + rng() * 800, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut' });
    } else {
      const rocks = scene.add.image(px, ground + u * 0.02, 'rocks').setOrigin(0.5, 1).setDepth(-8.9).setFlipX(rng() < 0.5);
      rocks.setScale((u * (0.12 + rng() * 0.08)) / rocks.width);
    }
  }
}

/**
 * Un caméléon sur sa branche. Ses deux yeux ne regardent pas au même endroit
 * (comme un vrai caméléon), il lance sa langue de temps en temps et change de
 * couleur. Le toucher le fait réagir.
 */
function drawChameleon(scene: Phaser.Scene, x: number, ground: number, width: number, rng: Rng) {
  const s = width / 260;
  const c = scene.add.container(x - 130 * s, ground - 166 * s).setScale(s).setDepth(-8.8);
  const body = scene.add.image(0, 0, 'chameleon').setOrigin(0, 0).setScale(1 / PART_RESOLUTION);
  const branch = scene.add.graphics().lineStyle(16, 0x7a5230, 1).beginPath();
  branch.moveTo(10, 152).lineTo(130, 146).lineTo(252, 140).strokePath();
  const tongue = scene.add.graphics();
  const eye = scene.add.circle(212, 86, 14, 0xffffff).setStrokeStyle(5, 0x2d3354);
  const pupil = scene.add.circle(214, 86, 6, 0x2d3354);
  c.add([branch, tongue, body, eye, pupil]);
  let color = Phaser.Utils.Array.GetRandom(CHAMELEON_COLORS);
  body.setTint(color);
  eye.setFillStyle(0xffffff);

  // L'œil roule dans tous les sens.
  const lookAround = () => {
    scene.tweens.add({
      targets: pupil, x: 212 + Phaser.Math.Between(-7, 7), y: 86 + Phaser.Math.Between(-7, 7), duration: 180, ease: 'Quad.easeOut',
    });
    scene.time.delayedCall(Phaser.Math.Between(700, 2200), lookAround);
  };
  lookAround();

  // La langue : elle part loin, très vite, puis s'enroule et revient.
  const shoot = () => {
    const length = 70 + rng() * 60;
    const angle = (rng() - 0.6) * 0.6;
    scene.tweens.addCounter({
      from: 0, to: 1, duration: 140, yoyo: true, hold: 120, ease: 'Quad.easeOut',
      onUpdate: (tw) => {
        const t = tw.getValue() ?? 0;
        const tx = 243 + Math.cos(angle) * length * t;
        const ty = 99 + Math.sin(angle) * length * t;
        tongue.clear().lineStyle(7, 0xff6f91, 1).lineBetween(243, 99, tx, ty);
        if (t > 0.05) tongue.fillStyle(0xff6f91, 1).fillCircle(tx, ty, 8);
      },
      onComplete: () => tongue.clear(),
    });
  };

  // Il change de couleur doucement.
  const recolor = () => {
    const from = Phaser.Display.Color.IntegerToColor(color);
    color = Phaser.Utils.Array.GetRandom(CHAMELEON_COLORS.filter((k) => k !== color));
    const to = Phaser.Display.Color.IntegerToColor(color);
    scene.tweens.addCounter({
      from: 0, to: 100, duration: 1500,
      onUpdate: (tw) => {
        const mix = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, tw.getValue() ?? 0);
        body.setTint(Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b));
      },
    });
  };

  scene.time.addEvent({ delay: 4000 + rng() * 3000, loop: true, callback: shoot });
  scene.time.addEvent({ delay: 9000 + rng() * 4000, loop: true, callback: recolor });
  // Petite respiration.
  scene.tweens.add({ targets: body, scaleY: body.scaleY * 1.02, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  const zone = scene.add.zone(x, ground - 85 * s, 260 * s, 170 * s).setInteractive().setDepth(-8.7);
  zone.on('pointerup', () => {
    Sfx.play('slurp');
    shoot();
    recolor();
  });
}
