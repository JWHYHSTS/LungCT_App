/**
 * Khoảng cách (padding, gap) và bo góc — khớp collection "Dimension" trong Figma LungCT v1.
 * Lề màn hình chuẩn = `spacing.lg` (16); khoảng giữa các khối = `spacing.md`–`spacing.lg`.
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

/** Bo góc. `full` dùng cho chip, badge, toggle. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Kích thước vùng chạm tối thiểu (NFR khả năng tiếp cận): 44×44 kể cả khi icon nhỏ hơn. */
export const MIN_TOUCH = 44;
