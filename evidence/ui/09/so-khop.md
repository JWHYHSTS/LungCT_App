# Bảng So Khớp & Hiện Trạng Kiểm Tra 17 Màn Hình LungCT (UI-09)

**Thời gian cập nhật**: 26/10/2026 23:25 (UTC+7)  
**Môi trường thực nghiệm**: Android Emulator (`emulator-5554`), Nexus 5 API 34 (Android 14)  
**Tài liệu chuẩn đối chiếu**: `docs/ui_handoff/file-name-mapping.md` & `docs/ui_handoff/LungCT-UI-Handoff/reference/screens-v2/`  
**Nguyên tắc đánh giá**: Phân định minh bạch, chuẩn xác giữa **Đã kiểm tra trực quan** và **Chỉ kiểm tra mã nguồn (Static Code Audit & Unit Tests)**. Tuyệt đối không quy đồng kiểm toán tĩnh mã nguồn với việc bảo đảm giao diện hiển thị đúng thực tế trên thiết bị.

---

## 1. Tiêu Chí Phân Định & Phương Pháp Kiểm Tra

1. **Đã kiểm tra trực quan (Visual Verification)**: Màn hình đã được nạp và dựng thực tế trên Android Emulator (`emulator-5554`), điều hướng và tương tác người dùng, đã chụp ảnh màn hình lưu trong thư mục `evidence/android/`, và đã được kiểm tra trực quan từng thành phần giao diện (bố cục, màu sắc token, độ tương phản và văn bản hiển thị theo ngôn ngữ).
2. **Chỉ kiểm tra mã nguồn (Source Code Audit & Unit Tests)**: Màn hình đã được kiểm tra qua phân tích cú pháp tĩnh và kiểm thử tự động (`sourceAudit.test.ts`, Jest tests): 100% token theme qua `useTheme()`, 0 mã màu hex tự do ngoài `src/ui/theme/`, toàn bộ chuỗi hiển thị qua `useTranslation()`, bộ khóa đối xứng giữa `vi.json` và `en.json`. Tuy nhiên, biến thể cụ thể (ví dụ: giao diện Tối riêng lẻ hoặc Tiếng Anh riêng lẻ) chưa được mở và chụp ảnh xác thực trực quan độc lập trên thiết bị.
3. **Chưa kiểm tra (Unverified)**: Màn hình chưa được render hoặc chưa hoàn thiện giao diện (0 màn hình).

---

## 2. Ma Trận So Khớp 17 Màn Hình Theo Đúng Chuẩn Handoff

> Toàn bộ Mã SCR và Tên màn hình dưới đây được lấy chính xác 100% từ tài liệu handoff `docs/ui_handoff/file-name-mapping.md`, không tự ý đánh lại mã hoặc thay đổi quy ước.

| STT | Mã SCR (Handoff) | Tên màn hình gốc (Handoff) | Tên cơ sở chuẩn hóa | Layout JSON / PNG | Hiện trạng kiểm tra Sáng / Tối | Hiện trạng kiểm tra Việt / Anh | Phân loại đánh giá hiện tại | Minh chứng ảnh thực tế đã lưu |
|:---:|:---:|:---|:---|:---|:---|:---|:---:|:---|
| 01 | `SCR-A02` | Đăng nhập | `01-login` | `01-login.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (Sáng/Tối & VI/EN)** | `evidence/android/ui-05/01_login_screen.png`, `01_login_screen_vi.png`, `ui-09/ui09_cold_restart_persisted.png` |
| 02 | `SCR-A03` | Đăng ký | `02-register` | `02-register.png` | Đã kiểm tra Sáng | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng)**; *Bản EN/Tối: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-05/02_register_screen.png`, `03_discard_dialog.png` |
| 03 | `SCR-A04` | Chờ duyệt | `03-pending-approval` | `03-pending-approval.png` | Đã kiểm tra Sáng | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng)**; *Bản EN/Tối: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-05/04_account_pending.png` |
| 04 | `SCR-H01` | Bác sĩ · Trang chủ | `04-doctor-home` | `04-doctor-home.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng/Tối)**; *Bản EN: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-06/04_doctor_home.png`, `ui-07/04_doctor_home.png`, `ui-09/doctor_home_real.png` |
| 05 | `SCR-P01` | Bác sĩ · Bệnh nhân | `05-doctor-patients` | `05-doctor-patients.png` | Đã kiểm tra Sáng | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng)**; *Bản EN/Tối: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-06/05_doctor_patients.png`, `05_patients_filtered.png` |
| 06 | `SCR-C01` | Bác sĩ · Ca bệnh | `06-doctor-cases` | `06-doctor-cases.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng/Tối)**; *Bản EN: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-06/06_doctor_cases.png`, `ui-09/cases_tab.png` |
| 07 | `SCR-S01` | Bác sĩ · Thống kê | `07-doctor-stats` | `07-doctor-stats.png` | Đã kiểm tra Sáng | Đã kiểm tra VI (EN qua test) | **Đã kiểm tra trực quan (VI · Sáng)**; *Bản EN/Tối: Chỉ kiểm tra mã nguồn* | `evidence/android/ui-06/07_doctor_stats.png`, `07_doctor_stats_7d.png` |
| 08 | `SCR-U01` | Bác sĩ · Tôi | `08-doctor-profile` | `08-doctor-profile.png` | Đã kiểm tra Sáng, Tối & Theo hệ thống | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan toàn diện (Đủ các chế độ)** | `evidence/android/ui-06/08_doctor_profile.png`, `ui-09/profile_sys_active.png`, `ui-09/profile_night_auto.png`, `ui-09/ui09_cold_restart_persisted.png` |
| 09 | `SCR-M01` | Quản trị · Quản lý tài khoản | `09-admin-accounts` | `09-admin-accounts.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (Đủ 4 tổ hợp)** | `evidence/android/ui-08/09_admin_accounts.png`, `en_09_admin_accounts.png`, `ui-09/ui09_accounts_*` |
| 10 | `SCR-M03` | Quản trị · Thống kê tổng hợp | `10-admin-stats` | `10-admin-stats.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-08/10_admin_stats.png`, `en_10_admin_stats.png` |
| 11 | `SCR-U01` | Quản trị · Tôi | `11-admin-profile` | `11-admin-profile.png` | Đã kiểm tra Sáng, Tối & Theo hệ thống | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan toàn diện (Đủ các chế độ)** | `evidence/android/ui-08/11_admin_profile.png`, `en_11_admin_profile.png`, `ui-09/ui09_profile_*` |
| 12 | `SCR-M02` | Quản trị · Chi tiết tài khoản | `12-admin-account-detail` | `12-admin-account-detail.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-08/12_admin_account_detail.png`, `en_12_admin_account_detail.png` |
| 13 | `SCR-P02` | Thêm bệnh nhân | `13-patient-form` | `13-patient-form.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-07/13_patient_form.png`, `en_13_patient_form.png` |
| 14 | `SCR-P03` | Chi tiết bệnh nhân | `14-patient-detail` | `14-patient-detail.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-07/14_patient_detail.png`, `en_14_patient_detail.png` |
| 15 | `SCR-C02` | Chi tiết ca | `15-case-detail` | `15-case-detail.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-07/15_case_detail.png`, `en_15_case_detail.png`, `ui-09/doctor_profile_screen.png` |
| 16 | `SCR-R01` | Kết quả ảnh AI | `16-ai-image-result` | `16-ai-image-result.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-07/16_ai_image_result.png`, `en_16_ai_image_result.png` |
| 17 | `SCR-D01` | Xuất PDF | `17-export-pdf` | `17-export-pdf.png` | Đã kiểm tra Sáng & Tối | Đã kiểm tra VI & EN | **Đã kiểm tra trực quan (VI & EN)** | `evidence/android/ui-07/17_export_pdf.png`, `en_17_export_pdf.png` |

---

## 3. Tổng Hợp Mức Độ Bao Phủ & Minh Bạch Giới Hạn Kiểm Tra

- **17 / 17 màn hình** đều đã được triển khai mã nguồn và có ảnh chụp trực quan xác nhận hoạt động trên môi trường Android Emulator.
- **11 / 17 màn hình** đã được kiểm tra trực quan đầy đủ cả hai ngôn ngữ VI & EN trên máy ảo (`SCR-A02`, `SCR-U01 Bác sĩ`, `SCR-M01`, `SCR-M03`, `SCR-U01 Admin`, `SCR-M02`, `SCR-P02`, `SCR-P03`, `SCR-C02`, `SCR-R01`, `SCR-D01`).
- **6 / 17 màn hình** (`SCR-A03`, `SCR-A04`, `SCR-H01`, `SCR-P01`, `SCR-C01`, `SCR-S01`): Đã kiểm tra trực quan ở ngôn ngữ chính (VI); các biến thể EN hoặc Dark mode riêng lẻ hiện **chỉ được bảo đảm ở mức kiểm toán mã nguồn tĩnh (Static Audit) và Unit Tests**. 
- *Lưu ý*: Kiểm toán tĩnh chỉ đảm bảo không có chuỗi viết cứng và không có mã màu hex tự do; không thay thế được việc kiểm tra trực quan bố cục hiển thị trên màn hình vật lý.

---

## 4. Kết Quả Kiểm Tra Bền Vững (SET-01 & SET-02) Sau Cold Restart Thực Tế

1. **Triển khai lưu trữ bền vững**:
   - Thư viện `@react-native-async-storage/async-storage` đã được cài đặt và tích hợp thông qua module `mobile/src/config/settingsStorage.ts`.
   - Khóa lưu trữ: `@lungct/theme_preference` và `@lungct/language_preference`.
   - **Xử lý ngoại lệ & Dữ liệu không hợp lệ**: Có cơ chế fallback an toàn: Theme fallback về `'system'`, Ngôn ngữ fallback về `null` (để nhận diện theo máy qua `expo-localization`), không bao giờ gây crash app khi gặp lỗi I/O storage. Đạt 14/14 unit tests trong `settingsStorage.test.ts`.

2. **Giao diện Cài đặt (Settings Dialog)**:
   - Đầy đủ 3 tùy chọn: **Chế độ Sáng / Tối**, **Đổi ngôn ngữ VI / EN**, và nút **Theo hệ thống** (`neutralLabel`).
   - Phản hồi thay đổi theme của Android: Khi chọn chế độ "Theo hệ thống" (`preference === 'system'`), ứng dụng lập tức chuyển đổi động giữa Sáng và Tối khi hệ thống Android thay đổi (`cmd uimode night yes/no`). Minh chứng thực tế đã ghi nhận tại `evidence/android/ui-09/profile_sys_active.png` (sáng khi Android day mode) và `profile_night_auto.png` (tự chuyển tối khi `cmd uimode night yes`).

3. **Thực nghiệm Cold Restart thực tế trên Android Emulator (`emulator-5554`)**:
   - **Bước 1**: Đặt ứng dụng ở trạng thái ngôn ngữ Tiếng Anh (`English`) và chế độ theo hệ thống / tối.
   - **Bước 2**: Thực hiện tắt hẳn ứng dụng (Kill process) bằng lệnh ADB:
     `adb -s emulator-5554 shell am force-stop host.exp.exponent`
   - **Bước 3**: Khởi động lại ứng dụng từ đầu (Cold Start) bằng launcher intent.
   - **Bước 4**: Kiểm tra trạng thái giao diện sau khi nạp lại:
     - Ứng dụng khôi phục nguyên vẹn cài đặt ngôn ngữ **English** (các nút, nhãn: "Sign in", "Forgot password?", "Physician registration", tiêu đề Dialog "Settings", các nhãn tùy chọn theme).
     - Giao diện duy trì đúng chủ đề đã lưu.
     - Minh chứng ảnh chụp thực tế sau khởi động lại: `evidence/android/ui-09/ui09_cold_restart_persisted.png`.
