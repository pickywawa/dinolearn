import Phaser from 'phaser';
import { gameById } from '../content/games';
import { TraceMode, TraceModel, traceModel } from '../content/tracing';
import { app } from '../core/app';
import { Series, sceneOf } from '../core/series';
import { Sfx } from '../core/sfx';
import { foodImage } from '../domain/models';
import { Point, resample, scoreTrace } from '../domain/trace';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { drawVegetation } from '../ui/vegetation';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Jeux de tracé : l'enfant repasse avec le doigt sur les pointillés, puis sur
 * des points légers, puis dessine tout seul en regardant un modèle. Le tracé
 * est corrigé par `scoreTrace` (tolérant : ni le sens ni l'ordre des traits ne
 * comptent). Après deux essais ratés, le dino montre comment faire.
 */
export class TraceScene extends BaseScene {
  /** Série de la planète, partagée avec les autres scènes : une fois la question faite, on passe la main. */
  private shared = false;
  private series!: Series;
  private dino!: Dino;
  private model!: TraceModel;
  private mode: TraceMode = 'dots';
  private area = { x: 0, y: 0, size: 0 };
  private guideLayer!: Phaser.GameObjects.Container;
  private ink!: Phaser.GameObjects.Graphics;
  private strokes: Point[][] = [];
  private drawing = false;
  private phase: 'asking' | 'feedback' | 'done' = 'asking';
  private steps: Phaser.GameObjects.Image[] = [];
  private checkTimer?: Phaser.Time.TimerEvent;
  private playMs = 0;

  constructor() {
    super('Trace');
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
    drawScenery(this, 0xe0f7fa, 0xf8fdff, 0);
    drawVegetation(this, app.rng, isPortrait(this) ? [0.04, 0.32] : [0, 0.2]);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    this.series = data.series ?? new Series(game, app.progress, app.rng);
    this.phase = 'asking';
    homeButton(this, () => {
      this.series.abandon();
      goTo(this, 'Home');
    });
    this.drawSteps();

    const size = portrait ? Math.min(W * 0.88, H * 0.52) : H * 0.74;
    const cx = portrait ? W / 2 : W * 0.5;
    const cy = portrait ? H * 0.43 : H * 0.55;
    this.area = { x: cx - size / 2, y: cy - size / 2, size };
    this.add.graphics()
      .fillStyle(0xffffff, 1).fillRoundedRect(this.area.x, this.area.y, size, size, 28)
      .lineStyle(6, game.color, 1).strokeRoundedRect(this.area.x, this.area.y, size, size, 28);
    this.guideLayer = this.add.container(0, 0);
    this.ink = this.add.graphics();

    this.dino = new Dino(this, portrait ? W * 0.17 : W * 0.12, H * 0.985, u * (portrait ? 0.3 : 0.38));
    const zone = this.add.zone(0, -Dino.HEIGHT / 2, 320, Dino.HEIGHT).setInteractive();
    this.dino.add(zone);
    zone.on('pointerup', () => {
      this.dino.react('happy');
      void app.voice.say(this.series.current.prompt);
    });

    // La gomme : on efface sans pénalité.
    const eraserAt = portrait
      ? { x: W * 0.85, y: this.area.y + size + u * 0.12 }
      : { x: this.area.x + size + u * 0.14, y: H * 0.85 };
    new Bubble(this, eraserAt.x, eraserAt.y, u * 0.08, 0xffe4e6, 'ui-eraser', () => this.clearInk(), 0.7);

    this.setupInput();
    this.run(async () => {
      await this.wait(300);
      await this.say(this.shared ? game.shortLine : game.introLine);
      this.ask();
    });
  }

  // ---- Déroulé ----

  private ask() {
    const item = this.series.current;
    const show = item.show;
    if (show?.kind !== 'trace') return;
    this.model = traceModel(show.model)!;
    this.mode = show.mode;
    this.phase = 'asking';
    this.clearInk();
    this.drawGuide();
    this.run(async () => {
      await app.voice.say(item.prompt);
    });
    this.armIdle([[9000, () => this.remind()], [20000, () => this.remind()]]);
  }

  private remind() {
    if (this.phase !== 'asking') return;
    this.run(async () => {
      await this.say(this.strokes.length ? 'trace.continue' : 'trace.start');
    });
  }

  /** Correction quelques instants après le dernier trait (on peut en faire plusieurs). */
  private check() {
    if (this.phase !== 'asking') return;
    const score = scoreTrace(this.model.strokes, this.strokes, this.mode === 'free');
    if (score.ok) {
      this.success();
      return;
    }
    // Pas fini ? On laisse continuer tant qu'il manque des traits.
    const finished = this.strokes.length >= this.model.strokes.length && score.coverage > 0.5;
    if (finished || score.length > 2.5) this.fail();
  }

  private success() {
    this.phase = 'feedback';
    this.clearIdle();
    const outcome = this.series.tap(this.series.current.answer);
    if (outcome.kind !== 'correct') return;
    Sfx.play('correct');
    this.redrawInk(0x30a46c);
    this.updateSteps(true);
    this.dino.react(outcome.streak >= 3 ? 'cheer' : 'happy');
    this.run(async () => {
      await app.voice.say(this.series.current.reinforce);
      if (!this.alive) return;
      await this.wait(300);
      this.series.next();
      if (this.series.finished) {
        this.phase = 'done';
        goTo(this, 'End', { result: this.series.result, mixed: this.shared });
      } else if (sceneOf(this.series.current.game) !== 'Trace') {
        // Série de la planète : la question suivante se joue ailleurs.
        this.phase = 'done';
        goTo(this, sceneOf(this.series.current.game), { series: this.series });
      } else {
        this.ask();
      }
    });
  }

  private fail() {
    this.phase = 'feedback';
    this.clearIdle();
    this.series.tap({ id: `miss-${this.series.wrongAttempts}` });
    Sfx.play('wrong');
    this.dino.react('oops');
    this.redrawInk(0xe5484d);
    this.run(async () => {
      await this.say('trace.retry');
      this.clearInk();
      // Après deux essais, le dino montre comment faire.
      if (this.series.wrongAttempts >= 2) await this.demo();
      this.phase = 'asking';
      this.armIdle([[9000, () => this.remind()]]);
    });
  }

  /** La main du dino trace le modèle, trait par trait. */
  private async demo() {
    void app.voice.say(this.series.current.hints);
    const hand = this.add.image(0, 0, 'guide-hand').setOrigin(0.22, 0.04).setDepth(30);
    hand.setScale((unit(this) * 0.13) / hand.width);
    const demoInk = this.add.graphics().setDepth(29);
    for (const stroke of this.model.strokes) {
      const points = resample([stroke], 0.02).map((p) => this.toScreen(p));
      await new Promise<void>((resolve) => {
        this.tweens.addCounter({
          from: 0, to: points.length - 1, duration: Math.max(500, points.length * 22),
          onUpdate: (tw) => {
            const i = Math.floor(tw.getValue() ?? 0);
            const [x, y] = points[i];
            hand.setPosition(x, y);
            if (i > 0) {
              demoInk.lineStyle(this.area.size * 0.025, 0xf59e0b, 0.6).lineBetween(points[i - 1][0], points[i - 1][1], x, y);
            }
          },
          onComplete: () => resolve(),
        });
      });
    }
    await this.wait(500);
    hand.destroy();
    this.tweens.add({ targets: demoInk, alpha: 0, duration: 500, onComplete: () => demoInk.destroy() });
  }

  // ---- Dessin ----

  private toScreen([x, y]: Point): Point {
    return [this.area.x + x * this.area.size, this.area.y + y * this.area.size];
  }

  private toUnit(x: number, y: number): Point {
    return [(x - this.area.x) / this.area.size, (y - this.area.y) / this.area.size];
  }

  private inArea(x: number, y: number) {
    const { x: ax, y: ay, size } = this.area;
    return x >= ax && x <= ax + size && y >= ay && y <= ay + size;
  }

  private setupInput() {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.phase !== 'asking' || !this.inArea(p.x, p.y)) return;
      this.drawing = true;
      this.checkTimer?.remove();
      this.clearIdle();
      this.strokes.push([this.toUnit(p.x, p.y)]);
      this.redrawInk();
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.drawing || !p.isDown) return;
      const stroke = this.strokes[this.strokes.length - 1];
      const [lx, ly] = this.toScreen(stroke[stroke.length - 1]);
      if (Math.hypot(p.x - lx, p.y - ly) < 4) return;
      const x = Phaser.Math.Clamp(p.x, this.area.x, this.area.x + this.area.size);
      const y = Phaser.Math.Clamp(p.y, this.area.y, this.area.y + this.area.size);
      stroke.push(this.toUnit(x, y));
      this.inkSegment(lx, ly, x, y, 0x2563eb);
    });
    this.input.on('pointerup', () => {
      if (!this.drawing) return;
      this.drawing = false;
      this.checkTimer = this.time.delayedCall(900, () => this.check());
    });
  }

  private inkSegment(x1: number, y1: number, x2: number, y2: number, color: number) {
    const w = this.area.size * 0.03;
    this.ink.lineStyle(w, color, 1).lineBetween(x1, y1, x2, y2);
    this.ink.fillStyle(color, 1).fillCircle(x2, y2, w / 2);
  }

  private redrawInk(color = 0x2563eb) {
    this.ink.clear();
    for (const stroke of this.strokes) {
      const pts = stroke.map((p) => this.toScreen(p));
      this.ink.fillStyle(color, 1).fillCircle(pts[0][0], pts[0][1], this.area.size * 0.015);
      for (let i = 1; i < pts.length; i++) this.inkSegment(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], color);
    }
  }

  private clearInk() {
    this.checkTimer?.remove();
    this.strokes = [];
    this.ink.clear();
  }

  /** Pointillés (ou points légers) avec le départ de chaque trait ; sans pointillés : un modèle à côté. */
  private drawGuide() {
    this.guideLayer.removeAll(true);
    const { size } = this.area;
    if (this.mode === 'free') {
      const u = unit(this);
      const { width: W } = this.scale;
      const portrait = isPortrait(this);
      const box = u * 0.22;
      const at = portrait
        ? { x: W / 2, y: this.area.y + size + u * 0.14 }
        : { x: this.area.x + size + u * 0.2, y: this.area.y + box / 2 };
      const g = this.add.graphics();
      g.fillStyle(0xfffbeb, 1).fillRoundedRect(at.x - box / 2, at.y - box / 2, box, box, 14)
        .lineStyle(3, 0xf59e0b, 1).strokeRoundedRect(at.x - box / 2, at.y - box / 2, box, box, 14);
      g.lineStyle(box * 0.05, 0x2d3354, 1);
      for (const stroke of this.model.strokes) {
        for (let i = 1; i < stroke.length; i++) {
          g.lineBetween(at.x - box / 2 + stroke[i - 1][0] * box, at.y - box / 2 + stroke[i - 1][1] * box,
            at.x - box / 2 + stroke[i][0] * box, at.y - box / 2 + stroke[i][1] * box);
        }
      }
      this.guideLayer.add(g);
      return;
    }
    const faint = this.mode === 'faint';
    const dots = this.add.graphics();
    for (const stroke of this.model.strokes) {
      for (const p of resample([stroke], faint ? 0.07 : 0.035)) {
        const [x, y] = this.toScreen(p);
        dots.fillStyle(0x94a3b8, faint ? 0.45 : 1).fillCircle(x, y, size * (faint ? 0.009 : 0.011));
      }
    }
    this.guideLayer.add(dots);
    // Départ de chaque trait : un point vert numéroté.
    this.model.strokes.forEach((stroke, i) => {
      const [x, y] = this.toScreen(stroke[0]);
      const r = size * 0.032;
      const start = this.add.circle(x, y, r, 0x30a46c).setAlpha(faint ? 0.6 : 1);
      const n = this.add.text(x, y, String(i + 1), {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(r * 1.2)}px`, color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.guideLayer.add([start, n]);
      if (!faint) this.tweens.add({ targets: start, scale: 1.25, duration: 600, yoyo: true, repeat: -1 });
    });
  }

  // ---- Barre de progression (comme dans les autres jeux) ----

  private drawSteps() {
    const { width: W } = this.scale;
    const u = unit(this);
    const size = u * 0.056;
    const n = this.series.items.length;
    this.steps = this.series.items.map((item, i) => {
      const step = this.add.image(W / 2 + (i - (n - 1) / 2) * size * 1.12, u * 0.1, foodImage(item.fruit));
      return step.setScale(size / step.width);
    });
    this.updateSteps(false);
  }

  private updateSteps(celebrate: boolean) {
    this.series.items.forEach((item, i) => {
      const step = this.steps[i];
      if (item.firstTry === undefined) step.setTintFill(0x8fa6c4).setAlpha(0.75);
      else if (item.firstTry) step.clearTint().setAlpha(1);
      else step.setTintFill(0xc9d1dc).setAlpha(0.4);
    });
    const won = this.steps[this.series.index];
    if (celebrate && won && this.series.current.firstTry) {
      Sfx.play('star');
      this.tweens.add({ targets: won, scale: won.scale * 1.7, duration: 220, yoyo: true, ease: 'Back.easeOut' });
    }
  }
}
