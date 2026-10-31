import Phaser from 'phaser';
import { ITEMS, Item, giftChoices, itemTexture } from '../content/items';
import { app } from '../core/app';
import { Sfx } from '../core/sfx';
import { Dino } from '../dino/Dino';
import { unit } from './scenery';

/**
 * Le dino a grandi (au vestiaire) : l'enfant choisit son cadeau parmi 4 objets.
 * L'objet vole jusqu'au dino, qui dit merci ; il ne le met pas tout seul :
 * c'est l'enfant qui l'habille en faisant glisser l'objet sur lui. Recommence
 * s'il reste des cadeaux. Renvoie les objets reçus.
 */
export async function chooseGifts(scene: Phaser.Scene, dino: Dino): Promise<Item[]> {
  const p = app.progress;
  const received: Item[] = [];
  p.limitPending(ITEMS.length - p.collection.owned.length);
  while (p.collection.pending > 0 && scene.scene.isActive()) {
    const item = await pickOne(scene, dino);
    if (!item) break;
    p.own(item.id);
    received.push(item);
    dino.react('cheer');
    Sfx.play('levelUp');
    await app.voice.say([{ text: `Oh, ${item.name} ! Merci !`, lang: 'fr' }]);
  }
  return received;
}

function pickOne(scene: Phaser.Scene, dino: Dino): Promise<Item | undefined> {
  const { width: W, height: H } = scene.scale;
  const u = unit(scene);
  const choices = giftChoices(app.progress.collection.owned, app.rng);
  if (choices.length === 0) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const layer = scene.add.container(0, 0).setDepth(100);
    // Voile qui bloque le reste de l'écran.
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, 0x1e2235, 0.55).setInteractive();
    layer.add(veil);
    const box = scene.add.image(W / 2, H * 0.2, 'ui-gift');
    box.setScale((u * 0.2) / box.width);
    layer.add(box);
    scene.tweens.add({ targets: box, angle: { from: -8, to: 8 }, duration: 160, yoyo: true, repeat: 3 });
    const r = u * 0.12;
    const cols = W > H ? 4 : 2;
    let chosen = false;
    choices.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = W / 2 + (col - (cols - 1) / 2) * r * 2.5;
      const y = H * (W > H ? 0.45 : 0.4) + row * r * 2.5;
      const bubble = scene.add.container(x, y);
      bubble.add(scene.add.circle(0, r * 0.06, r, 0x000000, 0.2));
      bubble.add(scene.add.circle(0, 0, r, 0xffffff).setStrokeStyle(r * 0.08, 0xffd23f));
      const img = scene.add.image(0, 0, itemTexture(item.id));
      img.setScale((r * 1.4) / img.width);
      bubble.add(img);
      bubble.setSize(r * 2, r * 2).setInteractive({ useHandCursor: true }).setScale(0);
      scene.tweens.add({ targets: bubble, scale: 1, delay: 300 + i * 150, duration: 400, ease: 'Back.easeOut' });
      bubble.on('pointerup', () => {
        if (chosen) return;
        chosen = true;
        Sfx.play('pop');
        // L'objet vole jusqu'au dino.
        layer.list.filter((o) => o !== bubble && o !== veil).forEach((o) =>
          scene.tweens.add({ targets: o, alpha: 0, duration: 250 }));
        scene.tweens.add({
          targets: bubble, x: dino.x, y: dino.y - Dino.HEIGHT * dino.scale * 0.55, scale: 0.4, duration: 600, ease: 'Quad.easeIn',
          onComplete: () => {
            layer.destroy();
            resolve(item);
          },
        });
      });
      layer.add(bubble);
    });
    void app.voice.say([{
      text: app.rng() < 0.5 ? 'J\'ai grandi ! Choisis un cadeau pour moi !' : 'Un cadeau ! Lequel tu veux me donner ?',
      lang: 'fr',
    }]);
  });
}
