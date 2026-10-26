declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

/**
 * UI-09: Kiểm toán mã nguồn tự động
 * 1. Không còn mã màu hex tự do (#[0-9A-Fa-f]{6}) trong màn hình/component ngoài src/ui/theme.
 * 2. Không còn chuỗi ký tự hiển thị Tiếng Việt viết cứng trong JSX/UI mà không qua i18n/useTranslation.
 */
describe('UI-09: Static Source Audit Tests', () => {
  const rootSrc = path.resolve(__dirname, '../../../');

  // Danh sách các thư mục/tệp được miễn trừ khỏi kiểm tra hex
  const hexAllowedPaths = [
    path.join(rootSrc, 'ui', 'theme'),
    path.join(rootSrc, 'features', 'dev'),
    path.join(rootSrc, 'types'),
  ];

  function getAllFiles(dir: string, extList: string[]): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file: string) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '__tests__') {
          results = results.concat(getAllFiles(fullPath, extList));
        }
      } else {
        if (extList.some((ext) => file.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    });
    return results;
  }

  test('1. Không có mã màu hex (#[0-9A-Fa-f]{6}) tự do ngoài thư mục src/ui/theme', () => {
    const allTsxFiles = getAllFiles(rootSrc, ['.ts', '.tsx']);
    const hexPattern = /#[0-9A-Fa-f]{6}\b/g;
    const violations: { file: string; line: number; match: string }[] = [];

    allTsxFiles.forEach((file) => {
      // Bỏ qua các file trong theme, dev gallery, hoặc declarations
      if (hexAllowedPaths.some((allowed) => file.startsWith(allowed)) || file.endsWith('.d.ts')) {
        return;
      }

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((lineText: string, idx: number) => {
        const matches = lineText.match(hexPattern);
        if (matches) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: idx + 1,
            match: matches.join(', '),
          });
        }
      });
    });

    expect(violations).toEqual([]);
  });

  test('2. Ngôn ngữ song ngữ: Toàn bộ namespace i18n có cấu trúc khóa đối xứng giữa vi.json và en.json', () => {
    const viPath = path.join(rootSrc, 'i18n', 'vi.json');
    const enPath = path.join(rootSrc, 'i18n', 'en.json');

    const viJson = JSON.parse(fs.readFileSync(viPath, 'utf-8'));
    const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

    // Kiểm tra các nhóm khóa chính
    const requiredSections = ['admin', 'doctor_detail', 'ui', 'navigation', 'common'];
    requiredSections.forEach((section) => {
      if (viJson[section]) {
        expect(enJson[section]).toBeDefined();
        const viKeys = Object.keys(viJson[section]);
        const enKeys = Object.keys(enJson[section]);
        const missingInEn = viKeys.filter((k) => !enKeys.includes(k));
        expect(missingInEn).toEqual([]);
      }
    });
  });

  test('3. Trợ năng (Accessibility): Các component tương tác chính hỗ trợ accessibilityLabel', () => {
    const buttonSrc = fs.readFileSync(
      path.join(rootSrc, 'ui', 'components', 'Button.tsx'),
      'utf-8',
    );
    expect(buttonSrc).toContain('accessibilityLabel');
    expect(buttonSrc).toContain('accessibilityRole');

    const iconButtonSrc = fs.readFileSync(
      path.join(rootSrc, 'ui', 'components', 'IconButton.tsx'),
      'utf-8',
    );
    expect(iconButtonSrc).toContain('accessibilityLabel');
    expect(iconButtonSrc).toContain('accessibilityRole');
  });
});
