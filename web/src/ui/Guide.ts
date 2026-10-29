import Phaser from 'phaser';

export interface Point { x: number; y: number }

/**
 * Main qui montre à l'enfant où toucher : elle glisse jusqu'à la cible,
 * tapote dessus avec une onde, ou mime un glisser-déposer.
 */
export class Guide {
  private hand: Phaser.GameObjects.Image;
  private ripple: Phaser.GameObjects.Arc;
  private timeline?: Phaser.Time.TimerEvent;
  private tweens: (Phaser.Tweens.Tween | Phaser.Tweens.TweenChain)[] = [];
  private tourId = 0;
  private baseScale: number;

  constructor(private scene: Phaser.Scene, size = 110) {
    this.ripple = scene.add.circle(0, 0, size * 0.35).setStrokeStyle(8, 0xffffff, 0.9).setVisible(false);
    this.hand = scene.add.image(0, 0, 'guide-hand').setOrigin(0.22, 0.04).setVisible(false);
    this.baseScale = size / this.hand.height;
    this.hand.setScale(this.baseScale);
    this.ripple.setDepth(1000);
    this.hand.setDepth(1001);
  }

  private stopAll() {
    this.timeline?.remove();
    this.timeline = undefined;
    this.tweens.forEach((t) => t.stop());
    this.tweens = [];
  }

  hide() {
    this.tourId++;
    this.stopAll();
    this.hand.setVisible(false);
    this.ripple.setVisible(false);
  }

  /** Va sur la cible et tapote en boucle. */
  tap(target: Point) {
    this.tourId++;
    this.moveAndTap(target);
  }

  private moveAndTap(target: Point) {
    this.stopAll();
    const startX = this.hand.visible ? this.hand.x : target.x + 120;
    const startY = this.hand.visible ? this.hand.y : target.y + 160;
    this.hand.setVisible(true).setPosition(startX, startY).setAlpha(1);
    this.tweens.push(this.scene.tweens.add({
      targets: this.hand, x: target.x, y: target.y, duration: 450, ease: 'Sine.easeOut',
      onComplete: () => this.loopTap(target),
    }));
  }

  private loopTap(target: Point) {
    const press = () => {
      this.ripple.setVisible(true).setPosition(target.x, target.y).setScale(0.3).setAlpha(1);
      this.tweens.push(this.scene.tweens.add({ targets: this.ripple, scale: 1.6, alpha: 0, duration: 600 }));
      this.tweens.push(this.scene.tweens.add({
        targets: this.hand, scale: { from: this.baseScale, to: this.baseScale * 0.85 }, duration: 140, yoyo: true,
      }));
    };
    press();
    this.timeline = this.scene.time.addEvent({ delay: 1000, loop: true, callback: press });
  }

  /** Passe de cible en cible (ex. toutes les bulles d'un menu). */
  tour(targets: Point[], stepMs = 1300) {
    if (targets.length === 0) return;
    const id = ++this.tourId;
    let i = 0;
    const step = () => {
      if (id !== this.tourId) return;
      this.moveAndTap(targets[i % targets.length]);
      i++;
      if (i < targets.length) this.scene.time.delayedCall(stepMs, step);
    };
    step();
  }

  /** Mime un glisser-déposer de `from` vers `to`, en boucle. */
  drag(from: Point, to: Point) {
    this.tourId++;
    this.stopAll();
    this.ripple.setVisible(false);
    this.hand.setVisible(true).setPosition(from.x, from.y).setAlpha(0);
    const run = () => {
      this.hand.setPosition(from.x, from.y).setAlpha(0);
      this.tweens.push(this.scene.tweens.chain({
        targets: this.hand,
        tweens: [
          { alpha: 1, duration: 250 },
          { x: to.x, y: to.y, duration: 1100, ease: 'Sine.easeInOut' },
          { alpha: 0, duration: 300, delay: 250 },
        ],
      }));
    };
    run();
    this.timeline = this.scene.time.addEvent({ delay: 2400, loop: true, callback: run });
  }

  destroy() {
    this.stopAll();
    this.hand.destroy();
    this.ripple.destroy();
  }
}
