import Phaser from 'phaser';
import { ITEMS, Item, itemTexture, sameSlot } from '../content/items';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Dino } from '../dino/Dino';
import { Guide } from '../ui/Guide';
import { chooseGifts } from '../ui/gifts';
import { drawScenery, goTo, homeButton, isPortrait, makeTickable, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

interface Slot {
  item: Item;
  cell: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Arc;
  home: { x: number; y: number };
}

/**
 * Le dressing : le dino en gros plan et tous les objets en dessous. On fait
 * glisser un objet gagné jusqu'au dino pour le lui mettre (il remplace celui
 * du même emplacement) ; toucher un objet porté le lui enlève. Les objets pas
 * encore gagnés sont en ombre.
 */
export class WardrobeScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private slots: Slot[] = [];
  private dinoHeight = 0;

  constructor() {
    super('Wardrobe');
  }

  create() {
    this.initBase();
    drawScenery(this, 0xffe9f3, 0xfff8e7, 2);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    homeButton(this, () => goTo(this, 'Home'));

    this.dinoHeight = portrait ? H * 0.42 : H * 0.78;
    this.dino = new Dino(this, portrait ? W / 2 : W * 0.27, portrait ? H * 0.6 : H * 0.94, this.dinoHeight);
    makeTickable(this.dino);
    this.guide = new Guide(this, u * 0.15);

    // L'étagère des objets.
    const area = portrait
      ? { x: W * 0.04, y: H * 0.645, w: W * 0.92, h: H * 0.34 }
      : { x: W * 0.52, y: H * 0.06, w: W * 0.45, h: H * 0.9 };
    const shelf = this.add.graphics();
    shelf.fillStyle(0xffffff, 0.75).fillRoundedRect(area.x, area.y, area.w, area.h, 24);
    const cols = 6;
    const rows = Math.ceil(ITEMS.length / cols);
    const cell = Math.min(area.w / cols, area.h / rows);
    this.slots = ITEMS.map((item, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, ITEMS.length - row * cols);
      const x = area.x + area.w / 2 + ((i % cols) - (inRow - 1) / 2) * cell;
      const y = area.y + area.h / 2 + (row - (rows - 1) / 2) * cell;
      return this.makeCell(item, x, y, cell * 0.44);
    });
    this.refresh();
    this.setupDrag();

    this.run(async () => {
      await this.wait(300);
      if (app.progress.collection.pending > 0) await chooseGifts(this, this.dino);
      this.refresh();
      const owned = this.slots.filter((s) => app.progress.collection.owned.includes(s.item.id));
      if (owned.length === 0) {
        await this.say('wardrobe.empty');
        return;
      }
      this.dino.react('happy');
      const first = owned.find((s) => !app.progress.collection.worn.includes(s.item.id)) ?? owned[0];
      this.guide.drag(first.cell, { x: this.dino.x, y: this.dino.y - this.dinoHeight * 0.6 });
      await this.say('wardrobe.intro');
      this.guide.hide();
    });
  }

  private makeCell(item: Item, x: number, y: number, r: number): Slot {
    const cell = this.add.container(x, y);
    const ring = this.add.circle(0, 0, r, 0xffffff).setStrokeStyle(r * 0.1, 0xd1d5db);
    const img = this.add.image(0, 0, itemTexture(item.id));
    img.setScale((r * 1.45) / img.width);
    cell.add([ring, img]);
    cell.setSize(r * 2, r * 2);
    return { item, cell, ring, home: { x, y } };
  }

  /** Objets gagnés en couleur (cerclés de vert s'ils sont portés), les autres en ombre. */
  private refresh() {
    const { owned, worn } = app.progress.collection;
    for (const { item, cell, ring } of this.slots) {
      const img = cell.list[1] as Phaser.GameObjects.Image;
      const has = owned.includes(item.id);
      const on = worn.includes(item.id);
      ring.setFillStyle(has ? 0xffffff : 0xe5e7eb).setStrokeStyle(ring.radius * (on ? 0.16 : 0.1), on ? 0x43b649 : 0xd1d5db);
      if (has) img.clearTint().setAlpha(1);
      else img.setTintFill(0x9ca3af).setAlpha(0.45);
      if (has) cell.setInteractive({ useHandCursor: true, draggable: true });
      else cell.disableInteractive();
    }
    this.dino.dress(worn);
  }

  private setupDrag() {
    let moved = false;
    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      moved = false;
      this.guide.hide();
      this.children.bringToTop(obj);
      obj.setScale(1.15);
    });
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => {
      const slot = this.slotOf(obj);
      if (slot && Phaser.Math.Distance.Between(x, y, slot.home.x, slot.home.y) > 12) moved = true;
      obj.setPosition(x, y);
    });
    this.input.on('dragend', (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      const slot = this.slotOf(obj);
      if (!slot) return;
      this.tweens.add({ targets: obj, x: slot.home.x, y: slot.home.y, scale: 1, duration: 250, ease: 'Back.easeOut' });
      if (!moved) {
        this.tapped(slot);
      } else if (this.onDino(p.x, p.y)) {
        this.putOn(slot.item);
      }
    });
  }

  private slotOf(obj: Phaser.GameObjects.GameObject) {
    return this.slots.find((s) => s.cell === obj);
  }

  /** Le doigt est-il lâché sur le dino ? */
  private onDino(x: number, y: number) {
    const h = this.dinoHeight;
    return Math.abs(x - this.dino.x) < h * 0.5 && y < this.dino.y && y > this.dino.y - h * 1.1;
  }

  private putOn(item: Item) {
    const replaced = sameSlot(item.id).filter((id) => app.progress.collection.worn.includes(id));
    app.progress.wear(item.id, sameSlot(item.id));
    this.refresh();
    Sfx.play('star');
    this.dino.react(replaced.length ? 'dance' : 'happy');
    const reactions = ['Trop beau !', 'J\'adore !', 'Je suis magnifique !', 'Qu\'est-ce que je suis chic !'];
    void app.voice.say([{ text: `${item.name.charAt(0).toUpperCase()}${item.name.slice(1)} ! ${
      reactions[Math.floor(app.rng() * reactions.length)]}`, lang: 'fr' }]);
  }

  /** Toucher : un objet porté s'enlève ; sinon le dino montre qu'il faut le faire glisser. */
  private tapped(slot: Slot) {
    if (app.progress.collection.worn.includes(slot.item.id)) {
      app.progress.takeOff(slot.item.id);
      this.refresh();
      Sfx.play('pop');
      this.dino.react('oops');
      this.run(() => this.say('wardrobe.off'));
      return;
    }
    this.guide.drag(slot.cell, { x: this.dino.x, y: this.dino.y - this.dinoHeight * 0.6 });
    this.run(async () => {
      await this.say('wardrobe.drag');
      this.guide.hide();
    });
  }
}
