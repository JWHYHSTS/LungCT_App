import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon } from '../icons';

export interface SearchFieldProps {
  /** Giá trị tìm kiếm */
  value: string;
  /** Hàm callback khi thay đổi text */
  onChangeText: (text: string) => void;
  /** Chuỗi placeholder */
  placeholder?: string;
  /** Callback khi bấm nút xóa nhanh */
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thanh tìm kiếm chuẩn hóa của hệ thống LungCT.
 * Tích hợp sẵn icon tìm kiếm (search 20px) và nút xóa nhanh (close).
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  onClear,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surfaceAlt,
          borderColor: colors.border.default,
          borderRadius: radius.full,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <Icon name="search" size={20} color={colors.text.secondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        style={[
          styles.input,
          typography.bodyM,
          { color: colors.text.primary, marginLeft: spacing.sm },
        ]}
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
          onPress={handleClear}
          hitSlop={8}
        >
          <Icon name="close" size={16} color={colors.text.secondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
});
