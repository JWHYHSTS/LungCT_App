# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN BẢN THẢO THỰC HÀNH MỐC 0: CÀI ĐẶT MÔI TRƯỜNG CHUẨN XÁC TRÊN WINDOWS
Bao gồm đầy đủ 4 bước tiền đề bắt buộc trước khi tạo thư mục và chạy lệnh npx:
- Bước 000a: Cài đặt Git & Node.js v20 LTS
- Bước 000b: Cài đặt Microsoft OpenJDK 17 & Thiết lập JAVA_HOME
- Bước 000c: Cài đặt Android Studio, SDK Platform 34, Build-Tools 34.0.0, NDK 26.1
- Bước 000d: Thiết lập biến môi trường ANDROID_HOME & Tạo máy ảo LumaCT_Phone (Pixel 7 / API 34)
"""

from build_large_curriculum import add_full_step

def append_prerequisite_environment_steps(doc):
    # ==========================================
    # BƯỚC 000a: Git & Node v20 LTS
    # ==========================================
    add_full_step(
        doc, step_num="000a",
        title="Cài Đặt Git For Windows Và Môi Trường Thực Thi Node.js v20 LTS",
        purpose="Chuẩn bị trình quản lý gói npm và công cụ thực thi JavaScript/TypeScript đạt phiên bản tiêu chuẩn v20 LTS (Iron) đã kiểm chứng.",
        terminal_location="Mở cửa sổ Windows PowerShell (Run as Administrator).",
        shell_action="""# 1. Tải và cài đặt Git for Windows từ trang chủ https://git-scm.com/
# 2. Tải và cài đặt Node.js v20 LTS từ https://nodejs.org/ (bản 64-bit .msi)
# 3. Sau khi cài đặt hoàn tất, mở một tab PowerShell mới để kiểm tra phiên bản:
git --version
node -v
npm -v""",
        code_file_path="Kiểm tra phiên bản hệ thống qua Terminal PowerShell",
        full_code="""# Kết quả in ra trên màn hình PowerShell phải đạt chuẩn sau:
# git version 2.43.0.windows.1 (hoặc mới hơn)
# v20.18.0 (hoặc bất kỳ bản v20.x.x nào thuộc nhánh Long Term Support)
# 10.8.2 (hoặc 10.x.x)""",
        line_by_line_explanation=[
            ["git --version", "Kiểm tra trình quản lý phiên bản Git đã được nạp vào biến môi trường PATH của Windows hay chưa."],
            ["node -v", "Xác nhận phiên bản Node.js đang chạy: Dự án LungCT yêu cầu Node v20 LTS để tương thích Metro Bundler và React Native 0.88."],
            ["npm -v", "Kiểm tra Node Package Manager: Công cụ tải về các thư viện npm cho ứng dụng."]
        ],
        comment_guide="Cảnh báo an toàn: Tuyệt đối không cài các bản Node chẵn mới nhất như v22 hoặc v23 vì Metro Bundler và các module C++ Native (như SQLCipher) có thể bị lỗi biên dịch node-gyp.",
        wiring_guide="Sau khi node và npm đã hiển thị số phiên bản hợp lệ, hệ điều hành Windows đã sẵn sàng thực thi các lệnh npx.",
        run_and_verify="Gõ 'node -e \"console.log(process.version)\"'. Màn hình in ra chuỗi bắt đầu bằng 'v20.'.",
        troubleshooting="Nếu PowerShell báo ''node' is not recognized': Hãy khởi động lại máy tính hoặc đăng xuất tài khoản Windows để hệ thống nạp lại biến môi trường PATH.",
        checklist="[ ] Git version >= 2.40\n[ ] Node.js đúng phiên bản v20.x LTS\n[ ] npm version >= 10.x"
    )

    # ==========================================
    # BƯỚC 000b: OpenJDK 17 & JAVA_HOME
    # ==========================================
    add_full_step(
        doc, step_num="000b",
        title="Cài Đặt Microsoft OpenJDK 17 Và Cấu Hình Biến Môi Trường JAVA_HOME",
        purpose="Thiết lập trình biên dịch Java/Kotlin và công cụ tự động hóa build Gradle cho Android.",
        terminal_location="Windows PowerShell và cửa sổ System Properties.",
        shell_action="""# 1. Tải bộ cài đặt Microsoft Build of OpenJDK 17 (.msi)
# 2. Thiết lập biến môi trường hệ thống JAVA_HOME qua PowerShell:
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\\Program Files\\Microsoft\\jdk-17.0.12.7-hotspot", "Machine")

# 3. Thêm thư mục bin của JDK vào biến PATH hệ thống:
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;C:\\Program Files\\Microsoft\\jdk-17.0.12.7-hotspot\\bin", "Machine")

# 4. Mở cửa sổ PowerShell mới để kiểm tra:
javac -version
$env:JAVA_HOME""",
        code_file_path="C:\\Program Files\\Microsoft\\jdk-17.x.x\\",
        full_code="""# Kết quả kiểm tra xác thực JDK:
# javac 17.0.12
# C:\\Program Files\\Microsoft\\jdk-17.0.12.7-hotspot""",
        line_by_line_explanation=[
            ["javac -version", "Kiểm tra trình biên dịch mã Java Compiler phiên bản 17."],
            ["$env:JAVA_HOME", "Biến môi trường bắt buộc mà trình đóng gói Android Gradle Plugin (AGP 8.x) tìm kiếm để thực thi tác vụ dịch mã."],
            ["jdk-17.0.x", "Phiên bản Java 17 chuẩn LTS tương thích hoàn hảo với React Native 0.88 New Architecture."]
        ],
        comment_guide="Giải thích lý do phải dùng JDK 17: AGP phiên bản 8.8+ từ chối chạy trên JDK 11 hoặc JDK 8 cũ và sẽ ném lỗi ClassNotFoundException nếu dùng Java 21 chưa ổn định.",
        wiring_guide="JAVA_HOME sẽ được Gradle sử dụng tự động khi biên dịch tệp NativeCryptoVaultModule.kt và LungCtPipelineModule.kt.",
        run_and_verify="Mở PowerShell mới, gõ 'javac -version'. Nhận lại 'javac 17.0.x'.",
        troubleshooting="Nếu in ra javac 1.8 hoặc javac 21: Hãy vào System Properties -> Environment Variables, đẩy dòng %JAVA_HOME%\\bin lên đầu danh sách trong mục Path.",
        checklist="[ ] Đã cài Microsoft OpenJDK 17\n[ ] Biến JAVA_HOME trỏ đúng thư mục cài đặt\n[ ] javac in ra 17.0.x"
    )

    # ==========================================
    # BƯỚC 000c: Android Studio, SDK 34, Build-Tools & NDK
    # ==========================================
    add_full_step(
        doc, step_num="000c",
        title="Cài Đặt Android Studio, Android SDK Platform 34 Và NDK 26.1",
        purpose="Cung cấp bộ SDK Android 14 chính thức, bộ đóng gói AAPT2 và công cụ biên dịch mã nguồn C++ NDK cho thư viện ONNX/SQLCipher.",
        terminal_location="Giao diện Android Studio SDK Manager.",
        shell_action="""# 1. Tải và cài đặt Android Studio (Ladybug 2024.2 hoặc Koala 2024.1)
# 2. Khởi động Android Studio, tại màn hình chào mừng chọn: More Actions -> SDK Manager
# 3. Tại tab SDK Platforms: Tích chọn "Android 14.0 ("UpsideDownCake")" (API Level 34)
# 4. Tại tab SDK Tools:
#    - Tích chọn: "Android SDK Build-Tools 34.0.0"
#    - Tích chọn: "NDK (Side by side)" -> Tích chọn phiên bản "26.1.10909125"
#    - Tích chọn: "Android SDK Command-line Tools (latest)"
#    - Tích chọn: "Android Emulator"
#    - Tích chọn: "Android SDK Platform-Tools"
# 5. Bấm "Apply" để tải và cài đặt tự động.""",
        code_file_path="C:\\Users\\<USER>\\AppData\\Local\\Android\\Sdk",
        full_code="""# Cấu trúc thư mục Android SDK chuẩn sau khi cài đặt:
# %LOCALAPPDATA%\\Android\\Sdk\\
# ├── build-tools\\34.0.0\\
# ├── cmdline-tools\\latest\\bin\\
# ├── emulator\\
# ├── ndk\\26.1.10909125\\
# ├── platform-tools\\adb.exe
# └── platforms\\android-34\\""",
        line_by_line_explanation=[
            ["API Level 34", "Phiên bản Android 14 mục tiêu (targetSdkVersion 34, compileSdkVersion 34) theo quy định của Google Play 2026."],
            ["NDK 26.1.10909125", "Bộ công cụ biên dịch Native Development Kit biên dịch mã C++ của React Native New Architecture và nạp libsqlcipher.so."],
            ["platform-tools (adb)", "Android Debug Bridge: Cầu nối giao tiếp giữa máy tính và điện thoại/máy ảo qua cáp USB hoặc socket."]
        ],
        comment_guide="Giải thích lý do cần NDK 26.1: Phiên bản NDK này được khai báo cụ thể trong dự án gốc để biên dịch các tệp thư viện nhị phân C++ bảo mật.",
        wiring_guide="Toàn bộ công cụ đóng gói APK (aapt2, d8, adb) sẽ hoạt động trơn tru sau khi bước này hoàn tất.",
        run_and_verify="Kiểm tra sự tồn tại của tệp: 'Test-Path $env:LOCALAPPDATA\\Android\\Sdk\\platform-tools\\adb.exe'. Trả về True.",
        troubleshooting="Nếu SDK Manager báo lỗi thiếu dung lượng ổ đĩa: Hãy dọn dẹp ổ đĩa C:\\ bảo đảm còn trống tối thiểu 30GB.",
        checklist="[ ] Android SDK Platform 34 đã cài đặt\n[ ] Android SDK Build-Tools 34.0.0 đã cài đặt\n[ ] NDK 26.1.10909125 đã cài đặt\n[ ] platform-tools có adb.exe"
    )

    # ==========================================
    # BƯỚC 000d: ANDROID_HOME & Máy ảo LumaCT_Phone
    # ==========================================
    add_full_step(
        doc, step_num="000d",
        title="Cấu Hình Biến ANDROID_HOME Và Tạo Máy Ảo LumaCT_Phone (API 34)",
        purpose="Thiết lập đường dẫn SDK cho dòng lệnh và tạo thiết bị giả lập Android phục vụ kiểm thử chạy thực tế.",
        terminal_location="PowerShell và Android Studio Virtual Device Manager.",
        shell_action="""# 1. Cấu hình biến môi trường ANDROID_HOME bằng PowerShell:
$sdkPath = "$env:LOCALAPPDATA\\Android\\Sdk"
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")

# 2. Thêm platform-tools và emulator vào biến PATH của người dùng:
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$userPath;$sdkPath\\platform-tools;$sdkPath\\emulator", "User")

# 3. Tạo máy ảo trong Android Studio (Virtual Device Manager):
#    - Bấm "Create Device" -> Chọn phần cứng "Pixel 7" (màn hình 6.3 inch, 1080x2400)
#    - Chọn System Image: "UpsideDownCake" (API Level 34, ABI x86_64, Google APIs)
#    - Đặt tên máy ảo (AVD Name): LumaCT_Phone
#    - Bấm "Finish".
# 4. Khởi động máy ảo từ dòng lệnh PowerShell để xác minh:
emulator -avd LumaCT_Phone
adb devices""",
        code_file_path="emulator -avd LumaCT_Phone",
        full_code="""# Kết quả kiểm tra thiết bị qua lệnh adb devices:
# List of devices attached
# emulator-5554   device""",
        line_by_line_explanation=[
            ["ANDROID_HOME", "Biến môi trường định vị thư mục SDK để React Native CLI và Expo CLI tự động tìm thấy adb và trình giả lập."],
            ["Pixel 7 (1080x2400)", "Màn hình tỷ lệ 20:9 chuẩn giúp kiểm tra hiển thị chính xác các thành phần TopBar, BottomSheet, và ảnh CT y tế."],
            ["adb devices", "Lệnh liệt kê các thiết bị Android đang kết nối: 'device' nghĩa là máy ảo đã sẵn sàng nạp ứng dụng."]
        ],
        comment_guide="Lưu ý giữ máy ảo mở: Khi máy ảo đang ở trạng thái 'device', các lệnh build tiếp theo sẽ tự động cài đặt ứng dụng vào máy.",
        wiring_guide="Máy ảo LumaCT_Phone là môi trường đích để nạp và chạy thử toàn bộ ứng dụng từ Bước 002 trở đi.",
        run_and_verify="Màn hình máy ảo điện thoại Pixel 7 bật sáng trên Windows; thanh trạng thái hiển thị giờ và pin. Gõ 'adb devices' thấy 'emulator-5554 device'.",
        troubleshooting="Nếu máy ảo khởi động bị crash: Hãy vào BIOS máy tính, kiểm tra xem tính năng ảo hóa CPU (Intel VT-x hoặc AMD-V / SVM Mode) đã được kích hoạt (Enabled) chưa.",
        checklist="[ ] Biến môi trường ANDROID_HOME trỏ đúng Sdk\n[ ] Lệnh adb chạy được ở bất kỳ thư mục nào\n[ ] Máy ảo LumaCT_Phone (API 34) khởi động thành công"
    )

print("[*] Module append_prerequisite_environment_steps ready.")
