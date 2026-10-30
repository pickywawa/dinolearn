import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES, gameById, gamesForAge } from '../src/content/games';
import { COUNTRIES, setCountry } from '../src/content/countries';
import { LINES } from '../src/core/lines';
import { MemoryStore, Progress } from '../src/core/progress';
import { Series } from '../src/core/series';
import { mulberry32 } from '../src/domain/models';
import { SayTarget, canRecognize, grammarFor, judge, normalize, withoutArticle } from '../src/domain/speech';

const target: SayTarget = { lang: 'fr', accept: ['le chien'], others: ['le chat', 'la pomme de terre', 'la pomme'] };

describe('correction à voix haute', () => {
  it('la bonne réponse, avec ou sans article, même entourée d\'autres mots', () => {
    for (const text of ['chien', 'le chien', 'c\'est un chien', 'euh chien', 'chat chien', '[unk] chien']) {
      expect(judge({ text }, target), text).toEqual({ kind: 'correct' });
    }
  });

  it('une autre réponse nettement entendue est une erreur ; la plus longue est retenue', () => {
    expect(judge({ text: 'le chat' }, target)).toEqual({ kind: 'wrong', heard: 'chat' });
    expect(judge({ text: 'pomme de terre' }, target)).toEqual({ kind: 'wrong', heard: 'pomme de terre' });
  });

  it('un bruit, un silence ou une erreur peu sûre ne comptent pas', () => {
    expect(judge({ text: '' }, target).kind).toBe('unheard');
    expect(judge({ text: '[unk]' }, target).kind).toBe('unheard');
    expect(judge({ text: 'le' }, target).kind).toBe('unheard');
    expect(judge({ text: 'chat', words: [{ word: 'chat', conf: 0.4 }] }, target).kind).toBe('unheard');
    expect(judge({ text: 'chien', words: [{ word: 'chien', conf: 0.2 }] }, target).kind).toBe('unheard');
    expect(judge({ text: 'chien', words: [{ word: 'chien', conf: 0.5 }] }, target).kind).toBe('correct');
  });

  it('anglais, traits d\'union et apostrophes', () => {
    const en: SayTarget = { lang: 'en', accept: ['ice cream'], others: ['cake'] };
    expect(judge({ text: 'an ice cream' }, en).kind).toBe('correct');
    expect(judge({ text: 'the cake' }, en)).toEqual({ kind: 'wrong', heard: 'cake' });
    const hyphen: SayTarget = { lang: 'fr', accept: ['l\'arc-en-ciel'], others: ['les États-Unis'] };
    expect(judge({ text: 'arc en ciel' }, hyphen).kind).toBe('correct');
    expect(judge({ text: 'l\'arc-en-ciel' }, hyphen).kind).toBe('correct');
    expect(judge({ text: 'états unis' }, hyphen).kind).toBe('wrong');
    expect(normalize('L’Oiseau !')).toBe('l\'oiseau');
    expect(withoutArticle('l\'oiseau', 'fr')).toBe('oiseau');
  });

  it('grammaire : réponses, petits mots et [unk], sans les mots inconnus du modèle', () => {
    const grammar = grammarFor(target);
    expect(grammar).toContain('chien');
    expect(grammar).toContain('le chien');
    expect(grammar).toContain('pomme de terre');
    expect(grammar).toContain('c\'est');
    expect(grammar[grammar.length - 1]).toBe('[unk]');
    const vocab = new Set(['chien', 'le', 'chat', 'pomme']);
    expect(new Set(grammarFor(target, vocab))).toEqual(new Set(['chien', 'le chien', 'chat', 'le chat', 'pomme', 'le', '[unk]']));
    expect(canRecognize(target, vocab)).toBe(true);
    expect(canRecognize(target, new Set(['chat']))).toBe(false);
    expect(canRecognize(target)).toBe(true);
  });
});

const VOICE = GAMES.filter((g) => g.voice);

describe('jeux à voix haute', () => {
  it('douze jeux : « Comment ça s\'appelle ? » dès 3 ans, les autres dès 5 ans, avec leurs répliques', () => {
    expect(VOICE.map((g) => g.id)).toEqual(Array.from({ length: 12 }, (_, i) => `VO-${i + 1}`));
    expect(gamesForAge(3).filter((g) => g.voice).map((g) => g.id)).toEqual(['VO-1']);
    expect(gamesForAge(5).filter((g) => g.voice)).toHaveLength(12);
    expect(VOICE.filter((g) => g.voice === 'en').map((g) => g.id)).toEqual(['VO-2']);
    for (const g of VOICE) {
      for (const key of [g.introLine, g.homeLine, g.shortLine]) expect(LINES[key]?.length, key).toBeGreaterThan(0);
      expect(existsSync(`public/img/${g.icon}.svg`), g.icon).toBe(true);
    }
    for (const key of ['voice.tap_mic', 'voice.unheard', 'voice.wrong', 'voice.cards', 'voice.give_up', 'voice.loading',
      'voice.no_mic', 'home.voice', 'home.voice_choose']) expect(LINES[key]?.length, key).toBeGreaterThan(0);
  });

  it('chaque question : une réponse à dire, reconnue ; des cartes distinctes et des images qui existent', () => {
    setCountry('fr');
    for (const game of VOICE) {
      expect(game.questions.length, game.id).toBeGreaterThanOrEqual(game.id === 'VO-11' ? 9 : 15);
      for (const ref of game.questions) {
        for (const seed of [1, 2]) {
          for (const level of [ref.level, 16]) {
            const q = game.build(ref, level, mulberry32(seed));
            const say = q.say!;
            expect(say.lang, ref.id).toBe(game.voice);
            expect(say.accept.length, ref.id).toBeGreaterThan(0);
            expect(q.prompt[0].text.length, ref.id).toBeGreaterThan(0);
            // Dire la réponse : bravo. Dire une autre réponse : erreur.
            expect(judge({ text: say.accept[0] }, say).kind, ref.id).toBe('correct');
            const accepted = new Set(say.accept.map((a) => withoutArticle(a, say.lang)));
            const wrong = say.others.find((o) => !accepted.has(withoutArticle(o, say.lang)) && withoutArticle(o, say.lang));
            expect(wrong, `${ref.id} : pas de mauvaise réponse à reconnaître`).toBeDefined();
            expect(judge({ text: wrong! }, say).kind, `${ref.id} ${wrong}`).toBe('wrong');
            // Les cartes, pour répondre au doigt si le micro n'entend pas.
            const all = [q.answer, ...q.distractors];
            expect(q.distractors.length, ref.id).toBeGreaterThanOrEqual(2);
            expect(new Set(all.map((c) => c.id)).size, ref.id).toBe(all.length);
            for (const c of all) if (c.image) expect(existsSync(`public/img/${c.image}.svg`), `${ref.id} ${c.image}`).toBe(true);
            if (q.show?.kind === 'image') expect(existsSync(`public/img/${q.show.image}.svg`)).toBe(true);
          }
        }
      }
    }
  });

  it('devinettes à thème : pas de carte qui répondrait aussi à la devinette', () => {
    const q = gameById('VO-7').build({ id: 'VO-7:moon', level: 4 }, 4, mulberry32(1));
    expect(q.answer.image).toBe('moon');
    const images = q.distractors.map((c) => c.image);
    for (const no of ['star', 'or-full-moon', 'or-crescent-moon']) expect(images).not.toContain(no);
    const seasons = gameById('VO-8').build({ id: 'VO-8:four', level: 7 }, 7, mulberry32(1));
    expect(seasons.answer).toEqual({ id: 'n4', number: 4 });
    expect(seasons.distractors.every((c) => c.number !== undefined)).toBe(true);
    expect(judge({ text: 'quatre' }, seasons.say!).kind).toBe('correct');
    // Les métiers au féminin aussi.
    const job = gameById('VO-5').build({ id: 'VO-5:firefighter', level: 4 }, 4, mulberry32(1));
    expect(judge({ text: 'une pompière' }, job.say!).kind).toBe('correct');
  });

  it('« Comment ça s\'appelle ? » : l\'image est cachée quand on passe aux cartes, et le dino fait répéter', () => {
    const q = gameById('VO-1').build({ id: 'VO-1:dog', level: 1 }, 1, mulberry32(3));
    expect(q.show).toEqual({ kind: 'image', image: 'dog' });
    expect(q.fallback?.hideShow).toBe(true);
    expect(q.repeatAfterMe?.[0].text).toContain('le chien');
    const en = gameById('VO-2').build({ id: 'VO-2:dog', level: 1 }, 1, mulberry32(3));
    expect(en.say).toMatchObject({ lang: 'en', accept: ['dog'] });
    expect(en.repeatAfterMe?.[1]).toMatchObject({ text: 'dog', lang: 'en' });
  });

  it('« Mon pays » à voix haute, pour chaque pays', () => {
    const game = gameById('VO-11');
    for (const country of COUNTRIES) {
      setCountry(country.code);
      expect(game.questions.length, country.code).toBeGreaterThanOrEqual(7);
      for (const ref of game.questions) {
        const q = game.build(ref, ref.level, mulberry32(1));
        for (const answer of q.say!.accept) expect(judge({ text: answer }, q.say!).kind, `${ref.id} ${answer}`).toBe('correct');
      }
    }
    setCountry('fr');
    const capital = game.build({ id: 'VO-11:fr:capital', level: 8 }, 8, mulberry32(1));
    expect(judge({ text: 'paris' }, capital.say!).kind).toBe('correct');
    expect(judge({ text: 'lyon' }, capital.say!).kind).toBe('wrong');
    setCountry('other');
    expect(game.questions).toHaveLength(0);
    setCountry('fr');
  });

  it('série à voix haute : une erreur dite compte, la bonne réponse est enregistrée', () => {
    const progress = new Progress(new MemoryStore());
    progress.age = 5;
    const series = new Series(gameById('VO-5'), progress, mulberry32(5));
    expect(series.current.say).toBeDefined();
    expect(series.tap({ id: 'miss-0' }).kind).toBe('wrong');
    const outcome = series.tap(series.current.answer);
    expect(outcome).toMatchObject({ kind: 'correct', firstTry: false });
    expect(progress.answers({ gameId: 'VO-5' })).toHaveLength(1);
  });

  // Après `npm run voice-packs` : les réponses que les modèles ne connaissent pas (ces questions se jouent aux cartes).
  for (const lang of ['fr', 'en'] as const) {
    const file = `public/voice/${lang}.words.txt`;
    it.runIf(existsSync(file))(`vocabulaire du pack ${lang} : presque toutes les réponses sont reconnaissables`, () => {
      const vocab = new Set(readFileSync(file, 'utf8').split('\n').filter(Boolean));
      setCountry('fr');
      const missing: string[] = [];
      let total = 0;
      for (const game of VOICE.filter((g) => g.voice === lang)) {
        for (const ref of game.questions) {
          total++;
          const say = game.build(ref, ref.level, mulberry32(1)).say!;
          if (!canRecognize(say, vocab)) missing.push(`${ref.id} (${say.accept[0]})`);
        }
      }
      if (missing.length) console.warn(`Réponses inconnues du pack ${lang} :\n${missing.join('\n')}`);
      expect(missing.length / total).toBeLessThan(0.1);
    });
  }
});
