# Cấu Hình & Mã Nguồn Native Android (Templates) Cho Mốc MOB-02

Thư mục này chứa mã nguồn native và cấu hình build đã được kiểm chứng cho việc tích hợp mô hình AI On-Device FP32 (ViT ONNX và Fusion TFLite) trên Android.

Do thư mục `mobile/android/` bị Git bỏ qua (`.gitignore`) để tránh lưu trữ các file build và thư viện nhị phân tạm thời, toàn bộ mã nguồn native cần thiết được lưu trữ tại đây nhằm đảm bảo tính tái tạo 100% trong Git.

## 1. Danh sách tệp

- `LungCtPipelineModule.kt`: React Native Module viết bằng Kotlin, triển khai toàn bộ pipeline tiền xử lý ảnh (Pillow Nearest Resampling, chuẩn hóa FP32), chạy suy luận song song qua ONNX Runtime Android & LiteRT (TensorFlow Lite), và hỗ trợ giải mã từ URI `content://` hoặc đường dẫn tệp.
- `LungCtNativePackage.kt`: Đăng ký `LungCtPipelineModule` vào hệ thống React Package.
- `MainApplication.kt`: Mẫu đăng ký gói native vào danh sách package của ứng dụng Expo/React Native.
- `build.gradle`: Cấu hình build cấp ứng dụng (`mobile/android/app/build.gradle`), bao gồm:
  - ONNX Runtime Android: `com.microsoft.onnxruntime:onnxruntime-android:1.31.0`
  - TensorFlow Lite (LiteRT): `com.google.ai.edge.litert:litert-api:1.4.0` và `litert:1.4.0`
  - Cờ liên kết JNI: `useLegacyPackaging = true`
  - Cờ không nén tài nguyên mô hình: `noCompress 'tflite', 'onnx', 'data'`
- `proguard-rules.pro`: Quy tắc bảo vệ (keep rules) cho ProGuard/R8 khi build Release APK: giữ lại các lớp `ai.onnxruntime.**`, `org.tensorflow.lite.**`, và `com.anonymous.mobile.LungCtPipelineModule`.
- `gradle.properties`: Cấu hình JVM, Hermes engine, và AndroidX.

## 2. Quy trình tái tạo sau khi chạy `npx expo prebuild`

1. Chạy lệnh sinh lại thư mục android nếu bắt đầu từ máy mới:
   ```bash
   cd mobile
   npx expo prebuild --platform android --clean
   ```

2. Khôi phục các tệp cấu hình và mã nguồn native:
   ```powershell
   Copy-Item mobile\native-templates\android\build.gradle mobile\android\app\build.gradle
   Copy-Item mobile\native-templates\android\proguard-rules.pro mobile\android\app\proguard-rules.pro
   Copy-Item mobile\native-templates\android\gradle.properties mobile\android\gradle.properties
   Copy-Item mobile\native-templates\android\LungCtPipelineModule.kt mobile\android\app\src\main\java\com\anonymous\mobile\LungCtPipelineModule.kt
   Copy-Item mobile\native-templates\android\LungCtNativePackage.kt mobile\android\app\src\main\java\com\anonymous\mobile\LungCtNativePackage.kt
   Copy-Item mobile\native-templates\android\MainApplication.kt mobile\android\app\src\main\java\com\anonymous\mobile\MainApplication.kt
   ```

3. Khôi phục model weights vào `mobile/android/app/src/main/assets/models/`:
   - Sinh mô hình từ Python:
     ```bash
     python ai/conversion/convert_vit_to_onnx.py
     python ai/conversion/convert_to_tflite.py
     ```
   - Sao chép vào thư mục assets:
     ```powershell
     New-Item -ItemType Directory -Force -Path mobile\android\app\src\main\assets\models
     Copy-Item ai\conversion\vit_cls.onnx mobile\android\app\src\main\assets\models\vit_cls.onnx
     Copy-Item ai\conversion\vit_cls.onnx.data mobile\android\app\src\main\assets\models\vit_cls.onnx.data
     Copy-Item ai\conversion\fusion_model.tflite mobile\android\app\src\main\assets\models\fusion_model.tflite
     ```

4. Build lại APK release hoặc debug:
   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```
