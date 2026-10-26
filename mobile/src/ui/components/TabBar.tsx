import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
 * - Nhãn luôn luôn hiển thị (always show labels).
 */
export const TabBar: React.FC<TabBarProps> = ({
  role = 'doctor',
  activeTabKey,
  onTabPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  const doctorTabs: TabItem[] = [
    { key: 'home', label: 'Trang chủ', icon: 'home' },
    { key: 'patients', label: 'Bệnh nhân', icon: 'patients' },
    { key: 'cases', label: 'Ca bệnh', icon: 'cases' },
    { key: 'stats', label: 'Thống kê', icon: 'statistics' },
    { key: 'profile', label: 'Tôi', icon: 'profile' },
  ];

  const adminTabs: TabItem[] = [
    { key: 'accounts', label: 'Tài khoản', icon: 'account-approval' },
    { key: 'stats', label: 'Thống kê', icon: 'statistics' },
    { key: 'profile', label: 'Tôi', icon: 'profile' },
  ];

  const tabs = role === 'doctor' ? doctorTabs : adminTabs;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.default,
          paddingVertical: spacing.xs,
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
