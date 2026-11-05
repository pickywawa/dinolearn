import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { DINO_COLORS, type DinoColor } from '../dino/parts';

/**
 * Le modèle 3D du dino (fabriqué par `tools/blender/build_dino.py`) : chargé
 * une seule fois, puis copié pour chaque dino affiché avec ses propres
 * matériaux (la couleur de l'enfant).
 */

const loader = new GLTFLoader();
const cache = new Map<string, Promise<GLTF>>();
const ready = new Map<string, GLTF>();

export function loadGltf(url: string): Promise<GLTF> {
  let p = cache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((g) => {
      ready.set(url, g);
      return g;
    });
    cache.set(url, p);
  }
  return p;
}

/** Le modèle déjà chargé (après `preloadModels`), sinon `undefined`. */
export const loadedGltf = (url: string) => ready.get(url);

export const DINO_URL = 'models/dino.glb';
export const ITEMS_URL = 'models/items.glb';

/** Précharge les modèles (pendant l'écran de chargement). */
export function preloadModels() {
  return Promise.all([loadGltf(DINO_URL), loadGltf(ITEMS_URL).catch(() => undefined)]);
}

const hex = (c: string) => new THREE.Color(c);

/** Couleur plus sombre (contours). */
function darker(c: THREE.Color, f = 0.45) {
  return c.clone().multiplyScalar(f);
}

interface MatSpec {
  color: THREE.Color;
  rough?: number;
  clearcoat?: number;
  sheen?: number;
  emissive?: number;
  outline?: boolean;
}

/** Les matériaux d'un dino, selon sa couleur. */
export function dinoMaterials(c: DinoColor) {
  const specs: Record<string, MatSpec> = {
    skin: { color: hex(c.skin), rough: 0.55, clearcoat: 0.25, sheen: 0.4 },
    belly: { color: hex(c.belly), rough: 0.6, sheen: 0.3 },
    spike: { color: hex(c.spike), rough: 0.45, clearcoat: 0.4 },
    cheek: { color: hex('#ff8fa3'), rough: 0.7, outline: false },
    eyeWhite: { color: hex('#ffffff'), rough: 0.2, clearcoat: 1, outline: false },
    iris: { color: hex('#5a3a22'), rough: 0.25, clearcoat: 1, outline: false },
    pupil: { color: hex('#120d14'), rough: 0.2, clearcoat: 1, outline: false },
    shine: { color: hex('#ffffff'), emissive: 1, outline: false },
    line: { color: hex('#2a1f2b'), rough: 0.6, outline: false },
    mouth: { color: hex('#6b1d33'), rough: 0.6, outline: false },
    tongue: { color: hex('#ff7a93'), rough: 0.5, outline: false },
    tooth: { color: hex('#ffffff'), rough: 0.3, outline: false },
  };
  const mats: Record<string, THREE.Material> = {};
  for (const [name, s] of Object.entries(specs)) {
    const m = new THREE.MeshPhysicalMaterial({
      color: s.color,
      roughness: s.rough ?? 0.5,
      clearcoat: s.clearcoat ?? 0,
      clearcoatRoughness: 0.35,
      sheen: s.sheen ?? 0,
      sheenColor: new THREE.Color('#ffffff'),
      sheenRoughness: 0.6,
      emissive: s.emissive ? s.color : new THREE.Color(0),
      emissiveIntensity: s.emissive ?? 0,
    });
    m.name = name;
    m.userData.outlineParameters = s.outline === false
      ? { visible: false }
      : { thickness: 0.0045, color: darker(s.color).toArray(), alpha: 1, visible: true };
    mats[name] = m;
  }
  return mats;
}

export interface DinoModel {
  root: THREE.Object3D;
  bones: Record<string, THREE.Bone>;
  /** Maillages par nom de nœud (yeux, bouches…). */
  parts: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
}

/** Une copie du dino, aux couleurs voulues (index dans `DINO_COLORS`). Modèle préchargé requis. */
export function createDino(colorIndex: number): DinoModel {
  const gltf = loadedGltf(DINO_URL);
  if (!gltf) throw new Error('dino.glb pas encore chargé');
  const root = cloneSkinned(gltf.scene);
  const materials = dinoMaterials(DINO_COLORS[colorIndex] ?? DINO_COLORS[0]);
  const bones: Record<string, THREE.Bone> = {};
  const parts: Record<string, THREE.Object3D> = {};
  root.traverse((o) => {
    // Les noms glTF perdent les points (« arm.L » → « armL »).
    if ((o as THREE.Bone).isBone) bones[o.name] = o as THREE.Bone;
    else parts[o.name] = o;
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      const name = (mesh.material as THREE.Material).name;
      mesh.material = materials[name] ?? mesh.material;
      mesh.frustumCulled = false;
    }
  });
  return { root, bones, parts, materials };
}
