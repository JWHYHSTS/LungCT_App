import React, { useState } from 'react';
import {
  BackHandler,
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
import {
  AppText,
  Banner,
  Button,
  Checkbox,
  Dialog,
  TextField,
  TopBar,
} from '../../../ui/components';

interface RegisterScreenProps {
  onNavigateBack: () => void;
  onNavigateToPendingApproval: () => void;
}

/**
 * Màn hình Đăng ký tài khoản bác sĩ (SCR-A03) - UI-05.
 * - Khớp thiết kế 02-register (TopBar có nút Back, các trường: Họ tên, Email, Mật khẩu, Xác nhận MK, Nơi công tác, Chuyên khoa, Checkbox đồng thuận, Nút Gửi đăng ký).
 * - Kiểm tra lỗi theo từng trường: định dạng email, mật khẩu không khớp, chưa tích đồng thuận riêng tư.
 * - Hỗ trợ modal xác nhận "Bỏ thông tin đã nhập?" khi người dùng bấm Back mà đã điền dữ liệu.
 * - Hỗ trợ trạng thái ngoại tuyến: vô hiệu hóa nút gửi kèm Banner cảnh báo.
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateBack,
  onNavigateToPendingApproval,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { t, i18n } = useTranslation();
  const { registerDoctor, isOnline } = useAuth();
  const isVi = (i18n.language || 'vi').startsWith('vi');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hasAgreedPrivacy, setHasAgreedPrivacy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Kiểm tra người dùng đã nhập thông tin hoặc thay đổi checkbox đồng thuận riêng tư hay chưa
  const hasDirtyData = Boolean(
    fullName.trim() ||
    email.trim() ||
    password ||
    confirmPassword ||
    workplace.trim() ||
    specialty.trim() ||
    hasAgreedPrivacy,
  );

  const handleBackPress = React.useCallback(() => {
    if (hasDirtyData) {
      setShowDiscardDialog(true);
      return true; // Chặn hành vi Back mặc định của Android
    } else {
      onNavigateBack();
      return true;
    }
  }, [hasDirtyData, onNavigateBack]);

  // Đăng ký bắt phím Back Android vật lý
  React.useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backSubscription.remove();
  }, [handleBackPress]);

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('ui.vui_long_nhap_ho_ten', 'Vui lòng nhập họ tên.');
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = t('ui.email_khong_hop_le', 'Email không hợp lệ.');
    }
    if (!password) {
      newErrors.password = t('ui.vui_long_nhap_mat_khau', 'Vui lòng nhập mật khẩu.');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t(
        'ui.mat_khau_xac_nhan_khong_khop',
        'Mật khẩu xác nhận không khớp.',
      );
    }
    if (!workplace.trim()) {
      newErrors.workplace = t('ui.vui_long_nhap_noi_cong_tac', 'Vui lòng nhập nơi công tác.');
    }
    if (!specialty.trim()) {
      newErrors.specialty = t('ui.vui_long_nhap_chuyen_khoa', 'Vui lòng nhập chuyên khoa.');
    }
    if (!hasAgreedPrivacy) {
      newErrors.privacy = t(
        'ui.vui_long_dong_y_rieng_tu',
        'Vui lòng xác nhận đã đọc thông báo bảo vệ riêng tư.',
      );
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await registerDoctor({ fullName, email, workplace, specialty });
      onNavigateToPendingApproval();
    } finally {
      setIsLoading(false);
    }
  };

  const isFormIncomplete =
    !fullName.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    !workplace.trim() ||
    !specialty.trim() ||
    !hasAgreedPrivacy;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.app }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar
        type="stack"
        title={t('ui.ang_ky_tai_khoan_bac_si', 'Đăng ký tài khoản bác sĩ')}
        onBackPress={handleBackPress}
        rightActions={
          <View style={styles.langSwitch}>
            <Pressable
              accessibilityRole="button"
              onPress={() => i18n.changeLanguage('vi')}
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
              onPress={() => i18n.changeLanguage('en')}
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
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        {!isOnline && (
          <Banner
            type="warning"
            title={t('label.ang_ngoai_tuyen', 'Đang ngoại tuyến')}
            body={t(
              'ui.quen_mat_khau_va_ang_ky_can_ket_noi_mang_lan_ang',
              'Đăng ký tài khoản cần kết nối mạng để gửi tới quản trị viên.',
            )}
            style={{ marginBottom: spacing.md }}
          />
        )}

        <View style={[styles.form, { gap: spacing.md }]}>
          <TextField
            label={t('ui.ho_ten', 'Họ tên *')}
            value={fullName}
            onChangeText={(txt) => {
              setFullName(txt);
              setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            placeholder={t('ui.ho_ten_placeholder', 'Nguyễn Minh An')}
            error={errors.fullName}
            autoCapitalize="words"
          />

          <TextField
            label={t('ui.email', 'Email *')}
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="bs.an@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />

          <TextField
            label={t('ui.mat_khau', 'Mật khẩu *')}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
            trailingIcon={showPassword ? 'eye-off' : 'eye'}
            trailingIconAccessibilityLabel={
              showPassword
                ? t('ui.an_mat_khau', 'Ẩn mật khẩu')
                : t('ui.hien_mat_khau', 'Hiện mật khẩu')
            }
            onTrailingIconPress={() => setShowPassword(!showPassword)}
            helper={t(
              'ui.theo_chinh_sach_mat_khau_cua_dich_vu_xac_thuc',
              'Theo chính sách mật khẩu của dịch vụ xác thực.',
            )}
            error={errors.password}
          />

          <TextField
            label={t('ui.xac_nhan_mat_khau', 'Xác nhận mật khẩu *')}
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
            error={errors.confirmPassword}
          />

          <TextField
            label={t('ui.noi_cong_tac', 'Nơi công tác *')}
            value={workplace}
            onChangeText={(txt) => {
              setWorkplace(txt);
              setErrors((prev) => ({ ...prev, workplace: '' }));
            }}
            placeholder={t('ui.benh_vien_thuc_hanh_a', 'Bệnh viện Thực hành A')}
            error={errors.workplace}
          />

          <TextField
            label={t('ui.chuyen_khoa', 'Chuyên khoa *')}
            value={specialty}
            onChangeText={(txt) => {
              setSpecialty(txt);
              setErrors((prev) => ({ ...prev, specialty: '' }));
            }}
            placeholder={t('ui.chan_oan_hinh_anh', 'Chẩn đoán hình ảnh')}
            error={errors.specialty}
          />

          {/* Hộp kiểm xác nhận quyền riêng tư */}
          <Checkbox
            checked={hasAgreedPrivacy}
            onValueChange={(checked: boolean) => {
              setHasAgreedPrivacy(checked);
              setErrors((prev) => ({ ...prev, privacy: '' }));
            }}
            label={t(
              'ui.toi_a_oc_thong_bao_bao_ve_rieng_tu',
              'Tôi đã đọc Thông báo bảo vệ riêng tư',
            )}
          />
          {errors.privacy ? (
            <AppText variant="caption" color={colors.status.danger.fg}>
              {errors.privacy}
            </AppText>
          ) : null}

          {/* Nút gửi đăng ký */}
          <Button
            label={t('ui.gui_ang_ky', 'Gửi đăng ký')}
            onPress={handleRegister}
            disabled={isFormIncomplete || !isOnline}
            loading={isLoading}
            variant="primary"
            style={{ marginTop: spacing.xs }}
          />
        </View>
      </ScrollView>

      {/* Hộp thoại xác nhận bỏ thông tin đã nhập */}
      <Dialog
        visible={showDiscardDialog}
        type="destructive"
        title={t('ui.bo_thong_tin_a_nhap', 'Bỏ thông tin đã nhập?')}
        body={t(
          'ui.thong_tin_ban_vua_nhap_se_khong_uoc_luu',
          'Các thông tin bạn vừa nhập sẽ không được lưu. Bạn có chắc chắn muốn quay lại?',
        )}
        cancelLabel={t('ui.tiep_tuc_nhap', 'Tiếp tục nhập')}
        confirmLabel={t('ui.bo_thong_tin', 'Bỏ thông tin')}
        onCancel={() => setShowDiscardDialog(false)}
        onConfirm={() => {
          setShowDiscardDialog(false);
          onNavigateBack();
        }}
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
    paddingBottom: 40,
  },
  form: {
    width: '100%',
  },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
});
