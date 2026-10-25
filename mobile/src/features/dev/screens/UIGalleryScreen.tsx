import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { Icon } from '../../../ui/icons';
import { ALL_ICON_NAMES } from '../../../ui/icons/manifest-constants';
import {
  AppText,
  Button,
  IconButton,
  TextField,
  SearchField,
  FilterChip,
  StatusBadge,
  AILabel,
  Banner,
  TopBar,
  TabBar,
  ListRow,
  SectionHeader,
  StatCard,
  EmptyState,
  Divider,
} from '../../../ui/components';

/**
 * Màn hình UIGalleryScreen (UI-02 & UI-03) phục vụ kiểm thử và đánh giá phát triển:
 * - Hiển thị toàn bộ 17 Component lõi đợt 1 với đầy đủ biến thể (Buttons, TextFields, Chips, Badges, Banners, Rows...).
 * - Cho phép chuyển đổi chế độ Sáng / Tối / Theo hệ thống.
 * - Cho phép chuyển đổi ngôn ngữ hiển thị Việt - Anh (i18n).
 * - Hiển thị 64 icon vector SVG hệ thống.
 */
export const UIGalleryScreen: React.FC = () => {
  const { theme, preference, setPreference } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const { t, i18n } = useTranslation();
  const [, setTick] = useState(0);

  // Trạng thái thử nghiệm các component
  const [searchValue, setSearchValue] = useState('');
  const [textFieldVal, setTextFieldVal] = useState('Dương Thị Thu Diểm');
  const [selectedChip, setSelectedChip] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [btnLoading, setBtnLoading] = useState(false);

  const currentLang = i18n.language.startsWith('vi') ? 'vi' : 'en';

  const toggleLanguage = async (lang: 'vi' | 'en') => {
    await i18n.changeLanguage(lang);
    setTick((prev) => prev + 1);
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.bg.app,
        },
        header: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.bg.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.default,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        controlSection: {
          marginTop: spacing.md,
        },
        buttonRow: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.xs,
        },
        themeBtn: {
          flex: 1,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border.default,
          backgroundColor: colors.bg.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        },
        themeBtnActive: {
          backgroundColor: colors.brand.primary,
          borderColor: colors.brand.primary,
        },
        sectionBlock: {
          marginHorizontal: spacing.lg,
          marginTop: spacing.xl,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.bg.surface,
          borderWidth: 1,
          borderColor: colors.border.default,
        },
        rowGap: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginTop: spacing.sm,
        },
        gridContainer: {
          paddingHorizontal: spacing.lg,
          marginTop: spacing.xl,
          paddingBottom: spacing.xxl,
        },
        iconGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          justifyContent: 'space-between',
          marginTop: spacing.sm,
        },
        iconCard: {
          width: '30%',
          aspectRatio: 1,
          backgroundColor: colors.bg.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border.default,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xs,
        },
        iconNameText: {
          ...typography.caption,
          color: colors.text.secondary,
          marginTop: spacing.xs,
          textAlign: 'center',
          fontSize: 10,
          lineHeight: 12,
        },
      }),
    [colors, spacing, radius, typography],
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* TopBar demo */}
      <TopBar
        title="UI Gallery (UI-03 Core Components)"
        type="root"
        rightActions={
          <IconButton name="settings" accessibilityLabel="Cài đặt" onPress={() => {}} />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header điều khiển Theme & Ngôn ngữ */}
        <View style={dynamicStyles.header}>
          <AppText variant="bodyS" color={colors.text.secondary}>
            17 Component lõi đợt 1 • 64 SVG Icons • Be Vietnam Pro
          </AppText>

          {/* Theme Switcher */}
          <View style={dynamicStyles.controlSection}>
            <AppText variant="caption" color={colors.text.tertiary}>
              Chế độ Giao diện (Theme):
            </AppText>
            <View style={dynamicStyles.buttonRow}>
              {(['light', 'dark', 'system'] as const).map((mode) => {
                const isActive = preference === mode;
                const label = mode === 'light' ? 'Sáng' : mode === 'dark' ? 'Tối' : 'Hệ thống';
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[dynamicStyles.themeBtn, isActive && dynamicStyles.themeBtnActive]}
                    onPress={() => setPreference(mode)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        typography.labelS,
                        {
                          color: isActive ? colors.text.onBrand : colors.text.secondary,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Language Switcher */}
          <View style={dynamicStyles.controlSection}>
            <AppText variant="caption" color={colors.text.tertiary}>
              Ngôn ngữ (Language):
            </AppText>
            <View style={dynamicStyles.buttonRow}>
              <TouchableOpacity
                style={[
                  dynamicStyles.themeBtn,
                  currentLang === 'vi' && dynamicStyles.themeBtnActive,
                ]}
                onPress={() => toggleLanguage('vi')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    typography.labelS,
                    {
                      color: currentLang === 'vi' ? colors.text.onBrand : colors.text.secondary,
                    },
                  ]}
                >
                  Tiếng Việt (VI)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.themeBtn,
                  currentLang === 'en' && dynamicStyles.themeBtnActive,
                ]}
                onPress={() => toggleLanguage('en')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    typography.labelS,
                    {
                      color: currentLang === 'en' ? colors.text.onBrand : colors.text.secondary,
                    },
                  ]}
                >
                  English (EN)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 1. KHỐI THÔNG BÁO BANNER */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader title="1. Banner Thông Báo Hệ Thống" />
          <Banner
            type="offline"
            title={t('common.offline', 'Chế độ Ngoại tuyến')}
            body="Đang chạy mô hình AI Adaptive trực tiếp on-device, không cần Internet."
            style={{ marginBottom: spacing.sm }}
          />
          <Banner
            type="mock"
            title="Dữ liệu giả lập lâm sàng"
            body="Ảnh và thông tin trong giao diện chỉ phục vụ nghiên cứu khóa luận."
          />
        </View>

        {/* 2. KHỐI NÚT BẤM (BUTTONS & ICONBUTTONS) */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader title="2. Nút Bấm (Button & IconButton)" />
          <View style={dynamicStyles.rowGap}>
            <Button
              label="Primary L"
              variant="primary"
              size="L"
              leadingIcon="grad-cam"
              onPress={() => {}}
            />
            <Button
              label="Secondary M"
              variant="secondary"
              size="M"
              leadingIcon="ct-image"
              onPress={() => {}}
            />
            <Button
              label={btnLoading ? 'Đang xử lý...' : 'Thử Loading'}
              variant="primary"
              size="M"
              loading={btnLoading}
              onPress={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 2000);
              }}
            />
            <Button
              label="Danger (Xóa ca)"
              variant="danger"
              size="M"
              leadingIcon="trash"
              onPress={() => {}}
            />
          </View>

          <View style={[dynamicStyles.rowGap, { marginTop: spacing.md }]}>
            <IconButton
              name="camera"
              accessibilityLabel="Chụp ảnh CT"
              variant="tonal"
              onPress={() => {}}
            />
            <IconButton
              name="image-upload"
              accessibilityLabel="Tải ảnh lên"
              variant="plain"
              onPress={() => {}}
            />
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ"
              variant="tonal"
              onPress={() => {}}
            />
            <IconButton name="lock" accessibilityLabel="Bảo mật" disabled onPress={() => {}} />
          </View>
        </View>

        {/* 3. KHỐI Ô NHẬP LIỆU (TEXTFIELD & SEARCHFIELD) */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader title="3. Ô Nhập Liệu & Tìm Kiếm" />
          <SearchField
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Tìm theo tên bệnh nhân, mã hồ sơ..."
            style={{ marginBottom: spacing.md }}
          />

          <TextField
            label="Họ và tên Bệnh nhân"
            value={textFieldVal}
            onChangeText={setTextFieldVal}
            placeholder="Nhập tên"
            helper="Nhập đầy đủ họ tên theo căn cước hoặc thẻ BHYT"
            trailingIcon="edit"
            style={{ marginBottom: spacing.md }}
          />

          <TextField
            label="Số điện thoại liên hệ"
            value="0987654321"
            placeholder="Số điện thoại"
            error="Số điện thoại không đúng định dạng 10 chữ số"
            trailingIcon="error"
          />
        </View>

        {/* 4. KHỐI THẺ LỌC, BADGE VÀ NHÃN AI */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader title="4. Chip Lọc, Badge & Nhãn AI" />
          <View style={dynamicStyles.rowGap}>
            <FilterChip
              label="Tất cả ca"
              selected={selectedChip === 'all'}
              onPress={() => setSelectedChip('all')}
            />
            <FilterChip
              label="Chờ duyệt"
              selected={selectedChip === 'pending'}
              onPress={() => setSelectedChip('pending')}
            />
            <FilterChip
              label="Ác tính"
              selected={selectedChip === 'malignant'}
              onPress={() => setSelectedChip('malignant')}
            />
          </View>

          <Divider spacingVertical={spacing.md} />

          <View style={dynamicStyles.rowGap}>
            <StatusBadge label="Đã hoàn thành" tone="success" />
            <StatusBadge label="Cảnh báo kiểm tra" tone="warning" />
            <StatusBadge label="Lỗi tải ảnh" tone="danger" />
            <StatusBadge label="Đang chờ phân tích" tone="pending" />
            <StatusBadge label="Trực tiếp On-Device" tone="brand" />
          </View>

          <Divider spacingVertical={spacing.md} />

          <View style={dynamicStyles.rowGap}>
            <AILabel classification="Benign" />
            <AILabel classification="Malignant" />
            <AILabel classification="Normal" />
          </View>
        </View>

        {/* 5. KHỐI THẺ THỐNG KÊ (STATCARD) */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader
            title="5. Thống Kê Số Lượng (StatCard)"
            actionLabel="Chi tiết"
            onActionPress={() => {}}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
            <StatCard
              label="Tổng ca khám"
              value={128}
              tone="brand"
              icon="cases"
              caption="+12 ca trong tuần"
            />
            <StatCard
              label="Cần hội chẩn"
              value={14}
              tone="warning"
              icon="warning"
              caption="Ưu tiên đọc ảnh"
            />
          </View>
        </View>

        {/* 6. KHỐI DANH SÁCH (LISTROW) */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader
            title="6. Thẻ Danh Sách (ListRow)"
            actionLabel="Xem tất cả"
            onActionPress={() => {}}
          />
          <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
            <ListRow
              title="Trần Thị Bích Loan (48 tuổi)"
              subtitle="Ca #CT-2026-089 • Khoa Hô Hấp"
              leadingIcon="patients"
              badges={<AILabel classification="Malignant" />}
              onPress={() => {}}
            />
            <ListRow
              title="Lê Hoàng Nam (62 tuổi)"
              subtitle="Ca #CT-2026-090 • Kiểm tra định kỳ"
              leadingIcon="patients"
              badges={<StatusBadge label="Chờ đọc CAM" tone="pending" />}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* 7. KHỐI TRẠNG THÁI RỖNG (EMPTYSTATE) */}
        <View style={dynamicStyles.sectionBlock}>
          <SectionHeader title="7. Trạng Thái Rỗng (EmptyState)" />
          <EmptyState
            type="noData"
            title="Không tìm thấy kết quả"
            body="Không có hồ sơ bệnh nhân nào khớp với từ khóa tìm kiếm của bạn."
            actionLabel="Tạo hồ sơ bệnh nhân mới"
            onActionPress={() => {}}
          />
        </View>

        {/* 8. LƯỚI 64 ICONS */}
        <View style={dynamicStyles.gridContainer}>
          <SectionHeader title={`8. Hệ Thống 64 Vector Icons (${ALL_ICON_NAMES.length})`} />
          <View style={dynamicStyles.iconGrid}>
            {ALL_ICON_NAMES.map((iconName) => (
              <View key={iconName} style={dynamicStyles.iconCard}>
                <Icon name={iconName} size={30} />
                <Text style={dynamicStyles.iconNameText} numberOfLines={1} ellipsizeMode="tail">
                  {iconName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* TabBar demo hiển thị cố định ở đáy */}
      <TabBar role="doctor" activeTabKey={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};
