import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Button,
  Divider,
  StatusBadge,
} from '../../../ui/components';
import { Icon } from '../../../ui/icons';
import {
  SyncEngine,
  type PendingSyncStats,
  type SyncStatusSnapshot,
} from '../../../services/sync';

export interface SyncCenterModalProps {
  visible: boolean;
  ownerId: string;
  isOnline: boolean;
  onClose: () => void;
}

/**
 * Trung tâm Đồng bộ Đám mây (SCR-Y01):
 * - Hiển thị trạng thái kết nối thực tế (Trực tuyến / Ngoại tuyến).
 * - Thống kê hàng đợi Outbox cục bộ đang chờ gửi (Bệnh nhân & Ca bệnh `syncState === 'pending'`).
 * - Cho phép kích hoạt đồng bộ thủ công 2 chiều (Push pending -> Pull remote) lên Cloud Firestore.
 * - Hiển thị nhật ký đồng bộ gần nhất và cảnh báo xung đột (nếu có).
 */
export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({
  visible,
  ownerId,
  isOnline,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const [stats, setStats] = useState<PendingSyncStats>({
    pendingPatients: 0,
    pendingCases: 0,
    totalPending: 0,
  });
  const [snapshot, setSnapshot] = useState<SyncStatusSnapshot>(() =>
    SyncEngine.getSnapshot(),
  );

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    const refreshStats = async () => {
      const s = await SyncEngine.getPendingStats(ownerId);
      if (isMounted) setStats(s);
    };
    void refreshStats();
    const unsub = SyncEngine.subscribeSyncStatus((snap) => {
      setSnapshot(snap);
      if (snap.status !== 'syncing') {
        void refreshStats();
      }
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [visible, ownerId]);

  const handleSyncNow = async () => {
    await SyncEngine.syncAll(ownerId, isOnline);
    const s = await SyncEngine.getPendingStats(ownerId);
    setStats(s);
  };

  const isSyncing = snapshot.status === 'syncing';
  const summary = snapshot.lastSummary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('sync.close_modal', 'Đóng Trung tâm đồng bộ')}
        />
        <View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: colors.bg.surface,
              borderRadius: radius.lg,
              padding: spacing.lg,
              borderColor: colors.border.default,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <Icon name="sync" size={20} color={colors.brand.primary} />
              <AppText variant="titleM" color={colors.text.primary}>
                {t('navigation.sync_center', 'Trung tâm đồng bộ')}
              </AppText>
            </View>
            <StatusBadge
              label={
                isOnline
                  ? t('sync.status_online', 'Trực tuyến')
                  : t('sync.status_offline', 'Ngoại tuyến')
              }
              tone={isOnline ? 'success' : 'warning'}
              icon={isOnline ? 'sync' : 'offline'}
            />
          </View>

          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={{ marginTop: spacing.xs, marginBottom: spacing.md }}
          >
            {isOnline
              ? t(
                  'sync.online_desc',
                  'Sẵn sàng đồng bộ hai chiều dữ liệu hồ sơ bệnh án với máy chủ đám mây Cloud Firestore.',
                )
              : t(
                  'sync.offline_desc',
                  'Thiết bị đang ngoại tuyến. Mọi thay đổi mới được lưu an toàn vào bộ nhớ mã hóa trên máy (Local-First).',
                )}
          </AppText>

          {/* Khối hàng đợi Outbox */}
          <View
            style={[
              styles.boxCard,
              {
                backgroundColor: colors.bg.app,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <AppText
              variant="labelM"
              color={colors.text.primary}
              style={{ marginBottom: spacing.xs }}
            >
              {t('sync.outbox_title', 'Hàng đợi chờ gửi (Outbox)')}
            </AppText>

            <View style={styles.statRow}>
              <AppText variant="bodyM" color={colors.text.secondary}>
                {t('sync.pending_patients', 'Hồ sơ bệnh nhân chờ gửi')}
              </AppText>
              <AppText variant="labelL" color={colors.text.primary}>
                {stats.pendingPatients}
              </AppText>
            </View>

            <View style={styles.statRow}>
              <AppText variant="bodyM" color={colors.text.secondary}>
                {t('sync.pending_cases', 'Hồ sơ ca bệnh chờ gửi')}
              </AppText>
              <AppText variant="labelL" color={colors.text.primary}>
                {stats.pendingCases}
              </AppText>
            </View>

            <Divider style={{ marginVertical: spacing.xs }} />

            <View style={styles.statRow}>
              <AppText variant="labelM" color={colors.text.primary}>
                {t('sync.total_pending', 'Tổng mục chưa đồng bộ')}
              </AppText>
              <StatusBadge
                label={`${stats.totalPending} ${t('common.item_unit', 'mục')}`}
                tone={stats.totalPending > 0 ? 'warning' : 'success'}
              />
            </View>
          </View>

          {/* Kết quả lần đồng bộ gần nhất */}
          {summary && (
            <View
              style={[
                styles.boxCard,
                {
                  backgroundColor: colors.bg.brandSubtle,
                  borderColor: colors.border.focus,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText
                variant="labelM"
                color={colors.text.link}
                style={{ marginBottom: spacing.xxs }}
              >
                {t('sync.last_result_title', 'Phiên đồng bộ gần nhất')}
              </AppText>
              <AppText variant="caption" color={colors.text.primary}>
                {t('sync.last_result_pushed', {
                  patients: summary.pushedPatients,
                  cases: summary.pushedCases,
                  defaultValue: `Đã đẩy lên: ${summary.pushedPatients} bệnh nhân, ${summary.pushedCases} ca bệnh`,
                })}
              </AppText>
              <AppText variant="caption" color={colors.text.primary}>
                {t('sync.last_result_pulled', {
                  patients: summary.pulledPatients,
                  cases: summary.pulledCases,
                  defaultValue: `Đã tải về: ${summary.pulledPatients} bệnh nhân, ${summary.pulledCases} ca bệnh`,
                })}
              </AppText>
              {summary.conflicts > 0 && (
                <AppText
                  variant="caption"
                  color={colors.status.warning.fg}
                  style={{ marginTop: 2 }}
                >
                  {t('sync.last_result_conflicts', {
                    count: summary.conflicts,
                    defaultValue: `Cảnh báo xung đột giữ bản cục bộ: ${summary.conflicts} mục`,
                  })}
                </AppText>
              )}
              {summary.errors.length > 0 && (
                <AppText
                  variant="caption"
                  color={colors.status.danger.fg}
                  style={{ marginTop: 2 }}
                >
                  {summary.errors[0]}
                </AppText>
              )}
            </View>
          )}

          {/* Nút hành động */}
          <View style={[styles.actionsRow, { gap: spacing.sm }]}>
            <Button
              label={t('sync.close_btn', 'Đóng')}
              variant="tertiary"
              size="M"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              label={
                isSyncing
                  ? t('sync.syncing_btn', 'Đang đồng bộ...')
                  : t('sync.sync_now_btn', 'Đồng bộ ngay')
              }
              variant="primary"
              size="M"
              leadingIcon="sync"
              loading={isSyncing}
              disabled={!isOnline || isSyncing}
              onPress={handleSyncNow}
              style={{ flex: 1.3 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  boxCard: {
    borderWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
