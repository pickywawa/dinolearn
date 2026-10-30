import { GAMES, GameDef } from '../content/games';
import { app } from '../core/app';
import { Music } from '../core/music';
import { Sfx } from '../core/sfx';
import { BALANCE } from '../domain/balance';
import { baseLevel } from '../domain/difficulty';
import { mulberry32 } from '../domain/models';
import { COUNTRIES } from '../content/countries';
import { chooseCountry, createParentCode } from './pin';
import { VOICE_PACKS, askMicPermission, ears, packInstalled, voiceSupported } from '../core/ears';
import { SpeechLang } from '../domain/speech';

/**
 * Espace parents : une page HTML classique posée sur le jeu (lisible et
 * défilable), ouverte depuis l'accueil par un appui long puis un glissé vers
 * le haut. On y règle l'âge, le niveau du dino et de chaque jeu, les jeux
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
  'FR-7': 'Français — La phrase à trou (mots écrits)',
  'VO-1': 'Voix haute — Comment ça s\'appelle ?', 'VO-2': 'Voix haute — Say it in English!',
  'VO-3': 'Voix haute — Lis à voix haute', 'VO-4': 'Voix haute — Devinettes : les animaux',
  'VO-5': 'Voix haute — Devinettes : les métiers', 'VO-6': 'Voix haute — Devinettes : le sport',
  'VO-7': 'Voix haute — Devinettes : l\'espace', 'VO-8': 'Voix haute — Les saisons et la météo',
  'VO-9': 'Voix haute — Les formes et les couleurs', 'VO-10': 'Voix haute — Pays et peuples du monde',
  'VO-11': 'Voix haute — Mon pays', 'VO-12': 'Voix haute — Devinettes : la nature',
};
export const gameTitle = (g: GameDef) => TITLES[g.id] ?? g.id;

const DAILY_CHOICES = [0, 10, 20, 30, 45, 60, 90];

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
  const p = app.progress;
  if (!document.getElementById('parents-css')) {
    document.head.append(el('style', { id: 'parents-css' }, CSS));
  }
  const root = el('div', { class: 'parents', role: 'dialog', 'aria-label': 'Espace parents' });
  const close = el('button', { class: 'primary' }, 'Retour au jeu');
  close.addEventListener('click', () => {
    root.remove();
    onClose();
  });
  root.append(el('header', {}, el('h1', {}, 'Espace parents'), close));
  const main = el('main');
  root.append(main);
  document.body.append(root);

  const render = () => {
    main.replaceChildren(
      childSection(), levelSection(), timeSection(), codeSection(), countrySection(), voiceSection(), gamesSection(), failuresSection(),
      soundSection(), dataSection(),
    );
  };

  // ---- Enfant : âge ----
  function childSection() {
    const ages = el('div', { class: 'row' });
    for (let age = 3; age <= 7; age++) {
      const b = el('button', { class: p.age === age ? 'on' : '' }, `${age} ans`);
      b.addEventListener('click', () => {
        p.age = age;
        p.clearGameLevels();
        render();
      });
      ages.append(b);
    }
    const answers = p.answers();
    const last100 = answers.slice(0, 100);
    const rate = last100.length ? last100.filter((a) => a.firstTrySuccess).length / last100.length : 0;
    return el('section', {},
      el('h2', {}, 'Enfant'),
      el('p', { class: 'help' }, 'L\'âge choisit les jeux proposés (anglais, calcul et lecture dès 5 ans) et le niveau de départ.'),
      ages,
      el('div', { class: 'stat', style: 'margin-top:12px' },
        el('div', {}, el('b', {}, String(p.seriesPlayed)), 'séries jouées'),
        el('div', {}, el('b', {}, String(answers.length)), 'réponses'),
        el('div', {}, el('b', {}, last100.length ? percent(rate) : '—'), 'réussite du 1er coup (100 dernières)'),
        el('div', {}, el('b', {}, `${minutes(p.playMsToday())} min`), 'de jeu aujourd\'hui'),
      ),
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
    const choices = el('div', { class: 'row' });
    for (const m of DAILY_CHOICES) {
      const b = el('button', { class: p.settings.dailyMinutes === m ? 'on' : '' }, m === 0 ? 'Illimité' : `${m} min`);
      b.addEventListener('click', () => {
        p.updateSettings({ dailyMinutes: m });
        render();
      });
      choices.append(b);
    }
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
    return el('section', {},
      el('h2', {}, 'Jeux'),
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
        + 'ni envoyée. Le micro ne s\'allume que quand l\'enfant touche le gros bouton micro.'),
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
        state.textContent = installed ? 'Vérification…' : 'Téléchargement et installation… (une à trois minutes)';
        try {
          if (installed && await packInstalled(lang)) {
            state.textContent = 'Installé ✓ (le pack est bien sur cet appareil)';
            button.removeAttribute('disabled');
            return;
          }
          await ears.install(lang);
          p.updateSettings({ voicePacks: [...new Set([...p.settings.voicePacks, lang])] });
          render();
        } catch (e) {
          console.warn(e);
          p.updateSettings({ voicePacks: p.settings.voicePacks.filter((l) => l !== lang) });
          state.textContent = 'Le téléchargement a échoué. Vérifiez la connexion, puis réessayez.';
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
        p.updateSettings({ voicePacks: [] });
        render();
      });
      section.append(remove);
    }
    return section;
  }

  // ---- Pays ----
  function countrySection() {
    const current = COUNTRIES.find((c) => c.code === p.settings.country);
    const change = el('button', {}, 'Changer de pays');
    change.addEventListener('click', async () => {
      if (await chooseCountry('Annuler')) render();
    });
    return el('section', {},
      el('h2', {}, 'Pays de l\'enfant'),
      el('p', { class: 'help' }, current
        ? `Pays : ${current.name.replace(/^(la|le) /, '')}. Le jeu « Mon pays » pose des questions dessus : drapeau, `
          + 'symboles, spécialités, fête nationale, capitale, pays voisins…'
        : 'Autre pays : le jeu « Mon pays » n\'est pas proposé.'),
      change,
    );
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
