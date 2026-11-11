import Phaser from 'phaser';
import { gameById } from '../content/games';
import { app } from '../core/app';
import { vibrate } from '../core/haptics';
import { Series, sceneOf } from '../core/series';
import { Sfx } from '../core/sfx';
import { Music } from '../core/music';
import { Cell, Command, DELTA, Dir, Puzzle, Step, bestRoute, generatePuzzle, nextDir, programOf, runProgram, stepFrom } from '../domain/coding';
import { Food, foodImage, mulberry32 } from '../domain/models';
import { Dino, SUCCESS_REACTIONS } from '../dino/Dino';
import { lang, phrase } from '../i18n';
import { drawBackdrop } from '../ui/backdrop';
import { FONT, INK, card } from '../ui/kit';
import { goTo, homeButton, unit } from '../ui/scenery';
import { safeArea } from '../ui/safeArea';
import { BaseScene } from './BaseScene';

/** Orientation du dino selon la direction (0 = de face). */
const YAW: Record<Dir, number> = { up: Math.PI, right: Math.PI / 2 * 0.85, down: 0, left: -Math.PI / 2 * 0.85 };
/** Rotation du dessin de la flèche (dessinée vers le haut). */
const ANGLE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: -90 };
const FRUIT_IMAGES: Food[] = ['red-apple', 'banana'];

/**
 * « Programme le dino » : un plateau quadrillé, le dino, un fruit (deux au CP),
 * des rochers et de l'eau. Des flèches pour l'amener jusqu'au fruit :
 * - mode direct (petits) : chaque flèche fait avancer le dino tout de suite ;
 * - mode programme : les flèches s'alignent dans la barre du bas, le bouton vert
 *   lance le programme ; la flèche en cours s'allume. Au CP, le bouton « × »
 *   répète une flèche (la boucle).
 * En cas d'erreur, le programme reste affiché pour être corrigé ; après deux
 * erreurs la bonne flèche clignote, après trois le chemin apparaît.
 * Une série = 4 plateaux. `testLevel` (lien de test `?jeu=LO-12&niveau=7`) :
 * plateaux sans fin à ce niveau, avec un sélecteur de niveau.
 */
export class CodeScene extends BaseScene {
  private shared = false;
  private series?: Series;
  private testLevel?: number;
  private puzzle!: Puzzle;
  private dino!: Dino;
  private at: Cell = { x: 0, y: 0 };
  private collected: number[] = [];
  private program: Command[] = [];
  private failures = 0;
  private busy = false;
  private board!: Phaser.GameObjects.Container;
  private fruitImages: Phaser.GameObjects.Image[] = [];
  private pathDots?: Phaser.GameObjects.Graphics;
  private bar?: Phaser.GameObjects.Container;
  private slotBoxes: Phaser.GameObjects.Container[] = [];
  private arrows = new Map<Dir, Phaser.GameObjects.Container>();
  private playButton?: Phaser.GameObjects.Container;
  private loopButton?: Phaser.GameObjects.Container;
  private steps: Phaser.GameObjects.Image[] = [];
  private cell = 0;
  private origin = { x: 0, y: 0 };
  private playMs = 0;
  private pulses: Phaser.Tweens.Tween[] = [];

  constructor() {
    super('Code');
  }

  update(_time: number, delta: number) {
    this.playMs += Math.min(delta, 1000);
    if (this.playMs >= 10_000) this.savePlayTime();
  }

  private savePlayTime() {
    if (this.playMs > 0 && !this.testLevel) app.progress.addPlayTime(this.playMs);
    this.playMs = 0;
  }

  create(data: { gameId?: string; series?: Series; testLevel?: number }) {
    this.initBase();
    this.shared = !!data.series;
    this.testLevel = data.testLevel;
    this.playMs = 0;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.savePlayTime());
    drawBackdrop(this, 'meadow');
    // Ouvert directement (lien de test) : le premier toucher débloque le son et la voix.
    if (!app.awake) {
      this.input.once('pointerdown', () => {
        app.voice.unlock();
        Sfx.unlock();
        Music.unlock();
        app.awake = true;
      });
    }
    const game = gameById('LO-12');
    this.series = this.testLevel ? undefined : data.series ?? new Series(game, app.progress, app.rng);
    homeButton(this, () => {
      this.series?.abandon();
      goTo(this, 'Home');
    });
    if (this.series) this.drawSteps();
    else this.levelPicker();
    // Images du plateau : chargées si besoin (elles le sont d'habitude au démarrage).
    const keys = ['code-rock', 'code-water', ...FRUIT_IMAGES.map(foodImage)].filter((k) => !this.textures.exists(k));
    const begin = () => this.run(async () => {
      this.newBoard();
      await this.wait(300);
      if (!this.testLevel) await this.say(this.shared ? game.shortLine : game.introLine);
      await app.voice.say(this.prompt());
    });
    if (!keys.length) begin();
    else {
      for (const k of keys) this.load.svg(k, `img/${k}.svg`, { width: 256, height: 256 });
      this.load.once(Phaser.Loader.Events.COMPLETE, begin);
      this.load.start();
    }
  }

  // ---- Plateau ----

  private prompt() {
    if (this.series) return this.series.current.prompt;
    return gameById('LO-12').build({ id: `LO-12:${this.puzzle.level}:0`, level: this.puzzle.level }, this.puzzle.level, app.rng).prompt;
  }

  private newBoard() {
    const level = this.testLevel ?? (this.series!.current.show?.kind === 'code' ? this.series!.current.show.level : 1);
    const seed = !this.testLevel && this.series!.current.show?.kind === 'code' ? this.series!.current.show.seed : Math.floor(Math.random() * 1e9);
    this.puzzle = generatePuzzle(level, mulberry32(seed));
    this.at = { ...this.puzzle.start };
    this.collected = [];
    this.program = [];
    this.failures = 0;
    this.busy = false;
    this.board?.destroy();
    this.dino?.destroy();
    this.bar?.destroy();
    this.pathDots?.destroy();
    this.pathDots = undefined;
    for (const b of this.arrows.values()) b.destroy();
    this.arrows.clear();
    this.playButton?.destroy();
    this.loopButton?.destroy();
    this.playButton = this.loopButton = undefined;
    this.drawBoard();
    this.drawControls();
    if (this.puzzle.mode === 'program') this.drawBar();
    this.armIdle([[14000, () => this.remind()]]);
  }

  private get direct() { return this.puzzle.mode === 'direct'; }

  /** Centre d'une case, à l'écran. */
  private pos(c: Cell) {
    return { x: this.origin.x + (c.x + 0.5) * this.cell, y: this.origin.y + (c.y + 0.5) * this.cell };
  }

  private drawBoard() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const p = this.puzzle;
    // Place du plateau : à gauche, la barre du programme dessous (mode programme), les flèches à droite.
    const area = { x: W * 0.06, y: H * 0.17, w: W * 0.58, h: H * (this.direct ? 0.76 : 0.6) };
    this.cell = Math.min(area.w / p.cols, area.h / p.rows, u * 0.24);
    const bw = this.cell * p.cols;
    const bh = this.cell * p.rows;
    this.origin = { x: area.x + (area.w - bw) / 2, y: area.y + (area.h - bh) / 2 };
    this.board = this.add.container(0, 0).setDepth(1);
    const g = this.add.graphics();
    const pad = this.cell * 0.12;
    g.fillStyle(0x000000, 0.18).fillRoundedRect(this.origin.x - pad, this.origin.y - pad + this.cell * 0.06, bw + pad * 2, bh + pad * 2, this.cell * 0.22);
    g.fillStyle(0x8b5a2b, 1).fillRoundedRect(this.origin.x - pad, this.origin.y - pad, bw + pad * 2, bh + pad * 2, this.cell * 0.22);
    for (let y = 0; y < p.rows; y++) {
      for (let x = 0; x < p.cols; x++) {
        const c = this.pos({ x, y });
        const s = this.cell * 0.94;
        g.fillStyle((x + y) % 2 ? 0x7fcf5a : 0x93dd6c, 1).fillRoundedRect(c.x - s / 2, c.y - s / 2, s, s, this.cell * 0.14);
      }
    }
    for (const w of p.water) {
      const c = this.pos(w);
      const s = this.cell * 0.94;
      g.fillStyle(0x3aa7e8, 1).fillRoundedRect(c.x - s / 2, c.y - s / 2, s, s, this.cell * 0.14);
    }
    this.board.add(g);
    const image = (key: string, c: Cell, size: number) => {
      const at = this.pos(c);
      const img = this.add.image(at.x, at.y, key);
      img.setScale((this.cell * size) / Math.max(img.width, img.height));
      this.board.add(img);
      return img;
    };
    for (const w of p.water) image('code-water', w, 0.7).setAlpha(0.85);
    for (const r of p.rocks) image('code-rock', r, 0.82);
    this.fruitImages = p.fruits.map((f, i) => {
      const img = image(foodImage(FRUIT_IMAGES[i % FRUIT_IMAGES.length]), f, 0.62);
      this.tweens.add({ targets: img, y: img.y - this.cell * 0.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return img;
    });
    const start = this.pos(p.start);
    this.dino = new Dino(this, start.x, start.y + this.cell * 0.42, this.cell * 1.05).setDepth(3);
    // Toucher le dino : il redit la consigne.
    const zone = this.add.zone(0, -Dino.HEIGHT / 2, 320, Dino.HEIGHT).setInteractive();
    this.dino.add(zone);
    zone.on('pointerup', () => {
      if (this.busy) return;
      this.dino.react('happy');
      void app.voice.say(this.prompt());
    });
  }

  // ---- Commandes ----

  /** Une flèche dessinée (pointe vers le haut), dans un conteneur à faire tourner. */
  private arrowShape(size: number, color: number) {
    const g = this.add.graphics();
    const w = size * 0.34, head = size * 0.42;
    g.fillStyle(color, 1);
    g.fillTriangle(0, -size / 2, -head, -size / 2 + head * 1.05, head, -size / 2 + head * 1.05);
    g.fillRoundedRect(-w / 2, -size / 2 + head, w, size - head, w * 0.3);
    return g;
  }

  /** Bouton rond, avec un contenu (flèche, triangle « lecture »…). */
  private roundButton(x: number, y: number, r: number, fill: number, content: Phaser.GameObjects.GameObject[], onTap: () => void) {
    const c = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18).fillCircle(0, r * 0.08, r);
    g.fillStyle(fill, 1).fillCircle(0, 0, r);
    g.lineStyle(r * 0.08, 0xffffff, 0.9).strokeCircle(0, 0, r * 0.92);
    c.add([g, ...content]);
    c.setSize(r * 2, r * 2).setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    c.on('pointerdown', () => this.tweens.add({ targets: c, scale: 0.9, duration: 70, yoyo: true }));
    c.on('pointerup', () => onTap());
    return c;
  }

  private drawControls() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const inset = safeArea(this);
    const r = u * 0.085;
    const cx = Math.min(W * 0.82, W - inset.right - r * 3.4);
    const cy = this.direct ? H * 0.55 : H * 0.45;
    const gap = r * 2.15;
    const at: Record<Dir, [number, number]> = { up: [0, -gap], down: [0, gap], left: [-gap, 0], right: [gap, 0] };
    for (const dir of ['up', 'right', 'down', 'left'] as Dir[]) {
      const arrow = this.arrowShape(r * 1.15, 0xffffff).setAngle(ANGLE[dir]);
      const b = this.roundButton(cx + at[dir][0], cy + at[dir][1], r, 0xf59e0b, [arrow], () => this.pressArrow(dir));
      this.arrows.set(dir, b);
    }
    if (this.direct) return;
    // Mode programme : le bouton vert lance, la flèche ronde efface tout ; au CP, « × » répète une flèche.
    const play = this.add.graphics().fillStyle(0xffffff, 1).fillTriangle(-r * 0.32, -r * 0.45, -r * 0.32, r * 0.45, r * 0.5, 0);
    this.playButton = this.roundButton(cx + r * 0.6, Math.min(H * 0.86, cy + gap * 2.3), r * 1.15, 0x22c55e, [play], () => this.runIt());
    const reset = this.add.text(0, 0, '↺', { fontFamily: FONT, fontSize: `${Math.round(r * 1.1)}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0.55);
    this.roundButton(cx - r * 1.9, this.playButton.y, r * 0.75, 0x94a3b8, [reset], () => this.clearProgram()).setName('reset');
    if (this.puzzle.loops) {
      const times = this.add.text(0, 0, '×', { fontFamily: FONT, fontSize: `${Math.round(r * 1.2)}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0.55);
      this.loopButton = this.roundButton(cx, cy, r * 0.8, 0x8b5cf6, [times], () => this.repeatLast());
    }
  }

  /** La barre du programme : une case par flèche possible. */
  private drawBar() {
    const { height: H } = this.scale;
    const u = unit(this);
    const n = this.puzzle.slots;
    const left = this.origin.x - this.cell * 0.12;
    const width = Math.max(this.cell * this.puzzle.cols + this.cell * 0.24, u * 0.6);
    const size = Math.min(u * 0.12, (width - u * 0.04) / n * 0.86);
    const step = size * 1.14;
    const total = step * n - (step - size) + u * 0.04;
    const y = Math.min(H * 0.89, this.origin.y + this.cell * this.puzzle.rows + this.cell * 0.12 + size * 0.85);
    this.bar = this.add.container(left + total / 2, y).setDepth(4);
    const g = this.add.graphics().fillStyle(0xffffff, 0.85).fillRoundedRect(-total / 2, -size * 0.66, total, size * 1.32, size * 0.3);
    this.bar.add(g);
    this.slotBoxes = Array.from({ length: n }, (_, i) => {
      const box = this.add.container(-total / 2 + u * 0.02 + size / 2 + i * step, 0);
      box.setSize(size, size).setInteractive({ useHandCursor: true });
      box.on('pointerup', () => this.removeCommand(i));
      this.bar!.add(box);
      return box;
    });
    this.redrawBar();
  }

  private redrawBar(active = -1, wrong = -1) {
    const size = (this.slotBoxes[0]?.width ?? 0);
    this.slotBoxes.forEach((box, i) => {
      box.removeAll(true);
      const c = this.program[i];
      const fill = i === active ? 0xfde047 : i === wrong ? 0xfecaca : c ? 0xfff7e6 : 0xe5e7eb;
      box.add(this.add.graphics().fillStyle(fill, 1).fillRoundedRect(-size / 2, -size / 2, size, size, size * 0.2)
        .lineStyle(size * 0.05, c ? 0xf59e0b : 0xcbd5e1, 1).strokeRoundedRect(-size / 2, -size / 2, size, size, size * 0.2));
      if (!c) return;
      box.add(this.arrowShape(size * 0.62, 0xf59e0b).setAngle(ANGLE[c.dir]));
      if (c.times > 1) {
        box.add(this.add.text(size * 0.28, size * 0.28, `×${c.times}`, {
          fontFamily: FONT, fontSize: `${Math.round(size * 0.34)}px`, color: '#ffffff', fontStyle: 'bold', stroke: '#6d28d9',
          strokeThickness: Math.round(size * 0.1),
        }).setOrigin(0.5));
      }
    });
  }

  private pressArrow(dir: Dir) {
    if (this.busy) return;
    this.clearIdle();
    this.stopPulses();
    if (this.direct) {
      this.run(() => this.moveDirect(dir));
      return;
    }
    if (this.program.length >= this.puzzle.slots) {
      this.tweens.add({ targets: this.bar, x: this.bar!.x + 8, duration: 50, yoyo: true, repeat: 2 });
      void this.line('LO-12.full', 'Il n\'y a plus de place ! Touche une flèche en bas pour l\'enlever.');
      return;
    }
    Sfx.play('pop');
    this.program.push({ dir, times: 1 });
    this.redrawBar();
    this.armIdle([[14000, () => this.remind()]]);
  }

  /** « × » : la dernière flèche est répétée 2 fois, puis 3, puis redevient simple. */
  private repeatLast() {
    if (this.busy || !this.program.length) return;
    const last = this.program[this.program.length - 1];
    last.times = last.times % 3 + 1;
    Sfx.play('pop');
    this.redrawBar();
  }

  private removeCommand(i: number) {
    if (this.busy || !this.program[i]) return;
    this.program.splice(i, 1);
    this.redrawBar();
  }

  private clearProgram() {
    if (this.busy) return;
    this.program = [];
    this.redrawBar();
  }

  // ---- Déplacements ----

  private placeDino(c: Cell) {
    const p = this.pos(c);
    this.dino.setPosition(p.x, p.y + this.cell * 0.42);
  }

  /** Une case dans la direction : le dino marche (de profil, de dos ou de face). */
  private walk(step: Step, dir: Dir): Promise<void> {
    const to = this.pos(step.to);
    this.dino.run(true);
    this.dino.face(YAW[dir], 120);
    return new Promise((resolve) => this.tweens.add({
      targets: this.dino, x: to.x, y: to.y + this.cell * 0.42, duration: 360, ease: 'Sine.easeInOut',
      onComplete: () => resolve(),
    }));
  }

  /** Le dino se cogne : il part vers l'obstacle, rebondit, et dit « oups ». */
  private bump(step: Step, dir: Dir): Promise<void> {
    const from = this.pos(step.from);
    this.dino.face(YAW[dir], 120);
    vibrate(80);
    return new Promise((resolve) => this.tweens.add({
      targets: this.dino, x: from.x + DELTA[dir][0] * this.cell * 0.3, y: from.y + this.cell * 0.42 + DELTA[dir][1] * this.cell * 0.3,
      duration: 160, yoyo: true, ease: 'Quad.easeOut', onComplete: () => {
        this.dino.run(false);
        this.dino.face(0);
        this.dino.react('oops');
        resolve();
      },
    }));
  }

  private async eatFruit(index: number) {
    const fruit = this.fruitImages[index];
    const mouth = this.dino.mouthWorldPoint();
    this.tweens.killTweensOf(fruit);
    Sfx.play('chomp');
    await new Promise<void>((resolve) => this.tweens.add({
      targets: fruit, x: mouth.x, y: mouth.y, scale: fruit.scale * 0.3, alpha: 0, duration: 260, ease: 'Quad.easeIn',
      onComplete: () => resolve(),
    }));
    fruit.setVisible(false);
    this.dino.react('eat');
  }

  private bumpLine(step: Step) {
    if (step.obstacle === 'water') return this.line('LO-12.bumpWater', 'Oh non, de l\'eau ! Je ne sais pas nager.');
    if (step.obstacle === 'edge') return this.line('LO-12.bumpEdge', 'Oups, je ne peux pas sortir du jardin !');
    return this.line('LO-12.bumpRock', 'Oups, un rocher !');
  }

  /** Mode direct : une flèche, un pas. */
  private async moveDirect(dir: Dir) {
    this.busy = true;
    const step = stepFrom(this.puzzle, this.at, dir, this.collected);
    if (step.kind === 'bump') {
      this.failures++;
      await this.bump(step, dir);
      await this.bumpLine(step);
      this.busy = false;
      if (this.failures >= 2) this.hint();
      return;
    }
    await this.walk(step, dir);
    this.at = step.to;
    if (step.fruit !== undefined) {
      this.collected.push(step.fruit);
      this.dino.run(false);
      this.dino.face(0);
      await this.eatFruit(step.fruit);
      if (this.collected.length === this.puzzle.fruits.length) {
        await this.success();
        return;
      }
    }
    this.busy = false;
    this.armIdle([[4000, () => { this.dino.run(false); this.dino.face(0); }], [14000, () => this.remind()]]);
  }

  /** Mode programme : le bouton vert. */
  private runIt() {
    if (this.busy) return;
    this.clearIdle();
    this.stopPulses();
    if (!this.program.length) {
      void this.line('LO-12.empty', 'Pose d\'abord des flèches en bas, puis appuie sur le bouton vert !');
      return;
    }
    this.run(async () => {
      this.busy = true;
      const result = runProgram(this.puzzle, this.program);
      for (const step of result.steps) {
        const c = this.program[step.command];
        this.redrawBar(step.command);
        if (step.kind === 'bump') {
          this.dino.run(false);
          await this.bump(step, c.dir);
          this.redrawBar(-1, step.command);
          await this.bumpLine(step);
          break;
        }
        await this.walk(step, c.dir);
        if (step.fruit !== undefined) {
          this.collected.push(step.fruit);
          this.dino.run(false);
          void this.eatFruit(step.fruit);
          await this.wait(320);
        }
      }
      this.dino.run(false);
      this.dino.face(0);
      if (result.outcome === 'win') {
        this.redrawBar();
        await this.success();
        return;
      }
      this.failures++;
      if (result.outcome === 'short') await this.line('LO-12.short', 'Il me manque des flèches : je ne suis pas encore arrivé !');
      await this.wait(300);
      await this.backToStart();
      this.busy = false;
      if (this.failures >= 2) this.hint();
      this.armIdle([[14000, () => this.remind()]]);
    });
  }

  /** Après une erreur : retour à la case de départ, fruits remis en place (le programme reste affiché). */
  private async backToStart() {
    this.collected = [];
    this.fruitImages.forEach((img, i) => {
      const at = this.pos(this.puzzle.fruits[i]);
      img.setVisible(true).setAlpha(1).setPosition(at.x, at.y).setScale((this.cell * 0.62) / Math.max(img.width, img.height));
    });
    this.dino.setAlpha(0);
    this.placeDino(this.puzzle.start);
    this.at = { ...this.puzzle.start };
    await new Promise<void>((resolve) => this.tweens.add({ targets: this.dino, alpha: 1, duration: 250, onComplete: () => resolve() }));
  }

  // ---- Aides ----

  private stopPulses() {
    this.pulses.forEach((t) => t.stop());
    this.pulses = [];
    for (const b of this.arrows.values()) b.setScale(1);
  }

  private pulse(obj: Phaser.GameObjects.Container) {
    obj.setScale(1);
    this.pulses.push(this.tweens.add({ targets: obj, scale: 1.18, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
  }

  /** Deux erreurs : la bonne flèche clignote. Trois : le chemin apparaît en pointillés. */
  private hint() {
    this.stopPulses();
    if (this.direct) {
      const dir = nextDir(this.puzzle, this.at, this.collected);
      if (dir) this.pulse(this.arrows.get(dir)!);
    } else {
      const best = programOf(bestRoute(this.puzzle)!, this.puzzle.start, this.puzzle.loops);
      const i = best.findIndex((c, k) => !this.program[k] || this.program[k].dir !== c.dir || this.program[k].times !== c.times);
      if (i >= 0) {
        this.pulse(this.arrows.get(best[i].dir)!);
        if (this.program[i]) this.redrawBar(-1, i);
        if (best[i].times > 1 && this.loopButton) this.pulse(this.loopButton);
      }
    }
    void this.line('LO-12.hint', 'Regarde bien : la flèche qui clignote, c\'est la bonne direction !');
    if (this.failures >= 3) this.showPath();
  }

  private showPath() {
    if (this.pathDots) return;
    const route = this.direct ? undefined : bestRoute(this.puzzle);
    const from = this.direct ? this.at : this.puzzle.start;
    const left = this.puzzle.fruits.filter((_, i) => !this.collected.includes(i));
    const path = route ?? bestRoute(this.puzzle, from, left) ?? [];
    this.pathDots = this.add.graphics().setDepth(2);
    let prev = this.pos(from);
    for (const c of path) {
      const next = this.pos(c);
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        this.pathDots.fillStyle(0xffffff, 0.9).fillCircle(prev.x + (next.x - prev.x) * t, prev.y + (next.y - prev.y) * t, this.cell * 0.05);
      }
      prev = next;
    }
  }

  private remind() {
    if (this.busy) return;
    this.dino.react('think');
    void app.voice.say(this.prompt());
    this.armIdle([[20000, () => this.remind()]]);
  }

  private line(key: string, fr: string) {
    return app.voice.say([{ text: phrase(() => fr, key), lang: lang() }]);
  }

  // ---- Réussite ----

  private async success() {
    this.busy = true;
    this.clearIdle();
    this.stopPulses();
    this.dino.run(false);
    this.dino.face(0);
    const best = !this.direct && this.program.length <= this.puzzle.best && this.failures === 0;
    if (!this.series) {
      // Mode test : un autre plateau du même niveau.
      this.dino.react('cheer');
      Sfx.play('star');
      await this.wait(1200);
      this.newBoard();
      return;
    }
    const item = this.series.current;
    if (this.failures > 0) this.series.tap({ id: 'miss-0' });
    const outcome = this.series.tap(item.answer);
    if (outcome.kind !== 'correct') return;
    this.updateSteps(outcome.firstTry);
    this.dino.react(best ? 'dance' : outcome.firstTry ? 'cheer' : Phaser.Math.RND.pick(SUCCESS_REACTIONS));
    Sfx.play('star');
    await this.wait(300);
    await app.voice.say(item.reinforce);
    if (best && this.puzzle.level >= 15) await this.line('LO-12.best', 'Et en plus, tu as trouvé le programme le plus court !');
    if (!this.alive) return;
    await this.wait(300);
    this.series.next();
    if (this.series.finished) {
      goTo(this, 'End', { result: this.series.result, mixed: this.shared });
      return;
    }
    if (sceneOf(this.series.current.game) !== 'Code') {
      goTo(this, sceneOf(this.series.current.game), { series: this.series });
      return;
    }
    this.newBoard();
    await app.voice.say(this.prompt());
  }

  // ---- Barre de progression (fruits de la série) ----

  private drawSteps() {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.056;
    const items = this.series!.items;
    const n = items.length;
    card(this, W / 2, u * 0.1, size * 1.12 * n + size * 0.6, size * 1.45, '#ffffff', '#dfe8f3');
    this.steps = items.map((item, i) => {
      const step = this.add.image(W / 2 + (i - (n - 1) / 2) * size * 1.12, u * 0.1, foodImage(item.fruit));
      step.setScale(size / step.width);
      if (item.firstTry === undefined) step.setTintFill(0x8fa6c4).setAlpha(0.75);
      else if (!item.firstTry) step.setTintFill(0xc9d1dc).setAlpha(0.4);
      return step;
    });
  }

  private updateSteps(won: boolean) {
    const step = this.steps[this.series!.index];
    if (!step) return;
    if (won) {
      step.clearTint().setAlpha(1);
      this.tweens.add({ targets: step, scale: step.scale * 1.7, duration: 220, yoyo: true, ease: 'Back.easeOut' });
    } else {
      step.setTintFill(0xc9d1dc).setAlpha(0.4);
    }
  }

  /** Mode test : « ◀ Niveau 7 ▶ » en haut, pour changer de niveau. */
  private levelPicker() {
    const { width: W } = this.scale;
    const u = unit(this);
    const y = u * 0.1;
    card(this, W / 2, y, u * 0.62, u * 0.11, '#ffffff', '#dfe8f3');
    const text = this.add.text(W / 2, y, '', { fontFamily: FONT, fontSize: `${Math.round(u * 0.05)}px`, color: INK, fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(6);
    const show = () => text.setText(`Niveau ${this.testLevel}`);
    show();
    const change = (d: number) => {
      if (this.busy) return;
      this.testLevel = Math.max(1, Math.min(20, this.testLevel! + d));
      show();
      this.newBoard();
    };
    for (const [d, x] of [[-1, W / 2 - u * 0.24], [1, W / 2 + u * 0.24]] as const) {
      const arrow = this.arrowShape(u * 0.05, 0xffffff).setAngle(d < 0 ? -90 : 90);
      this.roundButton(x, y, u * 0.04, 0x2d3354, [arrow], () => change(d)).setDepth(6);
    }
  }
}
