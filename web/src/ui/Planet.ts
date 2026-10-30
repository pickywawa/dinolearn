import Phaser from 'phaser';
import { Sfx } from '../core/sfx';

/** Un continent : contour en (longitude, latitude), en degrés. */
type Shape = [number, number][];

/** Contour irrégulier autour d'un centre (graine fixe : la planète est toujours la même). */
function blob(lon: number, lat: number, radius: number, seed: number): Shape {
  const points: Shape = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r = radius * (0.7 + 0.3 * Math.sin(seed + i * 1.7) * Math.cos(seed * 0.7 + i * 0.9));
    points.push([lon + Math.cos(a) * r * 1.3, lat + Math.sin(a) * r]);
  }
  return points;
}

const CONTINENTS: Shape[] = [
  blob(-100, 38, 32, 1), blob(-62, -18, 28, 2), blob(15, 48, 24, 3), blob(20, 2, 30, 4),
  blob(95, 42, 36, 5), blob(135, -25, 20, 6), blob(-20, -62, 16, 7), blob(62, -12, 14, 8), blob(-155, 10, 12, 9),
];
/** Volcans (longitude, latitude), sur les continents. */
const VOLCANOES: [number, number][] = [[-105, 38], [-62, -10], [22, 2], [100, 45], [138, -22], [12, 48]];

const RAD = Math.PI / 180;

/**
 * Le bouton « jouer » de l'accueil : la planète Terre qui tourne doucement,
 * avec ses volcans qui fument (et crachent de la lave quand on la touche).
 * La sphère est redessinée à chaque image : les continents et les volcans
 * suivent la rotation et disparaissent derrière le bord.
 */
export class Planet extends Phaser.GameObjects.Container {
  private globe: Phaser.GameObjects.Graphics;
  private ring: Phaser.GameObjects.Graphics;
  private rotation_ = 0;
  private pulse?: Phaser.Tweens.Tween;
  private lastTap = 0;
  private smokeTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly radius: number, onTap: () => void) {
    super(scene, x, y);
    const r = radius;
    const glow = scene.add.circle(0, 0, r * 1.12, 0x9fd8ff, 0.45);
    const shadow = scene.add.circle(0, r * 0.08, r, 0x000000, 0.18);
    this.globe = scene.add.graphics();
    // Lumière en haut à gauche, ombre en bas à droite : effet de boule.
    const light = scene.add.graphics();
    light.lineStyle(r * 0.16, 0x0b1a40, 0.18).strokeCircle(0, 0, r * 0.92);
    light.fillStyle(0xffffff, 0.28).fillEllipse(-r * 0.38, -r * 0.45, r * 0.6, r * 0.32);
    light.lineStyle(r * 0.06, 0xffffff, 1).strokeCircle(0, 0, r);
    // Anneau doré de mise en avant.
    this.ring = scene.add.graphics();
    this.add([glow, shadow, this.globe, light, this.ring]);
    this.setSize(r * 2, r * 2);
    this.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    this.on('pointerdown', () => scene.tweens.add({ targets: this, scale: this.scale * 0.92, duration: 90, yoyo: true }));
    this.on('pointerup', () => {
      const now = performance.now();
      if (now - this.lastTap < 400) return;
      this.lastTap = now;
      Sfx.play('pop');
      this.erupt();
      onTap();
    });
    scene.add.existing(this);
    this.draw();
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.spin, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => scene.events.off(Phaser.Scenes.Events.UPDATE, this.spin, this));
    // Un volcan visible fume de temps en temps.
    this.smokeTimer = scene.time.addEvent({ delay: 1400, loop: true, callback: () => this.smoke() });
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.smokeTimer.remove());
    // Respiration douce : « touche-moi ».
    scene.tweens.add({ targets: glow, scale: 1.08, alpha: 0.25, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private spin(_time: number, delta: number) {
    // Un tour en 40 secondes.
    this.rotation_ = (this.rotation_ + delta * 0.009) % 360;
    this.draw();
  }

  /** Position d'un point de la sphère (x, y dans la planète) et sa profondeur (> 0 : face visible). */
  private project(lon: number, lat: number): { x: number; y: number; z: number } {
    const r = this.radius;
    let l = ((lon + this.rotation_ + 540) % 360) - 180;
    const z = Math.cos(l * RAD) * Math.cos(lat * RAD);
    // Derrière la planète : collé au bord (le continent « passe » derrière).
    if (z < 0) l = l > 0 ? 90 : -90;
    // Axe un peu penché, comme la vraie Terre.
    const x = r * Math.sin(l * RAD) * Math.cos(lat * RAD);
    const y = -r * Math.sin(lat * RAD);
    const tilt = -0.25;
    return { x: x * Math.cos(tilt) - y * Math.sin(tilt), y: x * Math.sin(tilt) + y * Math.cos(tilt), z };
  }

  private draw() {
    const g = this.globe;
    const r = this.radius;
    g.clear();
    g.fillStyle(0x2f86de, 1).fillCircle(0, 0, r);
    for (const shape of CONTINENTS) {
      const points = shape.map(([lon, lat]) => this.project(lon, lat));
      if (points.every((p) => p.z < 0)) continue;
      const pts = points.map((p) => new Phaser.Math.Vector2(p.x, p.y));
      g.fillStyle(0x6cc04a, 1).fillPoints(pts, true);
      g.lineStyle(r * 0.025, 0x3f8f2f, 1).strokePoints(pts, true);
    }
    // Les volcans : petits cônes bruns au cratère orange.
    for (const [lon, lat] of VOLCANOES) {
      const p = this.project(lon, lat);
      if (p.z < 0.15) continue;
      const s = r * 0.13 * Math.min(1, p.z + 0.2);
      g.fillStyle(0x8a6a55, 1).fillTriangle(p.x - s, p.y + s * 0.5, p.x + s, p.y + s * 0.5, p.x, p.y - s * 0.7);
      g.lineStyle(r * 0.018, 0x2d3354, 1).strokeTriangle(p.x - s, p.y + s * 0.5, p.x + s, p.y + s * 0.5, p.x, p.y - s * 0.7);
      g.fillStyle(0xff7a2f, 1).fillEllipse(p.x, p.y - s * 0.62, s * 0.55, s * 0.22);
    }
    g.lineStyle(r * 0.05, 0x2d3354, 1).strokeCircle(0, 0, r);
  }

  /** Les volcans visibles : (x, y) dans la planète. */
  private visibleVolcanoes() {
    return VOLCANOES.map(([lon, lat]) => this.project(lon, lat)).filter((p) => p.z > 0.3);
  }

  private smoke() {
    const visible = this.visibleVolcanoes();
    if (!visible.length || !this.visible) return;
    const p = Phaser.Utils.Array.GetRandom(visible);
    const r = this.radius;
    const puff = this.scene.add.circle(p.x, p.y - r * 0.12, r * 0.05, 0xffffff, 0.9);
    this.add(puff);
    this.scene.tweens.add({
      targets: puff, y: p.y - r * 0.4, x: p.x + r * 0.08, scale: 2.2, alpha: 0, duration: 1600, onComplete: () => puff.destroy(),
    });
  }

  /** Toucher la planète : tous les volcans visibles crachent de la lave. */
  erupt() {
    const r = this.radius;
    for (const p of this.visibleVolcanoes()) {
      for (let i = 0; i < 6; i++) {
        const drop = this.scene.add.circle(p.x, p.y - r * 0.1, r * 0.035, Phaser.Utils.Array.GetRandom([0xff5a1f, 0xff9f43, 0xffd23f]));
        this.add(drop);
        this.scene.tweens.add({
          targets: drop, x: p.x + Phaser.Math.FloatBetween(-0.3, 0.3) * r, y: p.y - r * Phaser.Math.FloatBetween(0.3, 0.6),
          alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => drop.destroy(),
        });
      }
    }
  }

  /** Anneau doré qui pulse : « c'est ici qu'il faut toucher ». */
  highlight(on: boolean) {
    this.pulse?.stop();
    this.pulse = undefined;
    this.ring.clear();
    this.setScale(1);
    if (!on) return;
    this.ring.lineStyle(this.radius * 0.08, 0xffd23f, 1).strokeCircle(0, 0, this.radius * 1.16);
    this.pulse = this.scene.tweens.add({ targets: this, scale: 1.08, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
