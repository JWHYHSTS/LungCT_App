/**
 * Token màu ngữ nghĩa — chế độ Tối.
 *
 * Nguồn: Figma LungCT v1, collection "Theme · Dark" (cùng tên biến với chế độ còn lại).
 * Độ tương phản được kiểm tra trong `__tests__/theme.test.ts`.
 */
import { palette } from './palette';
import type { ColorTokens } from './types';

export const darkColors: ColorTokens = {
  /** Nền. */
  bg: {
    app: palette.neutral[950],
    surface: palette.neutral[900],
    surfaceAlt: palette.neutral[850],
    sunken: palette.neutral[800],
    brandSubtle: palette.teal[900],
    inverse: palette.neutral[100],
    imageCanvas: palette.neutral[1000],
    scrim: palette.neutral[1000],
  },
  /** Chữ. */
  text: {
    primary: palette.neutral[100],
    secondary: palette.neutral[300],
    tertiary: palette.neutral[400],
    onBrand: palette.neutral[950],
    inverse: palette.neutral[900],
    link: palette.teal[300],
    disabled: palette.neutral[600],
  },
  /** Viền. */
  border: {
    default: palette.neutral[800],
    strong: palette.neutral[700],
    focus: palette.teal[300],
    icon: palette.neutral[300],
    control: palette.neutral[500],
  },
  /** Màu thương hiệu (nút chính, liên kết, focus). */
  brand: {
    primary: palette.teal[300],
    primaryPressed: palette.teal[200],
    accent: palette.teal[800],
  },
  /** Trạng thái nghiệp vụ/đồng bộ — luôn đi kèm chữ + icon (BR-UI-01). */
  status: {
    success: {
      bg: palette.sage[900],
      fg: palette.sage[200],
      border: palette.sage[700],
    },
    warning: {
      bg: palette.yellow[900],
      fg: palette.yellow[200],
      border: palette.yellow[800],
    },
    danger: {
      bg: palette.coral[900],
      fg: palette.coral[300],
      border: palette.coral[700],
    },
    info: {
      bg: palette.blue[900],
      fg: palette.blue[200],
      border: palette.blue[600],
    },
    neutral: {
      bg: palette.neutral[850],
      fg: palette.neutral[200],
      border: palette.neutral[700],
    },
    pending: {
      bg: palette.orange[900],
      fg: palette.orange[300],
      border: palette.orange[800],
    },
  },
  /** Nhãn AI 3 lớp Benign/Malignant/Normal — KHÔNG dùng cho heatmap Grad-CAM (BR-AI-05). */
  ai: {
    benign: {
      bg: palette.blue[900],
      fg: palette.blue[200],
    },
    malignant: {
      bg: palette.coral[900],
      fg: palette.coral[300],
    },
    normal: {
      bg: palette.sage[900],
      fg: palette.sage[200],
    },
    barTrack: palette.neutral[800],
  },
};
