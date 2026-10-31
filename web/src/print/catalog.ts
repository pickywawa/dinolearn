import { COLORING, DIFFERENCES, MAGIC } from './coloring';
import { CROWN, FINGER, MASK, PUPPET, PUZZLE } from './cutouts';
import { DIPLOMA, DOMINOES, GOOSE, LOTO, MEMORY } from './games';
import { DOTS, MAZE } from './puzzles';
import { WRITING } from './writing';
import { PrintKind } from './types';

/** Toutes les fiches à imprimer. */
export const PRINT_KINDS: PrintKind[] = [
  COLORING, MAGIC, MAZE, DOTS, DIFFERENCES, WRITING, MASK, PUZZLE, PUPPET, FINGER, CROWN, GOOSE, MEMORY, LOTO, DOMINOES, DIPLOMA,
];
export const printKind = (id: string) => PRINT_KINDS.find((k) => k.id === id);
