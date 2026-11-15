/**
 * REPOSITORY QUẢN LÝ DỮ LIỆU CA BỆNH CỤC BỘ (CASE REPOSITORY)
 *
 * Cầu nối kiến trúc:
 * 1. Đảm nhận kết nối giữa UI Ca bệnh (DoctorCasesScreen, CaseDetailScreen, PatientDetailScreen)
 *    và `localStorageService` (Encrypted Storage AES-256-GCM / Android Keystore).
 * 2. Cung cấp API tương thích 2 chiều giữa định dạng Entity lưu trữ (`CaseEntity`)
 *    và kiểu hiển thị UI (`MockCase`).
 * 3. Hỗ trợ tự động Seed dữ liệu ca bệnh ban đầu từ Mock Store nếu bác sĩ chưa có ca nào,
 *    đảm bảo trải nghiệm ngoại tuyến và dữ liệu hiển thị tức thì.
 * 4. Đồng bộ 2 chiều với Mock Store in-memory để giữ trải nghiệm mượt mà, đồng thời ghi bền vững
 *    xuống đĩa có mã hóa để khi đóng/mở lại app (`am force-stop` & `am start`) dữ liệu không bị mất.
 * 5. Phát sự kiện thay đổi dữ liệu để các màn hình lắng nghe (listener pattern).
 */

import { localStorageService } from './index';
import { CaseEntity, PatientEntity, CTImageEntity, AIPredictionResultEntity } from './types';
import {
  MockCase,
  getMockCases,
  findCaseById as findMockCaseById,
  updateCaseNotes as updateMockCaseNotes,
  completeCase as completeMockCase,
  trashCase as trashMockCase,
  restoreCase as restoreMockCase,
  removeMockCaseImage,
  createMockCaseForPatient,
  MockPatient,
} from '../../mocks/doctorMocks';

type CaseChangeListener = () => void;
const listeners: Set<CaseChangeListener> = new Set();

export function subscribeCaseRepository(listener: CaseChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCaseListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.warn('[CaseRepository] Lỗi listener:', err);
    }
  });
}

/**
 * Chuyển đổi từ CaseEntity sang MockCase dùng trên UI
 */
export function entityToMockCase(
  entity: CaseEntity,
  patient?: PatientEntity | null,
  ctImages?: CTImageEntity[],
  predictions?: AIPredictionResultEntity[],
): MockCase {
  // Lấy thêm thông tin ảnh nếu có sẵn từ mock store (để hiển thị lát cắt trong phiên)
  const mockExisting = findMockCaseById(entity.caseId);
  let images: MockCase['images'] = mockExisting ? [...mockExisting.images] : [];

  if (ctImages && ctImages.length > 0) {
    const predMap = new Map<string, AIPredictionResultEntity>();
    if (predictions) {
      predictions.forEach((p) => {
        if (p.state === 'CURRENT') predMap.set(p.imageId, p);
      });
    }

    images = ctImages.map((img, idx) => {
      const pred = predMap.get(img.imageId);
      const uriStr = img.localFileRef.startsWith('/') ? `file://${img.localFileRef}` : img.localFileRef;
      const aiClass = pred
        ? (pred.label === 'BENIGN' ? 'Benign' : pred.label === 'MALIGNANT' ? 'Malignant' : 'Normal')
        : undefined;

      return {
        id: img.imageId,
        index: idx + 1,
        sliceNumber: 30 + (idx + 1),
        source: img.source === 'CAMERA' ? 'camera' : 'gallery',
        status: pred ? (pred.explanationStatus === 'PASS' ? 'pass' : 'passNoCam') : 'pending',
        uri: uriStr,
        filePath: img.localFileRef,
        originalFileName: img.originalFileName,
        aiClass,
        scores:
          pred && Array.isArray(pred.scores) && pred.scores.length >= 3
            ? {
                benign: pred.scores[0],
                malignant: pred.scores[1],
                normal: pred.scores[2],
              }
            : undefined,
        hasGradCam: pred ? pred.explanationStatus === 'PASS' : false,
        mockWatermark: undefined,
      };
    });
  }

  // Định dạng ngày chụp DD/MM/YYYY
  let captureDateStr = entity.scanDate;
  if (entity.scanDate && entity.scanDate.includes('-')) {
    const parts = entity.scanDate.split('-');
    if (parts.length === 3) {
      captureDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  const patientName = patient
    ? patient.fullName
    : mockExisting
      ? mockExisting.patientName
      : 'Bệnh nhân';
  const patientCode = patient
    ? patient.patientCode
    : mockExisting
      ? mockExisting.patientCode
      : 'BN-UNKNOWN';

  return {
    id: entity.caseId,
    caseCode: entity.caseCode,
    patientId: entity.patientId,
    patientName,
    patientCode,
    captureDate: captureDateStr,
    status: entity.status === 'COMPLETED' ? 'COMPLETED' : entity.isPartial ? 'PARTIAL' : 'DRAFT',
    imageCount: images.length > 0 ? images.length : mockExisting?.imageCount || 0,
    aiLabelSummary: mockExisting?.aiLabelSummary,
    aiScore: mockExisting?.aiScore,
    isPartial: entity.isPartial,
    syncStatus: entity.syncState,
    notes: entity.doctorComment || entity.clinicalNote || mockExisting?.notes || '',
    notesSavedAt: entity.updatedAt
      ? entity.updatedAt.substring(0, 16).replace('T', ' ')
      : mockExisting?.notesSavedAt,
    images,
    isTrashed: entity.status === 'TRASHED',
    isMock: true,
  };
}

export class CaseRepository {
  private static isInitialized = false;

  public static async ensureReady(ownerId: string): Promise<void> {
    if (!this.isInitialized) {
      await localStorageService.initialize();
      await localStorageService.migrateSchemaIfNeeded(ownerId);
      this.isInitialized = true;
    }

    // Chỉ seed dữ liệu mẫu cho tài khoản test mock cục bộ 'usr-doc-01'.
    // Tuyệt đối không tự động seed vào tài khoản thật của bác sĩ (Firebase UID).
    if (ownerId === 'usr-doc-01') {
      const existing = await localStorageService.getCases(ownerId, undefined, true);
      if (existing.length === 0) {
        const initialMockCases = getMockCases();
        for (const c of initialMockCases) {
          try {
            let scanDate = new Date().toISOString().substring(0, 10);
            if (c.captureDate && c.captureDate.includes('/')) {
              const p = c.captureDate.split('/');
              if (p.length === 3) {
                scanDate = `${p[2]}-${p[1]}-${p[0]}`;
              }
            }

            const created = await localStorageService.createCase(ownerId, {
              patientId: c.patientId,
              scanDate,
              clinicalNote: c.notes,
              doctorComment: c.notes,
            });

            if (c.status === 'COMPLETED') {
              await localStorageService.completeCase(ownerId, created.caseId);
            }
          } catch {
            // Bỏ qua lỗi seed phụ
          }
        }
      }
    }
  }

  /**
   * Lấy toàn bộ danh sách ca bệnh cho bác sĩ
   */
  public static async getCasesForUI(
    ownerId: string,
    patientId?: string,
    includeTrashed: boolean = false,
  ): Promise<MockCase[]> {
    await this.ensureReady(ownerId);
    const entities = await localStorageService.getCases(ownerId, patientId, includeTrashed);
    const patients = await localStorageService.getPatients(ownerId, true);
    const patientMap = new Map<string, PatientEntity>();
    patients.forEach((p) => patientMap.set(p.patientId, p));

    const predictions = await localStorageService.getAllPredictionsForOwner(ownerId);

    const casesWithImages: MockCase[] = [];
    for (const entity of entities) {
      const patient = patientMap.get(entity.patientId);
      const ctImages = await localStorageService.getImagesByCaseId(ownerId, entity.caseId);
      casesWithImages.push(entityToMockCase(entity, patient, ctImages, predictions));
    }
    return casesWithImages;
  }

  /**
   * Lấy chi tiết ca bệnh theo ID
   */
  public static async getCaseById(ownerId: string, caseId: string): Promise<MockCase | null> {
    await this.ensureReady(ownerId);
    const entity = await localStorageService.getCaseById(ownerId, caseId);
    if (!entity) {
      // Fallback về mock store nếu chưa kịp migrate
      const fallback = findMockCaseById(caseId);
      return fallback || null;
    }

    const patient = await localStorageService.getPatientById(ownerId, entity.patientId);
    const ctImages = await localStorageService.getImagesByCaseId(ownerId, caseId);
    const predictions = await localStorageService.getAllPredictionsForOwner(ownerId);
    return entityToMockCase(entity, patient, ctImages, predictions);
  }

  /**
   * Tạo ca bệnh mới cho bệnh nhân và lưu trữ mã hóa
   */
  public static async createCase(
    ownerId: string,
    patient: MockPatient,
    scanDateStr?: string,
  ): Promise<MockCase> {
    await this.ensureReady(ownerId);

    const now = new Date();
    const scanDate = scanDateStr || now.toISOString().substring(0, 10);

    const created = await localStorageService.createCase(ownerId, {
      patientId: patient.id,
      scanDate,
      clinicalNote: '',
      doctorComment: '',
    });

    // Đồng bộ đồng thời vào Mock Store in-memory để giữ UI trơn tru
    createMockCaseForPatient(patient);

    notifyCaseListeners();
    return entityToMockCase(created, null);
  }

  /**
   * Cập nhật ghi chú / nhận xét của bác sĩ cho ca bệnh
   */
  public static async updateCaseNotes(
    ownerId: string,
    caseId: string,
    notes: string,
  ): Promise<boolean> {
    await this.ensureReady(ownerId);

    try {
      await localStorageService.updateCaseNotes(ownerId, caseId, {
        doctorComment: notes,
        clinicalNote: notes,
      });
    } catch {
      // Nếu entity chưa có trong storage thì bỏ qua lỗi ghi trực tiếp
    }

    // Luôn cập nhật mock store để UI phản ánh tức thời
    updateMockCaseNotes(caseId, notes);

    notifyCaseListeners();
    return true;
  }

  /**
   * Hoàn tất ca bệnh
   */
  public static async completeCase(
    ownerId: string,
    caseId: string,
  ): Promise<{ success: boolean; reason?: string }> {
    await this.ensureReady(ownerId);

    // 1. Kiểm tra tồn tại trong SQLite storage
    const caseEntity = await localStorageService.getCaseById(ownerId, caseId);
    if (!caseEntity) {
      // Nếu không có trong storage thì thử kiểm tra mock store
      const mockTarget = findMockCaseById(caseId);
      if (!mockTarget) {
        return { success: false, reason: 'Không tìm thấy ca bệnh.' };
      }
      return completeMockCase(caseId);
    }

    // 2. BR-CASE-01: Yêu cầu ít nhất 1 ảnh CT đính kèm
    const images = await localStorageService.getImagesByCaseId(ownerId, caseId);
    if (!images || images.length === 0) {
      return {
        success: false,
        reason: 'Cần ít nhất 1 ảnh để hoàn tất ca bệnh (BR-CASE-01).',
      };
    }

    // 3. Hoàn tất trong kho lưu trữ mã hóa SQLite
    try {
      await localStorageService.completeCase(ownerId, caseId);
    } catch (err: any) {
      console.warn('[CaseRepository] Lỗi hoàn tất trong kho lưu trữ mã hóa:', err);
      return {
        success: false,
        reason: err?.message || 'Lỗi lưu trạng thái hoàn tất.',
      };
    }

    // 4. Đồng bộ mềm vào mock store nếu ca này cũng đang có trong RAM
    try {
      completeMockCase(caseId);
    } catch {
      // ignore
    }

    notifyCaseListeners();
    return { success: true };
  }

  /**
   * Đính kèm ảnh CT vào ca bệnh trong vùng lưu trữ an toàn của ứng dụng
   */
  public static async attachCTImage(
    ownerId: string,
    caseId: string,
    imageData: {
      source: 'LIBRARY' | 'CAMERA';
      mimeType: 'image/jpeg' | 'image/png';
      localFileRef: string;
      originalFileName?: string;
      byteSize?: number;
      width?: number;
      height?: number;
    },
  ): Promise<CTImageEntity> {
    await this.ensureReady(ownerId);

    const existingImages = await localStorageService.getImagesByCaseId(ownerId, caseId);
    const orderIndex = existingImages.length + 1;

    const saved = await localStorageService.saveCTImage(ownerId, {
      caseId,
      ownerId,
      imageVersion: 1,
      orderIndex,
      source: imageData.source,
      mimeType: imageData.mimeType,
      width: imageData.width || 512,
      height: imageData.height || 512,
      byteSize: imageData.byteSize || 1024,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      localFileRef: imageData.localFileRef,
      originalFileName: imageData.originalFileName,
      state: 'ACTIVE',
    });

    notifyCaseListeners();
    return saved;
  }

  /**
   * Lưu kết quả chẩn đoán On-Device AI cho ảnh CT
   */
  public static async saveAIResult(
    ownerId: string,
    imageId: string,
    result: {
      scores: [number, number, number];
      label: 'BENIGN' | 'MALIGNANT' | 'NORMAL';
      durationMs: number;
      modelVersion?: string;
      mode?: 'REAL' | 'MOCK';
    },
  ): Promise<AIPredictionResultEntity> {
    await this.ensureReady(ownerId);

    const saved = await localStorageService.savePredictionResult(ownerId, {
      imageId,
      imageVersion: 1,
      classificationStatus: 'PASS',
      scores: result.scores,
      label: result.label,
      explanationStatus: 'UNAVAILABLE', // On-device MSG-11
      modelVersion: result.modelVersion || 'Adaptive_ViT_FP32_v1',
      preprocessingVersion: 'Nearest_Float32_v1',
      executionSource: 'LOCAL',
      mode: result.mode || 'REAL',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: result.durationMs,
      state: 'CURRENT',
    });

    notifyCaseListeners();
    return saved;
  }

  /**
   * Xóa mềm ca bệnh (chuyển vào thùng rác)
   */
  public static async trashCase(ownerId: string, caseId: string): Promise<boolean> {
    await this.ensureReady(ownerId);

    try {
      await localStorageService.trashCase(ownerId, caseId);
    } catch (err) {
      console.warn('[CaseRepository] Lỗi xóa mềm trong storage:', err);
    }

    const mockSuccess = trashMockCase(caseId);
    notifyCaseListeners();
    return mockSuccess;
  }

  /**
   * CHÍNH SÁCH 4A: Khôi phục ca bệnh từ thùng rác
   */
  public static async restoreCase(ownerId: string, caseId: string): Promise<boolean> {
    await this.ensureReady(ownerId);

    try {
      await localStorageService.restoreCase(ownerId, caseId);
    } catch (err) {
      console.warn('[CaseRepository] Lỗi khôi phục ca trong storage:', err);
    }

    const mockSuccess = restoreMockCase(caseId);
    notifyCaseListeners();
    return mockSuccess;
  }

  /**
   * CHÍNH SÁCH 1A & 2A: Xóa lát cắt ảnh CT khỏi ca bệnh
   * Chặn không cho xóa nếu ca bệnh đã Hoàn tất (COMPLETED).
   */
  public static async removeCTImage(
    ownerId: string,
    caseId: string,
    imageId: string,
  ): Promise<{ success: boolean; reason?: string }> {
    await this.ensureReady(ownerId);

    const caseEntity = await localStorageService.getCaseById(ownerId, caseId);
    if (caseEntity && caseEntity.status === 'COMPLETED') {
      return {
        success: false,
        reason: 'Không thể xóa ảnh của ca bệnh đã hoàn tất (Chính sách 1A).',
      };
    }

    try {
      await localStorageService.removeCTImage(ownerId, imageId);
    } catch (err: any) {
      console.warn('[CaseRepository] Lỗi xóa ảnh trong storage:', err);
    }

    removeMockCaseImage(caseId, imageId);
    notifyCaseListeners();
    return { success: true };
  }
}
