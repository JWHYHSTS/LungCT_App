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
import { CaseEntity, PatientEntity } from './types';
import {
  MockCase,
  getMockCases,
  findCaseById as findMockCaseById,
  updateCaseNotes as updateMockCaseNotes,
  completeCase as completeMockCase,
  trashCase as trashMockCase,
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

function notifyCaseListeners() {
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
export function entityToMockCase(entity: CaseEntity, patient?: PatientEntity | null): MockCase {
  // Lấy thêm thông tin ảnh nếu có sẵn từ mock store (để hiển thị lát cắt trong phiên)
  const mockExisting = findMockCaseById(entity.caseId);
  const images = mockExisting ? mockExisting.images : [];

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

    // Kiểm tra xem đã có ca bệnh nào trong storage của bác sĩ chưa
    const existing = await localStorageService.getCases(ownerId, undefined, true);
    if (existing.length === 0) {
      // Seed dữ liệu ban đầu từ Mock Store để đảm bảo hiển thị offline
      const initialMockCases = getMockCases();
      for (const c of initialMockCases) {
        try {
          // Chuẩn hóa ngày chụp về YYYY-MM-DD
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

          // Nếu ca ban đầu có trạng thái COMPLETED trong mock thì cập nhật trạng thái
          if (c.status === 'COMPLETED') {
            await localStorageService.completeCase(ownerId, created.caseId);
          }
        } catch {
          // Bỏ qua lỗi trùng mã hoặc lỗi seed phụ
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

    return entities.map((entity) => {
      const patient = patientMap.get(entity.patientId);
      return entityToMockCase(entity, patient);
    });
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
    return entityToMockCase(entity, patient);
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

    // Kiểm tra tính hợp lệ qua Mock Store logic (BR-CASE-01: cần ít nhất 1 ảnh, không running)
    const mockRes = completeMockCase(caseId);
    if (!mockRes.success) {
      return mockRes;
    }

    try {
      await localStorageService.completeCase(ownerId, caseId);
    } catch (err: any) {
      console.warn('[CaseRepository] Lỗi hoàn tất trong kho lưu trữ mã hóa:', err);
    }

    notifyCaseListeners();
    return { success: true };
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
}
