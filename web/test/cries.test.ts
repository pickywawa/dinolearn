import { describe, expect, it } from 'vitest';
import { RECORDED_ANIMALS, splitCries } from '../src/domain/cries';
import { RIDDLES } from '../src/content/riddles';
import { existsSync } from 'node:fs';

describe('cris d\'animaux enregistrés', () => {
  it('le cri écrit est remplacé par l\'enregistrement, le reste de la phrase est gardé', () => {
    expect(splitCries('Qui fait coin coin ?')).toEqual([{ text: 'Qui fait' }, { animal: 'duck' }]);
    expect(splitCries('Qui fait hiiii, et galope ?')).toEqual([{ text: 'Qui fait' }, { animal: 'horse' }, { text: ', et galope ?' }]);
    expect(splitCries('Qui fait hi-han ?')).toEqual([{ text: 'Qui fait' }, { animal: 'donkey' }]);
    expect(splitCries('Qui fait bêêê ?')).toEqual([{ text: 'Qui fait' }, { animal: 'sheep' }]);
    // Pas d'enregistrement : la voix dit le cri.
    expect(splitCries('Qui fait meuh ?')).toEqual([{ text: 'Qui fait meuh ?' }]);
    // « coin » dans un mot, ou « hou » seul : pas un cri.
    expect(splitCries('Le coin de la table. Hou là là !')).toEqual([{ text: 'Le coin de la table. Hou là là !' }]);
  });

  it('chaque animal enregistré a son fichier, et ses devinettes « Qui fait… ? » utilisent l\'enregistrement', () => {
    for (const animal of RECORDED_ANIMALS) expect(existsSync(`public/sfx/animals/${animal}.mp3`), animal).toBe(true);
    const ids = new Map([['duck', 'duck'], ['sheep', 'sheep'], ['frog', 'frog'], ['horse', 'horse'], ['owl', 'owl'], ['mouse', 'mouse'], ['rooster', 'rooster'], ['donkey', 'donkey']]);
    for (const [id, , text] of RIDDLES) {
      const animal = ids.get(id);
      if (!animal || !text.startsWith('Qui fait')) continue;
      expect(splitCries(text).some((p) => 'animal' in p && p.animal === animal), text).toBe(true);
    }
  });
});
