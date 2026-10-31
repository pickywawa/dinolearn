import { app } from '../core/app';
import { PrintRecord, Progress } from '../core/progress';
import { printKind } from '../print/catalog';
import { buildSheet } from '../print/context';
import { PrintSheet } from '../print/types';

/**
 * Aperçu d'une fiche avant impression : les pages A4, les conseils pour les
 * parents (ce que la fiche fait travailler, comment en parler, comment
 * prolonger, la solution), et les boutons Imprimer, Version à colorier,
 * Autre version. À l'impression, seules les pages sortent, à la taille A4.
 */

const CSS = `
.print-view { position: fixed; inset: 0; z-index: 1200; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: #e5e7eb; color: #1f2937; font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.print-view * { box-sizing: border-box; }
.print-view .toolbar { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 16px; background: #2d3354; color: #fff; }
.print-view .toolbar h1 { flex: 1 1 100%; margin: 0; font-size: 18px; }
.print-view button { font: inherit; border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer; min-height: 44px;
  background: #e5e7eb; color: #1f2937; }
.print-view button.primary { background: #43b649; color: #fff; font-weight: 600; }
.print-view button.on { background: #ffd23f; color: #1f2937; }
.print-view button.danger { background: #fee2e2; color: #b91c1c; }
.print-view .body { max-width: 860px; margin: 0 auto; padding: 16px 16px 48px; }
.print-view .advice { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.print-view .advice h2 { margin: 0 0 8px; font-size: 17px; }
.print-view .advice h3 { margin: 12px 0 4px; font-size: 15px; color: #4b5563; }
.print-view .advice p, .print-view .advice ul { margin: 0; }
.print-view .advice ul { padding-left: 20px; }
.print-view .advice details { margin-top: 12px; }
.print-view .advice summary { cursor: pointer; color: #2563eb; }
.print-view .advice .solution svg { width: 100%; max-width: 260px; display: block; margin-top: 8px; }
.print-view .sheet { background: #fff; margin: 0 auto 16px; width: 100%; max-width: 640px; aspect-ratio: 210 / 297;
  box-shadow: 0 2px 10px rgba(0,0,0,.15); }
.print-view .sheet svg { display: block; width: 100%; height: 100%; }
.print-view .hint { color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 12px; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
  body > *:not(.print-view) { display: none !important; }
  .print-view { position: static; overflow: visible; background: #fff; }
  .print-view .toolbar, .print-view .advice, .print-view .hint { display: none !important; }
  .print-view .body { max-width: none; margin: 0; padding: 0; }
  .print-view .sheet { width: 210mm; height: 297mm; max-width: none; margin: 0; box-shadow: none; aspect-ratio: auto;
    break-after: page; page-break-after: always; }
  .print-view .sheet:last-child { break-after: auto; page-break-after: auto; }
  .print-view .sheet svg { width: 210mm; height: 297mm; }
}
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

/** Insère un SVG (chaîne) dans un élément. */
function svgNode(svg: string): Element {
  const holder = document.createElement('div');
  holder.innerHTML = svg;
  return holder.firstElementChild ?? holder;
}

/** Attend que les images des pages soient chargées (sinon elles manquent à l'impression). */
function preload(svgs: string[], timeoutMs = 4000): Promise<void> {
  const hrefs = new Set<string>();
  for (const svg of svgs) for (const m of svg.matchAll(/href="([^"]+\.svg)"/g)) hrefs.add(m[1]);
  const loads = [...hrefs].map((src) => new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  }));
  return Promise.race([Promise.all(loads).then(() => undefined), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

/** Miniature de la première page (liste de l'espace parents). */
export function thumbnail(p: Progress, record: PrintRecord): Element | undefined {
  const sheet = buildSheet(p, app.profiles, record);
  return sheet ? svgNode(sheet.pages[0]) : undefined;
}

/** Ouvre l'aperçu ; `onClose` rafraîchit la liste (fiche imprimée, supprimée, changée). */
export function openPrintView(p: Progress, record: PrintRecord, onClose: () => void) {
  if (!document.getElementById('print-view-css')) document.head.append(el('style', { id: 'print-view-css' }, CSS));
  const kind = printKind(record.kind);
  if (!kind) return;
  let lineArt = false;
  let current = record;
  let sheet: PrintSheet | undefined;
  const root = el('div', { class: 'print-view', role: 'dialog', 'aria-label': 'Aperçu avant impression' });
  const close = () => {
    root.remove();
    onClose();
  };
  const back = el('button', {}, '← Retour');
  back.addEventListener('click', close);
  const print = el('button', { class: 'primary' }, '🖨 Imprimer');
  print.addEventListener('click', async () => {
    if (!sheet) return;
    print.textContent = 'Préparation…';
    await preload(sheet.pages);
    print.textContent = '🖨 Imprimer';
    p.markPrinted(current.id);
    window.print();
  });
  const color = el('button', {}, 'Version à colorier');
  color.addEventListener('click', () => {
    lineArt = !lineArt;
    color.className = lineArt ? 'on' : '';
    render();
  });
  const renew = el('button', {}, 'Autre version');
  renew.addEventListener('click', () => {
    p.renewPrintable(current.id, Math.floor(Math.random() * 2 ** 31));
    current = p.printables.find((r) => r.id === current.id) ?? current;
    render();
  });
  const remove = el('button', { class: 'danger' }, 'Supprimer');
  remove.addEventListener('click', () => {
    if (!confirm('Supprimer cette fiche ?')) return;
    p.removePrintable(current.id);
    close();
  });
  const title = el('h1');
  const toolbar = el('div', { class: 'toolbar' }, title, back, print);
  if (kind.lineArtOption) toolbar.append(color);
  if (kind.envelope) toolbar.append(renew);
  toolbar.append(remove);
  const body = el('div', { class: 'body' });
  root.append(toolbar, body);
  document.body.append(root);

  function render() {
    sheet = buildSheet(p, app.profiles, current, lineArt);
    if (!sheet) return;
    title.textContent = `${sheet.title}${p.name ? ` — pour ${p.name}` : ''}`;
    const a = sheet.advice;
    const advice = el('section', { class: 'advice' },
      el('h2', {}, 'Conseils pour les parents'),
      el('h3', {}, 'Ce que ça fait travailler'),
      el('ul', {}, ...a.skills.map((s) => el('li', {}, s))),
      el('h3', {}, 'Pendant l\'activité'),
      el('p', {}, a.talk),
      el('h3', {}, 'Pour aller plus loin'),
      el('p', {}, a.further),
    );
    if (a.material) advice.append(el('h3', {}, 'Matériel'), el('p', {}, a.material));
    if (a.solution || a.solutionSvg) {
      const details = el('details', { class: 'solution' }, el('summary', {}, 'Voir la solution'));
      if (a.solution) details.append(el('p', {}, a.solution));
      if (a.solutionSvg) details.append(svgNode(a.solutionSvg));
      advice.append(details);
    }
    const count = sheet.pages.length;
    body.replaceChildren(
      advice,
      el('p', { class: 'hint' }, `${count} page${count > 1 ? 's' : ''} A4 · format portrait · `
        + 'dans la fenêtre d\'impression, choisissez « Taille réelle » (ou 100 %) et désactivez les en-têtes.'),
      ...sheet.pages.map((svg) => el('div', { class: 'sheet' }, svgNode(svg))),
    );
  }
  render();
}
