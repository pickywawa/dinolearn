import { LANGUAGES, PackId, formatRemaining, packChoices } from '../domain/packs';
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

const mb = (bytes: number) => `${Math.round(bytes / 1e6)} Mo`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

export function packsPanel(opts: { onStart?: () => void } = {}): HTMLElement {
  if (!document.getElementById('packs-css')) document.head.append(el('style', { id: 'packs-css' }, CSS));
  const root = el('div', { class: 'packs' });
  const checked: Record<PackId, boolean> = { speech: true, english: true, asr: true };
  let installed: Record<PackId, boolean> = { speech: false, english: false, asr: false };
  let titles: Partial<Record<PackId, string>> = {};

  const langSelect = el('select', { 'aria-label': 'Langue' }) as HTMLSelectElement;
  for (const l of LANGUAGES) {
    const o = el('option', { value: l.code }, l.available ? l.name : `${l.name} (bientôt)`) as HTMLOptionElement;
    o.disabled = !l.available;
    langSelect.append(o);
  }
  langSelect.value = appLanguage();
  langSelect.addEventListener('change', () => {
    setAppLanguage(langSelect.value);
    void refresh();
  });
  const list = el('div');
  const total = el('div', { class: 'total' });
  const go = el('button', { class: 'go', type: 'button' }, 'Télécharger') as HTMLButtonElement;
  const progress = el('div', { class: 'progress' });
  progress.hidden = true;
  root.append(el('div', { class: 'lang' }, el('span', {}, 'Langue :'), langSelect), list, total, go, progress);

  const draw = () => {
    const choices = packChoices(langSelect.value, checked.english || installed.english, engineReady());
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
        el('span', { class: `size${done ? ' ok' : ''}` }, done ? 'Installé ✓' : `${Math.round(c.sizeMb)} Mo`));
    }));
    const wanted = choices.filter((c) => checked[c.id] && !installed[c.id]);
    const sum = wanted.reduce((n, c) => n + c.sizeMb, 0);
    total.textContent = wanted.length ? `À télécharger : ${Math.round(sum)} Mo (de préférence en Wi-Fi).` : 'Tout est installé.';
    go.disabled = wanted.length === 0 || downloads.running;
    go.textContent = downloads.running ? 'Téléchargement en cours…' : 'Télécharger';
  };

  const refresh = async () => {
    installed = await installedPacks(langSelect.value);
    draw();
  };

  go.addEventListener('click', () => {
    const withEnglish = checked.english || installed.english;
    const ids = packChoices(langSelect.value, withEnglish, engineReady())
      .map((c) => c.id).filter((id) => checked[id] && !installed[id]);
    if (!ids.length) return;
    markPacksAsked();
    downloads.start(ids, langSelect.value, withEnglish);
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
    const eta = p.running ? `${mb(p.loaded)} / ${mb(p.total)} · ${formatRemaining(p.remaining)}` : 'Terminé.';
    progress.replaceChildren(
      el('div', { class: 'bar' }, el('span', { style: `width:${pct.toFixed(1)}%` })),
      el('div', { class: 'eta' }, eta),
      ...p.tasks.map((t) => el('div', { class: `task${t.state === 'error' ? ' err' : ''}` },
        el('span', {}, titles[t.id] ?? t.id),
        el('span', {}, t.state === 'done' ? 'Installé ✓' : t.state === 'error' ? `Échec : ${t.error ?? ''}`
          : t.state === 'installing' ? 'Installation…' : t.total ? `${Math.min(100, Math.round((t.loaded / t.total) * 100))} %` : 'En attente…'))),
    );
    if (!p.running) void refresh();
    else draw();
  });
  void refresh();
  return root;
}
