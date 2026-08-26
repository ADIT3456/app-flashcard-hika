# 📚 Flashcard Japanese (Hika) Mobile App

Aplikasi mobile berbasis **React Native** dan **Expo SDK 54** untuk belajar dan menguasai karakter **Hiragana** dan **Katakana** Jepang secara interaktif menggunakan flashcard vektor (SVG) dan pengucapan audio asli (*Text-to-Speech*).

---

## ✨ Fitur Utama

- 🎌 **Kategori Lengkap**: Pilihan belajar karakter Hiragana dan Katakana.
- 🔀 **Mode Belajar**: Mode Berurutan (*Sequential*) dan Mode Acak (*Random*).
- 🔄 **Flashcard Interaktif**: Animasi kartu yang dapat dibalik untuk melihat bentuk karakter dan membaca Romaji.
- 🔊 **Pengucapan Bahasa Jepang**: Dilengkapi modul audio `expo-speech` beraksen Jepang (`ja-JP`).
- 🎨 **UI Modern & Ringan**: Tampilan bersih, responsif, dan bebas iklan.
- 🚀 **APK Ter-Optimasi**: Ukuran APK rilis sangat ringan (~40 MB untuk `arm64-v8a`) berbasis *ABI Splitting*.

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

- **Framework**: React Native `0.81.5` / Expo SDK `54.0.0`
- **Navigasi**: `@react-navigation/native` & `@react-navigation/bottom-tabs`
- **Aset Vektor**: `react-native-svg` & `react-native-svg-transformer`
- **Audio Engine**: `expo-speech`
- **Build System**: Local Android Gradle Build via NDK 27 (`compileSdkVersion 36`)

---

## 🚀 Panduan Jalankan Proyek (Development)

### 1. Prasyarat
- Node.js versi 18+
- Aplikasi **Expo Go** pada HP Android/iOS (opsional untuk pengujian cepat).

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Server Dev
```bash
npx expo start
```
*Pindai (scan) QR Code yang muncul menggunakan aplikasi Expo Go di HP kamu.*

---

## 📦 Panduan Build APK Lokal via Gradle

Sesuai aturan proyek, build APK wajib dilakukan secara **lokal via Gradle** (tanpa `eas build`).

### 1. Sinkronisasi Native Android
```bash
npx expo prebuild --platform android --no-install
```

### 2. Jalankan Build Release APK
```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "D:\Android\sdk"
.\gradlew.bat assembleRelease
```

### 3. Lokasi File APK Hasil Build
Setelah kompilasi selesai, file APK siap pakai berukuran **~40 MB** berada di:
```text
android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

---

## 📖 Pedoman & Dokumentasi Lanjutan

- Untuk aturan **Git Push** dan pedoman upgrade versi tanpa error, silakan merujuk ke dokumen:
  👉 [`Task-upgrade.md`](./Task-upgrade.md)

---

## 📄 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran dan pengembangan mandiri.
