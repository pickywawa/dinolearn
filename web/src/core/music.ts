/**
 * Musique de fond douce, générée par le navigateur (Web Audio) : une petite
 * berceuse en do majeur, arpèges lents et notes de basse, sans fichier audio.
 * Elle se fait toute petite quand le dino parle.
 */

const BEAT = 0.46;
/** Accords (notes MIDI) : do, la mineur, fa, sol — deux mesures chacun. */
const CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
const PENTATONIC = [72, 74, 76, 79, 81];
const VOLUME = 0.32;

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

class BackgroundMusic {
  private ctx?: AudioContext;
  private master?: GainNode;
  private timer?: number;
  private nextTime = 0;
  private step = 0;
  private enabled = true;
  private ducked = false;

  /** Au premier toucher (les navigateurs interdisent le son avant). */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      this.master.connect(filter).connect(this.ctx.destination);
    }
    void this.ctx.resume();
    if (this.enabled) this.start();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.start();
    else this.stop();
  }

  get isEnabled() { return this.enabled; }

  /** Plus doux pendant que le dino parle. */
  duck(on: boolean) {
    this.ducked = on;
    this.fadeTo(this.timer ? this.level() : 0, 0.3);
  }

  private level() { return VOLUME * (this.ducked ? 0.35 : 1); }

  private fadeTo(value: number, seconds: number) {
    if (!this.ctx || !this.master) return;
    const g = this.master.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(g.value, this.ctx.currentTime);
    g.linearRampToValueAtTime(value, this.ctx.currentTime + seconds);
  }

  private start() {
    if (!this.ctx || this.timer) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 120);
    this.fadeTo(this.level(), 2);
  }

  private stop() {
    if (!this.timer) return;
    window.clearInterval(this.timer);
    this.timer = undefined;
    this.fadeTo(0, 0.6);
  }

  private schedule() {
    if (!this.ctx) return;
    while (this.nextTime < this.ctx.currentTime + 0.4) {
      const chord = CHORDS[Math.floor(this.step / 16) % CHORDS.length];
      const inBar = this.step % 8;
      // Basse au début de chaque mesure, arpège sur les temps, petite mélodie de temps en temps.
      if (inBar === 0) this.note(chord[0] - 12, this.nextTime, BEAT * 7, 0.22, 'sine');
      if (inBar % 2 === 0) this.note(chord[(inBar / 2) % 3] + 12, this.nextTime, BEAT * 3, 0.1, 'triangle');
      if (inBar === 3 || (inBar === 6 && Math.random() < 0.5)) {
        const melody = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
        this.note(melody, this.nextTime, BEAT * 2.5, 0.07, 'sine');
      }
      this.nextTime += BEAT;
      this.step++;
    }
  }

  private note(midi: number, at: number, length: number, gain: number, type: OscillatorType) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq(midi);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(env).connect(this.master!);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }
}

export const Music = new BackgroundMusic();
