# Cách dùng bộ câu lệnh với Antigravity

## Chuẩn bị (làm 1 lần)

1. Giải nén ZIP vào repo ứng dụng tại `docs/ui-handoff/` (giữ nguyên cấu trúc thư mục).
2. Mở repo trong Antigravity. Nếu repo chưa có app Expo, bước 01 sẽ tạo.
3. Giao **lần lượt** các file `01` → `09`. Mỗi lần: mở file, chép toàn bộ nội dung vào ô chat của Antigravity (hoặc bảo nó “Đọc và thực hiện docs/ui-handoff/ANTIGRAVITY/0X-….md”).
4. Chỉ giao file tiếp theo khi bước trước đã có: test đạt, ảnh minh chứng, báo cáo cập nhật, mã commit.

## Khung bắt buộc cho MỌI bước (theo quy định dự án LungCT)

Mỗi file câu lệnh đều kết thúc bằng khung này; Antigravity phải làm đủ và theo đúng thứ tự:

1. **Thực hiện** đúng phạm vi bước, không làm lấn sang bước khác.
2. **Kiểm thử**: chạy `npx tsc --noEmit`, `npx jest` (và test riêng của bước); không được bỏ qua test đỏ.
3. **Lưu minh chứng** vào `docs/evidence/ui/<số-bước>/`: ảnh chụp app trên điện thoại thật (Android) và/hoặc iOS Simulator đặt cạnh ảnh chuẩn trong `docs/ui-handoff/reference/screens-v2/png/`, log test.
4. **Cập nhật tài liệu** liên quan và **viết/chỉnh trực tiếp CẢ HAI báo cáo khóa luận** (Android – Dương Hải Đăng; iOS – Dương Hải Đăng), mỗi báo cáo chỉ ghi phần đúng nền tảng của mình. Không thay bằng nhật ký/checklist.
5. **Git commit** với thông điệp rõ ràng, ví dụ `feat(ui): theme Sáng/Tối từ design tokens (UI-01)`.
6. **Báo trên chat**: danh sách file đã sửa, mục báo cáo đã cập nhật, kết quả kiểm tra, đường dẫn minh chứng, mã commit, phần còn thiếu.

## Quy tắc chung gửi kèm mọi bước

- Nguồn sự thật: `docs/ui-handoff/reference/screens-v2/layout-json/*.json` (kích thước, gap, padding, màu, chữ) + ảnh PNG cùng tên. Khi JSON và ảnh khác nhau, theo JSON và báo lại.
- Màu chỉ lấy qua `useTheme()`; cấm mã hex trong component/màn hình (trừ `heatmap.ts`).
- Chữ hiển thị lấy qua i18n (`docs/ui-handoff/i18n/*.json`), không viết cứng.
- Tổ chức thư mục: `src/ui/theme`, `src/ui/components`, `src/ui/icons`, `src/features/<khu-vực>/screens`, `src/navigation`, `src/i18n`, `src/mocks`; phần riêng nền tảng đặt trong file `*.android.tsx` / `*.ios.tsx`.
- Có TSDoc cho component/hàm xuất ra; chú thích giải thích lý do và ràng buộc; TODO/FIXME phải cụ thể, kèm mã công việc (ví dụ `TODO(UI-07): …`).
- Dữ liệu chỉ là giả lập trong `src/mocks/`, gắn rõ “giả lập”; không dùng ảnh CT thật của bệnh nhân.
- Không tự quyết mục “CHƯA CHỐT Q-xx”: làm theo phương án đã vẽ và đặt trong `src/config/ui-decisions.ts` để đổi được.
- Không gọi backend, không thêm thư viện ngoài danh sách của bước khi chưa hỏi.

## Thứ tự các bước

| File | Mã | Nội dung | Kết quả kiểm tra được |
| --- | --- | --- | --- |
| 01 | UI-01 | Khởi tạo/kiểm tra app Expo + TypeScript + Jest, chép theme | 32 test theme đạt |
| 02 | UI-02 | Font, icon, i18n | Màn “UI Gallery” hiện đủ 64 icon, đổi VI/EN |
| 03 | UI-03 | Component lõi (đợt 1) | Gallery hiện đủ biến thể, test render đạt |
| 04 | UI-04 | Component đợt 2 (ảnh CT, Grad-CAM, điểm, hộp thoại, sheet…) | Gallery + test |
| 05 | UI-05 | Điều hướng + 3 màn xác thực | 01–03 khớp ảnh chuẩn |
| 06 | UI-06 | 5 tab bác sĩ | 04–08 khớp ảnh chuẩn |
| 07 | UI-07 | Màn chi tiết bác sĩ | 13–17 khớp ảnh chuẩn |
| 08 | UI-08 | Màn quản trị viên | 09–12 khớp ảnh chuẩn |
| 09 | UI-09 | Chế độ Tối, tiếng Anh, kiểm tra cuối | Bảng so khớp 17 màn × 2 chế độ × 2 ngôn ngữ |
