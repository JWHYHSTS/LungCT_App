# HƯỚNG DẪN KIẾN TRÚC & TRIỂN KHAI CÁC COMPONENT ĐẶC THÙ LUNGCT ĐỢT 2 (UI-04)

Tài liệu này được biên soạn dành cho nhà phát triển học tập, nắm vững tư duy thiết kế các thành phần giao diện chuyên sâu (Specialized Domain Components) phục vụ chẩn đoán hình ảnh và trí tuệ nhân tạo (Edge AI) trong dự án **LungCT Mobile** (React Native, TypeScript, Expo).

---

## 1. Triết lý Thiết kế Component Y tế Chuyên sâu (Domain Components)

Khác với các thành phần điều hướng cơ bản (UI-03), các thành phần ở đợt 2 giải quyết trực tiếp bài toán chẩn đoán ảnh cắt lớp vi tính lồng ngực (Chest CT) và giải thích kết quả AI:
1. **Khoa học và chuẩn xác trong hiển thị bản đồ nhiệt (Scientific Heatmap)**:
   - Màu sắc của bản đồ nhiệt Grad-CAM là bảng màu khoa học cố định (thang Jet: `HEATMAP_STOPS` từ xanh lam sâu `#00008F` đến đỏ thẫm `#E61A0D`), **tuyệt đối không thay đổi theo theme Sáng/Tối hay màu sắc thương hiệu**.
   - Phải luôn có chú giải thang màu (`HeatmapLegend`) đi kèm khi bật hiển thị lớp phủ Grad-CAM.
2. **Quy tắc Nghiệp vụ Y tế & Bảo vệ An toàn Bệnh nhân**:
   - **BR-AI-05**: Điểm số đầu ra của mô hình được gọi là **“Điểm” (Score)**, tuyệt đối không gọi là "Xác suất" (Probability) để tránh gây hiểu nhầm đây là chẩn đoán xác định.
   - **BR-AI-03 & Thứ tự lớp cố định**: Thứ tự 3 lớp phân loại của nghiên cứu Adaptive AACNN-ViT luôn luôn cố định: `[Benign (Lành tính), Malignant (Ác tính), Normal (Bình thường)]`. `ScoreCard` tự động chuẩn hóa hiển thị đúng thứ tự này dù dữ liệu API đầu vào có bị xáo trộn.
   - **MSG-02 bắt buộc**: Mọi thẻ điểm số đều phải hiển thị thông điệp pháp lý: *"Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh."*
   - **BR-AI-04**: Tách biệt rõ ràng giữa **Lỗi phân loại** (`fail`: không có điểm) và **Thiếu Grad-CAM** (`passNoCam`: điểm phân loại vẫn hợp lệ nhưng không xuất được bản đồ nhiệt).
   - **BR-AI-06**: Mọi ảnh CT hiển thị trong môi trường demo/gallery bắt buộc phải có nhãn cảnh báo **"ẢNH GIẢ LẬP"**, không sử dụng dữ liệu bệnh nhân thật (phi tập trung, ẩn danh).
   - **BR-DEL-02 & Destructive Dialog**: Hộp thoại xác nhận thao tác nguy hiểm (xóa vĩnh viễn) luôn thiết lập nút **Hủy** là nút ưu tiên nhấn mạnh (`primary`) để phòng tránh thao tác bấm nhầm xóa dữ liệu y tế.

---

## 2. Danh mục & Cấu trúc 14 Component Đặc thù (UI-04)

Tất cả component được đặt trong `src/ui/components/` và xuất tập trung qua `index.ts`:

```
src/ui/components/
├── Toggle.tsx          # Công tắc bật/tắt On-Device/Cloud (vùng chạm ≥ 44 dp)
├── Checkbox.tsx        # Hộp kiểm xác nhận đồng thuận (vùng chạm ≥ 44 dp)
├── Segmented.tsx       # Bộ chọn phân đoạn (Ảnh gốc / Grad-CAM, 7 ngày / 30 ngày)
├── Slider.tsx          # Thanh trượt độ phủ Grad-CAM (0–100%, bước nhảy 5%)
├── Dialog.tsx          # Hộp thoại xác nhận / cảnh báo (scrim 50%, ưu tiên Hủy với destructive)
├── BottomSheet.tsx     # Bảng trượt đáy (scrim 50%, hỗ trợ phím Back Android)
├── Snackbar.tsx        # Thanh thông báo nổi dưới đáy (tự tắt, hỗ trợ action)
├── ProgressBar.tsx     # Thanh tiến trình tải mô hình / đồng bộ
├── Skeleton.tsx        # Khung xương giữ chỗ khi tải dữ liệu (pulsing animation)
├── HeatmapLegend.tsx   # Chú giải thang màu khoa học Jet cho Grad-CAM
├── CTImageView.tsx     # Khung xem ảnh CT (nền #111210, cử chỉ pinch-zoom/pan, watermark)
├── ImageTile.tsx       # Ô thu nhỏ ảnh CT (hỗ trợ 6 trạng thái, tách FAIL và Thiếu CAM)
├── ScoreRow.tsx        # Hàng điểm số phân loại (định dạng 3 chữ số thập phân "0,712")
└── ScoreCard.tsx       # Thẻ tổng hợp điểm số AI (cố định 3 lớp, kèm MSG-02)
```

---

## 3. Chi tiết Kỹ thuật Từng Thành phần

### 3.1. `CTImageView` & `HeatmapLegend`
- **Mục đích**: Hiển thị ảnh CT phổi cùng lớp phủ bản đồ giải thích Grad-CAM phục vụ bác sĩ chẩn đoán.
- **Đặc điểm**:
  - Nền cố định là `IMAGE_CANVAS` (`#111210`) để tối ưu hóa độ tương phản mô phổi và khí quản.
  - Tích hợp cử chỉ cảm ứng 2 ngón tay Pinch-to-Zoom và Pan di chuyển ảnh khi phóng to thông qua `PanResponder` và `Animated`.
  - Hỗ trợ hòa trộn lớp phủ `heatmapOpacity` từ thanh trượt `Slider`.
  - Luôn đi kèm `HeatmapLegend` với 5 điểm dừng màu Jet cố định và các nhãn "Thấp", "Mức đóng góp tương đối trong ảnh này", "Cao".

### 3.2. `ScoreCard` & `ScoreRow`
- **Đảm bảo BR-AI-03 & BR-AI-05**:
  - Nhận mảng điểm số và tự động ánh xạ vào 3 dòng cố định `[Benign, Malignant, Normal]`.
  - Tự động phát hiện lớp có điểm số cao nhất để gắn cờ `isTop = true` và hiển thị nhãn `AILabel` tương ứng.
  - **Quy tắc khi đồng điểm cao nhất**: Nếu có từ 2 lớp trở lên cùng đạt điểm cao nhất, hệ thống giữ nguyên thứ tự 3 lớp cố định, nhấn mạnh (`isTop = true`) tất cả các lớp đó và hiển thị đầy đủ nhãn tương ứng ở header; tuyệt đối không tự thêm quy tắc ưu tiên lâm sàng hay tự chọn một lớp thắng khi tài liệu handoff không quy định.
  - Sử dụng hàm định dạng chuẩn từ `SCORE_FORMAT_DECISION` (`ui-decisions.ts`) để hiển thị dạng `"0,712"` (dấu phẩy ngăn cách thập phân, 3 chữ số sau dấu phẩy).

### 3.3. `ImageTile`
- **Đảm bảo BR-AI-04**:
  - Hỗ trợ 6 trạng thái: `pending` (Chờ), `running` (Đang chạy), `pass` (Đạt), `passNoCam` (Thiếu CAM), `fail` (Lỗi), `mock` (Giả lập).
  - Tách biệt rõ ràng trạng thái lỗi: ca thiếu Grad-CAM vẫn giữ điểm phân loại và hiển thị huy hiệu `StatusBadge` màu vàng "Thiếu CAM", trong khi lỗi phân loại hoàn toàn hiển thị viền đỏ và nhãn "Lỗi".

### 3.4. `Slider` & `Segmented`
- **`Slider`**: Cho phép bác sĩ trượt điều chỉnh độ phủ của Grad-CAM từ 0% đến 100% với bước nhảy 5% (`step={5}`). Thao tác kéo mượt mà, hỗ trợ cờ trợ năng `accessibilityRole="adjustable"`.
- **`Segmented`**: Cho phép chuyển đổi tức thì giữa chế độ xem "Ảnh gốc" và "Grad-CAM".

### 3.5. `Dialog`, `BottomSheet` & `Snackbar`
- **`Dialog`**: Sử dụng `Modal` trong suốt với scrim đen 50% (`rgba(0, 0, 0, 0.5)`). Khi là loại `destructive`, nút Hủy được gán kiểu `primary` để hướng người dùng vào lựa chọn an toàn (Hủy không bao giờ gọi action xóa; Xác nhận gọi đúng 1 lần).
- **`BottomSheet`**: Hỗ trợ kéo từ đáy, đóng khi chạm ngoài nền và tự động bắt sự kiện nút Back vật lý trên Android (`onRequestClose`).
- **`Snackbar`**: Tự động hiển thị và biến mất mượt mà sau 4000ms hoặc khi bấm nút hành động.

---

## 4. Xử lý Cảnh báo ESLint & Giới hạn Thực nghiệm Kỹ thuật

### 4.1. Quy tắc `react-hooks/refs` & `PanResponder`
- Linter của Expo (`eslint-config-expo/flat`) kích hoạt rule kiểm tra của React Compiler (`react-hooks/refs`).
- Khi khởi tạo `PanResponder.create({...})` bên trong `useMemo`, các hàm callback đọc `trackWidthRef.current` hoặc `scaleValRef.current` khi cử chỉ xảy ra bị phân tích tĩnh nhận nhầm là "truy cập ref trong quá trình render" (false positive).
- **Cách xử lý đúng chuẩn**: Không tắt rule này trên toàn bộ dự án (`mobile/eslint.config.js`). Giữ nguyên cấu hình kiểm tra chặt chẽ toàn cục và chỉ thêm chú thích vô hiệu hóa cục bộ tại đúng dòng khởi tạo `PanResponder.create` trong `Slider.tsx` và `CTImageView.tsx`, kèm ghi chú giải thích rõ bản chất cảnh báo giả.

### 4.2. Giới hạn Kiểm thử Thực tế
- **Cử chỉ cảm ứng đa điểm (Pinch-to-zoom)**: Khung hiển thị `CTImageView` được cài đặt lồng ghép ảnh gốc và lớp phủ Grad-CAM trong cùng một `Animated.View` chia sẻ chung mảng `transform: [{ translateX }, { translateY }, { scale }]`. Tuy nhiên, cử chỉ pinch-zoom bằng hai ngón tay thực tế **chưa được xác minh trên thiết bị cảm ứng vật lý** (chỉ mới kiểm tra logic tính khoảng cách và thao tác cuộn/kéo chuột đơn điểm trên máy ảo AVD). Việc dùng chung transform là tiền đề kiến trúc tốt nhưng chưa đủ để kết luận ảnh và Grad-CAM khớp tuyệt đối trong mọi tình huống co giãn thực tế.

---

## 5. Kiểm thử Đơn vị & Bảo đảm Chất lượng (Quality Gates)

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
   Tuân thủ nghiêm ngặt quy tắc code clean, hook dependency và import sorting mà không hạ chuẩn toàn cục.
3. **Kiểm tra định dạng (Prettier)**:
   ```bash
   npm run format:check
   ```
4. **Kiểm thử đơn vị (Jest)**:
   ```bash
   npm test
   ```
   Bộ test tại `src/ui/components/__tests__/components.test.tsx` hiện gồm **18 tests** (57 tests trên toàn dự án: 32 tests theme, 3 tests icons, 4 tests i18n, 18 tests components), bao quát các kiểm thử chuyên sâu cho ScoreCard, ScoreRow, ImageTile, HeatmapLegend, Dialog, BottomSheet, Slider và các component đặc thù đợt 2.
