import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ThemePreviewScreen } from './src/features/dev/screens/ThemePreviewScreen';
import { ThemeProvider, useTheme } from './src/ui/theme';

/**
 * Nội dung giao diện chính của ứng dụng khi đang ở trong ngữ cảnh ThemeProvider.
 *
 * Tách biệt thành component con để có thể gọi hook `useTheme()` một cách hợp lệ,
 * đồng thời tự động điều chỉnh thanh trạng thái hệ thống (StatusBar) theo chế độ Sáng / Tối.
 */
function MainAppContent(): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <>
      <ThemePreviewScreen />
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

/**
 * Điểm khởi nhập (Entry Point) của ứng dụng LungCT Mobile.
 *
 * Toàn bộ cây component được bao bọc bởi ThemeProvider để đảm bảo mọi thành phần con
 * đều truy xuất được bộ token màu sắc chuẩn y tế WCAG và phản ứng tức thì khi người dùng
 * hoặc hệ điều hành thay đổi chế độ sáng/tối.
 *
 * TODO(UI-05): Thay thế màn ThemePreviewScreen bằng hệ thống điều hướng (Navigation Stack) khi dựng flow xác thực.
 */
export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
