import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { AppText, Dialog, IconButton, Segmented, StatCard, TopBar } from '../../../ui/components';
import { MOCK_STATS, type MockStatsData } from '../../../mocks';
import { localStorageService } from '../../../services/storage';
import { useAuth } from '../../../features/auth';
import { SyncCenterModal } from '../components/SyncCenterModal';

export interface DoctorStatsScreenProps {
  initialRange?: '7d' | '30d' | 'all';
}

export const DoctorStatsScreen: React.FC<DoctorStatsScreenProps> = ({ initialRange = '30d' }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { user, isOnline } = useAuth();
  const ownerId = user?.id || '';

  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | 'all'>(initialRange);
  const [realStats, setRealStats] = useState<MockStatsData | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (!ownerId) {
      setRealStats(null);
      return;
    }

    const fetchStats = async () => {
      try {
        const stats = await localStorageService.getDoctorStats(ownerId, selectedRange);
        if (isMounted && stats) {
          setRealStats({
            period: selectedRange,
            patientCount: stats.patientCount,
            completedCaseCount: stats.completedCaseCount,
            draftCaseCount: stats.draftCaseCount,
            analyzedImageCount: stats.analyzedImageCount,
            labelDistribution: stats.labelDistribution,
            unitNotes: {
              caseUnit: 'ca',
              imageUnit: 'ảnh',
              syncFormulaNote: `Dữ liệu tổng hợp kỳ ${selectedRange} từ SQLite mã hóa nội bộ thiết bị`,
            },
            isMock: false,
          });
        }
      } catch (err) {
        console.warn('[DoctorStatsScreen] Lỗi đọc thống kê:', err);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [ownerId, selectedRange]);

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

  const currentStats: MockStatsData = useMemo(() => {
    if (realStats && realStats.period === selectedRange) {
      return realStats;
    }
    // Trả về số liệu rỗng (0) nếu là tài khoản bác sĩ thật chưa có dữ liệu
    return {
      period: selectedRange,
      patientCount: 0,
      completedCaseCount: 0,
      draftCaseCount: 0,
      analyzedImageCount: 0,
      labelDistribution: { benign: 0, malignant: 0, normal: 0 },
      unitNotes: {
        caseUnit: 'ca',
        imageUnit: 'ảnh',
        syncFormulaNote: `Chưa có dữ liệu phân tích trong kỳ ${selectedRange}`,
      },
      isMock: false,
    };
  }, [realStats, selectedRange]);

  const { benign, malignant, normal } = currentStats.labelDistribution;

  const maxBarWidth = 180;
  const maxCount = Math.max(benign, malignant, normal, 1);
  const benignWidth = Math.round((benign / maxCount) * maxBarWidth);
  const malignantWidth = Math.round((malignant / maxCount) * maxBarWidth);
  const normalWidth = Math.round((normal / maxCount) * maxBarWidth);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('navigation.tab_stats', 'Thống kê')}
        type="root"
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ dữ liệu (SCR-Y01)"
              onPress={() => setShowSyncModal(true)}
            />
            <IconButton
              name="notifications"
              accessibilityLabel="Thông báo hệ thống (SCR-N01)"
              onPress={() =>
                showFeatureNotice(
                  'Thông báo hệ thống (SCR-N01)',
                  'Cảnh báo số liệu bất thường lâm sàng sẽ được tích hợp ở gói NOT-01.',
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
        <View
          style={[
            styles.simulationBanner,
            {
              backgroundColor: realStats ? colors.bg.brandSubtle : colors.status.warning.bg,
              borderColor: realStats ? colors.brand.primary : colors.status.warning.fg,
              borderWidth: 1,
            },
          ]}
        >
          <AppText
            variant="bodyS"
            style={{
              color: realStats ? colors.brand.primary : colors.status.warning.fg,
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {realStats
              ? t('doctor_stats.banner_local', 'Số liệu thống kê được tổng hợp trực tiếp từ kho lưu trữ mã hóa cục bộ của bác sĩ.')
              : t('doctor_stats.banner_simulated', '[Chế độ mô phỏng] Số liệu thống kê được lấy từ dữ liệu mẫu phục vụ kiểm thử giao diện UI-06.')}
          </AppText>
        </View>

        <View style={{ marginVertical: spacing.sm }}>
          <Segmented<'7d' | '30d' | 'all'>
            items={[
              { key: '7d', label: t('doctor_stats.period_7d', '7 ngày') },
              { key: '30d', label: t('doctor_stats.period_30d', '30 ngày') },
              { key: 'all', label: t('doctor_stats.period_all', 'Tất cả') },
            ]}
            selectedKey={selectedRange}
            onSelect={(key: '7d' | '30d' | 'all') => setSelectedRange(key)}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <StatCard label={t('doctor_stats.stat_patients', 'Bệnh nhân')} value={`${currentStats.patientCount}`} icon="patients" />
            </View>
            <View style={styles.statCol}>
              <StatCard
                label={t('doctor_stats.stat_completed', 'Ca hoàn tất')}
                value={`${currentStats.completedCaseCount}`}
                icon="success"
                tone="brand"
              />
            </View>
          </View>

          <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
            <View style={styles.statCol}>
              <StatCard
                label={t('doctor_stats.stat_draft', 'Ca nháp')}
                value={`${currentStats.draftCaseCount}`}
                icon="draft"
                tone="warning"
              />
            </View>
            <View style={styles.statCol}>
              <StatCard
                label={t('doctor_stats.stat_analyzed_images', 'Ảnh đã phân tích')}
                value={`${currentStats.analyzedImageCount}`}
                icon="cases"
              />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
            },
          ]}
        >
          <AppText variant="titleS" style={{ marginBottom: spacing.md }}>
            {t('doctor_stats.chart_title', 'Số ảnh theo nhãn AI (Tổng: {{count}} ảnh)', { count: benign + malignant + normal })}
          </AppText>

          <View style={styles.chartRow}>
            <AppText variant="bodyS" style={styles.labelCol}>
              {t('doctor_stats.label_benign', 'Lành tính')}
            </AppText>
            <View style={styles.barWrapper}>
              <Svg width={maxBarWidth} height={12}>
                <Rect x={0} y={0} width={maxBarWidth} height={12} rx={6} fill={colors.bg.sunken} />
                <Rect
                  x={0}
                  y={0}
                  width={benignWidth}
                  height={12}
                  rx={6}
                  fill={colors.ai.benign.fg}
                />
              </Svg>
            </View>
            <AppText variant="labelM" style={styles.countCol}>
              {benign}
            </AppText>
          </View>

          <View style={[styles.chartRow, { marginTop: spacing.sm }]}>
            <AppText variant="bodyS" style={styles.labelCol}>
              {t('doctor_stats.label_malignant', 'Ác tính')}
            </AppText>
            <View style={styles.barWrapper}>
              <Svg width={maxBarWidth} height={12}>
                <Rect x={0} y={0} width={maxBarWidth} height={12} rx={6} fill={colors.bg.sunken} />
                <Rect
                  x={0}
                  y={0}
                  width={malignantWidth}
                  height={12}
                  rx={6}
                  fill={colors.ai.malignant.fg}
                />
              </Svg>
            </View>
            <AppText variant="labelM" style={styles.countCol}>
              {malignant}
            </AppText>
          </View>

          <View style={[styles.chartRow, { marginTop: spacing.sm }]}>
            <AppText variant="bodyS" style={styles.labelCol}>
              {t('doctor_stats.label_normal', 'Bình thường')}
            </AppText>
            <View style={styles.barWrapper}>
              <Svg width={maxBarWidth} height={12}>
                <Rect x={0} y={0} width={maxBarWidth} height={12} rx={6} fill={colors.bg.sunken} />
                <Rect
                  x={0}
                  y={0}
                  width={normalWidth}
                  height={12}
                  rx={6}
                  fill={colors.ai.normal.fg}
                />
              </Svg>
            </View>
            <AppText variant="labelM" style={styles.countCol}>
              {normal}
            </AppText>
          </View>

          <View
            style={[
              styles.notesBox,
              {
                borderTopColor: colors.border.default,
                marginTop: spacing.md,
                paddingTop: spacing.sm,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: colors.text.secondary, fontStyle: 'italic' }}
            >
              {t('doctor_stats.unit_note', '* Đơn vị thống kê: theo số ca khám (ca) và số ảnh CT (ảnh).')}
            </AppText>
            <AppText
              variant="caption"
              style={{
                color: colors.text.secondary,
                marginTop: 2,
                fontStyle: 'italic',
              }}
            >
              {t('doctor_stats.sync_formula_note', '* Dữ liệu tổng hợp kỳ {{period}} từ SQLite mã hóa nội bộ thiết bị', { period: selectedRange })}
            </AppText>
          </View>
        </View>
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

      <SyncCenterModal
        visible={showSyncModal}
        ownerId={ownerId}
        isOnline={isOnline}
        onClose={() => setShowSyncModal(false)}
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
  simulationBanner: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  statsGrid: {
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCol: {
    flex: 1,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelCol: {
    width: 90,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  countCol: {
    width: 32,
    textAlign: 'right',
  },
  notesBox: {
    borderTopWidth: 1,
  },
});
