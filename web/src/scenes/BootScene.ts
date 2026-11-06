import Phaser from 'phaser';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';
import { FRUITS } from '../domain/models';
import { GAMES } from '../content/games';
import { ITEMS, itemTexture } from '../content/items';
import { PRINT_KINDS } from '../print/catalog';
import { preloadModels } from '../dino3d/model';
import { Dino } from '../dino/Dino';
import { backdropKey, backdropUrl, drawBackdrop, loadBackdrops } from '../ui/backdrop';
import { card, INK, label } from '../ui/kit';

export const UI_IMAGES = [...new Set([
  'ui-play', 'ui-home', 'ui-star', 'ui-sparkles', 'ui-globe', 'ui-cloud', 'ui-cake', 'flag-gb',
  'decor-palm-tree', 'decor-sauropod', 'decor-t-rex', 'decor-butterfly', 'decor-fly', 'decor-bird', 'decor-sun', 'decor-rainbow', 'ui-lock', 'riddle', 'oddoneout', 'counting', 'shadow', 'sequence', 'most', 'calc', 'calc-listen', 'flag-fr', 'numbers', 'together', 'bigger', 'en-numbers', 'syllables', 'read', 'letters', 'ui-parents', 'read-picture', 'missing-word', 'missing-word-read', 'story', 'memory', 'memory-en', 'shapes', 'clock', 'money', 'ui-music', 'ui-music-off', 'ui-moon', 'trace-shapes', 'trace-letters', 'ui-eraser', 'my-country', 'ui-basket',
  ...[...FRUITS, 'cake'].map((f) => `food-${f}`),
  'ui-wardrobe', 'ui-gift', 'ui-missions', 'ui-mydino', 'ui-progress', 'ui-settings', ...ITEMS.map((i) => itemTexture(i.id)),
  'ui-envelope', ...PRINT_KINDS.map((k) => k.icon),
  // Bulles des jeux à voix haute.
  'vo-micro', ...GAMES.filter((g) => g.voice).map((g) => g.icon),
])];

/**
 * Icônes du pack d'interface (`public/ui/`, découpées par `tools/ui-pack/extract.py`) qui
 * remplacent les anciennes images du même rôle : la clé reste la même dans les scènes.
 */
const PACK: Record<string, string> = {
  'ui-home': 'home', 'ui-play': 'play', 'ui-star': 'star', 'ui-sparkles': 'star-shine', 'ui-lock': 'lock',
  'ui-parents': 'parents', 'ui-music': 'sound-on', 'ui-music-off': 'sound-off', 'ui-wardrobe': 'wardrobe',
  'ui-mydino': 'wardrobe', 'ui-missions': 'missions', 'ui-progress': 'progress', 'ui-settings': 'settings',
  'ui-envelope': 'envelope', 'ui-gift': 'chest',
};
/** Toutes les images du pack, disponibles sous la clé `pk-<nom>`. */
export const PACK_IMAGES = [
  'home', 'back', 'play', 'pause', 'sound-on', 'sound-off', 'fullscreen', 'info', 'help', 'close', 'missions', 'wardrobe',
  'progress', 'settings', 'parents', 'profile', 'trophy', 'medal', 'chest', 'envelope', 'star-empty', 'star', 'star-shine',
  'star-special', 'stars-3', 'cat-animals', 'cat-space', 'cat-nature', 'cat-daily', 'cat-maths', 'cat-reading', 'cat-world',
  'cat-creative', 'cat-logic', 'btn-validate', 'btn-retry', 'btn-continue', 'arrow-left', 'arrow-right', 'refresh', 'lock',
  'unlock', 'list',
];

/**
 * Écran de chargement : la clairière, une barre « Chargement… », puis le dino 3D qui
 * traverse l'écran en courant dès que son modèle est prêt.
 */
export class BootScene extends Phaser.Scene {
  private models!: Promise<unknown>;

  constructor() {
    // Le décor du chargement arrive avant tout le reste (« pack » de la scène).
    super({ key: 'Boot', pack: { files: [{ type: 'image', key: backdropKey('meadow'), url: backdropUrl('meadow') }] } });
  }

  preload() {
    // Les modèles 3D se chargent en même temps que les images.
    this.models = preloadModels();
    const { width: W, height: H } = this.scale;
    drawBackdrop(this, 'meadow');
    loadBackdrops(this);
    const bw = Math.min(W * 0.5, 620), bh = 34;
    const y = H * 0.86;
    card(this, W / 2, y, bw + 16, bh + 16, '#fff3dc', '#d8b98a');
    const fill = this.add.graphics();
    const draw = (p: number) => {
      fill.clear();
      const w = Math.max(bh, bw * p);
      fill.fillStyle(0x2a7f1d, 1).fillRoundedRect(W / 2 - bw / 2, y - bh / 2 + 3, w, bh - 3, bh / 2);
      fill.fillStyle(0x4cc93a, 1).fillRoundedRect(W / 2 - bw / 2, y - bh / 2, w, bh - 5, bh / 2);
      fill.fillStyle(0xffffff, 0.35).fillRoundedRect(W / 2 - bw / 2 + 8, y - bh / 2 + 4, Math.max(0, w - 16), 7, 4);
    };
    draw(0);
    this.registry.set('bootDraw', draw);
    const text = label(this, W / 2, y + bh * 1.3, 'Chargement…', { size: 30, color: '#ffffff', stroke: INK, strokeRatio: 0.16 });
    // La police arrondie arrive juste après : on redessine le texte avec elle.
    void document.fonts?.ready.then(() => text.active && text.setText(text.text));
    this.load.on('progress', (p: number) => draw(p * 0.85));

    for (const part of DINO_PARTS) {
      const url = URL.createObjectURL(new Blob([part.svg], { type: 'image/svg+xml' }));
      this.load.svg(part.key, url, {
        width: part.width * PART_RESOLUTION,
        height: part.height * PART_RESOLUTION,
      });
    }
    for (const key of UI_IMAGES) {
      if (PACK[key]) this.load.image(key, `ui/${PACK[key]}.png`);
      else this.load.svg(key, `img/${key}.svg`, { width: 256, height: 256 });
    }
    for (const name of PACK_IMAGES) this.load.image(`pk-${name}`, `ui/${name}.png`);
  }

  create() {
    const draw = this.registry.get('bootDraw') as (p: number) => void;
    const { width: W, height: H } = this.scale;
    // Les modèles 3D (dino et objets) doivent être prêts avant le premier dino.
    void this.models.then(() => {
      draw(0.9);
      let dino: Dino | undefined;
      try {
        dino = new Dino(this, -W * 0.1, H * 0.79, H * 0.4);
        dino.run();
      } catch {
        // Pas de WebGL pour la 3D : on passe directement au jeu.
      }
      const duration = dino ? 1700 : 0;
      if (dino) this.tweens.add({ targets: dino, x: W * 0.5, duration, ease: 'Sine.easeOut' });
      this.tweens.addCounter({ from: 0.9, to: 1, duration, onUpdate: (tw) => draw(tw.getValue() ?? 1),
        onComplete: () => {
          dino?.run(false);
          dino?.react('cheer');
          this.time.delayedCall(dino ? 700 : 0, () => {
            this.cameras.main.fadeOut(220, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Start'));
          });
        } });
    });
  }
}
