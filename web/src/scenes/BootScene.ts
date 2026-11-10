import Phaser from 'phaser';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';
import { FRUITS } from '../domain/models';
import { GAMES } from '../content/games';
import { ITEMS, itemTexture } from '../content/items';
import { PRINT_KINDS } from '../print/catalog';
import { preloadModels } from '../dino3d/model';
import { loadBackdrops } from '../ui/backdrop';
import { appLanguage, downloads, installedPacks, markPacksAsked } from '../core/packs';
import { packChoices } from '../domain/packs';
import { t } from '../i18n';
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
 * Image SVG illisible (fichier absent : le serveur de l'appli renvoie alors la page du jeu) :
 * Phaser plantait et le chargement restait bloqué. On la compte comme une image en erreur.
 */
const svgProto = Phaser.Loader.FileTypes.SVGFile.prototype as unknown as { onProcess(): void; onProcessError(): void; key: string };
const svgProcess = svgProto.onProcess;
svgProto.onProcess = function onProcess(this: typeof svgProto) {
  try {
    svgProcess.call(this);
  } catch (e) {
    console.warn('Image SVG illisible :', this.key, e);
    this.onProcessError();
  }
};

/**
 * Charge le jeu derrière un écran HTML visible dès l’ouverture, avant Phaser et les modèles.
 */
export class BootScene extends Phaser.Scene {
  private models!: Promise<unknown>;
  /** Avancement des images et modèles (0 à 1). */
  private assets = 0;

  constructor() {
    super('Boot');
  }

  preload() {
    // Les modèles 3D se chargent en même temps que les images.
    this.models = preloadModels();
    // The HTML loading screen is visible before Phaser and the model downloads.
    loadBackdrops(this);
    // Premier lancement : les packs de langue (voix, reconnaissance vocale) se téléchargent en arrière-plan, sans bloquer le jeu.
    void this.preparePacks().catch(() => undefined);
    this.load.on('progress', (progress: number) => {
      this.assets = progress * .9;
      this.drawProgress();
    });
    // Une image manquante ne bloque pas le jeu (elle sera simplement absente) : on la signale seulement.
    this.load.on('loaderror', (file: Phaser.Loader.File) => console.warn('Image non chargée :', file.key, file.url));

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
   * Télécharge les packs de la langue de l'appli qui manquent, EN ARRIÈRE-PLAN : le jeu démarre
   * sans les attendre (voix du téléphone en attendant celle du dino). D'abord l'essentiel (voix
   * du dino + reconnaissance de la langue, pour le prénom et l'âge), puis, une fois fini, la
   * voix et la reconnaissance de la langue apprise en plus. Un échec (hors ligne…) n'empêche
   * pas de jouer : on réessaiera au prochain lancement.
   */
  private async preparePacks() {
    const language = appLanguage();
    const missing = async (withSecond: boolean) => {
      const installed = await installedPacks(language);
      return packChoices(language, true, engineReady()).map((c) => c.id)
        .filter((id) => !installed[id] && (id !== 'asr' || voiceSupported()) && (withSecond || id !== 'second'));
    };
    markPacksAsked();
    const first = await missing(false);
    if (first.length) {
      downloads.start(first, language, false);
      await new Promise<void>((resolve) => {
        let stop: () => void = () => undefined;
        let finished = false;
        stop = downloads.subscribe((p) => {
          if (!p.running && !finished) {
            finished = true;
            queueMicrotask(() => { stop(); resolve(); });
          }
        });
      });
    }
    const rest = await missing(true);
    if (rest.length) downloads.start(rest, language, true);
  }

  private drawProgress() {
    const percent = Math.round(this.assets * 100);
    const bar = document.querySelector<HTMLElement>('.loading-progress');
    bar?.style.setProperty('--progress', percent + '%');
    bar?.classList.toggle('empty', percent === 0);
    bar?.setAttribute('aria-valuenow', String(percent));
    const text = document.querySelector('.loading-percent');
    if (text) text.textContent = percent + ' %';
  }

  /**
   * Le jeu ne peut pas démarrer (modèle du dino illisible…) : on propose de réessayer,
   * avec la raison en petit sous la barre.
   */
  private showError(reason?: unknown) {
    void Promise.resolve().then(() => {
      const what = document.querySelector('.loading-what');
      if (what) what.textContent = t('ui.retry', {}, 'Réessayer') + ' · ' + t('ui.problem', { reason: reason instanceof Error ? reason.message : String(reason ?? '?') }, 'Problème : {reason}').slice(0, 120);
      const screen = document.querySelector<HTMLElement>('#loading-screen');
      if (screen) {
        screen.onclick = () => location.reload();
        screen.setAttribute('role', 'button');
        screen.tabIndex = 0;
        screen.onkeydown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') location.reload();
        };
      }
    });
  }


  create() {
    void this.models.then(() => {
      this.assets = 1;
      this.drawProgress();
      this.time.delayedCall(150, () => {
        document.getElementById('loading-screen')?.remove();
        this.scene.start('Start');
      });
    }).catch((e) => this.showError(e));
  }
}
