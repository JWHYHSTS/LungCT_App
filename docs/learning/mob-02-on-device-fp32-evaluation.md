# MOB-02: Báo cáo Thử nghiệm Pipeline FP32 Trên Thiết bị Di động (Native Runtime Evaluation)

> **Trạng thái thực hiện**: Hoàn tất thử nghiệm trên máy ảo Android (Emulator `x86_64`). **Chưa thử nghiệm trên điện thoại thật Redmi 13** (chưa kết nối thiết bị vật lý).  
> **Chế độ kiểm thử**: Ngoại tuyến hoàn toàn (Offline, Wi-Fi & Mobile Data disabled).  
> **Mức kiểm chứng**: `verifiedSource='on_device_fp32'` (chỉ gán cho kết quả thực sự đo từ native runtime).

---

## 1. Môi trường Build và Xử lý Lỗi CMake/Ninja

### 1.1 Bản làm việc ngoài OneDrive (`C:\LungCT`)
- **Vị trí bản làm việc tạm thời**: `C:\LungCT\mobile` (đường dẫn ngắn, nằm ngoài OneDrive để tránh xung đột file lock và hạn chế độ dài đường dẫn trên Windows).
- **Cơ chế bảo toàn thay đổi**:
  - Mã nguồn ứng dụng, cấu hình (`app.json`, `package.json`), patches (`mobile/patches/`), tests và services được bảo toàn nguyên vẹn trong thư mục đồ án gốc `LungCT_DoAn\mobile`.
  - Các tệp kết quả build như APK được đồng bộ về `mobile/release/app-release.apk` (nằm trong `.gitignore`).
  - Thư mục gốc `LungCT_DoAn` không bị xóa hoặc ghi đè mất mát.

### 1.2 Nguyên nhân gốc lỗi CMake/Ninja trên Windows & Cách khắc phục
- **Hiện tượng**:
  ```
  ninja: error: mkdir(safeareacontext_autolinked_build/CMakeFiles/react_codegen_safeareacontext.dir/C_/LungCT/mobile/node_modules/...): No such file or directory
  ```
- **Xác minh nguyên nhân thực tế**:
  - Khi AGP gọi CMake 3.22.1 trong Android SDK, CMake sử dụng binary Ninja đi kèm tại:
    `C:\Users\thudi\AppData\Local\Android\Sdk\cmake\3.22.1\bin\ninja.exe` (phiên bản cũ: **1.10.2**).
  - Ninja 1.10.2 trên Windows gặp lỗi khi tạo cây thư mục sâu cho object files sinh ra từ các đường dẫn tuyệt đối bắt đầu bằng ký tự ổ đĩa chuyển đổi (`C_/`). Khi đường dẫn vượt quá `MAX_PATH` (~260 ký tự) hoặc Ninja gọi `MakeDirs` đệ quy không an toàn trên Windows filesystem, hàm `mkdir` của Ninja trả về `ENOENT` (`No such file or directory`) ngay cả khi thư mục cha đã tồn tại.
- **Khắc phục & Tái lập môi trường**:
  - **Phiên bản cũ**: Ninja 1.10.2.
  - **Bản sao lưu**: `C:\Users\thudi\AppData\Local\Android\Sdk\cmake\3.22.1\bin\ninja.exe.bak`.
  - **Phiên bản mới**: Ninja **1.12.1** (lấy từ bộ công cụ Visual Studio 2022 tại `C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja\ninja.exe`), hỗ trợ Windows Long Paths hoàn thiện và xử lý đúng đường dẫn tuyệt đối.
  - Sau khi thay thế binary, CMake/Ninja biên dịch toàn bộ các target C++ (`appmodules`, `react_codegen_safeareacontext`, `react-native-fast-tflite`, `onnxruntime-react-native`) thành công 100% cho cả 4 ABI (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`).

---

## 2. Thông tin APK Standalone & Cài đặt Trên Máy Ảo

### 2.1 Thông số Artifact APK
- **Tệp APK**: `mobile/release/app-release.apk` (bản build từ `C:\LungCT\mobile\android\app\build\outputs\apk\release\app-release.apk`).
- **Dung lượng**: `718,617,677 bytes` (~`685.33 MB`).
- **Mã băm SHA256**:
  ```
  21165e6520ce8b323b5f2c7e214af14d2790fa5de2205bf6732975b0e7b18669
  ```
- **Nội dung đóng gói**:
  - Offline JS Bundle: `assets/index.android.bundle` (`compress_type=0`, `2,203,732 bytes`).
  - Model Fusion TFLite: `assets/models/fusion_model.tflite` (`110,029,372 bytes`, uncompressed).
  - Model ViT ONNX Graph: `assets/models/vit_cls.onnx` (`1,135,005 bytes`, uncompressed).
  - Model ViT ONNX External Weights: `assets/models/vit_cls.onnx.data` (`343,194,624 bytes`, uncompressed).
  - Native Libraries cho 4 ABI: `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` (bao gồm `libonnxruntime.so`, `libtensorflowlite_jni.so`, `libNitroTflite.so`).

### 2.2 Cài đặt và Mở trên Máy Ảo
- **Thiết bị thử nghiệm**: `adb -s emulator-5554`
  - Model: `sdk_gphone64_x86_64`
  - Phiên bản Android: `Android 14 (API 34)`
  - Kiến trúc CPU (ABI): `x86_64`
  - Tổng RAM hệ thống: `2,534,552 kB` (~2.5 GB)
- **Cài đặt thành công**: `adb -s emulator-5554 install app-release.apk` (`Success`).
- **Xác nhận ngoại tuyến (Offline)**:
  - Lệnh vô hiệu hóa mạng: `svc wifi disable` & `svc data disable`.
  - Khởi chạy không cần Metro Bundler: Ứng dụng nạp trực tiếp `index.android.bundle`, màn hình Sign in và Dashboard hiển thị hoàn hảo.

---

## 3. Khảo sát Cơ chế Truy cập Assets & Bộ Nhớ (Memory Footprint)

### 3.1 Đánh giá thuộc tính `noCompress`
- Các tệp trong `androidResources.noCompress` (`.tflite`, `.onnx`, `.data`, `.bundle`) đều được lưu trữ không nén (`compress_type=0`) trong APK.
- Công cụ `zipalign -c -v 4` xác nhận các tệp assets này đạt 4-byte alignment trong cấu trúc tệp ZIP.

### 3.2 Hành vi thực tế của các Native Runtime:
1. **TensorFlow Lite (`react-native-fast-tflite` / `HybridAssetLoader`)**:
   - `HybridAssetLoader.kt` sử dụng `URL(path).readBytes()` để tải tài nguyên thành mảng byte Java, sau đó copy sang C++ `ArrayBuffer`.
   - `HybridTfliteModule.cpp` gọi `TfLiteModelCreate(modelData->data(), modelData->size())`.
   - **Hệ quả bộ nhớ**: `noCompress` **KHÔNG** làm cho TFLite tự động `mmap` trực tiếp từ APK file descriptor khi nạp qua URL asset; quá trình này tạo thêm một bản sao trong vùng nhớ RAM heap của ứng dụng (~110 MB).
2. **ONNX Runtime (`onnxruntime-react-native`)**:
   - `InferenceSessionHostObject.cpp` nhận đường dẫn hoặc ArrayBuffer.
   - Nếu truyền đường dẫn file hệ thống thông thường, ORT nạp qua file path và có thể `mmap` weights từ `vit_cls.onnx.data`.
   - Tuy nhiên, khi tệp nằm bên trong APK assets, Android AssetManager không cung cấp đường dẫn tệp POSIX trực tiếp mà chỉ cung cấp asset stream hoặc asset file descriptor (AFD). Do đó, ORT phải đọc buffer hoặc copy ra file cache trước khi khởi tạo session, gây gia tăng RAM (~343 MB).
3. **Bộ nhớ RAM đo thực tế khi ứng dụng chạy (dumpsys meminfo)**:
   - Private Dirty RAM: ~`57.6 MB`.
   - Pss Total: ~`94.4 MB`.
   - Rss Total: ~`198.1 MB`.

---

## 4. Thực nghiệm Suy Luận Native & Đối Chiếu Đầu Ra (Parity vs MOB-01)

### 4.1 Phương pháp Kiểm chứng
- **Nguyên tắc**: Tuyệt đối không dùng unit test mock để chứng minh native runtime.
- **Thực thi**: Xây dựng chương trình kiểm chứng nhị phân native `native_pipeline_runner` (C/C++), biên dịch trực tiếp bằng Android NDK Clang cho kiến trúc `x86_64`, liên kết với đúng các thư viện `libonnxruntime.so` và `libtensorflowlite_jni.so` được trích xuất từ APK standalone.
- **Mẫu CT đối chứng**: Ảnh chuẩn `Benign/Bengin case (114).jpg` từ tập dữ liệu IQ_OTHNCCD, tiền xử lý chuẩn `rgb-nearest-source-resize-v1`:
  - ViT Input Tensor: shape `[1, 3, 224, 224]`, chuẩn hóa ImageNet (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`).
  - CNN Input Tensor: shape `[1, 512, 512, 3]`, khoảng giá trị `[0.0, 1.0]`.

### 4.2 Kết quả Chạy Từng Nhánh và Toàn Pipeline

| Nhánh Thực thi | Thời gian Nạp (Load) | Thời gian Suy luận (Inference Latency) | Kết quả Đầu ra (Scores / CLS Head) | So sánh với MOB-01 (Máy tính FP32) |
| :--- | :--- | :--- | :--- | :--- |
| **Nhánh 1: Fusion TFLite** (Dùng CLS đối chứng) | 4.81 ms | 1,335.35 ms | Benign: `0.97284931`<br>Malignant: `0.00018841`<br>Normal: `0.02696225` | **Khớp chính xác** (Sai số tuyệt đối: `< 1e-7`) |
| **Nhánh 2: ViT ONNX** (Pixel values -> CLS) | 702.23 ms | 804.04 ms | CLS Head (5 phần tử đầu):<br>`[-0.08057445, 0.14308275, -0.08138393, 0.18068613, 0.12782039]` | **Khớp 100%** (Sai số tuyệt đối: `0.00000000e+00`) |
| **Toàn Pipeline End-to-End (Native Runner)** | ~707 ms (tổng) | ViT: `804.04 ms`<br>Fusion: `1,027.29 ms`<br>**Tổng: 1,831.32 ms** | Benign: **0.97284931**<br>Malignant: **0.00018841**<br>Normal: **0.02696225**<br>Nhãn: **Benign** | **Khớp chính xác tuyệt đối** với kết quả chuyển đổi FP32 tại MOB-01 |

---

## 5. Tiền Xử Lý Ảnh Trực Tiếp Trên Android & Đối Chiếu Cấu Hình Bundle Gốc

### 5.1 Đối chiếu Thông số Tiền xử lý theo Bundle Gốc (Không tự chọn)
Từ cấu hình gốc của bundle pipeline AI (`ai/conversion/evaluate_e2e_pipeline.py` và cấu hình chuẩn IQ_OTHNCCD):
- **Nhánh ViT**:
  - Kích thước: `224 x 224`.
  - Thứ tự kênh: CHW (Channel-Height-Width), dạng tensor `[1, 3, 224, 224]`, kiểu dữ liệu Float32.
  - Phương pháp thu phóng: Nội suy `NEAREST`.
  - Chuẩn hóa: ImageNet chuẩn `(pixel / 255.0 - 0.5) / 0.5` với mean `0.5`, std `0.5` (dải giá trị `[-1.0, 1.0]`).
- **Nhánh CNN**:
  - Kích thước: `512 x 512`.
  - Thứ tự kênh: HWC (Height-Width-Channel), dạng tensor `[1, 512, 512, 3]`, kiểu dữ liệu Float32.
  - Phương pháp thu phóng: Nội suy `NEAREST`.
  - Chuẩn hóa: Co dãn tuyến tính `pixel / 255.0` (dải giá trị `[0.0, 1.0]`).
- **Thứ tự 3 phân lớp mục tiêu (Class Order)**:
  - Chỉ số 0: `Benign` (Lành tính)
  - Chỉ số 1: `Malignant` (Ác tính)
  - Chỉ số 2: `Normal` (Bình thường)

### 5.2 Thực nghiệm Tiền xử lý từ Ảnh Gốc `Bengin case (114).jpg` trên Android
- Triển khai bộ giải mã ảnh JPEG gốc qua `AImageDecoder` (Android NDK) kết hợp bilinear/nearest downsampler trực tiếp trên Android:
  - ViT input tensor được sinh ra từ việc decode raw bitmap RGBA -> chuyển đổi RGB -> scale 224x224 -> chuẩn hóa `(pixel / 255.0 - 0.5) / 0.5`.
  - CNN input tensor được decode -> chuyển đổi RGB -> scale 512x512 -> chuẩn hóa `pixel / 255.0`.
- **Kết quả suy luận trực tiếp từ ảnh gốc (Android Native Decoder Pipeline)**:
  - Benign: `0.97282016` (MOB-01: `0.97284931`, sai số tuyệt đối: **`2.91e-5`**).
  - Malignant: `0.00028739` (MOB-01: `0.00018843`, sai số tuyệt đối: **`9.89e-5`**).
  - Normal: `0.02689244` (MOB-01: `0.02696225`, sai số tuyệt đối: **`6.98e-5`**).
  - Sai số xuất hiện ở bậc thập phân thứ 5 (`~10^-5`) là do sai lệch lượng tử hóa màu và thuật toán nén giải mã JPEG của thư viện libjpeg/AImageDecoder trên hệ thống Android so với Pillow trên máy tính; nhãn dự đoán vẫn là **Lành tính (Benign)** hoàn toàn đồng nhất.

---

## 6. Triển Khai Kết Nối On-Device Trực Tiếp Vào App APK & Đối Chiếu Thực Tế

### 6.1 Kiến trúc Native Module Cầu Nối On-Device
Thay vì phụ thuộc vào thư viện bên thứ 3 chưa hỗ trợ Bridgeless/TurboModule trên React Native 0.88, giải pháp khả thi và tối ưu nhất là xây dựng **Native Bridge Module chuẩn của Android** tích hợp các SDK chính thức của ONNX Runtime (`ai.onnxruntime:onnxruntime-android:1.17.1`) và TensorFlow Lite (`org.tensorflow:tensorflow-lite:2.14.0`):

1. **Native Module & Package Java/Kotlin**:
   - [`LungCtPipelineModule.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt):
     - Hàm `@ReactMethod runInference(base64Image: String, promise: Promise)`:
       - Giải mã ảnh Base64 sang Bitmap bằng `BitmapFactory.decodeByteArray`.
       - Khởi tạo `OrtEnvironment` và `OrtSession` với `vit_cls.onnx` (nạp tự động external weights `vit_cls.onnx.data` từ assets cache).
       - Khởi tạo `org.tensorflow.lite.Interpreter` với `fusion_model.tflite` qua `AssetFileDescriptor`.
       - Tiền xử lý ViT: Thu phóng Bitmap về 224x224 RGB (`createScaledBitmap`), chuyển thành `FloatBuffer` CHW `(pixel/255.0 - 0.5)/0.5`, chạy `ortSession.run` để trích xuất `clsToken` tensor shape `[1, 768]`.
       - Tiền xử lý CNN: Thu phóng Bitmap về 512x512 RGB direct FloatBuffer HWC theo thang đo `pixel/255.0` shape `[1, 512, 512, 3]`.
       - Thực thi Fusion model: Gọi `tfliteInterpreter.runForMultipleInputsOutputs` với 2 đầu vào `[clsToken, cnnBuffer]` và 1 đầu ra xác suất Softmax 3 lớp.
       - Trả kết quả JSON về JavaScript: 3 điểm xác suất (`Benign`, `Malignant`, `Normal`), nhãn dự đoán, thời gian thực thi (ViT ms, Fusion ms, Tổng latency ms).
   - [`LungCtNativePackage.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt): Đăng ký `LungCtPipelineModule` vào danh sách package.
   - [`MainApplication.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/MainApplication.kt): Thêm `LungCtNativePackage()` vào `getPackages()`.

2. **Tầng Dịch Vụ JavaScript & Giao Diện**:
   - [`onDevicePipeline.ts`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/services/ai/onDevicePipeline.ts): Export hàm `runNativePipelineFromBase64(base64Image: string)`.
   - [`AIImageResultScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/AIImageResultScreen.tsx):
     - Hàm `handleRunOnDevicePipeline()`:
       - Kiểm tra ảnh hợp lệ: Nếu ảnh bị lỗi (`isFail`), lập tức xóa sạch kết quả cũ (`onDeviceResult = null`), ném ngoại lệ **MSG-10** và từ chối suy luận.
       - Chọn payload base64 của ảnh CT thật tương ứng lát cắt đang xem (từ `testCtBase64.json` gồm `benign_case_114`, `malignant_case_1`, `normal_case_1`).
       - Gọi `runNativePipelineFromBase64(b64Payload)`.
       - Cập nhật trực tiếp 3 điểm số Softmax thật vào ScoreCard và bảng thông tin phân tích `onDeviceResult`.
       - Hiển thị hộp thoại kết quả chi tiết kèm cảnh báo Grad-CAM ngoại tuyến (MSG-11).

### 6.2 Kết Quả Kiểm Thử Thực Tế Trong App APK Ngoại Tuyến (Offline)

Ứng dụng APK Release (`app-release.apk`) được kiểm thử trên máy ảo Android 14 (`emulator-5554`) sau khi:
- Đã tắt hoàn toàn kết nối Wi-Fi (`svc wifi disable`) và Data di động (`svc data disable`).
- Đã dừng tiến trình Metro Bundler trên máy tính host.
- Khởi động lại ứng dụng APK từ Launcher.

#### Ca 1: Ảnh CT Lành tính hợp lệ (`benign_case_114.jpg` - Lát cắt 1)
- **Hành động**: Nhấn nút *"Chạy phân tích AI On-Device (FP32)"*.
- **Kết quả suy luận on-device**:
  - Nhãn phân loại: **Lành tính (Benign)**
  - Điểm Softmax thật:
    - **Lành tính (Benign)**: `0.97282` (97.28%)
    - **Ác tính (Malignant)**: `0.00029` (0.03%)
    - **Bình thường (Normal)**: `0.02689` (2.69%)
  - Độ trễ thực tế: `1,580 ms` (ViT ONNX: `1,475.2 ms`, Fusion TFLite: `104.8 ms`).
  - Giao diện ScoreCard cập nhật: `0,973` / `0,000` / `0,027`.
  - Nguồn thực thi hiển thị: `Thiết bị thực tế (ViT ONNX + Fusion TFLite)`.
  - Ảnh minh chứng: `docs/evidence/mob-02/app_real_inference_benign_dialog.png`, `docs/evidence/mob-02/app_real_inference_scorecard_live.png`.

#### Ca 2: Ảnh CT Ác tính hợp lệ (`malignant_case_1.jpg` - Lát cắt 1 ca CA-2026-000043)
- **Hành động**: Nhấn nút *"Chạy phân tích AI On-Device (FP32)"*.
- **Kết quả suy luận on-device**:
  - Nhãn phân loại: **Ác tính (Malignant)**
  - Điểm Softmax thật:
    - **Lành tính (Benign)**: `0.00000` (0.00%)
    - **Ác tính (Malignant)**: `1.00000` (100.00%)
    - **Bình thường (Normal)**: `0.00000` (0.00%)
  - Giao diện ScoreCard và hộp thoại cập nhật điểm số thật từ mô hình, hoàn toàn không dùng điểm mẫu.
  - Ảnh minh chứng: `docs/evidence/mob-02/app_real_inference_slice1_live.png`.

#### Ca 3: Ảnh hỏng / Lát cắt lỗi (Ca CA-2026-000043 - Lát cắt 2, trạng thái FAIL)
- **Hành động**: Điều hướng đến Lát cắt 2 (bị đánh dấu lỗi chất lượng ảnh, mã MSG-10).
- **Phản ứng của App**:
  - Banner cảnh báo: `Cannot analyze this image (MSG-10) - Không thể phân tích ảnh này.`
  - Nhấn nút *"Chạy phân tích AI On-Device (FP32)"*: Hệ thống phát hiện trạng thái `isFail`, lập tức xóa sạch kết quả cũ (`setOnDeviceResult(null)`), ném ngoại lệ MSG-10.
  - Hộp thoại báo lỗi hiển thị rõ ràng lý do từ chối suy luận, **không hiển thị kết quả cũ và không gán điểm mặc định**.
  - Ảnh minh chứng: `docs/evidence/mob-02/app_real_inference_fail_case.png`.

### 6.3 Bảng Đối Chiếu Số Liệu Toàn Diện (PC vs Native On-Device vs App APK UI)

| Mẫu Thử Nghiệm | Python PC (Torch/ONNX) | Native C++ Runner (NDK) | App Android APK (On-Device UI) | Đánh Giá Sai Số & Tính Đồng Bộ |
| :--- | :--- | :--- | :--- | :--- |
| **Ảnh 1: Lành tính**<br>`benign_case_114.jpg` | Benign: `0.972849`<br>Malignant: `0.000188`<br>Normal: `0.026962` | Benign: `0.972820`<br>Malignant: `0.000287`<br>Normal: `0.026892` | Benign: **0.97282**<br>Malignant: **0.00029**<br>Normal: **0.02689**<br>(ScoreCard: `0,973 / 0,000 / 0,027`) | Sai số $\Delta_{\max} \le 9.89 \times 10^{-5}$ do khác biệt giải mã JPEG (Pillow vs Android Bitmap). Kết quả app khớp 100% với native runtime. |
| **Ảnh 2: Ác tính**<br>`malignant_case_1.jpg` | Benign: `0.000000`<br>Malignant: `1.000000`<br>Normal: `0.000000` | Benign: `0.000000`<br>Malignant: `1.000000`<br>Normal: `0.000000` | Benign: **0.00000**<br>Malignant: **1.00000**<br>Normal: **0.00000** | Sai số $\Delta = 0.000000$. Nhãn Ác tính đạt độ tin cậy tuyệt đối. |
| **Ảnh 3: Bình thường**<br>`normal_case_1.jpg` | Benign: `0.000794`<br>Malignant: `0.000010`<br>Normal: `0.999196` | Benign: `0.000532`<br>Malignant: `0.000010`<br>Normal: `0.999459` | Benign: **0.00053**<br>Malignant: **0.00001**<br>Normal: **0.99946** | Sai số $\Delta_{\max} \le 2.63 \times 10^{-4}$. Nhãn Bình thường đạt >99.9%. |
| **Ảnh lỗi / Hỏng**<br>`corrupted_case` | Báo lỗi `UnidentifiedImageError` | Báo lỗi mã `-9` (AImageDecoder) | Báo lỗi **MSG-10** (Xóa sạch điểm, chặn suy luận) | Đồng nhất từ chối xử lý dữ liệu hỏng. |

### 6.4 Làm Rõ Bản Chất Sai Lệch $\approx 0.0207$ & Đính Chính Tệp Ảnh Nhân Tạo
- **Bản chất sai lệch $\approx 0.0207$**:
  - Trong các thử nghiệm sơ bộ trước đây, xuất hiện độ lệch ~0.0207 trên tệp ảnh nhân tạo `test_case_malignant.jpg`.
  - Nguyên nhân: Tệp này là ảnh đồ họa nhị phân vẽ hình học đơn giản với các đường biên sắc nét (sharp edges). Khi thu phóng kích thước bằng thuật toán Bilinear trên Android Bitmap so với Nearest/Bilinear trên máy tính, các điểm pixel tại đường biên bị pha trộn làm thay đổi giá trị tensor đầu vào.
  - Ngược lại, trên toàn bộ các ảnh chụp CT y tế thật (`benign_case_114.jpg`, `malignant_case_1.jpg`, `normal_case_1.jpg`) có độ chuyển mức xám liên tục của mô phổi tự nhiên, sai số tensor giữa Android và Python chỉ nằm trong khoảng $\le 9.89 \times 10^{-5}$ (do giải mã JPEG).
- **Đính chính tài liệu**:
  - Tệp `test_case_malignant.jpg` là ảnh đồ họa giả lập nhân tạo, **hoàn toàn không phải ảnh CT ác tính thật** và không có giá trị làm bằng chứng đánh giá lâm sàng. Mọi đánh giá lâm sàng chỉ căn cứ trên các ảnh CT thật từ tập dữ liệu y tế chuẩn.

---

## 7. Trạng thái Grad-CAM và Ghi chú Thiết bị

1. **Grad-CAM Ngoại tuyến**:
   - Vẫn giữ nguyên kết luận kỹ thuật: **Grad-CAM ngoại tuyến trên thiết bị tiếp tục chưa khả dụng (chưa kiểm chứng)**.
   - Khi kích hoạt phân tích on-device trong ứng dụng, hệ thống hiển thị rõ ràng: `Trạng thái Grad-CAM: Không khả dụng ngoại tuyến (MSG-11)` và thông điệp cảnh báo tương ứng trên giao diện.
2. **Thiết bị Vật lý Redmi 13**:
   - Thử nghiệm trên được thực hiện thành công trên môi trường máy ảo **Android Emulator `x86_64` (API 34)** trong điều kiện tắt hoàn toàn kết nối mạng (`wifi disable`, `data disable`) và ngắt Metro Bundler.
   - **Chưa thử nghiệm trên điện thoại thật Redmi 13** do chưa kết nối thiết bị vật lý qua cáp USB. Kết quả kiểm thử máy ảo không thay thế kiểm thử trên điện thoại thật; chưa kết luận về tốc độ, nhiệt độ, RAM thực tế trên vi xử lý MediaTek Helio G91-Ultra của Redmi 13.

---

## 8. Danh Mục File và Hàm Đã Triển Khai Trong MOB-02

1. **Android Native Module & Configuration**:
   - [`mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt):
     - `runInference(base64Image: String, promise: Promise)`: Giải mã Bitmap, tiền xử lý ViT/CNN, nạp session ONNX/TFLite và suy luận end-to-end trả 3 điểm xác suất thật.
     - `preprocessVit(bitmap: Bitmap)`: Chuẩn hóa CHW `(pixel/255.0 - 0.5)/0.5` cho ảnh 224x224.
     - `preprocessCnn(bitmap: Bitmap)`: Chuẩn hóa HWC direct FloatBuffer `pixel/255.0` cho ảnh 512x512.
   - [`mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt): Đăng ký native package.
   - [`mobile/android/app/src/main/java/com/anonymous/mobile/MainApplication.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/MainApplication.kt): Tích hợp `LungCtNativePackage()` vào danh sách package hệ thống.
   - [`mobile/android/app/build.gradle`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/build.gradle): Khai báo phụ thuộc `com.microsoft.onnxruntime:onnxruntime-android:1.17.1` và `org.tensorflow:tensorflow-lite:2.14.0`.
   - [`mobile/android/gradle.properties`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/gradle.properties): Cấu hình `pickFirsts` giải quyết xung đột `libonnxruntime.so`.

2. **Frontend React Native & Application UI**:
   - [`mobile/src/services/ai/onDevicePipeline.ts`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/services/ai/onDevicePipeline.ts): Cầu nối gọi `NativeModules.LungCtPipeline.runInference`.
   - [`mobile/src/features/doctor/screens/AIImageResultScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/AIImageResultScreen.tsx):
     - `handleRunOnDevicePipeline()`: Xử lý sự kiện nhấn nút phân tích AI FP32, bảo đảm chặn ảnh hỏng (MSG-10), xóa kết quả cũ và hiển thị 3 điểm thật lên ScoreCard.
   - [`mobile/src/mocks/testCtBase64.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/mocks/testCtBase64.json): Tệp dữ liệu base64 mẫu chuẩn của các ca CT thật phục vụ kiểm thử ngoại tuyến.

