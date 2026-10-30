import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { GAMES } from '../content/games';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, growthFactor, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil : une bulle par jeu. Le dino présente chaque bulle en la montrant ;
 * seule la bulle survolée par la main est entourée. En haut à droite, le
 * niveau du dino (réglable avec − et + pour tester).
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private bubbles: { bubble: Bubble; line: string }[] = [];
  private dinoBase = 0;
  private levelText!: Phaser.GameObjects.Text;

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

    this.dinoBase = u * (portrait ? 0.5 : 0.55);
    this.dino = new Dino(this, W / 2, H * (portrait ? 0.92 : 0.96),
      this.dinoBase * growthFactor(app.progress.dino.level));
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    const r = u * (portrait ? 0.13 : 0.12);
    const positions = portrait
      ? [[0.2, 0.22], [0.5, 0.22], [0.8, 0.22], [0.33, 0.4], [0.67, 0.4]]
      : [[0.09, 0.3], [0.26, 0.3], [0.74, 0.3], [0.91, 0.3], [0.18, 0.66]];
    this.bubbles = GAMES.map((game, i) => ({
      bubble: new Bubble(this, W * positions[i][0], H * positions[i][1], r, game.color, game.icon,
        () => this.play(game.id)),
      line: game.homeLine,
    }));

    const ar = u * 0.06;
    new Bubble(this, ar * 1.4, ar * 1.4, ar, 0xffd6e7, 'ui-cake', () => goTo(this, 'Age'), 0.7).setAlpha(0.85);
    this.drawLevelBadge(W - u * 0.13, u * 0.11, u);

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

  /** Étoile avec le niveau du dino ; − et + changent le niveau (pour tester). */
  private drawLevelBadge(x: number, y: number, u: number) {
    const star = this.add.image(x, y, 'ui-star');
    star.setScale((u * 0.16) / star.width).setInteractive();
    star.on('pointerup', () => {
      this.dino.react('happy');
      this.run(() => this.say('home.level'));
    });
    this.levelText = this.add.text(x, y + u * 0.01, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(u * 0.055)}px`,
      color: '#ffffff', fontStyle: 'bold', stroke: '#2d3354', strokeThickness: Math.round(u * 0.012),
    }).setOrigin(0.5);
    const small = u * 0.032;
    const button = (dx: number, label: string, delta: number) => {
      const b = this.add.circle(x + dx, y + u * 0.11, small, 0xffffff).setStrokeStyle(3, 0x2d3354).setInteractive();
      this.add.text(b.x, b.y, label, {
        fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(small * 1.4)}px`, color: '#2d3354', fontStyle: 'bold',
      }).setOrigin(0.5);
      b.on('pointerup', () => this.changeLevel(delta));
    };
    button(-u * 0.05, '−', -1);
    button(u * 0.05, '+', 1);
    this.refreshLevel();
  }

  private changeLevel(delta: number) {
    const level = app.progress.dino.level + delta;
    if (level < 1 || level > 20) return;
    app.progress.setDinoLevel(level);
    Sfx.play(delta > 0 ? 'levelUp' : 'pop');
    if (delta > 0) this.dino.react('levelUp');
    this.tweens.add({
      targets: this.dino, scale: (this.dinoBase * growthFactor(level)) / Dino.HEIGHT, duration: 400, ease: 'Back.easeOut',
    });
    this.refreshLevel();
  }

  private refreshLevel() {
    this.levelText.setText(String(app.progress.dino.level));
  }

  private play(gameId: string) {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('happy');
    goTo(this, 'Game', { gameId });
  }
}
