# Khảo Sát Minh Chứng Android UI-08: Phân Hệ Quản Trị Viên (Admin)

**Thời gian khảo sát**: 26/10/2026 21:52 (UTC+7)  
**Thiết bị kiểm thử**: Android Emulator (`emulator-5554`), Nexus 5 API 34 (Android 14)  
**Tài khoản thực hiện**: `admin@example.com` (Vai trò: `admin`)  
**Mục tiêu**: Xác thực trực quan 4 màn hình phân hệ Quản trị viên theo handoff UI-08, kiểm tra đầy đủ chế độ song ngữ Việt – Anh (bao gồm cả thanh điều hướng đáy TabBar), phân định mock data minh bạch và tuân thủ ranh giới bảo mật BR-OWN-03.

---

## 1. Danh Mục Ảnh Minh Chứng & Bảng Mã Băm SHA256

Tất cả 8 tệp ảnh PNG đều được chụp trực tiếp qua giao diện nhị phân `adb exec-out screencap -p` và đã được mở xem trực tiếp để xác nhận đúng màn hình, đúng ngôn ngữ và đúng nội dung:

| Tên tệp minh chứng | Ngôn ngữ | Màn hình tương ứng | Mã SHA256 (64 ký tự) | Kích thước |
|---|---|---|---|---|
| `09_admin_accounts.png` | Tiếng Việt | SCR-M01: Quản lý tài khoản | `6fa8eeedee7fa7edeafcc63ada21007d604b3fd81e4b6102dafa0a3a27700fc5` | 204.4 KB |
| `10_admin_stats.png` | Tiếng Việt | SCR-M03: Thống kê hệ thống | `c11552bac51e4f55f74bac20a0cb73a5b259c3f12f8ff1cb0d816c7d377a5fbe` | 170.1 KB |
| `11_admin_profile.png` | Tiếng Việt | SCR-U01: Hồ sơ quản trị viên | `d7f68b4cba6a17bc870b9e73e39462ec87898549fefc6e43a1d4567803b85682` | 138.9 KB |
| `12_admin_account_detail.png` | Tiếng Việt | SCR-M02: Chi tiết tài khoản BS | `26c0f4086337a8e1a4af0469b0b4b9d37f267479449b6196b2576238c97ffb49` | 225.4 KB |
| `en_09_admin_accounts.png` | Tiếng Anh | SCR-M01: Account Management | `99ba635fc5f137d2517191fec077ae2982a0ab9a6667ce3e764adde33d4ae34d` | 204.3 KB |
| `en_10_admin_stats.png` | Tiếng Anh | SCR-M03: System Statistics | `2974af03a896ad54551ad02b700a3de64dddb9dd389c4b2670bda1aff05b820a` | 173.1 KB |
| `en_11_admin_profile.png` | Tiếng Anh | SCR-U01: Admin Profile | `39045aa4e30dacc75ce93952e78f2b8938d895cc8a18f06a88358f27bf4a3c04` | 136.0 KB |
| `en_12_admin_account_detail.png` | Tiếng Anh | SCR-M02: Account Details | `2d532236876f75e36ada59ef447e575e8e6435e929011150602daa9aac0c8946` | 220.8 KB |

---

## 2. Chi Tiết Khảo Sát & Xác Thực Trực Quan Từng Màn Hình

### 2.1. Màn hình SCR-M01: Quản lý tài khoản (`09_admin_accounts.png` / `en_09_admin_accounts.png`)
- **Ô tìm kiếm**: Hỗ trợ tìm kiếm theo họ tên bác sĩ hoặc email.
- **Bộ lọc FilterChips**: Có 4 trạng thái lọc kèm số lượng hiển thị thực tế:
  - *Chờ duyệt (Pending)*: 2 tài khoản (`BS. Phạm Thu Hà`, `BS. Lê Văn Nam`).
  - *Hoạt động (Active)*: 2 tài khoản (`BS. Trần Thị Mai`, `BS. Hoàng Đức Thịnh`).
  - *Đã khóa (Locked)*: 1 tài khoản (`BS. Nguyễn Văn An`).
  - *Tất cả (All)*: 5 tài khoản.
- **Thẻ bác sĩ**: Hiển thị ảnh đại diện/viết tắt, họ tên, email, khoa/bệnh viện, thời điểm đăng ký và huy hiệu trạng thái màu sắc chuẩn y tế.
- **Banner ngoại tuyến (Q-22)**: Khi ngắt kết nối mạng, hiển thị cảnh báo dữ liệu chỉ đọc; vô hiệu hóa thao tác.
- **Thanh điều hướng đáy (Bottom TabBar)**:
  - Bản Tiếng Việt: `Tài khoản`, `Thống kê`, `Tôi`.
  - Bản Tiếng Anh: `Accounts`, `Statistics`, `Profile`.

### 2.2. Màn hình SCR-M02: Chi tiết tài khoản bác sĩ (`12_admin_account_detail.png` / `en_12_admin_account_detail.png`)
- **Thông tin chi tiết**: Họ tên, email, số điện thoại, đơn vị công tác (bệnh viện), khoa phòng và ngày giờ tạo tài khoản.
- **Ranh giới bảo mật BR-OWN-03**: Có dòng thông báo bảo mật rõ ràng: *"Không hiển thị dữ liệu bệnh nhân, ca hay ảnh CT của tài khoản này (BR-OWN-03)."*
- **Phạm vi mô phỏng minh bạch**: Ghi rõ ngay bên dưới: *"Thao tác duyệt và khóa tài khoản hiện chỉ cập nhật trạng thái trong phiên mô phỏng (mock data), chưa áp dụng hoặc khóa tài khoản thực tế qua Firebase/Backend."*
- **Nhật ký kiểm toán (Audit Log)**: Ghi lại lịch sử các thao tác quản trị trên tài khoản (thời gian, người thực hiện, hành động, lý do).
- **Hành động Duyệt / Khóa**:
  - Nút "Duyệt tài khoản": Chỉ hiển thị khi tài khoản đang ở trạng thái `pending`.
  - Nút "Khóa tài khoản": Mở modal bắt buộc nhập lý do khóa. Nút xác nhận bị disable cho đến khi người dùng nhập ít nhất một ký tự không phải khoảng trắng.
  - Tuân thủ **Q-11**: Tuyệt đối không vẽ nút "Từ chối" vì quy định nghiệp vụ từ chối đăng ký chưa được thống nhất.
  - Chặn thao tác khi Offline: Nút bị disabled trên UI và các hàm xử lý xác nhận đều kiểm tra `!isOnline` để chặn dứt điểm; cờ `isSubmitting` chống bấm lặp tạo thao tác trùng thừa.

### 2.3. Màn hình SCR-M03: Thống kê hệ thống (`10_admin_stats.png` / `en_10_admin_stats.png`)
- **Bộ lọc thời gian**: Segmented control 3 mốc (7 ngày qua, 30 ngày qua, Toàn thời gian). Việc đổi kỳ thực sự cập nhật lại các chỉ số trong mock store.
- **4 Thẻ số liệu chính (StatCard)**:
  - Bác sĩ hoạt động (`activeDoctorsCount`)
  - Chờ duyệt (`pendingApprovalCount`)
  - Ca bệnh hoàn tất (`totalCasesCompleted`)
  - Ảnh CT đã phân tích (`totalScansAnalyzed`)
- **Biểu đồ phân bố chẩn đoán AI**: Phân bổ theo 3 nhãn chuẩn y tế:
  - Benign (Lành tính)
  - Malignant (Ác tính)
  - Normal (Bình thường)
- **Ghi chú mô phỏng**: Thông báo rõ ràng: *"Chỉ dữ liệu đã đồng bộ, không gồm kết quả giả lập; không có dữ liệu định danh bệnh nhân."*

### 2.4. Màn hình SCR-U01: Hồ sơ quản trị viên (`11_admin_profile.png` / `en_11_admin_profile.png`)
- **Hồ sơ**: Hiển thị vai trò Quản trị viên (`Administrator`), email `admin@example.com`, trạng thái Hoạt động.
- **Tính năng tài khoản**:
  - Đổi mật khẩu: Thông báo minh bạch tính năng đang được phát triển.
  - Cài đặt hệ thống: Cho phép chuyển đổi tức thì giữa Tiếng Việt và English, cũng như chế độ Sáng / Tối.
  - Đăng xuất: Đưa về màn hình Đăng nhập và làm sạch phiên làm việc.
- **Tuân thủ biến thể SCR-U01**: Đã ẩn hoàn toàn 2 mục "Thùng rác" và "Trung tâm đồng bộ" vì Admin không trực tiếp quản lý ca bệnh offline.

---

## 3. Tồn Đọng Kiểm Thử Kế Thừa (Cập Nhật Chính Xác)

1. **Tồn đọng từ UI-04**:
   - Thao tác phóng to / thu nhỏ hai ngón tay (pinch-to-zoom) trên ảnh CT phân giải cao và căn chỉnh trực quan bản đồ nhiệt Grad-CAM yêu cầu kiểm thử tương tác vật lý trên thiết bị di động thật (chưa thể thay thế trọn vẹn bằng click chuột trên emulator).
2. **Tồn đọng từ UI-05**:
   - **Chưa có test tích hợp RootNavigator**: Bộ test hiện tại mới chỉ kiểm thử đơn vị render độc lập các màn hình stack và tabs; chưa có kịch bản test tự động bao quát toàn bộ luồng điều hướng tích hợp cấp RootNavigator.
