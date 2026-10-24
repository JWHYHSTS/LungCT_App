# UI-03 — Component lõi (đợt 1)

**Đầu vào.** `docs/ui-handoff/design/03-components.md`; kích thước chính xác lấy trong `reference/screens-v2/layout-json/` (ví dụ tìm `"name": "Button/Đăng nhập"`: padding 13/20, gap 8, radius 12, chữ `labelL`).

**Làm các component** (mỗi cái 1 file trong `src/ui/components/`, có TSDoc, props có kiểu):
`AppText` (nhận `variant` = tên style trong `typography`), `Button`, `IconButton`, `TextField`, `SearchField`, `FilterChip`, `StatusBadge`, `AILabel`, `Banner`, `TopBar`, `TabBar` (chỉ phần hiển thị), `ListRow`, `SectionHeader`, `StatCard`, `EmptyState`, `Divider`, `Screen` (khung màn: safe area, nền `bg.app`, vùng nội dung cuộn, lề 16).

**Ràng buộc.**
- Màu chỉ qua `useTheme()`; vùng chạm ≥ 44×44; có `accessibilityRole`, `accessibilityLabel` (nút chỉ có icon), `accessibilityState` (selected/disabled).
- `StatusBadge`, `AILabel`, `Banner` luôn có chữ (BR-UI-01).
- `Button` loading: hiện vòng xoay, khóa bấm lặp.

**Kiểm thử.** Test render (`@testing-library/react-native`) cho mỗi component và mỗi biến thể; snapshot chấp nhận được. Thêm từng component vào `UIGalleryScreen`.

**Minh chứng.** Ảnh Gallery trên điện thoại đặt cạnh ảnh `reference/screens-v2/png/04-doctor-home.png` (so badge, nút, dòng danh sách).

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
