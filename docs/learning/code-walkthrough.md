# Giải thích Luồng Hoạt động Mã nguồn: App → ThemeProvider → ThemePreviewScreen

Tài liệu này được biên soạn dành cho các bạn sinh viên hoặc lập trình viên đã có kiến thức nền tảng về C/C++ (con trỏ, struct, class, tham chiếu) làm quen với cơ chế quản lý giao diện trong React Native + TypeScript.

---

## 1. So sánh tư duy: C++ vs React Native / TypeScript

Trong lập trình C++ truyền thống, bạn quản lý trạng thái bằng biến toàn cục, con trỏ truyền qua hàm hoặc struct cấu hình:
```cpp
// Tư duy C++:
struct Theme {
    std::string bg_color;
    std::string text_color;
};

void renderButton(const Theme& theme) {
    // Phải truyền biến theme vào từng hàm con thủ công
}
```

Trong React, **Context API** (thể hiện qua `ThemeProvider`) hoạt động giống như một **"vùng nhớ cấu hình toàn cục có kiểm soát"** (Scoped Singleton). Thay vì phải truyền `theme` qua từng hàm một cách thủ công (gọi là *prop drilling*), React cho phép bất kỳ component con nào ở bên trong chỉ cần gọi `useTheme()` là nhận được giá trị cấu hình mới nhất.

---

## 2. Luồng thực thi chi tiết (Execution Flow)

Sơ đồ luồng dữ liệu:
```text
App.tsx (Khởi tạo gốc)
  │
  ▼
ThemeProvider (mobile/src/ui/theme/ThemeProvider.tsx)
  │  1. Đọc chế độ của hệ điều hành điện thoại: useColorScheme()
  │  2. Quản lý trạng thái người dùng chọn: [preference, setPreference]
  │  3. Tính toán Scheme áp dụng ('light' hoặc 'dark')
  │  4. Tạo struct Theme hoàn chỉnh: buildTheme(scheme)
  │  5. Phát giá trị xuống cây con: <ThemeContext.Provider value={value}>
  │
  ▼
MainAppContent
  │  6. Gọi useTheme() để lấy theme.scheme
  │  7. Đồng bộ thanh trạng thái: <StatusBar style={...} />
  │
  ▼
ThemePreviewScreen (mobile/src/features/dev/screens/ThemePreviewScreen.tsx)
     8. Gọi useTheme() lấy bảng 48 mã màu colors và hàm setPreference
     9. Render các thẻ ColorCard
    10. Bấm nút đổi theme ('light' / 'dark' / 'system') → Gọi setPreference()
        → Kích hoạt render lại (Re-render) toàn bộ màn hình với màu mới
```

---

## 3. Phân tích chi tiết từng tầng

### Tầng 1: `App.tsx` (Entry Point - Điểm xuất phát)
- `App()` là hàm đầu tiên được React Native gọi khi ứng dụng bật lên (tương tự như hàm `main()` trong C++).
- Thay vì chứa logic hiển thị phức tạp, `App()` chỉ làm một nhiệm vụ: **bọc toàn bộ ứng dụng trong `<ThemeProvider>`**.
- Nhờ tách `MainAppContent()` thành một hàm con riêng biệt bên trong `ThemeProvider`, component này mới có quyền gọi `useTheme()` mà không bị báo lỗi ngữ cảnh.

### Tầng 2: `ThemeProvider.tsx` (Bộ điều phối Theme)
- **`buildTheme(scheme)`**: Hàm thuần túy (pure function). Nhận vào `'light'` hoặc `'dark'` và trả về một struct chứa 48 token màu sắc, thang typography, bán kính radius và spacing.
- **`useColorScheme()`**: Lắng nghe trực tiếp từ hệ điều hành iOS / Android (điện thoại đang ở Dark Mode hay Light Mode).
- **`useMemo()`**: Tối ưu hóa hiệu năng. Bộ theme chỉ được tính toán lại khi người dùng thực sự bấm đổi chế độ hoặc hệ điều hành đổi màu, tránh tính toán dư thừa mỗi khung hình (frame).
- **Cơ chế bảo vệ của `useTheme()`**:
  ```typescript
  if (!ctx) throw new Error('useTheme() phải được gọi bên trong <ThemeProvider>.');
  ```
  Nếu một lập trình viên gọi `useTheme()` ngoài cây `ThemeProvider`, chương trình sẽ ném ngoại lệ rõ ràng ngay lập tức thay vì âm thầm trả về giá trị rác hoặc màu trắng/đen mặc định gây lỗi hiển thị khó tìm.

### Tầng 3: `ThemePreviewScreen.tsx` (Màn hình hiển thị thực nghiệm)
- Đóng vai trò là khách hàng (consumer) của hệ thống Theme.
- Component gọi:
  ```typescript
  const { theme, preference, setPreference } = useTheme();
  ```
  Nhận trực tiếp đối tượng `colors` và hiển thị ra 6 nhóm token màu sắc.
- Khi người dùng chạm vào một nút bấm (ví dụ nút "Tối"):
  1. Sự kiện `onPress` kích hoạt hàm `setPreference('dark')`.
  2. Biến trạng thái bên trong `ThemeProvider` thay đổi.
  3. React tự động kích hoạt quá trình cập nhật lại giao diện (Re-render).
  4. Toàn bộ `ColorCard` và nền ứng dụng đổi sang màu của chế độ Tối ngay lập tức mà không cần khởi động lại app.

---

## 4. Tóm tắt các khái niệm then chốt

1. **Token ngữ nghĩa (Semantic Tokens)**: Lập trình viên không bao giờ viết cứng mã hex như `#0066CC` vào component. Thay vào đó, luôn viết `colors.brand.primary`. Khi đổi chế độ Tối, hệ thống tự động đổi mã hex ngầm định phía dưới.
2. **Kiểm tra kiểu dữ liệu (Strict Typing)**: TypeScript đóng vai trò như trình biên dịch C++, đảm bảo bạn không thể gõ nhầm tên token màu (ví dụ gõ nhầm `colors.brand.primari` sẽ bị báo lỗi ngay khi code).
3. **Tuân thủ chuẩn y tế**: Mọi cặp màu chữ/nền trong theme đều đã được kiểm tra bằng thuật toán WCAG để bác sĩ không bị mỏi mắt khi đọc kết quả trong phòng tối lâm sàng.
