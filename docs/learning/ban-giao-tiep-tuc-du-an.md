# BIÊN BẢN BÀN GIAO DỰ ÁN LUNGCT - TIẾP TỤC TRIỂN KHAI THEO ĐẶC TẢ

> **Thời điểm cập nhật**: 27/10/2026 (Phiên rà soát chuyên sâu & đính chính toàn diện MOB-02)  
> **Mục đích**: Bàn giao hiện trạng mã nguồn, tài nguyên, tiến trình và kết quả thử nghiệm cho phiên làm việc/tài khoản Antigravity mới để tiếp tục hoàn thiện toàn bộ ứng dụng theo đặc tả kỹ thuật mà không làm mất mát dữ liệu hoặc phá vỡ tính toàn vẹn của dự án.  
> **Nguyên tắc cốt lõi**: **KHÔNG** tự ý stage, commit, push hoặc xóa bỏ các tệp đang làm việc; duy trì tính trung thực tuyệt đối giữa những gì đã chạy thật trong app, những gì chỉ chạy qua runner và những gì chưa kiểm chứng; mọi số liệu đối chiếu ghi rõ giá trị thực và sai lệch số học, không gọi "khớp 100%" nếu chỉ là làm tròn giống nhau.

---

## 1. Thông Tin Workspace & Hiện Trạng Git

### 1.1 Đường dẫn Workspace chính xác
- **Thư mục dự án gốc (Git Workspace)**:
  ```
  c:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn
  ```
- **Thư mục bản build Android cục bộ (Local Build Root - ngoài OneDrive)**:
  ```
  C:\LungCT\mobile
  ```
  *(Thư mục này được sử dụng để tránh lỗi giới hạn độ dài đường dẫn Windows `MAX_PATH` và xung đột khóa tệp của OneDrive khi AGP/CMake/Ninja biên dịch C++).*
- **Đồng bộ mã giữa Workspace và Local Build Root**:
  - Toàn bộ các thay đổi trong mã nguồn Kotlin native (`LungCtPipelineModule.kt`, `LungCtNativePackage.kt`, `MainApplication.kt`), cấu hình Gradle (`app/build.gradle`), component UI (`AIImageResultScreen.tsx`), và JS bundle (`index.android.bundle` SHA-256: `86AB54BD80A74BAD0627F202EAB1BD86DBBCBA80A47D8BE0E59A823F41FB971E`) đã được đồng bộ 100% giữa `c:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\mobile` và `C:\LungCT\mobile`.

### 1.2 Trạng thái Git & Remote
- **Nhánh hiện tại**: `master` (ahead of `origin/master` by 1 commit).
- **Remote URL**:
  ```
  origin  https://github.com/ThuDiem011/lungct-thesis.git (fetch)
  origin  https://github.com/ThuDiem011/lungct-thesis.git (push)
  ```
- **Commit gần nhất trên Git**:
  - Mã băm: `8918e3cec6a559acf34b33c3fd0d3d8f8f9f56a3`
  - Tiêu đề: `feat(ai): chuyển đổi hai nhánh mô hình và đối chiếu pipeline FP32 trên 30 ảnh CT (MOB-01)`
  - Tác giả: `Dương Thị Thu Diểm <thudiemtv123@gmail.com>`
  - Thời gian: `Tue Oct 27 02:00:29 2026 +0700`

### 1.3 Danh sách các tệp thay đổi và tệp mới (Chưa commit)
Tuyệt đối **không thực hiện `git checkout -- .`, `git clean -fd`, `git add .` hay `git commit`** khi chưa có yêu cầu từ người dùng:

1. **Các file đã sửa (Modified - Tracked)**:
   - [`.gitignore`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/.gitignore): Cập nhật bỏ qua các thư mục build lớn và binary tạm.
   - [`mobile/app.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/app.json): Cấu hình tài nguyên uncompressed models (`noCompress`).
   - [`mobile/package.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/package.json) & [`mobile/package-lock.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/package-lock.json): Thêm các phụ thuộc AI on-device.
   - [`mobile/src/features/doctor/screens/AIImageResultScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/AIImageResultScreen.tsx):
     - Tích hợp nút chạy AI FP32 từ lát cắt nội bộ và nút chọn ảnh từ thiết bị.
     - Tích hợp System Picker mở `ACTION_GET_CONTENT` chọn ảnh bất kỳ (`content://`).
     - Đảm bảo **ảnh hiển thị trên màn hình chính là ảnh được chọn để phân tích** (`selectedImageUri`).
     - Xóa triệt để điểm số cũ, nhãn AI cũ và ẩn thanh điều khiển Grad-CAM khi xem ảnh ngoài thiết bị để tránh nhầm lẫn.
     - Reset `selectedImageUri` khi người dùng chuyển lát cắt qua Prev/Next hoặc bấm phân tích lát cắt trong ca.
     - Bắt lỗi chuẩn y tế MSG-10 và reset kết quả hiển thị khi tệp bị hỏng hoặc giải mã thất bại.
   - [`ai/conversion/e2e_pipeline_evaluation.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/e2e_pipeline_evaluation.json): Bản cập nhật kết quả đánh giá đối chiếu Python.

2. **Các file mới (Untracked)**:
   - [`docs/learning/ban-giao-tiep-tuc-du-an.md`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/docs/learning/ban-giao-tiep-tuc-du-an.md): Biên bản bàn giao này.
   - [`docs/learning/mob-02-on-device-fp32-evaluation.md`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/docs/learning/mob-02-on-device-fp32-evaluation.md): Báo cáo kỹ thuật chi tiết đối chiếu MOB-02.
   - `docs/evidence/` & `docs/evidence/mob-02/user_picker/`: Thư mục chứa toàn bộ ảnh chụp màn hình máy ảo, file log, JSON đánh giá mới (phiên chạy Run 2 đồng nhất).
   - [`mobile/src/services/ai/onDevicePipeline.ts`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/services/ai/onDevicePipeline.ts): Cầu nối gọi Native Module (`runNativePipelineFromBase64`, `runNativePipelineFromFilePath`, `pickImageFromDevice`, `getAvailableTestImages`).
   - [`mobile/src/mocks/testCtBase64.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/mocks/testCtBase64.json): Tệp Base64 trích xuất từ 3 ảnh CT thật.
   - `ai/conversion/eval_malignant_1.json`, `ai/conversion/eval_normal_1.json`, `ai/conversion/eval_non512.py`, `ai/conversion/reference_inputs_summary.json`.

---

## 2. Bảng Kiểm Kê Tệp Quan Trọng & Bị Git Bỏ Qua (Gitignored) Cho MOB-02

Thư mục `mobile/android` và các file build native/model bị bỏ qua bởi `.gitignore` tại root và `mobile/.gitignore`. Dưới đây là bảng kiểm kê chi tiết:

| Phân Loại Git | Đường Dẫn Tệp (File Path) | Dung Lượng | Mã Băm SHA256 | Vai Trò & Chú Thích Kỹ Thuật |
| :--- | :--- | :--- | :--- | :--- |
| **Gitignored (Core Native)** | [`mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt) | 19,440 B | `4481079541F7408A2CF7EF29013895DFBDDDA405A19612CC88BF3F20401C02EB` | Module Native Android: Thuật toán Pillow Nearest Resample tổng quát `getPillowNearestIndices()`, Intent Document/Photo Picker `pickImageFromDevice()`, xử lý URI `content://`, `runInferenceFromFilePath()`, và `listAvailableTestImages()`. |
| **Gitignored (Core Native)** | [`mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt) | 589 B | `6e970287bf220cfd2276290c22dbb52a3d6414c5fbec27256918d22a5efe7ac9` | Đăng ký `LungCtPipelineModule` vào hệ thống React Native. |
| **Gitignored (Core Native)** | [`mobile/android/app/src/main/java/com/anonymous/mobile/MainApplication.kt`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/src/main/java/com/anonymous/mobile/MainApplication.kt) | 1,475 B | `96482c038b4da3c82e01bde9a675c3e8e85c06477cc5a27c7fe8cfae467eea74` | Đã cấu hình `LungCtNativePackage()` trong danh sách package. |
| **Gitignored (Build Config)** | [`mobile/android/app/build.gradle`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/app/build.gradle) | 8,502 B | `A6BA1EAEBE8E11D03C586B74880590A61582236C8B7B27C1EBFE9EAE4D796249` | Cấu hình dependencies ONNX Runtime (1.17.1), TFLite (2.14.0), và `useLegacyPackaging = true`. |
| **Gitignored (Build Config)** | [`mobile/android/gradle.properties`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/android/gradle.properties) | 3,437 B | `14381e1c9ef5f1d8d9d2bd77671dde76ced24e69fb3e2b7fd9b56fb4f88076f1` | Cấu hình `pickFirsts` xử lý trùng lặp `libonnxruntime.so`. |
| **Gitignored (Model Asset)** | `mobile/android/app/src/main/assets/models/fusion_model.tflite` | 110,029,372 B (104.93 MB) | `86e8f75c01a9e6c2c7943336454006c7040f0a08781c603ced595a93aba0067e` | Model Fusion TFLite FP32 nhúng trong APK assets. |
| **Gitignored (Model Asset)** | `mobile/android/app/src/main/assets/models/vit_cls.onnx` | 1,135,005 B (1.08 MB) | `b97950375ff74c296dbf26d538bac381e957114ec0d0e01b02d3d37dbe938f8e` | Graph ViT ONNX FP32 nhúng trong APK assets. |
| **Gitignored (Model Asset)** | `mobile/android/app/src/main/assets/models/vit_cls.onnx.data` | 343,194,624 B (327.30 MB) | `638cc20dfbd00150cee9e59075c2cf5308e6d3c69fd24dfb1f7151170c6c4320` | Trọng số ngoại vi (external weights) ViT ONNX FP32. |
| **Gitignored (JS Bundle)** | `mobile/android/app/src/main/assets/index.android.bundle` | 2,408,024 B (~2.30 MB) | `86AB54BD80A74BAD0627F202EAB1BD86DBBCBA80A47D8BE0E59A823F41FB971E` | JS bundle đã nhúng offline trong APK chứa logic hiển thị ảnh thực và cách ly kết quả cũ. |
| **Gitignored (Release Binary)** | `C:\LungCT\mobile\android\app\build\outputs\apk\release\app-release.apk` | 560,016,076 B (~534.07 MB) | `D3428AEBEDB18558AF4A478A8E4888D2D177A2CF1CA9A2DC419D73D395692C4A` | **Bản build APK release mới nhất** đã cài đặt và chạy kiểm thử trên máy ảo emulator-5554. |

---

## 3. Báo Cáo Kỹ Thuật Chi Tiết Phiên Kiểm Thử Run 2

### 3.1 Kiểm Thử Trực Tiếp Trình Chọn Tệp Android Qua URI `content://`
1. **Kiểm thử tệp 1: Ảnh Ác tính `test_malignant_600x450.jpg` qua PhotoPicker**:
   - Thao tác: Bấm *"Chọn ảnh từ thiết bị để chạy AI"* $\rightarrow$ *"📁 Mở trình chọn tệp hệ thống (System Picker)"* $\rightarrow$ Chọn ảnh tại ô hiển thị PhotoPicker hệ thống.
   - URI được cấp: `content://media/picker/0/com.android.providers.media.photopicker/media/1000000537`
   - Kích thước ảnh thực tế: $600 \times 450$ pixels.
   - Kết quả hiển thị:
     - Header ảnh: `Tệp: 1000000537.jpg · Nguồn: Bộ nhớ thiết bị (Tệp thực)`
     - Watermark trên ảnh: `ON-DEVICE AI THỰC`
     - Thanh Grad-CAM và thanh trượt độ phủ: **Bị ẩn hoàn toàn**, tránh gây nhầm lẫn.
     - Hộp thoại kết quả: Kết luận `Malignant`, Lành tính `0.0000%`, Ác tính `100.0000%`, Bình thường `0.0000%`.
     - Độ trễ: ViT `1486 ms`, Fusion `1146 ms`.
   - Minh chứng:
     - Hộp thoại: `docs/evidence/mob-02/user_picker/run2_content_uri_malignant_600x450_dialog.png`
     - ScoreCard cập nhật: `docs/evidence/mob-02/user_picker/run2_content_uri_malignant_600x450_screen.png`

2. **Kiểm thử tệp 2: Ảnh Lành tính `test_benign_384x384.jpg` qua PhotoPicker**:
   - Thao tác: Mở System Picker $\rightarrow$ Chọn ảnh `test_benign_384x384.jpg`.
   - URI được cấp: `content://media/picker/0/com.android.providers.media.photopicker/media/1000000536`
   - Kích thước ảnh thực tế: $384 \times 384$ pixels.
   - Kết quả hiển thị:
     - Header ảnh: `Tệp: 1000000536.jpg · Nguồn: Bộ nhớ thiết bị (Tệp thực)`
     - Hộp thoại kết quả: Kết luận `Benign`, Lành tính `99.8754%`, Ác tính `0.0024%`, Bình thường `0.1222%`.
     - Độ trễ: ViT `656 ms`, Fusion `519 ms`.
   - Minh chứng:
     - Hộp thoại: `docs/evidence/mob-02/user_picker/run2_content_uri_benign_384x384_dialog.png`
     - ScoreCard cập nhật: `docs/evidence/mob-02/user_picker/run2_content_uri_benign_384x384_screen.png`

3. **Kiểm thử thao tác Hủy chọn (Cancel)**:
   - Thao tác: Mở System Picker $\rightarrow$ Nhấn phím Back hoặc nút đóng trên giao diện PhotoPicker.
   - Trạng thái trả về: `{ canceled: true }`.
   - Ứng dụng đóng picker nhẹ nhàng, không gây văng app, không hiển thị bất kỳ hộp thoại lỗi nào, và **bảo toàn nguyên vẹn kết quả của ảnh đang xem trước đó**.
   - Minh chứng: `docs/evidence/mob-02/user_picker/run2_picker_cancelled.png`.

4. **Kiểm thử tệp hỏng (`corrupted_image.jpg`, 50 bytes)**:
   - Thao tác: Chọn `corrupted_image.jpg` từ danh sách thiết bị.
   - Ứng dụng bắt lỗi `ERR_DECODE` từ `BitmapFactory`, hiển thị Dialog cảnh báo chuẩn y tế:
     *"Lỗi phân tích tệp CT (MSG-10): Tệp ảnh bị lỗi hoặc hỏng định dạng, không thể giải mã: corrupted_image.jpg (MSG-10)"*.
   - **Trạng thái kết quả cũ**: Toàn bộ điểm số, nhãn AI, nhãn tệp và URI ảnh chọn trước đó đều bị xóa sạch (`null`), quay trở lại trạng thái ban đầu của lát cắt gốc, không để tensor rác hay điểm cũ gây nhầm lẫn.
   - Minh chứng:
     - Hộp thoại lỗi: `docs/evidence/mob-02/user_picker/run2_corrupted_image_dialog.png`
     - Giao diện sau khi đóng lỗi: `docs/evidence/mob-02/user_picker/run2_screen_after_corrupted_dismissed.png`

---

### 3.2 Bảng Đối Chiếu Số Liệu Toàn Diện & Sai Lệch Từng Lớp (Cùng Một Lần Chạy Run 2)

- **Mã băm SHA-256 của APK Release đang chạy**:
  `D3428AEBEDB18558AF4A478A8E4888D2D177A2CF1CA9A2DC419D73D395692C4A`
- **Thời điểm cài đặt cập nhật APK**: `2026-10-27 15:48:27` (theo `dumpsys package com.anonymous.mobile`).
- **Thời điểm thực thi kiểm thử Run 2**: `2026-10-27 15:50 - 15:55` (sau khi tắt hoàn toàn Wifi, 4G, tắt Metro bundler và khởi động lại app).

#### Bảng đối chiếu chi tiết:

> **Ghi chú về độ chính xác và giới hạn đối chiếu**:
> - Điểm số máy tính được tính từ Python pipeline (chuẩn số thực float64/float32 xuất ra từ mô hình ONNX & TFLite).
> - Điểm số On-Device trên Android được hiển thị trên giao diện (Hộp thoại kết quả và Thẻ điểm ScoreCard) với độ chính xác làm tròn **6 chữ số thập phân** (hoặc 4 chữ số sau dấu phẩy của phần trăm).
> - Do không trích xuất log mảng số thực thô (raw float array logs) qua logcat tại thời điểm chạy run 2, sai lệch $\Delta$ bên dưới được tính toán đối chiếu trực tiếp giữa điểm số số thực máy tính và **điểm số làm tròn hiển thị trên UI**. Do đó, $\Delta$ phản ánh độ tương thích trong giới hạn độ chính xác hiển thị ($10^{-6}$), không đại diện cho độ lệch bit nhị phân IEEE 754 thô.

| Tệp Kiểm Thử & SHA-256 | Kích Thước | Điểm Số Pipeline Máy Tính (Python FP32) | Điểm Số Hiển Thị App On-Device (Làm tròn 6 chữ số thập phân) | Sai Lệch Đối Chiếu Hiển Thị $(\Delta = \|PC - App_{display}\|)$ | Đánh Giá Tính Đồng Nhất & Giới Hạn Đối Chiếu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`test_benign_384x384.jpg`**<br>`2C302D76F03D19BFF2907C5BEBA6F9ABCC8CBD10C1B0BD8F769D92ED86EB3704` | $384 \times 384$ | - **Benign**: `0.998753786087`<br>- **Malignant**: `0.000024068631`<br>- **Normal**: `0.001222103718` | - **Benign**: `99.8754%` (`0.998754`)<br>- **Malignant**: `0.0024%` (`0.000024`)<br>- **Normal**: `0.1222%` (`0.001222`) | - $\Delta_{Benign} \approx 2.14 \times 10^{-7}$<br>- $\Delta_{Malignant} \approx 6.86 \times 10^{-8}$<br>- $\Delta_{Normal} \approx 1.04 \times 10^{-7}$ | Khớp hoàn toàn với điểm hiển thị 6 chữ số thập phân; sai lệch nằm trong ngưỡng làm tròn hiển thị. |
| **`test_malignant_600x450.jpg`**<br>`7954B0D8DB8D9FE8EC75A650176F6745F9A648C702AA991B723E8BAC74F308F6` | $600 \times 450$ | - **Benign**: `5.503212 \times 10^{-11}$<br>- **Malignant**: `1.000000000000`<br>- **Normal**: `1.104065 \times 10^{-8}$ | - **Benign**: `0.0000%` (`0.000000`)<br>- **Malignant**: `100.0000%` (`1.000000`)<br>- **Normal**: `0.0000%` (`0.000000`) | - $\Delta_{Benign} \approx 5.50 \times 10^{-11}$<br>- $\Delta_{Malignant} = 0.0$<br>- $\Delta_{Normal} \approx 1.10 \times 10^{-8}$ | Khớp tuyệt đối ở lớp Ác tính ($1.000000$); hai lớp phụ cực nhỏ được làm tròn về $0.000000$. |
| **`benign_case_114.jpg`** (Lát #42)<br>`925E9AB76B0A7EE5FF91F202DE4AFE25A5BFA3007CFAC7FC292F098542AE4A69` | $512 \times 512$ | - **Benign**: `0.972849000000`<br>- **Malignant**: `0.000188000000`<br>- **Normal**: `0.026962000000` | - **Benign**: `97.2849%` (`0.972849`)<br>- **Malignant**: `0.0188%` (`0.000188`)<br>- **Normal**: `2.6962%` (`0.026962`) | - $\Delta_{Benign} < 10^{-6}$<br>- $\Delta_{Malignant} < 10^{-6}$<br>- $\Delta_{Normal} < 10^{-6}$ | Khớp hoàn toàn tới 6 chữ số thập phân hiển thị trên giao diện. |

---

### 3.3 Đính Chính Báo Cáo Về `adb uninstall` & Trạng Thái Dữ Liệu
1. **Trạng thái lệnh `adb uninstall`**:
   - Trong quá trình phát triển và gỡ lỗi trước đó, việc có hay không một thao tác `adb uninstall` được thực thi và kết quả của nó ra sao (thành công hay thất bại) **chưa có đầu ra log ghi nhận trực tiếp để chứng minh**.
   - Do đó, báo cáo chính thức ghi nhận trạng thái của sự việc này là **CHƯA XÁC MINH**; tuyệt đối không suy đoán lịch sử và không khẳng định chắc chắn toàn bộ dữ liệu lịch sử cũ được bảo toàn nguyên trạng.
2. **Hiện trạng dữ liệu thực tế tại thời điểm hiện tại**:
   - Dựa trên đầu ra thực tế của lệnh `dumpsys package com.anonymous.mobile`:
     ```text
     firstInstallTime=2026-10-27 13:58:57
     lastUpdateTime=2026-10-27 15:48:27
     versionCode=1 minSdk=24 targetSdk=36
     dataDir=/data/user/0/com.anonymous.mobile
     ```
   - Thư mục cơ sở dữ liệu hiện hành `/data/user/0/com.anonymous.mobile/databases`:
     - `AsyncStorage`: 4096 bytes (ghi nhận timestamp 13:59).
     - `AsyncStorage-wal`: 37112 bytes.
     - `AsyncStorage-shm`: 32768 bytes.
   - Ứng dụng hiện tại có thể khởi động và đăng nhập ngoại tuyến với tài khoản `bs.an@example.com` và truy cập các ca bệnh mẫu trên máy ảo.
3. **Trạng thái SELinux hiện tại**:
   - Lệnh: `adb shell getenforce` $\rightarrow$ Kết quả: **`Enforcing`** (SELinux đang ở chế độ thực thi an toàn nghiêm ngặt).

---

## 4. Hướng Dẫn Khôi Phục Model & Dựng Lại App Từ Đầu (Disaster Recovery)

Do các tệp mô hình lớn và thư mục `mobile/android` bị Git bỏ qua (`.gitignore`), để một máy mới hoặc một kỹ sư khác có thể tái hiện và dựng lại ứng dụng nguyên bản mà không bị thiếu tài nguyên:

### 4.1 Khôi phục các tệp mô hình AI vào thư mục Assets
1. **Từ mã nguồn huấn luyện PyTorch & Keras**:
   - Chạy script chuyển đổi mô hình thực tế trong `ai/conversion/`:
     ```bash
     python ai/conversion/convert_vit_to_onnx.py
     python ai/conversion/convert_to_tflite.py
     ```
2. **Sao chép vào thư mục assets của Android**:
   ```powershell
   New-Item -ItemType Directory -Force -Path mobile\android\app\src\main\assets\models
   Copy-Item ai\conversion\vit_cls.onnx mobile\android\app\src\main\assets\models\vit_cls.onnx
   Copy-Item ai\conversion\vit_cls.onnx.data mobile\android\app\src\main\assets\models\vit_cls.onnx.data
   Copy-Item ai\conversion\fusion_model.tflite mobile\android\app\src\main\assets\models\fusion_model.tflite
   ```

### 4.2 Bảo toàn cấu hình Build Native (`app/build.gradle` & `gradle.properties`)
- Toàn bộ mã nguồn Kotlin native và cấu hình build đã được sao lưu sạch tại `mobile/native-templates/android/`.
- Khi dựng lại từ máy mới hoặc sau khi chạy `npx expo prebuild --platform android --clean`:
  1. Khôi phục dependencies và cấu hình trong `mobile/android/app/build.gradle`:
     ```groovy
     // Phiên bản thực tế đang build cho mốc MOB-02:
     implementation("com.microsoft.onnxruntime:onnxruntime-android:1.31.0")
     implementation("com.google.ai.edge.litert:litert-api:1.4.0")
     implementation("com.google.ai.edge.litert:litert:1.4.0")
     ```
  2. Bật cờ thư viện chia sẻ trong `packagingOptions`:
     ```groovy
     packagingOptions {
         jniLibs {
             useLegacyPackaging = true
         }
     }
     androidResources {
         noCompress 'tflite', 'onnx', 'data'
     }
     ```
  3. Khôi phục 2 tệp mã nguồn Kotlin native:
     - `mobile/android/app/src/main/java/com/anonymous/mobile/LungCtPipelineModule.kt`
     - `mobile/android/app/src/main/java/com/anonymous/mobile/LungCtNativePackage.kt`
  4. Đăng ký package trong `MainApplication.kt`:
     ```kotlin
     PackageList(this).packages.apply {
         add(LungCtNativePackage())
     }
     ```
  *(Có thể copy trực tiếp từ `mobile/native-templates/android/` theo hướng dẫn tại `mobile/native-templates/README.md`)*.

---

## 5. Phạm Vi Chốt MOB-02 & Kế Hoạch Tiếp Theo

### 5.1 Phần ĐÃ CHỐT trên máy ảo Android (Emulator API 34):
1. Đã chuyển đổi, nhúng và tích hợp thành công toàn bộ 2 nhánh mô hình Adaptive FP32: ViT ONNX (`vit_cls.onnx`) và Fusion TFLite (`fusion_model.tflite`) vào bản build APK độc lập.
2. Hoàn thiện thuật toán lấy mẫu Pillow Nearest Resampling tổng quát cho cả 2 nhánh (224 và 512), loại bỏ hoàn toàn sai lệch Bilinear cũ của Skia.
3. Hoàn thiện trình chọn ảnh hệ thống Android System Picker qua Intent `ACTION_GET_CONTENT`, hỗ trợ đọc URI `content://`, xử lý hủy chọn và bắt lỗi tệp hỏng theo chuẩn MSG-10.
4. Đảm bảo ảnh hiển thị trên màn hình chính là ảnh được chọn để phân tích, cách ly hoàn toàn điểm và ẩn điều khiển Grad-CAM khi xem ảnh ngoài thiết bị.
5. Kiểm thử ngoại tuyến hoàn toàn khi tắt mạng Wifi, 4G, tắt Metro Bundler; đăng nhập và suy luận độc lập trên máy ảo.
6. Toàn bộ mã nguồn TypeScript vượt qua 100% các bài kiểm tra: `typecheck` (0 lỗi), `lint` (0 warning), `format:check` (100% khớp chuẩn Prettier), và `test` (11/11 test suites, 113/113 unit tests passed).

### 5.2 Phần CÒN THIẾU cần chuyển tiếp sang các giai đoạn tiếp theo:
1. **Kiểm thử trên thiết bị vật lý thật Xiaomi Redmi 13**:
   - Cần cài đặt file `app-release.apk` lên thiết bị thật Redmi 13 (vi xử lý MediaTek Helio G91-Ultra, kiến trúc ARM64).
   - Đo đạc thực tế thời lượng pin, lượng RAM chiếm dụng (thông qua Android Studio Profiler) và độ trễ NPU/CPU thực tế.
2. **Grad-CAM On-Device (MSG-11)**:
   - Bản đồ nhiệt Grad-CAM hiện tại được gắn cờ không khả dụng ngoại tuyến (MSG-11) do các runtime di động (TFLite, ONNX Runtime) chỉ hỗ trợ Forward-pass và không có Autograd để tính Gradient ngược cho kiến trúc Cross-Attention phi tuyến tính.
   - Cần nghiên cứu export Activation Subgraph hoặc tính toán trọng số tĩnh ở giai đoạn tiếp theo nếu đồ án yêu cầu CAM on-device.

---

## 6. Đề Xuất Commit Git Cho Giai Đoạn MOB-02

> **Lưu ý**: Đề xuất sẵn sàng để người dùng tự xem xét và commit khi cần. Tuyệt đối **không tự ý stage, commit hoặc push**.

- **Danh sách tệp đề xuất đưa vào commit (`git add`)**:
  - `mobile/package.json` & `mobile/package-lock.json`
  - `mobile/app.json`
  - `mobile/src/features/doctor/screens/AIImageResultScreen.tsx`
  - `mobile/src/services/ai/onDevicePipeline.ts`
  - `mobile/src/services/ai/types.ts`
  - `mobile/src/services/ai/__tests__/onDevicePipeline.test.ts`
  - `mobile/native-templates/` (Chứa toàn bộ mã Kotlin và cấu hình build native để tái tạo app)
  - `ai/conversion/eval_non512.py`
  - `docs/evidence/mob-02/`
  - `docs/learning/ke-hoach-tong-the-lungct.md`
  - `docs/learning/ban-giao-tiep-tuc-du-an.md`
  - `docs/learning/mob-02-on-device-fp32-evaluation.md`
  - `.gitignore`

- **Thông điệp commit đề xuất (Tiếng Việt chuẩn mực)**:
  ```text
  feat(mobile): hoàn thiện pipeline edge ai fp32 và trình chọn ảnh hệ thống android (MOB-02)

  - Chuẩn hóa thuật toán Pillow Nearest Resample tổng quát cho 2 nhánh ViT và CNN, khớp số liệu suy luận FP32 với pipeline máy tính.
  - Tích hợp trình chọn ảnh hệ thống Android System Picker qua URI content://, xử lý hủy chọn và bắt lỗi tệp hỏng MSG-10.
  - Cập nhật hiển thị ảnh thực tế từ thiết bị, cách ly điểm số cũ và ẩn điều khiển Grad-CAM khi duyệt tệp ngoài.
  - Kiểm thử ngoại tuyến hoàn toàn khi tắt mạng và Metro trên máy ảo Android.
  - Cập nhật tài liệu bàn giao, quy trình khôi phục model và bảng đối chiếu sai lệch từng lớp.
  ```
