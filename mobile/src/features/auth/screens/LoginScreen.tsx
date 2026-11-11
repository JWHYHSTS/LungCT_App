import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../ui/theme';
import { AppText, Banner, Button, Dialog, StatusBadge, TextField } from '../../../ui/components';
import { Icon } from '../../../ui/icons';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToAccountStatus: (status: 'pending' | 'locked') => void;
  onNavigateToForgotPassword?: () => void;
}

/**
 * Màn hình Đăng nhập (SCR-A02) - UI-05.
 * - Khớp thiết kế 01-login (bố cục, logo lung, chuyển ngữ VI/EN, badge kết nối, ô nhập, nút).
 * - Phân biệt rõ phần UI, dữ liệu giả lập và điểm móc xác thực thật (TODO(AUTH-02)).
 * - Hỗ trợ trạng thái ngoại tuyến: Hiển thị banner MSG-08, vô hiệu hóa Đăng ký / Quên mật khẩu.
 * - Hỗ trợ trạng thái loading (khóa bấm lặp), hiển thị lỗi trường / lỗi đăng nhập chung.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToAccountStatus,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { t, i18n } = useTranslation();
  const { login, isOnline, setIsOnline } = useAuth();

  const [email, setEmail] = useState('bs.an@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);

  const isFormEmpty = !email.trim() || !password.trim();

  // Đổi ngôn ngữ trực tiếp ngay trên header màn Đăng nhập theo layout 01-login
  const handleToggleLanguage = (lang: 'vi' | 'en') => {
    i18n.changeLanguage(lang);
  };

  const handleLogin = async () => {
    if (isFormEmpty || isLoading) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const result = await login(email, password);

      if (!result.success) {
        if (result.status === 'pending' || result.status === 'locked') {
          onNavigateToAccountStatus(result.status);
        } else {
          setGeneralError(result.error || t('ui.email_hoac_mat_khau_khong_ung', 'Email hoặc mật khẩu không đúng'));
        }
      }
    } catch {
      setGeneralError(
        t('msg.msg_08', 'Không kết nối được máy chủ. Bạn vẫn có thể làm việc ngoại tuyến.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isVi = i18n.language.startsWith('vi');

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.app }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nút chuyển ngữ VI / EN và công tắc thử nghiệm mạng */}
        <View style={styles.topActionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mô phỏng mạng"
            onPress={() => setIsOnline(!isOnline)}
            style={[
              styles.networkSimulator,
              {
                backgroundColor: isOnline ? colors.bg.surface : colors.status.warning.bg,
                borderColor: isOnline ? colors.border.default : colors.status.warning.fg,
              },
            ]}
          >
            <Icon
              name={isOnline ? 'sync' : 'offline'}
              size={14}
              color={isOnline ? colors.text.secondary : colors.status.warning.fg}
            />
            <AppText
              variant="caption"
              color={isOnline ? colors.text.secondary : colors.status.warning.fg}
            >
              {isOnline ? 'Mô phỏng: Online' : 'Mô phỏng: Offline'}
            </AppText>
          </Pressable>

          <View style={styles.langSelector}>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleToggleLanguage('vi')}
              style={[
                styles.langBadge,
                {
                  backgroundColor: isVi ? colors.bg.brandSubtle : colors.bg.surface,
                  borderColor: isVi ? colors.border.focus : colors.border.default,
                },
              ]}
            >
              <AppText variant="labelS" color={isVi ? colors.text.link : colors.text.secondary}>
                VI
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleToggleLanguage('en')}
              style={[
                styles.langBadge,
                {
                  backgroundColor: !isVi ? colors.bg.brandSubtle : colors.bg.surface,
                  borderColor: !isVi ? colors.border.focus : colors.border.default,
                },
              ]}
            >
              <AppText variant="labelS" color={!isVi ? colors.text.link : colors.text.secondary}>
                EN
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* Khối Logo & Tên ứng dụng LungCT */}
        <View style={styles.logoRow}>
          <Icon name="lung" size={44} color={colors.brand.primary} />
          <AppText variant="titleL" color={colors.text.primary} style={styles.appName}>
            LungCT
          </AppText>
        </View>

        {/* Tiêu đề & Thông điệp đối tượng */}
        <View style={styles.titleBlock}>
          <AppText variant="display" color={colors.text.primary}>
            {t('ui.ang_nhap', 'Đăng nhập')}
          </AppText>
          <AppText variant="bodyM" color={colors.text.secondary} style={styles.subtitle}>
            {t('ui.danh_cho_bac_si_va_quan_tri_vien', 'Dành cho bác sĩ và quản trị viên.')}
          </AppText>
        </View>

        {/* Trạng thái kết nối hiển thị bằng chữ + icon (BR-UI-01) */}
        <View style={styles.statusRow}>
          {isOnline ? (
            <StatusBadge tone="success" label={t('ui.ang_truc_tuyen', 'Đang trực tuyến')} />
          ) : (
            <StatusBadge
              tone="danger"
              label={t('ui.ban_ang_ngoai_tuyen', 'Bạn đang ngoại tuyến')}
            />
          )}
        </View>

        {/* Banner ngoại tuyến (AUTH-03) nếu không có mạng */}
        {!isOnline && (
          <Banner
            type="warning"
            title={t('label.ang_ngoai_tuyen', 'Đang ngoại tuyến')}
            body={t(
              'ui.chi_ang_nhap_uoc_tai_khoan_a_thiet_lap_tren_may_',
              'Chỉ đăng nhập được tài khoản đã thiết lập trên máy này.',
            )}
            style={{ marginBottom: spacing.sm }}
          />
        )}

        {/* Banner báo lỗi chung nếu đăng nhập thất bại */}
        {generalError && (
          <Banner
            type="error"
            title={generalError}
            body={t('ui.kiem_tra_lai_va_thu_lan_nua', 'Kiểm tra lại và thử lần nữa.')}
            style={{ marginBottom: spacing.sm }}
          />
        )}

        {/* Các trường nhập liệu */}
        <View style={[styles.formBlock, { gap: spacing.md }]}>
          <TextField
            label="Email *"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setGeneralError(null);
            }}
            placeholder="bs.an@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <TextField
            label={t('ui.mat_khau', 'Mật khẩu *')}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setGeneralError(null);
            }}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            trailingIcon={showPassword ? 'eye-off' : 'eye'}
            trailingIconAccessibilityLabel={
              showPassword
                ? t('ui.an_mat_khau', 'Ẩn mật khẩu')
                : t('ui.hien_mat_khau', 'Hiện mật khẩu')
            }
            onTrailingIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Nút Đăng nhập */}
          <Button
            label={t('ui.ang_nhap', 'Đăng nhập')}
            onPress={handleLogin}
            disabled={isFormEmpty}
            loading={isLoading}
            variant="primary"
            style={{ marginTop: spacing.xs }}
          />

          {/* Dòng liên kết Quên mật khẩu & Đăng ký */}
          <View style={styles.linkRow}>
            <Pressable
              disabled={!isOnline}
              accessibilityRole="button"
              accessibilityLabel="Quên mật khẩu"
              onPress={() => setShowForgotPasswordDialog(true)}
            >
              <AppText variant="labelM" color={isOnline ? colors.text.link : colors.text.disabled}>
                {t('ui.quen_mat_khau', 'Quên mật khẩu?')}
              </AppText>
            </Pressable>

            <Pressable
              disabled={!isOnline}
              accessibilityRole="button"
              accessibilityLabel="Đăng ký tài khoản"
              onPress={onNavigateToRegister}
            >
              <AppText variant="labelM" color={isOnline ? colors.text.link : colors.text.disabled}>
                {t('ui.ang_ky_tai_khoan_bac_si', 'Đăng ký tài khoản')}
              </AppText>
            </Pressable>
          </View>

          {/* Lời nhắc an toàn và ngoại tuyến (MSG-05) */}
          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={[styles.legalCaption, { borderRadius: radius.md }]}
          >
            {t(
              'ui.quen_mat_khau_va_ang_ky_can_ket_noi_mang_lan_ang',
              'Lần đăng nhập đầu tiên trên thiết bị cần kết nối mạng. Sau đó có thể đăng nhập ngoại tuyến; mật khẩu không được lưu nguyên văn.',
            )}
          </AppText>
        </View>
      </ScrollView>

      {/* Hộp thoại thông báo tính năng Quên mật khẩu chưa triển khai */}
      <Dialog
        visible={showForgotPasswordDialog}
        type="default"
        title={t('ui.quen_mat_khau', 'Quên mật khẩu?')}
        body={t(
          'ui.tinh_nang_quen_mat_khau_chua_trien_khai',
          'Chức năng đặt lại mật khẩu qua email chưa được kích hoạt trong phiên bản này. Vui lòng liên hệ quản trị viên hệ thống để được hỗ trợ.',
        )}
        confirmLabel={t('ui.da_hieu', 'Đã hiểu')}
        onConfirm={() => setShowForgotPasswordDialog(false)}
        onCancel={() => setShowForgotPasswordDialog(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  networkSimulator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  langSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  langBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  appName: {
    fontWeight: '700',
  },
  titleBlock: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
  },
  statusRow: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  formBlock: {
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  legalCaption: {
    marginTop: 16,
    lineHeight: 18,
  },
});
