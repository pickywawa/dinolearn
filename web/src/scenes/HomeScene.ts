import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { playableGames } from '../core/app';
import { chooseGifts } from '../ui/gifts';
import { openParents } from '../ui/parents';
import { askParentCode, createParentCode, firstLaunchSetup, unlockNight, unlockPlayTime } from '../ui/pin';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { buzzingFlies } from '../ui/flies';
import { Planet } from '../ui/Planet';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawSkyLife } from '../ui/sky';
import { drawNightSky, drawScenery, goTo, growthFactor, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil : la planète Terre qui tourne, au centre, lance une série tout mélangée
 * (chaque question vient d'un jeu au hasard, choix par défaut). Un petit bouton ouvre le choix des jeux.
 * À gauche : le gâteau (âge) et le cadenas de l'espace parents (code parent) ; à droite, l'étoile du niveau.
 * Dans le ciel passent des météorites, des oiseaux, le soleil ou la pluie ; des mouches viennent embêter le dino.
 * Quand le temps de jeu du jour fixé par les parents est atteint, le dino va se coucher.
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private play!: Planet;
  private choose!: Phaser.GameObjects.Container;
  private dinoBase = 0;
  private gift?: Bubble;
  private wardrobe!: Bubble;

  constructor() {
    super('Home');
  }

  create(data: { hatched?: boolean }) {
    this.initBase();
    // Après l'heure du coucher : ciel de nuit.
    const night = app.progress.isNight();
    if (night) drawScenery(this, 0x18214a, 0x52609e, 1);
    else drawScenery(this);
    if (night) drawNightSky(this);
    drawPrehistoric(this);
    drawSkyLife(this, night);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);

    this.dinoBase = u * (portrait ? 0.5 : 0.55);
    this.dino = new Dino(this, portrait ? W / 2 : W * 0.68, H * (portrait ? 0.92 : 0.96),
      this.dinoBase * growthFactor(app.progress.dino.level));
    makeTickable(this.dino);
    if (!night) buzzingFlies(this, this.dino);
    this.guide = new Guide(this, u * 0.15);

    // La planète : un jeu au hasard (le tour du monde des jeux).
    const big = portrait ? { x: W / 2, y: H * 0.34, r: u * 0.2 } : { x: W * 0.3, y: H * 0.46, r: u * 0.2 };
    this.play = new Planet(this, big.x, big.y, big.r, () => this.playRandom());

    // Petit bouton : choisir son jeu (mosaïque des jeux).
    const small = portrait ? { x: W * 0.14, y: H * 0.56 } : { x: W * 0.08, y: H * 0.82 };
    this.choose = this.makeChooseButton(small.x, small.y, u * 0.075);

    const ar = u * 0.06;
    new Bubble(this, ar * 1.4, ar * 1.4, ar, 0xffd6e7, 'ui-cake', () => goTo(this, 'Age'), 0.7).setAlpha(0.85);
    // Le cadenas des parents (sous le gâteau) : il demande le code parent.
    new Bubble(this, ar * 1.4, ar * 3.9, ar, 0xfff3c4, 'ui-lock', () => this.openParentSpace(), 0.7).setAlpha(0.9);
    this.drawLevelBadge(W - u * 0.13, u * 0.11, u);

    // En haut : le dressing du dino, et le cadeau à ouvrir quand il a grandi.
    this.wardrobe = new Bubble(this, W / 2, u * 0.1, u * 0.065, 0xffe9f3, 'ui-wardrobe', () => {
      this.clearIdle();
      goTo(this, 'Wardrobe');
    }, 0.7);
    if (app.progress.collection.pending > 0) {
      this.gift = new Bubble(this, W / 2 + u * 0.17, u * 0.1, u * 0.065, 0xfff3c4, 'ui-gift', () => {
        this.clearIdle();
        app.voice.stop();
        this.run(async () => {
          await chooseGifts(this, this.dino);
          this.scene.restart({});
        });
      }, 0.75);
      this.tweens.add({ targets: this.gift, angle: { from: -10, to: 10 }, duration: 260, yoyo: true, repeat: -1 });
    }


    // Premier lancement : le dino demande d'aller chercher un parent pour créer le code.
    if (!app.progress.settings.pin) {
      this.parentSetup(data);
      return;
    }

    if (app.progress.timeIsUp()) {
      this.bedtime();
      return;
    }

    // Mode nuit : la dernière série est jouée, le dino dort.
    if (app.progress.isSleeping()) {
      this.sleeping();
      return;
    }

    this.run(async () => {
      await this.wait(350);
      if (data?.hatched) {
        this.dino.react('cheer');
        await this.say('welcome_first');
      } else if (night) {
        // Le soir : le dino bâille et propose une dernière série.
        this.dino.react('yawn');
        await this.say('night.last');
      } else {
        this.dino.react('wave');
        await this.say('welcome_back');
      }
      this.time.addEvent({ delay: 6500, loop: true, callback: () => this.dino.idleFun() });
      await this.present();
    });
  }

  /** Le dino montre le gros bouton, puis le petit (d'abord le cadeau s'il y en a un). */
  private async present() {
    if (this.gift) {
      this.gift.highlight(true);
      this.dino.pointAt(this.gift.x, this.gift.y);
      this.guide.tap(this.gift);
      await this.say('gift.waiting');
      this.gift.highlight(false);
    }
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
    playableGames().slice(0, 4).forEach((game, i) => {
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

  /** Étoile avec le niveau du dino (réglable dans l'espace parents). */
  private drawLevelBadge(x: number, y: number, u: number) {
    const star = this.add.image(x, y, 'ui-star');
    star.setScale((u * 0.16) / star.width).setInteractive();
    star.on('pointerup', () => {
      this.dino.react('happy');
      this.run(() => this.say('home.level'));
    });
    this.add.text(x, y + u * 0.01, String(app.progress.dino.level), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(u * 0.055)}px`,
      color: '#ffffff', fontStyle: 'bold', stroke: '#2d3354', strokeThickness: Math.round(u * 0.012),
    }).setOrigin(0.5);
  }

  private parentSetup(data: { hatched?: boolean }) {
    this.hideButtons();
    this.run(async () => {
      await this.wait(400);
      this.dino.react('wave');
      await this.say('parent_code');
      this.input.enabled = false;
      await firstLaunchSetup();
      this.dino.react('cheer');
      await this.say('parent_code_done');
      this.scene.restart(data);
    });
  }

  /** Mode nuit : le dino dort jusqu'au matin ; un parent peut débloquer avec son code. */
  private sleeping() {
    const u = unit(this);
    this.hideButtons();
    this.dino.sleep();
    const unlock = new Bubble(this, this.play.x, this.play.y, u * 0.11, 0xffffff, 'ui-parents', () => {
      this.run(async () => {
        app.voice.stop();
        this.input.enabled = false;
        const ok = await unlockNight();
        this.input.enabled = true;
        if (ok) this.scene.restart({});
      });
    }, 0.6).setAlpha(0.8);
    this.add.text(unlock.x, unlock.y + u * 0.17, 'Chut… le dino dort.\nUn parent peut débloquer avec son code.', {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(u * 0.036)}px`, color: '#ffffff', align: 'center',
      backgroundColor: '#2d3354cc', padding: { x: 14, y: 10 },
    }).setOrigin(0.5, 0);
    this.time.delayedCall(500, () => this.run(() => this.say('night.sleep')));
  }

  private hideButtons() {
    [this.play, this.choose, this.wardrobe, this.gift].forEach((b) => b?.setVisible(false));
  }

  /**
   * Temps de jeu atteint : plus de bouton de jeu, le dino bâille et va dormir.
   * Un cadenas permet à un parent de débloquer avec son code.
   */
  private bedtime() {
    const u = unit(this);
    this.hideButtons();
    const unlock = new Bubble(this, this.play.x, this.play.y, u * 0.13, 0xffffff, 'ui-parents', () => {
      this.run(async () => {
        app.voice.stop();
        this.input.enabled = false;
        const ok = await unlockPlayTime();
        this.input.enabled = true;
        if (ok) this.scene.restart({});
      });
    }, 0.6);
    this.add.text(unlock.x, unlock.y + u * 0.19, 'Temps de jeu terminé.\nUn parent peut débloquer avec son code.', {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(u * 0.036)}px`, color: '#ffffff', align: 'center',
      backgroundColor: '#2d3354cc', padding: { x: 14, y: 10 },
    }).setOrigin(0.5, 0);
    const sleep = () => this.run(async () => {
      this.dino.react('yawn');
      await this.say('bedtime');
    });
    this.time.delayedCall(400, sleep);
    this.time.addEvent({ delay: 9000, loop: true, callback: () => this.dino.react('yawn') });
  }

  /** Le cadenas : le code parent ouvre l'espace parents. */
  private openParentSpace() {
    this.clearIdle();
    this.guide.hide();
    app.voice.stop();
    this.input.enabled = false;
    this.run(async () => {
      const ok = app.progress.settings.pin
        ? await askParentCode('Espace parents', 'Tapez votre code parent.')
        : await createParentCode('Code parent', 'Choisissez un code à 4 chiffres.', 'Annuler');
      if (ok) openParents(() => this.scene.restart({}));
      else this.scene.restart({});
    });
  }
}
