import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { Icon } from '../../../ui/icons';
import { ALL_ICON_NAMES } from '../../../ui/icons/manifest-constants';

/**
 * Màn hình UIGalleryScreen (UI-02) phục vụ kiểm thử và đánh giá phát triển:
 * - Hiển thị toàn bộ 64 icon hệ thống dạng lưới kèm tên chuẩn hóa.
 * - Cho phép chuyển đổi chế độ Sáng / Tối / Theo hệ thống.
 * - Cho phép chuyển đổi ngôn ngữ hiển thị Việt - Anh (i18n).
 * - Hiển thị các câu thông báo chuẩn y tế (MSG-01, MSG-02...) để xác nhận font Be Vietnam Pro và i18n.
 */
export const UIGalleryScreen: React.FC = () => {
  const { theme, preference, setPreference } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const { t, i18n } = useTranslation();
  const [, setTick] = React.useState(0);

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
        titleText: {
          ...typography.titleL,
          color: colors.text.primary,
        },
        subtitleText: {
          ...typography.bodyS,
          color: colors.text.secondary,
          marginTop: spacing.xs,
        },
        controlSection: {
          marginTop: spacing.md,
        },
        buttonRow: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.xs,
        },
        button: {
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
        activeButton: {
          backgroundColor: colors.brand.primary,
          borderColor: colors.brand.primary,
        },
        buttonText: {
          ...typography.labelS,
          color: colors.text.secondary,
        },
        activeButtonText: {
          ...typography.labelS,
          color: colors.text.onBrand,
        },
        i18nBanner: {
          margin: spacing.lg,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.bg.surface,
          borderWidth: 1,
          borderColor: colors.border.default,
        },
        i18nTitle: {
          ...typography.labelL,
          color: colors.brand.primary,
          marginBottom: spacing.xs,
        },
        i18nText: {
          ...typography.bodyM,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        },
        i18nSubText: {
          ...typography.bodyS,
          color: colors.text.secondary,
        },
        gridContainer: {
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
        },
        gridHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        },
        gridHeaderText: {
          ...typography.titleM,
          color: colors.text.primary,
        },
        gridHeaderBadge: {
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: radius.full,
          backgroundColor: colors.bg.brandSubtle,
        },
        gridHeaderBadgeText: {
          ...typography.caption,
          color: colors.brand.primary,
        },
        iconGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          justifyContent: 'space-between',
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header điều khiển */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.titleRow}>
            <View>
              <Text style={dynamicStyles.titleText}>UI Gallery (UI-02)</Text>
              <Text style={dynamicStyles.subtitleText}>
                Be Vietnam Pro • 64 SVG Icons • Đa ngôn ngữ Việt-Anh
              </Text>
            </View>
            <Icon name="grad-cam" size={36} />
          </View>

          {/* Hàng chọn Theme */}
          <View style={dynamicStyles.controlSection}>
            <Text style={dynamicStyles.subtitleText}>Giao diện (Theme):</Text>
            <View style={dynamicStyles.buttonRow}>
              {(['light', 'dark', 'system'] as const).map((mode) => {
                const isActive = preference === mode;
                const label = mode === 'light' ? 'Sáng' : mode === 'dark' ? 'Tối' : 'Hệ thống';
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[dynamicStyles.button, isActive && dynamicStyles.activeButton]}
                    onPress={() => setPreference(mode)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[dynamicStyles.buttonText, isActive && dynamicStyles.activeButtonText]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Hàng chọn Ngôn ngữ */}
          <View style={dynamicStyles.controlSection}>
            <Text style={dynamicStyles.subtitleText}>Ngôn ngữ (Language):</Text>
            <View style={dynamicStyles.buttonRow}>
              <TouchableOpacity
                style={[dynamicStyles.button, currentLang === 'vi' && dynamicStyles.activeButton]}
                onPress={() => toggleLanguage('vi')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    dynamicStyles.buttonText,
                    currentLang === 'vi' && dynamicStyles.activeButtonText,
                  ]}
                >
                  Tiếng Việt (VI)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.button, currentLang === 'en' && dynamicStyles.activeButton]}
                onPress={() => toggleLanguage('en')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    dynamicStyles.buttonText,
                    currentLang === 'en' && dynamicStyles.activeButtonText,
                  ]}
                >
                  English (EN)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Khối hiển thị mẫu đa ngôn ngữ y tế */}
        <View style={dynamicStyles.i18nBanner}>
          <Text style={dynamicStyles.i18nTitle}>
            {t('nav.settings', 'Cài đặt')} — {t('role.doctor', 'Bác sĩ')}
          </Text>
          <Text style={dynamicStyles.i18nText}>MSG-01: {t('msg.msg_01', 'Đã lưu ca khám')}</Text>
          <Text style={dynamicStyles.i18nSubText}>MSG-02: {t('msg.msg_02')}</Text>
          <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                backgroundColor: colors.ai.benign.bg,
              }}
            >
              <Text style={{ ...typography.caption, color: colors.ai.benign.fg }}>
                {t('common.benign', 'Lành tính')}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                backgroundColor: colors.ai.malignant.bg,
              }}
            >
              <Text style={{ ...typography.caption, color: colors.ai.malignant.fg }}>
                {t('common.malignant', 'Ác tính')}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                backgroundColor: colors.ai.normal.bg,
              }}
            >
              <Text style={{ ...typography.caption, color: colors.ai.normal.fg }}>
                {t('common.normal', 'Bình thường')}
              </Text>
            </View>
          </View>
        </View>

        {/* Lưới 64 Icons */}
        <View style={dynamicStyles.gridContainer}>
          <View style={dynamicStyles.gridHeader}>
            <Text style={dynamicStyles.gridHeaderText}>
              Hệ thống Icon ({ALL_ICON_NAMES.length})
            </Text>
            <View style={dynamicStyles.gridHeaderBadge}>
              <Text style={dynamicStyles.gridHeaderBadgeText}>Vector SVG</Text>
            </View>
          </View>

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
    </SafeAreaView>
  );
};
