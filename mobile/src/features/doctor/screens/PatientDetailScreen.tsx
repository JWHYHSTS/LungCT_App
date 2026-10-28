import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Button,
  Dialog,
  Divider,
  EmptyState,
  IconButton,
  ListRow,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import {
  findPatientById,
  getCasesByPatientId,
  subscribeDoctorStore,
  trashPatient,
  type MockPatient,
} from '../../../mocks';
import {
  PatientRepository,
  subscribePatientRepository,
  CaseRepository,
  subscribeCaseRepository,
} from '../../../services/storage';
import { useAuth } from '../../../features/auth';
import { SCORE_FORMAT_DECISION } from '../../../config/ui-decisions';

export interface PatientDetailScreenProps {
  patientId: string;
  onBack: () => void;
  onNavigateToCaseDetail: (caseId: string) => void;
  onNavigateToEditPatient?: (patientId: string) => void;
}

/**
 * SCR-P03 (14-patient-detail): Màn hình Chi tiết hồ sơ bệnh nhân.
 * - Đa ngôn ngữ qua useTranslation('doctor_detail').
 * - Thẻ hồ sơ thông tin hành chính, nút "Tạo ca mới" cho bệnh nhân này.
 * - Danh sách lịch sử các ca chụp cắt lớp của bệnh nhân.
 * - Menu hành động (nút ⋯): "Chuyển vào thùng rác" (xóa mềm bệnh nhân và kéo theo các ca theo BR-DEL-01 / Q-23 đề xuất A).
 * - Xử lý an toàn khi không tìm thấy ID bệnh nhân.
 */
export const PatientDetailScreen: React.FC<PatientDetailScreenProps> = ({
  patientId,
  onBack,
  onNavigateToCaseDetail,
  onNavigateToEditPatient,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || 'usr-doc-01';

  const [patient, setPatient] = useState<MockPatient | undefined>(() => findPatientById(patientId));
  const [cases, setCases] = useState(() => getCasesByPatientId(patientId));

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const loadFromStorage = async () => {
      try {
        const stored = await PatientRepository.getPatientById(ownerId, patientId);
        if (isMounted) {
          if (stored) {
            setPatient(stored);
          }
          const storedCases = await CaseRepository.getCasesForUI(ownerId, patientId, true);
          if (storedCases && storedCases.length > 0) {
            setCases(storedCases);
          }
        }
      } catch (err) {
        console.warn('[PatientDetailScreen] Lỗi nạp dữ liệu chi tiết:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFromStorage();

    const unsubMock = subscribeDoctorStore(() => {
      const mockP = findPatientById(patientId);
      if (mockP) setPatient(mockP);
      setCases(getCasesByPatientId(patientId));
    });
    const unsubRepo = subscribePatientRepository(() => {
      loadFromStorage();
    });
    const unsubCaseRepo = subscribeCaseRepository(() => {
      loadFromStorage();
    });

    return () => {
      isMounted = false;
      unsubMock();
      unsubRepo();
      unsubCaseRepo();
    };
  }, [ownerId, patientId]);

  const [showTrashConfirmDialog, setShowTrashConfirmDialog] = useState(false);
  const [showMenuOptionsDialog, setShowMenuOptionsDialog] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
    onClose?: () => void;
  }>({ visible: false, title: '', body: '' });

  // Đang tải dữ liệu từ kho lưu trữ
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar title={t('doctor_detail.patient_detail_title')} type="stack" onBackPress={onBack} />
      </View>
    );
  }

  // Trường hợp không tìm thấy hồ sơ bệnh nhân sau khi đã nạp xong
  if (!patient) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar
          title={t('doctor_detail.patient_not_found_title')}
          type="stack"
          onBackPress={onBack}
        />
        <View style={[styles.centerBox, { padding: spacing.lg }]}>
          <EmptyState
            title={t('doctor_detail.patient_not_found_title')}
            body={t('doctor_detail.patient_not_found_body')}
            type="noData"
            actionLabel={t('doctor_detail.patient_not_found_back')}
            onActionPress={onBack}
          />
        </View>
      </View>
    );
  }

  const handleCreateNewCase = async () => {
    const createdCase = await CaseRepository.createCase(ownerId, patient);
    setNoticeDialog({
      visible: true,
      title: 'Đã tạo ca mới',
      body: `Đã tạo thành công ca ${createdCase.caseCode} cho bệnh nhân ${patient.fullName}. Dữ liệu đã được lưu trữ an toàn trong kho mã hóa.`,
      onClose: () => {
        setNoticeDialog({ visible: false, title: '', body: '' });
        onNavigateToCaseDetail(createdCase.id);
      },
    });
  };

  const handleTrashPatient = async () => {
    trashPatient(patient.id);
    try {
      await PatientRepository.trashPatient(ownerId, patient.id);
    } catch (err) {
      console.warn(
        '[PatientDetailScreen] Không thể cập nhật trạng thái xóa mềm trong kho lưu trữ:',
        err,
      );
    }
    setShowTrashConfirmDialog(false);
    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.trash_confirm_btn'),
      body: t('doctor_detail.trash_confirm_body', {
        name: patient.fullName,
        code: patient.code,
      }),
      onClose: () => {
        setNoticeDialog({ visible: false, title: '', body: '' });
        onBack();
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('doctor_detail.patient_detail_title')}
        type="stack"
        onBackPress={onBack}
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="edit"
              accessibilityLabel={t('doctor_detail.patient_menu_edit')}
              onPress={() => {
                if (onNavigateToEditPatient) {
                  onNavigateToEditPatient(patient.id);
                } else {
                  setNoticeDialog({
                    visible: true,
                    title: t('doctor_detail.patient_menu_edit'),
                    body: 'Tính năng sửa thông tin bệnh nhân đang được hoàn thiện.',
                  });
                }
              }}
            />
            <IconButton
              name="more"
              accessibilityLabel={t('doctor_detail.patient_menu_title')}
              onPress={() => setShowMenuOptionsDialog(true)}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ hồ sơ thông tin hành chính */}
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
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <AppText variant="titleL" style={{ color: colors.text.primary }}>
                {patient.fullName}
              </AppText>
              <AppText variant="labelM" style={{ color: colors.text.link, marginTop: 2 }}>
                {patient.code}
              </AppText>
            </View>
            <StatusBadge
              label={
                patient.syncStatus === 'pending'
                  ? t('doctor_detail.patient_pending_badge')
                  : t('doctor_detail.patient_synced_badge')
              }
              tone={patient.syncStatus === 'pending' ? 'warning' : 'neutral'}
            />
          </View>

          <Divider style={{ marginVertical: spacing.sm }} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color={colors.text.secondary}>
                {t('doctor_detail.patient_dob_age_label')}
              </AppText>
              <AppText variant="bodyM" style={{ color: colors.text.primary }}>
                {t('doctor_detail.patient_age_format', { dob: patient.dob, age: patient.age })}
              </AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color={colors.text.secondary}>
                {t('doctor_detail.patient_gender_label')}
              </AppText>
              <AppText variant="bodyM" style={{ color: colors.text.primary }}>
                {patient.gender === 'Nam'
                  ? t('doctor_detail.gender_male')
                  : patient.gender === 'Nữ'
                    ? t('doctor_detail.gender_female')
                    : t('doctor_detail.gender_other')}
              </AppText>
            </View>
          </View>

          <View style={{ marginTop: spacing.xs }}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.patient_phone_view_label')}
            </AppText>
            <AppText variant="bodyM" style={{ color: colors.text.primary }}>
              {patient.phone || t('doctor_detail.patient_phone_none')}
            </AppText>
          </View>

          <View style={{ marginTop: spacing.xs }}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.patient_symptoms_view_label')}
            </AppText>
            <AppText variant="bodyM" style={{ color: colors.text.primary }}>
              {patient.symptoms || t('doctor_detail.patient_symptoms_none')}
            </AppText>
          </View>
        </View>

        {/* Nút tạo ca mới */}
        <Button
          label={t('doctor_detail.patient_create_case_btn')}
          variant="secondary"
          onPress={handleCreateNewCase}
          style={{ marginBottom: spacing.md }}
        />

        {/* Danh sách lịch sử ca */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleS">
            {t('doctor_detail.patient_case_history_title', { count: cases.length })}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {t('doctor_detail.patient_case_count_note')}
          </AppText>
        </View>

        {cases.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <AppText variant="bodyM" style={{ color: colors.text.secondary, textAlign: 'center' }}>
              {t('doctor_detail.patient_empty_cases_title')}
            </AppText>
          </View>
        ) : (
          cases.map((caseItem) => {
            const statusLabel =
              caseItem.status === 'DRAFT'
                ? t('label.nhap')
                : caseItem.status === 'COMPLETED'
                  ? t('label.hoan_tat')
                  : t('label.ket_qua_mot_phan');

            const scoreText =
              caseItem.aiScore !== undefined
                ? ` (${SCORE_FORMAT_DECISION.format(caseItem.aiScore)})`
                : '';
            const aiText = caseItem.aiLabelSummary
              ? ` · ${caseItem.aiLabelSummary}${scoreText}`
              : ` · ${t('label.cho_phan_tich')}`;

            return (
              <ListRow
                key={caseItem.id}
                title={caseItem.caseCode}
                subtitle={`Chụp ngày ${caseItem.captureDate} · ${caseItem.imageCount} ảnh · ${statusLabel}${aiText}`}
                type="case"
                leadingIcon="cases"
                badges={
                  caseItem.syncStatus === 'pending' ? (
                    <StatusBadge label={t('label.cho_ong_bo')} tone="warning" icon="sync" />
                  ) : undefined
                }
                onPress={() => onNavigateToCaseDetail(caseItem.id)}
                style={{ marginBottom: spacing.xs }}
              />
            );
          })
        )}
      </ScrollView>

      {/* Menu tùy chọn ... */}
      <Dialog
        visible={showMenuOptionsDialog}
        type="default"
        title={t('doctor_detail.patient_menu_title')}
        body={t('doctor_detail.patient_menu_body')}
        confirmLabel={t('doctor_detail.patient_menu_delete')}
        cancelLabel={t('doctor_detail.patient_menu_cancel')}
        onConfirm={() => {
          setShowMenuOptionsDialog(false);
          setShowTrashConfirmDialog(true);
        }}
        onCancel={() => setShowMenuOptionsDialog(false)}
      />

      {/* Dialog xác nhận xóa mềm */}
      <Dialog
        visible={showTrashConfirmDialog}
        type="destructive"
        title={t('doctor_detail.trash_confirm_title')}
        body={t('doctor_detail.trash_confirm_body', {
          name: patient.fullName,
          code: patient.code,
        })}
        confirmLabel={t('doctor_detail.trash_confirm_btn')}
        cancelLabel={t('doctor_detail.trash_cancel_btn')}
        onConfirm={handleTrashPatient}
        onCancel={() => setShowTrashConfirmDialog(false)}
      />

      {/* Thông báo kết quả */}
      <Dialog
        visible={noticeDialog.visible}
        type="default"
        title={noticeDialog.title}
        body={noticeDialog.body}
        confirmLabel={t('doctor_detail.common_dialog_close')}
        onConfirm={() => {
          if (noticeDialog.onClose) {
            noticeDialog.onClose();
          } else {
            setNoticeDialog({ visible: false, title: '', body: '' });
          }
        }}
        onCancel={() => {
          if (noticeDialog.onClose) {
            noticeDialog.onClose();
          } else {
            setNoticeDialog({ visible: false, title: '', body: '' });
          }
        }}
      />
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
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoCol: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyBox: {
    borderWidth: 1,
  },
});
