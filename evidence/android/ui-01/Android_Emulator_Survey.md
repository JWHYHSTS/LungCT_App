# BIÊN BẢN THỰC NGHIỆM VÀ KIỂM THỬ GIAO DIỆN UI-01 TRÊN MÁY ẢO ANDROID (LUMACT_PHONE)

## 1. Thông tin Máy ảo AVD & Môi trường Chạy
- **Thiết bị ảo (AVD)**: `LumaCT_Phone`
- **Phiên bản hệ điều hành**: Android 14.0 (API Level 34)
- **Kiến trúc phần cứng / ABI**: `x86_64` (Model: `sdk_gphone64_x86_64`)
- **Độ phân giải màn hình**: 1080 x 1920 px
- **Runtime Client**: Expo Go (Package: `host.exp.exponent`, SDK 58.0.0)
- **Engine Bundler**: Metro Bundler (React Native 0.88.0, Hermes Engine)

---

## 2. Các nội dung đã thực nghiệm trên Máy ảo

### A. Khởi động và Tải ứng dụng (Launch)
- Ứng dụng kết nối tới Metro Bundler qua giao thức `exp://10.0.2.2:8081`.
- Metro biên dịch thành công 734 modules trong 9.8s.
- Màn hình `ThemePreviewScreen` hiển thị ngay sau màn khởi động, căn lề Safe Area chuẩn xác và không phát sinh lỗi crash.

### B. Kiểm tra Chuyển đổi Theme Sáng / Tối (Manual Switch)
- **Chế độ Sáng (Light Mode)**: Bấm nút `Sáng` $\rightarrow$ Nền app `#FAF8F2`, bề mặt `#FFFFFF`, chữ chính `#171814`, màu thương hiệu `#2F6F67`. Phản ứng tức thì.
- **Chế độ Tối (Dark Mode)**: Bấm nút `Tối` $\rightarrow$ Nền app `#171814`, bề mặt `#22231F`, chữ chính `#F2EFE7`, màu thương hiệu `#7FC4B8`. Toàn bộ 48 thẻ màu đổi mã hex và màu nền đồng bộ.

### C. Kiểm tra Chế độ Tự động theo Hệ thống (System Preference)
- **Phát hiện và Xử lý Lỗi trong UI-01**:
  - *Hiện tượng ban đầu*: Khi chọn `Hệ thống` và đổi chế độ máy ảo sang Dark Mode qua lệnh `cmd uimode night yes`, app vẫn giữ giao diện Sáng.
  - *Nguyên nhân kỹ thuật*: Cấu hình `userInterfaceStyle` trong `mobile/app.json` mặc định để giá trị `"light"` (chỉ hỗ trợ giao diện sáng).
  - *Biện pháp khắc phục*: Đã cập nhật `userInterfaceStyle: "automatic"` trong `mobile/app.json`.
  - *Kết quả sau sửa*: Khi điện thoại/máy ảo bật Dark Mode hệ thống, `ThemePreviewScreen` lập tức nhận diện `scheme: DARK` và hiển thị theme tối tự động.

### D. Kiểm tra Thao tác Cuộn (Scroll & Layout)
- Thực hiện vuốt màn hình (gesture swipe) từ đầu đến cuối danh sách:
  - Cuộn mượt mà qua toàn bộ 6 nhóm token:
    1. Màu Thương Hiệu (Brand)
    2. Màu Nền (Background)
    3. Màu Chữ (Text)
    4. Trạng Thái Hệ Thống (Status Badges)
    5. Nhãn Phân Loại AI (Benign, Malignant, Normal, barTrack)
    6. Đường Viền & Điều Khiển (Border)
  - Không bị tràn viền (overflow), không bị cắt chữ hoặc che khuất thanh điều hướng dưới.

---

## 3. Danh mục Tệp Ảnh Minh chứng Thực tế Lưu trữ

Tất cả ảnh chụp màn hình thực tế kéo trực tiếp từ máy ảo qua `adb screencap` được lưu tại `evidence/android/ui-01/`:
1. `01_theme_preview_light.png`: Màn hình xem thử ở chế độ Sáng mặc định.
2. `02_theme_preview_dark.png`: Màn hình xem thử khi bấm chuyển sang chế độ Tối.
3. `03_theme_preview_light_switched.png`: Màn hình sau khi bấm chuyển lại chế độ Sáng.
4. `04_theme_preview_system_night.png`: Màn hình tự động chuyển sang chế độ Tối theo Night Mode của Android 14.
5. `05_theme_preview_scroll_text_status.png`: Ảnh cuộn xem nhóm Màu Chữ và Trạng Thái Hệ Thống.
6. `06_theme_preview_scroll_ai_border.png`: Ảnh cuộn xem 3 nhãn phân loại AI (Lành tính, Ác tính, Bình thường) và vạch barTrack.
7. `07_theme_preview_scroll_bottom.png`: Ảnh cuộn tới đáy màn hình hiển thị toàn bộ 5 token đường viền (Border).

---

## 4. Xác nhận Giới hạn Thực nghiệm
- Toàn bộ kết quả và hình ảnh trên được ghi nhận từ **Máy ảo Android 14 (AVD LumaCT_Phone)**.
- **Chưa kiểm thử trên thiết bị vật lý thật (Redmi 13)** và **chưa kiểm thử trên iOS**.
