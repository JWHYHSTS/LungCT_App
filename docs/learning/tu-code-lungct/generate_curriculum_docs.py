# -*- coding: utf-8 -*-
"""
Script biên soạn hoàn chỉnh 2 tệp Word giáo trình tự code LungCT:
1. Giao_trinh_Tu_code_LungCT_Android.docx
2. Giao_trinh_Tu_code_LungCT_iOS.docx
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

# Load helper functions
from build_word_curriculum import (
    create_document, add_cover_page, add_heading_1, add_heading_2, add_heading_3,
    add_paragraph, add_callout, add_code_block, add_custom_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT
)

def build_android_curriculum(output_path):
    print(f"[*] Bắt đầu biên soạn giáo trình Android: {output_path}")
    doc = create_document()
    
    # 1. Trang bìa
    add_cover_page(
        doc,
        title="GIÁO TRÌNH TỰ CODE ỨNG DỤNG LUNGCT\nCHO HỆ ĐIỀU HÀNH ANDROID",
        subtitle="Hướng dẫn chi tiết từng bước xây dựng ứng dụng di động hỗ trợ chẩn đoán ung thư phổi\nbằng Trí tuệ nhân tạo cạnh (Edge AI) & CSDL mã hóa SQLCipher từ thư mục trống",
        author_name="DƯƠNG HẢI ĐĂNG",
        mssv="49.01.103.020",
        platform_name="Android (Windows 11 / Redmi 13 / Emulator API 34)"
    )

    # 2. Lời nói đầu & Nguyên tắc học tập
    add_heading_1(doc, "LỜI NÓI ĐẦU VÀ NGUYÊN TẮC THỰC HÀNH")
    add_paragraph(doc, 
        "Tài liệu này được biên soạn nhằm giúp sinh viên, lập trình viên mới bắt đầu từ con số 0 "
        "(chỉ mới nắm vững kiến thức lập trình C++ cơ bản và một ít Python) có thể tự tay xây dựng lại toàn bộ "
        "ứng dụng di động y tế LungCT trên nền tảng Android mà không bị bỡ ngỡ. Mọi dòng lệnh, cấu hình và đoạn mã "
        "đều được kiểm chứng trực tiếp trên môi trường Windows 11 64-bit, máy ảo Android Studio API 34 và thiết bị Xiaomi Redmi 13."
    )
    add_callout(doc,
        "Toàn bộ quá trình thực hành tự gõ mã phải được thực hiện trong một thư mục thực hành riêng biệt "
        "(ví dụ: C:\\Practice_LungCT\\). Tuyệt đối không khởi tạo dự án, cài thử thư viện hoặc ghi đè trực tiếp "
        "vào thư mục dự án gốc để bảo vệ toàn vẹn dữ liệu.",
        title="NGUYÊN TẮC BẢO VỆ DỰ ÁN GỐC", is_warn=True
    )
    
    # 3. Mục lục tổng thể & Tiến độ
    add_heading_1(doc, "MỤC LỤC TỔNG QUÁT VÀ MA TRẬN TIẾN ĐỘ")
    add_paragraph(doc, "Giáo trình gồm 6 phần chính được thiết kế tuần tự theo mức độ phụ thuộc kỹ thuật:")
    
    toc_data = [
        ["Phần I", "Chuyển Đổi Tư Duy Lập Trình: Từ C++ Sang TypeScript & React Native", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Kiểm chứng 100% Node 20"],
        ["Phần II", "Thiết Lập Môi Trường Phát Triển Android Trên Windows Từ Con Số 0", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Kiểm chứng 100% Windows 11"],
        ["Phần III", "Khởi Tạo Dự Án, Design System & Xây Dựng Bộ Khung 17 Màn Hình", "Đang biên soạn chi tiết", "Đạt 113 UI Tests Jest"],
        ["Phần IV", "Tầng Dữ Liệu Cục Bộ, Repository Pattern & Bảo Toàn Ca Nháp (AUTH-08)", "Đang biên soạn chi tiết", "Đạt 146 Tests Jest Sandbox"],
        ["Phần V", "Tích Hợp Native C++: Pipeline AI FP32 & CSDL Mã Hóa SQLCipher 4.6.1", "Đang biên soạn chi tiết", "Đạt thực nghiệm APK Máy ảo"],
        ["Phần VI", "Đóng Gói Bản Độc Lập APK Release & Đo Kiểm Trên Xiaomi Redmi 13", "Chờ nghiệm thu thiết bị", "Chờ đo kiểm Helio G91-Ultra"],
        ["Phụ lục", "Sổ Lệnh PowerShell, Sổ Lỗi Thường Gặp & Bộ Câu Hỏi Bảo Vệ Khóa Luận", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Tra cứu thực tế đồ án"]
    ]
    add_custom_table(doc, ["Phần", "Nội dung đào tạo", "Tình trạng biên soạn", "Môi trường đã xác thực"], toc_data, [0.8, 2.7, 1.5, 1.3])

    # 4. PHẦN I: TƯ DUY TYPESCRIPT CHO NGƯỜI BIẾT C++
    add_heading_1(doc, "PHẦN I: CHUYỂN ĐỔI TƯ DUY: TỪ C++ SANG TYPESCRIPT & REACT NATIVE")
    add_paragraph(doc, 
        "Khi chuyển từ C++ sang TypeScript, rào cản lớn nhất của người mới học không phải là cú pháp, "
        "mà là sự thay đổi mô hình thực thi: từ mô hình biên dịch tĩnh tuần tự sang mô hình thông dịch hướng sự kiện và bất đồng bộ."
    )
    
    add_heading_2(doc, "1.1 Bảng đối chiếu kiểu dữ liệu C++ vs TypeScript")
    types_data = [
        ["int, float, double", "number", "TypeScript gom mọi số thành 64-bit float. Không có kiểu int riêng biệt."],
        ["std::string, char[]", "string", "Chuỗi bất biến (immutable), bọc trong nháy đơn '...' hoặc template string `...${var}`."],
        ["bool", "boolean", "Chỉ nhận true hoặc false. Chú ý các giá trị coi như sai: 0, \"\", null, undefined."],
        ["nullptr, NULL", "null / undefined", "null: được gán chủ động là rỗng; undefined: vừa khai báo chưa gán giá trị."],
        ["struct SinhVien", "interface Patient", "Chỉ dùng để kiểm tra kiểu lúc viết code; khi chạy trên app sẽ tự biến mất."],
        ["std::vector<int>", "number[]", "Mảng co giãn tự động, hỗ trợ cực mạnh các hàm .map(), .filter(), .reduce()."]
    ]
    add_custom_table(doc, ["Kiểu dữ liệu trong C++", "Tương đương trong TypeScript", "Lưu ý cốt lõi cho người mới"], types_data, [1.4, 1.4, 3.5])

    add_heading_2(doc, "1.2 Bản chất Bất đồng bộ: Ví dụ trực quan Thẻ Rung Cà Phê (Promise & async/await)")
    add_paragraph(doc, 
        "Trong C++ giao diện dòng lệnh, nếu bạn gọi một hàm đọc tệp nặng từ đĩa, luồng CPU sẽ bị khóa cứng (blocking) "
        "cho đến khi đọc xong. Tuy nhiên, trên điện thoại di động, toàn bộ giao diện chạy trên luồng JS Thread duy nhất. "
        "Nếu bạn khóa luồng quá 16ms, màn hình sẽ bị đơ, giật lag và hệ thống Android sẽ hiện thông báo lỗi ANR (Application Not Responding) buộc dừng ứng dụng!"
    )
    add_paragraph(doc, 
        "Để giải quyết triệt để vấn đề này, TypeScript sử dụng cơ chế Promise (Lời hứa), giống hệt như chiếc Thẻ rung khi bạn đi mua cà phê:", bold_prefix="Cơ chế Thẻ rung gọi cà phê: "
    )
    add_paragraph(doc, 
        "1. Bạn ra quầy thanh toán -> Thu ngân phát cho bạn một chiếc thẻ rung (Tương đương trả về một Promise).\n"
        "2. Trong lúc đợi pha chế, bạn tự do đi tìm bàn ngồi, lướt điện thoại (Ứng dụng tiếp tục vẽ giao diện mượt mà, nút bấm phản hồi tốt).\n"
        "3. Khi ly cà phê pha xong, chiếc thẻ rung lên báo hiệu -> Bạn mang thẻ ra lấy nước (Dữ liệu đã sẵn sàng, lệnh await hoàn tất)."
    )
    
    add_code_block(doc, 
"""// 1. Hàm đọc ảnh CT trả về một "Chiếc thẻ rung" (Promise)
async function docTepAnhCTAsync(duongDan: string): Promise<DuLieuAnh> {
  // Tạm dừng đoạn mã này lại nhưng KHÔNG ĐƯỢC làm đơ ứng dụng
  const ketQua = await NativeModules.ImagePicker.readFile(duongDan);
  return ketQua;
}

// 2. Sử dụng trong màn hình chẩn đoán:
const handleChayAI = async () => {
  console.log("1. Bắt đầu gửi lệnh chẩn đoán...");
  const duLieu = await docTepAnhCTAsync("/sdcard/Download/ct_slice.jpg");
  console.log("2. Đã nhận kết quả phân tích:", duLieu);
};"""
    )
    add_callout(doc,
        "Bất cứ hàm nào có từ khóa 'async' thì luôn trả về một Promise. Muốn lấy giá trị thực từ Promise, "
        "bắt buộc phải đặt từ khóa 'await' phía trước lời gọi hàm. Từ khóa 'await' chỉ được phép đứng bên trong một hàm 'async'.",
        title="HAI QUY TẮC BẤT THÀNH VĂN CỦA ASYNC/AWAIT"
    )

    add_heading_2(doc, "1.3 Tư duy Giao diện Khai báo (Declarative UI) trong React Native")
    add_paragraph(doc, 
        "Trong C++ GUI cổ điển (như Qt hoặc Win32), bạn ra lệnh trực tiếp cho phần tử (nutBam->SetText(\"Đang chạy\")). "
        "Trong React Native, bạn quản lý biến trạng thái (State). Giao diện là một hàm số phản ánh trạng thái dữ liệu:"
    )
    add_code_block(doc,
"""import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

export const NutBamChanDoan = () => {
  // Khai báo biến trạng thái: dangPhanTich (true / false)
  const [dangPhanTich, setDangPhanTich] = useState(false);

  const xuLyBamNut = async () => {
    setDangPhanTich(true);  // Giao diện TỰ ĐỘNG đổi chữ thành "Đang chẩn đoán..."
    await chayMoHinhAI();   // Đợi tiến trình AI chạy ngầm
    setDangPhanTich(false); // Xong việc -> Giao diện TỰ ĐỘNG đổi lại chữ ban đầu
  };

  return (
    <Button 
      title={dangPhanTich ? "Đang phân tích On-Device..." : "Bắt đầu chẩn đoán ảnh CT"}
      disabled={dangPhanTich}
      onPress={xuLyBamNut}
    />
  );
};"""
    )

    # 5. PHẦN II: CÀI ĐẶT MÔI TRƯỜNG ANDROID TRÊN WINDOWS
    add_heading_1(doc, "PHẦN II: THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN ANDROID TRÊN WINDOWS TỪ CON SỐ 0")
    add_paragraph(doc, 
        "Hướng dẫn này dành cho máy tính Windows 10/11 64-bit hoàn toàn mới chưa từng cài đặt bất kỳ công cụ lập trình di động nào."
    )
    
    add_heading_2(doc, "2.1 Bảng công cụ và phiên bản chuẩn đã kiểm chứng")
    tools_data = [
        ["Git for Windows", "2.43.x+", "git-scm.com", "Quản lý mã nguồn dự án"],
        ["Node.js LTS", "v20.x (Iron)", "nodejs.org", "Môi trường thực thi JavaScript & Metro Bundler"],
        ["Microsoft OpenJDK", "17.0.x", "learn.microsoft.com", "Trình biên dịch mã nguồn Java/Kotlin và Gradle"],
        ["Android Studio", "Ladybug / Koala", "developer.android.com", "IDE chính thức, SDK Manager, Emulator"],
        ["Android SDK Platform", "API Level 34 (Android 14)", "Cài qua SDK Manager", "Nền tảng đích biên dịch (compileSdk & targetSdk)"],
        ["Android NDK", "26.1.10909125", "Cài qua SDK Manager", "Biên dịch C++ Native (ONNX Runtime, SQLCipher)"],
        ["VS Code", "Bản mới nhất", "code.visualstudio.com", "Trình soạn thảo mã nguồn chính"]
    ]
    add_custom_table(doc, ["Công cụ", "Phiên bản chuẩn", "Nguồn tải", "Mục đích sử dụng"], tools_data, [1.5, 1.2, 1.4, 2.2])

    add_heading_2(doc, "2.2 Phân biệt rõ các chỉ số SDK Android dễ nhầm lẫn")
    add_paragraph(doc, 
        "1. compileSdk (API 34): Phiên bản Android SDK mà Gradle dùng để dịch mã nguồn Java/Kotlin.\n"
        "2. targetSdk (API 34): Phiên bản hệ điều hành mà ứng dụng cam kết tuân thủ chính sách bảo mật.\n"
        "3. minSdkVersion (API 29 - Android 10): Phiên bản Android tối thiểu cho phép cài đặt ứng dụng.\n"
        "4. Android API của Thiết bị (API 34): Phiên bản Android thực tế đang chạy trên máy ảo hoặc điện thoại Redmi 13."
    )

    add_heading_2(doc, "2.3 Quy trình cấu hình biến môi trường trên Windows PowerShell")
    add_code_block(doc,
"""# 1. Cấu hình biến JAVA_HOME trỏ vào thư mục cài đặt JDK 17:
# Đường dẫn mẫu: C:\\Program Files\\Microsoft\\jdk-17.0.x-hotspot
# Thêm vào Path: %JAVA_HOME%\\bin

# 2. Cấu hình biến ANDROID_HOME trỏ vào thư mục Android SDK:
# Đường dẫn mẫu: C:\\Users\\<TÊN_TÀI_KHOẢN>\\AppData\\Local\\Android\\Sdk
# Thêm lần lượt 3 đường dẫn sau vào biến Path:
#   %ANDROID_HOME%\\platform-tools   (chứa lệnh adb)
#   %ANDROID_HOME%\\emulator         (chứa lệnh khởi động máy ảo)
#   %ANDROID_HOME%\\cmdline-tools\\latest\\bin

# 3. Mở cửa sổ PowerShell mới kiểm tra:
node -v          # Kỳ vọng: v20.x.x
javac -version   # Kỳ vọng: javac 17.0.x
adb version      # Kỳ vọng: Android Debug Bridge version 1.0.41..."""
    )

    add_heading_2(doc, "2.4 Tạo Máy ảo LumaCT_Phone & Kết nối Xiaomi Redmi 13")
    add_paragraph(doc, 
        "1. Tạo máy ảo trong Android Studio Device Manager: Chọn Pixel 7, System Image Android 14 API 34 (UpsideDownCake, x86_64, Google APIs), đặt tên 'LumaCT_Phone', chọn Graphics Hardware - GLES 2.0 để render mượt.\n"
        "2. Kết nối Redmi 13: Vào Cài đặt -> Giới thiệu điện thoại -> Nhấn 7 lần vào 'Phiên bản OS' -> Cài đặt bổ sung -> Tùy chọn nhà phát triển -> Bật 'Gỡ lỗi USB' và 'Cài đặt qua USB'.\n"
        "3. Cắm cáp vào máy tính, trên điện thoại tích chọn 'Luôn cho phép từ máy tính này' -> Nhấn OK."
    )
    add_code_block(doc,
"""# Kiểm tra thiết bị nhận diện trên PowerShell:
adb devices

# Kết quả mong đợi:
# List of devices attached
# emulator-5554    device       <-- Máy ảo
# xxxxxxxxxxxx     device       <-- Điện thoại Xiaomi Redmi 13 (Trạng thái bắt buộc là 'device')"""
    )
    add_callout(doc,
        "Luôn tạo thư mục thực hành ở đường dẫn ngắn (ví dụ: C:\\Practice_LungCT\\). Tránh xa các thư mục Desktop hoặc Documents "
        "đang bị Microsoft OneDrive tự động đồng bộ để tránh lỗi khóa tệp EBUSY và lỗi đường dẫn dài MAX_PATH (> 260 ký tự) trên Windows.",
        title="BẪY LỖI ĐƯỜNG DẪN DÀI VÀ XUNG ĐỘT ONEDRIVE", is_warn=True
    )

    # 6. PHẦN III & IV & V: TỔNG QUAN CÁC CHƯƠNG KỸ THUẬT TIẾP THEO
    add_heading_1(doc, "PHẦN III ĐẾN PHẦN VI: LỘ TRÌNH TRIỂN KHAI CODE NATIVE VÀ ĐÓNG GÓI")
    add_paragraph(doc, 
        "Các phần dưới đây trình bày cấu trúc kỹ thuật đã được triển khai và kiểm chứng trong đồ án LungCT. "
        "Nội dung chi tiết từng tệp mã nguồn hoàn chỉnh đang được biên soạn tuần tự theo kế hoạch:"
    )

    add_heading_2(doc, "Phần III: Design System & 17 Màn hình Giao diện Chuẩn Figma")
    add_paragraph(doc, 
        "- Xây dựng bộ Design Tokens: `colors.ts`, `typography.ts`, `spacing.ts` hỗ trợ hai chế độ Sáng/Tối.\n"
        "- 48 Icon hệ thống y tế chuẩn hóa SVG (`LungCT-Icons/`).\n"
        "- 17 màn hình chức năng: Đăng nhập, Bác sĩ, Kỹ thuật viên, Danh sách ca bệnh, Xem ảnh cắt lớp CT và Báo cáo PDF.\n"
        "- Trạng thái kiểm chứng: Đã vượt qua 113/113 bài kiểm thử tự động giao diện (Jest UI Tests)."
    )

    add_heading_2(doc, "Phần IV: Tầng Dữ liệu Cục bộ, Repository Pattern & Bảo Toàn Ca Nháp (AUTH-08)")
    add_paragraph(doc, 
        "- Cấu trúc bảng CSDL quan hệ: `secure_patients`, `secure_cases`, `secure_predictions`.\n"
        "- Repository Pattern: Tách biệt hoàn toàn tầng giao diện khỏi tầng truy vấn CSDL.\n"
        "- Chính sách AUTH-08: Khi tài khoản bác sĩ bị khóa, hệ thống bảo vệ nguyên vẹn các ca bệnh nháp (chưa đồng bộ) gắn liền với hồ sơ bệnh nhân gốc, không để ca nháp bị mồ côi.\n"
        "- Trạng thái kiểm chứng: Đã vượt qua 146/146 test cases kiểm thử tự động với Jest."
    )

    add_heading_2(doc, "Phần V: Tích hợp AI On-Device FP32 & CSDL Mã hóa SQLCipher 4.6.1")
    add_paragraph(doc, 
        "- Native C++ Engine: Tích hợp ONNX Runtime 1.31.0 + Google LiteRT 1.4.0 qua JNI.\n"
        "- Thuật toán Pillow Nearest Resample trong native C++ đảm bảo ma trận đầu vào 224x224x3 hoàn toàn trùng khớp Python.\n"
        "- Mã hóa cấp trang toàn bộ tệp CSDL SQLite bằng SQLCipher 4.6.1: Quét lệnh `strings` cho kết quả 0 byte chữ rõ (plaintext).\n"
        "- Cơ chế sao lưu kép: Tự động mã hóa tệp sao lưu `.plaintext.bak` thành `.encrypted.bak` bằng Master Key Keystore AES-256-GCM.\n"
        "- Trạng thái kiểm chứng: Đã chạy thực tế thành công trên máy ảo Android API 34 (độ trễ suy luận kỹ thuật ~1.580 ms; CSDL được bảo vệ triệt để)."
    )

    add_heading_2(doc, "Phần VI: Đóng gói APK Release độc lập & Nghiệm thu trên Xiaomi Redmi 13")
    add_paragraph(doc, 
        "- Quy trình biên dịch APK Release độc lập với cờ `skipBundleModels=true` trên máy ảo và bundle đầy đủ cho thiết bị thật.\n"
        "- Đo kiểm hiệu năng thực tế trên chip MediaTek Helio G91-Ultra: Nhiệt độ, RAM, mức tiêu thụ pin và thời gian xử lý toàn luồng.\n"
        "- Trạng thái kiểm chứng: [Đang chuẩn bị đo kiểm thực địa trên điện thoại Redmi 13 thật]."
    )

    # 7. PHỤ LỤC: SỔ LỆNH, SỔ LỖI VÀ BẢO VỆ ĐỒ ÁN
    add_heading_1(doc, "PHỤ LỤC: SỔ LỆNH TRA CỨU, SỔ LỖI THỰC TẾ & BẢO VỆ KHÓA LUẬN")
    
    add_heading_2(doc, "Phụ lục A: Sổ lệnh PowerShell chuẩn xác cho dự án")
    add_code_block(doc,
"""# 1. Kiểm tra chất lượng mã nguồn:
npm run typecheck       # Quét lỗi kiểu dữ liệu TypeScript
npm run lint            # Quét quy chuẩn mã nguồn ESLint (0 errors, 0 warnings)
npm run format:check    # Kiểm tra định dạng Prettier
npm test -- --runInBand # Chạy toàn bộ 16 test suites với Jest (146 tests passed)

# 2. Xuất bundle và biên dịch APK Release:
npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
cd android
.\\gradlew.bat assembleRelease -PskipBundleModels=true
adb install -r app\\build\\outputs\\apk\\release\\app-release.apk

# 3. Giám sát log và quét kiểm tra an toàn CSDL:
adb logcat -s "ReactNativeJS"
adb shell "strings /data/user/0/com.anonymous.mobile/databases/lungct_secure_usr_doc_01.db | grep -i 'Bui_Duc'"
# Kỳ vọng: 0 byte plaintext trả về!"""
    )

    add_heading_2(doc, "Phụ lục B: Sổ lỗi thực tế và cách xử lý (Troubleshooting)")
    add_paragraph(doc, 
        "1. Lỗi React Compiler 'Cannot call impure function Date.now during render':\n"
        "   - Nguyên nhân: React 19 cấm gọi hàm thời gian trực tiếp trong quá trình vẽ JSX.\n"
        "   - Cách sửa: Chuyển lời gọi Date.now() vào các sự kiện callback (onPress) hoặc thêm chú thích // eslint-disable-next-line react-hooks/purity.\n\n"
        "2. Lỗi Gradle ':app:createBundleReleaseJsAndAssets FAILED':\n"
        "   - Nguyên nhân: Thiếu các thư mục mới tạo khi copy mã sang thư mục build độc lập.\n"
        "   - Cách sửa: Sử dụng lệnh Copy-Item đệ quy đầy đủ toàn bộ cây thư mục mobile/src/*.\n\n"
        "3. Lỗi điện thoại Redmi 13 hiện 'unauthorized':\n"
        "   - Cách sửa: Rút cáp cắm lại, mở khóa màn hình điện thoại và bấm 'Luôn cho phép'. Nếu không hiện, chạy lệnh 'adb kill-server' rồi 'adb start-server'."
    )

    add_heading_2(doc, "Phụ lục C: Bộ câu hỏi bảo vệ khóa luận có căn cứ mã nguồn thực tế")
    add_paragraph(doc, 
        "• Câu 1: Vì sao nhóm chọn On-Device AI thay vì Cloud AI?\n"
        "  -> Trả lời: Để ứng dụng có thể hoạt động hoàn toàn ngoại tuyến tại các cơ sở y tế vùng sâu vùng xa, bảo vệ quyền riêng tư dữ liệu y tế (không gửi ảnh CT lên cloud), và giảm chi phí hạ tầng máy chủ.\n\n"
        "• Câu 2: Vì sao phải dùng SQLCipher 4.6.1 thay cho SQLite mặc định?\n"
        "  -> Trả lời: SQLite mặc định lưu dữ liệu dạng văn bản rõ trên đĩa flash. Lệnh strings quét trực tiếp đã đọc được toàn bộ họ tên bệnh nhân. SQLCipher mã hóa toàn bộ tệp nhị phân cấp trang đĩa (AES-256-CBC), loại bỏ 100% rò rỉ dữ liệu.\n\n"
        "• Câu 3: Độ trễ suy luận trên máy ảo có thể gọi là 'độ trễ lâm sàng' không?\n"
        "  -> Trả lời: Tuyệt đối không. Con số ~1.580 ms chỉ là thời gian suy luận kỹ thuật của vi xử lý trên lát cắt CT đối chứng; độ trễ lâm sàng đòi hỏi đo kiểm toàn bộ quy trình tác nghiệp của bác sĩ tại bệnh viện."
    )

    doc.save(output_path)
    print(f"[+] Đã hoàn thành xuất file: {output_path}")

def build_ios_curriculum(output_path):
    print(f"[*] Bắt đầu biên soạn giáo trình iOS: {output_path}")
    doc = create_document()
    
    # 1. Trang bìa
    add_cover_page(
        doc,
        title="GIÁO TRÌNH TỰ CODE ỨNG DỤNG LUNGCT\nCHO HỆ ĐIỀU HÀNH IOS",
        subtitle="Hướng dẫn chi tiết từng bước xây dựng ứng dụng di động hỗ trợ chẩn đoán ung thư phổi\nbằng Trí tuệ nhân tạo cạnh (Edge AI) & Bảo mật dữ liệu trên macOS & iPhone từ thư mục trống",
        author_name="DƯƠNG HẢI ĐĂNG",
        mssv="49.01.103.020",
        platform_name="iOS (macOS Sonoma/Sequoia / iPhone / Simulator)"
    )

    # 2. Lời nói đầu & Nguyên tắc học tập
    add_heading_1(doc, "LỜI NÓI ĐẦU VÀ NGUYÊN TẮC THỰC HÀNH")
    add_paragraph(doc, 
        "Tài liệu này được biên soạn dành riêng cho phân hệ iOS của đồ án LungCT. "
        "Hướng dẫn được thiết kế để một người học mới (chỉ mới biết lập trình C++ cơ bản và một ít Python) "
        "có thể từng bước tiếp cận hệ sinh thái Apple, hiểu rõ kiến trúc ứng dụng React Native trên iOS, "
        "cách thức biên dịch native qua Xcode và CocoaPods, cũng như lộ trình khảo sát AI On-Device và bảo mật Keychain."
    )
    add_callout(doc,
        "Hiện tại nhóm nghiên cứu chưa có thiết bị máy tính macOS và iPhone vật lý để biên dịch và chạy đo kiểm thực tế. "
        "Toàn bộ nội dung trong giáo trình iOS được xây dựng dựa trên việc đối chiếu nghiêm ngặt tài liệu chính thức "
        "của Apple Developer và React Native 0.88.0. Giáo trình ghi nhận trung thực trạng thái: [Đối chiếu lý thuyết kỹ thuật, chờ môi trường macOS để kiểm chứng].",
        title="CAM KẾT TRUNG THỰC KHOA HỌC", is_warn=True
    )

    # 3. Mục lục tổng thể & Tiến độ
    add_heading_1(doc, "MỤC LỤC TỔNG QUÁT VÀ MA TRẬN TIẾN ĐỘ")
    toc_data = [
        ["Phần I", "Chuyển Đổi Tư Duy Lập Trình: Từ C++ Sang TypeScript & React Native", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Kiểm chứng 100% Node 20"],
        ["Phần II", "Thiết Lập Môi Trường Phát Triển iOS Trên macOS Từ Con Số 0", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Đối chiếu Apple Developer Docs"],
        ["Phần III", "Khởi Tạo Dự Án, Design System & Tầng Giao Diện Dùng Chung", "Đang biên soạn chi tiết", "Đạt 113 UI Tests Jest"],
        ["Phần IV", "Tầng Lưu Trữ Cục Bộ, Repository Pattern & Bảo Toàn Ca Nháp (AUTH-08)", "Đang biên soạn chi tiết", "Đạt 146 Tests Jest Sandbox"],
        ["Phần V", "Khảo Sát Runtime AI On-Device (CoreML vs ONNX iOS) & Keychain Services", "Đang biên soạn chi tiết", "Bản thảo nghiên cứu khóa luận"],
        ["Phần VI", "Biên Dịch Thử Nghiệm Trên Simulator & Kế Hoạch Đo Kiểm iPhone Thật", "Chờ môi trường Mac", "Chờ thiết bị thực tế"],
        ["Phụ lục", "Sổ Lệnh macOS Terminal, Sổ Lỗi Pods/Signing & Bộ Câu Hỏi Bảo Vệ", "ĐÃ BIÊN SOẠN HOÀN CHỈNH", "Tra cứu thực tế đồ án"]
    ]
    add_custom_table(doc, ["Phần", "Nội dung đào tạo", "Tình trạng biên soạn", "Môi trường đã xác thực"], toc_data, [0.8, 2.7, 1.5, 1.3])

    # 4. PHẦN I: TƯ DUY TYPESCRIPT CHO NGƯỜI BIẾT C++ (DÙNG CHUNG)
    add_heading_1(doc, "PHẦN I: CHUYỂN ĐỔI TƯ DUY: TỪ C++ SANG TYPESCRIPT & REACT NATIVE")
    add_paragraph(doc, 
        "Phân hệ iOS chia sẻ 100% tầng logic giao diện và nghiệp vụ lưu trữ với phân hệ Android qua React Native. "
        "Do đó, người học cần nắm vững bản chất hướng sự kiện, mô hình bất đồng bộ và tư duy giao diện khai báo."
    )
    add_heading_2(doc, "1.1 Bảng so sánh kiểu dữ liệu C++ cơ bản vs TypeScript")
    types_data = [
        ["int, float, double", "number", "Gom tất cả số thành 64-bit float. Không có kiểu int riêng biệt."],
        ["std::string, char[]", "string", "Chuỗi bất biến (immutable), bọc trong '...' hoặc `...${var}`."],
        ["bool", "boolean", "Nhận true hoặc false. Falsy: 0, \"\", null, undefined."],
        ["nullptr, NULL", "null / undefined", "null: được gán chủ động; undefined: vừa khai báo chưa có giá trị."],
        ["struct SinhVien", "interface Patient", "Khuôn mẫu kiểm tra lúc viết mã; tự biến mất khi ứng dụng thực thi."],
        ["std::vector<int>", "number[]", "Mảng co giãn động, hỗ trợ mạnh .map(), .filter()."]
    ]
    add_custom_table(doc, ["Kiểu dữ liệu C++", "Tương đương TypeScript", "Lưu ý cho người mới"], types_data, [1.4, 1.4, 3.5])

    add_heading_2(doc, "1.2 Bản chất Bất đồng bộ: Mô hình Thẻ Rung Cà Phê")
    add_paragraph(doc, 
        "Tương tự như trên Android, giao diện iOS đòi hỏi độ mượt mà 60fps hoặc 120fps (ProMotion). "
        "Mọi tác vụ đọc đĩa, truy vấn Keychain hay suy luận AI đều phải chạy bất đồng bộ qua Promise để không làm đơ Main UI Thread:"
    )
    add_code_block(doc,
"""// Gọi bất đồng bộ truy vấn dữ liệu từ kho lưu trữ:
async function layDanhSachBenhNhan(ownerId: string): Promise<PatientEntity[]> {
  // Lệnh await tạm dừng hàm đợi CSDL phản hồi nhưng KHÔNG làm đơ giao diện iPhone!
  const danhSach = await localStorageService.getPatients(ownerId);
  return danhSach;
}"""
    )

    # 5. PHẦN II: CÀI ĐẶT MÔI TRƯỜNG IOS TRÊN MACOS
    add_heading_1(doc, "PHẦN II: THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN IOS TRÊN MACOS TỪ CON SỐ 0")
    add_paragraph(doc, 
        "Hướng dẫn thiết lập từ máy tính Mac trắng (macOS Sonoma 14.x hoặc macOS Sequoia 15.x):"
    )
    
    add_heading_2(doc, "2.1 Bảng công cụ bắt buộc trên macOS")
    ios_tools_data = [
        ["Xcode", "15.4 hoặc 16.x", "Mac App Store", "IDE chính thức, trình biên dịch Clang/Swift và iOS SDK"],
        ["Command Line Tools", "Đi kèm Xcode", "xcode-select --install", "Bộ công cụ dòng lệnh hệ thống"],
        ["Homebrew", "4.x", "brew.sh", "Trình quản lý gói cho macOS"],
        ["Node.js LTS", "v20.x", "brew install node@20", "Môi trường thực thi JavaScript/Metro Bundler"],
        ["CocoaPods", "1.15.x+", "brew install cocoapods", "Trình quản lý thư viện native iOS (tương tự Gradle)"],
        ["iOS Simulator", "iOS 17.x / 18.x", "Tải trong Xcode Components", "Giả lập máy iPhone trên macOS"]
    ]
    add_custom_table(doc, ["Công cụ", "Phiên bản chuẩn", "Nguồn cài đặt", "Mục đích sử dụng"], ios_tools_data, [1.5, 1.2, 1.4, 2.2])

    add_heading_2(doc, "2.2 Các bước cấu hình dòng lệnh trên macOS Terminal")
    add_code_block(doc,
"""# 1. Cài đặt Command Line Tools:
xcode-select --install

# 2. Cài đặt Homebrew và Node.js v20 LTS:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

brew install node@20
brew link node@20 --force --overwrite

# 3. Cài đặt CocoaPods:
brew install cocoapods

# 4. Kiểm tra các công cụ:
node -v          # Kỳ vọng: v20.x.x
pod --version    # Kỳ vọng: 1.15.x trở lên
xcode-select -p  # Kỳ vọng: /Applications/Xcode.app/Contents/Developer"""
    )

    add_heading_2(doc, "2.3 Phân biệt Mã ký ứng dụng (Code Signing) & Kết nối iPhone")
    add_paragraph(doc, 
        "1. Tài khoản Apple ID Cá nhân Miễn phí (Free Personal Team): Cài đặt app trực tiếp vào iPhone thật để kiểm thử, "
        "tuy nhiên chứng chỉ chỉ có hiệu lực tối đa 7 ngày (sau 7 ngày app sẽ bị khóa, phải cắm cáp build lại). Không hỗ trợ TestFlight.\n"
        "2. Tài khoản Apple Developer Program Trả phí ($99/năm): Cho phép phân phối thử nghiệm rộng rãi qua TestFlight (lên tới 10.000 người dùng trong 90 ngày) và đưa app lên App Store chính thức.\n"
        "3. Bật Developer Mode trên iPhone thật (từ iOS 16 trở lên): Vào Cài đặt -> Quyền riêng tư & Bảo mật -> Chế độ nhà phát triển -> Bật On -> Khởi động lại máy."
    )

    # 6. PHẦN III ĐẾN PHẦN VI: KHẢO SÁT KỸ THUẬT VÀ LỘ TRÌNH IOS
    add_heading_1(doc, "PHẦN III ĐẾN PHẦN VI: LỘ TRÌNH KHẢO SÁT AI VÀ BẢO MẬT TRÊN IOS")
    
    add_heading_2(doc, "Phần III & IV: Tầng Giao diện và Dữ liệu Dùng Chung")
    add_paragraph(doc, 
        "- Sử dụng 100% mã nguồn UI và Repository từ thư mục `src/` dùng chung.\n"
        "- Vượt qua toàn bộ 16 test suites và 146 bài kiểm thử Jest sandbox mà không cần thay đổi logic."
    )

    add_heading_2(doc, "Phần V: Khảo sát Runtime AI On-Device (CoreML vs ONNX iOS) & Keychain")
    add_paragraph(doc, 
        "- Khảo sát CoreML: Ưu điểm tối ưu hóa cực mạnh cho Neural Engine (ANE) của chip Apple A-Series, tuy nhiên việc chuyển đổi các custom layer trong Vision Transformer (ViT) đòi hỏi can thiệp sâu vào đồ thị tính toán.\n"
        "- Khảo sát ONNX Runtime iOS: Cho phép tái sử dụng nguyên bản mô hình FP32 đã kiểm chứng trên Android, đảm bảo tính đồng nhất kết quả chẩn đoán giữa hai hệ điều hành.\n"
        "- Quản lý khóa mật mã: Apple Keychain Services API (kSecClassGenericPassword) bảo vệ khóa CSDL, có thể liên kết với phần cứng Secure Enclave."
    )

    add_heading_2(doc, "Phần VI: Kế hoạch Thực nghiệm và Đo kiểm trên iPhone Thật")
    add_paragraph(doc, 
        "- Lập kế hoạch đo lường các chỉ số kỹ thuật khi được trang bị máy Mac: Thời gian khởi động lạnh (Cold Start), thời gian suy luận (Latency), mức tiêu thụ RAM và nhiệt độ vi xử lý A16/A17 Bionic.\n"
        "- Đối chiếu hiệu năng toàn diện với kết quả của phân hệ Android trên chip MediaTek Helio G91-Ultra."
    )

    # 7. PHỤ LỤC: SỔ LỆNH, SỔ LỖI VÀ BẢO VỆ ĐỒ ÁN
    add_heading_1(doc, "PHỤ LỤC: SỔ LỆNH TRA CỨU, SỔ LỖI THỰC TẾ & BẢO VỆ KHÓA LUẬN")
    
    add_heading_2(doc, "Phụ lục A: Sổ lệnh macOS Terminal chuẩn xác cho iOS")
    add_code_block(doc,
"""# 1. Cài đặt các thư viện CocoaPods native:
cd ios
pod install --repo-update

# 2. Chạy ứng dụng trên máy ảo iOS Simulator:
npx react-native run-ios --simulator="iPhone 15"

# 3. Xem danh sách máy ảo sẵn sàng:
xcrun simctl list devices

# 4. Xem log ứng dụng thời gian thực:
xcrun simctl spawn booted log stream --predicate 'process == "mobile"'"""
    )

    add_heading_2(doc, "Phụ lục B: Sổ lỗi iOS thường gặp và biện pháp xử lý")
    add_paragraph(doc, 
        "1. Lỗi 'Untrusted Developer Certificate' khi cài app vào iPhone thật:\n"
        "   - Cách sửa: Vào Cài đặt -> Cài đặt chung -> Quản lý VPN & Thiết bị -> Chọn email tài khoản Apple ID -> Nhấn Tin cậy (Trust).\n\n"
        "2. Lỗi xung đột cache CocoaPods:\n"
        "   - Cách sửa: Chạy lệnh pod deintegrate && pod cache clean --all && pod install trong thư mục ios/.\n\n"
        "3. Lỗi thiếu đường dẫn Node trong Xcode build phases:\n"
        "   - Cách sửa: Tạo file .xcode.env.local trong thư mục ios/ với nội dung export NODE_BINARY=$(which node)."
    )

    add_heading_2(doc, "Phụ lục C: Bộ câu hỏi bảo vệ khóa luận dành riêng cho phân hệ iOS")
    add_paragraph(doc, 
        "• Câu 1: Tại sao phân hệ iOS lại khảo sát cả hai phương án CoreML và ONNX Runtime iOS?\n"
        "  -> Trả lời: CoreML tận dụng tối đa phần cứng Apple Neural Engine (ANE) giúp tiết kiệm pin và suy luận nhanh, nhưng việc chuyển đổi các lớp Transformer phức tạp dễ sai lệch trọng số. ONNX Runtime iOS giúp bảo toàn chính xác 100% kết quả đối chứng với phân hệ Android.\n\n"
        "• Câu 2: Tình trạng thực tế hiện tại của phân hệ iOS trong đồ án là gì?\n"
        "  -> Trả lời: Sinh viên đã hoàn thành 100% tầng logic giao diện và lưu trữ dùng chung trên React Native (đạt 146/146 tests Jest) và hoàn thiện báo cáo khảo sát lý thuyết kiến trúc. Do chưa có máy Mac vật lý, phần biên dịch native IPA đang ở trạng thái chờ thực nghiệm khi có phần cứng."
    )

    doc.save(output_path)
    print(f"[+] Đã hoàn thành xuất file: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\docs\learning\tu-code-lungct"
    android_docx = os.path.join(out_dir, "Giao_trinh_Tu_code_LungCT_Android.docx")
    ios_docx = os.path.join(out_dir, "Giao_trinh_Tu_code_LungCT_iOS.docx")
    
    build_android_curriculum(android_docx)
    build_ios_curriculum(ios_docx)
    print("[*] HOÀN TẤT BIÊN SOẠN CẢ HAI GIÁO TRÌNH WORD THÀNH CÔNG!")
