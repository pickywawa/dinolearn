import Phaser from 'phaser';
import { gameById } from '../content/games';
import { app } from '../core/app';
import { vibrate } from '../core/haptics';
import { Music } from '../core/music';
import { Series, sceneOf } from '../core/series';
import { Sfx } from '../core/sfx';
import { Food, foodImage, mulberry32 } from '../domain/models';
import { Grid, SUDOKU_LEVELS, Sudoku, conflictOf, easiestCell, generateSudoku } from '../domain/sudoku';
import { Dino, SUCCESS_REACTIONS } from '../dino/Dino';
import { lang, phrase } from '../i18n';
import { Guide } from '../ui/Guide';
import { drawBackdrop } from '../ui/backdrop';
import { FONT, INK, card, roundButton } from '../ui/kit';
import { exitButton, goTo, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/** Fruits du sudoku : bien différents par la forme et la couleur. */
const FRUIT_SET: Food[] = ['red-apple', 'banana', 'grapes', 'strawberry', 'tangerine', 'pear', 'watermelon', 'pineapple', 'kiwi-fruit'];

type Cell = { r: number; c: number };

/**
 * Sudoku des fruits (dès 5 ans) : une grille (3×3 au début, jusqu'à 9×9) et, à côté, un
 * fruit de chaque sorte. L'enfant glisse un fruit dans une case vide (ou touche le fruit,
 * puis la case). Un fruit ne va jamais deux fois sur une même ligne, une même colonne, ni
 * (dès 4×4) dans un même carré : un mauvais fruit revient à sa place, et le fruit qui gêne
 * clignote avec sa ligne, sa colonne ou son carré. Après deux erreurs, la case la plus facile
 * brille avec son fruit ; après quatre, la main montre le geste.
 * Une série = 3 grilles. `testLevel` (lien de test `?jeu=LO-13&niveau=7`) : grilles sans
 * fin à ce niveau, avec un sélecteur de niveau.
 */
export class SudokuScene extends BaseScene {
  private shared = false;
  private series?: Series;
  private testLevel?: number;
  private sudoku!: Sudoku;
  private grid: Grid = [];
  private fruits: Food[] = [];
  private dino!: Dino;
  private guide!: Guide;
  private layer?: Phaser.GameObjects.Container;
  private glow?: Phaser.GameObjects.Graphics;
  private cellPos: { x: number; y: number }[][] = [];
  private cellSize = 0;
  private placed: (Phaser.GameObjects.Image | undefined)[][] = [];
  private tray: Phaser.GameObjects.Container[] = [];
  private selected?: number;
  private failures = 0;
  private busy = false;
  private steps: Phaser.GameObjects.Image[] = [];
  private pulses: Phaser.Tweens.Tween[] = [];
  private playMs = 0;

  constructor() {
    super('Sudoku');
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
    this.layer = undefined;
    this.tray = [];
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
    this.input.dragDistanceThreshold = 8;
    const game = gameById('LO-13');
    this.series = this.testLevel ? undefined : data.series ?? new Series(game, app.progress, app.rng);
    exitButton(this, () => this.series?.abandon());
    if (this.series) this.drawSteps();
    else this.levelPicker();
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    this.dino = new Dino(this, portrait ? W * 0.14 : W * 0.11, H * 0.98, u * (portrait ? 0.3 : 0.42));
    this.guide = new Guide(this, u * 0.13);
    this.setupDrag();
    const keys = FRUIT_SET.map(foodImage).filter((k) => !this.textures.exists(k));
    const begin = () => this.run(async () => {
      this.newBoard();
      await this.wait(300);
      if (!this.testLevel) await this.say(this.shared ? game.shortLine : game.introLine);
      await app.voice.say(this.prompt());
      this.armIdle([[20000, () => this.remind()]]);
    });
    if (!keys.length) begin();
    else {
      for (const k of keys) this.load.svg(k, `img/${k}.svg`, { width: 256, height: 256 });
      this.load.once(Phaser.Loader.Events.COMPLETE, begin);
      this.load.start();
    }
  }

  private get level() {
    return this.testLevel ?? (this.series?.current.show?.kind === 'sudoku' ? this.series.current.show.level : 1);
  }

  private prompt() {
    if (this.series) return this.series.current.prompt;
    const level = this.level;
    return gameById('LO-13').build({ id: `LO-13:${level}:0`, level }, level, app.rng).prompt;
  }

  // ---- Grille ----

  private newBoard() {
    const show = this.series?.current.show;
    const seed = !this.testLevel && show?.kind === 'sudoku' ? show.seed : Math.floor(Math.random() * 1e9);
    const rng = mulberry32(seed);
    this.sudoku = generateSudoku(this.level, rng);
    const n = this.sudoku.spec.size;
    this.fruits = Phaser.Utils.Array.Shuffle([...FRUIT_SET]).slice(0, n);
    this.grid = this.sudoku.puzzle.map((row) => [...row]);
    this.failures = 0;
    this.busy = false;
    this.selected = undefined;
    this.stopHints();
    this.layer?.destroy();
    this.tray.forEach((t) => t.destroy());
    this.tray = [];
    this.layer = this.add.container(0, 0).setDepth(2);
    this.drawGrid();
    this.drawTray();
  }

  private drawGrid() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const { size: n, box } = this.sudoku.spec;
    const portrait = isPortrait(this);
    const top = u * 0.19;
    const side = portrait ? Math.min(W * 0.92, H * 0.52) : Math.min(H - top - H * 0.04, W * 0.56);
    const cx = portrait ? W / 2 : W * 0.48;
    const cy = top + side / 2;
    const pad = side * 0.035;
    const gap = side * (n >= 9 ? 0.008 : 0.014);
    // Un espace un peu plus grand entre les carrés : on voit les carrés sans traits.
    const boxGap = box ? side * 0.022 : 0;
    const colSeps = box ? n / box.cols - 1 : 0;
    const rowSeps = box ? n / box.rows - 1 : 0;
    const cellW = (side - pad * 2 - gap * (n - 1) - boxGap * colSeps) / n;
    const cellH = (side - pad * 2 - gap * (n - 1) - boxGap * rowSeps) / n;
    this.cellSize = Math.min(cellW, cellH);
    const g = this.add.graphics();
    this.layer!.add(g);
    g.fillStyle(0x000000, 0.15).fillRoundedRect(cx - side / 2, cy - side / 2 + side * 0.012, side, side, side * 0.05);
    g.fillStyle(0xc58b3c, 1).fillRoundedRect(cx - side / 2, cy - side / 2, side, side, side * 0.05);
    const x0 = cx - side / 2 + pad, y0 = cy - side / 2 + pad;
    this.cellPos = [];
    this.placed = [];
    for (let r = 0; r < n; r++) {
      this.cellPos.push([]);
      this.placed.push([]);
      for (let c = 0; c < n; c++) {
        const x = x0 + c * (this.cellSize + gap) + (box ? Math.floor(c / box.cols) * boxGap : 0) + this.cellSize / 2;
        const y = y0 + r * (this.cellSize + gap) + (box ? Math.floor(r / box.rows) * boxGap : 0) + this.cellSize / 2;
        this.cellPos[r].push({ x, y });
        // Carrés en damier (deux crèmes), cases données un peu plus foncées que les cases à remplir.
        const odd = box ? (Math.floor(r / box.rows) + Math.floor(c / box.cols)) % 2 === 1 : false;
        const given = this.grid[r][c] !== -1;
        const fill = given ? (odd ? 0xf6dcae : 0xfbe9c6) : (odd ? 0xfff6e6 : 0xffffff);
        const s = this.cellSize;
        g.fillStyle(fill, 1).fillRoundedRect(x - s / 2, y - s / 2, s, s, s * 0.16);
        if (given) this.placed[r].push(this.fruitImage(r, c, this.grid[r][c], false));
        else this.placed[r].push(undefined);
        const zone = this.add.zone(x, y, s, s).setInteractive();
        zone.on('pointerup', () => this.onCellTap({ r, c }));
        this.layer!.add(zone);
      }
    }
    this.glow = this.add.graphics();
    this.layer!.add(this.glow);
  }

  private fruitImage(r: number, c: number, fruit: number, pop: boolean) {
    const { x, y } = this.cellPos[r][c];
    const img = this.add.image(x, y, foodImage(this.fruits[fruit]));
    const scale = (this.cellSize * 0.78) / Math.max(img.width, img.height);
    img.setScale(pop ? 0 : scale);
    if (pop) this.tweens.add({ targets: img, scale, duration: 260, ease: 'Back.easeOut' });
    this.layer!.add(img);
    return img;
  }

  /** Les fruits à glisser : une colonne (ou deux, trois) à droite ; en portrait, des rangées sous la grille. */
  private drawTray() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const n = this.sudoku.spec.size;
    const portrait = isPortrait(this);
    const top = u * 0.19;
    let slots: { x: number; y: number }[];
    let size: number;
    if (portrait) {
      const perRow = n <= 4 ? n : Math.ceil(n / 2);
      const rows = Math.ceil(n / perRow);
      const yTop = top + Math.min(W * 0.92, H * 0.52) + H * 0.04;
      size = Math.min((W * 0.9) / perRow, (H * 0.96 - yTop) / rows) * 0.82;
      slots = Array.from({ length: n }, (_, i) => {
        const row = Math.floor(i / perRow);
        const inRow = Math.min(perRow, n - row * perRow);
        return { x: W / 2 + ((i % perRow) - (inRow - 1) / 2) * (size / 0.82), y: yTop + (row + 0.5) * (size / 0.82) };
      });
    } else {
      const cols = n <= 4 ? 1 : n <= 6 ? 2 : 3;
      const rows = Math.ceil(n / cols);
      const areaH = H - top - H * 0.04;
      const gridRight = W * 0.48 + Math.min(H - top - H * 0.04, W * 0.56) / 2;
      const areaW = W * 0.97 - gridRight - W * 0.02;
      size = Math.min(areaH / rows, areaW / cols, u * 0.2) * 0.84;
      const cx = gridRight + W * 0.02 + areaW / 2;
      slots = Array.from({ length: n }, (_, i) => {
        const row = Math.floor(i / cols), col = i % cols;
        return { x: cx + (col - (cols - 1) / 2) * (size / 0.84), y: top + areaH / 2 + (row - (rows - 1) / 2) * (size / 0.84) };
      });
    }
    this.tray = slots.map(({ x, y }, f) => {
      const disc = this.add.circle(0, 0, size / 2, 0xffffff).setStrokeStyle(size * 0.06, 0xf2b84b);
      const img = this.add.image(0, 0, foodImage(this.fruits[f]));
      img.setScale((size * 0.7) / Math.max(img.width, img.height));
      const item = this.add.container(x, y, [disc, img]).setDepth(3).setSize(size, size);
      item.setInteractive({ draggable: true, useHandCursor: true });
      item.setData('fruit', f);
      item.setScale(0);
      this.tweens.add({ targets: item, scale: 1, duration: 300, delay: 60 * f, ease: 'Back.easeOut' });
      item.on('pointerup', () => {
        if (item.getData('dragged')) return;
        this.select(f);
      });
      this.refreshTray(f, item);
      return item;
    });
  }

  /** Un fruit déjà posé partout (autant de fois que de lignes) : il pâlit. */
  private refreshTray(f: number, item = this.tray[f]) {
    if (!item) return;
    const count = this.grid.flat().filter((v) => v === f).length;
    const done = count >= this.sudoku.spec.size;
    item.setAlpha(done ? 0.35 : 1);
    item.setData('done', done);
  }

  // ---- Glisser-déposer et toucher ----

  private ghost?: Phaser.GameObjects.Image;

  private setupDrag() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      const item = obj as Phaser.GameObjects.Container;
      const f = item.getData('fruit') as number | undefined;
      if (f === undefined || this.busy || item.getData('done')) return;
      item.setData('dragged', true);
      this.clearIdle();
      this.guide.hide();
      this.setSelected(undefined);
      this.ghost?.destroy();
      this.ghost = this.add.image(pointer.worldX, pointer.worldY, foodImage(this.fruits[f])).setDepth(10);
      this.ghost.setScale((this.cellSize * 0.9) / Math.max(this.ghost.width, this.ghost.height));
      this.ghost.setData('fruit', f);
      Sfx.play('pop');
    });
    this.input.on('drag', (pointer: Phaser.Input.Pointer) => {
      // Le fruit au-dessus du doigt, pour qu'on voie où il va.
      this.ghost?.setPosition(pointer.worldX, pointer.worldY - this.cellSize * 0.25);
    });
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      const item = obj as Phaser.GameObjects.Container;
      // Le « pointerup » qui suit ne doit pas compter comme un toucher.
      this.time.delayedCall(0, () => item.setData('dragged', false));
      const ghost = this.ghost;
      this.ghost = undefined;
      if (!ghost) return;
      const cell = this.cellAt(ghost.x, ghost.y + this.cellSize * 0.25) ?? this.cellAt(pointer.worldX, pointer.worldY);
      if (cell && this.grid[cell.r][cell.c] === -1) this.tryPlace(cell, ghost.getData('fruit'), ghost);
      else this.sendBack(ghost, ghost.getData('fruit'));
    });
  }

  private cellAt(x: number, y: number): Cell | undefined {
    const half = this.cellSize * 0.62;
    for (let r = 0; r < this.cellPos.length; r++) {
      for (let c = 0; c < this.cellPos[r].length; c++) {
        const p = this.cellPos[r][c];
        if (Math.abs(p.x - x) <= half && Math.abs(p.y - y) <= half) return { r, c };
      }
    }
    return undefined;
  }

  /** Toucher un fruit le choisit (toucher ensuite une case l'y pose). */
  private select(f: number) {
    if (this.busy || this.tray[f]?.getData('done')) return;
    this.clearIdle();
    this.guide.hide();
    Sfx.play('pop');
    this.setSelected(this.selected === f ? undefined : f);
  }

  private setSelected(f: number | undefined) {
    if (this.selected !== undefined) {
      const old = this.tray[this.selected];
      this.tweens.killTweensOf(old);
      old?.setScale(1);
    }
    this.selected = f;
    if (f === undefined) return;
    const item = this.tray[f];
    this.tweens.add({ targets: item, scale: 1.15, duration: 120, ease: 'Back.easeOut' });
  }

  private onCellTap(cell: Cell) {
    if (this.busy || this.selected === undefined || this.grid[cell.r][cell.c] !== -1) return;
    const f = this.selected;
    const from = this.tray[f];
    this.setSelected(undefined);
    const ghost = this.add.image(from.x, from.y, foodImage(this.fruits[f])).setDepth(10);
    ghost.setScale((this.cellSize * 0.8) / Math.max(ghost.width, ghost.height));
    this.tryPlace(cell, f, ghost);
  }

  // ---- Poser un fruit ----

  private tryPlace(cell: Cell, f: number, ghost: Phaser.GameObjects.Image) {
    const { r, c } = cell;
    if (this.sudoku.solution[r][c] === f) {
      this.grid[r][c] = f;
      const { x, y } = this.cellPos[r][c];
      const scale = (this.cellSize * 0.78) / Math.max(ghost.width, ghost.height);
      this.tweens.add({
        targets: ghost, x, y, scale, duration: 160, ease: 'Quad.easeOut',
        onComplete: () => {
          ghost.destroy();
          this.placed[r][c] = this.fruitImage(r, c, f, true);
        },
      });
      Sfx.play('pop');
      vibrate(15);
      this.refreshTray(f);
      this.stopHints();
      this.celebrateGroups(cell);
      if (this.grid.every((row) => row.every((v) => v !== -1))) {
        this.run(() => this.success());
        return;
      }
      this.armIdle([[20000, () => this.remind()]]);
      return;
    }
    // Mauvais fruit : il revient, et on montre ce qui gêne.
    this.failures++;
    Sfx.play('wrong');
    vibrate([30, 40, 30]);
    this.sendBack(ghost, f);
    this.dino.react('oops');
    const conflict = conflictOf(this.sudoku.spec, this.grid, r, c, f);
    this.run(async () => {
      if (conflict) {
        this.flashGroup(cell, conflict.kind, conflict.at);
        const lines = {
          row: ['LO-13.conflictRow', 'Oups ! Ce fruit est déjà sur cette ligne.'],
          col: ['LO-13.conflictCol', 'Oups ! Ce fruit est déjà dans cette colonne.'],
          box: ['LO-13.conflictBox', 'Oups ! Ce fruit est déjà dans ce carré.'],
        }[conflict.kind];
        await this.line(lines[0], lines[1]);
      } else {
        await this.line('LO-13.wrong', 'Hmm, pas ici ! Regarde bien les autres lignes et les autres colonnes.');
      }
      if (!this.alive || this.busy) return;
      if (this.failures >= 2) this.hint();
      this.armIdle([[20000, () => this.remind()]]);
    });
  }

  private sendBack(ghost: Phaser.GameObjects.Image, f: number) {
    const home = this.tray[f];
    this.tweens.add({ targets: ghost, x: home?.x ?? ghost.x, y: home?.y ?? ghost.y, alpha: 0.4, duration: 260, ease: 'Quad.easeIn', onComplete: () => ghost.destroy() });
  }

  /** Le fruit qui gêne clignote, et sa ligne, sa colonne ou son carré s'allume en rouge. */
  private flashGroup(cell: Cell, kind: 'row' | 'col' | 'box', at: Cell) {
    const g = this.add.graphics();
    this.layer!.add(g);
    const s = this.cellSize;
    const { box } = this.sudoku.spec;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid.length; c++) {
        const inGroup = kind === 'row' ? r === cell.r : kind === 'col' ? c === cell.c
          : !!box && Math.floor(r / box.rows) === Math.floor(cell.r / box.rows) && Math.floor(c / box.cols) === Math.floor(cell.c / box.cols);
        if (!inGroup) continue;
        const { x, y } = this.cellPos[r][c];
        g.fillStyle(0xe5484d, 0.22).fillRoundedRect(x - s / 2, y - s / 2, s, s, s * 0.16);
      }
    }
    const { x, y } = this.cellPos[at.r][at.c];
    g.lineStyle(s * 0.08, 0xe5484d, 1).strokeRoundedRect(x - s / 2, y - s / 2, s, s, s * 0.16);
    const fruit = this.placed[at.r][at.c];
    if (fruit) this.tweens.add({ targets: fruit, angle: { from: -14, to: 14 }, duration: 90, yoyo: true, repeat: 5, onComplete: () => fruit.setAngle(0) });
    this.tweens.add({ targets: g, alpha: 0, delay: 1400, duration: 400, onComplete: () => g.destroy() });
  }

  /** Une ligne, une colonne ou un carré complet : ses fruits sautillent. */
  private celebrateGroups(cell: Cell) {
    const n = this.grid.length;
    const { box } = this.sudoku.spec;
    const groups: Cell[][] = [];
    groups.push(Array.from({ length: n }, (_, c) => ({ r: cell.r, c })));
    groups.push(Array.from({ length: n }, (_, r) => ({ r, c: cell.c })));
    if (box) {
      const r0 = Math.floor(cell.r / box.rows) * box.rows, c0 = Math.floor(cell.c / box.cols) * box.cols;
      const cells: Cell[] = [];
      for (let r = r0; r < r0 + box.rows; r++) for (let c = c0; c < c0 + box.cols; c++) cells.push({ r, c });
      groups.push(cells);
    }
    let any = false;
    for (const group of groups) {
      if (!group.every(({ r, c }) => this.grid[r][c] !== -1)) continue;
      any = true;
      group.forEach(({ r, c }, i) => this.time.delayedCall(180 + i * 45, () => {
        const img = this.placed[r][c];
        if (img) this.tweens.add({ targets: img, y: img.y - this.cellSize * 0.14, duration: 130, yoyo: true, ease: 'Sine.easeOut' });
      }));
    }
    if (any) this.time.delayedCall(200, () => Sfx.play('correct'));
  }

  // ---- Aides ----

  private stopHints() {
    this.pulses.forEach((t) => t.stop());
    this.pulses = [];
    this.tray.forEach((t, i) => { if (i !== this.selected) t.setScale(1); });
    this.glow?.clear().setAlpha(1);
    this.guide?.hide();
  }

  /** La case la plus facile brille, et son fruit grossit ; après quatre erreurs, la main montre le geste. */
  private hint() {
    this.stopHints();
    const easy = easiestCell(this.sudoku, this.grid);
    if (!easy || !this.glow) return;
    const { x, y } = this.cellPos[easy.r][easy.c];
    const s = this.cellSize;
    this.glow.lineStyle(s * 0.09, 0xffd23f, 1).strokeRoundedRect(x - s / 2, y - s / 2, s, s, s * 0.16);
    this.glow.fillStyle(0xffd23f, 0.25).fillRoundedRect(x - s / 2, y - s / 2, s, s, s * 0.16);
    this.pulses.push(this.tweens.add({ targets: this.glow, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 }));
    const item = this.tray[easy.fruit];
    this.pulses.push(this.tweens.add({ targets: item, scale: 1.2, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
    if (this.failures >= 4) this.guide.drag(item, { x, y });
    void this.line('LO-13.hint', 'Regarde la case qui brille : un seul fruit peut aller là !');
  }

  private remind() {
    if (this.busy) return;
    this.dino.react('think');
    void app.voice.say(this.prompt());
    this.armIdle([[25000, () => this.remind()]]);
  }

  private line(key: string, fr: string) {
    return app.voice.say([{ text: phrase(() => fr, key), lang: lang() }]);
  }

  // ---- Réussite ----

  private async success() {
    this.busy = true;
    this.clearIdle();
    this.stopHints();
    await this.wait(400);
    // Tous les fruits de la grille font la ola.
    this.placed.flat().forEach((img, i) => img && this.tweens.add({
      targets: img, scale: img.scale * 1.25, duration: 160, yoyo: true, delay: i * 25,
    }));
    if (!this.series) {
      // Mode test : une autre grille du même niveau.
      this.dino.react('cheer');
      Sfx.play('star');
      await this.wait(1500);
      if (this.alive) this.newBoard();
      return;
    }
    const item = this.series.current;
    if (this.failures > 0) this.series.tap({ id: 'miss-0' });
    const outcome = this.series.tap(item.answer);
    if (outcome.kind !== 'correct') return;
    this.updateSteps(outcome.firstTry);
    this.dino.react(outcome.firstTry ? 'dance' : Phaser.Math.RND.pick(SUCCESS_REACTIONS));
    Sfx.play('star');
    await this.wait(300);
    await app.voice.say(item.reinforce);
    if (!this.alive) return;
    await this.wait(300);
    this.series.next();
    if (this.series.finished) {
      goTo(this, 'End', { result: this.series.result, mixed: this.shared });
      return;
    }
    if (sceneOf(this.series.current.game) !== 'Sudoku') {
      goTo(this, sceneOf(this.series.current.game), { series: this.series });
      return;
    }
    this.newBoard();
    await app.voice.say(this.prompt());
    this.armIdle([[20000, () => this.remind()]]);
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
    const show = () => {
      const { size } = this.sudoku?.spec ?? { size: 0 };
      text.setText(`Niveau ${this.testLevel}${size ? ` · ${size}×${size}` : ''}`);
    };
    const change = (d: number) => {
      if (this.busy) return;
      this.testLevel = Math.max(1, Math.min(SUDOKU_LEVELS, this.testLevel! + d));
      this.newBoard();
      show();
    };
    roundButton(this, W / 2 - u * 0.26, y, u * 0.045, 'pk-arrow-left', () => change(-1)).setDepth(6);
    roundButton(this, W / 2 + u * 0.26, y, u * 0.045, 'pk-arrow-right', () => change(1)).setDepth(6);
    this.time.delayedCall(400, show);
  }
}
