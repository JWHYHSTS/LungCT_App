# BIÊN BẢN THỰC NGHIỆM VÀ KIỂM THỬ GIAO DIỆN UI-04 TRÊN MÁY ẢO ANDROID (LUMACT_PHONE)

## 1. Thông tin Máy ảo AVD & Môi trường Chạy
- **Thiết bị ảo (AVD)**: `LumaCT_Phone`
- **Phiên bản hệ điều hành**: Android 14.0 (API Level 34)
- **Kiến trúc phần cứng / ABI**: `x86_64` (Model: `sdk_gphone64_x86_64`)
- **Độ phân giải màn hình**: 1080 x 1920 px (420 dpi)
- **Runtime Client**: Expo Go (Package: `host.exp.exponent`, SDK 58.0.0)
- **Engine Bundler**: Metro Bundler (React Native 0.88.0, Hermes Engine)

---

## 2. Các nội dung đã thực nghiệm trên Máy ảo

### A. 14 Component Đặc thù LungCT Đợt 2 (Domain Components)
Đã kiểm tra trực quan và chức năng của 14 component chuẩn hóa trong `mobile/src/ui/components/`:
1. `Toggle`: Công tắc bật/tắt On-Device cục bộ, vùng chạm $\ge 44\times 44\text{ dp}$, tự động thích ứng theme.
2. `Checkbox`: Hộp kiểm xác nhận đồng thuận, vùng chạm $\ge 44\times 44\text{ dp}$.
3. `Segmented`: Bộ chọn phân đoạn chuyển đổi xem "Ảnh gốc" và "Grad-CAM".
4. `Slider`: Thanh trượt điều chỉnh độ phủ Grad-CAM từ 0% đến 100% với bước nhảy 5%, phản hồi kéo mượt mà (kiểm tra chuẩn tại 0% và 100%).
5. `Dialog`: Hộp thoại xác nhận với màn che Scrim 50% (`rgba(0,0,0,0.5)`). Thử nghiệm loại `destructive` với nút Hủy ưu tiên `primary` nhằm chống thao tác xóa nhầm (Hủy không gọi xóa, xác nhận chỉ gọi đúng 1 lần).
6. `BottomSheet`: Bảng trượt đáy thao tác ca chụp, hỗ trợ đóng khi chạm scrim ngoài và bắt phím Back Android.
7. `Snackbar`: Thanh thông báo nổi dưới đáy với loại `success` và nút đóng hành động.
8. `ProgressBar`: Thanh tiến trình tải mô hình hiển thị nhãn và tỷ lệ phần trăm (65%).
9. `Skeleton`: Khung xương tải dữ liệu với hiệu ứng nhấp nháy (pulsing animation).
10. `CTImageView`: Khung xem ảnh CT phổi trên nền cố định `IMAGE_CANVAS` (`#111210`), hỗ trợ cử chỉ cảm ứng 2 ngón tay Pinch-to-Zoom và Pan di chuyển, hiển thị watermark bắt buộc "ẢNH GIẢ LẬP" khi là ảnh demo.
11. `HeatmapLegend`: Chú giải thang màu khoa học Jet cố định kèm 3 nhãn "Thấp", "Mức đóng góp tương đối trong ảnh này", "Cao".
12. `ImageTile`: Danh sách ô ảnh thu nhỏ hiển thị đầy đủ 6 trạng thái (`pass`, `passNoCam`, `fail`, `running`, `pending`, `mock`), tách biệt rõ lỗi phân loại và lỗi thiếu Grad-CAM.
13. `ScoreRow`: Hàng điểm số phân loại hỗ trợ đa ngôn ngữ Việt - Anh, định dạng 3 chữ số thập phân có dấu phẩy (`0,712`), dùng thuật ngữ "Điểm".
14. `ScoreCard`: Thẻ điểm số hiển thị đúng 3 dòng cố định `[Benign, Malignant, Normal]`. Khi có nhiều lớp cùng đạt điểm số cao nhất, thẻ giữ nguyên thứ tự 3 lớp cố định, nhấn mạnh tất cả các lớp đồng điểm cao nhất và hiển thị đầy đủ nhãn tương ứng ở header mà không tự ý đặt ra quy tắc ưu tiên lâm sàng hay tự chọn lớp thắng; luôn đi kèm thông điệp chuẩn MSG-02.

---

## 3. Danh mục Tệp Ảnh Minh chứng Thực tế Lưu trữ

Tất cả ảnh chụp màn hình thực tế kéo trực tiếp từ máy ảo qua `adb screencap` được lưu tại `evidence/android/ui-04/`:
1. `01_ctimage_gradcam.png`: Khối ảnh CT giả lập, lớp phủ Grad-CAM, thang màu Jet HeatmapLegend, bộ chuyển Segmented và thanh trượt Slider 40%.
2. `02_scorecard_imagetiles.png`: Khối thẻ điểm số AI (ScoreCard) với 3 dòng cố định, lớp Ác tính được nhấn mạnh kèm lời nhắc MSG-02 và Lưới các ô ảnh ImageTile thể hiện 6 trạng thái.
3. `03_controls_progress_buttons.png`: Khối Toggle, Checkbox, ProgressBar, Skeleton và các nút kích hoạt hộp thoại.
4. `04_destructive_dialog_scrim.png`: Hộp thoại Dialog loại destructive hiển thị trên nền mờ Scrim 50%, nút Hủy bỏ được ưu tiên chọn nổi bật.
5. `05_bottomsheet_scrim.png`: Bảng trượt đáy BottomSheet hiển thị các thao tác ca chụp (Xuất PDF, Đồng bộ).
6. `06_snackbar_success.png`: Thông báo nổi Snackbar xuất hiện báo thành công lưu dữ liệu cục bộ.

---

## 4. Đối chiếu với Màn hình Thiết kế Chuẩn (`16-ai-image-result.png`)
- Khối hiển thị ảnh CT và Grad-CAM khớp hoàn toàn về cấu trúc phân bố, nền đen canvas `#111210`, chú giải dải màu Jet, thanh trượt độ phủ 40% và thẻ điểm số 3 lớp có thông điệp MSG-02 của bản vẽ Figma tham chiếu.

---

## 5. Xác nhận Giới hạn Thực nghiệm
- Toàn bộ kết quả và hình ảnh trên được ghi nhận trực tiếp từ **Máy ảo Android 14 (AVD LumaCT_Phone)** trên môi trường laptop phát triển; **chưa kiểm thử trên thiết bị vật lý thật (Redmi 13)** và **chưa kiểm thử trên iOS**.
- **Cử chỉ Pinch-to-zoom hai ngón tay**: Chưa được xác minh trên thiết bị cảm ứng vật lý thực tế. Trên máy ảo, việc kiểm tra chỉ dừng lại ở mô phỏng logic toán học và thao tác chuột đơn điểm.
- **Khớp ảnh gốc và Grad-CAM**: Việc đặt chung ảnh gốc và lớp phủ Grad-CAM trong cùng một `Animated.View` chia sẻ mảng `transform` là giải pháp kiến trúc cơ bản để đồng bộ biến đổi hình học, nhưng chưa đủ bằng chứng thực nghiệm để khẳng định ảnh và Grad-CAM luôn khớp tuyệt đối trong mọi tình huống co giãn hoặc độ phân giải ảnh không đồng nhất. Không tuyên bố là đã kiểm thử đầy đủ.
