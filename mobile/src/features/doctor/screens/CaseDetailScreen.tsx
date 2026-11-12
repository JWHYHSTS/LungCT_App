import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import {
  AppText,
  BottomSheet,
  Button,
  Dialog,
  Divider,
  EmptyState,
  IconButton,
  ImageTile,
  StatusBadge,
  TextField,
  TopBar,
} from '../../../ui/components';
import { findCaseById, subscribeDoctorStore, addImageToCase, type MockCase } from '../../../mocks';
import { CaseRepository, subscribeCaseRepository } from '../../../services/storage';
import { useAuth } from '../../../features/auth';
import { pickImageFromDevice, takePhotoWithCamera } from '../../../services/ai/onDevicePipeline';
import { SyncCenterModal } from '../components/SyncCenterModal';

export interface CaseDetailScreenProps {
  caseId: string;
  onBack: () => void;
  onNavigateToImageResult: (caseId: string, imageIndex: number) => void;
  onNavigateToExportPdf: (caseId: string) => void;
}

/**
 * SCR-C02 (15-case-detail): Màn hình Chi tiết ca / Biên tập nháp (Trung tâm xử lý ca).
 * - Đa ngôn ngữ qua useTranslation('doctor_detail').
 * - Đầu ca: Mã ca, Bệnh nhân, Ngày chụp, Trạng thái ca (DRAFT, COMPLETED, PARTIAL).
 * - Thêm ảnh: Mở BottomSheet chọn nguồn (Thư viện / Camera) -> Thêm ảnh giả lập.
 * - Lưới ảnh: Hiển thị các lát cắt qua component ImageTile (tách rõ pass/passNoCam/fail/mock).
 * - Nhận xét: Tự lưu với nhãn "Đã lưu lúc hh:mm", lưu có mã hóa vào kho lưu trữ cục bộ.
 * - Xuất PDF: Điều hướng tới SCR-D01.
 * - Hoàn tất ca: Bị DISABLED kèm lý do rõ ràng khi 0 ảnh hoặc có ảnh RUNNING (BR-CASE-01).
 *   Khi bấm hoàn tất -> Mở Modal xác nhận tổng kết trạng thái từng ảnh (SCR-C05 / MSG-12).
 */
export const CaseDetailScreen: React.FC<CaseDetailScreenProps> = ({
  caseId,
  onBack,
  onNavigateToImageResult,
  onNavigateToExportPdf,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user, isOnline } = useAuth();
  const ownerId = user?.id || '';

  const [currentCase, setCurrentCase] = useState<MockCase | undefined>(() => findCaseById(caseId));
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [notesText, setNotesText] = useState(currentCase?.notes ?? '');
  const [notesSaveStatus, setNotesSaveStatus] = useState<string>(
    currentCase?.notesSavedAt
      ? t('doctor_detail.case_notes_saved_prefix', { time: currentCase.notesSavedAt })
      : '',
  );

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadFromStorage = async () => {
      try {
        const stored = await CaseRepository.getCaseById(ownerId, caseId);
        if (isMounted && stored) {
          setCurrentCase(stored);
          if (stored.notes !== undefined) {
            setNotesText(stored.notes);
            if (stored.notesSavedAt) {
              setNotesSaveStatus(
                t('doctor_detail.case_notes_saved_prefix', { time: stored.notesSavedAt }),
              );
            }
          }
        }
      } catch (err) {
        console.warn('[CaseDetailScreen] Lỗi nạp ca bệnh từ kho mã hóa:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFromStorage();

    const unsubRepo = subscribeCaseRepository(() => {
      loadFromStorage();
    });
    const unsubMock = subscribeDoctorStore(() => {
      const updated = findCaseById(caseId);
      if (isMounted && updated) {
        setCurrentCase(updated);
        if (updated.notes !== undefined) {
          setNotesText(updated.notes);
          if (updated.notesSavedAt) {
            setNotesSaveStatus(
              t('doctor_detail.case_notes_saved_prefix', { time: updated.notesSavedAt }),
            );
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubRepo();
      unsubMock();
    };
  }, [caseId, ownerId, t]);

  const [showAddImageSheet, setShowAddImageSheet] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);
  const [showMenuOptionsDialog, setShowMenuOptionsDialog] = useState(false);
  const [showTrashConfirmDialog, setShowTrashConfirmDialog] = useState(false);

  const [noticeDialog, setNoticeDialog] = useState<{
    visible: boolean;
    title: string;
    body: string;
    onClose?: () => void;
  }>({ visible: false, title: '', body: '' });

  // Đang tải dữ liệu từ kho lưu trữ
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar title={t('doctor_detail.case_detail_title')} type="stack" onBackPress={onBack} />
      </View>
    );
  }

  // Xử lý khi không tìm thấy ca bệnh sau khi nạp xong
  if (!currentCase) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.app }]}>
        <TopBar title={t('doctor_detail.case_not_found_title')} type="stack" onBackPress={onBack} />
        <View style={[styles.centerBox, { padding: spacing.lg }]}>
          <EmptyState
            title={t('doctor_detail.case_not_found_title')}
            body={t('doctor_detail.case_not_found_body')}
            type="noData"
            actionLabel={t('doctor_detail.case_not_found_back')}
            onActionPress={onBack}
          />
        </View>
      </View>
    );
  }

  // Điều kiện hoàn tất ca (BR-CASE-01)
  const isImageEmpty = currentCase.images.length === 0;
  const isRunning = currentCase.images.some((img) => img.status === 'running');
  const canComplete = !isImageEmpty && !isRunning && currentCase.status === 'DRAFT';

  const completeDisabledReason = isImageEmpty
    ? t('doctor_detail.case_complete_disabled_reason')
    : isRunning
      ? 'Đang phân tích — chờ xong hoặc hủy trước khi hoàn tất.'
      : currentCase.status !== 'DRAFT'
        ? 'Ca bệnh đã được hoàn tất trước đó.'
        : undefined;

  // Xử lý lưu nhận xét và mã hóa xuống kho lưu trữ
  const handleSaveNotes = async () => {
    await CaseRepository.updateCaseNotes(ownerId, currentCase.id, notesText);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNotesSaveStatus(t('doctor_detail.case_notes_saved_prefix', { time: timeStr }));
  };

  // Thêm ảnh từ Thư viện / Camera
  const handleSelectImageSource = async (source: 'gallery' | 'camera') => {
    setShowAddImageSheet(false);
    try {
      const picked =
        source === 'camera' ? await takePhotoWithCamera() : await pickImageFromDevice();

      if (picked.canceled || !picked.uri) {
        return;
      }

      // Đính kèm ảnh thực tế vào kho lưu trữ mã hóa SQLite
      let savedEntity: any = null;
      try {
        savedEntity = await CaseRepository.attachCTImage(ownerId, currentCase.id, {
          source: source === 'camera' ? 'CAMERA' : 'LIBRARY',
          mimeType: 'image/jpeg',
          localFileRef: picked.filePath || picked.uri,
          originalFileName: picked.name,
          byteSize: picked.size ? Math.round(picked.size) : undefined,
        });
      } catch (attachErr) {
        console.warn('[CaseDetailScreen] Lỗi đính kèm ảnh vào repository:', attachErr);
      }

      const added = addImageToCase(currentCase.id, source, 'pending', {
        uri: picked.uri,
        filePath: picked.filePath,
        originalFileName: picked.name,
      });

      // Nạp lại trực tiếp từ SQLite để cập nhật ngay danh sách ảnh lát cắt trên UI
      try {
        const refreshed = await CaseRepository.getCaseById(ownerId, currentCase.id);
        if (refreshed) {
          setCurrentCase(refreshed);
        }
      } catch (e) {
        console.warn('[CaseDetailScreen] Lỗi tải lại ca sau khi thêm ảnh:', e);
      }

      if (added || savedEntity) {
        setNoticeDialog({
          visible: true,
          title:
            source === 'camera'
              ? t('doctor_detail.case_photo_taken_title', 'Đã chụp ảnh CT thành công')
              : t('doctor_detail.case_file_loaded_title', 'Đã nạp tệp ảnh thực tế'),
          body: t('doctor_detail.case_image_loaded_body', {
            name: picked.name ?? 'CT_Slice.jpg',
            defaultValue: `Đã nạp tệp: ${picked.name ?? 'CT_Slice.jpg'}.\nẢnh đã được lưu an toàn trong thư mục ứng dụng và sẵn sàng để phân tích On-Device AI.`,
          }),
        });
      }
      return;
    } catch (err: any) {
      console.warn(
        `[CaseDetailScreen] Lỗi ${source === 'camera' ? 'máy ảnh' : 'chọn ảnh'}:`,
        err,
      );
      // Fallback chế độ mô phỏng nếu không chạy được native
      const added = addImageToCase(currentCase.id, source, 'mock');
      if (added) {
        setNoticeDialog({
          visible: true,
          title: t('doctor_detail.case_simulated_image_title', 'Đã thêm ảnh cắt lớp'),
          body: t('doctor_detail.case_simulated_image_body', {
            slice: added.sliceNumber,
            defaultValue: `[Mô phỏng] Đã nạp thành công ảnh lát cắt #${added.sliceNumber}. Dữ liệu đã lưu tạm trong phiên mô phỏng.`,
          }),
        });
      }
    }
  };

  // Hoàn tất ca bệnh
  const handleConfirmComplete = async () => {
    setShowCompleteConfirmModal(false);
    const res = await CaseRepository.completeCase(ownerId, currentCase.id);
    if (res.success) {
      try {
        const refreshed = await CaseRepository.getCaseById(ownerId, currentCase.id);
        if (refreshed) {
          setCurrentCase(refreshed);
        }
      } catch (e) {
        console.warn('[CaseDetailScreen] Lỗi nạp lại ca sau hoàn tất:', e);
      }
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.case_completed_success_title', 'Hoàn tất ca bệnh thành công'),
        body: t('doctor_detail.case_completed_success_body', {
          code: currentCase.caseCode,
          defaultValue: `Ca bệnh ${currentCase.caseCode} đã được hoàn tất và lưu trữ an toàn trong kho mã hóa.`,
        }),
      });
    } else {
      setNoticeDialog({
        visible: true,
        title: t('doctor_detail.case_completed_fail_title', 'Không thể hoàn tất ca'),
        body: res.reason ?? t('doctor_detail.case_completed_unknown_error', 'Lỗi không xác định.'),
      });
    }
  };

  // Chuyển ca vào thùng rác
  const handleTrashCase = async () => {
    setShowTrashConfirmDialog(false);
    await CaseRepository.trashCase(ownerId, currentCase.id);
    setNoticeDialog({
      visible: true,
      title: t('label.thung_rac'),
      body: t('doctor_detail.case_delete_confirm_body', { code: currentCase.caseCode }),
      onClose: () => {
        setNoticeDialog({ visible: false, title: '', body: '' });
        onBack();
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bg.app }]}
    >
      <TopBar
        title={t('doctor_detail.case_detail_title')}
        type="stack"
        onBackPress={onBack}
        rightActions={
          <View style={styles.topBarActions}>
            <IconButton
              name="sync"
              accessibilityLabel="Đồng bộ ca"
              onPress={() => setShowSyncModal(true)}
            />
            <IconButton
              name="more"
              accessibilityLabel={t('doctor_detail.case_menu_title')}
              onPress={() => setShowMenuOptionsDialog(true)}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ thông tin đầu ca */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.default,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="titleM" style={{ color: colors.text.primary }}>
                {currentCase.caseCode}
              </AppText>
              <AppText variant="bodyM" style={{ color: colors.text.link, marginTop: 2 }}>
                {currentCase.patientName} ({currentCase.patientCode})
              </AppText>
            </View>
            <StatusBadge
              label={
                currentCase.status === 'DRAFT'
                  ? t('label.nhap')
                  : currentCase.status === 'COMPLETED'
                    ? t('label.hoan_tat')
                    : t('label.ket_qua_mot_phan')
              }
              tone={
                currentCase.status === 'COMPLETED'
                  ? 'success'
                  : currentCase.status === 'PARTIAL'
                    ? 'warning'
                    : 'neutral'
              }
            />
          </View>

          <Divider style={{ marginVertical: spacing.sm }} />

          <View style={styles.cardMetaRow}>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.case_capture_date', { date: currentCase.captureDate })}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('doctor_detail.case_total_images', { count: currentCase.images.length })}
            </AppText>
          </View>
        </View>

        {/* Nút tác vụ chính */}
        <View style={styles.actionButtonsRow}>
          <Button
            label={t('doctor_detail.case_add_image_btn')}
            variant="secondary"
            size="M"
            onPress={() => setShowAddImageSheet(true)}
            style={{ flex: 1, marginRight: spacing.xs }}
          />
          <Button
            label={t('doctor_detail.case_export_pdf_btn')}
            variant="tertiary"
            size="M"
            leadingIcon="pdf-export"
            onPress={() => onNavigateToExportPdf(currentCase.id)}
            style={{ flex: 1, marginLeft: spacing.xs }}
          />
        </View>

        {/* Danh sách ảnh lát cắt */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <AppText variant="titleS" style={{ flexShrink: 0 }}>
            {t('doctor_detail.case_grid_title', { count: currentCase.images.length })}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary} style={{ flex: 1, textAlign: 'right' }}>
            {t('doctor_detail.case_grid_hint')}
          </AppText>
        </View>

        {currentCase.images.length === 0 ? (
          <View
            style={[
              styles.emptyImagesBox,
              {
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                borderRadius: radius.md,
                padding: spacing.xl,
              },
            ]}
          >
            <AppText variant="titleS" style={{ color: colors.text.primary, marginBottom: 4 }}>
              {t('doctor_detail.case_empty_images_title')}
            </AppText>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={{ textAlign: 'center' }}
            >
              {t('doctor_detail.case_empty_images_body')}
            </AppText>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {currentCase.images.map((img, idx) => (
              <View key={img.id} style={styles.gridItem}>
                <ImageTile
                  index={idx + 1}
                  status={img.status}
                  aiClass={img.aiClass}
                  thumbnail={img.uri ? { uri: img.uri } : undefined}
                  onPress={() => onNavigateToImageResult(currentCase.id, idx + 1)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Nhận xét của Bác sĩ */}
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <AppText variant="titleS" style={{ flexShrink: 0 }}>{t('doctor_detail.case_notes_section_title')}</AppText>
          <AppText variant="caption" style={{ color: colors.text.link, flex: 1, textAlign: 'right' }}>
            {notesSaveStatus}
          </AppText>
        </View>

        <TextField
          label=""
          value={notesText}
          onChangeText={setNotesText}
          placeholder={t('doctor_detail.case_notes_placeholder')}
          multiline
          numberOfLines={4}
          helper={t('doctor_detail.case_notes_helper')}
          style={{ marginBottom: spacing.sm }}
        />

        <Button
          label={t('doctor_detail.case_save_notes_btn')}
          variant="tertiary"
          size="M"
          onPress={handleSaveNotes}
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg }}
        />

        {/* Nút Hoàn tất ca bệnh */}
        <View style={{ marginBottom: spacing.xl }}>
          <Button
            label={t('doctor_detail.case_complete_btn')}
            variant="primary"
            size="L"
            disabled={!canComplete}
            onPress={() => setShowCompleteConfirmModal(true)}
          />
          {completeDisabledReason ? (
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={{ marginTop: spacing.xxs, textAlign: 'center' }}
            >
              {completeDisabledReason}
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      {/* BottomSheet nạp ảnh CT */}
      <BottomSheet
        visible={showAddImageSheet}
        title={t('doctor_detail.case_source_picker_title')}
        onClose={() => setShowAddImageSheet(false)}
      >
        <View style={styles.bottomSheetActions}>
          <Button
            label={t('doctor_detail.case_source_gallery')}
            variant="secondary"
            leadingIcon="image-upload"
            onPress={() => handleSelectImageSource('gallery')}
          />
          <Button
            label={t('doctor_detail.case_source_camera')}
            variant="secondary"
            leadingIcon="camera"
            onPress={() => handleSelectImageSource('camera')}
          />
        </View>
      </BottomSheet>

      {/* Modal tổng kết hoàn tất ca (SCR-C05 / MSG-12) */}
      <Dialog
        visible={showCompleteConfirmModal}
        type="default"
        title={t('doctor_detail.case_complete_confirm_title')}
        body={t('doctor_detail.case_complete_confirm_body', {
          code: currentCase.caseCode,
          count: currentCase.images.length,
        })}
        confirmLabel={t('doctor_detail.case_complete_confirm_btn')}
        cancelLabel={t('doctor_detail.case_complete_confirm_cancel')}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteConfirmModal(false)}
      />

      {/* Menu tùy chọn ... */}
      <Dialog
        visible={showMenuOptionsDialog}
        type="default"
        title={t('doctor_detail.case_menu_title')}
        body={t('doctor_detail.case_menu_body')}
        confirmLabel={t('doctor_detail.case_menu_delete')}
        cancelLabel={t('doctor_detail.common_dialog_cancel')}
        onConfirm={() => {
          setShowMenuOptionsDialog(false);
          setShowTrashConfirmDialog(true);
        }}
        onCancel={() => setShowMenuOptionsDialog(false)}
      />

      {/* Dialog xác nhận chuyển thùng rác */}
      <Dialog
        visible={showTrashConfirmDialog}
        type="destructive"
        title={t('doctor_detail.case_delete_confirm_title')}
        body={t('doctor_detail.case_delete_confirm_body', { code: currentCase.caseCode })}
        confirmLabel={t('label.thung_rac')}
        cancelLabel={t('doctor_detail.common_dialog_cancel')}
        onConfirm={handleTrashCase}
        onCancel={() => setShowTrashConfirmDialog(false)}
      />

      {/* Thông báo kết quả */}
      <Dialog
        visible={noticeDialog.visible}
        type="default"
        title={noticeDialog.title}
        body={noticeDialog.body}
        confirmLabel={t('doctor_detail.common_dialog_close')}
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

      <SyncCenterModal
        visible={showSyncModal}
        ownerId={ownerId}
        isOnline={isOnline}
        onClose={() => setShowSyncModal(false)}
      />
    </KeyboardAvoidingView>
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
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCard: {
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonsRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  emptyImagesBox: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetActions: {
    gap: 12,
    paddingVertical: 8,
  },
});
