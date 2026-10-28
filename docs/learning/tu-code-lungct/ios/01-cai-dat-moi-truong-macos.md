# BÀI HỌC 01: CÀI ĐẶT MÔI TRƯỜNG PHÁT TRIỂN IOS TRÊN MACOS

> **Dành cho**: Phân hệ iOS (Dương Hải Đăng) và người tự thực hành trên macOS  
> **Điều kiện tiên quyết**: Có máy tính chạy **macOS Sonoma (14.x)** hoặc **macOS Sequoia (15.x)** (khuyến nghị chip Apple Silicon M1/M2/M3/M4; hỗ trợ Intel Core i7/i9 với tối thiểu 16 GB RAM và 50 GB ổ cứng trống).  
> **Trạng thái kiểm chứng thực tế**: `[Đối chiếu tài liệu chính thức Apple Developer / Chờ máy macOS để chạy thực tế]`  
> **Phân định rõ ràng**: Các bước dưới đây được đối chiếu từ tài liệu chính thức của Apple Developer và React Native 0.88.0. Hiện tại nhóm chưa có máy Mac vật lý để chạy xác minh toàn trình, do đó bài học này được đánh dấu là *Hướng dẫn lý thuyết kỹ thuật đã đối chiếu, chờ thực nghiệm*.

---

## 🧭 1. MỤC TIÊU VÀ KẾT QUẢ ĐẠT ĐƯỢC

Sau khi hoàn thành bài học này, bạn sẽ:
1. Cài đặt hoàn chỉnh bộ công cụ dòng lệnh macOS (`Command Line Tools`), Homebrew, Node.js v20 LTS và CocoaPods.
2. Cài đặt Xcode từ Mac App Store, tải iOS SDK 17/18 và khởi chạy iOS Simulator.
3. Hiểu rõ sự khác biệt giữa tài khoản Apple Developer miễn phí (chỉ test máy thật 7 ngày) và tài khoản trả phí ($99/năm để dùng TestFlight).
4. Phân biệt được kiến trúc Simulator (`arm64` trên Apple Silicon / `x86_64` trên Intel) và thiết bị iPhone thật; không đồng nhất việc build thành công Simulator là đã chạy được trên iPhone.

---

## 🛠️ 2. BẢNG CÔNG CỤ VÀ PHIÊN BẢN ĐÃ ĐỐI CHIẾU

| Công cụ | Phiên bản chuẩn | Nguồn cài đặt | Mục đích |
| :--- | :---: | :--- | :--- |
| **macOS** | 14.x (Sonoma) hoặc 15.x (Sequoia) | Apple | Hệ điều hành bắt buộc để biên dịch ứng dụng iOS |
| **Xcode** | `15.4` hoặc `16.x` | Mac App Store | IDE chính thức, trình biên dịch Clang/Swift và iOS SDK |
| **Command Line Tools** | Đi kèm Xcode | `xcode-select --install` | Công cụ dòng lệnh git, clang, make |
| **Homebrew** | `4.x` | [brew.sh](https://brew.sh/) | Trình quản lý gói cho macOS |
| **Node.js** | `v20.x LTS` | `brew install node@20` | Môi trường thực thi JavaScript/Metro Bundler |
| **CocoaPods** | `1.15.x` hoặc mới hơn | `sudo gem install cocoapods` hoặc `brew install cocoapods` | Trình quản lý thư viện native iOS (Podfile) |
| **iOS Simulator** | iOS 17.x hoặc 18.x | Tải trong Xcode Components | Giả lập máy iPhone trên màn hình Mac |

---

## 💻 3. HƯỚNG DẪN CÀI ĐẶT TỪNG BƯỚC TRÊN MACOS TERMINAL

> **Ứng dụng sử dụng**: Mở ứng dụng **Terminal** (hoặc iTerm2) trên macOS. Shell mặc định là `zsh`.

### Bước 1: Cài đặt Xcode Command Line Tools
1. Mở Terminal và chạy lệnh:
   ```bash
   xcode-select --install
   ```
2. Một hộp thoại hệ thống sẽ xuất hiện hỏi *"Bạn có muốn cài đặt các công cụ dành cho nhà phát triển không?"*. Nhấn **Install** và đợi hoàn tất.
3. Kiểm tra đường dẫn công cụ:
   ```bash
   xcode-select -p
   # Kết quả mong đợi: /Applications/Xcode.app/Contents/Developer hoặc /Library/Developer/CommandLineTools
   ```

### Bước 2: Cài đặt Homebrew và Node.js v20 LTS
1. Cài đặt Homebrew (nếu máy chưa có):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Cấu hình Homebrew vào biến môi trường `~/.zshrc`:
   ```bash
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```
3. Cài đặt Node.js phiên bản 20 LTS:
   ```bash
   brew install node@20
   brew link node@20 --force --overwrite
   ```
4. Kiểm tra phiên bản:
   ```bash
   node -v
   npm -v
   # Kết quả mong đợi: v20.x.x và 10.x.x
   ```

### Bước 3: Cài đặt Xcode và iOS Simulator
1. Mở **App Store** trên Mac, tìm kiếm **Xcode** và nhấn **Get / Install** (dung lượng tải khoảng 12 – 15 GB).
2. Sau khi cài đặt, mở Xcode:
   - Đồng ý với điều khoản sử dụng (**Agree**).
   - Khi Xcode hỏi cài đặt thêm thành phần, tích chọn **iOS 17.x** (hoặc **iOS 18.x**) Simulator Runtime.
3. Cấu hình Xcode sử dụng đúng Command Line Tools:
   - Mở Xcode menu -> **Settings...** (hoặc `Cmd + ,`).
   - Chọn thẻ **Locations**.
   - Tại mục **Command Line Tools**, chọn phiên bản Xcode vừa cài đặt (ví dụ: `Xcode 16.0`).

### Bước 4: Cài đặt CocoaPods
CocoaPods là công cụ quản lý thư viện native C++/Objective-C/Swift cho iOS (tương đương với Gradle trên Android).
1. Cài đặt CocoaPods qua Homebrew:
   ```bash
   brew install cocoapods
   ```
2. Kiểm tra phiên bản:
   ```bash
   pod --version
   # Kết quả mong đợi: 1.15.x trở lên
   ```

---

## 📱 4. QUẢN LÝ CHỨNG CHỈ (SIGNING) & KẾT NỐI IPHONE THẬT

### Phân biệt 2 loại tài khoản Apple Developer:
1. **Tài khoản Apple ID Cá nhân Miễn phí (Free Personal Team)**:
   - **Giới hạn**: Ứng dụng sau khi cài vào iPhone thật **chỉ chạy được tối đa 7 ngày**. Sau 7 ngày, iOS sẽ thu hồi chứng chỉ và app không thể mở được nữa (báo lỗi *Untrusted Developer*).
   - **Chỉ cài tối đa 3 ứng dụng tự ký** trên một máy iPhone.
   - **Không thể dùng TestFlight** hoặc gửi link tải từ xa cho người khác.
2. **Tài khoản Apple Developer Program Trả phí ($99/năm)**:
   - Cho phép phân phối qua **TestFlight** (tối đa 10.000 người dùng thử nghiệm trong 90 ngày).
   - Chứng chỉ nội bộ (Ad-Hoc/Enterprise) có hiệu lực 1 năm.

### Cấu hình Signing trong Xcode:
1. Mở Xcode -> **Settings...** -> thẻ **Accounts**.
2. Nhấn dấu `+` ở góc dưới bên trái, chọn **Apple ID**, đăng nhập tài khoản Apple ID của bạn.
3. Khi mở dự án iOS (`.xcworkspace`), chọn Target chính -> thẻ **Signing & Capabilities**:
   - Tích chọn **Automatically manage signing**.
   - Tại mục **Team**, chọn Personal Team của bạn.
   - Tại mục **Bundle Identifier**, đặt định danh duy nhất (ví dụ: `com.haidang.lungct`).

### Kết nối iPhone thật vào máy Mac:
1. Dùng cáp USB-C hoặc Lightning cắm iPhone vào máy Mac.
2. Trên iPhone: Mở khóa màn hình, chọn **Tin cậy máy tính này (Trust This Computer)** và nhập mật mã màn hình.
3. Trên iPhone (từ iOS 16 trở lên): Phải bật chế độ nhà phát triển:
   - Vào **Cài đặt (Settings)** -> **Quyền riêng tư & Bảo mật (Privacy & Security)**.
   - Cuộn xuống dưới cùng, chọn **Chế độ nhà phát triển (Developer Mode)** -> Bật **On**.
   - Máy sẽ khởi động lại và hỏi xác nhận một lần nữa.
4. Mở Xcode -> **Window** -> **Devices and Simulators** (`Cmd + Shift + 2`): iPhone của bạn sẽ xuất hiện trong danh sách và sẵn sàng để cài app.

---

## ⚠️ 5. CÁC BẪY LỖI NATIVE IOS THƯỜNG GẶP VÀ CÁCH XỬ LÝ

### Lỗi 1: `CocoaPods could not find compatible versions for pod ...`
- **Triệu chứng**: Chạy `pod install` thất bại, báo xung đột phiên bản giữa các thư viện React Native.
- **Cách sửa**: Chạy lệnh cập nhật kho specs:
  ```bash
  cd ios
  pod repo update
  pod install
  ```

### Lỗi 2: `Untrusted Developer Certificate` trên iPhone thật
- **Triệu chứng**: Build thành công và app đã cài vào màn hình chính iPhone, nhưng bấm vào app thì báo *"Nhà phát triển không được tin cậy"*.
- **Cách sửa**: Trên iPhone, vào **Cài đặt** -> **Cài đặt chung (General)** -> **Quản lý VPN & Thiết bị (VPN & Device Management)** -> Chọn tài khoản email Apple ID của bạn -> Nhấn **Tin cậy (Trust)**.

### Lỗi 3: `PhaseScriptExecution [CP-User] Generate Specs failed`
- **Triệu chứng**: Lỗi xảy ra khi kiến trúc mới (New Architecture) không tìm thấy đường dẫn Node trong Xcode build phases.
- **Cách sửa**: Khai báo đường dẫn node rõ ràng vào file `.xcode.env.local`:
  ```bash
  cd ios
  echo "export NODE_BINARY=$(which node)" > .xcode.env.local
  ```
