import * as THREE from 'three';
import type { DinoModel } from './model';

/**
 * Les « curseurs » de la pose du dino. Les gestes faits par code (tweens
 * Phaser) font varier ces nombres ; `DinoRig.apply()` les ajoute par-dessus
 * l'animation en cours (clip glTF), en rotations d'os.
 * Angles en radians, distances en unités du modèle (le dino mesure ~2,05).
 * Axes du modèle : X vers la gauche du dino (droite de l'écran), Y en haut,
 * Z vers l'avant (vers nous).
 */
export interface Pose {
  /** Orientation de base (le dino se tourne vers le contenu, ou au doigt). */
  yaw: number;
  /** Tour complet en plus de `yaw` (pirouettes). */
  spin: number;
  x: number;
  y: number;
  /** Penché de côté (tout le corps, depuis les pieds). */
  lean: number;
  /** Penché en avant / en arrière. */
  bow: number;
  /** Écrasement vertical (1 = normal), volume conservé. */
  squash: number;
  /** Échelle globale (1 = normal). */
  grow: number;
  breath: number;
  headTilt: number;
  headNod: number;
  headTurn: number;
  headScale: number;
  /** Bras levés (0 = repos, ~2,4 = en l'air). */
  armL: number;
  armR: number;
  /** Bras vers l'avant. */
  armLFwd: number;
  armRFwd: number;
  tail: number;
  tailLift: number;
  legL: number;
  legR: number;
  /** Direction du regard (-1 à 1). */
  eyeX: number;
  eyeY: number;
  /**
   * Mouvement de vie permanent (ajouté au reste, jamais arrêté par les
   * animations) : balancement en rotation, transfert de poids, petit rebond,
   * tête qui flâne.
   */
  sway: number;
  shift: number;
  bob: number;
  look: number;
}

export const restPose = (): Pose => ({
  yaw: 0, spin: 0, x: 0, y: 0, lean: 0, bow: 0, squash: 1, grow: 1, breath: 0,
  headTilt: 0, headNod: 0, headTurn: 0, headScale: 1,
  armL: 0, armR: 0, armLFwd: 0, armRFwd: 0, tail: 0, tailLift: 0, legL: 0, legR: 0, eyeX: 0, eyeY: 0,
  sway: 0, shift: 0, bob: 0, look: 0,
});

export type Mouth = 'smile' | 'open' | 'wide' | 'o' | 'small';
export type Eyes = 'open' | 'happy' | 'closed';

/** Ouverture de la mâchoire pour chaque bouche (0 = fermée en sourire, 1 = ouverte comme le modèle). */
const JAW: Record<Mouth, number> = { smile: 0, small: 0.3, o: 0.65, open: 0.85, wide: 1.3 };
/** Mâchoire fermée : rotation (degrés, axe X du modèle) depuis la bouche ouverte du modèle. */
const JAW_CLOSED = -21;

/** Anciens noms d'os (dino fait par script) → os du nouveau squelette. */
const LEGACY: Record<string, string> = {
  armL: 'hand_l', armR: 'hand_r', eyeL: 'head', eyeR: 'head', chest: 'spine_03', legL: 'thigh_l', legR: 'thigh_r',
};

interface BoneRest {
  bone: THREE.Bone;
  q0: THREE.Quaternion;
  /** Orientation (repère du modèle) du parent au repos. */
  parentQ: THREE.Quaternion;
  parentQInv: THREE.Quaternion;
}

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const TAIL = ['tail_01', 'tail_02', 'tail_03', 'tail_04', 'tail_05', 'tail_06', 'tail_07', 'tail_08'];
/** Les os retouchés par la pose, la bouche ou la tête. */
const TOUCHED = ['head', 'jaw', 'upperarm_l', 'upperarm_r', 'thigh_l', 'thigh_r', ...TAIL];

/**
 * Le squelette animé du dino. Une animation de fond tourne en boucle (`idle`,
 * ou `talk`, `run`, `sleep`…) ; les réactions (`happy`, `wave`…) se jouent une
 * fois par-dessus, en fondu, puis l'animation de fond reprend. La pose (gestes
 * par code), la bouche (`setMouth`, sur l'os de la mâchoire) et les yeux
 * (`setEyes`, sur les paupières) s'ajoutent ensuite.
 */
export class DinoRig {
  readonly pose = restPose();
  private rest = new Map<string, BoneRest>();
  private wink: 'L' | 'R' | null = null;
  private mouth: Mouth = 'smile';
  private eyes: Eyes = 'open';
  private jaw = 0;
  /** Pivot : tout le dino tourne et saute autour de ses pieds. */
  readonly pivot = new THREE.Group();
  readonly mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private base?: THREE.AnimationAction;
  private baseName = '';
  private oneShot?: THREE.AnimationAction;
  private last = performance.now();
  private morph: Record<string, number> = {};
  /**
   * Valeurs écrites par l'animation, avant nos retouches. Le mixer ne réécrit
   * une valeur que si l'animation la change : on remet donc les siennes avant
   * chaque mise à jour, sinon nos retouches s'accumuleraient.
   */
  private pristine = new Map<THREE.Bone, { q: THREE.Quaternion; s: THREE.Vector3 }>();
  private pristineInf?: number[];

  constructor(readonly model: DinoModel) {
    this.pivot.add(model.root);
    model.root.updateMatrixWorld(true);
    const rootInv = model.root.matrixWorld.clone().invert();
    const modelQ = (o: THREE.Object3D) => {
      const m = new THREE.Matrix4().multiplyMatrices(rootInv, o.matrixWorld);
      const q = new THREE.Quaternion();
      m.decompose(new THREE.Vector3(), q, new THREE.Vector3());
      return q;
    };
    for (const [name, bone] of Object.entries(model.bones)) {
      const parentQ = bone.parent ? modelQ(bone.parent) : new THREE.Quaternion();
      this.rest.set(name, { bone, q0: bone.quaternion.clone(), parentQ, parentQInv: parentQ.clone().invert() });
    }
    this.morph = { ...(model.lids?.morphTargetDictionary ?? {}) };
    this.mixer = new THREE.AnimationMixer(model.root);
    for (const clip of model.clips) this.actions.set(clip.name, this.mixer.clipAction(clip));
    this.mixer.addEventListener('finished', (e) => {
      if (e.action !== this.oneShot) return;
      this.oneShot = undefined;
      if (this.base) {
        this.base.enabled = true;
        this.base.setEffectiveWeight(1);
        this.base.crossFadeFrom(e.action as THREE.AnimationAction, 0.25, false);
      }
    });
    this.setBase('idle', 0);
    this.mixer.update(0);
  }

  /** Vrai si le modèle a cette animation. */
  has(name: string) { return this.actions.has(name); }

  /** Durée d'une animation, en millisecondes (0 si elle n'existe pas). */
  duration(name: string) { return (this.actions.get(name)?.getClip().duration ?? 0) * 1000; }

  get background() { return this.baseName; }

  /** Change l'animation de fond (en boucle) : `idle`, `talk`, `run`, `sleep`… */
  setBase(name: string, fade = 0.3) {
    const next = this.actions.get(name);
    if (!next || name === this.baseName) return;
    const prev = this.base;
    this.base = next;
    this.baseName = name;
    next.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    if (this.oneShot) {
      // La réaction en cours finit d'abord ; le nouveau fond reprendra après.
      prev?.stop();
      next.setEffectiveWeight(0);
      return;
    }
    if (prev && fade > 0) next.crossFadeFrom(prev, fade, false);
    else prev?.stop();
  }

  /** Joue une animation une fois, en fondu, puis revient au fond. Renvoie sa durée (ms). */
  play(name: string, fade = 0.15) {
    const a = this.actions.get(name);
    if (!a) return 0;
    const from = this.oneShot ?? this.base;
    if (this.oneShot && this.oneShot !== a) this.oneShot.fadeOut(fade);
    this.oneShot = a;
    a.reset().setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.enabled = true;
    a.setEffectiveWeight(1);
    a.play();
    if (from && from !== a) a.crossFadeFrom(from, fade, false);
    return a.getClip().duration * 1000;
  }

  /** Une réaction (clip joué une fois) est en cours. */
  get reacting() { return !!this.oneShot; }

  setMouth(m: Mouth) { this.mouth = m; }
  get currentMouth() { return this.mouth; }

  setEyes(e: Eyes) { this.eyes = e; }
  /** Clin d'œil : un œil fermé (`null` : les deux yeux comme d'habitude). */
  setWink(side: 'L' | 'R' | null) { this.wink = side; }
  get currentEyes() { return this.eyes; }
  /**
   * Paupières imposées : toutes les formes des animations sont ignorées, seules
   * `blink_l/r` prennent cette valeur (0 ouvert, 1 fermé). `undefined` : comme d'habitude.
   */
  lids?: number;

  /** Rotation ajoutée à un os, exprimée dans les axes du modèle (x, y, z en radians). */
  private add(name: string, x: number, y: number, z: number) {
    const r = this.rest.get(name);
    if (!r || (x === 0 && y === 0 && z === 0)) return;
    tmpQ.setFromEuler(tmpE.set(x, y, z, 'YXZ'));
    // q = P⁻¹ · R · P · q : R appliquée au pivot de l'os, dans le repère du modèle.
    const q = r.parentQInv.clone().multiply(tmpQ).multiply(r.parentQ);
    r.bone.quaternion.premultiply(q);
  }

  /** Avance l'animation (temps réel) puis applique la pose, la bouche et les yeux. */
  apply() {
    const now = performance.now();
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    for (const [bone, v] of this.pristine) { bone.quaternion.copy(v.q); bone.scale.copy(v.s); }
    const inf = this.model.lids?.morphTargetInfluences;
    if (inf && this.pristineInf) this.pristineInf.forEach((v, i) => (inf[i] = v));
    this.mixer.update(dt);
    for (const name of TOUCHED) {
      const b = this.model.bones[name];
      if (!b) continue;
      const v = this.pristine.get(b);
      if (v) { v.q.copy(b.quaternion); v.s.copy(b.scale); } else this.pristine.set(b, { q: b.quaternion.clone(), s: b.scale.clone() });
    }
    if (inf) this.pristineInf = Array.from(inf);

    const p = this.pose;
    const g = p.grow;
    const sq = Math.max(0.3, p.squash);
    const side = 1 / Math.sqrt(sq);
    this.pivot.position.set(p.x, p.y + p.bob, 0);
    this.pivot.rotation.set(p.bow, p.yaw + p.spin + p.sway, p.lean + p.shift, 'YXZ');
    this.pivot.scale.set(g * side, g * sq, g * side);

    this.add('head', p.headNod, p.headTurn + p.look, p.headTilt + p.look * 0.35);
    const head = this.model.bones.head;
    if (head) head.scale.setScalar(p.headScale);
    this.add('upperarm_l', -p.armLFwd, 0, p.armL);
    this.add('upperarm_r', -p.armRFwd, 0, -p.armR);
    this.add('thigh_l', -p.legL, 0, 0);
    this.add('thigh_r', -p.legR, 0, 0);
    TAIL.forEach((n, i) => this.add(n, -p.tailLift * 0.12, p.tail * (0.08 + i * 0.02), 0));

    // Bouche : pilotée par le code, sauf pendant une réaction qui anime sa propre mâchoire.
    const target = JAW[this.mouth];
    this.jaw += (target - this.jaw) * Math.min(1, dt * 22);
    const jr = this.rest.get('jaw');
    if (jr && (this.mouth !== 'smile' || !this.oneShot)) {
      tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(JAW_CLOSED * (1 - this.jaw)));
      jr.bone.quaternion.copy(jr.parentQInv).multiply(tmpQ).multiply(jr.parentQ).multiply(jr.q0);
    }

    if (inf && this.lids !== undefined) {
      inf.fill(0);
      for (const s of ['l', 'r']) if (`blink_${s}` in this.morph) inf[this.morph[`blink_${s}`]] = this.lids;
      return;
    }
    // Yeux : clignements et yeux rieurs des animations, sauf si le code impose un état.
    if (inf && (this.eyes !== 'open' || this.wink)) {
      for (const s of ['l', 'r'] as const) {
        const closed = this.eyes !== 'open' || this.wink === s.toUpperCase();
        const happy = this.eyes === 'happy' && this.wink !== s.toUpperCase();
        const set = (k: string, v: number) => { if (k in this.morph) inf[this.morph[k]] = v; };
        set(`blink_${s}`, closed ? 1 : 0);
        set(`blink_half_${s}`, 0);
        set(`happy_${s}`, happy ? 1 : 0);
      }
    }
  }

  /** Position (repère du monde 3D) d'un os ou d'une pièce. */
  worldPoint(name: string, out = new THREE.Vector3()) {
    const o = this.model.bones[LEGACY[name] ?? name] ?? this.model.parts[name];
    return o ? o.getWorldPosition(out) : out.set(0, 1, 0);
  }

  /** L'os qui porte un repère (accepte les anciens noms : `armL`, `eyeL`…). */
  bone(name: string) { return this.model.bones[LEGACY[name] ?? name]; }
}
