import Phaser from 'phaser';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';
import { FRUITS } from '../domain/models';
import { ITEMS, itemTexture } from '../content/items';

export const UI_IMAGES = [
  'ui-play', 'ui-home', 'ui-star', 'ui-sparkles', 'ui-globe', 'ui-cloud', 'ui-cake', 'flag-gb',
  'decor-palm-tree', 'decor-sauropod', 'decor-t-rex', 'decor-butterfly', 'riddle', 'oddoneout', 'counting', 'shadow', 'sequence', 'most', 'calc', 'flag-fr', 'numbers', 'together', 'bigger', 'en-numbers', 'syllables', 'read', 'letters', 'ui-parents', 'read-picture', 'missing-word', 'missing-word-read', 'shapes', 'clock', 'money', 'ui-music', 'ui-music-off', 'ui-moon', 'ui-basket',
  ...[...FRUITS, 'cake'].map((f) => `food-${f}`),
  'ui-wardrobe', 'ui-gift', ...ITEMS.map((i) => itemTexture(i.id)),
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
