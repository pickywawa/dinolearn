/**
 * Catégories de l'écran « Missions » : l'enfant choisit d'abord une catégorie (la langue
 * apprise en plus, les maths, sa langue, la logique, le monde), puis un jeu. Les jeux à voix
 * haute sont rangés avec les autres jeux de leur matière.
 */
import type { GameDef } from './games';
import { langInfo } from '../domain/langs';
import { lang, second, secondFlag, t } from '../i18n';

export type MissionCategory = 'second' | 'math' | 'primary' | 'logic' | 'world';

/** Ordre d'affichage. */
export const MISSION_CATEGORIES: MissionCategory[] = ['second', 'math', 'primary', 'logic', 'world'];

/** Jeux de nombres (rangés à part de la logique). */
const MATH = new Set(['LO-2', 'LO-4', 'LO-5', 'LO-6', 'LO-8', 'LO-9', 'LO-11', 'LO-14', 'VO-13']);

export function missionCategoryOf(game: Pick<GameDef, 'id' | 'category'>): MissionCategory {
  if (MATH.has(game.id)) return 'math';
  switch (game.category) {
    case 'foreign_language': return 'second';
    case 'french':
    case 'writing': return 'primary';
    case 'world': return 'world';
    default: return 'logic';
  }
}

/** Noms français des langues apprises en plus (les autres langues ont `lang.<code>` dans leur catalogue). */
const FR_LANG: Record<string, string> = { en: 'Anglais', es: 'Espagnol', fr: 'Français' };

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** Nom de la catégorie, dans la langue de l'application (« Anglais », « Maths », « Français »…). */
export function missionCategoryName(category: MissionCategory): string {
  switch (category) {
    case 'second': return capitalize(t(`lang.${second()}`, {}, FR_LANG[second()] ?? second()));
    case 'primary': return capitalize(langInfo(lang()).name);
    case 'math': return t('ui.cat.math', {}, 'Maths');
    case 'logic': return t('ui.cat.logic', {}, 'Logique');
    case 'world': return t('ui.cat.world', {}, 'Le monde');
  }
}

/** Image de la tuile de la catégorie. */
export function missionCategoryIcon(category: MissionCategory): string {
  switch (category) {
    case 'second': return secondFlag();
    case 'primary': return 'letters';
    case 'math': return 'calc';
    case 'logic': return 'coding';
    case 'world': return 'ui-globe';
  }
}
