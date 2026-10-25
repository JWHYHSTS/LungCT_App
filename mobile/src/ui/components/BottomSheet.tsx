import React from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface BottomSheetProps {
  /** Hiển thị hay ẩn */
  visible: boolean;
  /** Tiêu đề bảng dưới */
  title?: string;
  /** Callback đóng sheet (khi chạm scrim hoặc nút Back trên Android) */
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bảng trượt đáy BottomSheet.
 * Hỗ trợ đóng khi bấm ngoài nền (scrim 50%) và tự động bắt sự kiện Android Back.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  title,
  onClose,
  children,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.bg.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
              paddingTop: spacing.sm,
            },
            style,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Thanh nắm kéo (Drag handle) */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border.default }]} />
          </View>

          {title && (
            <View style={[styles.header, { marginBottom: spacing.md }]}>
              <AppText variant="titleS" color={colors.text.primary}>
                {title}
              </AppText>
            </View>
          )}

          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '80%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
  },
});
