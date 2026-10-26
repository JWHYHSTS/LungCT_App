import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/context/AuthContext';
import { AuthStack } from './AuthStack';
import { DoctorStack } from './DoctorStack';
import { AdminStack } from './AdminStack';
import { useTheme } from '../ui/theme';

export type RootStackParamList = {
  Auth: undefined;
  DoctorApp: undefined;
  AdminApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator (UI-05, UI-07, UI-08):
 * Phân luồng điều hướng cấp cao nhất theo cấu trúc:
 * RootStack = AuthStack | DoctorStack (5 tab + 5 màn chi tiết) | AdminStack (3 tab + 1 màn chi tiết).
 * - Khi chưa đăng nhập (user === null) -> Hiển thị AuthStack.
 * - Khi đăng nhập với vai trò 'doctor' -> Hiển thị DoctorStack.
 * - Khi đăng nhập với vai trò 'admin' -> Hiển thị AdminStack.
 * - Tự động đồng bộ màu nền và thanh trạng thái theo Theme Sáng/Tối.
 */
export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.scheme === 'dark',
        colors: {
          primary: theme.colors.brand.primary,
          background: theme.colors.bg.app,
          card: theme.colors.bg.surface,
          text: theme.colors.text.primary,
          border: theme.colors.border.default,
          notification: theme.colors.status.danger.fg,
        },
        fonts: {
          regular: { fontFamily: 'BeVietnamPro-Regular', fontWeight: '400' },
          medium: { fontFamily: 'BeVietnamPro-Medium', fontWeight: '500' },
          bold: { fontFamily: 'BeVietnamPro-SemiBold', fontWeight: '600' },
          heavy: { fontFamily: 'BeVietnamPro-SemiBold', fontWeight: '700' },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminStack} />
        ) : (
          <Stack.Screen name="DoctorApp" component={DoctorStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
