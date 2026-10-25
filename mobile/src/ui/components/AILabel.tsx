import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

export type AIClass = 'Benign' | 'Malignant' | 'Normal';

export interface AILabelProps {
  /** Lớp phân loại: Benign (Lành tính), Malignant (Ác tính), Normal (Bình thường) */
  classification: AIClass;
  /** Nhãn chữ ghi đè (nếu không truyền sẽ tự lấy theo từ điển i18n) */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Nhãn phân loại kết quả AI 3 lớp chuẩn hóa của LungCT.
 * - Tuân thủ BR-UI-01: Luôn có chữ rõ ràng (Lành tính / Ác tính / Bình thường).
 * - Sử dụng màu nền và màu chữ từ token `colors.ai.*`.
 */
export const AILabel: React.FC<AILabelProps> = ({ classification, label, style }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const { t } = useTranslation();

  const getStyleProps = () => {
    switch (classification) {
      case 'Benign':
        return {
          bg: colors.ai.benign.bg,
          fg: colors.ai.benign.fg,
          textKey: 'common.benign',
          defaultText: 'Lành tính',
        };
      case 'Malignant':
        return {
          bg: colors.ai.malignant.bg,
          fg: colors.ai.malignant.fg,
          textKey: 'common.malignant',
          defaultText: 'Ác tính',
        };
      case 'Normal':
        return {
          bg: colors.ai.normal.bg,
          fg: colors.ai.normal.fg,
          textKey: 'common.normal',
          defaultText: 'Bình thường',
        };
    }
  };

  const { bg, fg, textKey, defaultText } = getStyleProps();
  const displayText = label ?? t(textKey, defaultText);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
    >
      <Text style={[typography.caption, { color: fg, fontWeight: '600' }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
