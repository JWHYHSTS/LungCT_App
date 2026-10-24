/**
 * Bảng màu gốc (primitives) của LungCT.
 *
 * Nguồn: design system Figma LungCT v1, collection "Primitives" — rút từ bộ icon LungCT-Icons
 * (nét #4D5048, tô pastel teal/blue/sage/yellow/orange/coral).
 *
 * Quy tắc: màn hình KHÔNG dùng trực tiếp các giá trị này; luôn đi qua token ngữ nghĩa
 * trong `light.ts` / `dark.ts` để đổi Sáng/Tối không phải sửa component.
 */
export const palette = {
  neutral: {
    0: '#FFFFFF',
    25: '#FFFDF7',
    50: '#FAF8F2',
    100: '#F2EFE7',
    200: '#E4E0D6',
    300: '#CFCAC0',
    400: '#ADA99F',
    500: '#8A8D84',
    600: '#6B6E66',
    700: '#4D5048',
    800: '#34362F',
    850: '#2C2E28',
    900: '#22231F',
    950: '#171814',
    1000: '#111210',
  },
  teal: {
    50: '#EEF7F5',
    100: '#D6EDE8',
    200: '#A9D5CD',
    300: '#7FC4B8',
    500: '#4E9A8E',
    700: '#2F6F67',
    800: '#245650',
    900: '#1B3F3B',
  },
  blue: {
    100: '#E3EEF5',
    200: '#ADCBDD',
    300: '#8DB6CF',
    600: '#3E6E8E',
    800: '#2A4B61',
    900: '#1E3646',
  },
  sage: {
    100: '#EAF2E3',
    200: '#B8CFA7',
    300: '#9FBF8B',
    700: '#4E6E3A',
    900: '#2B3D20',
  },
  yellow: {
    100: '#FCF5DC',
    200: '#F8E6AA',
    300: '#EBD27E',
    800: '#7A5B12',
    900: '#4A3A10',
  },
  orange: {
    100: '#FBEADB',
    300: '#EFB47A',
    800: '#8A4A17',
    900: '#4F2E12',
  },
  coral: {
    100: '#F8E3E0',
    300: '#E8A49A',
    400: '#E08A7E',
    700: '#A8443A',
    900: '#4F2420',
  },
} as const;

/** Tên một nhóm màu gốc, vd. `teal`. */
export type PaletteGroup = keyof typeof palette;
