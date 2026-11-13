import Phaser from 'phaser';
import { DINO_PARTS, PART_RESOLUTION } from '../dino/parts';
import { FRUITS } from '../domain/models';
import { GAMES } from '../content/games';
import { ITEMS, itemTexture } from '../content/items';
import { PRINT_KINDS } from '../print/catalog';
import { preloadModels } from '../dino3d/model';
import { loadBackdrops } from '../ui/backdrop';
import { Progress, appLanguage, downloads, markPacksAsked, missingPacks } from '../core/packs';
import { PackId, languageOf, secondLanguage } from '../domain/packs';
import { t } from '../i18n';

export const UI_IMAGES = [...new Set([
  'ui-play', 'ui-home', 'ui-star', 'ui-sparkles', 'ui-globe', 'ui-cloud', 'ui-cake', 'flag-gb', 'flag-es',
  'decor-palm-tree', 'decor-sauropod', 'decor-t-rex', 'decor-butterfly', 'decor-fly', 'decor-bird', 'decor-sun', 'decor-rainbow', 'ui-lock', 'riddle', 'oddoneout', 'counting', 'shadow', 'sequence', 'most', 'calc', 'calc-listen', 'flag-fr', 'numbers', 'together', 'bigger', 'en-numbers', 'syllables', 'read', 'letters', 'ui-parents', 'read-picture', 'missing-word', 'missing-word-read', 'story', 'memory', 'memory-en', 'coding', 'sudoku', 'cake-share', 'cookie', 'friend-dragon', 'friend-turtle', 'friend-lizard', 'friend-chick', 'code-rock', 'code-water', 'shapes', 'clock', 'money', 'ui-music', 'ui-music-off', 'ui-moon', 'trace-shapes', 'trace-letters', 'ui-eraser', 'my-country', 'ui-basket',
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
/** Images du pack utilisées telles quelles, sous la clé `pk-<nom>` (les autres servent via `PACK` ci-dessus). */
export const PACK_IMAGES = [
  'back', 'pause', 'sound-on', 'sound-off', 'info', 'help', 'close', 'profile', 'star-empty', 'star', 'arrow-left', 'arrow-right',
  'refresh',
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
 * Charge le jeu derrière l'écran de chargement HTML (la grande image de DinoLearn, visible dès
 * l'ouverture). Le jeu ne démarre qu'avec la voix du dino et la reconnaissance vocale de la
 * langue de l'appli : sans elles, l'œuf et les questions à voix haute ne marchent pas. La voix
 * et la reconnaissance de la langue apprise en plus se téléchargent ensuite, en arrière-plan.
 */
export class BootScene extends Phaser.Scene {
  private models!: Promise<unknown>;
  /** Avancement des images et modèles (0 à 1). */
  private assets = 0;
  /** Avancement des packs indispensables (undefined : rien à télécharger). */
  private packProgress?: number;
  private label = '';

  constructor() {
    super('Boot');
  }

  preload() {
    // Les modèles 3D se chargent en même temps que les images.
    this.models = preloadModels();
    loadBackdrops(this);
    this.load.on('progress', (progress: number) => {
      this.assets = progress;
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
   * Télécharge la voix du dino et la reconnaissance de la langue de l'appli, en même temps.
   * Résout quand tout est prêt ; rejette en cas de problème (hors ligne, plus de place…),
   * ou si plus rien n'arrive depuis 45 s.
   */
  private async preparePacks(): Promise<void> {
    const language = appLanguage();
    markPacksAsked();
    const ids = await missingPacks(false);
    if (!ids.length) return;
    this.packProgress = 0;
    downloads.start(ids, language, false);
    await new Promise<void>((resolve, reject) => {
      let lastBytes = -1;
      let lastChange = performance.now();
      let settled = false;
      let stop: () => void = () => undefined;
      const end = (error?: string) => {
        if (settled) return;
        settled = true;
        clearInterval(watchdog);
        queueMicrotask(() => stop());
        if (error) reject(new Error(error));
        else resolve();
      };
      const watchdog = setInterval(() => {
        if (performance.now() - lastChange > STALL_MS) end(t('ui.pack.stalled', {}, 'Le téléchargement n\'avance plus. Vérifiez la connexion.'));
      }, 1000);
      stop = downloads.subscribe((p) => {
        if (p.loaded !== lastBytes) {
          lastBytes = p.loaded;
          lastChange = performance.now();
        }
        const mine = p.tasks.filter((x) => ids.includes(x.id));
        const total = mine.reduce((n, x) => n + Math.max(x.total, x.loaded), 0);
        this.packProgress = total ? Math.min(1, mine.reduce((n, x) => n + x.loaded, 0) / total) : 0;
        // Fin du téléchargement : reste l'installation de la reconnaissance (décompression).
        if (mine.some((x) => x.state === 'installing')) this.packProgress = Math.min(this.packProgress, .97);
        this.label = packLabel(p, language);
        this.drawProgress();
        const failed = mine.find((x) => x.state === 'error');
        if (failed) end(failed.error ?? '?');
        else if (mine.every((x) => x.state === 'done')) end();
      });
    });
  }

  private drawProgress() {
    // Avec les packs, ce sont eux le plus long : l'essentiel de la barre.
    const progress = this.packProgress === undefined ? this.assets : this.assets * .1 + this.packProgress * .9;
    const percent = Math.min(100, Math.round(progress * 100));
    const bar = document.querySelector<HTMLElement>('.loading-progress');
    bar?.style.setProperty('--progress', percent + '%');
    bar?.setAttribute('aria-valuenow', String(percent));
    const text = document.querySelector('.loading-percent');
    if (text) text.textContent = percent + ' %';
    const what = document.querySelector('.loading-what');
    if (what) what.textContent = this.label || t('ui.loading', {}, 'Chargement…');
  }

  /**
   * Problème (hors ligne, plus de place…) : le message s'affiche sous la barre, et un toucher
   * relance (les morceaux déjà téléchargés ne sont pas perdus).
   */
  private showError(reason: unknown, retry: () => void) {
    const screen = document.querySelector<HTMLElement>('#loading-screen');
    const what = document.querySelector('.loading-what');
    if (!screen || !what) return;
    screen.classList.add('error');
    what.textContent = t('ui.problem', { reason: reason instanceof Error ? reason.message : String(reason ?? '?') }, 'Problème : {reason}').slice(0, 140)
      + ' — ' + t('ui.retry', {}, 'Réessayer');
    screen.setAttribute('role', 'button');
    screen.tabIndex = 0;
    const again = () => {
      screen.onclick = null;
      screen.onkeydown = null;
      screen.classList.remove('error');
      screen.removeAttribute('role');
      this.label = '';
      this.drawProgress();
      retry();
    };
    screen.onclick = again;
    screen.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') again();
    };
  }

  create() {
    const assets = this.models.then(() => {
      this.assets = 1;
      this.drawProgress();
    });
    assets.catch((e) => this.showError(e, () => location.reload()));
    const packs = () => this.preparePacks().then(() => this.ready(assets), (e) => this.showError(e, packs));
    void packs();
  }

  /** Tout est prêt : l'écran de chargement s'efface sur l'œuf (ou l'accueil). */
  private async ready(assets: Promise<void>) {
    await assets;
    this.packProgress = undefined;
    this.label = '';
    this.drawProgress();
    // Lien de test d'un jeu à un niveau donné (« ?jeu=LO-12&niveau=7 ») : directement le jeu.
    const query = new URLSearchParams(location.search);
    const testLevel = Math.max(1, Math.min(20, Number(query.get('niveau')) || 1));
    if (query.get('jeu') === 'LO-12') this.scene.start('Code', { testLevel });
    else if (query.get('jeu') === 'LO-13') this.scene.start('Sudoku', { testLevel });
    else if (query.get('jeu') === 'LO-14') this.scene.start('Cake', { testLevel });
    else this.scene.start('Start');
    const screen = document.getElementById('loading-screen');
    screen?.classList.add('done');
    setTimeout(() => screen?.remove(), 400);
  }
}

/** Téléchargement des packs sans progrès depuis ce délai : on prévient (toucher pour réessayer). */
const STALL_MS = 45_000;

/** Ce qui se télécharge en ce moment, à gauche du pourcentage. */
function packLabel(p: Progress, language: string): string {
  const name = (id: PackId) => id === 'speech' ? t('ui.pack.voice', { language: langName(language) }, `pack ${languageOf(language).name.toLowerCase()}`)
    : id === 'second' ? t('ui.pack.voice', { language: langName(secondLanguage(language)) }, 'pack anglais')
      : t('ui.pack.asr', {}, 'reconnaissance vocale');
  const busy = p.tasks.filter((x) => x.state === 'waiting' || x.state === 'downloading');
  if (busy.length) return t('ui.pack.downloading', { list: busy.map((x) => name(x.id)).join(', ') }, 'Téléchargement : {list}');
  if (p.tasks.some((x) => x.state === 'installing')) return t('ui.pack.installing', {}, 'Installation de la reconnaissance vocale');
  return '';
}

/** Nom d'une langue dans la langue de l'application (« anglais », « English »…). */
const langName = (code: string) => t(`lang.${code}`, {}, languageOf(code).name);
