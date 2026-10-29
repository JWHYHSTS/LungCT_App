import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { AppText, Button, Dialog, ListRow, StatusBadge, TopBar } from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import { MOCK_DOCTOR_PROFILE } from '../../../mocks';
import { useAuth } from '../../auth/context/AuthContext';

export interface DoctorProfileScreenProps {
  onLogoutSuccess?: () => void;
}

export const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ onLogoutSuccess }) => {
  const { t, i18n } = useTranslation();
  const { theme, preference, setPreference } = useTheme();
  const { colors, spacing } = theme;
  const { logout } = useAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

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
              <AppText variant="titleM">{MOCK_DOCTOR_PROFILE.fullName}</AppText>
              <AppText variant="bodyS" style={{ color: colors.text.secondary, marginTop: 2 }}>
                {MOCK_DOCTOR_PROFILE.email}
              </AppText>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.md }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              Nơi công tác
            </AppText>
            <AppText variant="bodyM">{MOCK_DOCTOR_PROFILE.workplace}</AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              Chuyên khoa
            </AppText>
            <AppText variant="bodyM">{MOCK_DOCTOR_PROFILE.specialty}</AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" style={{ color: colors.text.secondary }}>
              Vai trò
            </AppText>
            <AppText variant="bodyM">{MOCK_DOCTOR_PROFILE.role}</AppText>
          </View>

          <View style={[styles.statusBadgeWrapper, { marginTop: spacing.sm }]}>
            <StatusBadge label={MOCK_DOCTOR_PROFILE.status} tone="success" icon="success" />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <ListRow
            title={t('admin.action_change_password', 'Đổi mật khẩu')}
            subtitle={t('admin.action_change_password_sub', 'Bảo mật tài khoản')}
            type="setting"
            leadingIcon="lock"
            onPress={() =>
              showFeatureNotice(
                'Đổi mật khẩu (SCR-A06)',
                'Giao diện thay đổi mật khẩu và quản lý thông tin bảo mật sẽ được bổ sung ở đợt cập nhật tiếp theo.',
              )
            }
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
            subtitle={t('doctor_detail.trash_subtitle', 'Khôi phục hoặc dọn dẹp ca và bệnh nhân đã xóa')}
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
            subtitle={`${MOCK_DOCTOR_PROFILE.pendingSyncCount} ${t('sync.pending_count_sub', 'thay đổi chờ gửi (Mô phỏng)')}`}
            type="setting"
            leadingIcon="sync"
            badges={
              <StatusBadge
                label={`${MOCK_DOCTOR_PROFILE.pendingSyncCount} ${t('common.item_unit', 'mục')}`}
                tone="warning"
                icon="sync"
              />
            }
            onPress={() =>
              showFeatureNotice(
                'Trung tâm đồng bộ (SCR-Y01)',
                'Chi tiết hàng đợi đồng bộ và quản lý xung đột dữ liệu sẽ được triển khai ở gói SYNC-01.',
              )
            }
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
        title="Đăng xuất khỏi ứng dụng?"
        body="Hiện còn 3 thay đổi chưa được gửi lên máy chủ trung tâm. Dữ liệu này vẫn được lưu an toàn trên máy của bạn và sẽ được đồng bộ khi bạn đăng nhập lại (MSG-14)."
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <Dialog
        visible={dialogNotice.visible}
        type="default"
        title={dialogNotice.title}
        body={dialogNotice.body}
        confirmLabel="Đã hiểu"
        onConfirm={closeNotice}
        onCancel={closeNotice}
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
