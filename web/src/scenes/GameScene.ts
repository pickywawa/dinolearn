import Phaser from 'phaser';
import { app } from '../core/app';
import { Choice, GAMES, Show, gameById } from '../content/games';
import { Series } from '../core/series';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { foodImage } from '../domain/models';
import { Dino } from '../dino/Dino';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

interface Card {
  choice: Choice;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  size: number;
}

type Phase = 'loading' | 'intro' | 'asking' | 'feedback' | 'done';

/**
 * Gabarit commun à tous les jeux : la consigne est dite, l'enfant touche la
 * bonne réponse parmi 2 à 4 cartes (images, nombres, tas de fruits).
 * En mode « tout mélangé », chaque question vient d'un jeu différent.
 * Toucher le dino fait répéter la consigne ; des indices aident quand c'est difficile.
 */
export class GameScene extends BaseScene {
  private series!: Series;
  private dino!: Dino;
  private guide!: Guide;
  private cards: Card[] = [];
  private steps: Phaser.GameObjects.Image[] = [];
  private phase: Phase = 'loading';
  private tutorial = false;
  private replayExplained = false;
  private shown: Phaser.GameObjects.GameObject[] = [];
  /** Objets comptés (ils sautent pendant que le dino compte). */
  private counted: Phaser.GameObjects.Image[] = [];
  private mixed = false;
  private hintsGiven = 0;

  constructor() {
    super('Game');
  }

  create(data: { gameId?: string; mixed?: boolean }) {
    this.initBase();
    this.mixed = !!data.mixed || !data.gameId;
    const games = this.mixed ? GAMES : [gameById(data.gameId!)];
    const tint = Phaser.Display.Color.IntegerToColor(this.mixed ? 0x9fd8ff : games[0].color);
    const light = Phaser.Display.Color.Interpolate.ColorWithColor(tint, new Phaser.Display.Color(255, 255, 255), 100, 75);
    drawScenery(this, Phaser.Display.Color.GetColor(light.r, light.g, light.b), 0xf4fbff, 0);

    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.phase = 'loading';
    this.cards = [];
    this.replayExplained = false;
    this.shown = [];
    this.series = new Series(this.mixed ? games : games[0], app.progress, app.rng);
    this.tutorial = !app.progress.seenTutorial && this.series.items.length > 1;

    homeButton(this, () => this.leave());
    this.drawSteps();

    const portrait = isPortrait(this);
    this.dino = new Dino(this, portrait ? W * 0.2 : W * 0.12, H * 0.985, u * (portrait ? 0.3 : 0.38));
    // Toucher le dino : il répète la consigne.
    const zone = this.add.zone(0, -Dino.HEIGHT / 2, 320, Dino.HEIGHT).setInteractive();
    this.dino.add(zone);
    zone.on('pointerup', () => this.repeatPrompt());
    this.guide = new Guide(this, u * 0.16);

    // Images de la série chargées à la demande (pas embarquées dans le code).
    let toLoad = 0;
    const keys = new Set(this.series.items.flatMap((i) => [
      ...i.choices.flatMap((c) => [c.image, c.repeat?.image]), ...showImages(i.show),
    ]));
    for (const key of keys) {
      if (key && !this.textures.exists(key)) {
        this.load.svg(key, `img/${key}.svg`, { width: 256, height: 256 });
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
    await this.say(this.mixed ? 'intro.MIX' : this.series.current.game.introLine);
    if (this.tutorial) await this.playTutorial();
    this.ask();
  }

  /** Première partie : le dino montre comment faire sur la 1re question. */
  private async playTutorial() {
    await this.say('tutorial');
    await app.voice.say(this.series.current.prompt);
    const card = this.cardOf(this.series.current.answer.id)!;
    this.dino.pointAt(card.container.x, card.container.y);
    this.guide.tap(card.container);
    await this.wait(1600);
    this.guide.hide();
    this.celebrateCard(card);
    Sfx.play('correct');
    this.dino.react('happy');
    await this.reinforce();
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
    this.hintsGiven = 0;
    const item = this.series.current;
    this.run(async () => {
      // Mode mélangé : le dino annonce le jeu quand il change.
      if (this.mixed && this.series.gameChanged) await this.say(item.game.shortLine);
      await app.voice.say(item.prompt);
      // Si ce jeu est difficile en ce moment, un indice tout de suite.
      if (this.struggling() && this.phase === 'asking') await this.giveHint();
    });
    this.armReminders();
  }

  /** Vrai si l'enfant rate souvent ce jeu ces derniers temps. */
  private struggling(): boolean {
    const recent = app.progress.answers({ gameId: this.series.current.game.id }).slice(0, 8);
    return recent.length >= 4 && recent.filter((a) => a.firstTrySuccess).length / recent.length < 0.5;
  }

  /** Dit l'indice suivant de la question, s'il en reste un. */
  private async giveHint(): Promise<boolean> {
    const hint = this.series.current.hints[this.hintsGiven];
    if (!hint) return false;
    this.hintsGiven++;
    this.dino.react('think');
    await app.voice.say([hint]);
    return true;
  }

  private repeatPrompt() {
    if (this.phase !== 'asking') return;
    this.guide.hide();
    this.dino.react('think');
    void app.voice.say(this.series.current.prompt);
    this.armReminders();
  }

  /** Renforcement après la bonne réponse ; pour « Combien ? », les bons fruits sautent un par un. */
  private async reinforce() {
    const item = this.series.current;
    this.counted.forEach((obj, i) => this.tweens.add({
      targets: obj, y: '-=18', duration: 160, yoyo: true, delay: 300 + i * 520,
    }));
    await app.voice.say(item.reinforce);
  }

  /** Relances : le dino répète (et rappelle qu'on peut le toucher), puis la main fait le tour des cartes. */
  private armReminders() {
    this.armIdle([
      [BALANCE.idleReminderMs, () => {
        if (this.phase !== 'asking') return;
        this.run(async () => {
          this.dino.react('think');
          await this.say('idle');
          if (this.phase !== 'asking') return;
          await app.voice.say(this.series.current.prompt);
          // L'enfant hésite : un indice.
          if (this.phase === 'asking') await this.giveHint();
          if (!this.replayExplained && this.phase === 'asking') {
            this.replayExplained = true;
            this.dino.react('happy');
            this.guide.tap({ x: this.dino.x, y: this.dino.y - this.dino.scale * Dino.HEIGHT * 0.6 });
            await this.say('touch_me');
            this.guide.hide();
          }
        });
      }],
      [BALANCE.idlePointMs, () => {
        if (this.phase !== 'asking') return;
        const open = this.cards.filter((c) => !this.series.disabled.has(c.choice.id));
        this.guide.tour(open.map((c) => c.container), 900);
        this.time.delayedCall(900 * open.length + 600, () => this.phase === 'asking' && this.guide.hide());
      }],
    ]);
  }

  private onTap(card: Card) {
    if (this.phase !== 'asking') return;
    const outcome = this.series.tap(card.choice);
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
          // Dernier recours : la bonne carte brille et le dino la montre.
          const good = this.cardOf(this.series.current.answer.id)!;
          this.glowCard(good);
          this.dino.pointAt(good.container.x, good.container.y);
          this.guide.tap(good.container);
          await this.giveHint();
          await this.say('hint');
        } else {
          // Après une erreur : un indice parlé plutôt que la réponse.
          await this.say('wrong');
          await this.giveHint();
        }
        await app.voice.say(this.series.current.prompt);
        this.phase = 'asking';
        this.armReminders();
      });
      return;
    }

    Sfx.play('correct');
    this.celebrateCard(card);
    this.updateSteps(true);
    this.dino.react(outcome.streak === 3 ? 'cheer' : 'happy');
    this.run(async () => {
      if (outcome.streak === 3) await this.say('streak');
      else if (app.rng() < 0.35) await this.say('correct');
      await this.reinforce();
      if (!this.alive) return;
      await this.wait(250);
      this.series.next();
      if (this.series.finished) {
        this.phase = 'done';
        goTo(this, 'End', { result: this.series.result, mixed: this.mixed });
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

  /** Barre de progression : un fruit différent par question, gagné au premier essai. */
  private drawSteps() {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.056;
    const n = this.series.items.length;
    const gap = size * 1.12;
    this.steps = this.series.items.map((item, i) => {
      const step = this.add.image(W / 2 + (i - (n - 1) / 2) * gap, u * 0.1, foodImage(item.fruit));
      return step.setScale(size / step.width);
    });
    this.updateSteps(false);
  }

  /** Fruits gagnés en couleur, à gagner en silhouette blanche, perdus en silhouette pâle. */
  private updateSteps(celebrate: boolean) {
    this.series.items.forEach((item, i) => {
      const step = this.steps[i];
      if (!step) return;
      if (item.firstTry === undefined) step.setTintFill(0x8fa6c4).setAlpha(0.75);
      else if (item.firstTry) step.clearTint().setAlpha(1);
      else step.setTintFill(0xc9d1dc).setAlpha(0.4);
    });
    const won = this.steps[this.series.index];
    if (!celebrate || !won || !this.series.current.firstTry) return;
    Sfx.play('star');
    this.tweens.add({ targets: won, scale: won.scale * 1.7, duration: 220, yoyo: true, ease: 'Back.easeOut' });
    const p = this.add.particles(won.x, won.y, 'ui-sparkles', {
      speed: { min: 60, max: 160 }, scale: { start: 0.12, end: 0 }, lifespan: 500, emitting: false,
    });
    p.explode(8);
    this.time.delayedCall(700, () => p.destroy());
  }

  private cardOf(id: string) {
    return this.cards.find((c) => c.choice.id === id);
  }

  private showCards() {
    this.cards.forEach((c) => c.container.destroy());
    this.cards = [];
    this.shown.forEach((o) => o.destroy());
    this.shown = [];
    this.counted = [];
    const item = this.series.current;
    const { width: W, height: H } = this.scale;
    const portrait = isPortrait(this);
    let top = H * (portrait ? 0.17 : 0.2);
    let left = portrait ? W * 0.05 : W * 0.22;
    if (item.show) {
      // Zone des objets à compter : en haut (portrait) ou à gauche (paysage).
      const area = portrait
        ? { x: W * 0.05, y: H * 0.14, w: W * 0.9, h: H * 0.28 }
        : { x: W * 0.2, y: H * 0.17, w: W * 0.36, h: H * 0.68 };
      this.drawShow(item.show, area);
      if (portrait) top = H * 0.44;
      else left = W * 0.6;
    }
    const n = item.choices.length;
    const perRow = portrait || item.show ? 2 : n;
    const rows = Math.ceil(n / perRow);
    const bottom = H * (portrait ? 0.76 : 0.84);
    const right = W * 0.95;
    const gap = Math.min(W, H) * 0.04;
    const size = Math.min(
      (right - left - gap * (perRow - 1)) / perRow,
      (bottom - top - gap * (rows - 1)) / rows,
      Math.min(W, H) * 0.42,
    );
    const gridH = rows * size + (rows - 1) * gap;
    item.choices.forEach((choice, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, n - row * perRow);
      const rowW = inRow * size + (inRow - 1) * gap;
      const x = (left + right) / 2 - rowW / 2 + (i % perRow) * (size + gap) + size / 2;
      const y = (top + bottom) / 2 - gridH / 2 + row * (size + gap) + size / 2;
      this.cards.push(this.makeCard(choice, x, y, size, i));
    });
  }

  /** Ce qui est montré au-dessus des réponses, dans un cadre. */
  private drawShow(show: Show, area: { x: number; y: number; w: number; h: number }) {
    const frame = this.add.graphics();
    frame.fillStyle(0xffffff, 0.85).fillRoundedRect(area.x, area.y, area.w, area.h, 28);
    frame.lineStyle(6, this.series.current.game.color, 1).strokeRoundedRect(area.x, area.y, area.w, area.h, 28);
    this.shown.push(frame);
    this.counted = [];
    const pop = (img: Phaser.GameObjects.Image, size: number, i: number) => {
      const scale = size / Math.max(img.width, img.height);
      img.setScale(0);
      this.tweens.add({ targets: img, scale, duration: 300, delay: i * 70, ease: 'Back.easeOut' });
      this.shown.push(img);
    };

    if (show.kind === 'silhouette') {
      // L'ombre : l'image en noir, qui flotte doucement.
      const img = this.add.image(area.x + area.w / 2, area.y + area.h / 2, show.image).setTintFill(0x1e2235);
      pop(img, Math.min(area.w, area.h) * 0.8, 0);
      this.tweens.add({ targets: img, y: '-=8', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return;
    }

    if (show.kind === 'sequence') {
      // La suite sur une ou deux lignes, avec un « ? » qui clignote à la fin.
      const n = show.images.length;
      const perRow = n > 7 ? Math.ceil(n / 2) : n;
      const rows = Math.ceil(n / perRow);
      const cell = Math.min(area.w / perRow, area.h / rows);
      show.images.forEach((key, i) => {
        const r = Math.floor(i / perRow);
        const inRow = Math.min(perRow, n - r * perRow);
        const x = area.x + area.w / 2 + ((i % perRow) - (inRow - 1) / 2) * cell;
        const y = area.y + area.h / 2 + (r - (rows - 1) / 2) * cell;
        if (key) {
          pop(this.add.image(x, y, key), cell * 0.78, i);
        } else {
          const mark = this.add.text(x, y, '?', {
            fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(cell * 0.7)}px`,
            color: '#d9467a', fontStyle: 'bold',
          }).setOrigin(0.5);
          this.tweens.add({ targets: mark, scale: 1.2, duration: 500, yoyo: true, repeat: -1 });
          this.shown.push(mark);
        }
      });
      return;
    }

    // Objets à compter : on mélange les groupes (aux niveaux difficiles, il y a des intrus).
    const items = Phaser.Utils.Array.Shuffle(show.groups.flatMap((g, gi) =>
      Array.from({ length: g.count }, () => ({ image: g.image, counted: gi === 0 }))));
    const total = items.length;
    const cols = total <= 3 ? total : total <= 8 ? Math.ceil(total / 2) : Math.ceil(total / 3);
    const rows = Math.ceil(total / cols);
    const cell = Math.min(area.w / cols, area.h / rows) * 0.9;
    items.forEach((item, i) => {
      const r = Math.floor(i / cols);
      const inRow = Math.min(cols, total - r * cols);
      const x = area.x + area.w / 2 + ((i % cols) - (inRow - 1) / 2) * (area.w / cols);
      const y = area.y + area.h / 2 + (r - (rows - 1) / 2) * (area.h / rows);
      const img = this.add.image(x, y, item.image);
      pop(img, cell * 0.8, i);
      if (item.counted) this.counted.push(img);
    });
  }

  private makeCard(choice: Choice, x: number, y: number, size: number, index: number): Card {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const card: Card = { choice, container, bg, size };
    this.paintCard(card, 0xffffff, 0xffffff);
    container.add(bg);
    if (choice.image) {
      const img = this.add.image(0, 0, choice.image);
      img.setScale((size * 0.74) / Math.max(img.width, img.height));
      container.add(img);
    } else if (choice.count !== undefined) {
      container.add(this.numberFace(choice.count, size));
    } else if (choice.repeat) {
      container.add(this.pileFace(choice.repeat.image, choice.repeat.count, size));
    }
    container.setSize(size, size);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onTap(card));
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 420, delay: index * 90, ease: 'Back.easeOut' });
    return card;
  }

  /** Carte nombre : le chiffre en grand et autant de points (on peut compter sans lire). */
  private numberFace(n: number, size: number): Phaser.GameObjects.GameObject[] {
    const digit = this.add.text(0, -size * 0.12, String(n), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(size * 0.42)}px`,
      color: '#2d3354', fontStyle: 'bold',
    }).setOrigin(0.5);
    const dots = this.add.graphics();
    const perRow = 5;
    const r = size * 0.035;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, n - row * perRow);
      const x = ((i % perRow) - (inRow - 1) / 2) * r * 3;
      const y = size * 0.24 + row * r * 3;
      dots.fillStyle(0xe5484d, 1).fillCircle(x, y, r);
    }
    return [digit, dots];
  }

  /** Carte « tas » : la même image répétée `count` fois, en petit. */
  private pileFace(image: string, count: number, size: number): Phaser.GameObjects.GameObject[] {
    const cols = count <= 4 ? 2 : count <= 9 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const cell = (size * 0.8) / Math.max(cols, rows);
    return Array.from({ length: count }, (_, i) => {
      const r = Math.floor(i / cols);
      const inRow = Math.min(cols, count - r * cols);
      const img = this.add.image(((i % cols) - (inRow - 1) / 2) * cell, (r - (rows - 1) / 2) * cell, image);
      return img.setScale((cell * 0.85) / Math.max(img.width, img.height));
    });
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

/** Images à charger pour ce qui est montré au-dessus des réponses. */
function showImages(show?: Show): (string | undefined)[] {
  if (!show) return [];
  if (show.kind === 'count') return show.groups.map((g) => g.image);
  if (show.kind === 'silhouette') return [show.image];
  return show.images.map((i) => i ?? undefined);
}
