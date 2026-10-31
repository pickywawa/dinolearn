import { PrintRecord, Progress } from '../core/progress';
import { Profiles } from '../core/profiles';
import { baseLevel } from '../domain/difficulty';
import { mulberry32 } from '../domain/models';
import { weakLettersFrom } from '../domain/printables';
import { printKind } from './catalog';
import { PrintContext, PrintSheet } from './types';

/** Tout ce qu'une fiche doit savoir de l'enfant, lu dans sa progression. */
export function contextFor(p: Progress, profiles: Profiles, record: PrintRecord, lineArt = false): PrintContext {
  return {
    name: p.name,
    age: p.age,
    color: p.color,
    worn: p.collection.worn,
    level: p.dino.level,
    family: profiles.ids.map((id) => profiles.progressOf(id)).filter((c) => c.hatched).map((c) => ({ name: c.name, color: c.color })),
    gameLevel: (gameId) => p.gameLevel(gameId) ?? baseLevel(p.dino.level, p.age),
    weakLetters: weakLettersFrom(p.reviewList(200).map((r) => r.questionId)),
    at: record.at,
    lineArt,
    param: record.param,
  };
}

/** Fabrique la fiche (toujours la même pour la même graine). */
export function buildSheet(p: Progress, profiles: Profiles, record: PrintRecord, lineArt = false): PrintSheet | undefined {
  const kind = printKind(record.kind);
  if (!kind) return undefined;
  return kind.build(contextFor(p, profiles, record, lineArt), mulberry32(record.seed));
}
