import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorTabs } from './DoctorTabs';
import {
  PatientFormModal,
  PatientDetailScreen,
  CaseDetailScreen,
  AIImageResultScreen,
  ExportPdfScreen,
  TrashScreen,
} from '../features/doctor/screens';

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  PatientForm: { patientId?: string } | undefined;
  PatientDetail: { patientId: string };
  CaseDetail: { caseId: string };
  AIImageResult: { caseId: string; imageIndex?: number };
  ExportPdf: { caseId: string };
  Trash: undefined;
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

/**
 * DoctorStack: Cấu trúc điều hướng phân hệ Bác sĩ.
 * Bao gồm:
 * - DoctorTabs: 5 tab chính (Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi).
 * - Các màn hình chi tiết mở chồng lên tab theo đúng bản đồ điều hướng (05-man-hinh-va-dieu-huong.md):
 *   + PatientForm (SCR-P02 / 13): Mở dạng Modal (hỗ trợ cả Thêm mới và Sửa).
 *   + PatientDetail (SCR-P03 / 14): Mở dạng Stack.
 *   + CaseDetail (SCR-C02 / 15): Mở dạng Stack.
 *   + AIImageResult (SCR-R01 / 16): Mở dạng Stack.
 *   + ExportPdf (SCR-D01 / 17): Mở dạng Stack.
 */
export const DoctorStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DoctorTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />

      <Stack.Screen
        name="PatientForm"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        {({ navigation, route }) => (
          <PatientFormModal
            initialPatientId={route.params?.patientId}
            onClose={() => navigation.goBack()}
            onSuccess={(savedPatientId) => {
              if (route.params?.patientId) {
                // Đang sửa: chỉ đóng modal quay lại trang chi tiết
                navigation.goBack();
              } else {
                // Tạo mới: mở trang chi tiết bệnh nhân vừa tạo
                navigation.replace('PatientDetail', { patientId: savedPatientId });
              }
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="PatientDetail">
        {({ navigation, route }) => (
          <PatientDetailScreen
            patientId={route.params.patientId}
            onBack={() => navigation.goBack()}
            onNavigateToCaseDetail={(caseId) => navigation.navigate('CaseDetail', { caseId })}
            onNavigateToEditPatient={(patientId) =>
              navigation.navigate('PatientForm', { patientId })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="CaseDetail">
        {({ navigation, route }) => (
          <CaseDetailScreen
            caseId={route.params.caseId}
            onBack={() => navigation.goBack()}
            onNavigateToImageResult={(caseId, imageIndex) =>
              navigation.navigate('AIImageResult', { caseId, imageIndex })
            }
            onNavigateToExportPdf={(caseId) => navigation.navigate('ExportPdf', { caseId })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AIImageResult">
        {({ navigation, route }) => (
          <AIImageResultScreen
            caseId={route.params.caseId}
            initialImageIndex={route.params.imageIndex}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ExportPdf">
        {({ navigation, route }) => (
          <ExportPdfScreen caseId={route.params.caseId} onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Trash">
        {({ navigation }) => (
          <TrashScreen
            onBack={() => navigation.goBack()}
            onNavigateToCaseDetail={(caseId) => navigation.navigate('CaseDetail', { caseId })}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
