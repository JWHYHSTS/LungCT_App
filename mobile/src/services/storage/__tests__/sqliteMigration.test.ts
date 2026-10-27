/**
 * KIỂM THỬ CHUYỂN ĐỔI DỮ LIỆU CŨ SANG SQLITE (MIGRATION INTEGRATION TEST)
 *
 * Tiêu chí kiểm thử nghiêm ngặt:
 * 1. Chuyển đổi dữ liệu cũ trong AsyncStorage sang SQLite an toàn, cấu trúc rõ ràng.
 * 2. Bảo toàn 100% dữ liệu trong AsyncStorage (Zero Data Loss).
 * 3. Idempotent / Resume: Giả lập gián đoạn giữa chừng và chạy lại nhiều lần không sinh lỗi, không nhân đôi bản ghi.
 * 4. Đối chiếu số lượng và thuộc tính bản ghi trước và sau migration.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptedLocalStorageService } from '../localStorageService';
import { CryptoVault } from '../cryptoVault';
import { PatientEntity, CaseEntity } from '../types';

const memoryStore: Record<string, string> = {};
const mockSqliteDb: {
  patients: any[];
  cases: any[];
  metadata: Record<string, string>;
} = {
  patients: [],
  cases: [],
  metadata: {},
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => memoryStore[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    memoryStore[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete memoryStore[key];
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((k) => delete memoryStore[k]);
  }),
  clear: jest.fn(async () => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  }),
}));

describe('SQLite Migration & Zero Data Loss Tests', () => {
  const DOC_ID = 'usr-doc-mig-test';
  let storageService: EncryptedLocalStorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    mockSqliteDb.patients = [];
    mockSqliteDb.cases = [];
    mockSqliteDb.metadata = {};

    // Mock các phương thức SQLite của CryptoVault trong môi trường Jest sandbox
    jest.spyOn(CryptoVault, 'openSecureDatabaseAsync').mockResolvedValue({
      success: true,
      databasePath: `:memory:${DOC_ID}`,
    });

    jest.spyOn(CryptoVault, 'querySecureSqlAsync').mockImplementation(async (_ownerId, sql, args = []) => {
      if (sql.includes('FROM secure_metadata WHERE meta_key = ?')) {
        const key = args[0];
        if (mockSqliteDb.metadata[key]) {
          return [{ meta_value: mockSqliteDb.metadata[key] }];
        }
        return [];
      }
      if (sql.includes('SELECT * FROM secure_patients')) {
        return mockSqliteDb.patients;
      }
      if (sql.includes('SELECT * FROM secure_cases')) {
        return mockSqliteDb.cases;
      }
      return [];
    });

    jest.spyOn(CryptoVault, 'executeSecureSqlAsync').mockImplementation(async (_ownerId, sql, args = []) => {
      if (sql.includes('INSERT OR REPLACE INTO secure_patients')) {
        const patientId = args[0];
        const existingIdx = mockSqliteDb.patients.findIndex((p) => p.patient_id === patientId);
        const record = {
          patient_id: args[0],
          owner_id: args[1],
          patient_code: args[2],
          full_name: args[3],
          dob: args[4],
          sex: args[5],
          phone: args[6],
          symptoms: args[7],
          status: args[8],
          revision: args[9],
          sync_state: args[10],
          created_at: args[11],
          updated_at: args[12],
          trashed_at: args[13],
          encrypted_payload: args[14],
        };
        if (existingIdx >= 0) {
          mockSqliteDb.patients[existingIdx] = record;
        } else {
          mockSqliteDb.patients.push(record);
        }
        return true;
      }

      if (sql.includes('INSERT OR REPLACE INTO secure_cases')) {
        const caseId = args[0];
        const existingIdx = mockSqliteDb.cases.findIndex((c) => c.case_id === caseId);
        const record = {
          case_id: args[0],
          owner_id: args[1],
          case_code: args[2],
          patient_id: args[3],
          scan_date: args[4],
          status: args[5],
          clinical_note: args[6],
          doctor_comment: args[7],
          revision: args[8],
          sync_state: args[9],
          created_at: args[10],
          updated_at: args[11],
          trashed_at: args[12],
          encrypted_payload: args[13],
        };
        if (existingIdx >= 0) {
          mockSqliteDb.cases[existingIdx] = record;
        } else {
          mockSqliteDb.cases.push(record);
        }
        return true;
      }

      if (sql.includes('INSERT OR REPLACE INTO secure_metadata')) {
        const key = args[0];
        const val = args[1];
        mockSqliteDb.metadata[key] = val;
        return true;
      }

      return true;
    });

    storageService = new EncryptedLocalStorageService();
    await storageService.initialize();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('1. Chuyển đổi dữ liệu cũ sang SQLite và bảo toàn 100% dữ liệu AsyncStorage cũ', async () => {
    // Chuẩn bị dữ liệu giả lập ban đầu trong AsyncStorage
    const legacyPatients: PatientEntity[] = [
      {
        patientId: 'pat_leg_01',
        ownerId: DOC_ID,
        patientCode: 'BN-LEG-01',
        fullName: 'Nguyễn Văn Minh',
        dateOfBirth: '15/05/1975',
        sex: 'MALE',
        phone: '0901234567',
        symptoms: 'Ho khan kéo dài',
        status: 'ACTIVE',
        revision: 1,
        syncState: 'synced',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T10:00:00.000Z',
      },
      {
        patientId: 'pat_leg_02',
        ownerId: DOC_ID,
        patientCode: 'BN-LEG-02',
        fullName: 'Lê Thị Hoa',
        dateOfBirth: '20/10/1982',
        sex: 'FEMALE',
        phone: '0912345678',
        symptoms: 'Đau tức ngực',
        status: 'ACTIVE',
        revision: 1,
        syncState: 'pending',
        createdAt: '2026-10-25T11:00:00.000Z',
        updatedAt: '2026-10-25T11:00:00.000Z',
      },
    ];

    const legacyCases: CaseEntity[] = [
      {
        caseId: 'cas_leg_01',
        ownerId: DOC_ID,
        caseCode: 'CA-2026-000001',
        patientId: 'pat_leg_01',
        scanDate: '2026-10-25',
        status: 'COMPLETED',
        clinicalNote: 'CT ngực có cản quang',
        doctorComment: 'Nốt mờ đáy phổi phải',
        revision: 2,
        syncState: 'synced',
        createdAt: '2026-10-25T10:05:00.000Z',
        updatedAt: '2026-10-25T10:30:00.000Z',
      },
    ];

    const patientKey = `@lungct_db/v1/${DOC_ID}/patients`;
    const caseKey = `@lungct_db/v1/${DOC_ID}/cases`;

    memoryStore[patientKey] = await CryptoVault.encryptAsync(DOC_ID, JSON.stringify(legacyPatients));
    memoryStore[caseKey] = await CryptoVault.encryptAsync(DOC_ID, JSON.stringify(legacyCases));

    // Thực hiện Migration
    const result = await storageService.migrateLegacyStorageToSqlite(DOC_ID);
    expect(result.status).toBe('MIGRATED');
    expect(result.migratedPatients).toBe(2);
    expect(result.migratedCases).toBe(1);

    // KIỂM CHỨNG BẢO TOÀN DỮ LIỆU CŨ: AsyncStorage vẫn còn nguyên vẹn 100%
    expect(memoryStore[patientKey]).toBeDefined();
    expect(memoryStore[caseKey]).toBeDefined();
    const rawRestoredPatients = JSON.parse(await CryptoVault.decryptAsync(DOC_ID, memoryStore[patientKey]));
    expect(rawRestoredPatients.length).toBe(2);
    expect(rawRestoredPatients[0].fullName).toBe('Nguyễn Văn Minh');

    // KIỂM CHỨNG DỮ LIỆU TRONG SQLITE CHI TIẾT TỪNG TRƯỜNG & QUAN HỆ KHÓA NGOẠI
    expect(mockSqliteDb.patients.length).toBe(2);
    expect(mockSqliteDb.cases.length).toBe(1);

    // Đối chiếu từng trường Patient 1
    const p1 = mockSqliteDb.patients.find((p) => p.patient_id === 'pat_leg_01');
    expect(p1).toBeDefined();
    expect(p1.patient_code).toBe('BN-LEG-01');
    expect(p1.full_name).toBe('Nguyễn Văn Minh');
    expect(p1.dob).toBe('15/05/1975');
    expect(p1.sex).toBe('MALE');
    expect(p1.phone).toBe('0901234567');
    expect(p1.symptoms).toBe('Ho khan kéo dài');
    expect(p1.status).toBe('ACTIVE');
    expect(p1.sync_state).toBe('synced');
    expect(p1.revision).toBe(1);
    expect(p1.created_at).toBe('2026-10-25T10:00:00.000Z');
    expect(p1.updated_at).toBe('2026-10-25T10:00:00.000Z');
    expect(p1.encrypted_payload).toBeDefined();

    // Đối chiếu từng trường Patient 2
    const p2 = mockSqliteDb.patients.find((p) => p.patient_id === 'pat_leg_02');
    expect(p2).toBeDefined();
    expect(p2.patient_code).toBe('BN-LEG-02');
    expect(p2.full_name).toBe('Lê Thị Hoa');
    expect(p2.dob).toBe('20/10/1982');
    expect(p2.sex).toBe('FEMALE');
    expect(p2.phone).toBe('0912345678');
    expect(p2.symptoms).toBe('Đau tức ngực');
    expect(p2.status).toBe('ACTIVE');
    expect(p2.sync_state).toBe('pending');
    expect(p2.revision).toBe(1);
    expect(p2.created_at).toBe('2026-10-25T11:00:00.000Z');
    expect(p2.updated_at).toBe('2026-10-25T11:00:00.000Z');

    // Đối chiếu từng trường Case 1 & Khóa ngoại tham chiếu chính xác đến Patient 1
    const c1 = mockSqliteDb.cases.find((c) => c.case_id === 'cas_leg_01');
    expect(c1).toBeDefined();
    expect(c1.patient_id).toBe(p1.patient_id); // Khóa ngoại FOREIGN KEY tham chiếu pat_leg_01
    expect(c1.case_code).toBe('CA-2026-000001');
    expect(c1.scan_date).toBe('2026-10-25');
    expect(c1.status).toBe('COMPLETED');
    expect(c1.clinical_note).toBe('CT ngực có cản quang');
    expect(c1.doctor_comment).toBe('Nốt mờ đáy phổi phải');
    expect(c1.revision).toBe(2);
    expect(c1.sync_state).toBe('synced');
    expect(c1.created_at).toBe('2026-10-25T10:05:00.000Z');
    expect(c1.updated_at).toBe('2026-10-25T10:30:00.000Z');
    expect(c1.encrypted_payload).toBeDefined();

    // Đối chiếu giải mã payload của SQLite khớp 100% với entity ban đầu
    const decryptedP1Payload = JSON.parse(await CryptoVault.decryptAsync(DOC_ID, p1.encrypted_payload));
    expect(decryptedP1Payload.fullName).toBe('Nguyễn Văn Minh');
    expect(decryptedP1Payload.patientCode).toBe('BN-LEG-01');

    const decryptedC1Payload = JSON.parse(await CryptoVault.decryptAsync(DOC_ID, c1.encrypted_payload));
    expect(decryptedC1Payload.caseCode).toBe('CA-2026-000001');
    expect(decryptedC1Payload.doctorComment).toBe('Nốt mờ đáy phổi phải');

    expect(mockSqliteDb.metadata['sqlite_migration_status']).toBe('COMPLETED');
    expect(mockSqliteDb.metadata['sqlite_migration_patient_count']).toBe('2');
    expect(mockSqliteDb.metadata['sqlite_migration_case_count']).toBe('1');
  });

  it('2. Khả năng chạy lại (Idempotency): Chạy lại lần 2 không lặp lại bản ghi', async () => {
    // Đánh dấu cờ COMPLETED
    mockSqliteDb.metadata['sqlite_migration_status'] = 'COMPLETED';

    const result = await storageService.migrateLegacyStorageToSqlite(DOC_ID);
    expect(result.status).toBe('ALREADY_COMPLETED');
    expect(result.migratedPatients).toBe(0);
    expect(result.migratedCases).toBe(0);
  });

  it('3. Khả năng phục hồi khi gián đoạn (Resume after interruption): Không nhân đôi dữ liệu', async () => {
    // Giả lập trạng thái gián đoạn: Đã chèn được 1 bệnh nhân trước khi mất điện
    mockSqliteDb.patients.push({
      patient_id: 'pat_leg_01',
      owner_id: DOC_ID,
      patient_code: 'BN-LEG-01',
      full_name: 'Nguyễn Văn Minh',
    });
    // Trạng thái metadata chưa được ghi COMPLETED
    delete mockSqliteDb.metadata['sqlite_migration_status'];

    const legacyPatients: PatientEntity[] = [
      {
        patientId: 'pat_leg_01',
        ownerId: DOC_ID,
        patientCode: 'BN-LEG-01',
        fullName: 'Nguyễn Văn Minh (Cập nhật)',
        dateOfBirth: '15/05/1975',
        sex: 'MALE',
        status: 'ACTIVE',
        revision: 2,
        syncState: 'synced',
        createdAt: '2026-10-25T10:00:00.000Z',
        updatedAt: '2026-10-25T12:00:00.000Z',
      },
      {
        patientId: 'pat_leg_02',
        ownerId: DOC_ID,
        patientCode: 'BN-LEG-02',
        fullName: 'Lê Thị Hoa',
        dateOfBirth: '20/10/1982',
        sex: 'FEMALE',
        status: 'ACTIVE',
        revision: 1,
        syncState: 'pending',
        createdAt: '2026-10-25T11:00:00.000Z',
        updatedAt: '2026-10-25T11:00:00.000Z',
      },
    ];

    const patientKey = `@lungct_db/v1/${DOC_ID}/patients`;
    memoryStore[patientKey] = await CryptoVault.encryptAsync(DOC_ID, JSON.stringify(legacyPatients));

    // Chạy lại quá trình migration
    const result = await storageService.migrateLegacyStorageToSqlite(DOC_ID);
    expect(result.status).toBe('MIGRATED');
    expect(result.migratedPatients).toBe(2);

    // Không bị nhân đôi: vẫn chính xác 2 bệnh nhân nhờ INSERT OR REPLACE
    expect(mockSqliteDb.patients.length).toBe(2);
    expect(mockSqliteDb.patients.find((p) => p.patient_id === 'pat_leg_01')?.full_name).toBe('Nguyễn Văn Minh (Cập nhật)');
    expect(mockSqliteDb.metadata['sqlite_migration_status']).toBe('COMPLETED');
  });
});
