# LỘ TRÌNH TỰ CODE LUNGCT TRÊN ANDROID (WINDOWS)

> **Môi trường phát triển**: Windows 10/11 64-bit  
> **Thiết bị kiểm thử mục tiêu**: Máy ảo Android Studio (`LumaCT_Phone`, API 34) & Thiết bị thực tế **Xiaomi Redmi 13** (Android 14, HyperOS, MediaTek Helio G91-Ultra)  
> **Đối tượng người học**: Đã nắm C++ cơ bản và một ít Python; bắt đầu từ thư mục trống hoàn toàn.

---

## 📊 BẢNG TỔNG THỂ LỘ TRÌNH THỰC HÀNH ANDROID

| Mã bước | Mục tiêu | Vì sao cần bước này | Công cụ & Phiên bản | Thư mục / Tệp cần tạo hoặc sửa | Lệnh chạy & Kiểm tra | Tiêu chí đạt để chuyển bước sau | Trạng thái | Môi trường đã kiểm chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **AND-01** | Cài đặt môi trường Node, JDK, Android Studio, SDK | Tạo nền tảng biên dịch và máy ảo trên Windows | Node.js v20 LTS, JDK 17, Android SDK 34, Android Studio Ladybug/Koala | Biến môi trường hệ thống (`ANDROID_HOME`, `JAVA_HOME`, `Path`) | `node -v`<br>`javac -version`<br>`adb version` | Các lệnh in đúng phiên bản, không báo unrecognized command | Đã kiểm chứng | Windows 11 64-bit |
| **AND-02** | Khởi tạo dự án thực hành ngắn & cấu hình dự án | Tránh lỗi đường dẫn dài `MAX_PATH` (> 260 ký tự) và xung đột OneDrive | React Native 0.88.0, Expo SDK 52 | `C:\Practice_LungCT\` | `npx create-expo-app@latest . -t blank-typescript` | Tạo thư mục thành công, `package.json` đủ dependencies | Đã kiểm chứng | Windows 11, thư mục `C:\LungCT` |
| **AND-03** | Thiết lập Design System Tokens & Typography | Đồng bộ màu sắc, khoảng cách, font chữ theo chuẩn y tế | TypeScript 5.3+, React Native | `src/ui/theme/colors.ts`<br>`src/ui/theme/spacing.ts`<br>`src/ui/theme/typography.ts` | `npm run typecheck` | Không có lỗi kiểu dữ liệu TypeScript, export đủ tokens | Đã kiểm chứng | Node.js Jest Sandbox |
| **AND-04** | Xây dựng bộ UI Components dùng chung (Atoms/Molecules) | Tái sử dụng nút bấm, ô nhập, thanh công cụ, không lặp code | React Native Vanilla CSS/StyleSheet | `src/ui/components/Button.tsx`<br>`src/ui/components/SearchField.tsx`<br>`src/ui/components/TopBar.tsx` | `npm test -- --testPathPattern=components` | 100% tests component giao diện pass, render đúng style | Đã kiểm chứng | Jest Sandbox (113 UI tests) |
| **AND-05** | Dựng hệ thống màn hình & Điều hướng (React Navigation) | Kết nối luồng màn hình: Đăng nhập, Bác sĩ, Kỹ thuật viên | React Navigation 6.x | `src/navigation/RootNavigator.tsx`<br>`src/navigation/DoctorStack.tsx` | `npm start` | Chuyển đổi màn hình mượt mà, không bị crash | Đã kiểm chứng | Máy ảo `LumaCT_Phone` |
| **AND-06** | Xây dựng Tầng Dữ liệu Cục bộ & Repository Pattern | Lưu trữ thông tin bệnh nhân, ca bệnh, đáp ứng AUTH-08 khi khóa tài khoản | SQLite / AsyncStorage, TypeScript | `src/services/storage/patientRepository.ts`<br>`src/services/storage/caseRepository.ts` | `npm test -- --testPathPattern=repository` | Tạo mới, sửa, xóa, tìm kiếm ca bệnh hoạt động chuẩn | Đã kiểm chứng | 146/146 tests Jest pass |
| **AND-07** | Tích hợp CSDL Mã hóa Toàn phần SQLCipher 4.6.1 | Bảo vệ toàn bộ tệp nhị phân SQLite trên bộ nhớ flash của máy | SQLCipher 4.6.1, Android Keystore | `android/app/build.gradle`<br>`NativeCryptoVaultModule.kt` | `adb logcat \| grep SQLCipher` | CSDL được mã hóa cấp trang, mở đúng passphrase, từ chối sai passphrase | Đã kiểm chứng | Máy ảo `LumaCT_Phone` (API 34) |
| **AND-08** | Cơ chế Sao lưu An toàn & Mã hóa Backup (.encrypted.bak) | Bảo vệ bản sao lưu cơ sở dữ liệu bằng AES-256-GCM qua Master Key | Android Keystore AES-256-GCM | `NativeCryptoVaultModule.kt`<br>`cryptoVault.ts` | `npm test -- --testPathPattern=sqlcipherVault` | Tạo file backup mã hóa có header `LCBK`, quét chuỗi 0 byte plaintext | Đã kiểm chứng | Máy ảo `LumaCT_Phone` |
| **AND-09** | Tích hợp Pipeline AI On-Device FP32 (ONNX Runtime / LiteRT) | Chạy mô hình phân loại nốt phổi ngoại tuyến không cần Internet | ONNX Runtime 1.31.0, Pillow-Nearest-v1 | `src/services/ai/onDevicePipeline.ts`<br>`AIImageResultScreen.tsx` | `npm test -- --testPathPattern=onDevicePipeline` | Trả về 3 xác suất đầu ra (Lành tính, Ác tính, Bình thường), durationMs thực tế | Đã kiểm chứng | Jest Sandbox & Máy ảo |
| **AND-10** | Đóng gói APK Release độc lập & Đo kiểm trên Redmi 13 | Kiểm thử ứng dụng thực tế trên thiết bị mục tiêu Helio G91-Ultra | Gradle 8.x, adb | `android/app/build/outputs/apk/release/app-release.apk` | `gradlew assembleRelease`<br>`adb install -r app-release.apk` | Cài đặt thành công, app chạy offline mượt mà, RAM < 450MB | Đang chuẩn bị | Đã build thử bản máy ảo |

---

## 📖 CÁC BÀI HƯỚNG DẪN CHI TIẾT

- [Bài 1: Cài đặt Môi trường Windows và Android Studio từ con số 0](01-cai-dat-moi-truong-windows.md)
- [Bài 2: Tích hợp AI On-Device FP32 và SQLCipher Native](02-native-ai-va-sqlcipher.md)
- [Bài 3: Đóng gói và Nghiệm thu Thực tế trên Xiaomi Redmi 13](03-dong-goi-va-nghiem-thu-redmi13.md)
