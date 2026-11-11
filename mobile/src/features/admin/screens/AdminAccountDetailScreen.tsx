import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Button,
  Dialog,
  Divider,
  EmptyState,
  StatusBadge,
  TextField,
  TopBar,
} from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import {
  approveDoctorAccount,
  findAdminDoctorById,
  getAuditLogsForDoctor,
  lockDoctorAccount,
  subscribeAdminStore,
  type AdminAuditLog,
  type AdminDoctorAccount,
} from '../../../mocks/adminMocks';
import {
  approveDoctorInFirestore,
  getDoctorAccountById,
  lockDoctorInFirestore,
} from '../../../services/firebase/adminService';
import { useAuth } from '../../auth/context/AuthContext';

export interface AdminAccountDetailScreenProps {
  accountId: string;
  onBack: () => void;
}

/**
 * SCR-M02 (12-admin-account-detail): Màn hình Quản trị viên · Chi tiết tài khoản.
 * - Thông tin tài khoản: Họ tên, email, nơi công tác, chuyên khoa, ngày đăng ký, trạng thái.
 * - Dòng lưu ý bảo mật bắt buộc theo BR-OWN-03:
 *   "Không hiển thị dữ liệu bệnh nhân, ca hay ảnh CT của tài khoản này."
 * - Nhật ký thao tác quản trị (lịch sử duyệt/khóa).
 * - Nút "Duyệt tài khoản" (cho tài khoản pending).
 * - Nút "Khóa tài khoản": mở modal bắt buộc nhập lý do (nút xác nhận disabled nếu lý do rỗng).
 * - Q-11: Tuyệt đối không vẽ nút "Từ chối" vì chưa có quy định nghiệp vụ chốt.
 */
export const AdminAccountDetailScreen: React.FC<AdminAccountDetailScreenProps> = ({
  accountId,
  onBack,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { isOnline } = useAuth();

  const [account, setAccount] = useState<AdminDoctorAccount | undefined>(() =>
    findAdminDoctorById(accountId),
  );
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() =>
    getAuditLogsForDoctor(accountId),
  );

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [lockError, setLockError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Tải dữ liệu thật từ Cloud Firestore
    let isMounted = true;
    getDoctorAccountById(accountId).then((docData) => {
      if (isMounted && docData) {
        setAccount(docData);
      }
    });

    const unsubscribe = subscribeAdminStore(() => {
      setAccount((prev) => prev || findAdminDoctorById(accountId));
      setAuditLogs(getAuditLogsForDoctor(accountId));
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [accountId]);

  if (!account) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar
          title={t('admin.account_detail_title', 'Chi tiết tài khoản')}
          type="stack"
          onBackPress={onBack}
        />
        <View style={[styles.centerBox, { padding: spacing.lg }]}>
          <EmptyState
            title={t('admin.account_not_found', 'Không tìm thấy tài khoản bác sĩ.')}
            body=""
            type="noData"
            actionLabel={t('common.back', 'Quay lại')}
            onActionPress={onBack}
          />
        </View>
      </View>
    );
  }

  const handleConfirmApprove = async () => {
    if (!isOnline || isSubmitting) return;
    setIsSubmitting(true);
    setShowApproveDialog(false);
    try {
      await approveDoctorInFirestore(account.id);
      setAccount((prev) => (prev ? { ...prev, status: 'active' } : prev));
      approveDoctorAccount(account.id);
    } catch (err) {
      console.error('[AdminAccountDetail] approve error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLockDialog = () => {
    if (!isOnline) return;
    setLockReason('');
    setLockError(null);
    setShowLockDialog(true);
  };

  const handleCloseLockDialog = () => {
    setLockReason('');
    setLockError(null);
    setShowLockDialog(false);
  };

  const handleConfirmLock = async () => {
    if (!isOnline || isSubmitting) return;
    const trimmed = lockReason.trim();
    if (!trimmed) {
      setLockError(
        t('admin.lock_reason_required_hint', 'Vui lòng nhập lý do khóa trước khi xác nhận.'),
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await lockDoctorInFirestore(account.id, trimmed);
      setAccount((prev) => (prev ? { ...prev, status: 'locked' } : prev));
      lockDoctorAccount(account.id, trimmed);
    } catch (err) {
      console.error('[AdminAccountDetail] lock error:', err);
    } finally {
      setShowLockDialog(false);
      setLockReason('');
      setLockError(null);
      setIsSubmitting(false);
    }
  };

  const isLockSubmitDisabled = !lockReason.trim() || !isOnline || isSubmitting;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('admin.account_detail_title', 'Chi tiết tài khoản')}
        type="stack"
        onBackPress={onBack}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ thông tin bác sĩ */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatarWrapper}>
              <Icon name="profile" size={48} color={colors.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="titleM">{account.fullName}</AppText>
              <AppText variant="bodyS" color={colors.text.secondary} style={{ marginTop: 2 }}>
                {account.email}
              </AppText>
            </View>
          </View>

          <View style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            {account.status === 'pending' && (
              <StatusBadge
                label={t('admin.status_pending', 'Chờ duyệt')}
                tone="warning"
                icon="pending"
              />
            )}
            {account.status === 'active' && (
              <StatusBadge
                label={t('admin.status_active', 'Hoạt động')}
                tone="success"
                icon="success"
              />
            )}
            {account.status === 'locked' && (
              <StatusBadge label={t('admin.status_locked', 'Đã khóa')} tone="danger" icon="lock" />
            )}
          </View>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={styles.metaRow}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.workplace_label', 'Nơi công tác')}
            </AppText>
            <AppText variant="bodyM">{account.workplace}</AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.specialty_label', 'Chuyên khoa')}
            </AppText>
            <AppText variant="bodyM">{account.specialty}</AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.registered_label', 'Đăng ký')}
            </AppText>
            <AppText variant="bodyM">{account.registeredAt}</AppText>
          </View>

          {account.lockReason && (
            <View
              style={[
                styles.lockReasonBox,
                {
                  backgroundColor: colors.status.danger.bg,
                  borderRadius: radius.md,
                  padding: spacing.sm,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <AppText variant="caption" style={{ color: colors.status.danger.fg }}>
                {t('admin.audit_reason_prefix', {
                  reason: account.lockReason,
                  defaultValue: `Lý do khóa: ${account.lockReason}`,
                })}
              </AppText>
            </View>
          )}
        </View>

        {/* Khung bảo mật BR-OWN-03 & Thông báo phạm vi mô phỏng */}
        <View
          style={[
            styles.privacyBox,
            {
              backgroundColor: colors.bg.surfaceAlt,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="caption" color={colors.text.secondary}>
            {t(
              'admin.privacy_notice',
              'Không hiển thị dữ liệu bệnh nhân, ca hay ảnh CT của tài khoản này (BR-OWN-03).',
            )}
          </AppText>
          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={{ marginTop: spacing.xxs }}
          >
            {t(
              'admin.mock_scope_notice',
              'Thao tác duyệt và khóa tài khoản hiện chỉ cập nhật trạng thái trong phiên mô phỏng (mock data), chưa áp dụng hoặc khóa tài khoản thực tế qua Firebase/Backend.',
            )}
          </AppText>
        </View>

        {/* Nhật ký thao tác quản trị */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleS">
            {t('admin.audit_log_title', 'Nhật ký thao tác quản trị')}
          </AppText>
        </View>

        {auditLogs.length === 0 ? (
          <View style={{ paddingVertical: spacing.sm }}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.audit_log_empty', 'Chưa có thao tác.')}
            </AppText>
          </View>
        ) : (
          auditLogs.map((log) => (
            <View
              key={log.id}
              style={[
                styles.auditItem,
                {
                  backgroundColor: colors.bg.surface,
                  borderColor: colors.border.default,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={styles.metaRow}>
                <AppText variant="labelM">
                  {log.action === 'approve'
                    ? t('admin.audit_action_approve', 'Duyệt kích hoạt tài khoản')
                    : t('admin.audit_action_lock', 'Khóa tài khoản')}
                </AppText>
                <AppText variant="caption" color={colors.text.tertiary}>
                  {log.performedAt}
                </AppText>
              </View>
              {log.reason && (
                <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 4 }}>
                  {t('admin.audit_reason_prefix', {
                    reason: log.reason,
                    defaultValue: `Lý do: ${log.reason}`,
                  })}
                </AppText>
              )}
            </View>
          ))
        )}

        {/* Nút hành động Duyệt / Khóa (Disabled khi offline theo Q-22) */}
        <View style={{ marginTop: spacing.lg }}>
          {account.status === 'pending' && (
            <Button
              label={t('admin.btn_approve', 'Duyệt tài khoản')}
              variant="primary"
              leadingIcon="account-approval"
              disabled={!isOnline}
              onPress={() => setShowApproveDialog(true)}
              style={{ marginBottom: spacing.sm }}
            />
          )}

          {account.status !== 'locked' && (
            <Button
              label={t('admin.btn_lock', 'Khóa tài khoản')}
              variant="danger"
              leadingIcon="lock"
              disabled={!isOnline}
              onPress={handleOpenLockDialog}
            />
          )}
        </View>
      </ScrollView>

      {/* Dialog xác nhận duyệt */}
      <Dialog
        visible={showApproveDialog}
        type="default"
        title={t('admin.approve_confirm_title', 'Duyệt tài khoản bác sĩ?')}
        body={t('admin.approve_confirm_body', {
          name: account.fullName,
          defaultValue: `Bác sĩ ${account.fullName} sẽ có quyền đăng nhập và thực hiện chẩn đoán hình ảnh trên hệ thống.`,
        })}
        confirmLabel={t('admin.approve_confirm_btn', 'Xác nhận duyệt')}
        cancelLabel={t('common.cancel', 'Hủy')}
        onConfirm={handleConfirmApprove}
        onCancel={() => setShowApproveDialog(false)}
      />

      {/* Modal Khóa tài khoản - Bắt buộc nhập lý do */}
      <Modal
        visible={showLockDialog}
        transparent
        animationType="fade"
        onRequestClose={handleCloseLockDialog}
      >
        <Pressable style={styles.modalScrim} onPress={handleCloseLockDialog}>
          <Pressable
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.bg.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.md,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <AppText variant="titleM" color={colors.text.primary}>
              {t('admin.lock_dialog_title', 'Khóa tài khoản bác sĩ')}
            </AppText>

            <AppText variant="bodyM" color={colors.text.secondary}>
              {t('admin.lock_dialog_body', {
                name: account.fullName,
                defaultValue: `Tài khoản ${account.fullName} sẽ bị vô hiệu hóa quyền truy cập hệ thống ngay lập tức.`,
              })}
            </AppText>

            <View style={{ marginTop: spacing.xs }}>
              <TextField
                label={t('admin.lock_reason_label', 'Lý do khóa tài khoản (*)')}
                placeholder={t('admin.lock_reason_placeholder', 'Nhập lý do cụ thể (bắt buộc)...')}
                value={lockReason}
                onChangeText={(text) => {
                  setLockReason(text);
                  if (text.trim()) setLockError(null);
                }}
                error={lockError || undefined}
                multiline
                numberOfLines={3}
              />
              {isLockSubmitDisabled && (
                <AppText variant="caption" color={colors.status.danger.fg} style={{ marginTop: 4 }}>
                  {t(
                    'admin.lock_reason_required_hint',
                    'Vui lòng nhập lý do khóa trước khi xác nhận.',
                  )}
                </AppText>
              )}
            </View>

            <View style={[styles.modalActionsRow, { gap: spacing.sm }]}>
              <Button
                label={t('admin.lock_cancel_btn', 'Hủy')}
                variant="primary"
                size="M"
                onPress={handleCloseLockDialog}
                style={styles.modalActionBtn}
              />

              <Button
                label={t('admin.lock_confirm_btn', 'Xác nhận khóa')}
                variant="danger"
                size="M"
                disabled={isLockSubmitDisabled}
                onPress={handleConfirmLock}
                style={styles.modalActionBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockReasonBox: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  privacyBox: {
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  auditItem: {
    borderWidth: 1,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalActionBtn: {
    flex: 1,
  },
});
