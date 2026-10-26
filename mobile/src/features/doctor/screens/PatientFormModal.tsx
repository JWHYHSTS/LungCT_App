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
import { useTheme } from '../../../ui/theme';
import { AppText, Button, Dialog, TextField, TopBar } from '../../../ui/components';
import { PATIENT_FORM_DECISION } from '../../../config/ui-decisions';
import { addMockPatient, findPatientByCode } from '../../../mocks';

import i18n from '../../../i18n';

export interface PatientFormModalProps {
  visible?: boolean;
  onClose: () => void;
  onSuccess: (newPatientId: string) => void;
}

/**
 * Kiểm tra tính hợp lệ của ngày sinh:
 * - Định dạng: DD/MM/YYYY
 * - Đúng ngày lịch thực tế (xét số ngày trong tháng, năm nhuận)
 * - Không nằm trong tương lai
 */
export const validateDateOfBirth = (
  dobStr: string,
  t?: (key: string, options?: any) => string,
): { valid: boolean; error?: string; age?: number } => {
  const tr = (k: string, opts?: any): string => String(t ? t(k, opts) : i18n.t(k, opts));
  const trimmed = dobStr.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_required', {
        defaultValue: 'Vui lòng nhập ngày sinh (*).',
      }),
    };
  }

  const parts = trimmed.split('/');
  if (parts.length !== 3) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_format', {
        defaultValue: 'Ngày sinh phải theo định dạng DD/MM/YYYY (ví dụ: 14/03/1980).',
      }),
    };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_invalid_chars', {
        defaultValue: 'Ngày sinh chứa ký tự không hợp lệ.',
      }),
    };
  }

  if (year < 1900 || year > 2100) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_year_range', {
        defaultValue: 'Năm sinh không hợp lệ (1900 - nay).',
      }),
    };
  }

  if (month < 1 || month > 12) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_month_range', {
        defaultValue: 'Tháng sinh phải từ 1 đến 12.',
      }),
    };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_max_days', {
        month,
        year,
        days: daysInMonth,
        defaultValue: `Tháng ${month}/${year} chỉ có tối đa ${daysInMonth} ngày.`,
      }),
    };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return {
      valid: false,
      error: tr('doctor_detail.validation_dob_future', {
        defaultValue: 'Ngày sinh không được nằm trong tương lai.',
      }),
    };
  }

  // Tính tuổi
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return { valid: true, age: Math.max(0, age) };
};

/**
 * SCR-P02 (13-patient-form): Màn hình Thêm bệnh nhân mới (dạng Modal).
 * - Đa ngôn ngữ qua useTranslation('doctor_detail').
 * - Trường bắt buộc (*): Mã bệnh nhân, Họ tên, Ngày sinh, Giới tính (theo đề xuất Q-20).
 * - Trường phụ: Điện thoại, Triệu chứng.
 * - Kiểm tra lỗi: Mã bệnh nhân đã tồn tại, Ngày sinh không hợp lệ hoặc trong tương lai.
 * - Khi có thay đổi dữ liệu mà bấm Đóng/Back: Hiển thị Dialog "Bỏ thông tin chưa lưu?".
 */
export const PatientFormModal: React.FC<PatientFormModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [phone, setPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const [errors, setErrors] = useState<{
    code?: string;
    fullName?: string;
    dob?: string;
  }>({});

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({ visible: false, title: '', body: '' });

  // Kiểm tra xem form đã có dữ liệu chưa để cảnh báo khi rời đi
  const isDirty =
    code.trim().length > 0 ||
    fullName.trim().length > 0 ||
    dob.trim().length > 0 ||
    phone.trim().length > 0 ||
    symptoms.trim().length > 0;

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    const newErrors: { code?: string; fullName?: string; dob?: string } = {};

    // 1. Kiểm tra Mã bệnh nhân
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      newErrors.code = t('doctor_detail.validation_code_required');
    } else if (!PATIENT_FORM_DECISION.codePattern.test(trimmedCode)) {
      newErrors.code = t('doctor_detail.validation_code_pattern');
    } else if (findPatientByCode(trimmedCode)) {
      newErrors.code = t('doctor_detail.validation_code_exists');
    }

    // 2. Kiểm tra Họ tên
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = t('doctor_detail.validation_fullname_required');
    }

    // 3. Kiểm tra Ngày sinh
    const dobValidation = validateDateOfBirth(dob, t);
    if (!dob.trim()) {
      newErrors.dob = t('doctor_detail.validation_dob_required');
    } else if (!dobValidation.valid) {
      newErrors.dob = dobValidation.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Lưu tạm thời vào Mock Store
    const created = addMockPatient({
      code: trimmedCode,
      fullName: trimmedName,
      dob: dob.trim(),
      age: dobValidation.age ?? 0,
      gender,
      phone: phone.trim() || undefined,
      symptoms: symptoms.trim() || undefined,
    });

    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.patient_save_btn'),
      body: `Hồ sơ ${created.fullName} (${created.code}) đã được lưu tạm trong phiên mô phỏng; dữ liệu có thể mất khi khởi động lại app.`,
    });
  };

  const handleConfirmNotice = () => {
    setNoticeDialog({ visible: false, title: '', body: '' });
    onSuccess(code.trim().toUpperCase());
  };

  const genderOptions = [
    { key: 'Nam' as const, label: t('doctor_detail.gender_male') },
    { key: 'Nữ' as const, label: t('doctor_detail.gender_female') },
    { key: 'Khác' as const, label: t('doctor_detail.gender_other') },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bg.app }]}
    >
      <TopBar
        title={t('doctor_detail.patient_form_title')}
        type="modal"
        onClosePress={handleClose}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText
          variant="caption"
          color={colors.text.secondary}
          style={{ marginBottom: spacing.xs }}
        >
          {t('doctor_detail.patient_form_desc')}
        </AppText>

        {/* Mã bệnh nhân */}
        <TextField
          label={t('doctor_detail.patient_code_label')}
          value={code}
          onChangeText={(val) => {
            setCode(val);
            if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
          }}
          placeholder={t('doctor_detail.patient_code_placeholder')}
          helper={t('doctor_detail.patient_code_helper')}
          error={errors.code}
          autoCapitalize="characters"
          style={{ marginBottom: spacing.sm }}
        />

        {/* Họ tên */}
        <TextField
          label={t('doctor_detail.patient_fullname_label')}
          value={fullName}
          onChangeText={(val) => {
            setFullName(val);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          placeholder={t('doctor_detail.patient_fullname_placeholder')}
          error={errors.fullName}
          style={{ marginBottom: spacing.sm }}
        />

        {/* Ngày sinh */}
        <TextField
          label={t('doctor_detail.patient_dob_label')}
          value={dob}
          onChangeText={(val) => {
            setDob(val);
            if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }));
          }}
          placeholder={t('doctor_detail.patient_dob_placeholder')}
          helper={t('doctor_detail.patient_dob_helper')}
          error={errors.dob}
          keyboardType="numbers-and-punctuation"
          trailingIcon="calendar"
          style={{ marginBottom: spacing.sm }}
        />

        {/* Giới tính */}
        <View style={{ marginBottom: spacing.sm }}>
          <AppText variant="labelM" style={{ marginBottom: spacing.xxs }}>
            {t('doctor_detail.patient_gender_label')}
          </AppText>
          <View style={styles.genderRow}>
            {genderOptions.map((opt) => {
              const isSelected = gender === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setGender(opt.key)}
                  style={[
                    styles.genderChip,
                    {
                      backgroundColor: isSelected ? colors.bg.brandSubtle : colors.bg.surface,
                      borderColor: isSelected ? colors.border.focus : colors.border.default,
                      borderRadius: radius.full,
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <AppText
                    variant="labelM"
                    style={{
                      color: isSelected ? colors.text.link : colors.text.primary,
                    }}
                  >
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Điện thoại */}
        <TextField
          label={t('doctor_detail.patient_phone_label')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('doctor_detail.patient_phone_placeholder')}
          keyboardType="phone-pad"
          style={{ marginBottom: spacing.sm }}
        />

        {/* Triệu chứng lâm sàng */}
        <TextField
          label={t('doctor_detail.patient_symptoms_label')}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder={t('doctor_detail.patient_symptoms_placeholder')}
          multiline
          numberOfLines={3}
          style={{ marginBottom: spacing.lg }}
        />

        <Button
          label={t('doctor_detail.patient_save_btn')}
          variant="primary"
          size="L"
          onPress={handleSave}
        />
      </ScrollView>

      {/* Dialog xác nhận hủy bỏ thông tin chưa lưu */}
      <Dialog
        visible={showDiscardDialog}
        type="destructive"
        title={t('doctor_detail.discard_dialog_title')}
        body={t('doctor_detail.discard_dialog_body')}
        confirmLabel={t('doctor_detail.discard_dialog_discard')}
        cancelLabel={t('doctor_detail.discard_dialog_continue')}
        onConfirm={() => {
          setShowDiscardDialog(false);
          onClose();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />

      {/* Dialog thông báo kết quả */}
      <Dialog
        visible={noticeDialog.visible}
        type="default"
        title={noticeDialog.title}
        body={noticeDialog.body}
        confirmLabel={t('doctor_detail.common_dialog_close')}
        onConfirm={handleConfirmNotice}
        onCancel={handleConfirmNotice}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
