import { safeArea } from '../ui/safeArea';
import Phaser from 'phaser';
import { app } from '../core/app';
import { applyChildSettings, planetSeries, switchChild } from '../core/app';
import { chooseEnvelope } from '../ui/envelopes';
import { openParents } from '../ui/parents';
import { askParentCode, childForm, createParentCode, unlockNight, unlockPlayTime } from '../ui/pin';
import { colorSuffix } from '../dino/parts';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { buzzingFlies } from '../ui/flies';
import { arrowTexture, candyButton, navTile, setHighlight, starTexture, woodSign } from '../ui/kit';
import { drawSkyLife } from '../ui/sky';
import { goTo, growthFactor, makeTickable, unit } from '../ui/scenery';
import { backdropPoint, drawBackdrop, VOLCANO_MOUND } from '../ui/backdrop';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { BaseScene } from './BaseScene';
import { t } from '../i18n';

/**
 * Accueil : le bouton vert, au centre, lance une série tout mélangée
 * (chaque question vient d'un jeu au hasard, choix par défaut). Un petit bouton ouvre le choix des jeux.
 * À gauche : le gâteau (âge) et le cadenas de l'espace parents (code parent) ; à droite, l'étoile du niveau.
 * En bas, la barre de navigation : Missions (choix des jeux, si les parents l'ont activé), Mon Dino
 * (vestiaire) et Paramètres (espace parents, avec le code parent).
 * Dans le ciel passent des météorites et le soleil ; des mouches viennent embêter le dino.
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
  private settings?: Phaser.GameObjects.Container;
  private level?: Phaser.GameObjects.Container;

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
    const bg = drawBackdrop(this, 'volcano', { night, animatedHome: true });
    drawSkyLife(this, night);
    const { width: W, height: H } = this.scale;
    const u = unit(this);

    // Le dino à gauche, sur sa motte de terre, tourné vers les boutons.
    this.dinoBase = u * 0.62;
    const mound = backdropPoint(this, bg, VOLCANO_MOUND.x, VOLCANO_MOUND.y);
    this.dino = new Dino(this, mound.x, Math.min(mound.y, H * 0.97), this.dinoBase * growthFactor(app.progress.dino.level));
    makeTickable(this.dino);
    if (!night) buzzingFlies(this, this.dino);
    this.guide = new Guide(this, u * 0.15);

    // Le titre sur sa planche de bois, et le prénom de l'enfant dessous.
    const cx = W * 0.64;
    // Titre un peu plus petit sur les écrans étroits (tablette 4:3), pour ne pas toucher l'étoile du niveau.
    const narrow = Math.min(1, W / (u * 1.7));
    const title = woodSign(this, cx, H * 0.15, 'DinoLearn', u * 0.1 * narrow, true);
    // Deux étoiles qui brillent aux coins de la planche.
    for (const side of [-1, 1]) {
      const star = this.add.image(side * (title.width / 2 - u * 0.02), -u * 0.035, 'ui-star');
      star.setScale((u * 0.095) / star.width).setAngle(side * -14);
      title.add(star);
      this.tweens.add({ targets: star, angle: side * 14, scale: star.scale * 1.12, duration: 900 + (side + 1) * 150,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.tweens.add({ targets: title, angle: { from: -1.5, to: 1.5 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    woodSign(this, cx, H * 0.3, app.progress.name ? t('ui.home.playWith', { name: app.progress.name }, 'Joue avec ton dino, {name} !') : t('ui.home.learn', {}, 'Apprends et joue avec ton Dino !'),
      u * 0.038, false);

    // Le gros bouton « Jouer » : une série de jeux au hasard (le tour du monde des jeux).
    this.play = candyButton(this, cx, H * 0.52, u * 0.5, u * 0.16, 'green', 'Jouer', () => this.playRandom(),
      arrowTexture(this, 'play'), true);

    // La barre de navigation du bas.
    const tiles: { icon: string; text: string; onTap: () => void; keep?: (c: Phaser.GameObjects.Container) => void }[] = [];
    if (app.progress.settings.chooseGames) {
      tiles.push({ icon: 'ui-missions', text: 'Missions', onTap: () => this.openChoose(),
        keep: (c) => (this.choose = c) });
    }
    tiles.push({ icon: 'ui-mydino', text: 'Mon Dino', onTap: () => { this.clearIdle(); goTo(this, 'Wardrobe'); },
      keep: (c) => (this.wardrobe = c) });
    tiles.push({ icon: 'ui-settings', text: 'Paramètres', onTap: () => this.openParentSpace(),
      keep: (c) => (this.settings = c) });
    // Les tuiles tiennent à droite du dino, centrées sous le bouton « Jouer ».
    const th = u * 0.17, gap = u * 0.03;
    const tileW = Math.min(u * 0.25, ((W - cx) * 2 - u * 0.08 - gap * (tiles.length - 1)) / tiles.length);
    tiles.forEach((t, i) => {
      const x = cx + (i - (tiles.length - 1) / 2) * (tileW + gap);
      const c = navTile(this, x, H * 0.83, tileW, th, t.icon, t.text, t.onTap);
      t.keep?.(c);
    });

    // Le cadeau à ouvrir quand le dino a grandi : sur la tuile du dressing.
    if (app.progress.collection.pending > 0 && this.wardrobe) {
      this.gift = new Bubble(this, this.wardrobe.x + tileW * 0.42, this.wardrobe.y - th * 0.55, u * 0.05, 0xfff3c4, 'ui-gift', () => {
        // Le cadeau se choisit au vestiaire, où l'enfant habille son dino.
        this.clearIdle();
        goTo(this, 'Wardrobe');
      }, 0.75);
      this.tweens.add({ targets: this.gift, angle: { from: -10, to: 10 }, duration: 260, yoyo: true, repeat: -1 });
    }

    // En haut à gauche : le dino de l'enfant suivant ; à droite, l'étoile du niveau.
    const ar = u * 0.06;
    // En haut à gauche, le changement d’enfant ; à droite, le niveau.
    const inset = safeArea(this);
    this.childButton(inset.left + ar * 1.4, inset.top + ar * 1.4, ar);
    this.drawLevelBadge(W - inset.right - u * 0.11, inset.top + u * 0.11, u);

    // À l'ouverture du jeu, le dino dort sur sa motte : il faut le réveiller (ce toucher
    // débloque aussi le son et la voix). Les boutons n'apparaissent qu'ensuite.
    if (!app.awake) {
      this.asleep(() => this.start(data, night));
      return;
    }
    this.start(data, night);
  }

  /** Suite de l'accueil, dino réveillé. */
  private start(data: { hatched?: boolean; switched?: boolean }, night: boolean) {
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

  /** Le dino dort ; tous les boutons sont cachés jusqu'à ce que l'enfant le réveille. */
  private asleep(then: () => void) {
    const buttons = this.buttons().filter((b) => b.visible);
    buttons.forEach((b) => b.setVisible(false));
    this.dino.sleep();
    this.guide.tap({ x: this.dino.x, y: this.dino.y - this.dino.displayHeight * 0.35 });
    let done = false;
    const wake = () => {
      if (done) return;
      done = true;
      this.guide.hide();
      app.voice.unlock();
      Sfx.unlock();
      Music.unlock();
      app.awake = true;
      Sfx.play('boing');
      this.dino.wake();
      buttons.forEach((b, i) => {
        const s = b.scale;
        b.setVisible(true).setScale(0);
        this.tweens.add({ targets: b, scale: s, duration: 380, delay: 250 + i * 70, ease: 'Back.easeOut' });
      });
      this.time.delayedCall(700, then);
    };
    this.input.once('pointerdown', wake);
  }

  /** Tous les boutons de l'accueil (cachés tant que le dino dort). */
  private buttons(): Phaser.GameObjects.Container[] {
    return [this.play, this.choose, this.wardrobe, this.gift, this.childSwitch, this.level,
      this.settings]
      .filter((b): b is Phaser.GameObjects.Container => !!b);
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
    this.armIdle([[65000, () => this.run(() => this.reminder())]]);
  }

  private async reminder() {
    if (this.dino.free && !app.voice.talking) await this.say('home.ambient');
    this.armIdle([[65000, () => this.run(() => this.reminder())]]);
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
    const badge = this.level = this.add.container(x, y);
    const star = this.add.image(0, 0, starTexture(this));
    star.setScale((u * 0.16) / star.width).setInteractive();
    star.on('pointerup', () => {
      this.dino.react('happy');
      this.showProgress();
    });
    const text = this.add.text(0, 0, String(app.progress.dino.level), {
      fontFamily: "'Baloo 2', Arial Rounded MT Bold, Arial, sans-serif", fontSize: `${Math.round(u * 0.055)}px`,
      color: '#ffffff', fontStyle: 'bold', stroke: '#2d3354', strokeThickness: Math.round(u * 0.012),
    }).setOrigin(0.5);
    badge.add([star, text]);
    this.tweens.add({ targets: star, angle: { from: -7, to: 7 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: badge, scale: 1.06, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private showProgress() {
    this.clearIdle();
    app.voice.stop();
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'border:4px solid #f4c74e;border-radius:26px;padding:28px;text-align:center;color:#294439;max-width:380px;font:22px system-ui;background:#fffbed';
    const title = document.createElement('h2');
    title.textContent = `⭐ Niveau ${app.progress.dino.level}`;
    const summary = document.createElement('p');
    summary.textContent = t('ui.home.summary', { n: app.progress.seriesPlayed }, '{n} parties terminées. Ton dino grandit avec toi !');
    const close = document.createElement('button');
    close.textContent = 'Continuer';
    close.style.cssText = 'border:0;border-radius:16px;background:#389f26;color:white;padding:14px 28px;font:inherit;cursor:pointer';
    dialog.append(title, summary, close);
    document.body.append(dialog);
    const previousInput = this.input.enabled;
    this.input.enabled = false;
    const cleanup = () => {
      dialog.remove();
      this.input.enabled = previousInput;
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      if (this.alive) this.armIdle([[65000, () => this.run(() => this.reminder())]]);
    };
    dialog.addEventListener('close', cleanup, { once: true });
    close.onclick = () => dialog.close();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    dialog.showModal();
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
      const child = await childForm(t('ui.child.title', {}, 'Comment s\'appelle l\'enfant ?'), t('ui.child.sub', {}, 'Le dino va l\'appeler par son prénom.'), {
        name: '', age: p.age, country: s.country, dailyMinutes: s.dailyMinutes, nightTime: s.nightTime, chooseGames: true,
      });
      if (child) {
        p.name = child.name;
        p.age = child.age;
        p.updateSettings({ country: child.country, dailyMinutes: child.dailyMinutes, nightTime: child.nightTime,
          chooseGames: child.chooseGames ?? true });
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
    this.add.text(unlock.x, unlock.y + u * 0.17, t('ui.home.sleeping', {}, 'Chut… le dino dort.\nUn parent peut débloquer avec son code.'), {
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
    const note = this.add.text(unlock.x, unlock.y + u * 0.19, t('ui.home.timeUp', {}, 'Temps de jeu terminé.\nUn parent peut débloquer avec son code.'), {
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
        ? await askParentCode(t('ui.parents.title', {}, 'Espace parents'), t('ui.pin.type', {}, 'Tapez votre code parent.'))
        : await createParentCode(t('ui.pin.title', {}, 'Code parent'), t('ui.pin.choose', {}, 'Choisissez un code à 4 chiffres.'), t('ui.cancel', {}, 'Annuler'));
      if (ok) openParents(() => this.scene.restart({}));
      else this.scene.restart({});
    });
  }
}
