import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../ui/theme';
import { AppText, Button, TopBar } from '../../../ui/components';

interface MockRoleScreenProps {
  title: string;
  role: 'doctor' | 'admin';
  tabName: string;
}

/**
 * Màn hình đại diện (placeholder) chuẩn hoá cho các tab nghiệp vụ của Bác sĩ và Quản trị viên (UI-05).
 * - Sử dụng để xác nhận hoạt động của DoctorTabs và AdminTabs.
 * - Cho phép Đăng xuất an toàn để kiểm tra luồng quay lại màn hình Login.
 */
export const MockRoleScreen: React.FC<MockRoleScreenProps> = ({ title, role, tabName }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar title={title} />
      <View style={[styles.content, { padding: spacing.lg, gap: spacing.md }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              padding: spacing.md,
            },
          ]}
        >
          <AppText variant="titleS" color={colors.brand.primary}>
            {role === 'admin' ? 'Khu vực Quản trị viên (Mô phỏng)' : 'Khu vực Bác sĩ (Mô phỏng)'}
          </AppText>
          <AppText variant="bodyM" color={colors.text.primary} style={{ marginTop: 4 }}>
            Tab: {tabName}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
            Người dùng mô phỏng: {user?.fullName} ({user?.email})
          </AppText>
        </View>

        <AppText variant="bodyS" color={colors.text.secondary}>
          Màn hình nghiệp vụ chi tiết của tab này sẽ được triển khai đầy đủ ở các gói tiếp theo
          (UI-06 đến UI-08).
        </AppText>

        <Button
          label="Đăng xuất"
          variant="secondary"
          onPress={logout}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
  },
});
