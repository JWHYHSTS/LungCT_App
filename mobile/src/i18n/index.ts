import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import vi from './vi.json';

export const defaultNS = 'translation';
export const resources = {
  vi: { translation: vi },
  en: { translation: en },
} as const;

/**
 * Xác định ngôn ngữ ban đầu dựa trên cài đặt máy điện thoại.
 * Nếu máy dùng tiếng Việt -> 'vi', các trường hợp khác mặc định 'en'.
 */
const getInitialLanguage = (): 'vi' | 'en' => {
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

export default i18n;
