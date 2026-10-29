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

## 🎨 6. TỰ THAY TÊN VÀ LOGO ỨNG DỤNG (APP BRANDING & ICONS)

Khi phát triển ứng dụng di động thực tế, việc thay đổi tên hiển thị (App Name) và biểu tượng (App Icon) là bước quan trọng để cá nhân hóa sản phẩm. Đối với người mới bắt đầu, đây là một trong những phần dễ gây nhầm lẫn nhất giữa **cấu hình Expo**, **cấu hình native Android**, và **cấu hình native iOS**.

Mục này hướng dẫn chi tiết cách tự thay đổi toàn diện tên và icon từ mã nguồn của dự án LungCT.

---

### 6.1. Phân biệt các khái niệm cốt lõi: Tên hiển thị vs Định danh ứng dụng

Trước khi sửa bất kỳ tệp nào, bạn cần phân biệt rõ ràng hai khái niệm hoàn toàn khác nhau:

| Khái niệm | Ý nghĩa | Vị trí hiển thị | Có thể đổi tùy ý không? | Ví dụ trong LungCT |
| :--- | :--- | :--- | :--- | :--- |
| **Tên hiển thị (App Name / Label)** | Chuỗi ký tự hiển thị dưới icon trên màn hình chính (Launcher) của điện thoại và trong trình quản lý ứng dụng. | Màn hình Home, App Drawer, thanh Recent Apps. | **Có**. Đổi bất kỳ lúc nào mà không ảnh hưởng tới dữ liệu hay việc cập nhật ứng dụng. | `LungCT` (trước đây là `mobile`) |
| **Định danh gói ứng dụng (Application ID / Bundle Identifier)** | Tên định danh duy nhất toàn cầu của ứng dụng trên hệ điều hành Android và iOS. | Khóa định danh trong hệ điều hành, Google Play Console, App Store Connect, quyền hạn và thư mục lưu trữ CSDL sandbox. | **KHÔNG được tự tiện đổi**. Nếu đổi `applicationId`, hệ điều hành sẽ coi đây là một ứng dụng mới hoàn toàn, làm mất liên kết với CSDL SQLite cũ, không thể cài cập nhật đè (`install -r`). | Android: `com.anonymous.mobile`<br>iOS: `com.anonymous.mobile` |

> [!WARNING]
> Khi muốn đổi tên hiển thị thành `LungCT`, bạn **chỉ sửa App Name**, tuyệt đối **không thay đổi** `applicationId` trong `build.gradle` hay `package` trong `AndroidManifest.xml` nếu đang muốn giữ nguyên dữ liệu bệnh nhân hiện có.

---

### 6.2. Bản đồ tệp và thư mục lưu trữ ảnh & cấu hình

Dưới đây là danh sách chính xác các tệp quản lý tên và biểu tượng ứng dụng:

```
LungCT_DoAn/
├── mobile/
│   ├── app.json                                 <-- [Cấu hình gốc Expo]: Khai báo tên và đường dẫn icon
│   ├── assets/                                  <-- [Thư mục nguồn ảnh gốc]: Lưu ảnh thiết kế độ phân giải cao
│   │   ├── icon.png                             <-- Icon vuông tiêu chuẩn (1024x1024 px, PNG)
│   │   ├── splash-icon.png                      <-- Biểu tượng màn hình chào (512x512 px, PNG)
│   │   ├── android-icon-foreground.png          <-- Lớp họa tiết phía trước Android (512x512 px, PNG trong suốt)
│   │   ├── android-icon-background.png          <-- Lớp màu/hình nền Android (512x512 px, PNG #123047)
│   │   └── android-icon-monochrome.png          <-- Lớp biểu tượng đơn sắc Android 13+ Themed Icons (512x512 px)
│   ├── android/app/src/main/res/                <-- [Tài nguyên native Android đã biên dịch]:
│   │   ├── values/strings.xml                   <-- [Chính]: Chứa chuỗi app_name native hiển thị ngoài Launcher
│   │   ├── mipmap-anydpi-v26/                   <-- Adaptive Icon XML (Android 8.0 trở lên)
│   │   │   ├── ic_launcher.xml                  <-- Định nghĩa ghép foreground + background dạng vuông/tròn
│   │   │   └── ic_launcher_round.xml            <-- Định nghĩa icon tròn
│   │   ├── mipmap-mdpi/                         <-- Mật độ chuẩn 1x (ic_launcher.webp 48x48, foreground 108x108)
│   │   ├── mipmap-hdpi/                         <-- Mật độ cao 1.5x (ic_launcher.webp 72x72, foreground 162x162)
│   │   ├── mipmap-xhdpi/                        <-- Mật độ rất cao 2x (ic_launcher.webp 96x96, foreground 216x216)
│   │   ├── mipmap-xxhdpi/                       <-- Mật độ cực cao 3x (ic_launcher.webp 144x144, foreground 324x324)
│   │   └── mipmap-xxxhdpi/                      <-- Mật độ siêu cao 4x (ic_launcher.webp 192x192, foreground 432x432)
│   ├── native-templates/android/res/            <-- [Mẫu tái tạo]: Bảo toàn cấu hình strings và mipmap khi chạy prebuild
│   └── scripts/
│       └── generate_brand_icons.py              <-- Script Python tự động sinh toàn bộ mipmap WebP đúng chuẩn
```

---

### 6.3. Kích thước, định dạng và Vùng an toàn (Safe Zone) của Icon

#### Cơ chế Adaptive Icons từ Android 8.0 (API 26) trở lên:
Android không dùng một bức ảnh vuông đơn lẻ để làm icon mà chia làm 2 lớp xếp chồng lên nhau:
1. **Lớp nền (Background)**: Kích thước canvas chuẩn **108dp x 108dp** (ví dụ phủ màu `#123047`).
2. **Lớp tiền cảnh (Foreground)**: Kích thước canvas chuẩn **108dp x 108dp**, nền trong suốt chứa hình vẽ chính (hai lá phổi).

> [!IMPORTANT]
> **Quy tắc Vùng an toàn (Safe Zone)**:
> Mặc dù canvas là **108dp x 108dp**, nhưng hệ điều hành của các hãng (Samsung OneUI, Xiaomi HyperOS, Google Pixel) sẽ áp dụng các mặt nạ cắt (mask) khác nhau: hình tròn, hình vuông bo góc (squircle), hoặc giọt nước.
> - **Đường kính vùng an toàn chỉ là 66dp ở chính giữa tâm** (chiếm khoảng 61% kích thước canvas).
> - Nếu bạn vẽ hình vẽ vượt ra ngoài vòng tròn 66dp này, hình vẽ sẽ bị cắt lẹm mép ngoài trên các máy dùng Launcher hình tròn!
> - Tỷ lệ an toàn khuyến nghị: Hình vẽ lá phổi nên nằm gọn trong khoảng **50% đến 58%** chiều rộng của ảnh để đảm bảo khi thu nhỏ trên màn hình chính vẫn thấy viền cách ly thoáng đãng và sắc nét.

#### Bảng thông số mật độ mipmap chuẩn của Android:

| Thư mục mipmap | Hệ số co giãn | Kích thước Icon truyền thống (Legacy) | Kích thước Lớp Foreground / Background (Adaptive) |
| :--- | :---: | :---: | :---: |
| `mipmap-mdpi` | 1.0x | 48 x 48 px | 108 x 108 px |
| `mipmap-hdpi` | 1.5x | 72 x 72 px | 162 x 162 px |
| `mipmap-xhdpi` | 2.0x | 96 x 96 px | 216 x 216 px |
| `mipmap-xxhdpi` | 3.0x | 144 x 144 px | 324 x 324 px |
| `mipmap-xxxhdpi` | 4.0x | 192 x 192 px | 432 x 432 px |

---

### 6.4. Hướng dẫn từng bước: Muốn đổi tên thì sửa dòng nào?

Để đổi tên hiển thị của ứng dụng thành tên bạn muốn (ví dụ `LungCT`), bạn cần sửa ở 2 nơi:

#### Bước 1: Sửa chuỗi native trong `mobile/android/app/src/main/res/values/strings.xml`
Đây là nơi hệ điều hành Android thực sự đọc khi hiển thị tên app ngoài launcher.

*Mã trước khi sửa:*
```xml
<resources>
  <string name="app_name">mobile</string>
</resources>
```

*Mã sau khi sửa (đổi thành LungCT):*
```xml
<resources>
  <string name="app_name">LungCT</string>
</resources>
```

#### Bước 2: Đồng bộ cấu hình trong `mobile/app.json`
Để khi chạy Expo hoặc dựng lại cấu hình, tên không bị quay về mặc định:

```json
{
  "expo": {
    "name": "LungCT",
    "slug": "lungct",
    ...
```

---

### 6.5. Hướng dẫn từng bước: Muốn đổi biểu tượng (Icon) thì làm thế nào?

Bạn có 2 cách thực hiện:

#### Cách 1: Sử dụng Script Python tự động sinh trọn bộ (Khuyên dùng)
Dự án đã tích hợp sẵn script `mobile/scripts/generate_brand_icons.py` sử dụng thư viện `Pillow`. Bạn có thể thay đổi màu nền hoặc hình học trong script, sau đó chạy:

```powershell
python mobile/scripts/generate_brand_icons.py
```
*Kết quả mong đợi*:
```
Generated: mobile\assets\icon.png
Generated: mobile\assets\splash-icon.png
Generated: mobile\assets\android-icon-foreground.png
Generated: mobile\assets\android-icon-background.png
Generated: mobile\assets\android-icon-monochrome.png
Generated: mobile\android\app\src\main\res\mipmap-mdpi (ic_launcher.webp, foreground, background)
...
Generated: mobile\android\app\src\main\res\mipmap-xxxhdpi (ic_launcher.webp, foreground, background)
SUCCESS: Hoan tat sinh toan bo icon thuong hieu LungCT!
```

#### Cách 2: Tự vẽ ảnh bằng Photoshop / Figma và chép thủ công
1. Chuẩn bị ảnh PNG kích thước `1024x1024 px` (đặt tên là `icon.png`), đưa hình vẽ chính vào tâm (trong vòng tròn đường kính 600 px).
2. Chuẩn bị ảnh `android-icon-foreground.png` kích thước `512x512 px` (nền trong suốt).
3. Chuẩn bị ảnh `android-icon-background.png` kích thước `512x512 px` (màu nền đậm `#123047`).
4. Chép đè vào thư mục `mobile/assets/`.
5. Tạo các tệp WebP co giãn theo tỷ lệ trong bảng ở mục 6.3 và chép vào các thư mục `mobile/android/app/src/main/res/mipmap-*/`.

---

### 6.6. Vì sao thay đổi icon native cần build lại APK mà không thể chỉ reload JavaScript?

Nhiều người mới học React Native thắc mắc: *"Tại sao sửa giao diện màn hình bấm phím `r` trên Metro là thấy ngay, nhưng đổi icon và tên app thì reload JS không có tác dụng?"*.

**Giải thích bản chất kỹ thuật**:
1. **Mã nguồn JavaScript/TypeScript** (các file `.tsx`, `.ts`) được Metro Bundler đóng gói thành một file nhị phân bundle duy nhất (`index.android.bundle`). Khi bạn sửa code giao diện, Metro chỉ việc gửi gói bundle mới qua WebSocket tới máy ảo/điện thoại và ứng dụng tự render lại.
2. **Icon và Tên ứng dụng** thuộc về **tài nguyên gốc của hệ điều hành Android (Android Native Resources)**. Khi bạn build ứng dụng, công cụ `aapt2` (Android Asset Packaging Tool) sẽ biên dịch các tệp ảnh trong `res/mipmap/` và chuỗi trong `res/values/strings.xml` thành bảng tài nguyên nhị phân `resources.arsc` và đóng gói cứng vào file APK.
3. Khi bạn cài đặt ứng dụng vào điện thoại, Launcher của hệ điều hành Android (như Xiaomi System Launcher) sẽ truy cập trực tiếp vào tệp `resources.arsc` của tệp APK đã cài để lấy icon và nhãn hiển thị. Quá trình này diễn ra ở tầng hệ điều hành, hoàn toàn độc lập và không liên quan gì đến tiến trình chạy máy ảo JavaScript (Hermes/V8).
4. Do đó, **bắt buộc phải chạy lệnh build lại APK và cài đặt cập nhật** thì Launcher của điện thoại mới nhận diện được bộ icon mới.

---

### 6.7. Cách xử lý khi Launcher điện thoại còn lưu icon cũ mà không được xóa dữ liệu

Khi bạn cài bản build mới bằng lệnh `adb install -r`, một số Launcher (đặc biệt là Xiaomi HyperOS / MIUI Launcher hoặc Samsung OneUI Launcher) sử dụng cơ chế lưu đệm biểu tượng (Icon Cache) để tăng tốc độ cuộn trang. Dù file APK đã mang icon mới, Launcher vẫn có thể hiển thị icon mặc định cũ.

> [!CAUTION]
> **Tuyệt đối không gỡ cài đặt ứng dụng (Uninstall)** để sửa lỗi này! Việc gỡ ứng dụng sẽ xóa sạch toàn bộ cơ sở dữ liệu SQLite chứa hồ sơ bệnh nhân và ca bệnh đã lưu.

**Các bước làm mới Icon Cache an toàn 100% dữ liệu:**

1. **Cách 1: Khởi động lại Launcher hệ thống qua lệnh ADB (Nhanh nhất)**:
   - Đối với điện thoại Xiaomi (Redmi 13):
     ```powershell
     adb -s qwpzbmbidecaaqqk shell am force-stop com.miui.home
     ```
     *(Lệnh này chỉ khởi động lại giao diện màn hình chính của Xiaomi, màn hình sẽ chớp nhẹ trong 1 giây để nạp lại toàn bộ icon mới, dữ liệu ứng dụng LungCT giữ nguyên vẹn).*
   - Đối với máy ảo Google Pixel:
     ```powershell
     adb shell am force-stop com.google.android.apps.nexuslauncher
     ```
2. **Cách 2: Đổi chủ đề giao diện (Theme)**:
   - Trên điện thoại, vào **Cài đặt** -> **Chủ đề (Themes)** -> Chọn lại chủ đề mặc định hoặc đổi một chủ đề khác rồi đổi lại. Thao tác này buộc hệ điều hành vẽ lại toàn bộ icon cache.
3. **Cách 3: Khởi động lại điện thoại (Restart)**:
   - Khởi động lại máy sẽ xóa sạch bộ nhớ tạm RAM của Launcher mà không chạm vào phân vùng lưu trữ ứng dụng.

---

### 6.8. Hướng dẫn đối với nền tảng iOS (Phân hệ macOS)

> [!NOTE]
> **Trạng thái kiểm chứng**: `[Chưa kiểm chứng trên phần cứng macOS vật lý]`.
> Hướng dẫn dưới đây được tổng hợp và đối chiếu theo tài liệu chuẩn của Apple Developer Human Interface Guidelines và Xcode 15/16.

1. **Nơi lưu trữ ảnh**:
   - iOS quản lý icon thông qua danh mục tài nguyên **Asset Catalog**: `mobile/ios/mobile/Images.xcassets/AppIcon.appiconset/`.
   - File cấu hình mô tả: `Contents.json`.
2. **Kích thước ảnh**:
   - Từ Xcode 14 trở lên, Apple đã đơn giản hóa: Bạn chỉ cần cung cấp **1 ảnh duy nhất kích thước 1024 x 1024 px** (định dạng PNG 24-bit không có kênh alpha trong suốt).
   - Xcode sẽ tự động co giãn (downscale) ảnh này thành các kích thước phù hợp cho màn hình iPhone (60x60@2x, 60x60@3x), iPad, App Store và thanh thông báo.
3. **Đổi tên hiển thị trên màn hình iPhone**:
   - Mở tệp cấu hình `mobile/ios/mobile/Info.plist`.
   - Tìm khóa `CFBundleDisplayName` và sửa giá trị thành `LungCT`:
     ```xml
     <key>CFBundleDisplayName</key>
     <string>LungCT</string>
     ```
4. **Quy trình áp dụng**:
   - Do chưa có máy tính macOS vật lý, nhóm ghi nhận cấu hình này theo chuẩn lý thuyết. Khi đưa lên Xcode trên macOS, chạy lệnh `pod install` trong thư mục `mobile/ios` và biên dịch bằng `xcodebuild`.

---

## ✅ BẢNG KIỂM TRA (CHECKLIST) TRƯỚC KHI CHUYỂN BÀI

- [ ] Lệnh `node -v` in ra phiên bản v20.x.x.
- [ ] Lệnh `javac -version` in ra phiên bản 17.0.x.
- [ ] Lệnh `adb version` in ra phiên bản 1.0.41 trở lên.
- [ ] Lệnh `adb devices` hiển thị ít nhất một thiết bị với trạng thái `device`.
- [ ] Đã tạo sẵn thư mục thực hành tại ổ đĩa ngắn (ví dụ `C:\Practice_LungCT\`).
- [ ] Đã hiểu rõ cách cấu hình tên `LungCT` trong `strings.xml` và `app.json`.
- [ ] Đã hiểu vùng an toàn 66dp của Android Adaptive Icon để không bị cắt lẹm.
