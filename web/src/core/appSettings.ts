/**
 * Réglages de l'application, communs à tous les enfants : la langue, et si la
 * fenêtre des téléchargements a déjà été montrée (elle ne revient plus).
 */

const KEY = 'dinolearn.app.v1';

interface AppSettings {
  language: string;
  packsAsked: boolean;
}

function readSettings(): AppSettings {
  try {
    return { language: 'fr', packsAsked: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { language: 'fr', packsAsked: false };
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
