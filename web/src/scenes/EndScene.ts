import Phaser from 'phaser';
import { app } from '../core/app';
import { Leftover } from '../core/progress';
import { SeriesResult } from '../core/series';
import { Sfx } from '../core/sfx';
import { foodImage } from '../domain/models';
import { feed, growthProgress } from '../domain/progression';
import { foodXp } from '../domain/rewards';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

const MAX_SHOWN = 10;

interface FoodItem {
  leftover: Leftover;
  img: Phaser.GameObjects.Image;
  home: Phaser.Math.Vector2;
}

/**
 * Fin de série : étoiles, puis l'enfant donne au dino les fruits gagnés en
 * les glissant jusqu'à sa bouche (ou en les touchant). Le dino les mange et
 * sa jauge de croissance se remplit. Ensuite, bouton vert pour rejouer.
 */
export class EndScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private items: FoodItem[] = [];
  private again!: Bubble;
  private busy = false;
  private full = false;

  constructor() {
    super('End');
  }

  create(data: { result: SeriesResult }) {
    this.initBase();
    drawScenery(this, 0xffe9a8, 0xfff8e6);
    const r = data.result;
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    this.items = [];
    this.busy = false;
    this.full = false;

    homeButton(this, () => goTo(this, 'Home'));
    this.dino = new Dino(this, W / 2, H * (portrait ? 0.7 : 0.74), u * (portrait ? 0.62 : 0.5));
    this.dino.setBellyFill(growthProgress(app.progress.dino));
    this.guide = new Guide(this, u * 0.16);
    this.again = new Bubble(this, W - u * 0.15, u * 0.15, u * 0.11, 0x43b649, 'ui-play',
      () => goTo(this, 'Game', { gameId: r.gameId }));
    this.again.setVisible(false);

    const stars = [0, 1, 2].map((i) => {
      const star = this.add.image(W / 2 + (i - 1) * u * 0.18, H * 0.1, 'ui-star').setAlpha(0.25);
      star.setScale((u * 0.14) / star.width).setTintFill(0xffffff);
      return star;
    });

    // Les fruits gagnés, plus ceux gardés d'une partie précédente (ventre plein).
    const earned: Leftover[] = r.earned.map((food) => ({ food, xp: foodXp(food, r.level) }));
    const all = [...earned, ...app.progress.leftovers];
    this.layoutFood(all.slice(0, MAX_SHOWN), H * (portrait ? 0.86 : 0.9));
    app.progress.leftovers = all;

    this.run(async () => {
      for (let i = 0; i < r.stars; i++) {
        await this.wait(380);
        Sfx.play('star');
        stars[i].clearTint().setAlpha(1);
        this.tweens.add({ targets: stars[i], scale: { from: stars[i].scale * 1.6, to: stars[i].scale }, duration: 400, ease: 'Back.easeOut' });
      }
      const group = r.stars === 3 ? (r.firstTrySuccesses === r.total ? 'series_perfect' : 'series_great')
        : r.stars === 2 ? 'series_good' : r.stars === 1 ? 'series_ok' : 'series_encourage';
      this.dino.react(r.stars >= 3 ? 'dance' : r.stars === 2 ? 'cheer' : r.stars === 1 ? 'happy' : 'think');
      await this.say(group);
      if (this.items.length === 0) {
        await this.say('end.nothing');
        await this.showAgain();
        return;
      }
      this.showDragHint();
      await this.say('end.feed');
      this.armFeedReminder();
    });
  }

  private layoutFood(foods: Leftover[], y: number) {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.12;
    const step = Math.min(size * 1.25, (W * 0.92) / Math.max(1, foods.length));
    this.add.rectangle(W / 2, y, Math.min(W * 0.94, step * foods.length + size * 0.6), size * 1.5, 0xffffff, 0.85)
      .setStrokeStyle(8, 0xe5484d).setDepth(-1);
    foods.forEach((leftover, i) => {
      const x = W / 2 + (i - (foods.length - 1) / 2) * step;
      const img = this.add.image(x, y + u * 0.3, foodImage(leftover.food)).setDepth(10);
      img.setScale(size / img.width).setInteractive({ draggable: true });
      // Les fruits arrivent en rebondissant.
      this.tweens.add({ targets: img, y, duration: 500, delay: 200 + i * 90, ease: 'Bounce.easeOut' });
      const item: FoodItem = { leftover, img, home: new Phaser.Math.Vector2(x, y) };
      this.items.push(item);
      img.on('dragstart', () => {
        this.guide.hide();
        this.clearIdle();
        img.setScale((size * 1.25) / img.width);
      });
      img.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => img.setPosition(dx, dy));
      img.on('dragend', () => this.drop(item, false));
      img.on('pointerup', (p: Phaser.Input.Pointer) => {
        if (p.getDistance() < 12) this.drop(item, true);
      });
    });
  }

  private showDragHint() {
    const first = this.items[0];
    if (first) this.guide.drag(first.home, this.dino.mouthWorldPoint());
  }

  private armFeedReminder() {
    this.armIdle([[9000, () => this.run(async () => {
      if (this.busy || this.items.length === 0 || this.full) return;
      this.showDragHint();
      await this.say('end.feed_again');
      this.armFeedReminder();
    })]]);
  }

  private drop(item: FoodItem, tapped: boolean) {
    if (this.busy || this.full || !item.img.active) return;
    const u = unit(this);
    const baseScale = (u * 0.12) / item.img.width;
    const mouth = this.dino.mouthWorldPoint();
    const near = Phaser.Math.Distance.Between(item.img.x, item.img.y, mouth.x, mouth.y) < u * 0.25;
    if (!near && !tapped) {
      this.tweens.add({ targets: item.img, x: item.home.x, y: item.home.y, scale: baseScale, duration: 300, ease: 'Back.easeOut' });
      return;
    }
    const result = feed(app.progress.dino, item.leftover.xp, app.progress.xpEatenToday());
    if (result.outcome === 'full' || result.outcome === 'maxLevel') {
      this.full = true;
      this.tweens.add({ targets: item.img, x: item.home.x, y: item.home.y, scale: baseScale, duration: 300 });
      this.dino.react('think');
      this.run(async () => {
        await this.say('full');
        await this.showAgain();
      });
      return;
    }
    this.busy = true;
    this.clearIdle();
    this.guide.hide();
    this.tweens.add({
      targets: item.img, x: mouth.x, y: mouth.y, scale: baseScale * 0.35, duration: 320, ease: 'Quad.easeIn',
      onComplete: () => {
        item.img.destroy();
        this.items = this.items.filter((i) => i !== item);
        app.progress.leftovers = app.progress.leftovers.filter((l) => l !== item.leftover);
        app.progress.saveFeeding(result.dino, result.xpEatenToday);
        Sfx.play('chomp');
        this.dino.react('eat');
        this.dino.setBellyFill(growthProgress(result.dino));
        this.run(async () => {
          await this.say('eating');
          if (result.outcome === 'levelUp') {
            Sfx.play('levelUp');
            this.dino.react('levelUp');
            await this.say('level_up');
          }
          this.busy = false;
          if (this.items.length === 0) await this.showAgain();
          else this.armFeedReminder();
        });
      },
    });
  }

  /** Le dino montre le bouton vert pour rejouer. */
  private async showAgain() {
    this.clearIdle();
    this.again.setVisible(true).setScale(0);
    this.tweens.add({ targets: this.again, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.again.highlight(true);
    this.dino.pointAt(this.again.x, this.again.y);
    this.guide.tap(this.again);
    await this.say('end.again');
  }
}
