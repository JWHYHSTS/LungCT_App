import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { AppText } from './AppText';

export interface CheckboxProps {
  /** Trạng thái chọn */
  checked: boolean;
  /** Callback khi thay đổi trạng thái */
  onValueChange: (checked: boolean) => void;
  /** Nhãn mô tả */
  label?: string;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Hộp kiểm Checkbox chuẩn hóa của hệ thống LungCT.
 * Đảm bảo vùng chạm tối thiểu 44×44 dp (WCAG 2.1 AA).
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  label,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.container,
        {
          opacity: disabled ? 0.5 : 1,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderRadius: radius.sm,
            borderColor: checked ? colors.brand.primary : colors.border.default,
            backgroundColor: checked ? colors.brand.primary : colors.bg.surface,
          },
        ]}
      >
        {checked && <Icon name="success" size={16} color={colors.text.onBrand} />}
      </View>
      {label && (
        <AppText variant="bodyM" style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
  },
});
