import { contrastRatio } from '../contrast';
import { darkColors } from '../dark';
import { lightColors } from '../light';
import { buildTheme } from '../ThemeProvider';
import type { ColorTokens } from '../types';

/** Liệt kê đường dẫn khóa dạng "bg.app" để so sánh hai theme. */
const paths = (o: object, pre = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' ? paths(v as object, `${pre}${k}.`) : [`${pre}${k}`],
  );

const HEX = /^#[0-9A-F]{6}$/;

describe('theme LungCT', () => {
  it('Sáng và Tối có cùng bộ khóa (48 token)', () => {
    expect(paths(lightColors).sort()).toEqual(paths(darkColors).sort());
    expect(paths(lightColors)).toHaveLength(48);
  });

  it('mọi giá trị là mã hex 6 chữ số', () => {
    for (const c of [lightColors, darkColors])
      for (const p of paths(c)) {
        const v = p.split('.').reduce<any>((o, k) => o[k], c);
        expect(v).toMatch(HEX);
      }
  });

  const pairs = (c: ColorTokens): [string, string, string, number][] => [
    ['chữ chính / nền app', c.text.primary, c.bg.app, 4.5],
    ['chữ chính / bề mặt', c.text.primary, c.bg.surface, 4.5],
    ['chữ phụ / nền app', c.text.secondary, c.bg.app, 4.5],
    ['chữ phụ / bề mặt', c.text.secondary, c.bg.surface, 4.5],
    ['liên kết / bề mặt', c.text.link, c.bg.surface, 4.5],
    ['chữ trên nút chính', c.text.onBrand, c.brand.primary, 4.5],
    ['badge thành công', c.status.success.fg, c.status.success.bg, 4.5],
    ['badge cảnh báo', c.status.warning.fg, c.status.warning.bg, 4.5],
    ['badge lỗi', c.status.danger.fg, c.status.danger.bg, 4.5],
    ['badge thông tin', c.status.info.fg, c.status.info.bg, 4.5],
    ['badge chờ', c.status.pending.fg, c.status.pending.bg, 4.5],
    ['nhãn Lành tính', c.ai.benign.fg, c.ai.benign.bg, 4.5],
    ['nhãn Ác tính', c.ai.malignant.fg, c.ai.malignant.bg, 4.5],
    ['nhãn Bình thường', c.ai.normal.fg, c.ai.normal.bg, 4.5],
    ['viền ô nhập / bề mặt (không phải chữ)', c.border.control, c.bg.surface, 3],
  ];

  for (const [name, colors] of [
    ['Sáng', lightColors],
    ['Tối', darkColors],
  ] as const) {
    for (const [label, fg, bg, min] of pairs(colors)) {
      it(`${name}: ${label} ≥ ${min}:1`, () => {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it('buildTheme tạo đúng scheme và bảng màu tương ứng', () => {
    const lightTheme = buildTheme('light');
    expect(lightTheme.scheme).toBe('light');
    expect(lightTheme.colors).toEqual(lightColors);

    const darkTheme = buildTheme('dark');
    expect(darkTheme.scheme).toBe('dark');
    expect(darkTheme.colors).toEqual(darkColors);
  });
});
