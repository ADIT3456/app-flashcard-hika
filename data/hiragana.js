import gojuonMap from './gojuonMap';

const hiragana = gojuonMap.map((entry) => ({
  id: entry.file,
  key: `h_${entry.file}`,
  type: 'hiragana',
  char: entry.char,
  romaji: entry.romaji,
}));

export default hiragana;
