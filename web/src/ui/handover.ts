import { app, switchChild } from '../core/app';

/** Plusieurs enfants qui alternent les séries : c'est au tour du suivant ? */
export const shouldHandOver = () => app.profiles.alternate && app.profiles.count > 1;

/** Le dino passe la main à l'enfant suivant (« Bravo Léa ! Maintenant, c'est au tour de Tom ! »), puis on change d'enfant. */
export async function handOver(): Promise<void> {
  const current = app.progress.name;
  const next = app.profiles.progressOf(app.profiles.nextId()).name;
  const lines = [
    `Bravo ${current} ! Maintenant, c'est au tour de ${next} !`,
    `Merci ${current} ! ${next}, à toi de jouer !`,
    `Super partie, ${current} ! Passe la main à ${next} !`,
  ];
  await app.voice.say([{ text: lines[Math.floor(app.rng() * lines.length)], lang: 'fr' }]);
  switchChild(app.profiles.nextId());
}
