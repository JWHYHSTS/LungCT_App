import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabs } from './AdminTabs';
import { AdminAccountDetailScreen } from '../features/admin/screens';

export type AdminStackParamList = {
  AdminTabs: undefined;
  AccountDetail: { accountId: string };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

/**
 * AdminStack: Cấu trúc điều hướng phân hệ Quản trị viên (UI-08).
 * - AdminTabs: 3 tab chính (Tài khoản, Thống kê, Tôi).
 * - AccountDetail: Màn hình chi tiết tài khoản (SCR-M02 / 12) mở chồng lên Tab dạng Stack.
 */
export const AdminStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AccountDetail">
        {({ navigation, route }) => (
          <AdminAccountDetailScreen
            accountId={route.params.accountId}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
