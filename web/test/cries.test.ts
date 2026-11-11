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
    // Sans enregistrement de cet animal : la voix dit le cri.
    expect(splitCries('Qui fait meuh ?', new Set(['duck']))).toEqual([{ text: 'Qui fait meuh ?' }]);
    expect(splitCries('Qui fait sss, et n\'a pas de pattes ?')).toEqual([{ text: 'Qui fait' }, { animal: 'snake' }, { text: ', et n\'a pas de pattes ?' }]);
    // « coin » dans un mot, ou « hou » seul : pas un cri.
    expect(splitCries('Le coin de la table. Hou là là !')).toEqual([{ text: 'Le coin de la table. Hou là là !' }]);
  });

  it('chaque animal enregistré a son fichier, et ses devinettes « Qui fait… ? » utilisent l\'enregistrement', () => {
    for (const animal of RECORDED_ANIMALS) expect(existsSync(`public/sfx/animals/${animal}.mp3`), animal).toBe(true);
    const ids = new Map([...RECORDED_ANIMALS].map((a) => [a, a]));
    for (const [id, , text] of RIDDLES) {
      const animal = ids.get(id);
      if (!animal || !text.startsWith('Qui fait')) continue;
      expect(splitCries(text).some((p) => 'animal' in p && p.animal === animal), text).toBe(true);
    }
  });
});
