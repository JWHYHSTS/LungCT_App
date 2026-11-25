/**
 * ĐỊNH NGHĨA CÁC THỰC THỂ DỮ LIỆU CỐT LÕI (CORE DATA MODELS)
 * DỰ ÁN KHÓA LUẬN LUNGCT - BÁM SÁT BẢNG 101-106 ĐẶC TẢ CHỨC NĂNG
 *
 * Lưu ý bảo mật y tế:
 * - Mọi thực thể nghiệp vụ (Patient, Case) đều bắt buộc có `ownerId` (= accountId của bác sĩ phụ trách).
 * - Không lưu plaintext mật khẩu hoặc thông tin định danh chưa mã hóa ngoài vùng quản lý an toàn.
 */

export type UserRole = 'DOCTOR' | 'ADMIN';
export type AccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'LOCKED';

export interface AccountEntity {
  accountId: string;
  role: UserRole;
  fullName: string;
  email: string;
  workplace?: string;
  specialty?: string;
  status: AccountStatus;
  registeredAt: string; // ISO 8601
  approvedAt?: string;
  lockedAt?: string;
  lockReason?: string;
  lastStatusCheckAt?: string;
}

export type SexType = 'MALE' | 'FEMALE' | 'OTHER';
export type EntityLifecycleStatus = 'ACTIVE' | 'TRASHED';
export type SyncState = 'synced' | 'pending' | 'conflict';

export interface PatientEntity {
  patientId: string; // UUID sinh trên thiết bị
  ownerId: string; // Tham chiếu Account (bác sĩ tạo)
  patientCode: string; // 1-30 ký tự [A-Za-z0-9-], duy nhất theo từng bác sĩ (Q-20)
  fullName: string; // 2-100 ký tự Unicode
  dateOfBirth: string; // dd/MM/yyyy (01/01/1900 <= ngày <= hôm nay)
  sex: SexType;
  phone?: string;
  address?: string;
  symptoms?: string; // <= 2000 ký tự
  history?: string; // <= 2000 ký tự
  note?: string; // <= 2000 ký tự
  status: EntityLifecycleStatus;
  revision: number;
  syncState: SyncState;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  trashedAt?: string;
}

export type CaseStatus = 'DRAFT' | 'COMPLETED' | 'TRASHED';

export interface CaseEntity {
  caseId: string; // UUID
  caseCode: string; // Hệ thống sinh, ví dụ CA-2026-000045, duy nhất theo bác sĩ
  patientId: string;
  ownerId: string; // Cùng ownerId với patientId
  scanDate: string; // ISO hoặc YYYY-MM-DD (<= hôm nay)
  clinicalNote?: string; // <= 2000 ký tự
  status: CaseStatus;
  completionVersion?: number;
  completedAt?: string;
  isPartial?: boolean;
  amendmentReason?: string;
  doctorComment?: string; // <= 5000 ký tự
  revision: number;
  syncState: SyncState;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  trashedAt?: string;
}

export type ImageSource = 'LIBRARY' | 'CAMERA';
export type ImageState = 'ACTIVE' | 'REPLACED' | 'REMOVED';

export interface CTImageEntity {
  imageId: string; // UUID
  caseId: string;
  ownerId: string;
  imageVersion: number; // Bắt đầu từ 1
  orderIndex: number;
  source: ImageSource;
  mimeType: 'image/jpeg' | 'image/png';
  width: number;
  height: number;
  byteSize: number; // <= 20 MiB
  sha256: string; // 64 hex chars
  localFileRef: string; // Đường dẫn nội bộ trong vùng app sandbox
  originalFileName?: string;
  state: ImageState;
  imageComment?: string; // <= 2000 ký tự
  createdAt: string;
}

export type ClassificationStatus = 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL';
export type AIClassLabel = 'BENIGN' | 'MALIGNANT' | 'NORMAL';
export type ExplanationStatus = 'PENDING' | 'PASS' | 'ZERO_CAM' | 'UNAVAILABLE' | 'FAIL';
export type ExecutionSource = 'LOCAL' | 'SERVER';
export type InferenceMode = 'REAL' | 'MOCK';

export interface AIPredictionResultEntity {
  resultId: string; // UUID
  imageId: string;
  imageVersion: number;
  classificationStatus: ClassificationStatus;
  scores?: [number, number, number]; // [Benign, Malignant, Normal], tổng xấp xỉ 1
  label?: AIClassLabel;
  explanationStatus: ExplanationStatus;
  camRef?: string;
  targetLayer?: string; // mặc định conv5_block3_out
  targetClass?: AIClassLabel;
  triPanelUri?: string;
  suspiciousOverlayUri?: string;
  lungMaskUri?: string;
  suspiciousRegionsJson?: string;
  suspiciousCount?: number;
  lungHotRatio?: number;
  decisionReason?: string;
  modelVersion: string;
  preprocessingVersion: string;
  executionSource: ExecutionSource;
  mode: InferenceMode; // REAL hoặc MOCK (MOCK không vào thống kê)
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  errorCode?: string;
  state: 'CURRENT' | 'SUPERSEDED';
}

export interface DoctorStatsProjection {
  ownerId: string;
  patientCount: number;
  activeCaseCount: number;
  completedCaseCount: number;
  draftCaseCount: number;
  analyzedImageCount: number;
  labelDistribution: {
    benign: number;
    malignant: number;
    normal: number;
  };
  calculatedAt: string;
}

export interface ExportedPdfEntity {
  id: string;
  caseId: string;
  ownerId: string;
  fileName: string;
  fileUri: string;
  createdAt: string;
  fileSize: string;
  language: 'vi' | 'en';
  hasGradCam: boolean;
  version?: string;
  isTrashed?: boolean;
}

