# BÀI HỌC 01: CÀI ĐẶT MÔI TRƯỜNG PHÁT TRIỂN ANDROID TRÊN WINDOWS TỪ CON SỐ 0
### Hướng dẫn thiết lập toàn diện từ máy tính Windows trắng chưa có công cụ

> **Thời lượng ước tính**: 60 – 90 phút (tùy thuộc tốc độ mạng khi tải Android Studio và SDK)  
> **Dung lượng ổ đĩa yêu cầu tối thiểu**: Trống ít nhất **35 GB** trên ổ đĩa `C:\` (để chứa Android Studio, SDK, Emulator System Image và Gradle Cache)  
> **Yêu cầu phần cứng máy tính**:
> - CPU: Intel Core i5/i7 thế hệ 8 trở lên hoặc AMD Ryzen 5/7 (bắt buộc bật ảo hóa VT-x / AMD-V trong BIOS).
> - RAM: Tối thiểu 16 GB RAM (vì chạy song song Android Studio, máy ảo Android và VS Code chiếm ~10–12 GB RAM).
> - Ổ cứng: Bắt buộc dùng ổ cứng thể rắn **SSD**.  
> **Trạng thái kiểm chứng**: `[Đã kiểm chứng thực tế 100% trên Windows 11 64-bit]`

---

## 🛠️ 1. CÁC CÔNG CỤ CẦN THIẾT VÀ PHIÊN BẢN CHUẨN

> [!CAUTION]
> **Tuyệt đối không cài đặt phiên bản "Latest" bừa bãi**. Hệ sinh thái React Native và Gradle rất nhạy cảm với phiên bản JDK và Node. Dưới đây là các phiên bản đã được kiểm chứng hoạt động 100% trong dự án LungCT:

| Công cụ | Phiên bản chuẩn đã kiểm chứng | Nguồn tải chính thức | Mục đích sử dụng |
| :--- | :---: | :--- | :--- |
| **Git for Windows** | `2.43.x` hoặc mới hơn | [git-scm.com](https://git-scm.com/) | Quản lý phiên bản mã nguồn |
| **Node.js** | `v20.x LTS` (Iron) | [nodejs.org](https://nodejs.org/) | Môi trường thực thi JavaScript/TypeScript |
| **Java Development Kit (JDK)** | `Microsoft OpenJDK 17` hoặc `Azul Zulu 17` | [learn.microsoft.com](https://learn.microsoft.com/vi-vn/java/openjdk/download) | Trình biên dịch mã nguồn Java/Kotlin và Gradle |
| **Android Studio** | `Ladybug (2024.2)` hoặc `Koala (2024.1)` | [developer.android.com](https://developer.android.com/studio) | IDE chính thức, trình quản lý SDK, NDK và Máy ảo |
| **Android SDK Platform** | `API Level 34` (Android 14) | Cài qua SDK Manager của Android Studio | Nền tảng đích biên dịch mã nguồn |
| **Android SDK Build-Tools** | `34.0.0` | Cài qua SDK Manager | Bộ công cụ đóng gói APK/AAB |
| **Android NDK** | `26.1.10909125` | Cài qua SDK Manager (chọn Show Package Details) | Biên dịch C++ Native (ONNX Runtime, SQLCipher) |
| **Visual Studio Code** | Bản mới nhất | [code.visualstudio.com](https://code.visualstudio.com/) | Soạn thảo mã nguồn TypeScript/React Native |

---

## 📌 2. GIẢI THÍCH RÕ CÁC KHÁI NIỆM ANDROID SDK DỄ GÂY NHẦM LẪN

Đối với người mới học lập trình Android từ C++, 4 chỉ số phiên bản sau rất dễ bị nhầm lẫn:

1. **`compileSdk` (API Level 34)**: Phiên bản Android SDK mà trình biên dịch (Gradle) sử dụng để kiểm tra cú pháp và dịch mã nguồn Java/Kotlin của ứng dụng.
2. **`targetSdk` (API Level 34)**: Phiên bản hệ điều hành mà ứng dụng được thiết kế tối ưu và cam kết tuân thủ chính sách bảo mật (quyền riêng tư, thông báo, quản lý bộ nhớ nền).
3. **`minSdk` (API Level 29 - Android 10)**: Phiên bản Android thấp nhất mà ứng dụng cho phép cài đặt. Điện thoại chạy Android thấp hơn (ví dụ Android 9) sẽ bị CH Play hoặc trình cài đặt từ chối.
4. **Android API của Máy ảo / Điện thoại thật (API Level 34)**: Phiên bản hệ điều hành thực tế đang chạy trên thiết bị (ở đây máy ảo `LumaCT_Phone` chạy Android 14 API 34; Xiaomi Redmi 13 chạy HyperOS dựa trên Android 14 API 34).

---

## 💻 3. QUY TRÌNH CÀI ĐẶT TỪNG BƯỚC TRÊN WINDOWS POWERSHELL

> **Quy định Terminal**: Sử dụng **Windows PowerShell 5.1** (mặc định của Windows) hoặc **PowerShell 7**. Không sử dụng Git Bash để cấu hình biến môi trường hệ thống.

### Bước 1: Cài đặt Git và Node.js v20 LTS
1. Tải và cài đặt **Git for Windows**. Khi cài đặt, chọn trình soạn thảo mặc định là VS Code hoặc Notepad, giữ nguyên các tùy chọn mặc định về dòng kết thúc (CRLF).
2. Tải và cài đặt **Node.js v20 LTS**. Trong trình cài đặt, tích chọn **"Automatically install the necessary tools"** (để cài đặt Chocolatey/Python nếu cần build native modules).
3. Mở **PowerShell** và kiểm tra:
   ```powershell
   git --version
   node -v
   npm -v
   ```
   *Kết quả mong đợi*: In ra phiên bản `git version 2.x`, `v20.x.x`, `10.x.x`.

### Bước 2: Cài đặt JDK 17 và Cấu hình JAVA_HOME
1. Tải gói cài đặt MSI của **Microsoft Build of OpenJDK 17**.
2. Sau khi cài xong, đường dẫn JDK thường nằm tại: `C:\Program Files\Microsoft\jdk-17.x.x...`
3. Cấu hình biến môi trường hệ thống:
   - Nhấn phím `Windows`, gõ `env` và chọn **Edit the system environment variables**.
   - Nhấp vào nút **Environment Variables...**
   - Tại mục **System variables**, nhấp **New**:
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Microsoft\jdk-17.0.x-hotspot` (chọn đúng thư mục cài đặt của bạn).
   - Tìm biến `Path`, nhấp **Edit**, thêm dòng mới: `%JAVA_HOME%\bin`.
4. Mở cửa sổ PowerShell mới để kiểm tra:
   ```powershell
   javac -version
   $env:JAVA_HOME
   ```
   *Kết quả mong đợi*: `javac 17.0.x` và đường dẫn JDK tương ứng.

### Bước 3: Cài đặt Android Studio, SDK 34 và NDK
1. Tải và cài đặt **Android Studio**. Chọn kiểu cài đặt **Custom**.
2. Trong bước chọn thành phần (Components Setup), tích chọn:
   - `Android SDK`
   - `Android SDK Platform`
   - `Android Virtual Device`
3. Sau khi Android Studio mở lên, vào **More Actions** -> **SDK Manager**:
   - Thẻ **SDK Platforms**: Tích chọn `Android 14.0 ("UpsideDownCake")` (API Level 34).
   - Thẻ **SDK Tools**:
     - Tích chọn `Android SDK Build-Tools 34.0.0`.
     - Tích chọn `NDK (Side by side)` -> tích chọn phiên bản `26.1.10909125`.
     - Tích chọn `Android SDK Command-line Tools (latest)`.
     - Tích chọn `Android Emulator`.
     - Tích chọn `Android SDK Platform-Tools`.
   - Nhấp **Apply** và đồng ý các điều khoản bản quyền để tải về.

### Bước 4: Cấu hình biến môi trường ANDROID_HOME
1. Mở lại **Environment Variables**:
   - Tại mục **User variables** (hoặc **System variables**), nhấp **New**:
     - Variable name: `ANDROID_HOME`
     - Variable value: `C:\Users\<TÊN_TÀI_KHOẢN>\AppData\Local\Android\Sdk` (thay `<TÊN_TÀI_KHOẢN>` bằng tên tài khoản Windows của bạn; ví dụ: `C:\Users\thudi\AppData\Local\Android\Sdk`).
   - Chọn biến `Path`, thêm lần lượt các đường dẫn sau:
     - `%ANDROID_HOME%\platform-tools` (chứa lệnh `adb`)
     - `%ANDROID_HOME%\emulator` (chứa lệnh khởi động máy ảo)
     - `%ANDROID_HOME%\cmdline-tools\latest\bin`
2. Mở PowerShell mới kiểm tra:
   ```powershell
   adb version
   ```
   *Kết quả mong đợi*: `Android Debug Bridge version 1.0.41...`

---

## 📱 4. KHỞI TẠO MÁY ẢO VÀ KẾT NỐI XIAOMI REDMI 13

### Tạo Máy ảo Android Emulator (LumaCT_Phone)
1. Trong Android Studio, mở **Virtual Device Manager** (Device Manager).
2. Nhấp **Create Device**, chọn phần cứng: `Phone` -> `Pixel 7` hoặc kích thước tương đương màn hình Redmi 13 (6.79 inch, 1080 x 2460).
3. Chọn System Image: `API Level 34` (UpsideDownCake, kiến trúc `x86_64`, Google APIs).
4. Đặt tên thiết bị (AVD Name): `LumaCT_Phone`.
5. Trong mục **Graphics**, chọn **Hardware - GLES 2.0** để tận dụng card đồ họa máy tính giúp render mượt mà.
6. Nhấp **Finish**. Chạy thử máy ảo bằng nút Play (▶).

### Kết nối Điện thoại thật Xiaomi Redmi 13 qua USB Debugging
1. Trên điện thoại Xiaomi Redmi 13:
   - Vào **Cài đặt (Settings)** -> **Giới thiệu điện thoại (About phone)**.
   - Nhấn liên tục 7 lần vào dòng **Phiên bản OS (OS version)** cho đến khi máy báo *"Bạn đã là nhà phát triển!"*.
   - Quay lại Cài đặt -> **Cài đặt bổ sung (Additional settings)** -> **Tùy chọn nhà phát triển (Developer options)**.
   - Bật **Gỡ lỗi USB (USB debugging)**.
   - Bật **Cài đặt qua USB (Install via USB)**.
2. Cắm cáp USB nối điện thoại vào máy tính:
   - Trên màn hình điện thoại sẽ hiện hộp thoại *"Cho phép gỡ lỗi USB từ máy tính này?"*.
   - Tích chọn *"Luôn cho phép từ máy tính này"* và nhấn **OK**.
3. Mở PowerShell kiểm tra:
   ```powershell
   adb devices
   ```
   *Kết quả mong đợi*:
   ```
   List of devices attached
   emulator-5554    device       <-- Máy ảo
   xxxxxxxxxxxx     device       <-- Điện thoại Redmi 13 (Trạng thái phải là "device", không được là "unauthorized" hay "offline")
   ```

---

## ⚠️ 5. CÁC BẪY LỖI KINH NGHIỆM ĐÃ KIỂM CHỨNG TRÊN WINDOWS

1. **Lỗi đường dẫn dài `MAX_PATH` (> 260 ký tự) trên Windows**:
   - Khi biên dịch React Native, các thư viện node_modules lồng nhau sâu kết hợp với Gradle cache dễ vượt quá giới hạn 260 ký tự của Windows, gây lỗi `Filename too long`.
   - *Khắc phục*: Luôn tạo thư mục thực hành ở đường dẫn ngắn gần gốc ổ đĩa, ví dụ: `C:\Practice_LungCT\` hoặc `C:\LungCT\`.
2. **Xung đột khóa tệp do Microsoft OneDrive tự động đồng bộ**:
   - Nếu để mã nguồn trong thư mục đang bị OneDrive tự động đồng bộ (`Desktop` hoặc `Documents`), tiến trình đồng bộ của OneDrive sẽ khóa tệp tạm (file lock) khiến lệnh `npm install` hoặc `gradlew assembleRelease` bị báo lỗi `EBUSY: resource busy or locked`.
   - *Khắc phục*: Tạm dừng đồng bộ OneDrive hoặc làm việc hoàn toàn trên thư mục riêng ngoài phạm vi OneDrive (như `C:\LungCT\`).
3. **Lỗi thiết bị `unauthorized` khi cắm Redmi 13**:
   - Rút cáp cắm lại, mở sáng màn hình điện thoại, kiểm tra hộp thoại cấp quyền RSA và tích chọn *Luôn cho phép*. Nếu không hiện, chạy `adb kill-server` rồi `adb start-server` trong PowerShell.

---

## ✅ BẢNG KIỂM TRA (CHECKLIST) TRƯỚC KHI CHUYỂN BÀI

- [ ] Lệnh `node -v` in ra phiên bản v20.x.x.
- [ ] Lệnh `javac -version` in ra phiên bản 17.0.x.
- [ ] Lệnh `adb version` in ra phiên bản 1.0.41 trở lên.
- [ ] Lệnh `adb devices` hiển thị ít nhất một thiết bị với trạng thái `device`.
- [ ] Đã tạo sẵn thư mục thực hành tại ổ đĩa ngắn (ví dụ `C:\Practice_LungCT\`).
