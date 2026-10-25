import en from '../en.json';
import vi from '../vi.json';
import i18n from '../index';

describe('Hệ thống Đa ngôn ngữ i18n (UI-02)', () => {
  /** Hàm trích xuất toàn bộ khóa lồng nhau (flatten dot keys) */
  function getFlattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        keys = keys.concat(getFlattenKeys(val as Record<string, unknown>, fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  const viKeys = getFlattenKeys(vi).sort();
  const enKeys = getFlattenKeys(en).sort();

  test('vi.json và en.json phải có cùng bộ khóa', () => {
    expect(viKeys).toEqual(enKeys);
  });

  test('các thông điệp y tế cốt lõi (MSG) phải tồn tại đầy đủ', () => {
    expect(vi.msg).toBeDefined();
    expect(en.msg).toBeDefined();
    expect(vi.msg.msg_01).toBeDefined();
    expect(vi.msg.msg_02).toBeDefined();
    expect(en.msg.msg_01).toBeDefined();
    expect(en.msg.msg_02).toBeDefined();
  });

  test("t('msg.msg_02') tiếng Anh phải chính xác theo yêu cầu thiết kế", async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('msg.msg_02')).toBe(
      'Scores are model outputs and are not calibrated disease probabilities.',
    );
  });

  test("t('msg.msg_01') tiếng Việt phải hiển thị chính xác theo vi.json", async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.t('msg.msg_01')).toBe(
      'Kết quả AI chỉ hỗ trợ tham khảo, không thay thế kết luận của bác sĩ.',
    );
  });
});
