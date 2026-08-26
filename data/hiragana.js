import gojuonMap from './gojuonMap';
import svgIndex from '../assets/hiraganaIndex';

const hiragana = gojuonMap.map((entry) => {
  const svgModule = svgIndex[entry.file];
  return {
    id: entry.file,
    char: entry.char,
    romaji: entry.romaji,
    svg: svgModule?.default ?? svgModule,
  };
});


export default hiragana;
