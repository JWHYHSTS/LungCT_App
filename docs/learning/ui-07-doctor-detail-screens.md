# Tài liệu học tập & Phân tích Kiến trúc: Gói UI-07 (Chi tiết Bác sĩ)

Tài liệu này giải thích cấu trúc mã nguồn, luồng xử lý và các quyết định thiết kế kỹ thuật được triển khai trong gói **UI-07** thuộc ứng dụng di động **LungCT**.

---

## 1. Tổng quan phạm vi và 5 màn hình chi tiết

Trong gói UI-07, ứng dụng hoàn thiện 5 màn hình chi tiết chuyên môn dành riêng cho vai trò **Bác sĩ** (`doctor`), kết nối thông suốt từ 5 màn hình cấp tab của UI-06:

1. **`PatientFormModal` (`SCR-P02` / 13)**: Modal thêm bệnh nhân mới, kiểm tra 4 trường bắt buộc theo quyết định `Q-20`, xử lý kiểm tra ngày lịch (ngày sinh không nằm trong tương lai, đúng ngày thực tế) và cảnh báo "Bỏ thông tin chưa lưu?".
2. **`PatientDetailScreen` (`SCR-P03` / 14)**: Xem hồ sơ bệnh nhân, lịch sử các ca chụp CT, tạo ca mới gắn đúng mã bệnh nhân đang xem, menu xóa mềm (`trashPatient`).
3. **`CaseDetailScreen` (`SCR-C02` / 15)**: Xem thông tin ca chụp, lưới ảnh lát cắt (`ImageTile`), nhận xét chẩn đoán của bác sĩ tự lưu tạm và nút "Hoàn tất ca" áp dụng quy tắc nghiệp vụ `BR-CASE-01`.
4. **`AIImageResultScreen` (`SCR-R01` / 16)**: Khảo sát kết quả AI của từng lát cắt, điều hướng lát cắt trước/sau, hiển thị `CTImageView` tích hợp Grad-CAM, thanh trượt `Slider` chỉnh độ phủ nhiệt, `HeatmapLegend`, `ScoreCard` (theo chuẩn `Q-15`), xử lý trạng thái lỗi `FAIL` (`MSG-10`) và thiếu CAM (`MSG-11`).
5. **`ExportPdfScreen` (`SCR-D01` / 17)**: Thiết lập cấu hình báo cáo chẩn đoán (ngôn ngữ `vi`/`en`, kèm Grad-CAM), kiểm tra danh sách tài liệu trong phiên và hộp thoại xác nhận bảo mật dữ liệu nhạy cảm trước khi chia sẻ.

---

## 2. Kiến trúc In-Memory Store & Tính nhất quán dữ liệu

### Vấn đề:
Ứng dụng hiện tại chưa tích hợp cơ sở dữ liệu bền vững (SQLite offline hoặc Cloud Firestore). Nếu chỉ dùng `useState` cục bộ trong từng màn hình, khi bác sĩ thêm bệnh nhân mới ở modal `PatientFormModal` hoặc hoàn tất ca bệnh trong `CaseDetailScreen`, danh sách ở `DoctorPatientsScreen` và `DoctorCasesScreen` sẽ không phản ánh thay đổi, gây sai lệch luồng trải nghiệm.

### Giải pháp kỹ thuật:
Xây dựng một **In-Memory Store** với mô hình **Pub/Sub** gọn nhẹ ngay trong [`mobile/src/mocks/doctorMocks.ts`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/mocks/doctorMocks.ts):
- **Trạng thái lưu trữ**: `let currentPatients` và `let currentCases` đóng vai trò là bộ đệm phiên làm việc.
- **Cơ chế thông báo**: Mảng `listeners: (() => void)[]` cùng hàm `subscribeDoctorStore(listener)`. Bất kỳ thao tác đột biến dữ liệu nào (`addMockPatient`, `createMockCaseForPatient`, `updateCaseNotes`, `completeCase`, `trashPatient`) đều kích hoạt hàm `notify()` để thông báo đến tất cả màn hình đang đăng ký lắng nghe.
- **Nhất quán giữa Danh sách và Chi tiết**: Khi mở màn chi tiết, component lấy dữ liệu mới nhất từ store bằng `getMockPatientById` hoặc `getMockCaseById`. Khi có hành động sửa, store cập nhật và màn hình danh sách tự động `getMockPatients()` lại để hiển thị đồng bộ.
- **Bảo mật phiên đăng nhập**: Khi đăng xuất tài khoản (`logout`), store tự động gọi `resetDoctorStore()` để làm sạch dữ liệu phiên tạm, đảm bảo không rò rỉ dữ liệu phiên của tài khoản trước sang tài khoản sau.
- **Tính minh bạch**: Khi chưa có SQLite/Firebase, mọi hành động lưu đều hiển thị thông điệp rõ ràng:
  > *"Đã lưu tạm trong phiên mô phỏng; dữ liệu có thể mất khi khởi động lại app"*.

---

## 3. Kiểm tra ngày lịch (`validateDateOfBirth`)

Nhập liệu thông tin ngày sinh bệnh nhân cần tuân thủ đúng ngày thực tế trên lịch và không nằm trong tương lai. Hàm `validateDateOfBirth` được thiết kế chặt chẽ:
1. **Kiểm tra cú pháp**: Kiểm tra định dạng `DD/MM/YYYY` bằng biểu thức chính quy `^\d{2}/\d{2}/\d{4}$`.
2. **Kiểm tra tính có thực trên lịch**:
   - Tách chuỗi thành ngày, tháng, năm số nguyên.
   - Kiểm tra tháng nằm trong khoảng `1 - 12`.
   - Kiểm tra ngày tối đa của từng tháng (tháng 4, 6, 9, 11 có 30 ngày; các tháng còn lại có 31 ngày).
   - Riêng tháng 2, tự động tính năm nhuận (`(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0`) để chấp nhận ngày `29/02`, từ chối ngày `29/02` ở năm không nhuận hoặc các ngày `> 29`.
3. **Kiểm tra mốc thời gian**:
   - Đối chiếu đối tượng `Date(year, month - 1, day)` với thời điểm hiện tại `new Date()`.
   - Bác bỏ mọi ngày sinh nằm trong tương lai (`date > now`).
   - Cảnh báo năm sinh quá xa trong quá khứ (`year < 1900`).

---

## 4. Quy tắc nghiệp vụ hoàn tất ca bệnh (`BR-CASE-01`)

Theo đặc tả nghiệp vụ chẩn đoán hình ảnh, một ca bệnh chỉ có thể chuyển sang trạng thái "Hoàn tất" khi đáp ứng đủ các điều kiện sau:
- Ca bệnh phải có ít nhất **1 ảnh cắt lớp CT**.
- Không có bất kỳ ảnh nào trong ca đang ở trạng thái phân tích (`status === 'running'`).
- Bác sĩ phải xác nhận qua hộp thoại cảnh báo trước khi chốt kết quả chẩn đoán.

Trong [`CaseDetailScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/CaseDetailScreen.tsx):
- Nút "Hoàn tất ca" sẽ tự động chuyển sang trạng thái **DISABLED** nếu không thỏa mãn `BR-CASE-01`.
- Dưới nút bấm có dòng chữ chú thích chỉ rõ lý do vì sao chưa thể hoàn tất (ví dụ: *"Cần có ít nhất 1 ảnh CT và không có ảnh đang phân tích để hoàn tất ca"*).

---

## 5. Tổ chức điều hướng trong `DoctorStack`

Để hỗ trợ chuyển màn hình từ các Tab sang màn hình Chi tiết và hiển thị Modal đè lên toàn màn hình:
- Tạo [`DoctorStack.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/navigation/DoctorStack.tsx) sử dụng `@react-navigation/native-stack`.
- Cấu trúc các tuyến đường (routes):
  - `DoctorTabs`: Màn hình gốc chứa 5 tab (Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tài khoản).
  - `PatientForm`: Modal toàn màn hình (`presentation: 'modal'`), có thanh tiêu đề riêng, nút Đóng/Hủy và nút Lưu.
  - `PatientDetail`: Xem hồ sơ, truyền tham số `{ patientId: string }`.
  - `CaseDetail`: Xem chi tiết ca, truyền `{ caseId: string }`.
  - `AIImageResult`: Xem ảnh AI, truyền `{ caseId: string, imageId: string }`.
  - `ExportPdf`: Cấu hình xuất file, truyền `{ caseId: string }`.
- Tất cả các màn hình chi tiết đều tích hợp kiểm tra dữ liệu đầu vào. Nếu ID truyền vào không tìm thấy trong store (ví dụ bị xóa hoặc lỗi tham số), màn hình hiển thị fallback cảnh báo thân thiện cùng nút "Quay lại" thay vì để ứng dụng bị crash.

---

## 6. Đa ngôn ngữ (i18n) hoàn thiện trong UI-07

### Triển khai hook `useTranslation()`:
Toàn bộ chữ giao diện của 5 màn hình chi tiết mới đã được chuyển đổi hoàn toàn sang hệ thống bản dịch đa ngôn ngữ i18n (`react-i18next`):
- Đưa 140 cặp khóa-giá trị dịch chuẩn xác đối xứng vào namespace `doctor_detail` trong [`mobile/src/i18n/vi.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/i18n/vi.json) và [`mobile/src/i18n/en.json`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/i18n/en.json).
- Áp dụng `useTranslation()` trên cả 5 màn hình: tiêu đề `TopBar`, nhãn trường `TextField`, placeholder, thông báo lỗi validation (`validateDateOfBirth`), nút bấm `Button`, menu tùy chọn, hộp thoại `Dialog`, thông báo lưu tạm và nhãn trợ năng (`accessibilityLabel`).
- **Nguyên tắc dữ liệu y tế**: Tuyệt đối **không dịch** tên riêng bệnh nhân (ví dụ: *Nguyễn Văn An*), mã bệnh nhân (*BN-000123*), mã ca chụp (*CA-2026-001*) hoặc nội dung nhận xét do bác sĩ tự nhập.
- **Tách biệt cấu hình ngôn ngữ PDF**: Trong `ExportPdfScreen`, lựa chọn ngôn ngữ của tài liệu PDF (`pdfLanguage: 'vi' | 'en'`) được quản lý bằng state riêng biệt, hoàn toàn tách rời khỏi ngôn ngữ giao diện của ứng dụng (`i18n.language`).
- **Giữ nguyên trạng thái biểu mẫu (Form State Preservation)**: Khi người dùng đổi ngôn ngữ Việt–Anh trong lúc màn hình `PatientFormModal` hoặc `CaseDetailScreen` đang mở, React tự động render lại các chuỗi nhãn giao diện theo ngôn ngữ mới trong khi toàn bộ giá trị đang nhập (`code`, `fullName`, `dob`, `phone`, `symptoms`, `notesText`) trong state được giữ nguyên vẹn.

### Đính chính tuyên bố kiểm thử:
- **Đính chính**: Báo cáo kiểm thử sơ bộ trước đây từng ghi nhận đạt đa ngôn ngữ khi mới chỉ kiểm tra từ điển tĩnh trong bài test đơn vị của Jest mà chưa tích hợp toàn diện hook `useTranslation()` vào từng component chi tiết.
- **Hiện trạng đã hoàn thiện**: Ở bản sửa đổi này, toàn bộ 5 màn hình chi tiết đã liên kết hook thực tế, vượt qua 13 bài unit test (bao gồm kiểm tra trực tiếp việc chuyển ngữ `changeLanguage` giữa `vi` và `en`, kiểm tra bản dịch lỗi của hàm `validateDateOfBirth`, tách bạch cấu hình PDF) và đã được kiểm tra trực quan trên máy ảo Android ở cả 2 ngôn ngữ với minh chứng SHA256 độc lập.

---

## 7. Ghi nhận tồn đọng kiểm thử thực tế

Duy trì ghi nhận các hạn chế kỹ thuật theo đúng nguyên tắc trung thực khoa học của dự án:
- **Tồn đọng UI-04**: Thao tác cử chỉ hai ngón (pinch-to-zoom), pan/xoay và độ khớp hiển thị điểm ảnh giữa lớp ảnh CT thô và lớp phủ Grad-CAM chưa thể đo lường định lượng trên máy ảo giả lập hoặc Jest; cần thiết bị Android/iOS vật lý có màn hình cảm ứng để đo kiểm.
- **Tồn đọng UI-05**: Toàn bộ luồng `RootNavigator` đầy đủ chưa có bộ test tích hợp end-to-end trong Jest (hiện Jest chạy kiểm thử đơn vị độc lập từng màn hình và kiểm tra logic `AuthContext`).
