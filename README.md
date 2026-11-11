# Dự Án Khóa Luận Tốt Nghiệp: Ứng Dụng Chẩn Đoán Ung Thư Phổi Trên Thiết Bị Di Động (LungCT)

> **Thông tin đề tài khóa luận**:
>
> - **Tên đề tài**: Phát triển ứng dụng chẩn đoán ung thư phổi trên thiết bị di động
> - **Sinh viên thực hiện**: **DƯƠNG HẢI ĐĂNG** — MSSV: **49.01.103.020**
> - **Ngành đào tạo**: Sư phạm Tin học (Khóa 49, Niên khóa 2026 – 2027) — Trường Đại học Sư phạm Thành phố Hồ Chí Minh
> - **Giảng viên hướng dẫn**: **ThS. TRỊNH HUY HOÀNG**
> - **Tên ứng dụng**: **LungCT** (Android App)
> - **Repository**: `LungCT_App` (GitHub: Dương Hải Đăng)

---

## 1. Giới thiệu tổng quan

Dự án khóa luận **LungCT** tập trung vào việc nghiên cứu, xây dựng và đánh giá ứng dụng di động hỗ trợ chẩn đoán ung thư phổi từ ảnh chụp cắt lớp vi tính lồng ngực (Chest CT) với 3 phân lớp mục tiêu:

1. **Benign** (Tổn thương lành tính)
2. **Malignant** (Tổn thương ác tính / Ung thư phổi)
3. **Normal** (Nhu mô phổi bình thường)

Hệ thống triển khai mô hình học sâu lai kết hợp cơ chế chú ý thích ứng (**Adaptive AACNN-ViT**) cùng kỹ thuật giải thích quyết định bằng bản đồ nhiệt thị giác (**Grad-CAM**), mang lại khả năng suy luận cục bộ độc lập ngay trên thiết bị di động Android (**On-Device Edge AI**).

---

## 2. Kiến trúc giải pháp & Phạm vi triển khai

Hệ thống được thiết kế theo kiến trúc **On-Device Edge AI kết hợp Dịch vụ Đám mây (Firebase)**:

- **Tầng ứng dụng di động Android (React Native + TypeScript)**:
  - Giao diện người dùng sạch sẽ, tuân thủ Design System y tế với 48 icon đồ họa chuẩn từ `LungCT-Icons/`.
  - Nghiệp vụ dành cho hai tác nhân: **Bác sĩ** (quản lý bệnh nhân, ca bệnh, chụp/chọn ảnh CT, xem kết quả phân loại, xuất phiếu PDF) và **Quản trị viên** (quản lý tài khoản, phân quyền, thống kê).
  - Hỗ trợ song ngữ (Việt - Anh) và giao diện Sáng / Tối / Theo hệ thống.
- **Tầng suy luận AI On-Device (Native Kotlin / C++)**:
  - Tiền xử lý ảnh (Nearest Resampling ma trận Float32 chuẩn ImageNet) chạy trực tiếp trên thiết bị.
  - Runtime kép: **ONNX Runtime Mobile** (trích xuất token CLS 768 chiều từ Vision Transformer) và **Google LiteRT (TensorFlow Lite)** (mô hình Adaptive Fusion phân loại 3 lớp).
  - **Hoạt động hoàn toàn ngoại tuyến (Offline-First)**: Không gửi ảnh CT của bệnh nhân về máy chủ để suy luận hoặc sinh Grad-CAM.
- **Tầng Dịch vụ Đám mây (Firebase)**:
  - **Firebase Authentication**: Quản lý phiên làm việc, đăng nhập/đăng ký, quên mật khẩu và phân quyền.
  - **Cloud Firestore**: Đồng bộ danh mục bệnh nhân, ca chẩn đoán và quản lý trạng thái tài khoản.
  - **Cloud Storage**: Lưu trữ an toàn ảnh hồ sơ và phiếu báo cáo khi người dùng trực tuyến.
  - **Firebase Cloud Messaging**: Gửi thông báo đẩy về các sự kiện ca bệnh và trạng thái tài khoản.

---

## 3. Cấu trúc thư mục của LungCT_App

```text
LungCT_App/
├── README.md               # Tài liệu giới thiệu tổng quan, quy chuẩn và kiến trúc
├── AGENTS.md               # Quy định bắt buộc cho AI Agent và quy trình phát triển
├── .gitignore              # Cấu hình loại trừ tệp tạm, dependencies, secrets và build
│
├── mobile/                 # Mã nguồn ứng dụng di động Android (React Native + TypeScript)
│   ├── android/            # Thư mục build native Android
│   ├── native-templates/   # Bản mẫu cấu hình & mã nguồn native Kotlin bảo toàn trong Git
│   ├── assets/             # Biểu tượng, phông chữ và tài nguyên đồ họa (icon chính thức)
│   └── src/                # Mã nguồn logic, giao diện, dịch vụ và kiểm thử
│
├── ai/                     # Nghiên cứu mô hình, chuyển đổi & đánh giá AI
│   ├── notebooks/          # Notebook Colab tái lập và cải tiến mô hình
│   ├── models/             # Gói mô hình nguồn nén (.zip, .sha256) và mô hình giải nén
│   ├── conversion/         # Script chuyển đổi mô hình sang ONNX và LiteRT
│   └── manifests/          # Manifests quản lý split, cấu hình và kết quả đánh giá
│
├── infra/                  # Cấu hình hạ tầng đám mây (Firebase Security Rules, Firestore schemas)
│
├── LungCT-Icons/           # Bộ icon đồ họa chuẩn của hệ thống (48 icons duo-tone y tế)
│
├── docs/                   # Tài liệu kỹ thuật dự án
│   ├── requirements/       # Đề cương chi tiết và biên bản tiếp nhận đầu vào
│   ├── architecture/       # Sơ đồ kiến trúc hệ thống và pipeline On-Device (.drawio)
│   └── learning/           # Hướng dẫn tự code, bảng đối chiếu đề cương, ghi chú kỹ thuật
│
├── reports/                # Báo cáo khóa luận tốt nghiệp
│   └── android/            # Báo cáo khóa luận 5 chương của Dương Hải Đăng
│
├── tests/                  # Bộ mã kiểm thử tự động (Unit test, Integration test)
├── evidence/               # Minh chứng kiểm thử thực tế và số đo thực nghiệm
└── release/                # Bản đóng gói phát hành (APK Release độc lập)
```

---

## 4. Phân biệt các tầng mô hình AI

Dự án phân biệt rạch ròi 3 trạng thái của mô hình để đảm bảo tính toàn vẹn nghiên cứu và tối ưu hiệu năng:

1. **Gói mô hình nguồn (`ai/models/source/`)**:
   - Lưu trữ các tệp `.zip` và mã băm xác thực `.sha256` nguyên bản thu được từ Colab/nghiên cứu.
   - Luôn giữ nguyên tệp gốc để đối chiếu, không chỉnh sửa trực tiếp bên trong.
   - **Quy tắc lưu trữ & bàn giao**: Do dung lượng lớn (> 700MB mỗi gói), các tệp ZIP mô hình được lưu trữ cục bộ trên ổ đĩa và được loại trừ trong `.gitignore`, không đi cùng qua `git clone` thông thường. Khi bàn giao dự án hoặc thiết lập môi trường làm việc mới, bắt buộc phải cung cấp kèm các tệp ZIP thật và đối chiếu tính toàn vẹn bằng tệp checksum `.sha256` tương ứng.
2. **Mô hình giải nén (`ai/models/extracted/`)**:
   - Chỉ được giải nén khi có lệnh giao tích hợp rõ ràng.
   - Chứa trọng số, cấu hình kiến trúc, custom layers và processor dùng cho backend hoặc pipeline chuyển đổi.
3. **Artifact chạy trên điện thoại (`mobile/assets/models/`)**:
   - Định dạng runtime tối ưu hóa cho on-device edge AI (sẽ được tạo và kiểm chứng tại các bước triển khai tiếp theo).
   - **Lưu ý**: Tệp ZIP, `.keras`, hay `.h5` **không phải** là artifact tự chạy trực tiếp được trong React Native. Không đóng gói toàn bộ trọng số nghiên cứu khổng lồ vào bản cài di động.

---

## 5. Nguyên tắc độc lập của dự án

- `LungCT` là dự án độc lập, hoàn chỉnh, tự chứa đựng đầy đủ thành phần cần thiết để xây dựng, vận hành, kiểm thử và bàn giao.
- Mọi hướng dẫn phát triển và quy tắc cốt lõi được lưu trữ tại [`AGENTS.md`](AGENTS.md).

---

## 6. Trạng thái tiếp nhận tài nguyên thực tế

Dự án đã hoàn tất việc **tiếp nhận và kiểm kê tài nguyên đầu vào**. Chi tiết đối chiếu kỹ thuật được ghi nhận tại [`docs/requirements/TiepNhan_DauVao.md`](docs/requirements/TiepNhan_DauVao.md).

### Hiện trạng tài nguyên đã có trong đồ án:

1. **Sơ đồ kiến trúc & pipeline**: Đã tiếp nhận đầy đủ tại [`docs/architecture/`](docs/architecture/) gồm `LungCT_KienTruc.drawio` (4 trang) và `LungCT_Pipeline.drawio` (5 trang).
2. **Notebook nghiên cứu**: Đã tiếp nhận `LungCT_Reproduction_Improved.ipynb` tại [`ai/notebooks/`](ai/notebooks/) (chứa 49 cell tái lập và cải tiến mô hình).
3. **Mô hình nguồn chính (Primary FP32)**: Đã tiếp nhận `LungCT_Primary_20261024T050904_329781Z.zip` (923 MB) kèm tệp xác thực `.sha256` khớp mã băm tuyệt đối tại [`ai/models/source/primary/`](ai/models/source/primary/).
4. **Mô hình ứng viên nhẹ (LightCandidate FP16)**: Đã tiếp nhận `LungCT_LightCandidate_20261024T050904_329781Z.zip` (748.8 MB) tại [`ai/models/source/light_candidate/`](ai/models/source/light_candidate/) (đã tự động ghi nhận mã băm SHA256).
5. **Bộ icon đồ họa chuẩn**: Đã tiếp nhận và lập đặc tả 48 icon y tế tại [`docs/requirements/LungCT_Icons_DacTa.md`](docs/requirements/LungCT_Icons_DacTa.md).
6. **Biên bản tiếp nhận kỹ thuật**: Đã tạo [`docs/requirements/TiepNhan_DauVao.md`](docs/requirements/TiepNhan_DauVao.md).

### Các tài liệu phục vụ đề tài khóa luận:

- **Bản thảo khóa luận tốt nghiệp**: Lưu trữ bản thảo khóa luận 5 chương của Dương Hải Đăng tại [`reports/android/khoa-luan-android.md`](reports/android/khoa-luan-android.md) theo đề cương chi tiết đã duyệt.
- **Tài liệu tham khảo và học liệu tự code**: Đặt tại [`docs/learning/`](docs/learning/).
