import Phaser from 'phaser';
import { Sfx } from '../core/sfx';

export type MicState = 'idle' | 'loading' | 'listening';

/**
 * Gros bouton micro des jeux à voix haute. Au repos, il respire doucement
 * (« touche-moi ») ; pendant l'écoute, il devient vert et des ondes grandissent
 * avec le volume de la voix : l'enfant voit que le dino l'entend.
 */
export class MicButton extends Phaser.GameObjects.Container {
  private disc: Phaser.GameObjects.Arc;
  private waves: Phaser.GameObjects.Graphics;
  private spinner: Phaser.GameObjects.Graphics;
  private breath?: Phaser.Tweens.Tween;
  private spin?: Phaser.Tweens.Tween;
  private level = 0;
  mode: MicState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, readonly radius: number, onTap: () => void) {
    super(scene, x, y);
    this.waves = scene.add.graphics();
    const shadow = scene.add.circle(0, radius * 0.08, radius, 0x000000, 0.18);
    this.disc = scene.add.circle(0, 0, radius, 0xe5484d).setStrokeStyle(radius * 0.09, 0xffffff);
    const shine = scene.add.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.6, radius * 0.3, 0xffffff, 0.3).setAngle(-30);
    const icon = scene.add.image(0, 0, 'vo-micro');
    icon.setScale((radius * 1.25) / Math.max(icon.width, icon.height));
    this.spinner = scene.add.graphics();
    this.add([this.waves, shadow, this.disc, shine, icon, this.spinner]);
    this.setSize(radius * 2, radius * 2);
    this.setInteractive(new Phaser.Geom.Circle(radius, radius, radius * 1.15), Phaser.Geom.Circle.Contains);
    this.on('pointerup', () => {
      if (this.mode !== 'idle') return;
      Sfx.play('pop');
      scene.tweens.add({ targets: this, scale: 0.9, duration: 90, yoyo: true });
      onTap();
    });
    scene.add.existing(this);
    this.setScale(0);
    scene.tweens.add({ targets: this, scale: 1, duration: 380, ease: 'Back.easeOut', onComplete: () => this.setMode('idle') });
  }

  setMode(mode: MicState) {
    this.mode = mode;
    this.breath?.stop();
    this.spin?.stop();
    this.spinner.clear();
    this.setScale(1);
    this.disc.setFillStyle(mode === 'listening' ? 0x30a46c : 0xe5484d);
    this.setLevel(0);
    if (mode === 'idle') {
      this.breath = this.scene.tweens.add({ targets: this, scale: 1.07, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (mode === 'loading') {
      // Petit arc qui tourne : le dino prépare ses oreilles.
      this.spinner.lineStyle(this.radius * 0.12, 0xffd23f, 1).beginPath()
        .arc(0, 0, this.radius * 1.2, 0, Math.PI * 0.6).strokePath();
      this.spin = this.scene.tweens.add({ targets: this.spinner, angle: 360, duration: 900, repeat: -1 });
    }
    return this;
  }

  /** Volume de la voix (0 à 1) : des ondes autour du bouton. */
  setLevel(level: number) {
    // Lissage : les ondes montent vite et redescendent doucement.
    this.level = level > this.level ? level : this.level * 0.7 + level * 0.3;
    this.waves.clear();
    if (this.mode !== 'listening') return;
    const r = this.radius;
    for (let i = 1; i <= 3; i++) {
      const grow = Math.min(1, this.level * 1.6) * i * 0.16;
      this.waves.lineStyle(r * 0.07, 0x30a46c, 0.55 - i * 0.13).strokeCircle(0, 0, r * (1.05 + grow + i * 0.06));
    }
  }
}
