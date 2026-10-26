import React, { useMemo, useState } from 'react';
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
import { getMockPatients, subscribeDoctorStore } from '../../../mocks';
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

  const [patients, setPatients] = useState(getMockPatients());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(PATIENT_FILTER_DECISION.defaultChip);

  React.useEffect(() => {
    return subscribeDoctorStore(() => {
      setPatients(getMockPatients());
    });
  }, []);

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

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
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
                patient.syncStatus === 'pending' ? (
                  <StatusBadge label="Chờ gửi" tone="warning" icon="sync" />
                ) : undefined
              }
              onPress={() => {
                if (onNavigateToDetail) {
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
