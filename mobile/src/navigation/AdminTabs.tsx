import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../ui/components';
import { MockRoleScreen } from '../features/auth/screens/MockRoleScreen';

export type AdminTabParamList = {
  Accounts: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

/**
 * AdminTabs (3 tab): Tài khoản, Thống kê, Tôi.
 * Sử dụng component TabBar chuẩn hóa với role="admin".
 */
export const AdminTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => {
        const routeName = state.routes[state.index].name.toLowerCase();
        return (
          <TabBar
            role="admin"
            activeTabKey={routeName}
            onTabPress={(key: string) => {
              const targetRoute = state.routes.find(
                (r) => r.name.toLowerCase() === key.toLowerCase(),
              );
              if (targetRoute) {
                navigation.navigate(targetRoute.name);
              }
            }}
          />
        );
      }}
    >
      <Tab.Screen name="Accounts">
        {() => (
          <MockRoleScreen
            title="Quản trị · Quản lý tài khoản"
            role="admin"
            tabName="Quản lý tài khoản"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Stats">
        {() => (
          <MockRoleScreen title="Quản trị · Thống kê tổng hợp" role="admin" tabName="Thống kê" />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <MockRoleScreen title="Quản trị · Tôi" role="admin" tabName="Tôi" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
