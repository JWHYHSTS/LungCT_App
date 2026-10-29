import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import './src/i18n';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import { RootNavigator } from './src/navigation';
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
      <RootNavigator />
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

/**
 * Điểm khởi nhập (Entry Point) của ứng dụng LungCT Mobile.
 *
 * Tải trước font Be Vietnam Pro (Regular, Medium, SemiBold).
 * Bao bọc ứng dụng trong AuthProvider, ThemeProvider và i18n context.
 */
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App(): React.JSX.Element {
  const [fontsLoaded, fontError] = useFonts({
    'BeVietnamPro-Regular': require('./assets/fonts/BeVietnamPro-Regular.ttf'),
    'BeVietnamPro-Medium': require('./assets/fonts/BeVietnamPro-Medium.ttf'),
    'BeVietnamPro-SemiBold': require('./assets/fonts/BeVietnamPro-SemiBold.ttf'),
  });

  // Nếu font chưa tải xong và chưa có lỗi -> hiển thị màn hình chờ ngắn hạn.
  // Nếu có lỗi nạp font (fontError) -> không chặn app, cho phép render với font hệ thống dự phòng (fallback).
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6F67" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F2',
  },
});
