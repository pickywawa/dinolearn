import { describe, expect, it } from 'vitest';
import { fixPhonemes, idsFor, respell } from '../src/domain/pronunciation';

describe('prononciation du français', () => {
  it('pas de voyelle longue (accent circonflexe)', () => {
    // « bientôt » : b j ɛ ̃ t ˈ o ː
    expect(fixPhonemes('fr', ['b', 'j', 'ɛ', '̃', 't', 'ˈ', 'o', 'ː'])).toEqual(['b', 'j', 'ɛ', '̃', 't', 'ˈ', 'o']);
  });
  it('« kiwi » se dit k-i-w-i', () => {
    expect(fixPhonemes('fr', ['k', 'j', 'w', 'ˈ', 'i'])).toEqual(['k', 'i', 'w', 'ˈ', 'i']);
  });
  it('ne touche pas aux autres langues ni aux autres mots', () => {
    const p = ['ʃ', 'j', 'ˈ', 'ɛ', '̃'];
    expect(fixPhonemes('fr', p)).toEqual(p);
    expect(fixPhonemes('en-gb', ['ɡ', 'ʊ', 'd', 'ː'])).toEqual(['ɡ', 'ʊ', 'd', 'ː']);
  });
  it('réécrit les mots lus à l\'anglaise, au singulier comme au pluriel', () => {
    expect(respell('fr', 'Un mammouth et des mammouths')).toBe('Un mamoute et des mamoutes');
    expect(respell('fr', 'mon tee-shirt, ma pizza')).toBe('mon ti-cheurte, ma pidza');
    expect(respell('fr', 'Le skateboard')).toBe('Le skèïtbord');
    expect(respell('fr', 'pizzaiolo')).toBe('pizzaiolo');
    expect(respell('en-gb', 'mammouth')).toBe('mammouth');
  });
  it('compose les lettres accentuées en un seul bloc', () => {
    expect(respell('fr', 'forêt')).toBe('forêt');
  });
  it('reconstruit les numéros de sons comme la voix les attend', () => {
    const map = { '^': [1], _: [0], $: [2], a: [10], b: [11] };
    expect(idsFor(['a', 'b'], map)).toEqual([1, 0, 10, 0, 11, 0, 2]);
    expect(idsFor(['a', 'z'], map)).toBeUndefined();
  });
});
