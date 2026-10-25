import React, { useEffect } from 'react';
import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type SnackbarType = 'info' | 'success' | 'error';

export interface SnackbarProps {
  /** Hiển thị hay ẩn */
  visible: boolean;
  /** Thông điệp hiển thị */
  message: string;
  /** Loại thông báo */
  type?: SnackbarType;
  /** Nhãn hành động phụ */
  actionLabel?: string;
  /** Callback khi nhấn hành động */
  onActionPress?: () => void;
  /** Callback khi hết thời gian tự đóng */
  onDismiss?: () => void;
  /** Thời gian tự tắt (ms), mặc định 4000ms */
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thanh thông báo nổi Snackbar ở cạnh dưới màn hình.
 * Tự động biến mất sau thời gian định sẵn hoặc nhấn nút hành động.
 */
export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  actionLabel,
  onActionPress,
  onDismiss,
  duration = 4000,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const opacity = React.useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      if (duration > 0 && onDismiss) {
        timer = setTimeout(() => {
          onDismiss();
        }, duration);
      }
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, duration, onDismiss, opacity]);

  if (!visible) return null;

  // Xác định màu sắc theo loại
  let backgroundColor = colors.bg.inverse;
  let textColor = colors.text.onBrand;

  if (type === 'error') {
    backgroundColor = colors.status.danger.fg;
  } else if (type === 'success') {
    backgroundColor = colors.status.success.fg;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <AppText variant="bodyS" color={textColor} style={styles.message}>
        {message}
      </AppText>

      {actionLabel && (
        <Pressable
          onPress={() => {
            onActionPress?.();
            onDismiss?.();
          }}
          accessibilityRole="button"
          style={styles.action}
        >
          <AppText variant="labelS" color={colors.brand.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    marginRight: 8,
  },
  action: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
