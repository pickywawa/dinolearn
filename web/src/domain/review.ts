/**
 * Avis sur les stores (App Store, Google Play), proposés aux parents : jamais à l'enfant.
 * L'invitation n'apparaît que dans l'espace parents (code), après un certain temps de jeu,
 * puis revient de temps en temps tant que les parents n'ont ni donné leur avis ni refusé.
 * Aucune récompense n'est donnée en échange d'un avis : Apple et Google l'interdisent.
 */

export interface ReviewState {
  /** Temps de jeu total de l'appareil (ms), tous enfants confondus. */
  playMs: number;
  /** Nombre d'invitations déjà montrées. */
  asked: number;
  /** Date de la dernière invitation (ms). */
  lastAsked?: number;
  /** Les parents ont ouvert la page d'avis : on ne redemande plus (le bouton reste). */
  done?: boolean;
  /** Les parents ont refusé : on ne redemande plus (le bouton reste). */
  muted?: boolean;
}

export const REVIEW = {
  /** Temps de jeu avant la première invitation : environ deux heures, soit plusieurs jours de jeu. */
  afterMs: 2 * 3600_000,
  /** Délai avant de reproposer après un « Plus tard ». */
  everyDays: 45,
  /** Au plus quatre invitations en tout. */
  maxAsks: 4,
};

export const emptyReview = (): ReviewState => ({ playMs: 0, asked: 0 });

/** Faut-il montrer l'invitation maintenant ? */
export function reviewDue(s: ReviewState, now = Date.now()): boolean {
  if (s.done || s.muted || s.asked >= REVIEW.maxAsks) return false;
  if (s.playMs < REVIEW.afterMs) return false;
  return s.lastAsked === undefined || now - s.lastAsked >= REVIEW.everyDays * 86_400_000;
}

/** Page d'avis du store : Apple ouvre directement la fenêtre de notation, Google la fiche de l'appli. */
export function reviewUrl(platform: string): string | undefined {
  if (platform === 'ios') return 'https://apps.apple.com/app/id6834579327?action=write-review';
  if (platform === 'android') return 'https://play.google.com/store/apps/details?id=fr.dinolearn.app';
  return undefined;
}
