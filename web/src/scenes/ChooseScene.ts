import Phaser from 'phaser';
import { app, playableGames } from '../core/app';
import { shortTitle } from '../content/gameTitles';
import { MISSION_CATEGORIES, MissionCategory, missionCategoryIcon, missionCategoryName, missionCategoryOf } from '../content/missionCategories';
import { Dino } from '../dino/Dino';
import { Guide } from '../ui/Guide';
import { drawBackdrop } from '../ui/backdrop';
import { candyAt, setHighlight, tileButton, woodSign, type Candy } from '../ui/kit';
import { goTo, homeButton, makeTickable, missionOrigin, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';
import { lang, t } from '../i18n';

const CATEGORY_COLORS: Record<MissionCategory, Candy> = { second: 'blue', math: 'orange', primary: 'red', logic: 'purple', world: 'green' };

/**
 * Missions (tuile « Missions » de l'accueil) : d'abord les catégories (la langue apprise en
 * plus, les maths, la langue de l'enfant, la logique, le monde), puis les jeux de la catégorie
 * choisie. Le dino, à gauche, présente chaque tuile en la montrant. En haut à gauche : la
 * maison sur les catégories, une flèche de retour aux catégories dans une catégorie.
 */
export class ChooseScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private tiles: { tile: Phaser.GameObjects.Container; line?: string; text: string }[] = [];
  private category?: MissionCategory;

  constructor() {
    super('Choose');
  }

  create(data: { category?: MissionCategory } = {}) {
    this.initBase();
    // Temps de jeu fini : retour à l'accueil (bloqué par le code parent).
    if (app.progress.timeIsUp() || app.progress.isSleeping()) {
      goTo(this, 'Home');
      return;
    }
    drawBackdrop(this, 'forest');
    const { width: W, height: H } = this.scale;
    const u = unit(this);

    // Seuls les jeux de l'âge de l'enfant sont proposés (l'anglais et le calcul à partir de 5 ans…).
    const playable = playableGames();
    const categories = MISSION_CATEGORIES.filter((c) => playable.some((g) => missionCategoryOf(g) === c));
    // Une seule catégorie : directement ses jeux.
    this.category = data.category && categories.includes(data.category) ? data.category
      : categories.length === 1 ? categories[0] : undefined;
    const inCategory = !!this.category && categories.length > 1;

    // Toujours des données explicites : relancer la scène sans données garderait les précédentes.
    homeButton(this, () => (inCategory ? this.leave('Choose', {}) : this.leave('Home', {})), inCategory ? 'pk-back' : 'ui-home');
    this.dino = new Dino(this, W * 0.17, H * 0.97, u * 0.56);
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    let entries: { icon: string; text: string; line?: string; color: Candy; go: () => void }[];
    if (this.category) {
      const category = this.category;
      entries = playable.filter((g) => missionCategoryOf(g) === category).map((game, i) => ({
        icon: game.icon, text: shortTitle(game.id), line: game.homeLine, color: candyAt(i), go: () => this.play(game.id, category),
      }));
    } else {
      entries = categories.map((c) => ({
        icon: missionCategoryIcon(c), text: missionCategoryName(c),
        color: CATEGORY_COLORS[c], go: () => this.leave('Choose', { category: c }),
      }));
    }

    const area = { x: W * 0.36, y: H * 0.2, w: W * 0.61, h: H * 0.77 };
    woodSign(this, area.x + area.w / 2, H * 0.09, this.category ? missionCategoryName(this.category) : t('ui.choose.title', {}, 'Choisis un jeu !'), u * 0.055, true);
    const { cols, rows } = gridFor(entries.length, area.w / area.h);
    const cw = area.w / cols, ch = area.h / rows;
    const tw = Math.min(cw * 0.9, ch * 0.9 * 1.25, u * 0.4);
    const th = Math.min(ch * 0.88, tw * 0.8);
    this.tiles = entries.map((e, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, entries.length - row * cols);
      const x = area.x + area.w / 2 + ((i % cols) - (inRow - 1) / 2) * cw;
      const y = area.y + ch * (row + 0.5);
      const tile = tileButton(this, x, y, tw, th, e.icon, e.text, e.go, e.color);
      // Les tuiles arrivent l'une après l'autre.
      tile.setScale(0);
      this.tweens.add({ targets: tile, scale: 1, duration: 300, delay: 60 * i, ease: 'Back.easeOut' });
      return { tile, line: e.line, text: e.text };
    });

    this.run(async () => {
      await this.wait(300);
      await this.presentGames();
    });
  }

  /** Le dino présente chaque jeu en le montrant ; la tuile pulse pendant ce temps. */
  private async presentGames() {
    await this.say('home.choose');
    for (const { tile, line, text } of this.tiles) {
      setHighlight(tile, true);
      this.dino.pointAt(tile.x, tile.y);
      this.guide.tap(tile);
      // Une catégorie : le dino dit son nom.
      if (line) await this.say(line);
      else await app.voice.say([{ text, lang: lang() }]);
      if (!this.alive) return;
      setHighlight(tile, false);
    }
    this.guide.hide();
    this.armIdle([[9000, () => this.run(() => this.reminder())]]);
  }

  /** Relance : la main fait le tour des tuiles, en faisant pulser celle qu'elle survole. */
  private async reminder() {
    this.dino.react('happy');
    this.guide.tour(this.tiles.map(({ tile }) => tile), 1100, (index) => {
      this.tiles.forEach(({ tile }, i) => setHighlight(tile, i === index));
    }, true);
    await this.say('home.choose');
    this.armIdle([[14000, () => this.run(() => this.reminder())]]);
  }

  private leave(key: 'Home' | 'Choose', data: { category?: MissionCategory }) {
    this.clearIdle();
    this.guide.hide();
    goTo(this, key, data);
  }

  private play(gameId: string, category: MissionCategory) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    // Pendant la série, le bouton du haut ramène à cette catégorie.
    missionOrigin.set(category);
    goTo(this, 'Game', { gameId });
  }
}

/** Colonnes et lignes pour `n` tuiles dans une zone de proportion `aspect` (largeur / hauteur). */
function gridFor(n: number, aspect: number) {
  let best = { cols: 1, rows: n, score: 0 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    // Taille de tuile possible (tuiles un peu plus larges que hautes).
    const size = Math.min(aspect / cols, 1.25 / rows);
    if (size > best.score) best = { cols, rows, score: size };
  }
  return best;
}
