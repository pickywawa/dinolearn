import { GAMES } from '../content/content';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil simplifié : deux grosses bulles (anglais, monde). Le dino présente
 * chaque bulle en la montrant du bras, et la main guide tapote dessus.
 * Un petit gâteau, discret, permet de changer l'âge.
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private bubbles: { bubble: Bubble; line: string }[] = [];

  constructor() {
    super('Home');
  }

  create(data: { hatched?: boolean }) {
    this.initBase();
    drawScenery(this);
    drawPrehistoric(this);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);

    this.dino = new Dino(this, W / 2, H * (portrait ? 0.92 : 0.95), u * (portrait ? 0.55 : 0.6));
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.17);

    const r = u * (portrait ? 0.17 : 0.16);
    const positions = portrait
      ? [{ x: W * 0.28, y: H * 0.3 }, { x: W * 0.72, y: H * 0.3 }]
      : [{ x: W * 0.2, y: H * 0.38 }, { x: W * 0.8, y: H * 0.38 }];
    const lines: Record<string, string> = { 'EN-1': 'home.english', 'MO-1': 'home.world' };
    this.bubbles = GAMES.map((game, i) => ({
      bubble: new Bubble(this, positions[i].x, positions[i].y, r, game.color, game.icon,
        () => this.play(game.id)),
      line: lines[game.id],
    }));

    const ar = u * 0.065;
    new Bubble(this, ar * 1.4, ar * 1.4, ar, 0xffd6e7, 'ui-cake', () => goTo(this, 'Age'), 0.7).setAlpha(0.8);

    this.run(async () => {
      await this.wait(350);
      if (data?.hatched) {
        this.dino.react('cheer');
        await this.say('hello');
      } else {
        this.dino.react('happy');
        await this.say('welcome_back');
      }
      await this.presentGames();
    });
  }

  /** Le dino présente chaque jeu en le montrant. */
  private async presentGames() {
    await this.say('home.choose');
    for (const { bubble, line } of this.bubbles) {
      bubble.highlight(true);
      this.dino.pointAt(bubble.x, bubble.y);
      this.guide.tap(bubble);
      await this.say(line);
      bubble.highlight(false);
    }
    this.bubbles.forEach(({ bubble }) => bubble.highlight(true));
    this.guide.tour(this.bubbles.map(({ bubble }) => bubble), 1500);
    this.armIdle([[9000, () => this.run(() => this.reminder())]]);
  }

  private async reminder() {
    this.dino.react('happy');
    this.guide.tour(this.bubbles.map(({ bubble }) => bubble), 1500);
    await this.say('home.choose');
    this.armIdle([[12000, () => this.run(() => this.reminder())]]);
  }

  private play(gameId: string) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    goTo(this, 'Game', { gameId });
  }
}
