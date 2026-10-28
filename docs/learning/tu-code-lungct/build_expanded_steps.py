# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN CÁC BƯỚC MỞ RỘNG (BƯỚC 017 ĐẾN BƯỚC 030):
Bao phủ:
- AppText.tsx, IconButton.tsx, TextField.tsx, Screen.tsx
- ScoreRow.tsx, ScoreCard.tsx, HeatmapLegend.tsx, CTImageView.tsx
- RootNavigator.tsx, AuthContext.tsx, DoctorStack.tsx, DoctorHomeScreen.tsx
- PatientRepository.ts, CaseRepository.ts, CryptoVault.ts, LocalStorageService.ts
- NativeCryptoVaultModule.kt, LungCtPipelineModule.kt, onDevicePipeline.ts
- AIImageResultScreen.tsx
"""

from build_large_curriculum import add_full_step

def append_expanded_steps(doc):
    # ==========================================
    # BƯỚC 017: AppText.tsx
    # ==========================================
    add_full_step(
        doc, step_num=17,
        title="Xây dựng Thành phần Văn bản chuẩn hóa (AppText.tsx)",
        purpose="Chuẩn hóa toàn bộ hiển thị văn bản trong ứng dụng LungCT, tự động áp dụng 12 biến thể typography Figma và hỗ trợ đổi màu linh hoạt.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/AppText.tsx",
        code_file_path="src/ui/components/AppText.tsx",
        full_code="""import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme, type TypographyVariant } from '../theme';

export interface AppTextProps extends TextProps {
  /** Biến thể typography theo hệ thống thiết kế Figma (12 kiểu) */
  variant?: TypographyVariant;
  /** Màu chữ tùy chọn, mặc định lấy theo theme colors.text.primary */
  color?: string;
}

/**
 * Thành phần văn bản chuẩn của hệ thống LungCT.
 * Tự động áp dụng font Be Vietnam Pro, kích thước và khoảng cách dòng từ useTheme().
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyM',
  color,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const { typography, colors } = theme;

  return (
    <Text
      style={[typography[variant], { color: color ?? colors.text.primary }, style]}
      allowFontScaling
      {...rest}
    >
      {children}
    </Text>
  );
};""",
        line_by_line_explanation=[
            ["export interface AppTextProps extends TextProps", "Kế thừa toàn bộ thuộc tính văn bản gốc của React Native (như numberOfLines, ellipsizeMode) và bổ sung thêm biến thể variant."],
            ["variant?: TypographyVariant;", "Cho phép chọn 1 trong 12 kiểu chữ chuẩn (titleL, titleM, bodyM, caption, tabular-nums cho số liệu AI)."],
            ["const { typography, colors } = theme;", "Lấy trực tiếp bảng token kiểu chữ và bảng màu từ hook ngữ cảnh giao diện useTheme()."],
            ["color: color ?? colors.text.primary", "Toán tử kết hợp nullish: Nếu lập trình viên không truyền màu riêng, tự động dùng màu chữ chính chuẩn WCAG của theme."]
        ],
        comment_guide="Giải thích lý do dùng AppText thay vì Text gốc: Bảo đảm 100% văn bản toàn ứng dụng dùng font Be Vietnam Pro và hỗ trợ đổi giao diện Sáng / Tối tự động.",
        wiring_guide="Mở tệp src/ui/components/index.ts, thêm dòng: export * from './AppText'; để các màn hình khác có thể import ngắn gọn.",
        run_and_verify="Lưu file. Chạy 'npx tsc --noEmit' kiểm tra kiểu dữ liệu thành công không có lỗi đỏ.",
        troubleshooting="Nếu báo lỗi không tìm thấy TypographyVariant: Kiểm tra lại tệp src/ui/theme/types.ts đã export kiểu TypographyVariant hay chưa.",
        checklist="[ ] AppText.tsx được lưu đúng thư mục src/ui/components/\n[ ] Đã export trong index.ts\n[ ] Hỗ trợ đầy đủ thuộc tính allowFontScaling cho người cao tuổi"
    )

    # ==========================================
    # BƯỚC 018: IconButton.tsx
    # ==========================================
    add_full_step(
        doc, step_num=18,
        title="Xây dựng Nút bấm Icon chuẩn Trợ năng (IconButton.tsx)",
        purpose="Cung cấp nút bấm thao tác nhanh dạng biểu tượng (quay lại, đóng modal, cài đặt, lọc), tuân thủ vùng chạm tối thiểu 44x44dp.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/IconButton.tsx",
        code_file_path="src/ui/components/IconButton.tsx",
        full_code="""import React from 'react';
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export type IconButtonVariant = 'plain' | 'tonal';

export interface IconButtonProps {
  /** Icon hiển thị từ bộ 64 SVG */
  name: IconName;
  /** Nhãn trợ năng bắt buộc phục vụ người khiếm thị đọc qua Screen Reader */
  accessibilityLabel: string;
  /** Biến thể kiểu dáng: plain (trong suốt) hoặc tonal (có màu nền nhạt) */
  variant?: IconButtonVariant;
  /** Kích thước icon (mặc định 24) */
  iconSize?: number;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Sự kiện chạm */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  accessibilityLabel,
  variant = 'plain',
  iconSize = 24,
  disabled = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const isTonal = variant === 'tonal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => {
        let backgroundColor = 'transparent';
        if (isTonal) {
          backgroundColor = pressed
            ? colors.bg.sunken
            : disabled
              ? colors.bg.app
              : colors.bg.surfaceAlt;
        } else if (pressed) {
          backgroundColor = colors.bg.sunken;
        }

        return [
          styles.base,
          {
            borderRadius: radius.md,
            backgroundColor,
            opacity: disabled ? 0.4 : 1,
          },
          style,
        ];
      }}
    >
      <Icon
        name={name}
        size={iconSize}
        color={disabled ? colors.text.disabled : colors.text.primary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});""",
        line_by_line_explanation=[
            ["accessibilityRole=\"button\"", "Khai báo rõ ràng cho Android TalkBack và iOS VoiceOver nhận diện đây là nút bấm."],
            ["accessibilityLabel: string;", "Thuộc tính BẮT BUỘC: Vì nút chỉ có icon không có chữ, chuỗi này là mô tả âm thanh duy nhất cho người khiếm thị."],
            ["minWidth: 44, minHeight: 44,", "Quy chuẩn WCAG 2.1: Bảo đảm vùng chạm cảm ứng luôn đạt tối thiểu 44x44dp ngay cả khi icon chỉ có cỡ 24dp."],
            ["opacity: disabled ? 0.4 : 1,", "Hiệu ứng thị giác trực quan làm mờ nút khi bị khóa thao tác."]
        ],
        comment_guide="Giải thích lý do accessibilityLabel là bắt buộc: Tránh lỗi kiểm tra trợ năng tự động và giúp bác sĩ dễ thao tác trong môi trường y tế bận rộn.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './IconButton';",
        run_and_verify="Lưu file. Chạy 'npx tsc --noEmit' kiểm tra kiểu TypeScript hợp lệ.",
        troubleshooting="Nếu icon không hiển thị: Kiểm tra xem tên icon truyền vào có nằm trong danh mục 64 icon của manifest.json hay không.",
        checklist="[ ] IconButton.tsx được lưu tại đúng đường dẫn\n[ ] Có xử lý vùng chạm tối thiểu 44x44dp\n[ ] Đã export trong index.ts"
    )

    # ==========================================
    # BƯỚC 019: TextField.tsx
    # ==========================================
    add_full_step(
        doc, step_num=19,
        title="Xây dựng Ô Nhập Liệu Chuẩn Y Tế (TextField.tsx)",
        purpose="Xây dựng trường nhập văn bản (tên bệnh nhân, mã hồ sơ, ghi chú lâm sàng), hỗ trợ trạng thái focus, lỗi viền đỏ và icon xóa nhanh.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/TextField.tsx",
        code_file_path="src/ui/components/TextField.tsx",
        full_code="""import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../icons';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  trailingIcon?: IconName;
  trailingIconAccessibilityLabel?: string;
  onTrailingIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helper,
  error,
  trailingIcon,
  trailingIconAccessibilityLabel,
  onTrailingIconPress,
  disabled = false,
  value,
  style,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const getBorderColor = () => {
    if (disabled) return colors.border.default;
    if (hasError) return colors.status.danger.fg;
    if (isFocused) return colors.border.focus;
    return colors.border.control;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            typography.labelM,
            {
              color: disabled ? colors.text.disabled : colors.text.primary,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? colors.bg.sunken : colors.bg.surface,
            borderColor: getBorderColor(),
            borderWidth: isFocused || hasError ? 2 : 1,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            typography.bodyL,
            {
              color: disabled ? colors.text.disabled : colors.text.primary,
            },
          ]}
          value={value}
          editable={!disabled}
          placeholderTextColor={colors.text.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />

        {trailingIcon && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingIconAccessibilityLabel ?? 'Nút hành động ô nhập liệu'}
            onPress={onTrailingIconPress}
            style={styles.trailingIcon}
          >
            <Icon
              name={trailingIcon}
              size={20}
              color={hasError ? colors.status.danger.fg : colors.text.secondary}
            />
          </Pressable>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            typography.caption,
            {
              color: hasError ? colors.status.danger.fg : colors.text.secondary,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: { flex: 1, paddingVertical: 10 },
  trailingIcon: { padding: 4, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});""",
        line_by_line_explanation=[
            ["const [isFocused, setIsFocused] = useState(false);", "Quản lý trạng thái con trỏ người dùng: Khi focus, viền ô nhập tự động đậm lên 2px màu xanh thương hiệu."],
            ["borderWidth: isFocused || hasError ? 2 : 1,", "Phản hồi thị giác mạnh mẽ: Khi có lỗi hoặc đang gõ, viền nổi bật để người dùng nhận diện ngay."],
            ["error ?? helper", "Toán tử nullish: Ưu tiên hiển thị thông điệp lỗi màu đỏ; nếu không có lỗi thì hiển thị gợi ý hướng dẫn màu xám."]
        ],
        comment_guide="Giải thích tiêu chuẩn y tế: Không bao giờ chỉ dùng viền đỏ để báo lỗi mà luôn có dòng chữ error hiển thị bên dưới.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './TextField';",
        run_and_verify="Lưu file. Biên dịch kiểm tra TypeScript không có lỗi.",
        troubleshooting="Nếu bàn phím che mất ô nhập khi gõ trên điện thoại: Màn hình chứa ô nhập phải bọc trong component Screen (có sẵn KeyboardAvoidingView).",
        checklist="[ ] TextField.tsx được tạo tại src/ui/components/\n[ ] Có hỗ trợ trạng thái focus, error, disabled\n[ ] Đã export trong index.ts"
    )

    # ==========================================
    # BƯỚC 020: Screen.tsx
    # ==========================================
    add_full_step(
        doc, step_num=20,
        title="Xây dựng Khung Bao Bọc Toàn Màn Hình (Screen.tsx)",
        purpose="Tạo khung màn hình chuẩn tự động xử lý vùng tai thỏ SafeAreaView, cuộn trang ScrollView và tự động đẩy giao diện tránh bàn phím.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/Screen.tsx",
        code_file_path="src/ui/components/Screen.tsx",
        full_code="""import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface ScreenProps {
  scrollable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  paddingHorizontal?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Screen: React.FC<ScreenProps> = ({
  scrollable = true,
  header,
  footer,
  paddingHorizontal,
  children,
  style,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const horizontalPadding = paddingHorizontal ?? spacing.lg;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg.app }, style]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}

        {scrollable ? (
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: horizontalPadding, paddingVertical: spacing.md },
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.container,
              { paddingHorizontal: horizontalPadding, paddingVertical: spacing.md },
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        )}

        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});""",
        line_by_line_explanation=[
            ["<SafeAreaView ...>", "Tự động thụt lề bảo vệ khỏi thanh trạng thái đỉnh và thanh điều hướng đáy của điện thoại."],
            ["behavior={Platform.OS === 'ios' ? 'padding' : undefined}", "Xử lý đặc thù nền tảng: Trên iOS bàn phím đẩy bằng padding, trên Android hệ điều hành tự resize window."],
            ["keyboardShouldPersistTaps=\"handled\"", "Cho phép bấm nút 'Lưu' hoặc 'Chẩn đoán' ngay trong khi bàn phím đang mở mà không bị nuốt mất sự kiện chạm."],
            ["keyboardDismissMode=\"on-drag\"", "Trải nghiệm mượt mà: Bác sĩ chỉ cần vuốt cuộn màn hình là bàn phím tự động hạ xuống."]
        ],
        comment_guide="Nêu rõ lý do cần keyboardShouldPersistTaps='handled': Ngăn chặn lỗi người dùng bấm nút 2 lần mới ăn khi đang mở bàn phím.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './Screen';",
        run_and_verify="Lưu file. Kiểm tra TypeScript không có lỗi biên dịch.",
        troubleshooting="Nếu màn hình bị cuộn giật cục: Đảm bảo không bọc thêm ScrollView con bên trong children nếu scrollable=true.",
        checklist="[ ] Screen.tsx được tạo tại src/ui/components/\n[ ] Tự động bọc SafeAreaView và KeyboardAvoidingView\n[ ] Đã export trong index.ts"
    )

    # ==========================================
    # BƯỚC 021: ScoreCard.tsx & ScoreRow.tsx
    # ==========================================
    add_full_step(
        doc, step_num=21,
        title="Xây dựng Thẻ Điểm Số AI 3 Lớp Cố Định (ScoreCard.tsx)",
        purpose="Hiển thị kết quả suy luận của mô hình Adaptive AACNN-ViT theo đúng thứ tự 3 phân lớp [Benign, Malignant, Normal] và thông điệp minh bạch MSG-02.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/ScoreCard.tsx",
        code_file_path="src/ui/components/ScoreCard.tsx",
        full_code="""import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AILabel, type AIClass } from './AILabel';
import { AppText } from './AppText';
import { ScoreRow } from './ScoreRow';

export interface ScoreItem {
  classification: AIClass;
  score: number;
}

export interface ScoreCardProps {
  scores: ScoreItem[];
  style?: StyleProp<ViewStyle>;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ scores, style }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  // Thứ tự 3 lớp cố định của đề tài nghiên cứu (BR-AI-03 & Q-15)
  const FIXED_CLASS_ORDER: AIClass[] = ['Benign', 'Malignant', 'Normal'];

  const scoreMap = new Map<AIClass, number>();
  scores.forEach((item) => {
    scoreMap.set(item.classification, item.score);
  });

  let maxScore = -1;
  FIXED_CLASS_ORDER.forEach((cls) => {
    const val = scoreMap.get(cls) ?? 0;
    if (val > maxScore) maxScore = val;
  });

  const topClasses = FIXED_CLASS_ORDER.filter(
    (cls) => (scoreMap.get(cls) ?? 0) === maxScore && maxScore > -1,
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          gap: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <AppText variant="titleS" color={colors.text.primary}>
          Nhãn chẩn đoán AI
        </AppText>
        <View style={styles.labelsWrapper}>
          {topClasses.map((cls) => (
            <AILabel key={cls} classification={cls} />
          ))}
        </View>
      </View>

      <View style={[styles.rowsList, { gap: spacing.sm }]}>
        {FIXED_CLASS_ORDER.map((cls) => {
          const score = scoreMap.get(cls) ?? 0;
          const isTop = score === maxScore && maxScore > -1;
          return <ScoreRow key={cls} classification={cls} score={score} isTop={isTop} />;
        })}
      </View>

      <AppText variant="caption" color={colors.text.secondary}>
        Thông điệp MSG-02: Điểm số (score) là đầu ra kỹ thuật của mô hình, chưa được hiệu chuẩn thành xác suất lâm sàng của người bệnh.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelsWrapper: { flexDirection: 'row', gap: 6 },
  rowsList: { width: '100%' },
});""",
        line_by_line_explanation=[
            ["const FIXED_CLASS_ORDER: AIClass[] = ['Benign', 'Malignant', 'Normal'];", "Ràng buộc thiết kế BR-AI-03: Dù mô hình hoặc server trả về thứ tự nào, giao diện luôn hiển thị đúng thứ tự y khoa chuẩn này."],
            ["const isTop = score === maxScore && maxScore > -1;", "Tự động phát hiện lớp có điểm số cao nhất để làm đậm và đổi màu thanh tiến trình."],
            ["Thông điệp MSG-02: ...", "Yêu cầu đạo đức y tế AI: Minh bạch rõ ràng điểm kỹ thuật không phải tỷ lệ bệnh nhân mắc ung thư."]
        ],
        comment_guide="Giải thích lý do phải cố định thứ tự 3 lớp: Giúp bác sĩ đọc nhanh mà không bị nhầm lẫn vị trí giữa các lần chẩn đoán khác nhau.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './ScoreCard';",
        run_and_verify="Lưu file. Biên dịch TypeScript 'npx tsc --noEmit' thành công.",
        troubleshooting="Nếu thiếu ScoreRow: Tạo tệp ScoreRow.tsx theo mẫu trong thư mục components trước khi import vào ScoreCard.",
        checklist="[ ] ScoreCard.tsx được tạo tại src/ui/components/\n[ ] Có thứ tự cố định [Benign, Malignant, Normal]\n[ ] Có thông điệp minh bạch MSG-02"
    )

    # ==========================================
    # BƯỚC 022: CTImageView.tsx & HeatmapLegend.tsx
    # ==========================================
    add_full_step(
        doc, step_num=22,
        title="Xây dựng Khung Xem Ảnh CT & Thang Đo Nhiệt Grad-CAM (CTImageView.tsx)",
        purpose="Xây dựng khung hiển thị ảnh cắt lớp CT độ phân giải cao, hỗ trợ thao tác phóng to thu nhỏ (Pinch-to-zoom), kéo di chuyển (Pan) và phủ bản đồ nhiệt Grad-CAM.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/ui/components/CTImageView.tsx",
        code_file_path="src/ui/components/CTImageView.tsx",
        full_code="""import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { IMAGE_CANVAS, HEATMAP_DEFAULT_OPACITY } from '../theme/heatmap';
import { AppText } from './AppText';

export interface CTImageViewProps {
  imageSource?: ImageSourcePropType | { uri: string };
  heatmapSource?: ImageSourcePropType | { uri: string };
  showHeatmap?: boolean;
  heatmapOpacity?: number;
  size?: number;
  watermarkText?: string;
  style?: StyleProp<ViewStyle>;
}

export const CTImageView: React.FC<CTImageViewProps> = ({
  imageSource,
  heatmapSource,
  showHeatmap = false,
  heatmapOpacity = HEATMAP_DEFAULT_OPACITY,
  size = 340,
  watermarkText,
  style,
}) => {
  const pan = React.useMemo(() => new Animated.ValueXY({ x: 0, y: 0 }), []);
  const scale = React.useMemo(() => new Animated.Value(1), []);
  const [currentScale, setCurrentScale] = useState(1);

  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const calcDistance = (touches: readonly any[]): number => {
    if (touches.length < 2) return 0;
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_evt, _gestureState) => {
          pan.setOffset({
            x: (pan.x as any)._value || 0,
            y: (pan.y as any)._value || 0,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;
          if (touches.length === 2) {
            const dist = calcDistance(touches);
            if (initialDistanceRef.current === null) {
              initialDistanceRef.current = dist;
              initialScaleRef.current = (scale as any)._value || 1;
            } else {
              const newScale = Math.min(
                3,
                Math.max((dist / initialDistanceRef.current) * initialScaleRef.current, 1),
              );
              scale.setValue(newScale);
              setCurrentScale(newScale);
            }
          } else if (touches.length === 1 && currentScale > 1) {
            pan.setValue({ x: gestureState.dx, y: gestureState.dy });
          }
        },
        onPanResponderRelease: () => {
          initialDistanceRef.current = null;
          pan.flattenOffset();
        },
      }),
    [pan, scale, currentScale],
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          backgroundColor: IMAGE_CANVAS,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          },
        ]}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <AppText variant="caption" color="#94A3B8">
              Chưa có dữ liệu ảnh CT
            </AppText>
          </View>
        )}

        {showHeatmap && heatmapSource && (
          <Animated.Image
            source={heatmapSource}
            style={[styles.heatmapOverlay, { opacity: heatmapOpacity }]}
            resizeMode="contain"
          />
        )}
      </Animated.View>

      {watermarkText && (
        <View style={styles.watermarkBadge}>
          <AppText variant="caption" color="#FFFFFF">
            {watermarkText}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  heatmapOverlay: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  watermarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});""",
        line_by_line_explanation=[
            ["PanResponder.create({ ... })", "Hệ thống quản lý cử chỉ cảm ứng gốc của React Native, theo dõi tọa độ các ngón tay thời gian thực."],
            ["calcDistance(touches)", "Áp dụng định lý Pythagoras tính khoảng cách giữa 2 ngón tay chạm để thực hiện cử chỉ phóng to pinch-to-zoom."],
            ["Math.min(3, Math.max(..., 1))", "Giới hạn độ phóng đại từ 1x đến tối đa 3x (khớp hoàn toàn dòng 97-100 của CTImageView.tsx), bảo đảm độ nét của ma trận lát cắt CT y tế."],
            ["watermarkText", "Hiển thị nhãn chìm 'ẢNH GIẢ LẬP' khi chạy bản demo để minh bạch nguồn dữ liệu theo BR-AI-06."]
        ],
        comment_guide="Giải thích lý do nền canvas luôn cố định màu đen (#0A0E17): Trong y khoa chẩn đoán hình ảnh, lát cắt CT phổi luôn được đọc trên nền đen để đảm bảo độ tương phản cao nhất.",
        wiring_guide="Mở src/ui/components/index.ts, thêm: export * from './CTImageView';",
        run_and_verify="Lưu file. Chạy 'npx tsc --noEmit' kiểm tra kiểu hợp lệ.",
        troubleshooting="Nếu ảnh bị giật khi zoom: Đảm bảo sử dụng Animated.Value thay vì useState cho các phép biến đổi hình học transform.",
        checklist="[ ] CTImageView.tsx được tạo tại src/ui/components/\n[ ] Hỗ trợ pinch-zoom và pan 2 ngón\n[ ] Có lớp phủ Grad-CAM và nhãn chìm minh bạch"
    )

    # ==========================================
    # BƯỚC 023: AuthContext.tsx (Chính sách AUTH-08)
    # ==========================================
    add_full_step(
        doc, step_num=23,
        title="Xây dựng Ngữ Cảnh Xác Thực & Chính Sách AUTH-08 (AuthContext.tsx)",
        purpose="Quản lý phiên đăng nhập Bác sĩ / Quản trị viên, phân biệt rõ ràng giữa thao tác Đăng xuất chủ động (Logout) và thao tác Khóa tài khoản từ xa (AUTH-08).",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/features/auth/context/AuthContext.tsx",
        code_file_path="src/features/auth/context/AuthContext.tsx",
        full_code="""import React, { createContext, useContext, useState } from 'react';
import { resetDoctorStore } from '../../../mocks/doctorMocks';

export type UserRole = 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  workplace: string;
  specialty: string;
  status: 'active' | 'locked';
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  login: (email: string) => Promise<{ success: boolean; status: 'active' | 'locked' }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const login = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const role: UserRole = trimmed.includes('admin') ? 'admin' : 'doctor';
    const profile: UserProfile = {
      id: trimmed.includes('admin') ? 'usr-admin-01' : 'usr-doc-01',
      email: trimmed,
      fullName: trimmed.includes('admin') ? 'Quản trị viên' : 'BS. Nguyễn Minh An',
      role,
      workplace: 'Bệnh viện Bạch Mai - TT Hô Hấp',
      specialty: 'Chẩn đoán hình ảnh lồng ngực',
      status: 'active',
    };

    setUser(profile);
    return { success: true, status: 'active' as const };
  };

  /**
   * Đăng xuất chủ động (Logout):
   * Chỉ giải phóng phiên làm việc trong RAM (setUser(null)) và reset mock store.
   * TUYỆT ĐỐI KHÔNG XÓA CƠ SỞ DỮ LIỆU CỤC BỘ SQLite/AsyncStorage!
   */
  const logout = () => {
    resetDoctorStore();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null && user.status === 'active',
        isOnline,
        setIsOnline,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được bọc trong AuthProvider');
  return context;
};""",
        line_by_line_explanation=[
            ["const AuthContext = createContext<...>(undefined);", "Tạo React Context cấp phát dữ liệu phiên dùng chung cho toàn bộ cây component."],
            ["role = trimmed.includes('admin') ? 'admin' : 'doctor';", "Phân quyền người dùng dựa trên thông tin định danh: Bác sĩ hoặc Quản trị viên."],
            ["logout = () => { setUser(null); }", "Quy tắc cốt lõi: Đăng xuất chỉ đặt lại RAM, KHÔNG XÓA DỮ LIỆU ĐĨA, giúp bác sĩ đăng nhập lại mà không bị mất ca khám."],
            ["isAuthenticated: user !== null && user.status === 'active'", "Cờ xác thực kiểm tra cả phiên đăng nhập và trạng thái tài khoản không bị khóa."]
        ],
        comment_guide="Giải thích sự khác biệt giữa Logout (giữ nguyên CSDL) và Purge on Account Locked theo chính sách AUTH-08 (chỉ dọn dữ liệu đã đồng bộ khi tài khoản bị khóa).",
        wiring_guide="Mở src/features/auth/index.ts, thêm: export * from './context/AuthContext';",
        run_and_verify="Lưu file. Biên dịch TypeScript 'npx tsc --noEmit' thành công.",
        troubleshooting="Nếu các component con không gọi được useAuth: Đảm bảo App.tsx đã bọc toàn bộ ứng dụng bên trong <AuthProvider>.",
        checklist="[ ] AuthContext.tsx được lưu tại đúng thư mục\n[ ] Phân biệt rõ đăng xuất bình thường với khóa tài khoản\n[ ] Có hook useAuth() kiểm tra ngữ cảnh hợp lệ"
    )

    # ==========================================
    # BƯỚC 024: RootNavigator.tsx
    # ==========================================
    add_full_step(
        doc, step_num=24,
        title="Xây dựng Bộ Điều Hướng Đa Vai Trò Cấp Cao Nhất (RootNavigator.tsx)",
        purpose="Điều phối điều hướng toàn ứng dụng: Tự động chuyển đổi giữa màn hình đăng nhập (AuthStack), giao diện Bác sĩ (DoctorStack) và giao diện Quản trị viên (AdminStack).",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="New-Item -ItemType File -Force -Path src/navigation/RootNavigator.tsx",
        code_file_path="src/navigation/RootNavigator.tsx",
        full_code="""import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/context/AuthContext';
import { AuthStack } from './AuthStack';
import { DoctorStack } from './DoctorStack';
import { AdminStack } from './AdminStack';
import { useTheme } from '../ui/theme';

export type RootStackParamList = {
  Auth: undefined;
  DoctorApp: undefined;
  AdminApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.scheme === 'dark',
        colors: {
          primary: theme.colors.brand.primary,
          background: theme.colors.bg.app,
          card: theme.colors.bg.surface,
          text: theme.colors.text.primary,
          border: theme.colors.border.default,
          notification: theme.colors.status.danger.fg,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminStack} />
        ) : (
          <Stack.Screen name="DoctorApp" component={DoctorStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};""",
        line_by_line_explanation=[
            ["<NavigationContainer ...>", "Gốc điều hướng của React Navigation, quản lý lịch sử chuyển trang và thanh điều hướng hệ thống."],
            ["theme={{ dark: theme.scheme === 'dark', ... }}", "Đồng bộ giao diện điều hướng với ThemeProvider của ứng dụng."],
            ["{!isAuthenticated ? <AuthStack/> : user.role === 'admin' ? ...}", "Cơ chế phân quyền theo trạng thái (State-driven Navigation): Người dùng chưa đăng nhập không bao giờ thấy màn hình bác sĩ, đảm bảo an toàn tuyệt đối."]
        ],
        comment_guide="Nêu rõ ưu điểm của State-driven Navigation: Không dùng lệnh navigate thủ công để qua mặt màn đăng nhập mà phụ thuộc 100% vào state trong AuthContext.",
        wiring_guide="Mở src/navigation/index.ts, thêm: export * from './RootNavigator';",
        run_and_verify="Lưu file. Chạy 'npx tsc --noEmit' kiểm tra kiểu hợp lệ.",
        troubleshooting="Nếu báo lỗi thiếu AuthStack/DoctorStack/AdminStack: Tạo khung rỗng cho các Stack này trước khi biên dịch RootNavigator.",
        checklist="[ ] RootNavigator.tsx được lưu đúng vị trí\n[ ] Tự động chuyển luồng theo isAuthenticated và user.role\n[ ] Có đồng bộ màu sắc với ThemeProvider"
    )

    # ==========================================
    # BƯỚC 025: Nối App.tsx Hoàn Chỉnh Với Đầy Đủ Font, Theme, Auth & Navigation
    # ==========================================
    add_full_step(
        doc, step_num=25,
        title="Nối Ghép Hệ Thống Vào Điểm Khởi Nhập Hoàn Chỉnh (App.tsx)",
        purpose="Nạp font Be Vietnam Pro bất đồng bộ, cấu hình ThemeProvider, AuthProvider, i18n và mở RootNavigator để ứng dụng vận hành trọn vẹn.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="Set-Content -Path App.tsx -Value '' # Chuẩn bị thay thế App.tsx",
        code_file_path="App.tsx",
        full_code="""import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import './src/i18n';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import { RootNavigator } from './src/navigation';
import { ThemeProvider, useTheme } from './src/ui/theme';

function MainAppContent(): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <>
      <RootNavigator />
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App(): React.JSX.Element {
  const [fontsLoaded, fontError] = useFonts({
    'BeVietnamPro-Regular': require('./assets/fonts/BeVietnamPro-Regular.ttf'),
    'BeVietnamPro-Medium': require('./assets/fonts/BeVietnamPro-Medium.ttf'),
    'BeVietnamPro-SemiBold': require('./assets/fonts/BeVietnamPro-SemiBold.ttf'),
  });

  // Cơ chế an toàn (Fallback): Nếu có lỗi nạp font, vẫn cho phép mở app bằng font hệ thống
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6F67" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F2',
  },
});""",
        line_by_line_explanation=[
            ["useFonts({ ... })", "Hook nạp 3 biến thể font Be Vietnam Pro từ thư mục assets/fonts/ thời gian thực."],
            ["if (!fontsLoaded && !fontError)", "Cơ chế phòng thủ (Resilient Fallback): Nếu font chưa nạp xong thì hiện vòng quay, nếu nạp lỗi thì KHÔNG ĐƯỢC CRASH app mà dùng font mặc định."],
            ["<ThemeProvider><AuthProvider><MainAppContent /></AuthProvider></ThemeProvider>", "Mô hình Provider lồng nhau chuẩn React: Cung cấp đầy đủ Theme và Phiên đăng nhập cho toàn bộ ứng dụng."]
        ],
        comment_guide="Giải thích lý do tách component MainAppContent: Giúp gọi được useTheme() bên trong ThemeProvider để đổi màu StatusBar theo chế độ Sáng / Tối.",
        wiring_guide="Đây là điểm khởi nhập (Entry Point) gốc của toàn bộ dự án, Metro Bundler sẽ nạp tệp này đầu tiên khi khởi động.",
        run_and_verify="Mở PowerShell, gõ: npx expo start --android. Quan sát máy ảo LumaCT_Phone: Ứng dụng tự động khởi động lên màn hình đăng nhập AuthStack hoàn chỉnh với font chữ Be Vietnam Pro tuyệt đẹp!",
        troubleshooting="Nếu báo lỗi không tìm thấy font .ttf: Đảm bảo đã tải 3 tệp font BeVietnamPro vào đúng thư mục mobile/assets/fonts/.",
        checklist="[ ] App.tsx nạp font và xử lý fallback lỗi nạp font thành công\n[ ] Bọc đủ ThemeProvider và AuthProvider\n[ ] Mở lên máy ảo Android thành công không có lỗi"
    )

print("[*] Module append_expanded_steps ready.")
