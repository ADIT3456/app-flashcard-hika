// db/index.js
// Modul Database SQLite Lokal Utama untuk Hika Flashcard

import * as SQLite from 'expo-sqlite';
import { useEffect, useState, useCallback } from 'react';
import { CURRENT_SCHEMA_VERSION, CREATE_TABLES_SQL } from './schema';
import { HIRAGANA_DATA, KATAKANA_DATA } from './seeds/kanaSeed';
import { MINNA_CHAPTERS } from './seeds/minnaSeed';
import { JLPT_STARTER_QUESTIONS } from './seeds/jlptSeed';

let dbInstance = null;
let initPromise = null;

/**
 * Mendapatkan koneksi singleton ke SQLite Database
 */
export async function getDatabase() {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('hika.db');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      dbInstance = db;
      return db;
    })();
  }
  return initPromise;
}

/**
 * Migration runner & seeder saat aplikasi pertama kali dibuka
 */
export async function initDatabase() {
  const db = await getDatabase();

  // 1. Eksekusi DDL tabel
  await db.execAsync(CREATE_TABLES_SQL);

  // 2. Cek karakter kana
  const charCount = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM characters');
  if (!charCount || charCount.cnt === 0) {
    await seedKanaData(db);
  }

  // 3. Cek kurikulum Minna (50 bab)
  const vocabCount = await db.getFirstAsync("SELECT COUNT(*) as cnt FROM content_units WHERE module = 'vocab'");
  if (!vocabCount || vocabCount.cnt === 0) {
    await seedMinnaVocabData(db);
  }

  // 4. Cek bank soal JLPT (N5, N4, N3)
  const jlptCount = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM jlpt_questions');
  if (!jlptCount || jlptCount.cnt === 0) {
    await seedJLPTData(db);
  }

  // 5. Update versi skema
  await db.runAsync(
    `INSERT INTO app_meta (key, value) VALUES ('schema_version', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [String(CURRENT_SCHEMA_VERSION)]
  );

  return db;
}

/**
 * Seed 46 Hiragana & 46 Katakana beserta contoh katanya ke SQLite
 */
async function seedKanaData(db) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    // Seed Hiragana
    for (const h of HIRAGANA_DATA) {
      const res = await txn.runAsync(
        `INSERT INTO characters (char, romaji, type, group_name, svg_ref, sort_order)
         VALUES (?, ?, 'hiragana', ?, ?, ?)`,
        [h.char, h.romaji, h.group_name, `h_${h.sort_order}`, h.sort_order]
      );
      const charId = res.lastInsertRowId;
      if (h.examples && h.examples.length > 0) {
        for (const ex of h.examples) {
          await txn.runAsync(
            `INSERT INTO word_examples (character_id, word, romaji, meaning, audio_hint)
             VALUES (?, ?, ?, ?, ?)`,
            [charId, ex.word, ex.romaji, ex.meaning, ex.word]
          );
        }
      }
    }

    // Seed Katakana
    for (const k of KATAKANA_DATA) {
      const res = await txn.runAsync(
        `INSERT INTO characters (char, romaji, type, group_name, svg_ref, sort_order)
         VALUES (?, ?, 'katakana', ?, ?, ?)`,
        [k.char, k.romaji, k.group_name, `k_${k.sort_order}`, k.sort_order]
      );
      const charId = res.lastInsertRowId;
      if (k.examples && k.examples.length > 0) {
        for (const ex of k.examples) {
          await txn.runAsync(
            `INSERT INTO word_examples (character_id, word, romaji, meaning, audio_hint)
             VALUES (?, ?, ?, ?, ?)`,
            [charId, ex.word, ex.romaji, ex.meaning, ex.word]
          );
        }
      }
    }
  });
}

/**
 * Seed 50 Bab Minna no Nihongo dan kosakata aslinya ke SQLite
 */
async function seedMinnaVocabData(db) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const ch of MINNA_CHAPTERS) {
      const res = await txn.runAsync(
        `INSERT INTO content_units (module, title, level_or_bab, sort_order)
         VALUES ('vocab', ?, ?, ?)`,
        [ch.title, ch.bab, ch.sort_order]
      );
      const unitId = res.lastInsertRowId;
      for (const w of ch.words) {
        await txn.runAsync(
          `INSERT INTO vocab_items (content_unit_id, word, reading, meaning_id, example_sentence, example_translation)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [unitId, w.word, w.reading, w.meaning_id, w.sentence, w.translation]
        );
      }
    }
  });
}

/**
 * Seed bank soal original JLPT N5, N4, N3 ke SQLite
 */
async function seedJLPTData(db) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const q of JLPT_STARTER_QUESTIONS) {
      await txn.runAsync(
        `INSERT INTO jlpt_questions (level, section, question_text, options_json, correct_index, explanation)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [q.level, q.section, q.question_text, JSON.stringify(q.options), q.correct_index, q.explanation]
      );
    }
  });
}

/**
 * Mengambil soal latihan JLPT berdasarkan level dan section
 */
export async function getJLPTQuestionsFromDB(level = 'N5', section = 'all', count = null) {
  const db = await getDatabase();
  let query = 'SELECT * FROM jlpt_questions WHERE level = ?';
  const params = [level];

  if (section && section !== 'all') {
    query += ' AND section = ?';
    params.push(section);
  }
  query += ' ORDER BY id ASC';

  const rows = await db.getAllAsync(query, params);
  const mapped = rows.map((r) => ({
    id: r.id,
    level: r.level,
    section: r.section,
    question: r.question_text,
    questionText: r.question_text,
    options: JSON.parse(r.options_json || '[]'),
    answerIndex: r.correct_index,
    correct_index: r.correct_index,
    explanation: r.explanation,
  }));

  if (count && count > 0 && mapped.length > count) {
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
    return mapped.slice(0, count);
  }

  return mapped;
}

/**
 * Mengambil paket simulasi ujian lengkap JLPT (semua section berurutan)
 */
export async function getJLPTMockExam(level = 'N5') {
  const db = await getDatabase();
  const sections = ['moji_goi', 'bunpou', 'dokkai', 'choukai'];
  let examQuestions = [];

  for (const sec of sections) {
    const rows = await db.getAllAsync(
      'SELECT * FROM jlpt_questions WHERE level = ? AND section = ? ORDER BY id ASC',
      [level, sec]
    );
    const mapped = rows.map((r) => ({
      id: r.id,
      level: r.level,
      section: r.section,
      question: r.question_text,
      questionText: r.question_text,
      options: JSON.parse(r.options_json || '[]'),
      answerIndex: r.correct_index,
      correct_index: r.correct_index,
      explanation: r.explanation,
    }));
    examQuestions = examQuestions.concat(mapped);
  }

  return examQuestions;
}

/**
 * Statistik penguasaan JLPT per level dari tabel progress
 */
export async function getJLPTStatsSummary(level = 'N5') {
  const db = await getDatabase();
  const totalRow = await db.getFirstAsync(
    'SELECT COUNT(*) as cnt FROM jlpt_questions WHERE level = ?',
    [level]
  );
  const total = totalRow ? totalRow.cnt : 0;

  const rows = await db.getAllAsync(
    `SELECT * FROM progress WHERE item_type = ?`,
    [`jlpt_${level.toLowerCase()}`]
  );

  let answered = 0;
  let correct = 0;

  for (const r of rows) {
    if (r.correct_count + r.wrong_count > 0) {
      answered++;
      if (r.correct_count > 0) correct++;
    }
  }

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  return { answered, correct, total, accuracy };
}

/**
 * Statistik penguasaan JLPT detail per bagian untuk ProgressScreen
 */
export async function getJLPTDetailedProgress(level = 'N5') {
  const db = await getDatabase();
  const questions = await db.getAllAsync(
    'SELECT id, section FROM jlpt_questions WHERE level = ?',
    [level]
  );
  const progRows = await db.getAllAsync(
    'SELECT item_id, correct_count, wrong_count FROM progress WHERE item_type = ?',
    [`jlpt_${level.toLowerCase()}`]
  );
  const progMap = {};
  for (const p of progRows) {
    progMap[String(p.item_id)] = p;
  }

  let totalAttempts = 0;
  let totalCorrect = 0;

  const sectionStats = {
    moji_goi: { total: 0, attempts: 0, correct: 0 },
    bunpou: { total: 0, attempts: 0, correct: 0 },
    dokkai: { total: 0, attempts: 0, correct: 0 },
    choukai: { total: 0, attempts: 0, correct: 0 },
  };

  for (const q of questions) {
    if (!sectionStats[q.section]) {
      sectionStats[q.section] = { total: 0, attempts: 0, correct: 0 };
    }
    sectionStats[q.section].total++;
    const p = progMap[String(q.id)];
    if (p) {
      const att = (p.correct_count || 0) + (p.wrong_count || 0);
      const corr = p.correct_count || 0;
      sectionStats[q.section].attempts += att;
      sectionStats[q.section].correct += corr;
      totalAttempts += att;
      totalCorrect += corr;
    }
  }

  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  return {
    totalAttempts,
    totalCorrect,
    overallAccuracy,
    totalQuestions: questions.length,
    sections: sectionStats,
  };
}

/**
 * Mengambil daftar bab/unit kosakata (Minna 50 Bab)
 */
export async function getContentUnits(module = 'vocab') {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT u.*, COUNT(v.id) as word_count
     FROM content_units u
     LEFT JOIN vocab_items v ON v.content_unit_id = u.id
     WHERE u.module = ?
     GROUP BY u.id
     ORDER BY u.sort_order ASC`,
    [module]
  );
}

/**
 * Mengambil daftar kosakata per bab atau semua kosakata
 */
export async function getVocabItems(contentUnitId = null, mode = 'sequential') {
  const db = await getDatabase();
  let query = 'SELECT * FROM vocab_items';
  const params = [];

  if (contentUnitId) {
    query += ' WHERE content_unit_id = ?';
    params.push(contentUnitId);
  }
  query += ' ORDER BY id ASC';

  const rows = await db.getAllAsync(query, params);
  const mapped = rows.map((r) => ({
    ...r,
    key: `v_${r.id}`,
    char: r.word,
    romaji: r.reading,
    meaning: r.meaning_id,
  }));

  if (mode === 'random') {
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
  }

  return mapped;
}

/**
 * Mengambil bank soal kosakata untuk tes kurikulum Minna (Bab 1–50, N5 Bab 1-25, N4 Bab 26-50)
 */
export async function getVocabItemsByScope(scope = 'all_50', limit = 25) {
  const db = await getDatabase();
  let query = `
    SELECT v.*, u.sort_order as chapter_num, u.level_or_bab
    FROM vocab_items v
    JOIN content_units u ON v.content_unit_id = u.id
  `;

  if (scope === 'n5') {
    query += ' WHERE u.sort_order <= 25';
  } else if (scope === 'n4') {
    query += ' WHERE u.sort_order > 25';
  }

  query += ' ORDER BY RANDOM()';

  if (limit) {
    query += ` LIMIT ${parseInt(limit, 10)}`;
  }

  const rows = await db.getAllAsync(query);
  return rows.map((r) => ({
    ...r,
    key: `v_${r.id}`,
    char: r.word,
    romaji: r.reading,
    meaning: r.meaning_id,
  }));
}


/**
 * Mengambil ringkasan penguasaan kosakata Minna
 */
export async function getVocabProgressSummary() {
  const db = await getDatabase();
  const totalRow = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM vocab_items');
  const total = totalRow ? totalRow.cnt : 0;

  const rows = await db.getAllAsync(
    `SELECT status, COUNT(*) as cnt FROM progress WHERE item_type = 'vocab' GROUP BY status`
  );

  let mastered = 0;
  let learning = 0;

  for (const r of rows) {
    if (r.status === 'mastered') mastered = r.cnt;
    else if (r.status === 'learning') learning = r.cnt;
  }

  const unlearned = Math.max(0, total - mastered - learning);
  const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return { mastered, learning, unlearned, total, percentage };
}

/**
 * Mengambil daftar karakter dari SQLite
 */
export async function getCharacters(type = 'all', mode = 'sequential') {
  const db = await getDatabase();
  let query = 'SELECT * FROM characters';
  const params = [];

  if (type === 'hiragana' || type === 'katakana') {
    query += ' WHERE type = ?';
    params.push(type);
  }
  query += ' ORDER BY sort_order ASC';

  const rows = await db.getAllAsync(query, params);
  const mapped = rows.map((r) => ({
    ...r,
    key: `${r.type === 'hiragana' ? 'h' : 'k'}_${r.sort_order}`,
  }));

  if (mode === 'random') {
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
  }

  return mapped;
}

/**
 * Custom Hook untuk memuat characters dari SQLite
 */
export function useCharacters(type = 'hiragana', mode = 'sequential') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getCharacters(type, mode);
      setData(items);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [type, mode]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

/**
 * Ambil contoh kata untuk karakter tertentu
 */
export async function getCharacterWordExamples(characterId) {
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM word_examples WHERE character_id = ? ORDER BY id ASC',
    [characterId]
  );
}

/**
 * Catat ringkasan sesi belajar ke tabel study_sessions
 */
export async function recordStudySession({ mode, module, score = 0, total = 0, startedAt, finishedAt }) {
  const db = await getDatabase();
  const start = startedAt || new Date().toISOString();
  const finish = finishedAt || new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO study_sessions (mode, module, score, total, started_at, finished_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [mode, module, score, total, start, finish]
  );
  return res.lastInsertRowId;
}

/**
 * Hitung status penguasaan baru
 */
export function calculateItemStatus(correctCount, wrongCount) {
  const total = correctCount + wrongCount;
  if (total === 0) return 'new';
  const accuracy = correctCount / total;
  if (correctCount >= 3 && (accuracy >= 0.75 || wrongCount === 0)) {
    return 'mastered';
  }
  return 'learning';
}

/**
 * Update progress untuk satu item
 */
export async function updateItemProgress(itemType, itemId, isCorrect) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync(
    'SELECT * FROM progress WHERE item_type = ? AND item_id = ?',
    [itemType, String(itemId)]
  );

  let correctCount = isCorrect ? 1 : 0;
  let wrongCount = !isCorrect ? 1 : 0;

  if (existing) {
    correctCount += existing.correct_count;
    wrongCount += existing.wrong_count;
  }

  const status = calculateItemStatus(correctCount, wrongCount);

  await db.runAsync(
    `INSERT INTO progress (item_type, item_id, status, correct_count, wrong_count, last_practiced_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(item_type, item_id) DO UPDATE SET
       status = excluded.status,
       correct_count = excluded.correct_count,
       wrong_count = excluded.wrong_count,
       last_practiced_at = excluded.last_practiced_at`,
    [itemType, String(itemId), status, correctCount, wrongCount, now]
  );

  return { status, correctCount, wrongCount };
}

/**
 * Update progress batch (misal setelah menyelesaikan kuis atau flashcard)
 */
export async function updateBatchProgress(itemType, records) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const record of records) {
      const itemId = String(record.itemId || record.id || record.key);
      const isCorrect = !!record.isCorrect;

      const existing = await txn.getFirstAsync(
        'SELECT * FROM progress WHERE item_type = ? AND item_id = ?',
        [itemType, itemId]
      );

      let correctCount = isCorrect ? 1 : 0;
      let wrongCount = !isCorrect ? 1 : 0;

      if (existing) {
        correctCount += existing.correct_count;
        wrongCount += existing.wrong_count;
      }

      const status = calculateItemStatus(correctCount, wrongCount);

      await txn.runAsync(
        `INSERT INTO progress (item_type, item_id, status, correct_count, wrong_count, last_practiced_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(item_type, item_id) DO UPDATE SET
           status = excluded.status,
           correct_count = excluded.correct_count,
           wrong_count = excluded.wrong_count,
           last_practiced_at = excluded.last_practiced_at`,
        [itemType, itemId, status, correctCount, wrongCount, now]
      );
    }
  });
}

/**
 * Mengambil map seluruh progress untuk namespace/itemType tertentu
 */
export async function getProgressMap(itemType = 'kana') {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM progress WHERE item_type = ?',
    [itemType]
  );
  const map = {};
  for (const r of rows) {
    map[r.item_id] = {
      attempts: r.correct_count + r.wrong_count,
      correct: r.correct_count,
      wrongCount: r.wrong_count,
      status: r.status,
      mastery: r.status === 'new' ? 'unlearned' : r.status,
      lastPracticedAt: r.last_practiced_at,
    };
  }
  return map;
}

/**
 * Mengambil ringkasan statistik progress (mastered, learning, new/unlearned)
 */
export async function getProgressSummary(itemType = 'kana', totalExpected = 92) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT status, COUNT(*) as cnt FROM progress WHERE item_type = ? GROUP BY status`,
    [itemType]
  );

  let mastered = 0;
  let learning = 0;

  for (const r of rows) {
    if (r.status === 'mastered') mastered = r.cnt;
    else if (r.status === 'learning') learning = r.cnt;
  }

  const unlearned = Math.max(0, totalExpected - mastered - learning);
  const percentage = totalExpected > 0 ? Math.round((mastered / totalExpected) * 100) : 0;

  return { mastered, learning, unlearned, total: totalExpected, percentage };
}

/**
 * Karakter dengan kesalahan terbanyak (Fitur Weak Spot / Ulangi yang Sulit)
 */
export async function getWeakKana(limit = 15) {
  const db = await getDatabase();
  // Join progress dengan characters
  const rows = await db.getAllAsync(
    `SELECT c.*, p.wrong_count, p.correct_count, p.status
     FROM characters c
     JOIN progress p ON p.item_id = (
       CASE WHEN c.type = 'hiragana' THEN 'h_' || c.sort_order
            ELSE 'k_' || c.sort_order END
     ) AND p.item_type = 'kana'
     WHERE p.wrong_count > 0 OR p.status = 'learning'
     ORDER BY p.wrong_count DESC, (p.correct_count * 1.0 / (p.correct_count + p.wrong_count + 0.01)) ASC
     LIMIT ?`,
    [limit]
  );

  return rows.map((r) => ({
    ...r,
    key: `${r.type === 'hiragana' ? 'h' : 'k'}_${r.sort_order}`,
  }));
}

/**
 * Reset progress database
 */
export async function resetDatabaseProgress(itemType = null) {
  const db = await getDatabase();
  if (itemType) {
    await db.runAsync('DELETE FROM progress WHERE item_type = ?', [itemType]);
    await db.runAsync('DELETE FROM study_sessions WHERE module = ?', [itemType]);
  } else {
    await db.runAsync('DELETE FROM progress');
    await db.runAsync('DELETE FROM study_sessions');
  }
}

/**
 * Ringkasan progress terpisah untuk Hiragana dan Katakana
 */
export async function getKanaCategoryMastery() {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`
    SELECT c.type, p.status, COUNT(*) as cnt
    FROM characters c
    LEFT JOIN progress p ON p.item_id = (
      CASE WHEN c.type = 'hiragana' THEN 'h_' || c.sort_order
           ELSE 'k_' || c.sort_order END
    ) AND p.item_type = 'kana'
    GROUP BY c.type, p.status
  `);

  const result = {
    hiragana: { mastered: 0, learning: 0, unlearned: 46, total: 46, percentage: 0 },
    katakana: { mastered: 0, learning: 0, unlearned: 46, total: 46, percentage: 0 },
  };

  for (const r of rows) {
    if (r.type === 'hiragana' || r.type === 'katakana') {
      if (r.status === 'mastered') result[r.type].mastered = r.cnt;
      else if (r.status === 'learning') result[r.type].learning = r.cnt;
    }
  }

  result.hiragana.unlearned = Math.max(0, 46 - result.hiragana.mastered - result.hiragana.learning);
  result.hiragana.percentage = Math.round((result.hiragana.mastered / 46) * 100);
  result.katakana.unlearned = Math.max(0, 46 - result.katakana.mastered - result.katakana.learning);
  result.katakana.percentage = Math.round((result.katakana.mastered / 46) * 100);

  return result;
}

/**
 * Mengambil daftar Katakana lengkap beserta contoh kata serapan (word_examples)
 */
export async function getKatakanaWithExamples() {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`
    SELECT c.id, c.char, c.romaji, c.sort_order, w.word, w.romaji as example_romaji, w.meaning
    FROM characters c
    LEFT JOIN word_examples w ON w.character_id = c.id
    WHERE c.type = 'katakana'
    ORDER BY c.sort_order ASC
  `);

  // Group by character id
  const grouped = [];
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.id)) {
      const item = {
        id: r.id,
        char: r.char,
        romaji: r.romaji,
        sort_order: r.sort_order,
        key: `k_${r.sort_order}`,
        examples: [],
      };
      map.set(r.id, item);
      grouped.push(item);
    }
    if (r.word) {
      map.get(r.id).examples.push({
        word: r.word,
        romaji: r.example_romaji,
        meaning: r.meaning,
      });
    }
  }

  return grouped;
}
