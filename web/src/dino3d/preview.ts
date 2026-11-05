import { createDino, preloadModels } from './model';
import { Stage } from './stage';

/**
 * Page d'aperçu du dino 3D (développement) : `dino3d.html?color=2&yaw=30&w=600&h=700`.
 * Affiche plusieurs angles côte à côte avec `?angles=0,35,90,180`.
 */
const q = new URLSearchParams(location.search);
const color = Number(q.get('color') ?? 0);
const w = Number(q.get('w') ?? 420);
const h = Number(q.get('h') ?? 520);
const angles = (q.get('angles') ?? q.get('yaw') ?? '25').split(',').map(Number);

(async () => {
  await preloadModels();
  for (const yaw of angles) {
    const stage = new Stage(w, h);
    document.body.append(stage.canvas);
    stage.canvas.style.display = 'inline-block';
    const dino = createDino(color);
    dino.root.rotation.y = (yaw * Math.PI) / 180;
    stage.scene.add(dino.root);
    const show = (q.get('show') ?? '').split(',').filter(Boolean);
    for (const [name, o] of Object.entries(dino.parts)) {
      if (/^(eye[LR](closed|happy)|mouth(open|wide|o|small))/.test(name)) o.visible = show.some((s) => name.startsWith(s));
      if (/^mouthsmile/.test(name)) o.visible = !show.some((s) => s.startsWith('mouth'));
    }
    stage.render();
  }
  document.title = 'ready';
})();
