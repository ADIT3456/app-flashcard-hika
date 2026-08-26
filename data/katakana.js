import gojuonMap from './gojuonMap';
import svgIndex from '../assets/katakanaIndex';

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

const katakana = gojuonMap.map((entry, i) => {
  const svgModule = svgIndex[entry.file];
  return {
    id: entry.file,
    char: katakanaChars[i],
    romaji: entry.romaji,
    svg: svgModule?.default ?? svgModule,
  };
});


export default katakana;
