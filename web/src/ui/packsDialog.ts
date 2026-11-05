import { markPacksAsked, packsAsked } from '../core/packs';
import { packsPanel } from './packsPanel';

/**
 * Premier lancement : une fenêtre demande la langue et propose les
 * téléchargements (voix du dino, voix anglaise, reconnaissance vocale), tous
 * cochés. Une fois lancés, les téléchargements continuent en arrière-plan : on
 * peut fermer et jouer tout de suite. La fenêtre ne revient plus ; tout se
 * retrouve dans l'espace parents.
 */

const CSS = `
.packs-dialog { position: fixed; inset: 0; z-index: 1150; display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(30, 34, 53, .72); font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.packs-dialog .card { width: 100%; max-width: 460px; max-height: 92vh; overflow-y: auto; background: #fff; color: #1f2937;
  border-radius: 18px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,.3); }
.packs-dialog h2 { margin: 0 0 6px; font-size: 20px; }
.packs-dialog p { margin: 0 0 12px; color: #4b5563; font-size: 15px; }
.packs-dialog .later { display: block; width: 100%; margin-top: 10px; min-height: 44px; border: 0; border-radius: 12px;
  background: #eef0f6; color: #1f2937; font: inherit; cursor: pointer; }
`;

let open = false;

/**
 * Montre la fenêtre si elle n'a jamais été montrée. `onGesture` est appelé
 * pendant le toucher du parent (pour débloquer le son sur iOS).
 */
export function askPacksOnce(onGesture: () => void): Promise<void> {
  if (packsAsked() || open) return Promise.resolve();
  open = true;
  if (!document.getElementById('packs-dialog-css')) {
    const style = document.createElement('style');
    style.id = 'packs-dialog-css';
    style.textContent = CSS;
    document.head.append(style);
  }
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'packs-dialog';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Préparer le jeu');
    const card = document.createElement('div');
    card.className = 'card';
    const h = document.createElement('h2');
    h.textContent = 'Bienvenue ! On prépare le dino';
    const p = document.createElement('p');
    p.textContent = 'Choisissez la langue et ce qu\'il faut télécharger (une seule fois, de préférence en Wi-Fi). '
      + 'Vous pourrez jouer pendant les téléchargements, et tout retrouver dans l\'espace parents.';
    const later = document.createElement('button');
    later.type = 'button';
    later.className = 'later';
    later.textContent = 'Pas maintenant';
    const close = () => {
      markPacksAsked();
      root.remove();
      open = false;
      resolve();
    };
    later.addEventListener('click', () => {
      onGesture();
      close();
    });
    const panel = packsPanel({
      onStart: () => {
        onGesture();
        later.textContent = 'Continuer (les téléchargements continuent)';
      },
    });
    card.append(h, p, panel, later);
    root.append(card);
    document.body.append(root);
  });
}
