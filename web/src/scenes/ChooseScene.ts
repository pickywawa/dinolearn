import Phaser from 'phaser';
import { app, playableGames } from '../core/app';
import { shortTitle } from '../content/gameTitles';
import { Dino } from '../dino/Dino';
import { Guide } from '../ui/Guide';
import { drawIsland } from '../ui/island';
import { candyAt, roundButton, setHighlight, tileButton, woodSign, type Candy } from '../ui/kit';
import { goTo, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Choix d'un jeu (tuile « Les jeux » de l'accueil) : une tuile bonbon par jeu,
 * à droite ; le dino, à gauche, présente chaque tuile en la montrant. Les jeux
 * à voix haute sont rangés derrière une tuile micro (si les parents ont
 * autorisé le micro).
 */
export class ChooseScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private tiles: { tile: Phaser.GameObjects.Container; line: string }[] = [];
  private voice = false;

  constructor() {
    super('Choose');
  }

  create(data: { voice?: boolean } = {}) {
    this.initBase();
    this.voice = !!data.voice;
    // Temps de jeu fini : retour à l'accueil (bloqué par le code parent).
    if (app.progress.timeIsUp() || app.progress.isSleeping()) {
      goTo(this, 'Home');
      return;
    }
    drawIsland(this, 'day');
    const { width: W, height: H } = this.scale;
    const u = unit(this);

    roundButton(this, u * 0.085, u * 0.085, u * 0.055, 'ui-home',
      () => (this.voice ? goTo(this, 'Choose') : goTo(this, 'Home')));
    this.dino = new Dino(this, W * 0.17, H * 0.97, u * 0.56);
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    // Seuls les jeux de l'âge de l'enfant sont proposés (l'anglais et le calcul à partir de 5 ans…).
    const playable = playableGames();
    const games = playable.filter((g) => !!g.voice === this.voice);
    const entries: { icon: string; text: string; line: string; color: Candy; go: () => void }[] = games.map((game, i) => ({
      icon: game.icon, text: shortTitle(game.id), line: game.homeLine, color: candyAt(i), go: () => this.play(game.id),
    }));
    if (!this.voice && playable.some((g) => g.voice)) {
      entries.push({ icon: 'vo-micro', text: 'À voix haute', line: 'home.voice', color: 'red', go: () => this.openVoice() });
    }

    const area = { x: W * 0.36, y: H * 0.2, w: W * 0.61, h: H * 0.77 };
    woodSign(this, area.x + area.w / 2, H * 0.09, this.voice ? 'Joue à voix haute !' : 'Choisis un jeu !', u * 0.055, true);
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
      return { tile, line: e.line };
    });

    this.run(async () => {
      await this.wait(300);
      await this.presentGames();
    });
  }

  /** Le dino présente chaque jeu en le montrant ; la tuile pulse pendant ce temps. */
  private async presentGames() {
    await this.say(this.voice ? 'home.voice_choose' : 'home.choose');
    for (const { tile, line } of this.tiles) {
      setHighlight(tile, true);
      this.dino.pointAt(tile.x, tile.y);
      this.guide.tap(tile);
      await this.say(line);
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

  private openVoice() {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    goTo(this, 'Choose', { voice: true });
  }

  private play(gameId: string) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
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
