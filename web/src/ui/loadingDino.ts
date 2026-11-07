import { createDino, DINO_URL, loadGltf } from '../dino3d/model';
import { DinoRig } from '../dino3d/rig';
import { Stage } from '../dino3d/stage';

const WALK_CLIP = 'march';
/** Vitesse de la marche (1 = vitesse de l'animation). */
const WALK_SPEED = 0.55;
/** Durée de la traversée jusqu'au centre. */
export const WALK_MS = 4200;
const TURN_MS = 500;

/** Render the game's actual model as soon as it is downloaded, independently of the icon loader. */
export async function showLoadingDino(): Promise<() => void> {
  await loadGltf(DINO_URL);
  const host = document.querySelector<HTMLElement>('.loading-dino');
  if (!host) return () => undefined;
  const height = Math.min(900, Math.round(host.clientWidth * 1.2 * devicePixelRatio));
  const stage = new Stage(height, height, 2.8);
  const model = createDino(0);
  const rig = new DinoRig(model);
  stage.scene.add(rig.pivot);
  // Il arrive de la gauche en marchant tranquillement, de profil, puis se tourne vers nous et danse.
  rig.setBase(WALK_CLIP, 0);
  rig.mixer.timeScale = WALK_SPEED;
  rig.pose.yaw = Math.PI / 2;
  rig.lids = 0;
  host.append(stage.canvas);
  let frame = 0;
  const started = performance.now();
  let nextBlink = started + 1800;
  const render = () => {
    const now = performance.now();
    const t = now - started;
    // Traversée depuis le bord gauche, au rythme des pas, en ralentissant juste avant le centre.
    const k = Math.min(1, t / WALK_MS);
    const along = k < 0.8 ? k / 0.9 : 0.8 / 0.9 + (1 - 0.8 / 0.9) * (1 - (1 - (k - 0.8) / 0.2) ** 2);
    host.style.translate = `calc((-50vw - 50%) * ${(1 - along).toFixed(4)}) 0`;
    if (t >= WALK_MS) {
      // Demi-tour vers la caméra, puis la danse.
      const k = Math.min(1, (t - WALK_MS) / TURN_MS);
      rig.pose.yaw = (Math.PI / 2) * (1 - k * k * (3 - 2 * k));
      if (rig.background === WALK_CLIP) {
        rig.mixer.timeScale = 1;
        rig.setBase('idle', 0.3);
      }
      if (k >= 1) rig.setBase('dance', 0.3);
    }
    // Clignement simple : les paupières de la danse sont remplacées par celui-ci.
    const blink = now - nextBlink;
    rig.lids = blink < 0 ? 0 : blink < 90 ? blink / 90 : blink < 180 ? 1 - (blink - 90) / 90 : 0;
    if (blink >= 180) nextBlink = now + 2200 + Math.random() * 2000;
    rig.apply();
    stage.render();
    frame = requestAnimationFrame(render);
  };
  render();
  return () => {
    cancelAnimationFrame(frame);
    rig.mixer.stopAllAction();
    rig.mixer.uncacheRoot(model.root);
    stage.dispose();
    stage.canvas.remove();
  };
}
