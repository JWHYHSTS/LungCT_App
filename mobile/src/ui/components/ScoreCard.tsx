import React from 'react';
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
  /** Danh sách điểm số (có thể đưa vào bất kỳ thứ tự nào) */
  scores: ScoreItem[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Thẻ hiển thị điểm số mô hình AI (ScoreCard).
 * RÀNG BUỘC BẮT BUỘC (UI-04 & BR-AI-03 & BR-AI-05):
 * 1. Luôn hiển thị đúng 3 dòng theo thứ tự cố định: [Benign (Lành tính), Malignant (Ác tính), Normal (Bình thường)].
 * 2. Tự động xác định và nhấn mạnh lớp có điểm số cao nhất (isTop = true).
 * 3. Luôn luôn kèm thông điệp chuẩn MSG-02:
 *    "Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh."
 */
export const ScoreCard: React.FC<ScoreCardProps> = ({ scores, style }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  // Thứ tự 3 lớp cố định của nghiên cứu Adaptive AACNN-ViT (BR-AI-03)
  const FIXED_CLASS_ORDER: AIClass[] = ['Benign', 'Malignant', 'Normal'];

  // Tạo map tra cứu điểm số để sắp xếp đúng chuẩn dù đầu vào sai thứ tự
  const scoreMap = new Map<AIClass, number>();
  scores.forEach((item) => {
    scoreMap.set(item.classification, item.score);
  });

  // Tìm điểm số cao nhất trong các lớp
  let maxScore = -1;
  FIXED_CLASS_ORDER.forEach((cls) => {
    const val = scoreMap.get(cls) ?? 0;
    if (val > maxScore) {
      maxScore = val;
    }
  });

  // Xác định tất cả các lớp cùng đạt điểm số cao nhất (hỗ trợ trường hợp đồng điểm)
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
      {/* Tiêu đề thẻ & Nhãn AI của các lớp đạt điểm cao nhất (nhấn mạnh tất cả lớp cùng cao nhất) */}
      <View style={styles.header}>
        <AppText variant="titleS" color={colors.text.primary}>
          Nhãn AI
        </AppText>
        <View style={styles.labelsWrapper}>
          {topClasses.map((cls) => (
            <AILabel key={cls} classification={cls} />
          ))}
        </View>
      </View>

      {/* 3 dòng điểm số theo thứ tự cố định [Benign, Malignant, Normal] */}
      <View style={[styles.rowsList, { gap: spacing.sm }]}>
        {FIXED_CLASS_ORDER.map((cls) => {
          const score = scoreMap.get(cls) ?? 0;
          const isTop = score === maxScore && maxScore > -1;
          return <ScoreRow key={cls} classification={cls} score={score} isTop={isTop} />;
        })}
      </View>

      {/* Thông điệp y tế bắt buộc MSG-02 */}
      <AppText variant="caption" color={colors.text.secondary}>
        Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelsWrapper: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  rowsList: {
    width: '100%',
  },
});
