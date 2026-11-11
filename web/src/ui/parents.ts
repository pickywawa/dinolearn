import { GAMES, GameDef } from '../content/games';
import { app, applyChildSettings, switchChild } from '../core/app';
import { DINO_COLORS } from '../dino/parts';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { baseLevel } from '../domain/difficulty';
import { mulberry32 } from '../domain/models';
import { NIGHT_CHOICES, childForm, countryChoices, createParentCode } from './pin';
import { VOICE_PACKS, askMicPermission, ears, voiceSupported } from '../core/ears';
import { printKind } from '../print/catalog';
import { openPrintView, thumbnail } from './printView';
import { timeStepper } from './timeStepper';
import { packsPanel } from './packsPanel';
import { TITLES } from '../content/gameTitles';
import { dinoPortrait } from '../dino3d/portrait';
import { inLanguage } from '../content/games';
import { isFr, lang, second, t } from '../i18n';
import { langInfo } from '../domain/langs';

/** Texte de l'espace parents (clé « p.<nom> » des catalogues ; le français d'origine en français). */
const T = (key: string, fr: string, params?: Record<string, string | number>) => t(`p.${key}`, params, fr);
/** Dates dans la langue de l'application. */
const dateLocale = () => langInfo(lang()).locale;

/**
 * Espace parents : une page HTML posée sur le jeu, ouverte avec le code parent.
 * En haut : les enfants (un toucher pour passer de l'un à l'autre, « + » pour en
 * ajouter) et quatre onglets :
 * - Profil : la fiche de l'enfant, modifiable sur place (prénom, âge, pays, temps de
 *   jeu, coucher, missions) et le niveau du dino (boutons − et +, pas de curseur :
 *   un glissement involontaire ne change plus rien) ;
 * - Progrès : chiffres clés, temps de jeu de la semaine, questions à retravailler,
 *   fiches à imprimer ;
 * - Jeux : chaque jeu sur une ligne (suivi, niveau, activé ou non) ;
 * - Réglages : son, micro, langue et téléchargements, code parent, données.
 * Pensée pour un téléphone en paysage : compacte, une colonne de cartes qui s'élargit
 * en deux sur les grands écrans.
 */

export const gameTitle = (g: GameDef) => TITLES[g.id] ?? g.id;


const CSS = `
.parents { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; color: #1f2937;
  background: linear-gradient(#eef6ff, #f7f3ea); font: 15px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.parents * { box-sizing: border-box; }
.parents h1, .parents h2, .parents nav button { font-family: 'Baloo 2', system-ui, sans-serif; }
.parents header { flex: none; display: flex; align-items: center; gap: 10px; background: #2d3354; color: #fff;
  padding: max(8px, var(--safe-top, 0px)) max(14px, var(--safe-right, 0px)) 8px max(14px, var(--safe-left, 0px));
  box-shadow: 0 3px 10px rgba(30,40,80,.25); }
.parents header h1 { margin: 0; font-size: 20px; white-space: nowrap; }
.parents .kids { flex: 1; min-width: 0; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.parents .kids button { flex: none; display: flex; align-items: center; gap: 6px; padding: 3px 12px 3px 3px; border-radius: 999px;
  background: rgba(255,255,255,.14); color: #fff; font-weight: 700; min-height: 40px; }
.parents .kids button img { width: 34px; height: 34px; border-radius: 50%; background: #fff; }
.parents .kids button.on { background: #fff; color: #2d3354; }
.parents .kids button.add { padding: 3px 14px; background: transparent; border: 2px dashed rgba(255,255,255,.55); }
.parents header .back { flex: none; border-radius: 999px; padding: 8px 18px; font-weight: 800; color: #fff;
  background: linear-gradient(#5fd34a, #34a52a); box-shadow: 0 3px 0 #237a1a; }
.parents nav { flex: none; display: flex; gap: 2px; overflow-x: auto; background: #fff; border-bottom: 1px solid #e3e7ef;
  padding: 0 max(10px, var(--safe-right, 0px)) 0 max(10px, var(--safe-left, 0px)); }
.parents nav button { background: none; border-radius: 0; padding: 8px 16px 6px; min-height: 42px; font-size: 16px; font-weight: 800;
  color: #6b7280; border-bottom: 3px solid transparent; }
.parents nav button.on { background: none; color: #2d3354; border-bottom-color: #43b649; }
.parents main { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 12px max(12px, var(--safe-right, 0px)) 28px max(12px, var(--safe-left, 0px)); }
.parents .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; max-width: 1100px;
  margin: 0 auto; align-items: start; }
.parents section { background: #fff; border-radius: 14px; padding: 12px 14px; box-shadow: 0 1px 6px rgba(30,40,80,.08); }
.parents section.wide { grid-column: 1 / -1; }
.parents h2 { margin: 0 0 4px; font-size: 18px; }
.parents .help { margin: 0 0 8px; color: #6b7280; font-size: 13px; }
.parents button { font: inherit; border: 0; border-radius: 10px; padding: 8px 12px; cursor: pointer; background: #eef0f5;
  color: #1f2937; min-height: 40px; }
.parents button.danger { background: #fee2e2; color: #b91c1c; }
.parents button.on { background: #2d3354; color: #fff; }
.parents .row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
/* Une ligne de réglage : l'intitulé à gauche, le contrôle à droite. */
.parents .field { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 0;
  border-top: 1px solid #f0f2f6; min-height: 48px; }
.parents .field:first-of-type { border-top: 0; }
.parents .field > span { font-weight: 600; }
.parents .field small { display: block; font-weight: 400; color: #6b7280; font-size: 12px; }
.parents input[type=text], .parents select { font: inherit; color: #1f2937; padding: 6px 10px; min-height: 40px; border-radius: 10px;
  border: 1.5px solid #d1d5db; background: #fff; width: 210px; max-width: 55vw; }
.parents .stepper { display: flex; align-items: center; gap: 6px; }
.parents .stepper button { min-width: 42px; padding: 0; font-size: 22px; font-weight: 800; }
.parents .stepper output { min-width: 46px; text-align: center; font-size: 22px; font-weight: 800; }
.parents .time-stepper { gap: 6px; flex-wrap: nowrap; }
.parents .time-stepper button { min-height: 40px; min-width: 42px; font-size: 20px; padding: 0 8px; }
.parents .time-stepper button.unlimited { font-size: 13px; }
.parents .time-stepper output { min-width: 62px; font-size: 17px; }
.parents .kid { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.parents .kid img { width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(#fff, #ffe3f0); }
.parents .kid b { font-family: 'Baloo 2', sans-serif; font-size: 20px; display: block; line-height: 1.1; }
.parents .kid small { color: #6b7280; }
.parents .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 8px; }
.parents .tiles div { background: #f6f8fc; border: 1px solid #e3e9f2; border-radius: 12px; padding: 8px; text-align: center;
  color: #4b5563; font-size: 13px; }
.parents .tiles b { display: block; font-family: 'Baloo 2', sans-serif; font-size: 24px; color: #2d3354; line-height: 1.1; }
.parents .game { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 10px; padding: 8px 0;
  border-top: 1px solid #f0f2f6; }
.parents .game:first-of-type { border-top: 0; }
.parents .game.off .info { opacity: .55; }
.parents .game .name { font-weight: 700; }
.parents .game .meta { color: #6b7280; font-size: 12px; }
.parents .game select { width: auto; min-height: 36px; padding: 4px 6px; }
.parents .bar { height: 5px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: 4px; max-width: 320px; }
.parents .bar span { display: block; height: 100%; background: #43b649; }
.parents .switch { position: relative; width: 50px; height: 30px; flex: none; }
.parents .switch input { opacity: 0; width: 0; height: 0; }
.parents .switch span { position: absolute; inset: 0; background: #d1d5db; border-radius: 15px; transition: .2s; }
.parents .switch span::after { content: ''; position: absolute; left: 3px; top: 3px; width: 24px; height: 24px;
  background: #fff; border-radius: 50%; transition: .2s; }
.parents .switch input:checked + span { background: #43b649; }
.parents .switch input:checked + span::after { transform: translateX(20px); }
.parents .week { display: flex; align-items: flex-end; gap: 6px; height: 96px; margin-top: 6px; }
.parents .week div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  height: 100%; font-size: 12px; color: #6b7280; }
.parents .week i { display: block; width: 100%; background: #8e4ec6; border-radius: 6px 6px 0 0; min-height: 2px; }
.parents ul.fails { margin: 0; padding-left: 18px; }
.parents ul.fails li { margin: 6px 0; }
.parents ul.fails small { color: #6b7280; }
.parents .prints { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
.parents .print { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 12px;
  background: #f4f6fb; border: 0; text-align: left; cursor: pointer; min-height: 0; }
.parents .print .thumb { background: #fff; aspect-ratio: 210 / 297; border-radius: 6px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.parents .print .thumb svg { display: block; width: 100%; height: 100%; }
.parents .print b { font-size: 14px; line-height: 1.25; }
.parents .print small { color: #6b7280; font-size: 12px; }
.parents .print .new { position: absolute; top: 4px; right: 4px; background: #e5484d; color: #fff; font-size: 12px;
  font-weight: 700; border-radius: 10px; padding: 2px 8px; }
@media (max-width: 560px) { .parents header h1 { display: none; } }
`;

const minutes = (ms: number) => Math.round(ms / 60_000);
const percent = (x: number) => `${Math.round(x * 100)} %`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

/** Interrupteur (case à cocher habillée). */
function switchBox(checked: boolean, label: string, onChange: (on: boolean) => void) {
  const input = el('input', { type: 'checkbox', 'aria-label': label }) as HTMLInputElement;
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return el('label', { class: 'switch' }, input, el('span'));
}

/** Une ligne de réglage : intitulé (et précision en petit) à gauche, contrôle à droite. */
function field(label: string, control: Node, hint?: string) {
  return el('div', { class: 'field' }, el('span', {}, label, hint ? el('small', {}, hint) : ''), control);
}

/** Liste déroulante. */
function selectBox<V extends string | number>(options: [V, string][], value: V, label: string, onChange: (v: V) => void) {
  const s = el('select', { 'aria-label': label }) as HTMLSelectElement;
  for (const [v, text] of options) s.append(el('option', { value: String(v) }, text));
  s.value = String(value);
  s.addEventListener('change', () => onChange((typeof value === 'number' ? Number(s.value) : s.value) as V));
  return s;
}

type Tab = 'profile' | 'progress' | 'games' | 'settings';
/** Onglet ouvert la dernière fois (gardé pendant la partie). */
let lastTab: Tab = 'profile';

/** Ouvre l'espace parents ; `onClose` relance l'accueil pour appliquer les réglages. */
export function openParents(onClose: () => void) {
  // Enfant affiché ; un enfant ajouté devra ouvrir son œuf en sortant.
  let selected = app.profiles.activeId;
  let p = app.profiles.progressOf(selected);
  let added: string | undefined;
  let tab: Tab = lastTab;
  document.getElementById('parents-css')?.remove();
  document.head.append(el('style', { id: 'parents-css' }, CSS));
  const root = el('div', { class: 'parents', role: 'dialog', 'aria-label': T('title', 'Espace parents') });
  const close = el('button', { class: 'back' }, T('back', 'Retour au jeu'));
  close.addEventListener('click', () => {
    root.remove();
    if (added) switchChild(added);
    else applyChildSettings();
    onClose();
  });
  const kids = el('div', { class: 'kids' });
  const nav = el('nav', { role: 'tablist' });
  const main = el('main');
  root.append(el('header', {}, el('h1', {}, T('title', 'Espace parents')), kids, close), nav, main);
  document.body.append(root);

  const TABS: [Tab, string, string][] = [
    ['profile', 'tab.profile', 'Profil'], ['progress', 'tab.progress', 'Progrès'], ['games', 'tab.games', 'Jeux'],
    ['settings', 'tab.settings', 'Réglages'],
  ];

  const render = () => {
    kids.replaceChildren(...childChips());
    nav.replaceChildren(...TABS.map(([id, key, fr]) => {
      const b = el('button', { class: id === tab ? 'on' : '', role: 'tab', 'aria-selected': String(id === tab) }, T(key, fr));
      b.addEventListener('click', () => {
        tab = lastTab = id;
        render();
        main.scrollTop = 0;
      });
      return b;
    }));
    const cards = tab === 'profile' ? [profileSection(), levelSection()]
      : tab === 'progress' ? [summarySection(), weekSection(), failuresSection(), isFr() ? printSection() : '']
        : tab === 'games' ? [missionsSection(), gamesSection()]
          : [soundSection(), voiceSection(), packsSection(), codeSection(), dataSection()];
    main.replaceChildren(el('div', { class: 'cards' }, ...cards));
  };

  const select = (id: string) => {
    selected = id;
    p = app.profiles.progressOf(id);
    render();
  };

  /** Les enfants, en haut (portrait de leur dino), et le bouton d'ajout. */
  function childChips(): Node[] {
    const out: Node[] = [];
    for (const id of app.profiles.ids) {
      const child = app.profiles.progressOf(id);
      const face = child.hatched ? dinoPortrait(child.color, 96) : undefined;
      const b = el('button', { class: id === selected ? 'on' : '' });
      if (face) b.append(el('img', { src: face, alt: '' }));
      b.append(child.name || T('noName', 'Sans prénom'));
      b.addEventListener('click', () => select(id));
      out.push(b);
    }
    const add = el('button', { class: 'add', 'aria-label': T('addChild', '+ Ajouter un enfant') }, '+');
    add.addEventListener('click', async () => {
      const child = await childForm(T('newChild', 'Nouvel enfant'), T('newChildHelp', 'En quittant l\'espace parents, le nouvel enfant touchera son œuf pour faire éclore son propre dino.'), undefined, T('cancel', 'Annuler'));
      if (!child) return;
      added = app.profiles.add(child);
      tab = 'profile';
      select(added);
    });
    out.push(add);
    return out;
  }

  // ---- Profil : la fiche de l'enfant, modifiable sur place ----
  function profileSection() {
    const s = p.settings;
    const name = el('input', { type: 'text', maxlength: '20', autocomplete: 'off', 'aria-label': t('pin.firstName', {}, 'Prénom') }) as HTMLInputElement;
    name.value = p.name;
    name.addEventListener('change', () => {
      const v = name.value.trim();
      if (!v) {
        name.value = p.name;
        return;
      }
      p.name = v;
      kids.replaceChildren(...childChips());
    });
    const age = selectBox([3, 4, 5, 6, 7].map((a): [number, string] => [a, t('pin.years', { n: a }, '{n} ans')]), p.age,
      t('pin.age', {}, 'Âge'), (v) => {
        if (v === p.age) return;
        p.age = v;
        // Âge changé : les niveaux des jeux repartent de l'âge.
        p.clearGameLevels();
      });
    const country = selectBox(countryChoices(), s.country, t('pin.country', {}, 'Pays'), (v) => p.updateSettings({ country: v }));
    const night = selectBox(NIGHT_CHOICES.map((n): [string, string] => [n, n ? n.replace(':', ' h ') : T('noNight', 'Pas de mode nuit')]),
      s.nightTime, T('night', 'Heure du coucher (mode nuit)'), (v) => p.updateSettings({ nightTime: v }));
    const daily = timeStepper(() => p.settings.dailyMinutes, (m) => p.updateSettings({ dailyMinutes: m }));
    const face = p.hatched ? dinoPortrait(p.color, 160, 'happy') : undefined;
    const dino = p.hatched ? (isFr() ? `dino ${DINO_COLORS[p.color].name}` : T('dino', 'dino')) : T('egg', 'œuf pas encore éclos');
    const section = el('section', {},
      el('div', { class: 'kid' }, face ? el('img', { src: face, alt: dino }) : '',
        el('div', {}, el('b', {}, p.name || T('noName', 'Sans prénom')), el('small', {}, dino))),
      field(t('pin.firstName', {}, 'Prénom'), name),
      field(t('pin.age', {}, 'Âge'), age),
      field(t('pin.country', {}, 'Pays'), country),
      field(T('daily', 'Temps de jeu par jour'), daily, T('dailyShort', 'Ensuite, le dino va se coucher.')),
      field(T('night', 'Heure du coucher (mode nuit)'), night),
    );
    if (app.profiles.count > 1) {
      section.append(field(T('alternate', 'Alterner les séries entre les enfants'),
        switchBox(app.profiles.alternate, T('alternateAria', 'Alterner les séries entre les enfants'), (on) => app.profiles.setAlternate(on))));
      const remove = el('button', { class: 'danger', style: 'margin-top:8px' }, T('removeChild', 'Supprimer {name}', { name: p.name || T('thisChild', 'cet enfant') }));
      remove.addEventListener('click', () => {
        if (!confirm(T('removeConfirm', 'Supprimer {name}, son dino et toute sa progression ? C\'est définitif.', { name: p.name || T('thisChild', 'cet enfant') }))) return;
        app.profiles.remove(selected);
        if (added === selected) added = undefined;
        select(app.profiles.activeId);
      });
      section.append(remove);
    }
    return section;
  }

  // ---- Niveau du dino : boutons − et + (un glissement involontaire ne le change pas) ----
  function levelSection() {
    const out = el('output', {}, String(p.dino.level));
    const diff = el('p', { class: 'help', style: 'margin:8px 0 0' });
    const describe = () => {
      const base = baseLevel(p.dino.level, p.age);
      diff.textContent = T('difficulty', 'Difficulté de départ des jeux : {n} sur 20 ({stage}). Elle s\'ajuste ensuite toute seule selon les réussites.', { n: base, stage: base > 10 ? T('stageCP', 'niveau CP') : T('stageK', 'maternelle') });
    };
    const change = (delta: number) => {
      const next = Math.max(1, Math.min(BALANCE.dinoMaxLevel, p.dino.level + delta));
      if (next === p.dino.level) return;
      p.setDinoLevel(next);
      p.clearGameLevels();
      out.textContent = String(next);
      describe();
    };
    const lower = el('button', { 'aria-label': T('lower', 'Moins') }, '−');
    lower.addEventListener('click', () => change(-1));
    const higher = el('button', { 'aria-label': T('higher', 'Plus') }, '+');
    higher.addEventListener('click', () => change(1));
    describe();
    return el('section', {},
      el('h2', {}, T('dinoLevel', 'Niveau du dino')),
      el('p', { class: 'help' }, T('dinoLevelHelp', 'Il monte quand l\'enfant nourrit son dino (1 à {max}). Réglez-le pour adapter la difficulté : 21 à 40 correspond au CP.', { max: BALANCE.dinoMaxLevel })),
      el('div', { class: 'stepper' }, lower, out, higher),
      diff,
    );
  }

  // ---- Progrès : chiffres clés ----
  function summarySection() {
    const answers = p.answers();
    const last100 = answers.slice(0, 100);
    const rate = last100.length ? last100.filter((a) => a.firstTrySuccess).length / last100.length : 0;
    return el('section', {},
      el('h2', {}, T('summary', 'En bref')),
      el('div', { class: 'tiles' },
        el('div', {}, el('b', {}, String(p.seriesPlayed)), T('series', 'séries jouées')),
        el('div', {}, el('b', {}, String(answers.length)), T('answers', 'réponses')),
        el('div', {}, el('b', {}, last100.length ? percent(rate) : '—'), T('firstTry', 'de réussite du 1er coup')),
        el('div', {}, el('b', {}, `${minutes(p.playMsToday())} min`), T('today', 'de jeu aujourd\'hui')),
      ),
    );
  }

  // ---- Progrès : temps de jeu de la semaine ----
  function weekSection() {
    const week = p.playWeek();
    const max = Math.max(...week.map((d) => d.ms), 60_000);
    const dayName = (d: Date) => d.toLocaleDateString(dateLocale(), { weekday: 'short' });
    return el('section', {},
      el('h2', {}, T('week', 'Temps de jeu des 7 derniers jours')),
      el('div', { class: 'week' },
        ...week.map(({ day, ms }) => el('div', { title: `${minutes(ms)} min` },
          `${minutes(ms)}′`,
          el('i', { style: `height:${Math.round((ms / max) * 80)}%` }),
          dayName(new Date(`${day}T12:00:00`))))),
    );
  }

  // ---- Jeux : le bouton « Missions » ----
  function missionsSection() {
    return el('section', { class: 'wide' },
      field(T('choose', 'Bouton « Missions » sur l\'accueil'),
        switchBox(p.settings.chooseGames, T('chooseAria', 'Bouton pour choisir son jeu'), (on) => p.updateSettings({ chooseGames: on })),
        T('chooseHelp', 'Activé, l\'enfant peut choisir un jeu précis. Sinon, « Jouer » mélange tous les jeux de son âge.')),
    );
  }

  // ---- Fiches à imprimer ----
  let showAllPrints = false;
  function printSection() {
    const records = p.printables;
    const shown = showAllPrints ? records : records.slice(0, 8);
    const grid = el('div', { class: 'prints' });
    for (const record of shown) {
      const kind = printKind(record.kind);
      if (!kind) continue;
      const card = el('button', { class: 'print', type: 'button', 'aria-label': `Voir ${kind.title}` });
      const thumb = el('div', { class: 'thumb' });
      const svg = thumbnail(p, record);
      if (svg) thumb.append(svg);
      const label = record.kind === 'diploma' ? `Diplôme du niveau ${record.param ?? ''}` : kind.title;
      card.append(thumb, el('b', {}, label), el('small', {}, new Date(record.at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })));
      if (!record.printed) card.append(el('span', { class: 'new' }, 'Nouveau'));
      card.addEventListener('click', () => openPrintView(p, record, render));
      grid.append(card);
    }
    const more = el('button', {}, `Voir les ${records.length} fiches`);
    more.addEventListener('click', () => {
      showAllPrints = true;
      render();
    });
    return el('section', { class: 'wide' },
      el('h2', {}, `À imprimer${p.newPrintables ? ` (${p.newPrintables} nouvelle${p.newPrintables > 1 ? 's' : ''})` : ''}`),
      el('p', { class: 'help' }, 'À la fin du temps de jeu (ou à l\'heure du coucher), le dino offre trois enveloppes '
        + 'surprises ; l\'enfant en choisit une, une fois par jour. La fiche arrive ici, avec son dino, adaptée à son âge '
        + 'et à ses progrès, et des conseils pour vous. Sans limite de temps ni heure du coucher : après 4 séries. '
        + 'Un diplôme tous les 5 niveaux du dino.'),
      records.length ? grid : el('p', {}, 'Pas encore de fiche : la première enveloppe arrivera à la fin du temps de jeu.'),
      records.length > shown.length ? el('div', { class: 'row', style: 'margin-top:12px' }, more) : '',
    );
  }

  // ---- Jeux : activés, niveau, suivi ----
  function gamesSection() {
    const list = el('div');
    for (const game of GAMES.filter((g) => inLanguage(g))) {
      const tooYoung = p.age < (game.minAge ?? 3);
      const enabled = !p.settings.disabledGames.includes(game.id);
      const answers = p.answers({ gameId: game.id });
      const last = answers.slice(0, 100);
      const rate = last.length ? last.filter((a) => a.firstTrySuccess).length / last.length : undefined;
      const mastered = p.mastered(game.id).size;
      const lastAt = p.lastPlayed(game.id);

      const toggle = el('input', { type: 'checkbox', 'aria-label': T('enable', 'Activer {game}', { game: gameTitle(game) }) });
      (toggle as HTMLInputElement).checked = enabled;
      toggle.addEventListener('change', () => {
        const others = p.settings.disabledGames.filter((id) => id !== game.id);
        p.updateSettings({ disabledGames: (toggle as HTMLInputElement).checked ? others : [...others, game.id] });
        render();
      });

      const level = el('select', { 'aria-label': T('levelOf', 'Niveau de {game}', { game: gameTitle(game) }) });
      level.append(el('option', { value: '' }, T('levelAuto', 'Niveau auto')));
      for (let l = 1; l <= BALANCE.maxLevel; l++) level.append(el('option', { value: String(l) }, T('level', 'Niveau {n}', { n: l })));
      (level as HTMLSelectElement).value = String(p.gameLevel(game.id) ?? '');
      level.addEventListener('change', () => {
        const v = (level as HTMLSelectElement).value;
        p.setGameLevel(game.id, v ? Number(v) : null);
      });

      const needsVoice = game.voice && !(p.settings.voice && p.settings.voicePacks.includes(game.voice));
      const meta = tooYoung
        ? T('fromAge', 'À partir de {n} ans', { n: game.minAge ?? 3 })
        : needsVoice
          ? T('needsVoice', 'Jeu à voix haute : autorisez le micro et téléchargez la reconnaissance vocale {language} (section « Voix et téléchargements »).', { language: isFr() ? VOICE_PACKS[game.voice!]?.name.toLowerCase() ?? '' : t(`lang.${game.voice}`) })
          : [
          answers.length ? T('nAnswers', '{n} réponses', { n: answers.length }) : T('notPlayed', 'Pas encore joué'),
          rate !== undefined ? T('rate', '{rate} du 1er coup', { rate: percent(rate) }) : '',
          T('mastered', '{n} / {total} questions réussies', { n: mastered, total: game.questions.length }),
          lastAt ? T('lastPlayed', 'dernière partie le {date}', { date: new Date(lastAt).toLocaleDateString(dateLocale()) }) : '',
        ].filter(Boolean).join(' · ');
      // Une ligne par jeu : nom, suivi en petit (et sa barre), niveau, interrupteur.
      list.append(el('div', { class: `game${tooYoung || !enabled || needsVoice ? ' off' : ''}` },
        el('div', { class: 'info' },
          el('span', { class: 'name' }, gameTitle(game)),
          el('div', { class: 'meta' }, meta),
          el('div', { class: 'bar' }, el('span', { style: `width:${(mastered / game.questions.length) * 100}%` }))),
        tooYoung ? el('span') : level,
        el('label', { class: 'switch' }, toggle, el('span')),
      ));
    }
    return el('section', { class: 'wide' },
      el('h2', {}, T('games', 'Jeux')),
      el('p', { class: 'help' }, T('gamesHelp', 'Désactivez un jeu pour qu\'il ne soit plus proposé. Le niveau (1 à 20 ; 11 à 20 = CP) est le point de départ de la prochaine série ; « auto » le calcule d\'après l\'âge, le dino et les réussites.')),
      list,
    );
  }

  // ---- À retravailler (révision espacée) ----
  function failuresSection() {
    const reviews = p.reviewList(15);
    const rng = mulberry32(1);
    const when = (due: number) => {
      const days = Math.round((due - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
      return days <= 0 ? T('reviewToday', 'à réviser aujourd\'hui') : days === 1 ? T('reviewTomorrow', 'revient demain')
        : T('reviewOn', 'revient le {date}', { date: new Date(due).toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' }) });
    };
    const items = reviews.map(({ gameId, questionId, stage, due }) => {
      const game = GAMES.find((g) => g.id === gameId);
      const ref = game?.questions.find((q) => q.id === questionId);
      if (!game || !ref) return undefined;
      const q = game.build(ref, ref.level, rng);
      const text = q.prompt.map((s) => s.text).join(' ');
      return el('li', {}, text, ' ',
        el('small', {}, `— ${gameTitle(game)} · ${T('reviewN', 'révision {n} sur {total}', { n: stage + 1, total: BALANCE.reviewDays.length })} · ${when(due)}`));
    }).filter((x): x is HTMLLIElement => x !== undefined);
    return el('section', { class: 'wide' },
      el('h2', {}, T('review', 'À retravailler')),
      el('p', { class: 'help' }, T('reviewHelp', 'Une question ratée revient le lendemain, puis 3 jours et 7 jours plus tard. Réussie les trois fois, elle est acquise.')),
      items.length ? el('ul', { class: 'fails' }, ...items) : el('p', {}, T('reviewNone', 'Rien à réviser pour l\'instant. Bravo !')),
    );
  }

  // ---- Son et voix ----
  function soundSection() {
    const sfx = el('input', { type: 'checkbox', 'aria-label': T('sfxAria', 'Bruitages') });
    (sfx as HTMLInputElement).checked = p.settings.sfx;
    sfx.addEventListener('change', () => {
      const on = (sfx as HTMLInputElement).checked;
      p.updateSettings({ sfx: on });
      Sfx.enabled = on;
    });
    const music = el('input', { type: 'checkbox', 'aria-label': T('musicAria', 'Musique de fond') });
    (music as HTMLInputElement).checked = p.settings.music;
    music.addEventListener('change', () => {
      const on = (music as HTMLInputElement).checked;
      p.updateSettings({ music: on });
      Music.setEnabled(on);
    });
    const test = el('button', {}, T('testVoice', 'Tester la voix'));
    test.addEventListener('click', () => {
      void app.voice.say([{ text: T('testHello', 'Bonjour ! Je suis Dino.'), lang: lang() }, { text: second() === 'es' ? '¡Hola!' : 'Hello!', lang: second(), slow: true }]);
    });
    return el('section', {},
      el('h2', {}, T('sound', 'Son et voix')),
      el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', {}, T('sfx', 'Bruitages')),
        el('label', { class: 'switch' }, sfx, el('span')),
      ),
      el('div', { class: 'row', style: 'justify-content:space-between;margin-top:12px' },
        el('span', {}, T('music', 'Musique de fond')),
        el('label', { class: 'switch' }, music, el('span')),
      ),
      el('div', { style: 'margin-top:10px' }, test),
    );
  }

  // ---- Micro : jeux à voix haute ----
  function voiceSection() {
    const section = el('section', {},
      el('h2', {}, T('mic', 'Micro (jeux à voix haute)')),
      el('p', { class: 'help' }, T('micHelp', 'L\'enfant répond en parlant (nommer une image, dire un mot, lire). Tout reste sur l\'appareil : rien n\'est enregistré ni envoyé, et le micro ne s\'allume que quand il touche le bouton micro.')),
    );
    if (!voiceSupported()) {
      section.append(el('p', {}, T('noMic', 'Ce navigateur ne permet pas d\'utiliser le micro dans le jeu.')));
      return section;
    }
    const toggle = el('input', { type: 'checkbox', 'aria-label': T('allowMic', 'Autoriser le micro') }) as HTMLInputElement;
    toggle.checked = p.settings.voice;
    const status = el('p', { class: 'help', style: 'margin-top:8px' });
    toggle.addEventListener('change', async () => {
      if (!toggle.checked) {
        p.updateSettings({ voice: false });
        render();
        return;
      }
      // La question du navigateur s'affiche maintenant, pendant que le parent est là.
      status.textContent = T('allowMicNow', 'Autorisez le micro dans la fenêtre du navigateur…');
      if (await askMicPermission()) {
        p.updateSettings({ voice: true });
      } else {
        alert(T('micBlocked', 'Le micro est bloqué. Autorisez-le dans les réglages du navigateur (cadenas à côté de l\'adresse), puis réessayez.'));
      }
      render();
    });
    section.append(el('div', { class: 'row', style: 'justify-content:space-between' },
      el('span', {}, T('allowMic', 'Autoriser le micro')),
      el('label', { class: 'switch' }, toggle, el('span')),
    ), status);
    if (!p.settings.voice) return section;

    section.append(el('p', { class: 'help', style: 'margin-top:12px' }, T('packsWhere', 'Les packs de reconnaissance vocale se téléchargent dans la section « Voix et téléchargements ».')));
    if (p.settings.voicePacks.length) {
      const remove = el('button', { class: 'danger', style: 'margin-top:12px' }, T('removePacks', 'Supprimer les packs'));
      remove.addEventListener('click', async () => {
        if (!confirm(T('removePacksConfirm', 'Supprimer les packs de reconnaissance vocale de cet appareil ? Les jeux à voix haute ne seront plus proposés.'))) return;
        await ears.removeAll();
        for (const id of app.profiles.ids) app.profiles.progressOf(id).updateSettings({ voicePacks: [] });
        render();
      });
      section.append(remove);
    }
    return section;
  }

  // ---- Voix et téléchargements ----
  function packsSection() {
    return el('section', {},
      el('h2', {}, T('packs', 'Voix et téléchargements')),
      el('p', { class: 'help' }, T('packsHelp', 'Langue du jeu, voix du dino, voix de la langue apprise en plus et reconnaissance vocale. Une fois téléchargé, tout marche sans Internet.')),
      packsPanel(),
    );
  }

  // ---- Code parent ----
  function codeSection() {
    const change = el('button', {}, T('changeCode', 'Changer le code'));
    change.addEventListener('click', async () => {
      if (await createParentCode(T('newCode', 'Nouveau code parent'), T('newCodeHelp', 'Choisissez un nouveau code à 4 chiffres.'), T('cancel', 'Annuler'))) {
        alert(T('codeChanged', 'Le code parent a été changé.'));
      }
    });
    return el('section', {},
      el('h2', {}, T('code', 'Code parent')),
      el('p', { class: 'help' }, T('codeHelp', 'Il ouvre cet espace et débloque le jeu après le temps du jour. Oublié ? « Code oublié ? » en crée un nouveau après une question pour adulte.')),
      change,
    );
  }

  // ---- Données ----
  function dataSection() {
    const reset = el('button', { class: 'danger' }, T('reset', 'Tout recommencer'));
    reset.addEventListener('click', () => {
      if (!confirm(T('resetConfirm', 'Effacer toute la progression (niveau du dino, réponses, fruits) ? Les réglages sont conservés.'))) return;
      p.reset();
      render();
    });
    // Politique de confidentialité : page embarquée, ouverte par-dessus (on ne quitte pas le jeu).
    const privacy = el('button', { type: 'button' }, T('privacy', 'Politique de confidentialité'));
    privacy.addEventListener('click', () => {
      const frame = el('iframe', { src: 'confidentialite.html', title: T('privacy', 'Politique de confidentialité'),
        style: 'width:100%;height:100%;border:0;background:#fff' });
      const shut = el('button', { type: 'button', style: 'position:absolute;top:10px;right:10px;z-index:1' }, T('close', 'Fermer'));
      const layer = el('div', { style: 'position:fixed;inset:0;z-index:1300;background:#fff' }, shut, frame);
      shut.addEventListener('click', () => layer.remove());
      document.body.append(layer);
    });
    return el('section', {},
      el('h2', {}, T('data', 'Données')),
      el('p', { class: 'help' }, T('dataHelp', 'Tout est enregistré uniquement sur cet appareil. Aucune donnée n\'est envoyée.')),
      reset, ' ', privacy,
    );
  }

  render();
}
