import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { applyChildSettings, playableGames, switchChild } from '../core/app';
import { chooseGifts } from '../ui/gifts';
import { Music } from '../core/music';
import { openParents } from '../ui/parents';
import { askParentCode, childForm, createParentCode, unlockNight, unlockPlayTime } from '../ui/pin';
import { colorSuffix } from '../dino/parts';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawNightSky, drawScenery, goTo, growthFactor, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Accueil : un gros bouton vert au centre lance une série tout mélangée
 * (chaque question vient d'un jeu au hasard, choix par défaut). Un petit bouton ouvre le choix des jeux. En haut : le gâteau
 * (âge), l'étoile du niveau du dino et le cadenas de l'espace parents (appui long, puis glisser vers le haut).
 * Quand le temps de jeu du jour fixé par les parents est atteint, le dino va se coucher.
 */
export class HomeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private play!: Bubble;
  private choose!: Phaser.GameObjects.Container;
  private dinoBase = 0;
  private gift?: Bubble;
  private childSwitch?: Bubble;
  private wardrobe!: Bubble;

  constructor() {
    super('Home');
  }

  create(data: { hatched?: boolean; switched?: boolean }) {
    // Pas encore d'enfant, ou l'œuf de l'enfant n'est pas éclos : retour à l'œuf.
    if (!app.profiles.pin || app.profiles.count === 0 || !app.progress.hatched) {
      this.scene.start('Start');
      return;
    }
    this.initBase();
    // Après l'heure du coucher : ciel de nuit.
    const night = app.progress.isNight();
    if (night) drawScenery(this, 0x18214a, 0x52609e, 1);
    else drawScenery(this);
    if (night) drawNightSky(this);
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
    this.musicButton(ar * 1.4, ar * 1.4, ar);
    this.childButton(ar * 1.4, ar * 3.9, ar);
    this.drawLevelBadge(W - u * 0.13, u * 0.11, u);
    this.parentGate(W - u * 0.13, u * 0.27, u);

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


    // Partie d'avant les prénoms : on demande le prénom à un parent.
    if (!app.progress.name) {
      this.askName();
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
        // Il vient de dire bonjour en sortant de l'œuf.
        this.dino.react('cheer');
      } else if (data?.switched) {
        // Changement d'enfant entre deux séries.
        this.dino.react('wave');
        await this.say('child.turn');
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

  /** Bouton de la musique : note de musique (allumée) ou haut-parleur barré (coupée). */
  private musicButton(x: number, y: number, r: number) {
    const button = new Bubble(this, x, y, r, 0xe0f2fe, Music.isEnabled ? 'ui-music' : 'ui-music-off', () => {
      const on = !Music.isEnabled;
      Music.setEnabled(on);
      app.progress.updateSettings({ music: on });
      Music.unlock();
      button.setIcon(on ? 'ui-music' : 'ui-music-off');
    }, 0.65);
    button.setAlpha(0.85);
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

  /** Partie d'avant les prénoms : un parent complète la fiche de l'enfant. */
  private askName() {
    this.hideButtons();
    this.run(async () => {
      await this.wait(400);
      this.dino.react('wave');
      await this.say('child.ask_name');
      this.input.enabled = false;
      const p = app.progress;
      const s = p.settings;
      const child = await childForm('Comment s\'appelle l\'enfant ?', 'Le dino va l\'appeler par son prénom.', {
        name: '', age: p.age, country: s.country, dailyMinutes: s.dailyMinutes, nightTime: s.nightTime,
      });
      if (child) {
        p.name = child.name;
        p.age = child.age;
        p.updateSettings({ country: child.country, dailyMinutes: child.dailyMinutes, nightTime: child.nightTime });
        applyChildSettings();
      }
      this.scene.restart({});
    });
  }

  /** Plusieurs enfants : la tête du dino de l'enfant suivant ; le toucher passe la main. */
  private childButton(x: number, y: number, r: number) {
    if (app.profiles.count < 2) return;
    const next = app.profiles.progressOf(app.profiles.nextId());
    const button = new Bubble(this, x, y, r, 0xfff3c4, `dino-head${colorSuffix(next.hatched ? next.color : 0)}`, () => {
      this.clearIdle();
      switchChild(app.profiles.nextId());
      this.scene.restart({ switched: true });
    }, 0.8);
    button.setAlpha(0.9);
    this.add.text(x, y + r * 1.25, next.name, {
      fontFamily: 'Andika, Arial, sans-serif', fontSize: `${Math.round(r * 0.45)}px`, color: '#2d3354', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.childSwitch = button;
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
    [this.play, this.choose, this.wardrobe, this.gift, this.childSwitch].forEach((b) => b?.setVisible(false));
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

  /**
   * Cadenas de l'espace parents : il faut rester appuyé dessus, puis glisser
   * vers le haut sans lâcher. Un petit texte explique le geste aux adultes.
   */
  private parentGate(x: number, y: number, u: number) {
    const { width: W } = this.scale;
    const lock = this.add.image(x, y, 'ui-parents').setAlpha(0.75);
    lock.setScale((u * 0.075) / lock.width).setInteractive({ useHandCursor: true });
    const info = this.add.text(W - u * 0.03, y + u * 0.08, '', {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(u * 0.036)}px`, color: '#ffffff',
      backgroundColor: '#2d3354cc', padding: { x: 14, y: 10 }, align: 'right',
      wordWrap: { width: W * 0.6 },
    }).setOrigin(1, 0).setDepth(50).setVisible(false);
    const arrow = this.add.text(x, y - u * 0.08, '↑', {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(u * 0.07)}px`, color: '#2d3354', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50).setVisible(false);
    let startY = 0;
    let pressed = false;
    let armed = false;
    let opened = false;
    let hold: Phaser.Time.TimerEvent | undefined;
    let hide: Phaser.Time.TimerEvent | undefined;
    const say = (text: string, ms?: number) => {
      hide?.remove();
      info.setText(text).setVisible(true);
      if (ms) hide = this.time.delayedCall(ms, () => info.setVisible(false));
    };

    lock.on('pointerdown', (p: Phaser.Input.Pointer) => {
      pressed = true;
      armed = false;
      startY = p.y;
      say('Espace parents : reste appuyé…');
      hold = this.time.delayedCall(700, () => {
        if (!pressed) return;
        armed = true;
        say('Maintenant, glisse vers le haut sans lâcher ↑');
        arrow.setVisible(true).setY(y - u * 0.06).setAlpha(1);
        this.tweens.add({ targets: arrow, y: y - u * 0.16, alpha: 0.2, duration: 600, repeat: -1 });
      });
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!armed || opened || !p.isDown || startY - p.y < u * 0.1) return;
      opened = true;
      this.openParentSpace();
    });
    this.input.on('pointerup', () => {
      if (!pressed) return;
      pressed = false;
      hold?.remove();
      this.tweens.killTweensOf(arrow);
      arrow.setVisible(false);
      if (opened) return;
      say(armed
        ? 'Glisse vers le haut sans lâcher le doigt.'
        : 'Espace parents : reste appuyé sur le cadenas, puis glisse vers le haut.', 3500);
      armed = false;
    });
  }

  /** Le geste est fait : il faut encore le code parent. */
  private openParentSpace() {
    this.clearIdle();
    this.guide.hide();
    app.voice.stop();
    this.input.enabled = false;
    this.run(async () => {
      const ok = app.profiles.pin
        ? await askParentCode('Espace parents', 'Tapez votre code parent.')
        : await createParentCode('Code parent', 'Choisissez un code à 4 chiffres.', 'Annuler');
      if (ok) openParents(() => this.scene.restart({}));
      else this.scene.restart({});
    });
  }
}
