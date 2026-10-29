import { app } from '../core/app';
import { GAMES } from '../content/content';
import { BALANCE } from '../domain/balance';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil simplifié : deux grosses bulles (anglais, monde) et le panier.
 * Le dino présente chaque bulle en la montrant du bras, et la main guide
 * tapote dessus. Rien à lire.
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private bubbles: { bubble: Bubble; line: string }[] = [];
  private basket?: Bubble;

  constructor() {
    super('Home');
  }

  create(data: { hatched?: boolean }) {
    this.initBase();
    drawScenery(this);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);

    this.dino = new Dino(this, portrait ? W / 2 : W * 0.5, H * (portrait ? 0.92 : 0.95), u * (portrait ? 0.55 : 0.6));
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.17);

    const r = u * (portrait ? 0.2 : 0.17);
    const positions = portrait
      ? [{ x: W * 0.28, y: H * 0.24 }, { x: W * 0.72, y: H * 0.24 }]
      : [{ x: W * 0.18, y: H * 0.35 }, { x: W * 0.82, y: H * 0.35 }];
    const lines: Record<string, string> = { 'EN-1': 'home.english', 'MO-1': 'home.world' };
    this.bubbles = GAMES.map((game, i) => ({
      bubble: new Bubble(this, positions[i].x, positions[i].y, r, game.color, game.icon,
        () => this.play(game.id)),
      line: lines[game.id],
    }));

    const progress = app.progress;
    const canEat = progress.pantryCount > 0 && progress.xpEatenToday() < BALANCE.dailyXpCap;
    if (progress.pantryCount > 0) {
      const br = u * 0.12;
      this.basket = new Bubble(this, W - br * 1.4, H - br * 1.5, br, 0xffb84d, 'ui-shopping-basket',
        () => goTo(this, 'Pantry'));
      this.addBadge(this.basket, progress.pantryCount);
    }

    this.run(async () => {
      await this.wait(350);
      if (data?.hatched) {
        this.dino.react('cheer');
        await this.say('hello');
      } else {
        this.dino.react('happy');
        await this.say('welcome_back');
      }
      if (canEat && this.basket) {
        this.dino.pointAt(this.basket.x, this.basket.y);
        this.basket.highlight(true);
        this.guide.tap(this.basket);
        await this.say('home.basket_hungry');
        this.basket.highlight(false);
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

  private addBadge(bubble: Bubble, count: number) {
    const r = bubble.radius * 0.32;
    const badge = this.add.circle(bubble.radius * 0.75, -bubble.radius * 0.75, r, 0xe5484d)
      .setStrokeStyle(4, 0xffffff);
    // Des points plutôt qu'un chiffre (rien à lire).
    const dots = Math.min(count, 3);
    for (let i = 0; i < dots; i++) {
      bubble.add(this.add.circle(badge.x + (i - (dots - 1) / 2) * r * 0.55, badge.y, r * 0.18, 0xffffff));
    }
    bubble.addAt(badge, bubble.length - 1 - dots);
  }

  private play(gameId: string) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    goTo(this, 'Game', { gameId });
  }
}
