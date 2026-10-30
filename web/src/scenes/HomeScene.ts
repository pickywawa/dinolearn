import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { GAMES } from '../content/games';
import { BALANCE } from '../domain/balance';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, growthFactor, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil : un gros bouton vert au centre lance une série tout mélangée
 * (chaque question vient d'un jeu au hasard, choix par défaut). Un petit bouton ouvre le choix des jeux. En haut : le gâteau
 * (âge) et l'étoile du niveau du dino (− et + pour tester).
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private play!: Bubble;
  private choose!: Phaser.GameObjects.Container;
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
    this.dino = new Dino(this, portrait ? W / 2 : W * 0.68, H * (portrait ? 0.92 : 0.96),
      this.dinoBase * growthFactor(app.progress.dino.level));
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    // Gros bouton : un jeu au hasard.
    const big = portrait ? { x: W / 2, y: H * 0.34, r: u * 0.22 } : { x: W * 0.3, y: H * 0.46, r: u * 0.22 };
    this.play = new Bubble(this, big.x, big.y, big.r, 0x43b649, 'ui-play', () => this.playRandom(), 0.55);
    this.tweens.add({ targets: this.play, scale: 1.06, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Petit bouton : choisir son jeu (mosaïque des jeux).
    const small = portrait ? { x: W * 0.14, y: H * 0.56 } : { x: W * 0.08, y: H * 0.82 };
    this.choose = this.makeChooseButton(small.x, small.y, u * 0.075);

    const ar = u * 0.06;
    new Bubble(this, ar * 1.4, ar * 1.4, ar, 0xffd6e7, 'ui-cake', () => goTo(this, 'Age'), 0.7).setAlpha(0.85);
    this.drawLevelBadge(W - u * 0.13, u * 0.11, u);

    this.run(async () => {
      await this.wait(350);
      if (data?.hatched) {
        this.dino.react('cheer');
        await this.say('hello');
      } else {
        this.dino.react('wave');
        await this.say('welcome_back');
      }
      this.time.addEvent({ delay: 6500, loop: true, callback: () => this.dino.idleFun() });
      await this.present();
    });
  }

  /** Le dino montre le gros bouton, puis le petit. */
  private async present() {
    this.play.highlight(true);
    this.dino.pointAt(this.play.x, this.play.y);
    this.guide.tap(this.play);
    await this.say('home.play');
    this.play.highlight(false);
    this.dino.pointAt(this.choose.x, this.choose.y);
    this.guide.tap(this.choose);
    await this.say('home.categories');
    this.guide.hide();
    this.armIdle([[9000, () => this.run(() => this.reminder())]]);
  }

  private async reminder() {
    this.dino.react('happy');
    this.play.highlight(true);
    this.guide.tap(this.play);
    await this.say('home.play');
    this.play.highlight(false);
    this.guide.hide();
    this.armIdle([[14000, () => this.run(() => this.reminder())]]);
  }

  /** Petit bouton rond avec une mosaïque des jeux. */
  private makeChooseButton(x: number, y: number, r: number) {
    const button = this.add.container(x, y);
    button.add(this.add.circle(0, r * 0.08, r, 0x000000, 0.18));
    button.add(this.add.circle(0, 0, r, 0xffffff).setStrokeStyle(r * 0.08, 0x8e4ec6));
    GAMES.slice(0, 4).forEach((game, i) => {
      const icon = this.add.image((i % 2 - 0.5) * r * 0.9, (Math.floor(i / 2) - 0.5) * r * 0.9, game.icon);
      icon.setScale((r * 0.75) / icon.width);
      button.add(icon);
    });
    button.setSize(r * 2, r * 2).setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    button.on('pointerup', () => {
      Sfx.play('pop');
      this.clearIdle();
      this.guide.hide();
      goTo(this, 'Choose');
    });
    return button;
  }

  private playRandom() {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('dance');
    this.run(async () => {
      await this.say('random.go');
      goTo(this, 'Game', { mixed: true });
    });
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
    this.levelText.setText(String(app.progress.dino.level));
  }

  private changeLevel(delta: number) {
    const level = app.progress.dino.level + delta;
    if (level < 1 || level > BALANCE.dinoMaxLevel) return;
    app.progress.setDinoLevel(level);
    Sfx.play(delta > 0 ? 'levelUp' : 'pop');
    if (delta > 0) this.dino.react('levelUp');
    this.tweens.add({
      targets: this.dino, scale: (this.dinoBase * growthFactor(level)) / Dino.HEIGHT, duration: 400, ease: 'Back.easeOut',
    });
    this.levelText.setText(String(level));
  }
}
