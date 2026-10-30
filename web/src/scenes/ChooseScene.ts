import { GAMES } from '../content/games';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, homeButton, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Choix d'un jeu (ouvert par le petit bouton de l'accueil) : une bulle par
 * jeu. Le dino présente chaque bulle en la montrant ; seule la bulle survolée
 * par la main est entourée.
 */
export class ChooseScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private bubbles: { bubble: Bubble; line: string }[] = [];

  constructor() {
    super('Choose');
  }

  create() {
    this.initBase();
    drawScenery(this);
    drawPrehistoric(this);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);

    homeButton(this, () => goTo(this, 'Home'));
    this.dino = new Dino(this, W / 2, H * (portrait ? 0.92 : 0.96), u * (portrait ? 0.5 : 0.55));
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    // 10 jeux : 4 + 3 + 3 bulles (portrait), ou 5 de chaque côté du dino (paysage).
    const r = u * (portrait ? 0.1 : 0.1);
    const positions = portrait
      ? [[0.14, 0.17], [0.38, 0.17], [0.62, 0.17], [0.86, 0.17], [0.2, 0.3], [0.5, 0.3], [0.8, 0.3],
        [0.2, 0.43], [0.5, 0.43], [0.8, 0.43]]
      : [[0.07, 0.24], [0.2, 0.24], [0.07, 0.52], [0.2, 0.52], [0.135, 0.8],
        [0.8, 0.24], [0.93, 0.24], [0.8, 0.52], [0.93, 0.52], [0.865, 0.8]];
    this.bubbles = GAMES.map((game, i) => ({
      bubble: new Bubble(this, W * positions[i][0], H * positions[i][1], r, game.color, game.icon,
        () => this.play(game.id)),
      line: game.homeLine,
    }));

    this.run(async () => {
      await this.wait(300);
      await this.presentGames();
    });
  }

  /** Le dino présente chaque jeu en le montrant ; la bulle n'est entourée que pendant ce temps. */
  private async presentGames() {
    await this.say('home.choose');
    for (const { bubble, line } of this.bubbles) {
      bubble.highlight(true);
      this.dino.pointAt(bubble.x, bubble.y);
      this.guide.tap(bubble);
      await this.say(line);
      bubble.highlight(false);
    }
    this.guide.hide();
    this.armIdle([[9000, () => this.run(() => this.reminder())]]);
  }

  /** Relance : la main fait le tour des bulles, en entourant seulement celle qu'elle survole. */
  private async reminder() {
    this.dino.react('happy');
    this.guide.tour(this.bubbles.map(({ bubble }) => bubble), 1100, (index) => {
      this.bubbles.forEach(({ bubble }, i) => bubble.highlight(i === index));
    }, true);
    await this.say('home.choose');
    this.armIdle([[14000, () => this.run(() => this.reminder())]]);
  }

  private play(gameId: string) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    goTo(this, 'Game', { gameId });
  }
}
