import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface FilterChipProps {
  /** Nhãn của chip lọc */
  label: string;
  /** Trạng thái được chọn */
  selected?: boolean;
  /** Sự kiện chạm */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thẻ lọc (FilterChip) chuẩn hóa bo góc tròn (radius.full).
 * Tuân thủ accessibilityRole="button" và accessibilityState={{ selected }}.
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: radius.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
          backgroundColor: selected ? colors.brand.primary : colors.bg.surface,
          borderColor: selected ? colors.brand.primary : colors.border.strong,
        },
        style,
      ]}
    >
      <Text
        style={[typography.labelS, { color: selected ? colors.text.onBrand : colors.text.primary }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
