# Dự Án Khóa Luận Tốt Nghiệp: Ứng Dụng Hỗ Trợ Phân Tích Ảnh CT Phổi (LungCT)

## 1. Giới thiệu tổng quan
Dự án khóa luận **LungCT** tập trung vào việc nghiên cứu, xây dựng và đánh giá hệ thống hỗ trợ phân tích ảnh chụp cắt lớp vi tính lồng ngực (Chest CT) phục vụ sàng lọc tổn thương phổi với 3 phân lớp mục tiêu:
1. **Benign** (Tổn thương lành tính)
2. **Malignant** (Tổn thương ác tính / Ung thư phổi)
3. **Normal** (Nhu mô phổi bình thường)

Hệ thống kết hợp giữa nghiên cứu mô hình học sâu kết hợp cơ chế chú ý thích ứng (**Adaptive AACNN-ViT**) cùng kỹ thuật giải thích quyết định bằng bản đồ nhiệt thị giác (**Grad-CAM**), mang lại khả năng suy luận cục bộ độc lập ngay trên thiết bị di động (on-device edge AI).

---

## 2. Kiến trúc giải pháp & Hai phân hệ nền tảng
Hệ thống được thiết kế phân tầng chuyên biệt gồm:
- **Phần dùng chung (Shared Core & Services)**:
  - Lõi tiền xử lý ảnh CT chuẩn y khoa (chuẩn hóa kích thước, cường độ Hounsfield Unit / dải xám, tensor đầu vào).
  - Kiến trúc đường ống (pipeline) suy luận, bộ ánh xạ nhãn lớp, logic tính toán Grad-CAM và hợp nhất bản đồ nhiệt.
  - Bộ kiểm thử dùng chung (`tests/shared/`) và minh chứng đánh giá chung (`evidence/shared/`).
- **Phân hệ Android (Phụ trách: Dương Thị Thu Diểm)**:
  - Ứng dụng di động trên nền tảng Android (kiểm thử trọng tâm trên thiết bị thực tế Redmi 13).
  - Tối ưu hóa runtime suy luận on-device trên Android, kiểm soát mức tiêu hao RAM, độ trễ và Grad-CAM offline hoàn toàn.
  - Báo cáo khóa luận Android đặt tại: `reports/android/`.
- **Phân hệ iOS (Phụ trách: Dương Hải Đăng)**:
  - Ứng dụng di động trên nền tảng iOS (kiểm thử trọng tâm trên thiết bị iPhone thực tế được cấp phát).
  - Tối ưu hóa pipeline suy luận và render trực quan Grad-CAM on-device tương thích hệ sinh thái iOS, đo lường năng lượng và thời gian phản hồi.
  - Báo cáo khóa luận iOS đặt tại: `reports/ios/`.

---

## 3. Cấu trúc thư mục của LungCT_DoAn

```text
LungCT_DoAn/
├── README.md               # Tài liệu giới thiệu khung đồ án, quy chuẩn và vị trí dữ liệu
├── AGENTS.md               # Quy định bắt buộc cho AI Agent và quy trình phát triển
├── .gitignore              # Cấu hình loại trừ tệp tạm, dependencies, secrets và build
│
├── mobile/                 # Mã nguồn ứng dụng di động (React Native + TypeScript)
├── backend/                # Dịch vụ backend hỗ trợ (FastAPI)
│
├── ai/                     # Nghiên cứu mô hình, chuyển đổi & đánh giá AI
│   ├── notebooks/          # Notebook Colab phục vụ train, validate và export
│   ├── models/
│   │   ├── source/         # Gói mô hình nguồn nén gốc (.zip, .sha256)
│   │   │   ├── primary/
│   │   │   └── light_candidate/
│   │   └── extracted/      # Trọng số giải nén khi được giao tích hợp
│   │       ├── primary/
│   │       └── light_candidate/
│   ├── conversion/         # Script và công cụ chuyển đổi mô hình sang runtime mobile
│   ├── evaluation/         # Script đo đạc, ma trận nhầm lẫn, metrics, benchmark
│   └── manifests/          # Tệp manifest quản lý Run ID, checksum, split, kết quả test
│
├── infra/                  # Cấu hình hạ tầng
│   └── firebase/           # Cấu hình dịch vụ Firebase theo đặc tả
│
├── LungCT-Icons/           # Bộ icon đồ họa chuẩn của hệ thống (48 icons: svg, png-32px, png-64px)
│   ├── png-32px/           # Bitmap 32x32 px
│   ├── png-64px/           # Bitmap 64x64 px
│   └── svg/                # Vector SVG gốc phong cách duo-tone y tế
│
├── docs/                   # Tài liệu kỹ thuật dự án
│   ├── requirements/       # Đặc tả chức năng, yêu cầu khóa luận (ví dụ: LumaCT_DacTa, LungCT_Icons_DacTa)
│   ├── architecture/       # Sơ đồ kiến trúc (LungCT_KienTruc.drawio, LungCT_Pipeline.drawio)
│   ├── api/                # Đặc tả API backend
│   ├── setup/              # Hướng dẫn thiết lập môi trường
│   ├── user-guide/         # Sổ tay hướng dẫn người dùng
│   └── references/         # Nguồn tham khảo, bài báo, dataset chính thức
│
├── reports/                # Báo cáo khóa luận tốt nghiệp
│   ├── android/            # Báo cáo của sinh viên Dương Thị Thu Diểm
│   └── ios/                # Báo cáo của sinh viên Dương Hải Đăng
│
├── tests/                  # Bộ mã kiểm thử tự động
│   ├── shared/             # Kiểm thử dùng chung (preprocessing, mapping, logic)
│   ├── android/            # Kiểm thử chuyên biệt phân hệ Android
│   ├── ios/                # Kiểm thử chuyên biệt phân hệ iOS
│   ├── backend/            # Kiểm thử API backend
│   └── ai/                 # Kiểm thử tính nhất quán của mô hình và CAM
│
├── evidence/               # Minh chứng kiểm thử thực tế và số đo thực nghiệm
│   ├── shared/
│   ├── android/            # Log, ảnh chụp màn hình, benchmark Redmi 13
│   └── ios/                # Log, ảnh chụp màn hình, benchmark iPhone thực tế
│
└── release/                # Bản đóng gói phát hành
    ├── android/
    └── ios/
```

---

## 4. Phân biệt các tầng mô hình AI

Dự án phân biệt rạch ròi 3 trạng thái của mô hình để đảm bảo tính toàn vẹn nghiên cứu và tối ưu hiệu năng:
1. **Gói mô hình nguồn (`ai/models/source/`)**:
   - Lưu trữ các tệp `.zip` và mã băm xác thực `.sha256` nguyên bản thu được từ Colab/nghiên cứu.
   - Luôn giữ nguyên tệp gốc để đối chiếu, không chỉnh sửa trực tiếp bên trong.
2. **Mô hình giải nén (`ai/models/extracted/`)**:
   - Chỉ được giải nén khi có lệnh giao tích hợp rõ ràng.
   - Chứa trọng số, cấu hình kiến trúc, custom layers và processor dùng cho backend hoặc pipeline chuyển đổi.
3. **Artifact chạy trên điện thoại (`mobile/assets/models/`)**:
   - Định dạng runtime tối ưu hóa cho on-device edge AI (sẽ được tạo và kiểm chứng tại các bước triển khai tiếp theo).
   - **Lưu ý**: Tệp ZIP, `.keras`, hay `.h5` **không phải** là artifact tự chạy trực tiếp được trong React Native. Không đóng gói toàn bộ trọng số nghiên cứu khổng lồ vào bản cài di động.

---

## 5. Nguyên tắc độc lập và cô lập dự án
- `LungCT_DoAn` là dự án độc lập, hoàn chỉnh, tự chứa đựng đầy đủ thành phần cần thiết để xây dựng, vận hành, kiểm thử và bàn giao.
- Không chứa bất kỳ liên kết, đường dẫn tương đối, symlink hay phụ thuộc nào sang thư mục làm việc riêng bên ngoài (`LungCT_LamViecRieng`).
- Mọi hướng dẫn phát triển và quy tắc cốt lõi được lưu trữ tại [`AGENTS.md`](AGENTS.md).

---

## 6. Trạng thái hiện tại & Hướng dẫn bổ sung tài liệu
Khung dự án hiện đang ở bước **khởi tạo cấu trúc nền móng**. Chưa có mã nguồn ứng dụng hay mô hình giả lập nào được tạo.

### Danh mục tệp cần tự bổ sung vào `LungCT_DoAn`:
1. **Đặc tả yêu cầu & chức năng**: Đặt tệp `LumaCT_DacTa.docx` (hoặc `.md`) vào [`docs/requirements/`](docs/requirements/).
2. **Sơ đồ kiến trúc & pipeline**: Đặt `LungCT_KienTruc.drawio` và `LungCT_Pipeline.drawio` vào [`docs/architecture/`](docs/architecture/).
3. **Notebook nghiên cứu**: Đặt notebook Colab huấn luyện và trích xuất vào [`ai/notebooks/`](ai/notebooks/).
4. **Mô hình nguồn chính**: Đặt `LungCT_Primary_20261024T050904_329781Z.zip` và `.sha256` vào [`ai/models/source/primary/`](ai/models/source/primary/).
5. **Mô hình ứng viên nhẹ**: Đặt `LungCT_LightCandidate_20261024T050904_329781Z.zip` vào [`ai/models/source/light_candidate/`](ai/models/source/light_candidate/).
6. **Báo cáo Android**: Đặt bản báo cáo của Dương Thị Thu Diểm vào [`reports/android/`](reports/android/).
7. **Báo cáo iOS**: Đặt bản báo cáo của Dương Hải Đăng vào [`reports/ios/`](reports/ios/).
8. **Tài liệu tham khảo**: Đặt các bài báo, liên kết, dataset paper chính thức vào [`docs/references/`](docs/references/).

> Các lệnh cài đặt môi trường, chạy demo, kiểm thử tự động và build release sẽ được cập nhật cụ thể vào README này sau khi từng cấu phần được xây dựng và kiểm chứng thực tế.
