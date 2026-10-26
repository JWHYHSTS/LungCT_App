import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors } from './dark';
import { lightColors } from './light';
import { radius, spacing } from './spacing';
import { typography } from './typography';
import type { ColorSchemeName, ColorTokens, ThemePreference } from './types';
import { loadStoredThemePreference, saveStoredThemePreference } from '../../config/settingsStorage';

/** Toàn bộ giá trị giao diện mà component đọc qua `useTheme()`. */
export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

interface ThemeContextValue {
  theme: Theme;
  /** Lựa chọn hiện tại trong Cài đặt (SET-02): 'system' | 'light' | 'dark'. */
  preference: ThemePreference;
  /** Đổi lựa chọn và lưu bền vững vào AsyncStorage. */
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tạo theme từ chế độ đã áp dụng. Tách riêng để kiểm thử không cần React. */
export function buildTheme(scheme: ColorSchemeName): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
  };
}

/**
 * Bao quanh toàn app (trong `App.tsx`). Mặc định theo chế độ Sáng/Tối của hệ thống;
 * khôi phục từ AsyncStorage khi khởi động lại và phản hồi thay đổi theme của Android.
 */
export function ThemeProvider({
  children,
  initialPreference = 'system',
}: {
  children: ReactNode;
  initialPreference?: ThemePreference;
}) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);

  // Tải cài đặt đã lưu khi ứng dụng khởi chạy
  useEffect(() => {
    let isMounted = true;
    loadStoredThemePreference().then((saved) => {
      if (isMounted && saved) {
        setPreferenceState(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setPreference = useCallback((nextPref: ThemePreference) => {
    setPreferenceState(nextPref);
    saveStoredThemePreference(nextPref);
  }, []);

  const scheme: ColorSchemeName =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({ theme: buildTheme(scheme), preference, setPreference }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Đọc theme hiện tại. Gọi ngoài `ThemeProvider` sẽ báo lỗi rõ ràng thay vì âm thầm dùng màu sai. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() phải được gọi bên trong <ThemeProvider>.');
  return ctx;
}
