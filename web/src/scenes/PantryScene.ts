import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Food, FOOD_ORDER, FOODS } from '../domain/models';
import { feed, growthProgress } from '../domain/progression';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Garde-manger : on glisse (ou touche) un aliment jusqu'à la bouche du dino.
 * La main guide mime le geste. La jauge sur le ventre montre la croissance.
 */
export class PantryScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private items: { food: Food; img: Phaser.GameObjects.Image; home: Phaser.Math.Vector2 }[] = [];
  private play!: Bubble;
  private busy = false;

  constructor() {
    super('Pantry');
  }

  create() {
    this.initBase();
    drawScenery(this, 0xffd9b0, 0xfff3e6);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    this.busy = false;
    this.items = [];

    homeButton(this, () => goTo(this, 'Home'));
    this.dino = new Dino(this, W / 2, H * (portrait ? 0.68 : 0.72), u * (portrait ? 0.62 : 0.6));
    this.dino.setBellyFill(growthProgress(app.progress.dino));
    this.guide = new Guide(this, u * 0.17);
    this.play = new Bubble(this, W - u * 0.14, u * 0.14, u * 0.1, 0x43b649, 'ui-play',
      () => goTo(this, 'Home'));

    // Nappe de pique-nique
    const clothY = H * (portrait ? 0.84 : 0.88);
    const clothW = Math.min(W * 0.9, u * 1.3) - (portrait ? 0 : u * 0.3);
    this.add.rectangle(W / 2 - (portrait ? 0 : u * 0.1), clothY, clothW, u * 0.2, 0xffffff)
      .setStrokeStyle(10, 0xe5484d).setDepth(-1);

    const foods = FOOD_ORDER.flatMap((f) => Array<Food>(Math.min(app.progress.pantry[f] ?? 0, 8)).fill(f)).slice(0, 10);
    const step = Math.min(u * 0.13, (clothW - u * 0.1) / Math.max(1, foods.length));
    foods.forEach((food, i) => {
      const x = W / 2 - (portrait ? 0 : u * 0.1) + (i - (foods.length - 1) / 2) * step;
      const img = this.add.image(x, clothY, FOODS[food].image).setInteractive({ draggable: true });
      img.setScale((u * 0.11) / img.width).setDepth(10);
      const item = { food, img, home: new Phaser.Math.Vector2(x, clothY) };
      this.items.push(item);
      img.on('dragstart', () => { this.guide.hide(); this.clearIdle(); img.setScale(img.scale * 1.2); });
      img.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => img.setPosition(x, y));
      img.on('dragend', () => this.drop(item));
      img.on('pointerup', (p: Phaser.Input.Pointer) => {
        // Un simple toucher envoie aussi l'aliment (pour les plus petits).
        if (p.getDistance() < 12) this.drop(item, true);
      });
    });

    this.run(() => this.intro());
  }

  private async intro() {
    await this.wait(300);
    if (this.items.length === 0) {
      this.dino.react('think');
      this.play.highlight(true);
      this.dino.pointAt(this.play.x, this.play.y);
      this.guide.tap(this.play);
      await this.say('pantry.empty');
      return;
    }
    this.showDragHint();
    await this.say('pantry.drag');
    this.armIdle([[9000, () => this.run(async () => { this.showDragHint(); await this.say('pantry.drag'); })]]);
  }

  private showDragHint() {
    const first = this.items[0];
    if (first) this.guide.drag(first.img, this.dino.mouthWorldPoint());
  }

  private drop(item: (typeof this.items)[number], tapped = false) {
    if (this.busy || !item.img.active) return;
    const mouth = this.dino.mouthWorldPoint();
    const near = Phaser.Math.Distance.Between(item.img.x, item.img.y, mouth.x, mouth.y) < unit(this) * 0.25;
    const baseScale = (unit(this) * 0.11) / item.img.width;
    if (!near && !tapped) {
      this.tweens.add({ targets: item.img, x: item.home.x, y: item.home.y, scale: baseScale, duration: 300, ease: 'Back.easeOut' });
      return;
    }
    const result = feed(app.progress.dino, item.food, app.progress.xpEatenToday());
    if (result.outcome === 'full' || result.outcome === 'maxLevel') {
      this.tweens.add({ targets: item.img, x: item.home.x, y: item.home.y, scale: baseScale, duration: 300 });
      this.dino.react('think');
      this.run(() => this.say('full'));
      return;
    }
    this.busy = true;
    this.guide.hide();
    this.tweens.add({
      targets: item.img, x: mouth.x, y: mouth.y, scale: baseScale * 0.4, duration: 350, ease: 'Quad.easeIn',
      onComplete: () => {
        item.img.destroy();
        this.items = this.items.filter((i) => i !== item);
        app.progress.saveFeeding(item.food, result.dino, result.xpEatenToday);
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
          if (this.items.length === 0) {
            this.play.highlight(true);
            this.dino.pointAt(this.play.x, this.play.y);
            this.guide.tap(this.play);
            await this.say('pantry.done');
          }
        });
      },
    });
  }
}
