import { KOTOBA_CATEGORIES } from './categories.js';
import { batch1_basics } from './words/batch1_basics.js';
import { batch2_places_time } from './words/batch2_places_time.js';
import { batch3_human } from './words/batch3_human.js';
import { batch4_nature_mind } from './words/batch4_nature_mind.js';
import { batch5_grammar_core } from './words/batch5_grammar_core.js';

// Complete 1000 Vocabulary Dataset
export const ALL_KOTOBA = [
  ...batch1_basics,
  ...batch2_places_time,
  ...batch3_human,
  ...batch4_nature_mind,
  ...batch5_grammar_core,
];

// Map lookup by ID for O(1) instantaneous access
const kotobaMap = new Map();
ALL_KOTOBA.forEach((k) => kotobaMap.set(k.id, k));

export function getKotobaById(id) {
  return kotobaMap.get(id) || null;
}

export function getKotobaCategories() {
  return KOTOBA_CATEGORIES;
}

export function filterKotoba({ category, level, search, isFavorite, favoritesMap, masteryMap, masteryFilter }) {
  let list = ALL_KOTOBA;

  if (category && category !== 'all') {
    list = list.filter((item) => item.category === category);
  }

  if (level && level !== 'all') {
    list = list.filter((item) => item.level === level);
  }

  if (isFavorite && favoritesMap) {
    list = list.filter((item) => !!favoritesMap[item.id]);
  }

  if (masteryFilter && masteryFilter !== 'all' && masteryMap) {
    list = list.filter((item) => {
      const stats = masteryMap[item.id];
      const lvl = stats?.mastery || 'unlearned';
      return lvl === masteryFilter;
    });
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((item) =>
      item.word.toLowerCase().includes(q) ||
      item.reading.toLowerCase().includes(q) ||
      item.romaji.toLowerCase().includes(q) ||
      item.meaning_id.toLowerCase().includes(q)
    );
  }

  return list;
}

export default ALL_KOTOBA;
