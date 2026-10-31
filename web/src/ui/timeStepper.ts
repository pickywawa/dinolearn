/**
 * Choix du temps de jeu par jour, le même dans la fiche de l'enfant (premier
 * lancement) et dans l'espace parents : − et + par pas de 5 minutes, et un
 * bouton « Illimité ».
 */

export const DEFAULT_DAILY_MINUTES = 15;
export const MINUTES_STEP = 5;
export const MAX_DAILY_MINUTES = 180;

/** Valeur suivante (−1 ou +1 pas) ; 0 = illimité, et + depuis « illimité » repart du temps par défaut. */
export function stepMinutes(current: number, dir: -1 | 1): number {
  if (current === 0) return dir > 0 ? DEFAULT_DAILY_MINUTES : MAX_DAILY_MINUTES;
  return Math.max(MINUTES_STEP, Math.min(MAX_DAILY_MINUTES, current + dir * MINUTES_STEP));
}

export const minutesLabel = (m: number) => (m === 0 ? 'Illimité' : m >= 60 && m % 60 === 0 ? `${m / 60} h`
  : m > 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);

const CSS = `
.time-stepper { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.time-stepper button { font: inherit; border: 0; border-radius: 12px; cursor: pointer; background: #e5e7eb; color: #1f2937;
  min-width: 52px; min-height: 48px; font-size: 24px; font-weight: 700; padding: 0 12px; }
.time-stepper button.unlimited { font-size: 15px; font-weight: 500; }
.time-stepper button.on { background: #2d3354; color: #fff; }
.time-stepper output { min-width: 96px; text-align: center; font-size: 22px; font-weight: 700; }
`;

export function timeStepper(get: () => number, set: (minutes: number) => void): HTMLElement {
  if (!document.getElementById('time-stepper-css')) {
    const style = document.createElement('style');
    style.id = 'time-stepper-css';
    style.textContent = CSS;
    document.head.append(style);
  }
  const row = document.createElement('div');
  row.className = 'time-stepper';
  const make = (label: string, cls = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (cls) b.className = cls;
    return b;
  };
  const minus = make('−');
  minus.setAttribute('aria-label', 'Moins de temps');
  const plus = make('+');
  plus.setAttribute('aria-label', 'Plus de temps');
  const out = document.createElement('output');
  const unlimited = make('Illimité', 'unlimited');
  const draw = () => {
    const m = get();
    out.textContent = minutesLabel(m);
    unlimited.className = `unlimited${m === 0 ? ' on' : ''}`;
    minus.disabled = m === MINUTES_STEP;
  };
  minus.addEventListener('click', () => { set(stepMinutes(get(), -1)); draw(); });
  plus.addEventListener('click', () => { set(stepMinutes(get(), 1)); draw(); });
  unlimited.addEventListener('click', () => { set(get() === 0 ? DEFAULT_DAILY_MINUTES : 0); draw(); });
  row.append(minus, out, plus, unlimited);
  draw();
  return row;
}
