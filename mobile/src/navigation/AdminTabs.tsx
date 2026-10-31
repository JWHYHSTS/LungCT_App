import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { TabBar } from '../ui/components';
import {
  AdminAccountsScreen,
  AdminStatsScreen,
  AdminProfileScreen,
} from '../features/admin/screens';

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
  const { i18n } = useTranslation();
  return (
    <Tab.Navigator
      key={i18n.language}
      initialRouteName="Accounts"
      backBehavior="firstRoute"
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
        {({ navigation }) => {
          const parentNav = navigation.getParent() as any;
          return (
            <AdminAccountsScreen
              onNavigateToDetail={(accountId) =>
                parentNav?.navigate('AccountDetail', { accountId })
              }
            />
          );
        }}
      </Tab.Screen>
      <Tab.Screen name="Stats">{() => <AdminStatsScreen />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <AdminProfileScreen />}</Tab.Screen>
    </Tab.Navigator>
  );
};
