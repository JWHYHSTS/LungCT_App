import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme, type TypographyVariant } from '../theme';

export interface AppTextProps extends TextProps {
  /** Biến thể typography theo hệ thống thiết kế Figma (12 kiểu) */
  variant?: TypographyVariant;
  /** Màu chữ tùy chọn, mặc định lấy theo theme colors.text.primary */
  color?: string;
}

/**
 * Thành phần văn bản chuẩn của hệ thống LungCT.
 * Tự động áp dụng font Be Vietnam Pro, kích thước và khoảng cách dòng từ useTheme().
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyM',
  color,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const { typography, colors } = theme;

  return (
    <Text
      style={[typography[variant], { color: color ?? colors.text.primary }, style]}
      allowFontScaling
      {...rest}
    >
      {children}
    </Text>
  );
};
