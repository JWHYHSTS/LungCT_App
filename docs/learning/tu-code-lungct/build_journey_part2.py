# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN MỐC 2: XÂY DỰNG DESIGN SYSTEM & THEMEPROVIDER HOÀN CHỈNH
(spacing.ts -> typography.ts -> palette.ts -> light.ts / dark.ts -> types.ts -> ThemeProvider.tsx -> Nối vào App.tsx)
"""

from build_large_curriculum import add_full_step

def append_journey_milestones_part2(doc):
    # BƯỚC 5: spacing.ts
    add_full_step(
        doc, step_num=5,
        title="Tự Viết Mã Hằng Số Khoảng Cách & Bo Góc (src/ui/theme/spacing.ts)",
        purpose="Khai báo tập trung các giá trị khoảng cách đệm (padding, margin, gap) và bán kính bo góc chuẩn theo Figma LungCT v1.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="""# 1. Tạo cây thư mục theme
mkdir -p src/ui/theme

# 2. Tạo tệp spacing.ts
New-Item -ItemType File -Force -Path src/ui/theme/spacing.ts""",
        code_file_path="src/ui/theme/spacing.ts",
        full_code="""// src/ui/theme/spacing.ts

/**
 * Khoảng cách (padding, margin, gap) chuẩn hóa theo Figma LungCT v1.
 * Đơn vị tính bằng điểm ảnh độc lập (dp).
 */
export const spacing = {
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

/**
 * Bán kính bo góc (border radius).
 * 'full: 999' dùng để tạo hình tròn hoặc chip thuốc con nhộng.
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Vùng chạm tối thiểu chuẩn tiếp cận y tế WCAG: 44x44 dp */
export const MIN_TOUCH = 44;""",
        line_by_line_explanation=[
            ["export const spacing = { ... } as const;", "as const là const assertions của TypeScript cấp compile-time, khóa chặt các giá trị số nguyên không cho phép sửa đổi."],
            ["lg: 16,", "Khoảng cách lề chuẩn 16dp áp dụng cho viền màn hình (Screen horizontal padding)."],
            ["md: 12,", "Bo góc chuẩn 12dp dùng cho nút bấm và các thẻ hồ sơ bệnh nhân."],
            ["export const MIN_TOUCH = 44;", "Quy chuẩn y tế: Vùng chạm tối thiểu 44dp bảo đảm ngón tay bác sĩ không bấm trượt khi đang đeo găng tay."]
        ],
        comment_guide="Giải thích rõ ràng: as const là cơ chế kiểm soát kiểu của trình biên dịch TypeScript lúc gõ code, không phải Object.freeze() chạy ở runtime.",
        wiring_guide="Tệp này sẽ được nạp vào ThemeProvider và các UI component ở các bước sau.",
        run_and_verify="Lưu file. Trình soạn thảo VS Code không báo gạch đỏ.",
        troubleshooting="Nếu báo lỗi cú pháp 'as const': Đảm bảo TypeScript phiên bản >= 3.4 (package.json đang dùng ~6.0).",
        checklist="[ ] Tệp được lưu tại src/ui/theme/spacing.ts\n[ ] Có xuất đủ spacing, radius và MIN_TOUCH"
    )

    # BƯỚC 6: typography.ts
    add_full_step(
        doc, step_num=6,
        title="Tự Viết Mã Định Nghĩa Kiểu Chữ Y Tế (src/ui/theme/typography.ts)",
        purpose="Xây dựng bảng định kiểu 12 biến thể chữ chuẩn y tế, áp dụng font Be Vietnam Pro và chiều cao dòng (lineHeight) chống tràn chữ.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/theme/typography.ts",
        code_file_path="src/ui/theme/typography.ts",
        full_code="""// src/ui/theme/typography.ts
import type { TextStyle } from 'react-native';

const FONT_REGULAR = 'BeVietnamPro-Regular';
const FONT_MEDIUM = 'BeVietnamPro-Medium';
const FONT_SEMIBOLD = 'BeVietnamPro-SemiBold';

export const typography: Record<string, TextStyle> = {
  titleL: { fontFamily: FONT_SEMIBOLD, fontSize: 24, lineHeight: 32 },
  titleM: { fontFamily: FONT_SEMIBOLD, fontSize: 18, lineHeight: 24 },
  titleS: { fontFamily: FONT_SEMIBOLD, fontSize: 16, lineHeight: 22 },
  bodyL: { fontFamily: FONT_REGULAR, fontSize: 16, lineHeight: 24 },
  bodyM: { fontFamily: FONT_REGULAR, fontSize: 14, lineHeight: 20 },
  bodyS: { fontFamily: FONT_REGULAR, fontSize: 12, lineHeight: 16 },
  labelL: { fontFamily: FONT_MEDIUM, fontSize: 16, lineHeight: 20 },
  labelM: { fontFamily: FONT_MEDIUM, fontSize: 14, lineHeight: 18 },
  labelS: { fontFamily: FONT_MEDIUM, fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: FONT_REGULAR, fontSize: 11, lineHeight: 14 },
};""",
        line_by_line_explanation=[
            ["import type { TextStyle } from 'react-native';", "Chỉ import kiểu dữ liệu TextStyle của React Native (từ khóa 'type') giúp tệp JavaScript sinh ra nhẹ hơn."],
            ["titleL: { fontFamily: FONT_SEMIBOLD, fontSize: 24, lineHeight: 32 }", "Kiểu chữ tiêu đề lớn: Cỡ chữ 24dp, độ giãn dòng 32dp bảo đảm chữ không bị đè lên nhau."],
            ["labelL: { fontFamily: FONT_MEDIUM ... }", "Kiểu chữ dùng cho nhãn nút bấm Button (nét chữ trung bình 500 nổi bật)."]
        ],
        comment_guide="Giải thích lý do quy định lineHeight: Trong tiếng Việt, các ký tự có dấu mũ (như Ê, Ế, Ể) rất dễ bị cắt mất dấu nếu lineHeight quá sát cỡ chữ.",
        wiring_guide="Sẽ được ThemeProvider đóng gói thành thuộc tính theme.typography cung cấp cho component AppText.",
        run_and_verify="Lưu file. Biên dịch 'npx tsc --noEmit' thành công.",
        troubleshooting="Nếu chữ bị biến dạng trên máy ảo: Đảm bảo tên fontFamily khớp chính xác 100% với tên đã nạp trong App.tsx.",
        checklist="[ ] typography.ts được tạo tại src/ui/theme/\n[ ] Khai báo đủ 10 kiểu chữ chuẩn Figma"
    )

    # BƯỚC 7: palette.ts & types.ts
    add_full_step(
        doc, step_num=7,
        title="Tạo Bảng Màu Primitives & Kiểu Dữ Liệu Theme (palette.ts & types.ts)",
        purpose="Xây dựng bảng màu gốc trích xuất từ Figma và định nghĩa interface ColorTokens cho chế độ Sáng / Tối.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="""New-Item -ItemType File -Force -Path src/ui/theme/palette.ts
New-Item -ItemType File -Force -Path src/ui/theme/types.ts""",
        code_file_path="src/ui/theme/palette.ts & types.ts",
        full_code="""// src/ui/theme/palette.ts
export const palette = {
  neutral: { 0: '#FFFFFF', 50: '#FAF8F2', 700: '#4D5048', 900: '#22231F' },
  teal: { 50: '#EEF7F5', 500: '#4E9A8E', 700: '#2F6F67', 900: '#1B3F3B' },
  status: {
    success: { bg: '#EAF2E3', fg: '#4E6E3A', border: '#B8CFA7' },
    danger: { bg: '#FDEEE9', fg: '#C25438', border: '#F4BAAC' },
    warning: { bg: '#FCF5DC', fg: '#7A5B12', border: '#F8E6AA' },
  },
};

// src/ui/theme/types.ts
export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface ColorTokens {
  bg: { app: string; surface: string; sunken: string };
  text: { primary: string; secondary: string; onBrand: string; disabled: string };
  border: { default: string; focus: string };
  brand: { primary: string; primaryPressed: string };
  status: {
    success: { bg: string; fg: string; border: string };
    danger: { bg: string; fg: string; border: string };
    warning: { bg: string; fg: string; border: string };
  };
}""",
        line_by_line_explanation=[
            ["teal.700: '#2F6F67'", "Màu xanh mòng két thương hiệu y tế chính của LungCT (Primary Brand Color)."],
            ["neutral.50: '#FAF8F2'", "Màu nền ứng dụng (Background App) ấm dịu mắt, tránh gây mỏi mắt cho bác sĩ trực ca đêm."],
            ["export interface ColorTokens", "Hợp đồng kiểu dữ liệu bắt buộc: Cả theme Sáng và theme Tối đều phải cung cấp đầy đủ các khóa này."]
        ],
        comment_guide="Giải thích lý do phân tách primitives (palette) và semantic tokens: Giúp lập trình viên gọi màu theo ngữ nghĩa (bg.app) thay vì gọi mã hex trực tiếp.",
        wiring_guide="Hai tệp này là nền móng để viết lightColors, darkColors và ThemeProvider.",
        run_and_verify="Lưu cả 2 tệp. Chạy 'npx tsc --noEmit' không báo lỗi.",
        troubleshooting="Nếu báo lỗi thiếu export: Kiểm tra lại xem đã ghi từ khóa 'export' trước interface ColorTokens chưa.",
        checklist="[ ] Đã tạo xong cả palette.ts và types.ts\n[ ] Khai báo đúng màu chuẩn Figma LungCT"
    )

    # BƯỚC 8: ThemeProvider.tsx hoàn chỉnh
    add_full_step(
        doc, step_num=8,
        title="Xây dựng Ngữ Cảnh Giao Diện Hoàn Chỉnh (src/ui/theme/ThemeProvider.tsx)",
        purpose="Cung cấp React Context để toàn bộ ứng dụng đọc được theme qua hook useTheme(), tự động phản hồi chế độ Sáng / Tối của hệ điều hành.",
        terminal_location="PowerShell tại C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/theme/ThemeProvider.tsx",
        code_file_path="src/ui/theme/ThemeProvider.tsx",
        full_code="""// src/ui/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { spacing, radius } from './spacing';
import { typography } from './typography';
import { palette } from './palette';
import type { ColorSchemeName, ColorTokens, ThemePreference } from './types';

export const lightColors: ColorTokens = {
  bg: { app: palette.neutral[50], surface: '#FFFFFF', sunken: '#F2EFE7' },
  text: { primary: palette.neutral[900], secondary: palette.neutral[700], onBrand: '#FFFFFF', disabled: '#ADA99F' },
  border: { default: '#E4E0D6', focus: palette.teal[700] },
  brand: { primary: palette.teal[700], primaryPressed: palette.teal[900] },
  status: palette.status,
};

export const darkColors: ColorTokens = {
  bg: { app: '#171814', surface: '#22231F', sunken: '#2C2E28' },
  text: { primary: '#FFFDF7', secondary: '#ADA99F', onBrand: '#FFFFFF', disabled: '#6B6E66' },
  border: { default: '#34362F', focus: palette.teal[500] },
  brand: { primary: palette.teal[500], primaryPressed: palette.teal[700] },
  status: palette.status,
};

export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const scheme: ColorSchemeName =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const theme: Theme = useMemo(
    () => ({
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      spacing,
      radius,
      typography,
    }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải được bọc bên trong ThemeProvider');
  return ctx;
}""",
        line_by_line_explanation=[
            ["const system = useColorScheme();", "Hook của React Native tự động phát hiện xem người dùng đang bật Dark Mode hay Light Mode trên điện thoại Android/iOS."],
            ["scheme === 'dark' ? darkColors : lightColors", "Tự động tráo đổi bộ bảng màu ngữ nghĩa tức thì mà không cần khởi động lại ứng dụng."],
            ["export function useTheme()", "Custom Hook tiện ích: Bất kỳ component nào chỉ cần gọi const { theme } = useTheme() là lấy được toàn bộ bảng màu và kích thước."]
        ],
        comment_guide="Giải thích lý do bắt buộc bọc ThemeProvider trước khi dùng Button hay AppText: Giúp các component con không bao giờ bị lỗi 'cannot read properties of null'.",
        wiring_guide="Tạo thêm tệp src/ui/theme/index.ts với dòng: export * from './ThemeProvider'; export * from './spacing'; export * from './typography';",
        run_and_verify="Lưu file. Chạy 'npx tsc --noEmit' kiểm tra kiểu dữ liệu thành công 100%.",
        troubleshooting="Nếu báo 'useTheme phải được bọc bên trong ThemeProvider': Đảm bảo tệp App.tsx đã đặt thẻ <ThemeProvider> ở cấp cao nhất bao bọc toàn bộ giao diện.",
        checklist="[ ] ThemeProvider.tsx được tạo thành công\n[ ] Có hỗ trợ cả lightColors và darkColors\n[ ] Đã export hook useTheme()"
    )

    # BƯỚC 9: Cập nhật App.tsx chạy thử ThemeProvider
    add_full_step(
        doc, step_num=9,
        title="Nối ThemeProvider Vào App.tsx Và Kiểm Tra Ứng Dụng Đổi Màu Tự Động",
        purpose="Thay thế mã tạm thời trong App.tsx bằng cấu trúc bọc ThemeProvider chính thức, kiểm tra xem giao diện có tự động đổi màu theo chế độ hệ điều hành hay không.",
        terminal_location="Mở file App.tsx tại gốc dự án C:\\Practice_LungCT\\mobile.",
        shell_action="# Sửa đổi trực tiếp tệp App.tsx",
        code_file_path="App.tsx (Nâng cấp lần 1)",
        full_code="""// App.tsx (Nâng cấp lần 1)
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/ui/theme/ThemeProvider';

function MainScreenContent() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.app }]}>
      <Text style={[theme.typography.titleM, { color: theme.colors.brand.primary }]}>
        LungCT - Theme Engine Sẵn Sàng
      </Text>
      <Text style={[theme.typography.bodyM, { color: theme.colors.text.secondary, marginTop: 8 }]}>
        Chế độ hiện tại: {theme.scheme.toUpperCase()}
      </Text>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainScreenContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});""",
        line_by_line_explanation=[
            ["<ThemeProvider><MainScreenContent /></ThemeProvider>", "Cấu trúc lồng chuẩn: Tách component con ra ngoài để gọi hook useTheme() một cách hợp lệ."],
            ["backgroundColor: theme.colors.bg.app", "Nền màn hình tự động đổi: Màu kem nhạt (#FAF8F2) khi ở chế độ Sáng và màu xám đen than (#171814) khi ở chế độ Tối."],
            ["StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'}", "Tự động đổi màu chữ trên thanh đồng hồ pin của điện thoại (chữ trắng khi nền tối, chữ đen khi nền sáng)."]
        ],
        comment_guide="Giải thích quy trình thay đổi: Thay thế đoạn Text mặc định của Expo bằng component có liên kết trực tiếp với Theme Engine vừa tạo.",
        wiring_guide="Lưu file App.tsx. Metro Bundler ở cửa sổ PowerShell 1 sẽ tự động nạp lại giao diện trong vòng 500 mili-giây.",
        run_and_verify="Mở máy ảo LumaCT_Phone: Màn hình đổi sang màu kem ấm áp dịu mắt với dòng chữ xanh thương hiệu 'LungCT - Theme Engine Sẵn Sàng'!",
        troubleshooting="Nếu màn hình bị trắng bệch: Kiểm tra cửa sổ Metro Bundler xem có thông báo lỗi cú pháp nào không.",
        checklist="[ ] App.tsx đã được bọc trong ThemeProvider\n[ ] Màn hình máy ảo hiển thị đúng màu theme\n[ ] Thanh trạng thái StatusBar tự đổi màu"
    )

print("[*] Module append_journey_milestones_part2 ready.")
