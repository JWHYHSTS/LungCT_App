import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Banner,
  BottomSheet,
  CTImageView,
  Button,
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
import { findCaseById, subscribeDoctorStore, type MockCase, type MockCTImage } from '../../../mocks';
import {
  runNativePipelineFromFilePath,
  getAvailableTestImages,
  pickImageFromDevice,
  isInferenceRunning,
  type AvailableTestImage,
} from '../../../services/ai/onDevicePipeline';
import { PipelinePredictionResult } from '../../../services/ai/types';
import {
  SUSPICIOUS_COLOR_MALIGNANT,
  SUSPICIOUS_COLOR_BENIGN,
  SUSPICIOUS_COLOR_NORMAL,
  SUSPICIOUS_COLOR_HOT_PERCENT,
} from '../../../ui/theme/heatmap';
import { CaseRepository, subscribeCaseRepository } from '../../../services/storage';
import { useAuth } from '../../../features/auth';

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
 * - Hỗ trợ chọn tệp ảnh CT trực tiếp từ thiết bị (/sdcard/Download, bộ nhớ app).
 */
export const AIImageResultScreen: React.FC<AIImageResultScreenProps> = ({
  caseId,
  initialImageIndex = 1,
  onBack,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || '';

  const [currentCase, setCurrentCase] = useState<MockCase | undefined>(() => findCaseById(caseId));

  React.useEffect(() => {
    let isMounted = true;
    const loadCase = async () => {
      try {
        const stored = await CaseRepository.getCaseById(ownerId, caseId);
        if (isMounted && stored) {
          setCurrentCase(stored);
        }
      } catch (e) {
        console.warn('[AIImageResultScreen] Lỗi tải ca từ storage:', e);
      }
    };
    loadCase();

    const unsubRepo = subscribeCaseRepository(loadCase);
    const unsubMock = subscribeDoctorStore(() => {
      const fallback = findCaseById(caseId);
      if (isMounted && fallback) setCurrentCase(fallback);
    });

    return () => {
      isMounted = false;
      unsubRepo();
      unsubMock();
    };
  }, [caseId, ownerId]);

  const images = currentCase?.images ?? [];

  const [localImages, setLocalImages] = useState<MockCTImage[]>(currentCase?.images ?? []);
  const [analyzedResults, setAnalyzedResults] = useState<Record<string, PipelinePredictionResult>>({});

  useEffect(() => {
    if (currentCase?.images && currentCase.images.length > 0) {
      setLocalImages(currentCase.images);
    }
  }, [currentCase?.images]);

  const applyResultToLocalImages = (targetId: string, result: PipelinePredictionResult) => {
    setAnalyzedResults((prev) => ({ ...prev, [targetId]: result }));
    setLocalImages((prev) =>
      prev.map((img) =>
        img.id === targetId
          ? {
              ...img,
              status: result.gradcamAvailable
                ? 'pass'
                : result.gradcamStatus === 'ZERO_CAM'
                  ? 'pass'
                  : 'passNoCam',
              hasGradCam: result.gradcamAvailable,
              gradcamUri: result.gradcamUri,
              gradcamStatus: result.gradcamStatus,
              lungMaskUri: result.lungMaskUri,
              suspiciousOverlayUri: result.suspiciousOverlayUri,
              triPanelUri: result.triPanelUri,
              suspiciousCount: result.suspiciousCount,
              lungHotRatio: result.lungHotRatio,
              decisionReason: result.decisionReason,
              suspiciousRegions: result.suspiciousRegions,
              scores: {
                benign: result.probabilities.Benign,
                malignant: result.probabilities.Malignant,
                normal: result.probabilities.Normal,
              },
              aiClass: (result.predictedClass.charAt(0).toUpperCase() +
                result.predictedClass.slice(1).toLowerCase()) as any,
            }
          : img,
      ),
    );
  };

  const [currentIndex, setCurrentIndex] = useState<number>(initialImageIndex);
  const [viewMode, setViewMode] = useState<string>('cam'); // 'orig' | 'cam'
  const [camOpacity, setCamOpacity] = useState<number>(40);

  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
    onClose?: () => void;
  }>({ visible: false, title: '', body: '' });

  const [showDeleteSliceDialog, setShowDeleteSliceDialog] = useState(false);

  const [onDeviceResult, setOnDeviceResult] = useState<PipelinePredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFileLabel, setSelectedFileLabel] = useState<string | null>(null);

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // BottomSheet chọn tệp từ thiết bị
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<AvailableTestImage[]>([]);

  const handleOpenFilePicker = async () => {
    const list = await getAvailableTestImages();
    setAvailableFiles(list);
    setShowFilePicker(true);
  };

  const handlePickFromSystemPicker = async () => {
    setShowFilePicker(false);
    try {
      const picked = await pickImageFromDevice();
      if (picked.canceled || !picked.uri) {
        return;
      }

      const fileName = picked.name || 'CT_Slice.jpg';
      setSelectedFileLabel(fileName);
      setSelectedImageUri(picked.uri);
      setOnDeviceResult(null);
      setIsAnalyzing(true);

      const result = await runNativePipelineFromFilePath(picked.uri);
      setOnDeviceResult(result);
      applyResultToLocalImages(activeImage.id, result);

      // Lưu kết quả dự đoán vào CaseRepository
      try {
        const mappedLabel =
          result.predictedClass.toLowerCase() === 'benign'
            ? 'BENIGN'
            : result.predictedClass.toLowerCase() === 'malignant'
              ? 'MALIGNANT'
              : 'NORMAL';

        await CaseRepository.saveAIResult(ownerId, activeImage.id, {
          scores: [
            result.probabilities.Benign,
            result.probabilities.Malignant,
            result.probabilities.Normal,
          ],
          label: mappedLabel,
          durationMs: result.latency.totalInferenceMs,
          modelVersion: 'Adaptive-AACNN-ViT-FP32-v1',
          mode: 'REAL',
          gradcamUri: result.gradcamUri,
          gradcamStatus: result.gradcamStatus,
          lungMaskUri: result.lungMaskUri,
          suspiciousOverlayUri: result.suspiciousOverlayUri,
          triPanelUri: result.triPanelUri,
          suspiciousRegions: result.suspiciousRegions,
          suspiciousCount: result.suspiciousCount,
          lungHotRatio: result.lungHotRatio,
          decisionReason: result.decisionReason,
        });
      } catch (saveErr) {
        console.warn('[AIImageResultScreen] Lỗi lưu kết quả AI tệp picked:', saveErr);
      }

      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_device_file_success_title', 'Phân tích tệp thiết bị thành công'),
        body: t('doctor_detail.ai_device_file_success_body', {
          name: fileName,
          cls: result.predictedClass,
          benign: (result.probabilities.Benign * 100).toFixed(4),
          malignant: (result.probabilities.Malignant * 100).toFixed(4),
          normal: (result.probabilities.Normal * 100).toFixed(4),
          vit: result.latency.vitInferenceMs,
          fusion: result.latency.fusionInferenceMs,
        }),
      });
    } catch (err: any) {
      setOnDeviceResult(null);
      setSelectedImageUri(null);
      setSelectedFileLabel(null);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_error_title', 'Lỗi phân tích tệp CT (MSG-10)'),
        body: err?.message || t('doctor_detail.ai_error_device_file_msg', 'Không thể giải mã hoặc suy luận tệp ảnh đã chọn.'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectFile = async (file: AvailableTestImage) => {
    setShowFilePicker(false);
    setSelectedFileLabel(file.name);
    setSelectedImageUri(file.path.startsWith('/') ? `file://${file.path}` : file.path);
    setOnDeviceResult(null);
    setIsAnalyzing(true);

    try {
      const result = await runNativePipelineFromFilePath(file.path);
      setOnDeviceResult(result);
      applyResultToLocalImages(activeImage.id, result);

      // Lưu kết quả dự đoán vào CaseRepository
      try {
        const mappedLabel =
          result.predictedClass.toLowerCase() === 'benign'
            ? 'BENIGN'
            : result.predictedClass.toLowerCase() === 'malignant'
              ? 'MALIGNANT'
              : 'NORMAL';

        await CaseRepository.saveAIResult(ownerId, activeImage.id, {
          scores: [
            result.probabilities.Benign,
            result.probabilities.Malignant,
            result.probabilities.Normal,
          ],
          label: mappedLabel,
          durationMs: result.latency.totalInferenceMs,
          modelVersion: 'Adaptive-AACNN-ViT-FP32-v1',
          mode: 'REAL',
          gradcamUri: result.gradcamUri,
          gradcamStatus: result.gradcamStatus,
          lungMaskUri: result.lungMaskUri,
          suspiciousOverlayUri: result.suspiciousOverlayUri,
          triPanelUri: result.triPanelUri,
          suspiciousRegions: result.suspiciousRegions,
          suspiciousCount: result.suspiciousCount,
          lungHotRatio: result.lungHotRatio,
          decisionReason: result.decisionReason,
        });
      } catch (saveErr) {
        console.warn('[AIImageResultScreen] Lỗi lưu kết quả AI tệp select:', saveErr);
      }

      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_device_file_success_title', 'Phân tích tệp thiết bị thành công'),
        body: t('doctor_detail.ai_device_file_success_body', {
          name: file.name,
          cls: result.predictedClass,
          benign: (result.probabilities.Benign * 100).toFixed(4),
          malignant: (result.probabilities.Malignant * 100).toFixed(4),
          normal: (result.probabilities.Normal * 100).toFixed(4),
          vit: result.latency.vitInferenceMs,
          fusion: result.latency.fusionInferenceMs,
        }),
      });
    } catch (err: any) {
      setOnDeviceResult(null);
      setSelectedImageUri(null);
      setSelectedFileLabel(null);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_error_title', 'Lỗi phân tích tệp CT (MSG-10)'),
        body: err?.message || t('doctor_detail.ai_error_device_file_msg', 'Không thể giải mã hoặc suy luận tệp ảnh đã chọn.'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Xử lý chạy trực tiếp toàn bộ pipeline ViT ONNX + Fusion TFLite trên thiết bị từ lát cắt hiện tại
  const handleRunRealInference = async () => {
    if (isAnalyzing || isInferenceRunning()) {
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_busy_title', 'Hệ thống đang bận'),
        body: t('doctor_detail.ai_busy_body', 'Tiến trình suy luận AI Edge FP32 đang được thực thi. Vui lòng không bấm liên tiếp.'),
      });
      return;
    }

    setIsAnalyzing(true);
    setSelectedFileLabel(null);
    setSelectedImageUri(null);
    try {
      if (isFail) {
        setOnDeviceResult(null);
        throw new Error(
          activeImage.failReason ||
            'Không thể phân tích ảnh này (MSG-10). Chất lượng lát cắt hoặc định dạng ảnh không hợp lệ.',
        );
      }

      setOnDeviceResult(null);

      // Ưu tiên tệp ảnh thực tế gắn liền với lát cắt nếu có
      let targetPath: string | undefined = activeImage.filePath || activeImage.uri;
      let targetName: string = activeImage.originalFileName || `Lát cắt #${activeImage.sliceNumber}`;

      const files = await getAvailableTestImages();
      let needsFallback =
        !targetPath ||
        (!targetPath.startsWith('/') && !targetPath.startsWith('file://')) ||
        targetPath.startsWith('mock://') ||
        targetPath.startsWith('http');

      if (needsFallback && files.length > 0) {
        // 1. Khớp chính xác tên tệp gốc nếu có
        let matched = files.find(
          (f) =>
            activeImage.originalFileName &&
            f.name.toLowerCase().includes(activeImage.originalFileName.toLowerCase()),
        );
        // 2. Khớp số lát cắt (ví dụ lát cắt 36 khớp với Malignant case 36)
        if (!matched) {
          matched = files.find(
            (f) =>
              f.name.includes(`_${activeImage.sliceNumber}.`) ||
              f.name.includes(`(${activeImage.sliceNumber})`),
          );
        }
        // 3. Fallback xoay vòng qua danh sách tệp kiểm thử
        if (!matched) {
          matched = files[(activeIndex - 1) % files.length];
        }

        if (matched) {
          targetPath = matched.path;
          targetName = matched.name;
        }
      }

      if (!targetPath) {
        throw new Error(
          'Chưa tìm thấy tệp ảnh CT mẫu trên thiết bị (/sdcard/Download hoặc thư mục app). Vui lòng dùng nút "Chọn ảnh từ thiết bị để chạy AI" bên dưới.',
        );
      }

      setSelectedFileLabel(targetName);
      setSelectedImageUri(
        targetPath.startsWith('/') ? `file://${targetPath}` : targetPath,
      );

      // eslint-disable-next-line react-hooks/purity
      const startRunTimestamp = Date.now();
      const result = await runNativePipelineFromFilePath(targetPath);
      // eslint-disable-next-line react-hooks/purity
      const finishRunTimestamp = Date.now();
      const totalFlowDurationMs = Math.max(0, finishRunTimestamp - startRunTimestamp);
      setOnDeviceResult(result);
      applyResultToLocalImages(activeImage.id, result);

      // Lưu kết quả dự đoán vào kho lưu trữ mã hóa cục bộ
      try {
        const mappedLabel =
          result.predictedClass.toLowerCase() === 'benign'
            ? 'BENIGN'
            : result.predictedClass.toLowerCase() === 'malignant'
              ? 'MALIGNANT'
              : 'NORMAL';

        await CaseRepository.saveAIResult(ownerId, activeImage.id, {
          scores: [
            result.probabilities.Benign,
            result.probabilities.Malignant,
            result.probabilities.Normal,
          ],
          label: mappedLabel,
          durationMs: totalFlowDurationMs,
          modelVersion: 'Adaptive-AACNN-ViT-FP32-v1',
          mode: 'REAL',
          gradcamUri: result.gradcamUri,
          gradcamStatus: result.gradcamStatus,
          lungMaskUri: result.lungMaskUri,
          suspiciousOverlayUri: result.suspiciousOverlayUri,
          triPanelUri: result.triPanelUri,
          suspiciousRegions: result.suspiciousRegions,
          suspiciousCount: result.suspiciousCount,
          lungHotRatio: result.lungHotRatio,
          decisionReason: result.decisionReason,
        });
      } catch (saveErr) {
        console.warn('[AIImageResultScreen] Lỗi ghi kết quả AI vào kho lưu trữ:', saveErr);
      }

      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_run_success_title', 'Phân tích On-Device Hoàn Tất'),
        body: t('doctor_detail.ai_run_success_body', {
          slice: activeImage.sliceNumber,
          cls: result.predictedClass,
          benign: (result.probabilities.Benign * 100).toFixed(4),
          malignant: (result.probabilities.Malignant * 100).toFixed(4),
          normal: (result.probabilities.Normal * 100).toFixed(4),
          vit: result.latency.vitInferenceMs,
          fusion: result.latency.fusionInferenceMs,
        }),
      });
    } catch (err: any) {
      setOnDeviceResult(null);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.ai_error_title', 'Lỗi phân tích AI (MSG-10)'),
        body: err?.message || t('doctor_detail.ai_error_default_msg', 'Không thể thực hiện suy luận on-device cho lát cắt này.'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmDeleteSlice = async () => {
    setShowDeleteSliceDialog(false);
    if (!currentCase || !activeImage) return;

    const res = await CaseRepository.removeCTImage(ownerId, currentCase.id, activeImage.id);
    if (!res.success) {
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.case_image_delete_error', 'Không thể xóa ảnh'),
        body: res.reason || 'Có lỗi xảy ra khi xóa lát cắt.',
      });
      return;
    }

    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.case_image_deleted_title', 'Đã xóa lát cắt'),
      body: t('doctor_detail.case_image_deleted_body', {
        index: currentIndex,
        defaultValue: `Đã xóa lát cắt #${currentIndex} khỏi ca bệnh và giải phóng dung lượng bộ nhớ.`,
      }),
      onClose: onBack,
    });
  };

  // Xử lý khi không tìm thấy ca bệnh hoặc ca không có ảnh
  if (!currentCase || localImages.length === 0) {
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
  const activeIndex = Math.max(1, Math.min(localImages.length, currentIndex));
  const activeImage: MockCTImage = localImages[activeIndex - 1] || localImages[0];

  const handlePrev = () => {
    if (activeIndex > 1) {
      const nextIdx = activeIndex - 1;
      const targetImg = localImages[nextIdx - 1];
      setSelectedFileLabel(null);
      setSelectedImageUri(null);
      setOnDeviceResult(targetImg ? analyzedResults[targetImg.id] || null : null);
      setCurrentIndex(nextIdx);
    }
  };

  const handleNext = () => {
    if (activeIndex < localImages.length) {
      const nextIdx = activeIndex + 1;
      const targetImg = localImages[nextIdx - 1];
      setSelectedFileLabel(null);
      setSelectedImageUri(null);
      setOnDeviceResult(targetImg ? analyzedResults[targetImg.id] || null : null);
      setCurrentIndex(nextIdx);
    }
  };

  const isFail = activeImage.status === 'fail';
  const hasCam = onDeviceResult
    ? onDeviceResult.gradcamAvailable
    : Boolean(activeImage.hasGradCam || activeImage.gradcamUri);
  const currentGradcamUri = onDeviceResult?.gradcamUri || activeImage.gradcamUri;
  const currentLungMaskUri = onDeviceResult?.lungMaskUri || activeImage.lungMaskUri;
  const currentSuspiciousOverlayUri = onDeviceResult?.suspiciousOverlayUri || activeImage.suspiciousOverlayUri;
  const currentTriPanelUri = onDeviceResult?.triPanelUri || activeImage.triPanelUri;
  const currentSuspiciousRegions = onDeviceResult?.suspiciousRegions || activeImage.suspiciousRegions || [];
  const currentSuspiciousCount = onDeviceResult?.suspiciousCount ?? activeImage.suspiciousCount ?? currentSuspiciousRegions.length;
  const currentLungHotRatio = onDeviceResult?.lungHotRatio ?? activeImage.lungHotRatio;
  const currentDecisionReason = onDeviceResult?.decisionReason || activeImage.decisionReason;

  const isZeroCam =
    onDeviceResult?.gradcamStatus === 'ZERO_CAM' || activeImage.gradcamStatus === 'ZERO_CAM';
  const isPending =
    !onDeviceResult && (!activeImage.scores || activeImage.status === 'pending');
  const isNoCam =
    !isPending &&
    !isFail &&
    !hasCam &&
    !isZeroCam &&
    (activeImage.status === 'passNoCam' ||
      onDeviceResult?.gradcamStatus === 'UNAVAILABLE' ||
      onDeviceResult?.gradcamStatus === 'FAIL');
  const showHeatmapLayer = viewMode === 'cam' && hasCam && !isFail;

  const segmentedItems = [
    { key: 'orig', label: t('doctor_detail.ai_mode_orig', 'Ảnh gốc') },
    { key: 'cam', label: t('doctor_detail.ai_mode_cam', 'Grad-CAM') },
    ...(currentSuspiciousOverlayUri || currentSuspiciousCount > 0
      ? [{ key: 'boxes', label: 'Vùng nghi ngờ' }]
      : []),
    ...(currentTriPanelUri
      ? [{ key: 'tripanel', label: '3 Khung Colab' }]
      : []),
  ];

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
              {selectedFileLabel
                ? t('doctor_detail.ai_file_prefix', { name: selectedFileLabel, defaultValue: `Tệp: ${selectedFileLabel}` })
                : t('doctor_detail.ai_slice_info', {
                    current: activeIndex,
                    total: localImages.length,
                    slice: activeImage.sliceNumber,
                    defaultValue: `Ảnh ${activeIndex}/${localImages.length} · Lát cắt #${activeImage.sliceNumber}`,
                  })}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {selectedFileLabel
                ? t('doctor_detail.ai_file_source_label', 'Nguồn: Bộ nhớ thiết bị (Tệp thực)')
                : activeImage.source === 'gallery'
                  ? t('doctor_detail.ai_source_gallery', 'Nguồn: Thư viện ảnh')
                  : t('doctor_detail.ai_source_camera', 'Nguồn: Máy ảnh')}
            </AppText>
          </View>
          <IconButton
            name="chevron-right"
            disabled={activeIndex >= localImages.length}
            accessibilityLabel={t('doctor_detail.ai_next_image', 'Ảnh kế tiếp')}
            onPress={handleNext}
          />
        </View>

        {/* Khung hiển thị ảnh cắt lớp CT */}
        {viewMode === 'tripanel' && currentTriPanelUri ? (
          <View style={[styles.canvasWrapper, { padding: 0, overflow: 'hidden' }]}>
            <View style={{ backgroundColor: '#000', borderRadius: radius.md, overflow: 'hidden', width: '100%', alignItems: 'center' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ alignItems: 'center' }}
              >
                <Image
                  source={{ uri: currentTriPanelUri }}
                  style={{ width: 680, height: 230 }}
                  resizeMode="contain"
                />
              </ScrollView>
              <View style={{ width: '100%', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.75)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="caption" color="#fff" style={{ fontWeight: '600' }}>
                  [Gốc + Viền phổi] | [Grad-CAM thô] | [Vùng sau lọc]
                </AppText>
                {currentLungHotRatio != null && (
                  <AppText variant="caption" color={SUSPICIOUS_COLOR_HOT_PERCENT} style={{ fontWeight: 'bold' }}>
                    {`Vùng nóng phổi: ${(currentLungHotRatio * 100).toFixed(0)}%`}
                  </AppText>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.canvasWrapper}>
            <CTImageView
              key={`${selectedImageUri || activeImage.uri || activeImage.id}_${currentGradcamUri || ''}_${viewMode}`}
              imageSource={
                selectedImageUri
                  ? { uri: selectedImageUri }
                  : activeImage.uri
                    ? { uri: activeImage.uri }
                    : undefined
              }
              heatmapSource={currentGradcamUri ? { uri: currentGradcamUri } : undefined}
              showHeatmap={showHeatmapLayer}
              heatmapOpacity={camOpacity / 100}
              secondaryOverlaySource={viewMode === 'boxes' && currentLungMaskUri ? { uri: currentLungMaskUri } : undefined}
              overlaySource={viewMode === 'boxes' && currentSuspiciousOverlayUri ? { uri: currentSuspiciousOverlayUri } : undefined}
              size={340}
              watermarkText={
                onDeviceResult
                  ? t('doctor_detail.ai_watermark_real', 'ON-DEVICE AI THỰC')
                  : selectedImageUri || activeImage.uri
                    ? t('doctor_detail.ai_watermark_device_file', 'ẢNH TỪ THIẾT BỊ')
                    : activeImage.mockWatermark
                      ? t('doctor_detail.ai_watermark_mock', 'ẢNH GIẢ LẬP')
                      : undefined
              }
            />
          </View>
        )}

        {/* Cảnh báo trạng thái FAIL hoặc ZERO_CAM hoặc Chưa phân tích hoặc Thiếu CAM */}
        {isFail && (
          <View style={{ marginVertical: spacing.sm }}>
            <Banner
              title={t('doctor_detail.ai_banner_fail_title', 'Lỗi phân tích hội tụ (MSG-10)')}
              body={
                activeImage.failReason ||
                t(
                  'doctor_detail.ai_banner_fail_body',
                  'Ảnh lát cắt chất lượng thấp hoặc hội tụ thuật toán thất bại. Không thể xuất bản đồ nhiệt và điểm AI.',
                )
              }
              type="error"
            />
          </View>
        )}

        {isZeroCam && !isFail && (
          <View style={{ marginVertical: spacing.sm }}>
            <Banner
              title="Độ tin cậy tuyệt đối (ZERO_CAM)"
              body="Bản đồ nhiệt bằng 0 do gradient hàm Softmax bão hòa (mô hình dự đoán với độ tin cậy tiệm cận 100%, tuân thủ đúng nguyên lý toán học Grad-CAM)."
              type="info"
            />
          </View>
        )}

        {isPending && !isFail && (
          <View style={{ marginVertical: spacing.sm }}>
            <Banner
              title="Chưa phân tích AI On-Device"
              body="Lát cắt này chưa được chạy chẩn đoán AI trên thiết bị. Nhấn nút 'Chạy phân tích AI Lát Cắt Này (FP32)' bên dưới để nhận diện và trích xuất bản đồ nhiệt Grad-CAM."
              type="info"
            />
          </View>
        )}

        {isNoCam && !isFail && !isZeroCam && (
          <View style={{ marginVertical: spacing.sm }}>
            <Banner
              title={t('doctor_detail.ai_banner_nocam_title', 'Không có bản đồ Grad-CAM')}
              body={
                activeImage.status === 'passNoCam' && !onDeviceResult
                  ? 'Lát cắt này được phân tích trước khi cập nhật tính năng Grad-CAM on-device. Vui lòng bấm nút phân tích bên dưới để tạo bản đồ nhiệt.'
                  : t(
                      'doctor_detail.ai_banner_nocam_body',
                      'Lát cắt này không có bản đồ nhiệt do độ tin cậy thấp hoặc chưa được tính toán.',
                    )
              }
              type="warning"
            />
          </View>
        )}

        {/* Chú giải thang màu nhiệt (HeatmapLegend) */}
        {viewMode === 'cam' && !isFail && hasCam && (
          <View
            style={[
              styles.legendCard,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.md,
                marginVertical: spacing.xs,
              },
            ]}
          >
            <HeatmapLegend />
          </View>
        )}

        {/* Chuyển đổi Ảnh gốc / Grad-CAM / Vùng nghi ngờ / 3 Khung Colab */}
        {!isFail && (hasCam || currentTriPanelUri || currentSuspiciousCount > 0) && (
          <View style={{ marginVertical: spacing.sm }}>
            <Segmented
              items={segmentedItems}
              selectedKey={viewMode}
              onSelect={setViewMode}
            />
          </View>
        )}

        {/* Thông báo lý do vẽ / không vẽ vùng nghi ngờ */}
        {currentDecisionReason && !isFail && !isPending && (
          <View style={{ marginVertical: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: currentSuspiciousCount > 0
                  ? (activeImage.aiClass === 'Benign' ? 'rgba(255, 140, 0, 0.12)' : 'rgba(230, 25, 25, 0.12)')
                  : 'rgba(16, 185, 129, 0.12)',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: radius.md,
                borderLeftWidth: 4,
                borderLeftColor: currentSuspiciousCount > 0
                  ? (activeImage.aiClass === 'Benign' ? SUSPICIOUS_COLOR_BENIGN : SUSPICIOUS_COLOR_MALIGNANT)
                  : SUSPICIOUS_COLOR_NORMAL,
              }}
            >
              <AppText variant="labelM" style={{ flex: 1, color: colors.text.primary, fontSize: 13 }}>
                {currentDecisionReason}
              </AppText>
              {currentSuspiciousCount > 0 && (
                <View
                  style={{
                    backgroundColor: activeImage.aiClass === 'Benign' ? SUSPICIOUS_COLOR_BENIGN : SUSPICIOUS_COLOR_MALIGNANT,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    marginLeft: spacing.xs,
                  }}
                >
                  <AppText variant="caption" color={colors.text.inverse} style={{ fontWeight: 'bold' }}>
                    {`${currentSuspiciousCount} vùng nghi ngờ`}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Slider điều chỉnh độ phủ Grad-CAM */}
        {viewMode === 'cam' && !isFail && hasCam && (
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

        {/* Danh sách thẻ chi tiết các vùng nghi ngờ (Colab mục 24 & 28) */}
        {currentSuspiciousRegions.length > 0 && !isFail && (
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <AppText variant="titleS" style={{ color: colors.text.primary }}>
                Vùng nghi ngờ đã khoanh (Colab)
              </AppText>
              <View
                style={{
                  backgroundColor: activeImage.aiClass === 'Benign' ? SUSPICIOUS_COLOR_BENIGN : SUSPICIOUS_COLOR_MALIGNANT,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <AppText variant="caption" color={colors.text.inverse} style={{ fontWeight: 'bold' }}>
                  {activeImage.aiClass === 'Benign' ? 'BENIGN (CAM)' : 'MALIGNANT (ĐỎ)'}
                </AppText>
              </View>
            </View>

            {currentSuspiciousRegions.map((region, idx) => (
              <View
                key={`region_${region.id || idx}`}
                style={{
                  paddingVertical: 8,
                  borderTopWidth: idx > 0 ? 1 : 0,
                  borderTopColor: colors.border.default,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText
                    variant="labelM"
                    style={{
                      color: activeImage.aiClass === 'Benign' ? SUSPICIOUS_COLOR_BENIGN : SUSPICIOUS_COLOR_MALIGNANT,
                      fontWeight: 'bold',
                    }}
                  >
                    {`Vùng #${region.id}: Khung [x=${region.x}, y=${region.y}, w=${region.w}, h=${region.h}]`}
                  </AppText>
                  <AppText variant="labelM" style={{ color: colors.text.link, fontWeight: '600' }}>
                    {`CAM max: ${region.camMax.toFixed(2)}`}
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                  {`Diện tích: ${region.areaPx} px (${(region.areaRatio * 100).toFixed(2)}% lát cắt) · CAM TB: ${region.camMean.toFixed(2)}`}
                </AppText>
              </View>
            ))}

            <View style={{ marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border.default }}>
              <AppText variant="caption" color={colors.text.secondary} style={{ fontStyle: 'italic', fontSize: 11 }}>
                * Vùng đánh dấu là nơi mô hình chú ý nhiều nhất khi đưa ra dự đoán (Grad-CAM ≥ 50%), chỉ mang tính tham khảo; không phải vị trí khối u đã được bác sĩ xác nhận lâm sàng.
              </AppText>
            </View>
          </View>
        )}

        {/* Nút bấm kích hoạt phân tích thực tế On-Device */}
        <View style={{ marginVertical: spacing.sm, gap: spacing.xs }}>
          <Button
            label={
              isAnalyzing
                ? t('doctor_detail.ai_btn_running', 'Đang phân tích On-Device...')
                : t('doctor_detail.ai_btn_run_slice', 'Chạy phân tích AI Lát Cắt Này (FP32)')
            }
            leadingIcon="on-device"
            variant="primary"
            loading={isAnalyzing}
            disabled={isAnalyzing}
            onPress={handleRunRealInference}
          />
          <Button
            label={t('doctor_detail.ai_btn_choose_device', 'Chọn ảnh từ thiết bị để chạy AI')}
            variant="secondary"
            disabled={isAnalyzing}
            onPress={handleOpenFilePicker}
          />
          {/* Nút Xóa lát cắt CT này (Chính sách 1A & 2A) */}
          {currentCase?.status !== 'COMPLETED' && !currentCase?.isTrashed && (
            <Button
              label={t('doctor_detail.ai_btn_delete_slice', 'Xóa lát cắt này khỏi ca')}
              variant="danger"
              leadingIcon="trash"
              disabled={isAnalyzing}
              onPress={() => setShowDeleteSliceDialog(true)}
            />
          )}
        </View>

        {/* Bảng điểm phân loại 3 lớp AI */}
        {!isFail && (onDeviceResult || (!selectedImageUri && activeImage.scores)) ? (
          <View style={{ marginVertical: spacing.sm }}>
            <ScoreCard
              scores={
                onDeviceResult
                  ? [
                      { classification: 'Benign', score: onDeviceResult.probabilities.Benign },
                      {
                        classification: 'Malignant',
                        score: onDeviceResult.probabilities.Malignant,
                      },
                      { classification: 'Normal', score: onDeviceResult.probabilities.Normal },
                    ]
                  : [
                      { classification: 'Benign', score: activeImage.scores!.benign },
                      { classification: 'Malignant', score: activeImage.scores!.malignant },
                      { classification: 'Normal', score: activeImage.scores!.normal },
                    ]
              }
            />
          </View>
        ) : null}

        {/* Thông tin metadata kỹ thuật */}
        <Divider style={{ marginVertical: spacing.md }} />
        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.md,
              padding: spacing.md,
            },
          ]}
        >
          <AppText variant="titleS" style={{ marginBottom: spacing.sm }}>
            {t('doctor_detail.ai_section_meta', 'Thông số lát cắt & Mô hình')}
          </AppText>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary} style={styles.metaLabel}>
              {t('doctor_detail.mo_hinh', 'Mô hình')}
            </AppText>
            <AppText variant="bodyM" style={styles.metaValue}>Adaptive AACNN–ViT (FP32)</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary} style={styles.metaLabel}>
              {t('doctor_detail.nguon_thuc_thi', 'Nguồn thực thi')}
            </AppText>
            <AppText variant="bodyM" style={styles.metaValue}>
              {onDeviceResult
                ? t(
                    'doctor_detail.ai_source_real_device',
                    'Thiết bị thực tế (ViT ONNX + Fusion TFLite)',
                  )
                : t('doctor_detail.on_device', 'Trên thiết bị (On-Device)')}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary} style={styles.metaLabel}>
              {t('doctor_detail.trang_thai_grad_cam', 'Trạng thái Grad-CAM')}
            </AppText>
            <AppText variant="bodyM" style={styles.metaValue}>
              {onDeviceResult
                ? onDeviceResult.gradcamAvailable
                  ? 'Đạt (On-Device Native Jet)'
                  : onDeviceResult.gradcamStatus === 'ZERO_CAM'
                    ? 'Bão hòa (ZERO_CAM)'
                    : t('doctor_detail.khong_kha_dung', 'Không khả dụng')
                : hasCam
                  ? t('doctor_detail.at', 'Đạt')
                  : isZeroCam
                    ? 'Bão hòa (ZERO_CAM)'
                    : isPending
                      ? 'Chưa phân tích'
                      : t('doctor_detail.khong_kha_dung', 'Không khả dụng')}
            </AppText>
          </View>
          {onDeviceResult && (
            <View style={styles.metaRow}>
              <AppText variant="caption" color={colors.text.secondary} style={styles.metaLabel}>
                {t('doctor_detail.ai_inference_time', 'Thời gian suy luận')}
              </AppText>
              <AppText variant="bodyM" style={styles.metaValue}>
                {`${onDeviceResult.latency.totalInferenceMs} ms (ViT: ${onDeviceResult.latency.vitInferenceMs}ms, Fusion: ${onDeviceResult.latency.fusionInferenceMs}ms${onDeviceResult.latency.gradcamMs != null ? `, CAM: ${onDeviceResult.latency.gradcamMs}ms` : ''})`}
              </AppText>
            </View>
          )}
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary} style={styles.metaLabel}>
              {t('doctor_detail.thoi_iem', 'Thời điểm')}
            </AppText>
            <AppText variant="bodyM" style={styles.metaValue}>{currentCase.captureDate} 10:41</AppText>
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

      {/* BottomSheet Chọn Tệp Từ Thiết Bị */}
      <BottomSheet
        visible={showFilePicker}
        title={t('doctor_detail.ai_picker_title', 'Chọn tệp ảnh CT từ thiết bị')}
        onClose={() => setShowFilePicker(false)}
      >
        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          {/* Nút mở trình duyệt tệp hệ thống Android (chọn ảnh bất kỳ từ máy) */}
          <TouchableOpacity
            onPress={handlePickFromSystemPicker}
            style={{
              padding: spacing.md,
              backgroundColor: colors.bg.surfaceAlt || colors.bg.surface,
              borderWidth: 1.5,
              borderColor: colors.border.focus || colors.text.link,
              borderRadius: radius.sm,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xs,
            }}
          >
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppText variant="labelM" color={colors.text.primary} style={{ fontWeight: '700' }}>
                {t('doctor_detail.ai_picker_system_title', '📁 Mở trình chọn tệp hệ thống (System Picker)')}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                {t('doctor_detail.ai_picker_system_subtitle', 'Duyệt và chọn ảnh bất kỳ từ bộ nhớ thiết bị, Thư viện ảnh, Drive...')}
              </AppText>
            </View>
            <AppText variant="labelM" color={colors.text.link}>
              {t('doctor_detail.ai_picker_system_open', 'Mở →')}
            </AppText>
          </TouchableOpacity>

          <Divider style={{ marginVertical: spacing.xs }} />

          <AppText variant="caption" color={colors.text.secondary} style={{ fontWeight: '600' }}>
            {t('doctor_detail.ai_picker_found_in_folder', 'Tệp tìm thấy trong thư mục kiểm thử (/sdcard/Download, app storage):')}
          </AppText>

          {availableFiles.length === 0 ? (
            <AppText variant="bodyM" color={colors.text.secondary}>
              {t('doctor_detail.ai_picker_no_files', 'Không tìm thấy tệp ảnh CT nào trong các thư mục quét mặc định.')}
            </AppText>
          ) : (
            availableFiles.map((file) => (
              <TouchableOpacity
                key={file.path}
                onPress={() => handleSelectFile(file)}
                style={{
                  padding: spacing.md,
                  backgroundColor: colors.bg.surface,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  borderRadius: radius.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="labelM" color={colors.text.primary}>
                    {file.name}
                  </AppText>
                  <AppText variant="caption" color={colors.text.secondary}>
                    {t('doctor_detail.ai_picker_file_size', {
                      size: Math.round(file.size / 1024),
                      path: file.path,
                      defaultValue: `Dung lượng: ${Math.round(file.size / 1024)} KB · ${file.path}`,
                    })}
                  </AppText>
                </View>
                <AppText variant="labelM" color={colors.text.link}>
                  {t('doctor_detail.ai_picker_analyze_btn', 'Phân tích →')}
                </AppText>
              </TouchableOpacity>
            ))
          )}
        </View>
      </BottomSheet>

      {/* Dialog xác nhận xóa lát cắt (Chính sách 1A & 2A) */}
      <Dialog
        visible={showDeleteSliceDialog}
        type="destructive"
        title={t('doctor_detail.case_image_delete_title', 'Xóa lát cắt CT này?')}
        body={t('doctor_detail.case_image_delete_body', {
          index: currentIndex,
          defaultValue: `Bạn có chắc chắn muốn xóa lát cắt #${currentIndex}? Kết quả AI tương ứng sẽ bị hủy và tệp ảnh sẽ được giải phóng khỏi bộ nhớ máy.`,
        })}
        confirmLabel={t('common.delete', 'Xóa')}
        cancelLabel={t('doctor_detail.common_dialog_cancel', 'Hủy')}
        onConfirm={handleConfirmDeleteSlice}
        onCancel={() => setShowDeleteSliceDialog(false)}
      />

      {/* Dialog thông báo */}
      <Dialog
        visible={noticeDialog.visible}
        type="default"
        title={noticeDialog.title}
        body={noticeDialog.body}
        confirmLabel={t('doctor_detail.common_dialog_close', 'Đã hiểu')}
        cancelLabel={null}
        onConfirm={() => {
          if (noticeDialog.onClose) {
            noticeDialog.onClose();
          } else {
            setNoticeDialog({ visible: false, title: '', body: '' });
          }
        }}
        onCancel={() => {
          if (noticeDialog.onClose) {
            noticeDialog.onClose();
          } else {
            setNoticeDialog({ visible: false, title: '', body: '' });
          }
        }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  canvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  legendCard: {
    borderWidth: 1,
  },
  sliderCard: {
    borderWidth: 1,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaCard: {
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 8,
  },
  metaLabel: {
    flexShrink: 0,
    maxWidth: '45%',
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
  },
  legalBox: {
    borderWidth: 1,
  },
});
