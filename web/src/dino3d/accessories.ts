import * as THREE from 'three';
import { itemById, type Slot } from '../content/items';
import { ITEMS_URL, loadedGltf, type DinoModel } from './model';

/** L'os qui porte chaque emplacement : l'objet suit ses mouvements. */
/** Objets de tête qui ne couvrent pas le crâne : les piquants restent visibles. */
const KEEP_SPIKES = ['hibiscus', 'headphone'];

const SLOT_BONE: Record<Slot, string> = {
  head: 'head',
  eyes: 'head',
  neck: 'chest',
  back: 'chest',
  hand: 'armL',
};

/**
 * Les objets 3D portés par le dino (`public/models/items.glb`, un nœud par
 * objet, fabriqué par `tools/blender/build_items.py`). Chaque objet est
 * modélisé à sa place sur le dino au repos, puis accroché à l'os de son
 * emplacement. S'occupe aussi de la jauge de croissance sur le ventre.
 */
export class Accessories {
  private worn = new Map<string, THREE.Object3D>();
  /** Matrice (repère du modèle) inverse de chaque os au repos. */
  private restInv = new Map<string, THREE.Matrix4>();
  private belly?: { uniforms: { uFill: { value: number } } };
  private bellyValue = -1;

  constructor(private model: DinoModel) {
    model.root.updateMatrixWorld(true);
    const rootInv = model.root.matrixWorld.clone().invert();
    for (const [name, bone] of Object.entries(model.bones)) {
      const m = new THREE.Matrix4().multiplyMatrices(rootInv, bone.matrixWorld);
      this.restInv.set(name, m.invert());
    }
    this.setupBelly();
  }

  dress(ids: readonly string[]) {
    const hat = ids.some((id) => itemById(id)?.slot === 'head' && !KEEP_SPIKES.includes(id));
    for (const [name, part] of Object.entries(this.model.parts)) {
      if (name.startsWith('spikehead')) part.visible = !hat;
    }
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
      const boneName = SLOT_BONE[item.slot];
      const bone = this.model.bones[boneName];
      if (!bone) continue;
      // Position de l'objet dans le repère du modèle → repère de l'os au repos.
      src.updateWorldMatrix(true, false);
      node.matrixAutoUpdate = true;
      const local = new THREE.Matrix4().multiplyMatrices(this.restInv.get(boneName)!, src.matrixWorld);
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

  // ---- Jauge du ventre ----

  private setupBelly() {
    const mat = this.model.materials.belly as THREE.MeshPhysicalMaterial | undefined;
    if (!mat) return;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uFill = { value: this.bellyValue };
      shader.uniforms.uFillColor = { value: new THREE.Color('#ffb84d') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vBellyY;')
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\nvBellyY = transformed.y;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uFill;\nuniform vec3 uFillColor;\nvarying float vBellyY;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          if (uFill >= 0.0) {
            float cut = mix(0.22, 0.88, uFill);
            if (vBellyY < cut) diffuseColor.rgb = uFillColor;
            if (abs(vBellyY - cut) < 0.012) diffuseColor.rgb *= 0.75;
          }`);
      this.belly = shader as unknown as { uniforms: { uFill: { value: number } } };
    };
  }

  setBellyFill(fill: number | null) {
    this.bellyValue = fill === null ? -1 : THREE.MathUtils.clamp(fill, 0, 1);
    if (this.belly) this.belly.uniforms.uFill.value = this.bellyValue;
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
