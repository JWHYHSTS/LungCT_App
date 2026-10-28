# SỔ LỆNH THAO TÁC, BIÊN DỊCH VÀ SỔ LỖI THỰC TẾ LUNGCT
### Cẩm nang tra cứu dòng lệnh PowerShell (Windows) và Bash (macOS) chuẩn xác cho Đồ án

> **Nguyên tắc biên soạn**:
> - Không trộn lẫn cú pháp Windows PowerShell và macOS Bash.
> - Mỗi lệnh đều ghi rõ: Mục đích, thư mục hiện hành, ý nghĩa tham số và kết quả mong đợi.
> - Sổ lỗi đúc rút từ 100% tình huống thực tế đã gặp trong quá trình triển khai LungCT.

---

## 💻 PHẦN 1: SỔ LỆNH POWERSHELL (DÀNH CHO ANDROID TRÊN WINDOWS)

### 1. Nhóm Lệnh Kiểm tra Môi trường & Thiết bị
```powershell
# Kiểm tra phiên bản Node, JDK và ADB
node -v
javac -version
adb version

# Liệt kê các thiết bị Android (máy ảo và điện thoại thật) đang kết nối
adb devices

# Chờ thiết bị sẵn sàng hoàn toàn
adb wait-for-device

# Kiểm tra trạng thái khởi động của máy ảo (Trả về 1 là đã boot xong)
adb shell getprop sys.boot_completed
```

### 2. Nhóm Lệnh Chất lượng Mã nguồn (Linting, Typing, Testing)
> **Thư mục chạy**: `mobile/` (hoặc thư mục thực hành của bạn)

```powershell
# 1. Kiểm tra lỗi kiểu dữ liệu TypeScript (không sinh file js)
npm run typecheck
# Kỳ vọng: Không có lỗi (exited with code 0)

# 2. Quét lỗi cú pháp và quy chuẩn mã nguồn ESLint
npm run lint
# Kỳ vọng: 0 errors, 0 warnings

# 3. Kiểm tra định dạng mã nguồn theo Prettier
npm run format:check
# Kỳ vọng: All matched files use Prettier code style!

# 4. Chạy toàn bộ 16 test suites với Jest
npm test -- --runInBand
# Kỳ vọng: 16 passed, 16 total | 146 passed, 146 total
```

### 3. Nhóm Lệnh Xuất Bundle & Biên dịch APK Release
```powershell
# Chuyển vào thư mục mobile
cd C:\LungCT\mobile

# Xuất JS Bundle tĩnh cho Android
npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Biên dịch APK Release với tùy chọn bỏ qua bundle model nặng (để build nhanh)
cd android
.\gradlew.bat assembleRelease -PskipBundleModels=true
# Kỳ vọng: BUILD SUCCESSFUL in ...m ...s

# Cài đặt cập nhật trực tiếp lên máy ảo hoặc Redmi 13 (giữ nguyên CSDL)
adb install -r app\build\outputs\apk\release\app-release.apk
# Kỳ vọng: Success
```

### 4. Nhóm Lệnh Giám sát Log & Cơ sở dữ liệu trên Thiết bị
```powershell
# Xem log JavaScript của React Native thời gian thực
adb logcat -s "ReactNativeJS"

# Kiểm tra thư mục cơ sở dữ liệu của ứng dụng trên máy ảo
adb shell "ls -la /data/user/0/com.anonymous.mobile/databases/"

# Quét chuỗi tìm rò rỉ dữ liệu plaintext trong tệp CSDL
adb shell "strings /data/user/0/com.anonymous.mobile/databases/lungct_secure_usr_doc_01.db | grep -i 'Bui_Duc'"
# Kỳ vọng: 0 kết quả (vì SQLCipher đã mã hóa hoàn toàn các trang đĩa)
```

---

## 🍎 PHẦN 2: SỔ LỆNH BASH / ZSH (DÀNH CHO IOS TRÊN MACOS)

### 1. Nhóm Lệnh Cài đặt Dependencies & Pods
> **Thư mục chạy**: `ios/`

```bash
# Cài đặt các thư viện CocoaPods native theo Podfile.lock
cd ios
pod install --repo-update

# Nếu gặp lỗi xung đột cache Pods
pod deintegrate
pod cache clean --all
pod install
```

### 2. Nhóm Lệnh Chạy App trên iOS Simulator
```bash
# Khởi động ứng dụng trên máy ảo iPhone 15
npx react-native run-ios --simulator="iPhone 15"

# Xem danh sách máy ảo có sẵn trên macOS
xcrun simctl list devices
```

---

## 🛠️ PHẦN 3: SỔ LỖI THỰC TẾ VÀ BIỆN PHÁP XỬ LÝ (TROUBLESHOOTING)

### Lỗi 1: `React Compiler Error: Cannot call impure function (Date.now) during render`
- **Triệu chứng**: Khi build JS Bundle hoặc chạy typecheck, compiler báo lỗi tại `Date.now()`.
- **Nguyên nhân**: React Compiler (trong React 19 / RN 0.88) yêu cầu hàm render phải thuần khiết (pure), không được gọi các hàm sinh số ngẫu nhiên hoặc lấy thời gian hệ thống trong quá trình render JSX.
- **Cách sửa**: Chuyển lời gọi `Date.now()` vào các sự kiện callback (như `onPress`, `handleRunPipeline`) hoặc thêm chú thích `// eslint-disable-next-line react-hooks/purity` trước dòng khởi tạo biến thời gian.

### Lỗi 2: `Gradle Build Failed: Execution failed for task ':app:createBundleReleaseJsAndAssets'`
- **Triệu chứng**: Lệnh `gradlew assembleRelease` dừng lại và báo thiếu file `src/features/...`.
- **Nguyên nhân**: Khi copy mã sang thư mục build độc lập (như `C:\LungCT\mobile`), các thư mục mới tạo chưa được đồng bộ đệ quy đầy đủ.
- **Cách sửa**: Dùng lệnh `Copy-Item -Path "mobile/src/*" -Destination "C:\LungCT\mobile\src\" -Recurse -Force` trên PowerShell để đồng bộ trọn vẹn toàn bộ cây thư mục mã nguồn.

### Lỗi 3: `Device Unauthorized` khi cắm Xiaomi Redmi 13
- **Triệu chứng**: Gõ `adb devices` thấy thiết bị hiện mã nhưng trạng thái là `unauthorized`.
- **Nguyên nhân**: Máy tính chưa được cấp khóa RSA xác thực trên điện thoại.
- **Cách sửa**: Rút cáp cắm lại, mở khóa màn hình điện thoại, kiểm tra hộp thoại *"Allow USB debugging"* và nhấn **Always allow from this computer** -> **OK**. Nếu không hiện, chạy lệnh `adb kill-server` rồi `adb start-server`.

### Lỗi 4: `SQLCipher PRAGMA cipher_key failed / file is not a database`
- **Triệu chứng**: Ứng dụng crash hoặc báo lỗi không thể truy vấn SQLite sau khi chuyển đổi.
- **Nguyên nhân**: Passphrase được cung cấp sai, hoặc tệp cơ sở dữ liệu là tệp SQLite cũ chưa được kích hoạt khóa mã hóa.
- **Cách sửa**: Kiểm tra xem Master Key có được lấy đúng từ `AndroidKeyStore` của cùng `ownerId` hay không. Đối với CSDL cũ chưa mã hóa, phải chạy qua quy trình chuyển đổi Migration (`sqlcipher_export`) trước khi đóng khóa.
