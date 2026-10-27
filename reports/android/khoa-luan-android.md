# BÁO CÁO KHÓA LUẬN TỐT NGHIỆP

## ĐỀ TÀI: PHÁT TRIỂN PHÂN HỆ ANDROID CHO ỨNG DỤNG CHẨN ĐOÁN UNG THƯ PHỔI TRÊN THIẾT BỊ DI ĐỘNG BẰNG TRÍ TUỆ NHÂN TẠO CẠNH (EDGE AI)

> **Thông tin khóa luận**:
> - **Cơ quan đào tạo**: Bộ Giáo dục và Đào tạo – Trường Đại học Sư phạm Thành phố Hồ Chí Minh – Khoa Công nghệ Thông tin.
> - **Ngành đào tạo**: Sư phạm Tin học (Khóa 49, Niên khóa 2026 – 2027).
> - **Sinh viên thực hiện**: **DƯƠNG THỊ THU DIỄM** — MSSV: **49.01.103.011**.
> - **Giảng viên hướng dẫn**: **ThS. TRỊNH HUY HOÀNG**.
> - **Tình trạng văn bản**: **Bản thảo khóa luận đang phát triển (Working Draft)** — Soạn thảo theo khung 5 chương chuẩn của Đề cương chi tiết đã duyệt, tích hợp đề xuất nâng cấp công nghệ On-Device Edge AI đang chờ GVHD xác nhận.
> - **Cam kết dữ liệu**: 100% dữ liệu thực nghiệm sử dụng bộ dữ liệu công khai ẩn danh (IQ-OTH/NCCD) hoặc dữ liệu giả định tổng hợp (synthetic mock data); tuyệt đối không sử dụng dữ liệu bệnh nhân thực tế khi chưa có phê duyệt của Hội đồng Đạo đức Y sinh.

---

## MỤC LỤC TỔNG QUÁT

- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [TÓM TẮT KHÓA LUẬN (ABSTRACT)](#tóm-tắt-khóa-luận-abstract)
- [DANH MỤC TỪ VIẾT TẮT](#danh-mục-từ-viết-tắt)
- [DANH MỤC BẢNG BIỂU VÀ HÌNH VẼ](#danh-mục-bảng-biểu-và-hình-vẽ)
- [MỞ ĐẦU](#mở-đầu)
  - [1. Tính cấp thiết của đề tài / Lý do chọn đề tài](#1-tính-cấp-thiết-của-đề-tài--lý-do-chọn-đề-tài)
  - [2. Mục đích nghiên cứu](#2-mục-đích-nghiên-cứu)
    - [2.1 Mục tiêu chung](#21-mục-tiêu-chung)
    - [2.2 Mục tiêu cụ thể](#22-mục-tiêu-cụ-thể)
  - [3. Phạm vi nghiên cứu](#3-phạm-vi-nghiên-cứu)
    - [3.1 Đối tượng nghiên cứu](#31-đối-tượng-nghiên-cứu)
    - [3.2 Phạm vi nghiên cứu](#32-phạm-vi-nghiên-cứu)
  - [4. Phương pháp nghiên cứu](#4-phương-pháp-nghiên-cứu)
  - [5. Cấu trúc của khóa luận tốt nghiệp](#5-cấu-trúc-của-khóa-luận-tốt-nghiệp)
- [CHƯƠNG 1: TỔNG QUAN TÌNH HÌNH NGHIÊN CỨU](#chương-1-tổng-quan-tình-hình-nghiên-cứu)
  - [1.1 Bài toán chẩn đoán ung thư phổi dựa trên ảnh CT](#11-bài-toán-chẩn-đoán-ung-thư-phổi-dựa-trên-ảnh-ct)
  - [1.2 Các nghiên cứu ứng dụng học sâu trong chẩn đoán ung thư phổi](#12-các-nghiên-cứu-ứng-dụng-học-sâu-trong-chẩn-đoán-ung-thư-phổi)
  - [1.3 Ứng dụng thiết bị di động trong hỗ trợ y tế](#13-ứng-dụng-thiết-bị-di-động-trong-hỗ-trợ-y-tế)
  - [1.4 Các phương án triển khai mô hình học sâu trên ứng dụng di động](#14-các-phương-án-triển-khai-mô-hình-học-sâu-trên-ứng-dụng-di-động)
  - [1.5 Nhận xét và hướng tiếp cận của đề tài](#15-nhận-xét-và-hướng-tiếp-cận-của-đề-tài)
- [CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ NỀN TẢNG CÔNG NGHỆ](#chương-2-cơ-sở-lý-thuyết-và-nền-tảng-công-nghệ)
  - [2.1 Mô hình học sâu phân loại ảnh CT phổi](#21-mô-hình-học-sâu-phân-loại-ảnh-ct-phổi)
  - [2.2 Nền tảng công nghệ phát triển hệ thống](#22-nền-tảng-công-nghệ-phát-triển-hệ-thống)
  - [2.3 Đặc thù triển khai trên hệ điều hành Android](#23-đặc-thù-triển-khai-trên-hệ-điều-hành-android)
- [CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
  - [3.1 Phân tích yêu cầu](#31-phân-tích-yêu-cầu)
  - [3.2 Mô hình hóa hệ thống](#32-mô-hình-hóa-hệ-thống)
  - [3.3 Thiết kế kiến trúc tổng thể](#33-thiết-kế-kiến-trúc-tổng-thể)
  - [3.4 Thiết kế cơ sở dữ liệu và tầng lưu trữ an toàn](#34-thiết-kế-cơ-sở-dữ-liệu-và-tầng-lưu-trữ-an-toàn)
  - [3.5 Thiết kế giao diện người dùng](#35-thiết-kế-giao-diện-người-dùng)
- [CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ](#chương-4-cài-đặt-thực-nghiệm-và-đánh-giá)
  - [4.1 Môi trường cài đặt và triển khai](#41-môi-trường-cài-đặt-và-triển-khai)
  - [4.2 Cài đặt máy chủ và các dịch vụ đám mây (FastAPI, Firebase)](#42-cài-đặt-máy-chủ-và-các-dịch-vụ-đám-mây-fastapi-firebase)
  - [4.3 Cài đặt ứng dụng React Native và Tầng suy luận On-Device Android](#43-cài-đặt-ứng-dụng-react-native-và-tầng-suy-luận-on-device-android)
  - [4.4 Cấu hình, đóng gói và phát hành phân hệ Android](#44-cấu-hình-đóng-gói-và-phát-hành-phân-hệ-android)
  - [4.5 Thực nghiệm và đo lường kết quả](#45-thực-nghiệm-và-đo-lường-kết-quả)
  - [4.6 Đánh giá và so sánh hai phân hệ Android - iOS](#46-đánh-giá-và-so-sánh-hai-phân-hệ-android---ios)
- [CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-5-kết-luận-và-hướng-phát-triển)
  - [5.1 Kết quả đạt được](#51-kết-quả-đạt-được)
  - [5.2 Hạn chế](#52-hạn-chế)
  - [5.3 Hướng phát triển](#53-hướng-phát-triển)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## TÓM TẮT KHÓA LUẬN (ABSTRACT)

Ung thư phổi hiện là loại ung thư phổ biến hàng đầu và là nguyên nhân tử vong do ung thư cao nhất trên toàn cầu cũng như tại Việt Nam. Tầm soát định kỳ bằng chụp cắt lớp vi tính liều thấp (LDCT) đã được chứng minh giúp giảm 20% tỷ lệ tử vong. Tuy nhiên, việc đánh giá hàng trăm lát cắt CT trong mỗi ca chụp đặt áp lực quá tải lên các bác sĩ chẩn đoán hình ảnh, đặc biệt tại các cơ sở y tế tuyến dưới.

Khóa luận này nghiên cứu và phát triển **phân hệ Android** trong giải pháp di động toàn diện **LungCT**, hỗ trợ bác sĩ đánh giá phân loại ảnh CT phổi ngay trên điện thoại thông minh. Dựa trên đề cương đã được phê duyệt, đề tài được nâng cấp về mặt kiến trúc: Chuyển đổi mô hình học sâu lai kết hợp giữa mạng nơ-ron tích chập và biến đổi thị giác **AACNN-ViT Adaptive** sang định dạng tối ưu **ONNX Runtime Mobile (FP32)** kết hợp khối **Fusion LiteRT (FP32)**, cho phép **thực thi suy luận phân loại 3 lớp trực tiếp trên thiết bị (On-Device Edge AI) hoàn toàn ngoại tuyến không cần kết nối mạng Internet**.

Về mặt thực nghiệm kỹ thuật, pipeline suy luận phân loại đã chạy thành công trên máy ảo Android Emulator x86_64 API 34 với thời gian suy luận kỹ thuật đạt ~1.580 ms trong ứng dụng APK và ~1.831 ms trong chương trình native C++ runner (đối với lát cắt CT đối chứng; không gọi là độ trễ lâm sàng). Khóa luận xây dựng hoàn chỉnh giao diện theo thiết kế 59 màn hình Figma bằng React Native New Architecture (TypeScript), thiết kế tầng lưu trữ cục bộ (Repository Pattern) bảo vệ dữ liệu bằng mã hóa AES-256-GCM sandbox, sẵn sàng định hướng nâng cấp lên SQLite mã hóa (SQLCipher) và Android Keystore, đồng thời kiểm chứng thuật toán bảo toàn dữ liệu nháp AUTH-08 trên Jest. Đối với tính năng Grad-CAM on-device và xuất file PDF vật lý, khóa luận đã hoàn thiện giao diện mô phỏng và đang trong giai đoạn nghiên cứu/triển khai kỹ thuật. Hệ thống phía máy chủ (FastAPI, Firebase) giữ vai trò xác thực danh tính, lưu trữ sao lưu và đồng bộ đám mây khi có kết nối mạng.

---

## DANH MỤC TỪ VIẾT TẮT

| Viết tắt | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa tiếng Việt |
| :--- | :--- | :--- |
| **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| **CNN** | Convolutional Neural Network | Mạng nơ-ron tích chập |
| **ViT** | Vision Transformer | Kiến trúc Transformer cho thị giác máy tính |
| **Edge AI** | Edge Artificial Intelligence | Trí tuệ nhân tạo tại biên / trên thiết bị |
| **CT** | Computed Tomography | Chụp cắt lớp vi tính |
| **LDCT** | Low-Dose Computed Tomography | Chụp cắt lớp vi tính liều thấp |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping | Bản đồ kích hoạt lớp có trọng số gradient |
| **DICOM** | Digital Imaging and Communications in Medicine | Tiêu chuẩn hình ảnh và truyền thông y tế số |
| **PHI** | Protected Health Information | Thông tin sức khỏe được bảo vệ |
| **PII** | Personally Identifiable Information | Thông tin định danh cá nhân |
| **AES** | Advanced Encryption Standard | Tiêu chuẩn mã hóa nâng cao |
| **GCM** | Galois/Counter Mode | Chế độ mã hóa có chứng thực toàn vẹn |
| **PBKDF2** | Password-Based Key Derivation Function 2 | Hàm dẫn xuất khóa dựa trên mật khẩu |
| **TEE** | Trusted Execution Environment | Môi trường thực thi tin cậy phần cứng |

---

## MỞ ĐẦU

### 1. Tính cấp thiết của đề tài / Lý do chọn đề tài
Ung thư phổi là loại ung thư có tỷ lệ mắc mới và tử vong hàng đầu thế giới (theo GLOBOCAN 2024 có khoảng 2,6 triệu ca mới và 1,9 triệu ca tử vong). Tại Việt Nam, ung thư phổi đứng thứ hai về số ca mắc (23.085 ca) và đứng đầu về số ca tử vong (21.340 ca). Thử nghiệm sàng lọc quốc gia NLST (Mỹ) đã chứng minh tầm soát bằng ảnh CT liều thấp giúp giảm 20% tỷ lệ tử vong.

Tuy nhiên, mỗi lần chụp ngực tạo ra hàng trăm lát cắt CT, đòi hỏi bác sĩ chẩn đoán hình ảnh phải quan sát kỹ lưỡng từng lát cắt để phát hiện tổn thương nhỏ. Điều này gây quá tải lớn, đặc biệt ở tuyến y tế cơ sở nơi thiếu hụt nhân lực chuyên môn cao. Việc xây dựng ứng dụng hỗ trợ chẩn đoán trên điện thoại thông minh là hướng đi mang tính thời đại nhờ tính cơ động cao.

Đặc biệt, để ứng dụng phát huy hiệu quả tối đa tại Việt Nam, hệ thống không thể phụ thuộc hoàn toàn vào đường truyền mạng Internet của bệnh viện. Do đó, việc nghiên cứu giải pháp **chạy mô hình học sâu trực tiếp trên phần cứng điện thoại Android (On-Device Edge AI)**, hoạt động ngay cả khi mất mạng, đồng thời bảo mật dữ liệu bệnh nhân cục bộ là bài toán vừa có giá trị khoa học vừa có ý nghĩa thực tiễn cấp bách.

### 2. Mục đích nghiên cứu

#### 2.1 Mục tiêu chung
Xây dựng ứng dụng di động phân hệ Android bằng React Native (TypeScript), hỗ trợ bác sĩ đánh giá phân loại ảnh CT phổi của bệnh nhân, thông qua việc **tích hợp mô hình học sâu AACNN-ViT Adaptive chạy trực tiếp trên thiết bị (On-Device AI)** không phụ thuộc Internet, kết hợp giao diện trực quan hóa bản đồ nhiệt Grad-CAM. Đồng thời, xây dựng hệ thống máy chủ FastAPI và dịch vụ đám mây phục vụ xác thực người dùng, lưu trữ sao lưu và đồng bộ dữ liệu khi trực tuyến. Sản phẩm được đóng gói bộ cài đặt APK để cài đặt thử nghiệm trên điện thoại Android.

#### 2.2 Mục tiêu cụ thể
1. **Nghiên cứu lý thuyết**: Tổng quan về ung thư phổi, ảnh CT, mô hình lai tích hợp CNN và Vision Transformer (AACNN-ViT Adaptive), cơ chế giải thích mô hình Grad-CAM và các công nghệ AI On-Device trên Android (ONNX Runtime Mobile, Google LiteRT).
2. **Tối ưu và tích hợp mô hình On-Device**: Chuyển đổi và đóng gói mô hình AACNN-ViT Adaptive sang định dạng FP32 di động; xây dựng native pipeline tiền xử lý ảnh chuẩn Pillow Nearest Resample trực tiếp trên Android; nghiên cứu giải pháp Grad-CAM on-device không cần Autograd.
3. **Phân tích và thiết kế hệ thống**: Xây dựng kiến trúc Hybrid (Edge-First kết hợp Cloud Backend); mô hình hóa hệ thống bằng biểu đồ UML; thiết kế tầng lưu trữ cục bộ bảo vệ dữ liệu (Repository Pattern, AES-256-GCM sandbox, định hướng SQLCipher/Keystore) và xử lý chính sách AUTH-08.
4. **Hiện thực hóa phân hệ Android**: Cài đặt 17 màn hình chính và các màn hình chi tiết chuẩn 59 khung thiết kế Figma bằng React Native (TypeScript); xây dựng phân hệ quản lý của Bác sĩ và Quản trị viên.
5. **Thực nghiệm và đo lường kỹ thuật**: Đánh giá độ chính xác phân loại 3 lớp (Normal, Benign, Malignant) trên bộ dữ liệu IQ-OTH/NCCD; đo kiểm thời gian suy luận kỹ thuật On-Device, bộ nhớ RAM, tính bền vững lưu trữ qua vòng đời ứng dụng trên máy ảo Android x86_64 API 34 và chuẩn bị thiết bị vật lý đại diện (Xiaomi Redmi 13).

### 3. Phạm vi nghiên cứu

#### 3.1 Đối tượng nghiên cứu
- Ảnh CT phổi dạng lát cắt hai chiều (2D CT slices) và bài toán phân loại đa lớp mức độ tổn thương.
- Mô hình học sâu lai AACNN-ViT Adaptive và kỹ thuật giải thích mô hình Grad-CAM.
- Công nghệ Trí tuệ nhân tạo biên (Edge AI): ONNX Runtime Mobile, Google LiteRT trên hệ điều hành Android.
- Công nghệ phát triển ứng dụng di động đa nền tảng React Native New Architecture (TypeScript) và dịch vụ đám mây (FastAPI, Firebase).

#### 3.2 Phạm vi nghiên cứu
- **Dữ liệu**: Bộ dữ liệu ảnh CT phổi công khai **IQ-OTH/NCCD** gồm 1.190 lát cắt phân loại 3 lớp (Normal, Benign, Malignant) ở định dạng JPEG/PNG. Khóa luận tập trung phân loại ảnh lát cắt 2D, chưa xử lý khối ảnh CT 3D thể tích đầy đủ.
- **Mô hình**: Kế thừa kiến trúc và trọng số đã huấn luyện của mô hình AACNN-ViT Adaptive, tập trung vào bài toán chuyển đổi mô hình, tối ưu hóa suy luận On-Device và trực quan hóa kết quả trên thiết bị di động.
- **Nền tảng thực nghiệm**: Phân hệ Android hỗ trợ từ Android 10.0 (API 29) đến Android 14.0 (API 34+). Thiết bị đo kiểm: Máy ảo Android Studio Emulator (Pixel 6 Pro / API 34) và điện thoại thật Xiaomi Redmi 13 (MediaTek Helio G91-Ultra, 8GB RAM).
- **Phân định phạm vi chức năng ngoại tuyến và trực tuyến**:
  - *Ngoại tuyến (Offline)*: Tiền xử lý ảnh, suy luận phân loại AI On-Device, hiển thị bản đồ nhiệt Grad-CAM, quản lý hồ sơ bệnh nhân và ca bệnh trên bộ lưu trữ mã hóa cục bộ, xuất báo cáo PDF.
  - *Trực tuyến (Online)*: Đăng nhập/Đăng ký tài khoản lần đầu qua máy chủ, đồng bộ dữ liệu đám mây hai chiều, sao lưu ảnh CT lên Cloud Storage, suy luận tham chiếu dự phòng trên GPU server.
- **Khuyến cáo y khoa**: Kết quả của ứng dụng mang tính chất hỗ trợ tham khảo (Clinical Decision Support), không thay thế kết luận chẩn đoán chính thức của bác sĩ chuyên khoa; hệ thống chưa qua thử nghiệm lâm sàng thực địa trên bệnh nhân thật.

### 4. Phương pháp nghiên cứu
1. **Phương pháp nghiên cứu lý thuyết**: Thu thập, tổng hợp các bài báo khoa học về chẩn đoán ung thư phổi, Vision Transformer, On-Device AI và tài liệu kỹ thuật chính thức của React Native, Android Developers, ONNX Runtime, Google LiteRT.
2. **Phương pháp phân tích - thiết kế hướng đối tượng**: Mô hình hóa hệ thống bằng UML (Use Case, Activity, Sequence, Class/ERD diagram) tuân thủ tiêu chuẩn Clean Architecture.
3. **Phương pháp phát triển phần mềm Agile/Scrum**: Phân chia các chu kỳ lặp (sprints) 2 tuần, nghiệm thu từng đầu việc bằng mã nguồn, test suite và hình ảnh minh chứng thực tế.
4. **Phương pháp thực nghiệm đa môi trường**: Phân tách minh bạch giữa:
   - Môi trường Jest Sandbox: Kiểm chứng 100% logic nghiệp vụ, thuật toán mã hóa AES-256-GCM và kịch bản biên AUTH-08.
   - Môi trường máy ảo Android Emulator: Đo kiểm thời gian suy luận native, tương tác giao diện và vòng đời lưu trữ qua ADB.
   - Môi trường thiết bị vật lý thật (Xiaomi Redmi 13): Đo kiểm độ trễ thực tế, nhiệt độ, mức tiêu thụ pin và tài nguyên RAM.

### 5. Cấu trúc của khóa luận tốt nghiệp
Khóa luận được kết cấu theo **5 chương chuẩn** của Đề cương chi tiết:
- **Chương 1: Tổng quan tình hình nghiên cứu**: Trình bày bài toán chẩn đoán ung thư phổi trên ảnh CT, các nghiên cứu học sâu liên quan, xu hướng ứng dụng di động trong y tế và so sánh các phương án triển khai mô hình học sâu (Cloud-based vs. Edge AI On-Device).
- **Chương 2: Cơ sở lý thuyết và nền tảng công nghệ**: Trình bày mô hình học sâu AACNN-ViT Adaptive, Grad-CAM, các độ đo đánh giá; nền tảng công nghệ React Native New Architecture (TypeScript), backend FastAPI, Firebase; đặc thù triển khai trên hệ điều hành Android (Android Keystore, SQLCipher, ONNX Runtime Android).
- **Chương 3: Phân tích và thiết kế hệ thống**: Đặc tả yêu cầu chức năng/phi chức năng, mô hình hóa use case, thiết kế kiến trúc hệ thống Hybrid (Edge-First), thiết kế cơ sở dữ liệu và tầng lưu trữ mã hóa an toàn, thiết kế giao diện người dùng.
- **Chương 4: Cài đặt, thực nghiệm và đánh giá**: Trình bày quá trình cài đặt tầng suy luận On-Device trên Android, cài đặt dịch vụ máy chủ FastAPI/Firebase, hiện thực hóa ứng dụng React Native, đóng gói phát hành APK, kịch bản thực nghiệm đo lường hiệu năng và so sánh hai phân hệ Android - iOS.
- **Chương 5: Kết luận và hướng phát triển**: Tổng kết các kết quả đạt được của phân hệ Android, các hạn chế còn tồn tại và đề xuất hướng phát triển tiếp theo.

---

## CHƯƠNG 1: TỔNG QUAN TÌNH HÌNH NGHIÊN CỨU

### 1.1 Bài toán chẩn đoán ung thư phổi dựa trên ảnh CT
Trình bày cơ chế tạo ảnh chụp cắt lớp vi tính lồng ngực (Computed Tomography - CT), thang đo độ suy giảm bức xạ Hounsfield (HU) của các mô cơ thể. Phân tích đặc điểm hình thái học của nốt phổi lành tính (bờ nhẵn, viền rõ, vôi hóa trung tâm) và nốt phổi ác tính (bờ đa cung, viền gai, cấu trúc co kéo màng phổi). Nêu bật sự phức tạp của việc phân biệt tổn thương trên các lát cắt độc lập.

### 1.2 Các nghiên cứu ứng dụng học sâu trong chẩn đoán ung thư phổi
Điểm qua các công trình nghiên cứu tiêu biểu:
- Các mô hình dựa trên mạng tích chập CNN truyền thống (AlexNet, VGG, ResNet, DenseNet).
- Ứng dụng mô hình Vision Transformer (ViT) của Dosovitskiy et al. (2020) giúp mô hình hóa mối quan hệ không gian toàn cục.
- Mô hình lai AACNN-ViT Adaptive của Rahman et al. (2026): Kết hợp ưu điểm trích xuất đặc trưng vân cục bộ của CNN với năng lực biểu diễn ngữ cảnh tầm xa của ViT qua cơ chế hợp nhất đặc trưng thích ứng.
- Tập dữ liệu nghiên cứu công khai: LIDC-IDRI, LUNA16 và tập dữ liệu IQ-OTH/NCCD (Iraq).

### 1.3 Ứng dụng thiết bị di động trong hỗ trợ y tế (mHealth)
Khảo sát xu hướng ứng dụng công nghệ di động trong y tế lâm sàng. Bác sĩ cần một công cụ tra cứu, hội chẩn nhanh ngay tại buồng bệnh hoặc phòng phẫu thuật mà không bị giới hạn vào các trạm làm việc (Workstation) cồng kềnh.

### 1.4 Các phương án triển khai mô hình học sâu trên ứng dụng di động
Phân tích và đối chiếu 3 kiến trúc triển khai:
1. **Kiến trúc thuần Đám mây (Cloud Inference)**: Ứng dụng di động chỉ làm giao diện (Thin Client), tải ảnh lên máy chủ GPU xử lý. *Nhược điểm*: Chi phí vận hành máy chủ đắt đỏ, phụ thuộc hoàn toàn vào kết nối mạng, nguy cơ rò rỉ dữ liệu y tế qua đường truyền.
2. **Kiến trúc thuần Biên (Edge AI / On-Device Inference)**: Mô hình được nén và nhúng trực tiếp vào ứng dụng di động, thực thi suy luận bằng CPU/GPU/NPU của điện thoại. *Ưu điểm*: Chạy 100% ngoại tuyến, bảo mật dữ liệu tuyệt đối (dữ liệu ảnh không rời khỏi máy), phản hồi tức thì với độ trễ cố định.
3. **Kiến trúc Lai thích ứng (Hybrid Edge-First - Hướng tiếp cận của đề tài)**: Ưu tiên thực hiện suy luận chẩn đoán sơ bộ ngay trên thiết bị; đồng thời sử dụng máy chủ đám mây để lưu trữ hồ sơ tập trung, đồng bộ dữ liệu và chạy phân tích nâng cao khi người dùng yêu cầu.

### 1.5 Nhận xét và hướng tiếp cận của đề tài
Khóa luận chọn hướng tiếp cận **Kiến trúc Lai thích ứng (Edge-First)**. Đối với phân hệ Android do sinh viên **Dương Thị Thu Diễm** phụ trách, trọng tâm nghiên cứu tập trung vào việc hiện thực hóa suy luận mô hình AACNN-ViT Adaptive bằng native engine trên hệ điều hành Android, đảm bảo ứng dụng vận hành mượt mà, độc lập với kết nối mạng, đồng thời thiết kế tầng bảo vệ dữ liệu hồ sơ bệnh nhân cục bộ đạt chuẩn mật mã học y tế.

---

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ NỀN TẢNG CÔNG NGHỆ

### 2.1 Mô hình học sâu phân loại ảnh CT phổi
- **Cấu trúc mạng AACNN-ViT Adaptive**:
  - Khối tích chập tăng cường chú ý (Attention-Augmented CNN): Trích xuất bản đồ đặc trưng cấp thấp và cục bộ của nốt phổi.
  - Khối biến đổi thị giác (Vision Transformer): Chia bản đồ đặc trưng thành các mẩu vá (patches), áp dụng Multi-Head Self-Attention để liên kết ngữ cảnh nhu mô phổi toàn lát cắt.
  - Khối hợp nhất đặc trưng thích ứng (Adaptive Fusion Layer): Tự động điều chỉnh trọng số đóng góp giữa nhánh CNN và nhánh ViT để đưa ra vector phân lớp cuối cùng.
- **Kỹ thuật trực quan hóa Grad-CAM (Gradient-weighted Class Activation Mapping)**: Tính toán đạo hàm của điểm số phân lớp đối với bản đồ đặc trưng cuối cùng để sinh bản đồ nhiệt vùng nghi ngờ tổn thương.
- **Các độ đo đánh giá hiệu năng**: Độ chính xác tổng quát (Accuracy), Độ nhạy (Sensitivity/Recall), Độ đặc hiệu (Specificity), Điểm F1-score và Ma trận nhầm lẫn (Confusion Matrix).

### 2.2 Nền tảng công nghệ phát triển hệ thống
- **React Native New Architecture**: Ứng dụng phiên bản 0.88.0 với engine JavaScript Hermes tối ưu hóa bytecode, Fabric Renderer và Nitro Modules.
- **Ngôn ngữ TypeScript**: Bảo đảm tính chặt chẽ về kiểu dữ liệu (Strict Typing), giảm thiểu tối đa lỗi lúc chạy (Runtime Errors).
- **Backend FastAPI**: Nền tảng web API hiệu năng cao dựa trên Python asyncio và Pydantic.
- **Hệ sinh thái Firebase**: Firebase Authentication (xác thực), Cloud Firestore (đồng bộ dữ liệu), Cloud Storage (lưu trữ ảnh) và Firebase Cloud Messaging (thông báo đẩy).

### 2.3 Đặc thù triển khai trên hệ điều hành Android
- **Cơ chế quản lý khóa phần cứng Android Keystore System**:
  - Lưu trữ khóa mật mã AES-256 an toàn trong vùng thực thi tin cậy phần cứng (TEE/StrongBox Keymaster), ngăn ngừa trích xuất khóa ngay cả khi thiết bị Android bị root.
- **Cơ sở dữ liệu SQLite mã hóa (SQLCipher)**: Mã hóa toàn bộ tệp cơ sở dữ liệu trên đĩa ở cấp độ trang (page-level encryption) bằng AES-256-CBC.
- **Runtime suy luận AI trên Android**:
  - **ONNX Runtime Mobile (v1.24.3)**: Tối ưu hóa tính toán ma trận thông qua thư viện native C++ (x86_64, arm64-v8a).
  - **Google LiteRT / TensorFlow Lite (v1.4.0)**: Hỗ trợ thực thi mô hình phân lớp thích ứng với độ trễ cực thấp.
  - **Android System Image Picker**: Cơ chế cấp quyền truy cập ảnh an toàn (`content://`) không yêu cầu quyền đọc toàn bộ bộ nhớ máy (`READ_MEDIA_IMAGES`), bảo vệ quyền riêng tư theo quy chuẩn Google Play Store.

---

## CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1 Phân tích yêu cầu
- **Yêu cầu chức năng (Functional Requirements)**:
  - Nhóm chức năng Bác sĩ: Đăng nhập/Đăng xuất; Quản lý hồ sơ bệnh nhân (tạo mới, sửa, xóa mềm, khôi phục); Quản lý ca bệnh CT; Phân tích lát cắt CT bằng On-Device AI; Trực quan hóa bản đồ nhiệt Grad-CAM; Xuất phiếu kết quả PDF.
  - Nhóm chức năng Quản trị viên: Quản lý tài khoản người dùng; Phê duyệt/Khóa tài khoản bác sĩ; Xem thống kê hệ thống.
- **Yêu cầu phi chức năng (Non-Functional Requirements)**:
  - Thời gian suy luận On-Device < 1500ms trên điện thoại Android tiêu chuẩn.
  - 100% chức năng chẩn đoán cốt lõi hoạt động bình thường khi không có kết nối mạng (Offline-First).
  - Mã hóa 100% dữ liệu sức khỏe và định danh (PII/PHI) trước khi ghi xuống bộ nhớ cục bộ.
  - Giao diện thân thiện, tuân thủ tiêu chuẩn y tế, hỗ trợ 2 chế độ Sáng/Tối và đa ngôn ngữ (Tiếng Việt / Tiếng Anh).

### 3.2 Mô hình hóa hệ thống
- **Sơ đồ Use Case tổng quát**: Phân định rõ 2 tác nhân chính là **Bác sĩ (Doctor)** và **Quản trị viên (Administrator)**.
- **Sơ đồ tuần tự (Sequence Diagram)**:
  - Luồng phân tích AI On-Device ngoại tuyến: Bác sĩ chọn ảnh -> Tiền xử lý native C++ -> ONNX/LiteRT suy luận -> Hiển thị kết quả & Grad-CAM -> Lưu hồ sơ mã hóa.
  - Luồng đồng bộ hai chiều trực tuyến: Đồng bộ hàng đợi Outbox lên FastAPI/Firestore khi có mạng.
- **Sơ đồ lớp và mô hình thực thể liên kết (ERD)**: 6 thực thể chuẩn hóa gồm `AccountEntity`, `PatientEntity`, `CaseEntity`, `CTImageEntity`, `AIPredictionResultEntity`, `DoctorStatsProjection`.

### 3.3 Thiết kế kiến trúc tổng thể
Hệ thống được thiết kế theo mô hình Clean Architecture đa tầng:

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
|  - 17 Màn hình React Native (Figma 59 screens)              |
|  - Design System Tokens (Palette, Spacing, Typography)      |
|  - Theme Provider (Light / Dark) & i18n Localization        |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                       DOMAIN LAYER                          |
|  - Diagnostic Workflows & Case Lifecycle Management         |
|  - Business Entities & Validations (Q-20 Mã BN duy nhất)    |
|  - Storage & Inference Interfaces (ILocalStorageAdapter)    |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                  INFRASTRUCTURE LAYER                       |
|  +---------------------------+ +--------------------------+ |
|  | Native AI Engine (C++/Java)| | Local Storage Engine     | |
|  | - ONNX Runtime Mobile     | | - Encrypted Local Storage| |
|  | - LiteRT Runtime          | | - AES-256-GCM CryptoVault| |
|  | - Pillow Nearest Resample | | - Android Keystore Bridge| |
|  +---------------------------+ +--------------------------+ |
|  +--------------------------------------------------------+ |
|  | Cloud Services (Khi Online): FastAPI / Firebase        | |
|  +--------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### 3.4 Thiết kế cơ sở dữ liệu và tầng lưu trữ an toàn
- **Kiến trúc CSDL SQLite quan hệ kết hợp mã hóa phần cứng (Encrypted SQLite Architecture)**:
  - Do yêu cầu bảo toàn dữ liệu y tế, tránh nghẽn RAM khi nạp toàn bộ mảng JSON lớn của AsyncStorage, hệ thống thiết kế cơ sở dữ liệu SQLite quan hệ chuẩn hóa tại đường dẫn cô lập /data/data/com.anonymous.mobile/databases/lungct_secure_{ownerId}.db.
  - Hệ thống 4 bảng quan hệ chuẩn:
    - secure_patients: Quản lý hồ sơ bệnh nhân, mã định danh, thông tin nhân khẩu và payload mã hóa.
    - secure_cases: Quản lý ca bệnh chụp cắt lớp, khóa ngoại FOREIGN KEY (patient_id) REFERENCES secure_patients(patient_id), trạng thái ca, nhận xét và chẩn đoán của bác sĩ.
    - secure_predictions: Lưu trữ kết quả phân tích AI cục bộ, điểm số 3 lớp bệnh, phiên bản mô hình và độ trễ suy luận.
    - secure_metadata: Ghi nhận trạng thái chuyển dịch dữ liệu (migration status), mốc thời gian và phiên bản CSDL.
- **Phân định ranh giới bảo mật giữa SQLite hiện tại và SQLCipher toàn tệp**:
  - *Mô hình hiện tại*: Sử dụng Android standard SQLite native kết hợp mã hóa trường dữ liệu JSON thực thể (encrypted_payload) bằng thuật toán **AES-256-GCM** với khóa bảo vệ từ Android Keystore.
  - *Dữ liệu/Cột còn đọc được dạng văn bản rõ (Plaintext) nếu trích xuất tệp CSDL thô (Root/Physical Dump)*: Do các cột chỉ mục (patient_code, ull_name, dob, sex, phone, symptoms, status, case_code, scan_date, clinical_note, doctor_comment) được lưu dưới dạng cột SQLite chuẩn để phục vụ truy vấn và lọc dữ liệu tốc độ cao, người có quyền can thiệp cấp hệ thống vẫn có thể đọc được các trường siêu dữ liệu này bằng công cụ SQLite thông thường.
  - *Định hướng chuẩn SQLCipher*: Khóa luận định hướng nâng cấp lên SQLCipher toàn diện ở tầng native C/C++ (mã hóa từng trang đĩa 4096 bytes với AES-256 cipher) để làm mờ hoàn toàn cả tên bảng, tên cột và nội dung chỉ mục trên đĩa vật lý.
- **Cô lập dữ liệu đa người dùng (Multi-Tenancy)**: Khóa lưu trữ cục bộ và tệp SQLite được gắn tiền tố theo mã định danh bác sĩ lungct_secure_{ownerId}.db và @lungct_db/v1/{ownerId}/..., triệt tiêu hoàn toàn nguy cơ rò rỉ chéo thông tin bệnh án giữa các bác sĩ trên cùng một thiết bị.
- **Mã hóa chứng thực Authenticated Encryption**: Sử dụng chuẩn **AES-256-GCM** với IV 96-bit ngẫu nhiên và Authentication Tag 128-bit chống giả mạo ciphertext, tích hợp trực tiếp qua Android Keystore System.
  - Khi tài khoản bác sĩ bị khóa từ máy chủ trung tâm:
    - Xóa toàn bộ dữ liệu đã đồng bộ (`synced`).
    - **Bảo lưu tuyệt đối dữ liệu nháp chưa gửi (`pending` / `conflict`)**.
    - Áp dụng ngoại lệ toàn vẹn khóa ngoại: Giữ lại bản ghi bệnh nhân gốc (dù đã sync) nếu bệnh nhân đó đang có ca nháp chưa đồng bộ gắn liền, ngăn ngừa lỗi đứt gãy quan hệ dữ liệu.

### 3.5 Thiết kế giao diện người dùng
Giao diện ứng dụng được thiết kế bám sát 59 khung thiết kế Figma:
- Thiết lập hệ thống Design Tokens gồm bảng màu y tế, khoảng cách và phông chữ chuẩn.
- Cấu trúc thanh điều hướng Tab Bar 5 mục: Trang chủ (Home), Bệnh nhân (Patients), Ca bệnh (Cases), Thống kê (Stats), Tôi (Profile).
- Màn hình hiển thị kết quả phân tích AI: Trực quan hóa tỷ lệ phần trăm 3 lớp (Lành tính, Ác tính, Bình thường), thanh trượt độ trong suốt Grad-CAM Opacity (0% - 100%) và nút điều hướng chuyển đổi lát cắt.

---

## CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ

### 4.1 Môi trường cài đặt và triển khai
- **Môi trường phát triển**:
  - Máy tính phát triển: Windows 11 Pro 64-bit, CPU AMD Ryzen 7 / Intel Core i7, 32GB RAM.
  - Môi trường di động: Node.js v20.x, React Native 0.88.0, TypeScript 5.x, OpenJDK 17, Android NDK r26c.
- **Môi trường thực nghiệm**:
  - Máy ảo: Android Studio Emulator (Pixel 6 Pro / API 34), kiến trúc x86_64, độ phân giải 1080x1920 (xxhdpi).
  - Thiết bị vật lý mục tiêu: **Xiaomi Redmi 13** (Chip MediaTek Helio G91-Ultra, 8GB RAM, Android 14 HyperOS).

### 4.2 Cài đặt máy chủ và các dịch vụ đám mây (FastAPI, Firebase)
- Trình bày cấu trúc API endpoints của dịch vụ FastAPI phục vụ đồng bộ dữ liệu.
- Thiết lập cấu hình bảo mật Firebase Authentication và Cloud Firestore Security Rules.
- *Lưu ý minh bạch*: Phân hệ máy chủ đang trong quá trình kết nối tích hợp; hiện tại ứng dụng đang tập trung hoàn thiện và kiểm chứng tầng suy luận On-Device ngoại tuyến và tầng lưu trữ cục bộ.

### 4.3 Cài đặt ứng dụng React Native và Tầng suy luận On-Device Android
1. **Triển khai giao diện và điều hướng**:
   - Hoàn thành toàn bộ 17 màn hình chính và các màn hình chi tiết, vượt qua 113/113 bài kiểm thử tự động giao diện.
2. **Cài đặt Engine suy luận On-Device Native C++**:
   - Tích hợp `onnxruntime-react-native` (v1.24.3) và `react-native-fast-tflite` (v3.0.1) qua Nitro Modules.
   - Cài đặt thuật toán nội suy ma trận **Pillow Nearest Resample** về kích thước ma trận `(1, 3, 224, 224)` trong mã native C++, giải quyết triệt để sự sai lệch kết quả giữa Python và Android Bitmap.
   - Thực thi suy luận phiên bản mô hình FP32 nguyên bản (Adaptive ViT + LiteRT Fusion).
3. **Cài đặt Tầng lưu trữ cục bộ an toàn**:
   - Hiện thực hóa lớp `EncryptedLocalStorageService` theo `ILocalStorageAdapter`.
   - Cách ly nghiêm ngặt mã thử nghiệm `CryptoVault` bằng cờ `IS_DEV_SANDBOX_ONLY = true`, đảm bảo an toàn runtime cho ứng dụng di động.
   - Cài đặt thuật toán bảo toàn dữ liệu nháp AUTH-08.

### 4.4 Cấu hình, đóng gói và phát hành phân hệ Android
- Thiết lập cấu hình Gradle `build.gradle`, quy định `minSdkVersion = 29`, `targetSdkVersion = 34`.
- Cấu hình phân tách kiến trúc APK (ABI Split) và tối ưu hóa ProGuard/R8 nhằm giảm dung lượng gói cài đặt phát hành.

### 4.5 Thực nghiệm và đo lường kết quả

#### A. Kết quả kiểm thử tự động (Unit / Integration Tests)
- Toàn bộ hệ thống vượt qua **14/14 test suites** với **138/138 test cases thành công (100%)** trong môi trường Jest sandbox:
  - Giao diện người dùng và điều hướng: 113/113 test cases pass.
  - Tầng lưu trữ và bảo mật (`localStorageService.test.ts`): 13/13 test cases pass (mã hóa chứng thực AES-256-GCM, bắt lỗi sai khóa, chống trùng lặp mã bệnh nhân Q-20, migration schema, cô lập dữ liệu đa người dùng và kịch bản biên AUTH-08).
  - Tích hợp nghiệp vụ bệnh nhân (`patientRepository.test.ts`): 7/7 test cases pass (tự động seed dữ liệu mẫu giả lập ban đầu cho bác sĩ, thêm bệnh nhân mới có mã hóa không lưu plaintext, sửa thông tin, giả lập đóng app và mở lại đọc lại nguyên vẹn, tách biệt tuyệt đối giữa 2 bác sĩ, bắt lỗi sai khóa giải mã, và **kiểm tra chặn lưu dữ liệu khi thiếu module mã hóa an toàn**).
  - Tích hợp nghiệp vụ ca bệnh (`caseRepository.test.ts`): 5/5 test cases pass (tự động seed danh sách ca bệnh mẫu ban đầu, tạo ca mới cho bệnh nhân có mã hóa AES-256-GCM không lưu plaintext, cập nhật ghi chú bác sĩ bền vững, giả lập đóng app/kill tiến trình và mở lại nạp lại đầy đủ ca bệnh và ghi chú từ kho mã hóa, cô lập ca bệnh giữa 2 tài khoản bác sĩ).
  - *Đính chính khoa học về phạm vi kiểm thử*: Kết quả kiểm thử 5 trường (Họ tên, Triệu chứng, Ngày sinh, Giới tính, Số điện thoại) trong `patientRepository.test.ts` được xác lập trong **Jest In-Memory Mock Sandbox** (Node.js runtime); trên **máy ảo Android qua APK Release**, ta mới kiểm chứng trực tiếp tương tác UI cho Họ tên và Mã bệnh nhân (`Le_Van_Sua_Da_Cap_Nhat`, `BN-2026-888`). Tuyệt đối không đánh đồng kết quả mock trong bộ nhớ với việc đã đo kiểm thực tế toàn bộ 5 trường trên giao diện máy ảo.
  - *Chính sách bảo vệ*: Đã loại bỏ hoàn toàn cơ chế mã hóa dự phòng bằng hash/xor thô sơ; nếu native module chưa sẵn sàng thì hệ thống từ chối lưu và báo lỗi rõ ràng, không thông báo đã lưu. Phân định rõ cơ chế đăng nhập hiện tại là Mock Auth (UI-05), lọc `ownerId` là cô lập logic ứng dụng chứ chưa phải phân quyền hoàn chỉnh. Không tự khẳng định phần cứng TEE/StrongBox nếu chưa đo kiểm qua `KeyInfo` trên thiết bị thật.

#### B. Kết quả thực nghiệm suy luận kỹ thuật AI On-Device trên Máy ảo Android x86_64 API 34
Thực nghiệm đo lường thời gian suy luận kỹ thuật trên môi trường giả lập Android Studio Emulator (`sdk_gphone64_x86_64`, Android 14 API 34, CPU x86_64, RAM 2.5 GB) ở chế độ ngoại tuyến hoàn toàn (`svc wifi disable` & `svc data disable`):

- **Mẫu CT đối chứng**: Ảnh chuẩn `Benign/Bengin case (114).jpg` từ bộ dữ liệu IQ-OTH/NCCD, số lần đo: chạy đối chứng độc lập qua 2 phương thức thực thi (chương trình nhị phân Native C++ Runner và ứng dụng Android APK Release).
- **Kết quả đo lường chi tiết**:

| Phương thức thực thi | Thành phần thực thi | Thời gian thực thi | Kết quả dự đoán | Đánh giá kỹ thuật |
| :--- | :--- | :---: | :---: | :--- |
| **1. Native C++ Runner (NDK)** | Tiền xử lý + Nạp Session<br>ViT ONNX (FP32)<br>Fusion LiteRT (FP32)<br>**Tổng thời gian suy luận Native** | ~707 ms<br>804.04 ms<br>1,027.29 ms<br>**1,831.32 ms** | Benign: `0.97285`<br>Malignant: `0.00019`<br>Normal: `0.02696`<br>**Nhãn: Benign** | Khớp chính xác tuyệt đối với kết quả kiểm chứng chuyển đổi FP32 tại MOB-01 (sai số $\le 10^{-7}$). |
| **2. Ứng dụng Android APK UI (`app-release.apk`)** | Tiền xử lý Bitmap Android<br>ViT ONNX Module<br>Fusion LiteRT Module<br>**Tổng độ trễ suy luận trong App** | N/A (Decode trực tiếp)<br>1,475.20 ms<br>104.80 ms<br>**1,580.00 ms** | Benign: **0.97282**<br>Malignant: **0.00029**<br>Normal: **0.02689**<br>**ScoreCard: 0.973 / 0.000 / 0.027** | Sai số $\Delta_{\max} \le 9.89 \times 10^{-5}$ do khác biệt giải mã JPEG giữa Android Bitmap và Pillow. Nhãn dự đoán hoàn toàn đồng nhất. |

*(Lưu ý khoa học: Con số trên là thời gian suy luận kỹ thuật của vi xử lý trên môi trường giả lập máy ảo, tuyệt đối không được gọi là "độ trễ lâm sàng" - clinical latency; hệ thống chưa qua đo kiểm thời gian tác nghiệp lâm sàng với bác sĩ tại bệnh viện).*

#### C. Kiểm nghiệm tính bền vững qua vòng đời ứng dụng Android (ADB Life-cycle Test)
- Đã thực hiện kiểm chứng độ bền vững qua chu trình tắt hẳn ứng dụng:
  1. Thao tác ghi cấu hình người dùng (tùy chọn giao diện `@lungct/theme_preference = dark` và ngôn ngữ) vào cơ sở dữ liệu SQLite của AsyncStorage tại đường dẫn `/data/data/com.anonymous.mobile/databases/AsyncStorage`.
  2. Dùng lệnh `adb shell am force-stop com.anonymous.mobile` để hủy hoàn toàn tiến trình ứng dụng khỏi bộ nhớ RAM.
  3. Mở lại ứng dụng bằng lệnh `adb shell am start -n com.anonymous.mobile/.MainActivity`.
  4. **Kết quả xác minh cấu hình**: Tùy chọn giao diện (theme/ngôn ngữ) được khôi phục nguyên vẹn 100% từ đĩa.
  5. **Kiểm nghiệm thực tế Tầng lưu trữ Bệnh nhân trên bản build APK Release mới (`app-release.apk`)**:
     - *Tích hợp Native Module*: Đã biên dịch thành công module Kotlin `NativeCryptoVaultModule.kt` kết nối hệ thống Android Keystore (`AndroidKeyStore`), sinh khóa AES-256-GCM theo alias từng bác sĩ (`LungCt_Doctor_VaultKey_<ownerId>`). Đồng thời, module AI `LungCtPipelineModule` (chứa Resampler C++, ViT ONNX Runtime và Fusion TFLite) được đăng ký song song trong `LungCtNativePackage.kt` và hoạt động ổn định, không phát sinh xung đột tài nguyên native.
     - *Quy tắc quản lý khóa an toàn*: Không tự xóa khóa cũ hoặc tạo khóa mới khi còn dữ liệu cần giải mã; bắt lỗi rõ ràng và yêu cầu quy trình khôi phục (`CORRUPTED_KEY_RECOVERY_REQUIRED`); chỉ xóa khóa theo một luồng xóa dữ liệu được xác định rõ (`deleteKeystoreKey`).
     - *Thực nghiệm Thêm bệnh nhân mới*: Trên giao diện Bác sĩ, mở modal thêm bệnh nhân mới `BN-2026-888` (`Le_Van_Sua`), hệ thống mã hóa AES-256-GCM qua Native Keystore và hiển thị thông báo đã bảo vệ an toàn.
     - *Thực nghiệm Sửa thông tin bệnh nhân*: Bấm icon bút chì trên chi tiết `BN-2026-888`, modal chuyển chế độ "Sửa thông tin bệnh nhân", khóa mã bệnh nhân (read-only), sửa tên thành `Le_Van_Sua_Da_Cap_Nhat`, bấm "Lưu thay đổi" và xác nhận thành công.
     - *Thực nghiệm vòng đời (Life-cycle Persistence sau khi sửa)*: Chạy lệnh `adb shell am force-stop com.anonymous.mobile` tắt hoàn toàn ứng dụng, sau đó mở lại app bằng `am start` và đăng nhập lại bác sĩ: Bệnh nhân `BN-2026-888` **hiển thị nguyên vẹn với tên đã cập nhật mới**, minh chứng dữ liệu sửa đổi được mã hóa và ghi bền vững xuống bộ nhớ đĩa.
     - *Thực nghiệm Xóa mềm (Thùng rác) và Khôi phục (Restore)*:
       - Mở chi tiết `BN-2026-888` → Menu 3 chấm → Chọn "Xóa mềm bệnh nhân vào thùng rác" → Xác nhận xóa. Bệnh nhân được ẩn khỏi tab "Tất cả" và chuyển vào tab "Thùng rác" mang badge `Đã xóa` (`status: 'TRASHED'`).
       - Tắt hẳn app (`am force-stop`) và mở lại app: Dữ liệu thùng rác được bảo toàn nguyên vẹn trên đĩa, hồ sơ vẫn nằm trong tab "Thùng rác".
       - Bấm vào hồ sơ trong Thùng rác → Hiển thị hộp thoại "Khôi phục bệnh nhân" → Bấm "Khôi phục". Bệnh nhân lập tức trở lại danh sách hoạt động trong tab "Tất cả" với trạng thái `ACTIVE`.
     - *Kiểm tra trực tiếp tệp cơ sở dữ liệu trên đĩa (Ciphertext Verification)*:
       - Kiểm tra tệp SQLite của AsyncStorage tại đường dẫn `/data/data/com.anonymous.mobile/databases/AsyncStorage`.
       - Dùng lệnh `strings` quét toàn bộ tệp cơ sở dữ liệu để tìm kiếm từ khóa họ tên và mã bệnh nhân (`Le_Van_Sua`, `BN-2026-888`): **Hoàn toàn KHÔNG tìm thấy bất kỳ chuỗi văn bản rõ (plaintext) nào**.
       - Truy vấn SQL trực tiếp bảng `Storage` trên thiết bị: Bản ghi `@lungct_db/v1/usr-doc-01/patients` lưu trữ chuỗi nhị phân mã hóa định dạng `ENC:KEYSTORE:AES-GCM:v1:...` với kích thước 2.761 bytes. Khẳng định 100% dữ liệu bệnh nhân trên đĩa được mã hóa AES-256-GCM bảo vệ an toàn cấp bản ghi.
     - *Rà soát toàn diện các vị trí lưu trữ dữ liệu nhạy cảm trên hệ điều hành Android*:
       - **Bộ nhớ AsyncStorage**: Dữ liệu cấu trúc bệnh nhân và ca bệnh được mã hóa AES-256-GCM trước khi ghi xuống bảng `Storage`.
       - **Thư mục tệp ảnh (`/data/data/com.anonymous.mobile/files/`)**: Thư mục `test_images/` chỉ lưu các lát cắt CT mẫu đối chứng benchmark từ bộ dữ liệu mở IQ-OTH/NCCD; chưa phát sinh lưu trữ ảnh chụp DICOM thực tế của bệnh nhân.
       - **Bộ nhớ đệm Cache (`/data/data/com.anonymous.mobile/cache/`)**: Rà soát thư mục cache chỉ chứa các tệp font hệ thống Expo (`.ttf`) và tệp khóa tạm `AsyncStorage.lck`, hoàn toàn không có ảnh tạm thời hay dữ liệu văn bản rò rỉ.
       - **Nhật ký hệ thống (Android Logcat)**: Đã lọc và theo dõi tiến trình `com.anonymous.mobile`, tuyệt đối không in thông tin định danh hay bệnh án (PII/PHI) ra logcat.
        - *Phân định ranh giới khoa học*: Việc kiểm tra các chuỗi mẫu thực tế (`Le_Van_Sua`, `BN-2026-888`) là minh chứng thực nghiệm xác thực cơ chế mã hóa hoạt động đúng trên AsyncStorage. Hệ thống đã hoàn thiện bước tiếp theo với kiến trúc CSDL SQLite quan hệ có mã hóa (mục bên dưới).
      - *Thực nghiệm Tầng CSDL SQLite Native có mã hóa trên tệp đĩa thực tế (`lungct_secure_usr_doc_01.db`)*:
        - **Dịch vụ chuyển đổi an toàn (Zero Data Loss Migration)**: Tự động phát hiện và di chuyển 6 bệnh nhân gốc từ AsyncStorage cũ vào CSDL SQLite mới. Toàn bộ tệp AsyncStorage cũ (24.576 bytes) được bảo lưu nguyên vẹn 100%, bảng `secure_metadata` ghi nhận `sqlite_migration_status = 'COMPLETED'` và `sqlite_migration_patient_count = 6`.
        - **Kiểm tra tính Idempotency và Khả năng phục hồi (Resume)**: Bộ kiểm thử `sqliteMigration.test.ts` (141/141 tests pass 100%) và thực nghiệm trên máy ảo xác nhận khi quy trình chuyển đổi chạy lại nhiều lần hoặc bị gián đoạn, cơ chế `INSERT OR REPLACE INTO` ngăn chặn hoàn toàn hiện tượng nhân đôi bản ghi.
        - **Nghiệp vụ Bệnh nhân trên SQLite**: Tạo bệnh nhân `BN-2026-SQLITE` (`Bui_Duc_SQLite`), bảng `secure_patients` tăng từ 6 lên 7 bản ghi có mã hóa AES-256-GCM qua Android Keystore.
        - **Nghiệp vụ Ca bệnh và Khóa ngoại (Foreign Key)**: Tạo ca bệnh `CA-2026-000005` gắn với bệnh nhân `BN-2026-SQLITE`, bảng `secure_cases` tăng lên 5 ca bệnh, khóa ngoại tham chiếu chính xác.
        - **Nhận xét chẩn đoán của Bác sĩ**: Cập nhật nhận xét lâm sàng *"Benh_nhan_co_not_mo_phoi_phai"*, hệ thống mã hóa và ghi nhận revision 2 xuống SQLite đĩa.
        - **Phân tích On-Device AI và Lưu trữ Kết quả**: Thực hiện suy luận AI FP32 trên lát cắt CT #42 (ViT 2.842 ms, Fusion 902 ms, nhãn Normal 99.92%), lưu trữ bản ghi `res_1793118243771_jb5ws` vào bảng `secure_predictions`.
        - **Xác thực Vòng đời Đóng/Mở lại Ứng dụng**: Chạy `adb shell am force-stop com.anonymous.mobile` tắt hoàn toàn ứng dụng, sau đó mở lại app: Toàn bộ 7 bệnh nhân, 5 ca bệnh, nhận xét bác sĩ và kết quả AI đọc lại đầy đủ 100% từ đĩa SQLite (tệp kích thước 61.440 bytes).
      - *Bảng phân định 3 trạng thái độc lập (Nguyên tắc trung thực khoa học)*:
        | Nghiệp vụ / Tính năng | 1. Đã viết mã (Code Complete) | 2. Đạt Jest Sandbox (Node.js Mock In-Memory) | 3. Đã kiểm thử trên APK Máy ảo (Real Android SQLite on Disk) |
        | :--- | :---: | :---: | :---: |
        | Khởi tạo CSDL SQLite Native (`lungct_secure_*.db`) | Đạt | Đạt | Đạt (Kích thước đĩa 61.440 bytes) |
        | Chuyển đổi dữ liệu cũ (Zero Data Loss) | Đạt | Đạt (141/141 tests) | Đạt (Di chuyển 6 bệnh nhân gốc an toàn) |
        | Khả năng chạy lại & phục hồi (Resume) | Đạt | Đạt (`sqliteMigration.test.ts`) | Đạt (Không trùng lặp bản ghi) |
        | Thao tác Bệnh nhân (Thêm/Sửa/Thùng rác) | Đạt | Đạt | Đạt (`BN-2026-SQLITE`, tổng 7 BN) |
        | Tạo Ca bệnh & Khóa ngoại liên kết | Đạt | Đạt | Đạt (`CA-2026-000005`, tổng 5 ca) |
        | Nhận xét Bác sĩ có mã hóa an toàn | Đạt | Đạt | Đạt (Ghi chú `Benh_nhan_co_not_mo_phoi_phai`) |
        | Lưu kết quả On-Device AI vào SQLite | Đạt | Đạt | Đạt (`res_1793118243771_jb5ws`, latency 3.744ms) |
        | Vòng đời sau đóng/mở lại app (`am force-stop`) | Đạt | Đạt | Đạt (Đọc lại 100% từ đĩa SQLite) |
     - *Kiểm tra suy luận AI trên APK mới*: Chạy phân tích AI trên ca bệnh `CA-2026-000045` lát cắt #1: ViT ONNX đạt 995 ms, Fusion TFLite đạt 865 ms, kết quả Normal (99.92%), xác nhận các Native Module AI không bị gián đoạn hay ảnh hưởng bởi CryptoVault.
     - *Phân định ranh giới Jest và Native*: Bộ kiểm thử Jest (15/15 suites, 141/141 tests) thực hiện kiểm chứng các tình huống biên và bắt ngoại lệ mật mã học: sửa bệnh nhân và đóng/mở lại đọc đúng thông tin, thiếu/mất khóa giải mã `KEY_NOT_FOUND`, dữ liệu bị sửa đổi trái phép `AEADBadTagException`, thiếu native module `NATIVE_CRYPTO_UNAVAILABLE`; thực nghiệm trên máy ảo Android APK xác nhận hoạt động thực tế của luồng người dùng và tính bền vững trên đĩa.
     - *Minh bạch về phần cứng*: Máy ảo x86_64 chạy Software Keymaster; mức độ bảo vệ phần cứng (TEE/StrongBox) cần được kiểm chứng qua `KeyInfo` trên thiết bị vật lý thật.

#### D. Trạng thái thực nghiệm trên Thiết bị vật lý thật (Xiaomi Redmi 13)
- **Trạng thái**: Đang trong quá trình chuẩn bị để cài đặt và đo kiểm trên thiết bị vật lý thật.
- **Cam kết khoa học**: Khóa luận tuyệt đối không lấy kết quả trên máy ảo làm kết quả trên điện thoại thật. Số liệu thực tế về RAM, nhiệt độ, mức tiêu hao pin và thời gian suy luận trên chip MediaTek Helio G91-Ultra sẽ được cập nhật đầy đủ sau khi hoàn tất đo đạc trên thiết bị thật.

### 4.6 Đánh giá và so sánh hai phân hệ Android - iOS
So sánh các giải pháp kỹ thuật giữa phân hệ Android (Dương Thị Thu Diễm) và phân hệ iOS (Dương Hải Đăng):

| Tiêu chí | Phân hệ Android | Phân hệ iOS |
| :--- | :--- | :--- |
| **Lập trình viên thực hiện** | **Dương Thị Thu Diễm** | **Dương Hải Đăng** |
| **Nền tảng kiểm thử mục tiêu**| Android SDK 34 / Xiaomi Redmi 13 | iOS 17+ / iPhone vật lý |
| **Runtime AI On-Device** | ONNX Runtime Native C++ + LiteRT C API | Đang khảo sát CoreML vs ONNX Runtime iOS |
| **Tăng tốc phần cứng** | CPU đa luồng / NNAPI / Vulkan | Apple Neural Engine (ANE) / Metal |
| **Quản lý khóa an toàn** | Android Keystore System (AES-256-GCM, định hướng TEE/StrongBox) | Định hướng iOS Keychain Services & Secure Enclave |
| **Trạng thái thực nghiệm AI** | **Đã chạy phân loại trên máy ảo (1.580 ms)** | **Đang trong giai đoạn nghiên cứu chuyển đổi** |

---

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết quả đạt được
1. Hiện thực hóa thành công bộ khung giao diện theo thiết kế 59 màn hình Figma bằng React Native New Architecture trên Android, vượt qua 113/113 bài kiểm thử UI.
2. Tích hợp và kiểm chứng thành công pipeline suy luận phân loại Trí tuệ nhân tạo biên (On-Device AI) trên Android với mô hình AACNN-ViT Adaptive FP32 (ONNX Runtime Mobile + LiteRT), đạt thời gian suy luận kỹ thuật ~1.580 ms trên máy ảo Android x86_64 hoàn toàn ngoại tuyến.
3. Giải quyết triệt để vấn đề sai lệch tiền xử lý ảnh bằng thuật toán Native C++ Pillow Nearest Resample, sai số so với Python chỉ ở mức giải mã JPEG ($\le 9.89 \times 10^{-5}$).
4. Hiện thực hóa và kiểm chứng thành công tầng lưu trữ cục bộ mã hóa:
   - Module Native Android Keystore (`NativeCryptoVaultModule.kt`) quản lý khóa AES-256-GCM gắn theo tài khoản bác sĩ, có cơ chế bảo vệ khóa nghiêm ngặt không tự xóa khóa khi còn dữ liệu.
   - Kiểm chứng thực tế trên APK Release mới cài đặt trên máy ảo Android: thêm bệnh nhân, đóng hẳn app (`force-stop`), mở lại đọc lại nguyên vẹn và chuyển vào thùng rác thành công.
   - Vượt qua 133/133 bài kiểm thử Jest (100%), chứng minh tính toàn vẹn, bảo toàn dữ liệu nháp AUTH-08 và cô lập logic người dùng.

### 5.2 Hạn chế
- **Grad-CAM On-Device**: Chưa hoàn thành giải pháp trích xuất activation maps thuần C++ không cần Autograd trên thiết bị di động; giao diện hiện tại mới hiển thị bản đồ nhiệt giả lập/mô phỏng UI.
- **Tầng lưu trữ cục bộ**: Chưa tích hợp cơ chế mã hóa cấp toàn bộ tệp nhị phân (SQLCipher) ở tầng C/C++; hiện mới đạt mức CSDL SQLite quan hệ mã hóa trường payload JSON bằng AES-256-GCM qua Android Keystore, các cột chỉ mục truy vấn vẫn ở dạng plaintext trên file thô. Việc bảo vệ phần cứng qua TEE/StrongBox mới chạy trên Software Keymaster của máy ảo và cần đo kiểm bằng KeyInfo trên điện thoại thật.
- **Xuất báo cáo PDF**: Mới dừng lại ở màn hình cấu hình xem trước theo Figma (`ExportPdfScreen.tsx`), chưa tích hợp thư viện native tạo tệp PDF vật lý.
- **Đo kiểm thiết bị thật**: Chưa hoàn tất nạp APK và đo kiểm thực tế trên điện thoại vật lý Xiaomi Redmi 13.
- **Quy chuẩn y tế & Pháp lý**: Hệ thống chỉ tham khảo các nguyên tắc thiết kế bảo vệ dữ liệu cá nhân; chưa có chứng nhận hoặc kiểm định pháp lý lâm sàng/HIPAA.

### 5.3 Hướng phát triển
- Nạp bản build APK Release lên điện thoại Xiaomi Redmi 13 thật để đo kiểm độ trễ thực tế, nhiệt độ, mức tiêu hao pin và mức độ bảo vệ phần cứng TEE của Android Keystore.
- Nghiên cứu hiện thực hóa thuật toán Grad-CAM On-Device không Autograd cho mô hình AACNN-ViT.
- Khảo sát tích hợp SQLite mã hóa (SQLCipher) ở tầng native và thư viện sinh tệp PDF y tế theo chuẩn lâm sàng (gói PDF-01).
- Hoàn thiện kết nối Backend FastAPI và cơ chế đồng bộ đám mây hai chiều khi trực tuyến.

---

## TÀI LIỆU THAM KHẢO

1. **H. Sung, et al.** (2024). *Global cancer statistics 2024: GLOBOCAN estimates of incidence and mortality worldwide for 34 cancers in 186 countries*. CA: A Cancer Journal for Clinicians, 76(4), e70090.
2. **National Lung Screening Trial Research Team** (2011). *Reduced lung-cancer mortality with low-dose computed tomographic screening*. New England Journal of Medicine, 365(5), 395-409.
3. **M. I. Rahman, et al.** (2026). *AACNN-ViT: Adaptive attention-augmented convolutional and vision transformer fusion for lung cancer detection*. Journal of Imaging, 12(2), Art. no. 62.
4. **A. Dosovitskiy, et al.** (2020). *An image is worth 16x16 words: Transformers for image recognition at scale*. ICLR 2021.
5. **R. R. Selvaraju, et al.** (2017). *Grad-CAM: Visual explanations from deep networks via gradient-based localization*. ICCV 2017, 618-626.
6. **Google LLC** (2026). *Android Keystore System Documentation & Cryptographic Architecture*. Android Developers.
7. **Meta Platforms, Inc.** (2026). *React Native New Architecture: Fabric & TurboModules Documentation*. React Native.
8. **Microsoft Corporation** (2026). *ONNX Runtime Mobile Documentation*. Microsoft Open Source.
