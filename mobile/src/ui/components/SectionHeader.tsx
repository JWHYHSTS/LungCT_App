import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface SectionHeaderProps {
  /** Tiêu đề phần */
  title: string;
  /** Nút hành động bên phải (ví dụ: "Xem tất cả") */
  actionLabel?: string;
  /** Callback khi bấm action */
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tiêu đề phân đoạn nội dung (SectionHeader) của LungCT.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={[styles.container, style]}>
      <Text style={[typography.titleM, { color: colors.text.primary }]}>{title}</Text>
      {actionLabel && (
        <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={8}>
          <Text style={[typography.labelS, { color: colors.brand.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
  },
});
