import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { DINO_COLORS, type DinoColor } from '../dino/parts';

/**
 * Le modèle 3D du dino (`public/models/dino.glb`, fabriqué dans Blender par
 * `tools/blender/dino_meshy/`) : maillage texturé, squelette de 52 os,
 * paupières en formes (morph targets) et toutes ses animations (clips glTF).
 * Chargé une seule fois, puis copié pour chaque dino affiché avec ses propres
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
/** Masque des couleurs de la texture : rouge = peau, vert = parties claires (ventre, cornes, piquants). */
const MASK_URL = 'models/dino_mask.png';
let mask: THREE.Texture | undefined;

/** Précharge les modèles (pendant l'écran de chargement). */
export function preloadModels() {
  const m = new THREE.TextureLoader().loadAsync(MASK_URL).then((t) => {
    t.flipY = false;
    t.colorSpace = THREE.NoColorSpace;
    mask = t;
  }).catch(() => undefined);
  return Promise.all([loadGltf(DINO_URL), loadGltf(ITEMS_URL).catch(() => undefined), m]);
}

/** Le modèle du fichier mesure 1 ; le jeu travaille avec un dino de 2,05 de haut. */
export const MODEL_SCALE = 2.05;
/** Couleur d'origine de la texture (index dans `DINO_COLORS`) : pas de reteinte. */
const NATIVE_COLOR = 2;

export interface DinoModel {
  root: THREE.Object3D;
  bones: Record<string, THREE.Bone>;
  /** Maillages par nom de nœud. */
  parts: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
  clips: THREE.AnimationClip[];
  /** Les paupières (formes `blink_*`, `blink_half_*`, `happy_*`). */
  lids?: THREE.Mesh;
  /** Réglages partagés du shader de la peau (jauge du ventre). */
  skin: { uFill: { value: number } };
}

/**
 * Matériau de la peau : la texture peinte, reteintée à la couleur du dino.
 * La peau violette prend la couleur `skin` ; les parties claires prennent
 * `belly` sur le ventre et `spike` ailleurs (cornes, piquants, griffes), en
 * gardant les ombres et les détails peints. Gère aussi la jauge du ventre.
 */
function skinMaterial(src: THREE.MeshStandardMaterial, c: DinoColor, recolor: boolean, allSkin: boolean, fill: { value: number }) {
  const m = new THREE.MeshPhysicalMaterial({
    map: src.map,
    normalMap: src.normalMap,
    normalScale: src.normalScale?.clone(),
    roughness: 0.6,
    clearcoat: 0.12,
    clearcoatRoughness: 0.45,
  });
  m.name = allSkin ? 'eyelid' : 'skin';
  // Les paupières sont de fines coques : visibles des deux côtés.
  if (allSkin) m.side = THREE.DoubleSide;
  const uniforms = {
    uMask: { value: mask ?? null },
    uHasMask: { value: mask && !allSkin ? 1 : 0 },
    uRecolor: { value: recolor ? 1 : 0 },
    // Un peu plus soutenue que la couleur pastel de l'interface : le relief et les ombres l'éclaircissent.
    uSkin: { value: new THREE.Color(c.skin).lerp(new THREE.Color(c.dark), 0.3) },
    uSpike: { value: new THREE.Color(c.spike) },
    uBelly: { value: new THREE.Color(c.belly) },
    uFill: fill,
    uFillColor: { value: new THREE.Color('#ffb84d') },
  };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBind;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBind = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D uMask;
        uniform float uHasMask, uRecolor, uFill;
        uniform vec3 uSkin, uSpike, uBelly, uFillColor;
        varying vec3 vBind;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          vec3 c0 = diffuseColor.rgb;
          float L = dot(c0, vec3(0.2126, 0.7152, 0.0722));
          vec2 k = vec2(${allSkin ? '1.0' : '0.0'}, 0.0);
          #ifdef USE_MAP
            if (uHasMask > 0.5) k = texture2D(uMask, vMapUv).rg;
          #endif
          // Le ventre : devant le torse (repère du fichier : Y en haut, Z vers l'avant, 1 de haut).
          float belly = smoothstep(0.0, 0.04, vBind.z) * smoothstep(0.03, 0.07, vBind.y)
            * (1.0 - smoothstep(0.42, 0.47, vBind.y)) * (1.0 - smoothstep(0.15, 0.2, abs(vBind.x)));
          if (uRecolor > 0.5) {
            vec3 skinC = uSkin * clamp(L / 0.129, 0.0, 1.7);
            vec3 lightC = mix(uSpike, uBelly, belly) * clamp(L / 0.63, 0.0, 1.25);
            c0 = mix(c0, skinC, k.r);
            c0 = mix(c0, lightC, k.g);
          }
          if (uFill >= 0.0 && k.g * belly > 0.5) {
            float cut = mix(0.07, 0.42, uFill);
            if (vBind.y < cut) c0 = uFillColor * clamp(L / 0.63, 0.6, 1.2);
            if (abs(vBind.y - cut) < 0.006) c0 *= 0.75;
          }
          diffuseColor.rgb = c0;
        }`);
  };
  // Pas de contour : la peau peinte a déjà ses ombres et ses détails.
  m.userData.outlineParameters = { visible: false };
  return m;
}

/** Une copie du dino, aux couleurs voulues (index dans `DINO_COLORS`). Modèle préchargé requis. */
export function createDino(colorIndex: number): DinoModel {
  const gltf = loadedGltf(DINO_URL);
  if (!gltf) throw new Error('dino.glb pas encore chargé');
  const root = cloneSkinned(gltf.scene);
  root.scale.setScalar(MODEL_SCALE);
  const color = DINO_COLORS[colorIndex] ?? DINO_COLORS[0];
  const recolor = colorIndex !== NATIVE_COLOR;
  const skin = { uFill: { value: -1 } };
  const bones: Record<string, THREE.Bone> = {};
  const parts: Record<string, THREE.Object3D> = {};
  const materials: Record<string, THREE.Material> = {};
  let lids: THREE.Mesh | undefined;
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) bones[o.name] = o as THREE.Bone;
    else parts[o.name] = o;
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const isLid = !!mesh.morphTargetDictionary && 'blink_l' in mesh.morphTargetDictionary;
    if (isLid) lids = mesh;
    const mat = skinMaterial(mesh.material as THREE.MeshStandardMaterial, color, recolor, isLid, skin.uFill);
    materials[mat.name] = mat;
    mesh.material = mat;
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = !isLid;
  });
  return { root, bones, parts, materials, clips: gltf.animations, lids, skin };
}
