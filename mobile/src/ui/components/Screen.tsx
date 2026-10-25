import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface ScreenProps {
  /** Có bật thanh cuộn hay không (mặc định: true) */
  scrollable?: boolean;
  /** Header cố định phía trên (ví dụ TopBar) */
  header?: React.ReactNode;
  /** Footer cố định phía dưới (ví dụ TabBar hoặc nút hành động đáy) */
  footer?: React.ReactNode;
  /** Lề ngang vùng nội dung (mặc định: 16) */
  paddingHorizontal?: number;
  /** Nội dung màn hình */
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Khung màn hình cơ bản (Screen) chuẩn hóa của hệ thống LungCT.
 * - Tự động bao bọc SafeAreaView và KeyboardAvoidingView.
 * - Nền màn hình chuẩn theo `colors.bg.app`.
 * - Vùng nội dung cuộn mượt mà với lề chuẩn 16 điểm ảnh (spacing.lg).
 */
export const Screen: React.FC<ScreenProps> = ({
  scrollable = true,
  header,
  footer,
  paddingHorizontal,
  children,
  style,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const horizontalPadding = paddingHorizontal ?? spacing.lg;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg.app }, style]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}

        {scrollable ? (
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: horizontalPadding, paddingVertical: spacing.md },
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.container,
              { paddingHorizontal: horizontalPadding, paddingVertical: spacing.md },
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        )}

        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
