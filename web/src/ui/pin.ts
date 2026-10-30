import { setCountry } from '../content/countries';
import { app } from '../core/app';

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
  box-shadow: 0 10px 40px rgba(0,0,0,.3); text-align: center; max-height: calc(100dvh - 32px); overflow-y: auto; }
.pin .form { text-align: left; display: grid; gap: 12px; margin-bottom: 4px; }
.pin .form label { display: grid; gap: 4px; font-weight: 600; font-size: 15px; }
.pin .form input[type=text], .pin .form select { font: inherit; font-weight: 400; padding: 10px; border: 1px solid #d1d5db;
  border-radius: 10px; min-height: 44px; }
.pin .form .ages { display: flex; gap: 6px; }
.pin .form .ages button { flex: 1; min-height: 44px; font-size: 17px; }
.pin .form .ages button.on { background: #2d3354; color: #fff; }
.pin .form .check { display: flex; gap: 10px; align-items: flex-start; font-weight: 400; }
.pin .form .check input { width: 22px; height: 22px; margin-top: 2px; flex: none; }
.pin .form small { color: #6b7280; font-weight: 400; }
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
      app.progress.updateSettings({ pin: first });
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
  }, (v) => (app.progress.checkPin(v) ? true : 'Code incorrect.'));
  if (result !== null) return true;
  return forgot ? forgotten() : false;
}

const DAILY = [0, 15, 30, 45, 60, 90];

/** Ce que l'enfant a dit au dino pendant la présentation (le parent peut le corriger). */
export interface ChildIntro {
  name?: string;
  age?: number;
  /** Le micro a fonctionné (pack français prêt et micro autorisé). */
  voice?: boolean;
}

/**
 * Premier lancement : le parent vérifie le prénom et l'âge (déjà remplis si
 * l'enfant les a dits au dino), choisit le pays, le temps de jeu et le micro,
 * puis crée son code.
 */
export async function firstLaunchSetup(intro: ChildIntro = {}) {
  await new Promise<void>((resolve) => {
    const { root, card } = mount();
    const h = document.createElement('h2');
    h.textContent = 'Bienvenue, parent !';
    const p = document.createElement('p');
    p.textContent = intro.name || intro.age
      ? 'Voici ce que votre enfant a dit au dino. Vous pouvez le corriger.'
      : 'Quelques réglages pour commencer (modifiables dans l\'espace parents).';
    const form = document.createElement('div');
    form.className = 'form';
    const field = (label: string, control: HTMLElement, help?: string) => {
      const l = document.createElement('label');
      l.append(label, control);
      if (help) {
        const small = document.createElement('small');
        small.textContent = help;
        l.append(small);
      }
      form.append(l);
    };

    const name = document.createElement('input');
    name.type = 'text';
    name.autocomplete = 'off';
    name.maxLength = 30;
    name.value = intro.name ?? app.progress.settings.childName;
    name.placeholder = 'Prénom';
    field('Prénom de l\'enfant', name, 'Le dino l\'appellera par son prénom.');

    let age = intro.age ?? (app.progress.ageChosen ? app.progress.age : 4);
    const ages = document.createElement('div');
    ages.className = 'ages';
    for (let a = 3; a <= 7; a++) {
      const b = button(`${a} ans`, a === age ? 'on' : '');
      b.addEventListener('click', () => {
        age = a;
        ages.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      });
      ages.append(b);
    }
    field('Âge', ages, 'Il choisit les jeux proposés (lecture, calcul et anglais dès 5 ans) et le niveau de départ.');

    const country = document.createElement('select');
    for (const [code, label] of COUNTRY_CHOICES) country.append(new Option(label, code, false, code === app.progress.settings.country));
    field('Pays', country, 'Pour le jeu « Mon pays » (drapeau, capitale, spécialités…).');

    const daily = document.createElement('select');
    for (const m of DAILY) daily.append(new Option(m === 0 ? 'Illimité' : `${m} minutes`, String(m), false, m === app.progress.settings.dailyMinutes));
    field('Temps de jeu par jour', daily, 'Ensuite, le dino va se coucher ; votre code permet de jouer plus.');

    const mic = document.createElement('input');
    mic.type = 'checkbox';
    mic.checked = !!intro.voice;
    const check = document.createElement('label');
    check.className = 'check';
    const text = document.createElement('span');
    text.innerHTML = '<b>Autoriser le micro</b> (jeux à voix haute)<br><small>Tout reste sur cet appareil : la voix n\'est ni '
      + 'enregistrée, ni envoyée.</small>';
    check.append(mic, text);
    form.append(check);

    const go = button('Choisir mon code parent', 'primary');
    go.style.width = '100%';
    go.style.marginTop = '8px';
    go.addEventListener('click', () => {
      const childName = name.value.trim().replace(/\s+/g, ' ');
      app.progress.age = age;
      app.progress.updateSettings({
        childName, country: country.value, dailyMinutes: Number(daily.value), voice: mic.checked,
      });
      app.voice.lines.name = childName;
      setCountry(country.value);
      root.remove();
      resolve();
    });
    card.append(h, p, form, go);
  });
  await createParentCode(
    'Votre code parent',
    'Choisissez un code à 4 chiffres. Il ouvre l\'espace parents (cadenas de l\'accueil) et débloque le jeu quand le '
      + 'temps du jour est fini. Ne le donnez pas à l\'enfant !',
  );
}

export const COUNTRY_CHOICES: [string, string][] = [
  ['fr', 'France'], ['be', 'Belgique'], ['ch', 'Suisse'], ['ca', 'Canada'], ['lu', 'Luxembourg'], ['other', 'Autre pays'],
];

/** Le pays de l'enfant, pour le jeu « Mon pays » (dès 5 ans). */
export async function chooseCountry(cancel?: string): Promise<boolean> {
  const index = await choose('Le pays de l\'enfant', 'Pour le jeu « Mon pays » (drapeau, monuments, spécialités…), dès 5 ans. '
    + 'Modifiable dans l\'espace parents.', COUNTRY_CHOICES.map(([, name]) => name), cancel);
  if (index === null) return false;
  const code = COUNTRY_CHOICES[index][0];
  app.progress.updateSettings({ country: code });
  setCountry(code);
  return true;
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
