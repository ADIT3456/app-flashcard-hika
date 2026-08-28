import { n5_vocabulary } from './n5/vocabulary.js';
import { n5_grammar } from './n5/grammar.js';
import { n5_reading } from './n5/reading.js';
import { n5_listening } from './n5/listening.js';

import { n4_vocabulary } from './n4/vocabulary.js';
import { n4_grammar } from './n4/grammar.js';
import { n4_reading } from './n4/reading.js';
import { n4_listening } from './n4/listening.js';

export const JLPT_SECTIONS = [
  { id: 'all', label: 'Semua Bagian', icon: '📝' },
  { id: 'vocabulary', label: 'Kosakata (Goi)', icon: '📖' },
  { id: 'grammar', label: 'Tata Bahasa (Bunpou)', icon: '📐' },
  { id: 'reading', label: 'Membaca (Dokkai)', icon: '📄' },
  { id: 'listening', label: 'Mendengar (Choukai)', icon: '🎧' },
];

export const JLPT_QUESTIONS = {
  N5: {
    vocabulary: n5_vocabulary,
    grammar: n5_grammar,
    reading: n5_reading,
    listening: n5_listening,
  },
  N4: {
    vocabulary: n4_vocabulary,
    grammar: n4_grammar,
    reading: n4_reading,
    listening: n4_listening,
  },
};

export function getJLPTQuestions(level = 'N5', section = 'all') {
  const levelData = JLPT_QUESTIONS[level] || JLPT_QUESTIONS.N5;
  if (section === 'all') {
    return [
      ...levelData.vocabulary,
      ...levelData.grammar,
      ...levelData.reading,
      ...levelData.listening,
    ];
  }
  return levelData[section] || [];
}

export function generateMockTest(level = 'N5', count = 10) {
  const all = getJLPTQuestions(level, 'all');
  const shuffled = [...all].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
