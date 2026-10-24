/**
 * Token màu ngữ nghĩa — chế độ Sáng.
 *
 * Nguồn: Figma LungCT v1, collection "Theme · Light" (cùng tên biến với chế độ còn lại).
 * Độ tương phản được kiểm tra trong `__tests__/theme.test.ts`.
 */
import { palette } from './palette';
import type { ColorTokens } from './types';

export const lightColors: ColorTokens = {
  /** Nền. */
  bg: {
    app: palette.neutral[50],
    surface: palette.neutral[0],
    surfaceAlt: palette.neutral[100],
    sunken: palette.neutral[200],
    brandSubtle: palette.teal[50],
    inverse: palette.neutral[900],
    imageCanvas: palette.neutral[1000],
    scrim: palette.neutral[950],
  },
  /** Chữ. */
  text: {
    primary: palette.neutral[900],
    secondary: palette.neutral[600],
    tertiary: palette.neutral[600],
    onBrand: palette.neutral[0],
    inverse: palette.neutral[50],
    link: palette.teal[700],
    disabled: palette.neutral[400],
  },
  /** Viền. */
  border: {
    default: palette.neutral[200],
    strong: palette.neutral[300],
    focus: palette.teal[700],
    icon: palette.neutral[700],
    control: palette.neutral[500],
  },
  /** Màu thương hiệu (nút chính, liên kết, focus). */
  brand: {
    primary: palette.teal[700],
    primaryPressed: palette.teal[800],
    accent: palette.teal[200],
  },
  /** Trạng thái nghiệp vụ/đồng bộ — luôn đi kèm chữ + icon (BR-UI-01). */
  status: {
    success: {
      bg: palette.sage[100],
      fg: palette.sage[700],
      border: palette.sage[200],
    },
    warning: {
      bg: palette.yellow[100],
      fg: palette.yellow[800],
      border: palette.yellow[300],
    },
    danger: {
      bg: palette.coral[100],
      fg: palette.coral[700],
      border: palette.coral[300],
    },
    info: {
      bg: palette.blue[100],
      fg: palette.blue[600],
      border: palette.blue[200],
    },
    neutral: {
      bg: palette.neutral[100],
      fg: palette.neutral[700],
      border: palette.neutral[300],
    },
    pending: {
      bg: palette.orange[100],
      fg: palette.orange[800],
      border: palette.orange[300],
    },
  },
  /** Nhãn AI 3 lớp Benign/Malignant/Normal — KHÔNG dùng cho heatmap Grad-CAM (BR-AI-05). */
  ai: {
    benign: {
      bg: palette.blue[100],
      fg: palette.blue[800],
    },
    malignant: {
      bg: palette.coral[100],
      fg: palette.coral[700],
    },
    normal: {
      bg: palette.sage[100],
      fg: palette.sage[700],
    },
    barTrack: palette.neutral[200],
  },
};
