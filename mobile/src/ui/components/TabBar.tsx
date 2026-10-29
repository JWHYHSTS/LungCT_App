import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSafeAreaInsets } from '../utils/safeArea';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type UserRole = 'doctor' | 'admin';

export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
}

export interface TabBarProps {
  /** Vai trò người dùng để hiển thị đúng số lượng và tên tab */
  role?: UserRole;
  /** Khóa của tab đang kích hoạt */
  activeTabKey: string;
  /** Callback khi người dùng chuyển tab */
  onTabPress?: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thanh điều hướng đáy (Bottom TabBar) chuẩn hóa của ứng dụng LungCT.
 * - Bác sĩ (5 tab): Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi.
 * - Quản trị viên (3 tab): Tài khoản, Thống kê, Tôi.
 * - Tự động cộng padding phía dưới bằng useSafeAreaInsets để tránh bị che bởi thanh điều hướng hệ thống (cử chỉ / 3 nút).
 */
export const TabBar: React.FC<TabBarProps> = ({
  role = 'doctor',
  activeTabKey,
  onTabPress,
  style,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const insets = useAppSafeAreaInsets();

  const doctorTabs: TabItem[] = [
    { key: 'home', label: t('navigation.tab_home', 'Trang chủ'), icon: 'home' },
    { key: 'patients', label: t('navigation.tab_patients', 'Bệnh nhân'), icon: 'patients' },
    { key: 'cases', label: t('navigation.tab_cases', 'Ca bệnh'), icon: 'cases' },
    { key: 'stats', label: t('navigation.tab_stats', 'Thống kê'), icon: 'statistics' },
    { key: 'profile', label: t('navigation.tab_profile', 'Tôi'), icon: 'profile' },
  ];

  const adminTabs: TabItem[] = [
    { key: 'accounts', label: t('admin.tab_accounts', 'Tài khoản'), icon: 'account-approval' },
    { key: 'stats', label: t('admin.tab_stats', 'Thống kê'), icon: 'statistics' },
    { key: 'profile', label: t('admin.tab_profile', 'Tôi'), icon: 'profile' },
  ];

  const tabs = role === 'doctor' ? doctorTabs : adminTabs;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.default,
          paddingTop: spacing.xs,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTabKey === tab.key;
        const color = isActive ? colors.brand.primary : colors.text.secondary;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabPress?.(tab.key)}
            style={[
              styles.tabItem,
              isActive && {
                backgroundColor: colors.bg.brandSubtle,
                borderRadius: 12,
              },
            ]}
          >
            <Icon name={tab.icon} size={24} color={color} />
            <Text
              style={[
                typography.caption,
                { color, marginTop: 2, fontWeight: isActive ? '600' : '400' },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
  },
});
