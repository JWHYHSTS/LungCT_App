# HƯỚNG DẪN CÀI ĐẶT VÀ TRẢI NGHIỆM LUNGCT ĐỘC LẬP TRÊN XIAOMI REDMI 13
### Hướng dẫn sao chép APK, cài đặt ngoại tuyến và kiểm thử On-Device AI khi ngắt kết nối hoàn toàn

> **Thiết bị mục tiêu**: Xiaomi Redmi 13 (HyperOS / Android 14, vi xử lý MediaTek Helio G91-Ultra, kiến trúc 64-bit `arm64-v8a`).  
> **Chế độ hoạt động**: **Độc lập 100% (Standalone Offline)** — Không cần kết nối máy tính, không cần chạy máy chủ Metro Bundler, không cần mạng Internet/Wi-Fi/4G.  
> **Tình trạng đóng gói mô hình**: **Đầy đủ 100% bên trong APK (In-APK Assets)** — Cả 2 nhánh mô hình (ViT ONNX FP32 và Fusion LiteRT FP32) cùng trọng số nhị phân đã được nạp sẵn trong thư mục `assets/models/` của tệp APK, không phụ thuộc vào tải mạng hay các tệp có sẵn từ trước.

---

## 📦 1. THÔNG SỐ KỸ THUẬT CỦA BẢN BIÊN DỊCH RELEASE (APK RELEASE V1.0.1)

| Thuộc tính | Giá trị kiểm chứng thực tế | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Phiên bản ứng dụng** | **v1.0.1 (versionCode: 2)** | Bản sửa lỗi toàn diện: Safe Area mọi màn hình, Camera, Đa ngôn ngữ |
| **Đường dẫn tệp trên máy tính** | `mobile/android/app/build/outputs/apk/release/app-release.apk` | Sinh từ lệnh `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` |
| **Dung lượng tệp (Bytes)** | **487.733.162 bytes (~465,1 MB)** | Đã tối ưu nén tài nguyên, bao gồm C++ ONNX Runtime, TFLite, SQLCipher và toàn bộ bộ trọng số AI |
| **Mã băm an toàn SHA-256** | `B95B33A0257B4770DAF639E73836A915EA79A3CF52BCD607071345894CF01F2C` | Dùng để đối chiếu tính toàn vẹn khi sao chép và cài đặt |
| **Kiến trúc CPU hỗ trợ** | `arm64-v8a` | Tối ưu hóa chuyên biệt cho vi xử lý 64-bit của Redmi 13 và các thiết bị Android hiện đại |
| **Mô hình nhúng sẵn (In-APK)** | 1. `fusion_model.tflite` (110.029.372 bytes)<br>2. `vit_cls.onnx` (1.135.005 bytes)<br>3. `vit_cls.onnx.data` (343.194.624 bytes) | Tự động giải nén ra `filesDir/models` trong lần đầu ứng dụng chạy |

---

## 🛠️ 2. PHÂN ĐỊNH RÕ RÀNG: CHỨC NĂNG THẬT VS CHỨC NĂNG MÔ PHỎNG (MOCK)

Để đảm bảo tính trung thực khoa học trong báo cáo khóa luận, ứng dụng phân định rõ các thành phần khi trải nghiệm trên máy:

| Chức năng | Phân loại | Bản chất kỹ thuật trên thiết bị |
| :--- | :---: | :--- |
| **Suy luận AI chẩn đoán CT (On-Device Inference)** | **CHỨC NĂNG THẬT** | Chạy trực tiếp qua ONNX Runtime Native C++ (ViT FP32) kết hợp LiteRT Interpreter (Fusion). Trả về xác suất Lành tính, Ác tính, Bình thường và phân loại nhãn. |
| **Chọn ảnh từ bộ nhớ máy (Device Photo/Document Picker)** | **CHỨC NĂNG THẬT** | Mở `Intent.ACTION_GET_CONTENT` của Android, tự động sao chép an toàn vào sandbox app `dicom_cases`, liên kết trực tiếp vào ca bệnh và hiển thị ngay trên lưới lát cắt. |
| **Chụp ảnh từ Máy ảnh (Camera Capture)** | **CHỨC NĂNG THẬT** | Gọi trực tiếp Intent `android.media.action.IMAGE_CAPTURE` qua `FileProvider`, lưu ảnh an toàn vào sandbox và đưa vào ca bệnh để phân tích On-Device AI. |
| **Thích ứng màn hình toàn diện (Edge-to-Edge Safe Area)** | **CHỨC NĂNG THẬT** | Tự động tính toán Insets với `react-native-safe-area-context` chống che mất TopBar, TabBar, BottomSheet trên mọi loại màn hình (tai thỏ, nốt ruồi, 3 nút ảo, cử chỉ vuốt). |
| **Đa ngôn ngữ Tiếng Việt / Tiếng Anh (i18n)** | **CHỨC NĂNG THẬT** | Hỗ trợ chuyển đổi ngôn ngữ tức thời giữa Tiếng Việt và English trong mục Cài đặt (Tôi) mà không cần khởi động lại ứng dụng. |
| **CSDL Cục bộ Mã hóa (SQLCipher 4.6.1)** | **CHỨC NĂNG THẬT** | Mã hóa cấp trang AES-256 toàn bộ tệp SQLite `lungct_secure_<ownerId>.db`. Bảo vệ passphrase bằng Android Keystore System. |
| **Lưu hồ sơ Bệnh nhân, Ca bệnh, Ghi chú lâm sàng** | **CHỨC NĂNG THẬT** | Ghi bền vững vào cơ sở dữ liệu trên đĩa; tắt app hoàn toàn mở lại dữ liệu vẫn giữ nguyên vẹn. |
| **Bản đồ nhiệt Grad-CAM On-Device** | **CẢNH BÁO MÔ PHỎNG / MSG-11** | Khi chọn ảnh ngoài máy, hệ thống tự động gắn nhãn "Không khả dụng ngoại tuyến (MSG-11)" và ẩn thanh trượt, không hiển thị ảnh nhiệt giả mạo. |
| **Đăng nhập & Xác thực bác sĩ (Authentication)** | **MÔ PHỎNG (UI-05)** | Chưa kết nối máy chủ FastAPI; cho phép chọn vai trò Bác sĩ / Kỹ thuật viên / Quản trị viên để thử nghiệm phân quyền giao diện. |
| **Đồng bộ đám mây (Cloud Sync & Outbox)** | **MÔ PHỎNG (SCR-Y01)** | Các nút "Đồng bộ" hiển thị thông báo tiến độ gói phát triển backend/cloud tiếp theo. |
| **Xuất báo cáo PDF** | **GIAO DIỆN XEM TRƯỚC (Mock Preview)** | Cho phép cấu hình hiển thị và định dạng tên tệp theo mã ca; chưa kết xuất tệp PDF nhị phân thật ra bộ nhớ ngoài. |

---

## 📲 3. HƯỚNG DẪN CÀI ĐẶT LÊN XIAOMI REDMI 13 TỪNG BƯỚC

### Cách 1: Cài đặt trực tiếp qua cáp USB bằng lệnh ADB (Khuyên dùng)

1. **Chuẩn bị điện thoại Xiaomi Redmi 13**:
   - Mở **Cài đặt (Settings)** → **Giới thiệu điện thoại (About phone)**.
   - Chạm liên tục **7 lần** vào dòng **Phiên bản OS (OS version / MIUI version)** cho đến khi máy hiện thông báo *"Bạn đã là nhà phát triển!"*.
   - Quay lại Cài đặt → **Cài đặt bổ sung (Additional settings)** → **Tùy chọn nhà phát triển (Developer options)**.
   - Bật các mục sau:
     - **Gỡ lỗi USB (USB debugging)**: BẬT.
     - **Cài đặt qua USB (Install via USB)**: BẬT (cần đăng nhập Mi Account hoặc đồng ý cảnh báo bảo mật).
2. **Cắm cáp kết nối điện thoại với máy tính qua cổng USB**:
   - Trên màn hình điện thoại, chọn chế độ **Truyền tệp (File Transfer)**.
   - Khi điện thoại hiển thị hộp thoại *"Cho phép gỡ lỗi USB từ máy tính này?"*, tích chọn *"Luôn cho phép"* và bấm **OK**.
3. **Mở PowerShell trên máy tính và kiểm tra kết nối**:
   ```powershell
   adb devices
   ```
   *Kết quả mong đợi*: Hiển thị danh sách thiết bị có mã của Redmi 13 kèm trạng thái `device`.
4. **Cài đặt bản build Release APK**:
   ```powershell
   adb install -r C:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\mobile\android\app\build\outputs\apk\release\app-release.apk
   ```
   *Kết quả mong đợi*: Terminal báo `Success`. Ứng dụng **LungCT** sẽ xuất hiện trên màn hình chính của điện thoại.

---

### Cách 2: Sao chép tệp APK vào điện thoại và cài đặt thủ công

1. Cắm cáp USB giữa máy tính và Redmi 13, chọn chế độ **Truyền tệp (File Transfer / MTP)**.
2. Mở thư mục điện thoại trên máy tính, sao chép tệp `app-release.apk` từ thư mục:
   `C:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\mobile\android\app\build\outputs\apk\release\`
   vào thư mục **Download** trên bộ nhớ trong của Redmi 13.
3. Trên điện thoại Redmi 13, mở ứng dụng **Quản lý tập tin (File Manager)** → Thư mục **Download** → Chạm vào tệp `app-release.apk`.
4. Chọn **Cài đặt (Install)** (nếu máy hỏi quyền cài ứng dụng từ nguồn không xác định, bấm cho phép Trình quản lý tập tin).

---

## ✈️ 4. QUY TRÌNH KIỂM THỬ ĐỘC LẬP KHI NGẮT KẾT NỐI HOÀN TOÀN

1. **Rút cáp USB** ra khỏi máy tính.
2. **Tắt kết nối mạng**:
   - Vuốt thanh trạng thái của Redmi 13 xuống, tắt hoàn toàn **Wi-Fi** và **Dữ liệu di động (4G/5G)** (hoặc bật **Chế độ máy bay - Airplane mode**).
3. **Mở ứng dụng LungCT**:
   - Ứng dụng khởi động trực tiếp mà không cần mở Metro Bundler trên máy tính.
   - Tại màn hình đăng nhập, chọn tài khoản Bác sĩ mẫu (`bs.an@example.com`).
4. **Thực hiện chẩn đoán ảnh CT ngoại tuyến**:
   - Vào mục **Chi tiết ca bệnh** → Bấm **Thêm ảnh** → Chọn **Thư viện ảnh**.
   - Trình duyệt tệp của Android mở ra, chọn một tệp ảnh CT phổi (hoặc ảnh mẫu trong máy).
   - Bấm vào ảnh để vào màn hình **Kết quả phân tích AI**.
   - Bấm **Chẩn đoán On-Device**: Mô hình ViT ONNX và Fusion LiteRT sẽ chạy trực tiếp trên vi xử lý MediaTek Helio G91-Ultra của máy, trả về tỷ lệ phần trăm phân loại lành tính/ác tính/bình thường và thời gian thực thi (ms).
   - Quan sát nhãn Grad-CAM: Hệ thống hiển thị rõ ràng cảnh báo *"Không khả dụng ngoại tuyến (MSG-11)"* theo đúng chuẩn khoa học.
5. **Kiểm tra tính bền vững**:
   - Vuốt tắt hoàn toàn ứng dụng khỏi đa nhiệm (kill app).
   - Mở lại ứng dụng: Toàn bộ danh sách bệnh nhân và ca bệnh đã tạo vẫn hiển thị nguyên vẹn từ cơ sở dữ liệu mã hóa cục bộ.
