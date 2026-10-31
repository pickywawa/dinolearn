import Phaser from 'phaser';
import { conceptById, frWithArticle } from '../content/content';
import { gameById } from '../content/games';
import { app } from '../core/app';
import { Series, sceneOf } from '../core/series';
import { Sfx } from '../core/sfx';
import { foodImage } from '../domain/models';
import { Dino } from '../dino/Dino';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { drawVegetation } from '../ui/vegetation';
import { BaseScene } from './BaseScene';

interface Card {
  image: string;
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Graphics;
  size: number;
  open: boolean;
  found: boolean;
}

/**
 * Memory : des cartes retournées, deux par deux. Le dino dit le nom de chaque
 * image retournée (en français, ou en anglais pour le memory anglais). Deux
 * images pareilles restent visibles ; sinon elles se retournent. Une série,
 * c'est 3 plateaux, de 6 cartes au début jusqu'à 20 au niveau CP. Le fruit du
 * plateau est gagné sans trop d'erreurs (pas plus que de paires).
 */
export class MemoryScene extends BaseScene {
  /** Série de la planète, partagée avec les autres scènes : une fois la question faite, on passe la main. */
  private shared = false;
  private series!: Series;
  private dino!: Dino;
  private cards: Card[] = [];
  private opened: Card[] = [];
  private misses = 0;
  private busy = false;
  private steps: Phaser.GameObjects.Image[] = [];
  private playMs = 0;

  constructor() {
    super('Memory');
  }

  update(_time: number, delta: number) {
    this.playMs += Math.min(delta, 1000);
    if (this.playMs >= 10_000) this.savePlayTime();
  }

  private savePlayTime() {
    if (this.playMs > 0) app.progress.addPlayTime(this.playMs);
    this.playMs = 0;
  }

  create(data: { gameId?: string; series?: Series }) {
    this.shared = !!data.series;
    this.initBase();
    this.playMs = 0;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.savePlayTime());
    const game = data.series ? data.series.current.game : gameById(data.gameId!);
    drawScenery(this, 0xede4ff, 0xfaf7ff, 0);
    drawVegetation(this, app.rng, isPortrait(this) ? [0.04, 0.36] : [0, 0.22]);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.series = data.series ?? new Series(game, app.progress, app.rng);
    this.cards = [];
    homeButton(this, () => {
      this.series.abandon();
      goTo(this, 'Home');
    });
    this.drawSteps();
    const portrait = isPortrait(this);
    this.dino = new Dino(this, portrait ? W * 0.17 : W * 0.1, H * 0.985, u * (portrait ? 0.26 : 0.34));
    const zone = this.add.zone(0, -Dino.HEIGHT / 2, 320, Dino.HEIGHT).setInteractive();
    this.dino.add(zone);
    zone.on('pointerup', () => {
      this.dino.react('happy');
      void app.voice.say(this.series.current.prompt);
    });

    // Images des plateaux, chargées à la demande.
    let toLoad = 0;
    for (const item of this.series.items) {
      if (item.show?.kind !== 'memory') continue;
      for (const key of item.show.images) {
        if (!this.textures.exists(key)) {
          this.load.svg(key, `img/${key}.svg`, { width: 256, height: 256 });
          toLoad++;
        }
      }
    }
    const begin = () => this.run(async () => {
      await this.wait(300);
      await this.say(this.shared ? game.shortLine : game.introLine);
      this.deal();
    });
    if (toLoad === 0) begin();
    else {
      this.load.once(Phaser.Loader.Events.COMPLETE, begin);
      this.load.start();
    }
  }

  // ---- Un plateau ----

  private deal() {
    const show = this.series.current.show;
    if (show?.kind !== 'memory') return;
    this.cards.forEach((c) => c.container.destroy());
    this.opened = [];
    this.misses = 0;
    this.busy = false;
    const { width: W, height: H } = this.scale;
    const portrait = isPortrait(this);
    const images = Phaser.Utils.Array.Shuffle([...show.images, ...show.images]);
    const n = images.length;
    // Grille : la plus carrée possible, adaptée à l'écran.
    let cols = portrait ? (n <= 6 ? 2 : n <= 12 ? 3 : 4) : (n <= 6 ? 3 : n <= 8 ? 4 : n <= 12 ? 4 : n <= 16 ? 6 : 7);
    if (!portrait && n === 20) cols = 7;
    const rows = Math.ceil(n / cols);
    const area = portrait
      ? { x: W * 0.05, y: H * 0.13, w: W * 0.9, h: H * 0.68 }
      : { x: W * 0.2, y: H * 0.15, w: W * 0.76, h: H * 0.8 };
    const gap = Math.min(W, H) * 0.025;
    // Grandes cartes pour les petits plateaux.
    const size = Math.min((area.w - gap * (cols - 1)) / cols, (area.h - gap * (rows - 1)) / rows, Math.min(W, H) * (n <= 8 ? 0.4 : 0.3));
    const gridW = cols * size + (cols - 1) * gap;
    const gridH = rows * size + (rows - 1) * gap;
    this.cards = images.map((image, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, n - row * cols);
      const rowW = inRow * size + (inRow - 1) * gap;
      const x = area.x + area.w / 2 - (inRow === cols ? gridW : rowW) / 2 + (i % cols) * (size + gap) + size / 2;
      const y = area.y + area.h / 2 - gridH / 2 + row * (size + gap) + size / 2;
      return this.makeCard(image, x, y, size, i);
    });
    this.run(async () => {
      await app.voice.say(this.series.current.prompt);
    });
    this.armIdle([[12000, () => this.remind()]]);
  }

  private makeCard(image: string, x: number, y: number, size: number, index: number): Card {
    const container = this.add.container(x, y);
    const r = size * 0.14;
    const shadow = this.add.graphics().fillStyle(0x000000, 0.15).fillRoundedRect(-size / 2, -size / 2 + size * 0.04, size, size, r);
    // Dos : violet, avec une étoile.
    const back = this.add.container(0, 0);
    back.add(this.add.graphics().fillStyle(0x8e4ec6, 1).fillRoundedRect(-size / 2, -size / 2, size, size, r)
      .lineStyle(size * 0.05, 0xffffff, 1).strokeRoundedRect(-size / 2 + size * 0.06, -size / 2 + size * 0.06, size * 0.88, size * 0.88, r * 0.7));
    const star = this.add.image(0, 0, 'ui-star');
    star.setScale((size * 0.45) / star.width).setAlpha(0.9);
    back.add(star);
    // Face : l'image.
    const face = this.add.container(0, 0).setVisible(false);
    const frame = this.add.graphics();
    const img = this.add.image(0, 0, image);
    img.setScale((size * 0.74) / Math.max(img.width, img.height));
    face.add([frame, img]);
    container.add([shadow, back, face]);
    container.setSize(size, size).setInteractive({ useHandCursor: true });
    const card: Card = { image, container, back, face, frame, size, open: false, found: false };
    this.paint(card, 0xffffff);
    container.on('pointerup', () => this.flip(card));
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 350, delay: index * 50, ease: 'Back.easeOut' });
    return card;
  }

  private paint(card: Card, border: number, width = card.size * 0.035) {
    const s = card.size;
    const r = s * 0.14;
    card.frame.clear().fillStyle(0xffffff, 1).fillRoundedRect(-s / 2, -s / 2, s, s, r)
      .lineStyle(width, border, 1).strokeRoundedRect(-s / 2, -s / 2, s, s, r);
  }

  /** Retourne une carte (demi-tour en largeur). */
  private turn(card: Card, open: boolean): Promise<void> {
    card.open = open;
    return new Promise((resolve) => {
      this.tweens.add({
        targets: card.container, scaleX: 0, duration: 120, ease: 'Sine.easeIn',
        onComplete: () => {
          card.back.setVisible(!open);
          card.face.setVisible(open);
          this.tweens.add({ targets: card.container, scaleX: 1, duration: 120, ease: 'Sine.easeOut', onComplete: () => resolve() });
        },
      });
    });
  }

  /** Le nom de l'image, dit par le dino (en anglais pour le memory anglais). */
  private sayName(image: string) {
    const show = this.series.current.show;
    const c = conceptById(image);
    if (show?.kind === 'memory' && show.lang === 'en') void app.voice.say([{ text: c.en.word, lang: 'en', slow: true }]);
    else void app.voice.say([{ text: frWithArticle(c), lang: 'fr' }]);
  }

  private flip(card: Card) {
    if (this.busy || card.open || card.found) return;
    this.clearIdle();
    Sfx.play('pop');
    this.opened.push(card);
    void this.turn(card, true);
    this.sayName(card.image);
    if (this.opened.length < 2) {
      this.armIdle([[12000, () => this.remind()]]);
      return;
    }
    const [a, b] = this.opened;
    this.opened = [];
    this.busy = true;
    this.run(async () => {
      await this.wait(450);
      if (a.image === b.image) {
        // Une paire !
        a.found = b.found = true;
        Sfx.play('correct');
        for (const c of [a, b]) {
          this.paint(c, 0x43b649, c.size * 0.07);
          this.tweens.add({ targets: c.container, scale: 1.12, duration: 160, yoyo: true });
        }
        this.dino.react('happy');
        this.busy = false;
        if (this.cards.every((c) => c.found)) await this.boardDone();
        else this.armIdle([[12000, () => this.remind()]]);
        return;
      }
      // Pas pareilles : on les regarde encore un peu, puis elles se retournent.
      this.misses++;
      await this.wait(650);
      await Promise.all([this.turn(a, false), this.turn(b, false)]);
      this.busy = false;
      // Beaucoup d'erreurs : un petit conseil.
      if (this.misses === this.cards.length / 2 + 2) {
        this.dino.react('think');
        await app.voice.say(this.series.current.hints);
      }
      this.armIdle([[12000, () => this.remind()]]);
    });
  }

  /** Relance : le dino rappelle la règle. */
  private remind() {
    if (this.busy) return;
    this.dino.react('think');
    void app.voice.say(this.series.current.prompt);
  }

  /** Toutes les paires trouvées : le fruit (sans trop d'erreurs), puis le plateau suivant ou la fin. */
  private async boardDone() {
    this.busy = true;
    const item = this.series.current;
    // Plus d'erreurs que de paires : le plateau est réussi, mais sans le fruit.
    if (this.misses > this.cards.length / 2) this.series.tap({ id: 'miss-0' });
    const outcome = this.series.tap(item.answer);
    if (outcome.kind !== 'correct') return;
    this.updateSteps(outcome.firstTry);
    this.dino.react(outcome.firstTry ? 'cheer' : 'happy');
    Sfx.play('star');
    await this.wait(300);
    await app.voice.say(item.reinforce);
    if (!this.alive) return;
    await this.wait(400);
    this.series.next();
    if (this.series.finished) {
      goTo(this, 'End', { result: this.series.result, mixed: this.shared });
      return;
    }
    if (sceneOf(this.series.current.game) !== 'Memory') {
      // Série de la planète : la question suivante se joue ailleurs.
      goTo(this, sceneOf(this.series.current.game), { series: this.series });
      return;
    }
    this.tweens.add({ targets: this.cards.map((c) => c.container), scale: 0, duration: 250 });
    await this.wait(300);
    this.deal();
  }

  // ---- Barre de progression ----

  private drawSteps() {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.056;
    const n = this.series.items.length;
    this.steps = this.series.items.map((item, i) => {
      const step = this.add.image(W / 2 + (i - (n - 1) / 2) * size * 1.12, u * 0.1, foodImage(item.fruit));
      step.setScale(size / step.width);
      // Série partagée : les fruits déjà gagnés (ou perdus) gardent leur état.
      if (item.firstTry === undefined) step.setTintFill(0x8fa6c4).setAlpha(0.75);
      else if (!item.firstTry) step.setTintFill(0xc9d1dc).setAlpha(0.4);
      return step;
    });
  }

  private updateSteps(won: boolean) {
    const step = this.steps[this.series.index];
    if (!step) return;
    if (won) {
      step.clearTint().setAlpha(1);
      this.tweens.add({ targets: step, scale: step.scale * 1.7, duration: 220, yoyo: true, ease: 'Back.easeOut' });
    } else {
      step.setTintFill(0xc9d1dc).setAlpha(0.4);
    }
  }
}
