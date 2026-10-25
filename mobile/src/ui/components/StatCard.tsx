import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type StatCardTone = 'neutral' | 'brand' | 'warning';

export interface StatCardProps {
  /** Nhãn mô tả số liệu (ví dụ: "Tổng ca khám", "Chờ duyệt") */
  label: string;
  /** Giá trị số liệu (chỉ hiển thị số đếm số lượng, không hiển thị % độ chính xác mô hình) */
  value: string | number;
  /** Tông màu */
  tone?: StatCardTone;
  /** Icon minh họa */
  icon?: IconName;
  /** Dòng phụ chú thích nhỏ bên dưới */
  caption?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thẻ số liệu thống kê (StatCard) của LungCT.
 * - Tuân thủ quy định thiết kế: StatCard chỉ dùng để đếm số lượng bản ghi/ca khám,
 *   tuyệt đối không hiển thị độ chính xác của mô hình học sâu (accuracy/precision).
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  tone = 'neutral',
  icon,
  caption,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const getToneStyle = () => {
    switch (tone) {
      case 'brand':
        return {
          bg: colors.bg.surface,
          border: colors.brand.primary,
          valueColor: colors.brand.primary,
          iconColor: colors.brand.primary,
        };
      case 'warning':
        return {
          bg: colors.status.warning.bg,
          border: colors.status.warning.border,
          valueColor: colors.status.warning.fg,
          iconColor: colors.status.warning.fg,
        };
      case 'neutral':
      default:
        return {
          bg: colors.bg.surface,
          border: colors.border.default,
          valueColor: colors.text.primary,
          iconColor: colors.text.secondary,
        };
    }
  };

  const { bg, border, valueColor, iconColor } = getToneStyle();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[typography.labelS, { color: colors.text.secondary }]}>{label}</Text>
        {icon && <Icon name={icon} size={20} color={iconColor} />}
      </View>

      <Text
        style={[
          typography.display,
          { color: valueColor, marginTop: spacing.xs, fontWeight: '700' },
        ]}
      >
        {value}
      </Text>

      {caption && (
        <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xxs }]}>
          {caption}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
