import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { AppText, Button, Dialog, ListRow, StatusBadge, TopBar } from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import { useAuth } from '../../auth/context/AuthContext';

export interface AdminProfileScreenProps {
  onLogoutSuccess?: () => void;
}

/**
 * SCR-U01 biến thể Quản trị viên (11-admin-profile): Màn hình Tôi của Admin.
 * - Thông tin: Quản trị viên, admin@example.com, Vai trò: Quản trị viên, Badge: Hoạt động.
 * - Danh mục:
 *   + Đổi mật khẩu (Bảo mật tài khoản)
 *   + Cài đặt (Tùy chọn ngôn ngữ Việt–Anh và chế độ Sáng–Tối)
 *   + Đăng xuất
 * - RÀNG BUỘC THEO HƯỚNG DẪN UI-08:
 *   Ẩn hoàn toàn "Thùng rác" và "Trung tâm đồng bộ" (chỉ thuộc thẩm quyền của Bác sĩ).
 */
export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({ onLogoutSuccess }) => {
  const { t, i18n } = useTranslation();
  const { theme, preference, setPreference } = useTheme();
  const { colors, spacing, radius } = theme;
  const { logout } = useAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPasswordNotice, setShowPasswordNotice] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    if (onLogoutSuccess) {
      onLogoutSuccess();
    }
  };

  const handleToggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  const handleToggleTheme = () => {
    setPreference(preference === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar title={t('admin.profile_title', 'Tôi')} type="root" />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ hồ sơ Admin */}
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
              <AppText variant="titleM">{t('admin.role_admin', 'Quản trị viên')}</AppText>
              <AppText variant="bodyS" color={colors.text.secondary} style={{ marginTop: 2 }}>
                admin@example.com
              </AppText>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.md }]}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.role_label', 'Vai trò')}
            </AppText>
            <AppText variant="bodyM">{t('admin.role_admin', 'Quản trị viên')}</AppText>
          </View>

          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <AppText variant="bodyS" color={colors.text.secondary}>
              {t('admin.status_active', 'Trạng thái')}
            </AppText>
            <StatusBadge
              label={t('admin.status_active', 'Hoạt động')}
              tone="success"
              icon="success"
            />
          </View>
        </View>

        {/* Các mục quản lý cài đặt */}
        <View style={{ marginTop: spacing.xs }}>
          <ListRow
            title={t('admin.action_change_password', 'Đổi mật khẩu')}
            subtitle={t('admin.action_change_password_sub', 'Bảo mật tài khoản')}
            type="setting"
            leadingIcon="lock"
            onPress={() => setShowPasswordNotice(true)}
            style={{ marginBottom: spacing.xs }}
          />

          <ListRow
            title={t('admin.action_settings', 'Cài đặt')}
            subtitle={
              i18n.language === 'en'
                ? `English · ${preference === 'dark' ? 'Dark' : 'Light'} Mode`
                : `Tiếng Việt · Giao diện ${preference === 'dark' ? 'Tối' : 'Sáng'}`
            }
            type="setting"
            leadingIcon="settings"
            onPress={() => setShowSettingsDialog(true)}
            style={{ marginBottom: spacing.xs }}
          />
        </View>

        {/* Nút Đăng xuất */}
        <View style={{ marginTop: spacing.lg }}>
          <Button
            label={t('admin.action_logout', 'Đăng xuất')}
            variant="danger"
            onPress={() => setShowLogoutDialog(true)}
          />
        </View>
      </ScrollView>

      {/* Dialog Cài đặt (Đổi ngôn ngữ + Đổi giao diện) */}
      <Dialog
        visible={showSettingsDialog}
        type="default"
        title={t('admin.action_settings', 'Cài đặt')}
        body={
          i18n.language === 'en'
            ? 'Adjust your preferred application language and color theme.'
            : 'Tùy chỉnh ngôn ngữ hiển thị và chủ đề giao diện Sáng / Tối.'
        }
        confirmLabel={i18n.language === 'en' ? 'Switch to Tiếng Việt' : 'Đổi sang English'}
        cancelLabel={preference === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}
        onConfirm={() => {
          handleToggleLanguage();
          setShowSettingsDialog(false);
        }}
        onCancel={() => {
          handleToggleTheme();
          setShowSettingsDialog(false);
        }}
      />

      {/* Dialog thông báo Đổi mật khẩu */}
      <Dialog
        visible={showPasswordNotice}
        type="default"
        title={t('admin.feature_notice_title', 'Tính năng Quản trị')}
        body={t(
          'admin.feature_notice_body',
          'Chức năng thay đổi mật khẩu quản trị sẽ được tích hợp ở đợt cập nhật tiếp theo.',
        )}
        confirmLabel={t('doctor_detail.common_dialog_close', 'Đã hiểu')}
        onConfirm={() => setShowPasswordNotice(false)}
        onCancel={() => setShowPasswordNotice(false)}
      />

      {/* Dialog xác nhận Đăng xuất */}
      <Dialog
        visible={showLogoutDialog}
        type="destructive"
        title={t('admin.logout_confirm_title', 'Đăng xuất quản trị viên?')}
        body={t(
          'admin.logout_confirm_body',
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Quản trị viên?',
        )}
        confirmLabel={t('admin.logout_confirm_btn', 'Đăng xuất')}
        cancelLabel={t('admin.logout_cancel_btn', 'Ở lại')}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
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
});
