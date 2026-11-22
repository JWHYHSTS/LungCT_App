import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Banner,
  Button,
  Dialog,
  EmptyState,
  IconButton,
  SearchField,
  StatusBadge,
  TopBar,
} from '../../../ui/components';
import { type MockCase } from '../../../mocks';
import { CaseRepository, subscribeCaseRepository } from '../../../services/storage';
import { useAuth } from '../../../features/auth';

export interface TrashScreenProps {
  onBack: () => void;
  onNavigateToCaseDetail?: (caseId: string) => void;
}

export const TrashScreen: React.FC<TrashScreenProps> = ({ onBack, onNavigateToCaseDetail }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || '';

  const [cases, setCases] = useState<MockCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [restoreTarget, setRestoreTarget] = useState<MockCase | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<MockCase | null>(null);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!ownerId) return;

    const fetchTrash = async () => {
      try {
        const storedCases = await CaseRepository.getCasesForUI(ownerId, undefined, true);
        const trashedOnly = (storedCases || []).filter((c) => c.isTrashed);
        if (isMounted) {
          setCases(trashedOnly);
        }
      } catch (err) {
        console.warn('[TrashScreen] Lỗi nạp danh sách thùng rác:', err);
      }
    };

    fetchTrash();
    const unsub = subscribeCaseRepository(() => {
      fetchTrash();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [ownerId]);

  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter(
      (c) =>
        c.caseCode.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.patientCode.toLowerCase().includes(q),
    );
  }, [cases, searchQuery]);

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    setIsProcessing(true);
    try {
      await CaseRepository.restoreCase(ownerId, restoreTarget.id);
      setRestoreTarget(null);
    } catch (err) {
      console.warn('[TrashScreen] Lỗi khôi phục ca:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    setIsProcessing(true);
    try {
      await CaseRepository.hardDeleteCase(ownerId, hardDeleteTarget.id);
      setHardDeleteTarget(null);
    } catch (err) {
      console.warn('[TrashScreen] Lỗi xóa vĩnh viễn ca:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEmptyTrash = async () => {
    setShowEmptyTrashConfirm(false);
    setIsProcessing(true);
    try {
      await CaseRepository.emptyTrash(ownerId);
    } catch (err) {
      console.warn('[TrashScreen] Lỗi dọn thùng rác:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('trash.cases_title', 'Thùng rác ca bệnh')}
        type="stack"
        onBackPress={onBack}
        rightActions={
          cases.length > 0 ? (
            <IconButton
              name="trash"
              accessibilityLabel={t('trash.empty_trash_btn', 'Dọn sạch thùng rác')}
              onPress={() => setShowEmptyTrashConfirm(true)}
            />
          ) : undefined
        }
      />

      <View style={[styles.headerControls, { paddingHorizontal: spacing.md }]}>
        <Banner
          type="info"
          title={t('trash.banner_title', 'Quản lý thùng rác ca bệnh')}
          body={t(
            'trash.banner_body',
            'Ca bệnh trong thùng rác có thể được khôi phục về danh sách làm việc hoặc xóa vĩnh viễn để giải phóng dung lượng ảnh CT và báo cáo.',
          )}
          style={{ marginVertical: spacing.xs }}
        />

        {cases.length > 0 && (
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('ui.tim_theo_ma_ca_benh_nhan', 'Tìm theo mã ca, bệnh nhân')}
            onClear={() => setSearchQuery('')}
            style={{ marginVertical: spacing.xs }}
          />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.listContainer, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {cases.length === 0 ? (
          <EmptyState
            title={t('trash.empty_title', 'Thùng rác trống')}
            body={t('trash.empty_body', 'Không có ca bệnh nào trong thùng rác.')}
            type="noData"
            actionLabel={t('trash.empty_action', 'Quay lại danh sách ca')}
            onActionPress={onBack}
          />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title={t('ui.khong_tim_thay_ca_benh', 'Không tìm thấy ca bệnh')}
            body={t('ui.khong_co_ca_benh_nao_khop', 'Không có ca bệnh nào khớp với từ khóa tìm kiếm.')}
            type="noResult"
            actionLabel={t('ui.xoa_bo_loc', 'Xóa bộ lọc')}
            onActionPress={() => setSearchQuery('')}
          />
        ) : (
          filteredCases.map((caseItem) => (
            <View
              key={caseItem.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.bg.surface,
                  borderColor: colors.border.default,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <AppText variant="titleS" style={{ color: colors.text.primary }}>
                    {caseItem.caseCode} · {caseItem.patientName}
                  </AppText>
                  <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                    {t('common.capture_prefix', 'Chụp')}: {caseItem.captureDate} · {caseItem.imageCount}{' '}
                    {t('common.image_unit', 'ảnh')}
                  </AppText>
                </View>
                <StatusBadge label={t('common.deleted', 'Đã xóa')} tone="danger" icon="trash" />
              </View>

              <View style={[styles.cardActions, { marginTop: spacing.sm }]}>
                <Button
                  label={t('trash.restore_btn', 'Khôi phục')}
                  variant="secondary"
                  size="M"
                  disabled={isProcessing}
                  onPress={() => setRestoreTarget(caseItem)}
                  style={{ flex: 1, marginRight: spacing.xs }}
                />
                <Button
                  label={t('trash.hard_delete_btn', 'Xóa vĩnh viễn')}
                  variant="tertiary"
                  size="M"
                  disabled={isProcessing}
                  onPress={() => setHardDeleteTarget(caseItem)}
                  style={{ flex: 1, marginLeft: spacing.xs }}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dialog xác nhận khôi phục ca */}
      <Dialog
        visible={Boolean(restoreTarget)}
        type="default"
        title={t('trash.restore_case_title', 'Khôi phục ca bệnh')}
        body={t('trash.restore_case_confirm_body', {
          code: restoreTarget?.caseCode || '',
          defaultValue: `Khôi phục ca bệnh ${restoreTarget?.caseCode} về danh sách hoạt động?`,
        })}
        confirmLabel={t('trash.restore_btn', 'Khôi phục')}
        cancelLabel={t('common.cancel', 'Hủy')}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* Dialog xác nhận xóa vĩnh viễn một ca */}
      <Dialog
        visible={Boolean(hardDeleteTarget)}
        type="destructive"
        title={t('trash.hard_delete_case_title', 'Xóa vĩnh viễn ca bệnh?')}
        body={t('trash.hard_delete_case_confirm_body', {
          code: hardDeleteTarget?.caseCode || '',
          defaultValue: `Ca bệnh ${hardDeleteTarget?.caseCode} cùng toàn bộ ảnh lát cắt và báo cáo PDF liên quan sẽ bị xóa vĩnh viễn khỏi thiết bị. Thao tác này KHÔNG thể hoàn tác. Bạn có chắc chắn muốn xóa?`,
        })}
        confirmLabel={t('trash.hard_delete_btn', 'Xóa vĩnh viễn')}
        cancelLabel={t('common.cancel', 'Hủy')}
        onConfirm={handleConfirmHardDelete}
        onCancel={() => setHardDeleteTarget(null)}
      />

      {/* Dialog xác nhận dọn sạch thùng rác (Empty All) */}
      <Dialog
        visible={showEmptyTrashConfirm}
        type="destructive"
        title={t('trash.empty_trash_title', 'Dọn sạch thùng rác?')}
        body={t('trash.empty_trash_confirm_body', {
          defaultValue:
            'Toàn bộ ca bệnh trong thùng rác và các tệp ảnh cắt lớp, báo cáo đính kèm sẽ bị xóa vĩnh viễn khỏi bộ nhớ máy. Thao tác này KHÔNG thể hoàn tác.',
        })}
        confirmLabel={t('trash.empty_trash_btn', 'Dọn sạch tất cả')}
        cancelLabel={t('common.cancel', 'Hủy')}
        onConfirm={handleConfirmEmptyTrash}
        onCancel={() => setShowEmptyTrashConfirm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerControls: {
    paddingBottom: 4,
  },
  listContainer: {
    paddingBottom: 32,
  },
  itemCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
