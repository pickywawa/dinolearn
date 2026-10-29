import Phaser from 'phaser';
import { app } from '../core/app';
import { PART_RESOLUTION } from './parts';

export type DinoReaction = 'happy' | 'cheer' | 'dance' | 'oops' | 'think' | 'eat' | 'levelUp' | 'tickle';

const S = 1 / PART_RESOLUTION;
const MOUTHS = ['dino-mouth-small', 'dino-mouth-open', 'dino-mouth-wide', 'dino-mouth-o', 'dino-mouth-open'];

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
  private busy = false;
  private unsubscribe: (() => void)[] = [];

  static readonly HEIGHT = 500;

  constructor(scene: Phaser.Scene, x: number, y: number, height: number) {
    super(scene, x, y);
    this.rig = scene.add.container(0, 0);
    this.add(this.rig);

    const img = (key: string, px: number, py: number, ox = 0.5, oy = 0.5) =>
      scene.add.image(px, py, key).setOrigin(ox, oy).setScale(S);

    this.tail = img('dino-tail', 80, -120, 0.08, 0.72);
    const legL = img('dino-leg', -62, -36);
    const legR = img('dino-leg', 62, -36).setFlipX(true);
    this.body_ = img('dino-body', 0, -135);
    this.belly = scene.add.graphics();
    this.armL = img('dino-arm', -96, -190, 0.4, 0.12);
    this.armR = img('dino-arm', 96, -190, 0.4, 0.12).setFlipX(true);

    this.head = scene.add.container(0, -250);
    const headImg = img('dino-head', 0, 0, 0.5, 0.85);
    this.eyes = [img('dino-eye', -52, -112), img('dino-eye', 52, -112)];
    this.mouth = img('dino-mouth-smile', 0, -40, 0.5, 0.3);
    this.head.add([headImg, ...this.eyes, this.mouth]);

    this.rig.add([this.tail, legL, legR, this.body_, this.belly, this.armL, this.armR, this.head]);
    this.setHeight(height);
    scene.add.existing(this);

    this.startIdle();
    this.unsubscribe.push(
      app.voice.onTalk((talking) => this.setTalking(talking)),
      app.voice.onBoundary(() => this.mouth.setTexture('dino-mouth-wide')),
    );
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.unsubscribe.forEach((fn) => fn());
      this.talkTimer?.remove();
    });
    if (app.voice.talking) this.setTalking(true);
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

  private setTalking(talking: boolean) {
    this.talkTimer?.remove();
    this.talkTimer = undefined;
    if (!talking) {
      if (!this.busy) this.mouth.setTexture('dino-mouth-smile');
      return;
    }
    this.talkTimer = this.scene.time.addEvent({
      delay: 95,
      loop: true,
      callback: () => {
        const key = Phaser.Math.RND.pick(MOUTHS);
        this.mouth.setTexture(this.mouth.texture.key === key ? 'dino-mouth-small' : key);
      },
    });
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
    }
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
