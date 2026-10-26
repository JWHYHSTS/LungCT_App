import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import {
  Dialog,
  EmptyState,
  FilterChip,
  IconButton,
  ListRow,
  SearchField,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import { getMockCases, subscribeDoctorStore } from '../../../mocks';
import { CASE_FILTER_DECISION, SCORE_FORMAT_DECISION } from '../../../config/ui-decisions';

export interface DoctorCasesScreenProps {
  onNavigateToCaseDetail?: (caseId: string) => void;
  onNavigateToCreateCase?: () => void;
}

export const DoctorCasesScreen: React.FC<DoctorCasesScreenProps> = ({
  onNavigateToCaseDetail,
  onNavigateToCreateCase,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const [cases, setCases] = useState(getMockCases());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(CASE_FILTER_DECISION.defaultChip);

  React.useEffect(() => {
    return subscribeDoctorStore(() => {
      setCases(getMockCases());
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

  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        caseItem.caseCode.toLowerCase().includes(q) ||
        caseItem.patientName.toLowerCase().includes(q) ||
        caseItem.patientCode.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (selectedFilter === 'draft') {
        return caseItem.status === 'DRAFT';
      }
      if (selectedFilter === 'completed') {
        return caseItem.status === 'COMPLETED';
      }
      if (selectedFilter === 'partial') {
        return caseItem.status === 'PARTIAL' || caseItem.isPartial;
      }
      return true;
    });
  }, [cases, searchQuery, selectedFilter]);

  const isNoResult =
    filteredCases.length === 0 && (searchQuery.trim().length > 0 || selectedFilter !== 'all');

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title="Ca bệnh"
        type="root"
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ dữ liệu (SCR-Y01)"
              onPress={() =>
                showFeatureNotice(
                  'Trung tâm đồng bộ (SCR-Y01)',
                  'Chức năng đồng bộ ca bệnh ngoại tuyến với máy chủ trung tâm sẽ được triển khai ở gói SYNC-01.',
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
          placeholder="Tìm theo mã ca, bệnh nhân"
          onClear={() => setSearchQuery('')}
          style={{ marginVertical: spacing.xs }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CASE_FILTER_DECISION.chips.map((chip) => {
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
            title="Không tìm thấy ca bệnh"
            body="Không có ca bệnh nào khớp với từ khóa tìm kiếm hoặc trạng thái lọc."
            type="noResult"
            actionLabel="Xóa bộ lọc"
            onActionPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="Chưa có ca bệnh nào"
            body="Bắt đầu tạo ca chụp cắt lớp mới cho bệnh nhân để tiến hành phân tích AI."
            type="noData"
            actionLabel="Tạo ca mới"
            onActionPress={() => {
              if (onNavigateToCreateCase) {
                onNavigateToCreateCase();
              } else {
                showFeatureNotice(
                  'Tạo ca mới (CASE-01)',
                  'Luồng tạo ca bệnh mới sẽ được tích hợp ở gói UI-08.',
                );
              }
            }}
          />
        ) : (
          filteredCases.map((caseItem) => {
            const statusLabel =
              caseItem.status === 'DRAFT'
                ? 'Nháp'
                : caseItem.status === 'COMPLETED'
                  ? 'Hoàn tất'
                  : 'Một phần';

            const scoreText =
              caseItem.aiScore !== undefined
                ? ` (${SCORE_FORMAT_DECISION.format(caseItem.aiScore)})`
                : '';

            const aiText = caseItem.aiLabelSummary
              ? ` · ${caseItem.aiLabelSummary}${scoreText}`
              : '';

            return (
              <ListRow
                key={caseItem.id}
                title={`${caseItem.caseCode} · ${caseItem.patientName}`}
                subtitle={`Chụp ${caseItem.captureDate} · ${caseItem.imageCount} ảnh · ${statusLabel}${aiText}`}
                type="case"
                leadingIcon="cases"
                badges={
                  caseItem.syncStatus === 'pending' ? (
                    <StatusBadge label="Chờ gửi" tone="warning" icon="sync" />
                  ) : undefined
                }
                onPress={() => {
                  if (onNavigateToCaseDetail) {
                    onNavigateToCaseDetail(caseItem.id);
                  } else {
                    showFeatureNotice(
                      'Chi tiết ca (SCR-C02)',
                      `[Chế độ mô phỏng] Đang xem ca ${caseItem.caseCode} (${caseItem.patientName}). Màn hình biên tập SCR-C02 sẽ hoàn thiện ở gói UI-08.`,
                    );
                  }
                }}
                style={{ marginBottom: spacing.xs }}
              />
            );
          })
        )}
      </ScrollView>

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
});
