import { describe, expect, it } from 'vitest';
import { REVIEW, emptyReview, reviewDue, reviewUrl } from '../src/domain/review';

const DAY = 86_400_000;
const played = (over = {}) => ({ ...emptyReview(), playMs: REVIEW.afterMs, ...over });

describe('invitation à donner un avis', () => {
  it('pas avant assez de temps de jeu', () => {
    expect(reviewDue(emptyReview())).toBe(false);
    expect(reviewDue(played({ playMs: REVIEW.afterMs - 1 }))).toBe(false);
  });
  it('proposée la première fois quand le temps de jeu est atteint', () => {
    expect(reviewDue(played())).toBe(true);
  });
  it('revient après le délai, pas avant', () => {
    const now = 1_000 * DAY;
    const s = played({ asked: 1, lastAsked: now - (REVIEW.everyDays - 1) * DAY });
    expect(reviewDue(s, now)).toBe(false);
    expect(reviewDue({ ...s, lastAsked: now - REVIEW.everyDays * DAY }, now)).toBe(true);
  });
  it('ne revient plus après un avis ou un refus, ni après le maximum', () => {
    const old = { asked: 1, lastAsked: 0 };
    const now = 1_000 * DAY;
    expect(reviewDue(played({ ...old, done: true }), now)).toBe(false);
    expect(reviewDue(played({ ...old, muted: true }), now)).toBe(false);
    expect(reviewDue(played({ asked: REVIEW.maxAsks, lastAsked: 0 }), now)).toBe(false);
  });
  it('une page d\'avis sur iOS et Android, aucune sur le site', () => {
    expect(reviewUrl('ios')).toContain('action=write-review');
    expect(reviewUrl('android')).toContain('id=fr.dinolearn.app');
    expect(reviewUrl('web')).toBeUndefined();
  });
});
