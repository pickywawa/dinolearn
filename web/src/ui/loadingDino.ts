import { createDino, DINO_URL, loadGltf } from '../dino3d/model';
import { DinoRig } from '../dino3d/rig';
import { Stage } from '../dino3d/stage';

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
  rig.setBase('dance', 0);
  rig.lids = 0;
  host.append(stage.canvas);
  let frame = 0;
  const started = performance.now();
  let nextBlink = started + 1800;
  const render = () => {
    const now = performance.now();
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
