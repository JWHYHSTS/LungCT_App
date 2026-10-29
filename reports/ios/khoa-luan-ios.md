# BÁO CÁO KHÓA LUẬN TỐT NGHIỆP

## ĐỀ TÀI: PHÁT TRIỂN PHÂN HỆ IOS CHO ỨNG DỤNG CHẨN ĐOÁN UNG THƯ PHỔI TRÊN THIẾT BỊ DI ĐỘNG BẰNG TRÍ TUỆ NHÂN TẠO CẠNH (EDGE AI)

> **Thông tin khóa luận**:
> - **Cơ quan đào tạo**: Bộ Giáo dục và Đào tạo – Trường Đại học Sư phạm Thành phố Hồ Chí Minh – Khoa Công nghệ Thông tin.
> - **Ngành đào tạo**: Sư phạm Tin học (Khóa 49, Niên khóa 2026 – 2027).
> - **Sinh viên thực hiện**: **DƯƠNG HẢI ĐĂNG** — MSSV: **49.01.103.020**.
> - **Giảng viên hướng dẫn**: **ThS. TRỊNH HUY HOÀNG**.
> - **Tình trạng văn bản**: **Bản thảo khóa luận đang phát triển (Working Draft)** — Soạn thảo theo khung 5 chương chuẩn của Đề cương chi tiết đã duyệt, tích hợp đề xuất nâng cấp công nghệ On-Device Edge AI trên iOS đang chờ GVHD xác nhận.
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
  - [2.3 Đặc thù triển khai trên hệ sinh thái Apple iOS](#23-đặc-thù-triển-khai-trên-hệ-sinh-thái-apple-ios)
- [CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
  - [3.1 Phân tích yêu cầu](#31-phân-tích-yêu-cầu)
  - [3.2 Mô hình hóa hệ thống](#32-mô-hình-hóa-hệ-thống)
  - [3.3 Thiết kế kiến trúc tổng thể](#33-thiết-kế-kiến-trúc-tổng-thể)
  - [3.4 Thiết kế cơ sở dữ liệu và tầng lưu trữ an toàn](#34-thiết-kế-cơ-sở-dữ-liệu-và-tầng-lưu-trữ-an-toàn)
  - [3.5 Thiết kế giao diện người dùng tuân thủ Apple HIG](#35-thiết-kế-giao-diện-người-dùng-tuân-thủ-apple-hig)
- [CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ](#chương-4-cài-đặt-thực-nghiệm-và-đánh-giá)
  - [4.1 Môi trường cài đặt và triển khai](#41-môi-trường-cài-đặt-và-triển-khai)
  - [4.2 Cài đặt máy chủ và các dịch vụ đám mây (FastAPI, Firebase)](#42-cài-đặt-máy-chủ-và-các-dịch-vụ-đám-mây-fastapi-firebase)
  - [4.3 Cài đặt ứng dụng React Native và Tầng suy luận AI trên iOS](#43-cài-đặt-ứng-dụng-react-native-và-tầng-suy-luận-ai-trên-ios)
  - [4.4 Cấu hình, đóng gói và phát hành phân hệ iOS](#44-cấu-hình-đóng-gói-và-phát-hành-phân-hệ-ios)
  - [4.5 Thực nghiệm và đo lường kết quả](#45-thực-nghiệm-và-đo-lường-kết-quả)
  - [4.6 Đánh giá và so sánh hai phân hệ iOS - Android](#46-đánh-giá-và-so-sánh-hai-phân-hệ-ios---android)
- [CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-5-kết-luận-và-hướng-phát-triển)
  - [5.1 Kết quả đạt được](#51-kết-quả-đạt-được)
  - [5.2 Hạn chế](#52-hạn-chế)
  - [5.3 Hướng phát triển](#53-hướng-phát-triển)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## TÓM TẮT KHÓA LUẬN (ABSTRACT)

Nghiên cứu ứng dụng di động hỗ trợ chẩn đoán ung thư phổi trên hệ điều hành **iOS** nhằm mang lại công cụ hỗ trợ quyết định lâm sàng cho số lượng lớn bác sĩ và chuyên gia y tế sử dụng các thiết bị Apple (iPhone, iPad). Các thiết bị này sở hữu phần cứng Apple Silicon tích hợp bộ tăng tốc nơ-ron chuyên dụng (Apple Neural Engine - ANE) với hiệu năng xử lý ma trận và tensor vượt trội.

Khóa luận này nghiên cứu, thiết kế và phát triển **phân hệ iOS** của đề tài **LungCT**. Được xây dựng trên khung 5 chương chuẩn của Đề cương chi tiết, khóa luận tập trung nghiên cứu bài toán **nâng cấp suy luận Trí tuệ nhân tạo biên (Edge AI On-Device)** chạy trực tiếp trên iPhone:
1. Nghiên cứu khảo sát việc chuyển đổi mô hình học sâu lai AACNN-ViT Adaptive sang định dạng tối ưu trên iOS (đối chiếu giữa **CoreML** tận dụng Apple Neural Engine và **ONNX Runtime Mobile for iOS**).
2. Xây dựng giao diện lâm sàng theo chuẩn Human Interface Guidelines (HIG) của Apple dựa trên 59 màn hình Figma, hỗ trợ chuyển đổi giao diện Sáng/Tối và đa ngôn ngữ.
3. Thiết kế tầng bảo vệ dữ liệu hồ sơ bệnh án theo tiêu chuẩn bảo mật y tế kết hợp **iOS Keychain Services** và **Secure Enclave** quản lý khóa mật mã cấp phần cứng, bảo vệ tính riêng tư của dữ liệu bệnh nhân.
4. Cài đặt thuật toán bảo toàn dữ liệu nháp khi tài khoản bị khóa theo đặc tả AUTH-08 và tích hợp hàng đợi đồng bộ khi có kết nối mạng Internet.

Báo cáo phân tích sâu sắc các đặc thù công nghệ của nền tảng Apple, trình bày kết quả kiểm thử tự động 126 test cases, đồng thời làm rõ ranh giới giữa các chức năng ngoại tuyến (On-Device AI, quản lý bệnh nhân cục bộ) và các chức năng trực tuyến (xác thực, đồng bộ đám mây qua FastAPI/Firebase).

---

## DANH MỤC TỪ VIẾT TẮT

| Viết tắt | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa tiếng Việt |
| :--- | :--- | :--- |
| **ANE** | Apple Neural Engine | Bộ tăng tốc nơ-ron phần cứng của Apple |
| **CoreML** | Apple Core Machine Learning Framework | Khung làm việc học máy của Apple |
| **HIG** | Human Interface Guidelines | Hướng dẫn thiết kế giao diện người dùng Apple |
| **SEP** | Secure Enclave Processor | Bộ vi xử lý bảo mật độc lập trên chip Apple |
| **Edge AI** | Edge Artificial Intelligence | Trí tuệ nhân tạo tại biên / trên thiết bị |
| **ViT** | Vision Transformer | Kiến trúc Transformer cho thị giác máy tính |
| **CT** | Computed Tomography | Chụp cắt lớp vi tính |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping | Bản đồ kích hoạt lớp có trọng số gradient |
| **PHI/PII** | Protected Health Info / Personally Identifiable Info | Dữ liệu sức khỏe và định danh cá nhân |
| **AES** | Advanced Encryption Standard | Tiêu chuẩn mã hóa nâng cao |
| **GCM** | Galois/Counter Mode | Chế độ mã hóa có chứng thực toàn vẹn |

---

## MỞ ĐẦU

### 1. Tính cấp thiết của đề tài / Lý do chọn đề tài
Trong thực hành lâm sàng, tỷ lệ bác sĩ sử dụng các thiết bị iOS (iPhone, iPad) là rất phổ biến nhờ tính ổn định cao của hệ điều hành, chất lượng màn hình hiển thị xuất sắc (Super Retina XDR) và chính sách bảo mật khắt khe của Apple. 

Để giải pháp hỗ trợ chẩn đoán ung thư phổi **LungCT** trở thành công cụ y tế phổ cập, việc xây dựng phân hệ iOS là yêu cầu tất yếu. Việc nghiên cứu đưa mô hình học sâu chạy trực tiếp trên thiết bị iOS (On-Device AI) tận dụng bộ xử lý Apple Neural Engine (ANE) giúp giải quyết triệt để vấn đề phụ thuộc mạng Internet, giảm thiểu chi phí máy chủ và đảm bảo thông tin bệnh án nhạy cảm không bị truyền tải ra ngoài thiết bị khi chưa có sự đồng ý của bệnh nhân.

### 2. Mục đích nghiên cứu

#### 2.1 Mục tiêu chung
Xây dựng ứng dụng di động phân hệ iOS bằng React Native (TypeScript), hỗ trợ bác sĩ đánh giá nhanh mức độ ung thư phổi của bệnh nhân dựa trên ảnh CT, thông qua việc nghiên cứu **tích hợp mô hình học sâu AACNN-ViT Adaptive chạy trực tiếp trên thiết bị iOS (On-Device AI)**, kết hợp bản đồ nhiệt Grad-CAM trực quan. Đồng thời, xây dựng hệ thống máy chủ FastAPI và dịch vụ đám mây phục vụ xác thực người dùng, lưu trữ sao lưu và đồng bộ dữ liệu khi trực tuyến. Sản phẩm được đóng gói để cài đặt trên thiết bị iOS.

#### 2.2 Mục tiêu cụ thể
1. **Nghiên cứu lý thuyết**: Tìm hiểu tổng quan về ung thư phổi, ảnh CT, mô hình lai AACNN-ViT Adaptive, kỹ thuật Grad-CAM và các công nghệ học máy biên trên nền tảng Apple (CoreML, Apple Neural Engine, ONNX Runtime iOS).
2. **Khảo sát giải pháp suy luận AI On-Device trên iOS**: Đánh giá ma trận tính khả thi khi chuyển đổi mô hình AACNN-ViT Adaptive sang CoreML (với custom layers của ViT) và ONNX Runtime iOS C++ API; đề xuất đường ống tiền xử lý ảnh tối ưu bằng Apple Accelerate Framework.
3. **Phân tích và thiết kế hệ thống**: Xây dựng kiến trúc Hybrid (Edge-First kết hợp Cloud Backend); mô hình hóa hệ thống bằng UML; thiết kế tầng lưu trữ cục bộ mã hóa an toàn tương thích với iOS Keychain Services và Secure Enclave.
4. **Hiện thực hóa phân hệ iOS**: Cài đặt 17 màn hình chính và các màn hình chi tiết chuẩn 59 khung thiết kế Figma, tuân thủ nghiêm ngặt Apple Human Interface Guidelines (Safe Area cho Dynamic Island, cử chỉ vuốt tự nhiên); xây dựng các chức năng phân hệ Bác sĩ và Quản trị viên.
5. **Thực nghiệm và đánh giá**: Đánh giá độ chính xác của mô hình trên tập kiểm thử IQ-OTH/NCCD; kiểm thử chức năng tự động qua bộ test suite 126 ca kiểm thử; thiết lập kế hoạch đo kiểm hiệu năng trên máy tính macOS và thiết bị iPhone vật lý.

### 3. Phạm vi nghiên cứu

#### 3.1 Đối tượng nghiên cứu
- Ảnh CT phổi dạng lát cắt hai chiều (2D CT slices) từ bộ dữ liệu IQ-OTH/NCCD.
- Mô hình học sâu lai AACNN-ViT Adaptive và kỹ thuật giải thích mô hình Grad-CAM.
- Công nghệ Trí tuệ nhân tạo biên trên iOS: CoreML, Apple Neural Engine, ONNX Runtime Mobile for iOS.
- Nền tảng React Native New Architecture (Fabric, TurboModules) trên iOS và dịch vụ đám mây (FastAPI, Firebase).

#### 3.2 Phạm vi nghiên cứu
- **Nền tảng thực nghiệm**: Hỗ trợ các thiết bị iPhone/iPad chạy hệ điều hành từ iOS 16.0 đến iOS 18.0+.
- **Phân định phạm vi chức năng ngoại tuyến và trực tuyến**:
  - *Ngoại tuyến (Offline)*: Tiền xử lý ảnh, suy luận On-Device AI, hiển thị bản đồ nhiệt Grad-CAM, quản lý hồ sơ bệnh nhân và ca bệnh trên bộ lưu trữ mã hóa cục bộ, xuất báo cáo PDF.
  - *Trực tuyến (Online)*: Xác thực người dùng qua máy chủ, đồng bộ hai chiều, lưu trữ sao lưu ảnh CT trên Cloud Storage.
- **Ranh giới thực nghiệm**: Khóa luận ghi nhận trung thực các kết quả đã kiểm chứng trên bộ kiểm thử tự động và mô hình kiến trúc; các số liệu đo kiểm trên iPhone vật lý sẽ được thực hiện khi có môi trường macOS và tài khoản Apple Developer.

### 4. Phương pháp nghiên cứu
- Nghiên cứu lý thuyết và tài liệu kỹ thuật chính thức của Apple (Apple Developer Documentation, CoreML Tools, iOS Security Guide).
- Phương pháp phân tích - thiết kế hướng đối tượng bằng UML.
- Phương pháp phát triển Agile/Scrum phối hợp chặt chẽ với phân hệ Android để đồng bộ 100% logic nghiệp vụ chung.
- Kiểm thử tự động đa tầng: Unit test, Integration test và kiểm thử giao diện React Native.

### 5. Cấu trúc của khóa luận tốt nghiệp
Khóa luận gồm **5 chương chuẩn** theo đúng Đề cương chi tiết:
- **Chương 1: Tổng quan tình hình nghiên cứu**.
- **Chương 2: Cơ sở lý thuyết và nền tảng công nghệ (chuyên sâu hệ sinh thái Apple iOS)**.
- **Chương 3: Phân tích và thiết kế hệ thống**.
- **Chương 4: Cài đặt, thực nghiệm và đánh giá (tập trung phân hệ iOS)**.
- **Chương 5: Kết luận và hướng phát triển**.

---

## CHƯƠNG 1: TỔNG QUAN TÌNH HÌNH NGHIÊN CỨU
*(Nội dung kế thừa phần tổng quan chung về bài toán chẩn đoán ung thư phổi, mô hình học sâu và phân tích sâu sắc nhu cầu ứng dụng Edge AI trên thiết bị iOS của đội ngũ y bác sĩ).*

---

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ NỀN TẢNG CÔNG NGHỆ

### 2.1 Mô hình học sâu phân loại ảnh CT phổi
Trình bày cơ chế hoạt động của mô hình AACNN-ViT Adaptive, cơ chế kết hợp giữa CNN và Multi-Head Self-Attention của Vision Transformer, và thuật toán Grad-CAM trực quan hóa vùng nghi ngờ tổn thương.

### 2.2 Nền tảng công nghệ phát triển hệ thống
- React Native New Architecture trên iOS: Cơ chế CocoaPods, liên kết JSI với Objective-C++/Swift.
- Nền tảng Backend FastAPI và Firebase.

### 2.3 Đặc thù triển khai trên hệ sinh thái Apple iOS
- **Apple Neural Engine (ANE)**: Kiến trúc phần cứng xử lý tensor chuyên biệt của Apple, tối ưu hóa năng lượng và tốc độ suy luận.
- **Khung làm việc CoreML**: Tự động phân phối đồ thị tính toán qua CPU, Metal GPU và ANE.
- **Cơ chế bảo mật iOS Keychain & Secure Enclave**: Lưu trữ an toàn khóa mã hóa AES-256 trong bộ vi xử lý bảo mật độc lập, hỗ trợ xác thực sinh trắc học Face ID / Touch ID.
- **Chuẩn thiết kế Apple Human Interface Guidelines (HIG)**: Tối ưu hóa trải nghiệm điều hướng, hỗ trợ Safe Area cho Dynamic Island và cử chỉ vuốt mượt mà.

---

## CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1 Phân tích yêu cầu
Đặc tả đầy đủ các yêu cầu chức năng cho Bác sĩ, Quản trị viên và các yêu cầu phi chức năng về hiệu năng suy luận, bảo mật dữ liệu y tế trên iOS.

### 3.2 Mô hình hóa hệ thống
Xây dựng sơ đồ Use Case, sơ đồ tuần tự và sơ đồ lớp thực thể kế thừa từ kiến trúc chung của dự án LungCT.

### 3.3 Thiết kế kiến trúc tổng thể
Thiết kế kiến trúc phân tầng (Clean Architecture), trong đó phân hệ iOS chia sẻ 100% tầng Domain và Presentation, độc lập hóa tầng Infrastructure cho các dịch vụ đặc thù của Apple.

### 3.4 Thiết kế cơ sở dữ liệu và tầng lưu trữ an toàn
- Cài đặt `ILocalStorageAdapter` với cơ chế mã hóa chứng thực AES-256-GCM.
- Định tuyến lưu trữ khóa an toàn vào iOS Keychain.
- Thực thi chính sách bảo toàn ca nháp khi tài khoản bị khóa (AUTH-08).

### 3.5 Thiết kế giao diện người dùng tuân thủ Apple HIG
Thiết kế giao diện 59 màn hình bám sát Figma, tinh chỉnh theo tiêu chuẩn của Apple nhằm đảm bảo khả năng duyệt của App Store Review (Medical Category).

---

## CHƯƠNG 4: CÀI ĐẶT, THỰC NGHIỆM VÀ ĐÁNH GIÁ

### 4.1 Môi trường cài đặt và triển khai
- Môi trường phát triển: Node.js, React Native 0.88.0, TypeScript, Xcode (mục tiêu).
- Môi trường thực nghiệm: Bộ kiểm thử tự động Jest sandbox và thiết bị iPhone vật lý mục tiêu.

### 4.2 Cài đặt máy chủ và các dịch vụ đám mây (FastAPI, Firebase)
Trình bày cấu hình dịch vụ FastAPI và các dịch vụ Firebase phục vụ cho ứng dụng khi trực tuyến.

### 4.3 Cài đặt ứng dụng React Native và Tầng suy luận AI trên iOS
- **Hiện thực hóa giao diện**: Biên dịch thành công 17 màn hình chính và các màn hình chi tiết, vượt qua 113/113 bài kiểm thử UI.
- **Khảo sát đường ống AI On-Device trên iOS**:
  - Đối chiếu giữa phương án chuyển đổi CoreML (`.mlpackage`) và ONNX Runtime iOS (`onnxruntime-react-native`).
  - Đề xuất giải pháp ONNX Runtime iOS kết hợp CoreML Execution Provider để đảm bảo tính đồng nhất trọng số với phân hệ Android.
- **Cài đặt Tầng lưu trữ an toàn**:
  - Đóng gói logic nghiệp vụ lưu trữ hồ sơ bệnh nhân trong `localStorageService.ts`.
  - Kiểm chứng thành công thuật toán bảo toàn dữ liệu nháp AUTH-08.

### 4.4 Cấu hình, đóng gói và phát hành phân hệ iOS
Quy trình cấu hình `Podfile`, quản lý chứng chỉ ký ứng dụng (Code Signing) và chuẩn bị hồ sơ phát hành thử nghiệm qua Apple TestFlight.

### 4.5 Thực nghiệm và đo lường kết quả
- **Kiểm thử tự động trên môi trường Jest sandbox**: Vượt qua **16/16 test suites** với **150/150 test cases thành công (100%)** cho toàn bộ phần dùng chung:
  - Giao diện người dùng và điều hướng: 116/116 test cases pass (bổ sung kiểm thử logic đếm ca nháp/hoàn tất trên trang chủ, lọc thống kê 7 ngày/30 ngày/tất cả, và nạp ca bệnh theo ID trên màn hình xuất PDF).
  - Tầng lưu trữ và bảo mật (`localStorageService.test.ts`): 13/13 test cases pass (mã hóa chứng thực AES-256-GCM, bắt lỗi sai khóa, chống trùng mã Q-20, migration schema, cô lập dữ liệu đa người dùng và kịch bản biên AUTH-08).
  - Tích hợp nghiệp vụ bệnh nhân (`patientRepository.test.ts`): 7/7 test cases pass (seed dữ liệu giả lập ban đầu cho bác sĩ, thêm bệnh nhân mới không lưu plaintext, sửa thông tin, kiểm tra tính bền vững sau khi đóng/mở lại, tách biệt dữ liệu giữa 2 tài khoản, bắt lỗi sai khóa, và kiểm tra chặn lưu dữ liệu an toàn khi thiếu module native).
  - Tích hợp nghiệp vụ ca bệnh và ảnh CT (`caseRepository.test.ts`): 6/6 test cases pass (tự động seed ca bệnh mẫu ban đầu, tạo ca mới cho bệnh nhân có mã hóa AES-256-GCM không lưu plaintext, cập nhật ghi chú bác sĩ, kiểm tra nạp lại bền vững sau khi giả lập đóng app, cô lập ca bệnh giữa 2 bác sĩ, đính kèm ảnh CT vào vùng sandbox của app và lưu trữ kết quả suy luận On-Device AI an toàn bền vững).
  - Chuyển đổi SQLite an toàn (`sqliteMigration.test.ts`): 3/3 test cases pass (bảo toàn 100% dữ liệu gốc và phục hồi sau gián đoạn).
  - Bảo mật SQLCipher (`sqlcipherVault.test.ts`): 5/5 test cases pass (kiểm tra passphrase, từ chối khóa sai, ngẫu nhiên hóa đĩa, chống trùng lặp, và cơ chế bảo vệ mã hóa bản sao lưu .encrypted.bak kèm kiểm thử khôi phục).
  - *Đính chính khoa học về phạm vi kiểm thử*: Kết quả kiểm thử các trường thông tin bệnh nhân trong Jest được thực hiện trên môi trường sandbox giả lập (in-memory mock); không được mô tả là dữ liệu đã đọc từ đĩa trên thiết bị thực tế nếu chưa qua kiểm chứng cụ thể.
- **Tính toàn vẹn mật mã học**: Xác thực khả năng phát hiện can thiệp dữ liệu và xử lý ngoại lệ sai khóa của AES-256-GCM trong môi trường thử nghiệm sandbox. Đã loại bỏ hoàn toàn cơ chế mã hóa dự phòng bằng hash/xor thô sơ nhằm đảm bảo tuân thủ tiêu chuẩn an toàn dữ liệu y tế. Không tự khẳng định phần cứng TEE/Secure Enclave nếu chưa đo kiểm trên thiết bị thực tế.
- **Kế hoạch đo kiểm thực tế trên iPhone**: Ghi nhận trung thực rằng phân hệ iOS hiện chưa có môi trường máy tính macOS và thiết bị iPhone vật lý để biên dịch native binary; các chỉ số về FPS, nhiệt độ, mức tiêu hao pin và thời gian suy luận thực tế với CoreML/ANE sẽ được cập nhật sau khi triển khai trên môi trường Apple chính thức.

### 4.6 Đánh giá và so sánh hai phân hệ iOS - Android
Phân tích ma trận so sánh giữa hai phân hệ, làm rõ ưu thế về kiến trúc phần cứng tăng tốc AI của Apple Neural Engine so với các dòng vi xử lý Android tầm trung:

| Tiêu chí so sánh | Phân hệ Android (Dương Thị Thu Diễm) | Phân hệ iOS (Dương Hải Đăng) |
| :--- | :--- | :--- |
| **Nền tảng kiểm thử** | Android SDK 34 / Xiaomi Redmi 13 | iOS 17+ / iPhone vật lý (Dự kiến) |
| **Runtime AI On-Device** | ONNX Runtime Native C++ + LiteRT C API | Nghiên cứu khảo sát CoreML vs ONNX Runtime iOS |
| **Tăng tốc phần cứng** | CPU đa luồng / NNAPI / Vulkan | Apple Neural Engine (ANE) / Metal |
| **Cơ sở dữ liệu cục bộ** | **SQLCipher 4.6.1 (Mã hóa toàn bộ trang đĩa AES-256, không tìm thấy chuỗi dò bằng strings)** | Định hướng CoreData / SQLite mã hóa |
| **Bảo mật phần cứng** | Android Keystore System (AES-256-GCM, định hướng TEE/StrongBox) | Định hướng iOS Keychain & Secure Enclave |
| **Trạng thái thực tế** | **Đã biên dịch APK Release, tích hợp SQLCipher 4.6.1 mã hóa toàn bộ tệp cấp trang, kiểm tra không tìm thấy chuỗi dò qua `strings` trên tệp DB chính, giữ nguyên bản sao lưu kho cũ `.plaintext.bak` (chưa mã hóa), CRUD Bệnh nhân, Ca bệnh, Ghi chú bác sĩ, đính kèm ảnh CT trong sandbox và lưu kết quả On-Device AI** | **Đang nghiên cứu chuyển đổi, kiểm thử Jest dùng chung và mô phỏng giao diện** |

---

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết quả đạt được
1. Xây dựng hoàn chỉnh kiến trúc ứng dụng iOS theo chuẩn Apple HIG, đồng bộ 100% logic nghiệp vụ dùng chung với phân hệ Android qua React Native New Architecture.
2. Hoàn thiện nghiên cứu lý thuyết và khảo sát giải pháp suy luận AI On-Device tối ưu trên iOS (đối chiếu CoreML và ONNX Runtime iOS).
3. Thiết kế tầng lưu trữ an toàn theo Repository Pattern, kiểm chứng logic mã hóa AES-256-GCM sandbox và thuật toán bảo toàn dữ liệu nháp AUTH-08 trên bộ kiểm thử tự động Jest.

### 5.2 Hạn chế
- **Thiết bị và Môi trường**: Chưa thực hiện biên dịch native IPA và đo kiểm thực tế trên máy tính macOS và thiết bị iPhone thật do rào cản phần cứng.
- **Mô hình On-Device**: Chưa hoàn thành việc chuyển đổi và đóng gói mô hình sang định dạng CoreML nhúng nguyên bản trên iOS.
- **Grad-CAM & PDF**: Tính năng Grad-CAM on-device và xuất PDF y tế đang ở mức thiết kế giao diện mô phỏng, chưa có module native trên iOS.
- **Cơ sở dữ liệu & Keystore**: Tầng lưu trữ hiện tại mới chạy trên AsyncStorage và CryptoVault sandbox của Jest, chưa tích hợp native SQLite/SQLCipher và iOS Keychain Services.
- **Pháp lý y tế**: Hệ thống chỉ tham khảo các nguyên tắc thiết kế bảo vệ dữ liệu cá nhân; chưa có chứng nhận hoặc kiểm định pháp lý lâm sàng/HIPAA.

### 5.3 Hướng phát triển
- Thiết lập môi trường macOS để biên dịch bản build IPA và đo kiểm trên iPhone thật.
- Hoàn thành chuyển đổi mô hình AACNN-ViT sang CoreML tối ưu cho Apple Neural Engine.
- Tích hợp iOS Keychain Services và SQLite mã hóa vào tầng lưu trữ.
- Hoàn thiện tính năng Grad-CAM On-Device thuần native và xuất file PDF lâm sàng trên iOS.
- Đăng ký tài khoản Apple Developer và phát hành bản thử nghiệm qua TestFlight.

---

## TÀI LIỆU THAM KHẢO

1. **Apple Inc.** (2026). *Human Interface Guidelines: Designing for iOS*. Apple Developer Documentation.
2. **Apple Inc.** (2026). *Core ML: Integrating Machine Learning Models into Your App*. Apple Developer Documentation.
3. **Apple Inc.** (2026). *iOS Security Guide: Best Practices for Keychain Services and Secure Enclave*. Apple Platform Security.
4. **Microsoft Corporation** (2026). *ONNX Runtime Mobile for iOS Documentation*. Microsoft Open Source.
5. **M. I. Rahman, et al.** (2026). *AACNN-ViT: Adaptive attention-augmented convolutional and vision transformer fusion for lung cancer detection*. Journal of Imaging, 12(2), Art. no. 62.
6. **H. Sung, et al.** (2024). *Global cancer statistics 2024: GLOBOCAN estimates*. CA: A Cancer Journal for Clinicians.
