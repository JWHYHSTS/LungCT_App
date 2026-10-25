import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type StatusBadgeTone =
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'pending' | 'brand';

export interface StatusBadgeProps {
  /** Nhãn chữ bắt buộc hiển thị (BR-UI-01) */
  label: string;
  /** Tông màu trạng thái */
  tone?: StatusBadgeTone;
  /** Icon hiển thị đi kèm */
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

/**
 * Huy hiệu trạng thái nghiệp vụ/hệ thống của LungCT.
 * - Tuân thủ BR-UI-01: Luôn có chữ và icon đi kèm, không chỉ dựa vào màu sắc.
 * - Bo góc tròn full, cỡ chữ labelS, độ tương phản màu chuẩn WCAG.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  icon,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const getToneColors = () => {
    switch (tone) {
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'danger':
        return colors.status.danger;
      case 'info':
        return colors.status.info;
      case 'pending':
        return colors.status.pending;
      case 'brand':
        return {
          bg: colors.bg.brandSubtle,
          fg: colors.brand.primary,
          border: colors.brand.accent,
        };
      case 'neutral':
      default:
        return colors.status.neutral;
    }
  };

  const { bg, fg, border } = getToneColors();

  // Tự động gán icon mặc định nếu chưa truyền icon riêng
  const defaultIconMap: Record<StatusBadgeTone, IconName> = {
    success: 'success',
    warning: 'warning',
    danger: 'error',
    info: 'info',
    pending: 'pending',
    brand: 'grad-cam',
    neutral: 'draft',
  };

  const displayIcon = icon ?? defaultIconMap[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius.full,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      {displayIcon && <Icon name={displayIcon} size={14} color={fg} />}
      <Text
        style={[typography.labelS, { color: fg, marginLeft: displayIcon ? spacing.xxs + 1 : 0 }]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
});
