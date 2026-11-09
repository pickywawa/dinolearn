import Phaser from 'phaser';
import fragment from './homeBackdrop.frag?raw';

const assets = ['clear-sky', 'clouds', 'leaves', 'smoke'] as const;
const key = (asset: string) => `home-backdrop-${asset}`;

export function loadHomeBackdrop(scene: Phaser.Scene) {
  for (const asset of assets) {
    if (!scene.textures.exists(key(asset))) scene.load.image(key(asset), `bg/home/${asset}.webp`);
  }
}

/** Uses the existing backdrop's cover framing so the dinosaur and scenery stay aligned. */
export function animateHomeBackdrop(scene: Phaser.Scene, image: Phaser.GameObjects.Image, night: boolean) {
  const width = image.displayWidth;
  const height = image.displayHeight;
  const left = image.x - width / 2;
  const top = image.y - height / 2;
  const tint = night ? 0x5b6aa8 : 0xffffff;
  if (scene.game.renderer.type === Phaser.WEBGL) {
    const shader = new Phaser.Display.BaseShader('home-backdrop', fragment, undefined, {
      t: { type: '1f', value: 0 },
      night: { type: '1f', value: night ? 1 : 0 },
    });
    const background = scene.add.shader(shader, image.x, image.y, width, height,
      [key('clear-sky'), key('clouds')],
      { repeat: false, wrapS: 'clamp_to_edge', wrapT: 'clamp_to_edge' }).setDepth(-12);
    image.setVisible(false);
    let elapsed = 0;
    const update = (_time: number, delta: number) => {
      elapsed += Math.min(delta, 50) / 1000;
      background.setUniform('t.value', elapsed);
    };
    scene.events.on(Phaser.Scenes.Events.UPDATE, update);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, update));
  } else {
    image.setTexture(key('clear-sky')).setDisplaySize(width, height);
    scene.add.image(image.x, image.y, key('clouds')).setDisplaySize(width, height).setTint(tint).setDepth(-11.99);
  }

  const foliage = scene.textures.get(key('leaves'));
  const source = foliage.getSourceImage();
  const plants = [
    { name: 'canopy', x: 0, y: 0, w: .4, h: .4, px: .08, py: .08, angle: 1.5, duration: 3800 },
    { name: 'left', x: 0, y: .45, w: .25, h: .55, px: .03, py: .85, angle: 1.9, duration: 3100 },
    { name: 'right', x: .65, y: .55, w: .35, h: .45, px: .96, py: 1, angle: -1.7, duration: 3600 },
  ];
  for (const plant of plants) {
    if (!foliage.has(plant.name)) {
      foliage.add(plant.name, 0, Math.round(plant.x * source.width), Math.round(plant.y * source.height),
        Math.floor(plant.w * source.width), Math.floor(plant.h * source.height));
    }
    const sprite = scene.add.image(left + plant.px * width, top + plant.py * height, key('leaves'), plant.name)
      .setOrigin((plant.px - plant.x) / plant.w, (plant.py - plant.y) / plant.h)
      .setDisplaySize(plant.w * width, plant.h * height).setTint(tint).setDepth(-11.8);
    scene.tweens.add({ targets: sprite, angle: { from: -plant.angle, to: plant.angle },
      duration: plant.duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  const puffs = Array.from({ length: 22 }, (_, i) => scene.add.image(0, 0, key('smoke'))
    .setTint(tint).setDepth(-11.9 - i * .0001));
  let smokeTime = 0;
  const updateSmoke = (_time: number, delta: number) => {
    smokeTime += Math.min(delta, 50) / 1000;
    puffs.forEach((puff, i) => {
      const progress = ((smokeTime + i * 4) % 88) / 88;
      const size = width * .07;
      const scale = Phaser.Math.Linear(.28, 1.65, progress);
      puff.setPosition(left + width * .83 + size * 1.7 * progress,
        top + height * .185 - size * (.25 + 2.85 * progress));
      puff.setDisplaySize(size * scale, size * scale);
      puff.setAngle((i % 2 ? -10 : 12) * progress);
      puff.setAlpha(progress < .08 ? progress * 10 : progress > .78 ? .68 * (1 - progress) / .22 : .85);
    });
  };
  updateSmoke(0, 0);
  scene.events.on(Phaser.Scenes.Events.UPDATE, updateSmoke);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, updateSmoke));
}
