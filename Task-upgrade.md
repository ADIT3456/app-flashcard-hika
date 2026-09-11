## 1. 🛡️ Pedoman Upgrade Aplikasi Kedepannya (Mencegah Error)

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

#
### 🔴 Aturan 1: Dilarang Commit File Build & Temporary (Cek `.gitignore`)
Pastikan file berikut **TIDAK TERCOMMIT** ke Git:
- `android/app/build/` dan `android/.gradle/` (Folder kompilasi APK)
- `android/local.properties` (Path SDK lokal komputer)
- `.expo/` dan `node_modules/`
- Keyfile / Keystore sensitif (`*.keystore`, `*.jks`)
- Folder raw SVG ekstra di luar assets (`/hiragana/`, `/katakana/`)

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


### 🟢 Aturan 4: Single Responsibility Branching
- Pengerjaan fitur baru sebaiknya dilakukan pada cabang fitur dan di-merge ke branch `main` hanya setelah kompilasi APK lokal dinyatakan **BUILD SUCCESSFUL**.
