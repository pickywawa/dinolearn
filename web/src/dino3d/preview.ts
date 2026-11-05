import { ITEMS } from '../content/items';
import { Accessories } from './accessories';
import { createDino, preloadModels } from './model';
import { DinoRig } from './rig';
import { Stage } from './stage';

/**
 * Page d'aperçu du dino 3D (développement) :
 * `dino3d.html?color=2&angles=0,35,90&wear=crown,scarf&mouth=open&eyes=happy`,
 * ou `?all=1` pour voir chaque objet de la garde-robe porté.
 */
const q = new URLSearchParams(location.search);
const color = Number(q.get('color') ?? 0);
const w = Number(q.get('w') ?? 420);
const h = Number(q.get('h') ?? 520);
const angles = (q.get('angles') ?? '25').split(',').map(Number);
const wear = (q.get('wear') ?? '').split(',').filter(Boolean);

(async () => {
  await preloadModels();
  const views: { yaw: number; wear: string[]; color: number }[] = q.get('all')
    ? ITEMS.map((it, i) => ({ yaw: angles[i % angles.length], wear: [it.id], color: i % 10 }))
    : angles.map((yaw) => ({ yaw, wear, color }));
  // Un seul rendu WebGL pour toutes les vues (le navigateur limite le nombre de contextes).
  const stage = new Stage(w, h);
  for (const v of views) {
    const model = createDino(v.color);
    const rig = new DinoRig(model);
    const acc = new Accessories(model);
    acc.dress(v.wear);
    if (q.get('debug')) console.log(Object.keys(model.bones).join(' '));
    rig.pose.yaw = (v.yaw * Math.PI) / 180;
    rig.pose.armL = Number(q.get('armL') ?? 0);
    rig.pose.headTilt = Number(q.get('tilt') ?? 0);
    if (q.get('mouth')) rig.setMouth(q.get('mouth') as never);
    if (q.get('eyes')) rig.setEyes(q.get('eyes') as never);
    rig.apply();
    stage.scene.add(rig.pivot);
    stage.render();
    const img = document.createElement('img');
    img.src = stage.canvas.toDataURL();
    document.body.append(img);
    stage.scene.remove(rig.pivot);
    if (q.get('debug')) {
      rig.pivot.updateMatrixWorld(true);
      for (const id of v.wear) {
        const o = rig.pivot.getObjectByName(id);
        console.log(id, o ? o.getWorldPosition(o.position.clone()).toArray().map((x) => x.toFixed(2)).join(',') : 'absent');
      }
    }
  }
  document.title = 'ready';
})();
