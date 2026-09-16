# 📚 PROJECT-STRUCTURE.md — Flashcard Hika

> **Referensi cepat** sebelum menyentuh file apa pun di repo ini.
> Terakhir di-generate: 2026-09-16.

---

## Daftar Isi

- [Baseline Environment](#baseline-environment)
- [Aturan Emas Project](#aturan-emas-project)
- [Config Plugin Aktif (app.json)](#config-plugin-aktif-appjson)
- [Tree Struktur Folder (2 Level)](#tree-struktur-folder-2-level)
- [Klasifikasi Detail per File/Folder](#klasifikasi-detail-per-filefolder)
  - [🟢 SAFE TO EDIT](#-safe-to-edit)
  - [🟡 EDIT VIA CONFIG](#-edit-via-config)
  - [🔴 DO NOT DELETE](#-do-not-delete)
  - [⛔ NEVER COMMIT](#-never-commit)
  - [♻️ GENERATED / DISPOSABLE](#️-generated--disposable)
- [Ringkasan Git Status](#ringkasan-git-status)
- [Cheat Sheet: Perintah Penting](#cheat-sheet-perintah-penting)

---

## Baseline Environment

| Komponen          | Versi                  |
|-------------------|------------------------|
| Android SDK       | 36 (compileSdk)        |
| JDK               | 17 (Temurin)           |
| NDK               | 27.1.12297006          |
| Gradle            | 8.14.3                 |
| Expo SDK          | ~54.0.0                |
| React Native      | 0.81.5                 |
| React             | 19.1.0                 |
| Hermes            | Enabled                |
| Build target      | Local Gradle (BUKAN EAS Build) |

---

## Aturan Emas Project

1. **Semua konfigurasi native** (NDK version, ABI splits, `externalNativeBuild`, permissions, dsb.) → WAJIB diubah lewat `app.json` + config plugin (`expo-build-properties`), lalu jalankan `npx expo prebuild --clean`. **JANGAN** edit manual langsung di `android/app/build.gradle`.

2. **Build APK** → WAJIB lokal via Gradle:
   ```bash
   cd android && ./gradlew assembleRelease
   ```
   **DILARANG** pakai `eas build`.

3. **File/folder berikut TIDAK BOLEH di-commit ke git:**
   `android/app/build/`, `android/.gradle/`, `android/local.properties`, `.expo/`, `node_modules/`, `*.keystore`, `*.jks`, `build-apks/`.

4. **`android/app/build.gradle`** (file-nya, bukan folder `build/`) tetap **WAJIB di-commit**.

---

## Config Plugin Aktif (app.json)

```json
{
  "expo": {
    "plugins": [
      "expo-sqlite"
    ],
    "android": {
      "package": "com.flashcardhika.app"
    }
  }
}
```

| Plugin          | Pengaruh di android/                              |
|-----------------|---------------------------------------------------|
| `expo-sqlite`   | Auto-link native SQLite library via autolinking   |

> **Catatan:** Saat ini belum ada `expo-build-properties` di `plugins`. Jika perlu mengubah `minSdkVersion`, `targetSdkVersion`, `compileSdkVersion`, NDK version, atau ABI config, **tambahkan** `expo-build-properties` ke `plugins` di `app.json` terlebih dahulu, baru jalankan `npx expo prebuild --clean`.
>
> Contoh menambah expo-build-properties:
> ```json
> "plugins": [
>   "expo-sqlite",
>   ["expo-build-properties", {
>     "android": {
>       "compileSdkVersion": 36,
>       "targetSdkVersion": 36,
>       "minSdkVersion": 24,
>       "ndkVersion": "27.1.12297006"
>     }
>   }]
> ]
> ```

---

## Tree Struktur Folder (2 Level)

```
flashcard-mobile/
├── .expo/                          ⛔ NEVER COMMIT
├── .git/                           (git internal)
├── .gitignore                      🔴 DO NOT DELETE
├── App.js                          🟢 SAFE TO EDIT
├── README.md                       🟢 SAFE TO EDIT
├── Task-upgrade.md                 🟢 SAFE TO EDIT
├── app.json                        🔴 DO NOT DELETE · 🟡 EDIT VIA CONFIG
├── babel.config.js                 🔴 DO NOT DELETE
├── metro.config.js                 🔴 DO NOT DELETE
├── package.json                    🔴 DO NOT DELETE
├── package-lock.json               🔴 DO NOT DELETE
│
├── android/                        🟡 EDIT VIA CONFIG (sebagian besar)
│   ├── .gitignore                  🔴 DO NOT DELETE
│   ├── .gradle/                    ⛔ NEVER COMMIT
│   ├── .kotlin/                    ⛔ NEVER COMMIT
│   ├── build/                      ⛔ NEVER COMMIT
│   ├── app/
│   │   ├── build.gradle            🟡 EDIT VIA CONFIG · 🔴 DO NOT DELETE
│   │   ├── build/                  ⛔ NEVER COMMIT
│   │   ├── debug.keystore          ⛔ NEVER COMMIT (tracked—harus di-untrack!)
│   │   ├── proguard-rules.pro      🟡 EDIT VIA CONFIG
│   │   └── src/                    🟡 EDIT VIA CONFIG
│   ├── build.gradle                🟡 EDIT VIA CONFIG
│   ├── gradle/                     🟡 EDIT VIA CONFIG
│   ├── gradle.properties           🟡 EDIT VIA CONFIG
│   ├── gradlew                     ♻️ GENERATED
│   ├── gradlew.bat                 ♻️ GENERATED
│   ├── local.properties            ⛔ NEVER COMMIT
│   └── settings.gradle             🟡 EDIT VIA CONFIG
│
├── assets/                         🟢 SAFE TO EDIT
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
│
├── build-apks/                     ⛔ NEVER COMMIT
│
├── data/                           🟢 SAFE TO EDIT
│   ├── gojuonMap.js
│   ├── hiragana.js
│   ├── katakana.js
│   ├── jlpt/
│   │   ├── index.js
│   │   ├── n4/ (grammar, listening, reading, vocabulary)
│   │   └── n5/ (grammar, listening, reading, vocabulary)
│   └── kotoba/
│       ├── categories.js
│       ├── index.js
│       └── words/ (batch1–batch5)
│
├── db/                             🟢 SAFE TO EDIT
│   ├── index.js
│   ├── schema.js
│   └── seeds/
│       ├── jlptSeed.js
│       ├── kanaSeed.js
│       └── minnaSeed.js
│
├── navigation/                     🟢 SAFE TO EDIT
│   └── AppNavigator.js
│
├── node_modules/                   ⛔ NEVER COMMIT
│
├── screens/                        🟢 SAFE TO EDIT
│   ├── FlashcardScreen.js
│   ├── HomeScreen.js
│   ├── KanaPracticeScreen.js
│   ├── KatakanaWordsScreen.js
│   ├── ProgressScreen.js
│   ├── QuizScreen.js
│   ├── QuizSetupScreen.js
│   ├── SessionSetupScreen.js
│   ├── JLPT/
│   │   ├── JLPTHomeScreen.js
│   │   ├── JLPTMockTestScreen.js
│   │   ├── JLPTPracticeScreen.js
│   │   ├── JLPTProgressScreen.js
│   │   └── JLPTResultScreen.js
│   └── Kotoba/
│       ├── KotobaDetailScreen.js
│       ├── KotobaFlashcardScreen.js
│       ├── KotobaListScreen.js
│       ├── MinnaChapterDetailScreen.js
│       ├── MinnaFlashcardScreen.js
│       └── MinnaQuizScreen.js
│
└── utils/                          🟢 SAFE TO EDIT
    ├── mastery.js
    └── srsLite.js
```

---

## Klasifikasi Detail per File/Folder

---

### 🟢 SAFE TO EDIT

File-file di bawah ini adalah **source code aplikasi**. Aman diedit langsung kapan saja.

| File / Folder | Deskripsi |
|---|---|
| `App.js` | Entry point aplikasi — init database, render navigator |
| `screens/` | Semua layar UI (Home, Flashcard, Quiz, JLPT, Kotoba, dsb.) |
| `navigation/AppNavigator.js` | Routing & tab navigation |
| `data/` | Data statis (hiragana, katakana, gojuon map, JLPT N4/N5, kotoba) |
| `db/` | Database layer — schema, init, seed functions (expo-sqlite) |
| `utils/` | Helper functions — mastery calculation, SRS algorithm |
| `assets/` | Icon, splash screen, favicon (PNG) — direferensikan dari `app.json` |
| `README.md` | Dokumentasi project |
| `Task-upgrade.md` | Catatan upgrade internal |

---

### 🟡 EDIT VIA CONFIG

> **Prinsip:** File-file ini di-generate oleh `npx expo prebuild`. Edit manual akan **tertimpa** saat prebuild berikutnya. Ubah lewat `app.json` / config plugin, lalu regenerasi.

#### `app.json`
- **Sumber kebenaran utama** untuk seluruh konfigurasi Expo & native.
- Semua perubahan nama app, version, icon, splash, plugin, permissions, package name → di sini.
- ⚠️ Juga termasuk kategori **DO NOT DELETE** — lihat penjelasan di bawah.

#### `android/app/build.gradle`

| Bagian | Sumber sebenarnya | Cara ubah yang benar |
|---|---|---|
| `compileSdk`, `minSdkVersion`, `targetSdkVersion` | `app.json` → `expo-build-properties` | Tambahkan `expo-build-properties` ke plugins, set nilainya, lalu `npx expo prebuild --clean` |
| `splits { abi { ... } }` (baris 101–108) | `app.json` → `expo-build-properties` | Sama seperti di atas |
| `namespace`, `applicationId` | `app.json` → `expo.android.package` | Ubah di `app.json`, lalu prebuild ulang |
| `versionCode`, `versionName` | `app.json` → `expo.version` + plugin | Ubah `version` di `app.json`, lalu prebuild |
| `signingConfigs` (release) | Manual / env variable di CI | Untuk release keystore, buat signing config terpisah |
| `dependencies` block | Auto-generate oleh Expo autolinking | Jangan tambah dependency manual di sini |

**⚠️ Konsekuensi edit manual:**
- Perubahan akan **hilang total** saat menjalankan `npx expo prebuild --clean`
- ABI split yang salah → APK tidak mengemas native library untuk arsitektur tertentu → **crash saat launch** pada device yang terkena
- compileSdk / targetSdk tidak cocok → build gagal atau app ditolak Google Play

**✅ Cara yang BENAR:**
```bash
# 1. Edit app.json — tambah/ubah config plugin
# 2. Regenerasi android/
npx expo prebuild --clean
# 3. Verifikasi hasil di android/app/build.gradle
# 4. Build lokal
cd android && ./gradlew assembleRelease
```

#### `android/app/src/main/AndroidManifest.xml`

- Di-generate oleh Expo prebuild berdasarkan `app.json` + plugin.
- Permissions, intent filters, meta-data → atur lewat `app.json` → `expo.android.permissions` atau config plugin.

**⚠️ Konsekuensi edit manual:**
- Edit tertimpa saat prebuild berikutnya
- Permission yang hilang → fitur app tidak berfungsi (misal: internet, storage)

**✅ Cara yang BENAR:**
```json
// di app.json
"android": {
  "permissions": ["INTERNET", "VIBRATE", "READ_EXTERNAL_STORAGE"]
}
```
Lalu `npx expo prebuild --clean`.

#### `android/app/src/debug/AndroidManifest.xml` & `debugOptimized/AndroidManifest.xml`

- Variant manifests untuk debug builds, di-generate oleh prebuild.
- **Jangan edit manual.**

#### `android/app/src/main/java/.../MainActivity.kt` & `MainApplication.kt`

- Di-generate oleh prebuild.
- Jika perlu custom native code, gunakan **config plugin** atau **Expo Module**.

**⚠️ Konsekuensi edit manual:** Kode custom hilang saat prebuild ulang.

#### `android/app/src/main/res/` (semua sub-folder)

- Icon (mipmap-*), splash images (drawable-*), strings, styles, colors → di-generate dari `app.json` config (icon, splash, dsb.).
- **Jangan** replace icon secara manual di sini. Ganti file sumbernya di `assets/` lalu prebuild.

**✅ Cara yang BENAR untuk ganti icon:**
1. Ganti file `assets/icon.png` dan `assets/adaptive-icon.png`
2. Jalankan `npx expo prebuild --clean`

#### `android/build.gradle` (root)

- Top-level Gradle config, di-generate oleh prebuild.
- Berisi plugin apply, repository config, dan workaround annotations typedef.
- **Jangan** edit manual — tambah plugin lewat `app.json` config plugin.

#### `android/settings.gradle`

- Di-generate oleh prebuild — menghubungkan React Native Gradle Plugin dan Expo autolinking.
- **Jangan edit manual.**

#### `android/gradle.properties`

- Berisi build flags (Hermes, new arch, edge-to-edge, GIF/WebP support, dsb.).
- Di-generate oleh prebuild, tapi bisa di-override lewat `expo-build-properties` di `app.json`.

**⚠️ Konsekuensi edit manual:**
- Edit tetap berfungsi SAMPAI prebuild berikutnya, lalu tertimpa.
- `hermesEnabled=false` → app switch ke JSC, bundle size membengkak ~2MB.

#### `android/gradle/wrapper/*`

- Gradle wrapper JAR + properties. Di-generate oleh prebuild.
- Versi Gradle (saat ini 8.14.3) diatur oleh Expo SDK.

#### `android/app/proguard-rules.pro`

- ProGuard/R8 rules untuk release build. Di-generate oleh prebuild.
- Jika perlu custom rules, tambahkan lewat config plugin.

**⚠️ Konsekuensi edit manual:** Rules custom hilang saat prebuild. Tanpa rules yang benar → class penting ter-obfuscate → **crash saat runtime**.

---

### 🔴 DO NOT DELETE

File-file ini **wajib ada** dan **wajib ter-commit**. Jarang perlu diedit, tapi **JANGAN dihapus**.

#### `package.json`
- Manifest npm — daftar dependencies, scripts, nama project.
- **Konsekuensi dihapus:** `npm install` gagal total, tidak bisa build, semua tooling rusak.

#### `package-lock.json`
- Lock file dependency tree — menjamin reproducible install.
- **Konsekuensi dihapus:** Versi dependency bisa berubah tak terduga, build bisa gagal atau behavior berbeda antar mesin.
- **Cara update:** Jangan edit manual. Jalankan `npm install` — lock file ter-update otomatis.

#### `app.json`
- **Sumber kebenaran utama** konfigurasi Expo.
- **Konsekuensi dihapus:** `npx expo prebuild` gagal, `expo start` gagal, semua config hilang.
- **Cara edit:** Edit langsung di file ini — tapi pahami dampak tiap field.

#### `babel.config.js`
- Konfigurasi Babel transpiler (preset: `babel-preset-expo`).
- **Konsekuensi dihapus:** Metro bundler gagal transpile JSX/modern JS → app tidak bisa di-bundle.

#### `metro.config.js`
- Konfigurasi Metro bundler.
- **Konsekuensi dihapus:** Bundling akan pakai default config (mungkin aman), tapi Expo project butuh `getDefaultConfig` dari `expo/metro-config` agar fitur Expo berfungsi.

#### `.gitignore`
- Mengatur file mana yang tidak ter-commit.
- **Konsekuensi dihapus:** `node_modules/`, `build/`, `local.properties`, dan file sensitif bisa ter-commit → repo membengkak, secrets bocor.

#### `android/.gitignore`
- Gitignore khusus untuk subfolder android (build/, .gradle/, local.properties, .cxx/).
- **Konsekuensi dihapus:** Artefak build & cache Gradle bisa ter-commit.

#### `android/app/build.gradle` (file, BUKAN folder build/)
- **WAJIB di-commit** — Gradle membutuhkan file ini untuk build.
- **Konsekuensi dihapus:** Build Android gagal total (`Could not find build.gradle`).
- **Cara edit:** Lewat config plugin + prebuild (lihat bagian EDIT VIA CONFIG di atas).

---

### ⛔ NEVER COMMIT

File/folder ini **boleh ada di disk** tapi **WAJIB di-gitignore**. Jangan pernah `git add` file ini.

| File / Folder | Alasan | Status .gitignore |
|---|---|---|
| `node_modules/` | Dependencies npm — diinstal via `npm install` | ✅ Sudah di-ignore |
| `.expo/` | Cache Expo CLI (device list, web cache) | ✅ Sudah di-ignore |
| `android/app/build/` | Output build Gradle (APK, intermediates, dsb.) | ✅ Sudah di-ignore |
| `android/build/` | Root-level Gradle build cache | ✅ Sudah di-ignore |
| `android/.gradle/` | Gradle daemon cache & metadata | ✅ Sudah di-ignore |
| `android/.kotlin/` | Kotlin compiler sessions | ✅ Sudah di-ignore (via `android/.gitignore` → `.gradle` mencakup) |
| `android/local.properties` | Path ke Android SDK lokal (spesifik per mesin) | ✅ Sudah di-ignore |
| `build-apks/` | Output APK yang sudah di-build | ✅ Sudah di-ignore |
| `*.keystore`, `*.jks` | Signing key — **RAHASIA** | ⚠️ **PERINGATAN** (lihat di bawah) |

#### ⚠️ PERINGATAN: `android/app/debug.keystore`

File ini **saat ini tracked oleh git** (terlihat di `git ls-files` output). Menurut aturan project, `*.keystore` dan `*.jks` **TIDAK BOLEH ter-commit**.

**Rekomendasi tindakan:**
```bash
# 1. Tambahkan ke .gitignore (root)
echo "*.keystore" >> .gitignore
echo "*.jks" >> .gitignore

# 2. Untrack tanpa menghapus file lokal
git rm --cached android/app/debug.keystore

# 3. Commit perubahan
git add .gitignore
git commit -m "chore: untrack debug.keystore, add *.keystore to gitignore"
```

**Konsekuensi keystore hilang (release):**
- Tidak bisa menandatangani APK dengan signature yang sama → **TIDAK BISA update APK yang sudah terpasang di device pengguna. SELAMANYA.**
- Backup keystore release di tempat terpisah yang aman (encrypted cloud, USB drive, dsb.).

---

### ♻️ GENERATED / DISPOSABLE

File/folder ini **aman dihapus** dan bisa **dibuat ulang** kapan saja dengan command tertentu.

| File / Folder | Command untuk regenerasi |
|---|---|
| `android/` (seluruh folder) | `npx expo prebuild --clean` |
| `android/app/build/` | `cd android && ./gradlew clean` |
| `android/build/` | `cd android && ./gradlew clean` |
| `android/.gradle/` | Hapus manual, Gradle rebuild otomatis |
| `android/gradlew`, `gradlew.bat` | `npx expo prebuild --clean` (ikut regenerasi bersama android/) |
| `node_modules/` | `npm install` |
| `.expo/` | `npx expo start` (dibuat ulang otomatis) |
| `build-apks/` | `cd android && ./gradlew assembleRelease` (lalu copy APK) |

> **Catatan penting:** Seluruh folder `android/` di-generate oleh `npx expo prebuild`. Project ini menggunakan **bare workflow** (android/ sudah di-commit), tapi karena aturan project mengharuskan semua config native lewat `app.json` + plugin, folder ini pada praktiknya bisa di-regenerasi kapan saja.

---

## Ringkasan Git Status

**Tracked files (di-commit):** 90 file — lihat daftar lengkap via `git ls-files`.

**Ignored (ada di disk, TIDAK di-commit):**
| Path | Status |
|---|---|
| `.expo/` | ✅ Benar di-ignore |
| `android/.gradle/` | ✅ Benar di-ignore |
| `android/app/build/` | ✅ Benar di-ignore |
| `android/build/` | ✅ Benar di-ignore |
| `android/local.properties` | ✅ Benar di-ignore |
| `build-apks/` | ✅ Benar di-ignore |
| `node_modules/` | ✅ Benar di-ignore |

**⚠️ Masalah ditemukan:**
- `android/app/debug.keystore` → **tracked** padahal seharusnya di-ignore (lihat rekomendasi di atas).
- `*.keystore` dan `*.jks` **belum ada** di `.gitignore` root. Hanya ada di `android/.gitignore` secara implisit. Tambahkan secara eksplisit.

---

## Cheat Sheet: Perintah Penting

```bash
# Install dependencies
npm install

# Start Metro bundler (dev)
npx expo start

# Regenerasi folder android/ dari app.json
npx expo prebuild --clean

# Build APK release (LOKAL, bukan EAS)
cd android && ./gradlew assembleRelease

# Build APK debug
cd android && ./gradlew assembleDebug

# Clean build artifacts
cd android && ./gradlew clean

# Lihat file yang tracked git
git ls-files

# Lihat file yang di-ignore
git status --ignored
```

---

> **Dokumen ini di-generate otomatis sebagai referensi cepat.**
> Jika ada perubahan dependency atau config plugin baru, jalankan ulang pemindaian untuk memperbarui.
