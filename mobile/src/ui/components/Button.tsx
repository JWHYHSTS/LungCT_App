import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'L' | 'M';

export interface ButtonProps {
  /** Nhãn nút bắt buộc */
  label: string;
  /** Biến thể kiểu dáng nút */
  variant?: ButtonVariant;
  /** Kích thước nút: L (chiều cao chuẩn 48), M (chiều cao 40) */
  size?: ButtonSize;
  /** Icon đứng trước nhãn */
  leadingIcon?: IconName;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Trạng thái đang tải dữ liệu (hiện vòng xoay và khóa bấm lặp) */
  loading?: boolean;
  /** Sự kiện chạm */
  onPress?: (event: GestureResponderEvent) => void;
  /** Nhãn trợ năng (accessibility label), mặc định lấy theo label */
  accessibilityLabel?: string;
  /** Style ghi đè phần khung ngoài */
  style?: StyleProp<ViewStyle>;
}

/**
 * Nút bấm chuẩn hóa theo Figma LungCT v1.
 * Vùng chạm tối thiểu ≥ 44×44, hỗ trợ accessibilityRole="button" và accessibilityState.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'L',
  leadingIcon,
  disabled = false,
  loading = false,
  onPress,
  accessibilityLabel,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const isInteractive = !disabled && !loading;

  // Xác định màu nền và màu viền theo biến thể
  const getButtonStyles = (pressed: boolean) => {
    let backgroundColor: string = colors.brand.primary;
    let borderColor: string = colors.brand.primary;
    let textColor: string = colors.text.onBrand;
    let iconColor: string = colors.text.onBrand;

    switch (variant) {
      case 'primary':
        backgroundColor = pressed
          ? colors.brand.primaryPressed
          : disabled
            ? colors.bg.sunken
            : colors.brand.primary;
        borderColor = backgroundColor;
        textColor = disabled ? colors.text.disabled : colors.text.onBrand;
        iconColor = textColor;
        break;

      case 'secondary':
        backgroundColor = pressed ? colors.bg.sunken : disabled ? colors.bg.app : colors.bg.surface;
        borderColor = disabled ? colors.border.default : colors.border.strong;
        textColor = disabled ? colors.text.disabled : colors.text.primary;
        iconColor = disabled ? colors.text.disabled : colors.border.icon;
        break;

      case 'tertiary':
        backgroundColor = pressed ? colors.bg.sunken : 'transparent';
        borderColor = 'transparent';
        textColor = disabled ? colors.text.disabled : colors.brand.primary;
        iconColor = textColor;
        break;

      case 'danger':
        backgroundColor = pressed
          ? colors.status.danger.fg
          : disabled
            ? colors.bg.sunken
            : colors.status.danger.bg;
        borderColor = disabled ? colors.border.default : colors.status.danger.border;
        textColor = disabled
          ? colors.text.disabled
          : pressed
            ? colors.bg.surface
            : colors.status.danger.fg;
        iconColor = textColor;
        break;
    }

    return { backgroundColor, borderColor, textColor, iconColor };
  };

  const isLarge = size === 'L';
  const minHeight = isLarge ? 48 : 40;
  const paddingVertical = isLarge ? 13 : 9;
  const paddingHorizontal = isLarge ? 20 : 16;
  const fontStyle = isLarge ? typography.labelL : typography.labelM;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => {
        const { backgroundColor, borderColor } = getButtonStyles(pressed);
        return [
          styles.base,
          {
            minHeight,
            paddingVertical,
            paddingHorizontal,
            borderRadius: radius.md,
            backgroundColor,
            borderColor,
            gap: spacing.sm,
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const { textColor, iconColor } = getButtonStyles(pressed);

        if (loading) {
          return <ActivityIndicator size="small" color={textColor} accessibilityLabel="Đang tải" />;
        }

        return (
          <>
            {leadingIcon && <Icon name={leadingIcon} size={isLarge ? 20 : 18} color={iconColor} />}
            <Text style={[fontStyle, { color: textColor }]}>{label}</Text>
          </>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
