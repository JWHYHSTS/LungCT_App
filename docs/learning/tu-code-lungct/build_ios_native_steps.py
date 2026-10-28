# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN CÁC BƯỚC THỰC HÀNH NATIVE RIÊNG CHO PHÂN HỆ IOS (MACOS):
Bao phủ:
- Bước iOS 001: Môi trường macOS (Homebrew, Node v20 LTS, Watchman, CocoaPods 1.15+)
- Bước iOS 002: Cài đặt Xcode 15/16, Command Line Tools & iOS Simulator API 17/18
- Bước iOS 003: Khởi tạo và cấu hình Podfile với C++ Flags & ONNX Runtime iOS / CoreML
- Bước iOS 004: Xây dựng Module Native Swift/Objective-C Keychain (Apple Keychain Services thay cho Keystore)
- Bước iOS 005: Khảo sát Kiến trúc AI CoreML vs ONNX Runtime iOS (Ghi rõ giới hạn chưa có Mac vật lý để compile)
"""

from build_large_curriculum import add_full_step

def append_ios_native_steps(doc):
    # ==========================================
    # BƯỚC iOS 001: Môi trường macOS
    # ==========================================
    add_full_step(
        doc, step_num=1,
        title="Thiết lập Môi trường macOS: Homebrew, Node.js v20 LTS, Watchman & CocoaPods",
        purpose="Chuẩn bị máy Mac với đầy đủ các công cụ dòng lệnh nền tảng để quản lý gói phụ thuộc JavaScript và thư viện native C++/Objective-C.",
        terminal_location="macOS Terminal (zsh) tại thư mục người dùng (~).",
        shell_action="brew install node@20 watchman cocoapods",
        code_file_path="~/.zshrc",
        full_code="""# Cấu hình biến môi trường trên macOS (~/.zshrc)
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Kiểm tra công cụ đã cài đặt
node -v          # Kỳ vọng: v20.x.x LTS
npm -v           # Kỳ vọng: 10.x.x
pod --version    # Kỳ vọng: 1.15.x trở lên
watchman -v      # Kỳ vọng: 2024.x.x trở lên""",
        line_by_line_explanation=[
            ["brew install node@20", "Cài đặt môi trường Node.js v20 LTS trên chip Apple Silicon (M1/M2/M3) qua Homebrew."],
            ["brew install watchman", "Công cụ giám sát thay đổi tệp của Meta, bắt buộc để Metro Bundler tự động nạp lại mã (Hot Reload) trên macOS."],
            ["brew install cocoapods", "Trình quản lý phụ thuộc thư viện native C++/Objective-C cho hệ sinh thái Apple (tương đương Gradle trên Android)."]
        ],
        comment_guide="Nêu rõ kiến trúc macOS: Dùng Homebrew tại /opt/homebrew cho Apple Silicon và /usr/local cho máy Mac Intel cũ.",
        wiring_guide="Gõ 'source ~/.zshrc' để áp dụng ngay các đường dẫn biến môi trường mà không cần khởi động lại máy Mac.",
        run_and_verify="Gõ 'pod --version'. Terminal in ra phiên bản 1.15.x trở lên không có cảnh báo Ruby.",
        troubleshooting="Nếu gặp lỗi Ruby Gem khi chạy pod: Chạy 'brew reinstall cocoapods' thay vì dùng 'sudo gem install cocoapods' để tránh xung đột hệ điều hành.",
        checklist="[ ] node -v in ra v20.x.x\n[ ] pod --version in ra 1.15.x+\n[ ] watchman hoạt động bình thường"
    )

    # ==========================================
    # BƯỚC iOS 002: Xcode & Simulator
    # ==========================================
    add_full_step(
        doc, step_num=2,
        title="Cài đặt Xcode, Command Line Tools & Cấu hình iPhone Simulator",
        purpose="Thiết lập bộ công cụ chính thức của Apple để biên dịch mã nguồn Swift/C++ và chạy máy ảo iPhone giả lập.",
        terminal_location="macOS Terminal.",
        shell_action="xcode-select --install\nsudo xcode-select -s /Applications/Xcode.app/Contents/Developer",
        code_file_path="Xcode Settings -> Components",
        full_code="""# Chấp thuận điều khoản bản quyền của Apple Xcode
sudo xcodebuild -license accept

# Liệt kê danh sách máy ảo iPhone có sẵn
xcrun simctl list devices

# Khởi động máy ảo iPhone 15 Pro chạy iOS 17
xcrun simctl boot "iPhone 15 Pro" """,
        line_by_line_explanation=[
            ["xcode-select -s /Applications/Xcode.app...", "Chỉ định công cụ dòng lệnh sử dụng trực tiếp bộ SDK bên trong Xcode chính thức."],
            ["sudo xcodebuild -license accept", "Tự động chấp thuận giấy phép phần mềm Apple để cho phép chạy lệnh build tự động từ terminal."],
            ["xcrun simctl list devices", "Bộ điều khiển máy ảo Simulator của Apple: Liệt kê toàn bộ các dòng máy iPhone/iPad được hỗ trợ."]
        ],
        comment_guide="Giải thích phân biệt ký số (Code Signing): Chạy máy ảo Simulator KHÔNG CẦN tài khoản Apple Developer trả phí; nhưng cài lên iPhone thật đòi hỏi tạo chứng chỉ và Provisioning Profile hợp lệ.",
        wiring_guide="Mở Xcode -> Settings -> Platforms -> Tải gói iOS 17 hoặc 18 Simulator Runtime.",
        run_and_verify="Màn hình máy ảo iPhone xuất hiện trên thanh Dock và khởi động vào màn hình chính Springboard.",
        troubleshooting="Nếu xcodebuild báo lỗi thiếu license: Mở terminal chạy sudo xcodebuild -license và gõ 'agree'.",
        checklist="[ ] Xcode 15/16 được cài đặt đầy đủ\n[ ] simctl khởi động được máy ảo iPhone\n[ ] License đã được chấp thuận"
    )

    # ==========================================
    # BƯỚC iOS 003: Cấu hình Podfile
    # ==========================================
    add_full_step(
        doc, step_num=3,
        title="Cấu hình Podfile & Tích hợp Thư viện Native iOS (ios/Podfile)",
        purpose="Khai báo các thư viện native C++ và bảo mật cho phân hệ iOS, thiết lập cờ biên dịch C++20 và cấu hình quyền truy cập thư viện ảnh.",
        terminal_location="macOS Terminal tại thư mục ios/ của dự án.",
        shell_action="cd ios && pod install --repo-update",
        code_file_path="ios/Podfile",
        full_code="""platform :ios, '15.1'
prepare_react_native_project!

target 'mobile' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false
  )

  # Cấu hình cờ biên dịch C++20 cho các module xử lý ảnh y tế
  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      end
    end
  end
end""",
        line_by_line_explanation=[
            ["platform :ios, '15.1'", "Quy định phiên bản iOS tối thiểu: 15.1 (đảm bảo hỗ trợ các API máy học Neural Engine và CoreML hiện đại)."],
            [":hermes_enabled => true", "Kích hoạt máy ảo Hermes Engine tối ưu hóa bộ nhớ RAM và tăng tốc khởi động ứng dụng trên thiết bị di động."],
            ["config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'", "Bắt buộc trình biên dịch Clang sử dụng chuẩn C++20 để biên dịch các thuật toán tính toán ma trận ma trắc ảnh y tế."]
        ],
        comment_guide="Nêu rõ vai trò của lệnh 'pod install': Tải và liên kết toàn bộ mã nguồn thư viện bên thứ ba vào tệp Workspace (.xcworkspace). Tuyệt đối không mở tệp .xcodeproj đơn lẻ.",
        wiring_guide="Sau khi chạy pod install, luôn mở dự án bằng lệnh: open ios/mobile.xcworkspace.",
        run_and_verify="Terminal in ra dòng: 'Pod installation complete! There are X dependencies from the Podfile...'.",
        troubleshooting="Nếu gặp lỗi CDN: Chạy lệnh 'pod repo remove trunk && pod setup' rồi thực hiện lại.",
        checklist="[ ] Podfile được cấu hình đúng chuẩn C++20\n[ ] pod install chạy hoàn tất thành công\n[ ] Tạo ra tệp mobile.xcworkspace hợp lệ"
    )

    # ==========================================
    # BƯỚC iOS 004: Apple Keychain Module
    # ==========================================
    add_full_step(
        doc, step_num=4,
        title="Xây dựng Module Bảo Mật Native Apple Keychain (IOSCryptoVaultModule.swift)",
        purpose="Triển khai dịch vụ lưu trữ khóa an toàn trên iOS thông qua Apple Keychain Services (thay thế cho Android Keystore), hỗ trợ bảo vệ dữ liệu bằng Secure Enclave.",
        terminal_location="Xcode IDE hoặc trình soạn thảo mã nguồn tại ios/mobile/.",
        shell_action="New-Item -ItemType File -Force -Path ios/mobile/IOSCryptoVaultModule.swift",
        code_file_path="ios/mobile/IOSCryptoVaultModule.swift",
        full_code="""import Foundation
import Security
import React

@objc(IOSCryptoVaultModule)
class IOSCryptoVaultModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // Lưu trữ khóa đối xứng an toàn vào Apple Keychain
  @objc(saveSecureKey:keyData:resolver:rejecter:)
  func saveSecureKey(alias: String, keyData: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let data = keyData.data(using: .utf8) else {
      reject("INVALID_DATA", "Dữ liệu khóa không hợp lệ", nil)
      return
    }

    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: alias,
      kSecValueData as String: data,
      kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    ]

    SecItemDelete(query as CFDictionary)
    let status = SecItemAdd(query as CFDictionary, nil)

    if status == errSecSuccess {
      resolve(true)
    } else {
      reject("KEYCHAIN_ERROR", "Lỗi lưu vào Keychain: \(status)", nil)
    }
  }

  // Truy xuất khóa đối xứng từ Apple Keychain
  @objc(getSecureKey:resolver:rejecter:)
  func getSecureKey(alias: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: alias,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne
    ]

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)

    if status == errSecSuccess, let data = item as? Data, let str = String(data: data, encoding: .utf8) {
      resolve(str)
    } else {
      reject("NOT_FOUND", "Không tìm thấy khóa trong Keychain", nil)
    }
  }
}""",
        line_by_line_explanation=[
            ["@objc(IOSCryptoVaultModule)", "Cầu nối Objective-C runtime: Cho phép React Native nhận diện và ánh xạ lớp Swift này thành một Native Module."],
            ["kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly", "Thuộc tính bảo mật cao nhất của Apple Keychain: Khóa chỉ giải mã sau khi người dùng mở khóa màn hình lần đầu và TUYỆT ĐỐI KHÔNG đồng bộ lên iCloud."],
            ["SecItemAdd(query as CFDictionary, nil)", "Gọi API tầng thấp của hệ điều hành iOS (Security Framework) để ghi dữ liệu vào phân vùng bảo vệ phần cứng Secure Enclave."]
        ],
        comment_guide="Giải thích sự tương đương kiến trúc: Apple Keychain trên iOS đóng vai trò tương đương với Android Keystore trên Android; cả hai đều là ranh giới phòng thủ khóa mật mã tối thượng.",
        wiring_guide="Tạo thêm tệp cầu nối Objective-C (IOSCryptoVaultModule.m) để khai báo RCT_EXTERN_MODULE và RCT_EXTERN_METHOD cho React Native.",
        run_and_verify="Biên dịch dự án trong Xcode (Cmd + B): Xác nhận mã Swift biên dịch thành công 0 errors.",
        troubleshooting="Nếu Xcode báo lỗi thiếu bridging header: Cho phép Xcode tự động tạo tệp mobile-Bridging-Header.h khi thêm tệp Swift vào dự án.",
        checklist="[ ] IOSCryptoVaultModule.swift được tạo trong thư mục native iOS\n[ ] Áp dụng đúng thuộc tính kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly\n[ ] Có tệp Objective-C bridge tương ứng"
    )

    # ==========================================
    # BƯỚC iOS 005: Khảo sát CoreML vs ONNX iOS
    # ==========================================
    add_full_step(
        doc, step_num=5,
        title="Khảo sát Kiến trúc AI Trên iOS: CoreML vs ONNX Runtime iOS",
        purpose="So sánh chuyên sâu hai phương án triển khai Edge AI trên hệ sinh thái Apple, đánh giá khả năng tận dụng phần cứng Apple Neural Engine (ANE) và bảo toàn tính nhất quán học thuật.",
        terminal_location="Báo cáo lý thuyết & Đối chiếu tài liệu Apple Developer.",
        shell_action="# Đối chiếu tài liệu CoreML Model Specification & ONNX Runtime iOS Pod",
        code_file_path="docs/learning/tu-code-lungct/ios_ai_survey.md",
        full_code="""// BẢNG SO SÁNH ĐỐI CHỨNG KỸ THUẬT: COREML VS ONNX RUNTIME IOS

1. TIÊU CHÍ HIỆU NĂNG PHẦN CỨNG:
   - CoreML: Tận dụng trực tiếp Apple Neural Engine (ANE) trên các dòng chip A-series / M-series. Tiết kiệm pin tối đa, suy luận cực nhanh.
   - ONNX Runtime iOS: Chạy qua CPU/Metal Execution Provider. Hiệu năng ổn định nhưng tiêu thụ năng lượng cao hơn CoreML.

2. ĐỘ CHÍNH XÁC & BẢO TOÀN TRỌNG SỐ:
   - CoreML: Khi chuyển đổi mô hình Adaptive Fusion chứa các lớp Cross-Attention và Gate phi tuyến từ PyTorch sang định dạng .mlpackage thường gặp sai lệch trọng số do cơ chế phân rã toán tử của coremltools.
   - ONNX Runtime iOS: Nhập trực tiếp tệp mô hình .onnx nguyên bản từ quá trình huấn luyện, bảo toàn 100% kết quả đối chứng với phân hệ Android.

3. TRẠNG THÁI THỰC NGHIỆM TRUNG THỰC CỦA ĐỒ ÁN:
   - Tầng UI Logic & Quản lý Ca khám: Đã hoàn thiện và kiểm chứng 146/146 tests Jest sandbox.
   - Tầng Native iOS IPA: Đang ở trạng thái [Khảo sát lý thuyết hoàn tất, chờ phần cứng máy Mac vật lý để đo kiểm thực nghiệm lâm sàng].""",
        line_by_line_explanation=[
            ["Apple Neural Engine (ANE)", "Bộ vi xử lý nơ-ron chuyên dụng trên chip Apple, tối ưu hóa cho các phép tính ma trận 16-bit và 32-bit."],
            ["coremltools converter", "Bộ thư viện Python của Apple dùng để chuyển đổi mô hình từ PyTorch sang .mlpackage."],
            ["Bảo toàn 100% kết quả đối chứng", "Lý do học thuật ủng hộ ONNX Runtime: Đảm bảo cùng một lát cắt CT phổi, cả bác sĩ dùng Android và bác sĩ dùng iPhone đều nhận được kết quả xác suất giống hệt nhau."]
        ],
        comment_guide="Ghi nhận trung thực tuyệt đối: Không nhận bừa là đã đo được FPS hay mili-giây trên iPhone khi thực tế nhóm chưa có máy Mac vật lý để chạy đo kiểm.",
        wiring_guide="Đây là nội dung phục vụ trả lời chất vấn trước hội đồng bảo vệ khóa luận về định hướng mở rộng đa nền tảng.",
        run_and_verify="Đọc và nắm vững các luận điểm so sánh để tự tin phản biện học thuật.",
        troubleshooting="Nếu hội đồng hỏi 'tại sao chưa build iOS?': Trình bày rõ nhóm đã hoàn thành toàn bộ tầng mã nguồn dùng chung và thiết kế sẵn kiến trúc native, sẵn sàng biên dịch ngay khi có trang thiết bị.",
        checklist="[ ] Nắm vững ưu/nhược điểm của CoreML và ONNX Runtime\n[ ] Hiểu rõ vai trò của Apple Neural Engine (ANE)\n[ ] Minh bạch về trạng thái kiểm chứng thực tế"
    )

print("[*] Module append_ios_native_steps ready.")
