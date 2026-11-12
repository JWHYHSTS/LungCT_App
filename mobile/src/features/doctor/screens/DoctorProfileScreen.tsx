import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { AppText, Button, Dialog, ListRow, StatusBadge, TopBar } from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import { MOCK_DOCTOR_PROFILE } from '../../../mocks';
import { useAuth } from '../../auth/context/AuthContext';
import { SyncEngine } from '../../../services/sync';
import {
  subscribeCaseRepository,
  subscribePatientRepository,
} from '../../../services/storage';
import { SyncCenterModal } from '../components/SyncCenterModal';

export interface DoctorProfileScreenProps {
  onLogoutSuccess?: () => void;
}

export const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ onLogoutSuccess }) => {
  const { t, i18n } = useTranslation();
  const { theme, preference, setPreference } = useTheme();
  const { colors, spacing } = theme;
  const { logout, user, isOnline, resetPassword } = useAuth();
  const ownerId = user?.id || '';

  const doctorName = user?.fullName || MOCK_DOCTOR_PROFILE.fullName;
  const doctorEmail = user?.email || MOCK_DOCTOR_PROFILE.email;
  const doctorWorkplace = user?.workplace || MOCK_DOCTOR_PROFILE.workplace;
  const doctorSpecialty = user?.specialty || MOCK_DOCTOR_PROFILE.specialty;
  const doctorRole = user?.role === 'doctor' ? t('ui.bac_si', 'Bác sĩ') : t('ui.quan_tri_vien', 'Quản trị viên');
  const doctorStatus = user?.status === 'active' ? t('admin.status_active', 'Hoạt động') : user?.status === 'pending' ? t('admin.status_pending', 'Chờ duyệt') : t('admin.status_locked', 'Đã khóa');

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const refreshPendingCount = async () => {
      if (!ownerId) return;
      const stats = await SyncEngine.getPendingStats(ownerId);
      if (isMounted) {
        setPendingCount(stats.totalPending);
      }
    };
    refreshPendingCount();
    const unsubSync = SyncEngine.subscribeSyncStatus(() => refreshPendingCount());
    const unsubPat = subscribePatientRepository(refreshPendingCount);
    const unsubCase = subscribeCaseRepository(refreshPendingCount);
    return () => {
      isMounted = false;
      unsubSync();
      unsubPat();
      unsubCase();
    };
  }, [ownerId]);

  const [dialogNotice, setDialogNotice] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({
    visible: false,
    title: '',
    body: '',
  });

  const showFeatureNotice = (title: string, body: string) => {
    setDialogNotice({ visible: true, title, body });
  };

  const closeNotice = () => {
    setDialogNotice({ visible: false, title: '', body: '' });
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    if (onLogoutSuccess) {
      onLogoutSuccess();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar title={t('navigation.tab_profile', 'Tôi')} type="root" />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
            },
          ]}
        >
          <View style={styles.profileHeaderRow}>
            <Icon name="profile" size={48} color={colors.brand.primary} />
            <View style={styles.profileHeaderInfo}>
              <AppText variant="titleM">{doctorName}</AppText>
              <AppText variant="bodyS" style={{ color: colors.text.secondary, marginTop: 2 }}>
                {doctorEmail}
              </AppText>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.md }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              {t('ui.noi_cong_tac_2', 'Nơi công tác')}
            </AppText>
            <AppText variant="bodyM">
              {doctorWorkplace}
            </AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              {t('ui.chuyen_khoa_2', 'Chuyên khoa')}
            </AppText>
            <AppText variant="bodyM">
              {doctorSpecialty}
            </AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              {t('ui.vai_tro', 'Vai trò')}
            </AppText>
            <AppText variant="bodyM">
              {doctorRole}
            </AppText>
          </View>

          <View style={[styles.statusBadgeWrapper, { marginTop: spacing.sm }]}>
            <StatusBadge
              label={doctorStatus}
              tone={user?.status === 'active' ? 'success' : user?.status === 'pending' ? 'warning' : 'danger'}
              icon={user?.status === 'active' ? 'success' : user?.status === 'pending' ? 'pending' : 'lock'}
            />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <ListRow
            title={t('admin.action_change_password', 'Đổi mật khẩu')}
            subtitle={t('admin.action_change_password_sub', 'Bảo mật tài khoản')}
            type="setting"
            leadingIcon="lock"
            onPress={async () => {
              if (!isOnline || !user?.email) {
                showFeatureNotice(
                  t('admin.action_change_password', 'Đổi mật khẩu'),
                  t(
                    'sync.offline_desc',
                    'Thiết bị đang ngoại tuyến. Vui lòng kết nối Internet để gửi email đổi mật khẩu.',
                  ),
                );
                return;
              }
              const ok = await resetPassword(user.email);
              showFeatureNotice(
                t('admin.action_change_password', 'Đổi mật khẩu'),
                ok
                  ? `Liên kết đặt lại mật khẩu đã được gửi tới email ${user.email}. Vui lòng kiểm tra hòm thư (kể cả Spam) để đổi mật khẩu.`
                  : 'Không thể gửi email đổi mật khẩu. Vui lòng kiểm tra kết nối mạng.',
              );
            }}
            style={{ marginBottom: spacing.xs }}
          />

          <ListRow
            title={t('admin.action_settings', 'Cài đặt')}
            subtitle={
              i18n.language === 'en'
                ? `English · ${preference === 'system' ? 'System Default' : preference === 'dark' ? 'Dark Mode' : 'Light Mode'}`
                : `Tiếng Việt · Giao diện ${preference === 'system' ? 'Theo hệ thống' : preference === 'dark' ? 'Tối' : 'Sáng'}`
            }
            type="setting"
            leadingIcon="settings"
            onPress={() => setShowLanguageDialog(true)}
            style={{ marginBottom: spacing.xs }}
          />

          <ListRow
            title={t('label.thung_rac', 'Thùng rác')}
            subtitle={t('common.trash_subtitle', 'Khôi phục hoặc dọn dẹp ca và bệnh nhân đã xóa')}
            type="setting"
            leadingIcon="trash"
            onPress={() =>
              showFeatureNotice(
                'Thùng rác (SCR-T01)',
                'Giao diện quản lý các mục đã xóa mềm (SCR-T01) sẽ được hoàn thiện ở gói UI-09.',
              )
            }
            style={{ marginBottom: spacing.xs }}
          />

          <ListRow
            title={t('navigation.sync_center', 'Trung tâm đồng bộ')}
            subtitle={
              pendingCount > 0
                ? t('sync.pending_count_real', {
                    count: pendingCount,
                    defaultValue: `${pendingCount} thay đổi chờ gửi`,
                  })
                : t('sync.all_synced_sub', 'Tất cả hồ sơ đã được đồng bộ')
            }
            type="setting"
            leadingIcon="sync"
            badges={
              <StatusBadge
                label={
                  pendingCount > 0
                    ? `${pendingCount} ${t('common.item_unit', 'mục')}`
                    : t('sync.status_synced_badge', 'Đã đồng bộ')
                }
                tone={pendingCount > 0 ? 'warning' : 'success'}
                icon={pendingCount > 0 ? 'sync' : 'success'}
              />
            }
            onPress={() => setShowSyncModal(true)}
            style={{ marginBottom: spacing.xs }}
          />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Button label={t('admin.action_logout', 'Đăng xuất')} variant="danger" onPress={() => setShowLogoutDialog(true)} />
        </View>
      </ScrollView>

      {/* Dialog Cài đặt (SET-01: Ngôn ngữ, SET-02: Chủ đề Sáng/Tối/Theo hệ thống) */}
      <Dialog
        visible={showLanguageDialog}
        type="default"
        title={t('admin.action_settings', 'Cài đặt')}
        body={t(
          'admin.settings_dialog_body_full',
          'Tùy chỉnh ngôn ngữ hiển thị và chủ đề giao diện (Sáng / Tối / Theo hệ thống).',
        )}
        confirmLabel={i18n.language === 'en' ? 'Switch to Tiếng Việt' : 'Đổi sang English'}
        cancelLabel={
          preference === 'dark'
            ? t('admin.theme_switch_to_light', 'Chế độ Sáng')
            : t('admin.theme_switch_to_dark', 'Chế độ Tối')
        }
        neutralLabel={t('admin.theme_system', 'Theo hệ thống')}
        onConfirm={() => {
          setShowLanguageDialog(false);
          i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
        }}
        onCancel={() => {
          setShowLanguageDialog(false);
          setPreference(preference === 'dark' ? 'light' : 'dark');
        }}
        onNeutral={() => {
          setShowLanguageDialog(false);
          setPreference('system');
        }}
      />

      <Dialog
        visible={showLogoutDialog}
        type="destructive"
        title={t('auth.logout_dialog_title', 'Đăng xuất khỏi ứng dụng?')}
        body={
          pendingCount > 0
            ? t('auth.logout_dialog_pending_body', {
                count: pendingCount,
                defaultValue: `Hiện còn ${pendingCount} thay đổi chưa được gửi lên máy chủ đám mây. Dữ liệu này vẫn được lưu an toàn trên máy của bạn và sẽ tự động đồng bộ khi bạn đăng nhập lại (MSG-14).`,
              })
            : t(
                'auth.logout_dialog_clean_body',
                'Tất cả dữ liệu ca bệnh của bạn đã được đồng bộ. Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này không?',
              )
        }
        confirmLabel={t('admin.action_logout', 'Đăng xuất')}
        cancelLabel={t('admin.logout_cancel_btn', 'Ở lại')}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <Dialog
        visible={dialogNotice.visible}
        type="default"
        title={dialogNotice.title}
        body={dialogNotice.body}
        confirmLabel={t('common.understood', 'Đã hiểu')}
        onConfirm={closeNotice}
        onCancel={closeNotice}
      />

      <SyncCenterModal
        visible={showSyncModal}
        ownerId={ownerId}
        isOnline={isOnline}
        onClose={() => setShowSyncModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeWrapper: {
    alignSelf: 'flex-start',
  },
});
