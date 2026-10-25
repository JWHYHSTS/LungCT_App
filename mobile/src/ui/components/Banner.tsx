import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type BannerType = 'offline' | 'syncing' | 'error' | 'warning' | 'info' | 'locked' | 'mock';

export interface BannerProps {
  /** Loại banner */
  type?: BannerType;
  /** Tiêu đề ngắn gọn */
  title: string;
  /** Nội dung giải thích chi tiết */
  body?: string;
  /** Icon tùy biến (nếu không truyền sẽ dùng icon tương ứng với loại banner) */
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

/**
 * Khối thông báo hệ thống / trạng thái mạng / cảnh báo dữ liệu giả lập (Banner).
 * Hỗ trợ accessibilityLiveRegion="polite" cho người dùng khiếm thị nhận diện thay đổi trạng thái.
 */
export const Banner: React.FC<BannerProps> = ({ type = 'info', title, body, icon, style }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const getTypeConfig = () => {
    switch (type) {
      case 'offline':
        return {
          bg: colors.status.warning.bg,
          border: colors.status.warning.border,
          fg: colors.status.warning.fg,
          defaultIcon: 'offline' as IconName,
        };
      case 'syncing':
        return {
          bg: colors.status.pending.bg,
          border: colors.status.pending.border,
          fg: colors.status.pending.fg,
          defaultIcon: 'sync' as IconName,
        };
      case 'error':
        return {
          bg: colors.status.danger.bg,
          border: colors.status.danger.border,
          fg: colors.status.danger.fg,
          defaultIcon: 'error' as IconName,
        };
      case 'warning':
        return {
          bg: colors.status.warning.bg,
          border: colors.status.warning.border,
          fg: colors.status.warning.fg,
          defaultIcon: 'warning' as IconName,
        };
      case 'locked':
        return {
          bg: colors.status.neutral.bg,
          border: colors.status.neutral.border,
          fg: colors.status.neutral.fg,
          defaultIcon: 'lock' as IconName,
        };
      case 'mock':
        return {
          bg: colors.bg.brandSubtle,
          border: colors.brand.accent,
          fg: colors.brand.primary,
          defaultIcon: 'info' as IconName,
        };
      case 'info':
      default:
        return {
          bg: colors.status.info.bg,
          border: colors.status.info.border,
          fg: colors.status.info.fg,
          defaultIcon: 'info' as IconName,
        };
    }
  };

  const { bg, border, fg, defaultIcon } = getTypeConfig();
  const displayIcon = icon ?? defaultIcon;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius.md,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <Icon name={displayIcon} size={22} color={fg} />
        <View style={[styles.textContainer, { marginLeft: spacing.sm }]}>
          <Text style={[typography.labelL, { color: fg }]}>{title}</Text>
          {body && <Text style={[typography.bodyS, { color: fg, marginTop: 2 }]}>{body}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
});
