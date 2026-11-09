import * as THREE from 'three';
import { itemById, type Slot } from '../content/items';
import { ITEMS_URL, loadedGltf, type DinoModel } from './model';

/**
 * Les objets de `items.glb` ont été modélisés sur l'ancien dino (fait par
 * script). Pour chaque emplacement : l'os qui le porte, et le recalage de
 * l'ancien dino vers celui-ci (point d'ancrage avant → après, échelle),
 * dans le repère du modèle (Y en haut, Z vers l'avant).
 */
const SLOTS: Record<Slot, { bone: string; from: [number, number, number]; to: [number, number, number]; scale: number }> = {
  head: { bone: 'head', from: [0, 1.72, 0], to: [0, 1.94, 0.16], scale: 1.05 },
  eyes: { bone: 'head', from: [0, 1.52, 0.55], to: [0, 1.235, 0.65], scale: 1.12 },
  neck: { bone: 'neck_01', from: [0, 0.95, 0], to: [0, 0.77, 0.02], scale: 0.95 },
  back: { bone: 'spine_03', from: [0, 0.65, -0.3], to: [0, 0.62, -0.28], scale: 0.95 },
  hand: { bone: 'hand_l', from: [0.595, 0.605, 0.158], to: [0.333, 0.406, 0.124], scale: 0.85 },
  // Posé par terre, à côté du pied droit du dino.
  floor: { bone: 'root', from: [0.595, 0.605, 0.158], to: [-0.6, 0.3, 0.2], scale: 1 },
  // Autour du ventre (bouée).
  waist: { bone: 'pelvis', from: [0, 0, 0], to: [0, 0.4, 0.02], scale: 1 },
};

/**
 * Réglages par objet, par-dessus ceux de l'emplacement : ancrage (`to`), échelle,
 * rotation autour de l'ancrage (radians, axes du modèle) et écrasement vertical
 * (capes). Mesurés pour que rien ne rentre dans le dino ni ne flotte à côté.
 */
export interface Fit {
  to?: [number, number, number];
  scale?: number;
  /** Étirement par axe (après l'échelle), autour de l'ancrage. */
  stretch?: [number, number, number];
  rot?: [number, number, number];
  /** Point de l'objet (repère d'origine) placé en `to`, au lieu de l'ancrage de l'emplacement. */
  pivot?: [number, number, number];
  stretchY?: number;
  /**
   * Courbe l'objet autour d'un axe vertical placé à cette profondeur (z, repère
   * du dino) : une cape plate épouse ainsi l'arrondi du dos.
   */
  bend?: number;
  /**
   * Pan qui pend depuis `to` (cape) : il se soulève sur sa charnière quand la
   * queue ou un bras passe dessous, au lieu de les traverser.
   */
  flap?: 'cape' | 'wings';
  /**
   * Sangle refaite autour de la tête (lunettes de plongée) : la droite d'origine
   * ne pouvait pas épouser la tête et la collerette.
   */
  strap?: boolean;
  /** Drapé : chaque point est repoussé derrière la peau du dos (écart en unités du dino). */
  drape?: number;
  /** Pièces de l'objet à ne pas montrer (fin du nom du maillage). */
  hide?: string[];
}
const CAPE: Fit = {
  to: [0, 0.8, -0.3], pivot: [0, 1.02, -0.22], scale: 0.95, stretch: [0.8, 1, 1], stretchY: 0.5,
  rot: [-1, 0, 0], hide: ['collar'], bend: 1, drape: 0.03, flap: 'cape',
};

export const FIT: Record<string, Fit> = {
  // Chapeaux : posés sur le front, devant la collerette, un peu penchés vers l'avant.
  // Haut-de-forme, toque et couronne : posés sur les cornes du front, devant la collerette.
  'top-hat': { to: [-0.07, 1.607, 0.38], rot: [0.55, 0, 0], scale: 0.85 },
  'womans-hat': { to: [0, 1.919, 0.3], scale: 1.1, rot: [0.3, 0, 0] },
  crown: { to: [-0.07, 1.506, 0.45], rot: [0.55, 0, 0], scale: 0.65 },
  'graduation-cap': { to: [-0.07, 1.557, 0.38], rot: [0.45, 0, 0], scale: 0.85 },
  'billed-cap': { to: [0, 1.772, 0.18], rot: [0.15, 0, 0] },
  // Casque de pompier : plus grand, il descend sur les côtés de la collerette.
  'rescue-workers-helmet': { to: [0, 1.823, 0.12], scale: 1.32, rot: [-0.1, 0, 0] },
  headphone: { to: [0, 1.47, 0.19] },
  hibiscus: { to: [-0.063, 1.65, 0.078] },
  // Lunettes : au ras du museau.
  // Les yeux du modèle sont 3 cm à droite du dino (à gauche à l'écran).
  glasses: { to: [-0.03, 1.235, 0.6] },
  sunglasses: { to: [-0.03, 1.235, 0.6] },
  goggles: { to: [-0.03, 1.29, 0.6], hide: ['strap'], strap: true },
  // Cou : sous le menton, penchés vers l'avant, assez larges pour les épaules.
  ribbon: { to: [0, 0.56, 0.103], stretch: [1, 1, 0.6] },
  'prayer-beads': { to: [0, 0.74, 0.03], scale: 0.75, stretch: [1.55, 1, 1.47], rot: [0.2, 0, 0] },
  'sports-medal': { to: [0, 0.71, 0.02], rot: [0.4, 0, 0] },
  // Ailes : sous la collerette, contre le dos ; elles se replient quand un bras passe.
  wing: { to: [0, 0.5, -0.111], scale: 0.8, flap: 'wings' },
  // Bouée : autour du ventre, les mains posées dessus.
  'swim-ring': { to: [0, 0.5, 0], stretch: [1.2, 1, 1.08] },
  // Nounours : assis par terre, à côté du pied droit.
  'teddy-bear': { to: [-0.6, 0.19, -0.045] },
  // Capes : sans le col (il traversait le cou), drapées sur le dos sous la collerette, jusqu'à la queue.
  'cape-red': CAPE,
  'cape-blue': CAPE,
};

function slotMatrix(slot: Slot, id: string) {
  const s = SLOTS[slot];
  const f = FIT[id] ?? {};
  const scale = f.scale ?? s.scale;
  const m = new THREE.Matrix4().makeTranslation(...(f.to ?? s.to));
  if (f.rot) m.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...f.rot, 'YXZ')));
  if (f.stretch) m.multiply(new THREE.Matrix4().makeScale(...f.stretch));
  m.multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(...(f.pivot ?? s.from).map((v) => -v) as [number, number, number]));
  if (f.stretchY) {
    m.multiply(new THREE.Matrix4().makeTranslation(0, 1.04, 0))
      .multiply(new THREE.Matrix4().makeScale(1, f.stretchY, 1))
      .multiply(new THREE.Matrix4().makeTranslation(0, -1.04, 0));
  }
  return m;
}

/**
 * Les objets 3D portés par le dino (`public/models/items.glb`, un nœud par
 * objet, fabriqué par `tools/blender/build_items.py`). Chaque objet est
 * recalé sur le dino dans sa pose de repos, puis accroché à l'os de son
 * emplacement : il suit les animations. S'occupe aussi de la jauge de
 * croissance sur le ventre.
 */
export class Accessories {
  private handGrips = new Map<string, Held>();
  /** Points de peau suivis pour les objets tenus (pris au premier objet en main). */
  private heldSkin?: { mesh: THREE.SkinnedMesh; index: number; bone: string }[];
  private worn = new Map<string, THREE.Object3D>();
  private flaps = new Map<string, Flap>();
  private restSkin = new Map<THREE.SkinnedMesh, Float32Array>();
  /** Matrice (repère du pivot) inverse de chaque os dans la pose de référence. */
  private restInv = new Map<string, THREE.Matrix4>();

  constructor(private model: DinoModel) {
    // Pose de référence : celle du dino à sa création (début de l'animation de repos), pivot au repos.
    model.root.parent?.updateMatrixWorld(true);
    model.root.updateMatrixWorld(true);
    const pivotInv = model.root.parent ? model.root.parent.matrixWorld.clone().invert() : new THREE.Matrix4();
    for (const [name, bone] of Object.entries(model.bones)) {
      const m = new THREE.Matrix4().multiplyMatrices(pivotInv, bone.matrixWorld);
      this.restInv.set(name, m.invert());
    }
    this.restInv.set('root', new THREE.Matrix4().multiplyMatrices(pivotInv, model.root.matrixWorld).invert());
    // Peau au repos (repère du dino), pour savoir ce qui bouge sous une cape.
    model.root.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh || mesh === model.lids) return;
      const n = mesh.geometry.attributes.position.count;
      const pos = new Float32Array(n * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < n; i++) {
        mesh.getVertexPosition(i, v).applyMatrix4(mesh.matrixWorld).applyMatrix4(pivotInv);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      this.restSkin.set(mesh, pos);
    });
  }

  dress(ids: readonly string[]) {
    for (const [id, node] of this.worn) {
      if (!ids.includes(id)) {
        node.removeFromParent();
        this.worn.delete(id);
        this.handGrips.delete(id);
        for (const key of [...this.flaps.keys()]) if (key === id || key.startsWith(`${id}:`)) this.flaps.delete(key);
      }
    }
    const gltf = loadedGltf(ITEMS_URL);
    if (!gltf) return;
    for (const id of ids) {
      if (this.worn.has(id)) continue;
      const item = itemById(id);
      const src = gltf.scene.getObjectByName(id) ?? PROCEDURAL[id]?.();
      if (!item || !src) continue;
      const node = src.clone(true);
      node.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.material = toyMaterial(mesh.material as THREE.MeshStandardMaterial);
        if (FIT[id]?.hide?.some((h) => mesh.name.endsWith(h))) mesh.visible = false;
      });
      const boneName = SLOTS[item.slot].bone;
      // Le sol (nounours posé) : accroché au modèle entier, pas à un os.
      const bone: THREE.Object3D | undefined = boneName === 'root' ? this.model.root : this.model.bones[boneName];
      if (!bone) continue;
      // Position de l'objet sur l'ancien dino → recalée sur celui-ci → repère de l'os au repos.
      src.updateWorldMatrix(true, false);
      node.matrixAutoUpdate = true;
      const fitted = slotMatrix(item.slot, id);
      const bend = FIT[id]?.bend;
      if (bend !== undefined) bendAround(src, node, fitted, bend);
      const drape = FIT[id]?.drape;
      if (drape !== undefined) this.drapeOver(src, node, fitted, drape);
      const local = new THREE.Matrix4().multiplyMatrices(this.restInv.get(boneName)!, fitted).multiply(src.matrixWorld);
      local.decompose(node.position, node.quaternion, node.scale);
      node.userData.itemId = id;
      if (FIT[id]?.strap) this.fitStrap(node, boneName);
      const flapKind = FIT[id]?.flap;
      if (flapKind) {
        // Pans articulés : un conteneur (repère de l'os) porte une charnière par pan.
        const holder = new THREE.Group();
        holder.userData.itemId = id;
        bone.add(holder);
        const back = new THREE.Vector3(0, 0, -1);
        if (flapKind === 'cape') {
          const flap = this.makeFlap(node, boneName, new THREE.Vector3(...FIT[id].to!), new THREE.Vector3(0, -1, 0), back);
          holder.add(flap.hinge);
          this.flaps.set(id, flap);
        } else {
          // Ailes : chacune pivote autour d'un axe vertical à sa racine, contre le dos.
          for (const sign of [1, -1]) {
            const wing = node.clone(true);
            wing.traverse((o) => {
              if ((o as THREE.Mesh).isMesh && (o.name.includes('-') !== (sign < 0))) o.visible = false;
            });
            holder.add(wing);
            const pts = this.restPoints(wing, boneName);
            holder.remove(wing);
            const root = Math.min(...pts.map((q) => q.x * sign));
            const near = pts.filter((q) => q.x * sign < root + 0.06);
            const at = near.reduce((acc, q) => acc.add(q), new THREE.Vector3()).divideScalar(Math.max(1, near.length));
            const flap = this.makeFlap(wing, boneName, at, new THREE.Vector3(sign, 0, 0), back);
            holder.add(flap.hinge);
            this.flaps.set(`${id}:${sign}`, flap);
          }
        }
        this.worn.set(id, holder);
      } else {
        bone.add(node);
        this.worn.set(id, node);
      }
      if (item.slot === 'hand') this.holdInHand(id, node, bone as THREE.Bone);
    }
  }

  /**
   * Sangle autour de la tête, à la hauteur des verres : elle part du bord
   * extérieur d'un verre, fait le tour par l'arrière en suivant le contour de
   * la tête et de la collerette (un peu au-dessus de la peau), et rejoint l'autre verre.
   */
  private fitStrap(node: THREE.Object3D, boneName: string) {
    const original = node.getObjectByProperty('name', `${node.name}_strap`) as THREE.Mesh | undefined
      ?? node.children.find((c) => c.name.endsWith('strap')) as THREE.Mesh | undefined;
    const pts = this.restPoints(node, boneName);
    if (!pts.length) return;
    // Bords extérieurs des verres.
    const right = pts.reduce((a, q) => (q.x > a.x ? q : a));
    const left = pts.reduce((a, q) => (q.x < a.x ? q : a));
    const y = (right.y + left.y) / 2;
    // Tranche de peau à cette hauteur.
    const slice: THREE.Vector3[] = [];
    for (const pos of this.restSkin.values()) {
      for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i + 1] - y) < 0.05) slice.push(new THREE.Vector3(pos[i], y, pos[i + 2]));
    }
    if (!slice.length) return;
    const c = new THREE.Vector3((right.x + left.x) / 2, y, slice.reduce((a, q) => a + q.z, 0) / slice.length);
    const angle = (q: THREE.Vector3) => Math.atan2(q.x - c.x, q.z - c.z);
    const a0 = angle(right), a1 = angle(left) + 2 * Math.PI;
    const path: THREE.Vector3[] = [right.clone()];
    const steps = 20;
    for (let k = 1; k < steps; k++) {
      const a = a0 + ((a1 - a0) * k) / steps;
      let r = 0;
      for (const q of slice) {
        let d = angle(q) - a;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < 0.3) r = Math.max(r, Math.hypot(q.x - c.x, q.z - c.z));
      }
      r = Math.max(r + 0.035, 0.2);
      path.push(new THREE.Vector3(c.x + r * Math.sin(a), y, c.z + r * Math.cos(a)));
    }
    path.push(left.clone());
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 96, 0.022, 8, false);
    const material = original
      ? (original.material as THREE.Material)
      : toyMaterial(new THREE.MeshStandardMaterial({ color: 0x3d405b }));
    const strap = new THREE.Mesh(tube, material);
    strap.name = `${node.name}_fitted_strap`;
    // Repère du dino au repos → repère de l'os → repère de l'objet.
    node.updateMatrix();
    strap.applyMatrix4(node.matrix.clone().invert().multiply(this.restInv.get(boneName)!));
    node.add(strap);
  }

  /**
   * Drapé d'un pan sur le dos : chaque sommet (repère du dino au repos) est
   * repoussé vers l'arrière jusqu'à rester à `gap` derrière la peau la plus
   * en arrière à sa hauteur et sa largeur. Le pan épouse ainsi le dos puis
   * s'évase sur les fesses et la queue. Jamais tiré vers l'avant.
   */
  private drapeOver(src: THREE.Object3D, copy: THREE.Object3D, fitted: THREE.Matrix4, gap: number) {
    const cell = 0.05;
    const back = new Map<string, number>();
    const key = (x: number, y: number) => `${Math.round(x / cell)},${Math.round(y / cell)}`;
    for (const pos of this.restSkin.values()) {
      for (let i = 0; i < pos.length; i += 3) {
        const k = key(pos[i], pos[i + 1]);
        back.set(k, Math.min(back.get(k) ?? Infinity, pos[i + 2]));
      }
    }
    const behind = (x: number, y: number) => {
      let z = Infinity;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) z = Math.min(z, back.get(key(x + i * cell, y + j * cell)) ?? Infinity);
      return z;
    };
    const sources: THREE.Mesh[] = [];
    const copies: THREE.Mesh[] = [];
    src.traverse((o) => { if ((o as THREE.Mesh).isMesh) sources.push(o as THREE.Mesh); });
    copy.traverse((o) => { if ((o as THREE.Mesh).isMesh) copies.push(o as THREE.Mesh); });
    sources.forEach((s, n) => {
      const c = copies[n];
      if (!c || !c.visible) return;
      s.updateWorldMatrix(true, false);
      const m = fitted.clone().multiply(s.matrixWorld);
      const inv = m.clone().invert();
      const geo = c.geometry.clone();
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let k = 0; k < pos.count; k++) {
        v.fromBufferAttribute(pos, k).applyMatrix4(m);
        const limit = behind(v.x, v.y) - gap;
        if (v.z > limit) v.z = limit;
        v.applyMatrix4(inv);
        pos.setXYZ(k, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      c.geometry = geo;
    });
  }

  /** Points (repère du dino au repos) des maillages visibles d'un objet posé sur un os. */
  private restPoints(node: THREE.Object3D, boneName: string) {
    const rest = this.restInv.get(boneName)!.clone().invert();
    const pts: THREE.Vector3[] = [];
    node.updateMatrix();
    node.updateMatrixWorld(true);
    const toNode = node.matrixWorld.clone().invert();
    node.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      const pos = mesh.geometry.attributes.position;
      // Sommet → repère de l'objet → repère de l'os → repère du dino au repos.
      const m = rest.clone().multiply(node.matrix).multiply(toNode).multiply(mesh.matrixWorld);
      for (let i = 0; i < pos.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m));
    });
    return pts;
  }

  /**
   * Charnière d'un pan (cape, aile) placée en `hingeAt` (repère du dino au
   * repos). Le pan part de la charnière dans la direction `down` et se soulève
   * vers `back`, en tournant autour de `side`. On mesure le pan au repos
   * (longueur, largeur, angle) et on choisit les points de peau qui pourraient
   * passer dessous.
   */
  private makeFlap(node: THREE.Object3D, boneName: string, hingeAt: THREE.Vector3, down: THREE.Vector3, back: THREE.Vector3): Flap {
    const rest = this.restInv.get(boneName)!.clone().invert();
    const side = new THREE.Vector3().crossVectors(down, back);
    const hinge = new THREE.Group();
    hinge.position.copy(hingeAt.clone().applyMatrix4(this.restInv.get(boneName)!));
    const restQ = new THREE.Quaternion();
    rest.decompose(new THREE.Vector3(), restQ, new THREE.Vector3());
    const axis = side.clone().applyQuaternion(restQ.clone().invert());
    const pts = this.restPoints(node, boneName);
    node.position.sub(hinge.position);
    hinge.add(node);
    const frame = { top: hingeAt, down, back, side };
    const flat = pts.map((q) => toFlap(frame, q));
    let length = 0, halfWidth = 0, sum = 0, n = 0;
    for (const q of flat) {
      length = Math.max(length, Math.hypot(q.a, q.b));
      halfWidth = Math.max(halfWidth, Math.abs(q.s));
    }
    for (const q of flat) {
      if (Math.hypot(q.a, q.b) > length * 0.6 && Math.abs(q.s) < halfWidth * 0.5) {
        sum += Math.atan2(q.b, q.a);
        n++;
      }
    }
    const restAngle = n ? sum / n : 0;
    // Angle du pan selon l'endroit (largeur, distance à la charnière) : une cape courbée avance sur les côtés.
    const cell = (x: number, d: number) => `${Math.round(x / 0.06)},${Math.round(d / 0.06)}`;
    const capeAngle = new Map<string, number>();
    for (const q of flat) {
      const k = cell(q.s, Math.hypot(q.a, q.b));
      capeAngle.set(k, Math.min(capeAngle.get(k) ?? Infinity, Math.atan2(q.b, q.a)));
    }
    /** Angle du pan à cet endroit ; `Infinity` s'il n'y a pas de pan là. */
    const localAngle = (x: number, d: number) => {
      let best = Infinity;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        best = Math.min(best, capeAngle.get(cell(x + i * 0.06, d + j * 0.06)) ?? Infinity);
      }
      return best;
    };
    // Points de peau à surveiller : du côté du pan, à sa portée (un sur six suffit).
    const skin: Flap['skin'] = [];
    const v = new THREE.Vector3();
    for (const [mesh, pos] of this.restSkin) {
      for (let i = 0; i < pos.length / 3; i += 6) {
        const p = toFlap(frame, v.fromArray(pos, i * 3));
        const d = Math.hypot(p.a, p.b);
        if (p.a < -0.05 || Math.abs(p.s) > halfWidth + 0.1 || d > length + 0.15) continue;
        // Seuls comptent les points devant le pan au repos (corps, queue dessous) : ils ne doivent pas le traverser.
        const here = localAngle(p.s, Math.min(d, length));
        const phi = Math.atan2(p.b, p.a);
        if (here < Infinity && phi > here) continue;
        // Un point déjà tout près du pan au repos ne le soulève pas tant qu'il ne s'en approche pas davantage.
        skin.push({ mesh, index: i, slack: here < Infinity ? Math.max(0, phi + FLAP_MARGIN - here) : 0 });
      }
    }
    return { hinge, axis, bone: boneName, ...frame, rest, length, halfWidth, restAngle, lift: 0, skin, localAngle };
  }

  /** Soulève chaque pan juste assez pour passer au-dessus de la queue et des bras. */
  private updateFlaps() {
    const v = new THREE.Vector3();
    for (const flap of this.flaps.values()) {
      const bone = this.model.bones[flap.bone];
      if (!bone) continue;
      // Repère du pan au repos : où sont la queue, les hanches et les bras par rapport à lui ?
      const toRest = flap.rest.clone().multiply(bone.matrixWorld.clone().invert());
      let target = 0;
      for (const { mesh, index, slack } of flap.skin) {
        const p = toFlap(flap, mesh.getVertexPosition(index, v).applyMatrix4(mesh.matrixWorld).applyMatrix4(toRest));
        const d = Math.hypot(p.a, p.b);
        if (p.a < -0.05 || d > flap.length + 0.05) continue;
        const here = flap.localAngle(p.s, Math.min(d, flap.length));
        if (here < Infinity) target = Math.max(target, Math.atan2(p.b, p.a) + FLAP_MARGIN - here - slack);
      }
      target = Math.min(1.3, target);
      // Monte vite (pas de traversée), redescend en douceur.
      flap.lift += (target - flap.lift) * (target > flap.lift ? 0.6 : 0.12);
      flap.hinge.quaternion.setFromAxisAngle(flap.axis, flap.lift);
    }
  }

  /**
   * Objet tenu : on retient le point de prise (dans la main, et sur l'objet —
   * pour le ballon, le bas du fil) et quelques points de l'objet pour tester
   * qu'il ne rentre pas dans le dino.
   */
  private holdInHand(id: string, node: THREE.Object3D, bone: THREE.Bone) {
    // Tout se calcule dans la pose de repos : l'habillage peut arriver en pleine animation.
    const restInv = this.restInv.get(bone.name) ?? this.restInv.get(SLOTS.hand.bone)!;
    const rest = restInv.clone().invert();
    node.updateMatrix();
    node.updateMatrixWorld(true);
    const nodeInv = node.matrix.clone().invert();
    const grip = new THREE.Vector3(...SLOTS.hand.to).applyMatrix4(restInv);
    let localGrip = grip.clone().applyMatrix4(nodeInv);
    const pts: THREE.Vector3[] = [];
    let stringEnd: THREE.Vector3 | undefined;
    let lowest = Infinity;
    const toNode = node.matrixWorld.clone().invert();
    const toRest = rest.clone().multiply(node.matrix);
    node.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      const m = toNode.clone().multiply(mesh.matrixWorld);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const q = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m);
        pts.push(q);
        if (mesh.name.endsWith('string')) {
          const y = q.clone().applyMatrix4(toRest).y;
          if (y < lowest) { lowest = y; stringEnd = q.clone(); }
        }
      }
    });
    if (stringEnd) localGrip = stringEnd;
    // Axe de l'objet : de la prise vers le centre de ce qui dépasse de la main.
    const far = pts.filter((q) => q.distanceTo(localGrip) > 0.25 / node.scale.x);
    const center = (far.length ? far : pts).reduce((a, q) => a.add(q), new THREE.Vector3()).divideScalar(Math.max(1, (far.length ? far : pts).length));
    const axis = center.clone().sub(localGrip).normalize();
    // Une soixantaine de points, au-delà des doigts.
    const out = pts.filter((q) => q.distanceTo(localGrip) > 0.1 / node.scale.x);
    const step = Math.max(1, Math.floor(out.length / 60));
    const samples = out.filter((_, i) => i % step === 0);
    const side = Math.sign(new THREE.Vector3().setFromMatrixPosition(rest).x) || 1;
    const hand = bone.name.endsWith('_r') ? '_r' : '_l';
    // La main qui tient (paume, doigts, avant-bras) ne compte pas comme obstacle.
    const holding = Object.keys(this.model.bones)
      .filter((n) => n.endsWith(hand) && /^(hand|lowerarm|index|middle|pinky|ring|thumb)_/.test(n));
    this.handGrips.set(id, {
      grip, localGrip, holding, scale: node.scale.clone(), axis, samples, side,
      balloon: !!stringEnd, lean: stringEnd ? 0.08 : 0.3, tilt: stringEnd ? 0.08 : 0.3, turn: 0,
    });
    if (!this.heldSkin) {
      // Un sommet sur trois, avec l'os qui le porte surtout (pour ignorer la main qui tient).
      this.heldSkin = [];
      for (const mesh of this.restSkin.keys()) {
        const idx = mesh.geometry.attributes.skinIndex;
        const wt = mesh.geometry.attributes.skinWeight;
        for (let i = 0; i < idx.count; i += 3) {
          let best = 0;
          for (let k = 1; k < 4; k++) if (wt.getComponent(i, k) > wt.getComponent(i, best)) best = k;
          this.heldSkin.push({ mesh, index: i, bone: mesh.skeleton.bones[idx.getComponent(i, best)]?.name ?? '' });
        }
      }
    }
  }

  /**
   * Objets tenus : accrochés au point de prise, orientés par la gravité (le
   * ballon reste droit au-dessus de la main), penchés vers l'extérieur juste
   * assez pour ne jamais rentrer dans le dino pendant les gestes.
   */
  private updateHeld() {
    const pivot = this.model.root.parent!;
    const pivotQ = pivot.getWorldQuaternion(new THREE.Quaternion());
    // Peau du dino maintenant, rangée dans une grille.
    const cell = 0.08;
    const grid = new Map<number, { v: THREE.Vector3; bone: string }[]>();
    const key = (x: number, y: number, z: number) => (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512);
    for (const { mesh, index, bone } of this.heldSkin ?? []) {
      const v = mesh.getVertexPosition(index, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
      const k = key(Math.floor(v.x / cell), Math.floor(v.y / cell), Math.floor(v.z / cell));
      (grid.get(k) ?? grid.set(k, []).get(k)!).push({ v, bone });
    }
    const clearOf = (p: THREE.Vector3, r: number, skip: string[]) => {
      const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell);
      for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) {
        for (const s of grid.get(key(x, y, z)) ?? []) if (!skip.includes(s.bone) && s.v.distanceToSquared(p) < r * r) return false;
      }
      return true;
    };
    const worldUp = new THREE.Vector3(0, 1, 0);
    for (const [id, held] of this.handGrips) {
      const node = this.worn.get(id)!;
      const parent = node.parent!;
      const gripWorld = parent.localToWorld(held.grip.clone());
      const parentQInv = parent.getWorldQuaternion(new THREE.Quaternion()).invert();
      // Haut et extérieur : la gravité pour le ballon, le dino pour les autres objets.
      const up = held.balloon ? worldUp.clone() : worldUp.clone().applyQuaternion(pivotQ);
      const out = new THREE.Vector3(held.side, 0, 0).applyQuaternion(pivotQ);
      out.addScaledVector(up, -out.dot(up)).normalize();
      const base = held.balloon ? new THREE.Quaternion() : pivotQ.clone();
      const axisNow = held.axis.clone().applyQuaternion(base);
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(pivotQ);
      fwd.addScaledVector(up, -fwd.dot(up)).normalize();
      // Inclinaison 0 : l'objet pointe vers le haut ; puis il penche vers l'extérieur (et vers l'avant au besoin).
      const place = (tilt: number, turn: number) => {
        const lean = out.clone().multiplyScalar(Math.cos(turn)).addScaledVector(fwd, Math.sin(turn));
        const dir = up.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(lean, Math.sin(tilt));
        const q = new THREE.Quaternion().setFromUnitVectors(axisNow, dir).multiply(base);
        node.quaternion.copy(parentQInv).multiply(q);
        node.scale.copy(held.scale);
        const gripLocal = parent.worldToLocal(gripWorld.clone());
        node.position.copy(gripLocal.sub(held.localGrip.clone().multiply(node.scale).applyQuaternion(node.quaternion)));
        node.updateMatrixWorld(true);
      };
      const hits = () => held.samples.reduce((n, q) => n + (clearOf(q.clone().applyMatrix4(node.matrixWorld), 0.035, held.holding) ? 0 : 1), 0);
      // Le plus droit possible sans toucher le dino (la main qui tient ne compte pas).
      let best = { tilt: held.lean, turn: 0, hits: Infinity };
      search: for (let tilt = held.lean; tilt <= 1.45; tilt += 0.1) {
        for (const turn of [0, 0.7, 1.3]) {
          place(tilt, turn);
          const n = hits();
          if (n < best.hits) best = { tilt, turn, hits: n };
          if (n === 0) break search;
        }
      }
      const target = best.tilt;
      held.turn += (best.turn - held.turn) * (best.turn > held.turn ? 0.5 : 0.1);
      held.tilt += (target - held.tilt) * (target > held.tilt ? 0.5 : 0.1);
      place(held.tilt, held.turn);
    }
  }

  /** Objets articulés et objets tenus, après la pose du squelette. */
  update() {
    this.model.root.parent?.updateMatrixWorld(true);
    if (this.flaps.size) this.updateFlaps();
    if (this.handGrips.size) this.updateHeld();
  }

  hit(ray: THREE.Raycaster): string | undefined {
    const visible = [...this.worn.values()].filter((n) => n.visible);
    const hits = ray.intersectObjects(visible, true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.itemId) o = o.parent;
      if (o) return o.userData.itemId as string;
    }
    return undefined;
  }

  center(id: string) {
    const node = this.worn.get(id);
    if (!node) return undefined;
    return new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
  }

  setHidden(id: string, hidden: boolean) {
    const node = this.worn.get(id);
    if (node) node.visible = !hidden;
  }

  // ---- Jauge du ventre (dessinée par le shader de la peau) ----

  setBellyFill(fill: number | null) {
    this.model.skin.uFill.value = fill === null ? -1 : THREE.MathUtils.clamp(fill, 0, 1);
  }
}

/**
 * Objets qui n'existent pas dans `items.glb`, fabriqués ici (repère du dino,
 * centrés sur l'origine ; `FIT` les place).
 */
const PROCEDURAL: Record<string, () => THREE.Object3D> = {
  // Bouée de piscine : quartiers rouges et blancs, cordelette jaune.
  'swim-ring': () => {
    const ring = new THREE.Group();
    ring.name = 'swim-ring';
    const R = 0.5, tube = 0.13, parts = 8;
    for (let i = 0; i < parts; i++) {
      const geo = new THREE.TorusGeometry(R, tube, 18, 12, (Math.PI * 2) / parts);
      geo.rotateZ((i * Math.PI * 2) / parts);
      geo.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: i % 2 ? 0xfafafa : 0xf44336, roughness: 0.35 }));
      m.name = `swim-ring_part${i}`;
      ring.add(m);
    }
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.TorusGeometry(R + tube * 0.95, 0.012, 6, 10, Math.PI / 4.5);
      geo.rotateZ((i * Math.PI) / 2 + Math.PI / 4 - Math.PI / 9);
      geo.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.6 }));
      m.name = `swim-ring_rope${i}`;
      ring.add(m);
    }
    ring.updateMatrixWorld(true);
    return ring;
  },
};

interface Held {
  /** Point de prise, repère de l'os de la main. */
  grip: THREE.Vector3;
  /** Point de prise, repère de l'objet. */
  localGrip: THREE.Vector3;
  scale: THREE.Vector3;
  /** Axe de l'objet (de la prise vers le bout), repère de l'objet. */
  axis: THREE.Vector3;
  /** Points de l'objet (repère de l'objet) testés contre la peau. */
  samples: THREE.Vector3[];
  /** Os de la main qui tient (sa peau ne compte pas). */
  holding: string[];
  /** Côté de la main : +1 à gauche du dino (x positif), -1 à droite. */
  side: number;
  balloon: boolean;
  /** Inclinaison vers l'extérieur au repos, et actuelle (radians). */
  lean: number;
  tilt: number;
  /** Direction de la pente : 0 vers l'extérieur, π/2 vers l'avant. */
  turn: number;
}

interface FlapFrame {
  /** Charnière, repère du dino au repos. */
  top: THREE.Vector3;
  /** Direction du pan au repos, depuis la charnière. */
  down: THREE.Vector3;
  /** Direction vers laquelle il se soulève. */
  back: THREE.Vector3;
  /** Axe de la charnière (largeur du pan). */
  side: THREE.Vector3;
}

/** Coordonnées d'un point dans le repère d'un pan : le long (a), vers l'arrière (b), en largeur (s). */
function toFlap(f: FlapFrame, p: THREE.Vector3) {
  const q = p.clone().sub(f.top);
  return { a: q.dot(f.down), b: q.dot(f.back), s: q.dot(f.side) };
}

interface Flap extends FlapFrame {
  hinge: THREE.Group;
  /** Axe de la charnière, dans le repère de l'os. */
  axis: THREE.Vector3;
  bone: string;
  /** Os (repère local) → repère du dino au repos. */
  rest: THREE.Matrix4;
  length: number;
  halfWidth: number;
  /** Angle du pan avec la verticale (vers l'arrière), au repos. */
  restAngle: number;
  lift: number;
  /** Points de peau proches du pan : maillage, numéro de sommet. */
  skin: { mesh: THREE.SkinnedMesh; index: number; slack: number }[];
  /** Angle du pan au repos à cet endroit (x, distance à la charnière). */
  localAngle: (x: number, d: number) => number;
}

const FLAP_MARGIN = 0.07;

/**
 * Courbure d'un objet autour de l'axe vertical x = 0, z = `cz` (repère du dino) :
 * chaque point garde sa distance à l'axe et sa longueur d'arc. La géométrie de
 * la copie est recalculée ; l'original n'est pas touché.
 */
function bendAround(src: THREE.Object3D, copy: THREE.Object3D, fitted: THREE.Matrix4, cz: number) {
  const sources: THREE.Mesh[] = [];
  const copies: THREE.Mesh[] = [];
  src.traverse((o) => { if ((o as THREE.Mesh).isMesh) sources.push(o as THREE.Mesh); });
  copy.traverse((o) => { if ((o as THREE.Mesh).isMesh) copies.push(o as THREE.Mesh); });
  sources.forEach((s, i) => {
    const c = copies[i];
    if (!c) return;
    s.updateWorldMatrix(true, false);
    const m = fitted.clone().multiply(s.matrixWorld);
    const inv = m.clone().invert();
    const geo = s.geometry.clone();
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k).applyMatrix4(m);
      const d = Math.hypot(cz - v.z, 0) || 1e-6;
      const a = v.x / d;
      v.set(d * Math.sin(a), v.y, cz - d * Math.cos(a)).applyMatrix4(inv);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    c.geometry = geo;
  });
}

/** Matériau « jouet » (même rendu que le dino) à partir de celui du fichier. */
function toyMaterial(src: THREE.MeshStandardMaterial) {
  const m = new THREE.MeshPhysicalMaterial({
    color: src.color,
    roughness: Math.min(0.7, src.roughness ?? 0.5),
    metalness: src.metalness ?? 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    emissive: src.emissive,
    transparent: src.transparent,
    opacity: src.opacity,
    side: src.side,
  });
  m.name = src.name;
  const dark = src.color.clone().multiplyScalar(0.45);
  m.userData.outlineParameters = src.name.startsWith('noline')
    ? { visible: false }
    : { thickness: 0.004, color: dark.toArray(), alpha: 1, visible: true };
  return m;
}
