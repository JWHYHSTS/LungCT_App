import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';
import { AppText, Dialog, IconButton, Segmented, StatCard, TopBar } from '../../../ui/components';
import { MOCK_STATS, type MockStatsData } from '../../../mocks';

export interface DoctorStatsScreenProps {
  initialRange?: '7d' | '30d' | 'all';
}

export const DoctorStatsScreen: React.FC<DoctorStatsScreenProps> = ({ initialRange = '30d' }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | 'all'>(initialRange);

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
    return MOCK_STATS[selectedRange] ?? MOCK_STATS['30d'];
  }, [selectedRange]);

  const { benign, malignant, normal } = currentStats.labelDistribution;

  const maxBarWidth = 180;
  const maxCount = Math.max(benign, malignant, normal, 1);
  const benignWidth = Math.round((benign / maxCount) * maxBarWidth);
  const malignantWidth = Math.round((malignant / maxCount) * maxBarWidth);
  const normalWidth = Math.round((normal / maxCount) * maxBarWidth);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title="Thống kê"
        type="root"
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ dữ liệu (SCR-Y01)"
              onPress={() =>
                showFeatureNotice(
                  'Trung tâm đồng bộ (SCR-Y01)',
                  'Số liệu thống kê sẽ được đồng bộ và đối chiếu với máy chủ trung tâm khi có mạng.',
                )
              }
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
        <View style={[styles.simulationBanner, { backgroundColor: colors.status.warning.bg }]}>
          <AppText
            variant="bodyS"
            style={{
              color: colors.status.warning.fg,
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            [Chế độ mô phỏng] Số liệu thống kê được tổng hợp từ dữ liệu mẫu phục vụ kiểm thử giao
            diện UI-06.
          </AppText>
        </View>

        <View style={{ marginVertical: spacing.sm }}>
          <Segmented<'7d' | '30d' | 'all'>
            items={[
              { key: '7d', label: '7 ngày' },
              { key: '30d', label: '30 ngày' },
              { key: 'all', label: 'Tất cả' },
            ]}
            selectedKey={selectedRange}
            onSelect={(key: '7d' | '30d' | 'all') => setSelectedRange(key)}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <StatCard label="Bệnh nhân" value={`${currentStats.patientCount}`} icon="patients" />
            </View>
            <View style={styles.statCol}>
              <StatCard
                label="Ca hoàn tất"
                value={`${currentStats.completedCaseCount}`}
                icon="success"
                tone="brand"
              />
            </View>
          </View>

          <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
            <View style={styles.statCol}>
              <StatCard
                label="Ca nháp"
                value={`${currentStats.draftCaseCount}`}
                icon="draft"
                tone="warning"
              />
            </View>
            <View style={styles.statCol}>
              <StatCard
                label="Ảnh đã phân tích"
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
            Số ảnh theo nhãn AI (Tổng: {benign + malignant + normal} ảnh)
          </AppText>

          <View style={styles.chartRow}>
            <AppText variant="bodyS" style={styles.labelCol}>
              Lành tính
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
              Ác tính
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
              Bình thường
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
              * Đơn vị thống kê: theo số ca khám (ca) và số ảnh CT (ảnh).
            </AppText>
            <AppText
              variant="caption"
              style={{
                color: colors.text.secondary,
                marginTop: 2,
                fontStyle: 'italic',
              }}
            >
              * {currentStats.unitNotes.syncFormulaNote}
            </AppText>
          </View>
        </View>
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
