import { setCountry } from '../content/countries';
import { GameDef, gamesForAge } from '../content/games';
import { LinePicker } from './lines';
import { Music } from './music';
import { Profiles } from './profiles';
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
const profiles = new Profiles(storage());

/** Services partagés par toutes les scènes. `progress` est celle de l'enfant qui joue. */
export const app = {
  rng,
  profiles,
  get progress(): Progress { return profiles.active; },
  voice: new Voice(new LinePicker(rng)),
  /** Vrai après le premier toucher (audio débloqué). */
  awake: false,
};

/** Applique les réglages de l'enfant qui joue (son, musique, pays). */
export function applyChildSettings() {
  const s = app.progress.settings;
  Sfx.enabled = s.sfx;
  Music.setEnabled(s.music);
  setCountry(s.country);
}

/** Change d'enfant (bouton de l'accueil, alternance des séries, nouvel enfant). */
export function switchChild(id: string) {
  profiles.setActive(id);
  applyChildSettings();
}

applyChildSettings();

/** Jeux proposés à l'enfant : ceux de son âge, sauf ceux que les parents ont désactivés. */
export function playableGames(): GameDef[] {
  const p = app.progress;
  const forAge = gamesForAge(p.age);
  const enabled = forAge.filter((g) => !p.settings.disabledGames.includes(g.id) && g.questions.length > 0);
  return enabled.length > 0 ? enabled : forAge;
}

// La musique se fait toute petite quand le dino parle ; le prénom de l'enfant dans les répliques.
app.voice.onTalk((talking) => Music.duck(talking));
app.voice.lines.name = () => app.progress.name;
