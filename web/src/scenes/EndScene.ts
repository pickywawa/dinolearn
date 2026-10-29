import { app } from '../core/app';
import { SeriesResult } from '../core/series';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { FOOD_ORDER, FOODS } from '../domain/models';
import { Dino } from '../dino/Dino';
import { Bubble } from '../ui/Bubble';
import { Guide } from '../ui/Guide';
import { drawScenery, goTo, homeButton, isPortrait, unit } from '../ui/scenery';
import { BaseScene } from './BaseScene';

/**
 * Bilan de série : étoiles, réaction du dino, aliments qui tombent dans le
 * panier ; puis le dino montre le panier (nourrir) et la flèche (rejouer).
 */
export class EndScene extends BaseScene {
  constructor() {
    super('End');
  }

  create(data: { result: SeriesResult }) {
    this.initBase();
    drawScenery(this, 0xffe9a8, 0xfff8e6);
    const r = data.result;
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);

    homeButton(this, () => goTo(this, 'Home'));
    const dino = new Dino(this, W / 2, H * (portrait ? 0.74 : 0.8), u * (portrait ? 0.7 : 0.5));
    const guide = new Guide(this, u * 0.17);

    const stars = [0, 1, 2].map((i) => {
      const star = this.add.image(W / 2 + (i - 1) * u * 0.2, H * 0.14, 'ui-star').setAlpha(0.25);
      star.setScale((u * 0.16) / star.width).setTintFill(0xffffff);
      return star;
    });

    const foods = FOOD_ORDER.flatMap((f) => Array<typeof f>(r.rewards[f] ?? 0).fill(f));
    const btnY = H * (portrait ? 0.86 : 0.86);
    const again = new Bubble(this, portrait ? W * 0.3 : W * 0.25, btnY, u * 0.12, 0x43b649, 'ui-play',
      () => goTo(this, 'Game', { gameId: r.gameId }));
    const basket = new Bubble(this, portrait ? W * 0.72 : W * 0.75, btnY, u * 0.12, 0xffb84d, 'ui-shopping-basket',
      () => goTo(this, 'Pantry'));
    [again, basket].forEach((b) => b.setAlpha(0).setScale(0.5));

    this.run(async () => {
      for (let i = 0; i < r.stars; i++) {
        await this.wait(380);
        Sfx.play('star');
        stars[i].clearTint().setAlpha(1);
        this.tweens.add({ targets: stars[i], scale: { from: stars[i].scale * 1.6, to: stars[i].scale }, duration: 400, ease: 'Back.easeOut' });
      }
      const group = r.stars === 3 ? (r.firstTrySuccesses === r.total ? 'series_perfect' : 'series_great')
        : r.stars === 2 ? 'series_good' : r.stars === 1 ? 'series_ok' : 'series_encourage';
      dino.react(r.stars >= 3 ? 'dance' : r.stars === 2 ? 'cheer' : r.stars === 1 ? 'happy' : 'think');
      await this.say(group);

      // Les aliments gagnés tombent dans le panier.
      [again, basket].forEach((b) => this.tweens.add({ targets: b, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' }));
      foods.forEach((food, i) => {
        const x = W / 2 + (i - (foods.length - 1) / 2) * u * 0.11;
        const img = this.add.image(x, H * 0.3, FOODS[food].image).setDepth(5);
        img.setScale((u * 0.1) / img.width);
        this.tweens.chain({
          targets: img,
          tweens: [
            { y: H * 0.36, duration: 300, delay: i * 120, ease: 'Bounce.easeOut' },
            { x: basket.x, y: basket.y, scale: img.scale * 0.5, duration: 500, delay: 900, ease: 'Quad.easeIn' },
            { alpha: 0, duration: 100 },
          ],
        });
      });
      dino.react('happy');
      await this.say('rewards');
      if (!this.alive) return;
      this.tweens.add({ targets: basket, scale: 1.15, duration: 120, yoyo: true, repeat: 2 });

      // Le dino guide : d'abord le panier (s'il peut encore manger), puis rejouer.
      if (app.progress.xpEatenToday() < BALANCE.dailyXpCap) {
        basket.highlight(true);
        dino.pointAt(basket.x, basket.y);
        guide.tap(basket);
        await this.say('end.feed');
        basket.highlight(false);
      }
      again.highlight(true);
      dino.pointAt(again.x, again.y);
      guide.tap(again);
      await this.say('end.again');
      basket.highlight(true);
      guide.tour([basket, again], 1500);
    });
  }
}
