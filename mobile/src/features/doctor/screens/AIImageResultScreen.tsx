import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AILabel,
  AppText,
  Banner,
  CTImageView,
  Dialog,
  Divider,
  EmptyState,
  HeatmapLegend,
  IconButton,
  ScoreCard,
  Segmented,
  Slider,
  TopBar,
} from '../../../ui/components';
import { findCaseById, type MockCase, type MockCTImage } from '../../../mocks';

export interface AIImageResultScreenProps {
  caseId: string;
  initialImageIndex?: number;
  onBack: () => void;
}

/**
 * SCR-R01 (16-ai-image-result): Màn hình Kết quả ảnh AI và Bản đồ nhiệt Grad-CAM.
 * - Điều khiển chuyển lát cắt trước/sau: "Ảnh X/Y · Nguồn".
 * - CTImageView: Khung xem ảnh lát cắt CT y tế kèm lớp nhiệt Grad-CAM, hỗ trợ pinch-zoom / pan.
 * - HeatmapLegend: Chú giải thang màu nhiệt jet gồm 5 mốc theo BR-AI-05.
 * - Segmented: Chuyển đổi giữa [Ảnh gốc] và [Grad-CAM].
 * - Slider: Điều chỉnh độ phủ Grad-CAM (0-100%, bước 5%, mặc định 40%).
 * - ScoreCard: 3 dòng phân loại chuẩn [Benign, Malignant, Normal] theo Q-15.
 * - Trạng thái đặc biệt:
 *   + FAIL (MSG-10): Không hiển thị ScoreCard và Grad-CAM; hiển thị Banner thông báo lỗi hội tụ.
 *   + passNoCam (MSG-11): Vẫn hiển thị ScoreCard nhưng lớp Grad-CAM báo thiếu và hiển thị thông điệp giải thích.
 *   + mock: Có Watermark "ẢNH GIẢ LẬP" và Banner minh bạch chế độ mô phỏng.
 */
export const AIImageResultScreen: React.FC<AIImageResultScreenProps> = ({
  caseId,
  initialImageIndex = 1,
  onBack,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const currentCase: MockCase | undefined = useMemo(() => findCaseById(caseId), [caseId]);
  const images = currentCase?.images ?? [];

  const [currentIndex, setCurrentIndex] = useState<number>(initialImageIndex);
  const [viewMode, setViewMode] = useState<string>('cam'); // 'orig' | 'cam'
  const [camOpacity, setCamOpacity] = useState<number>(40);

  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({ visible: false, title: '', body: '' });

  // Xử lý khi không tìm thấy ca bệnh hoặc ca không có ảnh
  if (!currentCase || images.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar
          title={t('doctor_detail.ai_result_title', 'Kết quả ảnh')}
          type="stack"
          onBackPress={onBack}
        />
        <View style={[styles.centerBox, { padding: spacing.lg }]}>
          <EmptyState
            title={t('doctor_detail.ai_result_empty_title', 'Không có dữ liệu ảnh')}
            body={t(
              'doctor_detail.ai_result_empty_body',
              'Ca bệnh này chưa có ảnh CT hoặc chỉ số ảnh không tồn tại.',
            )}
            type="noData"
            actionLabel={t('doctor_detail.ai_result_back', 'Quay lại chi tiết ca')}
            onActionPress={onBack}
          />
        </View>
      </View>
    );
  }

  // Lấy ảnh đang chọn (đảm bảo index nằm trong giới hạn)
  const activeIndex = Math.max(1, Math.min(images.length, currentIndex));
  const activeImage: MockCTImage = images[activeIndex - 1] || images[0];

  const handlePrev = () => {
    if (activeIndex > 1) setCurrentIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < images.length) setCurrentIndex(activeIndex + 1);
  };

  const isFail = activeImage.status === 'fail';
  const isNoCam = activeImage.status === 'passNoCam';
  const showHeatmapLayer = viewMode === 'cam' && activeImage.hasGradCam && !isFail;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('doctor_detail.ai_result_title', 'Kết quả ảnh')}
        type="stack"
        onBackPress={onBack}
        rightActions={
          <IconButton
            name="share"
            accessibilityLabel={t('doctor_detail.ai_share_notice_title', 'Chia sẻ ảnh')}
            onPress={() =>
              setNoticeDialog({
                visible: true,
                title: t('doctor_detail.ai_share_notice_title', 'Chia sẻ kết quả ảnh'),
                body: t(
                  'doctor_detail.ai_share_notice_body',
                  'Chức năng trích xuất và chia sẻ riêng từng ảnh lát cắt sẽ hoàn thiện ở gói PDF-01.',
                ),
              })
            }
          />
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thanh chuyển ảnh trước/sau */}
        <View style={styles.navBarRow}>
          <IconButton
            name="back"
            disabled={activeIndex <= 1}
            accessibilityLabel={t('doctor_detail.ai_prev_image', 'Ảnh trước')}
            onPress={handlePrev}
          />
          <View style={{ alignItems: 'center' }}>
            <AppText variant="titleS">
              {t('doctor_detail.ai_slice_info', {
                current: activeIndex,
                total: images.length,
                slice: activeImage.sliceNumber,
                defaultValue: `Ảnh ${activeIndex}/${images.length} · Lát cắt #${activeImage.sliceNumber}`,
              })}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {activeImage.source === 'gallery'
                ? t('doctor_detail.ai_source_gallery', 'Nguồn: Thư viện ảnh')
                : t('doctor_detail.ai_source_camera', 'Nguồn: Máy ảnh')}
            </AppText>
          </View>
          <IconButton
            name="chevron-right"
            disabled={activeIndex >= images.length}
            accessibilityLabel={t('doctor_detail.ai_next_image', 'Ảnh kế tiếp')}
            onPress={handleNext}
          />
        </View>

        {/* Khung hiển thị ảnh cắt lớp CT */}
        <View style={styles.canvasWrapper}>
          <CTImageView
            key={activeImage.id}
            showHeatmap={showHeatmapLayer}
            heatmapOpacity={camOpacity / 100}
            size={340}
            watermarkText={activeImage.mockWatermark || 'ẢNH GIẢ LẬP'}
          />
        </View>

        {/* Cảnh báo trạng thái FAIL hoặc Thiếu CAM */}
        {isFail ? (
          <Banner
            type="error"
            title={t('doctor_detail.ai_banner_fail_title', 'Không thể phân tích ảnh này (MSG-10)')}
            body={
              activeImage.failReason ||
              t(
                'doctor_detail.ai_banner_fail_body',
                'Không thể phân tích ảnh này. Vui lòng thử lại hoặc kiểm tra thông báo lỗi.',
              )
            }
            style={{ marginVertical: spacing.sm }}
          />
        ) : isNoCam ? (
          <Banner
            type="warning"
            title={t('doctor_detail.ai_banner_nocam_title', 'Không thể tạo Grad-CAM (MSG-11)')}
            body={t(
              'doctor_detail.ai_banner_nocam_body',
              'Phân loại AI thành công nhưng nhánh giải thích Grad-CAM không thể trích xuất bản đồ nhiệt từ lát cắt này.',
            )}
            style={{ marginVertical: spacing.sm }}
          />
        ) : (
          <Banner
            type="info"
            title={t('doctor_detail.ai_banner_simulated_title', 'Chế độ mô phỏng On-device')}
            body={t(
              'doctor_detail.ai_banner_simulated_body',
              'Kết quả hiển thị trên thiết bị nhằm mục đích nghiên cứu và tham khảo chuyên môn, không thay thế chẩn đoán xác định của bác sĩ.',
            )}
            style={{ marginVertical: spacing.sm }}
          />
        )}

        {/* Chú giải dải màu HeatmapLegend */}
        {showHeatmapLayer && (
          <View style={{ marginVertical: spacing.xs }}>
            <HeatmapLegend />
          </View>
        )}

        {/* Chuyển đổi Ảnh gốc ↔ Grad-CAM */}
        {!isFail && (
          <View style={{ marginVertical: spacing.xs }}>
            <Segmented
              items={[
                { key: 'orig', label: t('doctor_detail.ai_tab_orig', 'Ảnh gốc') },
                { key: 'cam', label: t('doctor_detail.ai_tab_cam', 'Grad-CAM') },
              ]}
              selectedKey={viewMode}
              onSelect={setViewMode}
            />
          </View>
        )}

        {/* Slider điều chỉnh độ phủ Grad-CAM */}
        {viewMode === 'cam' && !isFail && activeImage.hasGradCam && (
          <View
            style={[
              styles.sliderCard,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.md,
                marginVertical: spacing.xs,
              },
            ]}
          >
            <View style={styles.sliderHeader}>
              <AppText variant="labelM">
                {t('doctor_detail.ai_opacity_label', 'Độ phủ Grad-CAM')}
              </AppText>
              <AppText variant="labelM" style={{ color: colors.text.link }}>
                {camOpacity}%
              </AppText>
            </View>
            <Slider
              value={camOpacity}
              onValueChange={setCamOpacity}
              min={0}
              max={100}
              step={5}
              accessibilityLabel={t('doctor_detail.ai_opacity_label', 'Độ phủ Grad-CAM')}
            />
          </View>
        )}

        {/* Bảng điểm phân loại 3 lớp AI (Chỉ hiện khi KHÔNG fail theo quy tắc) */}
        {!isFail && activeImage.scores ? (
          <View style={{ marginVertical: spacing.sm }}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.xs }]}>
              <AppText variant="titleS">
                {t('doctor_detail.ai_section_scores', 'Nhãn phân loại AI')}
              </AppText>
              {activeImage.aiClass && <AILabel classification={activeImage.aiClass} />}
            </View>
            <ScoreCard
              scores={[
                { classification: 'Benign', score: activeImage.scores.benign },
                { classification: 'Malignant', score: activeImage.scores.malignant },
                { classification: 'Normal', score: activeImage.scores.normal },
              ]}
            />
          </View>
        ) : null}

        {/* Thông tin kỹ thuật mô hình (BR-AI-01 / BR-AI-04) */}
        <View
          style={[
            styles.modelInfoCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <AppText variant="titleS" style={{ marginBottom: spacing.xs }}>
            {t('doctor_detail.thong_tin_phan_tich', 'Thông tin phân tích')}
          </AppText>
          <Divider style={{ marginBottom: spacing.xs }} />

          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.mo_hinh', 'Mô hình')}
            </AppText>
            <AppText variant="bodyM">Adaptive AACNN–ViT</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.nguon_thuc_thi', 'Nguồn thực thi')}
            </AppText>
            <AppText variant="bodyM">
              {t('doctor_detail.on_device', 'Trên thiết bị (On-Device)')}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.trang_thai_grad_cam', 'Trạng thái Grad-CAM')}
            </AppText>
            <AppText variant="bodyM">
              {activeImage.hasGradCam
                ? t('doctor_detail.at', 'Đạt')
                : t('doctor_detail.khong_kha_dung', 'Không khả dụng')}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.thoi_iem', 'Thời điểm')}
            </AppText>
            <AppText variant="bodyM">{currentCase.captureDate} 10:41</AppText>
          </View>
        </View>

        {/* Khung cảnh báo pháp lý y tế MSG-01 / MSG-03 */}
        <View
          style={[
            styles.legalBox,
            {
              backgroundColor: colors.bg.brandSubtle,
              borderColor: colors.border.focus,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <AppText variant="labelM" style={{ color: colors.text.link, marginBottom: 4 }}>
            {t('doctor_detail.ai_disclaimer_title', 'Kết quả AI chỉ hỗ trợ tham khảo lâm sàng')}
          </AppText>
          <AppText variant="caption" color={colors.text.primary}>
            {t(
              'doctor_detail.ai_disclaimer_body',
              'Không thay thế kết luận chẩn đoán của bác sĩ. Bản đồ nhiệt Grad-CAM thể hiện vùng ảnh đóng góp vào dự đoán của nhánh CNN, không phải vị trí khối u đã được sinh thiết xác nhận.',
            )}
          </AppText>
        </View>
      </ScrollView>

      {/* Dialog thông báo */}
      <Dialog
        visible={noticeDialog.visible}
        type="default"
        title={noticeDialog.title}
        body={noticeDialog.body}
        confirmLabel={t('doctor_detail.common_dialog_close', 'Đã hiểu')}
        onConfirm={() => setNoticeDialog({ visible: false, title: '', body: '' })}
        onCancel={() => setNoticeDialog({ visible: false, title: '', body: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  canvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sliderCard: {
    borderWidth: 1,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelInfoCard: {
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  legalBox: {
    borderWidth: 1,
  },
});
