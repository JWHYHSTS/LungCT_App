import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../ui/components';
import {
  DoctorHomeScreen,
  DoctorPatientsScreen,
  DoctorCasesScreen,
  DoctorStatsScreen,
  DoctorProfileScreen,
} from '../features/doctor/screens';

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
 *
 * Hành vi Back Android ở tab gốc (H01):
 * - Theo mặc định của React Navigation, backBehavior="firstRoute" sẽ đưa người dùng từ các tab khác về tab Home đầu tiên.
 * - Khi ở tab Home (tab gốc), bấm phím Back sẽ kích hoạt thoát ứng dụng (exitApp) theo đúng đặc tả Android SCR-H01.
 */
export const DoctorTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="firstRoute"
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
        {({ navigation }) => {
          const parentNav = navigation.getParent() as any;
          return (
            <DoctorHomeScreen
              onNavigateToCases={() => navigation.navigate('Cases')}
              onNavigateToPatients={() => navigation.navigate('Patients')}
              onNavigateToCaseDetail={(caseId) => parentNav?.navigate('CaseDetail', { caseId })}
              onNavigateToPatientDetail={(patientId) =>
                parentNav?.navigate('PatientDetail', { patientId })
              }
              onNavigateToCreatePatient={() => parentNav?.navigate('PatientForm')}
            />
          );
        }}
      </Tab.Screen>
      <Tab.Screen name="Patients">
        {({ navigation }) => {
          const parentNav = navigation.getParent() as any;
          return (
            <DoctorPatientsScreen
              onNavigateToDetail={(patientId) =>
                parentNav?.navigate('PatientDetail', { patientId })
              }
              onNavigateToCreatePatient={() => parentNav?.navigate('PatientForm')}
            />
          );
        }}
      </Tab.Screen>
      <Tab.Screen name="Cases">
        {({ navigation }) => {
          const parentNav = navigation.getParent() as any;
          return (
            <DoctorCasesScreen
              onNavigateToCaseDetail={(caseId) => parentNav?.navigate('CaseDetail', { caseId })}
            />
          );
        }}
      </Tab.Screen>
      <Tab.Screen name="Stats">{() => <DoctorStatsScreen />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <DoctorProfileScreen />}</Tab.Screen>
    </Tab.Navigator>
  );
};
