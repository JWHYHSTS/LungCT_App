# UI-07 — Màn chi tiết của bác sĩ

**Đầu vào.** layout-json + PNG số 13 Thêm bệnh nhân, 14 Chi tiết bệnh nhân, 15 Chi tiết ca, 16 Kết quả ảnh AI, 17 Xuất PDF; đặc tả SCR-P02, P03, C02, C03, C05, R01, D01 (kể cả các trạng thái trong `design/02-dac-ta-tung-khung.md`).

**Yêu cầu.**
1. P02 (modal): trường theo đặc tả, * bắt buộc (Q-20 đề xuất: mã, họ tên, ngày sinh, giới tính), chọn ngày bằng `@react-native-community/datetimepicker` (Android hộp thoại Material, iOS wheel/compact), lỗi “Mã bệnh nhân đã tồn tại.” / “Ngày sinh không hợp lệ.”, hỏi “Bỏ thông tin chưa lưu?”.
2. P03: thẻ hồ sơ, Tạo ca mới, danh sách ca; menu ⋯ (Android overflow, iOS action sheet) có “Chuyển vào thùng rác” + hộp thoại.
3. C02: đầu ca, Thêm ảnh (bottom sheet Thư viện/Camera — UI thôi, `TODO(CASE-02)`), Phân tích, lưới `ImageTile`, nhận xét tự lưu “Đã lưu lúc …”, Xuất PDF, Hoàn tất ca (disabled khi 0 ảnh hoặc có ảnh đang chạy, kèm lý do) → modal C05 với bảng trạng thái từng ảnh và MSG-12.
4. R01: `CTImageView` + `HeatmapLegend` + Segmented Ảnh gốc/Grad-CAM + Slider độ phủ (40%) + `ScoreCard` + thông tin phân tích + MSG-01/03; trước/sau giữa các ảnh. Trạng thái FAIL (MSG-10), thiếu Grad-CAM (MSG-11), mock (banner MOCK).
5. D01: chọn ngôn ngữ PDF, kèm Grad-CAM, phiên bản; danh sách PDF đã xuất; Chia sẻ → hộp thoại “Chia sẻ dữ liệu nhạy cảm?” trước khi mở bảng chia sẻ hệ thống (`expo-sharing`). Chưa cần tạo PDF thật (`TODO(PDF-01)`).

**Kiểm thử.** Test: Hoàn tất disabled đúng điều kiện; R01 không hiện điểm khi FAIL; Chia sẻ luôn qua hộp thoại xác nhận.

**Minh chứng.** Ảnh 5 màn + các trạng thái lỗi, đặt cạnh PNG chuẩn.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
