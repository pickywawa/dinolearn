import * as THREE from 'three';
import type { DinoModel } from './model';

/**
 * Les « curseurs » de la pose du dino. Les animations (tweens Phaser) font
 * varier ces nombres ; `DinoRig.apply()` les traduit en rotations d'os.
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
}

export const restPose = (): Pose => ({
  yaw: 0, spin: 0, x: 0, y: 0, lean: 0, bow: 0, squash: 1, grow: 1, breath: 0,
  headTilt: 0, headNod: 0, headTurn: 0, headScale: 1,
  armL: 0, armR: 0, armLFwd: 0, armRFwd: 0, tail: 0, tailLift: 0, legL: 0, legR: 0, eyeX: 0, eyeY: 0,
});

export type Mouth = 'smile' | 'open' | 'wide' | 'o' | 'small';
export type Eyes = 'open' | 'happy' | 'closed';

interface BoneRest {
  bone: THREE.Bone;
  q0: THREE.Quaternion;
  p0: THREE.Vector3;
  s0: THREE.Vector3;
  /** Orientation (repère du modèle) du parent au repos. */
  parentQ: THREE.Quaternion;
  parentQInv: THREE.Quaternion;
}

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export class DinoRig {
  readonly pose = restPose();
  private rest = new Map<string, BoneRest>();
  private mouthParts: Record<Mouth, THREE.Object3D[]> = { smile: [], open: [], wide: [], o: [], small: [] };
  private eyeParts: Record<Eyes, THREE.Object3D[]> = { open: [], happy: [], closed: [] };
  private mouth: Mouth = 'smile';
  private eyes: Eyes = 'open';
  /** Pivot : tout le dino tourne et saute autour de ses pieds. */
  readonly pivot = new THREE.Group();

  constructor(readonly model: DinoModel) {
    this.pivot.add(model.root);
    model.root.updateMatrixWorld(true);
    const rootInv = model.root.matrixWorld.clone().invert();
    const modelQ = (o: THREE.Object3D) => {
      const m = new THREE.Matrix4().multiplyMatrices(rootInv, o.matrixWorld);
      return new THREE.Quaternion().setFromRotationMatrix(m);
    };
    for (const [name, bone] of Object.entries(model.bones)) {
      const parentQ = bone.parent ? modelQ(bone.parent) : new THREE.Quaternion();
      this.rest.set(name, {
        bone, q0: bone.quaternion.clone(), p0: bone.position.clone(), s0: bone.scale.clone(),
        parentQ, parentQInv: parentQ.clone().invert(),
      });
    }
    for (const [name, o] of Object.entries(model.parts)) {
      const m = /^mouth(smile|open|wide|o|small)/.exec(name);
      if (m) this.mouthParts[m[1] as Mouth].push(o);
      const e = /^eye[LR](white|iris|pupil|shine1|shine2|closed|happy)$/.exec(name);
      if (e) this.eyeParts[e[1] === 'closed' ? 'closed' : e[1] === 'happy' ? 'happy' : 'open'].push(o);
    }
    this.setMouth('smile');
    this.setEyes('open');
  }

  setMouth(m: Mouth) {
    this.mouth = m;
    for (const [k, parts] of Object.entries(this.mouthParts)) parts.forEach((p) => (p.visible = k === m));
  }

  get currentMouth() { return this.mouth; }

  setEyes(e: Eyes) {
    this.eyes = e;
    for (const [k, parts] of Object.entries(this.eyeParts)) parts.forEach((p) => (p.visible = k === e));
  }

  get currentEyes() { return this.eyes; }

  /** Rotation d'un os exprimée dans les axes du modèle (x, y, z en radians). */
  private rot(name: string, x: number, y: number, z: number) {
    const r = this.rest.get(name);
    if (!r) return;
    tmpQ.setFromEuler(tmpE.set(x, y, z, 'YXZ'));
    // q = P⁻¹ · R · P · q0 : R appliquée au pivot de l'os, dans le repère du modèle.
    r.bone.quaternion.copy(r.parentQInv).multiply(tmpQ).multiply(r.parentQ).multiply(r.q0);
  }

  private scale(name: string, sx: number, sy: number, sz: number) {
    const r = this.rest.get(name);
    if (r) r.bone.scale.set(r.s0.x * sx, r.s0.y * sy, r.s0.z * sz);
  }

  /** Décale un os (axes du modèle, au repos). */
  private offset(name: string, x: number, y: number, z: number) {
    const r = this.rest.get(name);
    if (!r) return;
    const v = new THREE.Vector3(x, y, z).applyQuaternion(r.parentQInv);
    r.bone.position.copy(r.p0).add(v);
  }

  apply() {
    const p = this.pose;
    const g = p.grow;
    const sq = Math.max(0.3, p.squash);
    const side = 1 / Math.sqrt(sq);
    this.pivot.position.set(p.x, p.y, 0);
    this.pivot.rotation.set(p.bow, p.yaw + p.spin, p.lean, 'YXZ');
    this.pivot.scale.set(g * side, g * sq, g * side);

    const b = 1 + p.breath * 0.03;
    this.scale('chest', b, 1 + p.breath * 0.015, b);
    this.rot('head', p.headNod, p.headTurn, p.headTilt);
    this.scale('head', p.headScale, p.headScale, p.headScale);
    this.rot('armL', p.armLFwd, 0, p.armL);
    this.rot('armR', p.armRFwd, 0, -p.armR);
    this.rot('legL', -p.legL, 0, 0);
    this.rot('legR', -p.legR, 0, 0);
    this.rot('tail1', -p.tailLift * 0.5, p.tail * 0.5, 0);
    this.rot('tail2', -p.tailLift * 0.3, p.tail * 0.6, 0);
    this.rot('tail3', -p.tailLift * 0.3, p.tail * 0.8, 0);
    const ex = THREE.MathUtils.clamp(p.eyeX, -1, 1) * 0.04;
    const ey = THREE.MathUtils.clamp(p.eyeY, -1, 1) * 0.04;
    this.offset('eyeL', ex, ey, 0);
    this.offset('eyeR', ex, ey, 0);
  }

  /** Position (repère du monde 3D) d'un os ou d'une pièce. */
  worldPoint(name: string, out = new THREE.Vector3()) {
    const o = this.model.bones[name] ?? this.model.parts[name];
    return o ? o.getWorldPosition(out) : out.set(0, 1, 0);
  }
}
