# Bản đồ màn hình và điều hướng

## 17 màn hình chuẩn để code trước (ảnh tham chiếu trong `reference/screens-v2/png/`)

| # | Tên màn hình | Tên tệp chuẩn hóa (`.json`/`.png`/`.svg`) | Mã SCR | Vai trò | Vào từ | Bấm → đi tới |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Đăng nhập | `01-login` | SCR-A02 | Khách | Khởi động | “Đăng nhập” → 04 (bác sĩ) / 09 (admin); “Đăng ký tài khoản” → 02; “Quên mật khẩu?” → SCR-A05 |
| 02 | Đăng ký | `02-register` | SCR-A03 | Khách | 01 | “Gửi đăng ký” → 03; nút back → 01 |
| 03 | Chờ duyệt | `03-pending-approval` | SCR-A04 | Bác sĩ | 02, đăng nhập khi PENDING | “Về màn hình đăng nhập” → 01 |
| 04 | Bác sĩ · Trang chủ | `04-doctor-home` | SCR-H01 | Bác sĩ | tab | “Tạo ca mới” → sheet chọn bệnh nhân → 15; dòng ca → 15; dòng bệnh nhân → 14; chuông → SCR-N01; đồng bộ → SCR-Y01 |
| 05 | Bác sĩ · Bệnh nhân | `05-doctor-patients` | SCR-P01 | Bác sĩ | tab | dòng → 14; “Thêm bệnh nhân” → 13 |
| 06 | Bác sĩ · Ca bệnh | `06-doctor-cases` | SCR-C01 | Bác sĩ | tab | dòng → 15 |
| 07 | Bác sĩ · Thống kê | `07-doctor-stats` | SCR-S01 | Bác sĩ | tab | — |
| 08 | Bác sĩ · Tôi | `08-doctor-profile` | SCR-U01 | Bác sĩ | tab | Đổi mật khẩu → SCR-A06; Cài đặt → SCR-U02; Thùng rác → SCR-T01; Trung tâm đồng bộ → SCR-Y01; Đăng xuất → hộp thoại → 01 |
| 09 | Quản trị · Quản lý tài khoản | `09-admin-accounts` | SCR-M01 | Admin | tab | dòng → 12 |
| 10 | Quản trị · Thống kê tổng hợp | `10-admin-stats` | SCR-M03 | Admin | tab | — |
| 11 | Quản trị · Tôi | `11-admin-profile` | SCR-U01 (admin) | Admin | tab | như 08 nhưng không có Thùng rác / Đồng bộ |
| 12 | Quản trị · Chi tiết tài khoản | `12-admin-account-detail` | SCR-M02 | Admin | 09 | Duyệt → 09; Khóa → hộp thoại nhập lý do |
| 13 | Thêm bệnh nhân | `13-patient-form` | SCR-P02 | Bác sĩ | 05, sheet tạo ca | “Lưu” → 14; nút đóng → quay lại |
| 14 | Chi tiết bệnh nhân | `14-patient-detail` | SCR-P03 | Bác sĩ | 04, 05 | dòng ca / “Tạo ca mới” → 15 |
| 15 | Chi tiết ca | `15-case-detail` | SCR-C02 | Bác sĩ | 04, 06, 14 | ô ảnh → 16; “Xuất PDF” → 17; “Hoàn tất ca” → SCR-C05 |
| 16 | Kết quả ảnh AI | `16-ai-image-result` | SCR-R01 | Bác sĩ | 15 | trước/sau đổi ảnh; Ảnh gốc ↔ Grad-CAM |
| 17 | Xuất PDF | `17-export-pdf` | SCR-D01 | Bác sĩ | 15 | “Chia sẻ” → hộp thoại xác nhận → bảng chia sẻ hệ thống |

Các màn và trạng thái còn lại (A01, U03, A05, A06, sheet, hộp thoại, lỗi, offline, Y01, T01, N01, U02, C03–C05…) có đặc tả đầy đủ trong `design/02-dac-ta-tung-khung.md` và có hình trong file Figma v1 (trang 02). Bản Tối và bản tiếng Anh của mọi khung: trang 03 của Figma v1.

## Cấu trúc điều hướng (React Navigation)

```
RootStack
├── AuthStack: Splash(A01) → PrivacyNotice(U03) → Login(A02) → Register(A03) → AccountStatus(A04) → ForgotPassword(A05)
├── DoctorTabs (5 tab): Home(H01) · Patients(P01) · Cases(C01) · Stats(S01) · Me(U01)
│   └── DoctorStack (mở chồng lên tab): PatientForm(P02, modal) · PatientDetail(P03) · CaseDetail(C02) · ImageResult(R01) · ExportPdf(D01) · CompleteCase(C05, modal) · Trash(T01) · Settings(U02) · SyncCenter(Y01) · Notifications(N01) · ChangePassword(A06)
└── AdminTabs (3 tab): Accounts(M01) · AdminStats(M03) · Me(U01 admin)
    └── AdminStack: AccountDetail(M02)
```

Sheet (chọn bệnh nhân, nguồn ảnh, menu ảnh, bộ lọc) dùng bottom sheet; hộp thoại xác nhận dùng modal có scrim 50%. Android: nút Back đóng sheet/modal trước, ở tab gốc thì thoát app.
