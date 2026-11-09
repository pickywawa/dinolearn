import Phaser from 'phaser';
import { showLoadingDino } from '../ui/loadingDino';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';
import { FRUITS } from '../domain/models';
import { GAMES } from '../content/games';
import { ITEMS, itemTexture } from '../content/items';
import { PRINT_KINDS } from '../print/catalog';
import { preloadModels } from '../dino3d/model';
import { loadBackdrops } from '../ui/backdrop';
import { Progress, appLanguage, downloads, installedPacks, markPacksAsked } from '../core/packs';
import { PackId, languageOf, packChoices } from '../domain/packs';
import { voiceSupported } from '../core/ears';
import { engineReady } from '../core/piper';

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
 * Charge le jeu derrière un écran HTML visible dès l’ouverture, avant Phaser et les modèles.
 */
export class BootScene extends Phaser.Scene {
  private models!: Promise<unknown>;
  private dinosaur!: Promise<void>;
  private packs!: Promise<void>;
  /** Avancement des images et modèles (0 à 1). */
  private assets = 0;
  /** Avancement des packs de langue, quand il faut les télécharger (premier lancement). */
  private packProgress?: number;

  constructor() {
    super('Boot');
  }

  preload() {
    // Les modèles 3D se chargent en même temps que les images.
    this.models = preloadModels();
    this.dinosaur = showLoadingDino().then((dispose) => {
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, dispose);

    });
    void this.dinosaur.catch(() => this.showError());
    void this.models.catch(() => this.showError());
    // The HTML loading screen is visible before Phaser and the model downloads.
    loadBackdrops(this);
    // Premier lancement : les packs de langue (voix, reconnaissance vocale) se téléchargent ici, en parallèle.
    this.packs = this.preparePacks().catch(() => undefined);
    this.load.on('progress', (progress: number) => {
      this.assets = progress * .85;
      this.drawProgress();
    });
    this.load.once('loaderror', () => this.showError());

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

  /**
   * Télécharge les packs de la langue de l'appli qui manquent : voix du dino,
   * voix anglaise, reconnaissance vocale (si l'appareil sait écouter). Ils
   * partent tous en même temps ; un échec (hors ligne…) n'empêche pas de jouer,
   * on réessaiera au prochain lancement.
   */
  private async preparePacks() {
    const language = appLanguage();
    const installed = await installedPacks(language);
    const ids = packChoices(language, true, engineReady()).map((c) => c.id)
      .filter((id) => !installed[id] && (id !== 'asr' || voiceSupported()));
    markPacksAsked();
    if (!ids.length) return;
    this.packProgress = 0;
    downloads.start(ids, language, true);
    await new Promise<void>((resolve) => {
      let stop: (() => void) | undefined;
      let finished = false;
      stop = downloads.subscribe((p) => {
        this.packProgress = p.total ? Math.min(1, p.loaded / p.total) : 0;
        this.drawProgress(packLabel(p, language));
        if (!p.running && !finished) {
          finished = true;
          stop?.();
          resolve();
        }
      });
      if (finished) stop();
    });
    this.drawProgress('');
  }

  private drawProgress(label?: string) {
    // Avec les packs, ce sont eux le plus long : l'essentiel de la barre.
    const progress = this.packProgress === undefined ? this.assets : this.assets * .15 + this.packProgress * .85;
    const percent = Math.round(progress * 100);
    const bar = document.querySelector<HTMLElement>('.loading-progress');
    bar?.style.setProperty('--progress', percent + '%');
    bar?.classList.toggle('empty', percent === 0);
    bar?.setAttribute('aria-valuenow', String(percent));
    const text = document.querySelector('.loading-percent');
    if (text) text.textContent = percent + ' %';
    const what = document.querySelector('.loading-what');
    if (what && label !== undefined) what.textContent = label;
  }

  private showError() {
    const title = document.querySelector('.loading-sign textPath');
    if (title) title.textContent = 'Réessayer';
    const screen = document.querySelector<HTMLElement>('#loading-screen');
    if (screen) {
      screen.onclick = () => location.reload();
      screen.setAttribute('role', 'button');
      screen.tabIndex = 0;
      screen.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') location.reload();
      };
    }
  }

  create() {
    void Promise.all([this.models, this.dinosaur]).then(() => {
      if (this.load.totalFailed) return;
      this.assets = 1;
      this.drawProgress();
      return this.packs;
    }).then(() => {
      if (this.load.totalFailed) return;
      this.packProgress = undefined;
      this.drawProgress('');
      this.time.delayedCall(150, () => {
        document.getElementById('loading-screen')?.remove();
        this.scene.start('Start');
      });
    }).catch(() => this.showError());
  }
}

/** Ce qui se télécharge en ce moment, à droite du pourcentage. */
function packLabel(p: Progress, language: string): string {
  const name = (id: PackId) => id === 'speech' ? `pack ${languageOf(language).name.toLowerCase()}`
    : id === 'english' ? 'pack anglais' : 'reconnaissance vocale';
  const busy = p.tasks.filter((t) => t.state === 'waiting' || t.state === 'downloading');
  if (busy.length) return 'Téléchargement : ' + busy.map((t) => name(t.id)).join(', ');
  if (p.tasks.some((t) => t.state === 'installing')) return 'Installation de la reconnaissance vocale';
  return '';
}
