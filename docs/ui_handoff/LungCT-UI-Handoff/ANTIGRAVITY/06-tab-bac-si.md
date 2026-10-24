# UI-06 — 5 tab chính của bác sĩ

**Đầu vào.** layout-json + PNG số 04 Trang chủ, 05 Bệnh nhân, 06 Ca bệnh, 07 Thống kê, 08 Tôi; đặc tả SCR-H01, P01, C01, S01, U01; `src/mocks/`.

**Yêu cầu.**
1. Tạo dữ liệu giả lập trong `src/mocks/` khớp ảnh chuẩn (BN-000123 Nguyễn Văn An…, CA-2026-000045…), có cờ `isMock: true`.
2. Code 5 màn giống ảnh chuẩn. Tab: Trang chủ · Bệnh nhân · Ca bệnh · Thống kê · Tôi (nhãn luôn hiện, tab đang chọn có nền `bg.brandSubtle`).
3. Trang chủ: thẻ trạng thái mô hình, “Tạo ca mới” mở bottom sheet chọn bệnh nhân, 2 StatCard, Ca cần xử lý, Bệnh nhân gần đây. Trạng thái: skeleton, empty, offline + mô hình chưa sẵn sàng (MSG-08, MSG-09, MSG-14).
4. Bệnh nhân / Ca bệnh: tìm kiếm, chip lọc (tiêu chí là ĐỀ XUẤT → đặt trong `ui-decisions.ts`), danh sách có badge chữ + icon; nút nổi “Thêm bệnh nhân”; trạng thái empty / no-result.
5. Thống kê: Segmented kỳ, 4 StatCard, biểu đồ thanh theo nhãn AI (vẽ bằng `react-native-svg`), ghi chú cách đếm. Không hiển thị độ chính xác mô hình.
6. Tôi: thẻ hồ sơ, các dòng Đổi mật khẩu / Cài đặt / Thùng rác / Trung tâm đồng bộ, nút Đăng xuất (Danger) → hộp thoại MSG-14.
7. Android: Back ở tab gốc → thoát app.

**Kiểm thử.** Test render mỗi màn với mock; test chuyển tab; test Đăng xuất mở hộp thoại.

**Minh chứng.** Ảnh 5 màn đặt cạnh PNG chuẩn.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
