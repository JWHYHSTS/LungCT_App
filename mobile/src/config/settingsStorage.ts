import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '../ui/theme/types';

const STORAGE_KEY_THEME = '@lungct/theme_preference';
const STORAGE_KEY_LANG = '@lungct/language_preference';

export const VALID_THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];
export const VALID_LANGUAGES: ('vi' | 'en')[] = ['vi', 'en'];

/**
 * Tải cài đặt theme đã lưu từ AsyncStorage.
 * Nếu không tồn tại hoặc dữ liệu lưu không hợp lệ, trả về mặc định 'system'.
 */
export async function loadStoredThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_THEME);
    if (raw && (VALID_THEME_PREFERENCES as string[]).includes(raw)) {
      return raw as ThemePreference;
    }
  } catch (err) {
    // Không ném lỗi ra UI, sử dụng giá trị mặc định an toàn
    console.warn('[Storage] Lỗi khi đọc theme_preference, dùng mặc định system:', err);
  }
  return 'system';
}

/**
 * Lưu cài đặt theme vào AsyncStorage.
 */
export async function saveStoredThemePreference(pref: ThemePreference): Promise<void> {
  try {
    if ((VALID_THEME_PREFERENCES as string[]).includes(pref)) {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, pref);
    }
  } catch (err) {
    console.warn('[Storage] Lỗi khi lưu theme_preference:', err);
  }
}

/**
 * Tải cài đặt ngôn ngữ đã lưu từ AsyncStorage.
 * Nếu không tồn tại hoặc không hợp lệ, trả về null (để dùng theo máy).
 */
export async function loadStoredLanguagePreference(): Promise<'vi' | 'en' | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LANG);
    if (raw && (VALID_LANGUAGES as string[]).includes(raw)) {
      return raw as 'vi' | 'en';
    }
  } catch (err) {
    console.warn('[Storage] Lỗi khi đọc language_preference:', err);
  }
  return null;
}

/**
 * Lưu cài đặt ngôn ngữ vào AsyncStorage.
 */
export async function saveStoredLanguagePreference(lang: 'vi' | 'en'): Promise<void> {
  try {
    if ((VALID_LANGUAGES as string[]).includes(lang)) {
      await AsyncStorage.setItem(STORAGE_KEY_LANG, lang);
    }
  } catch (err) {
    console.warn('[Storage] Lỗi khi lưu language_preference:', err);
  }
}
