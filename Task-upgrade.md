# 📋 Laporan Technical Engineering & Rulebook Project `flashcard-mobile`

---

## 1. ✂️ Ponytail Review (Audit Over-Engineering Kode)

- `navigation/AppNavigator.js:L5`: `delete:` import `Text` yang tidak digunakan. Hapus import.
- `screens/HomeScreen.js:L31,L37`: `shrink:` ternary fallback SvgComponent. Langsung render `<HiraganaSvg />` karena data SVG statis.

---

## 2. 🛡️ Pedoman Upgrade Aplikasi Kedepannya (Mencegah Error)

Untuk memastikan upgrade versi Expo / React Native / Fitur baru berjalan mulus tanpa error "mental" atau crash:

1. **Jaga Lingkungan Native (Lokal Gradle Only)**:
   - Tetap gunakan **SDK 36** (`compileSdkVersion 36`, `targetSdkVersion 36`) & **JDK 17** (Temurin di `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`).
   - `ANDROID_HOME` wajib mengarah ke `D:\Android\sdk`.
   - **TIDAK BOLEH** menggunakan `eas build` (sesuai aturan proyek).

2. **Integritas NDK & Biner C++ (`.so`)**:
   - Pastikan NDK 27 (`27.1.12297006`) selalu terpasang di `D:\Android\sdk\ndk\27.1.12297006`.
   - Jangan mematikan blok `externalNativeBuild` CMake di modul native agar file biner `.so` (`libexpo-modules-core.so`, `librnscreens.so`) selalu terkemas dalam APK sehingga aplikasi **tidak mental/crash saat dibuka**.

3. **Optimasi Ukuran APK (ABI Splitting)**:
   - Pertahankan konfigurasi `splits` pada `android/app/build.gradle` agar ukuran APK yang didistribusikan tetap ringan (**~40 MB** untuk `arm64-v8a`) dibanding APK Universal 119 MB.

4. **Sinkronisasi Prebuild saat Upgrade Package**:
   - Setiap kali menambah modul baru di `package.json` yang memiliki komponen native, selalu jalankan:
     ```bash
     npx expo prebuild --platform android --no-install
     ```
     sebelum menjalankan `./gradlew.bat assembleRelease`.

---

## 3. 🚨 Aturan Wajib Saat Git Push (Git Push Rules)

Sebelum melakukan `git push` ke repositori, pengembang wajib mematuhi **4 Aturan Utama**:

### 🔴 Aturan 1: Dilarang Commit File Build & Temporary (Cek `.gitignore`)
Pastikan file berikut **TIDAK TERCOMMIT** ke Git:
- `android/app/build/` dan `android/.gradle/` (Folder kompilasi APK)
- `android/local.properties` (Path SDK lokal komputer)
- `.expo/` dan `node_modules/`
- Keyfile / Keystore sensitif (`*.keystore`, `*.jks`)

### 🟡 Aturan 2: Verifikasi Kode Sebelum Push (Pre-Push Check)
Jalankan verifikasi lokal terlebih dahulu:
```bash
# 1. Pastikan JS bundle tidak sintaks error
npx expo start --dry-run (atau testing cepat via Expo Go)

# 2. Pastikan build Gradle lokal berhasil tanpa error
cd android && .\gradlew.bat assembleRelease
```

### 🔵 Aturan 3: Format Pesan Commit Ringkas & Jelas (Conventional Commits)
Gunakan prefix standar pada commit message:
- `feat:` Tambah fitur baru (contoh: `feat: tambah kuis katakana`)
- `fix:` Perbaikan bug (contoh: `fix: atasi card SVG scaling`)
- `build:` Perubahan konfigurasi native/gradle (contoh: `build: aktifkan abi splits 40mb`)
- `refactor:` Penyederhanaan kode tanpa mengubah fitur.

### 🟢 Aturan 4: Single Responsibility Branching
- Pengerjaan fitur baru sebaiknya dilakukan pada cabang fitur (contoh: `feature/quiz-system`) dan di-merge ke branch `main` hanya setelah kompilasi APK lokal dinyatakan **BUILD SUCCESSFUL**.
