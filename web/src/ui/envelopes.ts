import Phaser from 'phaser';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { colorSuffix } from '../dino/parts';
import { Dino } from '../dino/Dino';
import { envelopeChoices } from '../domain/printables';
import { PRINT_KINDS, printKind } from '../print/catalog';
import { unit } from './scenery';

const OUTLINE = 0x2d3354;

/**
 * Fin du temps de jeu : le dino offre trois enveloppes surprises (un
 * coloriage, un jeu, un découpage…). L'enfant en choisit une ; elle s'ouvre
 * et la fiche sort. Elle attend ensuite les parents dans leur espace, prête
 * à imprimer.
 */
export async function chooseEnvelope(scene: Phaser.Scene, dino: Dino): Promise<void> {
  const p = app.progress;
  if (!p.envelopeDue()) return;
  const choices = envelopeChoices(PRINT_KINDS, p.age, p.printables, app.rng)
    .map((id) => printKind(id))
    .filter((k) => k !== undefined);
  if (choices.length === 0) return;
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const layer = scene.add.container(0, 0).setDepth(100);
  layer.add(scene.add.rectangle(W / 2, H / 2, W, H, 0x1e2235, 0.55).setInteractive());
  // En portrait, les enveloppes sont les unes sous les autres (plus grandes) ; en paysage, côte à côte.
  const column = H > W;
  const ew = column ? Math.min(u * 0.46, (H * 0.16) / 0.7) : Math.min(u * 0.34, (W * 0.8) / choices.length - u * 0.06);
  const eh = ew * 0.7;
  const envelopes = choices.map((kind, i) => {
    const offset = i - (choices.length - 1) / 2;
    const [x, y] = column ? [W / 2, H * 0.37 + offset * (eh + u * 0.06)] : [W / 2 + offset * (ew + u * 0.07), H * 0.36];
    const env = makeEnvelope(scene, x, y, ew, eh, kind.icon);
    env.setScale(0);
    scene.tweens.add({ targets: env, scale: 1, delay: 250 + i * 180, duration: 420, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: env, angle: { from: -3, to: 3 }, duration: 700 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 700 });
    layer.add(env);
    return { kind, env };
  });
  dino.react('cheer');
  void app.voice.line('envelope.intro');

  const chosen = await new Promise<(typeof envelopes)[number]>((resolve) => {
    let done = false;
    for (const e of envelopes) {
      e.env.setSize(ew, eh).setInteractive({ useHandCursor: true });
      e.env.on('pointerup', () => {
        if (done) return;
        done = true;
        resolve(e);
      });
    }
  });
  app.voice.stop();
  Sfx.play('pop');
  p.openEnvelope(chosen.kind.id, Math.floor(app.rng() * 2 ** 31));
  for (const e of envelopes) {
    scene.tweens.killTweensOf(e.env);
    if (e !== chosen) scene.tweens.add({ targets: e.env, alpha: 0, scale: 0.6, duration: 250 });
  }
  // L'enveloppe choisie vient au milieu, s'ouvre, et la fiche en sort.
  await tween(scene, { targets: chosen.env, x: W / 2, y: H * 0.45, scale: column ? 1.2 : 1.4, angle: 0, duration: 450, ease: 'Back.easeOut' });
  // Le cachet saute, puis le rabat se retourne.
  scene.tweens.add({ targets: chosen.env.getData('seal'), y: -eh * 0.4, alpha: 0, duration: 260 });
  const flap = chosen.env.getByName('flap') as Phaser.GameObjects.Graphics;
  await tween(scene, { targets: flap, scaleY: -1, duration: 280, ease: 'Quad.easeIn' });
  const sheet = chosen.env.getByName('sheet') as Phaser.GameObjects.Container;
  sheet.setVisible(true);
  Sfx.play('levelUp');
  await tween(scene, { targets: sheet, y: -eh * 0.75, duration: 520, ease: 'Back.easeOut' });
  dino.react('dance');
  await app.voice.say([{ text: pickLine(chosen.kind.said), lang: 'fr' }]);
  await new Promise((r) => scene.time.delayedCall(400, r));
  await tween(scene, { targets: layer, alpha: 0, duration: 350 });
  layer.destroy();
}

function pickLine(said: string) {
  const lines = [
    `Youpi, ${said} ! Demande à papa ou maman de l'imprimer pour toi !`,
    `Oh, ${said} ! Tes parents vont pouvoir l'imprimer. On y jouera sur du vrai papier !`,
    `Bravo ! C'est ${said} ! Dis à un grand que c'est prêt à imprimer.`,
  ];
  return lines[Math.floor(app.rng() * lines.length)];
}

const tween = (scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig) =>
  new Promise<void>((resolve) => scene.tweens.add({ ...config, onComplete: () => resolve() }));

/** Une enveloppe dessinée : rabat, cachet à la tête du dino, et l'image de ce qu'elle contient. */
function makeEnvelope(scene: Phaser.Scene, x: number, y: number, w: number, h: number, icon: string) {
  const env = scene.add.container(x, y);
  const line = Math.max(3, w * 0.025);
  // La fiche, cachée derrière l'enveloppe ; elle monte quand on l'ouvre.
  const sheet = scene.add.container(0, 0).setName('sheet').setVisible(false);
  sheet.add(scene.add.rectangle(0, 0, w * 0.78, h * 1.05, 0xffffff).setStrokeStyle(line * 0.7, OUTLINE));
  const big = scene.add.image(0, -h * 0.05, icon);
  big.setScale((h * 0.62) / big.height);
  sheet.add(big);
  env.add(sheet);
  const back = scene.add.graphics();
  back.fillStyle(0xf3d9a4, 1).lineStyle(line, OUTLINE, 1);
  back.fillRoundedRect(-w / 2, -h / 2, w, h, w * 0.04).strokeRoundedRect(-w / 2, -h / 2, w, h, w * 0.04);
  env.add(back);
  // Le devant (les deux plis du bas) par-dessus la fiche.
  const front = scene.add.graphics();
  front.fillStyle(0xfff1cf, 1).lineStyle(line * 0.7, OUTLINE, 1);
  front.beginPath();
  front.moveTo(-w / 2, -h / 2 + line);
  front.lineTo(0, h * 0.08);
  front.lineTo(w / 2, -h / 2 + line);
  front.lineTo(w / 2, h / 2);
  front.lineTo(-w / 2, h / 2);
  front.closePath();
  front.fillPath();
  front.strokePath();
  env.add(front);
  // Image du contenu, sur le devant.
  const img = scene.add.image(-w * 0.26, h * 0.16, icon);
  img.setScale((h * 0.52) / img.height);
  env.add(img);
  // Rabat (se retourne quand l'enveloppe s'ouvre), et cachet.
  const flap = scene.add.graphics().setName('flap');
  flap.setPosition(0, -h / 2);
  flap.fillStyle(0xf7e2b5, 1).lineStyle(line, OUTLINE, 1);
  flap.beginPath();
  flap.moveTo(-w / 2, 0);
  flap.lineTo(0, h * 0.55);
  flap.lineTo(w / 2, 0);
  flap.closePath();
  flap.fillPath();
  flap.strokePath();
  env.add(flap);
  const seal = scene.add.circle(0, h * 0.06, h * 0.17, 0xe5484d).setStrokeStyle(line * 0.7, OUTLINE);
  const head = scene.add.image(0, h * 0.06, `dino-head${colorSuffix(app.progress.color)}`);
  head.setScale((h * 0.26) / head.width);
  env.add([seal, head]);
  env.setData('seal', [seal, head]);
  return env;
}
