# Tài Liệu Đặc Tả Bộ Icon Hệ Thống LungCT

## 1. Vị trí lưu trữ và Cấu trúc
Bộ icon đồ họa chuẩn cho hệ thống **LungCT** được lưu trữ nguyên bản tại thư mục:
`LungCT-Icons/` (đường dẫn tương đối từ gốc repository `LungCT_DoAn`).

Cấu trúc gồm 3 thư mục con:
```text
LungCT_DoAn/
└── LungCT-Icons/
    ├── png-32px/     # 48 tệp PNG kích thước 32x32 px
    ├── png-64px/     # 48 tệp PNG kích thước 64x64 px
    └── svg/          # 48 tệp vector SVG (viewBox 0 0 64 64)
```

> [!NOTE]
> Không có tệp `README` hoặc tài liệu hướng dẫn riêng bên trong `LungCT-Icons/`. Toàn bộ 48 tên tệp cơ sở (base name) đồng nhất 100% trên cả 3 thư mục con.

---

## 2. Đặc điểm kỹ thuật và Phong cách thiết kế
- **Định dạng & Độ phân giải**:
  - `svg/`: Đồ họa vector vô hạn độ phân giải, phù hợp làm nguồn chuyển đổi component hiển thị sắc nét trên cả màn hình mật độ cao (Retina iOS / xxxhdpi Android).
  - `png-32px/`: Bitmap kích thước 32×32 pixel, hỗ trợ fallback hoặc các thành phần compact.
  - `png-64px/`: Bitmap kích thước 64×64 pixel, hỗ trợ hiển thị tiêu chuẩn hoặc preview.
- **Phong cách thị giác (Visual Style)**:
  - Kiểu dáng: **Soft Stroke / Duo-tone y tế**, đường viền nét mảnh bo góc tròn (`stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`).
  - Bảng màu đặc trưng:
    - Nét viền chủ đạo: Màu xám than đậm trung tính y tế (`#4D5048`).
    - Màu nền / Nền thẻ: Trắng kem ngà ấm (`#FFFDF7`).
    - Màu điểm nhấn chức năng y tế (Medical Accent): Xanh phổi pastel (`#ADCBDD`, `#A9D5CD`), vàng nhạt (`#F8E6AA`), cam nhạt (`#EFB47A`), đỏ hồng cảnh báo/nhiệt (`#E8A49A`).

---

## 3. Phân loại vai trò tài nguyên và Phạm vi sử dụng

### A. Phân biệt Icon ứng dụng và Tài liệu / Preview
- **Icon sử dụng trong App (`mobile/`)**:
  - Toàn bộ 48 icon được thiết kế trực tiếp phục vụ các luồng tính năng UI/UX của ứng dụng di động y tế.
  - **Chỉ đóng gói những icon thực sự sử dụng** vào asset của app (`mobile/assets/icons/`), ưu tiên chuyển đổi SVG sang React Native SVG components (hoặc export PNG theo density phù hợp) khi bắt đầu xây dựng màn hình.
  - Tuyệt đối **không copy toàn bộ thư mục `LungCT-Icons/`** vào bundle ứng dụng di động để tránh phình to kích thước cài đặt (.apk, .ipa).
- **Preview và Tài liệu kỹ thuật**:
  - Thư mục gốc `LungCT-Icons/` đóng vai trò là **nguồn thiết kế gốc (Design Asset Source)** phục vụ tra cứu, xem trước (preview) trên IDE/Figma/tài liệu kiến trúc và hướng dẫn sử dụng (`docs/user-guide/`).

### B. Bảng danh mục 48 Icon theo nhóm nghiệp vụ

| Nhóm nghiệp vụ | Danh sách Icon (Tên file) | Mục đích sử dụng dự kiến |
| :--- | :--- | :--- |
| **1. Khám phá & AI Lồng ngực** | `lung`, `ct-image`, `ct-stack`, `ai-analysis`, `grad-cam`, `on-device`, `server-analysis` | Biểu tượng lá phổi, lát cắt CT, chuỗi ảnh CT (stack), kích hoạt AI suy luận, bản đồ nhiệt Grad-CAM, chế độ on-device offline / server |
| **2. Điều khiển ảnh Y tế** | `zoom-in`, `zoom-out`, `reset-view`, `opacity`, `image-compare`, `image-replace`, `image-upload`, `camera` | Phóng to, thu nhỏ, đặt lại khung nhìn lát cắt, chỉnh độ trong suốt lớp nhiệt CAM, so sánh ảnh gốc và heat map, tải/chụp ảnh |
| **3. Quản lý Hồ sơ & Ca bệnh** | `cases`, `case-add`, `case-complete`, `patients`, `patient-add`, `medical-notes`, `draft`, `pdf-export` | Danh sách ca khám, tạo ca mới, hoàn tất chẩn đoán, quản lý bệnh nhân, ghi chú bệnh án bác sĩ, lưu nháp, xuất báo cáo PDF |
| **4. Đồng bộ & Mạng** | `offline`, `sync`, `sync-error`, `download`, `restore` | Trạng thái ngoại tuyến (offline-first), đồng bộ Firestore, lỗi đồng bộ, tải mô hình/dữ liệu, khôi phục ca khám |
| **5. Trạng thái & Phản hồi** | `success`, `warning`, `error`, `processing` | Thông báo thành công, cảnh báo phát hiện ác tính (Malignant), báo lỗi suy luận, chỉ báo đang xử lý tiền xử lý/AI |
| **6. Điều hướng & Hệ thống** | `home`, `search`, `filter`, `settings`, `profile`, `notifications`, `share`, `save`, `trash`, `lock`, `unlock`, `logout`, `account-approval`, `more`, `edit`, `statistics` | Menu chính, tìm kiếm bệnh nhân, lọc phân loại, cấu hình hệ thống, tài khoản bác sĩ, phê duyệt tài khoản, thống kê ca bệnh |

---

## 4. Nguyên tắc tích hợp cho các giai đoạn sau
1. **Giữ nguyên thư mục gốc**: Không đổi tên, không di chuyển, không xóa tệp trong `LungCT-Icons/`.
2. **Tối ưu hóa asset ứng dụng**: Khi dựng màn hình (UI), chỉ trích xuất các icon được chỉ định vào `mobile/`, không đóng gói tài nguyên dư thừa.
3. **Thống nhất phong cách**: Giữ nguyên triết lý nét viền `#4D5048` và dải màu bổ trợ duo-tone y tế để toàn bộ giao diện Android và iOS đạt độ nhất quán và chuyên nghiệp cao.
