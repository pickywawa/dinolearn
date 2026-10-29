import Phaser from 'phaser';
import { app } from '../core/app';
import { Concept, GameDef, gameById } from '../content/content';
import { Series } from '../core/series';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

interface Card {
  concept: Concept;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  size: number;
}

type Phase = 'loading' | 'intro' | 'asking' | 'feedback' | 'done';

/**
 * Gabarit « audio_to_image » : la consigne est dite, l'enfant touche
 * la bonne image parmi 2 à 4 (jeux EN-1 et MO-1).
 */
export class GameScene extends BaseScene {
  private game_!: GameDef;
  private series!: Series;
  private dino!: Dino;
  private guide!: Guide;
  private ear!: Bubble;
  private cards: Card[] = [];
  private steps: Phaser.GameObjects.Image[] = [];
  private phase: Phase = 'loading';
  private tutorial = false;
  private earExplained = false;

  constructor() {
    super('Game');
  }

  create(data: { gameId: string }) {
    this.initBase();
    this.game_ = gameById(data.gameId);
    const tint = Phaser.Display.Color.IntegerToColor(this.game_.color);
    const light = Phaser.Display.Color.Interpolate.ColorWithColor(tint, new Phaser.Display.Color(255, 255, 255), 100, 75);
    drawScenery(this, Phaser.Display.Color.GetColor(light.r, light.g, light.b), 0xf4fbff);

    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.phase = 'loading';
    this.cards = [];
    this.earExplained = false;
    this.series = new Series(this.game_, app.progress, app.rng);
    this.tutorial = !app.progress.seenTutorial && this.series.items.length > 1;

    homeButton(this, () => this.leave());
    const er = u * 0.07;
    this.ear = new Bubble(this, W - er * 1.4, er * 1.4, er, 0xffffff, 'ui-ear', () => this.repeatPrompt(), 0.7);
    this.drawSteps();

    const portrait = isPortrait(this);
    this.dino = new Dino(this, portrait ? W * 0.2 : W * 0.12, H * 0.985, u * (portrait ? 0.3 : 0.38));
    this.guide = new Guide(this, u * 0.16);

    // Images de la série chargées à la demande (pas embarquées dans le code).
    let toLoad = 0;
    for (const c of new Set(this.series.items.flatMap((i) => i.choices))) {
      if (!this.textures.exists(c.id)) {
        this.load.svg(c.id, `img/${c.id}.svg`, { width: 256, height: 256 });
        toLoad++;
      }
    }
    const begin = () => this.run(() => this.intro());
    if (toLoad === 0) begin();
    else {
      this.load.once(Phaser.Loader.Events.COMPLETE, begin);
      this.load.start();
    }
  }

  // ---- Déroulé ----

  private async intro() {
    this.phase = 'intro';
    const allReview = this.series.items.every((i) => i.isReview);
    this.showCards();
    if (allReview) await this.say('review');
    await this.say(this.game_.introLine);
    if (this.tutorial) await this.playTutorial();
    this.ask();
  }

  /** Première partie : le dino montre comment faire sur la 1re question. */
  private async playTutorial() {
    await this.say('tutorial');
    await app.voice.say(this.game_.prompt(this.series.current.answer, this.series.level));
    const card = this.cardOf(this.series.current.answer.id)!;
    this.dino.pointAt(card.container.x, card.container.y);
    this.guide.tap(card.container);
    await this.wait(1600);
    this.guide.hide();
    this.celebrateCard(card);
    Sfx.play('correct');
    this.dino.react('happy');
    await app.voice.say(this.game_.reinforce(this.series.current.answer));
    if (!this.alive) return;
    app.progress.markTutorialSeen();
    this.series.skipCurrent();
    this.steps.forEach((step) => step.destroy());
    this.drawSteps();
    this.showCards();
    await this.say('tutorial_your_turn');
  }

  private ask() {
    this.phase = 'asking';
    void app.voice.say(this.game_.prompt(this.series.current.answer, this.series.level));
    this.armReminders();
  }

  private repeatPrompt() {
    if (this.phase !== 'asking') return;
    this.dino.react('think');
    void app.voice.say(this.game_.prompt(this.series.current.answer, this.series.level));
    this.armReminders();
  }

  /** Relances : le dino répète, montre l'oreille, puis fait le tour des images. */
  private armReminders() {
    this.armIdle([
      [BALANCE.idleReminderMs, () => {
        if (this.phase !== 'asking') return;
        this.run(async () => {
          this.dino.react('think');
          await this.say('idle');
          if (this.phase !== 'asking') return;
          await app.voice.say(this.game_.prompt(this.series.current.answer, this.series.level));
          if (!this.earExplained && this.phase === 'asking') {
            this.earExplained = true;
            this.ear.highlight(true);
            this.dino.pointAt(this.ear.x, this.ear.y);
            await this.say('ear');
            this.ear.highlight(false);
          }
        });
      }],
      [BALANCE.idlePointMs, () => {
        if (this.phase !== 'asking') return;
        const open = this.cards.filter((c) => !this.series.disabled.has(c.concept.id));
        this.guide.tour(open.map((c) => c.container), 900);
        this.time.delayedCall(900 * open.length + 600, () => this.phase === 'asking' && this.guide.hide());
      }],
    ]);
  }

  private onTap(card: Card) {
    if (this.phase !== 'asking') return;
    const outcome = this.series.tap(card.concept);
    if (outcome.kind === 'ignored') return;
    this.clearIdle();
    this.guide.hide();
    this.phase = 'feedback';

    if (outcome.kind === 'wrong') {
      Sfx.play('wrong');
      this.dimCard(card);
      this.dino.react('oops');
      this.run(async () => {
        if (outcome.hint) {
          // L'indice : la bonne carte brille et le dino la montre.
          const good = this.cardOf(this.series.current.answer.id)!;
          this.glowCard(good);
          this.dino.pointAt(good.container.x, good.container.y);
          this.guide.tap(good.container);
        }
        await this.say(outcome.hint ? 'hint' : 'wrong');
        await app.voice.say(this.game_.prompt(this.series.current.answer, this.series.level));
        this.phase = 'asking';
        this.armReminders();
      });
      return;
    }

    Sfx.play('correct');
    this.celebrateCard(card);
    this.steps[this.series.index]?.setTint(0x43b649).setAlpha(1);
    this.dino.react(outcome.streak === 3 ? 'cheer' : 'happy');
    this.run(async () => {
      if (outcome.streak === 3) await this.say('streak');
      else if (app.rng() < 0.35) await this.say('correct');
      await app.voice.say(this.game_.reinforce(this.series.current.answer));
      if (!this.alive) return;
      await this.wait(250);
      this.series.next();
      if (this.series.finished) {
        this.phase = 'done';
        goTo(this, 'End', { result: this.series.result });
      } else {
        this.showCards();
        this.ask();
      }
    });
  }

  private leave() {
    this.series.abandon();
    goTo(this, 'Home');
  }

  // ---- Affichage ----

  private drawSteps() {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.06;
    const n = this.series.items.length;
    const gap = size * 1.15;
    this.steps = [];
    for (let i = 0; i < n; i++) {
      const step = this.add.image(W / 2 + (i - (n - 1) / 2) * gap, u * 0.1, 'ui-paw-print').setAlpha(0.35);
      step.setScale(size / step.width).setTintFill(0xffffff);
      this.steps.push(step);
    }
  }

  private cardOf(id: string) {
    return this.cards.find((c) => c.concept.id === id);
  }

  private showCards() {
    this.cards.forEach((c) => c.container.destroy());
    this.cards = [];
    this.steps.forEach((s, i) => {
      if (i < this.series.index) s.clearTint().setTint(0x43b649).setAlpha(1);
    });
    const item = this.series.current;
    const { width: W, height: H } = this.scale;
    const n = item.choices.length;
    const portrait = isPortrait(this);
    const perRow = portrait ? (n <= 2 ? n : 2) : n;
    const rows = Math.ceil(n / perRow);
    const top = H * (portrait ? 0.17 : 0.2);
    const bottom = H * (portrait ? 0.72 : 0.82);
    const left = portrait ? W * 0.05 : W * 0.22;
    const right = W * 0.95;
    const gap = Math.min(W, H) * 0.04;
    const size = Math.min(
      (right - left - gap * (perRow - 1)) / perRow,
      (bottom - top - gap * (rows - 1)) / rows,
      Math.min(W, H) * 0.42,
    );
    const gridH = rows * size + (rows - 1) * gap;
    item.choices.forEach((concept, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, n - row * perRow);
      const rowW = inRow * size + (inRow - 1) * gap;
      const x = (left + right) / 2 - rowW / 2 + (i % perRow) * (size + gap) + size / 2;
      const y = (top + bottom) / 2 - gridH / 2 + row * (size + gap) + size / 2;
      this.cards.push(this.makeCard(concept, x, y, size, i));
    });
  }

  private makeCard(concept: Concept, x: number, y: number, size: number, index: number): Card {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const card: Card = { concept, container, bg, size };
    this.paintCard(card, 0xffffff, 0xffffff);
    const img = this.add.image(0, 0, concept.id);
    img.setScale((size * 0.74) / Math.max(img.width, img.height));
    container.add([bg, img]);
    container.setSize(size, size);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onTap(card));
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 420, delay: index * 90, ease: 'Back.easeOut' });
    return card;
  }

  private paintCard(card: Card, fill: number, border: number, borderWidth = card.size * 0.035) {
    const s = card.size;
    card.bg.clear();
    card.bg.fillStyle(0x000000, 0.15).fillRoundedRect(-s / 2, -s / 2 + s * 0.04, s, s, s * 0.16);
    card.bg.fillStyle(fill, 1).fillRoundedRect(-s / 2, -s / 2, s, s, s * 0.16);
    card.bg.lineStyle(borderWidth, border, 1).strokeRoundedRect(-s / 2, -s / 2, s, s, s * 0.16);
  }

  private celebrateCard(card: Card) {
    this.paintCard(card, 0xffffff, 0x43b649, card.size * 0.07);
    this.tweens.add({ targets: card.container, scale: 1.12, duration: 180, yoyo: true, ease: 'Quad.easeOut' });
    this.cards.filter((c) => c !== card).forEach((c) => c.container.setAlpha(0.45));
    const p = this.add.particles(card.container.x, card.container.y, 'ui-star', {
      speed: { min: 180, max: 420 }, scale: { start: 0.18, end: 0 }, lifespan: 700, emitting: false,
    });
    p.explode(14);
    this.time.delayedCall(900, () => p.destroy());
  }

  private dimCard(card: Card) {
    this.paintCard(card, 0xdddddd, 0xbbbbbb);
    this.tweens.add({
      targets: card.container, x: card.container.x + 12, duration: 50, yoyo: true, repeat: 3,
      onComplete: () => this.tweens.add({ targets: card.container, scale: 0.85, alpha: 0.35, duration: 200 }),
    });
  }

  private glowCard(card: Card) {
    this.paintCard(card, 0xfff6d5, 0xffc107, card.size * 0.07);
    this.tweens.add({ targets: card.container, scale: 1.07, duration: 400, yoyo: true, repeat: -1 });
  }
}
