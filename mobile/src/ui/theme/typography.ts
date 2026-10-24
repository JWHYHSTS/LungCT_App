import type { TextStyle } from 'react-native';

/**
 * Kiểu chữ — khớp 12 text style trong Figma LungCT v1.
 *
 * Font: Be Vietnam Pro (ĐỀ XUẤT, nạp bằng expo-font). Nếu chưa nạp được font, đặt
 * `FONT_FAMILY` về `undefined` để dùng font hệ thống; bản SVG/plugin v2 dùng Inter.
 * Luôn để `allowFontScaling` mặc định (true) để tôn trọng cỡ chữ hệ thống.
 */
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
  /** Số liệu (điểm, thống kê) — chữ số cùng độ rộng để cột số thẳng hàng. */
  numericM: { ...t(15, 20, 'semibold'), fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
