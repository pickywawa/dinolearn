import Phaser from 'phaser';
import * as THREE from 'three';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Accessories } from '../dino3d/accessories';
import { createDino } from '../dino3d/model';
import { DinoRig, type Mouth, type Pose } from '../dino3d/rig';
import { Stage } from '../dino3d/stage';

export type DinoReaction =
  | 'happy' | 'cheer' | 'dance' | 'oops' | 'think' | 'eat' | 'levelUp' | 'tickle'
  | 'wave' | 'spin' | 'yawn' | 'roar' | 'lookAround' | 'hop'
  | 'burp' | 'fart' | 'growl' | 'beg' | 'gape';

/** Petites animations jouées au hasard quand le dino attend. */
const IDLE_FUN: DinoReaction[] = ['wave', 'yawn', 'roar', 'lookAround', 'hop', 'spin'];

const MOUTHS: Mouth[] = ['open', 'wide', 'o', 'open'];

/** Taille du modèle 3D (des pieds au haut de la tête), en unités 3D. */
const MODEL_HEIGHT = 2.05;
/** Hauteur visible par la caméra : de la place pour les sauts, les bras levés et les chapeaux. */
const VIEW_HEIGHT = 3.2;
const VIEW_ASPECT = 0.95;

let uid = 0;

/**
 * Le dino en 3D (Three.js), affiché dans Phaser comme une image : chaque
 * image du rendu 3D est copiée dans une texture. Le dino est animé par les
 * tweens de Phaser, qui font varier les curseurs de sa pose (bras, tête,
 * saut…) ; il parle au rythme de la voix, cligne des yeux, regarde où on
 * touche, porte ses objets (accrochés à ses os) et peut tourner sur lui-même.
 *
 * L'origine du conteneur est entre les pieds du dino ; hauteur ≈ 500 unités.
 */
export class Dino extends Phaser.GameObjects.Container {
  static readonly HEIGHT = 500;

  private stage: Stage;
  private rig: DinoRig;
  private view: Phaser.GameObjects.Image;
  private texKey: string;
  private glTex?: Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper;
  /** Pixels du canvas → unités du conteneur. */
  private px: number;
  private feet: { x: number; y: number };
  private shadow: THREE.Mesh;
  private wear: Accessories;
  private bellyFill: number | null = null;
  private talkTimer?: Phaser.Time.TimerEvent;
  private wordSync = false;
  private wordTimers: Phaser.Time.TimerEvent[] = [];
  private busy = false;
  private unsubscribe: (() => void)[] = [];
  private lastRender = -1;
  /** Orientation de repos : légèrement tourné vers le centre de l'écran. */
  private baseYaw: number;
  private mouthMarker = new THREE.Object3D();
  private handMarker = { L: new THREE.Object3D(), R: new THREE.Object3D() };

  /** `color` : couleur du dino (0 à 9), par défaut celle de l'enfant qui joue. */
  constructor(scene: Phaser.Scene, x: number, y: number, height: number, color = app.progress.color) {
    super(scene, x, y);

    // Résolution du rendu : celle de l'affichage (un peu plus pour la netteté).
    const ch = Phaser.Math.Clamp(Math.round(height * (VIEW_HEIGHT / MODEL_HEIGHT) * 1.25), 240, 1100);
    const cw = Math.round(ch * VIEW_ASPECT);
    this.stage = new Stage(cw, ch, VIEW_HEIGHT);
    const model = createDino(color);
    this.rig = new DinoRig(model);
    this.stage.scene.add(this.rig.pivot);
    this.wear = new Accessories(model);
    this.shadow = this.makeShadow();
    this.stage.scene.add(this.shadow);

    // Repères accrochés aux os (bouche, mains) pour viser depuis Phaser.
    this.attachMarker('head', this.mouthMarker, 0, 1.22, 0.6);
    this.attachMarker('armL', this.handMarker.L, 0.55, 0.6, 0.18);
    this.attachMarker('armR', this.handMarker.R, -0.55, 0.6, 0.18);

    // Où tombent les pieds et le haut de la tête dans le canvas, au repos.
    const feet = this.stage.project(new THREE.Vector3(0, 0, 0));
    const top = this.stage.project(new THREE.Vector3(0, MODEL_HEIGHT, 0));
    this.feet = feet;
    this.px = Dino.HEIGHT / (feet.y - top.y);

    this.texKey = `dino3d-${uid++}`;
    // Texture WebGL de Phaser, remplie directement depuis le canvas du rendu 3D.
    const gl = scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    this.stage.render();
    this.glTex = gl.canvasToTexture(this.stage.canvas, undefined, true);
    scene.textures.addGLTexture(this.texKey, this.glTex);
    this.view = scene.add.image(0, 0, this.texKey)
      .setOrigin(feet.x / cw, feet.y / ch)
      .setScale(this.px);
    this.add(this.view);

    this.baseYaw = x < scene.scale.width * 0.4 ? 0.38 : x > scene.scale.width * 0.6 ? -0.38 : 0;
    this.rig.pose.yaw = this.baseYaw;

    this.dress(app.progress.collection.worn);
    this.setHeight(height);
    scene.add.existing(this);

    this.startIdle();
    this.renderNow();
    const onUpdate = () => this.renderFrame();
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, onUpdate);
    this.unsubscribe.push(
      () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, onUpdate),
      app.voice.onTalk((talking) => this.setTalking(talking)),
      app.voice.onBoundary((ms) => this.sayWord(ms)),
    );
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.unsubscribe.forEach((fn) => fn());
      this.talkTimer?.remove();
      this.clearWordTimers();
      scene.tweens.killTweensOf(this.rig.pose);
      this.stage.dispose();
      if (scene.textures.exists(this.texKey)) scene.textures.remove(this.texKey);
      this.glTex = undefined;
    });
    if (app.voice.talking) this.setTalking(true);
  }

  /** Arrête les animations qui touchent ces curseurs de la pose (les autres continuent). */
  private stopPose(keys: string[]) {
    const touches = (tw: Phaser.Tweens.BaseTween): boolean => {
      const data = (tw as unknown as { data?: unknown[] }).data ?? [];
      return data.some((d) => {
        const key = (d as { key?: string }).key;
        if (key !== undefined) return keys.includes(key);
        return d instanceof Phaser.Tweens.BaseTween && touches(d);
      });
    };
    for (const tw of this.scene.tweens.getTweensOf(this.rig.pose)) if (touches(tw)) tw.stop();
  }

  /** La pose du dino (pour des animations sur mesure depuis une scène). */
  get pose(): Pose { return this.rig.pose; }

  private attachMarker(bone: string, marker: THREE.Object3D, x: number, y: number, z: number) {
    const b = this.rig.model.bones[bone];
    this.rig.pivot.updateMatrixWorld(true);
    marker.position.set(x, y, z);
    this.rig.pivot.add(marker);
    marker.updateMatrixWorld(true);
    b?.attach(marker);
  }

  private makeShadow() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(20,30,40,0.45)');
    grad.addColorStop(0.6, 'rgba(20,30,40,0.25)');
    grad.addColorStop(1, 'rgba(20,30,40,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    mat.userData.outlineParameters = { visible: false };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.002;
    return mesh;
  }

  // ---- Rendu ----

  private renderFrame() {
    if (!this.active || !this.visible) return;
    // ~40 images par seconde suffisent pour un personnage ; moins si l'appareil peine.
    const now = this.scene.time.now;
    if (now - this.lastRender < 24) return;
    this.lastRender = now;
    this.renderNow();
  }

  private renderNow() {
    const p = this.rig.pose;
    this.rig.apply();
    // L'ombre reste au sol et rétrécit quand le dino saute.
    const s = Phaser.Math.Clamp(1 - p.y * 0.6, 0.4, 1.2) * p.grow;
    this.shadow.scale.set(s, s, 1);
    this.shadow.position.x = p.x;
    this.wear.update();
    this.stage.render();
    if (this.glTex) (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).updateCanvasTexture(this.stage.canvas, this.glTex, false, true);
  }

  /** Point du modèle 3D (monde Three) → coordonnées du monde Phaser. */
  private toScreen(v: THREE.Vector3) {
    const c = this.stage.project(v);
    const lx = (c.x - this.feet.x) * this.px;
    const ly = (c.y - this.feet.y) * this.px;
    const m = this.getWorldTransformMatrix();
    return new Phaser.Math.Vector2(m.getX(lx, ly), m.getY(lx, ly));
  }

  /** Coordonnées du monde Phaser → rayon dans la scène 3D. */
  private rayAt(x: number, y: number) {
    const m = this.getWorldTransformMatrix();
    const local = m.applyInverse(x, y);
    const cx = local.x / this.px + this.feet.x;
    const cy = local.y / this.px + this.feet.y;
    const ndc = new THREE.Vector2(cx / this.stage.canvas.width * 2 - 1, 1 - cy / this.stage.canvas.height * 2);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.stage.camera);
    return ray;
  }

  // ---- Habits ----

  /** Habille le dino avec ses objets (accrochés à la tête, au cou, au dos ou à la main). */
  dress(ids: readonly string[]) {
    this.wear.dress(ids);
    if (this.glTex) this.renderNow();
  }

  /** L'objet porté sous ce point de l'écran (le plus en avant), pour le retirer en le faisant glisser. */
  accessoryAt(x: number, y: number): { id: string; x: number; y: number } | undefined {
    this.rig.pivot.updateMatrixWorld(true);
    const id = this.wear.hit(this.rayAt(x, y));
    if (!id) return undefined;
    const p = this.accessoryPoint(id)!;
    return { id, x: p.x, y: p.y };
  }

  /** Centre à l'écran d'un objet porté. */
  accessoryPoint(id: string) {
    const c = this.wear.center(id);
    return c ? this.toScreen(c) : undefined;
  }

  /** Cache ou remontre un objet porté (pendant qu'on le retire). */
  hideAccessory(id: string, hidden: boolean) {
    this.wear.setHidden(id, hidden);
    this.renderNow();
  }

  // ---- Rotation au doigt ----

  /** Tourne le dino d'un glissé horizontal (en pixels d'écran). */
  turnBy(dx: number) {
    this.stopPose(['yaw']);
    this.rig.pose.yaw += dx * 0.012;
  }

  /** Revient doucement à son orientation de repos (ou à `yaw`). */
  turnBack(yaw = this.baseYaw) {
    const p = this.rig.pose;
    // On repart du tour le plus proche, pour ne pas faire plusieurs tours à l'envers.
    p.yaw = yaw + Phaser.Math.Angle.Wrap(p.yaw - yaw);
    this.scene.tweens.add({ targets: p, yaw, duration: 700, ease: 'Back.easeOut' });
  }

  /** Oriente le dino (0 = de face). */
  face(yaw: number, duration = 400) {
    this.baseYaw = yaw;
    this.scene.tweens.add({ targets: this.rig.pose, yaw, duration, ease: 'Sine.easeInOut' });
  }

  /** Le dino s'endort : yeux fermés et petits « z » qui s'envolent. */
  sleep() {
    this.sleeping = true;
    this.rig.setEyes('closed');
    this.rig.setMouth('smile');
    this.busy = true;
    this.scene.tweens.add({ targets: this.rig.pose, headTilt: 0.18, headNod: 0.12, duration: 800 });
    this.scene.time.addEvent({
      delay: 1400, loop: true, callback: () => {
        if (!this.active) return;
        const z = this.scene.add.text(90, -470, 'z', {
          fontFamily: "'Baloo 2', Arial Rounded MT Bold, Arial, sans-serif", fontSize: '64px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#2d3354', strokeThickness: 8,
        }).setOrigin(0.5);
        this.add(z);
        this.scene.tweens.add({ targets: z, x: 170, y: -620, alpha: 0, scale: 1.6, duration: 2200, onComplete: () => z.destroy() });
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
    this.rig.pivot.updateMatrixWorld(true);
    return this.toScreen(this.mouthMarker.getWorldPosition(new THREE.Vector3()));
  }

  // ---- Animations permanentes ----

  private startIdle() {
    const t = this.scene.tweens;
    const p = this.rig.pose;
    t.add({ targets: p, breath: { from: -1, to: 1 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    t.add({ targets: p, tail: { from: -0.25, to: 0.25 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.idleArms();
    this.scheduleBlink();
  }

  /** Les bras se balancent doucement (à relancer après une animation des bras). */
  private idleArms() {
    const t = this.scene.tweens;
    const p = this.rig.pose;
    this.stopPose(['armL', 'armR']);
    t.add({ targets: p, armL: 0, armR: 0, duration: 250 }).once('complete', () => {
      if (!this.active) return;
      t.add({ targets: p, armL: { from: 0, to: 0.12 }, armR: { from: 0.12, to: 0 }, duration: 1500, yoyo: true,
        repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  private scheduleBlink() {
    this.scene.time.delayedCall(Phaser.Math.Between(1800, 4500), () => {
      if (!this.active) return;
      if (this.rig.currentEyes === 'open') {
        this.rig.setEyes('closed');
        this.scene.time.delayedCall(120, () => this.rig.currentEyes === 'closed' && this.eyesOpenIfFree());
      }
      this.scheduleBlink();
    });
  }

  private eyesOpenIfFree() {
    if (!this.sleeping) this.rig.setEyes('open');
  }

  private sleeping = false;

  private setEyes(mode: 'open' | 'happy' | 'closed') {
    this.rig.setEyes(mode);
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
      if (!this.busy) this.rig.setMouth('smile');
      return;
    }
    this.talkTimer = this.scene.time.delayedCall(120, () => {
      if (this.wordSync || !app.voice.talking) return;
      this.talkTimer = this.scene.time.addEvent({
        delay: 110,
        loop: true,
        callback: () => {
          const open = this.rig.currentMouth !== 'small';
          this.rig.setMouth(open ? 'small' : Phaser.Math.RND.pick(MOUTHS));
          this.nod();
        },
      });
    });
  }

  /** Petit mouvement de tête en parlant. */
  private nod() {
    if (this.busy) return;
    const p = this.rig.pose;
    this.scene.tweens.add({ targets: p, headNod: Phaser.Math.FloatBetween(-0.06, 0.08),
      headTilt: Phaser.Math.FloatBetween(-0.08, 0.08), duration: 180, ease: 'Sine.easeOut' });
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
    this.nod();
    for (let i = 0; i < syllables; i++) {
      this.wordTimers.push(
        this.scene.time.delayedCall(i * step, () => this.rig.setMouth(Phaser.Math.RND.pick(MOUTHS))),
        this.scene.time.delayedCall(i * step + step * 0.6, () => this.rig.setMouth('small')),
      );
    }
    this.wordTimers.push(this.scene.time.delayedCall(ms, () => {
      if (!this.busy) this.rig.setMouth('smile');
      this.scene.tweens.add({ targets: this.rig.pose, headNod: 0, headTilt: 0, duration: 250 });
    }));
  }

  private clearWordTimers() {
    this.wordTimers.forEach((t) => t.remove());
    this.wordTimers = [];
  }

  // ---- Réactions ----

  react(reaction: DinoReaction) {
    const t = this.scene.tweens;
    const p = this.rig.pose;
    this.stopPose(['x', 'y', 'spin', 'lean', 'bow', 'squash', 'grow', 'headTilt', 'headNod', 'headTurn',
      'headScale', 'armLFwd', 'armRFwd', 'legL', 'legR', 'tailLift', 'eyeX', 'eyeY']);
    Object.assign(p, { x: 0, y: 0, spin: 0, lean: 0, bow: 0, squash: 1, grow: 1, headScale: 1, armLFwd: 0, armRFwd: 0 });
    const happyFor = (ms: number) => {
      this.setEyes('happy');
      this.scene.time.delayedCall(ms, () => this.rig.currentEyes === 'happy' && this.eyesOpenIfFree());
    };
    const armsUp = (ms: number, repeat = 0, lift = 2.3) => {
      this.stopPose(['armL', 'armR']);
      t.add({ targets: p, armL: lift, armR: lift, duration: ms, yoyo: true, repeat, ease: 'Back.easeOut',
        onComplete: () => this.idleArms() });
    };
    /** Saut : accroupi, envol, réception écrasée. */
    const jump = (height: number, ms: number, repeat = 0) => {
      t.chain({
        targets: p,
        repeat,
        tweens: [
          { squash: 0.85, duration: 90, ease: 'Quad.easeOut' },
          { squash: 1.1, y: height, duration: ms, ease: 'Quad.easeOut' },
          { squash: 1, y: 0, duration: ms, ease: 'Quad.easeIn' },
          { squash: 0.88, duration: 70, yoyo: true, ease: 'Quad.easeOut' },
        ],
      });
    };
    const shake = (amp: number, times: number, ms = 50) =>
      t.add({ targets: p, x: amp, duration: ms, yoyo: true, repeat: times, onComplete: () => (p.x = 0) });

    switch (reaction) {
      case 'happy':
        happyFor(900);
        armsUp(220);
        jump(0.22, 200);
        break;
      case 'cheer':
        happyFor(1400);
        armsUp(200, 1);
        jump(0.3, 210, 1);
        break;
      case 'dance':
        happyFor(2200);
        armsUp(260, 3);
        t.add({ targets: p, lean: { from: -0.18, to: 0.18 }, headTilt: { from: 0.15, to: -0.15 }, duration: 260,
          yoyo: true, repeat: 3, ease: 'Sine.easeInOut', onComplete: () => { p.lean = 0; p.headTilt = 0; } });
        t.add({ targets: p, y: 0.12, duration: 130, yoyo: true, repeat: 7, ease: 'Quad.easeOut' });
        t.add({ targets: p, spin: Math.PI * 2, duration: 1000, delay: 1000, ease: 'Sine.easeInOut',
          onComplete: () => (p.spin = 0) });
        break;
      case 'oops':
        this.flashMouth('o', 700);
        t.add({ targets: p, headTilt: 0.3, bow: -0.08, duration: 200, yoyo: true, hold: 300, ease: 'Sine.easeInOut' });
        shake(0.04, 3, 60);
        break;
      case 'think':
        t.add({ targets: p, headTilt: -0.22, headTurn: 0.2, eyeY: 1, eyeX: -0.6, duration: 300, yoyo: true, hold: 700,
          ease: 'Sine.easeInOut' });
        this.stopPose(['armR']);
        t.add({ targets: p, armR: 1.2, armRFwd: 1.2, duration: 300, yoyo: true, hold: 700,
          onComplete: () => this.idleArms() });
        break;
      case 'eat': {
        this.busy = true;
        happyFor(1100);
        let n = 0;
        this.scene.time.addEvent({
          delay: 140, repeat: 7,
          callback: () => {
            this.rig.setMouth(n++ % 2 === 0 ? 'wide' : 'smile');
            if (n === 8) this.busy = false;
          },
        });
        t.add({ targets: p, squash: 0.94, headNod: 0.1, duration: 140, yoyo: true, repeat: 3 });
        break;
      }
      case 'levelUp':
        happyFor(1800);
        armsUp(400);
        t.add({ targets: p, grow: 1.25, duration: 500, yoyo: true, hold: 500, ease: 'Back.easeOut' });
        t.add({ targets: p, spin: Math.PI * 2, duration: 1200, ease: 'Sine.easeInOut', onComplete: () => (p.spin = 0) });
        this.sparkle();
        break;
      case 'tickle':
        happyFor(1000);
        this.flashMouth('wide', 900);
        shake(0.03, 9, 40);
        t.add({ targets: p, lean: 0.12, duration: 120, yoyo: true, repeat: 3 });
        break;
      case 'wave':
        happyFor(1400);
        this.stopPose(['armL', 'armR']);
        t.chain({
          targets: p,
          tweens: [
            { armL: 2.5, duration: 250, ease: 'Back.easeOut' },
            { armL: 1.9, duration: 180, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' },
            { armL: 0, duration: 300 },
          ],
          onComplete: () => this.idleArms(),
        });
        t.add({ targets: p, headTilt: -0.15, duration: 300, yoyo: true, hold: 900 });
        break;
      case 'spin':
        happyFor(1200);
        armsUp(300);
        jump(0.35, 330);
        t.add({ targets: p, spin: Math.PI * 2, duration: 760, ease: 'Sine.easeInOut', onComplete: () => (p.spin = 0) });
        break;
      case 'yawn':
        this.setEyes('closed');
        this.flashMouth('o', 1300);
        this.scene.time.delayedCall(1300, () => this.eyesOpenIfFree());
        armsUp(650, 0, 2.6);
        t.add({ targets: p, squash: 1.06, headNod: -0.25, duration: 650, yoyo: true, ease: 'Sine.easeInOut' });
        break;
      case 'roar':
        Sfx.play('roar');
        this.flashMouth('wide', 900);
        t.add({ targets: p, headScale: 1.1, headNod: -0.15, bow: 0.12, duration: 200, yoyo: true, hold: 500,
          ease: 'Back.easeOut' });
        this.stopPose(['armL', 'armR']);
        t.add({ targets: p, armL: 1.3, armR: 1.3, armLFwd: 0.9, armRFwd: 0.9, duration: 200, yoyo: true, hold: 500,
          onComplete: () => this.idleArms() });
        shake(0.02, 7, 45);
        break;
      case 'lookAround':
        t.chain({
          targets: p,
          tweens: [
            { headTurn: -0.5, eyeX: -1, duration: 300, hold: 500, ease: 'Sine.easeInOut' },
            { headTurn: 0.5, eyeX: 1, duration: 500, hold: 500, ease: 'Sine.easeInOut' },
            { headTurn: 0, eyeX: 0, duration: 300, ease: 'Sine.easeInOut' },
          ],
        });
        break;
      case 'hop':
        jump(0.15, 150, 2);
        break;
      case 'burp': {
        this.flashMouth('o', 800);
        t.add({ targets: p, headNod: -0.2, headScale: 1.05, duration: 160, yoyo: true, hold: 350, ease: 'Back.easeOut' });
        t.add({ targets: p, squash: 1.05, duration: 160, yoyo: true });
        const m = this.mouthLocal();
        const bubble = this.scene.add.circle(m.x, m.y, 18, 0xbfe6ff, 0.7).setStrokeStyle(4, 0xffffff);
        this.add(bubble);
        t.add({ targets: bubble, y: m.y - 160, x: m.x + 60, scale: 2.2, duration: 900, ease: 'Sine.easeOut',
          onComplete: () => t.add({ targets: bubble, scale: 3, alpha: 0, duration: 120, onComplete: () => bubble.destroy() }) });
        this.scene.time.delayedCall(900, () => this.react('oops'));
        break;
      }
      case 'fart': {
        this.setEyes('closed');
        this.scene.time.delayedCall(1100, () => this.eyesOpenIfFree());
        this.flashMouth('small', 1100);
        jump(0.18, 150);
        t.add({ targets: p, tailLift: 0.8, duration: 120, yoyo: true, repeat: 1 });
        const back = p.yaw >= 0 ? -1 : 1;
        for (let i = 0; i < 4; i++) {
          const puff = this.scene.add.circle(back * (120 + i * 12), -60 - i * 6, 26, 0xa5d36b, 0.75);
          this.addAt(puff, 0);
          t.add({ targets: puff, x: back * (220 + i * 30), y: -80 - i * 25, scale: 2.4, alpha: 0, duration: 1300,
            delay: i * 120, onComplete: () => puff.destroy() });
        }
        break;
      }
      case 'growl':
        this.flashMouth('small', 900);
        t.add({ targets: p, squash: 0.96, duration: 90, yoyo: true, repeat: 5 });
        this.stopPose(['armL', 'armR']);
        t.add({ targets: p, armL: 0.5, armR: 0.5, armLFwd: 1.1, armRFwd: 1.1, duration: 200, yoyo: true, hold: 600,
          onComplete: () => this.idleArms() });
        t.add({ targets: p, headTilt: 0.2, headNod: 0.2, duration: 250, yoyo: true, hold: 400 });
        break;
      case 'beg':
        happyFor(1200);
        armsUp(180, 3, 1.8);
        t.add({ targets: p, y: 0.1, duration: 140, yoyo: true, repeat: 3, ease: 'Quad.easeOut' });
        break;
      case 'gape':
        this.flashMouth('wide', 1600);
        t.add({ targets: p, headNod: -0.3, duration: 300, yoyo: true, hold: 1000, ease: 'Sine.easeInOut' });
        break;
    }
  }

  /** Vrai si le dino est libre (ne parle pas, ne mange pas, ne fait pas une grimace). */
  get free() { return !this.busy && !app.voice.talking; }

  /** Bouche, en coordonnées du conteneur. */
  private mouthLocal() {
    const w = this.mouthWorldPoint();
    const local = this.getWorldTransformMatrix().applyInverse(w.x, w.y);
    return { x: local.x, y: local.y };
  }

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
    this.rig.setMouth('wide');
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

  private flashMouth(mouth: Mouth, ms: number) {
    this.busy = true;
    this.rig.setMouth(mouth);
    this.scene.time.delayedCall(ms, () => {
      this.busy = false;
      if (!app.voice.talking) this.rig.setMouth('smile');
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
    // Le bras gauche du dino est du côté droit de l'écran.
    const arm = right ? 'armL' : 'armR';
    const fwd = right ? 'armLFwd' : 'armRFwd';
    const shoulder = this.toScreen(this.rig.worldPoint(arm));
    // Angle à l'écran depuis la verticale vers le bas : 0 = bras baissé, π/2 = horizontal, π = en l'air.
    const a = Math.atan2(Math.abs(x - shoulder.x), shoulder.y - y + 1e-3);
    const lift = Phaser.Math.Clamp(Math.PI - a, 0.4, 2.8);
    const t = this.scene.tweens;
    const p = this.rig.pose;
    this.stopPose(['armL', 'armR', 'armLFwd', 'armRFwd']);
    t.add({ targets: p, [arm]: lift, [fwd]: 0.25, duration: 250, ease: 'Back.easeOut', yoyo: true, hold: holdMs,
      onComplete: () => this.idleArms() });
    // Le dino se tourne un peu vers ce qu'il montre.
    t.add({ targets: p, yaw: this.baseYaw + (right ? 0.25 : -0.25), duration: 300, yoyo: true, hold: holdMs });
    this.lookAt(x, y, holdMs);
  }

  lookAt(x: number, y: number, holdMs = 1200) {
    const eye = this.toScreen(this.rig.worldPoint('eyeL'));
    const h = Dino.HEIGHT * this.scale;
    const dx = Phaser.Math.Clamp((x - eye.x) / (h * 0.8), -1, 1);
    const dy = Phaser.Math.Clamp((eye.y - y) / (h * 0.8), -1, 1);
    this.scene.tweens.add({
      targets: this.rig.pose, eyeX: dx, eyeY: dy, headTurn: dx * 0.35, headNod: -dy * 0.2,
      duration: 220, yoyo: true, hold: holdMs, ease: 'Sine.easeOut',
    });
  }

  /** Jauge de croissance dessinée sur le ventre (null = masquée). */
  setBellyFill(fill: number | null) {
    this.bellyFill = fill;
    this.wear.setBellyFill(fill);
    this.renderNow();
  }

  get bellyValue() { return this.bellyFill; }
}
