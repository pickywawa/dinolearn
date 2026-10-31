import { setCountry } from '../content/countries';
import { GameDef, gamesForAge } from '../content/games';
import { LinePicker } from './lines';
import { Music } from './music';
import { Profiles } from './profiles';
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

/** Jeu à voix haute jouable : micro autorisé par les parents et pack de la langue téléchargé. */
export function voiceAvailable(game: GameDef): boolean {
  const { voice, voicePacks } = app.progress.settings;
  return !!game.voice && voice && voicePacks.includes(game.voice) && voiceSupported();
}

/**
 * Jeux proposés à l'enfant : ceux de son âge, sauf ceux que les parents ont désactivés
 * (et les jeux à voix haute sans micro autorisé ni pack de langue).
 */
export function playableGames(): GameDef[] {
  const p = app.progress;
  const forAge = gamesForAge(p.age).filter((g) => !g.voice || voiceAvailable(g));
  const enabled = forAge.filter((g) => !p.settings.disabledGames.includes(g.id) && g.questions.length > 0);
  return enabled.length > 0 ? enabled : forAge;
}

/** Une série lancée par la planète : questions, memory, tracés et jeux à voix haute, mélangés. */
export type PlanetSeries = { mixed: true };
export const planetSeries = (): PlanetSeries => ({ mixed: true });

// La musique se fait toute petite quand le dino parle ; le prénom de l'enfant dans les répliques.
app.voice.onTalk((talking) => Music.duck(talking));
app.voice.lines.name = () => app.progress.name;
