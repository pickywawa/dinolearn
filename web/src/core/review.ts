import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { reviewState, saveReviewState } from './appSettings';
import { Progress } from './progress';
import { reviewDue, reviewUrl } from '../domain/review';

/** Le temps de jeu de tous les enfants alimente le compteur de l'invitation. */
Progress.onPlayTime = (ms) => {
  const s = reviewState();
  saveReviewState({ ...s, playMs: s.playMs + ms });
};

/** Il n'y a une page d'avis que dans l'appli iOS / Android, pas sur le site. */
export const canReview = () => reviewUrl(Capacitor.getPlatform()) !== undefined;

/** Montrer l'invitation à l'ouverture de l'espace parents ? */
export const shouldInviteReview = () => canReview() && reviewDue(reviewState());

/** L'invitation vient d'être montrée. */
export const markReviewAsked = () => {
  const s = reviewState();
  saveReviewState({ ...s, asked: s.asked + 1, lastAsked: Date.now() });
};

/** Les parents ne veulent plus qu'on leur redemande (le bouton des réglages reste). */
export const muteReview = () => saveReviewState({ ...reviewState(), muted: true });

/** Ouvre la page d'avis du store ; ne redemandera plus ensuite. */
export async function openReview() {
  const url = reviewUrl(Capacitor.getPlatform());
  if (!url) return;
  saveReviewState({ ...reviewState(), done: true });
  await AppLauncher.openUrl({ url });
}
