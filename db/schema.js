// db/schema.js
// DDL Skema SQLite Lokal untuk Hika Flashcard

export const CURRENT_SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  char TEXT NOT NULL,
  romaji TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('hiragana', 'katakana')),
  group_name TEXT,
  svg_ref TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS word_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  romaji TEXT NOT NULL,
  meaning TEXT NOT NULL,
  audio_hint TEXT,
  FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module TEXT NOT NULL CHECK(module IN ('kana', 'vocab', 'jlpt')),
  title TEXT NOT NULL,
  level_or_bab TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vocab_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_unit_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  reading TEXT NOT NULL,
  meaning_id TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  FOREIGN KEY (content_unit_id) REFERENCES content_units (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jlpt_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL CHECK(level IN ('N5', 'N4', 'N3')),
  section TEXT NOT NULL CHECK(section IN ('moji_goi', 'bunpou', 'dokkai', 'choukai')),
  question_text TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'learning', 'mastered')),
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  last_practiced_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_type_item ON progress(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_characters_type_order ON characters(type, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_units_module ON content_units(module, sort_order);
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_level_sec ON jlpt_questions(level, section);

CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,
  module TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL
);
`;
