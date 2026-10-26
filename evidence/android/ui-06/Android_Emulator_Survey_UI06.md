# Khảo sát thực nghiệm máy ảo Android - Gói UI-06 (5 tab chính của Bác sĩ)

- **Ngày thực hiện**: 26/10/2026
- **Thiết bị thử nghiệm**: Android Emulator `LumaCT_Phone` (Google Pixel 6 API 34 / Android 14)
- **Môi trường**: Expo Go (SDK 58), React Navigation v7, Hermes Engine, React 19

---

## 1. Mục tiêu kiểm thử thực nghiệm

Kiểm chứng giao diện, tương tác và các luồng chức năng của 5 tab chính của vai trò Bác sĩ (`doctor`):
1. **04 - Trang chủ (`DoctorHomeScreen` - SCR-H01)**:
   - Thẻ trạng thái mô hình On-device kèm huy hiệu `Mô phỏng` minh bạch.
   - Nút hành động chính "Tạo ca mới" mở `BottomSheet` chọn bệnh nhân (BN-000123... hoặc thêm mới).
   - 2 `StatCard` số liệu (Ca nháp, Hoàn tất tháng này).
   - Danh sách "Ca cần xử lý" và "Bệnh nhân gần đây" dạng `ListRow`.
   - Hỗ trợ các trạng thái Skeleton, Empty, Offline banner (MSG-08) và Model error (MSG-09).
2. **05 - Bệnh nhân (`DoctorPatientsScreen` - SCR-P01)**:
   - Ô tìm kiếm `SearchField` và 3 chip lọc đề xuất (Tất cả, Có ca nháp, Chưa đồng bộ - `ui-decisions.ts`) thay đổi trực tiếp danh sách bệnh nhân hiển thị.
   - Hiển thị đầy đủ thông tin: Mã BN, họ tên, tuổi/giới tính, số ca, ngày ca gần nhất, badge đồng bộ `Chờ gửi (Mô phỏng)`.
   - Nút hành động chính "+ Thêm bệnh nhân".
3. **06 - Ca bệnh (`DoctorCasesScreen` - SCR-C01)**:
   - Ô tìm kiếm và 4 chip lọc trạng thái (Tất cả, Nháp, Hoàn tất, Một phần).
   - Dòng ca bệnh hiển thị mã ca, họ tên BN, ngày chụp, số ảnh, nhãn AI và điểm số chuẩn hóa theo đề xuất Q-15.
4. **07 - Thống kê cá nhân (`DoctorStatsScreen` - SCR-S01)**:
   - Bộ chọn kỳ `Segmented` (7 ngày, 30 ngày, Tất cả - `ui-decisions.ts`) thay đổi số liệu thực tế.
   - 4 `StatCard` chỉ số: Bệnh nhân, Ca hoàn tất, Ca nháp, Ảnh đã phân tích.
   - Biểu đồ thanh ngang SVG phân bố số ảnh theo 3 nhãn AI (Lành tính, Ác tính, Bình thường) vẽ bằng `react-native-svg`.
   - Ghi chú định nghĩa đơn vị đếm rõ ràng (theo "ca" và "ảnh", không hiển thị độ chính xác mô hình).
5. **08 - Hồ sơ cá nhân (`DoctorProfileScreen` - SCR-U01)**:
   - Thẻ hồ sơ thông tin bác sĩ (Họ tên, email, nơi công tác, chuyên khoa, vai trò, badge Hoạt động).
   - Các dòng tác vụ: Đổi mật khẩu, Cài đặt, Thùng rác, Trung tâm đồng bộ (kèm badge số thay đổi chờ gửi).
   - Nút Đăng xuất (`danger`) mở hộp thoại xác nhận `Dialog` (MSG-14).
6. **Hành vi phím Back Android**:
   - Ở các tab con, phím Back đưa về tab đầu tiên (Trang chủ) theo cơ chế `backBehavior="firstRoute"`.
   - Ở tab gốc (Trang chủ), phím Back thoát app an toàn theo đặc tả Android SCR-H01.

---

## 2. Danh mục ảnh minh chứng thực tế trên máy ảo

Toàn bộ ảnh chụp màn hình được lưu trữ tại thư mục `evidence/android/ui-06/`:

| Tên tệp | Nội dung màn hình | Trạng thái ghi nhận |
| :--- | :--- | :--- |
| `04_doctor_home.png` | Bác sĩ · Trang chủ (SCR-H01) | Thẻ mô hình có nhãn "Mô phỏng", nút Tạo ca mới, 2 StatCard, danh sách ca và bệnh nhân |
| `04_bottom_sheet_select_patient.png` | BottomSheet chọn bệnh nhân (CASE-01) | Mở bảng trượt từ dưới lên, liệt kê bệnh nhân mẫu và nút thêm bệnh nhân mới |
| `05_doctor_patients.png` | Bác sĩ · Danh sách bệnh nhân (SCR-P01) | Ô tìm kiếm, chip lọc, danh sách 4 bệnh nhân mẫu kèm badge đồng bộ, nút Thêm BN |
| `05_patients_filtered.png` | Bác sĩ · Lọc bệnh nhân "Có ca nháp" | Lọc dữ liệu tức thì, chỉ hiển thị đúng các bệnh nhân có ca nháp |
| `06_doctor_cases.png` | Bác sĩ · Danh sách ca bệnh (SCR-C01) | 4 chip trạng thái, danh sách 4 ca bệnh mẫu hiển thị nhãn AI và format điểm Q-15 |
| `07_doctor_stats.png` | Bác sĩ · Thống kê cá nhân (30 ngày) | Segmented 30 ngày, 4 StatCard, biểu đồ thanh ngang SVG phân bố nhãn AI, ghi chú đếm |
| `07_doctor_stats_7d.png` | Bác sĩ · Thống kê cá nhân (7 ngày) | Chuyển kỳ 7 ngày, các con số StatCard và thanh biểu đồ SVG cập nhật dữ liệu tương ứng |
| `08_doctor_profile.png` | Bác sĩ · Tôi / Hồ sơ cá nhân (SCR-U01) | Thẻ thông tin bác sĩ, 4 dòng tác vụ cá nhân, nút Đăng xuất màu đỏ cảnh báo |
| `08_logout_dialog.png` | Hộp thoại xác nhận đăng xuất (MSG-14) | Hiển thị Dialog cảnh báo còn 3 thay đổi chưa đồng bộ, focus nút "Ở lại" phòng ngừa bấm nhầm |

---

## 3. Kết quả đánh giá chi tiết

1. **Hiển thị & Chuyển ngữ**:
   - Giao diện Dark mode hiển thị sắc nét, các màu sắc thương hiệu `brand.primary`, `bg.brandSubtle`, `status.warning`, `status.danger` đạt độ tương phản chuẩn.
   - Font chữ tiếng Việt Be Vietnam Pro hiển thị đầy đủ dấu, không bị cắt cụt.
2. **Tính chân thực của mô phỏng (Mock simulation)**:
   - Huy hiệu `Mô phỏng` màu vàng cảnh báo xuất hiện rõ ràng tại thẻ trạng thái mô hình và banner thống kê, ngăn chặn việc người dùng hiểu nhầm mô hình AI thực tế đã chạy trên máy.
3. **Phản hồi tương tác (No silent click)**:
   - Các nút dẫn tới chức năng chưa hoàn thiện (Đồng bộ, Thông báo, Chi tiết ca, Chi tiết bệnh nhân, Đổi mật khẩu, Cài đặt, Thùng rác) đều kích hoạt hộp thoại `Dialog` thông báo minh bạch mã màn hình và giai đoạn triển khai (UI-07, UI-08, UI-09, SYNC-01). Tuyệt đối không bấm im lặng hoặc báo thành công giả.
