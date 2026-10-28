# BẢNG ĐỐI CHIẾU TOÀN DIỆN: ANDROID (WINDOWS) VS IOS (MACOS)
### Tài liệu phân tích và đối sánh kỹ thuật giữa hai nền tảng triển khai LungCT

> **Người thực hiện**:
> - Phân hệ Android: Dương Thị Thu Diễm
> - Phân hệ iOS: Dương Hải Đăng  
> **Mục đích**: Giúp người học và Hội đồng đánh giá thấy rõ điểm tương đồng (tận dụng React Native cross-platform) và điểm dị biệt sâu sắc (tầng native, build tool, cơ chế quản lý khóa phần cứng, runtime AI).

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC VÀ TỶ LỆ DÙNG CHUNG MÃ NGUỒN

```
+-------------------------------------------------------------------+
|               REACT NATIVE & TYPESCRIPT APPLICATION               |
|      (100% Dùng chung: UI Components, Theme, State, Repository)    |
+---------------------------------+---------------------------------+
|         ANDROID NATIVE          |           IOS NATIVE            |
|       (Kotlin / C++ / JNI)      |     (Swift / Objective-C)       |
+---------------------------------+---------------------------------+
| • Build: Gradle 8.x + ProGuard  | • Build: Xcode 15/16 + CocoaPods|
| • Keystore: AndroidKeyStore     | • Keychain: Apple Keychain Serv |
| • AI Runtime: ONNX Runtime C++  | • AI Runtime: CoreML / ONNX iOS |
| • Database: SQLCipher AAR       | • Database: SQLCipher CocoaPod  |
| • Packaging: APK / AAB          | • Packaging: .app / .ipa        |
+---------------------------------+---------------------------------+
|       MEDIA TEK HELIO G91       |       APPLE BIONIC / ANE        |
|    (CPU ARM Cortex-A75 / A55)   |     (Apple Silicon CPU + NPU)   |
+---------------------------------+---------------------------------+
```

- **Tỷ lệ mã nguồn dùng chung (Common Codebase)**: ~82% tổng số dòng mã (toàn bộ thư mục `src/`, bao gồm `features/`, `ui/`, `services/`, `i18n/`, `config/`).
- **Tỷ lệ mã nguồn native riêng biệt (Platform-specific Code)**: ~18% (gồm cấu hình dự án, native modules, script biên dịch và quản lý khóa phần cứng).

---

## 🔍 2. BẢNG SO SÁNH CHI TIẾT TỪNG THÀNH PHẦN KỸ THUẬT

| Tiêu chí | Phân hệ Android (Windows) | Phân hệ iOS (macOS) | Ghi chú & Khuyến nghị |
| :--- | :--- | :--- | :--- |
| **Hệ điều hành máy dev** | Windows 10/11 64-bit | macOS Sonoma / Sequoia | iOS bắt buộc phải có máy tính macOS để chạy Xcode và CocoaPods. |
| **Terminal & Shell** | PowerShell 7 / Windows Terminal | Zsh / Bash trên macOS Terminal | Chú ý khác biệt cú pháp: PowerShell dùng `$env:VAR`, macOS dùng `export VAR`. |
| **Ngôn ngữ Native** | Kotlin & C++ (qua JNI) | Swift & Objective-C | React Native Bridge kết nối JS/TS với Native tương ứng. |
| **Công cụ Quản lý Gói Native** | Gradle (qua file `build.gradle`) | CocoaPods (qua file `Podfile`) | Android tải dependencies từ Maven Central/Google, iOS tải từ CocoaPods Specs. |
| **IDE Native chính thức** | Android Studio (Koala / Ladybug) | Xcode (15.x / 16.x) | Cả hai đều hỗ trợ chỉnh sửa mã native và theo dõi Logcat / Console. |
| **Máy ảo kiểm thử** | Android Emulator (AVD: `LumaCT_Phone`) | iOS Simulator (iPhone 15 / 16 Pro) | Máy ảo Android là máy ảo đầy đủ (QEMU virtualization); Simulator là giả lập hành vi hệ điều hành. |
| **Thiết bị thật mục tiêu** | **Xiaomi Redmi 13** (Helio G91-Ultra) | **iPhone** (iOS 17/18, Apple A-Series) | Android cần bật USB Debugging; iOS cần tin cậy chứng chỉ Developer trong Cài đặt chung. |
| **Mã ký ứng dụng (Code Signing)** | Keystore file (`.keystore` / `.jks`) + `apksigner` | Apple Developer Certificate + Provisioning Profile | iOS kiểm soát chặt chẽ việc ký app: tài khoản miễn phí chỉ chạy được 7 ngày trên máy thật. |
| **Quản lý Khóa Bí mật** | `AndroidKeyStore` Provider (AES-256) | Apple Keychain Services API (kSecClassGenericPassword) | Cả hai đều mã hóa khóa ngoài tầm với của ứng dụng người dùng thông thường. |
| **Bảo vệ CSDL Cục bộ** | SQLCipher 4.6.1 (`net.zetetic:sqlcipher-android`) | SQLCipher CocoaPod (`pod 'SQLCipher'`) | Cùng chia sẻ chuẩn mã hóa cấp trang AES-256-CBC, PBKDF2 64.000 vòng, HMAC-SHA512. |
| **Runtime AI On-Device** | ONNX Runtime C++ (`onnxruntime-android`) & LiteRT | CoreML (`.mlpackage`) hoặc ONNX Runtime iOS | Android đã kiểm chứng mô hình FP32; iOS đang khảo sát tối ưu CoreML qua Neural Engine. |
| **Định dạng file đóng gói** | APK (`.apk`) / Android App Bundle (`.aab`) | iOS App Archive (`.xcarchive`) / IPA (`.ipa`) | APK cài đặt trực tiếp qua `adb install`; IPA cần TestFlight hoặc cấu hình Enterprise/Ad-Hoc. |
| **Giới hạn bộ nhớ & Nền** | Bị hạn chế bởi cơ chế pin MIUI/HyperOS (OOM killer) | Bị kiểm soát gắt gao bởi Jetsam memory monitor của iOS | Cả hai đều cần giải phóng tensor AI ngay sau khi suy luận để tránh crash. |

---

## ⚡ 3. ĐỐI CHIẾU LỆNH THAO TÁC THƯỜNG DÙNG

| Thao tác | Lệnh trên Windows (Android) | Lệnh trên macOS (iOS) |
| :--- | :--- | :--- |
| **Kiểm tra thiết bị kết nối** | `adb devices` | `xcrun simctl list devices` (hoặc `ios-deploy -c`) |
| **Cài đặt thư viện native** | Tự động cấu hình qua Gradle khi build | `cd ios && pod install` |
| **Chạy ứng dụng chế độ dev** | `npx react-native run-android` | `npx react-native run-ios` |
| **Xem log thời gian thực** | `adb logcat -s "ReactNativeJS"` | `xcrun simctl spawn booted log stream --predicate 'process == "LumaCT"'` |
| **Biên dịch bản Release** | `cd android && ./gradlew assembleRelease` | `xcodebuild -workspace LumaCT.xcworkspace -scheme LumaCT -configuration Release archive` |
| **Gỡ cài đặt ứng dụng** | `adb uninstall com.anonymous.mobile` | `xcrun simctl uninstall booted com.anonymous.mobile` |
