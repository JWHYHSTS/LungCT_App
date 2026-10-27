# BẢNG ĐỐI CHIẾU ĐIỀU CHỈNH ĐỀ CƯƠNG KHÓA LUẬN LUNGCT

## BỐI CẢNH & CĂN CỨ ĐIỀU CHỈNH
- **Đề cương gốc đã duyệt**: Đề cương khóa luận tốt nghiệp ngành Sư phạm Tin học (KLTN 2026-2027) của hai sinh viên **Dương Thị Thu Diễm** (Phân hệ Android, MSSV: 49.01.103.011) và **Dương Hải Đăng** (Phân hệ iOS, MSSV: 49.01.103.020), do **ThS. Trịnh Huy Hoàng** hướng dẫn.
- **Lý do điều chỉnh kỹ thuật**: Đề cương ban đầu được xây dựng theo mô hình suy luận tập trung trên máy chủ (Client - Server inference qua FastAPI + Firebase). Sau quá trình tiếp nhận tài nguyên và khảo sát môi trường y tế thực tế tại Việt Nam, đề tài được nâng cấp lên **Kiến trúc Trí tuệ Nhân tạo Biên (Edge AI / On-Device AI)** — cho phép mô hình học sâu chạy trực tiếp trên chip di động, chẩn đoán hoàn toàn ngoại tuyến (Offline-First) không cần Internet, đồng thời tham khảo định hướng thiết kế bảo vệ dữ liệu sức khỏe cá nhân (PII/PHI) theo các nguyên tắc an toàn thông tin y tế (chưa có chứng nhận hoặc kiểm định pháp lý lâm sàng/HIPAA).
- **Trạng thái phê duyệt**: **Đề xuất kỹ thuật đang chờ Giảng viên hướng dẫn (ThS. Trịnh Huy Hoàng) và Bộ môn/Khoa xem xét, xác nhận chính thức**. Tuyệt đối không tự ý coi các điều chỉnh này là đã được phê duyệt khi chưa có chữ ký/văn bản đồng thuận.

---

## 1. BẢNG ĐỐI CHIẾU NỘI DUNG ĐỀ CƯƠNG GỐC VÀ ĐỀ XUẤT ĐIỀU CHỈNH

| TT | Mục trong Đề cương gốc | Nội dung trong đề cương cũ (Client - Server) | Thay đổi đề xuất nâng cấp (Edge AI On-Device) | Căn cứ kỹ thuật & Nhu cầu thực tế | Trạng thái phê duyệt |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | **Tên đề tài & Mục tiêu chung** (Trang 1, 3) | "Xây dựng ứng dụng di động... tích hợp mô hình AACNN-ViT Adaptive vào máy chủ và cung cấp kết quả qua REST API" | "Xây dựng ứng dụng di động... **tích hợp mô hình học sâu AACNN-ViT Adaptive chạy trực tiếp trên thiết bị (On-Device AI)**, hỗ trợ chẩn đoán ngoại tuyến không phụ thuộc Internet; máy chủ giữ vai trò xác thực, lưu trữ dự phòng và đồng bộ đám mây" | Tránh phụ thuộc đường truyền mạng tại cơ sở y tế tuyến dưới; giảm chi phí duy trì GPU server; hạn chế truyền dữ liệu nhạy cảm ra ngoài thiết bị; đã chạy thực nghiệm suy luận phân loại FP32 trên Android Emulator x86_64 API 34. | ⚠️ **CẦN GVHD XÁC NHẬN** |
| **2** | **Kiến trúc hệ thống** (Trang 3, 4, 5) | Kiến trúc thuần Client - Server: Ứng dụng di động gửi ảnh CT lên FastAPI Backend; FastAPI chạy PyTorch suy luận rồi trả kết quả về app. | **Kiến trúc Hybrid / Edge-First (Offline-First)**: Pipeline suy luận phân loại chính chạy trực tiếp trên điện thoại bằng ONNX Runtime / LiteRT; Backend FastAPI đóng vai trò đồng bộ hai chiều, quản lý tài khoản trung tâm và suy luận dự phòng khi người dùng yêu cầu phân tích đám mây. | Quy định tại [`AGENTS.md`](../../AGENTS.md) và mốc kỹ thuật MOB-01/MOB-02; đo lường thời gian suy luận kỹ thuật trên môi trường giả lập (< 1600ms). | ⚠️ **CẦN GVHD XÁC NHẬN** |
| **3** | **Công nghệ suy luận AI** (Trang 4, 6) | Backend FastAPI, PyTorch trên server, sinh bản đồ nhiệt Grad-CAM bằng Autograd server. | **Chuyển đổi sang Runtime di động**: ONNX Runtime Mobile + Google LiteRT cho Android; khảo sát ONNX Runtime iOS / CoreML cho iOS; Thuật toán nội suy Pillow Nearest Resample chuẩn hóa trên thiết bị; nghiên cứu giải pháp Grad-CAM On-Device không Autograd (hiện tại tính năng Grad-CAM on-device đang ở mức nghiên cứu / mô phỏng UI, chưa hoàn thành on-device). | Mô hình gốc đã chuyển đổi thành công sang ONNX/LiteRT FP32; kiểm chứng chạy độc lập trên máy ảo Android x86_64 không cần Python runtime. | ⚠️ **CẦN GVHD XÁC NHẬN** |
| **4** | **Tầng lưu trữ dữ liệu** (Trang 4, 5, 6) | Lưu trữ trên Firebase Cloud Firestore và Cloud Storage; SQLite/AsyncStorage thông thường trên thiết bị. | **Tầng lưu trữ cục bộ bảo vệ dữ liệu (Repository Pattern)**: Thiết kế trừu tượng `ILocalStorageAdapter` bọc lưu trữ cục bộ, tích hợp mô-đun mã hóa dữ liệu nhạy cảm (AES-256-GCM / CryptoVault sandbox); định hướng nâng cấp lên SQLite mã hóa (SQLCipher) và quản lý khóa phần cứng (Android Keystore / iOS Keychain); cài đặt thuật toán bảo toàn dữ liệu nháp AUTH-08 khi tài khoản bị khóa. *(Lưu ý: Tích hợp SQLCipher native và Android Keystore native hiện là định hướng nâng cấp, chưa hoàn thành)*. | Tham khảo định hướng thiết kế bảo vệ dữ liệu cá nhân theo các nguyên tắc an toàn thông tin y tế (chưa có kiểm định/chứng nhận pháp lý lâm sàng hay HIPAA); đặc tả AUTH-08 trong [`LungCT_DacTa_ChucNang.docx`](../requirements/LungCT_DacTa_ChucNang.docx). | ⚠️ **CẦN GVHD XÁC NHẬN** |
| **5** | **Đo lường & Thực nghiệm** (Trang 5, 7) | Đánh giá độ chính xác (Accuracy, F1-score), thời gian phản hồi API mạng client-server trên thiết bị thật. | Bổ sung các chỉ số đo lường kỹ thuật Edge AI: **Thời gian tiền xử lý ảnh, thời gian suy luận kỹ thuật (On-Device inference latency - không gọi là độ trễ lâm sàng), bộ nhớ RAM chiếm dụng, độ nóng máy và mức tiêu hao pin** trên thiết bị vật lý đại diện (Android: Xiaomi Redmi 13; iOS: iPhone thực tế). | Đo kiểm hiệu năng thực tế của vi xử lý di động khi thực thi mô hình Vision Transformer. | ⚠️ **CẦN GVHD XÁC NHẬN** |
| **6** | **Cơ cấu chương khóa luận** (Trang 5, 6, 7) | 5 chương truyền thống (Chương 4 gộp cả Cài đặt máy chủ FastAPI, Firebase, Ứng dụng React Native, Thực nghiệm và So sánh). | **Giữ nguyên khung 5 chương chuẩn của đề cương**, trong đó Chương 4 tập trung vào hiện thực hóa suy luận On-Device và phân định rõ vai trò của dịch vụ đám mây; hoặc **đề xuất tách thành 6 chương** (tách riêng Chương Triển khai và Chương Đo lường/Thực nghiệm) nếu được GVHD cho phép. | Khung 5 chương giúp đồng bộ 100% với đề cương đã nộp Khoa CNTT. | ⚠️ **CẦN GVHD XÁC NHẬN** |

---

## 2. PHÂN ĐỊNH RÕ RÀNG VAI TRÒ CÔNG NGHỆ & TRẠNG THÁI TÍNH NĂNG

Nhằm đảm bảo tính chính xác khoa học và không gây hiểu lầm cho Hội đồng chấm khóa luận, hệ thống phân định tuyệt đối giữa hai nhóm chức năng và ghi rõ trạng thái triển khai:

### A. Chức năng chạy On-Device (Ngoại tuyến - Không cần Internet)
- **Tải ảnh CT từ máy** (Đã chạy trên Android): Chọn ảnh lát cắt từ bộ nhớ máy (`content://` trên Android qua System Photo Picker).
- **Tiền xử lý ảnh** (Đã chạy trên Android): Chuẩn hóa kích thước `224x224` bằng thuật toán Pillow Nearest Resample, chuẩn hóa ma trận tensor RGB theo tham số ImageNet trên native buffer C++.
- **Suy luận học sâu phân loại (Deep Learning Inference)** (Đã chạy trên Android Emulator x86_64 API 34): Thực thi mô hình Adaptive ViT (ONNX Runtime Mobile) và khối Fusion (LiteRT) phân loại 3 lớp: Lành tính (Benign), Ác tính (Malignant), Bình thường (Normal).
- **Trực quan hóa Grad-CAM On-Device**: ⏳ **ĐANG NGHIÊN CỨU / CHƯA HOÀN THÀNH ON-DEVICE** (Giao diện hiện tại hiển thị bản đồ nhiệt giả lập/mô phỏng UI; thuật toán tính activation maps không autograd trên C++ đang được nghiên cứu, mã lỗi ngoại tuyến MSG-11).
- **Quản lý ca bệnh & Hồ sơ bệnh nhân cục bộ**: ⏳ **ĐANG TRIỂN KHAI** (Đã hoàn thành cấu trúc giao diện UI theo Figma; đã cài đặt và vượt qua 13 bài unit test cho `EncryptedLocalStorageService` và thuật toán AUTH-08 trong môi trường Jest sandbox; chưa đấu nối dữ liệu bệnh nhân thực tế vào các màn hình UI chính trên máy ảo).
- **Lưu trữ SQLite mã hóa (SQLCipher) & Keystore native**: ⏳ **DỰ KIẾN / ĐỊNH HƯỚNG NÂNG CẤP** (Hiện tại `CryptoVault` hoạt động ở chế độ sandbox, mã nguồn lưu trữ hiện sử dụng AsyncStorage, chưa tích hợp thư viện SQLCipher native và Android Keystore native).
- **Xuất phiếu báo cáo y tế (Export PDF)**: ⏳ **DỰ KIẾN / CHƯA HOÀN THÀNH** (Đã hoàn thiện màn hình cấu hình xuất PDF `ExportPdfScreen.tsx` theo Figma; logic biên dịch tệp PDF nhị phân vật lý `TODO(PDF-01)` và gọi Android Share Sheet đang ở chế độ mô phỏng, chưa có thư viện sinh file PDF native).

### B. Chức năng sử dụng Máy chủ & Mạng Internet (Khi trực tuyến)
- **Xác thực danh tính thực tế (Authentication)**: Đăng nhập lần đầu, cấp phát và làm mới khóa phiên (JWT Access/Refresh Token) từ FastAPI Backend hoặc Firebase Auth. *(Dự kiến tuần 10–12)*.
- **Đồng bộ đám mây hai chiều (Cloud Sync)**: Đẩy các ca bệnh mới (`pending`) lên cơ sở dữ liệu trung tâm khi có mạng; tải danh sách cập nhật từ bệnh viện; giải quyết xung đột dữ liệu. *(Dự kiến)*.
- **Lưu trữ sao lưu ảnh gốc (Cloud Backup Storage)**: Lưu trữ ảnh CT gốc dung lượng lớn lên Cloud Storage phục vụ lưu trữ hồ sơ lâu dài. *(Dự kiến)*.
- **Suy luận dự phòng trên máy chủ (Cloud Inference Fallback)**: Cung cấp tùy chọn cho bác sĩ gửi ca chụp phức tạp lên máy chủ GPU cao cấp để chạy mô hình tham chiếu đầy đủ kèm phân tích Grad-CAM độ phân giải cao. *(Dự kiến)*.

---

## 3. MA TRẬN TIẾN ĐỘ THỰC HIỆN: ĐÃ LÀM, ĐANG LÀM VÀ DỰ KIẾN (ANDROID & IOS)

| Hạng mục công việc | Phần dùng chung (Shared) | Phân hệ Android (Dương Thị Thu Diễm) | Phân hệ iOS (Dương Hải Đăng) | Trạng thái kiểm chứng |
| :--- | :--- | :--- | :--- | :--- |
| **Khung giao diện (59 màn hình Figma)** | Đã dựng hoàn tất 17 màn hình chính và các màn hình chi tiết bằng Design System Tokens. | Đã chạy và kiểm thử mượt mà trên Android SDK 34 (máy ảo Emulator). | Đã chạy trên simulator/test suites UI; giao diện tự co giãn theo iOS Safe Area. | ✅ **Đã hoàn thành UI Shell** (113/113 UI tests pass). |
| **Mô hình AI On-Device (Phân loại 3 lớp)** | Mô hình gốc PyTorch đã chuyển đổi sang ONNX FP32 và LiteRT FP32. | Tích hợp thành công ONNX Runtime Native C++ + LiteRT C API trên Android; chạy phân tích ảnh thật thành công trên máy ảo. | Đang khảo sát giữa ONNX Runtime iOS và CoreML (ANE conversion); chưa tích hợp native runtime trên iOS. | ✅ **Android Emulator x86_64: ĐÃ CHẠY (Tổng suy luận Native Runner: 1.831 ms; App UI: 1.580 ms)**.<br>⏳ **iOS: ĐANG NGHIÊN CỨU**.<br>⏳ **Redmi 13 / iPhone thật: CHƯA ĐO**. |
| **Tiền xử lý ảnh (Preprocessing)** | Thuật toán Pillow Nearest Resample ma trận `(1, 3, 224, 224)` đã viết mã chuẩn. | Cài đặt trong Native C++ Android, khớp 100% với script Python chuẩn. | Dự kiến cài đặt qua Accelerate Framework / vImage của Apple. | ✅ **Android: Đã kiểm chứng**.<br>⏳ **iOS: Dự kiến triển khai**. |
| **Bản đồ nhiệt Grad-CAM On-Device** | Đã dựng UI thanh trượt Opacity, hiển thị bản đồ nhiệt giả lập và cấu trúc overlay. | Đang nghiên cứu thuật toán trích xuất activation maps không cần autograd trên C++. | Dự kiến tích hợp qua CoreML visualization layers hoặc ONNX multi-output graph. | ⏳ **ĐANG NGHIÊN CỨU (Cả Android & iOS)** (Chưa hoàn thành on-device). |
| **Tầng lưu trữ cục bộ** | Thiết kế Repository Pattern `ILocalStorageAdapter`, định dạng thực thể chuẩn Bảng 101–106. | Cài đặt `EncryptedLocalStorageService`, mã hóa AES-256-GCM (sandbox). Đã kiểm chứng lưu cấu hình giao diện qua ADB force-stop/reopen. | Kế thừa hoàn toàn logic `ILocalStorageAdapter`, dự kiến tích hợp native iOS Keychain. | ✅ **13/13 Jest tests passed**.<br>✅ **Android: Đã test kill/reopen cấu hình theme**.<br>⏳ **Dữ liệu bệnh nhân trên UI máy ảo: Đang triển khai**.<br>⏳ **Native SQLite/Keystore: Dự kiến**. |
| **Chính sách AUTH-08 khi khóa tài khoản** | Thuật toán bảo toàn ca nháp `pending` và giữ lại bệnh nhân gốc để tránh mất khóa ngoại. | Đã cài đặt trong `localStorageService.ts`, kiểm thử 2/2 test case biên pass 100% trên Jest. | Kế thừa logic từ Shared Core. | ⏳ **ĐANG TRIỂN KHAI** (Đã pass Jest logic, chờ kết nối luồng xác thực thật). |
| **Xuất báo cáo PDF** | Màn hình cấu hình xuất PDF `ExportPdfScreen.tsx` theo thiết kế Figma. | Chế độ mô phỏng UI, chưa có native PDF generator. | Chế độ mô phỏng UI, chưa có native PDF generator. | ⏳ **DỰ KIẾN (Gói PDF-01)** (Chưa hoàn thành). |
| **Backend FastAPI & Đồng bộ Cloud** | Định nghĩa API Schema bệnh nhân, ca bệnh, đồng bộ outbox. | Chưa kết nối Backend thật. | Chưa kết nối Backend thật. | ⏳ **Dự kiến tuần 10–12**. |
| **Đóng gói bản cài đặt Release** | Đã cấu hình quy trình đóng gói. | Đã sinh thử nghiệm `app-release.apk` (685 MB). | Dự kiến cấu hình Xcode Archive / IPA. | ⏳ **Android: Cần tối ưu ProGuard**.<br>⏳ **iOS: Chưa đóng gói IPA**. |

---

## 4. DANH SÁCH CÁC ĐIỂM CẦN BÁO CÁO VÀ XIN Ý KIẾN THS. TRỊNH HUY HOÀNG

1. **Về việc chuyển đổi trọng tâm đề tài từ Client-Server sang On-Device Edge AI**:
   - *Đề xuất*: Xin phép giữ nguyên tên đề tài chính thức trong đề cương ("Phát triển phân hệ Android/iOS cho ứng dụng chẩn đoán ung thư phổi trên thiết bị di động"), nhưng trong phần Mục tiêu cụ thể, Kiến trúc và Thực nghiệm sẽ nhấn mạnh giải pháp **Trí tuệ nhân tạo chạy trực tiếp trên thiết bị (On-Device AI)** không cần mạng Internet.
2. **Về cơ cấu các chương trong Báo cáo Khóa luận**:
   - *Phương án A (Khuyến nghị)*: Giữ đúng **5 chương** như đề cương đã nộp (Chương 1 Tổng quan tình hình nghiên cứu, Chương 2 Cơ sở lý thuyết và nền tảng công nghệ, Chương 3 Phân tích và thiết kế hệ thống, Chương 4 Cài đặt thực nghiệm và đánh giá, Chương 5 Kết luận và hướng phát triển).
   - *Phương án B*: Tách thành **6 chương** để đưa phần "Thực nghiệm và Đánh giá" thành Chương 5 riêng biệt, giúp phân tích sâu hơn về số liệu đo lường hiệu năng chip di động (RAM, FPS, pin, độ trễ On-Device).
3. **Về ngoại lệ của chính sách xóa dữ liệu AUTH-08**:
   - *Vấn đề*: Khi tài khoản bác sĩ bị khóa, đặc tả yêu cầu xóa dữ liệu đã đồng bộ (`synced`) và giữ dữ liệu nháp (`pending`). Nhóm đề xuất giữ lại bản ghi bệnh nhân gốc (dù đã sync) nếu bệnh nhân đó đang có ca nháp chưa sync gắn liền để bảo đảm tính toàn vẹn cơ sở dữ liệu. Nhóm xin ý kiến thầy về tính hợp lệ của phương án này.
4. **Về thiết bị thực nghiệm nghiệm thu**:
   - *Kế hoạch*: Nhóm sẽ thực hiện nghiệm thu độc lập trên 2 thiết bị vật lý thật: Phân hệ Android đo trên **Xiaomi Redmi 13**; Phân hệ iOS đo trên **iPhone** vật lý; cam kết không lấy kết quả máy ảo giả lập làm kết quả trên điện thoại thật.
