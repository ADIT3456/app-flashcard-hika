import * as FileSystem from 'expo-file-system';

const STORAGE_FILE = `${FileSystem.documentDirectory}hika_mastery_v2.json`;
let memoryStore = null;

export const MASTERY_LEVELS = {
  unlearned: 'unlearned',
  learning: 'learning',
  mastered: 'mastered',
};

export const MASTERY_CONFIG = {
  unlearned: { label: 'Belum', color: '#94a3b8', bg: '#f1f5f9', badge: '⚪' },
  learning: { label: 'Sedang Belajar', color: '#d97706', bg: '#fef3c7', badge: '🟡' },
  mastered: { label: 'Mahir', color: '#16a34a', bg: '#dcfce7', badge: '🟢' },
};

/**
 * Generic Mastery Calculation:
 * - 'unlearned': attempts === 0
 * - 'mastered': attempts >= 3 && streak >= 3 (or accuracy >= 80% with min 3 attempts)
 * - 'learning': anything else with attempts > 0
 */
export function calculateMastery(itemStats) {
  if (!itemStats || !itemStats.attempts || itemStats.attempts === 0) {
    return MASTERY_LEVELS.unlearned;
  }
  const { attempts, streak, correct } = itemStats;
  const accuracy = correct / attempts;
  if (attempts >= 3 && (streak >= 3 || accuracy >= 0.8)) {
    return MASTERY_LEVELS.mastered;
  }
  return MASTERY_LEVELS.learning;
}

/**
 * Load all namespaces from storage.
 */
export async function loadMasteryStore() {
  if (memoryStore !== null) {
    return memoryStore;
  }
  try {
    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(STORAGE_FILE);
      memoryStore = JSON.parse(content) || {};
    } else {
      memoryStore = {};
    }
  } catch (err) {
    console.warn('Failed to load mastery store:', err);
    memoryStore = {};
  }
  return memoryStore;
}

/**
 * Save current memoryStore to disk.
 */
async function persistStore() {
  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(memoryStore));
  } catch (err) {
    console.warn('Failed to persist mastery store:', err);
  }
}

/**
 * Get data for a specific namespace, e.g. 'kana', 'kotoba', 'jlpt:n5', 'jlpt:n4', 'favorites'
 */
export async function getNamespaceData(namespace) {
  const store = await loadMasteryStore();
  return store[namespace] || {};
}

/**
 * Record answer for a single or batch of items in a specific namespace.
 * @param {string} namespace e.g. 'kana', 'kotoba', 'jlpt:n5'
 * @param {Array<{ id: string, isCorrect: boolean }>} records
 */
export async function recordMasteryRecords(namespace, records) {
  const store = await loadMasteryStore();
  if (!store[namespace]) {
    store[namespace] = {};
  }

  const now = new Date().toISOString();

  records.forEach(({ id, isCorrect }) => {
    const prev = store[namespace][id] || { attempts: 0, correct: 0, streak: 0, wrongCount: 0 };
    const attempts = prev.attempts + 1;
    const correct = isCorrect ? prev.correct + 1 : prev.correct;
    const wrongCount = !isCorrect ? (prev.wrongCount || 0) + 1 : (prev.wrongCount || 0);
    const streak = isCorrect ? (prev.streak || 0) + 1 : 0;

    const stats = {
      attempts,
      correct,
      wrongCount,
      streak,
      lastReviewed: now,
    };
    stats.mastery = calculateMastery(stats);
    store[namespace][id] = stats;
  });

  memoryStore = { ...store };
  await persistStore();
  return memoryStore[namespace];
}

/**
 * Toggle favorite item in 'favorites:kotoba'
 */
export async function toggleFavorite(itemId) {
  const store = await loadMasteryStore();
  if (!store.favorites) store.favorites = {};
  store.favorites[itemId] = !store.favorites[itemId];
  if (!store.favorites[itemId]) delete store.favorites[itemId];
  memoryStore = { ...store };
  await persistStore();
  return !!store.favorites[itemId];
}

export async function getFavoritesList() {
  const store = await loadMasteryStore();
  return store.favorites || {};
}

// Backward compatibility alias for kana
export const getMasteryLevel = (stats) => calculateMastery(stats);
export const loadProgress = () => getNamespaceData('kana');
export const recordQuizAnswers = (answers) =>
  recordMasteryRecords('kana', answers.map(a => ({ id: a.key, isCorrect: a.isCorrect })));
export async function resetProgress(namespace = null) {
  const store = await loadMasteryStore();
  if (namespace) {
    delete store[namespace];
  } else {
    memoryStore = {};
  }
  await persistStore();
  return memoryStore;
}
