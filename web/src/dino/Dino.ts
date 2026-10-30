import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { itemById, itemTexture } from '../content/items';
import { PART_RESOLUTION, colorSuffix } from './parts';

export type DinoReaction =
  | 'happy' | 'cheer' | 'dance' | 'oops' | 'think' | 'eat' | 'levelUp' | 'tickle'
  | 'wave' | 'spin' | 'yawn' | 'roar' | 'lookAround' | 'hop'
  | 'burp' | 'fart' | 'growl' | 'beg' | 'gape';

/** Petites animations jouées au hasard quand le dino attend. */
const IDLE_FUN: DinoReaction[] = ['wave', 'yawn', 'roar', 'lookAround', 'hop', 'spin'];

const S = 1 / PART_RESOLUTION;
const MOUTHS = ['dino-mouth-open', 'dino-mouth-wide', 'dino-mouth-o', 'dino-mouth-open'];

/**
 * Le dino animé : pièces SVG assemblées dans des conteneurs Phaser et
 * animées par les tweens de Phaser (respiration, clignements, bouche qui
 * parle au rythme de la voix, réactions, bras qui montre où toucher).
 * L'origine du conteneur est entre les pieds du dino ; hauteur ≈ 500 unités.
 */
export class Dino extends Phaser.GameObjects.Container {
  private rig: Phaser.GameObjects.Container;
  private head: Phaser.GameObjects.Container;
  private body_: Phaser.GameObjects.Image;
  private tail: Phaser.GameObjects.Image;
  private armL: Phaser.GameObjects.Image;
  private armR: Phaser.GameObjects.Image;
  private eyes: Phaser.GameObjects.Image[];
  private mouth: Phaser.GameObjects.Image;
  private belly: Phaser.GameObjects.Graphics;
  private bellyFill: number | null = null;
  private eyeMode: 'open' | 'happy' | 'closed' = 'open';
  private talkTimer?: Phaser.Time.TimerEvent;
  /** Vrai dès que la voix signale ses mots : la bouche suit alors chaque mot. */
  private wordSync = false;
  private wordTimers: Phaser.Time.TimerEvent[] = [];
  private busy = false;
  private unsubscribe: (() => void)[] = [];
  private accessories: Phaser.GameObjects.Image[] = [];

  static readonly HEIGHT = 500;

  /** `color` : couleur du dino (0 à 9), par défaut celle de l'enfant qui joue. */
  constructor(scene: Phaser.Scene, x: number, y: number, height: number, color = app.progress.color) {
    super(scene, x, y);
    this.rig = scene.add.container(0, 0);
    this.add(this.rig);

    const img = (key: string, px: number, py: number, ox = 0.5, oy = 0.5) =>
      scene.add.image(px, py, key).setOrigin(ox, oy).setScale(S);

    const c = colorSuffix(color);
    this.tail = img(`dino-tail${c}`, 80, -120, 0.08, 0.72);
    const legL = img(`dino-leg${c}`, -62, -36);
    const legR = img(`dino-leg${c}`, 62, -36).setFlipX(true);
    this.body_ = img(`dino-body${c}`, 0, -135);
    this.belly = scene.add.graphics();
    this.armL = img(`dino-arm${c}`, -96, -190, 0.4, 0.12);
    this.armR = img(`dino-arm${c}`, 96, -190, 0.4, 0.12).setFlipX(true);

    this.head = scene.add.container(0, -250);
    const headImg = img(`dino-head${c}`, 0, 0, 0.5, 0.85);
    this.eyes = [img('dino-eye', -52, -112), img('dino-eye', 52, -112)];
    this.mouth = img('dino-mouth-smile', 0, -40, 0.5, 0.3);
    this.head.add([headImg, ...this.eyes, this.mouth]);

    this.rig.add([this.tail, legL, legR, this.body_, this.belly, this.armL, this.armR, this.head]);
    this.dress(app.progress.collection.worn);
    this.setHeight(height);
    scene.add.existing(this);

    this.startIdle();
    this.unsubscribe.push(
      app.voice.onTalk((talking) => this.setTalking(talking)),
      app.voice.onBoundary((ms) => this.sayWord(ms)),
    );
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.unsubscribe.forEach((fn) => fn());
      this.talkTimer?.remove();
      this.clearWordTimers();
    });
    if (app.voice.talking) this.setTalking(true);
  }

  /**
   * Habille le dino avec ses objets : chapeaux et lunettes dans la tête (ils
   * bougent avec elle), capes et ailes derrière le corps, le reste devant.
   */
  dress(ids: readonly string[]) {
    this.accessories.forEach((a) => a.destroy());
    this.accessories = [];
    for (const id of ids) {
      const item = itemById(id);
      if (!item || !this.scene.textures.exists(itemTexture(id))) continue;
      for (const x of item.mirror !== undefined ? [item.x, item.mirror] : [item.x]) {
        const img = this.scene.add.image(x, item.y, itemTexture(id)).setAngle(item.angle ?? 0);
        img.setScale(item.w / img.width).setFlipX(item.mirror !== undefined && x === item.mirror);
        if (item.parent === 'head') this.head.add(img);
        else if (item.slot === 'back') this.rig.addAt(img, 0);
        else this.rig.add(img);
        this.accessories.push(img);
      }
    }
  }

  /** Le dino s'endort : yeux fermés et petits « z » qui s'envolent. */
  sleep() {
    this.setEyes('closed');
    this.mouth.setTexture('dino-mouth-smile');
    this.scene.time.addEvent({
      delay: 1400, loop: true, callback: () => {
        if (!this.active) return;
        const z = this.scene.add.text(70, -470, 'z', {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '64px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#2d3354', strokeThickness: 8,
        }).setOrigin(0.5);
        this.add(z);
        this.scene.tweens.add({ targets: z, x: 150, y: -620, alpha: 0, scale: 1.6, duration: 2200, onComplete: () => z.destroy() });
      },
    });
  }

  /** Hauteur affichée en pixels. */
  setHeight(height: number) {
    this.setScale(height / Dino.HEIGHT);
    return this;
  }

  /** Position du centre de la bouche (pour y amener la nourriture). */
  mouthWorldPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y - 285 * this.scale);
  }

  // ---- Animations permanentes ----

  private startIdle() {
    const t = this.scene.tweens;
    t.add({ targets: this.body_, scaleY: S * 1.025, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    t.add({ targets: this.head, y: -255, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    t.add({ targets: this.tail, angle: { from: -6, to: 8 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    t.add({ targets: this.armL, angle: { from: 4, to: -6 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    t.add({ targets: this.armR, angle: { from: -4, to: 6 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.scheduleBlink();
  }

  private scheduleBlink() {
    this.scene.time.delayedCall(Phaser.Math.Between(1800, 4500), () => {
      if (!this.active) return;
      if (this.eyeMode === 'open') {
        this.eyes.forEach((e) => e.setTexture('dino-eye-closed'));
        this.scene.time.delayedCall(130, () => this.eyeMode === 'open' && this.setEyes('open'));
      }
      this.scheduleBlink();
    });
  }

  private setEyes(mode: 'open' | 'happy' | 'closed') {
    this.eyeMode = mode;
    const key = mode === 'open' ? 'dino-eye' : mode === 'happy' ? 'dino-eye-happy' : 'dino-eye-closed';
    this.eyes.forEach((e) => e.setTexture(key));
  }

  /**
   * La bouche ne bouge que pendant le son. Si la voix signale ses mots, la
   * bouche s'ouvre et se ferme mot par mot (elle reste fermée pendant les
   * pauses) ; sinon elle bat régulièrement tant que la voix parle.
   */
  private setTalking(talking: boolean) {
    this.talkTimer?.remove();
    this.talkTimer = undefined;
    this.clearWordTimers();
    this.wordSync = false;
    if (!talking) {
      if (!this.busy) this.mouth.setTexture('dino-mouth-smile');
      return;
    }
    // On laisse un court instant au premier mot pour arriver avant de battre au hasard.
    this.talkTimer = this.scene.time.delayedCall(120, () => {
      if (this.wordSync || !app.voice.talking) return;
      this.talkTimer = this.scene.time.addEvent({
        delay: 110,
        loop: true,
        callback: () => {
          const open = this.mouth.texture.key !== 'dino-mouth-small';
          this.mouth.setTexture(open ? 'dino-mouth-small' : Phaser.Math.RND.pick(MOUTHS));
        },
      });
    });
  }

  /** Un mot commence : la bouche s'ouvre et se ferme à chaque syllabe, puis se referme. */
  private sayWord(ms: number) {
    if (!app.voice.talking || this.busy) return;
    if (!this.wordSync) {
      this.wordSync = true;
      this.talkTimer?.remove();
      this.talkTimer = undefined;
    }
    this.clearWordTimers();
    const syllables = Math.max(1, Math.round(ms / 170));
    const step = ms / syllables;
    for (let i = 0; i < syllables; i++) {
      this.wordTimers.push(
        this.scene.time.delayedCall(i * step, () => this.mouth.setTexture(Phaser.Math.RND.pick(MOUTHS))),
        this.scene.time.delayedCall(i * step + step * 0.6, () => this.mouth.setTexture('dino-mouth-small')),
      );
    }
    this.wordTimers.push(this.scene.time.delayedCall(ms, () => {
      if (!this.busy) this.mouth.setTexture('dino-mouth-smile');
    }));
  }

  private clearWordTimers() {
    this.wordTimers.forEach((t) => t.remove());
    this.wordTimers = [];
  }

  // ---- Réactions ----

  react(reaction: DinoReaction) {
    const t = this.scene.tweens;
    t.killTweensOf(this.rig);
    this.rig.setPosition(0, 0).setAngle(0).setScale(1);
    const happyFor = (ms: number) => {
      this.setEyes('happy');
      this.scene.time.delayedCall(ms, () => this.setEyes('open'));
    };
    const armsUp = (ms: number, repeat = 0) => {
      t.add({ targets: this.armL, angle: 140, duration: ms, yoyo: true, repeat, ease: 'Back.easeOut' });
      t.add({ targets: this.armR, angle: -140, duration: ms, yoyo: true, repeat, ease: 'Back.easeOut' });
    };
    switch (reaction) {
      case 'happy':
        happyFor(900);
        armsUp(220);
        t.add({ targets: this.rig, y: -50, duration: 220, yoyo: true, ease: 'Quad.easeOut' });
        break;
      case 'cheer':
        happyFor(1400);
        armsUp(200, 1);
        t.add({ targets: this.rig, y: -70, duration: 230, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
        break;
      case 'dance':
        happyFor(2200);
        armsUp(260, 3);
        t.add({ targets: this.rig, angle: { from: -10, to: 10 }, duration: 260, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
          onComplete: () => this.rig.setAngle(0) });
        t.add({ targets: this.rig, y: -30, duration: 130, yoyo: true, repeat: 7, ease: 'Quad.easeOut' });
        break;
      case 'oops':
        this.flashMouth('dino-mouth-o', 700);
        t.add({ targets: this.head, angle: 12, duration: 200, yoyo: true, hold: 300, ease: 'Sine.easeInOut' });
        t.add({ targets: this.rig, x: 10, duration: 60, yoyo: true, repeat: 3 });
        break;
      case 'think':
        t.add({ targets: this.head, angle: -10, duration: 300, yoyo: true, hold: 600, ease: 'Sine.easeInOut' });
        t.add({ targets: this.eyes, y: '-=6', duration: 300, yoyo: true, hold: 600 });
        break;
      case 'eat': {
        this.busy = true;
        happyFor(1100);
        let n = 0;
        this.scene.time.addEvent({
          delay: 140, repeat: 7,
          callback: () => {
            this.mouth.setTexture(n++ % 2 === 0 ? 'dino-mouth-wide' : 'dino-mouth-smile');
            if (n === 8) this.busy = false;
          },
        });
        t.add({ targets: this.rig, scaleY: 0.95, duration: 140, yoyo: true, repeat: 3 });
        break;
      }
      case 'levelUp':
        happyFor(1800);
        armsUp(400);
        t.add({ targets: this.rig, scale: 1.25, duration: 500, yoyo: true, hold: 500, ease: 'Back.easeOut' });
        this.sparkle();
        break;
      case 'tickle':
        happyFor(1000);
        this.flashMouth('dino-mouth-wide', 900);
        t.add({ targets: this.rig, x: 8, duration: 40, yoyo: true, repeat: 9 });
        break;
      case 'wave':
        // Coucou de la main : le bras droit se lève et s'agite.
        happyFor(1400);
        t.killTweensOf(this.armR);
        t.chain({
          targets: this.armR,
          tweens: [
            { angle: -150, duration: 250, ease: 'Back.easeOut' },
            { angle: -110, duration: 180, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' },
            { angle: 0, duration: 300 },
          ],
          // Puis le bras reprend son balancement habituel.
          onComplete: () => t.add({
            targets: this.armR, angle: { from: -4, to: 6 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          }),
        });
        break;
      case 'spin':
        // Saut avec pirouette.
        happyFor(1200);
        armsUp(300);
        t.add({ targets: this.rig, y: -90, duration: 350, yoyo: true, ease: 'Quad.easeOut' });
        t.add({ targets: this.rig, angle: 360, duration: 700, ease: 'Sine.easeInOut', onComplete: () => this.rig.setAngle(0) });
        break;
      case 'yawn':
        // Bâillement : yeux fermés, grande bouche, bras qui s'étirent.
        this.setEyes('closed');
        this.flashMouth('dino-mouth-o', 1300);
        this.scene.time.delayedCall(1300, () => this.setEyes('open'));
        armsUp(650);
        t.add({ targets: this.rig, scaleY: 1.06, duration: 650, yoyo: true, ease: 'Sine.easeInOut' });
        break;
      case 'roar':
        // Petit rugissement : la tête avance, la bouche s'ouvre en grand.
        Sfx.play('roar');
        this.flashMouth('dino-mouth-wide', 900);
        t.add({ targets: this.head, scale: 1.12, duration: 200, yoyo: true, hold: 500, ease: 'Back.easeOut' });
        t.add({ targets: this.rig, x: 5, duration: 45, yoyo: true, repeat: 7 });
        break;
      case 'lookAround':
        // Il regarde à gauche, puis à droite, la tête suit.
        t.chain({
          targets: this.eyes,
          tweens: [
            { x: '-=10', duration: 250, hold: 500 },
            { x: '+=20', duration: 400, hold: 500 },
            { x: '-=10', duration: 250 },
          ],
        });
        t.chain({
          targets: this.head,
          tweens: [
            { angle: -8, duration: 250, hold: 500 },
            { angle: 8, duration: 400, hold: 500 },
            { angle: 0, duration: 250 },
          ],
        });
        break;
      case 'hop':
        // Trois petits sauts sur place.
        t.add({ targets: this.rig, y: -35, duration: 160, yoyo: true, repeat: 2, ease: 'Quad.easeOut' });
        break;
      case 'burp': {
        // Rot : la tête part en avant, la bouche en « o », une bulle s'envole.
        this.flashMouth('dino-mouth-o', 800);
        t.add({ targets: this.head, angle: -10, y: -270, duration: 160, yoyo: true, hold: 350, ease: 'Back.easeOut' });
        t.add({ targets: this.rig, scaleY: 1.05, duration: 160, yoyo: true });
        const bubble = this.scene.add.circle(10, -300, 18, 0xbfe6ff, 0.7).setStrokeStyle(4, 0xffffff);
        this.add(bubble);
        t.add({ targets: bubble, y: -460, x: 60, scale: 2.2, duration: 900, ease: 'Sine.easeOut',
          onComplete: () => t.add({ targets: bubble, scale: 3, alpha: 0, duration: 120, onComplete: () => bubble.destroy() }) });
        this.scene.time.delayedCall(900, () => this.react('oops'));
        break;
      }
      case 'fart': {
        // Prout : petit saut surpris, nuages verts derrière la queue, yeux fermés (gêné).
        this.setEyes('closed');
        this.scene.time.delayedCall(1100, () => this.setEyes('open'));
        this.flashMouth('dino-mouth-small', 1100);
        t.add({ targets: this.rig, y: -45, duration: 150, yoyo: true, ease: 'Quad.easeOut' });
        t.add({ targets: this.tail, angle: 30, duration: 120, yoyo: true, repeat: 1 });
        for (let i = 0; i < 4; i++) {
          const puff = this.scene.add.circle(150 + i * 12, -60 - i * 6, 26, 0xa5d36b, 0.75);
          this.addAt(puff, 0);
          t.add({ targets: puff, x: 230 + i * 30, y: -80 - i * 25, scale: 2.4, alpha: 0, duration: 1300, delay: i * 120,
            onComplete: () => puff.destroy() });
        }
        break;
      }
      case 'growl':
        // Ventre qui gargouille : le corps tremble, il se tient le ventre.
        this.flashMouth('dino-mouth-small', 900);
        t.add({ targets: this.body_, scaleX: S * 1.06, duration: 90, yoyo: true, repeat: 5 });
        t.add({ targets: [this.armL, this.armR], angle: 0, duration: 200, yoyo: true, hold: 600 });
        t.add({ targets: this.head, angle: 8, duration: 250, yoyo: true, hold: 400 });
        break;
      case 'beg':
        // « S'il te plaît ! » : petits sauts, bras en l'air, yeux tout contents.
        happyFor(1200);
        armsUp(180, 3);
        t.add({ targets: this.rig, y: -25, duration: 140, yoyo: true, repeat: 3, ease: 'Quad.easeOut' });
        break;
      case 'gape':
        // Grande bouche ouverte : « Aaaah ! »
        this.flashMouth('dino-mouth-wide', 1600);
        t.add({ targets: this.head, angle: -14, duration: 300, yoyo: true, hold: 1000, ease: 'Sine.easeInOut' });
        break;
    }
  }

  /** Vrai si le dino est libre (ne parle pas, ne mange pas, ne fait pas une grimace). */
  get free() { return !this.busy && !app.voice.talking; }

  /**
   * Coup de langue : la langue rose part de la bouche jusqu'à la cible (une
   * mouche), l'attrape, et revient. La cible est emportée puis détruite.
   */
  catchWithTongue(target: Phaser.GameObjects.Image): Promise<void> {
    const scene = this.scene;
    const tongue = scene.add.graphics().setDepth(this.depth + 1);
    const from = this.mouthWorldPoint();
    const to = new Phaser.Math.Vector2(target.x, target.y);
    const width = Math.max(6, 34 * this.scale);
    this.busy = true;
    this.mouth.setTexture('dino-mouth-wide');
    this.lookAt(to.x, to.y, 400);
    Sfx.play('slurp');
    const drawTo = (t: number) => {
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      tongue.clear().lineStyle(width, 0xff6f91, 1).lineBetween(from.x, from.y, x, y)
        .fillStyle(0xff6f91, 1).fillCircle(x, y, width * 0.8);
      return { x, y };
    };
    return new Promise((resolve) => {
      scene.tweens.addCounter({
        from: 0, to: 1, duration: 140, ease: 'Quad.easeOut', onUpdate: (tw) => drawTo(tw.getValue() ?? 0),
        onComplete: () => scene.tweens.addCounter({
          from: 1, to: 0, duration: 220, ease: 'Quad.easeIn',
          onUpdate: (tw) => {
            const tip = drawTo(tw.getValue() ?? 0);
            target.setPosition(tip.x, tip.y);
          },
          onComplete: () => {
            tongue.destroy();
            target.destroy();
            this.busy = false;
            Sfx.play('chomp');
            this.react('eat');
            resolve();
          },
        }),
      });
    });
  }

  /** Une petite animation au hasard, quand le dino attend (si il ne parle pas). */
  idleFun() {
    if (app.voice.talking || this.busy) return;
    this.react(Phaser.Math.RND.pick(IDLE_FUN));
  }

  private flashMouth(key: string, ms: number) {
    this.busy = true;
    this.mouth.setTexture(key);
    this.scene.time.delayedCall(ms, () => {
      this.busy = false;
      if (!app.voice.talking) this.mouth.setTexture('dino-mouth-smile');
    });
  }

  private sparkle() {
    const p = this.scene.add.particles(this.x, this.y - Dino.HEIGHT * this.scale * 0.5, 'ui-sparkles', {
      speed: { min: 150, max: 380 },
      scale: { start: 0.35, end: 0 },
      lifespan: 900,
      quantity: 18,
      emitting: false,
    });
    p.setDepth(this.depth + 1);
    p.explode(18);
    this.scene.time.delayedCall(1200, () => p.destroy());
  }

  /** Le dino tend le bras vers un point de l'écran et le regarde. */
  pointAt(x: number, y: number, holdMs = 1400) {
    const right = x >= this.x;
    const arm = right ? this.armR : this.armL;
    const shoulder = arm.getWorldTransformMatrix();
    // Bras au repos vers le bas (angle 0) : on le tourne vers la cible.
    const angle = Phaser.Math.RadToDeg(Math.atan2(y - shoulder.ty, x - shoulder.tx)) - 90;
    this.scene.tweens.killTweensOf(arm);
    this.scene.tweens.add({
      targets: arm, angle, duration: 250, ease: 'Back.easeOut', yoyo: true, hold: holdMs,
      onComplete: () => this.scene.tweens.add({
        targets: arm, angle: { from: right ? -4 : 4, to: right ? 6 : -6 },
        duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      }),
    });
    this.lookAt(x, y, holdMs);
  }

  lookAt(x: number, y: number, holdMs = 1200) {
    const dx = Phaser.Math.Clamp((x - this.x) / 40, -8, 8);
    const dy = Phaser.Math.Clamp((y - (this.y - 350 * this.scale)) / 60, -6, 6);
    this.eyes.forEach((eye, i) => this.scene.tweens.add({
      targets: eye, x: (i === 0 ? -52 : 52) + dx, y: -112 + dy, duration: 200, yoyo: true, hold: holdMs,
    }));
  }

  /** Jauge de croissance dessinée sur le ventre (null = masquée). */
  setBellyFill(fill: number | null) {
    this.bellyFill = fill;
    this.belly.clear();
    if (fill === null) return;
    const cx = 0, cy = -114, rx = 62, ry = 66;
    const cut = cy + ry - 2 * ry * Phaser.Math.Clamp(fill, 0, 1);
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      points.push(new Phaser.Math.Vector2(cx + rx * Math.cos(a), Math.max(cut, cy + ry * Math.sin(a))));
    }
    this.belly.fillStyle(0xffb84d, 0.9).fillPoints(points, true);
    this.belly.lineStyle(5, 0xe0902d, 1).strokeEllipse(cx, cy, rx * 2, ry * 2);
  }

  get bellyValue() { return this.bellyFill; }
}
