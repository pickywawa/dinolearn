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
  head: { bone: 'head', from: [0, 1.72, 0], to: [0, 1.7, 0.08], scale: 1.05 },
  eyes: { bone: 'head', from: [0, 1.52, 0.55], to: [0, 1.235, 0.42], scale: 1.12 },
  neck: { bone: 'spine_03', from: [0, 0.95, 0], to: [0, 0.77, 0.02], scale: 0.95 },
  back: { bone: 'spine_03', from: [0, 0.65, -0.3], to: [0, 0.62, -0.28], scale: 0.95 },
  hand: { bone: 'hand_l', from: [0.595, 0.605, 0.158], to: [0.333, 0.406, 0.124], scale: 0.85 },
};

function slotMatrix(slot: Slot) {
  const s = SLOTS[slot];
  return new THREE.Matrix4().makeTranslation(...s.to)
    .multiply(new THREE.Matrix4().makeScale(s.scale, s.scale, s.scale))
    .multiply(new THREE.Matrix4().makeTranslation(-s.from[0], -s.from[1], -s.from[2]));
}

/**
 * Les objets 3D portés par le dino (`public/models/items.glb`, un nœud par
 * objet, fabriqué par `tools/blender/build_items.py`). Chaque objet est
 * recalé sur le dino dans sa pose de repos, puis accroché à l'os de son
 * emplacement : il suit les animations. S'occupe aussi de la jauge de
 * croissance sur le ventre.
 */
export class Accessories {
  private worn = new Map<string, THREE.Object3D>();
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
  }

  dress(ids: readonly string[]) {
    for (const [id, node] of this.worn) {
      if (!ids.includes(id)) {
        node.removeFromParent();
        this.worn.delete(id);
      }
    }
    const gltf = loadedGltf(ITEMS_URL);
    if (!gltf) return;
    for (const id of ids) {
      if (this.worn.has(id)) continue;
      const item = itemById(id);
      const src = gltf.scene.getObjectByName(id);
      if (!item || !src) continue;
      const node = src.clone(true);
      node.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.material = toyMaterial(mesh.material as THREE.MeshStandardMaterial);
      });
      const boneName = SLOTS[item.slot].bone;
      const bone = this.model.bones[boneName];
      if (!bone) continue;
      // Position de l'objet sur l'ancien dino → recalée sur celui-ci → repère de l'os au repos.
      src.updateWorldMatrix(true, false);
      node.matrixAutoUpdate = true;
      const local = new THREE.Matrix4().multiplyMatrices(this.restInv.get(boneName)!, slotMatrix(item.slot)).multiply(src.matrixWorld);
      local.decompose(node.position, node.quaternion, node.scale);
      node.userData.itemId = id;
      bone.add(node);
      this.worn.set(id, node);
    }
  }

  /** Petites animations propres aux objets (ballon qui flotte…). */
  update() {
    const balloon = this.worn.get('balloon');
    if (balloon) balloon.rotation.z = Math.sin(performance.now() / 600) * 0.08;
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
