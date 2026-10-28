import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
        title="Bệnh nhân"
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
          placeholder="Tìm theo mã hoặc họ tên"
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
            return (
              <FilterChip
                key={chip.key}
                label={chip.label}
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
            title="Không tìm thấy bệnh nhân"
            body="Không có bệnh nhân nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại."
            type="noResult"
            actionLabel="Xóa bộ lọc"
            onActionPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title="Chưa có bệnh nhân nào"
            body="Bắt đầu thêm hồ sơ bệnh nhân mới để phục vụ quản lý và tạo ca chụp cắt lớp."
            type="noData"
            actionLabel="+ Thêm bệnh nhân mới"
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
          filteredPatients.map((patient) => (
            <ListRow
              key={patient.id}
              title={`${patient.code} · ${patient.fullName}`}
              subtitle={`${patient.age} tuổi · ${patient.gender} · ${patient.caseCount} ca · gần nhất ${patient.lastCaseDate}`}
              type="patient"
              leadingIcon="patients"
              badges={
                patient.isTrashed ? (
                  <StatusBadge label="Đã xóa" tone="danger" icon="trash" />
                ) : patient.syncStatus === 'pending' ? (
                  <StatusBadge label="Chờ gửi" tone="warning" icon="sync" />
                ) : undefined
              }
              onPress={() => {
                if (patient.isTrashed) {
                  // Mở hộp thoại xác nhận khôi phục
                  setDialogNotice({
                    visible: true,
                    title: 'Khôi phục bệnh nhân',
                    body: `Bạn có muốn khôi phục hồ sơ ${patient.fullName} (${patient.code}) trở lại danh sách hoạt động không?`,
                    confirmLabel: 'Khôi phục',
                    cancelLabel: 'Hủy',
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
          ))
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
          label="+ Thêm bệnh nhân"
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
        confirmLabel={dialogNotice.confirmLabel || 'Đã hiểu'}
        cancelLabel={dialogNotice.cancelLabel || (dialogNotice.onConfirm ? 'Hủy' : undefined)}
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
