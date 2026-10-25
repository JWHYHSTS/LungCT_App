import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface SegmentedItem<T extends string = string> {
  key: T;
  label: string;
}

export interface SegmentedProps<T extends string = string> {
  /** Danh sách mục lựa chọn (2 hoặc 3 mục) */
  items: SegmentedItem<T>[];
  /** Khóa của mục đang chọn */
  selectedKey: T;
  /** Callback khi đổi lựa chọn */
  onSelect: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bộ chuyển đổi phân đoạn Segmented (2 hoặc 3 tùy chọn).
 * Dùng cho xem Ảnh gốc / Grad-CAM hoặc khoảng thời gian 7 ngày / 30 ngày / Tất cả.
 */
export const Segmented = <T extends string = string>({
  items,
  selectedKey,
  onSelect,
  style,
}: SegmentedProps<T>): React.ReactElement => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.sunken,
          borderRadius: radius.md,
          padding: spacing.xxs,
        },
        style,
      ]}
      accessibilityRole="radiogroup"
    >
      {items.map((item) => {
        const isSelected = item.key === selectedKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={item.label}
            style={[
              styles.item,
              {
                borderRadius: radius.sm,
                backgroundColor: isSelected ? colors.bg.surface : 'transparent',
                // Đổ bóng nhẹ khi active
                ...(isSelected
                  ? {
                      shadowColor: colors.text.primary,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : {}),
              },
            ]}
          >
            <AppText
              variant={isSelected ? 'labelM' : 'bodyM'}
              color={isSelected ? colors.text.primary : colors.text.secondary}
              style={styles.label}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  item: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  label: {
    textAlign: 'center',
  },
});
