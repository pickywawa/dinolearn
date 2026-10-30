import { GameDef, gamesForAge } from '../content/games';
import { LinePicker } from './lines';
import { Sfx } from './sfx';
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

Sfx.enabled = progress.settings.sfx;

/** Services partagés par toutes les scènes. */
export const app = {
  rng,
  progress,
  voice: new Voice(new LinePicker(rng)),
  /** Vrai après le premier toucher (audio débloqué). */
  awake: false,
};

/** Jeux proposés à l'enfant : ceux de son âge, sauf ceux que les parents ont désactivés. */
export function playableGames(): GameDef[] {
  const forAge = gamesForAge(progress.age);
  const enabled = forAge.filter((g) => !progress.settings.disabledGames.includes(g.id));
  return enabled.length > 0 ? enabled : forAge;
}
