import Phaser from 'phaser';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';

export const UI_IMAGES = [
  'ui-play', 'ui-home', 'ui-shopping-basket', 'ui-ear', 'ui-star', 'ui-sparkles', 'ui-heart',
  'ui-globe', 'ui-party-popper', 'ui-cloud', 'ui-sun', 'ui-leaf', 'ui-apple', 'ui-cherry',
  'ui-citrus', 'ui-cake', 'ui-paw-print', 'flag-gb',
];

/** Charge le dino, la main guide et les icônes d'interface. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const { width: W, height: H } = this.scale;
    const bar = this.add.rectangle(W / 2 - 150, H / 2, 0, 24, 0x7bd45a).setOrigin(0, 0.5);
    this.add.rectangle(W / 2, H / 2, 300, 24).setStrokeStyle(4, 0x2d3354);
    this.load.on('progress', (p: number) => (bar.width = 300 * p));

    for (const part of DINO_PARTS) {
      const url = URL.createObjectURL(new Blob([part.svg], { type: 'image/svg+xml' }));
      this.load.svg(part.key, url, {
        width: part.width * PART_RESOLUTION,
        height: part.height * PART_RESOLUTION,
      });
    }
    for (const key of UI_IMAGES) this.load.svg(key, `img/${key}.svg`, { width: 256, height: 256 });
  }

  create() {
    this.scene.start('Start');
  }
}
