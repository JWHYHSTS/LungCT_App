# UI-08 — Màn quản trị viên

**Đầu vào.** layout-json + PNG số 09 Quản lý tài khoản, 10 Thống kê tổng hợp, 11 Tôi (admin), 12 Chi tiết tài khoản; đặc tả SCR-M01, M02, M03, U01 biến thể admin.

**Yêu cầu.**
1. AdminTabs 3 tab: Tài khoản · Thống kê · Tôi.
2. M01: tìm kiếm, chip trạng thái (Chờ duyệt mặc định), danh sách có badge; trạng thái offline (dữ liệu cũ + giờ cập nhật, thao tác disabled — Q-22 đề xuất).
3. M02: thông tin nghề nghiệp, mốc thời gian, nhật ký thao tác, dòng “Không hiển thị dữ liệu bệnh nhân, ca hay ảnh CT” (BR-OWN-03); Duyệt / Khóa (Khóa mở hộp thoại bắt buộc nhập lý do). Không vẽ nút Từ chối (Q-11 chưa chốt).
4. M03: Segmented kỳ, StatCard, bảng/biểu đồ ảnh theo nhãn AI, ghi chú “chỉ dữ liệu đã đồng bộ, không gồm mock”.
5. Tôi (admin): như bác sĩ nhưng ẩn Thùng rác và Trung tâm đồng bộ.
6. Bảo đảm màn admin **không import** bất kỳ mock bệnh nhân/ca/ảnh nào (thêm test kiểm tra import).

**Kiểm thử.** Test render; test hộp thoại Khóa không cho xác nhận khi lý do trống; test không import dữ liệu bệnh nhân.

**Minh chứng.** Ảnh 4 màn cạnh PNG chuẩn.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
