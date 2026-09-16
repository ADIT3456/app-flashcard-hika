# 🛡️ TASK UPGRADE — Pedoman Upgrade Aplikasi

Dokumen ini adalah prosedur standar untuk melakukan upgrade Expo, React Native, dependency, maupun modul native tanpa menyebabkan regresi, build failure, atau crash saat aplikasi dijalankan.

> **Prinsip utama:** jangan mengubah toolchain native hanya berdasarkan asumsi. Setiap perubahan harus diverifikasi melalui dependency check, native synchronization, local release build, dan smoke test.

---

## 1. 🎯 Baseline Lingkungan Saat Ini

Baseline berikut adalah konfigurasi native yang **saat ini digunakan oleh proyek**.

> Versi ini bukan aturan permanen untuk semua upgrade. Jika Expo/React Native versi baru membutuhkan perubahan toolchain, lakukan verifikasi compatibility terlebih dahulu — jangan mempertahankan versi lama hanya karena "sudah biasa dipakai".

| Komponen            | Baseline Saat Ini                                         |
| ------------------- | ----------------------------------------------------------|
| Android SDK         | 36                                                         |
| `compileSdkVersion` | 36                                                         |
| `targetSdkVersion`  | 36                                                         |
| JDK                 | 17                                                         |
| JDK Distribution    | Eclipse Adoptium / Temurin                                 |
| JDK Path            | `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`  |
| `ANDROID_HOME`      | `D:\Android\sdk`                                           |
| NDK                 | `27.1.12297006`                                            |
| NDK Path            | `D:\Android\sdk\ndk\27.1.12297006`                         |
| Build System        | Gradle lokal                                               |
| EAS Build           | **DILARANG untuk proyek ini**                              |

### Aturan

* Jangan mengubah versi SDK/JDK/NDK secara sembarangan.
* Jika upgrade Expo/React Native membutuhkan perubahan toolchain, dokumentasikan perubahan tersebut (versi lama → baru, alasan, hasil verifikasi).
* Pastikan kombinasi berikut kompatibel satu sama lain sebagai satu ecosystem:

```text
Expo
   ↓
React Native
   ↓
Android Gradle Plugin
   ↓
Gradle
   ↓
JDK
   ↓
Android SDK / NDK
```

* Build Android harus dilakukan secara lokal menggunakan Gradle.
* **Jangan menggunakan `eas build`** untuk proyek ini.

---

## 2. ⚙️ WAJIB: Konfigurasi Native via Config Plugin, Bukan Edit Manual

Ini adalah sumber bug paling umum untuk app yang tiba-tiba "mental"/crash setelah upgrade — **wajib dipahami sebelum lanjut ke bagian lain.**

`npx expo prebuild` **meregenerasi ulang** folder `android/` dari nol berdasarkan `app.json`/`app.config.*`. Artinya:

* Kalau konfigurasi native (NDK version, ABI `splits`, `externalNativeBuild`, dsb) ditulis **manual langsung** di `android/app/build.gradle`, konfigurasi itu **berisiko hilang/tertimpa** setiap kali `prebuild` dijalankan ulang.
* Solusinya: semua konfigurasi custom tersebut **harus** didefinisikan lewat **config plugin** (misalnya `expo-build-properties`) di `app.json`/`app.config.js`, bukan ditulis manual di `build.gradle`.

### Aturan

* Setiap kali ada kebutuhan mengubah NDK version, ABI splits, atau `externalNativeBuild`, ubah lewat config plugin — bukan edit file gradle langsung.
* Setelah `prebuild`, **verifikasi manual sekali** bahwa config plugin tersebut benar-benar ter-generate ke `android/app/build.gradle` sesuai yang diharapkan.
* `android/app/build.gradle` **itu sendiri tetap harus dicommit** ke Git (bukan folder `android/app/build/` yang berisi hasil kompilasi) — karena file ini berisi acuan config splits/NDK yang jadi rujukan tim.

---

## 3. 🧩 Integritas Native & Binary `.so`

Beberapa dependency React Native/Expo menggunakan native C/C++ library. Contoh library yang harus diperhatikan:

```text
libexpo-modules-core.so
librnscreens.so
```

### Aturan

Jangan menghapus, menonaktifkan, atau memodifikasi konfigurasi native seperti `externalNativeBuild`, CMake, NDK configuration, `jniLibs`, `packagingOptions` tanpa memahami dampaknya terhadap native libraries.

Namun juga: **jangan mempertahankan konfigurasi `externalNativeBuild` hanya karena dianggap wajib.** Yang wajib adalah memastikan native libraries yang memang dibutuhkan dependency berhasil dibangun dan masuk ke APK.

### Alur Verifikasi

```text
APK berhasil dibuat
        ↓
APK dapat di-install
        ↓
Aplikasi dapat launch
        ↓
Tidak terjadi immediate crash
        ↓
Native feature yang relevan berfungsi
```

Jika terjadi crash native, periksa:

```bash
adb logcat
```

dan cari indikasi seperti: `UnsatisfiedLinkError`, `dlopen failed`, `No implementation found`, `SoLoader`, `CMake`, `NDK`.

---

## 4. 📦 ABI Splitting & Ukuran APK

Proyek menggunakan ABI splitting untuk mengurangi ukuran APK. Konfigurasi ada di `android/app/build.gradle` (via config plugin — lihat bagian 2), dan harus dipertahankan selama masih dibutuhkan oleh distribusi proyek.

Target saat ini:

```text
arm64-v8a APK ≈ 40 MB
Universal APK ≈ 119 MB
```

### Aturan

* Jangan menghapus konfigurasi `splits` tanpa alasan.
* Jangan menganggap ukuran APK tertentu sebagai jaminan absolut — setiap upgrade dependency native dapat mengubahnya.
* Jika ukuran APK berubah signifikan, investigasi dependency yang menyebabkan perubahan.
* Setelah build, periksa: APK size, ABI, dan native libraries yang benar-benar terkemas — pastikan sesuai ABI yang ditargetkan (gunakan Android Studio APK Analyzer atau tool APK inspection lain bila perlu).

---

## 5. 🔄 Dependency Upgrade

Sebelum mengubah dependency:

```bash
git status
```

Pastikan working tree bersih atau perubahan yang sedang dikerjakan sudah jelas.

Kemudian periksa compatibility Expo:

```bash
npx expo doctor
npx expo install --check
```

Jika command tersebut menemukan dependency yang tidak kompatibel, **selesaikan masalah tersebut sebelum melanjutkan build release**.

### Aturan penting

Untuk package Expo, prioritaskan `npx expo install <package>` daripada `npm install <package>`, agar versi dependency mengikuti compatibility Expo yang sesuai.

---

## 6. 🏗️ Sinkronisasi Native dengan Expo Prebuild

Jika perubahan dependency memiliki native code atau Expo config plugin yang memengaruhi project Android, jalankan:

```bash
npx expo prebuild --platform android --no-install
```

Contoh perubahan yang biasanya memerlukan perhatian: menambah/menghapus/upgrade package native, mengubah Expo config plugin, mengubah konfigurasi Android lewat `app.json`/`app.config.*`.

### Setelah `prebuild`

**Jangan langsung commit.** Periksa:

```bash
git status
git diff
```

Review perubahan pada folder `android/`. Pastikan perubahan native memang berasal dari upgrade yang dilakukan (dan config plugin di Bagian 2 sudah ter-generate dengan benar), bukan perubahan tidak disengaja.

---

## 7. 🧹 Jangan Mengandalkan `clean` Secara Buta

Jika build mengalami masalah yang diduga berasal dari stale build artifacts, gunakan:

```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleRelease
```

`clean` **bukan solusi default untuk semua masalah.** Gunakan hanya ketika: native dependency berubah, Gradle cache/build artifact dicurigai stale, terjadi perubahan konfigurasi native, atau saat debugging build inconsistency.

---

## 8. 🔢 Bump Versi Sebelum Release

Sebelum `assembleRelease`, pastikan `versionCode` dinaikkan (dan `versionName` diperbarui bila perlu) di `android/app/build.gradle` atau `app.json`.

**APK dengan `versionCode` yang sama tidak bisa meng-update instalasi lama di device.** Ini gampang terlewat dan menyebabkan user tidak bisa update aplikasi meski APK baru sudah dirilis.

---

## 9. 🧪 Pre-Push Verification

Sebelum push atau merge ke `main`, lakukan pemeriksaan berikut secara berurutan.

### 9.1 Git Check

```bash
git status --short
```

Pastikan tidak ada file temporary/build yang akan ikut commit.

### 9.2 JavaScript / TypeScript

```bash
npx tsc --noEmit
npx eslint .
```

Jangan menjadikan `npx expo start --dry-run` sebagai satu-satunya pemeriksaan syntax. `expo start` bisa dipakai sebagai smoke test development tambahan, tapi bukan pengganti typecheck/lint/test.

### 9.3 Expo Dependency Check

```bash
npx expo doctor
npx expo install --check
```

### 9.4 Android Release Build

```bash
cd android
.\gradlew.bat assembleRelease
```

Hasil yang diharapkan: `BUILD SUCCESSFUL`.

> ⚠️ `BUILD SUCCESSFUL` **tidak menjamin** app tidak crash saat dibuka. Lanjut ke smoke test di Bagian 10 — jangan skip.

---

## 10. 📱 Release APK Smoke Test

Setelah APK berhasil dibuat:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

1. Install APK ke device/emulator.
2. Launch aplikasi.
3. Pastikan aplikasi tidak langsung crash.
4. Jalankan fitur utama aplikasi & navigasi utama.
5. Uji fitur native yang berkaitan dengan dependency yang di-upgrade.
6. Jika ada crash, periksa `adb logcat`.

Minimal smoke test:

```text
[ ] APK berhasil dibuat
[ ] APK berhasil di-install
[ ] Aplikasi berhasil launch
[ ] Tidak terjadi immediate crash
[ ] Navigasi utama berfungsi
[ ] Fitur utama berfungsi
[ ] Fitur native yang berubah berfungsi
```

---

## 11. 🔐 File Terlarang & Secret

### File yang dilarang di-commit

```text
android/app/build/
android/.gradle/
android/local.properties
.expo/
node_modules/

*.keystore
*.jks

/hiragana/
/katakana/
```

> Catatan: `android/app/build.gradle` (file config) **tetap wajib dicommit** — jangan tertukar dengan `android/app/build/` (folder hasil kompilasi) yang wajib diabaikan.

`.gitignore` tidak menghapus file yang sebelumnya sudah tracked. Periksa dengan:

```bash
git ls-files android/app/build android/.gradle android/local.properties
```

Jika command ini mengembalikan hasil, file tersebut sudah pernah ter-tracking dan harus di-untrack secara khusus (`git rm --cached`).

### Secret & Keystore

Jangan pernah commit `*.jks`/`*.keystore` atau credential/signing information ke source code, commit, maupun log.

**Backup keystore beserta passwordnya di tempat aman terpisah dari repo** (password manager / backup terenkripsi). Kehilangan keystore berarti tidak bisa lagi merilis update untuk APK yang sudah terpasang di device pengguna — ini permanen dan tidak bisa diperbaiki setelahnya.

---

## 12. 🌿 Branching Strategy

Gunakan branch terpisah untuk upgrade atau feature:

```text
main
 │
 ├── feature/xxx
 ├── fix/xxx
 └── chore/upgrade-expo
```

Alur untuk upgrade dependency:

```text
main
  ↓
chore/upgrade-expo
  ↓
dependency upgrade
  ↓
prebuild (jika diperlukan) + verifikasi config plugin
  ↓
typecheck / lint
  ↓
Gradle release build
  ↓
APK smoke test (install & buka manual)
  ↓
commit
  ↓
push
  ↓
merge ke main
```

Jangan melakukan upgrade besar langsung di `main`. Merge hanya setelah build **BUILD SUCCESSFUL** dan APK sudah diinstal & dibuka manual tanpa crash.

---

## 13. 📝 Conventional Commits

Gunakan format `<type>: <short description>`:

| Prefix | Kegunaan |
|---|---|
| `feat:` | Menambah fitur baru |
| `fix:` | Memperbaiki bug |
| `chore:` | Tugas rutin, tidak mengubah logic (update dependency, dll) |
| `build:` | Perubahan terkait konfigurasi build/Gradle/native |
| `refactor:` | Ubah struktur kode tanpa mengubah perilaku |
| `docs:` | Perubahan dokumentasi |
| `test:` | Menambah/mengubah test |

Contoh baik: `feat: add hiragana practice screen`, `fix: resolve native module crash on startup`, `build: pin NDK ke versi 27.1.12297006`.

Hindari commit seperti: `update`, `fix`, `changes`, `test`, `coba`, `final`, `final2`, `fix lagi`. Commit message harus menjelaskan **apa yang berubah**, bukan kondisi emosional atau proses debugging.

---

## 14. 📋 Upgrade Checklist

### Before Upgrade

```text
[ ] Working tree bersih
[ ] Current branch bukan main
[ ] Versi Expo/RN saat ini dicatat
[ ] Versi Android SDK/JDK/NDK dicatat
[ ] Dependency yang akan diubah sudah diketahui
[ ] Backup/tag/checkpoint tersedia jika upgrade besar
```

### During Upgrade

```text
[ ] Dependency di-upgrade dengan cara yang sesuai Expo
[ ] Compatibility diperiksa
[ ] Native dependency diidentifikasi
[ ] Prebuild dilakukan jika diperlukan
[ ] Config plugin (NDK/ABI/externalNativeBuild) diverifikasi ter-generate benar
[ ] git diff setelah prebuild diperiksa — tidak ada perubahan native tak disengaja
```

### Verification

```text
[ ] npx expo doctor
[ ] npx expo install --check
[ ] npx tsc --noEmit
[ ] npx eslint .
[ ] versionCode/versionName sudah dinaikkan
[ ] ./gradlew.bat assembleRelease → BUILD SUCCESSFUL
[ ] APK berhasil di-install & launch tanpa crash
[ ] Smoke test & native feature terkait berhasil
```

### Before Commit

```text
[ ] android/app/build, .gradle, local.properties, .expo, node_modules tidak tracked
[ ] *.jks / *.keystore tidak tracked
[ ] Tidak ada secret di kode/commit/log
[ ] git diff --cached --check berhasil
```

---

## 15. 🚨 Jika Upgrade Gagal

Jangan melakukan perubahan acak berulang-ulang. Ikuti proses isolasi layer:

```text
1. Catat error pertama
        ↓
2. Identifikasi layer yang bermasalah
        ↓
3. JS / Expo → 4. React Native → 5. Gradle / AGP → 6. JDK
        ↓
7. Android SDK → 8. NDK / CMake → 9. Native dependency → 10. Runtime / APK
```

> **Perbaiki root cause, bukan gejalanya.** Jangan mengubah banyak konfigurasi sekaligus — akan menyulitkan identifikasi penyebab.

Jika sebuah perubahan memperbaiki error, catat:

```text
Problem:
Root Cause:
Change:
Why:
Verification:
```

---

## 16. 📌 Aturan Emas

1. **Jangan upgrade toolchain tanpa compatibility check** — Expo ↔ RN ↔ AGP ↔ Gradle ↔ JDK ↔ SDK ↔ NDK adalah satu ecosystem.
2. **Jangan menghapus konfigurasi native hanya karena terlihat tidak diperlukan** — pahami dependency dan konsekuensinya dulu.
3. **Jangan menganggap `BUILD SUCCESSFUL` berarti aman** — APK harus di-install dan di-smoke-test manual.
4. **Jangan commit hasil build** — pisahkan source/config dari generated artifacts.
5. **Jangan edit native config manual di `build.gradle`** — pakai config plugin, karena prebuild akan menimpanya.
6. **Jangan jalankan `prebuild` tanpa memeriksa `git diff` setelahnya.**
7. **Satu branch untuk satu tanggung jawab** — upgrade, feature, dan bug fix tidak dicampur tanpa alasan.
8. **Upgrade harus dapat diulang** — orang lain di tim harus paham apa yang diubah, mengapa, versi apa, dan cara verifikasinya.

---

## 17. ✅ Definition of Done

Upgrade dianggap **SELESAI** hanya jika seluruh kondisi berikut terpenuhi:

```text
[✓] Dependency compatibility valid
[✓] Native project tersinkronisasi (config plugin ter-generate benar)
[✓] Tidak ada perubahan native yang tidak disengaja
[✓] TypeScript/Lint berhasil
[✓] Expo checks berhasil
[✓] versionCode/versionName sudah dinaikkan
[✓] Gradle release build berhasil
[✓] APK berhasil dibuat, di-install, dan launch tanpa crash
[✓] Smoke test & native feature terkait berhasil
[✓] Tidak ada build/temporary/secret file yang ter-commit
[✓] Commit menggunakan Conventional Commits
[✓] Perubahan berada di feature/upgrade branch, sudah direview, lalu di-merge ke main
```

---

## Prinsip Penutup

> **Upgrade bukan sekadar menaikkan nomor versi. Upgrade adalah perubahan terhadap dependency graph dan native toolchain yang harus dibuktikan tetap kompatibel melalui build dan runtime verification — dan konfigurasi native harus didefinisikan lewat config plugin, bukan edit manual, agar tidak hilang setiap kali prebuild dijalankan ulang.**