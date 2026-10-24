# BẢNG ÁNH XẠ CHUẨN HÓA TÊN TỆP TÀI NGUYÊN (FILE NAME MAPPING)

> **Dự án**: LungCT — Hệ thống hỗ trợ chẩn đoán ảnh CT lồng ngực  
> **Phạm vi**: Chuẩn hóa tên tệp và thư mục tài nguyên trong `docs/ui_handoff/LungCT-UI-Handoff/reference/screens-v2/`  
> **Thời điểm thực hiện**: 25/10/2026  
> **Mục đích**: Chuyển đổi tên tệp tiếng Việt có dấu, khoảng trắng và ký tự đặc biệt sang tiếng Anh kebab-case đồng nhất, khắc phục triệt để lỗi mã hóa (mojibake) trên hệ thống tệp, phục vụ lập trình React Native + TypeScript.

---

## 1. Quy ước Đặt tên Chuẩn hóa

- **Định dạng chuẩn**: Tiếng Anh, chữ thường (`lowercase`), nối từ bằng gạch nối (`kebab-case`), không dấu tiếng Việt, không khoảng trắng.
- **Đồng nhất tên cơ sở (Base Name)**: Cùng một màn hình có tên cơ sở hoàn toàn đồng nhất giữa cả 3 định dạng: `.json` (layout structure), `.png` (@2x reference image) và `.svg` (vector markup).
- **Bảo toàn số thứ tự**: Giữ nguyên số thứ tự màn hình từ `01-` đến `17-`.
- **Bảo toàn chuẩn công cụ**: Giữ nguyên cấu trúc thư mục, các tệp chuẩn framework (`README.md`, `manifest.json`, `index.ts`, `__tests__`, `ThemeProvider.tsx`).
- **Bảo toàn dữ liệu nghiệp vụ**: Không thay đổi khóa JSON bên trong file, không đổi logic hay nội dung thiết kế.

---

## 2. Bảng Ánh xạ 17 Bộ Tài nguyên Màn hình Chuẩn (51 tệp)

| STT | Mã SCR | Tên màn hình gốc | Tên cơ sở chuẩn hóa | Layout JSON (`layout-json/`) | Reference PNG (`png/`) | Vector SVG (`svg/`) | Kiểm tra |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **01** | `SCR-A02` | Đăng nhập | `01-login` | `01-login.json` | `01-login.png` | `01-login.svg` | ĐẠT (100%) |
| **02** | `SCR-A03` | Đăng ký | `02-register` | `02-register.json` | `02-register.png` | `02-register.svg` | ĐẠT (100%) |
| **03** | `SCR-A04` | Chờ duyệt | `03-pending-approval` | `03-pending-approval.json` | `03-pending-approval.png` | `03-pending-approval.svg` | ĐẠT (100%) |
| **04** | `SCR-H01` | Bác sĩ · Trang chủ | `04-doctor-home` | `04-doctor-home.json` | `04-doctor-home.png` | `04-doctor-home.svg` | ĐẠT (100%) |
| **05** | `SCR-P01` | Bác sĩ · Bệnh nhân | `05-doctor-patients` | `05-doctor-patients.json` | `05-doctor-patients.png` | `05-doctor-patients.svg` | ĐẠT (100%) |
| **06** | `SCR-C01` | Bác sĩ · Ca bệnh | `06-doctor-cases` | `06-doctor-cases.json` | `06-doctor-cases.png` | `06-doctor-cases.svg` | ĐẠT (100%) |
| **07** | `SCR-S01` | Bác sĩ · Thống kê | `07-doctor-stats` | `07-doctor-stats.json` | `07-doctor-stats.png` | `07-doctor-stats.svg` | ĐẠT (100%) |
| **08** | `SCR-U01` | Bác sĩ · Tôi | `08-doctor-profile` | `08-doctor-profile.json` | `08-doctor-profile.png` | `08-doctor-profile.svg` | ĐẠT (100%) |
| **09** | `SCR-M01` | Quản trị · Quản lý tài khoản | `09-admin-accounts` | `09-admin-accounts.json` | `09-admin-accounts.png` | `09-admin-accounts.svg` | ĐẠT (100%) |
| **10** | `SCR-M03` | Quản trị · Thống kê tổng hợp | `10-admin-stats` | `10-admin-stats.json` | `10-admin-stats.png` | `10-admin-stats.svg` | ĐẠT (100%) |
| **11** | `SCR-U01` | Quản trị · Tôi | `11-admin-profile` | `11-admin-profile.json` | `11-admin-profile.png` | `11-admin-profile.svg` | ĐẠT (100%) |
| **12** | `SCR-M02` | Quản trị · Chi tiết tài khoản | `12-admin-account-detail` | `12-admin-account-detail.json` | `12-admin-account-detail.png` | `12-admin-account-detail.svg` | ĐẠT (100%) |
| **13** | `SCR-P02` | Thêm bệnh nhân | `13-patient-form` | `13-patient-form.json` | `13-patient-form.png` | `13-patient-form.svg` | ĐẠT (100%) |
| **14** | `SCR-P03` | Chi tiết bệnh nhân | `14-patient-detail` | `14-patient-detail.json` | `14-patient-detail.png` | `14-patient-detail.svg` | ĐẠT (100%) |
| **15** | `SCR-C02` | Chi tiết ca | `15-case-detail` | `15-case-detail.json` | `15-case-detail.png` | `15-case-detail.svg` | ĐẠT (100%) |
| **16** | `SCR-R01` | Kết quả ảnh AI | `16-ai-image-result` | `16-ai-image-result.json` | `16-ai-image-result.png` | `16-ai-image-result.svg` | ĐẠT (100%) |
| **17** | `SCR-D01` | Xuất PDF | `17-export-pdf` | `17-export-pdf.json` | `17-export-pdf.png` | `17-export-pdf.svg` | ĐẠT (100%) |

---

## 3. Tệp Hình ảnh Tổng quan Tham chiếu

| Tên tệp cũ | Tên tệp mới chuẩn hóa | Vị trí thư mục | Dung lượng | Kiểm tra định dạng |
| :--- | :--- | :--- | :---: | :---: |
| `tong-quan-17-man.png` | `overview-17-screens.png` | `reference/screens-v2/` | 1,038,102 bytes | Hợp lệ (PNG @2x) |

---

## 4. Kết quả Kiểm tra Tính Hợp lệ của Tài nguyên sau Đổi tên

- **Layout JSON (17/17 tệp)**: Toàn bộ 17 tệp JSON đã được kiểm tra cú pháp bằng parser `json.load()` đạt 100%, bảo toàn nguyên vẹn cấu trúc cây bố cục, kích thước, gap, padding, màu token, chữ và hành vi bấm.
- **Vector SVG (17/17 tệp)**: Toàn bộ 17 tệp SVG đã được kiểm tra cú pháp XML bằng parser `xml.etree.ElementTree` đạt 100%, không bị lỗi đóng thẻ, không lỗi encoding.
- **Hình ảnh PNG (17/17 tệp + 1 tệp tổng quan)**: Toàn bộ 18 tệp ảnh PNG đều tồn tại, kích thước hợp lệ, sẵn sàng phục vụ so khớp giao diện trên thiết bị di động.
- **Tính toàn vẹn**: 17 bộ tài nguyên màn hình đầy đủ 3 thành phần song hành (`.json`, `.png`, `.svg`) với tên cơ sở giống nhau hoàn toàn.

---

## 5. Kết quả Đối chiếu Bộ Icon: 48 Icon Gốc vs 64 Icon Handoff

Thực hiện so sánh tự động bằng mã băm `SHA-256` giữa `LungCT-Icons/` (48 icon) và `docs/ui_handoff/LungCT-UI-Handoff/assets/icons/` (64 icon) trên cả 3 thư mục định dạng (`svg`, `png-32px`, `png-64px`):

| Chỉ số đối chiếu | Định dạng SVG | Định dạng PNG-32px | Định dạng PNG-64px | Kết luận đối chiếu |
| :--- | :---: | :---: | :---: | :--- |
| **Icon gốc (`LungCT-Icons`)** | 48 tệp | 48 tệp | 48 tệp | Bộ icon y tế khởi tạo |
| **Icon trong UI Handoff** | 64 tệp | 64 tệp | 64 tệp | Bộ icon hoàn chỉnh kèm manifest |
| **Trùng tên & trùng SHA256 100% (Giữ nguyên)** | **48 / 48** | **48 / 48** | **48 / 48** | Toàn bộ 48 icon gốc được giữ nguyên bản tuyệt đối |
| **Trùng tên nhưng khác SHA256 (Khác biệt)** | **0** | **0** | **0** | Không có bất kỳ icon gốc nào bị biến đổi nội dung |
| **Icon gốc bị thiếu trong Handoff** | **0** | **0** | **0** | Không mất mát bất kỳ icon gốc nào |
| **Icon bổ sung mới trong Handoff** | **+16 tệp** | **+16 tệp** | **+16 tệp** | 16 icon bổ sung phục vụ đầy đủ các màn hình mới |

### Danh sách 16 icon bổ sung mới trong bộ Handoff:
1. `back`: Icon mũi tên quay lại màn hình trước.
2. `calendar`: Icon lịch chọn ngày sinh bệnh nhân.
3. `cancel`: Icon dấu gạch chéo hủy thao tác.
4. `chevron-right`: Icon điều hướng vào dòng chi tiết.
5. `close`: Icon dấu nhân đóng modal / bottom sheet.
6. `conflict`: Icon cảnh báo xung đột dữ liệu đồng bộ.
7. `eye-off`: Icon ẩn lớp nhiệt Grad-CAM / ẩn mật khẩu.
8. `eye`: Icon hiện lớp nhiệt Grad-CAM / hiện mật khẩu.
9. `info`: Icon thông tin trợ giúp / giải thích y khoa.
10. `language`: Icon chuyển đổi ngôn ngữ Việt / Anh.
11. `partial`: Icon trạng thái ca có kết quả một phần.
12. `pending`: Icon trạng thái chờ xử lý / chờ duyệt.
13. `privacy`: Icon chính sách bảo mật và quyền riêng tư.
14. `retry`: Icon thử lại khi phân tích hoặc kết nối lỗi.
15. `sort`: Icon sắp xếp danh sách bệnh nhân / ca bệnh.
16. `theme`: Icon chuyển đổi giao diện Sáng / Tối / Hệ thống.

---

## 6. Danh sách Các Tài liệu Đã Cập nhật Tham chiếu

1. `docs/ui_handoff/LungCT-UI-Handoff/ANTIGRAVITY/03-components-dot1.md`: Cập nhật tham chiếu ảnh minh chứng từ `04 - Bác sĩ · Trang chủ.png` sang `04-doctor-home.png`.
2. `docs/ui_handoff/LungCT-UI-Handoff/ANTIGRAVITY/04-components-dot2.md`: Cập nhật tham chiếu ảnh minh chứng từ `16 - Kết quả ảnh AI.png` sang `16-ai-image-result.png`.
3. `docs/ui_handoff/LungCT-UI-Handoff/design/05-man-hinh-va-dieu-huong.md`: Cập nhật bảng 17 màn hình chuẩn kèm cột tên tệp chuẩn hóa kebab-case.
4. `docs/ui_handoff/README.md`: Cập nhật cấu trúc thư mục và liên kết đến bảng chuẩn hóa tên tệp `file-name-mapping.md`.
5. `docs/ui_handoff/LungCT-UI-Handoff/README.md`: Cập nhật ghi chú tài nguyên màn hình chuẩn.
6. `LungCT_LamViecRieng/ghi_chep/CayThuMuc_LungCT.txt`: Xuất lại toàn bộ cây thư mục phản ánh tên tệp mới chuẩn hóa.
