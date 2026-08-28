/**
 * SRS-Lite (Simple Spaced Repetition Schedule)
 * Rules:
 * - Wrong / Streak 0: Review in 1 hour
 * - Streak 1: Review in 1 day (24 hours)
 * - Streak 2: Review in 3 days (72 hours)
 * - Streak 3: Review in 7 days (168 hours)
 * - Streak 4+: Review in 14 days (336 hours)
 */

export function calculateNextReviewDate(streak = 0, isCorrect = true) {
  const now = new Date();
  let hoursToAdd = 1;

  if (!isCorrect || streak === 0) {
    hoursToAdd = 1;
  } else if (streak === 1) {
    hoursToAdd = 24;
  } else if (streak === 2) {
    hoursToAdd = 72;
  } else if (streak === 3) {
    hoursToAdd = 168;
  } else {
    hoursToAdd = 336;
  }

  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();
}

/**
 * Filter words that are due for review.
 * A word is due if:
 * 1. It has been attempted at least once, AND
 * 2. `nextReview` is not set OR `new Date(nextReview) <= new Date()`
 */
export function getDueItems(allItems, masteryNamespaceData) {
  const now = new Date();
  return allItems.filter((item) => {
    const stats = masteryNamespaceData[item.id];
    if (!stats || !stats.attempts || stats.attempts === 0) return false;
    if (!stats.nextReview) return true;
    return new Date(stats.nextReview) <= now;
  });
}
