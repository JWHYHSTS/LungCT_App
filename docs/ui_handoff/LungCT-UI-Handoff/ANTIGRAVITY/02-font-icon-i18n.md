# UI-02 — Font, icon và đa ngôn ngữ

**Đầu vào.** `docs/ui-handoff/assets/icons/` (64 SVG + manifest), `docs/ui-handoff/i18n/vi.json`, `en.json`, `src/ui/theme/typography.ts`.

**Yêu cầu.**
1. **Font**: tải Be Vietnam Pro (Regular, Medium, SemiBold) từ Google Fonts vào `assets/fonts/`, nạp bằng `expo-font` trước khi ẩn splash. Tên family phải khớp `FONT_FAMILY` trong `typography.ts`. Nếu không nạp được, dùng font hệ thống (ghi rõ trong báo cáo).
2. **Icon**: cài `react-native-svg` và `react-native-svg-transformer`, cấu hình `metro.config.js`. Chép 64 file SVG vào `assets/icons/`. Tạo `src/ui/icons/Icon.tsx`: `<Icon name size color? />`; `name` là kiểu union sinh từ `manifest.json` (64 tên). Màu nét mặc định `colors.border.icon` để tự đổi theo Sáng/Tối (thay `stroke="#4D5048"` bằng `currentColor` khi import, giữ màu tô pastel).
3. **i18n**: cài `i18next`, `react-i18next`, `expo-localization`. Chép 2 file JSON vào `src/i18n/`. Ngôn ngữ mặc định theo máy, đổi được trong Cài đặt (SET-01). Hàm `t('msg.msg_01')` phải ra đúng câu MSG-01.
4. Tạo màn dev `UIGalleryScreen` (thay ThemePreview): lưới 64 icon kèm tên, nút đổi VI/EN, nút đổi Sáng/Tối/Theo hệ thống.

**Kiểm thử.** Test: mọi tên trong manifest render được (`Icon` không throw); `vi.json` và `en.json` có cùng bộ khóa; `t('msg.msg_02')` tiếng Anh = “Scores are model outputs and are not calibrated disease probabilities.”

**Minh chứng.** `docs/evidence/ui/02/`: ảnh Gallery (Sáng/Tối, VI/EN) trên điện thoại.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
