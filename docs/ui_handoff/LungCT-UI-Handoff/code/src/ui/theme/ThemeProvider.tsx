import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors } from './dark';
import { lightColors } from './light';
import { radius, spacing } from './spacing';
import { typography } from './typography';
import type { ColorSchemeName, ColorTokens, ThemePreference } from './types';

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
  /** Lựa chọn hiện tại trong Cài đặt (SET-02). */
  preference: ThemePreference;
  /** Đổi lựa chọn. Việc lưu bền vững (SQLite/secure storage) do tầng dữ liệu đảm nhận. */
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tạo theme từ chế độ đã áp dụng. Tách riêng để kiểm thử không cần React. */
export function buildTheme(scheme: ColorSchemeName): Theme {
  return { scheme, colors: scheme === 'dark' ? darkColors : lightColors, spacing, radius, typography };
}

/**
 * Bao quanh toàn app (trong `App.tsx`). Mặc định theo chế độ Sáng/Tối của hệ thống;
 * khi người dùng chọn cố định trong Cài đặt thì dùng lựa chọn đó.
 */
export function ThemeProvider({ children, initialPreference = 'system' }: { children: ReactNode; initialPreference?: ThemePreference }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const scheme: ColorSchemeName = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ theme: buildTheme(scheme), preference, setPreference }), [scheme, preference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Đọc theme hiện tại. Gọi ngoài `ThemeProvider` sẽ báo lỗi rõ ràng thay vì âm thầm dùng màu sai. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() phải được gọi bên trong <ThemeProvider>.');
  return ctx;
}
