import { app, switchChild } from '../core/app';
import { NewChild } from '../core/profiles';
import { DEFAULT_DAILY_MINUTES, timeStepper } from './timeStepper';
import { lang, t } from '../i18n';
import { langInfo } from '../domain/langs';
import { countryLabel } from '../content/countries';

/** Texte des fenêtres de code et de la fiche enfant (clé « pin.<nom> »). */
const T = (key: string, fr: string, params?: Record<string, string | number>) => t(`pin.${key}`, params, fr);

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
    erase.setAttribute('aria-label', T('erase', 'Effacer'));
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
  // Une seule saisie : en cas d'oubli, « Code oublié ? » permet d'en créer un nouveau.
  const code = await pad({ title, help: `${help} ${T('remember', 'Retenez-le bien.')}`, cancel }, () => true);
  if (code === null) return false;
  app.profiles.setPin(code);
  return true;
}

/** Code oublié : un calcul d'adulte, puis un nouveau code. */
async function forgotten(): Promise<boolean> {
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 6 + Math.floor(Math.random() * 4);
  const answer = String(a * b).padStart(3, '0');
  const ok = await pad({
    title: T('forgot', 'Code oublié ?'),
    help: T('adultQuestion', 'Question pour un adulte : combien font {a} × {b} ? (3 chiffres)', { a, b }),
    digits: 3,
    cancel: T('cancel', 'Annuler'),
  }, (v) => (v === answer ? true : T('wrongAnswer', 'Ce n\'est pas ça.')));
  if (ok === null) return false;
  return createParentCode(T('newCode', 'Nouveau code parent'), T('newCodeHelp', 'Choisissez un nouveau code à 4 chiffres.'), T('cancel', 'Annuler'));
}

/** Demande le code parent. Vrai si le bon code est tapé. */
export async function askParentCode(title: string, help: string): Promise<boolean> {
  let forgot = false;
  const result = await pad({
    title,
    help,
    cancel: T('cancel', 'Annuler'),
    extra: { label: T('forgot', 'Code oublié ?'), onClick: () => { forgot = true; } },
  }, (v) => (app.profiles.checkPin(v) ? true : T('wrongCode', 'Code incorrect.')));
  if (result !== null) return true;
  return forgot ? forgotten() : false;
}

export const NIGHT_CHOICES = ['', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
/** Pays proposés : ceux du jeu « Mon pays », puis le pays principal de chaque langue. */
export const COUNTRY_CODES = ['fr', 'be', 'ch', 'ca', 'lu', 'gb', 'us', 'es', 'mx', 'it', 'de', 'at', 'pt', 'br', 'ru', 'cn', 'in', 'eg',
  'ma', 'sa', 'pk', 'bd', 'ng', 'ph', 'cd', 'tz', 'za', 'co', 'ar', 'sd', 'dz', 'iq', 'ke', 'ug', 'ci', 'cm', 'id', 'vn',
  'tr', 'ir', 'pl', 'ua', 'th', 'ye', 'ao', 'gh', 'mz', 'pe', 'mg', 've', 'sy', 'af', 'np', 'kr'];
/** Choix de pays affichés : celui de la langue d'abord, puis les autres. */
export const countryChoices = (): [string, string][] => {
  const first = langInfo(lang()).country;
  const codes = [first, ...COUNTRY_CODES.filter((c) => c !== first)];
  return [...codes.map((c): [string, string] => [c, countryLabel(c)]), ['other', T('otherCountry', 'Autre pays')]];
};
/** Pays par défaut d'un nouvel enfant : celui de l'appareil s'il est proposé, sinon celui de la langue. */
export const defaultCountry = () => {
  const region = (navigator.languages?.[0] ?? navigator.language ?? '').split(/[-_]/)[1]?.toLowerCase();
  return region && COUNTRY_CODES.includes(region) ? region : langInfo(lang()).country;
};


const FORM_CSS = `
.pin { padding: max(10px, var(--safe-top, 0px)) max(12px, var(--safe-right, 0px)) max(10px, var(--safe-bottom, 0px)) max(12px, var(--safe-left, 0px)); }
.pin, .pin * { box-sizing: border-box; }
.pin form { text-align: left; }
.pin .card.wide { max-width: 640px; padding: 10px 16px; max-height: calc(100dvh - 20px); overflow-y: auto; }
.pin .card.wide h2 { font-size: 18px; margin: 0 0 2px; }
.pin .card.wide p { font-size: 13px; line-height: 1.3; margin: 0 0 8px; }
.pin .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px 10px; }
.pin .grid > * { min-width: 0; }
.pin .s6 { grid-column: span 6; } .pin .s4 { grid-column: span 4; } .pin .s3 { grid-column: span 3; } .pin .s2 { grid-column: span 2; }
.pin label.field { display: block; margin: 0; font-weight: 600; font-size: 12px; color: #4b5563; }
.pin label.field > :not(span) { display: block; margin-top: 2px; }
.pin input[type=text], .pin select { width: 100%; font: inherit; font-size: 16px; color: #1f2937; padding: 7px 10px; height: 40px;
  border-radius: 10px; border: 2px solid #d1d5db; background: #fff; }
.pin label.check { display: flex; gap: 8px; align-items: flex-start; margin: 0; font-size: 13px; line-height: 1.25; }
.pin label.check input { width: 20px; height: 20px; margin-top: 1px; flex: none; }
.pin label.check small { display: none; }
.pin .checks { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.pin .error { min-height: 0; font-size: 13px; }
.pin .error:empty { display: none; }
.pin .card.wide .actions { margin-top: 8px; }
.pin .card.wide .actions button { min-height: 40px; }
.pin .time-stepper { gap: 6px; flex-wrap: nowrap; }
.pin .time-stepper button { min-height: 40px; min-width: 42px; font-size: 20px; padding: 0 8px; }
.pin .time-stepper button.unlimited { font-size: 13px; }
.pin .time-stepper output { min-width: 64px; font-size: 17px; }
@media (max-width: 520px) { .pin .s4, .pin .s3, .pin .s2 { grid-column: span 6; } .pin .s4.name { grid-column: span 4; } .pin .s2.age { grid-column: span 2; } }
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
  const value: NewChild = { name: '', age: 4, country: defaultCountry(), dailyMinutes: DEFAULT_DAILY_MINUTES, nightTime: '', voice: true,
    chooseGames: true, ...initial };
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
    name.placeholder = T('firstName', 'Prénom');
    name.value = value.name;
    name.maxLength = 20;
    name.autocomplete = 'off';
    /** Liste déroulante (compacte : une ligne de haut). */
    const select = <T extends string | number>(options: [T, string][], get: () => T, set: (v: T) => void) => {
      const el = document.createElement('select');
      for (const [v, label] of options) {
        const o = document.createElement('option');
        o.value = String(v);
        o.textContent = label;
        el.append(o);
      }
      el.value = String(get());
      el.addEventListener('change', () => { set((typeof get() === 'number' ? Number(el.value) : el.value) as T); });
      return el;
    };
    // Micro (jeux à voix haute) : la voix reste sur l'appareil.
    const mic = document.createElement('input');
    mic.type = 'checkbox';
    mic.checked = !!value.voice;
    mic.addEventListener('change', () => { value.voice = mic.checked; });
    const micLabel = document.createElement('label');
    micLabel.className = 'check';
    const micText = document.createElement('span');
    micText.innerHTML = T('micHtml', '<b>Autoriser le micro</b> (jeux à voix haute)<br><small>Tout reste sur cet appareil : la voix n\'est ni enregistrée, ni envoyée.</small>');
    micLabel.append(mic, micText);
    // Missions : l'enfant peut choisir ses jeux ; décoché, il ne joue qu'aux séries au hasard (bouton « Jouer »).
    const missions = document.createElement('input');
    missions.type = 'checkbox';
    missions.checked = value.chooseGames !== false;
    missions.addEventListener('change', () => { value.chooseGames = missions.checked; });
    const missionsLabel = document.createElement('label');
    missionsLabel.className = 'check';
    const missionsText = document.createElement('span');
    missionsText.innerHTML = T('missionsHtml', '<b>Choix des missions</b><br><small>L\'enfant peut choisir ses jeux (bouton « Missions »). Décoché : seulement des séries au hasard avec « Jouer ».</small>');
    missionsLabel.append(missions, missionsText);
    const error = document.createElement('div');
    error.className = 'error';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const ok = button(T('ok', 'Valider'), 'primary');
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
        error.textContent = T('nameMissing', 'Écrivez le prénom de l\'enfant.');
        name.focus();
        return;
      }
      root.remove();
      resolve(value);
    });
    const cell = (cls: string, label: string, control: HTMLElement) => {
      const l = field(label);
      l.className = `field ${cls}`;
      l.append(control);
      return l;
    };
    const grid = document.createElement('div');
    grid.className = 'grid';
    const checks = document.createElement('div');
    checks.className = 's3 checks';
    checks.append(missionsLabel, micLabel);
    grid.append(
      cell('s4 name', T('firstName', 'Prénom'), name),
      cell('s2 age', T('age', 'Âge'), select([3, 4, 5, 6, 7].map((a): [number, string] => [a, T('years', '{n} ans', { n: a })]), () => value.age, (v) => { value.age = v; })),
      cell('s3', T('country', 'Pays (jeu « Mon pays », dès 5 ans)'), select(countryChoices(), () => value.country, (v) => { value.country = v; })),
      cell('s3', T('night', 'Heure du coucher (mode nuit)'), select(NIGHT_CHOICES.map((n): [string, string] => [n, n ? n.replace(':', ' h ') : T('none', 'Aucune')]), () => value.nightTime, (v) => { value.nightTime = v; })),
      cell('s3', T('daily', 'Temps de jeu par jour'), timeStepper(() => value.dailyMinutes, (v) => { value.dailyMinutes = v; })),
      checks);
    form.append(h, p, grid, error, actions);
    card.append(form);
    if (!initial?.name) setTimeout(() => name.focus(), 50);
  });
}

/** Ce que l'enfant a dit au dino pendant la présentation (le parent peut le corriger). */
export interface ChildIntro {
  name?: string;
  age?: number;
  /** Le micro a fonctionné pendant la présentation. */
  voice?: boolean;
}

/**
 * Premier lancement, une fois l'œuf éclos et le dino présenté : le parent
 * vérifie la fiche de l'enfant (prénom et âge déjà remplis s'il les a dits au
 * dino), puis crée son code.
 */
export async function firstLaunchSetup(intro: ChildIntro = {}) {
  if (app.profiles.count === 0) {
    const child = await childForm(T('welcome', 'Bienvenue, parent !'), intro.name || intro.age
      ? T('welcomeHeard', 'Voici ce que votre enfant a dit au dino : corrigez si besoin. Vous pourrez ajouter d\'autres enfants et tout modifier dans l\'espace parents (cadenas de l\'accueil).')
      : T('welcomeHelp', 'Le prénom de votre enfant, son âge et ses réglages. Vous pourrez ajouter d\'autres enfants et tout modifier dans l\'espace parents (cadenas de l\'accueil).'),
    { name: intro.name ?? '', age: intro.age ?? 4, voice: intro.voice ?? true });
    switchChild(app.profiles.add(child!));
  }
  if (!app.profiles.pin) {
    await createParentCode(
      T('yourCode', 'Votre code parent'),
      T('yourCodeHelp', 'Choisissez un code à 4 chiffres. Il ouvre l\'espace parents (cadenas de l\'accueil) et débloque le jeu quand le temps du jour est fini. Ne le donnez pas à l\'enfant !'),
    );
  }
}

/** Mode nuit : un parent peut laisser jouer encore ce soir avec son code. */
export async function unlockNight(): Promise<boolean> {
  if (!await askParentCode(T('asleep', 'Le dino dort'), T('asleepHelp', 'C\'est l\'heure du coucher. Tapez le code parent pour jouer encore ce soir.'))) {
    return false;
  }
  app.progress.unlockNight();
  return true;
}

/** Le temps est fini : un parent peut ajouter du temps avec son code. Vrai si débloqué. */
export async function unlockPlayTime(): Promise<boolean> {
  if (!await askParentCode(T('timeUp', 'Temps de jeu terminé'), T('timeUpHelp', 'Tapez le code parent pour ajouter du temps de jeu aujourd\'hui.'))) {
    return false;
  }
  const options = [15, 30, -1];
  const index = await choose(T('addTime', 'Ajouter du temps'), T('todayOnly', 'Pour aujourd\'hui seulement.'),
    [T('plus15', '15 minutes de plus'), T('plus30', '30 minutes de plus'), T('unlimited', 'Illimité aujourd\'hui')], T('cancel', 'Annuler'));
  if (index === null) return false;
  app.progress.unlockToday(options[index]);
  return true;
}
