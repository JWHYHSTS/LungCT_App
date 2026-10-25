# HƯỚNG DẪN KIẾN TRÚC & TRIỂN KHAI BỘ COMPONENT LÕI ĐỢT 1 (UI-03)

Tài liệu này được biên soạn dành cho nhà phát triển học tập, nắm vững tư duy thiết kế hệ thống thành phần (Design System Components) trong dự án **LungCT Mobile** (React Native, TypeScript, Expo).

---

## 1. Triết lý Thiết kế Component trong Ứng dụng Y tế

Hệ thống giao diện của một ứng dụng chẩn đoán hỗ trợ y tế (Medical Decision Support System) có những yêu cầu khắt khe hơn ứng dụng tiêu dùng thông thường:
1. **Tuyệt đối không nhầm lẫn thị giác (Visual Clarity)**: Màu sắc phải mang tính báo hiệu chuẩn mực, không dùng màu sắc tùy hứng.
2. **Khả năng tiếp cận cao (Accessibility - A11y)**: Bác sĩ, kỹ thuật viên thao tác nhanh, có thể sử dụng găng tay y tế hoặc trong môi trường ánh sáng phức tạp. Do đó, kích thước vùng chạm tối thiểu phải là **$44 \times 44\text{ dp}$**.
3. **Quy tắc Nghiệp vụ Y tế Yêu cầu Cụ thể (Business Rules)**:
   - **BR-UI-01**: Các thành phần biểu thị trạng thái (`StatusBadge`, `AILabel`, `Banner`) **bắt buộc luôn có chữ đi kèm**, không được chỉ dùng icon hoặc màu sắc đơn thuần (tránh rủi ro cho người khiếm thị màu / mù màu).
   - **BR-UI-02 / StatCard**: Chỉ đếm số lượng ca (`count`), **tuyệt đối không hiển thị tỷ lệ % độ chính xác của AI** trên các thẻ thống kê tổng quan nhằm tránh gây hiểu lầm đây là tỷ lệ tin cậy chẩn đoán.

---

## 2. Danh mục & Cấu trúc 17 Component Lõi (Đợt 1)

Tất cả component được đặt trong `src/ui/components/` và xuất tập trung qua `index.ts`:

```
src/ui/components/
├── AppText.tsx        # Văn bản chuẩn hóa, thừa hưởng font Be Vietnam Pro
├── Button.tsx         # Nút bấm hành động (Primary, Secondary, Tonal, Plain, Danger)
├── IconButton.tsx     # Nút icon độc lập (vùng chạm chuẩn >= 44x44 dp)
├── TextField.tsx      # Ô nhập liệu chuẩn hóa (hỗ trợ helper, error, icon)
├── SearchField.tsx    # Ô tìm kiếm tích hợp icon và nút xóa nhanh
├── FilterChip.tsx     # Thẻ lọc danh mục / trạng thái
├── StatusBadge.tsx    # Huy hiệu trạng thái (Success, Warning, Danger, Pending, Brand)
├── AILabel.tsx        # Nhãn phân loại 3 lớp AI (Benign, Malignant, Normal)
├── Banner.tsx         # Khối thông báo hệ thống (Offline, Mock, Sync Error, Recalibration)
├── TopBar.tsx         # Thanh tiêu đề đầu màn hình
├── TabBar.tsx         # Thanh điều hướng đáy màn hình (Doctor / Technician)
├── ListRow.tsx        # Hàng danh sách bệnh nhân / ca chụp
├── SectionHeader.tsx  # Tiêu đề nhóm chức năng
├── StatCard.tsx       # Thẻ chỉ số số lượng ca khám
├── EmptyState.tsx     # Màn hình / trạng thái rỗng
├── Divider.tsx        # Đường kẻ phân cách
├── Screen.tsx         # Khung bao bọc màn hình tổng thể
└── index.ts           # Điểm xuất tập trung (Barrel export)
```

---

## 3. Chi tiết Kỹ thuật Từng Thành phần

### 3.1. `AppText`
- **Mục đích**: Thay thế toàn bộ thẻ `<Text>` nguyên bản của React Native.
- **Đặc điểm**:
  - Tự động áp dụng hệ thống `typography` chuẩn (tương ứng kích cỡ, chiều cao dòng và độ đậm của font `Be Vietnam Pro`).
  - Tự động lấy màu chữ mặc định từ `colors.text.primary` của theme hiện hành (`useTheme()`), cho phép ghi đè linh hoạt qua prop `color`.

### 3.2. `Button` & `IconButton`
- **Các biến thể (`variant`)**:
  - `primary`: Nền xanh thương hiệu `brandDark` (chế độ Tối) hoặc `brand` (chế độ Sáng), chữ trắng tương phản cao. Dùng cho hành động chính (Phân tích ảnh, Lưu hồ sơ).
  - `secondary`: Nền trong suốt có viền `border.subtle`.
  - `tonal`: Nền màu nhẹ `neutralSurfaceSoft`.
  - `plain`: Không viền, không nền.
  - `danger`: Báo hiệu hành động nguy hiểm (Xóa ca chụp, Hủy dữ liệu).
- **Trạng thái `loading`**:
  - Khi `loading={true}`, hiển thị `ActivityIndicator` đồng màu chữ, đồng thời tự động vô hiệu hóa (`disabled={true}`) để chặn hành vi bấm liên tiếp (debounce/double tap).
- **Vùng chạm (`touchTarget`)**:
  - Mọi kích thước nút (kể cả size S hay IconButton) đều duy trì `minHeight: 44`, `minWidth: 44` hoặc có padding bọc ngoài để thỏa mãn tiêu chuẩn WCAG.

### 3.3. `TextField` & `SearchField`
- **Cơ chế trạng thái**:
  - Quản lý trạng thái tập trung (Focus State) bằng state nội bộ `isFocused`.
  - Khi có lỗi (`error` prop), đường viền tự động chuyển sang màu đỏ cảnh báo y tế `colors.feedback.danger` và hiển thị thông báo lỗi bên dưới.
  - Tích hợp `trailingIcon`: Cho phép bấm vào icon để xóa văn bản hoặc hiển thị trạng thái mật khẩu/báo lỗi.

### 3.4. `StatusBadge` & `AILabel`
- **Đảm bảo BR-UI-01**:
  - Thành phần luôn bọc nhãn chữ rõ nghĩa (Text Label) trong mọi tình huống.
  - Phân định rõ 5 sắc thái y tế:
    - `success`: Đã hoàn thành, ca bình thường.
    - `warning`: Cảnh báo hội chẩn, cần lưu ý.
    - `danger`: Ca ác tính nghi ngờ, lỗi hệ thống.
    - `pending`: Đang xếp hàng phân tích CAM.
    - `brand`: Chế độ AI On-Device trực tiếp.

### 3.5. `StatCard`
- **Đảm bảo BR-UI-02**:
  - Thuộc tính `value` chỉ nhận kiểu dữ liệu số lượng hoặc chuỗi đếm. Không tích hợp các thanh tiến độ hay tỷ lệ phần trăm độ tin cậy AI trên thẻ thống kê này.

### 3.6. `TabBar`
- **Đa vai trò (`role`)**:
  - `doctor` (Bác sĩ - 5 tab theo H01/P01/C01/S01/U01): Gồm Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi.
  - `admin` (Quản trị viên - 3 tab theo M01/M03/U01): Gồm Tài khoản, Thống kê, Tôi.
  - Tích hợp icon vector 24dp tương ứng, đổi màu active sang màu thương hiệu, nhãn chữ luôn hiển thị.

---

## 4. Kiểm thử Đơn vị & Bảo đảm Chất lượng (Quality Gates)

Để đảm bảo toàn bộ component hoạt động tin cậy, dự án thiết lập quy trình kiểm thử tự động:
1. **Kiểm tra cú pháp & kiểu (Typecheck)**:
   ```bash
   npm run typecheck
   ```
   Kiểm tra tính nhất quán của props và TypeScript types (`tsc --noEmit`), đảm bảo 0 lỗi.
2. **Kiểm tra chuẩn mã (ESLint)**:
   ```bash
   npm run lint
   ```
   Tuân thủ nghiêm ngặt quy tắc code clean, hook dependency và import sorting.
3. **Kiểm tra định dạng (Prettier)**:
   ```bash
   npm run format:check
   ```
4. **Kiểm thử đơn vị (Jest)**:
   ```bash
   npm test
   ```
   Bộ test tại `src/ui/components/__tests__/components.test.tsx` kiểm tra tính hợp lệ khi render của toàn bộ 17 component, đảm bảo các thuộc tính Accessibility, Disabled, Loading và Variants hoạt động hoàn hảo.
