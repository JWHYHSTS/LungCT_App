# BIÊN BẢN TIẾP NHẬN ĐẦU VÀO VÀ ĐỐI CHIẾU TÀI LIỆU KHÓA LUẬN LUNGCT

**Thời điểm lập**: 24/10/2026  
**Phạm vi**: Ghi nhận toàn bộ tài nguyên đầu vào đã đưa vào workspace `c:\Users\thudi\OneDrive\Desktop\LungCT_Workspace`, đối chiếu yêu cầu kỹ thuật và đề xuất các bước triển khai tiếp theo.  
**Lưu ý**: Biên bản này chỉ là tài liệu tiếp nhận, kiểm kê và đối chiếu kỹ thuật; **không thay thế** bản đặc tả chức năng ứng dụng toàn diện (`LumaCT_DacTa`).

---

## 1. BẢNG KIỂM KÊ TÀI LIỆU VÀ TÀI NGUYÊN ĐẦU VÀO THỰC TẾ

| STT | Tên tệp & Đường dẫn tương đối | Vai trò trong dự án | Phần đã đọc / Khả năng tiếp cận | Nội dung quan trọng / Vấn đề kỹ thuật cần xử lý |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `LungCT_LamViecRieng/huong_dan_antigravity/Huong_dan_Antigravity.docx` | Tài liệu hướng dẫn phương pháp làm việc cá nhân của tác giả (v2.0, 24/10/2026). | Đã đọc toàn bộ 385 đoạn văn và 4 bảng biểu thông qua parser chuyên dụng. | - Quy định chu trình khép kín 9 bước sau mỗi lệnh.<br>- Ma trận 25 mã yêu cầu (INIT-001, NAM, AI-DATA, AI-MOB, AI-CAM, SEC, OFF, SYNC, FR-PAT, FR-CASE, FR-PDF, FR-STAT, FR-NOTI, FR-UX, JOB, THS, GIT).<br>- Yêu cầu phân chia tập dữ liệu 70/15/15, giữ cố định seed và manifest.<br>- Yêu cầu cập nhật đồng bộ cả hai báo cáo khóa luận khi có thay đổi nghiệp vụ/kỹ thuật. |
| **2** | `docs/architecture/LungCT_KienTruc.drawio` (trong `LungCT_DoAn`) | Sơ đồ kiến trúc tổng thể hệ thống 4 tầng và phân hệ Android / iOS. | Đã giải mã và đọc trọn vẹn toàn bộ 4 trang XML/mxGraphModel, bao gồm các khối, nhãn văn bản và các đường liên kết (edges/connectors). | - **Trang 1**: Tổng quan 4 tầng (Thiết bị di động, Mạng/Bảo mật, Máy chủ FastAPI, Firebase).<br>- **Trang 2**: Cấu trúc ứng dụng React Native (shared core, platform adapters, state, offline DB).<br>- **Trang 3**: Luồng xác thực trực tuyến/cục bộ, phân quyền bác sĩ/admin, đồng bộ Firestore và dọn dẹp bảo mật khi bị khóa.<br>- **Trang 4**: Phân chia chi tiết hai đề tài tốt nghiệp (Android: Dương Hải Đăng, iOS: Dương Hải Đăng) và chu trình 7 bước sau mỗi lệnh. |
| **3** | `docs/architecture/LungCT_Pipeline.drawio` (trong `LungCT_DoAn`) | Sơ đồ đường ống mô hình học sâu, đóng gói, chuyển đổi edge AI và luồng sử dụng app. | Đã giải mã và đọc trọn vẹn toàn bộ 5 trang XML/mxGraphModel, bao gồm các khối, nhãn văn bản và các đường liên kết (edges/connectors). | - **Trang 1**: Pipeline huấn luyện và xuất mô hình nghiên cứu (ResNet50 + ViT-B/16 CLS token conditioning).<br>- **Trang 2**: Đóng gói Primary FP32 và đánh giá ứng viên nhẹ LightCandidate FP16.<br>- **Trang 3**: Quy trình khảo sát và chuyển đổi mô hình on-device (đang ở trạng thái `[CHƯA LÀM]`).<br>- **Trang 4**: Luồng nghiệp vụ bác sĩ chụp/chọn ảnh, phân tích cục bộ/máy chủ, xem Grad-CAM, lưu nháp, hoàn tất ca.<br>- **Trang 5**: Bảng so sánh khách quan giữa suy luận cục bộ (Local) và máy chủ (Server). |
| **4** | `ai/notebooks/LungCT_Reproduction_Improved.ipynb` (trong `LungCT_DoAn`) | Notebook Google Colab thực nghiệm tái lập và cải tiến mô hình Adaptive AACNN-ViT. | Đã đọc trọn vẹn toàn bộ 49 cell (22 code cells, 27 markdown cells) gồm mã nguồn, thuật toán, các hàm builder, custom layer và pipeline tiền xử lý. | - Bản tệp notebook này không lưu kèm output thực thi (mảng outputs rỗng ở cả 22 cell code); điều này phản ánh hiện trạng lưu trữ của tệp, không dùng để kết luận về việc mô hình đã huấn luyện hay chưa.<br>- Kiến trúc chi tiết: Nhánh CNN dùng ResNet50 trích xuất đặc trưng + Nhánh ViT dùng google/vit-base-patch16-224-in21k trích xuất vector CLS 768-d + Lớp Adaptive AACNN Fusion kết hợp hai nhánh ra phân phối xác suất 3 lớp: `[0: Benign, 1: Malignant, 2: Normal]`.<br>- Thuật toán Grad-CAM: Tính gradient của điểm số lớp mục tiêu trên lớp Conv cuối của ResNet50 khi cố định vector CLS của ViT.<br>- Đóng gói: Kèm script xuất gói Primary (FP32) và nhánh xuất thử nghiệm ứng viên nhẹ LightCandidate (ViT lưu FP16). |
| **5** | `ai/models/source/primary/LungCT_Primary_20261024T050904_329781Z.zip` | Gói mô hình chính (Primary FP32). | Đã kiểm tra metadata tệp và tính toán mã băm SHA256 thực tế. | - Dung lượng: **923,085,894 bytes** (~880.3 MB).<br>- Tệp SHA256 đi kèm: `LungCT_Primary_20261024T050904_329781Z.zip.sha256`.<br>- Kết quả xác thực: **Khớp tuyệt đối 100%** (`3105A53E1D32E5A919CAA28F70D4A468A7D942E984593B25C4FB602A27ECD7C7`).<br>- Chưa giải nén, giữ nguyên gói gốc để đối chiếu. |
| **6** | `ai/models/source/light_candidate/LungCT_LightCandidate_20261024T050904_329781Z.zip` | Gói mô hình ứng viên nhẹ (LightCandidate FP16). | Đã kiểm tra metadata tệp và tính toán mã băm SHA256 thực tế. | - Dung lượng: **748,843,876 bytes** (~714.1 MB).<br>- Tệp SHA256 đi kèm: **Chưa có sẵn tệp .sha256 đi kèm**.<br>- Mã SHA256 tự tính toán để ghi nhận: `E60628BB6E29D3B791D6AB2B86DAF00379EFDEB2DF5D1ADA0A90F141BC7881B0`.<br>- Đây là phương án nghiên cứu so sánh làm nhẹ; không tự ý dùng thay thế gói Primary. |
| **7** | `LungCT-Icons/` (trong `LungCT_DoAn`) | Bộ icon đồ họa chuẩn gồm 144 tệp (48 svg, 48 png-32px, 48 png-64px). | Đã kiểm kê và lập đặc tả chi tiết tại `docs/requirements/LungCT_Icons_DacTa.md`. | - Đầy đủ 48 icon y tế theo phong cách mềm duo-tone viền `#4D5048`.<br>- Giữ nguyên cấu trúc gốc, không tự ý copy toàn bộ sang app. |
| **8** | Đề cương chi tiết Android và iOS | Đề cương thuyết minh đề tài tốt nghiệp của hai sinh viên. | Đã quét đệ quy toàn bộ thư mục trong workspace (`LungCT_Workspace`, `LungCT_DoAn`, `LungCT_LamViecRieng`). | **Chưa tìm thấy tệp đề cương trong toàn bộ phạm vi workspace**. Thư mục `reports/android/` và `reports/ios/` hiện chỉ có `.gitkeep`. |
| **9** | `docs/requirements/LungCT_DacTa_ChucNang.docx` | Bản đặc tả chức năng ứng dụng toàn diện (v0.1, 24/10/2026). | Đã đọc và phân tích cấu trúc qua parser chuyên dụng (4.377 đoạn văn). | - Nguồn yêu cầu nghiệp vụ cao nhất của dự án.<br>- Đầy đủ 12 nhóm chức năng: AUTH, ADM, HOME, PAT, CASE, AI, TRS, PDF, STA, NOT, SYN, SET.<br>- 27 mã màn hình chuẩn (`SCR-`), quy tắc nghiệp vụ (`BR-`), thông điệp (`MSG-`), và 27 câu hỏi mở (`Q-01` .. `Q-27`). |
| **10** | `docs/ui_handoff/` (trong `LungCT_DoAn`) | Bộ bàn giao giao diện (UI Handoff Kit) và tài liệu đặc tả UI/UX (`LungCT_DacTa_UIUX.docx`). | Đã tiếp nhận đầy đủ tài nguyên cục bộ và liên kết Figma trực tuyến. | - Liên kết Figma: `https://www.figma.com/design/A2e74JAAzntE0zUesryOlF`.<br>- 59 khung màn hình, 31 nhóm component, 48 design token màu, 64 icon chuẩn, từ điển song ngữ `vi.json`/`en.json`, cây bố cục `layout-json` của 17 màn hình chuẩn.<br>- Mã nguồn Theme TypeScript hoàn chỉnh đã kiểm thử 32/32 tests.<br>- Bộ 10 câu lệnh triển khai Antigravity (`00-cach-dung.md` đến `09-toi-tieng-anh-kiem-tra-cuoi.md`). |

---

## 2. KẾT QUẢ ĐỐI CHIẾU YÊU CẦU KỸ THUẬT

Từ việc đối chiếu hướng dẫn `Huong_dan_Antigravity.docx`, hai sơ đồ `LungCT_KienTruc.drawio`, `LungCT_Pipeline.drawio` và `LungCT_Reproduction_Improved.ipynb`:

### A. Mục tiêu và Phạm vi cốt lõi
- Xây dựng ứng dụng di động hỗ trợ bác sĩ chẩn đoán ảnh CT lồng ngực với 3 phân lớp mục tiêu: **Benign (Lành tính)**, **Malignant (Ác tính)**, **Normal (Bình thường)**.
- Kết hợp giải thích quyết định bằng bản đồ nhiệt thị giác **Grad-CAM** làm nổi bật vùng tổn thương nghi ngờ trên lát cắt CT.
- Phân định rõ ràng trách nhiệm đề tài khóa luận:
  - **Đề tài hiện hành (Dương Hải Đăng — MSSV: 49.01.103.020)**: Trọng tâm phát triển, tối ưu on-device edge AI, Grad-CAM offline và trải nghiệm người dùng y tế trên hệ điều hành Android (ứng dụng LungCT).
  - **Hồ sơ tham khảo lịch sử (Phân hệ iOS)**: Được lưu trữ nguyên trạng tại `reports/ios/` để tham khảo quá trình nghiên cứu trước đây.

### B. Yêu cầu Suy luận On-Device và Grad-CAM
- **Nguyên tắc bắt buộc**: Ứng dụng di động phải có khả năng suy luận mô hình và kết xuất Grad-CAM **hoàn toàn ngoại tuyến (offline)**: tắt Wifi, tắt 4G/5G, rút cáp USB và tắt máy chủ Metro Bundler.
- Tuyệt đối không dùng kết quả giả lập (mock), server trung gian hoặc ảnh nhiệt sinh sẵn để thay thế cho yêu cầu xử lý cục bộ.
- **Rủi ro kỹ thuật chính**: Các gói nguồn hiện tại (`.zip`, `.keras`, `.h5`) **không thể tự chạy trực tiếp trong React Native**. Cần có bước khảo sát và chuyển đổi sang runtime thích hợp (TFLite, ONNX Runtime, ExecuTorch...) đảm bảo thực thi được cả hai nhánh (CNN + ViT) và tính toán gradient cho Grad-CAM on-device.

### C. Luồng xử lý Cục bộ, Máy chủ và Đồng bộ
- **Local-first**: Mọi thao tác tạo bệnh nhân, tạo ca, chụp/chọn ảnh, lưu nháp, xuất kết quả và xem Grad-CAM phải hoạt động mượt mà khi mất mạng. Dữ liệu lưu trong cơ sở dữ liệu cục bộ SQLite mã hóa.
- **Máy chủ FastAPI**: Đóng vai trò là phương án suy luận bổ trợ (Server-side analysis) khi thiết bị yếu hoặc khi bác sĩ yêu cầu đối chứng; không thay thế cho yêu cầu suy luận cục bộ.
- **Xác thực & Đồng bộ**: Dùng Firebase Auth và Firestore để đồng bộ ca khám, phân quyền bác sĩ (chỉ xem ca của mình) và quản trị viên (duyệt/khóa tài khoản).

---

## 3. CÁC ĐIỂM THỐNG NHẤT, MÂU THUẪN VÀ THÔNG TIN CÒN THIẾU

### A. Những điểm đã thống nhất tuyệt đối
1. Cấu trúc tổ chức: `LungCT_DoAn` là dự án độc lập, khép kín, sẵn sàng bàn giao; không phụ thuộc vào `LungCT_LamViecRieng`.
2. Mô hình chính: Kiến trúc **Adaptive AACNN-ViT** (kết hợp ResNet50 và ViT-B/16). Giữ nguyên gói nguồn ZIP và SHA256 gốc.
3. Thứ tự nhãn lớp chuẩn: `[0: Benign, 1: Malignant, 2: Normal]`.
4. Quy chuẩn quản lý mã nguồn, đặt tên tiếng Anh, comment tiếng Việt, bảo mật y tế không ghi log dữ liệu nhạy cảm của bệnh nhân.

### B. Những thông tin / tệp còn thiếu ở bước hiện tại
1. **Đề cương khóa luận hai phân hệ Android và iOS**: Chưa có trong toàn bộ phạm vi workspace (thư mục `reports/android/` và `reports/ios/` hiện chỉ có `.gitkeep`).
2. **Hai bản thảo báo cáo khóa luận**: Chưa có bản thảo trong workspace (sẽ cập nhật liên tục song song trong quá trình triển khai khi có bản thảo).
3. **Tệp Checksum cho gói LightCandidate**: Gói `LungCT_LightCandidate_20261024T050904_329781Z.zip` chưa có tệp `.sha256` đi kèm; mã SHA256 đã được AI tính toán và lưu vết tại biên bản này.
4. **Hiện trạng output của notebook**: Bản notebook `LungCT_Reproduction_Improved.ipynb` không lưu output thực thi; các chỉ số thực nghiệm cụ thể sẽ được đo đạc khi chạy pipeline.

---

## 4. QUẢN LÝ TỆP LỚN (GIT LFS) CHO CÁC GÓI MÔ HÌNH NGUỒN

Hai gói mô hình nguồn trong `ai/models/source/`:
- `LungCT_Primary_...zip`: ~880.3 MB
- `LungCT_LightCandidate_...zip`: ~714.1 MB

**Khuyến nghị quản lý**:
- Tuyệt đối **không stage hai tệp ZIP này vào Git thông thường**, vì Git thông thường không được thiết kế cho các tệp nhị phân trên 100 MB (gây phình kho, lỗi push lên GitHub).
- Giải pháp: Khởi tạo cấu hình Git LFS bằng cách theo dõi tệp `.zip` trong `ai/models/source/` thông qua `.gitattributes` (`git lfs track "ai/models/source/**/*.zip"`), hoặc đưa hai tệp ZIP vào `.gitignore` để lưu trữ cục bộ kèm tệp manifest và mã băm SHA256 đối chứng độc lập trong kho mã.

---

## 5. ĐỀ XUẤT THỨ TỰ CÔNG VIỆC TIẾP THEO

1. **Bước 1**: Tiếp nhận và hoàn tất ghi nhận liên kết Figma, bộ kit `docs/ui_handoff/` và tài liệu đặc tả chức năng `docs/requirements/LungCT_DacTa_ChucNang.docx` (Hoàn thành ở lệnh hiện tại).
2. **Bước 2**: Thiết lập cấu hình `ui-decisions.ts` cho các điểm mở Q-xx và khởi tạo thư mục ứng dụng di động `mobile/` theo lệnh `01-theme.md` của bộ handoff khi người dùng chỉ đạo.
3. **Bước 3**: Khảo sát tính khả thi của runtime edge AI trên di động (đảm bảo chạy được cả classification và Grad-CAM) trước khi kết nối sâu vào logic ca khám.
4. **Bước 4**: Triển khai tuần tự các bước UI-01 đến UI-09 trong `docs/ui_handoff/ANTIGRAVITY/`, kiểm thử và thu thập minh chứng `evidence/` theo từng bước.
5. **Bước 5**: Cập nhật liên tục hai báo cáo khóa luận ngay khi có bản thảo từ nhóm nghiên cứu.
