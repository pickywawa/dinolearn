import Phaser from 'phaser';

export type MicState = 'idle' | 'loading' | 'listening';

/** Couleur unique du micro : il n'est visible que quand l'enfant peut parler. */
const COLOR = 0x2fb36d;
const DARK = 0x1f7a4a;

/**
 * Gros micro des jeux à voix haute. Une seule règle pour l'enfant : quand le micro est
 * là, il parle. Il surgit quand le dino écoute (`listening`) et disparaît sinon (le dino
 * parle, réfléchit ou prépare ses oreilles) ; pas de changement de couleur à comprendre.
 * Pendant l'écoute, des ondes partent de lui en continu (« je t'écoute ») et, avec la
 * voix, il gonfle, penche et ses ondes grandissent : l'enfant voit que le dino l'entend.
 */
export class MicButton extends Phaser.GameObjects.Container {
  private core: Phaser.GameObjects.Container;
  private waves: Phaser.GameObjects.Graphics;
  private pings: Phaser.GameObjects.Arc[] = [];
  private loops: Phaser.Tweens.Tween[] = [];
  private level = 0;
  mode: MicState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, readonly radius: number) {
    super(scene, x, y);
    const r = radius;
    this.waves = scene.add.graphics();
    // Ondes « sonar » qui partent du micro tant qu'il écoute.
    for (let i = 0; i < 2; i++) {
      this.pings.push(scene.add.circle(0, 0, r, COLOR, 0).setStrokeStyle(r * 0.06, COLOR, 0.6).setVisible(false));
    }
    const shadow = scene.add.circle(0, r * 0.1, r, 0x000000, 0.18);
    const rim = scene.add.circle(0, 0, r * 1.08, 0xffffff);
    const disc = scene.add.circle(0, 0, r, COLOR).setStrokeStyle(r * 0.05, DARK, 0.5);
    const shine = scene.add.ellipse(-r * 0.32, -r * 0.48, r * 0.75, r * 0.32, 0xffffff, 0.35).setAngle(-28);
    const icon = scene.add.image(0, r * 0.02, 'vo-micro');
    icon.setScale((r * 1.25) / Math.max(icon.width, icon.height));
    this.core = scene.add.container(0, 0, [shadow, rim, disc, shine, icon]);
    this.add([...this.pings, this.waves, this.core]);
    this.setSize(r * 2, r * 2);
    scene.add.existing(this);
    this.setVisible(false).setScale(0);
  }

  setMode(mode: MicState) {
    const was = this.mode;
    this.mode = mode;
    this.level = 0;
    this.waves.clear();
    this.core.setScale(1).setAngle(0);
    if (mode === 'listening' && was !== 'listening') this.appear();
    else if (mode !== 'listening' && was === 'listening') this.disappear();
    return this;
  }

  private appear() {
    this.stopLoops();
    this.scene.tweens.killTweensOf(this);
    this.setVisible(true).setScale(0);
    this.scene.tweens.add({ targets: this, scale: 1, duration: 320, ease: 'Back.easeOut' });
    // Respiration douce et ondes qui partent : le dino écoute.
    this.loops.push(this.scene.tweens.add({ targets: this.core, scaleX: 1.05, scaleY: 1.05, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
    this.pings.forEach((ping, i) => {
      ping.setVisible(true).setScale(1).setAlpha(0);
      this.loops.push(this.scene.tweens.add({
        targets: ping, scale: 1.7, alpha: { from: 0.9, to: 0 }, duration: 1300, delay: i * 650, repeat: -1, ease: 'Sine.easeOut',
      }));
    });
  }

  private disappear() {
    this.stopLoops();
    this.pings.forEach((p) => p.setVisible(false));
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, scale: 0, duration: 200, ease: 'Back.easeIn', onComplete: () => this.setVisible(false) });
  }

  private stopLoops() {
    this.loops.forEach((tw) => tw.stop());
    this.loops = [];
    this.core.setScale(1);
  }

  /** Volume de la voix (0 à 1) : le micro gonfle, penche, et ses ondes grandissent. */
  setLevel(level: number) {
    // Lissage : les ondes montent vite et redescendent doucement.
    this.level = level > this.level ? level : this.level * 0.7 + level * 0.3;
    this.waves.clear();
    if (this.mode !== 'listening') return;
    const l = Math.min(1, this.level * 1.6);
    // Pas pendant qu'il surgit (on casserait son apparition).
    if (!this.scene.tweens.isTweening(this)) this.setScale(1 + l * 0.2);
    this.setAngle(Math.sin(this.scene.time.now / 70) * l * 10);
    const r = this.radius;
    for (let i = 1; i <= 3; i++) {
      const grow = l * i * 0.16;
      this.waves.lineStyle(r * 0.07, COLOR, (0.55 - i * 0.13) * Math.min(1, l * 2)).strokeCircle(0, 0, r * (1.1 + grow + i * 0.06));
    }
  }

  destroy(fromScene?: boolean) {
    this.stopLoops();
    super.destroy(fromScene);
  }
}
