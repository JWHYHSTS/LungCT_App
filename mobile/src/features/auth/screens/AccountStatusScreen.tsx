import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../ui/theme';
import { AppText, Banner, Button, Dialog, StatusBadge } from '../../../ui/components';
import { Icon } from '../../../ui/icons';

interface AccountStatusScreenProps {
  status?: 'pending' | 'locked';
  onNavigateToLogin: () => void;
}

/**
 * Màn hình Trạng thái tài khoản (SCR-A04) - UI-05.
 * - Hỗ trợ cả 2 trạng thái:
 *   1. Chờ duyệt (Pending): Biểu tượng pending cam, thông điệp chuẩn MSG-06.
 *   2. Bị khóa (Locked): Biểu tượng lock đỏ, thông điệp chuẩn MSG-07 (BR-AUTH-05).
 * - Nút "Kiểm tra lại trạng thái" chỉ bật khi có kết nối mạng (isOnline).
 * - Nút "Về màn hình đăng nhập" luôn cho phép quay lại.
 */
export const AccountStatusScreen: React.FC<AccountStatusScreenProps> = ({
  status = 'pending',
  onNavigateToLogin,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { t } = useTranslation();
  const { isOnline } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [showStatusResult, setShowStatusResult] = useState(false);

  const isPending = status === 'pending';

  const handleCheckStatus = async () => {
    if (!isOnline || isChecking) return;
    setIsChecking(true);
    // Giả lập kiểm tra lại trạng thái với backend
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsChecking(false);
    setShowStatusResult(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <View style={[styles.content, { padding: spacing.lg, gap: spacing.md }]}>
        {/* Banner cảnh báo nếu thiết bị đang ngoại tuyến */}
        {!isOnline && (
          <Banner
            type="warning"
            title={t('label.ang_ngoai_tuyen', 'Đang ngoại tuyến')}
            body={t(
              'ui.kiem_tra_trang_thai_can_ket_noi_mang',
              'Cần kết nối mạng để kiểm tra trạng thái duyệt tài khoản mới nhất.',
            )}
            style={{ width: '100%', marginBottom: spacing.md }}
          />
        )}

        {/* Khối biểu tượng tròn lớn trung tâm */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isPending ? colors.status.pending.bg : colors.status.danger.bg,
            },
          ]}
        >
          <Icon
            name={isPending ? 'pending' : 'lock'}
            size={52}
            color={isPending ? colors.status.pending.fg : colors.status.danger.fg}
          />
        </View>

        {/* Huy hiệu trạng thái */}
        <StatusBadge
          tone={isPending ? 'pending' : 'danger'}
          label={isPending ? t('label.cho_duyet', 'Chờ duyệt') : t('label.bi_khoa', 'Bị khóa')}
        />

        {/* Tiêu đề trạng thái */}
        <AppText variant="titleL" color={colors.text.primary} style={styles.title}>
          {isPending
            ? t('ui.tai_khoan_ang_cho_duyet', 'Tài khoản đang chờ duyệt')
            : t('ui.tai_khoan_a_bi_khoa', 'Tài khoản đã bị khóa')}
        </AppText>

        {/* Thông điệp chuẩn bắt buộc MSG-06 / MSG-07 */}
        <AppText variant="bodyM" color={colors.text.secondary} style={styles.description}>
          {isPending
            ? t(
                'msg.msg_06',
                'Tài khoản đang chờ quản trị viên duyệt. Bạn sẽ nhận thông báo khi được duyệt.',
              )
            : t(
                'msg.msg_07',
                'Tài khoản đã bị khóa. Liên hệ quản trị viên. Dữ liệu chưa đồng bộ được giữ an toàn trên máy.',
              )}
        </AppText>

        {/* Nút hành động */}
        <View style={[styles.actionGroup, { gap: spacing.sm }]}>
          <Button
            label={t('ui.ve_man_hinh_ang_nhap', 'Về màn hình đăng nhập')}
            onPress={onNavigateToLogin}
            variant="primary"
          />

          <Button
            label={t('ui.kiem_tra_lai_trang_thai', 'Kiểm tra lại trạng thái')}
            onPress={handleCheckStatus}
            disabled={!isOnline}
            loading={isChecking}
            variant="secondary"
          />
        </View>
      </View>

      {/* Hộp thoại thông báo kết quả kiểm tra trạng thái */}
      <Dialog
        visible={showStatusResult}
        type="default"
        title={t('ui.kiem_tra_lai_trang_thai', 'Kiểm tra lại trạng thái')}
        body={
          isPending
            ? t(
                'ui.tai_khoan_van_dang_cho_duyet_mock',
                '[Chế độ mô phỏng] Tài khoản vẫn đang chờ duyệt từ quản trị viên. Khi kết nối API thật (AUTH-02), trạng thái sẽ được đồng bộ trực tiếp từ máy chủ.',
              )
            : t(
                'ui.tai_khoan_van_bi_khoa_mock',
                '[Chế độ mô phỏng] Tài khoản hiện vẫn ở trạng thái bị khóa. Vui lòng liên hệ quản trị viên để mở khóa.',
              )
        }
        confirmLabel={t('ui.da_hieu', 'Đã hiểu')}
        onConfirm={() => setShowStatusResult(false)}
        onCancel={() => setShowStatusResult(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionGroup: {
    width: '100%',
  },
});
