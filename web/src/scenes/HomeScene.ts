import Phaser from 'phaser';
import { app } from '../core/app';
import { applyChildSettings, planetSeries, playableGames, switchChild } from '../core/app';
import { chooseEnvelope } from '../ui/envelopes';
import { openParents } from '../ui/parents';
import { askParentCode, childForm, createParentCode, unlockNight, unlockPlayTime } from '../ui/pin';
import { colorSuffix } from '../dino/parts';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { buzzingFlies } from '../ui/flies';
import { arrowTexture, candyButton, setHighlight, tileButton, woodSign } from '../ui/kit';
import { drawSkyLife } from '../ui/sky';
import { goTo, growthFactor, makeTickable, unit } from '../ui/scenery';
import { drawIsland } from '../ui/island';
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
  private play!: Phaser.GameObjects.Container;
  private choose?: Phaser.GameObjects.Container;
  private dinoBase = 0;
  private gift?: Bubble;
  private childSwitch?: Bubble;
  private wardrobe?: Phaser.GameObjects.Container;

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
    drawIsland(this, night ? 'night' : 'day');
    drawSkyLife(this, night);
    const { width: W, height: H } = this.scale;
    const u = unit(this);

    // Le dino à gauche, tourné vers les boutons.
    this.dinoBase = u * 0.62;
    this.dino = new Dino(this, W * 0.25, H * 0.97, this.dinoBase * growthFactor(app.progress.dino.level));
    makeTickable(this.dino);
    if (!night) buzzingFlies(this, this.dino);
    this.guide = new Guide(this, u * 0.15);

    // Le titre sur sa planche de bois, et le prénom de l'enfant dessous.
    const cx = W * 0.64;
    const title = woodSign(this, cx, H * 0.17, 'DinoLearn', u * 0.085, true);
    this.tweens.add({ targets: title, angle: { from: -1.5, to: 1.5 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (app.progress.name) {
      woodSign(this, cx, H * 0.31, `Joue avec ton dino, ${app.progress.name} !`, u * 0.034, false);
    }

    // Le gros bouton « Jouer » : une série de jeux au hasard (le tour du monde des jeux).
    this.play = candyButton(this, cx, H * 0.5, u * 0.46, u * 0.15, 'green', 'Jouer', () => this.playRandom(),
      arrowTexture(this, 'play'), true);

    // La barre du bas : les jeux (si les parents l'ont activé), le dressing, l'espace parents.
    const tiles: { icon: string; text: string; onTap: () => void; keep?: (c: Phaser.GameObjects.Container) => void }[] = [];
    if (app.progress.settings.chooseGames) {
      tiles.push({ icon: 'ui-globe', text: 'Les jeux', onTap: () => this.openChoose(),
        keep: (c) => (this.choose = c) });
    }
    tiles.push({ icon: 'ui-wardrobe', text: 'Mon Dino', onTap: () => { this.clearIdle(); goTo(this, 'Wardrobe'); },
      keep: (c) => (this.wardrobe = c) });
    tiles.push({ icon: 'ui-lock', text: 'Parents', onTap: () => this.openParentSpace() });
    const tw = u * 0.17, gap = u * 0.035;
    tiles.forEach((t, i) => {
      const x = cx + (i - (tiles.length - 1) / 2) * (tw + gap);
      const c = tileButton(this, x, H * 0.77, tw, tw * 0.95, t.icon, t.text, t.onTap);
      t.keep?.(c);
    });

    // Le cadeau à ouvrir quand le dino a grandi : sur la tuile du dressing.
    if (app.progress.collection.pending > 0 && this.wardrobe) {
      this.gift = new Bubble(this, this.wardrobe.x + tw * 0.45, this.wardrobe.y - tw * 0.45, u * 0.05, 0xfff3c4, 'ui-gift', () => {
        // Le cadeau se choisit au vestiaire, où l'enfant habille son dino.
        this.clearIdle();
        goTo(this, 'Wardrobe');
      }, 0.75);
      this.tweens.add({ targets: this.gift, angle: { from: -10, to: 10 }, duration: 260, yoyo: true, repeat: -1 });
    }

    // En haut à gauche : le dino de l'enfant suivant ; à droite, l'étoile du niveau.
    const ar = u * 0.06;
    this.childButton(ar * 1.4, ar * 1.4, ar);
    this.drawLevelBadge(W - u * 0.11, u * 0.11, u);


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
        await this.say('welcome_first');
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
    setHighlight(this.play, true);
    this.dino.pointAt(this.play.x, this.play.y);
    this.guide.tap(this.play);
    await this.say('home.play');
    setHighlight(this.play, false);
    if (this.choose) {
      this.dino.pointAt(this.choose.x, this.choose.y);
      this.guide.tap(this.choose);
      await this.say('home.categories');
    }
    this.guide.hide();
    this.armIdle([[9000, () => this.run(() => this.reminder())]]);
  }

  private async reminder() {
    this.dino.react('happy');
    setHighlight(this.play, true);
    this.guide.tap(this.play);
    await this.say('home.play');
    setHighlight(this.play, false);
    this.guide.hide();
    this.armIdle([[14000, () => this.run(() => this.reminder())]]);
  }

  private openChoose() {
    this.clearIdle();
    this.guide.hide();
    goTo(this, 'Choose');
  }

  private playRandom() {
    this.clearIdle();
    this.guide.hide();
    this.dino.react('dance');
    this.run(async () => {
      await this.say('random.go');
      goTo(this, 'Game', planetSeries());
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
      fontFamily: "'Baloo 2', Arial Rounded MT Bold, Arial, sans-serif", fontSize: `${Math.round(u * 0.055)}px`,
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
    if (!app.progress.envelopeDue()) this.dino.sleep();
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
    this.run(async () => {
      // Fin de la soirée : d'abord l'enveloppe surprise du jour, puis dodo.
      if (app.progress.envelopeDue()) {
        await this.wait(500);
        await chooseEnvelope(this, this.dino);
        if (!this.alive) return;
        this.dino.sleep();
      }
      await this.wait(500);
      await this.say('night.sleep');
    });
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
    const note = this.add.text(unlock.x, unlock.y + u * 0.19, 'Temps de jeu terminé.\nUn parent peut débloquer avec son code.', {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(u * 0.036)}px`, color: '#ffffff', align: 'center',
      backgroundColor: '#2d3354cc', padding: { x: 14, y: 10 },
    }).setOrigin(0.5, 0);
    this.run(async () => {
      // Le temps de jeu est fini : l'enveloppe surprise du jour (le cadenas attend derrière), puis dodo.
      if (app.progress.envelopeDue()) {
        unlock.setVisible(false);
        note.setVisible(false);
        await this.wait(400);
        await chooseEnvelope(this, this.dino);
        if (!this.alive) return;
        unlock.setVisible(true);
        note.setVisible(true);
      }
      await this.wait(400);
      this.dino.react('yawn');
      await this.say('bedtime');
    });
    this.time.addEvent({ delay: 9000, loop: true, callback: () => this.dino.react('yawn') });
  }

  /** Le cadenas : le code parent ouvre l'espace parents. */
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
