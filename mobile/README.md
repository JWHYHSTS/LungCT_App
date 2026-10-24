# LungCT Mobile App (React Native + TypeScript + Expo)

Ứng dụng di động hỗ trợ bác sĩ phân loại ảnh CT phổi và trực quan hóa giải thích mô hình bằng bản đồ nhiệt Grad-CAM On-Device.

---

## 1. Yêu cầu môi trường
- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **Expo CLI**: Đi kèm qua `npx expo`
- **Thiết bị thử nghiệm**:
  - Android: Thiết bị thật Redmi 13 (bật USB Debugging) hoặc Android Emulator.
  - iOS: Thiết bị iPhone vật lý hoặc iOS Simulator trên macOS.

---

## 2. Hướng dẫn cài đặt

Di chuyển vào thư mục `mobile/`:
```bash
cd mobile
npm install
```

---

## 3. Các lệnh kiểm tra chất lượng mã nguồn (Quality Assurance)

Tất cả các lệnh phải được chạy trước khi commit và đảm bảo không có lỗi:

1. **Kiểm tra kiểu dữ liệu (TypeScript Typecheck)**:
   ```bash
   npm run typecheck
   ```
   Chạy `tsc --noEmit` ở chế độ strict mode, xác thực tính toàn vẹn của interface, props và types.

2. **Kiểm tra Linter (ESLint)**:
   ```bash
   npm run lint
   ```
   Sử dụng cấu hình chuẩn `eslint-config-expo/flat` để phát hiện lỗi cú pháp, biến không dùng, vi phạm quy tắc hooks.

3. **Kiểm tra định dạng (Prettier)**:
   ```bash
   npm run format:check
   ```
   Hoặc tự động sửa định dạng:
   ```bash
   npm run format
   ```

4. **Chạy kiểm thử tự động (Unit Tests)**:
   ```bash
   npm test
   ```
   Chạy toàn bộ 32 test case của hệ thống Theme màu (xác thực tính tương thích Sáng/Tối 48 tokens và tỷ lệ tương phản chuẩn y tế WCAG).

---

## 4. Hướng dẫn khởi chạy ứng dụng (Development)

1. **Khởi động Metro Bundler**:
   ```bash
   npm run start
   ```
   - Nhấn `a` trong terminal để mở trên Android device/emulator.
   - Nhấn `i` để mở trên iOS simulator.
   - Quét mã QR bằng ứng dụng **Expo Go** trên thiết bị thật.

2. **Màn hình xem thử Theme nội bộ (ThemePreviewScreen)**:
   - Ở giai đoạn UI-01, màn hình khởi động mặc định là `ThemePreviewScreen` (chỉ dùng cho kỹ sư trong quá trình phát triển).
   - Màn hình hiển thị đầy đủ 48 token màu sắc của cả 2 chế độ (Sáng / Tối) và cho phép chuyển đổi chế độ trực tiếp để kiểm tra độ tương phản.
   - *Lưu ý*: Màn hình này sẽ được thay thế bằng luồng điều hướng xác thực ở bước UI-05.
