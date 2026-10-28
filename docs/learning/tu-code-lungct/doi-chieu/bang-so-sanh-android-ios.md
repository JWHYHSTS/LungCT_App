# BẢNG ĐỐI CHIẾU TOÀN DIỆN: ANDROID (WINDOWS) VS IOS (MACOS)
### Tài liệu phân tích và đối sánh kỹ thuật giữa hai nền tảng triển khai LungCT

> **Người thực hiện**:
> - Phân hệ Android: Dương Thị Thu Diễm (MSSV: 49.01.103.011)
> - Phân hệ iOS: Dương Hải Đăng (MSSV: 49.01.103.020)  
> **Mục đích**: Giúp người học và Hội đồng đánh giá thấy rõ điểm tương đồng (tận dụng React Native cross-platform cho toàn bộ giao diện và logic dữ liệu) và điểm dị biệt sâu sắc (tầng native, build tool, cơ chế quản lý khóa phần cứng, runtime AI).

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC VÀ MỨC ĐỘ DÙNG CHUNG MÃ NGUỒN

```
+-------------------------------------------------------------------+
|               REACT NATIVE & TYPESCRIPT APPLICATION               |
|   (Dùng chung tầng logic: 17 Màn hình, Theme, Storage Repository)  |
+---------------------------------+---------------------------------+
|         ANDROID NATIVE          |           IOS NATIVE            |
|       (Kotlin / C++ / JNI)      |     (Swift / Objective-C)       |
+---------------------------------+---------------------------------+
| • Build: Gradle 8.x + ProGuard  | • Build: Xcode 15/16 + CocoaPods|
| • Keystore: AndroidKeyStore     | • Keychain: Apple Keychain Serv |
| • AI Runtime: ONNX Runtime C++  | • AI Runtime: Đang khảo sát     |
| • Database: SQLCipher AAR       | • Database: Định hướng SQLCipher|
| • Packaging: APK / AAB          | • Packaging: .app / .ipa        |
+---------------------------------+---------------------------------+
|   XIAOMI REDMI 13 (HELIO G91)   |       IPHONE (APPLE A-SERIES)   |
|   (Android 14 API 34 thực tế)   |   (Khảo sát lý thuyết đồ án)    |
+---------------------------------+---------------------------------+
```

- **Phần dùng chung (Cross-Platform)**: Toàn bộ mã nguồn thư mục `src/` (bao gồm `features/`, `ui/`, `services/storage/`, `services/ai/types.ts`, `i18n/`, `config/`) và cấu hình `app.json`.
- **Phần viết riêng theo nền tảng (Platform-Specific Native)**:
  - Phân hệ Android: Thư mục `android/` chứa `build.gradle`, `NativeCryptoVaultModule.kt`, `AndroidManifest.xml`, thư viện native AAR của SQLCipher và ONNX Runtime.
  - Phân hệ iOS: Định hướng cấu hình `ios/Podfile`, thư viện CocoaPods và cầu nối native Objective-C/Swift tương ứng.

---

## 🔍 2. BẢNG SO SÁNH CHI TIẾT TỪNG THÀNH PHẦN KỸ THUẬT

| Tiêu chí | Phân hệ Android (Windows) | Phân hệ iOS (macOS) | Ghi chú & Đối chiếu thực tế |
| :--- | :--- | :--- | :--- |
| **Hệ điều hành máy dev** | Windows 10/11 64-bit | macOS Sonoma (14.x) / Sequoia (15.x) | iOS bắt buộc phải có máy Mac để chạy Xcode và CocoaPods. |
| **Terminal & Shell** | PowerShell 7 / Windows Terminal | Zsh / Bash trên macOS Terminal | Cú pháp biến môi trường: Windows dùng `$env:VAR`, macOS dùng `export VAR`. |
| **Ngôn ngữ Native** | Kotlin & C++ (qua JNI) | Swift & Objective-C | React Native kết nối JS/TS với Native qua Native Modules / Nitro Modules. |
| **Công cụ Quản lý Gói Native** | Gradle (qua file `build.gradle`) | CocoaPods (qua file `Podfile`) | Android lấy thư viện từ Maven Central/Google, iOS lấy từ CocoaPods Specs. |
| **IDE Native chính thức** | Android Studio (Koala / Ladybug) | Xcode (15.x / 16.x) | Cả hai đều hỗ trợ chỉnh sửa mã native và theo dõi Logcat / Console. |
| **Máy ảo kiểm thử** | Android Emulator (AVD: `LumaCT_Phone`, API 34) | iOS Simulator (iPhone 15 / 16 Pro) | Máy ảo Android là ảo hóa QEMU phần cứng; Simulator là giả lập hành vi hệ điều hành cấp ứng dụng. |
| **Thiết bị thật mục tiêu** | **Xiaomi Redmi 13** (Helio G91-Ultra) | **iPhone** (iOS 17/18, Apple A-Series) | Android cần bật USB Debugging; iOS cần tin cậy chứng chỉ Developer trong Cài đặt chung. |
| **Mã ký ứng dụng (Code Signing)** | Keystore file (`debug.keystore` / `.jks`) | Apple Developer Certificate + Provisioning Profile | Tài khoản cá nhân miễn phí của Apple chỉ chạy app được tối đa 7 ngày trên iPhone thật. |
| **Quản lý Khóa Bí mật** | `AndroidKeyStore` Provider (AES-256) | Apple Keychain Services API (kSecClassGenericPassword) | Cả hai đều bảo vệ khóa ngoài tầm truy cập của người dùng thông thường. |
| **Bảo vệ CSDL Cục bộ** | SQLCipher 4.6.1 (`net.zetetic:sqlcipher-android`) | Định hướng SQLCipher CocoaPod (`pod 'SQLCipher'`) | Chia sẻ cùng chuẩn mã hóa cấp trang AES-256-CBC, PBKDF2 và HMAC-SHA512. |
| **Runtime AI On-Device** | ONNX Runtime C++ (`1.31.0`) & LiteRT (`1.4.0`) | **Đang trong giai đoạn khảo sát lý thuyết** (đối chiếu CoreML vs ONNX Runtime iOS) | Phân hệ Android đã kiểm chứng mô hình FP32 trên máy ảo; iOS chưa có mã native triển khai thực tế. |
| **Định dạng file đóng gói** | APK (`.apk`) / Android App Bundle (`.aab`) | iOS App Archive (`.xcarchive`) / IPA (`.ipa`) | APK cài đặt trực tiếp qua `adb install`; IPA cần TestFlight hoặc cấu hình cá nhân. |

---

## ⚡ 3. ĐỐI CHIẾU LỆNH THAO TÁC THƯỜNG DÙNG

| Thao tác | Lệnh trên Windows PowerShell (Android) | Lệnh trên macOS Terminal (iOS) |
| :--- | :--- | :--- |
| **Kiểm tra thiết bị kết nối** | `adb devices` | `xcrun simctl list devices` (hoặc `ios-deploy -c`) |
| **Cài đặt thư viện native** | Tự động cấu hình qua Gradle khi build | `cd ios && pod install` |
| **Chạy ứng dụng chế độ dev** | `npx react-native run-android` | `npx react-native run-ios` |
| **Xem log thời gian thực** | `adb logcat -s "ReactNativeJS"` | `xcrun simctl spawn booted log stream --predicate 'process == "mobile"'` |
| **Biên dịch bản Release** | `cd android && .\gradlew.bat assembleRelease` | `xcodebuild -workspace mobile.xcworkspace -scheme mobile -configuration Release archive` |
| **Gỡ cài đặt ứng dụng** | `adb uninstall com.anonymous.mobile` | `xcrun simctl uninstall booted com.anonymous.mobile` |

---

## 📊 4. TRẠNG THÁI TRIỂN KHAI THỰC TẾ CỦA HAI PHÂN HỆ

1. **Phân hệ Android (Dương Thị Thu Diễm)**:
   - *Đã thực hiện và kiểm chứng*: Đã cấu hình hoàn chỉnh Gradle, biên dịch thành công APK Release độc lập (`app-release.apk`), cài đặt và chạy trên máy ảo Android API 34. Tích hợp hoàn tất SQLCipher 4.6.1 mã hóa toàn bộ tệp nhị phân cấp trang, cơ chế bảo vệ bản sao lưu `.encrypted.bak`, và suy luận AI FP32 On-Device.
   - *Đang chuẩn bị*: Cài đặt và đo kiểm các chỉ số thực tế (RAM, nhiệt độ, FPS) trên điện thoại Xiaomi Redmi 13 thật.
2. **Phân hệ iOS (Dương Hải Đăng)**:
   - *Đã thực hiện*: Đồng bộ 100% tầng giao diện và logic dữ liệu React Native (vượt qua 16 test suites Jest), hoàn thiện khảo sát lý thuyết kiến trúc CoreML vs ONNX Runtime iOS trong bản thảo khóa luận.
   - *Hiện trạng trung thực*: Hiện tại nhóm chưa có máy tính macOS và thiết bị iPhone vật lý để biên dịch mã native iOS; các hướng dẫn iOS được xây dựng dựa trên đối chiếu tài liệu chính thức của Apple Developer và React Native.
