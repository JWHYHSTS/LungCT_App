/** Điểm xuất duy nhất của hệ thống giao diện LungCT. */
export { palette } from './palette';
export { lightColors } from './light';
export { darkColors } from './dark';
export { spacing, radius, MIN_TOUCH } from './spacing';
export { typography, FONT_FAMILY } from './typography';
export type { TypographyVariant } from './typography';
export {
  HEATMAP_STOPS,
  HEATMAP_DEFAULT_OPACITY,
  HEATMAP_OPACITY_STEP,
  IMAGE_CANVAS,
} from './heatmap';
export { ThemeProvider, useTheme, buildTheme } from './ThemeProvider';
export type { Theme } from './ThemeProvider';
export type { ColorTokens, ColorSchemeName, ThemePreference } from './types';
