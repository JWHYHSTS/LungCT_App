import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type ListRowType = 'patient' | 'case' | 'account' | 'setting' | 'notification';

export interface ListRowProps {
  /** Tiêu đề chính */
  title: string;
  /** Tiêu đề phụ/nội dung mô tả ngắn */
  subtitle?: string;
  /** Loại dòng */
  type?: ListRowType;
  /** Icon đứng đầu */
  leadingIcon?: IconName;
  /** Các badge hiển thị ở đuôi dòng hoặc sau subtitle */
  badges?: React.ReactNode;
  /** Ẩn chevron bên phải */
  hideChevron?: boolean;
  /** Callback khi bấm dòng */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thẻ dòng danh sách (ListRow) chuẩn hóa của LungCT.
 * - Bo góc 16px (radius.lg), padding 16/12, chevron bên phải.
 */
export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  leadingIcon,
  badges,
  hideChevron = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.bg.sunken : colors.bg.surface,
          borderColor: colors.border.default,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        style,
      ]}
    >
      {leadingIcon && (
        <View style={[styles.iconWrapper, { marginRight: spacing.md }]}>
          <Icon name={leadingIcon} size={28} color={colors.border.icon} />
        </View>
      )}

      <View style={styles.contentColumn}>
        <Text style={[typography.titleS, { color: colors.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[typography.bodyS, { color: colors.text.secondary, marginTop: 2 }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {badges && <View style={[styles.badgeContainer, { marginLeft: spacing.sm }]}>{badges}</View>}

      {!hideChevron && (
        <View style={[styles.chevronWrapper, { marginLeft: spacing.xs }]}>
          <Icon name="chevron-right" size={20} color={colors.text.disabled} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
