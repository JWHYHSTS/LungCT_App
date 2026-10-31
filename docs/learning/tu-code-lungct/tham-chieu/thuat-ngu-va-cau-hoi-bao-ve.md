# BẢNG THUẬT NGỮ CHUYÊN NGÀNH VÀ BỘ CÂU HỎI BẢO VỆ ĐỒ ÁN LUNGCT
### Cẩm nang tra cứu thuật ngữ và câu hỏi chất vấn trước Hội đồng chấm khóa luận tốt nghiệp

> **Biên soạn cho 2 phân hệ**:
> - Phân hệ Android: Dương Hải Đăng (MSSV: 49.01.103.020)
> - Phân hệ iOS: Dương Hải Đăng (MSSV: 49.01.103.020)  
> **Nguyên tắc trả lời**: Dựa trên mã nguồn và thực nghiệm đã kiểm chứng thực tế; phần nào chưa làm hoặc đang khảo sát thì trả lời trung thực theo hướng phát triển tương lai.

---

## 📖 PHẦN 1: BẢNG THUẬT NGỮ CHUYÊN NGÀNH (GLOSSARY)

| Thuật ngữ tiếng Anh | Thuật ngữ tiếng Việt | Giải thích đơn giản cho người học C++ | Ví dụ áp dụng trong dự án LungCT |
| :--- | :--- | :--- | :--- |
| **Edge AI / On-Device AI** | Trí tuệ nhân tạo tại biên | Chạy trực tiếp mô hình nơ-ron trên CPU/GPU của điện thoại di động, không cần gửi ảnh lên server qua mạng Internet. | Mô hình AACNN-ViT FP32 chạy phân loại nốt phổi ngay trên máy Android qua ONNX Runtime C++. |
| **Pillow Nearest Resample** | Thuật toán nội suy điểm lân cận | Thuật toán thay đổi kích thước ảnh số bằng cách lấy giá trị pixel gần nhất, tương đương `PIL.Image.Resampling.NEAREST` trong Python. | Dùng trong hàm tiền xử lý native C++ để biến đổi ảnh CT về ma trận $224 \times 224 \times 3$, đảm bảo kết quả trùng khớp với Python. |
| **Page-level Encryption** | Mã hóa cấp trang CSDL | Cơ chế chia nhỏ tệp cơ sở dữ liệu SQLite thành các trang đĩa (thường là 4.096 bytes) và mã hóa độc lập từng trang bằng AES-256. | SQLCipher 4.6.1 mã hóa toàn bộ tệp `lungct_secure_usr_doc_01.db`; lệnh quét `strings` cho kết quả 0 byte chữ rõ (plaintext). |
| **Android Keystore System** | Hệ thống lưu trữ khóa Android | Kho chứa an toàn do hệ điều hành Android cung cấp để sinh và lưu trữ khóa bí mật. Khóa không bao giờ bị đưa ra ngoài vùng nhớ an toàn. | Khóa Master Key `LungCt_Doctor_VaultKey_usr_doc_01` bảo vệ passphrase mở CSDL SQLCipher của từng bác sĩ. |
| **Apple Keychain Services** | Dịch vụ chùm chìa khóa Apple | API bảo mật của hệ điều hành iOS giúp lưu trữ các đoạn mật khẩu ngắn, chứng chỉ và khóa mật mã trong một cơ sở dữ liệu được mã hóa của hệ thống. | Phân hệ iOS định hướng dùng Keychain Services để bảo vệ khóa CSDL, có thể kết hợp với Secure Enclave trên chip Apple A-Series. |
| **Zero Data Loss Migration** | Chuyển đổi dữ liệu không tổn thất | Quy trình tự động chuyển dữ liệu từ kho lưu trữ cũ sang kho mã hóa mới mà không làm mất hoặc nhân đôi bất kỳ bản ghi nào. | Di chuyển dữ liệu bệnh nhân từ AsyncStorage/SQLite plaintext sang SQLCipher, có sao lưu an toàn ra tệp backup. |
| **AEAD (Authenticated Encryption)** | Mã hóa có chứng thực | Phương thức mã hóa vừa bảo vệ bí mật dữ liệu vừa sinh ra một mã xác thực (Authentication Tag) để phát hiện nếu dữ liệu bị sửa đổi. | Chế độ `AES/GCM/NoPadding` dùng để mã hóa bản sao lưu `.encrypted.bak`. Nếu bị sửa 1 bit dữ liệu, lệnh giải mã sẽ lập tức ném lỗi từ chối. |
| **Mock Data / Mock UI** | Dữ liệu và Giao diện giả lập | Thành phần giao diện được dựng sẵn với các dữ liệu mẫu tĩnh để kiểm thử bố cục khi backend hoặc tầng native chưa hoàn thành. | 17 màn hình React Native ban đầu chạy bằng `doctorMocks.ts` trước khi nối vào CSDL mã hóa SQLCipher. |

---

## 🎓 PHẦN 2: BỘ CÂU HỎI VÀ GỢI Ý TRẢ LỜI TRƯỚC HỘI ĐỒNG

### Câu hỏi 1: Tại sao nhóm lại lựa chọn triển khai mô hình AI trên thiết bị di động (On-Device) thay vì chạy trên máy chủ đám mây (Cloud Server)?
- **Gợi ý trả lời**:
  1. *Tính sẵn sàng ngoại tuyến*: Tại các cơ sở y tế tuyến huyện hoặc vùng sâu vùng xa, đường truyền Internet thường chập chờn. Ứng dụng chạy trên thiết bị cho phép bác sĩ đánh giá sơ bộ lát cắt CT ngay cả khi mất mạng.
  2. *Bảo vệ quyền riêng tư dữ liệu y tế (Privacy-Preserving)*: Ảnh CT của bệnh nhân không bị tải lên máy chủ bên thứ ba, giảm thiểu tối đa rủi ro rò rỉ thông tin sức khỏe (PHI).
  3. *Giảm chi phí hạ tầng*: Bệnh viện không cần đầu tư máy chủ GPU đắt đỏ để phục vụ hàng ngàn yêu cầu chẩn đoán cùng lúc.

### Câu hỏi 2: Tại sao phân hệ Android lại phải chuyển từ SQLite thông thường sang SQLCipher 4.6.1?
- **Gợi ý trả lời**:
  - SQLite mặc định của Android lưu trữ dữ liệu dạng văn bản rõ (plaintext) trong tệp nhị phân trên bộ nhớ flash. Bất kỳ ai chiếm được quyền root hoặc trích xuất tệp CSDL đều có thể đọc rõ họ tên, mã số và kết quả bệnh án của bệnh nhân (minh chứng là lệnh `strings` đọc được đầy đủ dữ liệu từ tệp SQLite cũ).
  - SQLCipher 4.6.1 giải quyết triệt để vấn đề này bằng cách mã hóa toàn bộ tệp nhị phân cấp trang đĩa (Page-level AES-256-CBC kết hợp HMAC-SHA512). Quét chuỗi trên tệp SQLCipher thực tế cho kết quả **0 byte plaintext**.

### Câu hỏi 3: Độ trễ suy luận AI đo được trên máy ảo có thể gọi là "độ trễ lâm sàng" hay không?
- **Gợi ý trả lời**:
  - **Tuyệt đối không**. Con số ~1.580 ms đo được trên máy ảo Android API 34 chỉ là **thời gian suy luận kỹ thuật của vi xử lý (Technical Inference Latency)** đối với một lát cắt CT đối chứng chuẩn.
  - "Độ trễ lâm sàng" (Clinical Latency) phải bao gồm toàn bộ thời gian bác sĩ thao tác, tải toàn bộ ca chụp hàng trăm lát cắt, đối chiếu hình ảnh và đưa ra kết luận tại bệnh viện thực tế. Nhóm cam kết trung thực về giới hạn này trong báo cáo khóa luận.

### Câu hỏi 4: Nhóm xử lý như thế nào đối với các tính năng chưa hoàn thiện như Grad-CAM On-Device hoặc phân hệ iOS?
- **Gợi ý trả lời**:
  - Đối với Grad-CAM: Do thuật toán Grad-CAM chuẩn đòi hỏi tính toán gradient ngược (Autograd) vốn không được hỗ trợ trên các runtime di động tối ưu như ONNX Runtime Mobile hay TFLite, nhóm hiện tại ghi nhận trung thực trạng thái `MSG-11 (Không khả dụng ngoại tuyến)` và đang nghiên cứu hướng trích xuất bản đồ kích hoạt (Activation Map) trực tiếp từ lớp tích chập cuối cùng.
  - Đối với phân hệ iOS: Nhóm đã đồng bộ 100% tầng logic giao diện React Native và hoàn thành khảo sát kiến trúc lý thuyết (CoreML vs ONNX iOS). Do rào cản phần cứng chưa có máy Mac vật lý, nhóm ghi nhận rõ đây là hướng triển khai tiếp theo khi được trang bị thiết bị, không dựng mã giả để báo cáo sai lệch.
