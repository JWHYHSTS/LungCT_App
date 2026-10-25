# BIÊN BẢN THỰC NGHIỆM VÀ KIỂM THỬ GIAO DIỆN UI-02 TRÊN MÁY ẢO ANDROID (LUMACT_PHONE)

## 1. Thông tin Máy ảo AVD & Môi trường Chạy
- **Thiết bị ảo (AVD)**: `LumaCT_Phone`
- **Phiên bản hệ điều hành**: Android 14.0 (API Level 34)
- **Kiến trúc phần cứng / ABI**: `x86_64` (Model: `sdk_gphone64_x86_64`)
- **Độ phân giải màn hình**: 1080 x 1920 px (420 dpi)
- **Runtime Client**: Expo Go (Package: `host.exp.exponent`, SDK 58.0.0)
- **Engine Bundler**: Metro Bundler (React Native 0.88.0, Hermes Engine)

---

## 2. Các nội dung đã thực nghiệm trên Máy ảo

### A. Font chữ Be Vietnam Pro & Hiển thị Tiếng Việt
- Tích hợp 3 biến thể font: `BeVietnamPro-Regular.ttf`, `BeVietnamPro-Medium.ttf`, `BeVietnamPro-SemiBold.ttf` qua `expo-font`.
- Kiểm tra hiển thị thực tế trên màn hình:
  - Font Be Vietnam Pro được nạp thành công trước khi hiển thị nội dung.
  - Các ký tự tiếng Việt có dấu phức tạp (ví dụ: *“Kết quả AI chỉ hỗ trợ tham khảo, không thay thế kết luận của bác sĩ.”*, *“Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh.”*, *“Lành tính”*, *“Ác tính”*, *“Bình thường”*) hiển thị trọn vẹn, sắc nét, không bị lỗi vỡ font (tofu) hay lệch dấu thanh.

### B. Hệ thống Icon Vector SVG (64 Icons)
- Cấu hình `react-native-svg-transformer` trong `metro.config.js` để biên dịch trực tiếp 64 tệp `.svg` thành React Component.
- Kiểm tra thực tế:
  - Tất cả 64 icon theo `manifest.json` được render trên lưới 3 cột.
  - Đường nét viền tự động chuyển đổi màu nét qua `stroke: currentColor` $\rightarrow$ theo `colors.border.icon`:
    - Chế độ Sáng: Nét viền `#4D5048`.
    - Chế độ Tối: Nét viền `#B3B6AA`.
  - Giữ nguyên các mảng màu pastel y tế nội bộ của icon (nền xanh teal, vàng cam, xám nhạt).
  - Không có icon nào bị lỗi null hoặc crash component.

### C. Đa ngôn ngữ i18n (Việt - Anh)
- Tích hợp `i18next`, `react-i18next`, `expo-localization`.
- Bộ từ điển: `vi.json` (26.9 KB) và `en.json` (23.5 KB) đồng nhất 100% cấu trúc khóa.
- Thao tác chuyển đổi nút `Tiếng Việt (VI)` và `English (EN)` trên giao diện:
  - Bấm `Tiếng Việt (VI)`: Toàn bộ tiêu đề, thông điệp y tế (MSG-01, MSG-02), nhãn 3 lớp AI đổi sang tiếng Việt ngay lập tức.
  - Bấm `English (EN)`: Hiển thị đúng chuẩn *“MSG-01: AI results are for reference only and do not replace the physician's conclusion.”* và *“MSG-02: Scores are model outputs and are not calibrated disease probabilities.”*.

### D. Chuyển đổi Theme Sáng / Tối và Cuộn trang
- Kiểm tra đổi theme `Sáng` / `Tối` / `Hệ thống`:
  - Thẻ card icon, màu nền ứng dụng và màu chữ đổi tức thì, độ tương phản chuẩn WCAG.
  - Khi bật `night mode yes` trên hệ thống Android 14, chế độ `Hệ thống` nhận diện chính xác và hiển thị theme tối.
- Thao tác cuộn vuốt từ icon 1 (`account-approval`) đến icon 64 (`zoom-out`) mượt mà, không giật lag.

---

## 3. Danh mục Tệp Ảnh Minh chứng Thực tế Lưu trữ

Tất cả ảnh chụp màn hình thực tế kéo trực tiếp từ máy ảo qua `adb screencap` được lưu tại `evidence/android/ui-02/`:
1. `01_gallery_light_vi.png`: Màn hình UI Gallery ở chế độ Sáng, Tiếng Việt (VI).
2. `02_gallery_light_en.png`: Màn hình UI Gallery ở chế độ Sáng, English (EN).
3. `03_gallery_dark_en.png`: Màn hình UI Gallery ở chế độ Tối, English (EN).
4. `04_gallery_dark_vi.png`: Màn hình UI Gallery ở chế độ Tối, Tiếng Việt (VI).
5. `05_gallery_scroll_icons_1.png`: Cuộn trang xem lưới icon đợt 1 (chế độ Tối).
6. `06_gallery_scroll_icons_2.png`: Cuộn trang xem lưới icon đợt 2 (chế độ Tối).
7. `07_gallery_scroll_bottom.png`: Cuộn đến đáy hiển thị các icon cuối cùng (`zoom-in`, `zoom-out`).
8. `08_gallery_system_night.png`: Kiểm tra chế độ Tối tự động theo Night Mode hệ thống Android 14.

---

## 4. Xác nhận Giới hạn Thực nghiệm
- Toàn bộ kết quả và hình ảnh trên được ghi nhận trực tiếp từ **Máy ảo Android 14 (AVD LumaCT_Phone)**.
- **Chưa kiểm thử trên thiết bị vật lý thật (Redmi 13)** và **chưa kiểm thử trên iOS**.
