import { Sfx } from './sfx';

/**
 * Vibration du téléphone (Android ; iPhone ne la propose pas aux pages web).
 * Coupée avec les bruitages, depuis l'espace parents.
 */
export function vibrate(pattern: number | number[]) {
  if (!Sfx.enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Vibration indisponible.
  }
}
