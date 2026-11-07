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
  rig.setBase('run');
  host.append(stage.canvas);
  host.classList.add('arriving');
  let frame = 0;
  const started = performance.now();
  const render = () => {
    if (performance.now() - started >= 1000) rig.setBase('dance');
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
