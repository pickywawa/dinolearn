import { createDino, loadedGltf, DINO_URL } from './model';
import { DinoRig } from './rig';
import { Stage } from './stage';

const cache = new Map<string, string>();
let stage: Stage | undefined;

/**
 * Portrait du dino (tête en gros plan, de trois quarts) en image PNG
 * (`data:` URL) : avatar de l'espace parents, bouton pour changer d'enfant.
 * Un seul rendu WebGL partagé ; chaque portrait est gardé en mémoire.
 */
export function dinoPortrait(color: number, size = 256, mood: 'smile' | 'happy' = 'smile'): string | undefined {
  const key = `${color}-${size}-${mood}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!loadedGltf(DINO_URL)) return undefined;
  try {
    stage ??= new Stage(size, size, 1.35);
    if (stage.canvas.width !== size) stage.renderer.setSize(size, size, false);
    // Caméra recentrée sur la tête.
    stage.camera.position.set(0.25, 1.6, 3.7);
    stage.camera.lookAt(0, 1.38, 0);
    stage.camera.updateMatrixWorld();
    const rig = new DinoRig(createDino(color));
    rig.pose.yaw = 0.3;
    rig.pose.headTilt = -0.08;
    if (mood === 'happy') {
      rig.setEyes('happy');
      rig.setMouth('open');
    }
    rig.apply();
    stage.scene.add(rig.pivot);
    stage.render();
    const url = stage.canvas.toDataURL('image/png');
    stage.scene.remove(rig.pivot);
    cache.set(key, url);
    return url;
  } catch {
    return undefined;
  }
}
