# UI-01 — Khởi tạo dự án và đưa theme màu vào code

**Bối cảnh.** LungCT là app React Native + TypeScript + Expo hỗ trợ bác sĩ phân loại ảnh CT phổi. Bộ thiết kế nằm ở `docs/ui-handoff/`. Bước này chỉ làm nền giao diện: theme màu, chữ, khoảng cách.

**Đầu vào.**
- `docs/ui-handoff/code/src/ui/theme/` (code đã viết và đã kiểm thử ngoài repo)
- `docs/ui-handoff/design/01-design-tokens.md`

**Yêu cầu.**
1. Nếu repo chưa có app: tạo app Expo TypeScript (`npx create-expo-app@latest` mẫu TypeScript). Nếu đã có: giữ nguyên, không xóa code đang có.
2. Cài và cấu hình Jest cho Expo (`jest-expo`, `@types/jest`) nếu chưa có.
3. Chép nguyên thư mục `docs/ui-handoff/code/src/ui/theme/` vào `src/ui/theme/`. **Không sửa mã màu.**
4. Bọc app bằng `<ThemeProvider>` trong `App.tsx` (hoặc layout gốc của expo-router).
5. Tạo `src/config/ui-decisions.ts` chứa các lựa chọn CHƯA CHỐT dùng ở UI, mỗi mục có TSDoc ghi mã Q-xx: định dạng điểm Q-15 = 3 chữ số thập phân dấu phẩy; mốc thống kê = `['7d','30d','all']` (ĐỀ XUẤT); số lần sai mật khẩu ngoại tuyến Q-09 = `null` (chưa giới hạn).
6. Tạo màn tạm `src/features/dev/screens/ThemePreviewScreen.tsx` hiển thị các ô màu của `colors` (tên token + mã) ở chế độ hiện tại — chỉ dùng cho dev.

**Kiểm thử.** `npx tsc --noEmit` không lỗi; `npx jest src/ui/theme` → **32 test đạt** (khớp khóa Sáng/Tối 48 token, mã hex hợp lệ, tương phản WCAG). Đổi máy sang chế độ tối → màn ThemePreview đổi màu.

**Minh chứng.** `docs/evidence/ui/01/`: log jest, ảnh ThemePreview Sáng và Tối trên điện thoại.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md` (thực hiện → kiểm thử → minh chứng → cập nhật CẢ HAI báo cáo → commit → báo cáo trên chat).
