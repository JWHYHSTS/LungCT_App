# BIÊN BẢN THỰC NGHIỆM VÀ KIỂM THỬ GIAO DIỆN UI-03 TRÊN MÁY ẢO ANDROID (LUMACT_PHONE)

## 1. Thông tin Máy ảo AVD & Môi trường Chạy
- **Thiết bị ảo (AVD)**: `LumaCT_Phone`
- **Phiên bản hệ điều hành**: Android 14.0 (API Level 34)
- **Kiến trúc phần cứng / ABI**: `x86_64` (Model: `sdk_gphone64_x86_64`)
- **Độ phân giải màn hình**: 1080 x 1920 px (420 dpi)
- **Runtime Client**: Expo Go (Package: `host.exp.exponent`, SDK 58.0.0)
- **Engine Bundler**: Metro Bundler (React Native 0.88.0, Hermes Engine)

---

## 2. Các nội dung đã thực nghiệm trên Máy ảo

### A. 17 Component Lõi đợt 1 (Core Components)
- Đã kiểm tra trực quan và chức năng của 17 component chuẩn hóa trong `mobile/src/ui/components/`:
  1. `AppText`: Thừa hưởng typography `Be Vietnam Pro`, tự động gắn màu theo `useTheme()`.
  2. `Button`: Các biến thể `primary`, `secondary`, `tonal`, `plain`, `danger`; 3 kích thước L (48dp), M (40dp), S (32dp). Có trạng thái `loading` hiển thị spinner và vô hiệu hóa chạm lặp.
  3. `IconButton`: Kích thước chạm chuẩn $\ge 44\times 44\text{ dp}$, `accessibilityRole="button"`, hỗ trợ biến thể `plain`, `tonal`, `danger`.
  4. `TextField`: Hỗ trợ label, helper text, error text, `trailingIcon`, viền tự động đổi màu theo trạng thái focus/error.
  5. `SearchField`: Tích hợp icon kính lúp, nút xóa nhanh (x), nền `neutralSurfaceSoft`.
  6. `FilterChip`: Chuyển đổi trạng thái chọn/không chọn (`selected`), vùng chạm $\ge 44\times 44\text{ dp}$.
  7. `StatusBadge`: 5 sắc thái y tế (`success`, `warning`, `danger`, `pending`, `brand`), tuân thủ BR-UI-01 luôn có chữ đi kèm biểu tượng.
  8. `AILabel`: Hiển thị 3 lớp chẩn đoán phổi (`Benign` - Lành tính, `Malignant` - Ác tính, `Normal` - Bình thường) theo đúng chỉ định y tế.
  9. `Banner`: 4 loại thông báo (`offline`, `mock`, `syncError`, `recalibration`) với viền và nền dịu mắt theo token.
  10. `TopBar`: Thanh điều hướng đầu màn hình hỗ trợ tiêu đề, nút quay lại (`back`), các nút tác vụ phải (`rightActions`).
  11. `TabBar`: Thanh điều hướng đáy màn hình, tự động thích ứng vai trò bác sĩ (`doctor`) / quản trị viên (`admin`), vùng chạm $\ge 44\times 44\text{ dp}$.
  12. `ListRow`: Hàng danh sách bệnh nhân/ca chụp với `leadingIcon`, tiêu đề, phụ đề, badges và chevron điều hướng.
  13. `SectionHeader`: Tiêu đề phân nhóm khối chức năng kèm nhãn tác vụ phụ (`actionLabel`).
  14. `StatCard`: Thẻ thống kê số lượng ca khám, ca nghi ngờ, tuân thủ nghiêm ngặt quy tắc chỉ hiển thị số lượng ca, **không hiển thị phần trăm độ chính xác AI**.
  15. `EmptyState`: Trạng thái rỗng gồm icon lớn, tiêu đề, mô tả và nút tạo mới hành động.
  16. `Divider`: Đường phân cách thanh mảnh, tự động đổi màu theo theme.
  17. `Screen`: Component khung sườn bọc ngoài, tích hợp `SafeAreaView`, `StatusBar`, `KeyboardAvoidingView` và `ScrollView` tùy chọn.

### B. Khả năng Tiếp cận (Accessibility & WCAG) & Bàn phím
- Mọi component bấm được đều có `accessibilityRole="button"`, `accessibilityLabel` và `accessibilityState` phù hợp.
- `TextField` khi phát hiện lỗi có cờ thông báo `accessibilityRole="alert"` giúp bộ đọc màn hình nhận diện tức thì.
- Kích thước vùng bấm (touch target) đo đạc đều $\ge 44\times 44\text{ dp}$ theo khuyến cáo WCAG 2.1 AA / Touch Target Guidelines.
- Màu chữ và nền đạt tỷ lệ tương phản tối thiểu 4.5:1 (Normal Text) và 3:1 (Large Text / Components).
- **Rà soát bàn phím ảo**: Màn hình `Screen` và `UIGalleryScreen` trang bị `KeyboardAvoidingView` và `keyboardShouldPersistTaps="handled"`, `keyboardDismissMode="on-drag"`. Khi chạm ô nhập liệu, bàn phím ảo Android đẩy nội dung mượt mà, không che khuất ô nhập hoặc nút bấm.

### C. Chuyển đổi Theme Sáng / Tối & Đa ngôn ngữ
- Chuyển đổi linh hoạt giữa Sáng (`light`) và Tối (`dark`): các token màu `colors.surface.card`, `colors.text.primary`, `colors.border.subtle` phản hồi tức thì.
- Chuyển đổi ngôn ngữ Tiếng Việt và English hoạt động mượt mà trên toàn bộ các chuỗi giao diện, không bị tràn dòng hay cắt chữ (ellipsize/clipping).

---

## 3. Danh mục Tệp Ảnh Minh chứng Thực tế Lưu trữ

Tất cả ảnh chụp màn hình thực tế kéo trực tiếp từ máy ảo qua `adb screencap` được lưu tại `evidence/android/ui-03/`:
1. `01_components_top_banner_buttons.png`: Phần đầu màn hình UI Gallery hiển thị bộ chuyển theme/ngôn ngữ, Banner thông báo (Offline, Mock) và Khối Nút bấm (Primary, Secondary, Loading, Danger, IconButton).
2. `02_components_textfields_chips_badges.png`: Khối Ô nhập liệu TextField (bình thường, có helper, báo lỗi validation) và Ô tìm kiếm SearchField.
3. `03_components_chips_badges_ailabel.png`: Khối FilterChip (Tất cả ca, Chờ duyệt, Ác tính), StatusBadge 5 sắc thái và AILabel (Lành tính, Ác tính, Bình thường).
4. `04_components_statcard_listrows.png`: Khối Thẻ thống kê StatCard số lượng ca và Khối thẻ danh sách ListRow kèm badge.
5. `05_components_emptystate_divider.png`: Khối Trạng thái rỗng EmptyState và Lưới 64 Vector Icons.
6. `06_components_light_mode.png`: Toàn bộ các component lõi hiển thị ở Chế độ Sáng (Light Theme).
7. `07_components_light_mode_scrolled.png`: Cuộn trang xem chi tiết Button, TextField ở Chế độ Sáng (Light Theme).
8. `08_components_keyboard_focus.png`: Bàn phím ảo Android 14 hiển thị khi focus vào ô TextField, kiểm tra tránh che khuất nội dung nhập liệu.

---

## 4. Xác nhận Giới hạn Thực nghiệm
- Toàn bộ kết quả và hình ảnh trên được ghi nhận trực tiếp từ **Máy ảo Android 14 (AVD LumaCT_Phone)**.
- **Chưa kiểm thử trên thiết bị vật lý thật (Redmi 13)** và **chưa kiểm thử trên iOS**.
