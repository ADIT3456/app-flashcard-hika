import gojuonMap from './gojuonMap';

// Katakana chars in same gojūon order
const katakanaChars = [
  'ア','イ','ウ','エ','オ',
  'カ','キ','ク','ケ','コ',
  'サ','シ','ス','セ','ソ',
  'タ','チ','ツ','テ','ト',
  'ナ','ニ','ヌ','ネ','ノ',
  'ハ','ヒ','フ','ヘ','ホ',
  'マ','ミ','ム','メ','モ',
  'ヤ','ユ','ヨ',
  'ラ','リ','ル','レ','ロ',
  'ワ','ヲ','ン',
];

const katakana = gojuonMap.map((entry, i) => ({
  id: entry.file,
  key: `k_${entry.file}`,
  type: 'katakana',
  char: katakanaChars[i],
  romaji: entry.romaji,
}));

export default katakana;
