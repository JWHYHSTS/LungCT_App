import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Button,
  Checkbox,
  Dialog,
  Divider,
  EmptyState,
  IconButton,
  Segmented,
  TopBar,
} from '../../../ui/components';
import { findCaseById, type MockCase } from '../../../mocks';
import { CaseRepository } from '../../../services/storage';
import { deletePhysicalFile } from '../../../services/storage/fileUtil';
import { useAuth } from '../../../features/auth';
import { PdfReportService, type ClinicalReportData, type ExportedPdfResult } from '../../../services/pdf';

export interface ExportPdfScreenProps {
  caseId: string;
  onBack: () => void;
}

export type ExportedPdfItem = ExportedPdfResult;

/**
 * SCR-D01 (17-export-pdf): Màn hình Cấu hình và Xuất báo cáo PDF Y tế.
 * - Tùy chọn cấu hình:
 *   + Ngôn ngữ báo cáo: Tiếng Việt (vi) / English (en) - tách biệt hoàn toàn khỏi ngôn ngữ giao diện app.
 *   + Tùy chọn đính kèm: [x] Kèm hình ảnh bản đồ nhiệt Grad-CAM.
 *   + Phiên bản báo cáo: V1.0 (Tiêu chuẩn lâm sàng).
 * - Biên dịch file PDF vật lý on-device bằng PdfReportService (expo-print).
 * - Danh sách lịch sử các file PDF đã tạo trong ca bệnh này.
 * - Thao tác "Chia sẻ báo cáo":
 *   + RÀNG BUỘC AN TOÀN: Bắt buộc mở Dialog cảnh báo "Chia sẻ dữ liệu y tế nhạy cảm?" trước khi kích hoạt.
 *   + Sau khi xác nhận: Mở trình chia sẻ của hệ thống Android System Share Sheet (expo-sharing).
 */
export const ExportPdfScreen: React.FC<ExportPdfScreenProps> = ({ caseId, onBack }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user } = useAuth();
  const ownerId = user?.id || '';

  const [currentCase, setCurrentCase] = useState<MockCase | undefined>(() => findCaseById(caseId));

  // Ngôn ngữ của tài liệu PDF tạo ra (riêng biệt khỏi giao diện hệ thống)
  const [pdfLanguage, setPdfLanguage] = useState<'vi' | 'en'>('vi');
  const [includeGradCam, setIncludeGradCam] = useState<boolean>(true);
  const [pdfVersion] = useState<string>('V1.0 - Tiêu chuẩn lâm sàng');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Danh sách PDF đã xuất lưu bền vững (Chính sách 3A: loại bỏ placeholder mẫu cũ)
  const [exportedList, setExportedList] = useState<ExportedPdfItem[]>([]);

  const [showShareConfirmDialog, setShowShareConfirmDialog] = useState(false);
  const [selectedPdfToShare, setSelectedPdfToShare] = useState<ExportedPdfItem | null>(null);

  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedPdfToDelete, setSelectedPdfToDelete] = useState<ExportedPdfItem | null>(null);

  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({ visible: false, title: '', body: '' });

  React.useEffect(() => {
    let isMounted = true;
    const loadRealCaseAndPdfs = async () => {
      try {
        const storedCase = await CaseRepository.getCaseById(ownerId, caseId);
        if (isMounted && storedCase) {
          setCurrentCase(storedCase);
        }
        const storedPdfs = await CaseRepository.getExportedPdfsByCaseId(ownerId, caseId);
        if (isMounted && storedPdfs) {
          setExportedList(storedPdfs);
        }
      } catch (err) {
        console.warn('[ExportPdfScreen] Lỗi nạp thông tin ca hoặc báo cáo PDF:', err);
      }
    };
    loadRealCaseAndPdfs();
    return () => {
      isMounted = false;
    };
  }, [ownerId, caseId]);

  const handleRequestDelete = (item: ExportedPdfItem) => {
    setSelectedPdfToDelete(item);
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmDialog(false);
    if (!selectedPdfToDelete) return;

    if (selectedPdfToDelete.fileUri) {
      await deletePhysicalFile(selectedPdfToDelete.fileUri);
    }

    try {
      await CaseRepository.deleteExportedPdf(ownerId, selectedPdfToDelete.id);
    } catch (delErr) {
      console.warn('[ExportPdfScreen] Lỗi xóa bản ghi PDF trong repository:', delErr);
    }

    setExportedList((prev) => prev.filter((p) => p.id !== selectedPdfToDelete.id));

    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.pdf_deleted_title', 'Đã xóa báo cáo'),
      body: t('doctor_detail.pdf_deleted_body', {
        fileName: selectedPdfToDelete.fileName,
        defaultValue: `Đã xóa tệp "${selectedPdfToDelete.fileName}" khỏi danh sách và giải phóng bộ nhớ tạm. Các bản sao đã chia sẻ ra ngoài (Zalo/Drive) sẽ không bị ảnh hưởng.`,
      }),
    });
    setSelectedPdfToDelete(null);
  };

  if (!currentCase) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar
          title={t('doctor_detail.export_pdf_title', 'Xuất PDF')}
          type="stack"
          onBackPress={onBack}
        />
        <View style={[styles.centerBox, { padding: spacing.lg }]}>
          <EmptyState
            title={t('doctor_detail.case_not_found_title', 'Ca bệnh không tồn tại')}
            body={t(
              'doctor_detail.case_not_found_body',
              'Không tìm thấy dữ liệu ca bệnh cần xuất báo cáo.',
            )}
            type="noData"
            actionLabel={t('doctor_detail.case_not_found_back', 'Quay lại')}
            onActionPress={onBack}
          />
        </View>
      </View>
    );
  }

  const buildReportData = (lang: 'vi' | 'en', attachGradCam: boolean): ClinicalReportData => {
    const predictedClass: 'Benign' | 'Malignant' | 'Normal' =
      currentCase.aiLabelSummary === 'Ác tính'
        ? 'Malignant'
        : currentCase.aiLabelSummary === 'Lành tính'
          ? 'Benign'
          : 'Normal';

    const primaryImage = currentCase.images?.[0];
    const scores = primaryImage?.scores || {
      benign: predictedClass === 'Benign' ? 0.92 : 0.04,
      malignant: predictedClass === 'Malignant' ? 0.94 : 0.03,
      normal: predictedClass === 'Normal' ? 0.95 : 0.03,
    };

    return {
      caseCode: currentCase.caseCode,
      patientName: currentCase.patientName,
      patientId: currentCase.patientId,
      captureDate: currentCase.captureDate,
      doctorName: user?.fullName || 'BS. CKII Dương Hải Đăng',
      hospitalName: 'TRUNG TÂM CHẨN ĐOÁN HÌNH ẢNH & Y HỌC HẠT NHÂN',
      departmentName: 'Khoa Chẩn đoán Hình ảnh - Đơn vị Phổi & Lồng ngực',
      notes: currentCase.notes || 'Chụp CT lồng ngực liều thấp tầm soát nốt mờ nhu mô phổi.',
      conclusion:
        predictedClass === 'Malignant'
          ? 'Nghi ngờ tổn thương ác tính nhu mô phổi. Khuyến nghị chỉ định hội chẩn chuyên khoa và sinh thiết kim dưới hướng dẫn CT.'
          : predictedClass === 'Benign'
            ? 'Tổn thương lành tính hoặc vôi hóa ổn định. Khuyến nghị theo dõi định kỳ bằng CT liều thấp sau 6 tháng.'
            : 'Nhu mô phổi bình thường, không phát hiện nốt mờ bệnh lý khu trú.',
      aiPrediction: {
        predictedClass,
        confidence:
          currentCase.aiScore ||
          (primaryImage?.scores
            ? primaryImage.scores[
                primaryImage.aiClass === 'Benign'
                  ? 'benign'
                  : primaryImage.aiClass === 'Malignant'
                    ? 'malignant'
                    : 'normal'
              ]
            : 0.95),
        scores,
        latencyMs: 142,
        modelName: 'Adaptive AACNN-ViT FP32 (Edge AI On-Device)',
      },
      slices: currentCase.images?.map((img) => ({
        id: img.id,
        label: `Lát cắt CT #${img.sliceNumber}`,
        imageUri: img.uri || img.filePath,
        hasGradCam: img.hasGradCam,
        gradCamUri: img.gradcamUri || undefined,
      })),
      language: lang,
      includeGradCam: attachGradCam,
      version: pdfVersion,
    };
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const reportData = buildReportData(pdfLanguage, includeGradCam);
      const generated = await PdfReportService.exportCasePdf(reportData);

      // Lưu trữ bền vững vào kho lưu trữ mã hóa cục bộ (Chính sách 3A)
      try {
        await CaseRepository.saveExportedPdf(ownerId, currentCase.id, generated, pdfVersion);
      } catch (saveErr) {
        console.warn('[ExportPdfScreen] Lỗi lưu báo cáo PDF vào repository:', saveErr);
      }

      setExportedList((prev) => [generated, ...prev]);

      const langLabel =
        pdfLanguage === 'vi'
          ? t('doctor_detail.pdf_lang_vi', 'Tiếng Việt')
          : t('doctor_detail.pdf_lang_en', 'English');

      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.pdf_success_title', 'Xuất PDF thành công'),
        body: t('doctor_detail.pdf_success_body', {
          fileName: generated.fileName,
          lang: langLabel,
          defaultValue: `Đã biên dịch thành công tệp "${generated.fileName}" (${generated.fileSize}). Tệp đã được lưu an toàn vào bộ nhớ máy, sẵn sàng để xem hoặc chia sẻ.`,
        }),
      });
    } catch (err: any) {
      console.error('[ExportPdfScreen] Lỗi khi tạo PDF:', err);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.pdf_error_title', 'Lỗi xuất tài liệu'),
        body: err?.message || 'Không thể biên dịch tệp PDF trên thiết bị. Vui lòng thử lại.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerShare = (item: ExportedPdfItem) => {
    setSelectedPdfToShare(item);
    setShowShareConfirmDialog(true);
  };

  const handleConfirmShare = async () => {
    setShowShareConfirmDialog(false);
    if (!selectedPdfToShare) return;

    try {
      let targetUri = selectedPdfToShare.fileUri;

      // Nếu tệp chưa có URI vật lý (ví dụ bản mẫu ban đầu), biên dịch ngay lập tức
      if (!targetUri) {
        const reportData = buildReportData(selectedPdfToShare.language, selectedPdfToShare.hasGradCam);
        const compiled = await PdfReportService.exportCasePdf(reportData);
        targetUri = compiled.fileUri;
      }

      await PdfReportService.shareReportPdf(
        targetUri,
        t('doctor_detail.pdf_share_dialog_title', {
          code: currentCase.caseCode,
          defaultValue: `Chia sẻ báo cáo chẩn đoán LungCT ca ${currentCase.caseCode}`,
        }),
      );
    } catch (err: any) {
      console.error('[ExportPdfScreen] Lỗi khi mở Share Sheet:', err);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.pdf_share_error_title', 'Không thể chia sẻ'),
        body: err?.message || 'Hệ điều hành không hỗ trợ hoặc người dùng đã hủy chia sẻ.',
      });
    }
  };

  const handleDirectPrint = async (item: ExportedPdfItem) => {
    try {
      const reportData = buildReportData(item.language, item.hasGradCam);
      await PdfReportService.printDirectly(reportData);
    } catch (err: any) {
      console.error('[ExportPdfScreen] Lỗi khi in:', err);
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.pdf_print_error_title', 'Lỗi in ấn'),
        body: err?.message || 'Không thể kết nối máy in hệ thống. Vui lòng thử lại.',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
      <TopBar
        title={t('doctor_detail.export_pdf_title', 'Xuất PDF')}
        type="stack"
        onBackPress={onBack}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ cấu hình xuất PDF */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="titleS" style={{ marginBottom: spacing.xs }}>
            {t('doctor_detail.pdf_config_card_title', 'Cấu hình báo cáo')}
          </AppText>
          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={{ marginBottom: spacing.sm }}
          >
            {t('doctor_detail.pdf_config_case_desc', {
              code: currentCase.caseCode,
              name: currentCase.patientName,
              defaultValue: `Báo cáo chẩn đoán ca ${currentCase.caseCode} (${currentCase.patientName})`,
            })}
          </AppText>

          <Divider style={{ marginBottom: spacing.sm }} />

          {/* Ngôn ngữ xuất PDF (Tách biệt khỏi ngôn ngữ app) */}
          <AppText variant="labelM" style={{ marginBottom: spacing.xxs }}>
            {t('doctor_detail.pdf_lang_label', 'Ngôn ngữ tài liệu')}
          </AppText>
          <Segmented
            items={[
              { key: 'vi', label: t('doctor_detail.pdf_lang_vi', 'Tiếng Việt') },
              { key: 'en', label: t('doctor_detail.pdf_lang_en', 'English') },
            ]}
            selectedKey={pdfLanguage}
            onSelect={(val) => setPdfLanguage(val as 'vi' | 'en')}
            style={{ marginBottom: spacing.md }}
          />

          {/* Tùy chọn đính kèm Grad-CAM */}
          <View style={{ marginBottom: spacing.md }}>
            <Checkbox
              checked={includeGradCam}
              onValueChange={setIncludeGradCam}
              label={t(
                'doctor_detail.pdf_attach_gradcam',
                'Đính kèm bản đồ nhiệt Grad-CAM của từng lát cắt',
              )}
            />
          </View>

          {/* Phiên bản biểu mẫu */}
          <View style={styles.metaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.pdf_template_label', 'Phiên bản biểu mẫu')}
            </AppText>
            <AppText variant="labelM">{pdfVersion}</AppText>
          </View>

          {isGenerating ? (
            <View style={{ marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm }}>
              <ActivityIndicator size="small" color={colors.border.focus} />
              <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 4 }}>
                {t('doctor_detail.pdf_generating_hint', 'Đang biên dịch tệp PDF y tế cục bộ...')}
              </AppText>
            </View>
          ) : (
            <Button
              label={t('doctor_detail.pdf_generate_btn', 'Tạo báo cáo PDF mới')}
              variant="primary"
              size="M"
              leadingIcon="pdf-export"
              onPress={handleGeneratePdf}
              style={{ marginTop: spacing.md }}
            />
          )}
        </View>

        {/* Danh sách các bản PDF đã xuất */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleS">
            {t('doctor_detail.pdf_history_title', {
              count: exportedList.length,
              defaultValue: `Tài liệu đã tạo (${exportedList.length})`,
            })}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {t('doctor_detail.pdf_persisted_tag', 'Lưu trữ an toàn trên thiết bị')}
          </AppText>
        </View>

        {exportedList.length === 0 ? (
          <View
            style={[
              styles.pdfItemCard,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
              },
            ]}
          >
            <AppText variant="caption" color={colors.text.secondary}>
              {t(
                'doctor_detail.pdf_empty_history',
                'Chưa có bản báo cáo nào được tạo cho ca này. Hãy bấm "Tạo báo cáo PDF mới" ở trên.',
              )}
            </AppText>
          </View>
        ) : (
          exportedList.map((item) => (
            <View
              key={item.id}
              style={[
                styles.pdfItemCard,
                {
                  backgroundColor: colors.bg.surface,
                  borderColor: colors.border.default,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppText variant="labelL" style={{ color: colors.text.primary }}>
                  {item.fileName}
                </AppText>
                <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                  {item.createdAt} · {item.fileSize} ·{' '}
                  {item.language === 'vi'
                    ? t('doctor_detail.pdf_lang_vi', 'Tiếng Việt')
                    : t('doctor_detail.pdf_lang_en', 'English')}
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                <Button
                  label={t('doctor_detail.pdf_print_btn', 'In')}
                  variant="tertiary"
                  size="M"
                  leadingIcon="download"
                  onPress={() => handleDirectPrint(item)}
                />
                <Button
                  label={t('doctor_detail.pdf_share_btn', 'Chia sẻ')}
                  variant="secondary"
                  size="M"
                  leadingIcon="share"
                  onPress={() => handleTriggerShare(item)}
                />
                <IconButton
                  name="trash"
                  accessibilityLabel={t('common.delete', 'Xóa')}
                  variant="tonal"
                  iconSize={20}
                  onPress={() => handleRequestDelete(item)}
                />
              </View>
            </View>
          ))
        )}

        {/* Khung lưu ý dữ liệu nhạy cảm */}
        <View
          style={[
            styles.privacyNoteBox,
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
            {t('doctor_detail.pdf_phi_warning_title', 'Tuân thủ bảo mật dữ liệu y tế (PHI)')}
          </AppText>
          <AppText variant="caption" color={colors.text.primary}>
            {t(
              'doctor_detail.pdf_phi_warning_body',
              'Tài liệu PDF chứa thông tin định danh và hình ảnh chẩn đoán của bệnh nhân. Chỉ chia sẻ với các nhân viên y tế có thẩm quyền qua các kênh trao đổi an toàn.',
            )}
          </AppText>
        </View>
      </ScrollView>

      {/* Dialog xác nhận chia sẻ dữ liệu nhạy cảm */}
      <Dialog
        visible={showShareConfirmDialog}
        type="destructive"
        title={t('doctor_detail.pdf_share_confirm_title', 'Chia sẻ dữ liệu nhạy cảm?')}
        body={t('doctor_detail.pdf_share_confirm_body', {
          file: selectedPdfToShare?.fileName || '',
          name: currentCase.patientName,
          defaultValue: `Tệp "${selectedPdfToShare?.fileName}" chứa thông tin chẩn đoán lâm sàng của bệnh nhân ${currentCase.patientName}. Bạn có chắc chắn muốn chia sẻ tệp này không?`,
        })}
        confirmLabel={t('doctor_detail.pdf_share_confirm_proceed', 'Tiếp tục chia sẻ')}
        cancelLabel={t('doctor_detail.pdf_share_confirm_cancel', 'Hủy')}
        onConfirm={handleConfirmShare}
        onCancel={() => setShowShareConfirmDialog(false)}
      />

      {/* Dialog xác nhận xóa tệp PDF đã xuất */}
      <Dialog
        visible={showDeleteConfirmDialog}
        type="destructive"
        title={t('doctor_detail.pdf_delete_confirm_title', 'Xóa tệp PDF báo cáo?')}
        body={t('doctor_detail.pdf_delete_confirm_body', {
          fileName: selectedPdfToDelete?.fileName || '',
          defaultValue: `Bạn có chắc chắn muốn xóa tệp "${selectedPdfToDelete?.fileName}"? Thao tác này sẽ xóa tệp nhị phân trong bộ nhớ ứng dụng và lịch sử xuất PDF của ca bệnh.`,
        })}
        confirmLabel={t('doctor_detail.pdf_delete_confirm_proceed', 'Xóa tệp')}
        cancelLabel={t('doctor_detail.pdf_delete_confirm_cancel', 'Hủy')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirmDialog(false);
          setSelectedPdfToDelete(null);
        }}
      />

      {/* Dialog thông báo kết quả */}
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
  card: {
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pdfItemCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyNoteBox: {
    borderWidth: 1,
  },
});
