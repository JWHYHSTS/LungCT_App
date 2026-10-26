import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../ui/components';
import { MockRoleScreen } from '../features/auth/screens/MockRoleScreen';

export type DoctorTabParamList = {
  Home: undefined;
  Patients: undefined;
  Cases: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DoctorTabParamList>();

/**
 * DoctorTabs (5 tab): Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi.
 * Sử dụng component TabBar chuẩn hóa từ UI-03 để đảm bảo thiết kế thống nhất.
 */
export const DoctorTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => {
        const routeName = state.routes[state.index].name.toLowerCase();
        return (
          <TabBar
            role="doctor"
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
      <Tab.Screen name="Home">
        {() => <MockRoleScreen title="Bác sĩ · Trang chủ" role="doctor" tabName="Trang chủ" />}
      </Tab.Screen>
      <Tab.Screen name="Patients">
        {() => <MockRoleScreen title="Bác sĩ · Bệnh nhân" role="doctor" tabName="Bệnh nhân" />}
      </Tab.Screen>
      <Tab.Screen name="Cases">
        {() => <MockRoleScreen title="Bác sĩ · Ca bệnh" role="doctor" tabName="Ca bệnh" />}
      </Tab.Screen>
      <Tab.Screen name="Stats">
        {() => <MockRoleScreen title="Bác sĩ · Thống kê" role="doctor" tabName="Thống kê" />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <MockRoleScreen title="Bác sĩ · Tôi" role="doctor" tabName="Tôi" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
