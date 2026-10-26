# Khảo sát thực nghiệm máy ảo Android - Gói UI-05 (Điều hướng & 3 màn hình xác thực)

- **Ngày thực hiện**: 26/10/2026
- **Thiết bị thử nghiệm**: Android Emulator `LumaCT_Phone` (Google Pixel 6 API 34 / Android 14)
- **Môi trường**: Expo Go (SDK 58), React Navigation v7, Hermes Engine, React 19

---

## 1. Mục tiêu kiểm thử thực nghiệm

1. Kiểm chứng giao diện và luồng hoạt động của 3 màn hình xác thực:
   - `01-login` (`LoginScreen` - SCR-A02): Bố cục, logo lung, chuyển ngữ VI/EN, badge kết nối Online/Offline, banner ngoại tuyến MSG-08, loading chống bấm lặp, liên kết Quên mật khẩu & Đăng ký.
   - `02-register` (`RegisterScreen` - SCR-A03): TopBar có nút Back, các trường thông tin bác sĩ, checkbox đồng thuận riêng tư, kiểm tra lỗi từng trường, xử lý phím Back Android / nút Back hiển thị modal xác nhận "Bỏ thông tin đã nhập?".
   - `03-pending-approval` (`AccountStatusScreen` - SCR-A04): Biểu tượng lớn trung tâm (96dp), hỗ trợ cả 2 trạng thái Chờ duyệt (`pending` - MSG-06) và Bị khóa (`locked` - MSG-07); nút "Kiểm tra lại trạng thái" disabled khi ngoại tuyến.
2. Kiểm chứng luồng điều hướng rẽ nhánh 2 vai trò:
   - Vai trò Bác sĩ (`doctor`): 5 tab chuẩn đáy (Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi) dùng `TabBar` chuẩn hóa UI-03.
   - Vai trò Quản trị viên (`admin`): 3 tab chuẩn đáy (Tài khoản, Thống kê, Tôi) dùng `TabBar` chuẩn hóa UI-03.
3. Kiểm chứng nút Đăng xuất tại tab Tôi: Đăng xuất an toàn và điều hướng quay lại `LoginScreen`.

---

## 2. Danh mục ảnh minh chứng thực tế

Toàn bộ ảnh chụp màn hình được lưu trữ tại thư mục `evidence/android/ui-05/`:

| Tên tệp | Nội dung màn hình | Trạng thái ghi nhận |
| :--- | :--- | :--- |
| `01_login_screen.png` | Màn hình Đăng nhập (tiếng Anh) | Hiển thị đầy đủ logo, các trường email/password, badge Online, nút bấm đạt chuẩn |
| `01_login_screen_vi.png` | Màn hình Đăng nhập (tiếng Việt) | Chuyển ngữ chuẩn xác, hiển thị đầy đủ dấu tiếng Việt, font Be Vietnam Pro sắc nét |
| `02_register_screen.png` | Màn hình Đăng ký tài khoản bác sĩ | 6 trường nhập liệu, checkbox riêng tư, nút đăng ký, TopBar có nút Back |
| `03_discard_dialog.png` | Hộp thoại "Bỏ thông tin đã nhập?" | Kích hoạt khi bấm nút Back hoặc phím Back cứng Android khi form có dữ liệu |
| `04_account_pending.png` | Màn hình Chờ duyệt tài khoản | Biểu tượng đồng hồ cát trung tâm 96dp, mã thông điệp MSG-06, nút kiểm tra lại |
| `05_doctor_tabs.png` | Giao diện Bác sĩ - Tab Trang chủ | Thanh điều hướng đáy 5 tab chuẩn bác sĩ, highlight tab Trang chủ |
| `06_doctor_cases_tab.png` | Giao diện Bác sĩ - Tab Ca bệnh | Chuyển tab mượt mà bằng thanh TabBar tùy biến, hiển thị đúng nội dung Ca bệnh |
| `07_admin_tabs.png` | Giao diện Quản trị viên - 3 Tab | Thanh điều hướng đáy đúng 3 tab (Tài khoản, Thống kê, Tôi), không có tab dư |

---

## 3. Kết quả đánh giá chi tiết

1. **Hiển thị giao diện & Chuyển ngữ**:
   - Font chữ Be Vietnam Pro hiển thị sắc nét trên cả chế độ tiếng Việt và tiếng Anh.
   - Không phát hiện hiện tượng tràn chữ (overflow) hay cắt cụt chữ (truncation).
2. **Xử lý phím Back Android (Hardware Back Button)**:
   - Khi ở `RegisterScreen`, bấm phím Back cứng của Android kích hoạt thành công hộp thoại xác nhận `Dialog` (destructive).
   - Chọn "Tiếp tục sửa" giữ nguyên dữ liệu trong form; chọn "Bỏ thông tin" quay lại màn hình Login an toàn.
3. **Phân quyền và Điều hướng**:
   - Tài khoản bác sĩ điều hướng vào `DoctorTabs` (5 tab).
   - Tài khoản quản trị viên (`admin@lungct.vn`) điều hướng vào `AdminTabs` (3 tab).
   - Không xuất hiện bất kỳ vai trò lạ nào ngoài đặc tả.
4. **Trạng thái kết nối**:
   - Mô phỏng offline: Badge chuyển sang "Ngoại tuyến" màu cảnh báo, banner MSG-08 hiển thị rõ ràng, các hành động yêu cầu kết nối mạng (Đăng ký, Quên mật khẩu, Kiểm tra trạng thái) được vô hiệu hóa đúng yêu cầu.
