# PROMPT 1 — flashcard-hika: Setup Project & Data Layer + 2 Screen Awal

> **Sebelum kirim prompt ini:** lampirkan (attach/drag & drop) 2 screenshot desain Stitch — "Beranda KanaQuest" dan "Latihan Hiragana" — ke task ini di Antigravity. Prompt di bawah mengasumsikan gambar tersebut ada sebagai referensi visual.

## Referensi Visual

Dua gambar terlampir adalah referensi desain resmi (dari Google Stitch). Ikuti tata letak, warna, spacing, ukuran komponen, dan gaya tipografi **persis seperti di gambar** — jangan improvisasi layout baru. Kalau ada detail yang tidak jelas dari gambar, tanyakan dulu sebelum menebak.


## Konteks Project

Saya sedang membangun aplikasi mobile bernama **flashcard-hika** — flashcard sederhana untuk belajar Hiragana dan Katakana. (Catatan: teks "KanaQuest" yang muncul di header pada mockup desain adalah judul dalam UI saja, bukan nama aplikasinya — tetap tampilkan teks itu apa adanya sesuai desain.) Ini project React Native/Expo yang berdiri sendiri (bukan turunan dari project lain), dengan stack berikut:

- **React Native + Expo** — development pakai Expo Go (`npx expo start`) untuk testing cepat
- **react-native-svg** untuk render karakter kana (aset SVG, bukan font/gambar biasa)
- **expo-speech** untuk audio pengucapan karakter (Text-to-Speech, locale `ja-JP`) — tidak pakai file audio custom
- Struktur folder rapi: `/assets`, `/data`, `/components`, `/screens`, `/navigation`

Desain UI mengacu ke mockup Google Stitch (sudah saya lampirkan screenshot terpisah): tema biru-putih, kartu putih dengan shadow, rounded corners besar, bottom nav sederhana (Home, Practice).

## Aturan Wajib untuk Build APK (berlaku setiap kali bahas build)

1. Development boleh pakai Expo Go, tapi **build APK WAJIB lokal via Gradle** — TIDAK BOLEH pakai EAS Build atau server Expo dalam bentuk apapun. Jangan sarankan `eas build`.
2. Alur build yang benar:
   ```
   npx expo prebuild
   cd android
   ./gradlew assembleRelease
   ```
3. Environment yang sudah terpasang (gunakan ini, jangan suruh install ulang):
   - `ANDROID_HOME` = `D:\Android\sdk`
   - JDK 17 (Temurin) di lokasi default C:
4. Kalau ada error terkait SDK/Gradle/JAVA_HOME, asumsikan path di atas dan bantu debug berdasarkan itu, jangan minta install Android Studio.
5. APK hasil build ada di `android/app/build/outputs/apk/release/app-release.apk` (release) atau `.../debug/app-debug.apk` (debug).
6. **Wajib cek versi SDK yang dibutuhkan project SEBELUM build** (tiap versi Expo SDK bisa beda `compileSdkVersion`/`targetSdkVersion`):
   - Setelah `npx expo prebuild`, buka `android/build.gradle`, cek `compileSdkVersion`, `targetSdkVersion`, `buildToolsVersion` di `buildscript { ext { ... } }`
   - Kalau versi itu belum ada di `D:\Android\sdk`, kasih command install dulu, contoh: `sdkmanager "platforms;android-<versi>" "build-tools;<versi>.0.0"`
   - Baru lanjut `./gradlew assembleRelease` setelah SDK yang cocok terpasang.

## Data & Aset

- Saya punya 46 file SVG untuk Hiragana dan 46 file SVG untuk Katakana, masing-masing dinamai numerik: `1.svg` sampai `46.svg`, sesuai urutan gojūon standar (a, i, u, e, o, ka, ki, ku, ke, ko, sa, shi, su, se, so, ta, chi, tsu, te, to, na, ni, nu, ne, no, ha, hi, fu, he, ho, ma, mi, mu, me, mo, ya, yu, yo, ra, ri, ru, re, ro, wa, wo, n).
- Taruh file-file ini nanti di `/assets/hiragana/` dan `/assets/katakana/` (saya akan copy manual — untuk sekarang buatkan saja folder placeholder dan struktur import-nya).
- **Penting:** karena Metro bundler React Native tidak mendukung `require()` dengan path dinamis, buatkan file index eksplisit yang me-require ke-46 file satu per satu, contoh pola:

```js
// assets/hiraganaIndex.js
export default {
  1: require('./hiragana/1.svg'),
  2: require('./hiragana/2.svg'),
  // ... generate otomatis sampai 46
};
```//
Lakukan hal yang sama untuk `katakanaIndex.js`.

- Buat `data/gojuonMap.js` berisi array 46 objek `{ file, char, romaji }` sesuai urutan gojūon di atas (isi karakter hiragana & katakana asli, bukan placeholder).
- Buat `data/hiragana.js` dan `data/katakana.js` yang menggabungkan `gojuonMap` dengan index SVG masing-masing, menghasilkan array final `{ id, char, romaji, svg }`.

## Screen 1: Home (Beranda KanaQuest)

- Judul "KanaQuest" di header/app bar dengan icon
- Subjudul "Choose your study path for today."
- Dua kartu pilihan besar: **Hiragana** (tampilkan contoh karakter あ) dan **Katakana** (tampilkan contoh karakter ア), masing-masing tap-able, navigasi ke screen setup sesi
- Bottom nav: Home (aktif) dan Practice

## Screen 2: Setup Sesi (baru, belum ada di mockup — perlu ditambahkan)

Sebelum masuk ke flashcard, tampilkan pilihan:
- Toggle/segmented control: **Berurutan** vs **Acak**
- Tombol "Mulai" untuk lanjut ke screen flashcard

## Screen 3: Latihan Flashcard

- Header menampilkan judul sesi (misal "Hiragana Session") dan progress `x / 46` dengan progress bar di bawahnya
- Kartu putih besar di tengah menampilkan SVG karakter kana (render pakai react-native-svg)
- Tap kartu untuk flip — sisi belakang tampilkan romaji-nya (animasi flip sederhana, boleh pakai `react-native-reanimated` kalau sudah terpasang, atau animasi opacity/scale sederhana kalau belum)
- Teks kecil di bawah kartu: "Tap card to flip"
- Dua tombol di bawah: **Putar** (bulat outline, kiri) untuk memicu `Speech.speak(char, { language: 'ja-JP' })`, dan **Lanjut** (solid biru, kanan) untuk pindah ke kartu berikutnya sesuai mode urutan/acak yang dipilih
- Setelah kartu terakhir (46/46), tampilkan layar ringkasan sederhana (jumlah kartu selesai) dengan tombol kembali ke Home
- Bottom nav: Home dan Practice (Practice aktif)

## Yang TIDAK perlu dikerjakan di prompt ini

- Tracking progress belajar jangka panjang / statistik per karakter (kita bahas di prompt berikutnya)
- Kustomisasi audio file mp3
- Dark mode

## Output yang diharapkan

Struktur project Expo yang bisa langsung dijalankan dengan `npx expo start`, dengan 3 screen di atas sudah terhubung lewat navigation (React Navigation), data gojūon sudah lengkap dan benar, dan folder asset SVG sudah siap menerima file `1.svg`–`46.svg` yang akan saya masukkan manual.
