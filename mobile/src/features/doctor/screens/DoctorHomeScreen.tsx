import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Banner,
  BottomSheet,
  Button,
  Dialog,
  IconButton,
  ListRow,
  Skeleton,
  StatCard,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import {
  getMockCases,
  getMockPatients,
  subscribeDoctorStore,
  createMockCaseForPatient,
  type MockCase,
  type MockPatient,
} from '../../../mocks';
import {
  PatientRepository,
  subscribePatientRepository,
  CaseRepository,
  subscribeCaseRepository,
} from '../../../services/storage';
import { SCORE_FORMAT_DECISION } from '../../../config/ui-decisions';
import { useAuth } from '../../auth/context/AuthContext';

export interface DoctorHomeScreenProps {
  onNavigateToCases?: () => void;
  onNavigateToPatients?: () => void;
  onNavigateToCaseDetail?: (caseId: string) => void;
  onNavigateToPatientDetail?: (patientId: string) => void;
  onNavigateToCreatePatient?: () => void;
  isLoadingInitial?: boolean;
  isEmptyInitial?: boolean;
  isModelErrorInitial?: boolean;
}

export const DoctorHomeScreen: React.FC<DoctorHomeScreenProps> = ({
  onNavigateToCases,
  onNavigateToPatients,
  onNavigateToCaseDetail,
  onNavigateToPatientDetail,
  onNavigateToCreatePatient,
  isLoadingInitial = false,
  isEmptyInitial = false,
  isModelErrorInitial = false,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { t } = useTranslation();
  const { isOnline, user } = useAuth();
  const ownerId = user?.id || 'usr-doc-01';

  const [isLoading] = useState(isLoadingInitial);
  const [isEmpty] = useState(isEmptyInitial);
  const [isModelError] = useState(isModelErrorInitial);
  const [isSelectPatientSheetVisible, setIsSelectPatientSheetVisible] = useState(false);

  const [casesList, setCasesList] = useState<MockCase[]>(() => getMockCases());
  const [patientsList, setPatientsList] = useState<MockPatient[]>(() => getMockPatients());

  // Nạp dữ liệu ca bệnh và bệnh nhân trực tiếp từ Kho lưu trữ mã hóa cục bộ
  React.useEffect(() => {
    let isMounted = true;

    const loadRealStorageData = async () => {
      try {
        const storedPatients = await PatientRepository.getPatientsForUI(ownerId, false);
        if (isMounted && storedPatients && storedPatients.length > 0) {
          setPatientsList(storedPatients);
        }

        const storedCases = await CaseRepository.getCasesForUI(ownerId, undefined, false);
        if (isMounted && storedCases && storedCases.length > 0) {
          setCasesList(storedCases);
        }
      } catch (err) {
        console.warn('[DoctorHomeScreen] Lỗi đọc dữ liệu từ kho lưu trữ mã hóa:', err);
      }
    };

    loadRealStorageData();

    // Lắng nghe thay đổi từ cả PatientRepository, CaseRepository và Mock Store
    const unsubPatientRepo = subscribePatientRepository(() => {
      loadRealStorageData();
    });
    const unsubCaseRepo = subscribeCaseRepository(() => {
      loadRealStorageData();
    });
    const unsubMockStore = subscribeDoctorStore(() => {
      loadRealStorageData();
    });

    return () => {
      isMounted = false;
      unsubPatientRepo();
      unsubCaseRepo();
      unsubMockStore();
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

  const pendingCases = isEmpty ? [] : casesList.filter((c) => c.status === 'DRAFT');
  const completedCasesCount = isEmpty
    ? 0
    : casesList.filter((c) => c.status === 'COMPLETED').length;
  const recentPatients = isEmpty ? [] : patientsList.slice(0, 3);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title="Xin chào, BS. An"
        type="root"
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ dữ liệu (SCR-Y01)"
              onPress={() =>
                showFeatureNotice(
                  'Trung tâm đồng bộ (SCR-Y01)',
                  'Chức năng đồng bộ dữ liệu ngoại tuyến với máy chủ trung tâm sẽ được triển khai ở gói SYNC-01.',
                )
              }
            />
            <IconButton
              name="notifications"
              accessibilityLabel="Thông báo hệ thống (SCR-N01)"
              onPress={() =>
                showFeatureNotice(
                  'Thông báo hệ thống (SCR-N01)',
                  'Trung tâm thông báo lâm sàng và cảnh báo hệ thống sẽ được tích hợp ở gói NOT-01.',
                )
              }
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {!isOnline && (
          <Banner
            type="offline"
            title="Đang ngoại tuyến"
            body={t(
              'ui.offline_banner_msg08',
              'Dữ liệu mới sẽ được lưu cục bộ và đồng bộ khi có mạng (MSG-08).',
            )}
            style={{ marginBottom: spacing.sm }}
          />
        )}

        {isModelError && (
          <Banner
            type="error"
            title="Sự cố mô hình AI"
            body={t(
              'ui.model_corrupted_msg09',
              'Mô hình AI trên thiết bị gặp sự cố hoặc tệp trọng số bị hỏng (MSG-09). Vui lòng cài lại ứng dụng.',
            )}
            style={{ marginBottom: spacing.sm }}
          />
        )}

        <View
          style={[
            styles.modelStatusCard,
            {
              backgroundColor: isModelError ? colors.status.danger.bg : colors.bg.brandSubtle,
              borderColor: isModelError ? colors.status.danger.fg : colors.brand.primary,
            },
          ]}
        >
          <Icon
            name={isModelError ? 'warning' : 'on-device'}
            size={32}
            color={isModelError ? colors.status.danger.fg : colors.brand.primary}
          />
          <View style={styles.modelStatusTextContainer}>
            <View style={styles.rowInline}>
              <AppText
                variant="labelM"
                style={{
                  color: isModelError ? colors.status.danger.fg : colors.text.primary,
                }}
              >
                {isModelError ? 'Mô hình AI: Sự cố (MSG-09)' : 'Mô hình trên thiết bị: Sẵn sàng'}
              </AppText>
              <View style={[styles.mockBadge, { backgroundColor: colors.status.warning.bg }]}>
                <AppText
                  variant="caption"
                  style={{
                    color: colors.status.warning.fg,
                    fontWeight: '600',
                  }}
                >
                  Mô phỏng
                </AppText>
              </View>
            </View>
            <AppText variant="bodyS" style={{ color: colors.text.secondary, marginTop: 2 }}>
              {isModelError
                ? 'Không thể thực hiện phân loại ảnh lúc này.'
                : 'Phân tích AI chạy trên điện thoại, không cần mạng (Trạng thái mô phỏng)'}
            </AppText>
          </View>
        </View>

        <Button
          label="Tạo ca mới"
          leadingIcon="case-add"
          variant="primary"
          disabled={isModelError}
          onPress={() => setIsSelectPatientSheetVisible(true)}
          style={{ marginVertical: spacing.xs }}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCardWrapper}>
            <StatCard
              label="Ca nháp"
              value={isEmpty ? '0' : String(pendingCases.length)}
              icon="draft"
              tone="warning"
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              label="Hoàn tất tháng này"
              value={isEmpty ? '0' : String(completedCasesCount)}
              icon="success"
              tone="brand"
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="titleS">Ca cần xử lý</AppText>
          <Button label="Xem tất cả" variant="tertiary" size="M" onPress={onNavigateToCases} />
        </View>

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={72} borderRadius={16} />
            <Skeleton
              width="100%"
              height={72}
              borderRadius={16}
              style={{ marginTop: spacing.xs }}
            />
          </View>
        ) : pendingCases.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
              },
            ]}
          >
            <AppText variant="bodyM" style={{ color: colors.text.secondary, textAlign: 'center' }}>
              Không có ca nháp nào cần xử lý lúc này.
            </AppText>
          </View>
        ) : (
          pendingCases.map((caseItem) => {
            const scoreText =
              caseItem.aiScore !== undefined
                ? ` (${SCORE_FORMAT_DECISION.format(caseItem.aiScore)})`
                : '';
            const aiText = caseItem.aiLabelSummary
              ? ` · ${caseItem.aiLabelSummary}${scoreText}`
              : ' · Chưa phân tích';

            return (
              <ListRow
                key={caseItem.id}
                title={`${caseItem.caseCode} · ${caseItem.patientName}`}
                subtitle={`Chụp: ${caseItem.captureDate} · ${caseItem.imageCount} ảnh${aiText}`}
                type="case"
                leadingIcon="cases"
                badges={
                  caseItem.syncStatus === 'pending' ? (
                    <StatusBadge label="Chờ gửi" tone="warning" icon="sync" />
                  ) : undefined
                }
                onPress={() => onNavigateToCaseDetail?.(caseItem.id)}
                style={{ marginBottom: spacing.xs }}
              />
            );
          })
        )}

        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <AppText variant="titleS">Bệnh nhân gần đây</AppText>
          <Button label="Xem tất cả" variant="tertiary" size="M" onPress={onNavigateToPatients} />
        </View>

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={72} borderRadius={16} />
          </View>
        ) : recentPatients.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
              },
            ]}
          >
            <AppText variant="bodyM" style={{ color: colors.text.secondary, textAlign: 'center' }}>
              Chưa có hồ sơ bệnh nhân nào.
            </AppText>
          </View>
        ) : (
          recentPatients.map((patient) => (
            <ListRow
              key={patient.id}
              title={`${patient.code} · ${patient.fullName}`}
              subtitle={`${patient.age} tuổi · ${patient.gender} · ${patient.caseCount} ca · gần nhất ${patient.lastCaseDate}`}
              type="patient"
              leadingIcon="patients"
              onPress={() => onNavigateToPatientDetail?.(patient.id)}
              style={{ marginBottom: spacing.xs }}
            />
          ))
        )}
      </ScrollView>

      <BottomSheet
        visible={isSelectPatientSheetVisible}
        title="Chọn bệnh nhân cho ca mới"
        onClose={() => setIsSelectPatientSheetVisible(false)}
      >
        <ScrollView style={{ maxHeight: 340 }}>
          <AppText
            variant="bodyS"
            style={{ color: colors.text.secondary, marginBottom: spacing.sm }}
          >
            Chọn bệnh nhân có sẵn từ danh sách hoặc tạo bệnh nhân mới để bắt đầu:
          </AppText>

          {patientsList.map((p) => (
            <ListRow
              key={p.id}
              title={`${p.code} · ${p.fullName}`}
              subtitle={`${p.age} tuổi · ${p.gender}`}
              type="patient"
              leadingIcon="patients"
              onPress={async () => {
                setIsSelectPatientSheetVisible(false);
                try {
                  const createdCase = await CaseRepository.createCase(ownerId, p);
                  if (onNavigateToCaseDetail) {
                    onNavigateToCaseDetail(createdCase.id);
                  } else {
                    showFeatureNotice(
                      'Đã tạo ca khám mới (CASE-01)',
                      `Đã tạo thành công ca ${createdCase.caseCode} cho bệnh nhân ${p.fullName}. Dữ liệu đã lưu an toàn trong kho lưu trữ mã hóa cục bộ.`,
                    );
                  }
                } catch (createErr) {
                  console.warn('[DoctorHomeScreen] Lỗi tạo ca khám mới:', createErr);
                  const fallbackCase = createMockCaseForPatient(p);
                  if (onNavigateToCaseDetail) {
                    onNavigateToCaseDetail(fallbackCase.id);
                  }
                }
              }}
              style={{ marginBottom: 6 }}
            />
          ))}

          <Button
            label="+ Thêm bệnh nhân mới"
            variant="secondary"
            onPress={() => {
              setIsSelectPatientSheetVisible(false);
              if (onNavigateToCreatePatient) {
                onNavigateToCreatePatient();
              } else {
                showFeatureNotice(
                  'Biểu mẫu bệnh nhân (SCR-P02)',
                  'Mở biểu mẫu thêm bệnh nhân mới.',
                );
              }
            }}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </BottomSheet>

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
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    paddingBottom: 32,
  },
  modelStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  modelStatusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  statCardWrapper: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  skeletonContainer: {
    marginVertical: 4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
