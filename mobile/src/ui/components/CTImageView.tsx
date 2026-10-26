import React, { useRef, useState } from 'react';
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
import {
  IMAGE_CANVAS,
  HEATMAP_DEFAULT_OPACITY,
  MOCK_CT_PLACEHOLDER_BG,
  MOCK_CT_PLACEHOLDER_BORDER,
  MOCK_CT_LOBE_BG,
  MOCK_CT_SPINE_BG,
  MOCK_CT_HEATMAP_SPOT_BG,
  MOCK_CT_HEATMAP_SPOT_GLOW,
  MOCK_CT_TEXT_LIGHT,
} from '../theme/heatmap';
import { AppText } from './AppText';

export interface CTImageViewProps {
  /** Nguồn ảnh CT gốc (hoặc ảnh minh họa giả lập) */
  imageSource?: ImageSourcePropType | { uri: string };
  /** Nguồn ảnh lớp phủ Grad-CAM (nếu có) */
  heatmapSource?: ImageSourcePropType | { uri: string };
  /** Bật/tắt lớp phủ Grad-CAM */
  showHeatmap?: boolean;
  /** Độ phủ lớp Grad-CAM từ 0 đến 1, mặc định 0.4 (HEATMAP_DEFAULT_OPACITY) */
  heatmapOpacity?: number;
  /** Kích thước vuông hiển thị (mặc định 340dp) */
  size?: number;
  /** Nhãn cảnh báo/thông tin (ví dụ: "ẢNH GIẢ LẬP") */
  watermarkText?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Khung xem ảnh cắt lớp CT y tế (CTImageView).
 * - Nền cố định màu IMAGE_CANVAS bất kể chế độ sáng/tối.
 * - Hỗ trợ zoom (pinch) và pan (kéo) trực tiếp qua PanResponder tích hợp mượt mà.
 * - Tích hợp lớp phủ Grad-CAM với độ phủ tùy chỉnh.
 * - Bắt buộc hiển thị nhãn "ẢNH GIẢ LẬP" khi ở môi trường kiểm thử/demo (BR-AI-06).
 */
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
  const scaleValRef = useRef<number>(1);

  // Tính khoảng cách giữa 2 ngón tay khi pinch zoom
  const calcDistance = (touches: readonly any[]): number => {
    if (touches.length < 2) return 0;
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = React.useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- React Compiler nhận nhầm việc truyền callback closure của PanResponder là đọc ref khi render (cảnh báo giả)
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_evt, _gestureState) => {
          pan.setOffset({
            x: (pan.x as any)._value || 0,
            y: (pan.y as any)._value || 0,
          });
          pan.setValue({ x: 0, y: 0 });
          initialDistanceRef.current = null;
          initialScaleRef.current = scaleValRef.current;
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;
          if (touches.length === 2) {
            // Xử lý cử chỉ 2 ngón tay Pinch-to-Zoom
            const dist = calcDistance(touches);
            if (initialDistanceRef.current === null) {
              initialDistanceRef.current = dist;
            } else if (initialDistanceRef.current > 0) {
              const newScale = Math.max(
                1,
                Math.min(3, (dist / initialDistanceRef.current) * initialScaleRef.current),
              );
              scale.setValue(newScale);
              scaleValRef.current = newScale;
              setCurrentScale(newScale);
            }
          } else if (touches.length === 1 && scaleValRef.current > 1) {
            // Chỉ cho phép kéo (pan) khi ảnh đang được phóng to
            pan.setValue({ x: gestureState.dx, y: gestureState.dy });
          }
        },
        onPanResponderRelease: () => {
          pan.flattenOffset();
        },
      }),
    [pan, scale],
  );

  const handleDoubleTapReset = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
    ]).start(() => {
      setCurrentScale(1);
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: IMAGE_CANVAS,
        },
        style,
      ]}
      {...panResponder.panHandlers}
      onTouchEnd={(e) => {
        // Hỗ trợ reset zoom khi chạm nhanh
        if (e.nativeEvent.touches.length === 0 && currentScale > 1.5) {
          handleDoubleTapReset();
        }
      }}
    >
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          },
        ]}
      >
        {/* Ảnh CT gốc */}
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.mockLungLobe} />
            <View style={styles.mockSpine} />
          </View>
        )}

        {/* Lớp phủ bản đồ Grad-CAM */}
        {showHeatmap && (
          <View
            style={[styles.heatmapOverlay, { opacity: Math.max(0, Math.min(1, heatmapOpacity)) }]}
          >
            {heatmapSource ? (
              <Image source={heatmapSource} style={styles.image} resizeMode="contain" />
            ) : (
              // Mô phỏng vùng sáng nhiệt Jet nếu không có file ảnh ngoài
              <View style={styles.mockHeatmapSpot} />
            )}
          </View>
        )}
      </Animated.View>

      {/* Dấu watermark y tế bắt buộc */}
      {watermarkText && (
        <View style={styles.watermarkBadge}>
          <AppText variant="labelS" color={MOCK_CT_TEXT_LIGHT}>
            {watermarkText}
          </AppText>
        </View>
      )}

      {/* Ghi chú điều khiển zoom/pan */}
      {currentScale > 1 && (
        <View style={styles.zoomBadge}>
          <AppText variant="caption" color={MOCK_CT_TEXT_LIGHT}>
            {`Zoom: ${currentScale.toFixed(1)}x (Chạm đúp để đặt lại)`}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '80%',
    height: '80%',
    borderRadius: 120,
    backgroundColor: MOCK_CT_PLACEHOLDER_BG,
    borderWidth: 1,
    borderColor: MOCK_CT_PLACEHOLDER_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockLungLobe: {
    width: 140,
    height: 180,
    borderRadius: 70,
    backgroundColor: MOCK_CT_LOBE_BG,
    opacity: 0.7,
  },
  mockSpine: {
    position: 'absolute',
    bottom: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MOCK_CT_SPINE_BG,
  },
  heatmapOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockHeatmapSpot: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: MOCK_CT_HEATMAP_SPOT_BG,
    shadowColor: MOCK_CT_HEATMAP_SPOT_GLOW,
    shadowRadius: 30,
    shadowOpacity: 0.9,
    elevation: 10,
    top: -20,
    right: -30,
  },
  watermarkBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});
