# 📚 Flashcard Hika — Japanese Learning App

Aplikasi mobile untuk belajar bahasa Jepang dengan metode flashcard interaktif. Dibangun dengan **React Native + Expo**, mendukung kana (hiragana & katakana), kosakata JLPT, dan quiz latihan.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🃏 Flashcard | Sesi belajar kartu kana & kosakata dengan flip animasi |
| 🔤 Kana Practice | Latihan hiragana & katakana interaktif |
| 📝 Quiz | Kuis pilihan ganda dengan skor dan review jawaban |
| 📊 Progress | Pantau kemajuan belajar per kategori |
| 🗣️ Text-to-Speech | Pelafalan kata bahasa Jepang via `expo-speech` |
| 🗄️ SQLite Lokal | Penyimpanan progres offline dengan `expo-sqlite` |

---

## 🛠️ Tech Stack

- **React Native** `0.81.5` + **React** `19.1.0`
- **Expo SDK** `~54.0.0`
- **React Navigation** v6 (Stack + Bottom Tabs)
- **expo-sqlite** — database lokal
- **expo-speech** — text-to-speech
- **react-native-screens** + **react-native-safe-area-context**

---

## 📋 Prasyarat

Pastikan sudah terinstall:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- **Android**: Android Studio + Android SDK (untuk build native)
  - `ANDROID_HOME` → `D:\Android\sdk`
  - JDK 17 (Eclipse Temurin direkomendasikan)
  - NDK `27.1.12297006`
  - Compile/Target SDK: **36**

---

## 🚀 Instalasi & Menjalankan

### 1. Clone repositori

```bash
git clone https://github.com/ADIT3456/app-flashcard-hika.git
cd flashcard-mobile
```

### 2. Install dependensi

```bash
npm install
```

### 3. Jalankan di Expo Go (Development)

```bash
npx expo start
```

Scan QR code dengan aplikasi **Expo Go** di HP kamu.

### 4. Jalankan di Emulator Android

```bash
npm run android
# atau
npx expo run:android
```

---

## 📦 Build APK (Production)

> ⚠️ Proyek ini menggunakan **local Gradle build** — tidak menggunakan `eas build`.

### Prebuild (wajib setelah tambah modul native baru)

```bash
npx expo prebuild --platform android --no-install
```

### Build APK Release

```bash
cd android
.\gradlew.bat assembleRelease
```

Output APK tersimpan di:
```
android/app/build/outputs/apk/release/
```

> APK per-ABI (`arm64-v8a`) berukuran ~40 MB berkat konfigurasi ABI splitting.

---

## 📁 Struktur Proyek

```
flashcard-mobile/
├── App.js                  # Entry point aplikasi
├── app.json                # Konfigurasi Expo
├── navigation/             # Konfigurasi navigasi (Stack & Tab)
├── screens/                # Semua layar aplikasi
│   ├── HomeScreen.js
│   ├── FlashcardScreen.js
│   ├── KanaPracticeScreen.js
│   ├── KatakanaWordsScreen.js
│   ├── QuizScreen.js
│   ├── QuizSetupScreen.js
│   ├── SessionSetupScreen.js
│   ├── ProgressScreen.js
│   ├── JLPT/               # Layar kosakata JLPT
│   └── Kotoba/             # Layar kosakata tambahan
├── db/                     # Inisialisasi & query SQLite
├── data/                   # Data kana, kosakata JSON
├── utils/                  # Helper functions
└── assets/                 # Ikon, splash screen, gambar
```

---

## 📜 Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm start` | Jalankan Expo dev server |
| `npm run android` | Jalankan di emulator/device Android |
| `npm run ios` | Jalankan di simulator iOS |

---

## 🔧 Aturan Pengembangan

Lihat [Task-upgrade.md](./Task-upgrade.md) untuk panduan lengkap:

- ✅ Jangan commit folder `build/`, `node_modules/`, `.expo/`, `local.properties`
- ✅ Jalankan `npx expo prebuild` setelah tambah modul native
- ✅ Gunakan [Conventional Commits](https://www.conventionalcommits.org/) untuk pesan commit
- ✅ Merge ke `main` hanya setelah local build **BUILD SUCCESSFUL**

---

## 📄 Lisensi

Private project — hak cipta milik pengembang.
