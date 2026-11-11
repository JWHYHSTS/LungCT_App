# HƯỚNG DẪN THAY ĐỔI LAUNCHER ICON VÀ ADAPTIVE ICON CHO LUNGCT TRÊN ANDROID

Tài liệu này ghi lại chi tiết vị trí tệp tài nguyên, các cấu hình native cần chỉnh sửa, nguyên tắc vùng an toàn (Safe Zone) và quy trình build/cài đặt tự động để sinh viên có thể tự thay đổi launcher icon cho ứng dụng **LungCT** bất cứ lúc nào mà không làm mất cấu hình hay lỗi runtime.

---

## 1. Vị trí tệp ảnh nguồn và Quy cách thiết kế

- **Đường dẫn tệp icon gốc**: [`mobile/assets/lungct-icon.png`](../../mobile/assets/lungct-icon.png)
- **Kích thước tiêu chuẩn**: `1024 x 1024 px` (PNG RGBA 32-bit).
- **Họa tiết thiết kế**:
  - **Lớp hình ảnh chính (Foreground)**: Biểu tượng phổi màu trắng và vòng quét CT scanner màu xanh cyan (`#00E5FF`).
  - **Màu nền (Background Color)**: Màu chàm tối `Indigo` (`#100154` / RGB: `16, 1, 84`).
- **Nguyên tắc Vùng an toàn (Android Adaptive Icon Safe Zone) & Tỷ lệ Cân đối**:
  - Khung chuẩn adaptive icon của Android có kích thước `108 x 108 dp`.
  - Vùng an toàn hiển thị (không bị mặt nạ tròn, vuông bo góc hay squircle cắt gọt) là hình tròn nằm chính giữa có đường kính **`72 dp`** (tương đương **66.6%** kích thước toàn canvas).
  - Để biểu tượng không bị cảm giác chật chội, chạm sát mép squircle hoặc lộ viền nén hình chữ nhật:
    - **Adaptive Foreground**: Họa tiết CT scanner và phổi được định cỡ ở mức **52%** canvas và đặt trên nền trong suốt (alpha = 0).
    - **Static Mipmap Icons (`ic_launcher.webp`)**: Họa tiết được định cỡ ở mức **70%** canvas trên nền màu chàm đồng nhất `#100154`, tạo khoảng đệm (padding) 15-20% cách đều 4 phía, bảo đảm 100% không chạm mép bất kỳ giao diện nào (MIUI, OneUI, Pixel).

---

## 2. Các tệp cấu hình cần cập nhật

### 2.1 Cấu hình Expo (`mobile/app.json`)
Trong tệp [`mobile/app.json`](../../mobile/app.json), cập nhật đường dẫn icon và màu nền adaptive:
```json
{
  "expo": {
    "name": "LungCT",
    "slug": "mobile",
    "version": "1.0.5",
    "icon": "./assets/icon.png",
    "android": {
      "package": "com.anonymous.mobile",
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#100154",
        "monochromeImage": "./assets/android-icon-foreground.png"
      }
    }
  }
}
```

### 2.2 Cấu hình Native Android (`mobile/android/app/build.gradle`)
Đảm bảo mã phiên bản (`versionCode`) và tên phiên bản (`versionName`) được nâng cấp tương ứng:
```groovy
defaultConfig {
    applicationId 'com.anonymous.mobile'
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 6
    versionName "1.0.5"
}
```

### 2.3 Đồng bộ thư mục Native Templates (`mobile/native-templates/`)
Để bảo đảm khi chạy cấu hình lại hoặc tái tạo từ môi trường sạch không làm mất icon, các tài nguyên mipmap phải luôn được cập nhật đồng bộ trong cả hai thư mục:
1. `mobile/android/app/src/main/res/mipmap-*/`
2. `mobile/native-templates/android/res/mipmap-*/`

---

## 3. Bảng kích thước Mipmap cho từng mật độ màn hình

Android yêu cầu 5 mật độ màn hình chính cho launcher icon:

| Mật độ | Thư mục Mipmap | Kích thước chuẩn (`ic_launcher.webp`) | Kích thước Adaptive Foreground (`108dp`) |
| :--- | :--- | :---: | :---: |
| **mdpi** (1x) | `mipmap-mdpi` | `48 x 48 px` | `108 x 108 px` |
| **hdpi** (1.5x) | `mipmap-hdpi` | `72 x 72 px` | `162 x 162 px` |
| **xhdpi** (2x) | `mipmap-xhdpi` | `96 x 96 px` | `216 x 216 px` |
| **xxhdpi** (3x) | `mipmap-xxhdpi` | `144 x 144 px` | `324 x 324 px` |
| **xxxhdpi** (4x) | `mipmap-xxxhdpi` | `192 x 192 px` | `432 x 432 px` |

Mỗi thư mục mật độ gồm 5 tệp `.webp`:
- `ic_launcher.webp`: Icon dạng tĩnh đầy đủ cả nền và họa tiết.
- `ic_launcher_round.webp`: Icon dạng hình tròn tĩnh.
- `ic_launcher_background.webp`: Lớp nền trơn màu `#100154`.
- `ic_launcher_foreground.webp`: Lớp họa tiết phổi + vòng quét CT trong suốt.
- `ic_launcher_monochrome.webp`: Lớp biểu tượng đơn sắc phục vụ Themed Icons trên Android 13+.

---

## 4. Script tự động tạo toàn bộ Icon từ ảnh nguồn

Bạn có thể chạy script Python sau để tự động cắt, căn chỉnh vùng an toàn và kết xuất toàn bộ 25 tệp WebP vào đúng các thư mục Android:

```python
import os
from PIL import Image

SRC = "mobile/assets/lungct-icon.png"
BG_COLOR = (16, 1, 84, 255)  # #100154

DENSITIES = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}

TARGET_DIRS = [
    "mobile/android/app/src/main/res",
    "mobile/native-templates/android/res"
]

src_img = Image.open(SRC).convert("RGBA")

for base_dir in TARGET_DIRS:
    for folder, (size_std, size_adaptive) in DENSITIES.items():
        out_folder = os.path.join(base_dir, folder)
        os.makedirs(out_folder, exist_ok=True)
        
        # 1. ic_launcher.webp & ic_launcher_round.webp
        im_std = src_img.resize((size_std, size_std), Image.Resampling.LANCZOS)
        im_std.save(os.path.join(out_folder, "ic_launcher.webp"), "WEBP")
        im_std.save(os.path.join(out_folder, "ic_launcher_round.webp"), "WEBP")
        
        # 2. ic_launcher_background.webp
        bg = Image.new("RGBA", (size_adaptive, size_adaptive), BG_COLOR)
        bg.save(os.path.join(out_folder, "ic_launcher_background.webp"), "WEBP")
        
        # 3. ic_launcher_foreground.webp & monochrome
        fg = Image.new("RGBA", (size_adaptive, size_adaptive), (0, 0, 0, 0))
        # Thu nhỏ ảnh họa tiết vào 66.6% canvas để đảm bảo Safe Zone
        content_sz = int(size_adaptive * 0.666)
        content_img = src_img.resize((content_sz, content_sz), Image.Resampling.LANCZOS)
        offset = (size_adaptive - content_sz) // 2
        fg.paste(content_img, (offset, offset), content_img)
        fg.save(os.path.join(out_folder, "ic_launcher_foreground.webp"), "WEBP")
        fg.save(os.path.join(out_folder, "ic_launcher_monochrome.webp"), "WEBP")

print("Hoàn tất tạo bộ Launcher Icons cho Android!")
```

---

## 5. Quy trình Đóng gói, Ký số và Cài đặt cập nhật lên Thiết bị thật

### Bước 1: Căn chỉnh byte bằng zipalign
Để hệ điều hành Android đọc tài nguyên icon và assets qua `mmap()` với hiệu năng cao nhất, APK bắt buộc phải được căn chỉnh 4-byte:
```powershell
& "C:\Users\John\AppData\Local\Android\Sdk\build-tools\36.0.0\zipalign.exe" -p -f 4 unaligned.apk aligned.apk
```

### Bước 2: Ký số APK bằng apksigner
Ký APK bằng khóa `debug.keystore` (hoặc release keystore) với cơ chế chữ ký v2 và v3:
```powershell
& "C:\Users\John\AppData\Local\Android\Sdk\build-tools\36.0.0\apksigner.bat" sign `
    --ks mobile/android/app/debug.keystore `
    --ks-pass pass:android `
    --key-pass pass:android `
    --out LungCT_Drive_Upload/LungCT_v1.0.5_firebase.apk `
    aligned.apk
```

### Bước 3: Cài đặt cập nhật lên điện thoại (giữ nguyên dữ liệu)
Sử dụng cờ `-r` (thay thế app hiện tại) và `-d` (cho phép cài đè):
```powershell
adb -s <DEVICE_ID> install -r -d LungCT_Drive_Upload/LungCT_v1.0.5_firebase.apk
```

### Bước 4: Kiểm tra trực quan trên màn hình
Mở màn hình chính của điện thoại và kiểm tra biểu tượng ứng dụng **LungCT**:
- Icon có nền chàm đậm, vòng quét CT sáng rõ nét, không bị kéo dãn.
- Nhãn hiển thị đúng tên `LungCT`.

