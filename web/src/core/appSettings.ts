import { deviceLang } from '../domain/langs';
import { ReviewState, emptyReview } from '../domain/review';

/**
 * Réglages de l'application, communs à tous les enfants : la langue, et si la
 * fenêtre des téléchargements a déjà été montrée (elle ne revient plus).
 */

const KEY = 'dinolearn.app.v1';

interface AppSettings {
  language: string;
  packsAsked: boolean;
  /** Invitation à donner un avis sur le store (voir domain/review). */
  review?: ReviewState;
}

/** Au tout premier lancement : la langue de l'appareil (français si elle n'est pas proposée). */
const deviceLanguage = () => (typeof navigator === 'undefined' ? 'fr' : deviceLang(navigator.languages?.length ? navigator.languages : [navigator.language]));

function readSettings(): AppSettings {
  try {
    return { language: deviceLanguage(), packsAsked: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { language: deviceLanguage(), packsAsked: false };
  }
}

function writeSettings(change: Partial<AppSettings>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readSettings(), ...change }));
  } catch {
    // Stockage indisponible : la fenêtre reviendra au prochain lancement.
  }
}

export const appLanguage = () => readSettings().language;
export const setAppLanguage = (language: string) => writeSettings({ language });
export const packsAsked = () => readSettings().packsAsked;
export const markPacksAsked = () => writeSettings({ packsAsked: true });

export const reviewState = (): ReviewState => ({ ...emptyReview(), ...readSettings().review });
export const saveReviewState = (review: ReviewState) => writeSettings({ review });
