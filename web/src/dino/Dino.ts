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
  | 'burp' | 'fart' | 'growl' | 'beg' | 'gape'
  | 'celebrate' | 'clap' | 'fistPump' | 'wink' | 'nodYes' | 'sad' | 'surprised' | 'march';

/** Petites animations jouées au hasard quand le dino attend. */
/** (Le rot, de temps en temps : le vrai bruit enregistré, avec sa bulle.) */
const IDLE_FUN: DinoReaction[] = ['wave', 'yawn', 'burp', 'lookAround', 'hop', 'spin', 'wink', 'march', 'clap', 'surprised'];

/** Chaque réaction est une animation du modèle 3D (clip glTF, fait dans Blender). */
const CLIPS: Record<DinoReaction, string> = {
  happy: 'happy', cheer: 'cheer', dance: 'dance', oops: 'oops', think: 'think', eat: 'eat', levelUp: 'levelUp',
  tickle: 'tickle', wave: 'wave', spin: 'spin', yawn: 'yawn', roar: 'roar', lookAround: 'lookAround', hop: 'hop',
  burp: 'burp', fart: 'fart', growl: 'growl', beg: 'beg', gape: 'gape', celebrate: 'celebrate', clap: 'clap',
  fistPump: 'fistPump', wink: 'wink', nodYes: 'yes', sad: 'sad', surprised: 'surprised', march: 'march',
};

/** Réactions qui occupent la bouche (la voix ne la fait pas bouger pendant ce temps). */
const MOUTH_BUSY: DinoReaction[] = ['eat', 'roar', 'yawn', 'gape', 'burp', 'tickle', 'growl'];

/** Bravo pour une bonne réponse : une animation au hasard, pour varier. */
export const SUCCESS_REACTIONS: DinoReaction[] = ['happy', 'clap', 'fistPump', 'wink', 'nodYes', 'happy'];

const FONT = "'Baloo 2', Arial Rounded MT Bold, Arial, sans-serif";

const MOUTHS: Mouth[] = ['open', 'wide', 'o', 'open'];

/** Taille du modèle 3D (des pieds au haut de la tête), en unités 3D. */
const MODEL_HEIGHT = 2.05;
/** Hauteur visible par la caméra : de la place pour les sauts, les bras levés et les chapeaux. */
const VIEW_HEIGHT = 3.2;
const VIEW_ASPECT = 0.95;

let uid = 0;

/**
 * Le dino en 3D (Three.js), affiché dans Phaser comme une image : chaque
 * image du rendu 3D est copiée dans une texture. Ses animations (repos,
 * parole, course, sommeil et toutes les réactions) sont des clips du modèle ;
 * les tweens de Phaser ajoutent par-dessus les gestes calculés (tête qui suit
 * le doigt, bras qui montre, rotation, mouvement de vie). Il parle au rythme
 * de la voix (mâchoire), cligne des yeux, porte ses objets (accrochés à ses
 * os) et peut tourner sur lui-même.
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
  /** Force du mouvement de vie permanent (0 pendant la course). */
  private lively = { k: 1 };
  /** Décalages de phase : deux dinos à l'écran ne bougent pas en même temps. */
  private phase = Math.random() * 100;
  /** Fin de la réaction en cours (les gestes en parlant attendent). */
  private reactingUntil = 0;
  private gestureTimer?: Phaser.Time.TimerEvent;
  private handMarker = { L: new THREE.Object3D(), R: new THREE.Object3D() };

  /** `color` : couleur du dino (0 à 9), par défaut celle de l'enfant qui joue. */
  constructor(scene: Phaser.Scene, x: number, y: number, height: number, color = app.progress.color) {
    super(scene, x, y);

    // Résolution du rendu : celle de l'affichage (un peu plus pour la netteté).
    const ch = Phaser.Math.Clamp(Math.round(height * (VIEW_HEIGHT / MODEL_HEIGHT) * 1.25), 240, 1100);
    const cw = Math.round(ch * VIEW_ASPECT);
    this.stage = Stage.acquire(cw, ch, VIEW_HEIGHT);
    const model = createDino(color);
    this.rig = new DinoRig(model);
    this.stage.scene.add(this.rig.pivot);
    this.wear = new Accessories(model);
    this.shadow = this.makeShadow();
    this.stage.scene.add(this.shadow);
    // Le sol reçoit la vraie ombre du dino (en plus de la tache douce).
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    (ground.material as THREE.Material).userData.outlineParameters = { visible: false };
    this.stage.scene.add(ground);

    // Repères accrochés aux os (bouche, mains) pour viser depuis Phaser.
    this.attachMarker('head', this.mouthMarker, 0, 0.95, 0.52);
    for (const side of ['L', 'R'] as const) {
      const h = this.rig.worldPoint(`arm${side}`);
      this.attachMarker(`arm${side}`, this.handMarker[side], h.x, h.y, h.z);
    }

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
      this.gestureTimer?.remove();
      this.clearWordTimers();
      scene.tweens.killTweensOf(this.rig.pose);
      scene.tweens.killTweensOf(this.lively);
      this.stage.release();
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
    const b = this.rig.bone(bone);
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
    this.live(p);
    this.rig.apply();
    // L'ombre reste au sol et rétrécit quand le dino saute.
    const s = Phaser.Math.Clamp(1 - p.y * 0.6, 0.4, 1.2) * p.grow;
    this.shadow.scale.set(s, s, 1);
    this.shadow.position.x = p.x;
    this.wear.update();
    this.stage.render();
    if (this.glTex) (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).updateCanvasTexture(this.stage.canvas, this.glTex, false, true);
  }

  /**
   * Le dino n'est jamais figé : il se balance doucement d'un côté à l'autre
   * (on voit son volume en 3D), déplace son poids, rebondit un peu et laisse
   * flâner sa tête. Calculé à chaque image, par-dessus toutes les animations.
   */
  private live(p: Pose) {
    const t = this.scene.time.now / 1000 + this.phase;
    const k = this.lively.k;
    p.sway = k * (0.17 * Math.sin(t * 0.55) + 0.07 * Math.sin(t * 1.31 + 1.7));
    p.shift = k * 0.035 * Math.sin(t * 0.9 + 0.4);
    p.bob = k * 0.018 * (0.5 + 0.5 * Math.sin(t * 2.3));
    p.look = k * (0.13 * Math.sin(t * 0.37 + 2.1) + 0.05 * Math.sin(t * 1.1));
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

  /** Tourne le dino d'un quart de tour (ou de `rad`), en douceur. */
  turnStep(rad = Math.PI / 2) {
    this.stopPose(['yaw']);
    this.scene.tweens.add({ targets: this.rig.pose, yaw: this.rig.pose.yaw + rad, duration: 550, ease: 'Back.easeOut' });
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

  /**
   * Le dino court (vu de profil, vers la droite) : jambes et bras alternés,
   * petits bonds. `false` : il s'arrête et se retourne vers nous.
   */
  run(on = true) {
    const p = this.rig.pose;
    const t = this.scene.tweens;
    this.stopPose(['legL', 'legR', 'armL', 'armR', 'armLFwd', 'armRFwd', 'y', 'bow', 'yaw']);
    this.scene.tweens.killTweensOf(this.lively);
    this.scene.tweens.add({ targets: this.lively, k: on ? 0 : 1, duration: on ? 150 : 600 });
    if (!on) {
      Object.assign(p, { legL: 0, legR: 0, armLFwd: 0, armRFwd: 0, y: 0, bow: 0 });
      this.rig.setBase(app.voice.talking ? 'talk' : 'idle');
      if (!app.voice.talking) this.rig.setMouth('smile');
      this.face(this.baseYaw);
      this.idleArms();
      return;
    }
    p.yaw = Math.PI / 2 * 0.85;
    p.bow = 0.06;
    this.rig.setMouth('open');
    this.rig.setBase('run', 0.15);
    t.add({ targets: p, y: 0.05, duration: 230, yoyo: true, repeat: -1, ease: 'Quad.easeOut' });
  }

  /** Le dino s'endort : yeux fermés et petits « z » qui s'envolent (`withZ` : sinon, la scène dessine les siens). */
  sleep(withZ = true) {
    this.sleeping = true;
    this.rig.setBase('sleep', 0.6);
    this.rig.setEyes('closed');
    this.rig.setMouth('smile');
    this.busy = true;
    this.scene.tweens.add({ targets: this.rig.pose, headTilt: 0.12, duration: 800 });
    if (!withZ) return;
    this.zTimer?.remove();
    this.zTimer = this.scene.time.addEvent({
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

  /** Le dino se réveille : il s'étire, ouvre les yeux et revient à son animation de repos. */
  wake() {
    if (!this.sleeping) return;
    this.sleeping = false;
    this.busy = false;
    this.zTimer?.remove();
    this.zTimer = undefined;
    this.rig.setEyes('open');
    this.rig.setBase('idle', 0.4);
    this.scene.tweens.add({ targets: this.rig.pose, headTilt: 0, duration: 400 });
    this.react('yawn');
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
    // Respiration, queue et bras : dans l'animation de repos du modèle. En plus, des clignements au hasard.
    this.scheduleBlink();
  }

  /** Les bras reviennent à l'animation en cours (après un geste calculé). */
  private idleArms() {
    this.stopPose(['armL', 'armR']);
    this.scene.tweens.add({ targets: this.rig.pose, armL: 0, armR: 0, armLFwd: 0, armRFwd: 0, duration: 250 });
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
  get isSleeping() { return this.sleeping; }
  private zTimer?: Phaser.Time.TimerEvent;

  /**
   * La bouche ne bouge que pendant le son. Si la voix signale ses mots, la
   * bouche s'ouvre et se ferme mot par mot (elle reste fermée pendant les
   * pauses) ; sinon elle bat régulièrement tant que la voix parle.
   */
  private setTalking(talking: boolean) {
    this.talkTimer?.remove();
    this.talkTimer = undefined;
    this.gestureTimer?.remove();
    this.gestureTimer = undefined;
    this.clearWordTimers();
    this.wordSync = false;
    if (!this.sleeping && this.rig.background !== 'run') this.rig.setBase(talking ? 'talk' : 'idle');
    // L'animation de parole fait déjà les gestes ; sinon, gestes calculés.
    if (talking && !this.rig.has('talk')) this.scheduleGesture(500);
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

  /** En parlant, le dino accompagne ses phrases de la main (un bras, puis l'autre). */
  private scheduleGesture(delay: number) {
    this.gestureTimer = this.scene.time.delayedCall(delay, () => {
      if (!this.active || !app.voice.talking) return;
      if (!this.busy && !this.sleeping && this.scene.time.now > this.reactingUntil) this.gesture();
      this.scheduleGesture(Phaser.Math.Between(1500, 2600));
    });
  }

  private gesture() {
    const p = this.rig.pose;
    const left = Math.random() < 0.5;
    const both = Math.random() < 0.25;
    this.stopPose(['armL', 'armR', 'armLFwd', 'armRFwd']);
    const to: Record<string, number> = {};
    if (left || both) Object.assign(to, { armL: Phaser.Math.FloatBetween(0.8, 1.3), armLFwd: Phaser.Math.FloatBetween(0.4, 0.9) });
    if (!left || both) Object.assign(to, { armR: Phaser.Math.FloatBetween(0.8, 1.3), armRFwd: Phaser.Math.FloatBetween(0.4, 0.9) });
    this.scene.tweens.add({ targets: p, ...to, duration: 260, yoyo: true, hold: Phaser.Math.Between(250, 600), ease: 'Sine.easeOut',
      onComplete: () => { p.armLFwd = 0; p.armRFwd = 0; this.idleArms(); } });
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
      'headScale', 'armL', 'armR', 'armLFwd', 'armRFwd', 'legL', 'legR', 'tailLift', 'eyeX', 'eyeY']);
    Object.assign(p, { x: 0, y: 0, spin: 0, lean: 0, bow: 0, squash: 1, grow: 1, headScale: 1, headTilt: 0, headNod: 0,
      headTurn: 0, armL: 0, armR: 0, armLFwd: 0, armRFwd: 0, legL: 0, legR: 0, tailLift: 0 });
    this.rig.setWink(null);
    if (!this.sleeping) this.rig.setEyes('open');
    if (!app.voice.talking) this.rig.setMouth('smile');
    const ms = this.rig.play(CLIPS[reaction]) || 1000;
    this.reactingUntil = this.scene.time.now + ms;
    if (MOUTH_BUSY.includes(reaction)) this.busyFor(ms * 0.85);

    // Effets autour du dino (sons, étoiles, bulles…), en plus de l'animation.
    switch (reaction) {
      case 'think':
        this.mark('?', 1500);
        break;
      case 'surprised':
        this.mark('!', 1000);
        break;
      case 'levelUp':
        this.sparkle();
        break;
      case 'roar':
        Sfx.play('roar');
        break;
      case 'celebrate':
        this.starBurst(7);
        this.scene.time.delayedCall(900, () => this.active && this.starBurst(5));
        this.sparkle();
        break;
      case 'burp': {
        Sfx.play('burp');
        const m = this.mouthLocal();
        const bubble = this.scene.add.circle(m.x, m.y, 18, 0xbfe6ff, 0.7).setStrokeStyle(4, 0xffffff);
        this.add(bubble);
        t.add({ targets: bubble, y: m.y - 160, x: m.x + 60, scale: 2.2, duration: 900, ease: 'Sine.easeOut',
          onComplete: () => t.add({ targets: bubble, scale: 3, alpha: 0, duration: 120, onComplete: () => bubble.destroy() }) });
        this.scene.time.delayedCall(1100, () => this.active && this.react('oops'));
        break;
      }
      case 'fart': {
        Sfx.play('fart');
        const back = p.yaw >= 0 ? -1 : 1;
        for (let i = 0; i < 4; i++) {
          const puff = this.scene.add.circle(back * (120 + i * 12), -60 - i * 6, 26, 0xa5d36b, 0.75);
          this.addAt(puff, 0);
          t.add({ targets: puff, x: back * (220 + i * 30), y: -80 - i * 25, scale: 2.4, alpha: 0, duration: 1300,
            delay: 150 + i * 120, onComplete: () => puff.destroy() });
        }
        break;
      }
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
            Sfx.play('gulp');
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

  /** La bouche est prise par une animation : la voix ne la fait pas bouger pendant `ms`. */
  private busyFor(ms: number) {
    this.busy = true;
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

  /** Un « ? » ou un « ! » qui apparaît au-dessus de la tête, avec des petits traits jaunes. */
  private mark(sign: '?' | '!', ms: number) {
    const x = 150, y = -560;
    const text = this.scene.add.text(x, y, sign, {
      fontFamily: FONT, fontSize: '120px', color: '#ffd23f', fontStyle: 'bold', stroke: '#2d3354', strokeThickness: 12,
    }).setOrigin(0.5).setScale(0).setAngle(12);
    const rays = this.scene.add.graphics();
    rays.lineStyle(14, 0xffd23f, 1);
    for (const a of [-0.9, -0.3, 0.3]) {
      rays.lineBetween(x + 80 + Math.cos(a) * 20, y + Math.sin(a) * 60, x + 80 + Math.cos(a) * 70, y + Math.sin(a) * 100);
    }
    rays.setAlpha(0);
    this.add([rays, text]);
    const t = this.scene.tweens;
    t.add({ targets: text, scale: 1, duration: 260, ease: 'Back.easeOut' });
    t.add({ targets: text, y: y - 20, angle: -8, duration: 500, yoyo: true, repeat: Math.max(0, Math.round(ms / 1000) - 1), ease: 'Sine.easeInOut' });
    t.add({ targets: rays, alpha: 1, duration: 150, yoyo: true, repeat: 2 });
    this.scene.time.delayedCall(ms, () => t.add({ targets: [text, rays], alpha: 0, duration: 250,
      onComplete: () => { text.destroy(); rays.destroy(); } }));
  }

  /** Des étoiles jaunes jaillissent autour du dino, tournent et s'effacent. */
  private starBurst(n: number) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI * 1.1 / n) + Phaser.Math.FloatBetween(-0.12, 0.12);
      const r = Phaser.Math.Between(260, 340);
      const star = this.scene.add.image(0, -300, 'ui-star').setScale(0);
      const size = 70 / star.width;
      this.add(star);
      this.scene.tweens.add({
        targets: star, x: Math.cos(a) * r, y: -300 + Math.sin(a) * r, scale: size, angle: 200, duration: 500,
        delay: i * 60, ease: 'Back.easeOut',
        onComplete: () => this.scene.tweens.add({ targets: star, scale: size * 1.25, duration: 220, yoyo: true, repeat: 1,
          onComplete: () => this.scene.tweens.add({ targets: star, alpha: 0, y: star.y - 60, duration: 400,
            onComplete: () => star.destroy() }) }),
      });
    }
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
