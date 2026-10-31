import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  Button,
  Dialog,
  EmptyState,
  FilterChip,
  IconButton,
  ListRow,
  SearchField,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import { getMockPatients, subscribeDoctorStore, type MockPatient } from '../../../mocks';
import { PatientRepository, subscribePatientRepository } from '../../../services/storage';
import { useAuth } from '../../../features/auth';
import { PATIENT_FILTER_DECISION } from '../../../config/ui-decisions';

export interface DoctorPatientsScreenProps {
  onNavigateToDetail?: (patientId: string) => void;
  onNavigateToCreatePatient?: () => void;
}

export const DoctorPatientsScreen: React.FC<DoctorPatientsScreenProps> = ({
  onNavigateToDetail,
  onNavigateToCreatePatient,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || 'usr-doc-01';

  const [patients, setPatients] = useState<MockPatient[]>(() => getMockPatients());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(PATIENT_FILTER_DECISION.defaultChip);

  // Nạp dữ liệu bệnh nhân từ Local Storage mã hóa
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const storedPatients = await PatientRepository.getPatientsForUI(ownerId, true);
        if (isMounted && storedPatients && storedPatients.length > 0) {
          setPatients(storedPatients);
        }
      } catch (err) {
        console.warn('[DoctorPatientsScreen] Lỗi đọc dữ liệu lưu trữ cục bộ:', err);
      }
    };

    loadData();

    // Lắng nghe thay đổi từ cả PatientRepository và Mock Store
    const unsubRepo = subscribePatientRepository(() => {
      loadData();
    });
    const unsubMock = subscribeDoctorStore(() => {
      loadData();
    });

    return () => {
      isMounted = false;
      unsubRepo();
      unsubMock();
    };
  }, [ownerId]);

  const [dialogNotice, setDialogNotice] = useState<{
    visible: boolean;
    title: string;
    body: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
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

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // 1. Phân biệt bệnh nhân đang hoạt động và bệnh nhân trong thùng rác
      if (selectedFilter === 'trashed') {
        if (!patient.isTrashed) return false;
      } else {
        if (patient.isTrashed) return false;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q || patient.code.toLowerCase().includes(q) || patient.fullName.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (selectedFilter === 'draft') {
        return patient.hasDraftCase;
      }
      if (selectedFilter === 'unsynced') {
        return patient.syncStatus === 'pending';
      }
      return true;
    });
  }, [patients, searchQuery, selectedFilter]);

  const isNoResult =
    filteredPatients.length === 0 && (searchQuery.trim().length > 0 || selectedFilter !== 'all');

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('navigation.tab_patients', 'Bệnh nhân')}
        type="root"
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ dữ liệu (SCR-Y01)"
              onPress={() =>
                showFeatureNotice(
                  'Trung tâm đồng bộ (SCR-Y01)',
                  'Chức năng đồng bộ bệnh nhân với máy chủ trung tâm sẽ được triển khai ở gói SYNC-01.',
                )
              }
            />
            <IconButton
              name="notifications"
              accessibilityLabel="Thông báo hệ thống (SCR-N01)"
              onPress={() =>
                showFeatureNotice(
                  'Thông báo hệ thống (SCR-N01)',
                  'Trung tâm thông báo lâm sàng sẽ được tích hợp ở gói NOT-01.',
                )
              }
            />
          </View>
        }
      />

      <View style={[styles.headerControls, { paddingHorizontal: spacing.md }]}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('ui.tim_theo_ma_hoac_ho_ten', 'Tìm theo mã hoặc họ tên')}
          onClear={() => setSearchQuery('')}
          style={{ marginVertical: spacing.xs }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {PATIENT_FILTER_DECISION.chips.map((chip) => {
            const isSelected = selectedFilter === chip.key;
            let translatedLabel: string = chip.label;
            if (chip.key === 'all') translatedLabel = t('ui.tat_ca', 'Tất cả');
            else if (chip.key === 'draft') translatedLabel = t('ui.co_ca_nhap', 'Có ca nháp');
            else if (chip.key === 'unsynced') translatedLabel = t('ui.chua_ong_bo', 'Chưa đồng bộ');
            else if (chip.key === 'trashed') translatedLabel = t('label.thung_rac', 'Thùng rác');
            return (
              <FilterChip
                key={chip.key}
                label={translatedLabel}
                selected={isSelected}
                onPress={() => setSelectedFilter(chip.key)}
                style={{ marginRight: spacing.xs }}
              />
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.listContainer, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {isNoResult ? (
          <EmptyState
            title={t('ui.khong_tim_thay_benh_nhan', 'Không tìm thấy bệnh nhân')}
            body={t('ui.thu_tu_khoa_khac_hoac_bo_bo_loc', 'Không có bệnh nhân nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.')}
            type="noResult"
            actionLabel={t('ui.xoa_bo_loc', 'Xóa bộ lọc')}
            onActionPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title={t('ui.chua_co_benh_nhan', 'Chưa có bệnh nhân nào')}
            body={t('ui.them_benh_nhan_au_tien_e_bat_au_tao_ca', 'Bắt đầu thêm hồ sơ bệnh nhân mới để phục vụ quản lý và tạo ca chụp cắt lớp.')}
            type="noData"
            actionLabel={`+ ${t('ui.them_benh_nhan', 'Thêm bệnh nhân')}`}
            onActionPress={() => {
              if (onNavigateToCreatePatient) {
                onNavigateToCreatePatient();
              } else {
                showFeatureNotice(
                  'Biểu mẫu bệnh nhân (SCR-P02)',
                  'Giao diện nhập hồ sơ bệnh nhân mới (SCR-P02) sẽ hoàn thiện ở gói UI-07.',
                );
              }
            }}
          />
        ) : (
          filteredPatients.map((patient) => {
            const genderLabel =
              patient.gender === 'Nữ'
                ? t('ui.nu', 'Nữ')
                : patient.gender === 'Nam'
                  ? t('ui.nam', 'Nam')
                  : patient.gender;

            return (
              <ListRow
                key={patient.id}
                title={`${patient.code} · ${patient.fullName}`}
                subtitle={`${patient.age} ${t('common.age_unit', 'tuổi')} · ${genderLabel} · ${patient.caseCount} ${t('common.case_unit', 'ca')} · ${t('common.latest', 'gần nhất')} ${patient.lastCaseDate}`}
                type="patient"
                leadingIcon="patients"
                badges={
                  patient.isTrashed ? (
                    <StatusBadge label={t('common.deleted', 'Đã xóa')} tone="danger" icon="trash" />
                  ) : patient.syncStatus === 'pending' ? (
                    <StatusBadge label={t('common.pending_sync', 'Chờ gửi')} tone="warning" icon="sync" />
                  ) : undefined
                }
                onPress={() => {
                  if (patient.isTrashed) {
                    // Mở hộp thoại xác nhận khôi phục
                    setDialogNotice({
                      visible: true,
                      title: t('trash.restore_patient_title', 'Khôi phục bệnh nhân'),
                      body: t(
                        'trash.restore_patient_confirm_body',
                        `Bạn có muốn khôi phục hồ sơ ${patient.fullName} (${patient.code}) trở lại danh sách hoạt động không?`,
                        { name: patient.fullName, code: patient.code }
                      ),
                      confirmLabel: t('trash.restore_btn', 'Khôi phục'),
                      cancelLabel: t('common.cancel', 'Hủy'),
                      onConfirm: async () => {
                        closeNotice();
                        try {
                          await PatientRepository.restorePatient(ownerId, patient.id);
                        } catch (err: any) {
                          console.warn('[DoctorPatientsScreen] Lỗi khôi phục:', err);
                        }
                      },
                    });
                  } else if (onNavigateToDetail) {
                    onNavigateToDetail(patient.id);
                  } else {
                    showFeatureNotice(
                      'Chi tiết bệnh nhân (SCR-P03)',
                      `[Chế độ mô phỏng] Đang xem bệnh nhân ${patient.fullName} (${patient.code}). Màn hình chi tiết SCR-P03 sẽ hoàn thiện ở gói UI-07.`,
                    );
                  }
                }}
                style={{ marginBottom: spacing.xs }}
              />
            );
          })
        )}
      </ScrollView>

      <View
        style={[
          styles.footerButtonContainer,
          {
            padding: spacing.md,
            backgroundColor: colors.bg.surface,
            borderTopColor: colors.border.default,
            gap: spacing.xs,
          },
        ]}
      >
        <Button
          label={`+ ${t('ui.them_benh_nhan', 'Thêm bệnh nhân')}`}
          variant="primary"
          onPress={() => {
            if (onNavigateToCreatePatient) {
              onNavigateToCreatePatient();
            } else {
              showFeatureNotice(
                'Biểu mẫu bệnh nhân (SCR-P02)',
                'Giao diện nhập hồ sơ bệnh nhân mới (SCR-P02) sẽ hoàn thiện ở gói UI-07.',
              );
            }
          }}
        />
      </View>

      <Dialog
        visible={dialogNotice.visible}
        type={dialogNotice.onConfirm ? 'default' : 'default'}
        title={dialogNotice.title}
        body={dialogNotice.body}
        confirmLabel={dialogNotice.confirmLabel || t('common.understood', 'Đã hiểu')}
        cancelLabel={dialogNotice.cancelLabel || (dialogNotice.onConfirm ? t('common.cancel', 'Hủy') : undefined)}
        onConfirm={() => {
          if (dialogNotice.onConfirm) {
            dialogNotice.onConfirm();
          } else {
            closeNotice();
          }
        }}
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
  headerControls: {
    paddingBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  listContainer: {
    paddingBottom: 24,
  },
  footerButtonContainer: {
    borderTopWidth: 1,
  },
});
