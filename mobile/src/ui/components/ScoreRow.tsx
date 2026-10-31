import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SCORE_FORMAT_DECISION } from '../../config/ui-decisions';
import { useTheme } from '../theme';
import { type AIClass } from './AILabel';
import { AppText } from './AppText';

export interface ScoreRowProps {
  /** Nhãn phân loại: Lành tính (Benign), Ác tính (Malignant), Bình thường (Normal) */
  classification: AIClass;
  /** Điểm số mô hình (0.0 đến 1.0) */
  score: number;
  /** Cờ đánh dấu đây là lớp có điểm số cao nhất (nhấn mạnh) */
  isTop?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hàng hiển thị điểm số phân loại của từng lớp AI (ScoreRow).
 * - Sử dụng thuật ngữ y tế: "Điểm" (score), không dùng "Xác suất" (probability) (BR-AI-05).
 * - Định dạng 3 chữ số thập phân với dấu phẩy theo đề xuất Q-15 (ví dụ: "0,712").
 * - Hỗ trợ đa ngôn ngữ Việt - Anh theo i18n.
 */
export const ScoreRow: React.FC<ScoreRowProps> = ({
  classification,
  score,
  isTop = false,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { t } = useTranslation();

  // Lấy tên nhãn hiển thị đa ngôn ngữ
  const getLabel = (cls: AIClass) => {
    switch (cls) {
      case 'Benign':
        return t('label.lanh_tinh', 'Lành tính');
      case 'Malignant':
        return t('label.ac_tinh', 'Ác tính');
      case 'Normal':
        return t('label.binh_thuong', 'Bình thường');
    }
  };

  // Xác định màu sắc thanh bar và nhãn theo lớp
  let barColor: string = colors.ai.benign.fg;
  if (classification === 'Malignant') {
    barColor = colors.ai.malignant.fg;
  } else if (classification === 'Normal') {
    barColor = colors.ai.normal.fg;
  }

  // Định dạng số điểm 3 chữ số thập phân (ví dụ: 0.7123 -> "0,712")
  const formattedScore = SCORE_FORMAT_DECISION.format(score);
  const percentage = Math.max(0, Math.min(100, score * 100));

  return (
    <View style={[styles.container, { gap: spacing.xxs }, style]}>
      <View style={styles.headerRow}>
        <AppText
          variant={isTop ? 'labelM' : 'bodyM'}
          color={isTop ? colors.text.primary : colors.text.secondary}
        >
          {getLabel(classification)}
        </AppText>

        <AppText variant="labelM" color={isTop ? barColor : colors.text.secondary}>
          {formattedScore}
        </AppText>
      </View>

      {/* Thanh thanh tiến trình điểm số */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.bg.sunken,
            borderRadius: radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
              borderRadius: radius.full,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
