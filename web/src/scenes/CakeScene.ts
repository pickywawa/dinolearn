import Phaser from 'phaser';
import { gameById } from '../content/games';
import { app } from '../core/app';
import { vibrate } from '../core/haptics';
import { Music } from '../core/music';
import { Series, sceneOf } from '../core/series';
import { Sfx } from '../core/sfx';
import { CAKE_LEVELS, CakeRound, allEqual, cakeRound, cutStep, fairShare, readCut, readRadial, sectorsFromBounds, sectorsFromCuts, snapRadial, snapToStep } from '../domain/cake';
import { foodImage, mulberry32 } from '../domain/models';
import { Dino, SUCCESS_REACTIONS } from '../dino/Dino';
import type { Speech } from '../content/content';
import { lang, phrase } from '../i18n';
import { Guide } from '../ui/Guide';
import { drawBackdrop } from '../ui/backdrop';
import { FONT, INK, card, roundButton } from '../ui/kit';
import { exitButton, goTo, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

const FRIENDS = ['friend-dragon', 'friend-turtle', 'friend-lizard', 'friend-chick'];
const IMAGES = [...FRIENDS, 'cookie', foodImage('strawberry')];
/** Parfums : glaçage, et sa bordure. */
const FLAVORS = [
  { top: 0xf7a6c8, rim: 0xd9709d, dots: 0xffffff },
  { top: 0x8a5532, rim: 0x5e3720, dots: 0xffd23f },
  { top: 0xfff1d0, rim: 0xe0b860, dots: 0xe5484d },
];
const rad = Phaser.Math.DegToRad;

type Point = { x: number; y: number };
/** Une part de gâteau (secteur, angles en degrés dans le sens des aiguilles d'une montre, 0 = à droite). */
interface Piece { box: Phaser.GameObjects.Container; start: number; size: number; home: Point; plate?: number }
interface Plate { x: number; y: number; r: number; friend?: Phaser.GameObjects.Image; pieces: Piece[]; cookies: Phaser.GameObjects.Image[] }

/**
 * « Partage le gâteau » (dès 3 ans) : partager équitablement, puis la moitié et le quart.
 * Vingt niveaux ; les neuf premiers ont chacun leur façon de jouer :
 * 1. donner une part (déjà coupée) à chaque ami, en la glissant dans son assiette ;
 * 2. toucher l'ami qui a la plus petite part ;
 * 3. couper le gâteau en deux, d'un trait du doigt bien par le milieu ;
 * 4. le couper en quatre (deux traits en croix) ;
 * 5. toucher le gâteau coupé en parts toutes pareilles ;
 * 6. donner la moitié du gâteau à un ami (une ou deux parts selon la découpe), puis le bouton vert ;
 * 7. le quart (ou la moitié d'un gâteau coupé en huit) ;
 * 8. partager des cookies : autant pour chacun ;
 * 9. toucher le gâteau dont on a mangé la moitié (ou le quart).
 * Puis (10 à 20) les mêmes mécaniques avec le tiers, les deux tiers, les trois quarts, et des
 * découpes de plus en plus fines : 3 parts en étoile (traits du milieu au bord), 6 puis 8 parts,
 * des écarts de plus en plus fins à repérer, des gâteaux coupés en 12 (voir `cakeRound`).
 * Après deux erreurs, la main montre le geste. Une série = 4 manches. `testLevel` (lien
 * `?jeu=LO-14&niveau=4`) : manches sans fin à ce niveau, avec un sélecteur de niveau.
 */
export class CakeScene extends BaseScene {
  private shared = false;
  private series?: Series;
  private testLevel?: number;
  private round!: CakeRound;
  private dino!: Dino;
  private guide!: Guide;
  private layer?: Phaser.GameObjects.Container;
  private pieces: Piece[] = [];
  private plates: Plate[] = [];
  private cookies: Phaser.GameObjects.Image[] = [];
  private cake = { x: 0, y: 0, r: 0 };
  private flavor = FLAVORS[0];
  private cuts: number[] = [];
  private knife?: Phaser.GameObjects.Graphics;
  private cutFrom?: Point;
  private dragging?: { kind: 'piece'; piece: Piece; dx: number; dy: number } | { kind: 'cookie'; cookie: Phaser.GameObjects.Image; dx: number; dy: number };
  private failures = 0;
  private busy = false;
  private steps: Phaser.GameObjects.Image[] = [];
  private playMs = 0;

  constructor() {
    super('Cake');
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
    this.testLevel = data.testLevel ? Math.min(CAKE_LEVELS, data.testLevel) : undefined;
    this.playMs = 0;
    this.layer = undefined;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.savePlayTime());
    drawBackdrop(this, 'meadow');
    if (!app.awake) {
      this.input.once('pointerdown', () => {
        app.voice.unlock();
        Sfx.unlock();
        Music.unlock();
        app.awake = true;
      });
    }
    const game = gameById('LO-14');
    this.series = this.testLevel ? undefined : data.series ?? new Series(game, app.progress, app.rng);
    exitButton(this, () => this.series?.abandon());
    if (this.series) this.drawSteps();
    else this.levelPicker();
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.dino = new Dino(this, W * 0.1, H * 0.98, u * 0.4);
    this.guide = new Guide(this, u * 0.13);
    this.setupInput();
    const keys = IMAGES.filter((k) => !this.textures.exists(k));
    const begin = () => this.run(async () => {
      this.newRound();
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

  // ---- Manche ----

  private seed = 0;

  private get level() {
    return this.testLevel ?? (this.series?.current.show?.kind === 'cake' ? this.series.current.show.level : 1);
  }

  /** Mode test : la consigne de la manche tirée. */
  private testPrompt: Speech[] = [];

  private prompt() {
    return this.series ? this.series.current.prompt : this.testPrompt;
  }

  private newRound() {
    const show = this.series?.current.show;
    if (this.testLevel) {
      // La consigne dépend de la manche : on la tire comme dans une série.
      const built = gameById('LO-14').build({ id: `LO-14:${this.level}:0`, level: this.level }, this.level, app.rng);
      this.seed = built.show?.kind === 'cake' ? built.show.seed : 1;
      this.testPrompt = built.prompt;
    } else this.seed = show?.kind === 'cake' ? show.seed : 1;
    this.round = cakeRound(this.level, mulberry32(this.seed));
    this.flavor = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
    this.failures = 0;
    this.busy = false;
    this.cuts = [];
    this.dragging = undefined;
    this.cutFrom = undefined;
    this.guide.hide();
    this.layer?.destroy();
    this.layer = this.add.container(0, 0).setDepth(2);
    this.pieces = [];
    this.plates = [];
    this.cookies = [];
    const { width: W, height: H } = this.scale;
    const r = this.round;
    switch (r.kind) {
      case 'give':
        this.placeCake(W * 0.43, H * 0.56, H * 0.25);
        this.addFriends(r.friends);
        this.cutInto(Array.from({ length: r.friends }, () => 360 / r.friends), true);
        break;
      case 'cut':
        this.placeCake(W * 0.43, H * 0.56, H * 0.28);
        this.addFriends(r.parts);
        this.cutInto([360], false);
        this.knife = this.add.graphics().setDepth(5);
        this.layer.add(this.knife);
        break;
      case 'fraction':
        this.placeCake(W * 0.4, H * 0.56, H * 0.26);
        this.addFriends(1, H * 0.2);
        this.cutInto(Array.from({ length: r.parts }, () => 360 / r.parts), true);
        this.checkButton(this.plates[0].x, H * 0.86);
        break;
      case 'cookies':
        this.addFriends(r.friends);
        this.drawCookies(r.total);
        this.checkButton(W * 0.43, H * 0.88);
        break;
      case 'smallest':
        this.drawSmallest(r.slices);
        break;
      case 'equalPick':
        this.drawCakesRow(r.cakes.map((sizes) => ({ sizes })));
        break;
      case 'findFraction':
        this.drawCakesRow(r.taken.map((taken) => ({ sizes: [360 - taken, taken], eaten: 1 })));
        break;
    }
  }

  // ---- Dessin ----

  private placeCake(x: number, y: number, r: number) {
    this.cake = { x, y, r };
    // Le grand plat sous le gâteau.
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12).fillEllipse(x, y + r * 0.1, r * 2.5, r * 2.3);
    g.fillStyle(0xffffff, 1).fillCircle(x, y, r * 1.18);
    g.lineStyle(r * 0.04, 0xd8e3ef, 1).strokeCircle(x, y, r * 1.1);
    this.layer!.add(g);
  }

  /** Dessine une part (secteur) dans `g`, centrée en (0, 0). */
  private drawSlice(g: Phaser.GameObjects.Graphics, r: number, start: number, size: number, flavor = this.flavor) {
    const a0 = rad(start), a1 = rad(start + size);
    const full = size >= 359.9;
    // Le gâteau vu de dessus : bordure (la croûte), glaçage, petits points de crème.
    g.fillStyle(flavor.rim, 1);
    if (full) g.fillCircle(0, 0, r);
    else g.slice(0, 0, r, a0, a1, false).fillPath();
    g.fillStyle(flavor.top, 1);
    if (full) g.fillCircle(0, 0, r * 0.88);
    else g.slice(0, 0, r * 0.88, a0, a1, false).fillPath();
    if (!full) g.lineStyle(Math.max(2, r * 0.025), 0xffffff, 0.9).beginPath().moveTo(0, 0).lineTo(Math.cos(a0) * r, Math.sin(a0) * r)
      .moveTo(0, 0).lineTo(Math.cos(a1) * r, Math.sin(a1) * r).strokePath();
    g.fillStyle(flavor.dots, 0.95);
    for (let a = start + 8; a < start + size - 4; a += 16) g.fillCircle(Math.cos(rad(a)) * r * 0.76, Math.sin(rad(a)) * r * 0.76, r * 0.035);
  }

  /** Une part de gâteau (container centré au centre du gâteau), avec une fraise si elle est assez grande. */
  private makePiece(start: number, size: number, r: number, x: number, y: number) {
    const g = this.add.graphics();
    this.drawSlice(g, r, start, size);
    const box = this.add.container(x, y, [g]);
    if (size >= 45) {
      const mid = rad(start + size / 2);
      const berry = this.add.image(Math.cos(mid) * r * 0.5, Math.sin(mid) * r * 0.5, foodImage('strawberry'));
      berry.setScale((r * 0.26) / berry.width);
      box.add(berry);
    }
    this.layer!.add(box);
    return box;
  }

  /** Coupe le gâteau en parts de ces tailles ; `spread` : les parts s'écartent un peu (prêtes à être prises). */
  private cutInto(sizes: number[], spread: boolean, first = -90) {
    this.pieces.forEach((p) => p.box.destroy());
    const { x, y, r } = this.cake;
    let start = first;
    this.pieces = sizes.map((size) => {
      const mid = rad(start + size / 2);
      const gap = spread && size < 360 ? r * 0.06 : 0;
      const home = { x: x + Math.cos(mid) * gap, y: y + Math.sin(mid) * gap };
      const piece: Piece = { box: this.makePiece(start, size, r, home.x, home.y), start, size, home };
      start += size;
      return piece;
    });
  }

  /** Les amis, à droite, chacun derrière son assiette. */
  private addFriends(n: number, plateR?: number) {
    const { width: W, height: H } = this.scale;
    const top = H * 0.2, bottom = H * 0.96;
    // Plus de 4 amis (gâteau en 6 ou 8) : deux colonnes, l'ami au-dessus de son assiette.
    const two = n > 4;
    const rows = two ? Math.ceil(n / 2) : n;
    const step = (bottom - top) / rows;
    const r = plateR ?? (two ? Math.min(step * 0.3, W * 0.05) : Math.min(step * 0.36, H * 0.1));
    for (let i = 0; i < n; i++) {
      const row = two ? Math.floor(i / 2) : i;
      const y = n === 1 ? H * 0.5 : top + step * (row + 0.5) + (two ? step * 0.14 : 0);
      const px = two ? W * (i % 2 ? 0.9 : 0.75) : W * 0.86, fx = W * 0.7;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12).fillEllipse(px, y + r * 0.12, r * 2.3, r * 2.1);
      g.fillStyle(0xffffff, 1).fillCircle(px, y, r);
      g.lineStyle(r * 0.06, 0xbfd3ea, 1).strokeCircle(px, y, r * 0.82);
      const friend = this.add.image(n === 1 || two ? px : fx, n === 1 ? y - r * 1.55 : two ? y - r * 1.25 : y, FRIENDS[i % FRIENDS.length]);
      friend.setScale((two ? r * 0.85 : Math.min(step * 0.7, H * 0.16, r * 1.4)) / friend.width);
      this.layer!.add([g, friend]);
      this.plates.push({ x: px, y, r, friend, pieces: [], cookies: [] });
    }
  }

  private drawCookies(total: number) {
    const { width: W, height: H } = this.scale;
    const cx = W * 0.43, cy = H * 0.52;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12).fillEllipse(cx, cy + H * 0.03, W * 0.4, H * 0.5);
    g.fillStyle(0xf6e7c8, 1).fillEllipse(cx, cy, W * 0.38, H * 0.46);
    g.lineStyle(H * 0.012, 0xd9b77a, 1).strokeEllipse(cx, cy, W * 0.35, H * 0.42);
    this.layer!.add(g);
    const cols = Math.ceil(Math.sqrt(total * 1.5));
    const rows = Math.ceil(total / cols);
    const size = Math.min((W * 0.3) / cols, (H * 0.36) / rows) * 0.9;
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols), inRow = Math.min(cols, total - row * cols);
      const x = cx + ((i % cols) - (inRow - 1) / 2) * size * 1.1;
      const y = cy + (row - (rows - 1) / 2) * size * 1.1;
      const cookie = this.add.image(x, y, 'cookie').setAngle(Phaser.Math.Between(-30, 30));
      cookie.setScale(size / cookie.width).setData('home', { x, y }).setData('size', size);
      this.layer!.add(cookie);
      this.cookies.push(cookie);
    }
  }

  /** Niveau 2 : trois amis avec leur part ; on touche celui qui en a le moins. */
  private drawSmallest(slices: number[]) {
    const { width: W, height: H } = this.scale;
    const n = slices.length;
    const r = Math.min(W * (n > 3 ? 0.075 : 0.1), H * 0.2);
    slices.forEach((size, i) => {
      const x = W * (0.32 + (i * 0.56) / (n - 1)), y = H * 0.66;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12).fillEllipse(x, y + r * 0.12, r * 2.5, r * 2.2);
      g.fillStyle(0xffffff, 1).fillCircle(x, y, r * 1.15);
      this.layer!.add(g);
      // La part posée au milieu de l'assiette (son centre de gravité au centre).
      const start = -90 - size / 2;
      const shift = this.centroid(size, r);
      const box = this.makePiece(start, size, r, x, y + shift);
      const friend = this.add.image(x, y - r * 1.75, FRIENDS[i % FRIENDS.length]);
      friend.setScale((r * 1.3) / friend.width);
      this.layer!.add(friend);
      this.plates.push({ x, y, r: r * 1.15, friend, pieces: [{ box, start, size, home: { x, y } }], cookies: [] });
      this.tapZone(x, y - r * 0.4, r * 2.4, r * 3.4, () => this.pick(i));
    });
  }

  /** Niveaux 5 et 9 : trois gâteaux côte à côte (`eaten` : la part déjà mangée, laissée vide). */
  private drawCakesRow(cakes: { sizes: number[]; eaten?: number }[]) {
    const { width: W, height: H } = this.scale;
    const r = Math.min(W * 0.1, H * 0.21);
    cakes.forEach(({ sizes, eaten }, i) => {
      const x = W * (0.36 + i * 0.24), y = H * 0.56;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12).fillEllipse(x, y + r * 0.12, r * 2.6, r * 2.4);
      g.fillStyle(0xffffff, 1).fillCircle(x, y, r * 1.18);
      g.lineStyle(r * 0.04, 0xd8e3ef, 1).strokeCircle(x, y, r * 1.1);
      this.layer!.add(g);
      let start = -90;
      sizes.forEach((size, k) => {
        if (k !== eaten) this.makePiece(start, size, r, x, y);
        else {
          // La part mangée : quelques miettes.
          const crumbs = this.add.graphics();
          crumbs.fillStyle(this.flavor.rim, 0.6);
          for (let c = 0; c < 6; c++) {
            const a = rad(start + size * (0.15 + 0.7 * ((c * 37) % 10) / 10)), d = r * (0.3 + ((c * 53) % 10) / 16);
            crumbs.fillCircle(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.03);
          }
          this.layer!.add(crumbs);
        }
        start += size;
      });
      this.tapZone(x, y, r * 2.4, r * 2.4, () => this.pick(i));
      this.plates.push({ x, y, r, pieces: [], cookies: [] });
    });
  }

  /** Distance du centre au centre de gravité d'une part (pour la poser au milieu d'une assiette). */
  private centroid(size: number, r: number) {
    if (size >= 359) return 0;
    const half = rad(size / 2);
    return (2 * r * Math.sin(half)) / (3 * half);
  }

  private tapZone(x: number, y: number, w: number, h: number, onTap: () => void) {
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerup', onTap);
    this.layer!.add(zone);
  }

  private checkButton(x: number, y: number) {
    const r = unit(this) * 0.065;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillCircle(0, r * 0.1, r);
    g.fillStyle(0x30a46c, 1).fillCircle(0, 0, r);
    g.lineStyle(r * 0.08, 0xffffff, 1).strokeCircle(0, 0, r * 0.96);
    g.lineStyle(r * 0.2, 0xffffff, 1).beginPath().moveTo(-r * 0.42, 0).lineTo(-r * 0.1, r * 0.32).lineTo(r * 0.45, -r * 0.3).strokePath();
    const button = this.add.container(x, y, [g]).setSize(r * 2, r * 2).setInteractive({ useHandCursor: true });
    button.on('pointerup', () => {
      if (this.busy) return;
      this.tweens.add({ targets: button, scale: 0.88, duration: 90, yoyo: true });
      Sfx.play('pop');
      this.check();
    });
    this.tweens.add({ targets: button, scale: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.layer!.add(button);
  }

  // ---- Doigt : glisser des parts, des cookies ; couper ----

  private setupInput() {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.busy || !this.layer) return;
      const kind = this.round.kind;
      if (kind === 'cut') {
        this.cutFrom = { x: p.worldX, y: p.worldY };
        return;
      }
      if (kind === 'give' || kind === 'fraction') {
        const piece = [...this.pieces].reverse().find((pc) => this.pieceHit(pc, p.worldX, p.worldY));
        if (!piece) return;
        // Une part déjà dans l'assiette (moitié, quart) : toucher la reprend.
        if (piece.plate !== undefined && kind === 'fraction') {
          this.returnPiece(piece);
          return;
        }
        if (piece.plate !== undefined) return;
        this.startDrag({ kind: 'piece', piece, dx: piece.box.x - p.worldX, dy: piece.box.y - p.worldY });
        this.layer.bringToTop(piece.box);
        this.tweens.add({ targets: piece.box, scale: 1.06, duration: 100 });
        return;
      }
      if (kind === 'cookies') {
        const cookie = [...this.cookies].reverse().find((c) => Math.hypot(c.x - p.worldX, c.y - p.worldY) < c.displayWidth * 0.6);
        if (!cookie) return;
        const plate = this.plates.findIndex((pl) => pl.cookies.includes(cookie));
        if (plate >= 0) this.removeCookie(plate, cookie);
        this.startDrag({ kind: 'cookie', cookie, dx: cookie.x - p.worldX, dy: cookie.y - p.worldY });
        this.layer.bringToTop(cookie);
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.cutFrom && this.knife && p.isDown) {
        this.knife.clear();
        this.dashed(this.knife, this.cutFrom, { x: p.worldX, y: p.worldY }, 0xffffff);
      }
      const d = this.dragging;
      if (!d) return;
      const target = d.kind === 'piece' ? d.piece.box : d.cookie;
      target.setPosition(p.worldX + d.dx, p.worldY + d.dy);
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.cutFrom) {
        const from = this.cutFrom;
        this.cutFrom = undefined;
        this.knife?.clear();
        this.onCut(from, { x: p.worldX, y: p.worldY });
        return;
      }
      const d = this.dragging;
      this.dragging = undefined;
      if (!d) return;
      if (d.kind === 'piece') this.dropPiece(d.piece);
      else this.dropCookie(d.cookie);
    });
  }

  private startDrag(d: NonNullable<CakeScene['dragging']>) {
    this.dragging = d;
    this.clearIdle();
    this.guide.hide();
    Sfx.play('pop');
  }

  private pieceHit(piece: Piece, x: number, y: number) {
    const k = piece.box.scale;
    const dx = (x - piece.box.x) / k, dy = (y - piece.box.y) / k;
    if (Math.hypot(dx, dy) > this.cake.r * 1.05) return false;
    if (piece.size >= 359) return true;
    const a = ((Phaser.Math.RadToDeg(Math.atan2(dy, dx)) - piece.start) % 360 + 360) % 360;
    return a <= piece.size;
  }

  private plateAt(x: number, y: number) {
    return this.plates.findIndex((pl) => Math.hypot(pl.x - x, pl.y - y) < pl.r * 1.5);
  }

  /** Où est la part pour l'assiette : son centre de gravité, ou (moitié, quart) sa place dans le gâteau. */
  private dropPiece(piece: Piece) {
    const mid = rad(piece.start + piece.size / 2);
    const c = this.centroid(piece.size, this.cake.r) * piece.box.scale;
    const cx = piece.box.x + Math.cos(mid) * c, cy = piece.box.y + Math.sin(mid) * c;
    const index = this.plateAt(cx, cy) >= 0 ? this.plateAt(cx, cy) : this.plateAt(this.input.activePointer.worldX, this.input.activePointer.worldY);
    if (index < 0) {
      this.tweens.add({ targets: piece.box, x: piece.home.x, y: piece.home.y, scale: 1, duration: 220, ease: 'Quad.easeOut' });
      return;
    }
    const plate = this.plates[index];
    if (this.round.kind === 'give' && plate.pieces.length) {
      this.mistake('LO-14.already', 'Il a déjà sa part ! Donne-la à un autre ami.');
      this.tweens.add({ targets: piece.box, x: piece.home.x, y: piece.home.y, scale: 1, duration: 260, ease: 'Quad.easeOut' });
      return;
    }
    this.putOnPlate(piece, index);
    Sfx.play('pop');
    vibrate(15);
    if (this.round.kind === 'give' && this.plates.every((pl) => pl.pieces.length === 1)) this.run(() => this.share());
    else this.armIdle([[20000, () => this.remind()]]);
  }

  private putOnPlate(piece: Piece, index: number, duration = 240) {
    const plate = this.plates[index];
    piece.plate = index;
    plate.pieces.push(piece);
    const single = this.round.kind !== 'fraction';
    const k = single ? (plate.r * 1.25) / this.cake.r : (plate.r * 0.9) / this.cake.r;
    const mid = rad(piece.start + piece.size / 2);
    const c = single ? this.centroid(piece.size, this.cake.r) * k : 0;
    return new Promise<void>((resolve) => this.tweens.add({
      targets: piece.box, x: plate.x - Math.cos(mid) * c, y: plate.y - Math.sin(mid) * c, scale: k, duration, ease: 'Quad.easeOut',
      onComplete: () => resolve(),
    }));
  }

  private returnPiece(piece: Piece) {
    const plate = this.plates[piece.plate!];
    plate.pieces = plate.pieces.filter((p) => p !== piece);
    piece.plate = undefined;
    Sfx.play('pop');
    this.tweens.add({ targets: piece.box, x: piece.home.x, y: piece.home.y, scale: 1, duration: 240, ease: 'Quad.easeOut' });
  }

  private dropCookie(cookie: Phaser.GameObjects.Image) {
    const index = this.plateAt(cookie.x, cookie.y);
    if (index < 0) {
      const home = cookie.getData('home') as Point;
      this.tweens.add({ targets: cookie, x: home.x, y: home.y, duration: 220, ease: 'Quad.easeOut' });
      return;
    }
    this.plates[index].cookies.push(cookie);
    Sfx.play('pop');
    vibrate(15);
    this.arrangeCookies(index);
    this.armIdle([[20000, () => this.remind()]]);
  }

  private removeCookie(index: number, cookie: Phaser.GameObjects.Image) {
    this.plates[index].cookies = this.plates[index].cookies.filter((c) => c !== cookie);
    this.arrangeCookies(index);
  }

  /** Les cookies d'une assiette, rangés en petit cercle. */
  private arrangeCookies(index: number) {
    const plate = this.plates[index];
    const n = plate.cookies.length;
    plate.cookies.forEach((cookie, i) => {
      const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
      const d = n === 1 ? 0 : plate.r * 0.45;
      const size = plate.r * (n > 4 ? 0.62 : 0.75);
      this.tweens.add({ targets: cookie, x: plate.x + Math.cos(a) * d, y: plate.y + Math.sin(a) * d, scale: size / cookie.width, duration: 200 });
    });
  }

  private dashed(g: Phaser.GameObjects.Graphics, a: Point, b: Point, color: number) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const step = this.cake.r * 0.08;
    g.lineStyle(Math.max(3, this.cake.r * 0.03), color, 1);
    for (let t = 0; t < len; t += step * 2) {
      const t2 = Math.min(len, t + step);
      g.lineBetween(a.x + ((b.x - a.x) * t) / len, a.y + ((b.y - a.y) * t) / len, a.x + ((b.x - a.x) * t2) / len, a.y + ((b.y - a.y) * t2) / len);
    }
  }

  // ---- Couper ----

  private onCut(from: Point, to: Point) {
    const round = this.round;
    if (round.kind !== 'cut' || this.busy) return;
    const { x, y, r } = this.cake;
    const miss = (key: string, fr: string) => {
      // Le trait raté reste un instant en rouge.
      const line = this.add.graphics().setDepth(5);
      this.dashed(line, from, to, 0xe5484d);
      this.tweens.add({ targets: line, alpha: 0, delay: 900, duration: 300, onComplete: () => line.destroy() });
      void this.mistake(key, fr);
    };
    let angle: number;
    if (round.radial) {
      // En étoile : du milieu jusqu'au bord.
      const cut = readRadial(from.x, from.y, to.x, to.y, x, y, r);
      if (!cut.valid) return;
      this.clearIdle();
      this.guide.hide();
      if (!cut.fromCenter) {
        miss('LO-14.fromCenter', 'Pars bien du milieu du gâteau, et va jusqu\'au bord !');
        return;
      }
      angle = this.cuts.length ? snapRadial(this.cuts[0], cut.angle, round.parts) : cut.angle;
      if (this.cuts.some((a) => Math.abs(((angle - a + 540) % 360) - 180) > 170)) return;
    } else {
      const cut = readCut(from.x, from.y, to.x, to.y, x, y, r);
      if (!cut.crosses) return;
      this.clearIdle();
      this.guide.hide();
      if (!cut.centered) {
        miss('LO-14.offCenter', 'Oh, les parts ne seraient pas pareilles ! Coupe bien par le milieu du gâteau.');
        return;
      }
      const { step, tolerance } = cutStep(round.parts);
      angle = this.cuts.length ? snapToStep(this.cuts[0], cut.angle, step, tolerance) : cut.angle;
      if (this.cuts.some((a) => Math.abs(a - angle) < 8 || Math.abs(a - angle) > 172)) return;
    }
    this.cuts.push(angle);
    Sfx.play('whoosh');
    vibrate(20);
    // Le gâteau se coupe : les parts suivent les traits.
    const sectors = round.radial ? sectorsFromBounds(this.cuts) : sectorsFromCuts(this.cuts);
    this.redrawCut(sectors);
    const done = round.radial ? this.cuts.length >= round.parts : this.cuts.length * 2 >= round.parts;
    if (done) this.run(() => this.serveCut(sectors.map((sc) => sc.size)));
    else this.armIdle([[20000, () => this.remind()]]);
  }

  private redrawCut(sectors: { start: number; size: number }[]) {
    this.pieces.forEach((p) => p.box.destroy());
    const { x, y, r } = this.cake;
    // Un seul trait en étoile : le gâteau n'est pas encore en deux, on montre le trait.
    if (sectors.length === 1) {
      const piece = this.makePiece(sectors[0].start, 359.99, r, x, y);
      const mark = this.add.graphics();
      const a = rad(sectors[0].start);
      mark.lineStyle(Math.max(2, r * 0.025), 0xffffff, 0.95).lineBetween(0, 0, Math.cos(a) * r, Math.sin(a) * r);
      piece.add(mark);
      this.pieces = [{ box: piece, start: sectors[0].start, size: 360, home: { x, y } }];
      return;
    }
    this.pieces = sectors.map(({ start, size }) => {
      const mid = rad(start + size / 2);
      const home = { x: x + Math.cos(mid) * r * 0.05, y: y + Math.sin(mid) * r * 0.05 };
      return { box: this.makePiece(start, size, r, home.x, home.y), start, size, home };
    });
  }

  /** Les parts coupées partent dans les assiettes ; les amis comparent. */
  private async serveCut(sizes: number[]) {
    this.busy = true;
    await this.wait(400);
    await Promise.all(this.pieces.map((piece, i) => this.putOnPlate(piece, i % this.plates.length, 450)));
    if (allEqual(sizes)) {
      await this.success();
      return;
    }
    // Pas pareil : ceux qui ont une petite part font la moue, puis on recommence.
    const min = Math.min(...sizes);
    this.pieces.forEach((piece) => {
      const friend = this.plates[piece.plate!].friend;
      if (piece.size <= min + 1 && friend) this.tweens.add({ targets: friend, angle: { from: -12, to: 12 }, duration: 100, yoyo: true, repeat: 5, onComplete: () => friend.setAngle(0) });
    });
    if (this.round.kind === 'cut' && this.round.parts === 4) await this.mistake('LO-14.unfair', 'Pas juste ! Les parts ne sont pas pareilles : coupe en croix, bien droit !');
    else await this.mistake('LO-14.unfairEven', 'Pas juste ! Les parts ne sont pas pareilles : écarte bien tes traits, tous pareils !');
    if (!this.alive) return;
    this.cuts = [];
    this.plates.forEach((pl) => { pl.pieces = []; });
    this.cutInto([360], false);
    this.busy = false;
    if (this.failures >= 2) this.hint();
  }

  // ---- Vérifier ----

  /** Bouton vert : la moitié ou le quart, ou les cookies. */
  private check() {
    const r = this.round;
    if (r.kind === 'fraction') {
      const given = this.plates[0].pieces.length;
      if (given === r.need) this.run(() => this.success());
      else if (given < r.need) this.mistake('LO-14.tooFew', 'Ce n\'est pas encore ça ! Regarde bien combien de parts il faut.');
      else this.mistake('LO-14.tooMany', 'Oh, c\'est trop ! Touche une part dans l\'assiette pour la reprendre.');
    } else if (r.kind === 'cookies') {
      const verdict = fairShare(this.plates.map((p) => p.cookies.length), r.total);
      if (verdict === 'ok') this.run(() => this.success());
      else if (verdict === 'left') this.mistake('LO-14.left', 'Il reste des cookies à partager !');
      else this.mistake('LO-14.uneven', 'Pas pareil ! Compte bien les cookies de chaque ami.');
    }
  }

  /** Niveaux à toucher : le bon ami, le bon gâteau. */
  private pick(index: number) {
    const r = this.round;
    if (this.busy || (r.kind !== 'smallest' && r.kind !== 'equalPick' && r.kind !== 'findFraction')) return;
    this.clearIdle();
    this.guide.hide();
    if (index === r.answer) {
      const target = this.plates[index];
      Sfx.play('correct');
      this.tweens.add({ targets: [target.friend, ...target.pieces.map((p) => p.box)].filter(Boolean), y: '-=14', duration: 150, yoyo: true, repeat: 1 });
      this.run(() => this.success());
      return;
    }
    const plate = this.plates[index];
    const target = plate.friend ?? plate.pieces[0]?.box;
    if (target) this.tweens.add({ targets: target, angle: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => (target as Phaser.GameObjects.Image).setAngle(0) });
    this.mistake('LO-14.wrongPick', 'Non, regarde bien la taille des parts !');
  }

  /** Partage fini (niveau 1) : tout le monde a sa part. */
  private async share() {
    this.busy = true;
    await this.wait(300);
    await this.success();
  }

  private mistake(key: string, fr: string): Promise<void> {
    this.failures++;
    Sfx.play('wrong');
    vibrate([30, 40, 30]);
    this.dino.react('oops');
    return this.line(key, fr).then(() => {
      if (!this.alive || this.busy) return;
      if (this.failures >= 2) this.hint();
      this.armIdle([[20000, () => this.remind()]]);
    });
  }

  /** La main montre le bon geste. */
  private hint() {
    const r = this.round;
    const { x, y, r: R } = this.cake;
    void this.line('LO-14.hint', 'Regarde bien, la main te montre !');
    if (r.kind === 'cut' && r.radial) {
      // Le prochain trait en étoile, du milieu vers le bord.
      const a = rad(this.cuts.length ? this.cuts[0] + (360 / r.parts) * this.cuts.length : -90);
      this.guide.drag({ x, y }, { x: x + Math.cos(a) * R * 1.1, y: y + Math.sin(a) * R * 1.1 });
    } else if (r.kind === 'cut') {
      const a = rad(this.cuts.length ? this.cuts[0] + (360 / r.parts) * this.cuts.length : 0);
      this.guide.drag({ x: x - Math.cos(a) * R * 1.2, y: y - Math.sin(a) * R * 1.2 }, { x: x + Math.cos(a) * R * 1.2, y: y + Math.sin(a) * R * 1.2 });
    } else if (r.kind === 'give') {
      const piece = this.pieces.find((p) => p.plate === undefined);
      const plate = this.plates.find((p) => !p.pieces.length);
      if (piece && plate) this.guide.drag(this.pieceCenter(piece), plate);
    } else if (r.kind === 'fraction') {
      const plate = this.plates[0];
      const piece = this.pieces.find((p) => p.plate === undefined);
      if (plate.pieces.length < r.need && piece) this.guide.drag(this.pieceCenter(piece), plate);
      else if (plate.pieces.length > r.need) this.guide.tap(this.pieceCenter(plate.pieces[0]));
    } else if (r.kind === 'cookies') {
      const loose = this.cookies.find((c) => !this.plates.some((p) => p.cookies.includes(c)));
      const fewest = [...this.plates].sort((a, b) => a.cookies.length - b.cookies.length)[0];
      if (loose) this.guide.drag(loose, fewest);
    } else {
      const plate = this.plates[r.answer];
      this.guide.tap({ x: plate.x, y: plate.y });
    }
  }

  private pieceCenter(piece: Piece): Point {
    const mid = rad(piece.start + piece.size / 2);
    const c = this.centroid(piece.size, this.cake.r) * piece.box.scale;
    return { x: piece.box.x + Math.cos(mid) * c, y: piece.box.y + Math.sin(mid) * c };
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
    this.guide.hide();
    // Les amis mangent : leurs parts disparaissent.
    Sfx.play('chomp');
    this.plates.forEach((pl, i) => {
      if (pl.friend) this.tweens.add({ targets: pl.friend, y: pl.friend.y - 16, duration: 160, yoyo: true, repeat: 1, delay: i * 80 });
    });
    if (!this.series) {
      this.dino.react('cheer');
      Sfx.play('star');
      await this.line('LO-14.yes', 'Miam ! Tout le monde a la même part, c\'est juste !');
      await this.wait(500);
      if (!this.alive) return;
      this.newRound();
      await app.voice.say(this.prompt());
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
    if (sceneOf(this.series.current.game) !== 'Cake') {
      goTo(this, sceneOf(this.series.current.game), { series: this.series });
      return;
    }
    this.newRound();
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

  /** Mode test : « ◀ Niveau 4 ▶ » en haut, pour changer de niveau. */
  private levelPicker() {
    const { width: W } = this.scale;
    const u = unit(this);
    const y = u * 0.1;
    card(this, W / 2, y, u * 0.5, u * 0.11, '#ffffff', '#dfe8f3');
    const text = this.add.text(W / 2, y, '', { fontFamily: FONT, fontSize: `${Math.round(u * 0.05)}px`, color: INK, fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(6);
    const show = () => text.setText(`Niveau ${this.testLevel}`);
    show();
    const change = (d: number) => {
      if (this.busy) return;
      this.testLevel = Math.max(1, Math.min(CAKE_LEVELS, this.testLevel! + d));
      show();
      this.newRound();
      void app.voice.say(this.prompt());
    };
    roundButton(this, W / 2 - u * 0.21, y, u * 0.045, 'pk-arrow-left', () => change(-1)).setDepth(6);
    roundButton(this, W / 2 + u * 0.21, y, u * 0.045, 'pk-arrow-right', () => change(1)).setDepth(6);
  }
}
