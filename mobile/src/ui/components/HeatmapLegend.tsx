import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { HEATMAP_STOPS } from '../theme/heatmap';
import { AppText } from './AppText';

export interface HeatmapLegendProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Chú giải thang màu bản đồ nhiệt Grad-CAM (HeatmapLegend).
 * - Sử dụng các màu cố định theo pipeline khoa học (thang jet: HEATMAP_STOPS), KHÔNG đổi theo theme.
 * - Hiển thị 3 mốc: "Thấp", "Mức đóng góp tương đối trong ảnh này", "Cao" theo đúng BR-AI-05.
 */
export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ style }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  return (
    <View style={[styles.container, { gap: spacing.xxs }, style]}>
      {/* Dải gradient mô phỏng thang màu jet gồm 5 stops */}
      <View
        style={[
          styles.bar,
          {
            borderRadius: radius.full,
          },
        ]}
      >
        {HEATMAP_STOPS.map((stop, index) => (
          <View
            key={index}
            style={[
              styles.stopBlock,
              {
                backgroundColor: stop.color,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.labelsRow}>
        <AppText variant="caption" color={colors.text.secondary}>
          Thấp
        </AppText>
        <AppText variant="caption" color={colors.text.secondary} style={styles.centerLabel}>
          Mức đóng góp tương đối trong ảnh này
        </AppText>
        <AppText variant="caption" color={colors.text.secondary}>
          Cao
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bar: {
    height: 10,
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stopBlock: {
    flex: 1,
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerLabel: {
    textAlign: 'center',
    flexShrink: 1,
    paddingHorizontal: 4,
  },
});
