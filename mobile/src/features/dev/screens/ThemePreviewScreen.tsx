import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../ui/theme';

interface ColorCardProps {
  label: string;
  colorHex: string;
  textColor?: string;
  borderColor?: string;
}

/**
 * Hiển thị một thẻ màu đơn lẻ gồm tên token ngữ nghĩa và mã màu hex.
 */
function ColorCard({ label, colorHex, textColor, borderColor }: ColorCardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.colorCard,
        {
          backgroundColor: colorHex,
          borderColor: borderColor || '#0000001A',
        },
      ]}
    >
      <Text style={[styles.colorLabel, { color: textColor || '#1F2937' }]}>{label}</Text>
      <Text style={[styles.colorHex, { color: textColor || '#4B5563' }]}>{colorHex}</Text>
    </View>
  );
}

/**
 * Màn hình xem thử Theme nội bộ dành riêng cho phát triển (Development Only).
 *
 * Nhiệm vụ:
 * 1. Hiển thị trực quan toàn bộ 48 token màu sắc đã định nghĩa trong design system.
 * 2. Cung cấp bộ chuyển đổi nhanh chế độ Theme (`system`, `light`, `dark`) để kỹ sư kiểm tra
 *    tương phản và phản ứng đổi giao diện ngay lập tức mà không cần chỉnh cài đặt điện thoại.
 *
 * Giới hạn:
 * - Màn hình này không phải màn nghiệp vụ lâm sàng của bác sĩ hay quản trị viên.
 * - Test unit (jest) chỉ kiểm tra tính hợp lệ toán học của token; việc hiển thị đúng phụ thuộc
 *   vào việc render thực tế của React Native trên engine di động.
 */
export function ThemePreviewScreen(): React.JSX.Element {
  const { theme, preference, setPreference } = useTheme();
  const { colors, scheme } = theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header & Bộ chuyển đổi Theme */}
        <View
          style={[
            styles.sectionHeaderBox,
            { backgroundColor: colors.bg.surface, borderColor: colors.border.default },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Bảng Kiểm Thử Theme (Dev Preview)
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Chế độ áp dụng: <Text style={styles.boldText}>{scheme.toUpperCase()}</Text> | Lựa chọn:{' '}
            {preference}
          </Text>

          <View style={styles.preferenceRow}>
            {(['system', 'light', 'dark'] as const).map((pref) => {
              const active = preference === pref;
              return (
                <TouchableOpacity
                  key={pref}
                  onPress={() => setPreference(pref)}
                  style={[
                    styles.button,
                    {
                      backgroundColor: active ? colors.brand.primary : colors.bg.app,
                      borderColor: active ? colors.brand.primary : colors.border.control,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Chuyển theme sang ${pref}`}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: active ? colors.text.onBrand : colors.text.primary },
                    ]}
                  >
                    {pref === 'system' ? 'Hệ thống' : pref === 'light' ? 'Sáng' : 'Tối'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 1. Brand Colors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            1. Màu Thương Hiệu (Brand)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="brand.primary"
              colorHex={colors.brand.primary}
              textColor={colors.text.onBrand}
            />
            <ColorCard
              label="brand.primaryPressed"
              colorHex={colors.brand.primaryPressed}
              textColor={colors.text.onBrand}
            />
            <ColorCard
              label="brand.accent"
              colorHex={colors.brand.accent}
              textColor={colors.text.primary}
            />
          </View>
        </View>

        {/* 2. Background Colors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            2. Màu Nền (Background)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="bg.app"
              colorHex={colors.bg.app}
              textColor={colors.text.primary}
              borderColor={colors.border.default}
            />
            <ColorCard
              label="bg.surface"
              colorHex={colors.bg.surface}
              textColor={colors.text.primary}
              borderColor={colors.border.default}
            />
            <ColorCard
              label="bg.surfaceAlt"
              colorHex={colors.bg.surfaceAlt}
              textColor={colors.text.primary}
              borderColor={colors.border.default}
            />
            <ColorCard
              label="bg.sunken"
              colorHex={colors.bg.sunken}
              textColor={colors.text.primary}
              borderColor={colors.border.default}
            />
            <ColorCard
              label="bg.brandSubtle"
              colorHex={colors.bg.brandSubtle}
              textColor={colors.brand.primary}
              borderColor={colors.border.default}
            />
            <ColorCard
              label="bg.inverse"
              colorHex={colors.bg.inverse}
              textColor={colors.text.inverse}
            />
            <ColorCard
              label="bg.imageCanvas"
              colorHex={colors.bg.imageCanvas}
              textColor="#FFFFFF"
            />
            <ColorCard label="bg.scrim" colorHex={colors.bg.scrim} textColor="#FFFFFF" />
          </View>
        </View>

        {/* 3. Text Colors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            3. Màu Chữ (Text)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="text.primary"
              colorHex={colors.text.primary}
              textColor={colors.bg.app}
            />
            <ColorCard
              label="text.secondary"
              colorHex={colors.text.secondary}
              textColor={colors.bg.app}
            />
            <ColorCard
              label="text.tertiary"
              colorHex={colors.text.tertiary}
              textColor={colors.bg.app}
            />
            <ColorCard
              label="text.onBrand"
              colorHex={colors.text.onBrand}
              textColor={colors.brand.primary}
            />
            <ColorCard
              label="text.inverse"
              colorHex={colors.text.inverse}
              textColor={colors.text.primary}
            />
            <ColorCard label="text.link" colorHex={colors.text.link} textColor="#FFFFFF" />
            <ColorCard
              label="text.disabled"
              colorHex={colors.text.disabled}
              textColor={colors.bg.app}
            />
          </View>
        </View>

        {/* 4. Status Badges */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            4. Trạng Thái Hệ Thống (Status Badges)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="success"
              colorHex={colors.status.success.bg}
              textColor={colors.status.success.fg}
              borderColor={colors.status.success.border}
            />
            <ColorCard
              label="warning"
              colorHex={colors.status.warning.bg}
              textColor={colors.status.warning.fg}
              borderColor={colors.status.warning.border}
            />
            <ColorCard
              label="danger"
              colorHex={colors.status.danger.bg}
              textColor={colors.status.danger.fg}
              borderColor={colors.status.danger.border}
            />
            <ColorCard
              label="info"
              colorHex={colors.status.info.bg}
              textColor={colors.status.info.fg}
              borderColor={colors.status.info.border}
            />
            <ColorCard
              label="neutral"
              colorHex={colors.status.neutral.bg}
              textColor={colors.status.neutral.fg}
              borderColor={colors.status.neutral.border}
            />
            <ColorCard
              label="pending"
              colorHex={colors.status.pending.bg}
              textColor={colors.status.pending.fg}
              borderColor={colors.status.pending.border}
            />
          </View>
        </View>

        {/* 5. AI Prediction Labels */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            5. Nhãn Phân Loại AI (3 Lớp Chuẩn & Bar Track)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="Benign (Lành tính)"
              colorHex={colors.ai.benign.bg}
              textColor={colors.ai.benign.fg}
            />
            <ColorCard
              label="Malignant (Ác tính)"
              colorHex={colors.ai.malignant.bg}
              textColor={colors.ai.malignant.fg}
            />
            <ColorCard
              label="Normal (Bình thường)"
              colorHex={colors.ai.normal.bg}
              textColor={colors.ai.normal.fg}
            />
            <ColorCard
              label="barTrack"
              colorHex={colors.ai.barTrack}
              textColor={colors.text.primary}
              borderColor={colors.border.default}
            />
          </View>
        </View>

        {/* 6. Border & Control */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            6. Đường Viền & Điều Khiển (Border)
          </Text>
          <View style={styles.grid}>
            <ColorCard
              label="border.default"
              colorHex={colors.border.default}
              textColor={colors.text.primary}
              borderColor={colors.border.strong}
            />
            <ColorCard
              label="border.strong"
              colorHex={colors.border.strong}
              textColor={colors.text.primary}
            />
            <ColorCard label="border.focus" colorHex={colors.border.focus} textColor="#FFFFFF" />
            <ColorCard
              label="border.icon"
              colorHex={colors.border.icon}
              textColor={colors.text.primary}
            />
            <ColorCard
              label="border.control"
              colorHex={colors.border.control}
              textColor={colors.text.primary}
              borderColor={colors.border.strong}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  colorHex: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
