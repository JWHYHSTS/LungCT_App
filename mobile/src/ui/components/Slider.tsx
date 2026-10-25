import React, { useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface SliderProps {
  /** Giá trị từ 0 đến 100 */
  value: number;
  /** Callback khi giá trị đổi */
  onValueChange: (val: number) => void;
  /** Bước nhảy, mặc định 5 */
  step?: number;
  /** Giá trị tối thiểu, mặc định 0 */
  min?: number;
  /** Giá trị tối đa, mặc định 100 */
  max?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Thanh trượt Slider chuẩn hóa (0–100, bước 5).
 * Dùng đặc biệt cho việc điều chỉnh độ phủ của bản đồ Grad-CAM.
 * Đảm bảo vùng chạm đạt chuẩn 44×44 dp.
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  step = 5,
  min = 0,
  max = 100,
  disabled = false,
  style,
  accessibilityLabel = 'Độ phủ Grad-CAM',
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;
  const trackWidthRef = useRef<number>(300);

  const clampAndStep = React.useCallback(
    (rawVal: number): number => {
      const clamped = Math.max(min, Math.min(max, rawVal));
      const stepped = Math.round(clamped / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step],
  );

  const handleTouch = React.useCallback(
    (evt: GestureResponderEvent) => {
      if (disabled || trackWidthRef.current <= 0) return;
      const locationX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, locationX / trackWidthRef.current));
      const calculated = min + ratio * (max - min);
      onValueChange(clampAndStep(calculated));
    },
    [disabled, min, max, onValueChange, clampAndStep],
  );

  const panResponder = React.useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- React Compiler nhận nhầm việc truyền callback closure của PanResponder là đọc ref khi render (cảnh báo giả)
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
      }),
    [disabled, handleTouch],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  };

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.bg.sunken,
            borderRadius: radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: colors.brand.primary,
              borderRadius: radius.full,
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.thumb,
          {
            left: `${percentage}%`,
            backgroundColor: colors.bg.surface,
            borderColor: colors.brand.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
  },
  track: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: -12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
