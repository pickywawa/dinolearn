import Phaser from 'phaser';
import { app, switchChild } from '../core/app';
import { Leftover } from '../core/progress';
import { SeriesResult } from '../core/series';
import { vibrate } from '../core/haptics';
import { Sfx } from '../core/sfx';
import { foodImage } from '../domain/models';
import { feed, growthProgress } from '../domain/progression';
import { foodXp } from '../domain/rewards';
import { Dino, DinoReaction } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

const MAX_SHOWN = 10;

/** Le dino réclame à manger, chaque fois d'une autre façon. */
const HUNGER: { reaction: DinoReaction; line: string; look?: boolean }[] = [
  { reaction: 'growl', line: 'hunger.growl' },
  { reaction: 'lookAround', line: 'hunger.look', look: true },
  { reaction: 'beg', line: 'hunger.beg' },
  { reaction: 'gape', line: 'hunger.gape' },
  { reaction: 'oops', line: 'hunger.sad' },
];

export interface EndData {
  result: SeriesResult;
  /** Partie lancée par le gros bouton : « rejouer » relance une série tout mélangée. */
  mixed?: boolean;
}

/**
 * Fin de série : étoiles, puis les fruits gagnés tombent dans un panier.
 * L'enfant donne tout le panier au dino d'un seul geste (toucher ou glisser) ;
 * le dino mange les fruits un par un et sa jauge de croissance se remplit.
 */
export class EndScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private basket?: Phaser.GameObjects.Container;
  private basketHome = new Phaser.Math.Vector2();
  private fruits: { leftover: Leftover; img: Phaser.GameObjects.Image }[] = [];
  private again!: Bubble;
  private feeding = false;
  private eatenCount = 0;

  constructor() {
    super('End');
  }

  create(data: EndData) {
    this.initBase();
    // Le soir, cette série était la dernière.
    app.progress.markNightSeries();
    drawScenery(this, 0xffe9a8, 0xfff8e6);
    const r = data.result;
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    this.fruits = [];
    this.basket = undefined;
    this.feeding = false;
    this.eatenCount = 0;

    homeButton(this, () => goTo(this, 'Home'));
    this.dino = new Dino(this, W / 2, H * (portrait ? 0.7 : 0.74), u * (portrait ? 0.62 : 0.5));
    this.dino.setBellyFill(growthProgress(app.progress.dino));
    this.guide = new Guide(this, u * 0.16);
    this.again = new Bubble(this, W - u * 0.15, u * 0.15, u * 0.11, 0x43b649, 'ui-play', () => {
      // Temps de jeu du jour atteint : retour à l'accueil, où le dino va se coucher.
      if (app.progress.timeIsUp()) goTo(this, 'Home');
      else goTo(this, 'Game', data.mixed ? { mixed: true } : { gameId: r.gameId });
    });
    this.again.setVisible(false);

    const stars = [0, 1, 2].map((i) => {
      const star = this.add.image(W / 2 + (i - 1) * u * 0.18, H * 0.1, 'ui-star').setAlpha(0.25);
      star.setScale((u * 0.14) / star.width).setTintFill(0xffffff);
      return star;
    });

    // Les fruits gagnés, plus ceux gardés d'une partie précédente (ventre plein).
    const earned: Leftover[] = r.earned.map((food) => ({ food, xp: foodXp(food, r.level) }));
    const all = [...earned, ...app.progress.leftovers];
    app.progress.leftovers = all;
    const shown = all.slice(0, MAX_SHOWN);

    this.run(async () => {
      for (let i = 0; i < r.stars; i++) {
        await this.wait(380);
        Sfx.play('star');
        stars[i].clearTint().setAlpha(1);
        this.tweens.add({ targets: stars[i], scale: { from: stars[i].scale * 1.6, to: stars[i].scale }, duration: 400, ease: 'Back.easeOut' });
      }
      const group = r.stars === 3 ? (r.firstTrySuccesses === r.total ? 'series_perfect' : 'series_great')
        : r.stars === 2 ? 'series_good' : r.stars === 1 ? 'series_ok' : 'series_encourage';
      this.dino.react(r.firstTrySuccesses === r.total && r.total > 0 ? 'spin' : r.stars >= 3 ? 'dance' : r.stars === 2 ? 'cheer' : r.stars === 1 ? 'happy' : 'think');
      await this.say(group);
      if (shown.length === 0) {
        await this.say('end.nothing');
        await this.showAgain();
        return;
      }
      this.makeBasket(shown, W / 2, H * (portrait ? 0.88 : 0.88));
      await this.wait(500 + shown.length * 120);
      this.showBasketHint();
      await this.say('end.feed');
      this.armFeedReminder();
    });
  }

  /** Le panier, rempli des fruits qui y tombent un par un. Toucher ou glisser = tout donner. */
  private makeBasket(foods: Leftover[], x: number, y: number) {
    const u = unit(this);
    const basket = this.add.container(x, y).setDepth(10);
    const img = this.add.image(0, 0, 'ui-basket');
    const size = u * 0.3;
    img.setScale(size / img.width);
    basket.add(img);
    foods.forEach((leftover, i) => {
      const fruit = this.add.image(0, -u * 0.6, foodImage(leftover.food));
      fruit.setScale((u * 0.1) / fruit.width);
      // Les fruits s'empilent et dépassent bien du panier.
      const col = i % 5;
      const row = Math.floor(i / 5);
      const tx = (col - 2) * u * 0.05 + (row % 2) * u * 0.025;
      const ty = -size * 0.3 - row * u * 0.065;
      basket.addAt(fruit, 0);
      this.tweens.add({ targets: fruit, x: tx, y: ty, duration: 500, delay: i * 120, ease: 'Bounce.easeOut' });
      this.fruits.push({ leftover, img: fruit });
    });
    basket.setSize(size, size).setInteractive({ draggable: true, useHandCursor: true });
    this.basket = basket;
    this.basketHome.set(x, y);
    basket.on('dragstart', () => { this.guide.hide(); this.clearIdle(); });
    basket.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => basket.setPosition(dx, dy));
    basket.on('dragend', () => this.giveBasket(false));
    basket.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.getDistance() < 12) this.giveBasket(true);
    });
  }

  private showBasketHint() {
    if (this.basket && !this.feeding) this.guide.tap(this.basket);
  }

  /**
   * Le panier n'arrive pas : le dino réclame, chaque fois autrement (ventre qui
   * gargouille, il regarde les fruits, il supplie, il ouvre grand la bouche…).
   */
  private armFeedReminder(step = 0) {
    this.armIdle([[step === 0 ? 6000 : 7000, () => this.run(async () => {
      if (this.feeding || !this.basket) return;
      const ask = HUNGER[step % HUNGER.length];
      this.dino.react(ask.reaction);
      if (ask.reaction === 'growl') {
        Sfx.play('rumble');
        vibrate(400);
      }
      if (ask.look) this.dino.pointAt(this.basket.x, this.basket.y);
      this.showBasketHint();
      await this.say(ask.line);
      this.armFeedReminder(step + 1);
    })]]);
  }

  /** Après un bon repas : un rot ou un prout (le téléphone vibre), et le dino s'excuse. */
  private async afterMeal() {
    await this.wait(400);
    const burp = Math.random() < 0.5;
    Sfx.play(burp ? 'burp' : 'fart');
    vibrate(burp ? [250] : [90, 50, 300]);
    this.dino.react(burp ? 'burp' : 'fart');
    await this.wait(700);
    await this.say(burp ? 'burp' : 'fart');
  }

  /** Le panier vient à la bouche du dino, qui mange les fruits un par un. */
  private giveBasket(tapped: boolean) {
    const basket = this.basket;
    if (!basket || this.feeding) return;
    const mouth = this.dino.mouthWorldPoint();
    const near = Phaser.Math.Distance.Between(basket.x, basket.y, mouth.x, mouth.y) < unit(this) * 0.35;
    if (!near && !tapped) {
      this.tweens.add({ targets: basket, x: this.basketHome.x, y: this.basketHome.y, duration: 300, ease: 'Back.easeOut' });
      return;
    }
    this.feeding = true;
    this.clearIdle();
    this.guide.hide();
    basket.disableInteractive();
    this.tweens.add({
      targets: basket, x: mouth.x + unit(this) * 0.12, y: mouth.y + unit(this) * 0.16, duration: 400, ease: 'Sine.easeOut',
      onComplete: () => this.run(() => this.eatAll()),
    });
  }

  private async eatAll() {
    const mouth = this.dino.mouthWorldPoint();
    let leveledUp = false;
    let full = false;
    for (const fruit of [...this.fruits]) {
      const result = feed(app.progress.dino, fruit.leftover.xp, app.progress.xpEatenToday());
      if (result.outcome === 'full' || result.outcome === 'maxLevel') {
        full = true;
        break;
      }
      const m = fruit.img.getWorldTransformMatrix();
      this.basket!.remove(fruit.img);
      fruit.img.setPosition(m.tx, m.ty).setDepth(20);
      this.add.existing(fruit.img);
      await new Promise<void>((resolve) => this.tweens.add({
        targets: fruit.img, x: mouth.x, y: mouth.y, scale: fruit.img.scale * 0.4, duration: 260, ease: 'Quad.easeIn',
        onComplete: () => resolve(),
      }));
      fruit.img.destroy();
      this.fruits = this.fruits.filter((f) => f !== fruit);
      app.progress.leftovers = app.progress.leftovers.filter((l) => l !== fruit.leftover);
      app.progress.saveFeeding(result.dino, result.xpEatenToday);
      this.eatenCount++;
      Sfx.play('chomp');
      this.dino.react('eat');
      this.dino.setBellyFill(growthProgress(result.dino));
      leveledUp ||= result.outcome === 'levelUp';
      await this.wait(420);
    }
    this.tweens.add({ targets: this.basket!, alpha: full ? 1 : 0, duration: 300 });
    const eaten = Math.min(this.eatenCount, MAX_SHOWN);
    if (full) {
      this.dino.react('think');
      await this.say('full');
    } else {
      await this.say('eating');
    }
    // Il a bien mangé (ou il a le ventre plein) : ça fait des bruits rigolos !
    if (full || eaten >= 3) await this.afterMeal();
    if (leveledUp) {
      Sfx.play('levelUp');
      this.dino.react('levelUp');
      await this.say('level_up');
    }
    // Chaque niveau gagné : un objet à choisir, au vestiaire (l'enfant y habille son dino).
    if (app.progress.collection.pending > 0) {
      this.again.setVisible(false);
      this.dino.react('cheer');
      await this.say('gift.go');
      goTo(this, 'Wardrobe');
      return;
    }
    await this.showAgain();
  }

  /** Le dino montre le bouton vert pour rejouer (le soir : il dit bonne nuit et va se coucher). */
  private async showAgain() {
    this.clearIdle();
    if (app.progress.isSleeping()) {
      this.dino.react('yawn');
      await this.say('night.goodnight');
      goTo(this, 'Home');
      return;
    }
    // Plusieurs enfants qui alternent : c'est au tour du suivant.
    if (app.profiles.alternate && app.profiles.count > 1) {
      const current = app.progress.name;
      const next = app.profiles.progressOf(app.profiles.nextId()).name;
      this.dino.react('wave');
      const lines = [
        `Bravo ${current} ! Maintenant, c'est au tour de ${next} !`,
        `Merci ${current} ! ${next}, à toi de jouer !`,
        `Super partie, ${current} ! Passe la main à ${next} !`,
      ];
      await app.voice.say([{ text: lines[Math.floor(app.rng() * lines.length)], lang: 'fr' }]);
      if (!this.alive) return;
      switchChild(app.profiles.nextId());
      goTo(this, 'Home', { switched: true });
      return;
    }
    this.again.setVisible(true).setScale(0);
    this.tweens.add({ targets: this.again, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.again.highlight(true);
    this.dino.pointAt(this.again.x, this.again.y);
    this.guide.tap(this.again);
    await this.say('end.again');
  }
}
