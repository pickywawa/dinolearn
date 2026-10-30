import Phaser from 'phaser';

/** Gâteau d'anniversaire avec une bougie par année et l'âge écrit en grand (pour les parents). */
export function makeCake(scene: Phaser.Scene, x: number, y: number, size: number, age: number) {
  const cake = scene.add.container(x, y);
  const disc = scene.add.circle(0, 0, size / 2, 0xffffff).setStrokeStyle(size * 0.04, 0xff8fc7);
  // Gâteau dessiné, avec une bougie par année.
  const g = scene.add.graphics();
  const cw = size * 0.6;
  const ch = size * 0.26;
  const top = size * 0.02;
  g.fillStyle(0x2d3354, 1).fillRoundedRect(-cw / 2 - 4, top - 4, cw + 8, ch + 8, 12);
  g.fillStyle(0xffc2d9, 1).fillRoundedRect(-cw / 2, top, cw, ch, 10);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-cw / 2, top, cw, ch * 0.35, { tl: 10, tr: 10, bl: 0, br: 0 });
  for (let i = 0; i < 5; i++) {
    g.fillStyle([0xff5a8a, 0x3b7de9, 0x3dbe5a, 0xffd02e, 0x9b5de5][i], 1)
      .fillCircle(-cw / 2 + cw * (0.15 + i * 0.175), top + ch * 0.7, size * 0.018);
  }
  g.fillStyle(0x7bd45a, 1).fillRoundedRect(-cw * 0.62, top + ch, cw * 1.24, size * 0.05, 6);
  const spacing = Math.min(size * 0.085, (cw * 0.9) / age);
  for (let i = 0; i < age; i++) {
    const cx = (i - (age - 1) / 2) * spacing;
    const ct = top - size * 0.16;
    g.fillStyle(i % 2 ? 0x3b7de9 : 0xff5a8a, 1).fillRoundedRect(cx - size * 0.018, ct, size * 0.036, size * 0.16, 3);
    g.fillStyle(0xffb000, 1).fillEllipse(cx, ct - size * 0.035, size * 0.04, size * 0.07);
    g.fillStyle(0xfff3a0, 1).fillEllipse(cx, ct - size * 0.028, size * 0.018, size * 0.035);
  }
  const label = scene.add.text(size * 0.32, -size * 0.32, String(age), {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${Math.round(size * 0.26)}px`,
    color: '#ffffff', fontStyle: 'bold', stroke: '#2d3354', strokeThickness: Math.round(size * 0.04),
  }).setOrigin(0.5);
  cake.add([disc, g, label]);
  cake.setSize(size, size).setInteractive(new Phaser.Geom.Circle(size / 2, size / 2, size / 2), Phaser.Geom.Circle.Contains);
  cake.setScale(0);
  scene.tweens.add({ targets: cake, scale: 1, duration: 400, delay: age * 60, ease: 'Back.easeOut' });
  return cake;
}
