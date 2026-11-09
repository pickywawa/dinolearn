import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ITEMS, itemTexture } from '../src/content/items';

// Une image manquante bloque l'écran de chargement : chaque image du vestiaire doit être générée
// par `npm run icons` (public/img/ n'est pas dans le dépôt).
describe('images du vestiaire', () => {
  it('chaque objet a son image', () => {
    for (const item of ITEMS) expect(existsSync(`public/img/${itemTexture(item.id)}.svg`), item.id).toBe(true);
  });
});
