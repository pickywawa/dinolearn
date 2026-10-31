import { GAMES, GameDef } from '../content/games';
import { app, applyChildSettings, switchChild } from '../core/app';
import { DINO_COLORS } from '../dino/parts';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { baseLevel } from '../domain/difficulty';
import { mulberry32 } from '../domain/models';
import { COUNTRIES } from '../content/countries';
import { childForm, createParentCode } from './pin';
import { NO_ROOM_MESSAGE, VOICE_PACKS, askMicPermission, ears, packInstalled, storageRoom, voiceSupported } from '../core/ears';
import { SpeechLang } from '../domain/speech';
import { printKind } from '../print/catalog';
import { openPrintView, thumbnail } from './printView';
import { timeStepper } from './timeStepper';

/**
 * Espace parents : une page HTML classique posée sur le jeu (lisible et
 * défilable), ouverte depuis le cadenas de l'accueil avec le code parent. On y règle l'âge, le niveau du dino et de chaque jeu, les jeux
 * proposés et le temps de jeu, et on suit la progression.
 */

const TITLES: Record<string, string> = {
  'EN-1': 'Anglais — Écoute et touche', 'EN-2': 'Anglais — Numbers', 'MO-1': 'Monde — Montre-moi',
  'MO-2': 'Monde — Devinettes', 'MO-3': 'Monde — Les ombres', 'MO-4': 'Monde — Ça va ensemble',
  'MO-5': 'Monde — Le plus grand', 'FR-1': 'Français — Les sons', 'FR-2': 'Français — Les syllabes',
  'FR-3': 'Français — Lis le mot', 'FR-4': 'Français — Les lettres', 'LO-1': 'Logique — L\'intrus',
  'LO-2': 'Logique — Combien ?', 'LO-3': 'Logique — La suite', 'LO-4': 'Logique — Le plus, le moins',
  'LO-5': 'Logique — Calcul', 'LO-6': 'Logique — Les nombres', 'LO-7': 'Logique — Formes et couleurs',
  'LO-8': 'Logique — L\'heure', 'LO-9': 'Logique — La monnaie',
  'MO-6': 'Monde — Mon pays', 'TR-1': 'Écriture — Trace les formes', 'TR-2': 'Écriture — Trace les lettres et les chiffres',
  'FR-5': 'Français — Lis et touche l\'image', 'FR-6': 'Français — La phrase à trou (images)',
  'FR-7': 'Français — La phrase à trou (mots écrits)', 'FR-8': 'Français — Écoute l\'histoire',
  'LO-10': 'Logique — Memory', 'EN-3': 'Anglais — Memory en anglais',
  'VO-1': 'Voix haute — Comment ça s\'appelle ?', 'VO-2': 'Voix haute — Say it in English!',
  'VO-3': 'Voix haute — Lis à voix haute', 'VO-4': 'Voix haute — Devinettes : les animaux',
  'VO-5': 'Voix haute — Devinettes : les métiers', 'VO-6': 'Voix haute — Devinettes : le sport',
  'VO-7': 'Voix haute — Devinettes : l\'espace', 'VO-8': 'Voix haute — Les saisons et la météo',
  'VO-9': 'Voix haute — Les formes et les couleurs', 'VO-10': 'Voix haute — Pays et peuples du monde',
  'VO-11': 'Voix haute — Mon pays', 'VO-12': 'Voix haute — Devinettes : la nature',
};
export const gameTitle = (g: GameDef) => TITLES[g.id] ?? g.id;


const CSS = `
.parents { position: fixed; inset: 0; z-index: 1000; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: #f4f6fb; color: #1f2937; font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
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
    document.head.append(el('style', { id: 'parents-css' }, CSS));
  }
  const root = el('div', { class: 'parents', role: 'dialog', 'aria-label': 'Espace parents' });
  const close = el('button', { class: 'primary' }, 'Retour au jeu');
  close.addEventListener('click', () => {
    root.remove();
    if (added) switchChild(added);
    else applyChildSettings();
    onClose();
  });
  root.append(el('header', {}, el('h1', {}, 'Espace parents'), close));
  const main = el('main');
  root.append(main);
  document.body.append(root);

  const render = () => {
    main.replaceChildren(
      childrenSection(), printSection(), levelSection(), timeSection(), codeSection(), voiceSection(), gamesSection(),
      failuresSection(), soundSection(), dataSection(),
    );
  };

  // ---- Enfant : âge ----
  const select = (id: string) => {
    selected = id;
    p = app.profiles.progressOf(id);
    render();
  };

  /** Onglets des enfants, fiche de l'enfant choisi, ajout et suppression, alternance. */
  function childrenSection() {
    const tabs = el('div', { class: 'row' });
    for (const id of app.profiles.ids) {
      const child = app.profiles.progressOf(id);
      const b = el('button', { class: id === selected ? 'on' : '' }, child.name || 'Sans prénom');
      b.addEventListener('click', () => select(id));
      tabs.append(b);
    }
    const add = el('button', { class: 'primary' }, '+ Ajouter un enfant');
    add.addEventListener('click', async () => {
      const child = await childForm('Nouvel enfant', 'En quittant l\'espace parents, le nouvel enfant touchera son œuf '
        + 'pour faire éclore son propre dino.', undefined, 'Annuler');
      if (!child) return;
      added = app.profiles.add(child);
      select(added);
    });
    tabs.append(add);

    const edit = el('button', {}, 'Modifier la fiche');
    edit.addEventListener('click', async () => {
      const s = p.settings;
      const child = await childForm(`Fiche de ${p.name || 'l\'enfant'}`, 'Prénom, âge et réglages.', {
        name: p.name, age: p.age, country: s.country, dailyMinutes: s.dailyMinutes, nightTime: s.nightTime,
      }, 'Annuler');
      if (!child) return;
      if (child.age !== p.age) p.clearGameLevels();
      p.name = child.name;
      p.age = child.age;
      p.updateSettings({ country: child.country, dailyMinutes: child.dailyMinutes, nightTime: child.nightTime });
      render();
    });
    const actions = el('div', { class: 'row', style: 'margin-top:12px' }, edit);
    if (app.profiles.count > 1) {
      const remove = el('button', { class: 'danger' }, `Supprimer ${p.name || 'cet enfant'}`);
      remove.addEventListener('click', () => {
        if (!confirm(`Supprimer ${p.name || 'cet enfant'}, son dino et toute sa progression ? C'est définitif.`)) return;
        app.profiles.remove(selected);
        if (added === selected) added = undefined;
        select(app.profiles.activeId);
      });
      actions.append(remove);
    }
    const country = COUNTRIES.find((c) => c.code === p.settings.country);
    const dino = p.hatched ? `dino ${DINO_COLORS[p.color].name}` : 'œuf pas encore éclos';
    const answers = p.answers();
    const last100 = answers.slice(0, 100);
    const rate = last100.length ? last100.filter((a) => a.firstTrySuccess).length / last100.length : 0;

    const alternate = el('input', { type: 'checkbox', 'aria-label': 'Alterner les séries entre les enfants' });
    (alternate as HTMLInputElement).checked = app.profiles.alternate;
    alternate.addEventListener('change', () => app.profiles.setAlternate((alternate as HTMLInputElement).checked));

    return el('section', {},
      el('h2', {}, 'Enfants'),
      el('p', { class: 'help' }, 'Chaque enfant a son dino, sa progression et ses réglages. Les réglages ci-dessous '
        + 'concernent l\'enfant choisi.'),
      tabs,
      el('p', { style: 'margin:14px 0 0' }, el('b', {}, p.name || 'Sans prénom'),
        ` · ${p.age} ans · ${country ? country.name.replace(/^(la|le) /, '') : 'autre pays'} · ${dino}`),
      actions,
      el('div', { class: 'stat', style: 'margin-top:12px' },
        el('div', {}, el('b', {}, String(p.seriesPlayed)), 'séries jouées'),
        el('div', {}, el('b', {}, String(answers.length)), 'réponses'),
        el('div', {}, el('b', {}, last100.length ? percent(rate) : '—'), 'réussite du 1er coup (100 dernières)'),
        el('div', {}, el('b', {}, `${minutes(p.playMsToday())} min`), 'de jeu aujourd\'hui'),
      ),
      app.profiles.count > 1
        ? el('div', { class: 'row', style: 'justify-content:space-between;margin-top:14px' },
          el('span', {}, 'Alterner les séries : après chaque série, c\'est au tour de l\'enfant suivant'),
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
      diff.textContent = `Difficulté de départ des jeux : ${base} sur 20 (${base > 10 ? 'niveau CP' : 'maternelle'}). `
        + 'Elle s\'ajuste ensuite toute seule selon les réussites.';
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
      el('h2', {}, 'Niveau du dino'),
      el('p', { class: 'help' }, `Le dino grandit quand l'enfant le nourrit (niveau 1 à ${BALANCE.dinoMaxLevel}). `
        + 'Vous pouvez le régler pour adapter la difficulté : les niveaux 21 à 40 correspondent au CP.'),
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
      const b = el('button', { class: p.settings.nightTime === t ? 'on' : '' }, t ? t.replace(':', ' h ') : 'Pas de mode nuit');
      b.addEventListener('click', () => {
        p.updateSettings({ nightTime: t });
        render();
      });
      nights.append(b);
    }
    const week = p.playWeek();
    const max = Math.max(...week.map((d) => d.ms), 60_000);
    const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    const chart = el('div', { class: 'week', 'aria-label': 'Temps de jeu des 7 derniers jours' },
      ...week.map(({ day, ms }) => el('div', { title: `${minutes(ms)} min` },
        `${minutes(ms)}′`,
        el('i', { style: `height:${Math.round((ms / max) * 80)}%` }),
        days[new Date(`${day}T12:00:00`).getDay()])));
    return el('section', {},
      el('h2', {}, 'Temps de jeu par jour'),
      el('p', { class: 'help' }, 'Quand le temps est atteint, l\'enfant finit sa série, puis le jeu se bloque jusqu\'au '
        + 'lendemain : le dino va se coucher. Avec votre code, vous pouvez ajouter 15 ou 30 minutes, ou débloquer la journée.'),
      choices,
      chart,
      el('h2', { style: 'margin-top:16px' }, 'Heure du coucher (mode nuit)'),
      el('p', { class: 'help' }, 'Après cette heure, le ciel devient nuit et le dino bâille : il propose une dernière série, '
        + 'puis il va dormir jusqu\'au matin. Votre code permet de jouer encore ce soir.'),
      nights,
    );
  }

  // ---- Jeux : activés, niveau, suivi ----
  function gamesSection() {
    const list = el('div');
    for (const game of GAMES) {
      const tooYoung = p.age < (game.minAge ?? 3);
      const enabled = !p.settings.disabledGames.includes(game.id);
      const answers = p.answers({ gameId: game.id });
      const last = answers.slice(0, 100);
      const rate = last.length ? last.filter((a) => a.firstTrySuccess).length / last.length : undefined;
      const mastered = p.mastered(game.id).size;
      const lastAt = p.lastPlayed(game.id);

      const toggle = el('input', { type: 'checkbox', 'aria-label': `Activer ${gameTitle(game)}` });
      (toggle as HTMLInputElement).checked = enabled;
      toggle.addEventListener('change', () => {
        const others = p.settings.disabledGames.filter((id) => id !== game.id);
        p.updateSettings({ disabledGames: (toggle as HTMLInputElement).checked ? others : [...others, game.id] });
        render();
      });

      const level = el('select', { 'aria-label': `Niveau de ${gameTitle(game)}` });
      level.append(el('option', { value: '' }, 'Niveau auto'));
      for (let l = 1; l <= BALANCE.maxLevel; l++) level.append(el('option', { value: String(l) }, `Niveau ${l}`));
      (level as HTMLSelectElement).value = String(p.gameLevel(game.id) ?? '');
      level.addEventListener('change', () => {
        const v = (level as HTMLSelectElement).value;
        p.setGameLevel(game.id, v ? Number(v) : null);
      });

      const needsVoice = game.voice && !(p.settings.voice && p.settings.voicePacks.includes(game.voice));
      const meta = tooYoung
        ? `À partir de ${game.minAge} ans`
        : needsVoice
          ? `Jeu à voix haute : autorisez le micro et téléchargez le pack ${VOICE_PACKS[game.voice!].name.toLowerCase()} (section « Micro »).`
          : [
          answers.length ? `${answers.length} réponses` : 'Pas encore joué',
          rate !== undefined ? `${percent(rate)} du 1er coup` : '',
          `${mastered} / ${game.questions.length} questions réussies`,
          lastAt ? `dernière partie le ${new Date(lastAt).toLocaleDateString('fr-FR')}` : '',
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
    const choose = el('input', { type: 'checkbox', 'aria-label': 'Bouton pour choisir son jeu' }) as HTMLInputElement;
    choose.checked = p.settings.chooseGames;
    choose.addEventListener('change', () => p.updateSettings({ chooseGames: choose.checked }));
    return el('section', {},
      el('h2', {}, 'Jeux'),
      el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', {}, 'Bouton « choisir son jeu » sur l\'accueil'),
        el('label', { class: 'switch' }, choose, el('span')),
      ),
      el('p', { class: 'help', style: 'margin-top:6px' }, 'Désactivé, l\'enfant joue avec la planète : chaque série mélange tous '
        + 'les jeux de son âge. Activé, il peut aussi choisir un jeu précis (et les jeux à voix haute, qui ne se mélangent pas aux autres).'),
      el('p', { class: 'help' }, 'Désactivez un jeu pour qu\'il ne soit plus proposé. Le niveau (1 à 20, 11 à 20 = CP) '
        + 'est le point de départ de la prochaine série ; « auto » le calcule d\'après l\'âge, le dino et les réussites.'),
      list,
    );
  }

  // ---- À retravailler (révision espacée) ----
  function failuresSection() {
    const reviews = p.reviewList(15);
    const rng = mulberry32(1);
    const when = (due: number) => {
      const days = Math.round((due - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
      return days <= 0 ? 'à réviser aujourd\'hui' : days === 1 ? 'revient demain'
        : `revient le ${new Date(due).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    };
    const items = reviews.map(({ gameId, questionId, stage, due }) => {
      const game = GAMES.find((g) => g.id === gameId);
      const ref = game?.questions.find((q) => q.id === questionId);
      if (!game || !ref) return undefined;
      const q = game.build(ref, ref.level, rng);
      const text = q.prompt.map((s) => s.text).join(' ');
      return el('li', {}, text, ' ',
        el('small', {}, `— ${gameTitle(game)} · révision ${stage + 1} sur ${BALANCE.reviewDays.length} · ${when(due)}`));
    }).filter((x): x is HTMLLIElement => x !== undefined);
    return el('section', {},
      el('h2', {}, 'À retravailler'),
      el('p', { class: 'help' }, 'Une question ratée revient le lendemain, puis 3 jours plus tard, puis une semaine '
        + 'plus tard. Réussie les trois fois, elle est acquise ; ratée, elle recommence au lendemain.'),
      items.length ? el('ul', { class: 'fails' }, ...items) : el('p', {}, 'Rien à réviser pour l\'instant. Bravo !'),
    );
  }

  // ---- Son et voix ----
  function soundSection() {
    const sfx = el('input', { type: 'checkbox', 'aria-label': 'Bruitages' });
    (sfx as HTMLInputElement).checked = p.settings.sfx;
    sfx.addEventListener('change', () => {
      const on = (sfx as HTMLInputElement).checked;
      p.updateSettings({ sfx: on });
      Sfx.enabled = on;
    });
    const music = el('input', { type: 'checkbox', 'aria-label': 'Musique de fond' });
    (music as HTMLInputElement).checked = p.settings.music;
    music.addEventListener('change', () => {
      const on = (music as HTMLInputElement).checked;
      p.updateSettings({ music: on });
      Music.setEnabled(on);
    });
    const voices = app.voice.voiceNames();
    const test = el('button', {}, 'Tester la voix');
    test.addEventListener('click', () => {
      void app.voice.say([{ text: 'Bonjour ! Je suis Dino.', lang: 'fr' }, { text: 'Hello!', lang: 'en', slow: true }]);
    });
    return el('section', {},
      el('h2', {}, 'Son et voix'),
      el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', {}, 'Bruitages (bonnes réponses, erreurs, miam…)'),
        el('label', { class: 'switch' }, sfx, el('span')),
      ),
      el('div', { class: 'row', style: 'justify-content:space-between;margin-top:12px' },
        el('span', {}, 'Musique de fond douce (l\'enfant peut aussi la couper depuis l\'accueil)'),
        el('label', { class: 'switch' }, music, el('span')),
      ),
      el('p', { class: 'help', style: 'margin-top:12px' },
        `Voix française : ${voices.fr ?? 'aucune trouvée'} · Voix anglaise : ${voices.en ?? 'aucune trouvée'}. `
        + 'Les voix viennent du téléphone : pour une voix plus naturelle, installez une voix « améliorée » ou « premium » '
        + 'dans les réglages d\'accessibilité (synthèse vocale).'),
      test,
    );
  }

  // ---- Micro : jeux à voix haute ----
  function voiceSection() {
    const section = el('section', {},
      el('h2', {}, 'Micro (jeux à voix haute)'),
      el('p', { class: 'help' }, 'Dans les jeux à voix haute, l\'enfant répond en parlant : il nomme les images, dit les mots '
        + 'en anglais, lit à voix haute, répond aux devinettes. Tout reste sur cet appareil : la voix n\'est ni enregistrée, '
        + 'ni envoyée. Le micro ne s\'allume que quand l\'enfant touche le gros bouton micro. Ces questions arrivent '
        + 'mélangées aux autres quand l\'enfant touche la planète.'),
    );
    if (!voiceSupported()) {
      section.append(el('p', {}, 'Ce navigateur ne permet pas d\'utiliser le micro dans le jeu.'));
      return section;
    }
    const toggle = el('input', { type: 'checkbox', 'aria-label': 'Autoriser le micro' }) as HTMLInputElement;
    toggle.checked = p.settings.voice;
    const status = el('p', { class: 'help', style: 'margin-top:8px' });
    toggle.addEventListener('change', async () => {
      if (!toggle.checked) {
        p.updateSettings({ voice: false });
        render();
        return;
      }
      // La question du navigateur s'affiche maintenant, pendant que le parent est là.
      status.textContent = 'Autorisez le micro dans la fenêtre du navigateur…';
      if (await askMicPermission()) {
        p.updateSettings({ voice: true });
      } else {
        alert('Le micro est bloqué. Autorisez-le dans les réglages du navigateur (cadenas à côté de l\'adresse), puis réessayez.');
      }
      render();
    });
    section.append(el('div', { class: 'row', style: 'justify-content:space-between' },
      el('span', {}, 'Autoriser le micro'),
      el('label', { class: 'switch' }, toggle, el('span')),
    ), status);
    if (!p.settings.voice) return section;

    section.append(el('p', { class: 'help', style: 'margin-top:12px' }, 'Packs de reconnaissance vocale (facultatifs, un par '
      + 'langue) : à télécharger une seule fois, de préférence en Wi-Fi. Le pack français sert aux jeux en français, le pack '
      + 'anglais à « Say it in English! ».'));
    for (const lang of Object.keys(VOICE_PACKS) as SpeechLang[]) {
      const pack = VOICE_PACKS[lang];
      const installed = p.settings.voicePacks.includes(lang);
      const state = el('span', { class: 'meta' }, installed ? 'Installé ✓' : `≈ ${pack.sizeMb} Mo`);
      const button = el('button', { class: installed ? '' : 'primary' }, installed ? 'Vérifier' : 'Télécharger');
      button.addEventListener('click', async () => {
        button.setAttribute('disabled', '');
        if (!installed && await storageRoom(lang) === 'full') {
          state.textContent = NO_ROOM_MESSAGE;
          button.removeAttribute('disabled');
          return;
        }
        state.textContent = installed ? 'Vérification…' : 'Téléchargement et installation… (une à trois minutes)';
        try {
          if (installed && await packInstalled(lang)) {
            state.textContent = 'Installé ✓ (le pack est bien sur cet appareil)';
            button.removeAttribute('disabled');
            return;
          }
          await ears.install(lang);
          // Le pack est sur l'appareil : il sert à tous les enfants.
          for (const id of app.profiles.ids) {
            const child = app.profiles.progressOf(id);
            child.updateSettings({ voicePacks: [...new Set([...child.settings.voicePacks, lang])] });
          }
          render();
        } catch (e) {
          console.warn(e);
          for (const id of app.profiles.ids) {
            const child = app.profiles.progressOf(id);
            child.updateSettings({ voicePacks: child.settings.voicePacks.filter((l) => l !== lang) });
          }
          state.textContent = 'Le téléchargement a échoué. Vérifiez la connexion, puis réessayez. En navigation privée, '
            + 'le navigateur n\'a souvent pas assez de place : ouvrez le jeu dans une fenêtre normale.';
          button.removeAttribute('disabled');
        }
      });
      section.append(el('div', { class: 'row', style: 'justify-content:space-between;margin-top:8px' },
        el('span', {}, el('b', {}, `Pack ${pack.name.toLowerCase()} `), state), button));
    }
    if (p.settings.voicePacks.length) {
      const remove = el('button', { class: 'danger', style: 'margin-top:12px' }, 'Supprimer les packs');
      remove.addEventListener('click', async () => {
        if (!confirm('Supprimer les packs de reconnaissance vocale de cet appareil ? Les jeux à voix haute ne seront plus proposés.')) return;
        await ears.removeAll();
        for (const id of app.profiles.ids) app.profiles.progressOf(id).updateSettings({ voicePacks: [] });
        render();
      });
      section.append(remove);
    }
    return section;
  }

  // ---- Code parent ----
  function codeSection() {
    const change = el('button', {}, 'Changer le code');
    change.addEventListener('click', async () => {
      if (await createParentCode('Nouveau code parent', 'Choisissez un nouveau code à 4 chiffres.', 'Annuler')) {
        alert('Le code parent a été changé.');
      }
    });
    return el('section', {},
      el('h2', {}, 'Code parent'),
      el('p', { class: 'help' }, 'Le code ouvre cet espace et débloque le jeu quand le temps du jour est fini. '
        + 'En cas d\'oubli, « Code oublié ? » permet d\'en créer un nouveau après une question pour adulte.'),
      change,
    );
  }

  // ---- Données ----
  function dataSection() {
    const reset = el('button', { class: 'danger' }, 'Tout recommencer');
    reset.addEventListener('click', () => {
      if (!confirm('Effacer toute la progression (niveau du dino, réponses, fruits) ? Les réglages sont conservés.')) return;
      p.reset();
      render();
    });
    return el('section', {},
      el('h2', {}, 'Données'),
      el('p', { class: 'help' }, 'Tout est enregistré uniquement sur cet appareil. Aucune donnée n\'est envoyée.'),
      reset,
    );
  }

  render();
}
