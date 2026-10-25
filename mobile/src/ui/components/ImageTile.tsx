import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { IMAGE_CANVAS } from '../theme/heatmap';
import { AILabel, type AIClass } from './AILabel';
import { AppText } from './AppText';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge';

export type ImageTileStatus = 'pending' | 'running' | 'pass' | 'passNoCam' | 'fail' | 'mock';

export interface ImageTileProps {
  /** Số thứ tự ảnh (1-indexed) */
  index: number;
  /** Trạng thái phân tích AI của ảnh (6 trạng thái theo BR-AI-04) */
  status: ImageTileStatus;
  /** Nguồn ảnh CT (thumbnail) */
  thumbnail?: ImageSourcePropType | { uri: string };
  /** Kết quả phân loại AI (nếu trạng thái pass hoặc passNoCam) */
  aiClass?: AIClass;
  /** Callback khi nhấn vào ô ảnh */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ô thu nhỏ hiển thị ảnh CT (ImageTile).
 * - BR-AI-04: Tách biệt rõ ràng giữa lỗi phân loại (fail) và thiếu Grad-CAM (passNoCam).
 * - Hiển thị nhãn chữ rõ nghĩa (không chỉ dựa vào màu sắc).
 */
export const ImageTile: React.FC<ImageTileProps> = ({
  index,
  status,
  thumbnail,
  aiClass,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  // Cấu hình nhãn trạng thái và viền theo status
  let badgeLabel = 'Chờ';
  let badgeTone: StatusBadgeTone = 'pending';
  let borderColor = colors.border.default;

  switch (status) {
    case 'pending':
      badgeLabel = 'Chờ';
      badgeTone = 'pending';
      break;
    case 'running':
      badgeLabel = 'Đang chạy';
      badgeTone = 'brand';
      break;
    case 'pass':
      badgeLabel = 'Đạt';
      badgeTone = 'success';
      break;
    case 'passNoCam':
      badgeLabel = 'Thiếu CAM';
      badgeTone = 'warning';
      break;
    case 'fail':
      badgeLabel = 'Lỗi';
      badgeTone = 'danger';
      borderColor = colors.status.danger.fg;
      break;
    case 'mock':
      badgeLabel = 'Giả lập';
      badgeTone = 'neutral';
      break;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ảnh ${index}, trạng thái: ${badgeLabel}${aiClass ? `, phân loại: ${aiClass}` : ''}`}
      style={[
        styles.container,
        {
          backgroundColor: colors.bg.surface,
          borderColor,
          borderRadius: radius.md,
        },
        style,
      ]}
    >
      {/* Vùng ảnh thu nhỏ */}
      <View style={[styles.thumbnailWrapper, { backgroundColor: IMAGE_CANVAS }]}>
        {thumbnail ? (
          <Image source={thumbnail} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <View style={styles.mockInnerLobe} />
          </View>
        )}
      </View>

      {/* Thông tin mô tả bên dưới ảnh */}
      <View style={[styles.infoWrapper, { padding: spacing.xs, gap: spacing.xxs }]}>
        <AppText variant="labelM" color={colors.text.primary}>
          {`Ảnh ${index}`}
        </AppText>

        <View style={styles.badgesCol}>
          <StatusBadge label={badgeLabel} tone={badgeTone} />

          {/* Nếu có kết quả phân loại AI (đặc biệt khi pass hoặc passNoCam) */}
          {aiClass && (
            <View style={{ marginTop: 2 }}>
              <AILabel classification={aiClass} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 104,
    maxWidth: 120,
    flex: 1,
  },
  thumbnailWrapper: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
    backgroundColor: '#1E201D',
    borderWidth: 1,
    borderColor: '#30332D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockInnerLobe: {
    width: 28,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#0A0B09',
  },
  infoWrapper: {
    alignItems: 'flex-start',
  },
  badgesCol: {
    alignItems: 'flex-start',
    gap: 2,
  },
});
