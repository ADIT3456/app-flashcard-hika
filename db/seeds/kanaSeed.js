// db/seeds/kanaSeed.js
// 46 Hiragana & 46 Katakana data beserta contoh kata original

export const HIRAGANA_DATA = [
  { char: 'あ', romaji: 'a', group_name: 'a-row', sort_order: 1, examples: [{ word: 'あさ', romaji: 'asa', meaning: 'Pagi' }, { word: 'あめ', romaji: 'ame', meaning: 'Hujan / Permen' }] },
  { char: 'い', romaji: 'i', group_name: 'a-row', sort_order: 2, examples: [{ word: 'いぬ', romaji: 'inu', meaning: 'Anjing' }, { word: 'いえ', romaji: 'ie', meaning: 'Rumah' }] },
  { char: 'う', romaji: 'u', group_name: 'a-row', sort_order: 3, examples: [{ word: 'うみ', romaji: 'umi', meaning: 'Laut' }, { word: 'うた', romaji: 'uta', meaning: 'Lagu' }] },
  { char: 'え', romaji: 'e', group_name: 'a-row', sort_order: 4, examples: [{ word: 'えき', romaji: 'eki', meaning: 'Stasiun' }, { word: 'えんぴつ', romaji: 'enpitsu', meaning: 'Pensil' }] },
  { char: 'お', romaji: 'o', group_name: 'a-row', sort_order: 5, examples: [{ word: 'おかね', romaji: 'okane', meaning: 'Uang' }, { word: 'おちゃ', romaji: 'ocha', meaning: 'Teh hijau' }] },

  { char: 'か', romaji: 'ka', group_name: 'ka-row', sort_order: 6, examples: [{ word: 'かさ', romaji: 'kasa', meaning: 'Payung' }, { word: 'かわ', romaji: 'kawa', meaning: 'Sungai' }] },
  { char: 'き', romaji: 'ki', group_name: 'ka-row', sort_order: 7, examples: [{ word: 'き', romaji: 'ki', meaning: 'Pohon' }, { word: 'きょう', romaji: 'kyou', meaning: 'Hari ini' }] },
  { char: 'く', romaji: 'ku', group_name: 'ka-row', sort_order: 8, examples: [{ word: 'くるま', romaji: 'kuruma', meaning: 'Mobil' }, { word: 'くつ', romaji: 'kutsu', meaning: 'Sepatu' }] },
  { char: 'け', romaji: 'ke', group_name: 'ka-row', sort_order: 9, examples: [{ word: 'けさ', romaji: 'kesa', meaning: 'Pagi ini' }, { word: 'けいさつ', romaji: 'keisatsu', meaning: 'Polisi' }] },
  { char: 'こ', romaji: 'ko', group_name: 'ka-row', sort_order: 10, examples: [{ word: 'こども', romaji: 'kodomo', meaning: 'Anak-anak' }, { word: 'こえ', romaji: 'koe', meaning: 'Suara' }] },

  { char: 'さ', romaji: 'sa', group_name: 'sa-row', sort_order: 11, examples: [{ word: 'さくら', romaji: 'sakura', meaning: 'Bunga sakura' }, { word: 'さかな', romaji: 'sakana', meaning: 'Ikan' }] },
  { char: 'し', romaji: 'shi', group_name: 'sa-row', sort_order: 12, examples: [{ word: 'しお', romaji: 'shio', meaning: 'Garam' }, { word: 'しんぶん', romaji: 'shinbun', meaning: 'Koran' }] },
  { char: 'す', romaji: 'su', group_name: 'sa-row', sort_order: 13, examples: [{ word: 'すし', romaji: 'sushi', meaning: 'Sushi' }, { word: 'すずしい', romaji: 'suzushii', meaning: 'Sejuk' }] },
  { char: 'せ', romaji: 'se', group_name: 'sa-row', sort_order: 14, examples: [{ word: 'せんせい', romaji: 'sensei', meaning: 'Guru' }, { word: 'せかい', romaji: 'sekai', meaning: 'Dunia' }] },
  { char: 'そ', romaji: 'so', group_name: 'sa-row', sort_order: 15, examples: [{ word: 'そら', romaji: 'sora', meaning: 'Langit' }, { word: 'そば', romaji: 'soba', meaning: 'Dekat / Mie soba' }] },

  { char: 'た', romaji: 'ta', group_name: 'ta-row', sort_order: 16, examples: [{ word: 'たまご', romaji: 'tamago', meaning: 'Telur' }, { word: 'たかい', romaji: 'takai', meaning: 'Tinggi / Mahal' }] },
  { char: 'ち', romaji: 'chi', group_name: 'ta-row', sort_order: 17, examples: [{ word: 'ちず', romaji: 'chizu', meaning: 'Peta' }, { word: 'ちかいてつ', romaji: 'chikatetsu', meaning: 'Kereta bawah tanah' }] },
  { char: 'つ', romaji: 'tsu', group_name: 'ta-row', sort_order: 18, examples: [{ word: 'つき', romaji: 'tsuki', meaning: 'Bulan' }, { word: 'つくえ', romaji: 'tsukue', meaning: 'Meja' }] },
  { char: 'て', romaji: 'te', group_name: 'ta-row', sort_order: 19, examples: [{ word: 'て', romaji: 'te', meaning: 'Tangan' }, { word: 'てがみ', romaji: 'tegami', meaning: 'Surat' }] },
  { char: 'と', romaji: 'to', group_name: 'ta-row', sort_order: 20, examples: [{ word: 'とり', romaji: 'tori', meaning: 'Burung' }, { word: 'ともだち', romaji: 'tomodachi', meaning: 'Teman' }] },

  { char: 'な', romaji: 'na', group_name: 'na-row', sort_order: 21, examples: [{ word: 'なつ', romaji: 'natsu', meaning: 'Musim panas' }, { word: 'なまえ', romaji: 'namae', meaning: 'Nama' }] },
  { char: 'に', romaji: 'ni', group_name: 'na-row', sort_order: 22, examples: [{ word: 'にほん', romaji: 'nihon', meaning: 'Jepang' }, { word: 'にく', romaji: 'niku', meaning: 'Daging' }] },
  { char: 'ぬ', romaji: 'nu', group_name: 'na-row', sort_order: 23, examples: [{ word: 'ぬいぐるみ', romaji: 'nuigurumi', meaning: 'Boneka' }, { word: 'ぬま', romaji: 'numa', meaning: 'Rawa' }] },
  { char: 'ね', romaji: 'ne', group_name: 'na-row', sort_order: 24, examples: [{ word: 'ねこ', romaji: 'neko', meaning: 'Kucing' }, { word: 'ねつ', romaji: 'netsu', meaning: 'Demam' }] },
  { char: 'の', romaji: 'no', group_name: 'na-row', sort_order: 25, examples: [{ word: 'のみもの', romaji: 'nomimono', meaning: 'Minuman' }, { word: 'のり', romaji: 'nori', meaning: 'Rumput laut / Lem' }] },

  { char: 'は', romaji: 'ha', group_name: 'ha-row', sort_order: 26, examples: [{ word: 'はな', romaji: 'hana', meaning: 'Bunga / Hidung' }, { word: 'はる', romaji: 'haru', meaning: 'Musim semi' }] },
  { char: 'ひ', romaji: 'hi', group_name: 'ha-row', sort_order: 27, examples: [{ word: 'ひと', romaji: 'hito', meaning: 'Orang' }, { word: 'ひこうき', romaji: 'hikouki', meaning: 'Pesawat terbang' }] },
  { char: 'ふ', romaji: 'fu', group_name: 'ha-row', sort_order: 28, examples: [{ word: 'ふね', romaji: 'fune', meaning: 'Kapal' }, { word: 'ふゆ', romaji: 'fuyu', meaning: 'Musim dingin' }] },
  { char: 'へ', romaji: 'he', group_name: 'ha-row', sort_order: 29, examples: [{ word: 'へや', romaji: 'heya', meaning: 'Kamar' }, { word: 'へび', romaji: 'hebi', meaning: 'Ular' }] },
  { char: 'ほ', romaji: 'ho', group_name: 'ha-row', sort_order: 30, examples: [{ word: 'ほん', romaji: 'hon', meaning: 'Buku' }, { word: 'ほし', romaji: 'hoshi', meaning: 'Bintang' }] },

  { char: 'ま', romaji: 'ma', group_name: 'ma-row', sort_order: 31, examples: [{ word: 'まち', romaji: 'machi', meaning: 'Kota' }, { word: 'まど', romaji: 'mado', meaning: 'Jendela' }] },
  { char: 'み', romaji: 'mi', group_name: 'ma-row', sort_order: 32, examples: [{ word: 'みず', romaji: 'mizu', meaning: 'Air' }, { word: 'みち', romaji: 'michi', meaning: 'Jalan' }] },
  { char: 'む', romaji: 'mu', group_name: 'ma-row', sort_order: 33, examples: [{ word: 'むし', romaji: 'mushi', meaning: 'Serangga' }, { word: 'むら', romaji: 'mura', meaning: 'Desa' }] },
  { char: 'め', romaji: 'me', group_name: 'ma-row', sort_order: 34, examples: [{ word: 'め', romaji: 'me', meaning: 'Mata' }, { word: 'めがね', romaji: 'megane', meaning: 'Kacamata' }] },
  { char: 'も', romaji: 'mo', group_name: 'ma-row', sort_order: 35, examples: [{ word: 'もり', romaji: 'mori', meaning: 'Hutan' }, { word: 'もの', romaji: 'mono', meaning: 'Benda' }] },

  { char: 'や', romaji: 'ya', group_name: 'ya-row', sort_order: 36, examples: [{ word: 'やま', romaji: 'yama', meaning: 'Gunung' }, { word: 'やすみ', romaji: 'yasumi', meaning: 'Libur / Istirahat' }] },
  { char: 'ゆ', romaji: 'yu', group_name: 'ya-row', sort_order: 37, examples: [{ word: 'ゆき', romaji: 'yuki', meaning: 'Salju' }, { word: 'ゆめ', romaji: 'yume', meaning: 'Mimpi' }] },
  { char: 'よ', romaji: 'yo', group_name: 'ya-row', sort_order: 38, examples: [{ word: 'よる', romaji: 'yoru', meaning: 'Malam' }, { word: 'よみもの', romaji: 'yomimono', meaning: 'Bahan bacaan' }] },

  { char: 'ら', romaji: 'ra', group_name: 'ra-row', sort_order: 39, examples: [{ word: 'らいげつ', romaji: 'raigetsu', meaning: 'Bulan depan' }, { word: 'らくだ', romaji: 'rakuda', meaning: 'Unta' }] },
  { char: 'り', romaji: 'ri', group_name: 'ra-row', sort_order: 40, examples: [{ word: 'りんご', romaji: 'ringo', meaning: 'Apel' }, { word: 'りょうり', romaji: 'ryouri', meaning: 'Masakan' }] },
  { char: 'る', romaji: 'ru', group_name: 'ra-row', sort_order: 41, examples: [{ word: 'るす', romaji: 'rusu', meaning: 'Tidak di rumah' }, { word: 'るすばんじゃない', romaji: 'rusuban', meaning: 'Menjaga rumah' }] },
  { char: 'れ', romaji: 're', group_name: 'ra-row', sort_order: 42, examples: [{ word: 'れいぞうこ', romaji: 'reizouko', meaning: 'Kulkas' }, { word: 'れんしゅう', romaji: 'renshuu', meaning: 'Latihan' }] },
  { char: 'ろ', romaji: 'ro', group_name: 'ra-row', sort_order: 43, examples: [{ word: 'ろうそく', romaji: 'rousoku', meaning: 'Lilin' }, { word: 'ろく', romaji: 'roku', meaning: 'Enam' }] },

  { char: 'わ', romaji: 'wa', group_name: 'wa-row', sort_order: 44, examples: [{ word: 'わたし', romaji: 'watashi', meaning: 'Saya' }, { word: 'わに', romaji: 'wani', meaning: 'Buaya' }] },
  { char: 'を', romaji: 'wo', group_name: 'wa-row', sort_order: 45, examples: [{ word: 'ほんをよむ', romaji: 'hon o yomu', meaning: 'Membaca buku (partikel o)' }] },
  { char: 'ん', romaji: 'n', group_name: 'wa-row', sort_order: 46, examples: [{ word: 'おんな', romaji: 'onna', meaning: 'Perempuan' }, { word: 'しんかんせん', romaji: 'shinkansen', meaning: 'Kereta cepat' }] },
];

export const KATAKANA_DATA = [
  { char: 'ア', romaji: 'a', group_name: 'a-row', sort_order: 1, examples: [{ word: 'アイス', romaji: 'aisu', meaning: 'Es krim' }, { word: 'アパート', romaji: 'apaato', meaning: 'Apartemen' }] },
  { char: 'イ', romaji: 'i', group_name: 'a-row', sort_order: 2, examples: [{ word: 'インク', romaji: 'inku', meaning: 'Tinta' }, { word: 'インターネット', romaji: 'intaanetto', meaning: 'Internet' }] },
  { char: 'ウ', romaji: 'u', group_name: 'a-row', sort_order: 3, examples: [{ word: 'ウイスキー', romaji: 'uisukii', meaning: 'Wiski' }, { word: 'ウール', romaji: 'uuru', meaning: 'Wol' }] },
  { char: 'エ', romaji: 'e', group_name: 'a-row', sort_order: 4, examples: [{ word: 'エレベーター', romaji: 'erebeetaa', meaning: 'Lift' }, { word: 'エアコン', romaji: 'eakon', meaning: 'AC' }] },
  { char: 'オ', romaji: 'o', group_name: 'a-row', sort_order: 5, examples: [{ word: 'オレンジ', romaji: 'orenji', meaning: 'Jeruk' }, { word: 'オンライン', romaji: 'onrain', meaning: 'Online' }] },

  { char: 'カ', romaji: 'ka', group_name: 'ka-row', sort_order: 6, examples: [{ word: 'カメラ', romaji: 'kamera', meaning: 'Kamera' }, { word: 'カフェ', romaji: 'kafe', meaning: 'Kafe' }] },
  { char: 'キ', romaji: 'ki', group_name: 'ka-row', sort_order: 7, examples: [{ word: 'キッチン', romaji: 'kicchin', meaning: 'Dapur' }, { word: 'キー', romaji: 'kii', meaning: 'Kunci' }] },
  { char: 'ク', romaji: 'ku', group_name: 'ka-row', sort_order: 8, examples: [{ word: 'クラス', romaji: 'kurasu', meaning: 'Kelas' }, { word: 'クリーニング', romaji: 'kuriiningu', meaning: 'Laundry' }] },
  { char: 'ケ', romaji: 'ke', group_name: 'ka-row', sort_order: 9, examples: [{ word: 'ケーキ', romaji: 'keeki', meaning: 'Kue / Cake' }, { word: 'ゲーム', romaji: 'geemu', meaning: 'Game' }] },
  { char: 'コ', romaji: 'ko', group_name: 'ka-row', sort_order: 10, examples: [{ word: 'コーヒー', romaji: 'koohii', meaning: 'Kopi' }, { word: 'コンピューター', romaji: 'konpyuutaa', meaning: 'Komputer' }] },

  { char: 'サ', romaji: 'sa', group_name: 'sa-row', sort_order: 11, examples: [{ word: 'サッカー', romaji: 'sakkaa', meaning: 'Sepak bola' }, { word: 'サラダ', romaji: 'sarada', meaning: 'Salad' }] },
  { char: 'シ', romaji: 'shi', group_name: 'sa-row', sort_order: 12, examples: [{ word: 'シャツ', romaji: 'shatsu', meaning: 'Kemeja' }, { word: 'シャワー', romaji: 'shawaa', meaning: 'Shower' }] },
  { char: 'ス', romaji: 'su', group_name: 'sa-row', sort_order: 13, examples: [{ word: 'スプーン', romaji: 'supuun', meaning: 'Sendok' }, { word: 'スポーツ', romaji: 'supootsu', meaning: 'Olahraga' }] },
  { char: 'セ', romaji: 'se', group_name: 'sa-row', sort_order: 14, examples: [{ word: 'セーター', romaji: 'seetaa', meaning: 'Sweter' }, { word: 'センター', romaji: 'sentaa', meaning: 'Pusat' }] },
  { char: 'ソ', romaji: 'so', group_name: 'sa-row', sort_order: 15, examples: [{ word: 'ソファ', romaji: 'sofa', meaning: 'Sofa' }, { word: 'ソース', romaji: 'soosu', meaning: 'Saus' }] },

  { char: 'タ', romaji: 'ta', group_name: 'ta-row', sort_order: 16, examples: [{ word: 'タクシー', romaji: 'takushii', meaning: 'Taksi' }, { word: 'タオル', romaji: 'taoru', meaning: 'Handuk' }] },
  { char: 'チ', romaji: 'chi', group_name: 'ta-row', sort_order: 17, examples: [{ word: 'チーズ', romaji: 'chiizu', meaning: 'Keju' }, { word: 'チケット', romaji: 'chiketto', meaning: 'Tiket' }] },
  { char: 'ツ', romaji: 'tsu', group_name: 'ta-row', sort_order: 18, examples: [{ word: 'ツアー', romaji: 'tsuaa', meaning: 'Tur / Wisata' }, { word: 'ツナ', romaji: 'tsuna', meaning: 'Ikan tuna' }] },
  { char: 'テ', romaji: 'te', group_name: 'ta-row', sort_order: 19, examples: [{ word: 'テレビ', romaji: 'terebi', meaning: 'Televisi' }, { word: 'テーブル', romaji: 'teeburu', meaning: 'Meja' }] },
  { char: 'ト', romaji: 'to', group_name: 'ta-row', sort_order: 20, examples: [{ word: 'トマト', romaji: 'tomato', meaning: 'Tomat' }, { word: 'トイレ', romaji: 'toire', meaning: 'Toilet' }] },

  { char: 'ナ', romaji: 'na', group_name: 'na-row', sort_order: 21, examples: [{ word: 'ナイフ', romaji: 'naifu', meaning: 'Pisau' }, { word: 'ナンバー', romaji: 'nanbaa', meaning: 'Nomor' }] },
  { char: 'ニ', romaji: 'ni', group_name: 'na-row', sort_order: 22, examples: [{ word: 'ニュース', romaji: 'nyuusu', meaning: 'Berita' }, { word: 'ネクタイ', romaji: 'nekutai', meaning: 'Dasi' }] },
  { char: 'ヌ', romaji: 'nu', group_name: 'na-row', sort_order: 23, examples: [{ word: 'ヌードル', romaji: 'nuudoru', meaning: 'Mie' }, { word: 'カヌー', romaji: 'kanuu', meaning: 'Kano' }] },
  { char: 'ネ', romaji: 'ne', group_name: 'na-row', sort_order: 24, examples: [{ word: 'ネクタイ', romaji: 'nekutai', meaning: 'Dasi' }, { word: 'ネット', romaji: 'netto', meaning: 'Jaringan / Net' }] },
  { char: 'ノ', romaji: 'no', group_name: 'na-row', sort_order: 25, examples: [{ word: 'ノート', romaji: 'nooto', meaning: 'Buku catatan' }, { word: 'ノンアルコール', romaji: 'non-arukooru', meaning: 'Non-alkohol' }] },

  { char: 'ハ', romaji: 'ha', group_name: 'ha-row', sort_order: 26, examples: [{ word: 'ハンバーガー', romaji: 'hanbaagaa', meaning: 'Hamburger' }, { word: 'ハサミ', romaji: 'hasami', meaning: 'Gunting' }] },
  { char: 'ヒ', romaji: 'hi', group_name: 'ha-row', sort_order: 27, examples: [{ word: 'ピアノ', romaji: 'piano', meaning: 'Piano' }, { word: 'ヒーター', romaji: 'hiitaa', meaning: 'Pemanas' }] },
  { char: 'フ', romaji: 'fu', group_name: 'ha-row', sort_order: 28, examples: [{ word: 'フォーク', romaji: 'fooku', meaning: 'Garpu' }, { word: 'フランス', romaji: 'furansu', meaning: 'Prancis' }] },
  { char: 'ヘ', romaji: 'he', group_name: 'ha-row', sort_order: 29, examples: [{ word: 'ヘリコプター', romaji: 'herikoputaa', meaning: 'Helikopter' }, { word: 'ヘッドホン', romaji: 'heddohon', meaning: 'Headphone' }] },
  { char: 'ホ', romaji: 'ho', group_name: 'ha-row', sort_order: 30, examples: [{ word: 'ホテル', romaji: 'hoteru', meaning: 'Hotel' }, { word: 'ホーム', romaji: 'hoomu', meaning: 'Peron stasiun' }] },

  { char: 'マ', romaji: 'ma', group_name: 'ma-row', sort_order: 31, examples: [{ word: 'マスク', romaji: 'masuku', meaning: 'Masker' }, { word: 'マンション', romaji: 'manshon', meaning: 'Kondominium' }] },
  { char: 'ミ', romaji: 'mi', group_name: 'ma-row', sort_order: 32, examples: [{ word: 'ミルク', romaji: 'miruku', meaning: 'Susu' }, { word: 'ミーティング', romaji: 'miitingu', meaning: 'Pertemuan' }] },
  { char: 'ム', romaji: 'mu', group_name: 'ma-row', sort_order: 33, examples: [{ word: 'ムービー', romaji: 'muubii', meaning: 'Film' }, { word: 'ムード', romaji: 'muudo', meaning: 'Suasana / Mood' }] },
  { char: 'メ', romaji: 'me', group_name: 'ma-row', sort_order: 34, examples: [{ word: 'メニュー', romaji: 'menyuu', meaning: 'Menu' }, { word: 'メール', romaji: 'meeru', meaning: 'Email' }] },
  { char: 'モ', romaji: 'mo', group_name: 'ma-row', sort_order: 35, examples: [{ word: 'モーター', romaji: 'mootaa', meaning: 'Motor / Mesin' }, { word: 'モデル', romaji: 'moderu', meaning: 'Model' }] },

  { char: 'ヤ', romaji: 'ya', group_name: 'ya-row', sort_order: 36, examples: [{ word: 'ヤング', romaji: 'yangu', meaning: 'Muda' }, { word: 'ダイヤ', romaji: 'daiya', meaning: 'Berlian / Jadwal' }] },
  { char: 'ユ', romaji: 'yu', group_name: 'ya-row', sort_order: 37, examples: [{ word: 'ユニフォーム', romaji: 'yunifoomu', meaning: 'Seragam' }, { word: 'ユーザー', romaji: 'yuuzaa', meaning: 'Pengguna' }] },
  { char: 'ヨ', romaji: 'yo', group_name: 'ya-row', sort_order: 38, examples: [{ word: 'ヨーグルト', romaji: 'yooguruto', meaning: 'Yoghurt' }, { word: 'ヨット', romaji: 'yotto', meaning: 'Kapal pesiar' }] },

  { char: 'ラ', romaji: 'ra', group_name: 'ra-row', sort_order: 39, examples: [{ word: 'ラジオ', romaji: 'rajio', meaning: 'Radio' }, { word: 'ラーメン', romaji: 'raamen', meaning: 'Ramen' }] },
  { char: 'リ', romaji: 'ri', group_name: 'ra-row', sort_order: 40, examples: [{ word: 'リモコン', romaji: 'rimokon', meaning: 'Remote control' }, { word: 'リスト', romaji: 'risuto', meaning: 'Daftar' }] },
  { char: 'ル', romaji: 'ru', group_name: 'ra-row', sort_order: 41, examples: [{ word: 'ルール', romaji: 'ruuru', meaning: 'Aturan' }, { word: 'ルーレット', romaji: 'ruuretto', meaning: 'Rolet' }] },
  { char: 'レ', romaji: 're', group_name: 'ra-row', sort_order: 42, examples: [{ word: 'レストラン', romaji: 'resutoran', meaning: 'Restoran' }, { word: 'レジ', romaji: 'reji', meaning: 'Kasir' }] },
  { char: 'ロ', romaji: 'ro', group_name: 'ra-row', sort_order: 43, examples: [{ word: 'ロボット', romaji: 'robotto', meaning: 'Robot' }, { word: 'ロッカー', romaji: 'rokkaa', meaning: 'Loker' }] },

  { char: 'ワ', romaji: 'wa', group_name: 'wa-row', sort_order: 44, examples: [{ word: 'ワイン', romaji: 'wain', meaning: 'Anggur / Wine' }, { word: 'ワイシャツ', romaji: 'waishatsu', meaning: 'Kemeja kerja' }] },
  { char: 'ヲ', romaji: 'wo', group_name: 'wa-row', sort_order: 45, examples: [{ word: 'ヲタク', romaji: 'wotaku', meaning: 'Otaku / Penggemar fanatik' }] },
  { char: 'ン', romaji: 'n', group_name: 'wa-row', sort_order: 46, examples: [{ word: 'パン', romaji: 'pan', meaning: 'Roti' }, { word: 'マンション', romaji: 'manshon', meaning: 'Apartemen mewah' }] },
];
