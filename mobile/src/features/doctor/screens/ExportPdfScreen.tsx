import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  Button,
  Checkbox,
  Dialog,
  Divider,
  EmptyState,
  Segmented,
  TopBar,
} from '../../../ui/components';
import { findCaseById, type MockCase } from '../../../mocks';

export interface ExportPdfScreenProps {
  caseId: string;
  onBack: () => void;
}

interface ExportedPdfItem {
  id: string;
  fileName: string;
  createdAt: string;
  fileSize: string;
  language: 'vi' | 'en';
  hasGradCam: boolean;
}

/**
 * SCR-D01 (17-export-pdf): Màn hình Cấu hình và Xuất báo cáo PDF.
 * - Tùy chọn cấu hình:
 *   + Ngôn ngữ báo cáo: Tiếng Việt (vi) / English (en) - tách biệt hoàn toàn khỏi ngôn ngữ giao diện app.
 *   + Tùy chọn đính kèm: [x] Kèm hình ảnh bản đồ nhiệt Grad-CAM.
 *   + Phiên bản báo cáo: V1.0 (Tiêu chuẩn lâm sàng).
 * - Danh sách lịch sử các file PDF đã tạo trong ca bệnh này.
 * - Thao tác "Chia sẻ báo cáo":
 *   + RÀNG BUỘC AN TOÀN: Bắt buộc mở Dialog cảnh báo "Chia sẻ dữ liệu y tế nhạy cảm?" trước khi kích hoạt.
 *   + Sau khi xác nhận: Thông báo rõ ràng tính năng tạo PDF thật và bảng chia sẻ hệ thống đang chờ tích hợp (`TODO(PDF-01)`), không tự nhận thành công giả.
 */
export const ExportPdfScreen: React.FC<ExportPdfScreenProps> = ({ caseId, onBack }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  const currentCase: MockCase | undefined = useMemo(() => findCaseById(caseId), [caseId]);

  // Ngôn ngữ của tài liệu PDF tạo ra (riêng biệt khỏi giao diện hệ thống)
  const [pdfLanguage, setPdfLanguage] = useState<'vi' | 'en'>('vi');
  const [includeGradCam, setIncludeGradCam] = useState<boolean>(true);
  const [pdfVersion] = useState<string>('V1.0 - Tiêu chuẩn');

  // Danh sách PDF mô phỏng có sẵn của ca bệnh
  const [exportedList] = useState<ExportedPdfItem[]>([
    {
      id: 'pdf-01',
      fileName: `BaoCao_CT_${currentCase?.caseCode || 'CA'}_vi.pdf`,
      createdAt: `${currentCase?.captureDate || '20/10/2026'} 11:30`,
      fileSize: '2.4 MB',
      language: 'vi',
      hasGradCam: true,
    },
  ]);

  const [showShareConfirmDialog, setShowShareConfirmDialog] = useState(false);
  const [selectedPdfToShare, setSelectedPdfToShare] = useState<ExportedPdfItem | null>(null);

  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({ visible: false, title: '', body: '' });

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

  const handleGeneratePdf = () => {
    // Thông báo trung thực chưa tạo file PDF thật
    const langLabel =
      pdfLanguage === 'vi'
        ? t('doctor_detail.pdf_lang_vi', 'Tiếng Việt')
        : t('doctor_detail.pdf_lang_en', 'English');
    const camLabel = includeGradCam
      ? t('doctor_detail.common_yes', 'Có')
      : t('doctor_detail.common_no', 'Không');

    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.pdf_notice_title', 'Tạo tài liệu PDF (PDF-01)'),
      body: t('doctor_detail.pdf_notice_body', {
        lang: langLabel,
        cam: camLabel,
        defaultValue: `[Chế độ mô phỏng] Chức năng biên dịch file PDF vật lý theo mẫu chẩn đoán hình ảnh sẽ được tích hợp ở gói PDF-01. Cấu hình đã chọn: Ngôn ngữ ${langLabel}, Kèm Grad-CAM: ${camLabel}.`,
      }),
    });
  };

  const handleTriggerShare = (item: ExportedPdfItem) => {
    setSelectedPdfToShare(item);
    setShowShareConfirmDialog(true);
  };

  const handleConfirmShare = () => {
    setShowShareConfirmDialog(false);
    // Minh bạch không báo chia sẻ thành công giả
    setNoticeDialog({
      visible: true,
      title: t('doctor_detail.pdf_share_implemented_notice_title', 'Chia sẻ tài liệu'),
      body: t(
        'doctor_detail.pdf_share_implemented_notice_body',
        '[Chế độ mô phỏng] Tính năng gọi trình chia sẻ của hệ thống (Android Share Sheet) với tệp PDF vật lý sẽ kết nối ở gói PDF-01.',
      ),
    });
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

          <Button
            label={t('doctor_detail.pdf_generate_btn', 'Tạo báo cáo PDF mới')}
            variant="primary"
            size="M"
            leadingIcon="pdf-export"
            onPress={handleGeneratePdf}
            style={{ marginTop: spacing.md }}
          />
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
            {t('doctor_detail.pdf_session_tag', 'Lưu trong phiên mô phỏng')}
          </AppText>
        </View>

        {exportedList.map((item) => (
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
            <Button
              label={t('doctor_detail.pdf_share_btn', 'Chia sẻ')}
              variant="tertiary"
              size="M"
              leadingIcon="share"
              onPress={() => handleTriggerShare(item)}
            />
          </View>
        ))}

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

      {/* Dialog thông báo tính năng */}
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
