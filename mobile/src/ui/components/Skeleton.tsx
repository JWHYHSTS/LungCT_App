import React, { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface SkeletonProps {
  /** Chiều rộng (số hoặc %) */
  width?: DimensionValue;
  /** Chiều cao (số hoặc %) */
  height?: DimensionValue;
  /** Bán kính bo góc */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Khung xương giữ chỗ Skeleton khi đang tải dữ liệu với hiệu ứng nhấp nháy mượt mà.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;
  const opacity = React.useMemo(() => new Animated.Value(0.4), []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.bg.sunken,
          opacity,
        },
        style,
      ]}
      accessibilityRole="none"
      accessibilityLabel="Đang tải dữ liệu"
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
