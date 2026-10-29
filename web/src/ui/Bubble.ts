import Phaser from 'phaser';
import { Sfx } from '../core/sfx';

/**
 * Grosse bulle ronde sans texte (icône seule), qui rebondit au toucher.
 * Anti-rebond de 400 ms (spécifications §4.1).
 */
export class Bubble extends Phaser.GameObjects.Container {
  private icon: Phaser.GameObjects.Image;
  private ring: Phaser.GameObjects.Graphics;
  private pulseTween?: Phaser.Tweens.Tween;
  private lastTap = 0;
  enabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly radius: number,
    color: number,
    iconKey: string,
    private onTap: () => void,
    iconScale = 0.62,
  ) {
    super(scene, x, y);
    const shadow = scene.add.circle(0, radius * 0.08, radius, 0x000000, 0.18);
    const disc = scene.add.circle(0, 0, radius, color).setStrokeStyle(radius * 0.09, 0xffffff);
    const shine = scene.add.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.6, radius * 0.3, 0xffffff, 0.3)
      .setAngle(-30);
    this.icon = scene.add.image(0, 0, iconKey);
    this.icon.setScale((radius * 2 * iconScale) / Math.max(this.icon.width, this.icon.height));
    this.ring = scene.add.graphics();
    this.add([shadow, disc, shine, this.icon, this.ring]);
    this.setSize(radius * 2, radius * 2);
    this.setInteractive(new Phaser.Geom.Circle(radius, radius, radius), Phaser.Geom.Circle.Contains);

    this.on('pointerdown', () => {
      if (!this.enabled) return;
      scene.tweens.add({ targets: this, scale: 0.88, duration: 90, yoyo: true });
    });
    this.on('pointerup', () => {
      const now = performance.now();
      if (!this.enabled || now - this.lastTap < 400) return;
      this.lastTap = now;
      Sfx.play('pop');
      this.onTap();
    });
    scene.add.existing(this);
  }

  /** Pulsation + anneau doré : « c'est ici qu'il faut toucher ». */
  highlight(on: boolean) {
    this.pulseTween?.stop();
    this.pulseTween = undefined;
    this.ring.clear();
    this.setScale(1);
    if (!on) return;
    this.ring.lineStyle(this.radius * 0.1, 0xffd23f, 1).strokeCircle(0, 0, this.radius * 1.12);
    this.pulseTween = this.scene.tweens.add({
      targets: this, scale: 1.1, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  setIcon(key: string) {
    this.icon.setTexture(key);
  }
}
