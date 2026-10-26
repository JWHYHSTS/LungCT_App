# Tài liệu kiến trúc và hướng dẫn học tập - Gói UI-06: 5 Tab chính của Bác sĩ

Tài liệu này cung cấp giải thích chi tiết về cấu trúc mã nguồn, giải pháp kiến trúc, cơ chế lọc dữ liệu hiển thị thực tế, xử lý điều hướng và tích hợp thành phần UI được xây dựng trong gói **UI-06** nhằm phục vụ học tập, nắm bắt và kế thừa cho các giai đoạn tiếp theo.

---

## 1. Tổng quan phạm vi triển khai UI-06

Trong hệ thống LungCT Mobile, vai trò Bác sĩ (`doctor`) là người dùng chuyên môn cốt lõi. Gói **UI-06** thay thế toàn bộ màn hình tạm (MockRoleScreen) của Bác sĩ bằng 5 màn hình tab chuyên dụng theo đúng đặc tả thiết kế (`06-tab-bac-si.md`):

1. **SCR-H01: Trang chủ (`DoctorHomeScreen.tsx`)**:
   - Thẻ trạng thái mô hình On-device với huy hiệu `Mô phỏng` (`StatusBadge tone="neutral"`).
   - Nút hành động chính "Tạo ca mới" mở `BottomSheet` chọn bệnh nhân hoặc thêm nhanh.
   - 2 thẻ thống kê nhanh (`StatCard`): Ca cần xem lại (`brand`), Ca hôm nay (`neutral`).
   - Danh sách ca gần đây (`ListRow` loại `case`).
   - Danh sách bệnh nhân gần đây (`ListRow` loại `patient`).
   - Hỗ trợ đầy đủ trạng thái: Skeleton loading, Empty state, Offline banner (`Banner type="offline"`), và Mô hình lỗi (`Banner type="error"`).

2. **SCR-P01: Bệnh nhân (`DoctorPatientsScreen.tsx`)**:
   - Ô tìm kiếm tức thời `SearchField` (tìm theo tên bệnh nhân hoặc mã định danh `BN-xxxxxx`).
   - Bộ lọc chip `FilterChip`: `Tất cả`, `Có ca nháp`, `Chưa đồng bộ` (định nghĩa theo `PATIENT_FILTER_DECISION` trong `ui-decisions.ts`).
   - Thay đổi tìm kiếm và lọc tác động **trực tiếp** vào danh sách hiển thị trên giao diện.
   - Mỗi dòng bệnh nhân hiển thị `ListRow`, kèm huy hiệu `Chờ gửi (Mô phỏng)` nếu bệnh nhân có dữ liệu offline chưa đồng bộ.
   - Nút hành động "+ Thêm bệnh nhân" kích hoạt thông báo hướng dẫn qua `Dialog`.
   - Trạng thái trống (`EmptyState`): Phân biệt rõ giữa "Không tìm thấy kết quả" (`noResult`) và "Chưa có bệnh nhân" (`noData`).

3. **SCR-C01: Ca bệnh (`DoctorCasesScreen.tsx`)**:
   - Ô tìm kiếm `SearchField` (tìm theo tên bệnh nhân hoặc mã ca `CA-YYYY-xxxxxx`).
   - Thanh lọc trạng thái 4 chip: `Tất cả`, `Nháp`, `Hoàn tất`, `Một phần` (theo `CASE_FILTER_DECISION`).
   - Tương tác tìm kiếm và chọn chip lọc thực sự làm thay đổi danh sách ca bệnh hiển thị.
   - Điểm đánh giá hiển thị định dạng chuẩn y khoa theo quy định Q-15 đủ 3 chữ số thập phân với dấu phẩy ngăn cách (ví dụ: `0,841 (Ác tính)` hoặc `0,712 (Lành tính)`).
   - Danh sách `ListRow` hỗ trợ tương tác chọn ca để xem chi tiết.

4. **SCR-S01: Thống kê (`DoctorStatsScreen.tsx`)**:
   - Banner thông báo minh bạch dữ liệu mô phỏng (`Banner type="info"`).
   - Bộ chọn kỳ thống kê `Segmented`: 3 kỳ `7 ngày`, `30 ngày`, `Tất cả`. Khi đổi kỳ, toàn bộ 4 thẻ số liệu và biểu đồ SVG lập tức cập nhật dữ liệu tương ứng.
   - 4 thẻ thống kê (`StatCard`): Tổng ca chẩn đoán, Ca hoàn tất, Ca nghi ngờ, Ca nháp.
   - Làm rõ đơn vị đếm theo handoff: Số ca tính bằng `"ca"`, số lát cắt/ảnh CT tính bằng `"ảnh"`.
   - Biểu đồ thanh ngang SVG phân bố nhãn AI (`Lành tính`, `Ác tính`, `Bình thường`) vẽ bằng `react-native-svg`.
   - Minh bạch tuyệt đối: **Không hiển thị độ chính xác mô hình** trong giai đoạn này để tránh ngộ nhận lâm sàng.

5. **SCR-U01: Tôi / Tài khoản (`DoctorProfileScreen.tsx`)**:
   - Thẻ hồ sơ bác sĩ: Avatar, họ tên, email, chuyên khoa, bệnh viện, huy hiệu vai trò `Bác sĩ`.
   - 4 mục tác vụ dạng `ListRow`: "Thông tin cá nhân & chuyên khoa", "Cài đặt ứng dụng & thông báo", "Mô hình On-device & Dữ liệu offline", "Trợ giúp & Liên hệ hỗ trợ".
   - Bấm vào các mục chưa triển khai hiển thị `Dialog` thông báo lộ trình rõ ràng, không bấm im lặng.
   - Nút Đăng xuất (`variant="danger"`) mở `Dialog` xác nhận (MSG-14) với focus ưu tiên vào nút "Ở lại".

---

## 2. Tổ chức Tầng Dữ liệu Giả lập (Mock Data Layer)

Dữ liệu mô phỏng được tách biệt hoàn toàn vào thư mục `src/mocks/`:
- `mobile/src/mocks/doctorMocks.ts`: Chứa danh sách mock bệnh nhân (`MOCK_PATIENTS`), ca bệnh (`MOCK_CASES`), dữ liệu thống kê theo 3 kỳ (`MOCK_STATS_DATA`), và thông tin hồ sơ bác sĩ (`MOCK_DOCTOR_PROFILE`).
- Mọi bản ghi đều gắn cờ `isMock: true` hoặc `mock: true`.
- Giao diện có các dấu hiệu trực quan (Badge "Mô phỏng", Banner thông báo) để người dùng và kiểm thử viên không ngộ nhận với dữ liệu hoặc mô hình AI thực tế.

---

## 3. Kiến trúc Điều hướng & Hành vi Phím Back Android

Trong `mobile/src/navigation/DoctorTabs.tsx`:
- Sử dụng `@react-navigation/bottom-tabs` v7 kết hợp component điều khiển dùng chung `TabBar`.
- Cấu hình:
  ```tsx
  <Tab.Navigator
    initialRouteName="Home"
    backBehavior="firstRoute"
    tabBar={(props) => <TabBar ... />}
  >
  ```
- **Hành vi phím Back**:
  - `backBehavior="firstRoute"`: Khi người dùng đang ở bất kỳ tab phụ nào (Bệnh nhân, Ca bệnh, Thống kê, Tôi) và bấm phím Back trên thiết bị Android, navigator sẽ tự động chuyển hướng về tab đầu tiên là **Trang chủ (`Home`)**.
  - Khi người dùng đang ở tab **Trang chủ (`Home`)** và bấm Back, ứng dụng sẽ thoát (exit) theo đúng chuẩn trải nghiệm gốc của Android.
  - Tuyệt đối không cấu hình cho mọi tab thoát ứng dụng ngay lập tức.

---

## 4. Tương tác Thật trên Giao diện (Search, Filter, Timeframe)

Khác với giao diện tĩnh thông thường, cả 3 tính năng tìm kiếm, bộ lọc và kỳ thống kê đều được xử lý với state React nội bộ:
1. **Tìm kiếm Bệnh nhân & Ca bệnh**:
   - Sử dụng `useMemo` tính toán danh sách lọc dựa trên `searchQuery.trim().toLowerCase()` so sánh với mã và tên bệnh nhân.
2. **Bộ lọc Chip (`FilterChip`)**:
   - Tương tác chọn chip cập nhật state `selectedFilter`.
   - Nếu `selectedFilter === 'all'`, hiển thị toàn bộ; nếu chọn `'draft'`, chỉ lọc các ca có `status === 'draft'`.
3. **Kỳ thống kê (`Segmented`)**:
   - Cập nhật state `timeframe` (`'7d' | '30d' | 'all'`).
   - Lập tức trích xuất bộ dữ liệu tương ứng từ `MOCK_STATS_DATA[timeframe]`, làm thay đổi trực tiếp 4 thẻ `StatCard` và tỷ lệ phần trăm thanh SVG.

---

## 5. Nâng cấp TabBar Custom Component

Component `mobile/src/ui/components/TabBar.tsx` được bổ sung:
- Nền highlight mềm mại `colors.bg.brandSubtle` cho tab đang hoạt động (`isActive`).
- Bo góc `borderRadius: 12` và padding vừa vặn tạo cảm giác nổi bật và sang trọng.
- Vẫn giữ nguyên 100% khả năng hỗ trợ Theme Sáng / Tối và khả năng tiếp cận (`accessibilityRole="tab"`).

---

## 6. Phân biệt Cấp độ Kiểm thử (Testing Levels)

1. **Unit Tests (Kiểm thử màn hình độc lập)**:
   - File `mobile/src/features/doctor/__tests__/doctorTabs.test.tsx` gồm 6 bài test:
     - Render thành công 5 màn hình tab với mock data.
     - Kiểm tra trạng thái Skeleton và Empty state của màn hình Home và Patients.
     - Kiểm tra hộp thoại xác nhận đăng xuất và gọi callback `logout()` khi nhấn "Đăng xuất".
   - *Lưu ý*: Đây là kiểm thử cấp độ Component / Screen độc lập, không phải kiểm thử luồng điều hướng tích hợp toàn cây.
2. **Ghi nhận về Kiểm thử Tích hợp RootNavigator**:
   - Trong môi trường kiểm thử tự động Jest, việc tích hợp toàn bộ `RootNavigator` kết hợp Native Stack, Bottom Tabs và Context Provider hiện chưa có suite test tự động riêng biệt (tiếp tục duy trì ghi nhận từ UI-05). Luồng điều hướng chuyển tab và phím Back đã được xác thực thực tế trên máy ảo Android.

---

## 7. Theo dõi Tồn đọng Kiểm thử Thiết bị Thật (Hardware Verification Backlog)

Duy trì ghi nhận từ **UI-04**:
> [!NOTE]
> - **Cử chỉ Pinch-zoom hai ngón & Pan trên ảnh CT**: Mới được kiểm chứng bằng logic unit test và cử chỉ chuột giả lập trên máy ảo Android; chưa thực hiện kiểm chứng trên màn hình cảm ứng điện dung đa điểm của thiết bị di động vật lý thật.
> - **Độ khớp quang học giữa ảnh CT gốc và bản đồ nhiệt Grad-CAM**: Cần công cụ đo đạc pixel-perfect trên màn hình thiết bị thật ở các tỷ lệ phóng to khác nhau trước khi đưa vào đánh giá lâm sàng.
