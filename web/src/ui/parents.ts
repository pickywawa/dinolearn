import { GAMES, GameDef } from '../content/games';
import { app, applyChildSettings, switchChild } from '../core/app';
import { DINO_COLORS } from '../dino/parts';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { baseLevel } from '../domain/difficulty';
import { mulberry32 } from '../domain/models';
import { COUNTRIES, countryLabel } from '../content/countries';
import { childForm, createParentCode } from './pin';
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
 * Espace parents : une page HTML classique posée sur le jeu (lisible et
 * défilable), ouverte depuis le cadenas de l'accueil avec le code parent. On y règle l'âge, le niveau du dino et de chaque jeu, les jeux
 * proposés et le temps de jeu, et on suit la progression.
 */

export const gameTitle = (g: GameDef) => TITLES[g.id] ?? g.id;


const CSS = `
.parents { position: fixed; inset: 0; z-index: 1000; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: #eceefe url('bg/parents.webp') center / cover no-repeat fixed; color: #1f2937; font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.parents * { box-sizing: border-box; }
.parents header { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px; background: #2d3354; color: #fff; }
.parents header h1 { margin: 0; font-size: 20px; }
.parents main { max-width: 760px; margin: 0 auto; padding: 16px 16px 48px; }
.parents section { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.parents h2 { margin: 0 0 4px; font-size: 18px; }
.parents .help { margin: 0 0 12px; color: #6b7280; font-size: 14px; }
.parents button { font: inherit; border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer;
  background: #e5e7eb; color: #1f2937; min-height: 44px; }
.parents button.primary { background: #43b649; color: #fff; font-weight: 600; }
.parents button.danger { background: #fee2e2; color: #b91c1c; }
.parents button.on { background: #2d3354; color: #fff; }
.parents .row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.parents .stat { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.parents .stat div { background: #f4f6fb; border-radius: 10px; padding: 10px; }
.parents .stat b { display: block; font-size: 22px; }
.parents input[type=range] { width: 100%; height: 36px; accent-color: #43b649; }
.parents .level { display: flex; align-items: center; gap: 12px; }
.parents .level output { min-width: 48px; text-align: center; font-size: 26px; font-weight: 700; }
.parents .game { border-top: 1px solid #e5e7eb; padding: 12px 0; }
.parents .game:first-of-type { border-top: 0; }
.parents .game.off { opacity: .55; }
.parents .game .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.parents .game .name { font-weight: 600; }
.parents .game .meta { color: #6b7280; font-size: 14px; }
.parents .game select { font: inherit; padding: 8px; border-radius: 8px; border: 1px solid #d1d5db; min-height: 40px; }
.parents .bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 6px; }
.parents .bar span { display: block; height: 100%; background: #43b649; }
.parents .switch { position: relative; width: 52px; height: 32px; flex: none; }
.parents .switch input { opacity: 0; width: 0; height: 0; }
.parents .switch span { position: absolute; inset: 0; background: #d1d5db; border-radius: 16px; transition: .2s; }
.parents .switch span::after { content: ''; position: absolute; left: 3px; top: 3px; width: 26px; height: 26px;
  background: #fff; border-radius: 50%; transition: .2s; }
.parents .switch input:checked + span { background: #43b649; }
.parents .switch input:checked + span::after { transform: translateX(20px); }
.parents .week { display: flex; align-items: flex-end; gap: 6px; height: 110px; margin-top: 8px; }
.parents .week div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  height: 100%; font-size: 12px; color: #6b7280; }
.parents .week i { display: block; width: 100%; background: #8e4ec6; border-radius: 6px 6px 0 0; min-height: 2px; }
.parents ul.fails { margin: 0; padding-left: 18px; }
.parents ul.fails li { margin: 6px 0; }
.parents ul.fails small { color: #6b7280; }
.parents .prints { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.parents .print { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 12px;
  background: #f4f6fb; border: 0; text-align: left; cursor: pointer; min-height: 0; }
.parents .print .thumb { background: #fff; aspect-ratio: 210 / 297; border-radius: 6px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.parents .print .thumb svg { display: block; width: 100%; height: 100%; }
.parents .print b { font-size: 14px; line-height: 1.25; }
.parents .print small { color: #6b7280; font-size: 12px; }
.parents .print .new { position: absolute; top: 4px; right: 4px; background: #e5484d; color: #fff; font-size: 12px;
  font-weight: 700; border-radius: 10px; padding: 2px 8px; }
`;

// Habillage « île aux dinos » (maquette) : en-tête bleu nuit, colonne des enfants, cartes arrondies.
const THEME = `
.parents { background: linear-gradient(#eef6ff, #f7f3ea); }
.parents h1, .parents h2, .parents .kid-name, .parents .tiles b { font-family: 'Baloo 2', system-ui, sans-serif; }
.parents header { padding: 12px 20px; box-shadow: 0 4px 14px rgba(30,40,80,.25); }
.parents header h1 { font-size: 26px; display: flex; align-items: center; gap: 12px; }
.parents header h1 .icon { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  background: #fff; color: #2d3354; font-size: 24px; }
.parents header button.primary { border-radius: 999px; padding: 10px 22px; font-family: 'Baloo 2', sans-serif; font-size: 18px;
  font-weight: 800; background: linear-gradient(#5fd34a, #34a52a); box-shadow: 0 3px 0 #237a1a; }
.parents main { max-width: 1180px; display: grid; grid-template-columns: 230px 1fr; gap: 18px; align-items: start; }
.parents aside { position: sticky; top: 86px; background: #fff; border-radius: 18px; padding: 14px;
  box-shadow: 0 2px 10px rgba(30,40,80,.08); display: flex; flex-direction: column; gap: 10px; }
.parents aside button { display: flex; align-items: center; gap: 10px; text-align: left; border-radius: 12px; font-weight: 700;
  background: #f1f4f9; }
.parents aside button img { width: 34px; height: 34px; border-radius: 50%; background: #fff; }
.parents aside button.on { background: #2d3354; color: #fff; }
.parents aside button.add { background: #e7f8df; color: #2a7f1d; border: 2px dashed #8fd47a; }
.parents section { border-radius: 18px; box-shadow: 0 2px 10px rgba(30,40,80,.08); }
.parents .kid { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.parents .kid img.avatar { width: 112px; height: 112px; border-radius: 50%; background: radial-gradient(#fff, #ffe3f0);
  box-shadow: 0 3px 10px rgba(30,40,80,.15); }
.parents .kid-name { font-size: 24px; font-weight: 800; margin: 0; }
.parents .kid small { color: #6b7280; }
.parents .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 14px; }
.parents .tiles div { background: #f6f8fc; border: 1px solid #e3e9f2; border-radius: 14px; padding: 12px; text-align: center;
  color: #4b5563; font-size: 14px; }
.parents .tiles b { display: block; font-size: 28px; color: #2d3354; line-height: 1.1; }
.parents button.edit { border-radius: 999px; background: #eef1f6; font-weight: 700; }
@media (max-width: 760px) { .parents main { grid-template-columns: 1fr; } .parents aside { position: static; } }
`;

const minutes = (ms: number) => Math.round(ms / 60_000);
const percent = (x: number) => `${Math.round(x * 100)} %`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

/** Ouvre l'espace parents ; `onClose` relance l'accueil pour appliquer les réglages. */
export function openParents(onClose: () => void) {
  // Enfant affiché (onglets en haut) ; un enfant ajouté devra ouvrir son œuf en sortant.
  let selected = app.profiles.activeId;
  let p = app.profiles.progressOf(selected);
  let added: string | undefined;
  if (!document.getElementById('parents-css')) {
    document.head.append(el('style', { id: 'parents-css' }, CSS + THEME));
  }
  const root = el('div', { class: 'parents', role: 'dialog', 'aria-label': T('title', 'Espace parents') });
  const close = el('button', { class: 'primary' }, T('back', 'Retour au jeu'));
  close.addEventListener('click', () => {
    root.remove();
    if (added) switchChild(added);
    else applyChildSettings();
    onClose();
  });
  root.append(el('header', {}, el('h1', {}, el('span', { class: 'icon' }, '👨‍👩‍👧'), T('title', 'Espace parents')), close));
  const main = el('main');
  root.append(main);
  document.body.append(root);

  const render = () => {
    main.replaceChildren(
      el('aside', {}, ...childTabs()),
      el('div', { class: 'content' }, childrenSection(), isFr() ? printSection() : '', levelSection(), timeSection(), codeSection(), voiceSection(), packsSection(), gamesSection(),
      failuresSection(), soundSection(), dataSection()),
    );
  };

  // ---- Enfant : âge ----
  const select = (id: string) => {
    selected = id;
    p = app.profiles.progressOf(id);
    render();
  };

  /** Colonne des enfants (avec le portrait de leur dino) et bouton d'ajout. */
  function childTabs(): Node[] {
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
    const add = el('button', { class: 'add' }, T('addChild', '+ Ajouter un enfant'));
    add.addEventListener('click', async () => {
      const child = await childForm(T('newChild', 'Nouvel enfant'), T('newChildHelp', 'En quittant l\'espace parents, le nouvel enfant touchera son œuf pour faire éclore son propre dino.'), undefined, T('cancel', 'Annuler'));
      if (!child) return;
      added = app.profiles.add(child);
      select(added);
    });
    out.push(add);
    return out;
  }

  /** Fiche de l'enfant choisi : portrait, chiffres clés, modification, suppression, alternance. */
  function childrenSection() {

    const edit = el('button', { class: 'edit' }, T('edit', '✏️ Modifier la fiche'));
    edit.addEventListener('click', async () => {
      const s = p.settings;
      const child = await childForm(p.name ? T('sheetOf', 'Fiche de {name}', { name: p.name }) : T('sheet', 'Fiche de l\'enfant'), T('sheetHelp', 'Prénom, âge et réglages.'), {
        name: p.name, age: p.age, country: s.country, dailyMinutes: s.dailyMinutes, nightTime: s.nightTime,
        chooseGames: s.chooseGames,
      }, T('cancel', 'Annuler'));
      if (!child) return;
      if (child.age !== p.age) p.clearGameLevels();
      p.name = child.name;
      p.age = child.age;
      p.updateSettings({ country: child.country, dailyMinutes: child.dailyMinutes, nightTime: child.nightTime,
        chooseGames: child.chooseGames ?? s.chooseGames });
      render();
    });
    const actions = el('div', { class: 'row', style: 'margin-top:12px' }, edit);
    if (app.profiles.count > 1) {
      const remove = el('button', { class: 'danger' }, T('removeChild', 'Supprimer {name}', { name: p.name || T('thisChild', 'cet enfant') }));
      remove.addEventListener('click', () => {
        if (!confirm(T('removeConfirm', 'Supprimer {name}, son dino et toute sa progression ? C\'est définitif.', { name: p.name || T('thisChild', 'cet enfant') }))) return;
        app.profiles.remove(selected);
        if (added === selected) added = undefined;
        select(app.profiles.activeId);
      });
      actions.append(remove);
    }
    const country = COUNTRIES.find((c) => c.code === p.settings.country);
    const dino = p.hatched ? (isFr() ? `dino ${DINO_COLORS[p.color].name}` : T('dino', 'dino')) : T('egg', 'œuf pas encore éclos');
    const answers = p.answers();
    const last100 = answers.slice(0, 100);
    const rate = last100.length ? last100.filter((a) => a.firstTrySuccess).length / last100.length : 0;

    const alternate = el('input', { type: 'checkbox', 'aria-label': T('alternateAria', 'Alterner les séries entre les enfants') });
    (alternate as HTMLInputElement).checked = app.profiles.alternate;
    alternate.addEventListener('change', () => app.profiles.setAlternate((alternate as HTMLInputElement).checked));

    const face = p.hatched ? dinoPortrait(p.color, 224, 'happy') : undefined;
    return el('section', {},
      el('div', { class: 'kid' },
        face ? el('img', { class: 'avatar', src: face, alt: dino }) : '',
        el('div', {},
          el('p', { class: 'kid-name' }, `${p.name || T('noName', 'Sans prénom')} · ${T('age', '{n} ans', { n: p.age })}`),
          el('small', {}, `${country ? countryLabel(country.code) : T('otherCountry', 'autre pays')} · ${dino}`))),
      el('div', { class: 'tiles' },
        el('div', {}, el('b', {}, String(p.seriesPlayed)), T('series', 'séries jouées')),
        el('div', {}, el('b', {}, String(answers.length)), T('answers', 'réponses')),
        el('div', {}, el('b', {}, last100.length ? percent(rate) : '—'), T('firstTry', 'de réussite du 1er coup')),
        el('div', {}, el('b', {}, `${minutes(p.playMsToday())} min`), T('today', 'de jeu aujourd\'hui')),
      ),
      el('p', { class: 'help', style: 'margin:10px 0 0' }, T('childrenHelp', 'Chaque enfant a son dino, sa progression et ses réglages. Les réglages ci-dessous concernent l\'enfant choisi.')),
      actions,
      app.profiles.count > 1
        ? el('div', { class: 'row', style: 'justify-content:space-between;margin-top:14px' },
          el('span', {}, T('alternate', 'Alterner les séries : après chaque série, c\'est au tour de l\'enfant suivant')),
          el('label', { class: 'switch' }, alternate, el('span')))
        : '',
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
    return el('section', {},
      el('h2', {}, `À imprimer${p.newPrintables ? ` (${p.newPrintables} nouvelle${p.newPrintables > 1 ? 's' : ''})` : ''}`),
      el('p', { class: 'help' }, 'À la fin du temps de jeu (ou à l\'heure du coucher), le dino offre trois enveloppes '
        + 'surprises ; l\'enfant en choisit une, une fois par jour. La fiche arrive ici, avec son dino, adaptée à son âge '
        + 'et à ses progrès, et des conseils pour vous. Sans limite de temps ni heure du coucher : après 4 séries. '
        + 'Un diplôme tous les 5 niveaux du dino.'),
      records.length ? grid : el('p', {}, 'Pas encore de fiche : la première enveloppe arrivera à la fin du temps de jeu.'),
      records.length > shown.length ? el('div', { class: 'row', style: 'margin-top:12px' }, more) : '',
    );
  }

  // ---- Niveau du dino ----
  function levelSection() {
    const range = el('input', { type: 'range', min: '1', max: String(BALANCE.dinoMaxLevel), value: String(p.dino.level) });
    const out = el('output', {}, String(p.dino.level));
    const diff = el('p', { class: 'help' });
    const describe = (level: number) => {
      const base = baseLevel(level, p.age);
      diff.textContent = T('difficulty', 'Difficulté de départ des jeux : {n} sur 20 ({stage}). Elle s\'ajuste ensuite toute seule selon les réussites.', { n: base, stage: base > 10 ? T('stageCP', 'niveau CP') : T('stageK', 'maternelle') });
    };
    describe(p.dino.level);
    range.addEventListener('input', () => {
      out.textContent = range.value;
      describe(Number(range.value));
    });
    range.addEventListener('change', () => {
      p.setDinoLevel(Number(range.value));
      p.clearGameLevels();
      render();
    });
    return el('section', {},
      el('h2', {}, T('dinoLevel', 'Niveau du dino')),
      el('p', { class: 'help' }, T('dinoLevelHelp', 'Le dino grandit quand l\'enfant le nourrit (niveau 1 à {max}). Vous pouvez le régler pour adapter la difficulté : les niveaux 21 à 40 correspondent au CP.', { max: BALANCE.dinoMaxLevel })),
      el('div', { class: 'level' }, range, out),
      diff,
    );
  }

  // ---- Temps de jeu ----
  function timeSection() {
    // Le même réglage que dans la fiche de l'enfant : − et + par 5 minutes, ou illimité.
    const choices = timeStepper(() => p.settings.dailyMinutes, (m) => p.updateSettings({ dailyMinutes: m }));
    const nights = el('div', { class: 'row', style: 'margin-top:12px' });
    for (const t of ['', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']) {
      const b = el('button', { class: p.settings.nightTime === t ? 'on' : '' }, t ? t.replace(':', ' h ') : T('noNight', 'Pas de mode nuit'));
      b.addEventListener('click', () => {
        p.updateSettings({ nightTime: t });
        render();
      });
      nights.append(b);
    }
    const week = p.playWeek();
    const max = Math.max(...week.map((d) => d.ms), 60_000);
    const dayName = (d: Date) => d.toLocaleDateString(dateLocale(), { weekday: 'short' });
    const chart = el('div', { class: 'week', 'aria-label': T('week', 'Temps de jeu des 7 derniers jours') },
      ...week.map(({ day, ms }) => el('div', { title: `${minutes(ms)} min` },
        `${minutes(ms)}′`,
        el('i', { style: `height:${Math.round((ms / max) * 80)}%` }),
        dayName(new Date(`${day}T12:00:00`)))));
    return el('section', {},
      el('h2', {}, T('daily', 'Temps de jeu par jour')),
      el('p', { class: 'help' }, T('dailyHelp', 'Quand le temps est atteint, l\'enfant finit sa série, puis le jeu se bloque jusqu\'au lendemain : le dino va se coucher. Avec votre code, vous pouvez ajouter 15 ou 30 minutes, ou débloquer la journée.')),
      choices,
      chart,
      el('h2', { style: 'margin-top:16px' }, T('night', 'Heure du coucher (mode nuit)')),
      el('p', { class: 'help' }, T('nightHelp', 'Après cette heure, le ciel devient nuit et le dino bâille : il propose une dernière série, puis il va dormir jusqu\'au matin. Votre code permet de jouer encore ce soir.')),
      nights,
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
      list.append(el('div', { class: `game${tooYoung || !enabled || needsVoice ? ' off' : ''}` },
        el('div', { class: 'top' },
          el('span', { class: 'name' }, gameTitle(game)),
          el('label', { class: 'switch' }, toggle, el('span')),
        ),
        el('div', { class: 'meta' }, meta),
        el('div', { class: 'bar' }, el('span', { style: `width:${(mastered / game.questions.length) * 100}%` })),
        tooYoung ? '' : el('div', { class: 'row', style: 'margin-top:8px' }, level),
      ));
    }
    const choose = el('input', { type: 'checkbox', 'aria-label': T('chooseAria', 'Bouton pour choisir son jeu') }) as HTMLInputElement;
    choose.checked = p.settings.chooseGames;
    choose.addEventListener('change', () => p.updateSettings({ chooseGames: choose.checked }));
    return el('section', {},
      el('h2', {}, T('games', 'Jeux')),
      el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', {}, T('choose', 'Bouton « choisir son jeu » sur l\'accueil')),
        el('label', { class: 'switch' }, choose, el('span')),
      ),
      el('p', { class: 'help', style: 'margin-top:6px' }, T('chooseHelp', 'Désactivé, l\'enfant joue avec la planète : chaque série mélange tous les jeux de son âge. Activé, il peut aussi choisir un jeu précis (et les jeux à voix haute, qui ne se mélangent pas aux autres).')),
      el('p', { class: 'help' }, T('gamesHelp', 'Désactivez un jeu pour qu\'il ne soit plus proposé. Le niveau (1 à 20, 11 à 20 = CP) est le point de départ de la prochaine série ; « auto » le calcule d\'après l\'âge, le dino et les réussites.')),
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
    return el('section', {},
      el('h2', {}, T('review', 'À retravailler')),
      el('p', { class: 'help' }, T('reviewHelp', 'Une question ratée revient le lendemain, puis 3 jours plus tard, puis une semaine plus tard. Réussie les trois fois, elle est acquise ; ratée, elle recommence au lendemain.')),
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
    const voices = app.voice.voiceNames();
    const test = el('button', {}, T('testVoice', 'Tester la voix'));
    test.addEventListener('click', () => {
      void app.voice.say([{ text: T('testHello', 'Bonjour ! Je suis Dino.'), lang: lang() }, { text: second() === 'es' ? '¡Hola!' : 'Hello!', lang: second(), slow: true }]);
    });
    return el('section', {},
      el('h2', {}, T('sound', 'Son et voix')),
      el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', {}, T('sfx', 'Bruitages (bonnes réponses, erreurs, miam…)')),
        el('label', { class: 'switch' }, sfx, el('span')),
      ),
      el('div', { class: 'row', style: 'justify-content:space-between;margin-top:12px' },
        el('span', {}, T('music', 'Musique de fond douce (l\'enfant peut aussi la couper depuis l\'accueil)')),
        el('label', { class: 'switch' }, music, el('span')),
      ),
      el('p', { class: 'help', style: 'margin-top:12px' },
        T('phoneVoices', 'Voix française : {main} · Voix anglaise : {second}. Les voix viennent du téléphone : pour une voix plus naturelle, installez une voix « améliorée » ou « premium » dans les réglages d\'accessibilité (synthèse vocale).', { main: voices.fr ?? T('noVoice', 'aucune trouvée'), second: voices.en ?? T('noVoice', 'aucune trouvée') })),
      test,
    );
  }

  // ---- Micro : jeux à voix haute ----
  function voiceSection() {
    const section = el('section', {},
      el('h2', {}, T('mic', 'Micro (jeux à voix haute)')),
      el('p', { class: 'help' }, T('micHelp', 'Dans les jeux à voix haute, l\'enfant répond en parlant : il nomme les images, dit les mots en anglais, lit à voix haute, répond aux devinettes. Tout reste sur cet appareil : la voix n\'est ni enregistrée, ni envoyée. Le micro ne s\'allume que quand l\'enfant touche le gros bouton micro. Ces questions arrivent mélangées aux autres quand l\'enfant touche la planète.')),
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
      el('p', { class: 'help' }, T('packsHelp', 'La langue du jeu, la voix naturelle du dino (calculée sur l\'appareil, sans Internet une fois téléchargée), la voix anglaise des jeux d\'anglais et la reconnaissance vocale. Les téléchargements se font en parallèle et continuent si vous fermez cet espace. Sans la voix du dino, le jeu utilise celle du téléphone.')),
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
      el('p', { class: 'help' }, T('codeHelp', 'Le code ouvre cet espace et débloque le jeu quand le temps du jour est fini. En cas d\'oubli, « Code oublié ? » permet d\'en créer un nouveau après une question pour adulte.')),
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
