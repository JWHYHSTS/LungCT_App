# Khảo sát thực nghiệm Android Emulator: UI-07 (Chi tiết Bác sĩ)

- **Ngày khảo sát**: 26/10/2026
- **Thiết bị**: Android Emulator `emulator-5554` (Pixel 6 Pro / API 34 / Android 14)
- **Mục tiêu**: Xác thực trực quan 5 màn hình chi tiết của vai trò Bác sĩ (`doctor`), kiểm tra tính nhất quán của dữ liệu mô phỏng trong phiên, trạng thái lỗi/ràng buộc y khoa và hộp thoại cảnh báo thao tác quan trọng.

---

## 1. Danh sách ảnh chụp minh chứng

### A. Bộ minh chứng Tiếng Việt (Mặc định)
| STT | Tên tệp ảnh | Nội dung & Thao tác kiểm tra |
| :-- | :--- | :--- |
| 1 | `04_doctor_home.png` | Màn hình Trang chủ bác sĩ (`DoctorHomeScreen`). |
| 2 | `05_doctor_patients.png` | Danh sách bệnh nhân (`DoctorPatientsScreen`) với nhãn cảnh báo lưu tạm. |
| 3 | `13_patient_form.png` | Modal Thêm bệnh nhân mới (`PatientFormModal` - SCR-P02 / 13) ở trạng thái ban đầu. |
| 4 | `13_patient_form_validation_errors.png` | **Trạng thái lỗi**: Báo lỗi kiểm tra ràng buộc khi để trống mã, tên, ngày sinh không hợp lệ trên lịch. |
| 5 | `13_patient_form_discard_confirm.png` | **Thao tác quan trọng**: Hộp thoại xác nhận "Bỏ thông tin chưa lưu?" khi người dùng đã nhập liệu nhưng bấm đóng form. |
| 6 | `14_patient_detail.png` | Chi tiết hồ sơ bệnh nhân (`PatientDetailScreen` - SCR-P03 / 14), thẻ nhân khẩu học và lịch sử ca bệnh. |
| 7 | `15_case_detail.png` | Chi tiết ca chụp CT (`CaseDetailScreen` - SCR-C02 / 15), lưới ảnh lát cắt, nhận xét tự lưu tạm và nút Hoàn tất ca. |
| 8 | `16_ai_image_result.png` | Kết quả phân tích AI lát cắt (`AIImageResultScreen` - SCR-R01 / 16), chế độ xem lát cắt, Grad-CAM, thanh độ mờ và ScoreCard. |
| 9 | `17_export_pdf.png` | Màn hình cấu hình xuất tài liệu PDF (`ExportPdfScreen` - SCR-D01 / 17), chọn ngôn ngữ, tùy chọn Grad-CAM và cảnh báo bảo mật PHI. |
| 10 | `17_export_pdf_share_confirm.png` | **Thao tác quan trọng & Bảo mật**: Hộp thoại xác nhận tuân thủ bảo mật dữ liệu nhạy cảm trước khi chia sẻ/xuất tài liệu. |

### B. Bộ minh chứng Tiếng Anh (English UI Verification)
| STT | Tên tệp ảnh | SHA256 (16 ký tự đầu) | Nội dung & Thao tác kiểm tra |
| :-- | :--- | :--- | :--- |
| 11 | `en_13_patient_form.png` | `2daf9aca3775b35f...` | Modal Add Patient (`PatientFormModal`) hiển thị toàn bộ nhãn, placeholder và nút bấm bằng tiếng Anh; giữ nguyên dữ liệu đang nhập khi đổi ngôn ngữ. |
| 12 | `en_14_patient_detail.png` | `0d1bbea52c8feb45...` | Màn hình Patient Details (`PatientDetailScreen`) hiển thị thẻ nhân khẩu học, nhãn trạng thái và lịch sử ca bệnh bằng tiếng Anh. |
| 13 | `en_15_case_detail.png` | `fecf528eff15539c...` | Màn hình Case Details (`CaseDetailScreen`) hiển thị nhãn lưới ảnh, nhận xét bác sĩ và nút Complete Case bằng tiếng Anh. |
| 14 | `en_16_ai_image_result.png` | `b7baffcc32993249...` | Màn hình Image Result (`AIImageResultScreen`) hiển thị nhãn Grad-CAM, dải trượt độ mờ và thông tin phân tích mô hình bằng tiếng Anh. |
| 15 | `en_17_export_pdf.png` | `de38176fc73f66e4...` | Màn hình Export PDF (`ExportPdfScreen`) hiển thị cấu hình báo cáo bằng tiếng Anh; tách biệt lựa chọn ngôn ngữ tài liệu PDF khỏi ngôn ngữ app. |

*Ghi chú*: Cả 15 tệp ảnh đều được lưu dưới dạng PNG định dạng chuẩn RGBA (1080x1920), có giá trị băm SHA256 hoàn toàn độc lập và được kiểm tra tính hợp lệ qua thư viện Python Pillow.

---

## 2. Kết quả kiểm tra hành vi thực tế

1. **Đa ngôn ngữ & Giữ nguyên dữ liệu biểu mẫu**:
   - Chuyển đổi ngôn ngữ Việt–Anh theo thời gian thực (live toggle) thông qua hộp thoại Cài đặt (`DoctorProfileScreen`) hoặc bộ chuyển ngữ của ứng dụng.
   - Khi đang mở biểu mẫu nhập liệu `PatientFormModal` hoặc ô nhập nhận xét `CaseDetailScreen`, việc chuyển đổi ngôn ngữ cập nhật ngay lập tức toàn bộ chuỗi giao diện (tiêu đề, nhãn, placeholder, nút bấm, thông báo) sang ngôn ngữ mới mà **không làm mất** dữ liệu đang nhập trong các trường `TextField`.
   - Các trường danh từ riêng y tế như tên bệnh nhân (*Nguyễn Văn An*), mã hồ sơ (*BN-000123*), mã ca (*CA-2026-001*) và nội dung ghi chú lâm sàng do bác sĩ nhập được bảo toàn nguyên vẹn, không bị can thiệp dịch sai lệch.
   - Lựa chọn ngôn ngữ của tài liệu PDF xuất ra (`pdfLanguage: 'vi' | 'en'`) hoạt động độc lập với ngôn ngữ giao diện hệ thống.
2. **Tính nhất quán In-Memory Store**:
   - Thêm bệnh nhân, tạo ca mới, sửa nhận xét và hoàn tất ca đều cập nhật đồng bộ tức thời giữa danh sách (`DoctorPatientsScreen`, `DoctorCasesScreen`, `DoctorHomeScreen`) và màn chi tiết thông qua Pub/Sub store.
   - Toàn bộ thông báo lưu đều ghi rõ: *"Đã lưu tạm trong phiên mô phỏng; dữ liệu có thể mất khi khởi động lại app"*.
3. **Kiểm tra ngày lịch (`validateDateOfBirth`)**:
   - Định dạng bắt buộc `DD/MM/YYYY`.
   - Bắt chính xác lỗi ngày không có thực trên lịch (ví dụ `31/04/1990` hoặc năm không nhuận `29/02/2023`).
   - Từ chối ngày sinh nằm trong tương lai so với thời điểm hiện tại.
4. **Quy tắc nghiệp vụ hoàn tất ca (BR-CASE-01)**:
   - Ca không thể hoàn tất nếu chưa có ảnh hoặc có ảnh đang ở trạng thái phân tích (`running`). Nút Hoàn tất ca bị vô hiệu hóa kèm thông điệp hướng dẫn rõ ràng.
5. **Không tạo báo cáo giả / PDF giả**:
   - Chức năng xuất file thật được đánh dấu lộ trình `TODO(PDF-01)`. Sau khi người dùng xác nhận trách nhiệm bảo mật thông tin định danh và dữ liệu y tế, hệ thống đưa ra thông báo minh bạch rằng tính năng kết xuất tệp PDF vật lý sẽ kết nối dịch vụ backend trong giai đoạn sau.

---

## 3. Ghi nhận tồn đọng kỹ thuật

- **UI-04**: Thao tác zoom hai ngón (pinch-zoom), xoay, kéo và độ khớp điểm ảnh tuyệt đối giữa ảnh CT gốc và bản đồ nhiệt Grad-CAM cần được đo kiểm thực tế trên thiết bị vật lý màn hình cảm ứng đa điểm.
- **UI-05**: Bộ test tự động Jest hiện kiểm tra từng màn hình độc lập và luồng AuthContext; chưa dựng toàn bộ cây `RootNavigator` tích hợp trong môi trường test giả lập Jest.
