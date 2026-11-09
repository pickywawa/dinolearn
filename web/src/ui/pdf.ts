import { jsPDF } from 'jspdf';
import andika400 from '@fontsource/andika/files/andika-latin-400-normal.woff2?url';
import andika700 from '@fontsource/andika/files/andika-latin-700-normal.woff2?url';

/**
 * Fiches en PDF (appli Android / iOS, où l'impression du navigateur n'existe
 * pas) : chaque page A4 (SVG) est dessinée à 150 ppp puis rangée dans un PDF.
 * Une image SVG ne voit ni les autres images ni les polices de la page : on
 * les y intègre d'abord (images en data URI, police Andika en @font-face).
 */

const DPI = 150;
const PAGE_W = Math.round((210 / 25.4) * DPI);
const PAGE_H = Math.round((297 / 25.4) * DPI);

const toBase64 = (buf: ArrayBuffer) => {
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

const dataUri = async (url: string, type: string) => `data:${type};base64,${toBase64(await (await fetch(url)).arrayBuffer())}`;

let fontCss: Promise<string> | undefined;
const fonts = () => (fontCss ??= Promise.all([dataUri(andika400, 'font/woff2'), dataUri(andika700, 'font/woff2')]).then(([w4, w7]) =>
  `@font-face{font-family:Andika;font-weight:400;src:url(${w4}) format('woff2')}`
  + `@font-face{font-family:Andika;font-weight:700;src:url(${w7}) format('woff2')}`));

/** Page autonome : images et police intégrées, taille fixe. */
async function standalone(svg: string, images: Map<string, Promise<string>>): Promise<string> {
  const hrefs = [...new Set([...svg.matchAll(/href="([^"#][^"]*)"/g)].map((m) => m[1]))];
  for (const h of hrefs) if (!images.has(h)) images.set(h, dataUri(new URL(h, document.baseURI).href, 'image/svg+xml').catch(() => h));
  let out = svg;
  for (const h of hrefs) out = out.split(`href="${h}"`).join(`href="${await images.get(h)!}"`);
  const css = await fonts();
  return out.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    const sized = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${sized} width="${PAGE_W}" height="${PAGE_H}"><style>${css}</style>`;
  });
}

function draw(svg: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = PAGE_W;
      canvas.height = PAGE_H;
      const g = canvas.getContext('2d')!;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, PAGE_W, PAGE_H);
      g.drawImage(img, 0, 0, PAGE_W, PAGE_H);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Page illisible')); };
    img.src = url;
  });
}

/** Le PDF (A4 portrait), en base64. */
export async function sheetPdf(pages: string[]): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const images = new Map<string, Promise<string>>();
  for (let i = 0; i < pages.length; i++) {
    const canvas = await draw(await standalone(pages[i], images));
    if (i > 0) doc.addPage('a4', 'portrait');
    doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297);
  }
  return doc.output('datauristring').split(',')[1];
}
