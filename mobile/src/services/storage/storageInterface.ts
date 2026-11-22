/**
 * GIAO THỨC TẦNG LƯU TRỮ CƠ SỞ DỮ LIỆU CỤC BỘ (LOCAL STORAGE ADAPTER INTERFACE)
 *
 * Thiết kế theo kiến trúc Repository Pattern:
 * - Tách biệt độc lập giữa tầng nghiệp vụ (Domain/Screens) và tầng lưu trữ vật lý (Storage Engine).
 * - Mọi thao tác bắt buộc kèm `ownerId` để bảo đảm cô lập dữ liệu 100% giữa các bác sĩ trên cùng thiết bị.
 * - Cho phép chuyển đổi linh hoạt giữa Encrypted File Vault (hiện tại) sang SQLite/SQLCipher (khi có native module).
 */

import {
  PatientEntity,
  CaseEntity,
  CTImageEntity,
  AIPredictionResultEntity,
  DoctorStatsProjection,
  ExportedPdfEntity,
} from './types';

export interface CreatePatientInput {
  patientId?: string;
  patientCode: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  address?: string;
  symptoms?: string;
  history?: string;
  note?: string;
}

export interface UpdatePatientInput {
  fullName?: string;
  dateOfBirth?: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  address?: string;
  symptoms?: string;
  history?: string;
  note?: string;
}

export interface CreateCaseInput {
  patientId: string;
  scanDate: string;
  clinicalNote?: string;
  doctorComment?: string;
}

export interface ILocalStorageAdapter {
  /**
   * Khởi tạo cơ sở dữ liệu.
   */
  initialize(): Promise<void>;

  /**
   * Kiểm tra và thực thi migration schema cho một bác sĩ cụ thể.
   */
  migrateSchemaIfNeeded(ownerId: string): Promise<{ fromVersion: number; toVersion: number }>;

  /**
   * Đóng hoặc giải phóng tài nguyên cơ sở dữ liệu.
   */
  close(): Promise<void>;

  // === BỆNH NHÂN (PATIENTS) ===
  getPatients(ownerId: string, includeTrashed?: boolean): Promise<PatientEntity[]>;
  getPatientById(ownerId: string, patientId: string): Promise<PatientEntity | null>;
  createPatient(ownerId: string, input: CreatePatientInput): Promise<PatientEntity>;
  updatePatient(
    ownerId: string,
    patientId: string,
    input: UpdatePatientInput,
  ): Promise<PatientEntity>;
  trashPatient(ownerId: string, patientId: string): Promise<boolean>;
  restorePatient(ownerId: string, patientId: string): Promise<boolean>;

  // === CA BỆNH (CASES) ===
  getCases(ownerId: string, patientId?: string, includeTrashed?: boolean): Promise<CaseEntity[]>;
  getCaseById(ownerId: string, caseId: string): Promise<CaseEntity | null>;
  createCase(ownerId: string, input: CreateCaseInput): Promise<CaseEntity>;
  updateCaseNotes(
    ownerId: string,
    caseId: string,
    notes: { clinicalNote?: string; doctorComment?: string },
  ): Promise<CaseEntity>;
  completeCase(ownerId: string, caseId: string): Promise<CaseEntity>;
  trashCase(ownerId: string, caseId: string): Promise<boolean>;
  restoreCase(ownerId: string, caseId: string): Promise<boolean>;
  hardDeleteCase(ownerId: string, caseId: string): Promise<boolean>;

  // === ẢNH CT & KẾT QUẢ AI ===
  getImagesByCaseId(ownerId: string, caseId: string): Promise<CTImageEntity[]>;
  removeCTImage(ownerId: string, imageId: string): Promise<boolean>;
  saveCTImage(
    ownerId: string,
    image: Omit<CTImageEntity, 'imageId' | 'createdAt'>,
  ): Promise<CTImageEntity>;
  savePredictionResult(
    ownerId: string,
    result: Omit<AIPredictionResultEntity, 'resultId'>,
  ): Promise<AIPredictionResultEntity>;
  getLatestPrediction(ownerId: string, imageId: string): Promise<AIPredictionResultEntity | null>;

  // === BÁO CÁO PDF (EXPORTED PDF REPORTS - CHÍNH SÁCH 3A) ===
  saveExportedPdf(ownerId: string, report: ExportedPdfEntity): Promise<ExportedPdfEntity>;
  getExportedPdfsByCaseId(ownerId: string, caseId: string): Promise<ExportedPdfEntity[]>;
  deleteExportedPdf(ownerId: string, pdfId: string): Promise<void>;

  // === THỐNG KÊ (PROJECTION) ===
  getDoctorStats(ownerId: string, period?: '7d' | '30d' | 'all'): Promise<DoctorStatsProjection>;

  // === ĐỒNG BỘ HÓA (SYNC OUTBOX & MERGE) ===
  getAllPredictionsForOwner(ownerId: string): Promise<AIPredictionResultEntity[]>;
  getPendingSyncItems(ownerId: string): Promise<{
    patients: PatientEntity[];
    cases: CaseEntity[];
  }>;
  markPatientSynced(ownerId: string, patientId: string, syncedRevision: number): Promise<boolean>;
  markCaseSynced(ownerId: string, caseId: string, syncedRevision: number): Promise<boolean>;
  upsertPatientFromCloud(
    ownerId: string,
    remotePatient: PatientEntity,
  ): Promise<'inserted' | 'updated' | 'skipped' | 'conflict'>;
  upsertCaseFromCloud(
    ownerId: string,
    remoteCase: CaseEntity,
  ): Promise<'inserted' | 'updated' | 'skipped' | 'conflict'>;

  // === BẢO MẬT & XỬ LÝ TÀI KHOẢN BỊ KHÓA (AUTH-08) ===
  /**
   * Xử lý dữ liệu khi tài khoản bị khóa theo đặc tả AUTH-08:
   * - Xóa sạch toàn bộ dữ liệu đã đồng bộ thành công (syncState === 'synced').
   * - BẢO TOÀN NGUYÊN VẸN các ca nháp / bệnh nhân chưa đồng bộ (syncState === 'pending' hoặc 'conflict')
   *   trong trạng thái khóa, không xóa nháp của bác sĩ.
   */
  purgeSyncedDataOnAccountLocked(ownerId: string): Promise<{
    purgedPatientsCount: number;
    retainedDraftPatientsCount: number;
    purgedCasesCount: number;
    retainedDraftCasesCount: number;
  }>;
}
