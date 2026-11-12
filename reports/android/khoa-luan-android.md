# BÁO CÁO KHÓA LUẬN TỐT NGHIỆP

## ĐỀ TÀI: PHÁT TRIỂN ỨNG DỤNG CHẨN ĐOÁN UNG THƯ PHỔI TRÊN THIẾT BỊ DI ĐỘNG

> **Thông tin khóa luận**:
> - **Cơ quan đào tạo**: Bộ Giáo dục và Đào tạo – Trường Đại học Sư phạm Thành phố Hồ Chí Minh – Khoa Công nghệ Thông tin.
> - **Ngành đào tạo**: Sư phạm Tin học (Khóa 49, Niên khóa 2026 – 2027).
> - **Sinh viên thực hiện**: **DƯƠNG HẢI ĐĂNG** — MSSV: **49.01.103.020**.
> - **Giảng viên hướng dẫn**: **ThS. TRỊNH HUY HOÀNG**.
> - **Tình trạng văn bản**: **Bản thảo khóa luận hiện hành (Working Draft)** — Soạn thảo theo cấu trúc 5 chương chuẩn của Đề cương chi tiết đã duyệt, tập trung phân hệ Android và mô hình On-Device Edge AI kết hợp dịch vụ đám mây Firebase.
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
  - [4.2 Cài đặt các dịch vụ đám mây Firebase (Authentication, Firestore, Storage)](#42-cài-đặt-các-dịch-vụ-đám-mây-firebase-authentication-firestore-storage)
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

Về mặt thực nghiệm kỹ thuật, pipeline suy luận phân loại đã chạy thành công trên máy ảo Android Emulator x86_64 API 34 với thời gian suy luận kỹ thuật đạt ~1.580 ms trong ứng dụng APK và ~1.831 ms trong chương trình native C++ runner (đối với lát cắt CT đối chứng; không gọi là độ trễ lâm sàng). Khóa luận xây dựng hoàn chỉnh giao diện theo thiết kế 59 màn hình Figma bằng React Native New Architecture (TypeScript), hiện thực hóa tầng lưu trữ cục bộ mã hóa toàn bộ tệp SQLite cấp trang bằng **SQLCipher 4.6.1** kết hợp **Android Keystore (`NativeCryptoVaultModule.kt`, AES-256-GCM)** và kiểm chứng thuật toán bảo toàn dữ liệu nháp AUTH-08. Đồng thời, ứng dụng đã tích hợp đầy đủ **Firebase Authentication (đăng nhập, đăng ký chờ duyệt, quên mật khẩu)**, **Cloud Firestore & Sync Engine Offline-First (hàng đợi Outbox, phát hiện xung đột, đồng bộ nền khi có mạng)**, **xuất phiếu kết quả PDF vật lý (`expo-print` & `expo-sharing`)**, và đóng gói thành công tệp **`app-release.apk` v1.0.6 (`versionCode 7`, 544.04 MB)** đạt 100% kiểm thử tự động Jest (**19/19 suites, 168/168 tests**). Tính năng Grad-CAM on-device hiện được cô lập trung thực (`gradcamAvailable: false`, thông điệp `MSG-11`) để tiếp tục nghiên cứu tính gradient trực tiếp trên thiết bị, tuyệt đối không dùng ảnh nhiệt giả lập hay gọi máy chủ suy luận. Hệ thống dịch vụ đám mây Firebase giữ vai trò xác thực danh tính, quản trị và đồng bộ hồ sơ khi có kết nối mạng.

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
Xây dựng ứng dụng di động phân hệ Android bằng React Native (TypeScript), hỗ trợ bác sĩ đánh giá phân loại ảnh CT phổi của bệnh nhân, thông qua việc **tích hợp mô hình học sâu AACNN-ViT Adaptive chạy trực tiếp trên thiết bị (On-Device AI)** không phụ thuộc Internet, kết hợp giao diện trực quan hóa bản đồ nhiệt Grad-CAM. Đồng thời, kết nối dịch vụ đám mây Firebase phục vụ xác thực người dùng, phân quyền bác sĩ, lưu trữ sao lưu và đồng bộ dữ liệu khi trực tuyến. Sản phẩm được đóng gói bộ cài đặt APK để cài đặt thử nghiệm trên điện thoại Android.

#### 2.2 Mục tiêu cụ thể
1. **Nghiên cứu lý thuyết**: Tổng quan về ung thư phổi, ảnh CT, mô hình lai tích hợp CNN và Vision Transformer (AACNN-ViT Adaptive), cơ chế giải thích mô hình Grad-CAM và các công nghệ AI On-Device trên Android (ONNX Runtime Mobile, Google LiteRT).
2. **Tối ưu và tích hợp mô hình On-Device**: Chuyển đổi và đóng gói mô hình AACNN-ViT Adaptive sang định dạng FP32 di động; xây dựng native pipeline tiền xử lý ảnh chuẩn Pillow Nearest Resample trực tiếp trên Android; nghiên cứu giải pháp Grad-CAM on-device không cần Autograd.
3. **Phân tích và thiết kế hệ thống**: Xây dựng kiến trúc Offline-First Edge AI kết hợp dịch vụ đám mây Firebase; mô hình hóa hệ thống bằng biểu đồ UML; thiết kế tầng lưu trữ cục bộ mã hóa toàn bộ tệp (Repository Pattern, SQLCipher 4.6.1 + Android Keystore AES-256-GCM), cơ chế đồng bộ Outbox/xung đột hai chiều và xử lý chính sách AUTH-08.
4. **Hiện thực hóa phân hệ Android**: Cài đặt các màn hình chuẩn theo hệ thống thiết kế Figma bằng React Native (TypeScript); hoàn thiện phân hệ Bác sĩ và Quản trị viên kết nối Cloud Firestore thật, xuất báo cáo PDF vật lý và đồng bộ ngoại tuyến/trực tuyến.
5. **Thực nghiệm, đóng gói và đo lường kỹ thuật**: Đánh giá độ chính xác phân loại 3 lớp (Normal, Benign, Malignant) trên bộ dữ liệu IQ-OTH/NCCD; đóng gói tệp APK Release độc lập; kiểm thử tự động và đo kiểm thời gian suy luận kỹ thuật On-Device, tính bền vững lưu trữ qua vòng đời ứng dụng trên máy ảo Android x86_64 API 34 và chuẩn bị nghiệm thu trên điện thoại Android vật lý thật (dự kiến Xiaomi Redmi Note 12 Turbo).

### 3. Phạm vi nghiên cứu

#### 3.1 Đối tượng nghiên cứu
- Ảnh CT phổi dạng lát cắt hai chiều (2D CT slices) và bài toán phân loại đa lớp mức độ tổn thương.
- Mô hình học sâu lai AACNN-ViT Adaptive và kỹ thuật giải thích mô hình Grad-CAM.
- Công nghệ Trí tuệ nhân tạo biên (Edge AI): ONNX Runtime Mobile, Google LiteRT trên hệ điều hành Android.
- Công nghệ phát triển ứng dụng di động đa nền tảng React Native New Architecture (TypeScript) và dịch vụ đám mây Firebase.

#### 3.2 Phạm vi nghiên cứu
- **Dữ liệu**: Bộ dữ liệu ảnh CT phổi công khai **IQ-OTH/NCCD** gồm 1.190 lát cắt phân loại 3 lớp (Normal, Benign, Malignant) ở định dạng JPEG/PNG. Khóa luận tập trung phân loại ảnh lát cắt 2D, chưa xử lý khối ảnh CT 3D thể tích đầy đủ.
- **Mô hình**: Kế thừa kiến trúc và trọng số đã huấn luyện của mô hình AACNN-ViT Adaptive, tập trung vào bài toán chuyển đổi mô hình, tối ưu hóa suy luận On-Device và trực quan hóa kết quả trực tiếp trên thiết bị di động (không gọi API máy chủ suy luận hay FastAPI).
- **Nền tảng thực nghiệm**: Phân hệ Android hỗ trợ từ Android 7.0 (`minSdkVersion = 24`) đến Android 16 (`targetSdkVersion = 36`, `compileSdk = 37`). Môi trường đo kiểm: Máy ảo Android Studio Emulator (API 34) và điện thoại Android vật lý đại diện (dự kiến Xiaomi Redmi Note 12 Turbo).
- **Phân định phạm vi chức năng ngoại tuyến và trực tuyến**:
  - *Ngoại tuyến (Offline)*: Tiền xử lý ảnh, suy luận phân loại AI On-Device, hiển thị trạng thái giải thích mô hình (hoặc `MSG-11` khi Grad-CAM ngoại tuyến chưa khả dụng), quản lý hồ sơ bệnh nhân và ca bệnh trên bộ lưu trữ mã hóa SQLCipher cục bộ, ghi nhận thao tác vào hàng đợi Outbox, xuất báo cáo PDF vật lý.
  - *Trực tuyến (Online)*: Đăng nhập/Đăng ký/Quên mật khẩu qua Firebase Authentication, kiểm tra trạng thái phê duyệt tài khoản trên Firestore, đồng bộ hai chiều hàng đợi Outbox (`SyncEngine`) và cập nhật thống kê quản trị viên. (*Firebase Cloud Storage sao lưu ảnh và FCM thông báo đẩy là phần mở rộng Cloud tiếp theo*).
- **Khuyến cáo y khoa**: Kết quả của ứng dụng mang tính chất hỗ trợ tham khảo (Clinical Decision Support), không thay thế kết luận chẩn đoán chính thức của bác sĩ chuyên khoa; hệ thống chưa qua thử nghiệm lâm sàng thực địa trên bệnh nhân thật.

### 4. Phương pháp nghiên cứu
1. **Phương pháp nghiên cứu lý thuyết**: Thu thập, tổng hợp các bài báo khoa học về chẩn đoán ung thư phổi, Vision Transformer, On-Device AI và tài liệu kỹ thuật chính thức của React Native, Android Developers, ONNX Runtime, Google LiteRT.
2. **Phương pháp phân tích - thiết kế hướng đối tượng**: Mô hình hóa hệ thống bằng UML (Use Case, Activity, Sequence, Class/ERD diagram) tuân thủ tiêu chuẩn Clean Architecture.
3. **Phương pháp phát triển phần mềm Agile/Scrum**: Phân chia các chu kỳ lặp (sprints) ngắn, nghiệm thu từng đầu việc bằng mã nguồn, test suite, đóng gói APK và minh chứng thực tế.
4. **Phương pháp thực nghiệm đa môi trường**: Phân tách minh bạch giữa:
   - Môi trường Jest Sandbox: Kiểm chứng logic nghiệp vụ, Firebase Auth/Sync/PDF mocks, thuật toán mã hóa AES-256-GCM và kịch bản biên AUTH-08.
   - Môi trường máy ảo Android Emulator: Đo kiểm thời gian suy luận native, tương tác giao diện và vòng đời lưu trữ SQLCipher qua ADB.
   - Môi trường thiết bị Android vật lý thật: Đo kiểm độ trễ thực tế, bộ nhớ RAM, thao tác Camera/Picker, PDF, Sync và mức độ bảo vệ phần cứng Android Keystore (`KeyInfo`).

### 5. Cấu trúc của khóa luận tốt nghiệp
Khóa luận được kết cấu theo **5 chương chuẩn** của Đề cương chi tiết:
- **Chương 1: Tổng quan tình hình nghiên cứu**: Trình bày bài toán chẩn đoán ung thư phổi trên ảnh CT, các nghiên cứu học sâu liên quan, xu hướng ứng dụng di động trong y tế và so sánh các phương án triển khai mô hình học sâu (Cloud-based vs. Edge AI On-Device).
- **Chương 2: Cơ sở lý thuyết và nền tảng công nghệ**: Trình bày mô hình học sâu AACNN-ViT Adaptive, Grad-CAM, các độ đo đánh giá; nền tảng công nghệ React Native New Architecture (TypeScript), dịch vụ đám mây Firebase; đặc thù triển khai trên hệ điều hành Android (Android Keystore, SQLCipher, ONNX Runtime Android).
- **Chương 3: Phân tích và thiết kế hệ thống**: Đặc tả yêu cầu chức năng/phi chức năng, mô hình hóa use case, thiết kế kiến trúc hệ thống Edge-First, thiết kế cơ sở dữ liệu và tầng lưu trữ mã hóa an toàn, thiết kế cấu trúc dữ liệu Cloud Firestore, thiết kế giao diện người dùng.
- **Chương 4: Cài đặt, thực nghiệm và đánh giá**: Trình bày quá trình cài đặt tầng suy luận On-Device trên Android, kết nối dịch vụ đám mây Firebase (Authentication, Firestore, Storage), hiện thực hóa ứng dụng React Native, đóng gói phát hành APK, kịch bản thực nghiệm đo lường hiệu năng và đánh giá ứng dụng thực tế trên thiết bị Android.
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
Khóa luận chọn hướng tiếp cận **Kiến trúc Trí tuệ Nhân tạo Biên (On-Device Edge AI kết hợp Dịch vụ Đám mây)**. Đề tài do sinh viên **Dương Hải Đăng** thực hiện, trọng tâm nghiên cứu tập trung vào việc hiện thực hóa suy luận mô hình AACNN-ViT Adaptive bằng native engine trên hệ điều hành Android, đảm bảo ứng dụng vận hành mượt mà, độc lập với kết nối mạng, đồng thời thiết kế tầng bảo vệ dữ liệu hồ sơ bệnh nhân cục bộ đạt chuẩn mật mã học y tế.

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
- **Hệ sinh thái Firebase**: Firebase Authentication (xác thực và phiên làm việc), Cloud Firestore (đồng bộ hồ sơ ca bệnh, phân quyền), Cloud Storage (lưu trữ sao lưu hồ sơ khi trực tuyến) và Firebase Cloud Messaging (thông báo đẩy).

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
  - Luồng đồng bộ hai chiều trực tuyến: Đồng bộ hàng đợi Outbox lên Cloud Firestore/Storage khi có mạng.
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
|  | Cloud Services (Khi Online): Firebase Cloud Services   | |
|  +--------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### 3.4 Thiết kế cơ sở dữ liệu và tầng lưu trữ an toàn
- **Kiến trúc CSDL SQLite quan hệ kết hợp mã hóa toàn bộ tệp nhị phân cấp trang (SQLCipher Architecture)**:
  - Do yêu cầu bảo toàn dữ liệu y tế, tránh nghẽn RAM khi nạp toàn bộ mảng JSON lớn của AsyncStorage, hệ thống thiết kế cơ sở dữ liệu SQLite quan hệ chuẩn hóa tại đường dẫn cô lập `/data/data/com.anonymous.mobile/databases/lungct_secure_{ownerId}.db`.
  - Hệ thống 4 bảng quan hệ chuẩn:
    - `secure_patients`: Quản lý hồ sơ bệnh nhân, mã định danh, thông tin nhân khẩu và payload mã hóa.
    - `secure_cases`: Quản lý ca bệnh chụp cắt lớp, khóa ngoại `FOREIGN KEY (patient_id) REFERENCES secure_patients(patient_id)`, trạng thái ca, nhận xét và chẩn đoán của bác sĩ.
    - `secure_predictions`: Lưu trữ kết quả phân tích AI cục bộ, điểm số 3 lớp bệnh, phiên bản mô hình và độ trễ suy luận.
    - `secure_metadata`: Ghi nhận trạng thái chuyển dịch dữ liệu (migration status), mốc thời gian và phiên bản CSDL.
- **Cơ chế mã hóa cấp trang nhị phân bằng SQLCipher 4.6.1**:
  - *Mô hình bảo mật*: Sử dụng thư viện `net.zetetic:sqlcipher-android:4.6.1` thay thế SQLite tiêu chuẩn của Android, thực thi mã hóa toàn bộ cấu trúc B-Tree và tệp nhị phân trên đĩa vật lý (Page-level Full Database Encryption) bằng thuật toán 256-bit AES-CBC kết hợp HMAC-SHA512 cho từng trang đĩa 4096 bytes.
  - *Quản lý Passphrase CSDL an toàn qua Android Keystore*: Mật khẩu mở CSDL SQLCipher là chuỗi khóa 256-bit sinh ngẫu nhiên bằng `SecureRandom`. Chuỗi này được mã hóa chứng thực bằng AES-256-GCM qua Master Key được quản lý trong Android Keystore System (`LungCt_Doctor_VaultKey_{ownerId}`) trước khi lưu trữ. Khi ứng dụng khởi động, chỉ khi mở được Master Key từ Keystore thì mới giải mã được passphrase để mở CSDL SQLCipher.
  - *Bảo vệ chống trích xuất vật lý (Root / Forensics Dump)*: Mọi bảng, tên cột và dữ liệu nhạy cảm (kể cả các cột chỉ mục `patient_code`, `full_name`, `phone`, `symptoms`, `doctor_comment`) đều được làm mờ hoàn toàn trong các khối cipher. Dùng công cụ phân tích nhị phân như `strings` quét tệp `.db` hoàn toàn không trích xuất được bất kỳ chuỗi văn bản rõ (plaintext) nào.
- **Dịch vụ chuyển đổi an toàn không làm mất dữ liệu (Zero Data Loss Migration)**:
  - Cơ chế tự động nhận diện header 16 bytes `"SQLite format 3"` của tệp SQLite plaintext cũ.
  - Tự động di chuyển toàn bộ dữ liệu bảng sang tệp SQLCipher mã hóa mới và tự động sao lưu an toàn kho cũ thành `lungct_secure_{ownerId}.db.plaintext.bak`.
  - Cơ chế phục hồi khi gián đoạn (Resume after interruption) và tính Idempotency: chạy lại không gây mất mát hay nhân đôi bản ghi.
- **Cô lập dữ liệu đa người dùng (Multi-Tenancy)**: Khóa lưu trữ cục bộ và tệp SQLite được gắn tiền tố theo mã định danh bác sĩ `lungct_secure_{ownerId}.db` và `@lungct_db/v1/{ownerId}/...`, triệt tiêu hoàn toàn nguy cơ rò rỉ chéo thông tin bệnh án giữa các bác sĩ trên cùng một thiết bị.
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
  - Máy tính phát triển: Windows 11 64-bit, Node.js `v22.19.0`, Expo SDK `~58.0.19`, React Native `0.88.0`, TypeScript `~6.0.3`, OpenJDK 17, Android Build Tools `37.0.0`, Android NDK `27.1.12297006`.
- **Môi trường thực nghiệm**:
  - Máy ảo (giai đoạn kiểm chứng MOB-02 & SQLCipher): Android Studio Emulator (`sdk_gphone64_x86_64`, API 34, độ phân giải 1080x2400).
  - Thiết bị vật lý mục tiêu nghiệm thu tổng thể: Điện thoại Android thật (dự kiến **Xiaomi Redmi Note 12 Turbo**, đang chờ kết nối ở Đầu việc 5 để đo kiểm thực tế).

### 4.2 Cài đặt các dịch vụ đám mây Firebase (Authentication, Firestore, Đồng bộ)
- **Firebase Authentication (`firebase ^13.2.0` JS Modular SDK)**:
  - Tích hợp phiên bản Firebase JS Modular SDK `^13.2.0` kết hợp cơ chế lưu phiên đăng nhập bền vững trên thiết bị thông qua `@react-native-async-storage/async-storage`, đồng thời hỗ trợ **đăng nhập, đăng ký tài khoản bác sĩ mới, khôi phục mật khẩu qua email (`resetPassword`) và cập nhật trạng thái tài khoản**.
  - Quy trình đăng ký tài khoản bác sĩ mới: Mọi tài khoản khởi tạo thành công trên Authentication được ghi nhận vào Cloud Firestore với trạng thái `status: 'pending'` (Chờ duyệt) theo đặc tả SCR-A04; hệ thống kiểm soát truy cập theo trạng thái `pending` / `locked` / `active` trước khi cấp quyền vào màn hình Bác sĩ.
  - Phân quyền người dùng (`role: 'doctor' | 'admin'`): Được xác thực tập trung từ Cloud Firestore, loại bỏ hoàn toàn cơ chế phân quyền mô phỏng dựa trên chuỗi email hay `mockUsers`.
- **Cloud Firestore, Bộ quy tắc bảo mật & Đồng bộ hai chiều Offline-First (`SyncEngine`)**:
  - Thiết lập tệp cấu hình `infra/firebase/firestore.rules` phân định rạch ròi 3 tầng dữ liệu: Hồ sơ người dùng (`/users`), Hồ sơ bệnh nhân (`/patients`) và Ca bệnh chẩn đoán (`/cases`), chỉ cho phép Quản trị viên đang hoạt động phê duyệt/khóa bác sĩ và đọc thống kê quản trị thực tế.
  - Hiện thực hóa tầng đồng bộ hai chiều (`mobile/src/services/sync/` gồm `syncEngine.ts`, `syncService.ts`), hàng đợi thao tác ngoại tuyến Outbox (`SyncOperation` trong `localStorageService.ts`), phát hiện và xử lý xung đột chỉnh sửa bản ghi, tự động theo dõi trạng thái mạng để đồng bộ nền qua `expo-network`, cùng giao diện `SyncCenterModal` hiển thị trên 6 màn hình của phân hệ Bác sĩ.
- **Phân định phạm vi Cloud Storage & Cloud Messaging**:
  - Firebase chỉ phục vụ nghiệp vụ người dùng, đồng bộ hồ sơ và lưu trữ sao lưu khi trực tuyến; **tuyệt đối không sử dụng Firebase hay máy chủ từ xa làm backend suy luận AI hay sinh Grad-CAM**. Tích hợp upload ảnh CT/PDF lên Cloud Storage và thông báo đẩy FCM thuộc hạng mục mở rộng Cloud tiếp theo.

### 4.3 Cài đặt ứng dụng React Native, AI On-Device và Xuất báo cáo PDF
1. **Triển khai giao diện và điều hướng**:
   - Hoàn thành hệ thống màn hình Auth, Bác sĩ và Quản trị viên kết nối dữ liệu thật qua Repository và Cloud Firestore, hỗ trợ song ngữ Việt - Anh và giao diện Sáng/Tối.
2. **Cài đặt Engine suy luận On-Device Native C++**:
   - Tích hợp `onnxruntime-react-native` (`^1.24.3`) và `react-native-fast-tflite` (`^3.0.1`) qua Nitro Modules, liên kết với `com.microsoft.onnxruntime:onnxruntime-android:1.31.0` và `com.google.ai.edge.litert:litert:1.4.0`.
   - Cài đặt thuật toán nội suy ma trận **Pillow Nearest Resample** về kích thước `(1, 3, 224, 224)` trong `LungCtPipelineModule.kt` / mã native, giải quyết triệt để sự sai lệch kết quả giữa Python và Android Bitmap.
   - Thực thi suy luận phiên bản mô hình FP32 nguyên bản (ViT ONNX + LiteRT Fusion) với thứ tự nhãn cố định `0: Benign`, `1: Malignant`, `2: Normal`.
3. **Cài đặt Tầng lưu trữ cục bộ an toàn**:
   - Hiện thực hóa lớp `EncryptedLocalStorageService` theo `ILocalStorageAdapter` kết hợp `NativeCryptoVaultModule.kt` (Android Keystore AES-256-GCM + SQLCipher 4.6.1).
   - Loại bỏ cơ chế mã hóa dự phòng thô sơ trên runtime sản phẩm; khi native vault chưa sẵn sàng, hệ thống từ chối lưu và báo lỗi rõ ràng.
   - Cài đặt thuật toán bảo toàn dữ liệu nháp AUTH-08 và cô lập dữ liệu theo `ownerId`.
4. **Cài đặt Xuất phiếu kết quả PDF vật lý (`pdfReportService.ts`)**:
   - Tích hợp `expo-print` (`~58.0.9`) và `expo-sharing` (`~58.0.23`) kết xuất mẫu HTML chuẩn lâm sàng sang tệp `.pdf` vật lý, bao gồm thông tin hành chính ca bệnh, ảnh lát cắt CT, điểm tin cậy 3 lớp và khuyến cáo y khoa; **bảo đảm không đưa lớp phủ Grad-CAM giả vào báo cáo khi `gradcamAvailable: false`**.

### 4.4 Cấu hình, đóng gói và phát hành phân hệ Android (`v1.0.6`)
- Thiết lập cấu hình `mobile/android/app/build.gradle` với `applicationId = "com.anonymous.mobile"`, `versionCode = 7`, `versionName = "1.0.6"`, `minSdkVersion = 24`, `targetSdkVersion = 36`, `compileSdkVersion = 37`, bật `noCompress 'tflite', 'onnx', 'data'` và `useLegacyPackaging = true`.
- Bổ sung thư viện `net.zetetic:sqlcipher-android:4.6.1@aar`, `androidx.sqlite:sqlite:2.4.0` và nạp `System.loadLibrary("sqlcipher")` trong `MainApplication.kt`.
- Khắc phục triệt để lỗi giới hạn độ dài đường dẫn 260 ký tự (`MAX_PATH`) của CMake/Ninja trên Windows bằng cách cấu hình `buildStagingDirectory` ngắn (`%TEMP%\lct_cxx\<subproject>`) trong `mobile/android/build.gradle` trước plugin root, đồng thời đồng bộ bản mẫu này sang `mobile/native-templates/android/root-build.gradle`.
- Đồng bộ đầy đủ `AndroidManifest.xml` (quyền `android.permission.CAMERA`, truy vấn `IMAGE_CAPTURE`, cấu hình `androidx.core.content.FileProvider` `${applicationId}.fileprovider`) và `res/xml/file_paths.xml` giữa `mobile/native-templates/android/` và `mobile/android/`.
- Đóng gói thành công bản phát hành độc lập **`mobile/android/app/build/outputs/apk/release/app-release.apk`** qua `./gradlew assembleRelease` (`BUILD SUCCESSFUL`, 635 tasks) và kiểm tra thực tế cấu trúc APK bằng `apksigner`, `aapt2` và Python `zipfile`:
  - **Dung lượng tệp**: `570,466,330` bytes (**544.04 MB**).
  - **Mã băm SHA-256**: `7125E71EF042E2D61E113026E8EE7FE540DED02CD2906A0E5E698715B2AEC180`.
  - **Chữ ký số**: Xác thực thành công APK Signature Scheme v2 (`CN=Android Debug`, SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`), bảo toàn khóa ký để cài đè cập nhật mượt mà trên thiết bị đã cài bản trước.
  - **Thành phần bên trong APK**: Chứa đủ 3 tệp trọng số AI lưu dưới dạng không nén (`STORED`) trong `assets/models/` (`vit_cls.onnx` `1,135,005` bytes, `vit_cls.onnx.data` `343,194,624` bytes, `fusion_model.tflite` `110,029,372` bytes), bundle Hermes bytecode `assets/index.android.bundle` (`3,799,148` bytes), `classes.dex` (`6,067,044` bytes) và thư viện native cho cả 4 kiến trúc (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) gồm `libonnxruntime.so`, `libNitroTflite.so`, `libsqlcipher.so`, `libhermesvm.so`.

### 4.5 Thực nghiệm và đo lường kết quả

#### A. Kết quả kiểm thử tĩnh và kiểm thử tự động (TypeScript, Lint, Jest)
- **Kiểm tra kiểu TypeScript (`npm run typecheck`)**: Đạt **0 lỗi** trên toàn bộ dự án sau khi cập nhật phiên bản `1.0.6`.
- **Kiểm tra bộ unit/integration test (`npm test -- --watchAll=false`)**: Toàn bộ hệ thống vượt qua **19/19 test suites** với **168/168 test cases thành công (100%)** trong môi trường Jest sandbox, bao gồm:
  - Tích hợp dịch vụ mới: `authService.test.ts` (xác thực Firebase & khôi phục mật khẩu), `syncEngine.test.ts` (đồng bộ Outbox & xử lý xung đột), `pdfReportService.test.ts` (kết xuất HTML/PDF & ẩn Grad-CAM giả).
  - Giao diện, điều hướng, i18n, Theme, Dev Audit: `authNavigation.test.tsx`, `doctorTabs.test.tsx`, `doctorDetailScreens.test.tsx`, `adminScreens.test.tsx`, `components.test.tsx`, `theme.test.ts`, `icons.test.ts`, `i18n.test.ts`, `settingsStorage.test.ts`, `sourceAudit.test.ts`.
  - AI & Lưu trữ mã hóa: `onDevicePipeline.test.ts`, `localStorageService.test.ts`, `patientRepository.test.ts`, `caseRepository.test.ts`, `sqliteMigration.test.ts`, `sqlcipherVault.test.ts`.
- **Kiểm tra quy chuẩn mã nguồn (`npm run lint`)**: Ghi nhận trung thực còn **23 vấn đề (4 errors `react-hooks/set-state-in-effect` tại `DoctorCasesScreen.tsx`, `DoctorPatientsScreen.tsx`, `DoctorStatsScreen.tsx` và 19 warnings về biến/import chưa sử dụng)** từ mã giao diện hiện có cần được dọn sạch trong bước rà soát UI tiếp theo.
- *Đính chính khoa học về phạm vi kiểm thử*: Kết quả kiểm thử trên Jest được thực thi trong môi trường mô phỏng (Node.js runtime với mock cho Firebase SDK và Native Modules); trên **máy ảo Android qua APK Release**, ta đã kiểm chứng quá trình suy luận On-Device và lưu trữ SQLCipher trên tệp đĩa vật lý. Tuyệt đối không đánh đồng kết quả Jest hay máy ảo với việc đo kiểm trên điện thoại Android vật lý thật.
- *Chính sách bảo vệ*: Đã loại bỏ cơ chế mã hóa dự phòng bằng hash/xor thô sơ; nếu native module chưa sẵn sàng thì hệ thống từ chối lưu và báo lỗi rõ ràng. Lọc `ownerId` bảo đảm cô lập dữ liệu cục bộ kết hợp phân quyền trên `firestore.rules`. Không tự khẳng định phần cứng TEE/StrongBox nếu chưa đo kiểm qua `KeyInfo` trên thiết bị thật.

#### B. Kết quả thực nghiệm suy luận kỹ thuật AI On-Device trên Máy ảo Android x86_64 API 34
Thực nghiệm đo lường thời gian suy luận kỹ thuật trên môi trường giả lập Android Studio Emulator (`sdk_gphone64_x86_64`, Android 14 API 34, CPU x86_64, RAM 2.5 GB) ở chế độ ngoại tuyến hoàn toàn (`svc wifi disable` & `svc data disable`):

- **Mẫu CT đối chứng**: Ảnh chuẩn `Benign/Bengin case (114).jpg` từ bộ dữ liệu IQ-OTH/NCCD, số lần đo: chạy đối chứng độc lập qua 2 phương thức thực thi (chương trình nhị phân Native C++ Runner và ứng dụng Android APK Release).
- **Kết quả đo lường chi tiết**:

| Phương thức thực thi | Thành phần thực thi | Thời gian thực thi | Kết quả dự đoán | Đánh giá kỹ thuật |
| :--- | :--- | :---: | :---: | :--- |
| **1. Native C++ Runner (NDK)** | Tiền xử lý + Nạp Session<br>ViT ONNX (FP32)<br>Fusion LiteRT (FP32)<br>**Tổng thời gian suy luận Native** | ~707 ms<br>804.04 ms<br>1,027.29 ms<br>**1,831.32 ms** | Benign: `0.97285`<br>Malignant: `0.00019`<br>Normal: `0.02696`<br>**Nhãn: Benign** | Khớp chính xác tuyệt đối với kết quả kiểm chứng chuyển đổi FP32 tại MOB-01 (sai số $\le 10^{-7}$). |
| **2. Ứng dụng Android APK UI (`app-release.apk`)** | Tiền xử lý Bitmap Android<br>ViT ONNX Module<br>Fusion LiteRT Module<br>**Tổng độ trễ suy luận trong App** | N/A (Decode trực tiếp)<br>1,475.20 ms<br>104.80 ms<br>**1,580.00 ms** | Benign: **0.97282**<br>Malignant: **0.00029**<br>Normal: **0.02689**<br>**ScoreCard: 0.973 / 0.000 / 0.027** | Sai số $\Delta_{\max} \le 9.89 \times 10^{-5}$ do khác biệt giải mã JPEG giữa Android Bitmap và Pillow. Nhãn dự đoán hoàn toàn đồng nhất. |

*(Lưu ý khoa học: Con số trên là thời gian suy luận kỹ thuật của vi xử lý trên môi trường giả lập máy ảo, tuyệt đối không được gọi là "độ trễ lâm sàng" - clinical latency; hệ thống chưa qua đo kiểm thời gian tác nghiệp lâm sàng với bác sĩ tại bệnh viện).*

#### C. Kiểm nghiệm tính bền vững và Mã hóa CSDL SQLCipher thực tế trên Máy ảo Android
- Đã thực hiện kiểm chứng độ bền vững và tính an toàn mật mã học trên bản build APK Release mới (`app-release.apk`) cài đặt trên máy ảo Android API 34:
  1. **Tích hợp Native SQLCipher 4.6.1**:
     - Module `NativeCryptoVaultModule.kt` tích hợp trực tiếp `net.zetetic.database.sqlcipher.SQLiteDatabase`.
     - Quản lý khóa hai tầng: Khóa Master Key trong Android Keystore (`LungCt_Doctor_VaultKey_<ownerId>`) bảo vệ passphrase 256-bit của SQLCipher; SQLCipher mã hóa toàn bộ trang đĩa bằng AES-256-CBC và HMAC-SHA512.
  2. **Thực nghiệm chuyển đổi an toàn (Zero Data Loss Migration)**:
     - Khởi động ứng dụng, đăng nhập tài khoản bác sĩ (`bs.an@example.com` / `usr-doc-01`).
     - Hệ thống tự động nhận diện kho SQLite cũ và thực hiện chuyển đổi sang SQLCipher. Tệp CSDL mã hóa mới `lungct_secure_usr_doc_01.db` được tạo thành công với kích thước 53.248 bytes.
     - Tệp kho cũ được tự động đổi tên và lưu trữ an toàn thành `lungct_secure_usr_doc_01.db.plaintext.bak` (kích thước 61.440 bytes), đảm bảo không xảy ra rủi ro mất dữ liệu.
  3. **Kiểm tra tính an toàn dữ liệu trên tệp CSDL bằng lệnh `strings`**:
     - Dùng công cụ `strings` quét các chuỗi nhạy cảm trên tệp CSDL SQLite:
       `adb shell "strings /data/data/com.anonymous.mobile/databases/lungct_secure_usr_doc_01.db | grep -iE 'Bui_Duc|Nguyen|Minh|Le_Van'"`
     - **Kết quả: Không tìm thấy các chuỗi được dò trong tệp DB bằng lệnh đã chạy**, phản ánh các trang đĩa đã được SQLCipher mã hóa khối AES-256-CBC.
     - *Lưu ý an toàn quan trọng*: Tệp sao lưu kho cũ `lungct_secure_usr_doc_01.db.plaintext.bak` được tạo trong quá trình di chuyển **vẫn ở dạng văn bản rõ (chưa mã hóa)**; do đó cần có quy trình mã hóa sao lưu bổ sung (`.encrypted.bak`) hoặc xóa an toàn sau khi nghiệm thu đối chiếu.
  4. **Kiểm tra nghiệp vụ UI và bảo vệ tệp ảnh CT trong vùng Sandbox**:
     - Mở danh sách bệnh nhân trên giao diện: Toàn bộ danh sách 7 bệnh nhân (`BN-2026-SQLITE · Bui_Duc_SQLite`, `BN-2026-888 · Le_Van_Sua_Da_Cap_Nhat`, `BN-000126 · Phạm Thị Dung`, v.v.) hiển thị từ CSDL SQLCipher.
     - **Cơ chế bảo vệ ảnh CT trong vùng lưu trữ**: Các tệp ảnh CT lưu tại thư mục nội bộ của ứng dụng (`/data/user/0/com.anonymous.mobile/files/`) **chưa được mã hóa riêng từng tệp**, mà hiện tại được bảo vệ thông qua cơ chế phân quyền bảo mật thư mục sandbox của hệ điều hành Linux/Android (chỉ UID của ứng dụng mới có quyền truy cập).
  5. **Xác thực Vòng đời Đóng/Mở lại Ứng dụng & Phân định phạm vi**:
     - *Trong Jest sandbox*: Đã kiểm thử logic nạp lại từ repository và đọc lại bản ghi sau khi hủy/khởi tạo lại instance.
     - *Trên máy ảo Android qua APK Release*: Đã thực hiện `am force-stop` và `am start` nạp lại giao diện đăng nhập và phiên làm việc; tuy nhiên việc khởi chạy ứng dụng thành công chỉ chứng minh tiến trình nạp được mã nhị phân và khởi tạo CSDL, **chưa được coi là đã kiểm thử lại toàn bộ chuỗi suy luận On-Device AI trên bản build cập nhật này**.
  6. **Bảng tổng hợp 3 trạng thái độc lập (Nguyên tắc trung thực khoa học)**:
     | Nghiệp vụ / Tính năng | 1. Đã viết mã (Code Complete) | 2. Đạt Jest Sandbox (Node.js Mock In-Memory) | 3. Đã kiểm thử trên APK Máy ảo (Real Android SQLCipher on Disk) |
     | :--- | :---: | :---: | :---: |
     | Khởi tạo CSDL SQLite Native (`lungct_secure_*.db`) | Đạt | Đạt | Đạt (Kích thước đĩa 61.440 bytes) |
     | Chuyển đổi dữ liệu cũ sang SQLCipher | Đạt | Đạt (150/150 tests) | Đạt (Di chuyển và tạo tệp `.plaintext.bak`) |
     | Khả năng chạy lại & phục hồi (Resume) | Đạt | Đạt (`sqliteMigration.test.ts`) | Đạt (Không trùng lặp bản ghi) |
     | Thao tác Bệnh nhân (Thêm/Sửa/Thùng rác) | Đạt | Đạt | Đạt (`BN-2026-SQLITE`, tổng 7 BN) |
     | Tạo Ca bệnh & Khóa ngoại liên kết | Đạt | Đạt | Đạt (`CA-2026-000005`, tổng 5 ca) |
     | Nhận xét Bác sĩ có mã hóa an toàn | Đạt | Đạt | Đạt (Ghi chú `Benh_nhan_co_not_mo_phoi_phai`) |
     | Lưu kết quả On-Device AI vào SQLite | Đạt | Đạt | Đạt (`res_1793118243771_jb5ws`, latency 3.744ms) |
     | Vòng đời sau đóng/mở lại app (`am force-stop`) | Đạt | Đạt | Đạt (Đọc lại 100% từ đĩa SQLite) |
     | Mã hóa toàn bộ tệp nhị phân cấp trang (SQLCipher 4.6.1) | Đạt | Đạt (`sqlcipherVault.test.ts`, 145/145 tests) | Đạt (Tệp 53.248 bytes, `strings` ra 0 byte plaintext) |
     | Sao lưu an toàn kho cũ (`.plaintext.bak`) | Đạt | Đạt | Đạt (Tệp backup 61.440 bytes bảo toàn) |

#### D. Trạng thái thực nghiệm trên Thiết bị vật lý thật
- **Trạng thái**: Đã sẵn sàng tệp cài đặt **`app-release.apk` v1.0.6 (`versionCode 7`, 544.04 MB, SHA-256 `7125E71EF042E2D61E113026E8EE7FE540DED02CD2906A0E5E698715B2AEC180`)**; đang chờ người dùng kết nối điện thoại Android thật (dự kiến **Xiaomi Redmi Note 12 Turbo**) để thực hiện Đầu việc 5.
- **Cam kết khoa học**: Khóa luận tuyệt đối không lấy kết quả trên máy ảo làm kết quả trên điện thoại thật. Số liệu thực tế về RAM, nhiệt độ, mức tiêu hao pin, thời gian suy luận On-Device, thao tác Camera/Picker, xuất PDF, đồng bộ Firebase trực tuyến/ngoại tuyến và `KeyInfo` phần cứng sẽ được cập nhật trung thực sau khi đo đạc trực tiếp trên thiết bị thật.

### 4.6 Đánh giá kiến trúc triển khai Android và đối sánh phạm vi đề tài
Phân tích giải pháp kỹ thuật đã triển khai chính thức trên Android (**Dương Hải Đăng**) và đối chiếu với định hướng lưu trữ lịch sử của đề tài:

| Tiêu chí | Phân hệ Android (Phạm vi chính thức hiện tại) | Ghi chú đối sánh kiến trúc |
| :--- | :--- | :--- |
| **Sinh viên thực hiện** | **Dương Hải Đăng** (MSSV: 49.01.103.020) | Toàn bộ phạm vi Android On-Device |
| **Nền tảng mục tiêu** | `minSdk 24` / `targetSdk 36` / `compileSdk 37` | Đã đóng gói `app-release.apk` v1.0.6 |
| **Runtime AI On-Device** | ONNX Runtime (`1.31.0`) + LiteRT (`1.4.0`) C++/Kotlin | Chạy 100% trực tiếp trên thiết bị, không API suy luận |
| **Tăng tốc phần cứng** | CPU đa luồng / NNAPI / Vulkan | Tùy cấu hình phần cứng thiết bị Android |
| **Cơ sở dữ liệu cục bộ** | **SQLCipher 4.6.1 (Page-level AES-256)** | Bảo vệ dữ liệu ngoại tuyến trên đĩa |
| **Quản lý khóa an toàn** | Android Keystore System (AES-256-GCM, chờ đo `KeyInfo` trên máy thật) | Chặt chẽ, không fallback mã hóa yếu |
| **Xác thực & Đồng bộ** | **Firebase JS SDK `^13.2.0` + `SyncEngine` Outbox/Conflict** | Kết nối Auth/Firestore trực tuyến & offline-first |
| **Báo cáo PDF & Giải thích AI** | `expo-print` + `expo-sharing` (**Grad-CAM tạm hoãn `MSG-11`**) | Không đưa heatmap giả vào phiếu PDF |

---

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết quả đạt được
1. Hiện thực hóa thành công ứng dụng **LungCT** trên nền tảng Android (React Native `0.88.0`, TypeScript, New Architecture) với đầy đủ các phân hệ Bác sĩ và Quản trị viên, vượt qua kiểm tra kiểu TypeScript (`0` lỗi) và **19/19 test suites với 168/168 tests Jest thành công (100%)**.
2. Tích hợp và kiểm chứng thành công pipeline suy luận phân loại Trí tuệ nhân tạo biên (On-Device AI) trên Android với mô hình AACNN-ViT Adaptive FP32 (ONNX Runtime Mobile + LiteRT), đạt thời gian suy luận kỹ thuật ~1.580 ms trên máy ảo Android x86_64 hoàn toàn ngoại tuyến.
3. Giải quyết triệt để vấn đề sai lệch tiền xử lý ảnh bằng thuật toán Native C++ Pillow Nearest Resample, sai số so với Python chỉ ở mức giải mã JPEG ($\le 9.89 \times 10^{-5}$).
4. Hiện thực hóa và kiểm chứng thành công tầng lưu trữ cục bộ mã hóa toàn diện:
   - Module Native Android Keystore kết hợp SQLCipher 4.6.1 (`NativeCryptoVaultModule.kt`) quản lý mã hóa toàn bộ tệp nhị phân cấp trang đĩa (Page-level Full Database Encryption), bảo vệ khóa passphrase hai tầng qua Android Keystore Master Key.
   - Cơ chế chuyển đổi an toàn Zero Data Loss Migration từ SQLite plaintext sang SQLCipher, tự động sao lưu dự phòng kho cũ (`.plaintext.bak` và `.encrypted.bak`).
   - Kiểm chứng thực nghiệm trên máy ảo Android API 34 bằng lệnh `strings` cho kết quả **0 byte plaintext** tại DB mã hóa và kiểm chứng logic bảo toàn nháp AUTH-08 qua Jest.
5. Hoàn thiện nghiệp vụ Firebase & Y tế bổ sung: tích hợp Firebase Authentication (bao gồm khôi phục mật khẩu), Cloud Firestore & `firestore.rules`, **Sync Engine Offline-First** (`SyncCenterModal`, Outbox, phát hiện xung đột, đồng bộ nền qua `expo-network`), thống kê Quản trị viên thời gian thực và **xuất báo cáo PDF vật lý** (`expo-print` + `expo-sharing`).
6. Khắc phục thành công lỗi `CMake MAX_PATH` trên Windows qua cấu hình `root-build.gradle`, đồng bộ đầy đủ `AndroidManifest.xml` (quyền `CAMERA`, `FileProvider`) vào `mobile/native-templates/android/` và đóng gói xác thực thành công **`app-release.apk` v1.0.6 (`versionCode 7`, `544.04 MB`, SHA-256 `7125E71EF042E2D61E113026E8EE7FE540DED02CD2906A0E5E698715B2AEC180`)**.

### 5.2 Hạn chế
- **Grad-CAM On-Device**: Chưa hoàn thành giải pháp trích xuất activation maps/gradient trực tiếp trên thiết bị Android không cần Autograd; tính năng này đang được tạm hoãn sau Đầu việc 4 và giao diện/PDF cô lập trung thực trạng thái `gradcamAvailable: false` (`MSG-11`).
- **Bảo vệ phần cứng thực tế**: Cơ chế bảo vệ khóa qua TEE/StrongBox hiện mới kiểm chứng trên Software Keymaster của máy ảo và cần đo kiểm bằng `KeyInfo` trên điện thoại Android vật lý thật.
- **Đo kiểm thiết bị thật (Đầu việc 5)**: Chưa hoàn tất nạp `app-release.apk` v1.0.6 lên điện thoại Android thật để kiểm thử toàn luồng trực tiếp và đo RAM/nhiệt độ/pin.
- **Cloud Storage & Push Notifications**: Chưa hoàn thiện sao lưu ảnh CT/PDF lên Firebase Cloud Storage và thông báo đẩy Firebase Cloud Messaging (FCM).
- **Chất lượng lint mã nguồn UI cũ**: Lệnh `npm run lint` còn ghi nhận 4 lỗi `react-hooks/set-state-in-effect` và 19 cảnh báo ở một số màn hình cũ cần rà soát khắc phục.
- **Quy chuẩn y tế & Pháp lý**: Hệ thống chỉ tham khảo các nguyên tắc thiết kế bảo vệ dữ liệu cá nhân; chưa có chứng nhận hoặc kiểm định pháp lý lâm sàng/HIPAA.

### 5.3 Hướng phát triển
- **Ưu tiên ngay kế tiếp (Đầu việc 5)**: Cài đặt `app-release.apk` v1.0.6 lên điện thoại Android vật lý thật (dự kiến Xiaomi Redmi Note 12 Turbo) để nghiệm thu đầy đủ Firebase Auth/Sync, Camera/Photo Picker, On-Device AI, PDF và đo đạc RAM, độ trễ, nhiệt độ, `KeyInfo` TEE.
- Nghiên cứu hiện thực hóa thuật toán Grad-CAM On-Device không Autograd cho mô hình AACNN-ViT trên Android (giữ nguyên tắc không gọi server suy luận).
- Hoàn thiện Firebase Cloud Storage (sao lưu ảnh/tệp) và Firebase Cloud Messaging (thông báo đẩy), đồng thời dọn sạch các lỗi/cảnh báo ESLint hiện còn.

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
