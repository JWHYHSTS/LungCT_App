# Giải thích Kiến trúc & Luồng Hoạt động: Font, Icon Vector và Đa ngôn ngữ (UI-02)

Tài liệu này được biên soạn dành cho sinh viên và nhà phát triển (đặc biệt có nền tảng C/C++) để nắm bắt cơ chế vận hành của 3 trụ cột giao diện chính: **Font chữ y tế**, **Hệ thống Icon vector SVG** và **Hệ sinh thái Đa ngôn ngữ i18n**.

---

## 1. Bản đồ Kiến trúc UI-02 (Architecture Map)

```text
App.tsx (Khởi tạo gốc)
  │
  ├─► [1] useFonts (expo-font): Nạp trước 3 tệp TTF Be Vietnam Pro vào bộ nhớ
  │       ├─ BeVietnamPro-Regular.ttf
  │       ├─ BeVietnamPro-Medium.ttf
  │       └─ BeVietnamPro-SemiBold.ttf
  │       (Hiện ActivityIndicator nếu font chưa sẵn sàng)
  │
  ├─► [2] i18n/index.ts: Khởi tạo i18next + expo-localization
  │       ├─ Đọc locale hệ điều hành điện thoại (Localization.getLocales())
  │       ├─ Nạp từ điển: vi.json & en.json
  │       └─ Cung cấp hàm dịch thuật ngữ y tế t('key')
  │
  ├─► [3] ThemeProvider: Quản lý 48 token màu sắc WCAG
  │
  └─► [4] UIGalleryScreen: Màn hình kiểm nghiệm tổng hợp
          ├─ Hiển thị mẫu các thông điệp y tế cốt lõi (MSG-01, MSG-02)
          ├─ Chuyển đổi ngôn ngữ Việt - Anh thời gian thực
          ├─ Chuyển đổi Theme Sáng / Tối / Tự động theo hệ thống
          └─ Lưới 64 Vector SVG Icons (Icon.tsx ánh xạ ICON_MAP)
```

---

## 2. Chi tiết Kỹ thuật Từng Thành phần

### A. Font chữ Be Vietnam Pro & Typography
- **Cơ chế nạp**: Sử dụng hook `useFonts` từ `expo-font`. 
  - Khác với ứng dụng native thuần (phải khai báo font vào Android assets/fonts và cấu hình Gradle), Expo cho phép nạp font bất đồng bộ (asynchronous) lúc khởi động.
  - Ứng dụng hiển thị `ActivityIndicator` ngắn gọn trong khi bộ font được tải lên GPU texture, đảm bảo không có hiện tượng giật font (FOUT - Flash of Unstyled Text).
- **Hệ thống Font Family**:
  - `FONT_FAMILY.regular`: `'BeVietnamPro-Regular'`
  - `FONT_FAMILY.medium`: `'BeVietnamPro-Medium'`
  - `FONT_FAMILY.semibold`: `'BeVietnamPro-SemiBold'`
- **Hỗ trợ tiếng Việt trọn vẹn**: Be Vietnam Pro là bộ font được tối ưu hóa đặc biệt cho bảng mã Unicode tiếng Việt, các dấu thanh (sắc, huyền, hỏi, ngã, nặng) và các nguyên âm kép (ă, â, đ, ê, ô, ơ, ư) đều có khoảng cách và dấu chuẩn, không bị lỗi gãy chữ hay đè dấu trên màn hình di động độ phân giải cao.

---

### B. Hệ thống Icon Vector SVG & Kỹ thuật Dynamic Theme Tinting
- **Cấu hình Metro**: 
  - Sử dụng `react-native-svg-transformer` trong `metro.config.js`. 
  - Metro Bundler biến đổi từng tệp `.svg` thành một React Component có kiểu `React.FC<SvgProps>`.
- **Bảo toàn phong cách Pastel & Chuyển đổi màu viền**:
  - Mỗi icon y tế trong `assets/icons/` được thiết kế với:
    - Các mảng màu nền pastel y tế đặc thù (xanh ngọc `#A9D5CD`, cam nhạt `#EFB47A`...).
    - Đường viền vẽ nét (`stroke`).
  - Trong quá trình tiền xử lý, toàn bộ nét viền cố định `stroke="#4D5048"` được đổi thành `stroke="currentColor"`.
  - Component `<Icon name size color? />`:
    ```typescript
    const strokeColor = color ?? colors.border.icon;
    return <SvgComponent width={size} height={size} stroke={strokeColor} color={strokeColor} />;
    ```
    - Khi ở chế độ Sáng: Nét viền tự động chuyển thành `#4D5048`.
    - Khi ở chế độ Tối: Nét viền tự động chuyển thành `#B3B6AA`.
    - Các mảng màu pastel bên trong icon giữ nguyên, tạo nên giao diện y tế đồng nhất và chuyên nghiệp.
- **Tính an toàn kiểu dữ liệu (Strict Typing)**:
  - Kiểu `IconName` là một TypeScript Union gồm chính xác 64 chuỗi định danh. Nếu lập trình viên gõ sai tên icon, TypeScript Compiler sẽ báo lỗi ngay khi gõ code.

---

### C. Đa ngôn ngữ i18n & An toàn Bệnh viện
- **Cấu trúc từ điển**:
  - `vi.json` và `en.json` chia nhóm theo ngữ cảnh: `common`, `auth`, `nav`, `role`, `status`, `cases`, `detail`, `settings`, `msg`, `err`.
  - Hai tệp được kiểm tra qua unit test tự động để đảm bảo đồng nhất 100% cấu trúc cây khóa (keys).
- **Quy tắc Thông điệp Pháp lý Y tế (Medical Disclaimers)**:
  - `msg.msg_01`: *“Kết quả AI chỉ hỗ trợ tham khảo, không thay thế kết luận của bác sĩ.”* (Bảo vệ pháp lý và tuân thủ quy chuẩn y tế).
  - `msg.msg_02`: *“Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh.”* (Nhấn mạnh tính chất kỹ thuật của mô hình học sâu).
- **Chuyển đổi thời gian thực**:
  - Hàm `i18n.changeLanguage(lang)` kết hợp cập nhật component cho phép đổi toàn bộ giao diện từ tiếng Việt sang tiếng Anh và ngược lại chỉ sau một chạm mà không phải tải lại ứng dụng.

---

## 3. Tổng kết Kiểm thử Chất lượng (Quality Gates)
Toàn bộ mã nguồn gói UI-02 đã vượt qua 4 chốt kiểm soát tự động:
1. **Kiểm tra định dạng (Prettier)**: Đạt 100% code style.
2. **Kiểm tra tĩnh (TypeScript `tsc --noEmit`)**: Không có lỗi type.
3. **Kiểm tra quy tắc (ESLint)**: Không có lỗi hay cảnh báo vi phạm.
4. **Kiểm thử đơn vị (Jest - 39 tests)**:
   - 32 test kiểm tra độ tương phản WCAG 48 token theme Sáng/Tối.
   - 3 test kiểm tra tính toàn vẹn và khả năng render của 64 SVG icons.
   - 4 test kiểm tra bộ khóa và thông điệp y tế của bộ từ điển i18n.
