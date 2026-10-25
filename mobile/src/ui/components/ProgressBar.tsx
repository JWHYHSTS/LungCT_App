import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface ProgressBarProps {
  /** Tiến độ từ 0 đến 1 (hoặc 0 đến 100 nếu được chuẩn hóa) */
  progress: number;
  /** Nhãn đi kèm */
  label?: string;
  /** Màu thanh tiến độ tùy chỉnh (mặc định theo brand) */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thanh tiến độ ProgressBar hiển thị tiến trình phân tích hoặc đồng bộ.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color, style }) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;

  // Chuẩn hóa progress về 0 - 100%
  const normalized =
    progress > 1
      ? Math.min(100, Math.max(0, progress))
      : Math.min(100, Math.max(0, progress * 100));

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={[styles.labelRow, { marginBottom: spacing.xxs }]}>
          <AppText variant="bodyS" color={colors.text.secondary}>
            {label}
          </AppText>
          <AppText variant="labelS" color={colors.text.primary}>
            {`${Math.round(normalized)}%`}
          </AppText>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.bg.sunken,
            borderRadius: radius.full,
          },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(normalized) }}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${normalized}%`,
              backgroundColor: color ?? colors.brand.primary,
              borderRadius: radius.full,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
