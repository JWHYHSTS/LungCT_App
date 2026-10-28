# LỘ TRÌNH TỰ CODE LUNGCT TRÊN IOS (MACOS)

> **Môi trường phát triển**: macOS Sonoma / Sequoia (Apple Silicon M1/M2/M3 hoặc Intel Core i7/i9)  
> **Thiết bị kiểm thử mục tiêu**: iOS Simulator (iPhone 15 / 16) & Thiết bị thực tế **iPhone** (iOS 17/18)  
> **Tài khoản nhà phát triển**: Apple Developer Account (Cá nhân miễn phí để test máy thật 7 ngày, hoặc trả phí $99/năm)  
> **Người phụ trách**: Dương Hải Đăng (MSSV: 49.01.103.020)  
> **Đối tượng người học**: Đã nắm C++ cơ bản và một ít Python; bắt đầu từ thư mục trống hoàn toàn trên máy Mac.

---

## 📊 BẢNG TỔNG THỂ LỘ TRÌNH THỰC HÀNH IOS

| Mã bước | Mục tiêu | Vì sao cần bước này | Công cụ & Phiên bản | Thư mục / Tệp cần tạo hoặc sửa | Lệnh chạy & Kiểm tra | Tiêu chí đạt để chuyển bước sau | Trạng thái | Môi trường đã kiểm chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **IOS-01** | Cài đặt Homebrew, Node.js, Xcode, CocoaPods | Thiết lập toolchain biên dịch ứng dụng native cho hệ sinh thái Apple | macOS, Xcode 15/16, Command Line Tools, CocoaPods 1.15+, Node.js v20 LTS | `/Applications/Xcode.app`<br>`~/.zshrc` | `xcode-select -p`<br>`pod --version`<br>`node -v` | Các công cụ in đúng phiên bản, Xcode SDK iOS 17/18 sẵn sàng | Đang soạn thảo | Đối chiếu tài liệu Apple Developer |
| **IOS-02** | Khởi tạo dự án thực hành & cài đặt CocoaPods | Tạo dự án React Native hỗ trợ iOS và cài dependencies native | React Native 0.88.0, CocoaPods | `ios/Podfile`<br>`ios/Podfile.lock` | `cd ios && pod install` | Hoàn thành `Pod install` không lỗi, sinh ra file `LumaCT.xcworkspace` | Đang soạn thảo | macOS Simulator target |
| **IOS-03** | Thiết lập Mã ký (Code Signing) & Bundle Identifier | Cho phép ứng dụng cài đặt và chạy trên thiết bị iPhone thật hoặc Simulator | Apple Developer Account, Xcode Signing & Capabilities | `ios/LumaCT.xcodeproj` | Mở `LumaCT.xcworkspace` trong Xcode, chọn Signing Team | Xcode hiển thị "Provisioning Profile: iOS Team Provisioning Profile" (Không báo lỗi đỏ) | Đang soạn thảo | Xcode 15/16 |
| **IOS-04** | Đồng bộ Design System Tokens & Màn hình giao diện | Chia sẻ 100% mã nguồn UI TypeScript từ phân hệ dùng chung | React Native StyleSheet, TypeScript | `src/ui/theme/*`<br>`src/ui/components/*` | `npm run typecheck`<br>`npm test` | Toàn bộ 16 test suites và 113 UI tests pass trên môi trường kiểm thử | Đã kiểm chứng | Node.js Jest Sandbox |
| **IOS-05** | Tích hợp CSDL Cục bộ & Khảo sát SQLCipher trên iOS | Lưu trữ bệnh nhân/ca bệnh, bảo vệ tệp tin CSDL bằng mã hóa cấp trang | SQLite / SQLCipher pod (`pod 'SQLCipher'`) | `ios/Podfile`<br>`src/services/storage/*` | `pod install`<br>`npm test -- --testPathPattern=repository` | Tầng Repository hoạt động chuẩn xác, tương thích hoàn toàn dữ liệu | Đang soạn thảo | Báo cáo lý thuyết khóa luận iOS |
| **IOS-06** | Khảo sát & Đánh giá Runtime AI On-Device (CoreML vs ONNX Runtime) | Đánh giá tính khả thi chạy suy luận nốt phổi ngoại tuyến trên Neural Engine của chip Apple Bionic | CoreML (`.mlpackage` / `.mlmodel`) hoặc ONNX Runtime iOS (`onnxruntime-c`) | `ios/Models/`<br>`src/services/ai/*` | Đo lường thời gian suy luận (Latency) và độ chính xác phân loại | Xác định runtime tối ưu: CoreML tận dụng NPU (ANE) hay ONNX Runtime giữ nguyên định dạng FP32 | Đang nghiên cứu | Đang khảo sát (Bản thảo Khóa luận iOS) |
| **IOS-07** | Quản lý Khóa Bí mật qua Apple Keychain Services | Bảo vệ Master Key an toàn bằng phần cứng Secure Enclave (nếu hỗ trợ) | Apple Keychain Services API (Swift/Objective-C) | `ios/LumaCT/KeychainVault.swift` | Kiểm tra đọc/ghi khóa qua SecItemAdd / SecItemCopyMatching | Khóa được cô lập theo ứng dụng, không bị trích xuất qua backup iTunes không mã hóa | Đang soạn thảo | Báo cáo lý thuyết khóa luận iOS |
| **IOS-08** | Biên dịch thử nghiệm trên iOS Simulator | Chạy thử nghiệm toàn bộ luồng giao diện trên máy ảo iPhone | iOS Simulator (iPhone 15 / 16) | Xcode Scheme: `LumaCT` -> `iPhone 15` | `npx react-native run-ios --simulator="iPhone 15"` | Simulator khởi động, ứng dụng hiển thị đúng tỷ lệ, nút bấm phản hồi tốt | Chờ triển khai | Chờ máy macOS chính thức |
| **IOS-09** | Kết nối iPhone thật & Kiểm thử thực địa | Đánh giá độ trễ thực tế, độ sáng màn hình, thao tác cảm ứng trên thiết bị thật | Cáp Lightning / USB-C, iPhone thật | Xcode Devices and Simulators | Nhấn nút "Run" trong Xcode với target là iPhone cá nhân | Ứng dụng chạy mượt mà, phân quyền ảnh/camera hoạt động chính xác | Chờ triển khai | Chờ thiết bị iOS thực tế |
| **IOS-10** | Chuẩn bị hồ sơ nghiệm thu & Báo cáo so sánh | Lập bảng đối chiếu toàn diện số liệu đo kiểm giữa iOS và Android | Markdown Reports | `reports/ios/khoa-luan-ios.md` | Đối chiếu số đo FPS, RAM, Latency với bản Android Redmi 13 | Bản thảo khóa luận iOS phản ánh đúng thực tế nghiên cứu | Đã soạn thảo | Báo cáo Khóa luận iOS 2026 |

---

## 📖 CÁC BÀI HƯỚNG DẪN CHI TIẾT

- [Bài 1: Cài đặt Môi trường macOS, Xcode và CocoaPods cho người mới](01-cai-dat-moi-truong-macos.md)
- [Bài 2: Khảo sát AI On-Device và Cơ chế Bảo mật Dữ liệu trên iOS](02-khao-sat-ai-va-bao-mat-ios.md)
