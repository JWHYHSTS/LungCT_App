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
  /** Nhãn nút Hủy (truyền null nếu muốn ẩn nút Hủy cho dialog chỉ có 1 nút xác nhận/đóng) */
  cancelLabel?: string | null;
  /** Nhãn nút phụ/trung gian (ví dụ: Theo hệ thống) */
  neutralLabel?: string;
  /** Callback khi nhấn Xác nhận */
  onConfirm: () => void;
  /** Callback khi nhấn Hủy hoặc đóng scrim */
  onCancel: () => void;
  /** Callback khi nhấn nút phụ/trung gian */
  onNeutral?: () => void;
  /** Buộc xếp nút theo chiều dọc (stack full-width) */
  stackedActions?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hộp thoại cảnh báo/xác nhận Dialog chuẩn hóa.
 * - Màn che Scrim 50% đen.
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
  neutralLabel,
  onConfirm,
  onCancel,
  onNeutral,
  stackedActions,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const isDestructive = type === 'destructive';
  const shouldStack =
    stackedActions ??
    ((confirmLabel?.length ?? 0) > 16 || (cancelLabel ? cancelLabel.length > 14 : false));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Đóng hộp thoại"
        />
        <View
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
        >
          <AppText variant="titleM" color={colors.text.primary}>
            {title}
          </AppText>

          <AppText variant="bodyM" color={colors.text.secondary}>
            {body}
          </AppText>

          {neutralLabel && onNeutral ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              {shouldStack ? (
                <>
                  <Button
                    label={confirmLabel}
                    variant={isDestructive ? 'danger' : 'primary'}
                    size="M"
                    onPress={onConfirm}
                    style={{ width: '100%' }}
                  />
                  {cancelLabel ? (
                    <Button
                      label={cancelLabel}
                      variant={isDestructive ? 'primary' : 'secondary'}
                      size="M"
                      onPress={onCancel}
                      style={{ width: '100%' }}
                    />
                  ) : null}
                </>
              ) : (
                <View style={[styles.actionsRow, { gap: spacing.sm }]}>
                  {cancelLabel ? (
                    <Button
                      label={cancelLabel}
                      variant={isDestructive ? 'primary' : 'secondary'}
                      size="M"
                      onPress={onCancel}
                      style={styles.actionBtn}
                    />
                  ) : null}
                  <Button
                    label={confirmLabel}
                    variant={isDestructive ? 'danger' : 'primary'}
                    size="M"
                    onPress={onConfirm}
                    style={styles.actionBtn}
                  />
                </View>
              )}
              <Button
                label={neutralLabel}
                variant="tertiary"
                size="M"
                onPress={onNeutral}
                style={{ width: '100%' }}
              />
            </View>
          ) : cancelLabel ? (
            shouldStack ? (
              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                <Button
                  label={confirmLabel}
                  variant={isDestructive ? 'danger' : 'primary'}
                  size="M"
                  onPress={onConfirm}
                  style={{ width: '100%' }}
                />
                <Button
                  label={cancelLabel}
                  variant={isDestructive ? 'primary' : 'secondary'}
                  size="M"
                  onPress={onCancel}
                  style={{ width: '100%' }}
                />
              </View>
            ) : (
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
            )
          ) : (
            <Button
              label={confirmLabel}
              variant={isDestructive ? 'danger' : 'primary'}
              size="M"
              onPress={onConfirm}
              style={{ width: '100%' }}
            />
          )}
        </View>
      </View>
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
    maxWidth: 360,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionBtn: {
    minWidth: 90,
    flexShrink: 1,
  },
});
