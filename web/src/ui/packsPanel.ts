import { LANGUAGES, PackId, formatRemaining, languageOf, packChoices } from '../domain/packs';
import { t } from '../i18n';
import { appLanguage, downloads, installedPacks, markPacksAsked, setAppLanguage } from '../core/packs';
import { engineReady } from '../core/piper';

/**
 * Le panneau des téléchargements : la langue, les packs à cocher (tous cochés
 * par défaut, avec leur taille), le bouton Télécharger, puis la progression en
 * direct avec le temps restant. Le même panneau sert au premier lancement
 * (fenêtre) et dans l'espace parents.
 */

const CSS = `
.packs { text-align: left; }
.packs .lang { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 4px 0 12px; }
.packs select { font: inherit; padding: 8px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; min-height: 44px; }
.packs .pack { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-top: 1px solid #e5e7eb; }
.packs .pack:first-of-type { border-top: 0; }
.packs .pack input { width: 22px; height: 22px; margin-top: 2px; flex: none; }
.packs .pack b { display: block; }
.packs .pack small { color: #6b7280; display: block; }
.packs .pack .size { margin-left: auto; white-space: nowrap; color: #374151; font-weight: 600; }
.packs .pack .ok { color: #2f8a34; }
.packs .total { margin: 8px 0 12px; color: #374151; }
.packs .go { width: 100%; min-height: 50px; border: 0; border-radius: 12px; background: #43b649; color: #fff; font: inherit;
  font-weight: 700; font-size: 17px; cursor: pointer; }
.packs .go:disabled { opacity: .5; cursor: default; }
.packs .progress { margin-top: 12px; }
.packs .bar { height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden; }
.packs .bar span { display: block; height: 100%; width: 0; background: #43b649; transition: width .4s; }
.packs .eta { margin: 6px 0 4px; font-weight: 600; }
.packs .task { font-size: 14px; color: #4b5563; display: flex; justify-content: space-between; gap: 8px; }
.packs .task.err { color: #b91c1c; }
`;

const mb = (bytes: number) => t('ui.mb', { n: Math.round(bytes / 1e6) }, '{n} Mo');

/** Textes des packs dans la langue de l'application. */
const packTexts = () => ({
  speech: (l: string) => t('ui.pack.speechTitle', { language: l }, 'Voix du dino ({language})'),
  speechDetail: t('ui.pack.speechDetail', {}, 'Une voix naturelle, la même sur tous les appareils.'),
  second: (l: string) => t('ui.pack.secondTitle', { language: l }, 'Voix {language}'),
  secondDetail: t('ui.pack.secondDetail', {}, 'Pour les mots des jeux de langue étrangère.'),
  asr: t('ui.pack.asrTitle', {}, 'Reconnaissance vocale'),
  asrDetail: t('ui.pack.asrDetail', {}, 'Pour répondre à voix haute.'),
});
const nameOf = (code: string) => t(`lang.${code}`, {}, languageOf(code).name);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

export function packsPanel(opts: { onStart?: () => void } = {}): HTMLElement {
  if (!document.getElementById('packs-css')) document.head.append(el('style', { id: 'packs-css' }, CSS));
  const root = el('div', { class: 'packs' });
  const checked: Record<PackId, boolean> = { speech: true, second: true, asr: true };
  let installed: Record<PackId, boolean> = { speech: false, second: false, asr: false };
  let titles: Partial<Record<PackId, string>> = {};

  const langSelect = el('select', { 'aria-label': t('ui.lang', {}, 'Langue') }) as HTMLSelectElement;
  for (const l of LANGUAGES) langSelect.append(el('option', { value: l.code }, l.name));
  langSelect.value = appLanguage();
  // Nouvelle langue : le jeu redémarre et télécharge les packs de cette langue (et de la langue apprise en plus).
  langSelect.addEventListener('change', () => {
    setAppLanguage(langSelect.value);
    location.reload();
  });
  const list = el('div');
  const total = el('div', { class: 'total' });
  const go = el('button', { class: 'go', type: 'button' }, t('ui.pack.download', {}, 'Télécharger')) as HTMLButtonElement;
  const progress = el('div', { class: 'progress' });
  progress.hidden = true;
  root.append(el('div', { class: 'lang' }, el('span', {}, t('ui.langLabel', {}, 'Langue :')), langSelect), list, total, go, progress);

  const draw = () => {
    const choices = packChoices(langSelect.value, checked.second || installed.second, engineReady(), packTexts(), nameOf);
    titles = Object.fromEntries(choices.map((c) => [c.id, c.title]));
    list.replaceChildren(...choices.map((c) => {
      const box = el('input', { type: 'checkbox', 'aria-label': c.title }) as HTMLInputElement;
      const done = installed[c.id];
      box.checked = done || checked[c.id];
      box.disabled = done || downloads.running;
      box.addEventListener('change', () => {
        checked[c.id] = box.checked;
        draw();
      });
      return el('label', { class: 'pack' }, box,
        el('span', {}, el('b', {}, c.title), el('small', {}, c.detail)),
        el('span', { class: `size${done ? ' ok' : ''}` }, done ? t('ui.pack.installed', {}, 'Installé ✓') : t('ui.mb', { n: Math.round(c.sizeMb) }, '{n} Mo')));
    }));
    const wanted = choices.filter((c) => checked[c.id] && !installed[c.id]);
    const sum = wanted.reduce((n, c) => n + c.sizeMb, 0);
    total.textContent = wanted.length ? t('ui.pack.toDownload', { n: Math.round(sum) }, 'À télécharger : {n} Mo (de préférence en Wi-Fi).')
      : t('ui.pack.allInstalled', {}, 'Tout est installé.');
    go.disabled = wanted.length === 0 || downloads.running;
    go.textContent = downloads.running ? t('ui.pack.running', {}, 'Téléchargement en cours…') : t('ui.pack.download', {}, 'Télécharger');
  };

  const refresh = async () => {
    installed = await installedPacks(langSelect.value);
    draw();
  };

  go.addEventListener('click', () => {
    const withSecond = checked.second || installed.second;
    const ids = packChoices(langSelect.value, withSecond, engineReady())
      .map((c) => c.id).filter((id) => checked[id] && !installed[id]);
    if (!ids.length) return;
    markPacksAsked();
    downloads.start(ids, langSelect.value, withSecond);
    opts.onStart?.();
  });

  const unsubscribe = downloads.subscribe((p) => {
    if (!root.isConnected && p.tasks.length) {
      // Le panneau a été fermé : on arrête de le mettre à jour (les téléchargements continuent).
      queueMicrotask(() => { if (!root.isConnected) unsubscribe(); });
    }
    if (!p.tasks.length) return;
    progress.hidden = false;
    const pct = p.total ? Math.min(100, (p.loaded / p.total) * 100) : 0;
    const eta = p.running ? `${mb(p.loaded)} / ${mb(p.total)} · ${formatRemaining(p.remaining)}` : t('ui.pack.finished', {}, 'Terminé.');
    progress.replaceChildren(
      el('div', { class: 'bar' }, el('span', { style: `width:${pct.toFixed(1)}%` })),
      el('div', { class: 'eta' }, eta),
      ...p.tasks.map((x) => el('div', { class: `task${x.state === 'error' ? ' err' : ''}` },
        el('span', {}, titles[x.id] ?? x.id),
        el('span', {}, x.state === 'done' ? t('ui.pack.installed', {}, 'Installé ✓') : x.state === 'error' ? t('ui.pack.failed', { error: x.error ?? '' }, 'Échec : {error}')
          : x.state === 'installing' ? t('ui.pack.installingShort', {}, 'Installation…') : x.total ? `${Math.min(100, Math.round((x.loaded / x.total) * 100))} %` : t('ui.pack.waiting', {}, 'En attente…')))),
    );
    if (!p.running) void refresh();
    else draw();
  });
  void refresh();
  return root;
}
