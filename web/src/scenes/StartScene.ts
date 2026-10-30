import Phaser from 'phaser';
import { app } from '../core/app';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { Dino } from '../dino/Dino';
import { Guide } from '../ui/Guide';
import { drawPrehistoric } from '../ui/prehistoric';
import { drawScenery, goTo, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Premier écran : un œuf (ou le dino endormi) à toucher. Ce premier geste
 * débloque le son et la voix sur mobile (obligatoire sur iOS).
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
    const firstTime = app.progress.seriesPlayed === 0 && !app.progress.seenTutorial;

    let target: Phaser.GameObjects.Image | Dino;
    if (firstTime) {
      const egg = this.add.image(W / 2, H * 0.58, 'egg');
      egg.setScale((u * 0.42) / egg.height);
      this.tweens.add({ targets: egg, angle: { from: -6, to: 6 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 900 });
      target = egg;
    } else {
      const dino = new Dino(this, W / 2, H * 0.78, u * 0.6);
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
      if (firstTime && target instanceof Phaser.GameObjects.Image) {
        this.tweens.add({
          targets: target, scale: target.scale * 1.15, angle: 0, duration: 200, yoyo: true, repeat: 2,
          onComplete: () => goTo(this, app.progress.ageChosen ? 'Home' : 'Age', { hatched: true }),
        });
      } else {
        goTo(this, app.progress.ageChosen ? 'Home' : 'Age');
      }
    });
  }
}
