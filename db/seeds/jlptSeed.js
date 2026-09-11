// db/seeds/jlptSeed.js
// Bank Soal Original Latihan JLPT N5, N4, N3
// Sections: 'moji_goi', 'bunpou', 'dokkai', 'choukai'

export const JLPT_STARTER_QUESTIONS = [
  // ==========================================
  // JLPT N5 (Pemula)
  // ==========================================
  // --- N5: Moji & Goi ---
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: 'つぎの ぶんの かんじの よみかたとして いちばん いい ものを えらびなさい。\n\nきのう、えきの まえで 【友だち】に 会いました。',
    options: ['ともだち', 'こども', 'かぞく', 'せんせい'],
    correct_index: 0,
    explanation: '「友だち」dibaca「ともだち」(tomodachi) yang artinya teman. Pilihan lain: こども (anak), かぞく (keluarga), せんせい (guru).',
  },
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: 'あしたは 【雨】が ふるでしょう。',
    options: ['ゆき', 'あめ', 'かぜ', 'くも'],
    correct_index: 1,
    explanation: '「雨」dibaca「あめ」(ame) yang berarti hujan. Pilihan lain: ゆき (salju), かぜ (angin), くも (awan).',
  },
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: 'まいあさ ７時に 【起きます】。',
    options: ['おきます', 'いきます', 'ねます', 'きます'],
    correct_index: 0,
    explanation: '「起きます」dibaca「おきます」(okimasu) artinya bangun tidur. ねます (tidur), いきます (pergi), きます (datang).',
  },
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: 'この えんぴつは 【安い】です。',
    options: ['たかい', 'やすい', 'ひろい', 'ながい'],
    correct_index: 1,
    explanation: '「安い」dibaca「やすい」(yasui) yang berarti murah. Lawan katanya adalah たかい (mahal/tinggi).',
  },
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: '（　　）に いれるのに いちばん いい ものを えらびなさい。\n\nあついですから、まどを （　　） ください。',
    options: ['あけて', 'しめて', 'つけて', 'けして'],
    correct_index: 0,
    explanation: 'Karena panas (あついですから), tindakan yang tepat untuk jendela (まど) adalah dibuka (あけて ください). しめて = tutup, つけて = nyalakan, けして = matikan.',
  },
  {
    level: 'N5',
    section: 'moji_goi',
    question_text: 'まいばん、おんがくを （　　）ながら べんきょうします。',
    options: ['みて', 'きき', 'よみ', 'のみ'],
    correct_index: 1,
    explanation: 'Objeknya adalah「おんがく」(musik), kata kerja yang sesuai adalah「ききます」(mendengar), pola ~nagara menjadi「ききながら」(sambil mendengarkan).',
  },

  // --- N5: Bunpou ---
  {
    level: 'N5',
    section: 'bunpou',
    question_text: 'わたしは バス（　　）がっこうへ 行きます。',
    options: ['を', 'で', 'に', 'へ'],
    correct_index: 1,
    explanation: 'Partikel で digunakan untuk menunjukkan alat, sarana, atau kendaraan transportasi yang dipakai melakukan aksi (バスで = naik bus).',
  },
  {
    level: 'N5',
    section: 'bunpou',
    question_text: '日曜日、いもうと（　　）デパートへ 行きました。',
    options: ['と', 'も', 'を', 'に'],
    correct_index: 0,
    explanation: 'Partikel と digunakan untuk menandai rekan/orang yang bersama-sama melakukan suatu aktivitas (いもうとと = bersama adik perempuan).',
  },
  {
    level: 'N5',
    section: 'bunpou',
    question_text: 'つくえの上に 本が さんさつ（　　）。',
    options: ['います', 'あります', 'します', 'いきます'],
    correct_index: 1,
    explanation: 'Buku (本) adalah benda mati tidak bernyawa, maka kata kerja keberadaan yang tepat adalah「あります」.「います」hanya untuk manusia/hewan.',
  },
  {
    level: 'N5',
    section: 'bunpou',
    question_text: 'すみませんが、この ペンを （　　）も いいですか。',
    options: ['つかう', 'つかって', 'つかった', 'つかい'],
    correct_index: 1,
    explanation: 'Pola permohonan izin menggunakan kata kerja bentuk -Te + mo ii desu ka「〜ても いいですか」. Jadi bentuk yang tepat adalah「つかって」.',
  },
  {
    level: 'N5',
    section: 'bunpou',
    question_text: '日本へ 行った ことが （　　）。',
    options: ['ありません', 'あります', 'います', 'ありませんでした'],
    correct_index: 1,
    explanation: 'Pola menyatakan pernah memiliki pengalaman adalah [V-ta + koto ga arimasu]. Bentuk positif standarnya adalah「あります」.',
  },

  // --- N5: Dokkai ---
  {
    level: 'N5',
    section: 'dokkai',
    question_text: '【メモ】\nたなかさんへ：\nきょうの かいぎは ２かいの だいいち・かいぎしつです。時間は ごご３時からです。じしょを わすれないで ください。\nさとう より\n\nとい：たなかさんは なんじに どこへ 行かなければ なりませんか。',
    options: [
      'ごご２時に だいいち・かいぎしつ',
      'ごご３時に だいいち・かいぎしつ',
      'ごご３時に １かいの うけつけ',
      'ごご２時に ２かいの ロビー'
    ],
    correct_index: 1,
    explanation: 'Di memo tertulis: "かいぎは ２かいの だいいち・かいぎしつ" dan "時間は ごご３時から", jadi Tanaka harus pergi ke Daiichi Kaigishitsu pukul 15.00 (gogo 3-ji).',
  },
  {
    level: 'N5',
    section: 'dokkai',
    question_text: '【メール】\nけんさん、あしたの にちようび、いっしょに えいがを みませんか。えきビルで １１時に まちあわせましょう。ひるごはんを たべてから えいがを みます。\nあり より\n\nとい：ふたりは えいがの まえに なにを しますか。',
    options: [
      'かいものを します',
      'ひるごはんを たべます',
      'ほんを よみます',
      'さんぽを します'
    ],
    correct_index: 1,
    explanation: 'Tertulis:「ひるごはんを たべてから えいがを みます」(setelah makan siang baru menonton film), jadi sebelum nonton film mereka makan siang.',
  },

  // --- N5: Choukai ---
  {
    level: 'N5',
    section: 'choukai',
    question_text: '【会話を聞いて 答えなさい】\n男の人：「すみません、この ほんは いくらですか。」\n女の人：「それは せんえんです。こちらの ざっしは はっぴゃくえんです。」\n男の人：「じゃ、この ほんを ください。」\n\nとい：男の人は いくら はらいますか。',
    options: ['800円 (はっぴゃくえん)', '1,000円 (せんえん)', '1,800円 (せんはっぴゃくえん)', '200円 (にひゃくえん)'],
    correct_index: 1,
    explanation: 'Pria tersebut menunjuk buku (ほん) dan memutuskan membeli buku tersebut (じゃ、この ほんを ください). Harga bukunya adalah 1,000 yen (せんえん).',
  },
  {
    level: 'N5',
    section: 'choukai',
    question_text: '【会話を聞いて 答えなさい】\n男の人：「あした、なんじに えきで あいましょうか。」\n女の人：「９時は どうですか。」\n男の人：「９時は ちょっと はやいです。１０時は どうですか。」\n女の人：「いいですね。そうしましょう。」\n\nとい：ふたりは あした なんじに あいますか。',
    options: ['8時半', '9時', '10時', '11時'],
    correct_index: 2,
    explanation: 'Wanita mengusulkan jam 9, tetapi pria merasa terlalu pagi dan mengusulkan jam 10 (１０時は どうですか). Wanita menyetujui, sehingga mereka bertemu jam 10.',
  },

  // ==========================================
  // JLPT N4 (Dasar Lanjut)
  // ==========================================
  // --- N4: Moji & Goi ---
  {
    level: 'N4',
    section: 'moji_goi',
    question_text: 'つぎの ぶんの かんじの よみかたとして いちばん いい ものを えらびなさい。\n\nらいげつ、にほんごの 【試験】を うけます。',
    options: ['じけん', 'しけん', 'けいけん', 'しけんん'],
    correct_index: 1,
    explanation: '「試験」dibaca「しけん」(shiken) yang berarti ujian / tes. じけん = insiden/kasus, けいけん = pengalaman.',
  },
  {
    level: 'N4',
    section: 'moji_goi',
    question_text: 'びょういんで 【案内】を してもらいました。',
    options: ['あんない', 'あんねい', 'おんない', 'かんない'],
    correct_index: 0,
    explanation: '「案内」dibaca「あんない」(annai) yang artinya pemanduan, petunjuk arah, atau informasi pengantar.',
  },
  {
    level: 'N4',
    section: 'moji_goi',
    question_text: 'あしたの パーティーの 【準備】を しています。',
    options: ['じゅんび', 'じゅんひ', 'しゅんび', 'じゅうび'],
    correct_index: 0,
    explanation: '「準備」dibaca「じゅんび」(junbi) yang artinya persiapan.',
  },
  {
    level: 'N4',
    section: 'moji_goi',
    question_text: '（　　）に いれるのに いちばん いい ものを えらびなさい。\n\nみちが こんでいたので、やくそくの じかんに （　　）しまいました。',
    options: ['まにあって', 'おくれて', 'つづいて', 'とまって'],
    correct_index: 1,
    explanation: 'Karena jalannya macet (こんでいたので), akibat negatif yang terjadi adalah terlambat dari waktu janji temu (おくれて しまいました).',
  },
  {
    level: 'N4',
    section: 'moji_goi',
    question_text: 'にもつが おもいので、すこし （　　） くださいませんか。',
    options: ['てつだって', 'ならって', 'やめて', 'おとして'],
    correct_index: 0,
    explanation: 'Karena barang bawaannya berat (おもいので), permohonan yang tepat adalah meminta bantuan (てつだって くださいませんか = sudikah membantu saya?).',
  },

  // --- N4: Bunpou ---
  {
    level: 'N4',
    section: 'bunpou',
    question_text: 'あした 雨が （　　）、しあいは ちゅうしに なります。',
    options: ['ふると', 'ふったら', 'ふれば', 'ふって'],
    correct_index: 1,
    explanation: 'Untuk pengandaian peristiwa masa depan tertentu yang bersyarat, pola「〜たら」(futtara = jika/bila hujan turun) adalah yang paling alami dan umum.',
  },
  {
    level: 'N4',
    section: 'bunpou',
    question_text: 'どうして きのう がっこうを やすんだ（　　）ですか。',
    options: ['の', 'ん', 'こと', 'もの'],
    correct_index: 1,
    explanation: 'Pola penjelasan atau menanyakan latar belakang alasan pada kalimat tanya sopan menggunakan「〜んですか」(~n desu ka).',
  },
  {
    level: 'N4',
    section: 'bunpou',
    question_text: 'この えいがは とても おもしろいので、（　　）ほうが いいですよ。',
    options: ['みる', 'みた', 'みない', 'みて'],
    correct_index: 1,
    explanation: 'Pola memberikan anjuran / saran afirmatif yang kuat adalah [V-ta + hou ga ii]「〜た ほうが いい」, jadi bentuk yang benar adalah「みた」.',
  },
  {
    level: 'N4',
    section: 'bunpou',
    question_text: 'こどもの とき、よく ははに （　　）。',
    options: ['ほめました', 'しかられました', 'しかりました', 'たのみました'],
    correct_index: 1,
    explanation: 'Subjek menerima perlakuan dari ibu (ははに), dalam konteks masa kecil sering dimarahi, bentuk pasif (ukemi) yang tepat adalah「しかられました」(dimarahi).',
  },
  {
    level: 'N4',
    section: 'bunpou',
    question_text: 'あした テストが あるので、こんばん べんきょうして （　　）。',
    options: ['みます', 'おきます', 'しまいます', 'あります'],
    correct_index: 1,
    explanation: 'Melakukan sesuatu terlebih dahulu demi persiapan di masa depan dinyatakan dengan pola [V-te + okimasu]「〜て おきます」.',
  },

  // --- N4: Dokkai ---
  {
    level: 'N4',
    section: 'dokkai',
    question_text: '【としょかんの お知らせ】\n・開館時間：午前９時〜午後７時（土・日は 午後５時まで）\n・休館日：毎週月曜日（月曜日が 祝日の 場合は、翌日の 火曜日）\n・本は ひとり ５さつ、２しゅうかんまで かりられます。\n\nとい：火曜日に 本を かりられないのは どんな ときですか。',
    options: [
      '月曜日が 祝日の とき',
      '土曜日と 日曜日の とき',
      '本を ５さつ かりた とき',
      '雨が ふっている とき'
    ],
    correct_index: 0,
    explanation: 'Pada bagian 休館日 (hari libur) tertulis: bila hari Senin tanggal merah (祝日の場合), hari libur bergeser ke hari Selasa berikutnya (翌日の火曜日). Jadi hari Selasa tutup jika hari Seninnya libur nasional.',
  },
  {
    level: 'N4',
    section: 'dokkai',
    question_text: 'わたしは 毎朝 ジョギングを しています。雨の 日は 走りませんが、いえの なかで ストレッチを します。体を 動かすと、あたまが すっきりして、しごとが はかどるからです。\n\nとい：この 人が 毎朝 体を 動かす 理由は なぜですか。',
    options: [
      '雨が すきだから',
      'しごとが うまく 進むように なるから',
      'いしゃに ちゅういされたから',
      'ともだちと やくそくしたから'
    ],
    correct_index: 1,
    explanation: 'Penulis menyatakan:「体を 動かすと、あたまが すっきりして、しごとが はかどるからです」(karena kalau menggerakkan tubuh pikiran segar dan pekerjaan jadi lancar/produktif).',
  },

  // --- N4: Choukai ---
  {
    level: 'N4',
    section: 'choukai',
    question_text: '【会社の 会話を聞いて 答えなさい】\n女の人：「たなかさん、この しりょうの コピーを おねがいできますか。」\n男の人：「はい、なんぶ コピーしましょうか。」\n女の人：「かいぎの しゅっせきしゃは ８にんですが、よぶんに ２ぶ おねがいします。」\n男の人：「わかりました。すぐ やります。」\n\nとい：男の人は しりょうを ぜんぶで なんぶ コピーしますか。',
    options: ['8部 (はちぶ)', '2部 (にぶ)', '10部 (じゅうぶ)', '16部 (じゅうろくぶ)'],
    correct_index: 2,
    explanation: 'Peserta ada 8 orang (８にん), ditambah cadangan ekstra 2 rangkap (よぶんに ２ぶ), sehingga total yang difotokopi adalah 8 + 2 = 10 rangkap (10部).',
  },
  {
    level: 'N4',
    section: 'choukai',
    question_text: '【駅のアナウンスを聞いて 答えなさい】\nアナウンス：「まもなく ２ばんばんに でんしゃが まいります。あぶないですから、きいろい せんの うちがわまで おさがりください。この でんしゃは とうきょういきの かいそくです。つぎの えきには とまりません。」\n\nとい：この でんしゃに ついて 正しいのは どれですか。',
    options: [
      'つぎの えきに とまる',
      'きいろい せんの そとがわで まつ',
      'つぎの えきには とまらない',
      '３ばんばんに くる'
    ],
    correct_index: 2,
    explanation: 'Diumumkan secara jelas:「この でんしゃは とうきょういきの かいそくです。つぎの えきには とまりません」(kereta cepat ini tidak berhenti di stasiun berikutnya).',
  },

  // ==========================================
  // JLPT N3 (Menengah Pertama)
  // ==========================================
  // --- N3: Moji & Goi ---
  {
    level: 'N3',
    section: 'moji_goi',
    question_text: 'つぎの ぶんの かんじの よみかたとして 最も よい ものを えらびなさい。\n\nしぜんの 【環境】を まもる 活動に さんかしました。',
    options: ['かんきょう', 'かんけい', 'かんこう', 'がんきょう'],
    correct_index: 0,
    explanation: '「環境」dibaca「かんきょう」(kankyou) yang artinya lingkungan hidup. かんけい = hubungan, かんこう = pariwisata.',
  },
  {
    level: 'N3',
    section: 'moji_goi',
    question_text: 'あたらしい 法律に 【賛成】する 人が 増えている。',
    options: ['さんせい', 'さんしょう', 'しんせい', 'さんせん'],
    correct_index: 0,
    explanation: '「賛成」dibaca「さんせい」(sansei) yang artinya setuju / sepakat. Lawan katanya adalah 反対 (はんたい = menentang).',
  },
  {
    level: 'N3',
    section: 'moji_goi',
    question_text: '彼は いつも 【丁寧】な ことばづかいで 話す。',
    options: ['ていねい', 'じょうねい', 'ていにん', 'ちょうねい'],
    correct_index: 0,
    explanation: '「丁寧」dibaca「ていねい」(teinei) yang artinya sopan, halus, atau teliti.',
  },
  {
    level: 'N3',
    section: 'moji_goi',
    question_text: '（　　）に いれるのに 最も よい ものを えらびなさい。\n\nこの レストランは いつ 行っても （　　）いる。',
    options: ['こんで', 'すいて', 'へって', 'やんで'],
    correct_index: 0,
    explanation: 'Restoran yang selalu ramai/padat pengunjung diungkapkan dengan「こんでいる」(kondiru). すいている berarti sepi/lengang.',
  },
  {
    level: 'N3',
    section: 'moji_goi',
    question_text: 'プロジェクトが 無事に 終わって、（　　）した。',
    options: ['ほっと', 'そっと', 'じっと', 'どっと'],
    correct_index: 0,
    explanation: 'Kata onomatope「ほっとする」(hotto suru) berarti merasa lega / bernapas lega setelah melewati beban berat atau kekhawatiran.',
  },

  // --- N3: Bunpou ---
  {
    level: 'N3',
    section: 'bunpou',
    question_text: '明日は 大切な 試験が あるから、夜更かしする（　　）には いかない。',
    options: ['わけ', 'はず', 'つもり', 'こと'],
    correct_index: 0,
    explanation: 'Pola「〜わけにはいかない」(wake ni wa ikanai) menyatakan tidak mungkin/tidak boleh secara moral atau akal sehat untuk begadang.',
  },
  {
    level: 'N3',
    section: 'bunpou',
    question_text: '先生の ご指導の （　　）で、N3に 合格することが できました。',
    options: ['せい', 'おかげ', 'ため', 'とおり'],
    correct_index: 1,
    explanation: 'Menyatakan rasa syukur atas bantuan/bimbingan positif seseorang diungkapkan dengan「〜のおかげで」(berkat bimbingan guru).「〜のせいで」untuk akibat negatif.',
  },
  {
    level: 'N3',
    section: 'bunpou',
    question_text: '家を 出た（　　）、大雨が 降り出した。',
    options: ['とたんに', 'ついでに', 'さいちゅうに', 'わりに'],
    correct_index: 0,
    explanation: 'Pola [V-ta + totan ni]「〜たとたんに」berarti "tepat seketika saat... terjadi peristiwa di luar dugaan" (Tepat begitu keluar rumah, hujan deras turun).',
  },
  {
    level: 'N3',
    section: 'bunpou',
    question_text: 'この商品は、子ども（　　） 作られた ものです。',
    options: ['向きに', '向けに', '沿って', '通して'],
    correct_index: 1,
    explanation: 'Pola「〜向けに」(muke ni) berarti secara khusus ditujukan/didesain bagi segmen sasaran tertentu (didesain khusus untuk anak-anak).',
  },
  {
    level: 'N3',
    section: 'bunpou',
    question_text: '彼が そんな うそを つく（　　）が ない。',
    options: ['はず', 'わけ', 'こと', 'もの'],
    correct_index: 0,
    explanation: 'Pola「〜はずがない」(hazu ga nai) menyatakan keyakinan kuat pembicara bahwa suatu hal mustahil terjadi (Tidak mungkin dia berbohong seperti itu).',
  },

  // --- N3: Dokkai ---
  {
    level: 'N3',
    section: 'dokkai',
    question_text: '【ビジネス・メール】\n高橋様\nいつも お世話に なっております。中村商事の 佐藤です。\nさて、ご依頼いただきました お見積書を 添付ファイルにて お送りいたします。\n内容を ご確認いただき、何か ご不明な 点が ございましたら、来週金曜日までに ご連絡いただけますと 幸いです。\n何卒 よろしく お願い申し上げます。\n\nとい：この メールの 主な 目的は 何ですか。',
    options: [
      '新しい 商品を 注文すること',
      '見積書を 送付し、内容の 確認を 依頼すること',
      '来週金曜日の 会議の 時間を 変更すること',
      '契約の キャンセルを 伝えること'
    ],
    correct_index: 1,
    explanation: 'Di dalam email dinyatakan:「お見積書を 添付ファイルにて お送りいたします。内容を ご確認いただき...」(mengirimkan lampiran surat penawaran harga/estimasi dan meminta konfirmasi isinya).',
  },
  {
    level: 'N3',
    section: 'dokkai',
    question_text: '最近は オンラインで 買い物をする 人が 急増している。わざわざ 店に 足を 運ばなくても、スマートフォンひとつで 欲しい 物が 翌日には 届くからだ。しかし、実際に 商品を 手に取って 確かめられないため、サイズや 色が 想像と 違っていたという トラブルも 少なくない。\n\nとい：筆者が 述べている オンラインショッピングの 短所は どれか。',
    options: [
      '商品が 届くまで 何週間も かかること',
      '実物を 直接 確かめてから 買えないこと',
      'スマートフォンの 操作が 複雑すぎる点',
      '店員と 会話が 楽しめないこと'
    ],
    correct_index: 1,
    explanation: 'Penulis menyebutkan kelemahan:「実際に 商品を 手に取って 確かめられないため、サイズや 色が 想像と 違っていた...」(tidak bisa memegang/memeriksa langsung barang fisiknya sebelum membeli).',
  },

  // --- N3: Choukai ---
  {
    level: 'N3',
    section: 'choukai',
    question_text: '【オフィスの 会話を聞いて 答えなさい】\n女性社員：「課長、来週の 出張の 飛行機の チケットですが、午前便が 満席でした。午後の １時発なら 予約可能ですが、いかがいたしましょうか。」\n課長：「先方の 田中部長との 打ち合わせは ４時からだから、１時発でも 十分 間に合うね。その便で 予約を 進めてくれ。」\n女性社員：「かしこまりました。手配いたします。」\n\nとい：女性社員は これから 何を しますか。',
    options: [
      '先方に 打ち合わせの 時間変更を 頼む',
      '午前の 便を キャンセル待ちする',
      '午後１時発の 航空券を 予約する',
      '田中部長に 電話を かける'
    ],
    correct_index: 2,
    explanation: 'Kepala seksi menyetujui penerbangan jam 1 siang karena rapat jam 4 sore, dan menginstruksikan:「その便で 予約を 進めてくれ」(lanjutkan reservasi penerbangan tersebut).',
  },
  {
    level: 'N3',
    section: 'choukai',
    question_text: '【電話の 会話を聞いて 答えなさい】\n店員：「お電話ありがとうございます。さくらレストランでございます。」\n客：「今夜 ７時に ４名で 予約したいのですが、個室は 空いていますか。」\n店員：「あいにく 個室は すでに 満席となっておりますが、窓側の テーブル席なら ご用意できます。」\n客：「そうですか。では、その テーブル席で お願いします。」\n\nとい：客は どの 席を 予約しましたか。',
    options: ['個室', '窓側の テーブル席', 'カウンター席', 'テラス席'],
    correct_index: 1,
    explanation: 'Karena ruang privat (個室) sudah penuh, pelanggan setuju memesan meja di dekat jendela (窓側のテーブル席).',
  },
];
