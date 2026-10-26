# Tài Liệu Giải Thích Code: Phân Hệ Quản Trị Viên (UI-08)

Tài liệu này giải thích chi tiết kiến trúc, các quyết định thiết kế và cách tổ chức mã nguồn của phân hệ Quản trị viên (Admin) được xây dựng trong giai đoạn UI-08 cho đồ án LungCT.

---

## 1. Tổng Quan Kiến Trúc Phân Hệ Admin

Phân hệ Admin phục vụ cho nhóm người dùng quản trị cơ sở y tế với hai nhiệm vụ cốt lõi:
1. **Quản lý danh tính và phê duyệt tài khoản bác sĩ**.
2. **Theo dõi các chỉ số vĩ mô của hệ thống (lượt phân tích, tỷ lệ chẩn đoán AI)**.

### Ranh Giới Bảo Mật Cốt Lõi: BR-OWN-03
Trong hệ thống y tế, nguyên tắc phân quyền tối thiểu và bảo vệ quyền riêng tư người bệnh quy định:
- Bác sĩ chỉ truy cập hồ sơ bệnh nhân do chính mình tạo ra hoặc được phân công.
- **Quản trị viên hệ thống (Admin) tuyệt đối KHÔNG có quyền truy cập hồ sơ bệnh nhân, ca bệnh hay ảnh chụp CT**.

Vì vậy, trong mã nguồn:
- `mobile/src/mocks/adminMocks.ts` được thiết kế **hoàn toàn độc lập** với `mobile/src/mocks/doctorMocks.ts`. Admin mock store không import hay tham chiếu bất kỳ cấu trúc `patient`, `case` hay `scan` cá nhân nào.
- Trên giao diện chi tiết tài khoản (`AdminAccountDetailScreen.tsx`), hiển thị rõ ràng thông điệp tuân thủ bảo mật y tế BR-OWN-03.
- Bài kiểm thử tự động `adminScreens.test.tsx` đã bao gồm một kiểm toán tĩnh để đảm bảo mock admin không rò rỉ dữ liệu bệnh nhân.

---

## 2. Cấu Trúc Các Màn Hình Mới

### 2.1. `AdminAccountsScreen.tsx` (Mã SCR-M01, Màn 09)
- **Mục đích**: Hiển thị danh sách bác sĩ đã đăng ký trong hệ thống để quản trị viên theo dõi và xét duyệt.
- **Tính năng chính**:
  - Ô tìm kiếm linh hoạt: Lọc tức thì theo tên bác sĩ hoặc email.
  - 4 thẻ lọc danh mục (`FilterChip`): *Chờ duyệt (Pending)*, *Hoạt động (Active)*, *Đã khóa (Locked)*, và *Tất cả (All)*. Mỗi thẻ hiển thị số lượng ca thực tế.
  - Xử lý trạng thái mạng theo quy định **Q-22**: Khi ứng dụng ngoại tuyến, hiển thị banner cảnh báo và khóa các thao tác ghi.
  - Phân trang / Refresh: Hỗ trợ kéo để làm mới (`RefreshControl`).

### 2.2. `AdminAccountDetailScreen.tsx` (Mã SCR-M02, Màn 12)
- **Mục đích**: Xem hồ sơ đăng ký chi tiết của một bác sĩ và thực hiện thao tác duyệt hoặc khóa tài khoản.
- **Tính năng chính**:
  - Hiển thị thẻ tóm tắt bác sĩ: Họ tên, email, điện thoại, bệnh viện, chuyên khoa và ngày đăng ký.
  - **Quy tắc Q-11**: Không vẽ nút "Từ chối" vì quy chuẩn y tế về việc xử lý từ chối chưa được thống nhất; chỉ hỗ trợ Duyệt (`approveDoctor`) hoặc Khóa (`lockDoctor`).
  - **Modal khóa tài khoản an toàn**: Bắt buộc người quản trị phải nhập lý do khóa. Chuỗi lý do chỉ chứa khoảng trắng sẽ bị từ chối; nút "Khóa tài khoản" bị vô hiệu hóa (`disabled`) khi chưa có lý do hợp lệ. Thao tác "Hủy" đóng modal và không thay đổi bất kỳ dữ liệu nào.
  - **Ngăn chặn thao tác lặp & Offline Guard**: Sử dụng cờ `isSubmitting` để ngăn ngừa double-click/tạo hành động lặp trong nhật ký. Cả nút Duyệt và Khóa đều bị chặn cả trên giao diện và tại hàm xử lý khi ứng dụng ở trạng thái ngoại tuyến (`!isOnline`).
  - **Phạm vi mô phỏng minh bạch**: Hiển thị dòng thông báo rõ ràng: thao tác duyệt/khóa tài khoản hiện chỉ tác động đến dữ liệu mô phỏng trong phiên làm việc cục bộ (`mock data`), chưa thực hiện khóa hoặc duyệt tài khoản thực tế qua Firebase hay Backend y tế.
  - **Nhật ký thao tác (Audit Log)**: Hiển thị lịch sử các lần đổi trạng thái tài khoản.

### 2.3. `AdminStatsScreen.tsx` (Mã SCR-M03, Màn 10)
- **Mục đích**: Báo cáo tổng hợp số liệu vận hành hệ thống.
- **Tính năng chính**:
  - Lựa chọn kỳ thống kê qua `SegmentedControl`: 7 ngày qua, 30 ngày qua, Toàn thời gian. Việc đổi kỳ thực sự cập nhật lại số liệu hiển thị trên giao diện từ mock store.
  - 4 Thẻ số liệu chính (`StatCard`): Bác sĩ hoạt động, Hồ sơ chờ duyệt, Tổng ca hoàn tất, Tổng ảnh CT đã quét.
  - Biểu đồ phân bố chẩn đoán AI: Biểu diễn trực quan tỷ lệ 3 nhãn chuẩn y tế (`Benign`, `Malignant`, `Normal`).
  - Ghi chú minh bạch: Nêu rõ dữ liệu được tạo ra trong phiên mô phỏng hiện tại.

### 2.4. `AdminProfileScreen.tsx` (Biến thể Admin của SCR-U01, Màn 11)
- **Mục đích**: Quản lý tài khoản cá nhân của Quản trị viên và cài đặt ứng dụng.
- **Tính năng chính**:
  - Thông tin quản trị viên: Vai trò Administrator, trạng thái Hoạt động.
  - **Ẩn hoàn toàn "Thùng rác" và "Trung tâm đồng bộ"**: Tuân thủ hướng dẫn handoff UI-08 cho vai trò Admin.
  - Hộp thoại Cài đặt (`SettingsModal`): Hỗ trợ chuyển đổi nhanh ngôn ngữ (Tiếng Việt <-> English) và giao diện màu (Sáng <-> Tối).
  - Đăng xuất an toàn: Đưa người dùng về màn hình đăng nhập.

---

## 3. Quản Lý Trạng Thái & Điều Hướng (Navigation)

### Cấu trúc Navigation Stack:
```
RootNavigator
 ├── AuthStack (khi chưa đăng nhập)
 ├── DoctorStack (khi user.role === 'doctor')
 └── AdminStack (khi user.role === 'admin')
      ├── AdminTabs
      │    ├── AccountsTab (SCR-M01)
      │    ├── StatsTab (SCR-M03)
      │    └── ProfileTab (SCR-U01)
      └── AccountDetail (SCR-M02)
```

- Khi đăng nhập bằng tài khoản admin (`admin@example.com`), `AuthContext` cấp phát `user.role = 'admin'`, kích hoạt `AdminStack`.
- Chuyển tiếp giữa danh sách tài khoản sang chi tiết: `navigation.navigate('AccountDetail', { doctorId: doctor.id })`.

---

## 4. Hỗ Trợ Đa Ngôn Ngữ & Giao Diện Sáng - Tối

- Tất cả chuỗi văn bản giao diện (tiêu đề màn hình, nhãn trường, placeholder, thông báo lỗi, nội dung modal, huy hiệu và nhãn trợ năng `accessibilityLabel`) đều được định nghĩa đối xứng trong `vi.json` và `en.json` dưới namespace `admin.*`.
- Sử dụng hook `useTranslation()` từ `react-i18next`.
- Sử dụng bảng màu semantic từ `useTheme()` (`colors.card`, `colors.text`, `colors.border`, v.v.), đảm bảo tương thích 100% khi chuyển đổi giữa Light Mode và Dark Mode.
