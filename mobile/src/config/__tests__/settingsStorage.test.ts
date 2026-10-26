import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStoredThemePreference,
  saveStoredThemePreference,
  loadStoredLanguagePreference,
  saveStoredLanguagePreference,
  VALID_THEME_PREFERENCES,
  VALID_LANGUAGES,
} from '../settingsStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('settingsStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Theme Storage', () => {
    it('trả về giá trị hợp lệ đã lưu (system, light, dark)', async () => {
      for (const pref of VALID_THEME_PREFERENCES) {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(pref);
        const result = await loadStoredThemePreference();
        expect(result).toBe(pref);
      }
    });

    it('fallback về "system" khi chưa có dữ liệu lưu', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await loadStoredThemePreference();
      expect(result).toBe('system');
    });

    it('fallback về "system" khi dữ liệu lưu không hợp lệ', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid_theme_xyz');
      const result = await loadStoredThemePreference();
      expect(result).toBe('system');
    });

    it('fallback về "system" khi AsyncStorage ném lỗi ngoại lệ', async () => {
      const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage I/O Error'));

      const result = await loadStoredThemePreference();
      expect(result).toBe('system');
      expect(spyWarn).toHaveBeenCalled();
      spyWarn.mockRestore();
    });

    it('lưu đúng giá trị hợp lệ vào AsyncStorage', async () => {
      await saveStoredThemePreference('dark');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@lungct/theme_preference', 'dark');

      await saveStoredThemePreference('light');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@lungct/theme_preference', 'light');

      await saveStoredThemePreference('system');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@lungct/theme_preference', 'system');
    });

    it('bỏ qua giá trị không hợp lệ khi gọi saveStoredThemePreference', async () => {
      await saveStoredThemePreference('super_dark' as any);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('xử lý lỗi khi lưu thất bại mà không crash app', async () => {
      const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));

      await expect(saveStoredThemePreference('dark')).resolves.not.toThrow();
      expect(spyWarn).toHaveBeenCalled();
      spyWarn.mockRestore();
    });
  });

  describe('Language Storage', () => {
    it('trả về ngôn ngữ hợp lệ đã lưu ("vi", "en")', async () => {
      for (const lang of VALID_LANGUAGES) {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(lang);
        const result = await loadStoredLanguagePreference();
        expect(result).toBe(lang);
      }
    });

    it('fallback về null khi chưa có dữ liệu lưu (để dùng theo máy)', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await loadStoredLanguagePreference();
      expect(result).toBeNull();
    });

    it('fallback về null khi dữ liệu lưu không hợp lệ', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fr_FR');
      const result = await loadStoredLanguagePreference();
      expect(result).toBeNull();
    });

    it('fallback về null khi AsyncStorage ném lỗi ngoại lệ', async () => {
      const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage read error'));

      const result = await loadStoredLanguagePreference();
      expect(result).toBeNull();
      expect(spyWarn).toHaveBeenCalled();
      spyWarn.mockRestore();
    });

    it('lưu đúng ngôn ngữ vào AsyncStorage', async () => {
      await saveStoredLanguagePreference('en');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@lungct/language_preference', 'en');

      await saveStoredLanguagePreference('vi');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@lungct/language_preference', 'vi');
    });

    it('bỏ qua ngôn ngữ không hỗ trợ', async () => {
      await saveStoredLanguagePreference('ja' as any);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('xử lý lỗi khi lưu ngôn ngữ thất bại mà không crash app', async () => {
      const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Write lock error'));

      await expect(saveStoredLanguagePreference('vi')).resolves.not.toThrow();
      expect(spyWarn).toHaveBeenCalled();
      spyWarn.mockRestore();
    });
  });
});
