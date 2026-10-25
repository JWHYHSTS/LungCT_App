import React from 'react';
import type { SvgProps } from 'react-native-svg';
import { useTheme } from '../theme';

// Import tĩnh toàn bộ 64 SVG icons theo manifest.json
import AccountApprovalSvg from '../../../assets/icons/account-approval.svg';
import AiAnalysisSvg from '../../../assets/icons/ai-analysis.svg';
import BackSvg from '../../../assets/icons/back.svg';
import CalendarSvg from '../../../assets/icons/calendar.svg';
import CameraSvg from '../../../assets/icons/camera.svg';
import CancelSvg from '../../../assets/icons/cancel.svg';
import CaseAddSvg from '../../../assets/icons/case-add.svg';
import CaseCompleteSvg from '../../../assets/icons/case-complete.svg';
import CasesSvg from '../../../assets/icons/cases.svg';
import ChevronRightSvg from '../../../assets/icons/chevron-right.svg';
import CloseSvg from '../../../assets/icons/close.svg';
import ConflictSvg from '../../../assets/icons/conflict.svg';
import CtImageSvg from '../../../assets/icons/ct-image.svg';
import CtStackSvg from '../../../assets/icons/ct-stack.svg';
import DownloadSvg from '../../../assets/icons/download.svg';
import DraftSvg from '../../../assets/icons/draft.svg';
import EditSvg from '../../../assets/icons/edit.svg';
import ErrorSvg from '../../../assets/icons/error.svg';
import EyeOffSvg from '../../../assets/icons/eye-off.svg';
import EyeSvg from '../../../assets/icons/eye.svg';
import FilterSvg from '../../../assets/icons/filter.svg';
import GradCamSvg from '../../../assets/icons/grad-cam.svg';
import HomeSvg from '../../../assets/icons/home.svg';
import ImageCompareSvg from '../../../assets/icons/image-compare.svg';
import ImageReplaceSvg from '../../../assets/icons/image-replace.svg';
import ImageUploadSvg from '../../../assets/icons/image-upload.svg';
import InfoSvg from '../../../assets/icons/info.svg';
import LanguageSvg from '../../../assets/icons/language.svg';
import LockSvg from '../../../assets/icons/lock.svg';
import LogoutSvg from '../../../assets/icons/logout.svg';
import LungSvg from '../../../assets/icons/lung.svg';
import MedicalNotesSvg from '../../../assets/icons/medical-notes.svg';
import MoreSvg from '../../../assets/icons/more.svg';
import NotificationsSvg from '../../../assets/icons/notifications.svg';
import OfflineSvg from '../../../assets/icons/offline.svg';
import OnDeviceSvg from '../../../assets/icons/on-device.svg';
import OpacitySvg from '../../../assets/icons/opacity.svg';
import PartialSvg from '../../../assets/icons/partial.svg';
import PatientAddSvg from '../../../assets/icons/patient-add.svg';
import PatientsSvg from '../../../assets/icons/patients.svg';
import PdfExportSvg from '../../../assets/icons/pdf-export.svg';
import PendingSvg from '../../../assets/icons/pending.svg';
import PrivacySvg from '../../../assets/icons/privacy.svg';
import ProcessingSvg from '../../../assets/icons/processing.svg';
import ProfileSvg from '../../../assets/icons/profile.svg';
import ResetViewSvg from '../../../assets/icons/reset-view.svg';
import RestoreSvg from '../../../assets/icons/restore.svg';
import RetrySvg from '../../../assets/icons/retry.svg';
import SaveSvg from '../../../assets/icons/save.svg';
import SearchSvg from '../../../assets/icons/search.svg';
import ServerAnalysisSvg from '../../../assets/icons/server-analysis.svg';
import SettingsSvg from '../../../assets/icons/settings.svg';
import ShareSvg from '../../../assets/icons/share.svg';
import SortSvg from '../../../assets/icons/sort.svg';
import StatisticsSvg from '../../../assets/icons/statistics.svg';
import SuccessSvg from '../../../assets/icons/success.svg';
import SyncErrorSvg from '../../../assets/icons/sync-error.svg';
import SyncSvg from '../../../assets/icons/sync.svg';
import ThemeSvg from '../../../assets/icons/theme.svg';
import TrashSvg from '../../../assets/icons/trash.svg';
import UnlockSvg from '../../../assets/icons/unlock.svg';
import WarningSvg from '../../../assets/icons/warning.svg';
import ZoomInSvg from '../../../assets/icons/zoom-in.svg';
import ZoomOutSvg from '../../../assets/icons/zoom-out.svg';

/**
 * Bảng tra cứu toàn bộ 64 component SVG của hệ thống LungCT
 */
export const ICON_MAP: Record<string, React.FC<SvgProps>> = {
  'account-approval': AccountApprovalSvg,
  'ai-analysis': AiAnalysisSvg,
  back: BackSvg,
  calendar: CalendarSvg,
  camera: CameraSvg,
  cancel: CancelSvg,
  'case-add': CaseAddSvg,
  'case-complete': CaseCompleteSvg,
  cases: CasesSvg,
  'chevron-right': ChevronRightSvg,
  close: CloseSvg,
  conflict: ConflictSvg,
  'ct-image': CtImageSvg,
  'ct-stack': CtStackSvg,
  download: DownloadSvg,
  draft: DraftSvg,
  edit: EditSvg,
  error: ErrorSvg,
  eye: EyeSvg,
  'eye-off': EyeOffSvg,
  filter: FilterSvg,
  'grad-cam': GradCamSvg,
  home: HomeSvg,
  'image-compare': ImageCompareSvg,
  'image-replace': ImageReplaceSvg,
  'image-upload': ImageUploadSvg,
  info: InfoSvg,
  language: LanguageSvg,
  lock: LockSvg,
  logout: LogoutSvg,
  lung: LungSvg,
  'medical-notes': MedicalNotesSvg,
  more: MoreSvg,
  notifications: NotificationsSvg,
  offline: OfflineSvg,
  'on-device': OnDeviceSvg,
  opacity: OpacitySvg,
  partial: PartialSvg,
  'patient-add': PatientAddSvg,
  patients: PatientsSvg,
  'pdf-export': PdfExportSvg,
  pending: PendingSvg,
  privacy: PrivacySvg,
  processing: ProcessingSvg,
  profile: ProfileSvg,
  'reset-view': ResetViewSvg,
  restore: RestoreSvg,
  retry: RetrySvg,
  save: SaveSvg,
  search: SearchSvg,
  'server-analysis': ServerAnalysisSvg,
  settings: SettingsSvg,
  share: ShareSvg,
  sort: SortSvg,
  statistics: StatisticsSvg,
  success: SuccessSvg,
  sync: SyncSvg,
  'sync-error': SyncErrorSvg,
  theme: ThemeSvg,
  trash: TrashSvg,
  unlock: UnlockSvg,
  warning: WarningSvg,
  'zoom-in': ZoomInSvg,
  'zoom-out': ZoomOutSvg,
};

/**
 * Kiểu định danh cho 64 icon hệ thống khớp chính xác manifest.json
 */
export type IconName =
  | 'account-approval'
  | 'ai-analysis'
  | 'back'
  | 'calendar'
  | 'camera'
  | 'cancel'
  | 'case-add'
  | 'case-complete'
  | 'cases'
  | 'chevron-right'
  | 'close'
  | 'conflict'
  | 'ct-image'
  | 'ct-stack'
  | 'download'
  | 'draft'
  | 'edit'
  | 'error'
  | 'eye'
  | 'eye-off'
  | 'filter'
  | 'grad-cam'
  | 'home'
  | 'image-compare'
  | 'image-replace'
  | 'image-upload'
  | 'info'
  | 'language'
  | 'lock'
  | 'logout'
  | 'lung'
  | 'medical-notes'
  | 'more'
  | 'notifications'
  | 'offline'
  | 'on-device'
  | 'opacity'
  | 'partial'
  | 'patient-add'
  | 'patients'
  | 'pdf-export'
  | 'pending'
  | 'privacy'
  | 'processing'
  | 'profile'
  | 'reset-view'
  | 'restore'
  | 'retry'
  | 'save'
  | 'search'
  | 'server-analysis'
  | 'settings'
  | 'share'
  | 'sort'
  | 'statistics'
  | 'success'
  | 'sync'
  | 'sync-error'
  | 'theme'
  | 'trash'
  | 'unlock'
  | 'warning'
  | 'zoom-in'
  | 'zoom-out';

export interface IconProps {
  /** Tên icon chuẩn theo manifest 64 icon */
  name: IconName;
  /** Kích thước vuông (mặc định: 24) */
  size?: number;
  /** Màu nét viền (mặc định lấy theo colors.border.icon từ ThemeContext) */
  color?: string;
}

/**
 * Thành phần Icon vector chuẩn hóa của đồ án LungCT.
 *
 * Tự động đồng bộ màu viền theo Theme Sáng/Tối qua `colors.border.icon`
 * và giữ nguyên màu pastel y tế của các mảng tô nội bộ.
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, color }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const SvgComponent = ICON_MAP[name];

  if (!SvgComponent) {
    // TODO(UI-02): Báo lỗi phát triển nếu tên icon không tồn tại trong manifest
    return null;
  }

  const strokeColor = color ?? colors.border.icon;

  return <SvgComponent width={size} height={size} color={strokeColor} stroke={strokeColor} />;
};
