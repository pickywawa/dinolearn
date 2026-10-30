import Phaser from 'phaser';
import { app } from '../core/app';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { Dino } from '../dino/Dino';
import { DINO_COLORS } from '../dino/parts';
import { Guide } from '../ui/Guide';
import { firstLaunchSetup } from '../ui/pin';
import { drawPrehistoric } from '../ui/prehistoric';
import { ageSize, drawScenery, goTo, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Premier écran : l'œuf de l'enfant (ou son dino endormi) à toucher. Ce
 * premier geste débloque le son et la voix sur mobile (obligatoire sur iOS).
 * Au tout premier lancement, un parent crée le code et la fiche de l'enfant ;
 * puis l'œuf éclôt : un dino d'une couleur au hasard parmi 10, d'une taille
 * qui dépend de l'âge de l'enfant, qui l'appelle par son prénom.
 */
export class StartScene extends BaseScene {
  constructor() {
    super('Start');
  }

  create() {
    this.initBase();
    drawScenery(this, 0xf6b26b, 0xffe6c2);
    drawPrehistoric(this);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const setup = !app.profiles.pin || app.profiles.count === 0;
    const egg = setup || !app.progress.hatched;

    let target: Phaser.GameObjects.Image | Dino;
    if (egg) {
      const image = this.add.image(W / 2, H * 0.58, 'egg');
      image.setScale((u * 0.42) / image.height);
      this.tweens.add({ targets: image, angle: { from: -6, to: 6 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 900 });
      target = image;
      if (!setup && app.progress.name) {
        this.add.text(W / 2, H * 0.3, app.progress.name, {
          fontFamily: 'Andika, Arial, sans-serif', fontSize: `${Math.round(u * 0.09)}px`, color: '#ffffff', fontStyle: 'bold',
          stroke: '#2d3354', strokeThickness: Math.round(u * 0.014),
        }).setOrigin(0.5);
      }
    } else {
      const dino = new Dino(this, W / 2, H * 0.78, u * 0.6 * ageSize(app.progress.age));
      target = dino;
      const zzz = this.add.text(W / 2 + u * 0.15, H * 0.4, 'z z z', {
        fontFamily: 'sans-serif', fontSize: `${Math.round(u * 0.07)}px`, color: '#ffffff', fontStyle: 'bold',
      });
      this.tweens.add({ targets: zzz, y: '-=30', alpha: 0.3, duration: 1200, yoyo: true, repeat: -1 });
      this.time.delayedCall(10, () => dino.react('think'));
    }

    const guide = new Guide(this, u * 0.2);
    guide.tap({ x: W / 2 + u * 0.05, y: H * 0.6 });

    this.input.once('pointerdown', () => {
      // Dans le geste lui-même : débloque l'audio (navigateurs mobiles).
      app.voice.unlock();
      Sfx.unlock();
      Music.unlock();
      app.awake = true;
      guide.hide();
      Sfx.play('boing');
      if (!egg) {
        goTo(this, 'Home');
        return;
      }
      this.run(async () => {
        if (setup) {
          // Le dino, encore dans son œuf, demande d'aller chercher un parent.
          await this.say('parent_code');
          await firstLaunchSetup();
          this.input.enabled = true;
        }
        await this.hatch(target as Phaser.GameObjects.Image);
      });
    });
  }

  /** L'œuf se fend et le dino apparaît, d'une couleur que les frères et sœurs n'ont pas (si possible). */
  private async hatch(egg: Phaser.GameObjects.Image) {
    const p = app.progress;
    const taken = new Set(app.profiles.ids.filter((id) => id !== app.profiles.activeId)
      .map((id) => app.profiles.progressOf(id)).filter((c) => c.hatched).map((c) => c.color));
    const free = DINO_COLORS.map((_, i) => i).filter((i) => !taken.has(i));
    const pool = free.length ? free : DINO_COLORS.map((_, i) => i);
    const color = pool[Math.floor(app.rng() * pool.length)];
    p.hatch(color);

    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.tweens.killTweensOf(egg);
    await new Promise<void>((resolve) => this.tweens.add({
      targets: egg, angle: { from: -14, to: 14 }, duration: 90, yoyo: true, repeat: 5, onComplete: () => resolve(),
    }));
    Sfx.play('levelUp');
    const sparkles = this.add.particles(egg.x, egg.y, 'ui-sparkles', {
      speed: { min: 200, max: 480 }, scale: { start: 0.4, end: 0 }, lifespan: 900, emitting: false,
    });
    sparkles.explode(30);
    this.tweens.add({ targets: egg, scale: egg.scale * 1.4, alpha: 0, duration: 250 });
    const dino = new Dino(this, W / 2, H * 0.86, u * 0.62 * ageSize(p.age), color);
    dino.setScale(0);
    await new Promise<void>((resolve) => this.tweens.add({
      targets: dino, scale: (u * 0.62 * ageSize(p.age)) / Dino.HEIGHT, duration: 600, ease: 'Back.easeOut',
      onComplete: () => resolve(),
    }));
    dino.react('cheer');
    const name = p.name ? `${p.name} ` : '';
    await app.voice.say([
      { text: `Bonjour ${name}! Je suis ton dino !`, lang: 'fr', pauseAfter: 300 },
      { text: `Regarde, je suis tout ${DINO_COLORS[color].name} ! On va bien s'amuser ensemble !`, lang: 'fr' },
    ]);
    if (!this.alive) return;
    goTo(this, 'Home', { hatched: true });
  }
}
