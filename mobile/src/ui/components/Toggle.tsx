import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface ToggleProps {
  /** Giá trị bật/tắt */
  value: boolean;
  /** Callback khi đổi giá trị */
  onValueChange: (value: boolean) => void;
  /** Nhãn đi kèm */
  label?: string;
  /** Vô hiệu hóa */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Nhãn hỗ trợ tiếp cận */
  accessibilityLabel?: string;
}

/**
 * Toggle (Switch) chuẩn hóa theo thiết kế LungCT v1.
 * Đảm bảo vùng chạm ≥ 44×44 dp và màu thương hiệu theo theme.
 */
export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const content = (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.border.default,
        true: colors.brand.primary,
      }}
      thumbColor={
        Platform.OS === 'android' ? (value ? colors.bg.surface : colors.bg.surfaceAlt) : undefined
      }
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    />
  );

  if (!label) {
    return <View style={[styles.standaloneContainer, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.rowContainer, { opacity: disabled ? 0.5 : 1, gap: spacing.md }, style]}
    >
      <AppText variant="bodyM" style={styles.label}>
        {label}
      </AppText>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  standaloneContainer: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
});
