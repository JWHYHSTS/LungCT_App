/**
 * Kiểu dữ liệu token màu ngữ nghĩa dùng chung cho chế độ Sáng và Tối.
 *
 * Hai theme PHẢI có cùng bộ khóa (kiểm tra trong `__tests__/theme.test.ts`).
 * Tên khóa khớp tên biến Figma: `color/bg/brand-subtle` → `colors.bg.brandSubtle`.
 */
export interface ColorTokens {
  bg: {
    app: string;
    surface: string;
    surfaceAlt: string;
    sunken: string;
    brandSubtle: string;
    inverse: string;
    imageCanvas: string;
    scrim: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onBrand: string;
    inverse: string;
    link: string;
    disabled: string;
  };
  border: {
    default: string;
    strong: string;
    focus: string;
    icon: string;
    control: string;
  };
  brand: {
    primary: string;
    primaryPressed: string;
    accent: string;
  };
  status: {
    success: {
      bg: string;
      fg: string;
      border: string;
    };
    warning: {
      bg: string;
      fg: string;
      border: string;
    };
    danger: {
      bg: string;
      fg: string;
      border: string;
    };
    info: {
      bg: string;
      fg: string;
      border: string;
    };
    neutral: {
      bg: string;
      fg: string;
      border: string;
    };
    pending: {
      bg: string;
      fg: string;
      border: string;
    };
  };
  ai: {
    benign: {
      bg: string;
      fg: string;
    };
    malignant: {
      bg: string;
      fg: string;
    };
    normal: {
      bg: string;
      fg: string;
    };
    barTrack: string;
  };
}

/** Chế độ hiển thị đã áp dụng. */
export type ColorSchemeName = 'light' | 'dark';

/** Lựa chọn của người dùng trong Cài đặt (SET-02): theo hệ thống hoặc cố định. */
export type ThemePreference = 'system' | ColorSchemeName;
