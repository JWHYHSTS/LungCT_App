import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
import { getMockCases, subscribeDoctorStore, type MockCase } from '../../../mocks';
import { CASE_FILTER_DECISION, SCORE_FORMAT_DECISION } from '../../../config/ui-decisions';
import { CaseRepository, subscribeCaseRepository } from '../../../services/storage';
import { useAuth } from '../../../features/auth';

export interface DoctorCasesScreenProps {
  onNavigateToCaseDetail?: (caseId: string) => void;
  onNavigateToCreateCase?: () => void;
}

export const DoctorCasesScreen: React.FC<DoctorCasesScreenProps> = ({
  onNavigateToCaseDetail,
  onNavigateToCreateCase,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || 'usr-doc-01';

  const [cases, setCases] = useState<MockCase[]>(() => getMockCases());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(CASE_FILTER_DECISION.defaultChip);

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const storedCases = await CaseRepository.getCasesForUI(ownerId, undefined, true);
        if (isMounted && storedCases && storedCases.length > 0) {
          setCases(storedCases);
        }
      } catch (err) {
        console.warn('[DoctorCasesScreen] Lỗi nạp ca bệnh từ kho mã hóa:', err);
      }
    };

    loadData();

    const unsubRepo = subscribeCaseRepository(() => {
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
      // 1. Phân biệt ca đang hoạt động và ca trong thùng rác
      if (selectedFilter === 'trashed') {
        if (!caseItem.isTrashed) return false;
      } else {
        if (caseItem.isTrashed) return false;
      }

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
        title={t('navigation.tab_cases', 'Ca bệnh')}
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
          placeholder={t('ui.tim_theo_ma_ca_benh_nhan', 'Tìm theo mã ca, bệnh nhân')}
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
            let translatedLabel: string = chip.label;
            if (chip.key === 'all') translatedLabel = t('ui.tat_ca', 'Tất cả');
            else if (chip.key === 'draft') translatedLabel = t('label.nhap', 'Nháp');
            else if (chip.key === 'completed') translatedLabel = t('label.hoan_tat', 'Hoàn tất');
            else if (chip.key === 'partial') translatedLabel = t('label.ket_qua_mot_phan', 'Một phần');
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
            title={t('ui.khong_tim_thay_ca_benh', 'Không tìm thấy ca bệnh')}
            body={t('ui.khong_co_ca_benh_nao_khop', 'Không có ca bệnh nào khớp với từ khóa tìm kiếm hoặc trạng thái lọc.')}
            type="noResult"
            actionLabel={t('ui.xoa_bo_loc', 'Xóa bộ lọc')}
            onActionPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title={t('ui.chua_co_ca_nao', 'Chưa có ca bệnh nào')}
            body={t('ui.bat_dau_tao_ca_chup', 'Bắt đầu tạo ca chụp cắt lớp mới cho bệnh nhân để tiến hành phân tích AI.')}
            type="noData"
            actionLabel={t('ui.tao_ca_moi', 'Tạo ca mới')}
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
                ? t('label.nhap', 'Nháp')
                : caseItem.status === 'COMPLETED'
                  ? t('label.hoan_tat', 'Hoàn tất')
                  : t('label.ket_qua_mot_phan', 'Một phần');

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
                subtitle={`${t('common.capture_prefix', 'Chụp')}: ${caseItem.captureDate} · ${caseItem.imageCount} ${t('common.image_unit', 'ảnh')} · ${statusLabel}${aiText}`}
                type="case"
                leadingIcon="cases"
                badges={
                  caseItem.isTrashed ? (
                    <StatusBadge label={t('common.deleted', 'Đã xóa')} tone="danger" icon="trash" />
                  ) : caseItem.syncStatus === 'pending' ? (
                    <StatusBadge label={t('common.pending_sync', 'Chờ gửi')} tone="warning" icon="sync" />
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
        confirmLabel={t('common.understood', 'Đã hiểu')}
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
