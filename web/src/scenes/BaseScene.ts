import Phaser from 'phaser';
import { app } from '../core/app';

/**
 * Scène avec des « scripts » asynchrones (le dino parle, montre, attend)
 * automatiquement interrompus quand on quitte la scène.
 */
export abstract class BaseScene extends Phaser.Scene {
  protected alive = true;
  private idleTimers: Phaser.Time.TimerEvent[] = [];

  protected initBase() {
    this.alive = true;
    this.input.enabled = true;
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.alive = false;
      this.clearIdle();
    });
  }

  /** Attend `ms` ; rejette si la scène a été quittée entre-temps. */
  protected wait(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.time.delayedCall(ms, () => (this.alive ? resolve() : reject(new SceneLeft())));
    });
  }

  /** Fait parler le dino puis vérifie que la scène est toujours active. */
  protected async say(group: string): Promise<void> {
    await app.voice.line(group);
    if (!this.alive) throw new SceneLeft();
  }

  /** Lance un script ; l'interruption (scène quittée) n'est pas une erreur. */
  protected run(script: () => Promise<void>) {
    script().catch((e) => {
      if (!(e instanceof SceneLeft)) console.error(e);
    });
  }

  /** Relances d'inactivité : remplacées à chaque appel. */
  protected armIdle(steps: [number, () => void][]) {
    this.clearIdle();
    for (const [ms, fn] of steps) this.idleTimers.push(this.time.delayedCall(ms, fn));
  }

  protected clearIdle() {
    this.idleTimers.forEach((t) => t.remove());
    this.idleTimers = [];
  }
}

export class SceneLeft extends Error {}
