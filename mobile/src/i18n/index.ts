import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import vi from './vi.json';
import {
  loadStoredLanguagePreference,
  saveStoredLanguagePreference,
} from '../config/settingsStorage';

export const defaultNS = 'translation';
export const resources = {
  vi: { translation: vi },
  en: { translation: en },
} as const;

/**
 * Xác định ngôn ngữ ban đầu dựa trên cài đặt máy điện thoại.
 * Nếu máy dùng tiếng Việt -> 'vi', các trường hợp khác mặc định 'en'.
 */
export const getInitialLanguage = (): 'vi' | 'en' => {
  const locales = Localization.getLocales();
  const primaryTag = locales?.[0]?.languageCode ?? 'vi';
  return primaryTag.toLowerCase().startsWith('vi') ? 'vi' : 'en';
};

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false, // React Native tự xử lý chống XSS
  },
});

// Khôi phục cài đặt ngôn ngữ đã lưu từ AsyncStorage khi app mở lại
loadStoredLanguagePreference().then((saved) => {
  if (saved && saved !== i18n.language) {
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.changeLanguage(saved);
  }
});

// Tự động lưu khi người dùng thay đổi ngôn ngữ
i18n.on('languageChanged', (lng) => {
  if (lng === 'vi' || lng === 'en') {
    saveStoredLanguagePreference(lng);
  }
});

export default i18n;
