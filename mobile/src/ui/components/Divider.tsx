import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface DividerProps {
  /** Khoảng cách lề trên dưới (padding vertical) */
  spacingVertical?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Đường kẻ phân cách ngang (Divider) chuẩn hóa.
 */
export const Divider: React.FC<DividerProps> = ({ spacingVertical = 0, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border.default,
          marginVertical: spacingVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
