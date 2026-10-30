import { app, switchChild } from '../core/app';
import { NewChild } from '../core/profiles';

/**
 * Code parent : un clavier à 4 chiffres posé sur le jeu. Il sert à ouvrir
 * l'espace parents et à débloquer le jeu quand le temps du jour est fini. Il
 * est créé au premier lancement ; « Code oublié ? » permet de le refaire après
 * un petit calcul d'adulte.
 */

const CSS = `
.pin { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(30, 34, 53, .72); font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.pin .card { width: 100%; max-width: 380px; background: #fff; color: #1f2937; border-radius: 18px; padding: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,.3); text-align: center; }
.pin h2 { margin: 0 0 6px; font-size: 20px; }
.pin p { margin: 0 0 14px; color: #4b5563; font-size: 15px; }
.pin .dots { display: flex; justify-content: center; gap: 14px; margin: 8px 0 6px; }
.pin .dots i { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #2d3354; }
.pin .dots i.on { background: #2d3354; }
.pin .error { min-height: 22px; color: #b91c1c; font-size: 14px; }
.pin .keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 6px; }
.pin button { font: inherit; border: 0; border-radius: 12px; min-height: 54px; cursor: pointer; background: #eef0f6;
  color: #1f2937; font-size: 22px; font-weight: 600; }
.pin button:active { background: #d9dcea; }
.pin .actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 14px; }
.pin .actions button, .pin .choices button { font-size: 16px; min-height: 46px; padding: 0 16px; font-weight: 500; }
.pin .choices { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.pin .primary { background: #43b649; color: #fff; }
.pin .link { background: none; color: #2563eb; text-decoration: underline; min-height: 40px; }
.pin .shake { animation: pin-shake .35s; }
@keyframes pin-shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
`;

function mount(): { root: HTMLDivElement; card: HTMLDivElement } {
  if (!document.getElementById('pin-css')) {
    const style = document.createElement('style');
    style.id = 'pin-css';
    style.textContent = CSS;
    document.head.append(style);
  }
  const root = document.createElement('div');
  root.className = 'pin';
  root.setAttribute('role', 'dialog');
  const card = document.createElement('div');
  card.className = 'card';
  root.append(card);
  document.body.append(root);
  return { root, card };
}

function button(label: string, className = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  if (className) b.className = className;
  return b;
}

interface PadOptions {
  title: string;
  help: string;
  digits?: number;
  cancel?: string;
  extra?: { label: string; onClick: () => void };
}

/**
 * Clavier : renvoie les chiffres tapés (ou null si annulé). `check` peut
 * refuser (message d'erreur, on recommence) ou accepter.
 */
function pad(opts: PadOptions, check: (value: string) => string | true): Promise<string | null> {
  const digits = opts.digits ?? 4;
  return new Promise((resolve) => {
    const { root, card } = mount();
    let value = '';
    const title = document.createElement('h2');
    title.textContent = opts.title;
    const help = document.createElement('p');
    help.textContent = opts.help;
    const dots = document.createElement('div');
    dots.className = 'dots';
    const error = document.createElement('div');
    error.className = 'error';
    const keys = document.createElement('div');
    keys.className = 'keys';
    const draw = () => {
      dots.replaceChildren(...Array.from({ length: digits }, (_, i) => {
        const dot = document.createElement('i');
        if (i < value.length) dot.className = 'on';
        return dot;
      }));
    };
    const done = (result: string | null) => {
      root.remove();
      resolve(result);
    };
    const press = (d: string) => {
      if (value.length >= digits) return;
      value += d;
      error.textContent = '';
      draw();
      if (value.length === digits) {
        const verdict = check(value);
        if (verdict === true) {
          setTimeout(() => done(value), 120);
        } else {
          error.textContent = verdict;
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          value = '';
          setTimeout(draw, 250);
        }
      }
    };
    for (const d of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      const b = button(d);
      b.addEventListener('click', () => press(d));
      keys.append(b);
    }
    const erase = button('⌫');
    erase.setAttribute('aria-label', 'Effacer');
    erase.addEventListener('click', () => {
      value = value.slice(0, -1);
      draw();
    });
    const zero = button('0');
    zero.addEventListener('click', () => press('0'));
    keys.append(document.createElement('span'), zero, erase);
    const actions = document.createElement('div');
    actions.className = 'actions';
    if (opts.extra) {
      const b = button(opts.extra.label, 'link');
      b.addEventListener('click', () => {
        done(null);
        opts.extra!.onClick();
      });
      actions.append(b);
    }
    if (opts.cancel) {
      const b = button(opts.cancel);
      b.addEventListener('click', () => done(null));
      actions.append(b);
    }
    card.append(title, help, dots, error, keys, actions);
    draw();
  });
}

/** Choix parmi des boutons (renvoie l'index, ou null si annulé). */
export function choose(title: string, help: string, labels: string[], cancel?: string): Promise<number | null> {
  return new Promise((resolve) => {
    const { root, card } = mount();
    const h = document.createElement('h2');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = help;
    const list = document.createElement('div');
    list.className = 'choices';
    labels.forEach((label, i) => {
      const b = button(label, i === 0 ? 'primary' : '');
      b.addEventListener('click', () => {
        root.remove();
        resolve(i);
      });
      list.append(b);
    });
    card.append(h, p, list);
    if (cancel) {
      const actions = document.createElement('div');
      actions.className = 'actions';
      const b = button(cancel);
      b.addEventListener('click', () => {
        root.remove();
        resolve(null);
      });
      actions.append(b);
      card.append(actions);
    }
  });
}

/** Crée (ou change) le code : on le tape deux fois. Renvoie faux si annulé. */
export async function createParentCode(title: string, help: string, cancel?: string): Promise<boolean> {
  for (;;) {
    const first = await pad({ title, help, cancel }, () => true);
    if (first === null) return false;
    const again = await pad({ title: 'Confirmez le code', help: 'Tapez le même code une deuxième fois.', cancel },
      (v) => (v === first ? true : 'Les deux codes sont différents. Recommencez.'));
    if (again === first) {
      app.profiles.setPin(first);
      return true;
    }
    if (again === null) return false;
  }
}

/** Code oublié : un calcul d'adulte, puis un nouveau code. */
async function forgotten(): Promise<boolean> {
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 6 + Math.floor(Math.random() * 4);
  const answer = String(a * b).padStart(3, '0');
  const ok = await pad({
    title: 'Code oublié ?',
    help: `Question pour un adulte : combien font ${a} × ${b} ? (3 chiffres)`,
    digits: 3,
    cancel: 'Annuler',
  }, (v) => (v === answer ? true : 'Ce n\'est pas ça.'));
  if (ok === null) return false;
  return createParentCode('Nouveau code parent', 'Choisissez un nouveau code à 4 chiffres.', 'Annuler');
}

/** Demande le code parent. Vrai si le bon code est tapé. */
export async function askParentCode(title: string, help: string): Promise<boolean> {
  let forgot = false;
  const result = await pad({
    title,
    help,
    cancel: 'Annuler',
    extra: { label: 'Code oublié ?', onClick: () => { forgot = true; } },
  }, (v) => (app.profiles.checkPin(v) ? true : 'Code incorrect.'));
  if (result !== null) return true;
  return forgot ? forgotten() : false;
}

export const DAILY_CHOICES = [0, 15, 30, 45, 60, 90];
export const NIGHT_CHOICES = ['', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
export const COUNTRY_CHOICES: [string, string][] = [
  ['fr', 'France'], ['be', 'Belgique'], ['ch', 'Suisse'], ['ca', 'Canada'], ['lu', 'Luxembourg'], ['other', 'Autre pays'],
];

const FORM_CSS = `
.pin form { text-align: left; }
.pin label.field { display: block; margin: 12px 0 6px; font-weight: 600; font-size: 15px; }
.pin input[type=text] { width: 100%; font: inherit; font-size: 18px; padding: 10px 12px; border-radius: 10px;
  border: 2px solid #d1d5db; }
.pin .seg { display: flex; flex-wrap: wrap; gap: 6px; }
.pin .seg button { font-size: 15px; min-height: 40px; padding: 0 12px; font-weight: 500; }
.pin .seg button.on { background: #2d3354; color: #fff; }
.pin .card.wide { max-width: 460px; max-height: 92vh; overflow-y: auto; }
`;

/**
 * Fiche d'un enfant : prénom, âge, pays, temps de jeu par jour, heure du
 * coucher. Renvoie null si annulé.
 */
export function childForm(title: string, help: string, initial?: Partial<NewChild>, cancel?: string): Promise<NewChild | null> {
  if (!document.getElementById('pin-form-css')) {
    const style = document.createElement('style');
    style.id = 'pin-form-css';
    style.textContent = FORM_CSS;
    document.head.append(style);
  }
  const value: NewChild = { name: '', age: 4, country: 'fr', dailyMinutes: 0, nightTime: '', ...initial };
  return new Promise((resolve) => {
    const { root, card } = mount();
    card.classList.add('wide');
    const form = document.createElement('form');
    const h = document.createElement('h2');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = help;
    const field = (label: string) => {
      const l = document.createElement('label');
      l.className = 'field';
      l.textContent = label;
      return l;
    };
    const name = document.createElement('input');
    name.type = 'text';
    name.placeholder = 'Prénom';
    name.value = value.name;
    name.maxLength = 20;
    name.autocomplete = 'off';
    const segment = <T>(options: [T, string][], get: () => T, set: (v: T) => void) => {
      const row = document.createElement('div');
      row.className = 'seg';
      const draw = () => row.replaceChildren(...options.map(([v, label]) => {
        const b = button(label, get() === v ? 'on' : '');
        b.addEventListener('click', () => { set(v); draw(); });
        return b;
      }));
      draw();
      return row;
    };
    const error = document.createElement('div');
    error.className = 'error';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const ok = button('Valider', 'primary');
    ok.type = 'submit';
    actions.append(ok);
    if (cancel) {
      const c = button(cancel);
      c.addEventListener('click', () => { root.remove(); resolve(null); });
      actions.append(c);
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      value.name = name.value.trim();
      if (!value.name) {
        error.textContent = 'Écrivez le prénom de l\'enfant.';
        name.focus();
        return;
      }
      root.remove();
      resolve(value);
    });
    form.append(h, p,
      field('Prénom'), name,
      field('Âge'), segment([3, 4, 5, 6, 7].map((a) => [a, `${a} ans`]), () => value.age, (v) => { value.age = v; }),
      field('Pays (jeu « Mon pays », dès 5 ans)'),
      segment(COUNTRY_CHOICES.map(([c, n]) => [c, n]), () => value.country, (v) => { value.country = v; }),
      field('Temps de jeu par jour'),
      segment(DAILY_CHOICES.map((m) => [m, m ? `${m} min` : 'Illimité']), () => value.dailyMinutes, (v) => { value.dailyMinutes = v; }),
      field('Heure du coucher (mode nuit)'),
      segment(NIGHT_CHOICES.map((t) => [t, t ? t.replace(':', ' h ') : 'Aucune']), () => value.nightTime, (v) => { value.nightTime = v; }),
      error, actions);
    card.append(form);
    if (!initial?.name) setTimeout(() => name.focus(), 50);
  });
}

/** Premier lancement : le parent crée son code, puis la fiche de l'enfant. */
export async function firstLaunchSetup() {
  if (!app.profiles.pin) {
    await createParentCode(
      'Bienvenue, parent !',
      'Choisissez un code à 4 chiffres. Il ouvre l\'espace parents et débloque le jeu quand le temps du jour est fini. '
        + 'Ne le donnez pas à l\'enfant !',
    );
  }
  if (app.profiles.count === 0) {
    const child = await childForm('Votre enfant', 'Son prénom, son âge et ses réglages. Vous pourrez ajouter d\'autres '
      + 'enfants et tout modifier dans l\'espace parents (cadenas de l\'accueil).');
    switchChild(app.profiles.add(child!));
  }
}

/** Mode nuit : un parent peut laisser jouer encore ce soir avec son code. */
export async function unlockNight(): Promise<boolean> {
  if (!await askParentCode('Le dino dort', 'C\'est l\'heure du coucher. Tapez le code parent pour jouer encore ce soir.')) {
    return false;
  }
  app.progress.unlockNight();
  return true;
}

/** Le temps est fini : un parent peut ajouter du temps avec son code. Vrai si débloqué. */
export async function unlockPlayTime(): Promise<boolean> {
  if (!await askParentCode('Temps de jeu terminé', 'Tapez le code parent pour ajouter du temps de jeu aujourd\'hui.')) {
    return false;
  }
  const options = [15, 30, -1];
  const index = await choose('Ajouter du temps', 'Pour aujourd\'hui seulement.',
    ['15 minutes de plus', '30 minutes de plus', 'Illimité aujourd\'hui'], 'Annuler');
  if (index === null) return false;
  app.progress.unlockToday(options[index]);
  return true;
}
