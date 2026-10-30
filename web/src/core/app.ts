import { LinePicker } from './lines';
import { KeyValueStore, MemoryStore, Progress } from './progress';
import { Voice } from './voice';

function storage(): KeyValueStore {
  try {
    const probe = '__dinolearn__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return new MemoryStore();
  }
}

const rng = Math.random;
const progress = new Progress(storage());

// Pour tester un autre âge depuis l'URL : ?age=6
const ageParam = Number(new URLSearchParams(location.search).get('age'));
if (ageParam >= 3 && ageParam <= 7) progress.age = ageParam;

/** Services partagés par toutes les scènes. */
export const app = {
  rng,
  progress,
  voice: new Voice(new LinePicker(rng)),
  /** Vrai après le premier toucher (audio débloqué). */
  awake: false,
  /** Dernier jeu lancé au hasard (pour ne pas le relancer tout de suite). */
  lastGame: undefined as string | undefined,
};
