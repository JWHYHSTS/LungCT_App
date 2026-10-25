import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Nhãn phía trên ô nhập */
  label?: string;
  /** Dòng hướng dẫn phụ bên dưới */
  helper?: string;
  /** Thông điệp báo lỗi (nếu có sẽ kích hoạt giao diện viền đỏ + icon lỗi) */
  error?: string;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Icon hiển thị ở cuối ô nhập */
  trailingIcon?: IconName;
  /** Callback khi bấm trailing icon */
  onTrailingIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ô nhập liệu chuẩn y tế của hệ thống LungCT.
 * - Hỗ trợ các trạng thái: default, focused (viền đậm 2px), filled, error (viền đỏ + thông điệp + icon), disabled.
 * - Tuân thủ BR-UI-01: Báo lỗi không chỉ dựa vào màu sắc mà có chữ và icon đi kèm.
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  helper,
  error,
  trailingIcon,
  onTrailingIconPress,
  disabled = false,
  value,
  style,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  // Xác định màu viền và nền
  const getBorderColor = () => {
    if (disabled) return colors.border.default;
    if (hasError) return colors.status.danger.fg;
    if (isFocused) return colors.border.focus;
    return colors.border.control;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            typography.labelM,
            {
              color: disabled ? colors.text.disabled : colors.text.primary,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? colors.bg.sunken : colors.bg.surface,
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 2 : 1,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TextInput
          value={value}
          editable={!disabled}
          placeholderTextColor={colors.text.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            typography.bodyM,
            { color: disabled ? colors.text.disabled : colors.text.primary },
          ]}
          {...inputProps}
        />

        {trailingIcon && (
          <View style={styles.trailingContainer}>
            <Icon
              name={trailingIcon}
              size={20}
              color={hasError ? colors.status.danger.fg : colors.text.secondary}
            />
          </View>
        )}
      </View>

      {/* Dòng báo lỗi hoặc hướng dẫn */}
      {hasError ? (
        <View accessibilityRole="alert" style={[styles.messageRow, { marginTop: spacing.xs }]}>
          <Icon name="error" size={14} color={colors.status.danger.fg} />
          <Text
            style={[typography.caption, { color: colors.status.danger.fg, marginLeft: spacing.xs }]}
          >
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  trailingContainer: {
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
