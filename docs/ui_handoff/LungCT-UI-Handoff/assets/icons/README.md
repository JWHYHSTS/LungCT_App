# LungCT-Icons v1.1

Bộ icon dùng cho ứng dụng LungCT (React Native/Expo). Gồm **64 icon**: 48 icon gốc do nhóm cung cấp (giữ nguyên, không chỉnh sửa) và **16 icon bổ sung** vẽ thêm vì đặc tả màn hình cần mà bộ gốc chưa có.

## Cấu trúc
- `svg/` — nguồn vector 64×64, nét #4D5048 dày 2, đầu nét tròn, tô màu pastel cùng bảng màu bộ gốc.
- `png-32px/`, `png-64px/` — ảnh nền trong suốt. PNG của 48 icon gốc lấy nguyên từ gói gốc; PNG của 16 icon bổ sung được dựng từ SVG bằng Chromium.
- `manifest.json` — danh sách, nguồn gốc (original/added) và lý do bổ sung.
- `contact-sheet.png` — bảng xem nhanh (ô nền xanh nhạt = icon bổ sung).

## 16 icon bổ sung (lý do)
- `back` — Quay lại (TopBar Stack)
- `close` — Đóng (TopBar Modal)
- `chevron-right` — Mũi tên dòng danh sách; ảnh kế tiếp (SCR-R01)
- `sort` — Sắp xếp (SCR-P01/C01)
- `language` — Ngôn ngữ (SCR-U02)
- `theme` — Giao diện Sáng/Tối (SCR-U02)
- `privacy` — Quyền riêng tư (SCR-U02, M02)
- `eye` — Hiện mật khẩu; Xem PDF
- `eye-off` — Ẩn mật khẩu
- `calendar` — Chọn ngày sinh (SCR-P02)
- `info` — Banner/Hộp thoại thông tin
- `pending` — Trạng thái Chờ duyệt / Chờ phân tích
- `conflict` — Xung đột đồng bộ (SCR-Y01)
- `partial` — Kết quả một phần (ca)
- `retry` — Thử lại / Phân tích lại
- `cancel` — Hủy phân tích / Hủy trong menu

## Dùng trong React Native
- Khuyến nghị: `react-native-svg` + `react-native-svg-transformer` để import SVG thành component; đổi màu nét qua prop `stroke` khi ở chế độ Tối (token `color/border/icon`: sáng #4D5048, tối #CFCAC0).
- Kích thước hiển thị chuẩn: 24 (trong nút, dòng), 32 (đầu dòng danh sách), 40–56 (minh họa trạng thái). Vùng chạm tối thiểu 44×44 dù icon nhỏ hơn.
- Icon không bao giờ là kênh duy nhất truyền trạng thái — luôn đi kèm chữ (BR-UI-01).
- Màu bản đồ Grad-CAM không dùng màu icon/thương hiệu (BR-AI-05).
