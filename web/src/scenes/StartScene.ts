import Phaser from 'phaser';
import { app } from '../core/app';
import { ears, voiceSupported } from '../core/ears';
import { vibrate } from '../core/haptics';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { Dino } from '../dino/Dino';
import { EGG_ZIGZAG, PART_RESOLUTION } from '../dino/parts';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/** Nombre de touchers pour faire éclore l'œuf. */
const TAPS_TO_HATCH = 4;

/** Fissures dessinées après chaque toucher (coordonnées de l'image de l'œuf, 220 × 270). */
const CRACKS: [number, number][][][] = [
  [EGG_ZIGZAG.slice(4, 7), [[110, 128], [102, 112], [112, 98]]],
  [EGG_ZIGZAG.slice(2, 9), [[66, 126], [58, 108]], [[154, 126], [164, 110], [158, 96]]],
  [EGG_ZIGZAG, [[44, 150], [36, 170]], [[176, 150], [186, 170], [180, 184]]],
];

/**
 * Premier écran. Au tout premier lancement : un œuf qui tremble ; chaque toucher
 * le fissure (le téléphone vibre), et au quatrième il éclot : le bébé dino sort
 * et se présente. Les fois suivantes : le dino endormi, à réveiller.
 * Le premier toucher débloque aussi le son et la voix (obligatoire sur iOS).
 */
export class StartScene extends BaseScene {
  private guide!: Guide;

  constructor() {
    super('Start');
  }

  create() {
    this.initBase();
    drawScenery(this, 0xf6b26b, 0xffe6c2);
    drawPrehistoric(this);
    const u = unit(this);
    this.guide = new Guide(this, u * 0.2);
    // Premier lancement (pas encore de code parent) : l'œuf à faire éclore.
    if (!app.progress.settings.pin) this.egg();
    else this.sleepingDino();
  }

  /** Le premier geste de l'enfant : débloque l'audio (navigateurs mobiles). */
  private wake() {
    if (app.awake) return;
    app.voice.unlock();
    Sfx.unlock();
    Music.unlock();
    app.awake = true;
  }

  private sleepingDino() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const dino = new Dino(this, W / 2, H * 0.78, u * 0.6);
    const zzz = this.add.text(W / 2 + u * 0.15, H * 0.4, 'z z z', {
      fontFamily: 'sans-serif', fontSize: `${Math.round(u * 0.07)}px`, color: '#ffffff', fontStyle: 'bold',
    });
    this.tweens.add({ targets: zzz, y: '-=30', alpha: 0.3, duration: 1200, yoyo: true, repeat: -1 });
    this.time.delayedCall(10, () => dino.react('think'));
    this.guide.tap({ x: W / 2 + u * 0.05, y: H * 0.6 });
    this.input.once('pointerdown', () => {
      this.wake();
      this.guide.hide();
      Sfx.play('boing');
      goTo(this, app.progress.ageChosen ? 'Home' : 'Age');
    });
  }

  private egg() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const egg = this.add.container(W / 2, H * 0.6);
    const shell = this.add.image(0, 0, 'egg').setScale(1 / PART_RESOLUTION);
    const cracks = this.add.graphics();
    egg.add([shell, cracks]);
    const scale = (u * 0.42) / 270;
    egg.setScale(scale);
    const shadow = this.add.ellipse(W / 2, H * 0.6 + u * 0.21, u * 0.3, u * 0.05, 0x000000, 0.15).setDepth(-1);

    let taps = 0;
    let hatching = false;
    // L'œuf tremble de plus en plus fort à mesure qu'il se fissure.
    const tremble = () => {
      if (hatching) return;
      const strength = 5 + taps * 3;
      this.tweens.add({ targets: egg, angle: { from: -strength, to: strength }, duration: 70, yoyo: true, repeat: 3,
        onComplete: () => egg.setAngle(0) });
      this.tweens.add({ targets: egg, y: egg.y - u * 0.02, duration: 120, yoyo: true });
    };
    this.time.addEvent({ delay: 1500, loop: true, callback: tremble });
    this.guide.tap({ x: W / 2 + u * 0.05, y: H * 0.62 });

    const zone = this.add.zone(W / 2, H * 0.6, u * 0.5, u * 0.6).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      if (hatching) return;
      // Le dino demandera son prénom à l'enfant : le pack de reconnaissance (français) se télécharge pendant ce temps.
      if (taps === 0 && voiceSupported()) void ears.load('fr').catch(() => undefined);
      this.wake();
      this.guide.hide();
      taps++;
      Sfx.play('crack');
      vibrate(80);
      this.tweens.add({ targets: egg, x: { from: W / 2 - u * 0.015, to: W / 2 + u * 0.015 }, duration: 40, yoyo: true, repeat: 3,
        onComplete: () => egg.setX(W / 2) });
      this.tweens.add({ targets: egg, scaleX: scale * 1.08, scaleY: scale * 0.94, duration: 90, yoyo: true });
      this.chips(egg.x, egg.y - u * 0.05, 5);
      if (taps < TAPS_TO_HATCH) {
        this.drawCracks(cracks, taps);
        void app.voice.line(`egg.${taps}`);
        // On encourage à toucher encore.
        this.armIdle([[2500, () => this.guide.tap({ x: W / 2 + u * 0.05, y: H * 0.62 })]]);
        return;
      }
      hatching = true;
      this.clearIdle();
      zone.disableInteractive();
      this.run(() => this.hatch(egg, shadow, scale));
    });
  }

  private drawCracks(g: Phaser.GameObjects.Graphics, stage: number) {
    g.clear();
    for (const line of CRACKS[stage - 1]) {
      g.lineStyle(7, 0x2d3354, 1).beginPath();
      line.forEach(([x, y], i) => (i === 0 ? g.moveTo(x - 110, y - 135) : g.lineTo(x - 110, y - 135)));
      g.strokePath();
    }
  }

  /** Petits éclats de coquille qui sautent. */
  private chips(x: number, y: number, count: number) {
    const u = unit(this);
    for (let i = 0; i < count; i++) {
      const chip = this.add.triangle(x, y, 0, 0, u * 0.025, u * 0.01, u * 0.008, u * 0.022, 0xfff8e7)
        .setStrokeStyle(2, 0x2d3354).setDepth(5);
      this.tweens.add({
        targets: chip, x: x + Phaser.Math.Between(-1, 1) * u * Phaser.Math.FloatBetween(0.08, 0.2),
        y: y + u * Phaser.Math.FloatBetween(0.1, 0.25), angle: Phaser.Math.Between(-360, 360), alpha: 0,
        duration: Phaser.Math.Between(500, 800), ease: 'Quad.easeIn', onComplete: () => chip.destroy(),
      });
    }
  }

  /** La coquille s'ouvre en deux, le bébé dino sort, puis il se présente. */
  private async hatch(egg: Phaser.GameObjects.Container, shadow: Phaser.GameObjects.Ellipse, scale: number) {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    // Ça craque de partout : le téléphone vibre avant que l'œuf s'ouvre…
    Sfx.play('crack');
    vibrate([120, 60, 120, 60, 120]);
    this.tweens.add({ targets: egg, angle: { from: -14, to: 14 }, duration: 60, yoyo: true, repeat: 6 });
    await this.wait(900);
    // … et pendant qu'il s'ouvre.
    Sfx.play('hatch');
    vibrate([300, 80, 200, 80, 400]);
    const half = (key: string) => this.add.image(egg.x, egg.y, key).setScale(scale / PART_RESOLUTION).setDepth(3);
    const top = half('egg-top');
    const bottom = half('egg-bottom');
    egg.destroy();
    this.chips(W / 2, H * 0.58, 12);
    const dino = new Dino(this, W / 2, H * 0.6 + u * 0.12, u * 0.45).setDepth(2).setScale(0);
    this.tweens.add({ targets: top, y: top.y - u * 0.45, x: top.x + u * 0.25, angle: 200, alpha: 0, duration: 1200, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: bottom, y: bottom.y + u * 0.05, duration: 300, ease: 'Bounce.easeOut' });
    this.tweens.add({ targets: dino, scale: (u * 0.45) / Dino.HEIGHT, duration: 700, delay: 200, ease: 'Back.easeOut' });
    const p = this.add.particles(W / 2, H * 0.5, 'ui-sparkles', {
      speed: { min: 150, max: 380 }, scale: { start: 0.3, end: 0 }, lifespan: 900, emitting: false,
    }).setDepth(4);
    p.explode(24);
    await this.wait(700);
    dino.react('cheer');
    this.tweens.add({ targets: [bottom, shadow], alpha: 0, duration: 800, delay: 600 });
    await this.say('egg.hatched');
    goTo(this, 'Hello');
  }
}
