# UI-09 — Chế độ Tối, tiếng Anh và kiểm tra cuối

**Đầu vào.** Toàn bộ màn đã làm; trang 03 của Figma v1 (bản Tối và bản EN của mọi khung) https://www.figma.com/design/A2e74JAAzntE0zUesryOlF ; `i18n/en.json`.

**Yêu cầu.**
1. Cài đặt (SET-01, SET-02): đổi ngôn ngữ VI/EN và giao diện Sáng/Tối/Theo hệ thống, lưu lựa chọn (tạm AsyncStorage, `TODO(SET-02)` chuyển sang kho dữ liệu chính).
2. Rà mọi màn: không còn chuỗi viết cứng (thêm test quét mã nguồn tìm chữ có dấu tiếng Việt nằm ngoài `src/i18n/` và `src/mocks/`).
3. Rà mọi màn: không còn mã hex ngoài `src/ui/theme/` (test quét `#[0-9A-Fa-f]{6}`).
4. Kiểm tra cỡ chữ hệ thống lớn (200%) không vỡ bố cục chính; vùng chạm ≥ 44; TalkBack/VoiceOver đọc được nhãn nút icon.
5. Lập bảng so khớp `docs/evidence/ui/09/so-khop.md`: 17 màn × (Sáng, Tối) × (VI, EN) — mỗi ô: ảnh app, ảnh chuẩn, “khớp / lệch: …”.

**Kiểm thử.** `npx tsc --noEmit`, `npx jest` toàn bộ; 2 test quét ở trên đạt.

**Minh chứng.** Bảng so khớp + ảnh; video ngắn chuyển Sáng↔Tối và VI↔EN trên điện thoại thật.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
