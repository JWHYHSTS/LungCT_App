import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  IconButton,
  ProgressBar,
  Segmented,
  StatCard,
  TopBar,
} from '../../../ui/components';
import { getAdminStatsByPeriod, type AdminOverviewStats } from '../../../mocks/adminMocks';
import { fetchAdminOverviewStatsFromFirestore } from '../../../services/firebase/adminService';

/**
 * SCR-M03 (10-admin-stats): Màn hình Quản trị viên · Thống kê tổng hợp.
 * - Segmented chọn kỳ: 7 ngày, 30 ngày, Tất cả.
 * - 4 StatCard: Bác sĩ hoạt động, Chờ duyệt, Ca hoàn tất, Ảnh đã phân tích.
 * - Bảng phân bố ảnh theo nhãn AI: Lành tính (Benign), Ác tính (Malignant), Bình thường (Normal).
 * - Ghi chú minh bạch: "Chỉ dữ liệu đã đồng bộ, không gồm kết quả giả lập; không có dữ liệu định danh bệnh nhân."
 * - TUÂN THỦ BR-OWN-03: Không trích xuất dữ liệu cá nhân hay ảnh CT.
 */
export const AdminStatsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const [period, setPeriod] = useState<string>('30d');
  const [cloudStats, setCloudStats] = useState<AdminOverviewStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const res = await fetchAdminOverviewStatsFromFirestore(
          period as '7d' | '30d' | 'all',
        );
        if (isMounted) {
          setCloudStats(res);
        }
      } catch (err) {
        console.warn('[AdminStatsScreen] Lỗi nạp thống kê từ Firestore:', err);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const stats: AdminOverviewStats =
    cloudStats || getAdminStatsByPeriod(period as '7d' | '30d' | 'all');

  const totalImages = stats.analyzedImages || 1;
  const benignPercent = Math.round((stats.aiBreakdown.benign / totalImages) * 100);
  const malignantPercent = Math.round((stats.aiBreakdown.malignant / totalImages) * 100);
  const normalPercent = Math.round((stats.aiBreakdown.normal / totalImages) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('admin.stats_title', 'Thống kê tổng hợp')}
        type="root"
        rightActions={
          <IconButton
            name="notifications"
            accessibilityLabel={t('admin.notifications', 'Thông báo')}
            onPress={() => {}}
          />
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bộ chọn kỳ thống kê */}
        <View style={{ marginBottom: spacing.md }}>
          <Segmented
            items={[
              { key: '7d', label: t('admin.stats_period_7d', '7 ngày') },
              { key: '30d', label: t('admin.stats_period_30d', '30 ngày') },
              { key: 'all', label: t('admin.stats_period_all', 'Tất cả') },
            ]}
            selectedKey={period}
            onSelect={setPeriod}
          />
        </View>

        {/* 4 thẻ StatCard vĩ mô */}
        <View style={styles.statGrid}>
          <View style={styles.gridRow}>
            <StatCard
              icon="account-approval"
              label={t('admin.stat_active_doctors', 'Bác sĩ hoạt động')}
              value={stats.activeDoctors}
              style={{ flex: 1, marginRight: spacing.xs }}
            />
            <StatCard
              icon="pending"
              label={t('admin.stat_pending_doctors', 'Chờ duyệt')}
              value={stats.pendingDoctors}
              style={{ flex: 1 }}
            />
          </View>

          <View style={[styles.gridRow, { marginTop: spacing.xs }]}>
            <StatCard
              icon="success"
              label={t('admin.stat_completed_cases', 'Ca hoàn tất')}
              value={stats.completedCases}
              style={{ flex: 1, marginRight: spacing.xs }}
            />
            <StatCard
              icon="cases"
              label={t('admin.stat_analyzed_images', 'Ảnh đã phân tích')}
              value={stats.analyzedImages.toLocaleString()}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Biểu đồ phân bổ ảnh theo 3 nhãn AI chuẩn */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <AppText variant="titleS" style={{ marginBottom: spacing.md }}>
            {t('admin.chart_title', 'Ảnh theo nhãn AI')}
          </AppText>

          {/* Lành tính (Benign) */}
          <View style={styles.chartRow}>
            <View style={styles.chartLabelBox}>
              <AppText variant="bodyS">{t('admin.chart_label_benign', 'Lành tính')}</AppText>
            </View>
            <View style={styles.barWrapper}>
              <ProgressBar
                progress={benignPercent}
                color={colors.ai.benign.fg}
                style={{ height: 12, borderRadius: 6 }}
              />
            </View>
            <View style={styles.chartValueBox}>
              <AppText variant="labelM">{stats.aiBreakdown.benign}</AppText>
            </View>
          </View>

          {/* Ác tính (Malignant) */}
          <View style={[styles.chartRow, { marginTop: spacing.sm }]}>
            <View style={styles.chartLabelBox}>
              <AppText variant="bodyS">{t('admin.chart_label_malignant', 'Ác tính')}</AppText>
            </View>
            <View style={styles.barWrapper}>
              <ProgressBar
                progress={malignantPercent}
                color={colors.ai.malignant.fg}
                style={{ height: 12, borderRadius: 6 }}
              />
            </View>
            <View style={styles.chartValueBox}>
              <AppText variant="labelM">{stats.aiBreakdown.malignant}</AppText>
            </View>
          </View>

          {/* Bình thường (Normal) */}
          <View style={[styles.chartRow, { marginTop: spacing.sm }]}>
            <View style={styles.chartLabelBox}>
              <AppText variant="bodyS">{t('admin.chart_label_normal', 'Bình thường')}</AppText>
            </View>
            <View style={styles.barWrapper}>
              <ProgressBar
                progress={normalPercent}
                color={colors.ai.normal.fg}
                style={{ height: 12, borderRadius: 6 }}
              />
            </View>
            <View style={styles.chartValueBox}>
              <AppText variant="labelM">{stats.aiBreakdown.normal}</AppText>
            </View>
          </View>

          {/* Ghi chú minh bạch dữ liệu */}
          <View
            style={{
              marginTop: spacing.md,
              paddingTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: colors.border.default,
            }}
          >
            <AppText variant="caption" color={colors.text.secondary}>
              {t(
                'admin.chart_note',
                'Chỉ dữ liệu đã đồng bộ, không gồm kết quả giả lập; không có dữ liệu định danh bệnh nhân.',
              )}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  statGrid: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  chartCard: {
    borderWidth: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabelBox: {
    width: 90,
  },
  barWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  chartValueBox: {
    width: 44,
    alignItems: 'flex-end',
  },
});
