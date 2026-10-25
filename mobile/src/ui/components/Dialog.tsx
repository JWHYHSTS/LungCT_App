import React from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

export type DialogType = 'default' | 'destructive';

export interface DialogProps {
  /** Hiển thị hay ẩn modal */
  visible: boolean;
  /** Loại hộp thoại: default hoặc destructive (xóa/hủy) */
  type?: DialogType;
  /** Tiêu đề hộp thoại */
  title: string;
  /** Nội dung thông điệp chi tiết */
  body: string;
  /** Nhãn nút Xác nhận */
  confirmLabel?: string;
  /** Nhãn nút Hủy */
  cancelLabel?: string;
  /** Callback khi nhấn Xác nhận */
  onConfirm: () => void;
  /** Callback khi nhấn Hủy hoặc đóng scrim */
  onCancel: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hộp thoại cảnh báo/xác nhận Dialog chuẩn hóa.
 * - Màn che Scrim 50% đen (#00000080).
 * - Ràng buộc: Đối với loại destructive (xóa vĩnh viễn), mặc định nút Hủy được ưu tiên nhấn mạnh
 *   để phòng tránh thao tác nhầm lẫn theo nguyên tắc an toàn dữ liệu y tế.
 */
export const Dialog: React.FC<DialogProps> = ({
  visible,
  type = 'default',
  title,
  body,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const isDestructive = type === 'destructive';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable
          style={[
            styles.dialogContainer,
            {
              backgroundColor: colors.bg.surface,
              borderRadius: radius.lg,
              padding: spacing.lg,
              gap: spacing.md,
            },
            style,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <AppText variant="titleM" color={colors.text.primary}>
            {title}
          </AppText>

          <AppText variant="bodyM" color={colors.text.secondary}>
            {body}
          </AppText>

          <View style={[styles.actionsRow, { gap: spacing.sm }]}>
            {/* Với destructive, nút Hủy là primary để tránh xóa nhầm */}
            <Button
              label={cancelLabel}
              variant={isDestructive ? 'primary' : 'secondary'}
              size="M"
              onPress={onCancel}
              style={styles.actionBtn}
            />

            <Button
              label={confirmLabel}
              variant={isDestructive ? 'danger' : 'primary'}
              size="M"
              onPress={onConfirm}
              style={styles.actionBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Scrim 50% chuẩn
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 340,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionBtn: {
    minWidth: 100,
  },
});
