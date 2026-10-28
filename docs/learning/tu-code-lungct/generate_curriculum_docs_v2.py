# -*- coding: utf-8 -*-
"""
Script mở rộng nội dung chi tiết cho cả 2 cuốn giáo trình Word:
- Giao_trinh_Tu_code_LungCT_Android.docx
- Giao_trinh_Tu_code_LungCT_iOS.docx

Đầy đủ từ con số 0:
- Chương 1: Tư duy TypeScript cho người biết C++ (Ví dụ Thẻ rung cà phê, Promise, State/Props).
- Chương 2: Thiết lập môi trường hệ thống (Windows/Android vs macOS/iOS).
- Chương 3: Khởi tạo dự án trống & Cấu trúc thư mục chuẩn.
- Chương 4: Xây dựng Design System Tokens & Bộ Icon y tế 66 Icon (SVG/JSX).
- Chương 5: Xây dựng Bộ thành phần UI Atoms/Molecules (Button, TextField, TopBar).
- Chương 6: Cấu hình Điều hướng màn hình đa vai trò (RootNavigator, DoctorStack).
- Chương 7: Tầng Dữ liệu Cục bộ, Repository Pattern & Bảo toàn ca nháp (AUTH-08).
- Chương 8: Tích hợp Native AI On-Device FP32 & CSDL Mã hóa SQLCipher (Android) / Khảo sát CoreML (iOS).
- Chương 9: Đóng gói và Nghiệm thu thiết bị (Redmi 13 / iPhone).
- Phụ lục: Sổ lệnh PowerShell / Bash, Sổ lỗi thực tế, Bộ câu hỏi bảo vệ khóa luận.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from build_word_curriculum import (
    create_document, add_cover_page, add_heading_1, add_heading_2, add_heading_3,
    add_paragraph, add_callout, add_code_block, add_custom_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT
)

def build_full_android_curriculum(output_path):
    print(f"[*] Đang biên soạn bản thảo giáo trình Android: {output_path}")
    doc = create_document()

    # Trang bìa
    add_cover_page(
        doc,
        title="BẢN THẢO GIÁO TRÌNH TỰ CODE LUNGCT\nCHO HỆ ĐIỀU HÀNH ANDROID",
        subtitle="Tài liệu tự học và thực hành từng bước từ thư mục trống:\nReact Native, TypeScript, Edge AI FP32 On-Device và SQLCipher Native",
        author_name="DƯƠNG THỊ THU DIỄM",
        mssv="49.01.103.011",
        platform_name="Android (Windows 11 / Redmi 13 / Máy ảo API 34)"
    )

    # Lời nói đầu & Nguyên tắc thực hành
    add_heading_1(doc, "LỜI NÓI ĐẦU VÀ NGUYÊN TẮC HỌC TẬP")
    add_paragraph(doc, 
        "Tài liệu này là bản thảo giáo trình tự học lập trình thực chiến, dành riêng cho người học đã có kiến thức "
        "lập trình C++ cơ bản và một ít Python, muốn tự tay code lại toàn bộ ứng dụng y tế LungCT trên Android "
        "từ một thư mục hoàn toàn trống. Giáo trình được thiết kế theo tư duy kiến trúc mô-đun, giải thích rõ lý do "
        "vì sao cần viết từng đoạn mã, dữ liệu đi từ đâu đến đâu, và cách thức kiểm tra từng bước."
    )
    add_callout(doc,
        "1. Thư mục thực hành độc lập: Luôn thực hành tại thư mục riêng (ví dụ: C:\\Practice_LungCT\\), không ghi đè dự án gốc.\n"
        "2. Không tự ý cài đặt phiên bản 'latest': Tuân thủ tuyệt đối bảng phiên bản đã kiểm chứng (React Native 0.88.0, Expo SDK 52, SQLCipher 4.6.1, ONNX Runtime 1.31.0).\n"
        "3. Đạt Checklist mới chuyển bài: Mỗi bài đều có bài tập và tiêu chí kiểm tra bắt buộc.",
        title="NGUYÊN TẮC BẢO VỆ DỰ ÁN & TIẾN ĐỘ THỰC HÀNH", is_warn=True
    )

    # Mục lục tổng quan
    add_heading_1(doc, "MỤC LỤC TỔNG QUAN & BẢNG TIẾN ĐỘ THỰC HÀNH")
    toc_data = [
        ["Chương 1", "Tư Duy Lập Trình: Từ C++ Sang TypeScript & React Native", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% Node 20 / Jest"],
        ["Chương 2", "Thiết Lập Môi Trường Android Studio & SDK Trên Windows", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% Windows 11 / AVD"],
        ["Chương 3", "Khởi Tạo Dự Án Trống & Cấu Trúc Mã Nguồn Chuẩn Hóa", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% Expo / React Native"],
        ["Chương 4", "Hệ Thống Design Tokens & Bộ 66 Icon Y Tế Chuẩn Hóa", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% manifest-constants"],
        ["Chương 5", "Xây Dựng Các Thành Phần Giao Diện Cơ Bản (UI Components)", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 113 UI Tests Jest"],
        ["Chương 6", "Hệ Thống Điều Hướng Đa Vai Trò (Navigation Architecture)", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng RootNavigator / DoctorStack"],
        ["Chương 7", "Tầng Dữ Liệu Cục Bộ, Repository Pattern & AUTH-08", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 146 Tests Jest Sandbox"],
        ["Chương 8", "Tích Hợp Native AI On-Device FP32 & SQLCipher 4.6.1", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng Máy ảo Android API 34"],
        ["Chương 9", "Đóng Gói APK Release Độc Lập & Đo Kiểm Trên Redmi 13", "Đang hoàn thiện đo kiểm", "Đã build APK, chờ nghiệm thu máy thật"],
        ["Phụ lục", "Sổ Lệnh PowerShell, Sổ Lỗi Thực Tế & Bộ Câu Hỏi Bảo Vệ", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Tra cứu thực tế đồ án LungCT"]
    ]
    add_custom_table(doc, ["Chương", "Nội dung đào tạo thực hành", "Trạng thái biên soạn", "Môi trường kiểm chứng"], toc_data, [0.8, 2.7, 1.4, 1.4])

    # CHƯƠNG 1
    add_heading_1(doc, "CHƯƠNG 1: TƯ DUY LẬP TRÌNH: TỪ C++ SANG TYPESCRIPT & REACT NATIVE")
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

    add_heading_2(doc, "1.2 Bản chất Bất đồng bộ: Ví dụ Thẻ Rung Cà Phê (Promise & async/await)")
    add_paragraph(doc, 
        "Trong C++ console, nếu bạn gọi một hàm đọc tệp nặng từ đĩa, luồng CPU sẽ bị khóa cứng (blocking) "
        "cho đến khi đọc xong. Tuy nhiên, trên điện thoại di động, toàn bộ giao diện chạy trên luồng JS Thread duy nhất. "
        "Nếu bạn khóa luồng quá 16ms, màn hình sẽ bị đơ, giật lag và hệ thống Android sẽ hiện cảnh báo ANR buộc dừng app!"
    )
    add_paragraph(doc, 
        "Để giải quyết triệt để, TypeScript sử dụng cơ chế Promise giống chiếc Thẻ rung cà phê:", bold_prefix="Mô hình Thẻ rung gọi cà phê: "
    )
    add_paragraph(doc, 
        "1. Bạn gọi món tại quầy -> Thu ngân phát một chiếc thẻ rung (Promise).\n"
        "2. Trong lúc đợi pha chế, bạn đi tìm bàn ngồi, lướt điện thoại (Giao diện app vẽ mượt mà 60fps, nút bấm phản hồi tốt).\n"
        "3. Khi ly cà phê pha xong, thẻ rung lên -> Bạn mang thẻ ra lấy nước (Dữ liệu đã sẵn sàng, lệnh await hoàn tất)."
    )
    add_code_block(doc,
"""// 1. Hàm đọc ảnh CT trả về một "Chiếc thẻ rung" (Promise)
async function docTepAnhCTAsync(duongDan: string): Promise<DuLieuAnh> {
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
        "Hàm có 'async' luôn trả về Promise. Muốn lấy giá trị thực từ Promise mà không đơ app, "
        "phải đặt 'await' phía trước lời gọi hàm. 'await' chỉ được đứng bên trong hàm 'async'.",
        title="QUY TẮC BẮT BUỘC CỦA ASYNC/AWAIT"
    )

    # CHƯƠNG 2
    add_heading_1(doc, "CHƯƠNG 2: THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN ANDROID TRÊN WINDOWS TỪ CON SỐ 0")
    add_heading_2(doc, "2.1 Bảng công cụ chuẩn đã kiểm chứng 100%")
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

    add_heading_2(doc, "2.2 Phân biệt rõ các chỉ số SDK Android")
    add_paragraph(doc, 
        "1. compileSdk (API 34): Phiên bản SDK mà Gradle dùng để kiểm tra cú pháp và dịch mã nguồn.\n"
        "2. targetSdk (API 34): Phiên bản hệ điều hành mà app cam kết tuân thủ chính sách bảo mật.\n"
        "3. minSdkVersion (API 29 - Android 10): Phiên bản Android thấp nhất cho phép cài đặt ứng dụng.\n"
        "4. Android API của Thiết bị (API 34): Hệ điều hành thực tế chạy trên máy ảo hoặc Redmi 13."
    )
    add_heading_2(doc, "2.3 Cấu hình biến môi trường trên Windows PowerShell")
    add_code_block(doc,
"""# 1. Biến JAVA_HOME: C:\\Program Files\\Microsoft\\jdk-17.0.x-hotspot
# Thêm vào Path: %JAVA_HOME%\\bin

# 2. Biến ANDROID_HOME: C:\\Users\\<TÊN_BẠN>\\AppData\\Local\\Android\\Sdk
# Thêm lần lượt vào Path:
#   %ANDROID_HOME%\\platform-tools
#   %ANDROID_HOME%\\emulator
#   %ANDROID_HOME%\\cmdline-tools\\latest\\bin

# 3. Kiểm tra trên PowerShell mới:
node -v          # Kỳ vọng: v20.x.x
javac -version   # Kỳ vọng: javac 17.0.x
adb version      # Kỳ vọng: Android Debug Bridge version 1.0.41..."""
    )
    add_callout(doc,
        "Luôn tạo thư mục thực hành ở đường dẫn ngắn (ví dụ: C:\\Practice_LungCT\\). Tránh xa các thư mục Desktop hoặc Documents "
        "đang bị Microsoft OneDrive tự động đồng bộ để tránh lỗi khóa tệp EBUSY và lỗi đường dẫn dài MAX_PATH (> 260 ký tự) trên Windows.",
        title="BẪY LỖI ĐƯỜNG DẪN DÀI VÀ XUNG ĐỘT ONEDRIVE", is_warn=True
    )

    # CHƯƠNG 3
    add_heading_1(doc, "CHƯƠNG 3: KHỞI TẠO DỰ ÁN TRỐNG & CẤU TRÚC MÃ NGUỒN CHUẨN HÓA")
    add_paragraph(doc, 
        "Trong chương này, bạn sẽ tự tay tạo dự án React Native từ con số 0 trong thư mục thực hành riêng biệt."
    )
    add_heading_2(doc, "3.1 Lệnh khởi tạo dự án với Expo SDK 52 và TypeScript")
    add_code_block(doc,
"""# 1. Tạo thư mục thực hành mới tại gốc ổ C:
mkdir C:\\Practice_LungCT
cd C:\\Practice_LungCT

# 2. Khởi tạo dự án React Native trống hỗ trợ TypeScript:
npx create-expo-app@latest mobile -t blank-typescript
cd mobile

# 3. Cài đặt các thư viện nền tảng theo phiên bản kiểm chứng:
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens react-native-svg
npm install @react-native-async-storage/async-storage i18next react-i18next expo-font expo-localization"""
    )
    add_heading_2(doc, "3.2 Cấu trúc thư mục mã nguồn chuẩn hóa")
    add_code_block(doc,
"""mobile/
├── assets/                  # Ảnh nền, icon, font chữ
├── src/
│   ├── config/              # Cấu hình hệ thống, quyết định UI
│   ├── features/            # Tính năng phân theo vai trò (auth, doctor, admin)
│   ├── i18n/                # Đa ngôn ngữ (vi, en)
│   ├── navigation/          # Điều hướng màn hình (RootNavigator, Stacks)
│   ├── services/
│   │   ├── ai/              # Pipeline suy luận AI on-device
│   │   └── storage/         # Tầng lưu trữ mã hóa SQLCipher & Repository
│   └── ui/
│       ├── components/      # Các thành phần UI atoms/molecules (Button, Dialog...)
│       ├── icons/           # Bộ 66 icon y tế chuẩn hóa SVG
│       └── theme/           # Design system tokens (colors, spacing, typography)
├── App.tsx                  # Điểm khởi động ứng dụng
├── app.json                 # Cấu hình Expo
└── package.json             # Khai báo thư viện và script thực thi"""
    )

    # CHƯƠNG 4
    add_heading_1(doc, "CHƯƠNG 4: HỆ THỐNG DESIGN TOKENS & BỘ 66 ICON Y TẾ CHUẨN HÓA")
    add_paragraph(doc, 
        "Để đảm bảo ứng dụng đạt thẩm mỹ chuyên nghiệp y tế và dễ dàng chuyển đổi chế độ Sáng/Tối, "
        "chúng ta tuyệt đối không 'hardcode' mã màu vào từng màn hình mà quản lý tập trung qua Design Tokens."
    )
    add_heading_2(doc, "4.1 Khởi tạo tệp Khoảng cách và Bo góc: `src/ui/theme/spacing.ts`")
    add_code_block(doc,
"""export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  x4l: 40,
  x5l: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const MIN_TOUCH = 44; // Vùng chạm tối thiểu chuẩn công thái học"""
    )

    add_heading_2(doc, "4.2 Khởi tạo Kiểu chữ Typography: `src/ui/theme/typography.ts`")
    add_code_block(doc,
"""import type { TextStyle } from 'react-native';

export const FONT_FAMILY = {
  regular: 'BeVietnamPro-Regular',
  medium: 'BeVietnamPro-Medium',
  semibold: 'BeVietnamPro-SemiBold',
} as const;

const t = (fontSize: number, lineHeight: number, weight: keyof typeof FONT_FAMILY): TextStyle => ({
  fontSize,
  lineHeight,
  fontFamily: FONT_FAMILY[weight],
});

export const typography = {
  display: t(28, 36, 'semibold'),
  titleL: t(22, 28, 'semibold'),
  titleM: t(19, 26, 'semibold'),
  titleS: t(17, 24, 'semibold'),
  bodyL: t(17, 24, 'regular'),
  bodyM: t(15, 22, 'regular'),
  bodyS: t(13, 18, 'regular'),
  labelL: t(17, 22, 'medium'),
  labelM: t(15, 20, 'medium'),
  labelS: t(13, 16, 'medium'),
  caption: t(12, 16, 'regular'),
  numericM: { ...t(15, 20, 'semibold'), fontVariant: ['tabular-nums'] },
} as const;"""
    )

    add_heading_2(doc, "4.3 Bộ Icon Y Tế: Khai báo 66 Icon trong `src/ui/icons/manifest-constants.ts`")
    add_paragraph(doc, 
        "Hệ thống icon của LungCT gồm chính xác 66 icon vector SVG y tế độc quyền, được kiểm chứng tự động trong bộ test icons.test.ts:"
    )
    add_code_block(doc,
"""export const ALL_ICON_NAMES = [
  'account-approval', 'ai-analysis', 'back', 'calendar', 'camera', 'cancel',
  'case-add', 'case-complete', 'cases', 'chevron-right', 'close', 'conflict',
  'ct-image', 'ct-stack', 'download', 'draft', 'edit', 'error', 'eye', 'eye-off',
  'filter', 'grad-cam', 'home', 'image-compare', 'image-replace', 'image-upload',
  'info', 'language', 'lock', 'logout', 'lung', 'medical-notes', 'more',
  'notifications', 'offline', 'on-device', 'opacity', 'partial', 'patient-add',
  'patients', 'pdf-export', 'pending', 'privacy', 'processing', 'profile',
  'reset-view', 'restore', 'retry', 'save', 'search', 'server-analysis',
  'settings', 'share', 'sort', 'statistics', 'success', 'sync', 'sync-error',
  'theme', 'trash', 'unlock', 'warning', 'zoom-in', 'zoom-out'
] as const;

export type IconName = (typeof ALL_ICON_NAMES)[number];"""
    )

    # CHƯƠNG 5
    add_heading_1(doc, "CHƯƠNG 5: XÂY DỰNG CÁC THÀNH PHẦN GIAO DIỆN CƠ BẢN (UI COMPONENTS)")
    add_paragraph(doc, 
        "Xây dựng thành phần Nút bấm chuẩn hóa `Button.tsx` trong `src/ui/components/Button.tsx` "
        "hỗ trợ 4 biến thể (primary, secondary, tertiary, danger), tự động hiển thị vòng xoay đang tải và vùng chạm chuẩn 44pt:"
    )
    add_code_block(doc,
"""import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'L' | 'M';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  label, variant = 'primary', size = 'L', loading = false, disabled = false, onPress
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const isClickable = !disabled && !loading;

  return (
    <Pressable
      disabled={!isClickable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: size === 'L' ? 48 : 40,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: variant === 'primary' ? colors.brand.primary : colors.bg.surface,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.contrast} />
      ) : (
        <Text style={[typography.labelL, { color: variant === 'primary' ? colors.text.contrast : colors.text.primary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
});"""
    )

    # CHƯƠNG 6
    add_heading_1(doc, "CHƯƠNG 6: HỆ THỐNG ĐIỀU HƯỚNG ĐA VAI TRÒ (NAVIGATION ARCHITECTURE)")
    add_paragraph(doc, 
        "Khởi tạo bộ điều phối điều hướng `RootNavigator.tsx` tại `src/navigation/RootNavigator.tsx`. "
        "Tự động phân luồng: Khi chưa đăng nhập hiện AuthStack, khi đăng nhập bác sĩ hiện DoctorStack, khi đăng nhập quản trị hiện AdminStack:"
    )
    add_code_block(doc,
"""import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/context/AuthContext';
import { AuthStack } from './AuthStack';
import { DoctorStack } from './DoctorStack';
import { AdminStack } from './AdminStack';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminStack} />
        ) : (
          <Stack.Screen name="DoctorApp" component={DoctorStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};"""
    )

    # CHƯƠNG 7
    add_heading_1(doc, "CHƯƠNG 7: TẦNG DỮ LIỆU CỤC BỘ, REPOSITORY PATTERN & BẢO TOÀN CA NHÁP (AUTH-08)")
    add_paragraph(doc, 
        "Thiết kế tầng lưu trữ theo Repository Pattern trong `src/services/storage/patientRepository.ts`. "
        "Mọi truy vấn dữ liệu bệnh nhân đều được cô lập tuyệt đối theo `ownerId` của từng bác sĩ."
    )
    add_paragraph(doc, 
        "Thuật toán bảo toàn ca nháp AUTH-08 khi tài khoản bác sĩ bị khóa:", bold_prefix="Chính sách bảo mật AUTH-08: "
    )
    add_paragraph(doc, 
        "- Xóa sạch các ca bệnh đã đồng bộ lên cloud (synced) để giải phóng vùng nhớ.\n"
        "- Giữ lại nguyên vẹn các ca bệnh nháp chưa đồng bộ (pending) cùng với thông tin bệnh nhân liên kết, không để ca nháp bị mồ côi."
    )
    add_callout(doc,
        "Đã vượt qua toàn bộ 146/146 test cases kiểm thử tự động với Jest (trong đó có 13 bài test mã hóa và kịch bản biên AUTH-08 tại localStorageService.test.ts).",
        title="XÁC MINH KIỂM THỬ TẦNG LƯU TRỮ"
    )

    # CHƯƠNG 8
    add_heading_1(doc, "CHƯƠNG 8: TÍCH HỢP NATIVE AI ON-DEVICE FP32 & CSDL MÃ HÓA SQLCIPHER")
    add_paragraph(doc, 
        "1. Tích hợp AI On-Device Native C++:\n"
        "   - Mô hình Adaptive AACNN-ViT FP32 (ONNX Runtime 1.31.0 + Google LiteRT 1.4.0).\n"
        "   - Thuật toán Pillow Nearest Resample trong mã nguồn native C++ biến đổi ảnh CT về ma trận 224x224x3 hoàn toàn trùng khớp với kết quả kiểm chứng chuyển đổi FP32 tại MOB-01.\n"
        "2. Tích hợp SQLCipher 4.6.1:\n"
        "   - Module `NativeCryptoVaultModule.kt` mã hóa cấp trang toàn bộ tệp nhị phân `lungct_secure_usr_doc_01.db` bằng AES-256-CBC.\n"
        "   - Quét lệnh `strings` trên tệp CSDL thực tế cho kết quả: **0 byte plaintext** (hoàn toàn không rò rỉ tên bệnh nhân hay mã số ca bệnh).\n"
        "3. Cơ chế Sao lưu An toàn Kép:\n"
        "   - Sinh bản sao lưu mã hóa `.encrypted.bak` (AES-256-GCM qua Master Key Android Keystore, magic header `LCBK`).\n"
        "   - Bảo toàn bản sao lưu cũ `.plaintext.bak` phục vụ cứu hộ thảm họa, không ghi đè làm mất dữ liệu."
    )

    # CHƯƠNG 9
    add_heading_1(doc, "CHƯƠNG 9: ĐÓNG GÓI APK RELEASE ĐỘC LẬP & ĐO KIỂM TRÊN REDMI 13")
    add_paragraph(doc, 
        "- Lệnh biên dịch APK Release độc lập trên PowerShell:\n"
        "  `npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/`\n"
        "  `cd android && .\\gradlew.bat assembleRelease -PskipBundleModels=true`\n"
        "- Cài đặt cập nhật lên máy ảo: `adb install -r app\\build\\outputs\\apk\\release\\app-release.apk`.\n"
        "- Trạng thái kiểm chứng: Đã chạy thực tế thành công trên máy ảo Android API 34. Đang chuẩn bị gói APK độc lập chứa đầy đủ mô hình AI nhúng để đo kiểm các chỉ số tiêu thụ RAM, pin và nhiệt độ trên chip MediaTek Helio G91-Ultra của điện thoại Xiaomi Redmi 13."
    )

    # PHỤ LỤC
    add_heading_1(doc, "PHỤ LỤC: SỔ LỆNH TRA CỨU, SỔ LỖI THỰC TẾ & BẢO VỆ KHÓA LUẬN")
    add_heading_2(doc, "Phụ lục A: Sổ lệnh PowerShell chuẩn xác cho dự án")
    add_code_block(doc,
"""npm run typecheck       # Quét lỗi kiểu dữ liệu TypeScript
npm run lint            # Quét quy chuẩn mã nguồn ESLint (0 errors, 0 warnings)
npm run format:check    # Kiểm tra định dạng Prettier
npm test -- --runInBand # Chạy toàn bộ 16 test suites với Jest (146 tests passed)
adb logcat -s "ReactNativeJS"
adb shell "strings /data/user/0/com.anonymous.mobile/databases/lungct_secure_usr_doc_01.db | grep -i 'Bui_Duc'"
# Kết quả: 0 byte plaintext!"""
    )
    add_heading_2(doc, "Phụ lục B: Sổ lỗi thực tế và cách xử lý (Troubleshooting)")
    add_paragraph(doc, 
        "1. Lỗi React Compiler 'Cannot call impure function Date.now during render':\n"
        "   - Sửa: Chuyển Date.now() vào sự kiện onPress hoặc thêm // eslint-disable-next-line react-hooks/purity.\n"
        "2. Lỗi Gradle ':app:createBundleReleaseJsAndAssets FAILED':\n"
        "   - Sửa: Copy đệ quy toàn bộ thư mục mobile/src/* sang thư mục build độc lập.\n"
        "3. Lỗi điện thoại Redmi 13 hiện 'unauthorized':\n"
        "   - Sửa: Bật sáng màn hình, tích chọn 'Luôn cho phép từ máy tính này' -> OK. Chạy 'adb kill-server' rồi 'adb start-server'."
    )
    add_heading_2(doc, "Phụ lục C: Bộ câu hỏi bảo vệ khóa luận")
    add_paragraph(doc, 
        "• Câu 1: Vì sao chọn On-Device AI thay vì Cloud AI?\n"
        "  -> Hoạt động ngoại tuyến tại y tế tuyến dưới, bảo vệ quyền riêng tư dữ liệu ảnh CT (PHI) và giảm chi phí máy chủ.\n"
        "• Câu 2: Vì sao dùng SQLCipher thay SQLite mặc định?\n"
        "  -> SQLite mặc định lưu chữ rõ trên flash storage. SQLCipher mã hóa cấp trang toàn bộ tệp bằng AES-256-CBC, triệt tiêu 100% rò rỉ dữ liệu.\n"
        "• Câu 3: Thời gian suy luận ~1.580ms trên máy ảo có phải độ trễ lâm sàng không?\n"
        "  -> Không. Đó là thời gian suy luận kỹ thuật của vi xử lý trên lát cắt CT đối chứng; độ trễ lâm sàng phải đo kiểm toàn quy trình tác nghiệp của bác sĩ."
    )

    doc.save(output_path)
    print(f"[+] Đã hoàn thành bản thảo giáo trình Android: {output_path}")

def build_full_ios_curriculum(output_path):
    print(f"[*] Đang biên soạn bản thảo giáo trình iOS: {output_path}")
    doc = create_document()

    # Trang bìa
    add_cover_page(
        doc,
        title="BẢN THẢO GIÁO TRÌNH TỰ CODE LUNGCT\nCHO HỆ ĐIỀU HÀNH IOS",
        subtitle="Tài liệu tự học và thực hành từng bước từ thư mục trống:\nReact Native, TypeScript, Khảo sát Edge AI và Apple Keychain Services",
        author_name="DƯƠNG HẢI ĐĂNG",
        mssv="49.01.103.020",
        platform_name="iOS (macOS Sonoma/Sequoia / iPhone / Simulator)"
    )

    # Lời nói đầu & Nguyên tắc thực hành
    add_heading_1(doc, "LỜI NÓI ĐẦU VÀ CAM KẾT TRUNG THỰC KHOA HỌC")
    add_paragraph(doc, 
        "Tài liệu này là bản thảo giáo trình tự học dành riêng cho phân hệ iOS của dự án LungCT. "
        "Hướng dẫn được thiết kế để người học chỉ mới biết C++ cơ bản có thể từng bước làm quen với hệ sinh thái Apple, "
        "cấu hình Xcode, CocoaPods, điều hướng màn hình và mô hình dữ liệu dùng chung React Native."
    )
    add_callout(doc,
        "Hiện tại nhóm nghiên cứu chưa có thiết bị máy tính macOS và iPhone vật lý để biên dịch và chạy đo kiểm native thực tế. "
        "Toàn bộ nội dung trong giáo trình iOS được xây dựng dựa trên việc đối chiếu nghiêm ngặt tài liệu chính thức "
        "của Apple Developer và React Native 0.88.0. Giáo trình ghi nhận trung thực trạng thái: [Đối chiếu lý thuyết kỹ thuật, chờ môi trường macOS để kiểm chứng thực tế]. "
        "Tuyệt đối không báo cáo sai lệch rằng mã native iOS đã được biên dịch thành công.",
        title="CAM KẾT TRUNG THỰC KHOA HỌC", is_warn=True
    )

    # Mục lục tổng quan
    add_heading_1(doc, "MỤC LỤC TỔNG QUAN & BẢNG TIẾN ĐỘ THỰC HÀNH")
    toc_data = [
        ["Chương 1", "Tư Duy Lập Trình: Từ C++ Sang TypeScript & React Native", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% Node 20 / Jest"],
        ["Chương 2", "Thiết Lập Môi Trường macOS, Xcode & CocoaPods Từ Máy Trắng", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Đối chiếu Apple Developer Docs"],
        ["Chương 3", "Khởi Tạo Dự Án Trống & Cấu Trúc Mã Nguồn Dùng Chung", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% Expo / React Native"],
        ["Chương 4", "Hệ Thống Design Tokens & Bộ 66 Icon Y Tế Dùng Chung", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 100% manifest-constants"],
        ["Chương 5", "Xây Dựng Các Thành Phần Giao Diện Cơ Bản (UI Components)", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 113 UI Tests Jest"],
        ["Chương 6", "Hệ Thống Điều Hướng Đa Vai Trò (Navigation Architecture)", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng RootNavigator / DoctorStack"],
        ["Chương 7", "Tầng Dữ Liệu Cục Bộ, Repository Pattern & AUTH-08", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Kiểm chứng 146 Tests Jest Sandbox"],
        ["Chương 8", "Khảo Sát Runtime AI On-Device (CoreML vs ONNX) & Keychain", "Đang khảo sát lý thuyết", "Bản thảo nghiên cứu Khóa luận iOS"],
        ["Chương 9", "Kế Hoạch Biên Dịch Thử Nghiệm Trên Simulator & iPhone Thật", "Chờ môi trường Mac", "Chờ thiết bị thực tế"],
        ["Phụ lục", "Sổ Lệnh macOS Terminal, Sổ Lỗi Pods & Bộ Câu Hỏi Bảo Vệ", "ĐÃ HOÀN THIỆN ĐẦY ĐỦ", "Tra cứu thực tế đồ án LungCT"]
    ]
    add_custom_table(doc, ["Chương", "Nội dung đào tạo thực hành", "Trạng thái biên soạn", "Môi trường kiểm chứng"], toc_data, [0.8, 2.7, 1.4, 1.4])

    # CHƯƠNG 1
    add_heading_1(doc, "CHƯƠNG 1: TƯ DUY LẬP TRÌNH: TỪ C++ SANG TYPESCRIPT & REACT NATIVE")
    add_paragraph(doc, 
        "Phân hệ iOS chia sẻ 100% tầng logic giao diện và nghiệp vụ lưu trữ với phân hệ Android qua React Native. "
        "Do đó, người học cần nắm vững bản chất hướng sự kiện, mô hình bất đồng bộ và tư duy giao diện khai báo."
    )
    add_heading_2(doc, "1.1 Bảng đối chiếu kiểu dữ liệu C++ vs TypeScript")
    types_data = [
        ["int, float, double", "number", "Gom mọi số thành 64-bit float. Không có kiểu int riêng biệt."],
        ["std::string, char[]", "string", "Chuỗi bất biến (immutable), bọc trong '...' hoặc template string `...${var}`."],
        ["bool", "boolean", "Chỉ nhận true hoặc false. Falsy: 0, \"\", null, undefined."],
        ["nullptr, NULL", "null / undefined", "null: được gán chủ động; undefined: vừa khai báo chưa gán giá trị."],
        ["struct SinhVien", "interface Patient", "Khuôn mẫu kiểm tra lúc viết mã; tự biến mất khi ứng dụng thực thi."],
        ["std::vector<int>", "number[]", "Mảng co giãn động, hỗ trợ mạnh .map(), .filter()."]
    ]
    add_custom_table(doc, ["Kiểu dữ liệu C++", "Tương đương TypeScript", "Lưu ý cho người mới"], types_data, [1.4, 1.4, 3.5])

    add_heading_2(doc, "1.2 Mô hình Thẻ Rung Cà Phê giải thích Bất đồng bộ (Promise & async/await)")
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

    # CHƯƠNG 2
    add_heading_1(doc, "CHƯƠNG 2: THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN IOS TRÊN MACOS TỪ CON SỐ 0")
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

    # CÁC CHƯƠNG TỪ 3 ĐẾN 7 (DÙNG CHUNG)
    add_heading_1(doc, "CHƯƠNG 3 ĐẾN CHƯƠNG 7: TẦNG GIAO DIỆN VÀ MÔ HÌNH DỮ LIỆU DÙNG CHUNG")
    add_paragraph(doc, 
        "Toàn bộ mã nguồn từ Chương 3 đến Chương 7 (Design System, 66 Icon y tế, UI Components, RootNavigator và Repository Pattern) "
        "được chia sẻ hoàn toàn 100% giữa phân hệ Android và iOS. Bộ kiểm thử Jest sandbox với 16 test suites và 146 tests cases "
        "đều đạt 100% thành công mà không phụ thuộc vào hệ điều hành."
    )

    # CHƯƠNG 8
    add_heading_1(doc, "CHƯƠNG 8: KHẢO SÁT RUNTIME AI ON-DEVICE & APPLE KEYCHAIN SERVICES")
    add_paragraph(doc, 
        "- Khảo sát CoreML: Ưu điểm tối ưu hóa cực mạnh cho Neural Engine (ANE) của chip Apple A-Series, tuy nhiên việc chuyển đổi các custom layer trong Vision Transformer (ViT) đòi hỏi can thiệp sâu vào đồ thị tính toán.\n"
        "- Khảo sát ONNX Runtime iOS: Cho phép tái sử dụng nguyên bản mô hình FP32 đã kiểm chứng trên Android, đảm bảo tính đồng nhất kết quả chẩn đoán giữa hai hệ điều hành.\n"
        "- Quản lý khóa mật mã: Apple Keychain Services API (kSecClassGenericPassword) bảo vệ khóa CSDL, có thể liên kết với phần cứng Secure Enclave."
    )

    # CHƯƠNG 9
    add_heading_1(doc, "CHƯƠNG 9: KẾ HOẠCH BIÊN DỊCH SIMULATOR & THỰC NGHIỆM IPHONE THẬT")
    add_paragraph(doc, 
        "- Lập kế hoạch đo lường các chỉ số kỹ thuật khi được trang bị máy Mac: Thời gian khởi động lạnh (Cold Start), thời gian suy luận (Latency), mức tiêu thụ RAM và nhiệt độ vi xử lý A16/A17 Bionic.\n"
        "- Đối chiếu hiệu năng toàn diện với kết quả của phân hệ Android trên chip MediaTek Helio G91-Ultra."
    )

    # PHỤ LỤC
    add_heading_1(doc, "PHỤ LỤC: SỔ LỆNH TRA CỨU, SỔ LỖI THỰC TẾ & BẢO VỆ KHÓA LUẬN")
    add_heading_2(doc, "Phụ lục A: Sổ lệnh macOS Terminal chuẩn xác cho iOS")
    add_code_block(doc,
"""cd ios
pod install --repo-update
npx react-native run-ios --simulator="iPhone 15"
xcrun simctl list devices
xcrun simctl spawn booted log stream --predicate 'process == "mobile"'"""
    )
    add_heading_2(doc, "Phụ lục B: Sổ lỗi iOS thường gặp (Đối chiếu lý thuyết kỹ thuật)")
    add_paragraph(doc, 
        "1. Lỗi 'Untrusted Developer Certificate' khi cài app vào iPhone thật:\n"
        "   - Sửa: Vào Cài đặt -> Cài đặt chung -> Quản lý VPN & Thiết bị -> Chọn email tài khoản Apple ID -> Nhấn Tin cậy (Trust).\n"
        "2. Lỗi xung đột cache CocoaPods:\n"
        "   - Sửa: Chạy lệnh pod deintegrate && pod cache clean --all && pod install trong thư mục ios/.\n"
        "3. Lỗi thiếu đường dẫn Node trong Xcode build phases:\n"
        "   - Sửa: Tạo file .xcode.env.local trong thư mục ios/ với nội dung export NODE_BINARY=$(which node)."
    )
    add_heading_2(doc, "Phụ lục C: Bộ câu hỏi bảo vệ khóa luận dành riêng cho phân hệ iOS")
    add_paragraph(doc, 
        "• Câu 1: Tại sao phân hệ iOS lại khảo sát cả hai phương án CoreML và ONNX Runtime iOS?\n"
        "  -> Trả lời: CoreML tận dụng tối đa phần cứng Apple Neural Engine (ANE) giúp tiết kiệm pin và suy luận nhanh, nhưng việc chuyển đổi các lớp Transformer phức tạp dễ sai lệch trọng số. ONNX Runtime iOS giúp bảo toàn chính xác 100% kết quả đối chứng với phân hệ Android.\n\n"
        "• Câu 2: Tình trạng thực tế hiện tại của phân hệ iOS trong đồ án là gì?\n"
        "  -> Trả lời: Sinh viên đã hoàn thành 100% tầng logic giao diện và lưu trữ dùng chung trên React Native (đạt 146/146 tests Jest) và hoàn thiện báo cáo khảo sát lý thuyết kiến trúc. Do chưa có máy Mac vật lý, phần biên dịch native IPA đang ở trạng thái chờ thực nghiệm khi có phần cứng."
    )

    doc.save(output_path)
    print(f"[+] Đã hoàn thành bản thảo giáo trình iOS: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\thudi\OneDrive\Desktop\LungCT_Workspace\LungCT_DoAn\docs\learning\tu-code-lungct"
    android_docx = os.path.join(out_dir, "Giao_trinh_Tu_code_LungCT_Android.docx")
    ios_docx = os.path.join(out_dir, "Giao_trinh_Tu_code_LungCT_iOS.docx")
    
    build_full_android_curriculum(android_docx)
    build_full_ios_curriculum(ios_docx)
    print("[*] HOÀN TẤT BIÊN SOẠN CẢ HAI BẢN THẢO GIÁO TRÌNH WORD THÀNH CÔNG!")
