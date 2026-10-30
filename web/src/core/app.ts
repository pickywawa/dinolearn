import { setCountry } from '../content/countries';
import { GameDef, gamesForAge } from '../content/games';
import { LinePicker } from './lines';
import { Music } from './music';
import { Sfx } from './sfx';
import { KeyValueStore, MemoryStore, Progress } from './progress';
import { Voice } from './voice';
import { voiceSupported } from './ears';

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
Music.setEnabled(progress.settings.music);
setCountry(progress.settings.country);

/** Services partagés par toutes les scènes. */
export const app = {
  rng,
  progress,
  voice: new Voice(new LinePicker(rng)),
  /** Vrai après le premier toucher (audio débloqué). */
  awake: false,
};

/** Jeu à voix haute jouable : micro autorisé par les parents et pack de la langue téléchargé. */
export function voiceAvailable(game: GameDef): boolean {
  const { voice, voicePacks } = progress.settings;
  return !!game.voice && voice && voicePacks.includes(game.voice) && voiceSupported();
}

/**
 * Jeux proposés à l'enfant : ceux de son âge, sauf ceux que les parents ont désactivés
 * (et les jeux à voix haute sans micro autorisé ni pack de langue).
 */
export function playableGames(): GameDef[] {
  const forAge = gamesForAge(progress.age).filter((g) => !g.voice || voiceAvailable(g));
  const enabled = forAge.filter((g) => !progress.settings.disabledGames.includes(g.id) && g.questions.length > 0);
  return enabled.length > 0 ? enabled : forAge;
}

// Le dino appelle l'enfant par son prénom.
app.voice.lines.name = progress.settings.childName;

// La musique se fait toute petite quand le dino parle.
app.voice.onTalk((talking) => Music.duck(talking));
