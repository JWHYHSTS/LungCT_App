import React from 'react';
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type IconButtonVariant = 'plain' | 'tonal';

export interface IconButtonProps {
  /** Icon hiển thị */
  name: IconName;
  /** Nhãn trợ năng bắt buộc phục vụ người khiếm thị đọc qua Screen Reader */
  accessibilityLabel: string;
  /** Biến thể kiểu dáng: plain (trong suốt) hoặc tonal (có màu nền nhạt) */
  variant?: IconButtonVariant;
  /** Kích thước icon (mặc định 24) */
  iconSize?: number;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Sự kiện chạm */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Nút bấm chỉ chứa Icon theo chuẩn thiết kế LungCT.
 * Đảm bảo vùng chạm tối thiểu ≥ 44×44 điểm ảnh (NFR khả năng tiếp cận).
 */
export const IconButton: React.FC<IconButtonProps> = ({
  name,
  accessibilityLabel,
  variant = 'plain',
  iconSize = 24,
  disabled = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const isTonal = variant === 'tonal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => {
        let backgroundColor = 'transparent';
        if (isTonal) {
          backgroundColor = pressed
            ? colors.bg.sunken
            : disabled
              ? colors.bg.app
              : colors.bg.surfaceAlt;
        } else if (pressed) {
          backgroundColor = colors.bg.sunken;
        }

        return [
          styles.base,
          {
            borderRadius: radius.md,
            backgroundColor,
            opacity: disabled ? 0.4 : 1,
          },
          style,
        ];
      }}
    >
      <Icon
        name={name}
        size={iconSize}
        color={disabled ? colors.text.disabled : colors.border.icon}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
