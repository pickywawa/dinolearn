import Phaser from 'phaser';
import { FIRST_NAMES } from '../content/names';
import { app } from '../core/app';
import { ears, packInstalled, voiceSupported } from '../core/ears';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { foodImage, FRUITS } from '../domain/models';
import { AGE_GRAMMAR, Heard, findAge, findName, nameGrammar } from '../domain/speech';
import { Dino } from '../dino/Dino';
import { DINO_COLORS } from '../dino/parts';
import { Guide } from '../ui/Guide';
import { MicButton } from '../ui/MicButton';
import { firstLaunchSetup } from '../ui/pin';
import { drawPrehistoric } from '../ui/prehistoric';
import { ageSize, drawScenery, goTo, isPortrait, unit } from '../ui/scenery';
import { makeCake } from '../ui/cake';
import { BaseScene } from './BaseScene';

/**
 * Juste après l'éclosion (premier lancement) : le bébé dino se présente et
 * explique comment l'enfant va l'aider (jouer, gagner des fruits, le nourrir
 * pour qu'il grandisse, l'habiller). Puis il demande à l'enfant son prénom et
 * son âge, à voix haute (sinon, l'âge se choisit avec les gâteaux), et lui
 * demande d'aller chercher un parent : le formulaire est déjà rempli, le parent
 * corrige si besoin et crée son code.
 */
export class HelloScene extends BaseScene {
  private dino!: Dino;
  private guide!: Guide;
  private shown: Phaser.GameObjects.GameObject[] = [];
  /** Le micro marche (pack français prêt, micro autorisé). */
  private voiceWorks = false;
  private vocab?: Set<string>;

  constructor() {
    super('Hello');
  }

  /** Premier lancement : après la présentation, prénom, âge, puis un parent. Sinon (nouvel enfant), juste la présentation. */
  private setup = true;

  create(data: { setup?: boolean } = {}) {
    this.initBase();
    this.setup = data.setup ?? true;
    drawScenery(this, 0xf6b26b, 0xffe6c2);
    drawPrehistoric(this);
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    this.dino = new Dino(this, W / 2, H * (isPortrait(this) ? 0.86 : 0.94), u * 0.42 * ageSize(app.progress.age));
    this.guide = new Guide(this, u * 0.15);
    this.shown = [];
    this.voiceWorks = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      ears.stop();
      Music.hush(false);
    });
    this.run(() => this.script());
  }

  private async script() {
    await this.wait(300);
    await this.present();
    // Nouvel enfant : sa fiche est déjà remplie par les parents.
    if (!this.setup) {
      goTo(this, 'Home', { hatched: true });
      return;
    }
    const name = await this.askName();
    const age = await this.askAge();
    // Au tour des parents.
    this.dino.react('wave');
    await this.say('hello.parent');
    this.input.enabled = false;
    await firstLaunchSetup({ name, age, voice: this.voiceWorks });
    // Le pack français déjà téléchargé sert aux jeux à voix haute.
    if (await packInstalled('fr')) {
      app.progress.updateSettings({ voicePacks: [...new Set([...app.progress.settings.voicePacks, 'fr'])] });
    }
    if (!this.alive) return;
    this.input.enabled = true;
    this.dino.react('cheer');
    await this.say('parent_code_done');
    goTo(this, 'Home', { hatched: true });
  }

  // ---- La présentation ----

  private async present() {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const baseScale = this.dino.scale;
    this.dino.react('wave');
    await app.voice.say([{ text: app.voice.lines.pick('hello.1').replace('{color}', DINO_COLORS[app.progress.color].name), lang: 'fr' }]);
    if (!this.alive) return;
    this.dino.react('lookAround');
    await this.say('hello.2');
    this.dino.react('happy');
    await this.say('hello.3');

    // Les jeux : des bulles qui apparaissent autour du dino.
    this.dino.react('cheer');
    this.popIcons(['lion', 'shapes', 'letters', 'numbers', 'flag-gb'], H * 0.24);
    await this.say('hello.4');
    this.clearShown();

    // Les fruits gagnés tombent dans le panier…
    const basket = this.add.image(W * 0.78, H * 0.62, 'ui-basket');
    basket.setScale((u * 0.22) / basket.width);
    this.shown.push(basket);
    const fruits = FRUITS.slice(0, 5).map((food, i) => {
      const fruit = this.add.image(basket.x + (i - 2) * u * 0.035, -u * 0.1, foodImage(food));
      fruit.setScale((u * 0.08) / fruit.width);
      this.tweens.add({ targets: fruit, y: basket.y - u * 0.07 - (i % 2) * u * 0.03, duration: 600, delay: i * 180, ease: 'Bounce.easeOut',
        onComplete: () => Sfx.play('pop') });
      this.shown.push(fruit);
      return fruit;
    });
    await this.say('hello.5');

    // … puis le dino les mange et grandit.
    const mouth = this.dino.mouthWorldPoint();
    for (const fruit of fruits) {
      await new Promise<void>((resolve) => this.tweens.add({
        targets: fruit, x: mouth.x, y: mouth.y, scale: fruit.scale * 0.4, duration: 260, ease: 'Quad.easeIn',
        onComplete: () => resolve(),
      }));
      fruit.setVisible(false);
      Sfx.play('chomp');
      this.dino.react('eat');
      await this.wait(160);
    }
    void this.say('hello.6');
    await this.wait(600);
    Sfx.play('levelUp');
    this.dino.react('levelUp');
    this.tweens.add({ targets: this.dino, scale: baseScale * 1.25, duration: 900, ease: 'Back.easeOut' });
    await this.waitForVoice();
    this.clearShown();

    // Les cadeaux : le dino essaie une couronne, des lunettes et une cape.
    this.dino.dress(['crown', 'sunglasses', 'cape-red']);
    this.dino.react('spin');
    this.popIcons(['acc-top-hat', 'acc-billed-cap', 'acc-wing', 'acc-magic-wand'], H * 0.24);
    await this.say('hello.7');
    this.clearShown();
    this.dino.dress(app.progress.collection.worn);

    this.dino.react('roar');
    await this.wait(500);
    this.dino.react('cheer');
    await this.say('hello.8');
    this.tweens.add({ targets: this.dino, scale: baseScale, duration: 600 });
  }

  /** Attend que le dino ait fini de parler. */
  private async waitForVoice() {
    while (app.voice.talking) await this.wait(100);
    await this.wait(200);
  }

  private popIcons(keys: string[], y: number) {
    const { width: W } = this.scale;
    const u = unit(this);
    const step = Math.min(W * 0.9 / keys.length, u * 0.2);
    keys.forEach((key, i) => {
      const x = W / 2 + (i - (keys.length - 1) / 2) * step;
      const disc = this.add.circle(x, y, step * 0.42, 0xffffff, 0.9).setStrokeStyle(4, 0xffd23f);
      const img = this.add.image(x, y, key);
      const scale = (step * 0.6) / Math.max(img.width, img.height);
      for (const obj of [disc, img]) {
        const final = obj === img ? scale : 1;
        obj.setScale(0);
        this.tweens.add({ targets: obj, scale: final, duration: 400, delay: i * 350, ease: 'Back.easeOut',
          onStart: () => obj === img && Sfx.play('pop') });
      }
      this.tweens.add({ targets: img, angle: { from: -6, to: 6 }, duration: 700, yoyo: true, repeat: -1, delay: i * 350 });
      this.shown.push(disc, img);
    });
  }

  private clearShown() {
    const objects = this.shown;
    this.shown = [];
    this.tweens.add({ targets: objects, alpha: 0, duration: 300, onComplete: () => objects.forEach((o) => o.destroy()) });
  }

  // ---- Le prénom et l'âge, à voix haute ----

  /** Le pack français (téléchargé pendant l'éclosion) est-il prêt ? On l'attend un peu. */
  private async voiceReady(): Promise<boolean> {
    if (!voiceSupported()) return false;
    const loading = ears.load('fr').then(() => true, () => false);
    let ready = await Promise.race([loading, this.wait(600).then(() => undefined)]);
    if (ready === undefined) {
      await this.say('voice.loading');
      ready = await Promise.race([loading, this.wait(12000).then(() => false)]);
    }
    if (ready) this.vocab = await ears.vocab('fr');
    return ready;
  }

  /**
   * Un gros micro : l'enfant le touche, le dino écoute. Renvoie ce qu'il a
   * entendu, ou null si le micro ne marche pas (refusé, en panne).
   */
  private async listen(grammar: string[], decisive: (h: Heard) => boolean): Promise<Heard | null> {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    let tapped: () => void = () => undefined;
    const tap = new Promise<void>((resolve) => { tapped = resolve; });
    const mic = new MicButton(this, W / 2, H * 0.3, u * 0.12, () => {
      app.voice.stop();
      ears.wake();
      tapped();
    });
    this.armIdle([[7000, () => this.run(async () => {
      this.guide.tap(mic);
      await this.say('voice.tap_mic');
      this.guide.hide();
    })]]);
    await tap;
    this.clearIdle();
    this.guide.hide();
    try {
      Music.hush(true);
      mic.setMode('listening');
      return await ears.listen('fr', grammar, { maxMs: 6000, onLevel: (l) => mic.active && mic.setLevel(l), decisive });
    } catch {
      return null;
    } finally {
      Music.hush(false);
      mic.destroy();
    }
  }

  private async askName(): Promise<string | undefined> {
    this.voiceWorks = await this.voiceReady();
    if (!this.voiceWorks) {
      await this.say('hello.name_later');
      return undefined;
    }
    this.dino.react('happy');
    await this.say('hello.name');
    await this.say('hello.mic_allow');
    const grammar = nameGrammar(FIRST_NAMES, this.vocab);
    for (let attempt = 0; attempt < 2; attempt++) {
      const heard = await this.listen(grammar, (h) => !!findName(h, FIRST_NAMES));
      if (!heard) {
        this.voiceWorks = false;
        await this.say('hello.name_later');
        return undefined;
      }
      const name = findName(heard, FIRST_NAMES);
      if (name) {
        app.progress.name = name;
        this.dino.react('cheer');
        await this.say('hello.name_ok');
        return name;
      }
      this.dino.react('think');
      await this.say(attempt === 0 ? 'hello.name_again' : 'hello.name_later');
    }
    return undefined;
  }

  private async askAge(): Promise<number | undefined> {
    if (this.voiceWorks) {
      this.dino.react('happy');
      await this.say('hello.age');
      const grammar = AGE_GRAMMAR.filter((w) => w === '[unk]' || !this.vocab || this.vocab.has(w));
      for (let attempt = 0; attempt < 2; attempt++) {
        const heard = await this.listen(grammar, (h) => findAge(h) !== undefined);
        if (!heard) break;
        const said = findAge(heard);
        if (said !== undefined) {
          const age = Phaser.Math.Clamp(said, 3, 7);
          this.dino.react('cheer');
          await this.say(`age.${age}`);
          return age;
        }
        this.dino.react('think');
        if (attempt === 0) await this.say('hello.age_again');
      }
      await this.say('hello.age_cakes');
    } else {
      await this.say('age.ask');
    }
    return this.chooseCake();
  }

  /** Sans micro : un gâteau par âge, avec ses bougies. */
  private chooseCake(): Promise<number> {
    const { width: W, height: H } = this.scale;
    const u = unit(this);
    const portrait = isPortrait(this);
    const size = portrait ? Math.min(W * 0.18, u * 0.18) : Math.min(W * 0.14, u * 0.26);
    return new Promise((resolve) => {
      let chosen = false;
      const cakes = [3, 4, 5, 6, 7].map((age, i) => {
        const cake = makeCake(this, W / 2 + (i - 2) * size * 1.12, H * (portrait ? 0.3 : 0.28), size, age);
        cake.on('pointerup', () => {
          if (chosen) return;
          chosen = true;
          Sfx.play('star');
          cakes.filter((c) => c !== cake).forEach((c) => c.setAlpha(0.35));
          this.dino.react('cheer');
          this.run(async () => {
            await this.say(`age.${age}`);
            cakes.forEach((c) => c.destroy());
            resolve(age);
          });
        });
        return cake;
      });
      this.armIdle([[8000, () => this.run(async () => {
        this.guide.tour(cakes, 900);
        await this.say('age.ask');
      })]]);
    });
  }
}
