import { app } from '../core/app';
import { gamesForAge } from '../content/games';
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

    // Seuls les jeux de l'âge de l'enfant sont proposés (l'anglais et le calcul à partir de 5 ans…).
    const games = gamesForAge(app.progress.age);
    const { positions, rowStep } = bubbleGrid(games.length, portrait);
    // Rayon : aussi grand que possible sans que les bulles se touchent.
    const r = Math.min(u * 0.12, H * rowStep * 0.42, W * (portrait ? 0.13 : 0.06));
    this.bubbles = games.map((game, i) => ({
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

/**
 * Positions des bulles (fractions de l'écran) : 3 par ligne au-dessus du dino
 * en portrait ; en paysage, 2 colonnes de chaque côté du dino.
 */
function bubbleGrid(n: number, portrait: boolean): { positions: [number, number][]; rowStep: number } {
  if (portrait) {
    const rows = Math.ceil(n / 3);
    const step = Math.min(0.13, 0.5 / rows);
    const positions = Array.from({ length: n }, (_, i): [number, number] => {
      const row = Math.floor(i / 3);
      const inRow = Math.min(3, n - row * 3);
      return [0.5 + ((i % 3) - (inRow - 1) / 2) * 0.3, 0.15 + row * step];
    });
    return { positions, rowStep: step };
  }
  const perSide = Math.ceil(n / 2);
  const rows = Math.ceil(perSide / 2);
  const step = Math.min(0.28, 0.72 / rows);
  const positions = Array.from({ length: n }, (_, i): [number, number] => {
    const right = i >= perSide;
    const k = right ? i - perSide : i;
    const row = Math.floor(k / 2);
    const col = k % 2;
    const x = right ? 0.8 + col * 0.13 : 0.07 + col * 0.13;
    return [x, 0.2 + row * step];
  });
  return { positions, rowStep: step };
}
