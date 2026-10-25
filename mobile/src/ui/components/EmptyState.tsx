import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';
import { Button } from './Button';

export type EmptyStateType = 'noData' | 'noResult' | 'error' | 'offline';

export interface EmptyStateProps {
  /** Tiêu đề trạng thái rỗng */
  title: string;
  /** Nội dung giải thích hoặc hướng dẫn hành động */
  body: string;
  /** Loại trạng thái rỗng */
  type?: EmptyStateType;
  /** Nhãn nút hành động (ví dụ: "Thử lại", "Thêm mới") */
  actionLabel?: string;
  /** Callback khi bấm nút hành động */
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Màn hình / Khối trạng thái rỗng (EmptyState) của LungCT.
 * - Icon nằm trong vòng tròn 72×72 điểm ảnh.
 * - Cung cấp hướng dẫn rõ ràng và nút bấm xử lý tương ứng.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  body,
  type = 'noData',
  actionLabel,
  onActionPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const getTypeIcon = (): IconName => {
    switch (type) {
      case 'noResult':
        return 'search';
      case 'error':
        return 'error';
      case 'offline':
        return 'offline';
      case 'noData':
      default:
        return 'draft';
    }
  };

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.bg.surfaceAlt,
            borderRadius: radius.full,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <Icon name={getTypeIcon()} size={36} color={colors.text.secondary} />
      </View>

      <Text
        style={[
          typography.titleM,
          { color: colors.text.primary, textAlign: 'center', marginBottom: spacing.xs },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          typography.bodyM,
          { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg },
        ]}
      >
        {body}
      </Text>

      {actionLabel && (
        <Button label={actionLabel} variant="primary" size="M" onPress={onActionPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
