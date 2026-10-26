import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { IconButton } from './IconButton';

export type TopBarType = 'root' | 'stack' | 'modal';

export interface TopBarProps {
  /** Tiêu đề thanh TopBar */
  title: string;
  /** Loại TopBar: root (màn gốc, chữ lớn titleL), stack (màn con có nút quay lại), modal (màn pop-up có nút đóng) */
  type?: TopBarType;
  /** Callback khi bấm quay lại (stack) */
  onBackPress?: () => void;
  /** Callback khi bấm đóng (modal) */
  onClosePress?: () => void;
  /** Các nút hành động bên phải */
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thanh tiêu đề trên cùng (TopBar) chuẩn hóa của LungCT.
 */
export const TopBar: React.FC<TopBarProps> = ({
  title,
  type = 'root',
  onBackPress,
  onClosePress,
  rightActions,
  style,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  const isRoot = type === 'root';
  const isStack = type === 'stack';
  const isModal = type === 'modal';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surface,
          borderBottomColor: colors.border.default,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {isStack && (
          <IconButton
            name="back"
            accessibilityLabel={t('common.back', 'Quay lại')}
            onPress={onBackPress}
          />
        )}
        {isModal && (
          <IconButton
            name="close"
            accessibilityLabel={t('common.close', 'Đóng')}
            onPress={onClosePress}
          />
        )}
        <Text
          style={[
            isRoot ? typography.titleL : typography.titleS,
            {
              color: colors.text.primary,
              marginLeft: isStack || isModal ? spacing.xs : 0,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {rightActions && <View style={styles.rightContainer}>{rightActions}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
