/**
 * REPOSITORY QUẢN LÝ DỮ LIỆU BỆNH NHÂN & CA BỆNH CỤC BỘ
 *
 * Cầu nối kiến trúc:
 * 1. Đảm nhận kết nối giữa UI Bác sĩ và `localStorageService` (Encrypted Storage).
 * 2. Cung cấp API tương thích 2 chiều giữa định dạng Entity lưu trữ (`PatientEntity`, `CaseEntity`)
 *    và kiểu hiển thị UI (`MockPatient`, `MockCase`).
 * 3. Hỗ trợ tự động Seed dữ liệu mẫu ban đầu (Initial Seed) khi tài khoản bác sĩ chưa có dữ liệu,
 *    giúp giao diện hiển thị đầy đủ ngay cả khi chạy offline hoặc sau khi mở lại ứng dụng.
 * 4. Phát sự kiện thay đổi dữ liệu để các màn hình lắng nghe (listener pattern).
 */

import { localStorageService } from './index';
import { PatientEntity, CaseEntity } from './types';
import {
  MockPatient,
  getMockPatients,
} from '../../mocks/doctorMocks';

type PatientChangeListener = () => void;
const listeners: Set<PatientChangeListener> = new Set();

export function subscribePatientRepository(listener: PatientChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.warn('[PatientRepository] Lỗi listener:', err);
    }
  });
}

/**
 * Chuyển đổi từ PatientEntity sang MockPatient dùng trên UI
 */
export function entityToMockPatient(
  entity: PatientEntity,
  casesOfPatient: CaseEntity[] = [],
): MockPatient {
  const activeCases = casesOfPatient.filter((c) => c.status !== 'TRASHED');
  const hasDraft = activeCases.some((c) => c.status === 'DRAFT');
  const lastCase = activeCases.length > 0 ? activeCases[0].scanDate : '';

  // Tính tuổi từ ngày sinh DD/MM/YYYY
  let calculatedAge = 0;
  if (entity.dateOfBirth) {
    const parts = entity.dateOfBirth.split('/');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[2], 10);
      if (!isNaN(birthYear)) {
        calculatedAge = Math.max(0, new Date().getFullYear() - birthYear);
      }
    }
  }

  const genderMap: Record<string, 'Nam' | 'Nữ' | 'Khác'> = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  };

  return {
    id: entity.patientId,
    code: entity.patientCode,
    fullName: entity.fullName,
    dob: entity.dateOfBirth,
    age: calculatedAge,
    gender: genderMap[entity.sex] || 'Nam',
    phone: entity.phone,
    symptoms: entity.symptoms,
    caseCount: activeCases.length,
    lastCaseDate: lastCase || (entity.createdAt ? entity.createdAt.substring(0, 10) : ''),
    hasDraftCase: hasDraft,
    syncStatus: entity.syncState,
    isTrashed: entity.status === 'TRASHED',
    isMock: true,
  };
}

export class PatientRepository {
  private static isInitialized = false;

  public static async ensureReady(ownerId: string): Promise<void> {
    if (!this.isInitialized) {
      await localStorageService.initialize();
      await localStorageService.migrateSchemaIfNeeded(ownerId);
      this.isInitialized = true;
    }

    // Kiểm tra xem đã có bệnh nhân nào trong storage chưa
    const existing = await localStorageService.getPatients(ownerId, true);
    if (existing.length === 0) {
      // Seed dữ liệu ban đầu cho bác sĩ này từ Mock Store để đảm bảo trải nghiệm offline mượt mà
      const initialMockPatients = getMockPatients();
      for (const p of initialMockPatients) {
        try {
          const sex = p.gender === 'Nữ' ? 'FEMALE' : p.gender === 'Khác' ? 'OTHER' : 'MALE';
          await localStorageService.createPatient(ownerId, {
            patientId: p.id,
            patientCode: p.code,
            fullName: p.fullName,
            dateOfBirth: p.dob,
            sex,
            phone: p.phone,
            symptoms: p.symptoms,
          });
        } catch {
          // Bỏ qua nếu trùng mã
        }
      }
    }
  }

  /**
   * Lấy toàn bộ danh sách bệnh nhân cho bác sĩ (định dạng MockPatient cho UI)
   */
  public static async getPatientsForUI(
    ownerId: string,
    includeTrashed: boolean = false,
  ): Promise<MockPatient[]> {
    await this.ensureReady(ownerId);
    const entities = await localStorageService.getPatients(ownerId, includeTrashed);
    const allCases = await localStorageService.getCases(ownerId, undefined, true);

    return entities.map((entity) => {
      const casesForThis = allCases.filter((c) => c.patientId === entity.patientId);
      return entityToMockPatient(entity, casesForThis);
    });
  }

  /**
   * Lấy chi tiết bệnh nhân theo ID
   */
  public static async getPatientById(
    ownerId: string,
    patientId: string,
  ): Promise<MockPatient | null> {
    await this.ensureReady(ownerId);
    const entity = await localStorageService.getPatientById(ownerId, patientId);
    if (!entity) return null;
    const cases = await localStorageService.getCases(ownerId, patientId, true);
    return entityToMockPatient(entity, cases);
  }

  /**
   * Thêm bệnh nhân mới vào kho lưu trữ mã hóa
   */
  public static async addPatient(
    ownerId: string,
    data: {
      code: string;
      fullName: string;
      dob: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      phone?: string;
      symptoms?: string;
    },
  ): Promise<MockPatient> {
    await this.ensureReady(ownerId);
    const sex = data.gender === 'Nữ' ? 'FEMALE' : data.gender === 'Khác' ? 'OTHER' : 'MALE';
    const created = await localStorageService.createPatient(ownerId, {
      patientCode: data.code,
      fullName: data.fullName,
      dateOfBirth: data.dob,
      sex,
      phone: data.phone,
      symptoms: data.symptoms,
    });

    notifyListeners();
    return entityToMockPatient(created, []);
  }

  /**
   * Cập nhật thông tin bệnh nhân
   */
  public static async updatePatient(
    ownerId: string,
    patientId: string,
    data: {
      fullName?: string;
      dob?: string;
      gender?: 'Nam' | 'Nữ' | 'Khác';
      phone?: string;
      symptoms?: string;
    },
  ): Promise<MockPatient> {
    await this.ensureReady(ownerId);
    const sex =
      data.gender === 'Nữ'
        ? 'FEMALE'
        : data.gender === 'Khác'
          ? 'OTHER'
          : data.gender === 'Nam'
            ? 'MALE'
            : undefined;

    const updated = await localStorageService.updatePatient(ownerId, patientId, {
      fullName: data.fullName,
      dateOfBirth: data.dob,
      sex,
      phone: data.phone,
      symptoms: data.symptoms,
    });

    const cases = await localStorageService.getCases(ownerId, patientId, true);
    notifyListeners();
    return entityToMockPatient(updated, cases);
  }

  /**
   * Xóa mềm (chuyển vào thùng rác) bệnh nhân
   */
  public static async trashPatient(ownerId: string, patientId: string): Promise<boolean> {
    await this.ensureReady(ownerId);
    const success = await localStorageService.trashPatient(ownerId, patientId);
    if (success) {
      notifyListeners();
    }
    return success;
  }

  /**
   * Khôi phục bệnh nhân từ thùng rác về trạng thái ACTIVE
   */
  public static async restorePatient(ownerId: string, patientId: string): Promise<boolean> {
    await this.ensureReady(ownerId);
    const success = await localStorageService.restorePatient(ownerId, patientId);
    if (success) {
      notifyListeners();
    }
    return success;
  }
}
