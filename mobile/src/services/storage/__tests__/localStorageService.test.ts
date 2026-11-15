/**
 * BỘ KIỂM THỬ TẦNG LƯU TRỮ CƠ SỞ DỮ LIỆU CỤC BỘ (LOCAL STORAGE TEST SUITE)
 *
 * Môi trường & Giới hạn kiểm thử:
 * - Chạy trong Jest sandbox với in-memory mock của AsyncStorage.
 * - Sử dụng 100% DỮ LIỆU GIẢ ĐỊNH TỔNG HỢP (synthetic mock data), TUYỆT ĐỐI KHÔNG DÙNG DỮ LIỆU BỆNH NHÂN THẬT.
 * - Kiểm thử việc lưu rồi đóng service/mở lại instance mới trên cùng memoryStore (mô phỏng lifecycle).
 * - CHƯA KIỂM CHỨNG: Việc kill app và mở lại trên thiết bị thật/máy ảo qua APK chạy thực tế (cần kiểm chứng
 *   khi module lưu trữ được gắn kết trực tiếp vào các màn hình UI của ứng dụng).
 *
 * Tiêu chí kiểm tra:
 * 1. Mã hóa/xáo trộn CryptoVault & kiểm tra tính toàn vẹn (checksum).
 * 2. Thao tác CRUD Bệnh nhân & Ca bệnh.
 * 3. Kiểm tra tính bền vững: Đóng và nạp lại instance mới.
 * 4. Lọc dữ liệu theo ownerId giữa Bác sĩ A và Bác sĩ B (Application-level multi-tenancy).
 * 5. Bắt lỗi trùng lặp mã bệnh nhân (Q-20).
 * 6. Chính sách tài khoản bị khóa (AUTH-08): Chỉ xóa dữ liệu đã đồng bộ (synced), bảo toàn nháp (pending).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptedLocalStorageService } from '../localStorageService';
import { CryptoVault } from '../cryptoVault';

// Mock in-memory AsyncStorage để kiểm thử chuẩn Jest
const memoryStore: Record<string, string> = {};

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

describe('Local Encrypted Storage Persistence & Security Tests', () => {
  let storage: EncryptedLocalStorageService;
  const DOC_A = 'doc-nguyen-van-a';
  const DOC_B = 'doc-tran-thi-b';

  beforeEach(async () => {
    await AsyncStorage.clear();
    storage = new EncryptedLocalStorageService();
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.close();
  });

  describe('1. Kiểm tra Bộ mã hóa & Bảo vệ dữ liệu (CryptoVault AES-256-GCM & PBKDF2)', () => {
    it('mã hóa payload JSON bằng AES-256-GCM và giải mã chính xác', () => {
      const payload = JSON.stringify({ patientName: 'Nguyễn Văn An', age: 58 });
      const key = CryptoVault.deriveOwnerKey(DOC_A);

      const cipherText = CryptoVault.encrypt(payload, key);
      expect(cipherText.startsWith('ENC:AES-256-GCM:v1:')).toBe(true);
      expect(cipherText).not.toContain('Nguyễn Văn An'); // Không lưu plaintext

      const decrypted = CryptoVault.decrypt(cipherText, key);
      expect(JSON.parse(decrypted)).toEqual({ patientName: 'Nguyễn Văn An', age: 58 });
    });

    it('từ chối giải mã và báo lỗi xác thực khi bị can thiệp dữ liệu hoặc sai khóa bác sĩ (AEAD Auth)', () => {
      const payload = 'SecretMedicalNotes';
      const keyA = CryptoVault.deriveOwnerKey(DOC_A);
      const keyB = CryptoVault.deriveOwnerKey(DOC_B);

      const cipherText = CryptoVault.encrypt(payload, keyA);

      // Giải mã bằng khóa của Bác sĩ B sẽ thất bại do sai khóa dẫn xuất PBKDF2
      expect(() => CryptoVault.decrypt(cipherText, keyB)).toThrow();

      // Can thiệp chuỗi mã hóa ciphertext (bit flip / tamper)
      const parts = cipherText.split(':');
      parts[5] = parts[5].substring(0, parts[5].length - 2) + 'ff';
      const tampered = parts.join(':');

      expect(() => CryptoVault.decrypt(tampered, keyA)).toThrow();
    });

    it('từ chối giải mã và ném lỗi rõ ràng khi gặp khóa sai hoặc dữ liệu hỏng định dạng', () => {
      const payload = JSON.stringify({ note: 'Ghi chú thử nghiệm' });
      const validKey = CryptoVault.deriveOwnerKey(DOC_A);
      const invalidKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      const cipherText = CryptoVault.encrypt(payload, validKey);

      // Thử giải mã với khóa sai ngẫu nhiên
      expect(() => CryptoVault.decrypt(cipherText, invalidKey)).toThrow();

      // Thử giải mã chuỗi không đúng định dạng ENC:AES-256-GCM:v1
      expect(() => CryptoVault.decrypt('INVALID_CIPHER_TEXT', validKey)).toThrow(
        /Định dạng dữ liệu mã hóa không được hỗ trợ/,
      );
    });

    it('tương thích ngược: giải mã chính xác các bản ghi định dạng cũ ENC:v1 để phục vụ migration', () => {
      const oldPayload = JSON.stringify({ patientCode: 'BN-OLD-01', note: 'Hồ sơ tạo từ bản cũ' });
      // Giả lập chuỗi mã hóa ENC:v1 cũ
      const rawKey = 'test_legacy_key_1234567890abcdef';
      const checksum = CryptoVault.simpleHash(oldPayload);
      let legacyCipher = '';
      for (let i = 0; i < oldPayload.length; i++) {
        const charCode = oldPayload.charCodeAt(i);
        const keyChar = rawKey.charCodeAt(i % rawKey.length);
        legacyCipher += (charCode ^ keyChar).toString(16).padStart(4, '0');
      }
      const legacyEncrypted = `ENC:v1:${checksum}:${legacyCipher}`;

      const decrypted = CryptoVault.decrypt(legacyEncrypted, rawKey);
      expect(JSON.parse(decrypted)).toEqual({
        patientCode: 'BN-OLD-01',
        note: 'Hồ sơ tạo từ bản cũ',
      });
    });
  });

  describe('2. Thao tác CRUD Bệnh nhân & Kiểm tra trùng mã (Q-20)', () => {
    it('tạo thành công bệnh nhân mới và đọc lại', async () => {
      const patient = await storage.createPatient(DOC_A, {
        patientCode: 'BN-001',
        fullName: 'Lê Văn Cường',
        dateOfBirth: '15/08/1975',
        sex: 'MALE',
        phone: '0901234567',
        symptoms: 'Ho khan có đờm',
      });

      expect(patient.patientId).toBeDefined();
      expect(patient.ownerId).toBe(DOC_A);
      expect(patient.status).toBe('ACTIVE');

      const list = await storage.getPatients(DOC_A);
      expect(list).toHaveLength(1);
      expect(list[0].fullName).toBe('Lê Văn Cường');
    });

    it('ngăn chặn tạo trùng patientCode cho cùng một bác sĩ (Q-20)', async () => {
      await storage.createPatient(DOC_A, {
        patientCode: 'BN-DUPLICATE',
        fullName: 'Bệnh Nhân 1',
        dateOfBirth: '01/01/1980',
        sex: 'FEMALE',
      });

      await expect(
        storage.createPatient(DOC_A, {
          patientCode: 'BN-DUPLICATE',
          fullName: 'Bệnh Nhân Trùng Mã',
          dateOfBirth: '02/02/1982',
          sex: 'MALE',
        }),
      ).rejects.toThrow(/đã tồn tại trong danh sách của bạn/);
    });

    it('cho phép cập nhật thông tin và chuyển bệnh nhân vào thùng rác', async () => {
      const created = await storage.createPatient(DOC_A, {
        patientCode: 'BN-EDIT',
        fullName: 'Phạm Thị Duyên',
        dateOfBirth: '10/10/1990',
        sex: 'FEMALE',
      });

      const updated = await storage.updatePatient(DOC_A, created.patientId, {
        fullName: 'Phạm Thị Mỹ Duyên',
        note: 'Đã bổ sung tiền sử hen suyễn',
      });

      expect(updated.fullName).toBe('Phạm Thị Mỹ Duyên');
      expect(updated.note).toBe('Đã bổ sung tiền sử hen suyễn');
      expect(updated.revision).toBe(2);

      // Chuyển vào thùng rác
      const trashed = await storage.trashPatient(DOC_A, created.patientId);
      expect(trashed).toBe(true);

      const activeList = await storage.getPatients(DOC_A, false);
      expect(activeList).toHaveLength(0);

      const allList = await storage.getPatients(DOC_A, true);
      expect(allList).toHaveLength(1);
      expect(allList[0].status).toBe('TRASHED');

      // Khôi phục
      await storage.restorePatient(DOC_A, created.patientId);
      const restoredList = await storage.getPatients(DOC_A, false);
      expect(restoredList).toHaveLength(1);
      expect(restoredList[0].status).toBe('ACTIVE');
    });
  });

  describe('3. Kiểm tra tính Bền vững (Persistence sau khi Khởi động lại)', () => {
    it('bảo toàn nguyên vẹn dữ liệu khi service bị đóng và nạp lại từ AsyncStorage', async () => {
      // 1. Bác sĩ A tạo bệnh nhân và ca bệnh
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-PERSIST',
        fullName: 'Vũ Minh Tuấn',
        dateOfBirth: '20/12/1965',
        sex: 'MALE',
      });

      const c = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-10-27',
        clinicalNote: 'Nốt mờ thùy trên phổi phải',
      });

      expect(c.caseCode).toMatch(/^CA-\d{4}-\d{6}$/);

      // 2. Giả lập app bị kill / đóng storage service
      await storage.close();

      // 3. Khởi tạo instance mới hoàn toàn (giả lập mở lại app)
      const newStorageInstance = new EncryptedLocalStorageService();
      await newStorageInstance.initialize();

      // 4. Đọc lại dữ liệu
      const patients = await newStorageInstance.getPatients(DOC_A);
      expect(patients).toHaveLength(1);
      expect(patients[0].fullName).toBe('Vũ Minh Tuấn');

      const cases = await newStorageInstance.getCases(DOC_A, p.patientId);
      expect(cases).toHaveLength(1);
      expect(cases[0].clinicalNote).toBe('Nốt mờ thùy trên phổi phải');

      await newStorageInstance.close();
    });

    it('kiểm tra và thực thi migration schema thành công', async () => {
      // Chạy migration schema
      const migrationResult = await storage.migrateSchemaIfNeeded(DOC_A);
      expect(migrationResult.toVersion).toBe(1);

      // Đọc lại metadata đã ghi
      const keys = (storage as any).getKeys(DOC_A);
      const metaRaw = await AsyncStorage.getItem(keys.metadata);
      expect(metaRaw).toBeDefined();

      const key = CryptoVault.deriveOwnerKey(DOC_A);
      const metaJson = CryptoVault.decrypt(metaRaw!, key);
      const meta = JSON.parse(metaJson);

      expect(meta.ownerId).toBe(DOC_A);
      expect(meta.schemaVersion).toBe(1);
      expect(meta.lastMigratedAt).toBeDefined();
    });
  });

  describe('4. Cô lập dữ liệu giữa Bác sĩ A và Bác sĩ B (Multi-Tenancy)', () => {
    it('Bác sĩ B không thể đọc hoặc thấy dữ liệu của Bác sĩ A', async () => {
      // Bác sĩ A tạo bệnh nhân
      await storage.createPatient(DOC_A, {
        patientCode: 'BN-DOC-A',
        fullName: 'Bệnh Nhân Của Bác Sĩ A',
        dateOfBirth: '05/05/1970',
        sex: 'MALE',
      });

      // Bác sĩ B tạo bệnh nhân với cùng mã (được phép vì phân vùng khác nhau)
      await storage.createPatient(DOC_B, {
        patientCode: 'BN-DOC-A',
        fullName: 'Bệnh Nhân Khác Của Bác Sĩ B',
        dateOfBirth: '06/06/1985',
        sex: 'FEMALE',
      });

      const listA = await storage.getPatients(DOC_A);
      const listB = await storage.getPatients(DOC_B);

      expect(listA).toHaveLength(1);
      expect(listA[0].fullName).toBe('Bệnh Nhân Của Bác Sĩ A');

      expect(listB).toHaveLength(1);
      expect(listB[0].fullName).toBe('Bệnh Nhân Khác Của Bác Sĩ B');
    });
  });

  describe('5. Quản lý Ca bệnh & Kết quả Phân tích AI', () => {
    it('lưu ảnh CT và kết quả phân tích AI đúng quan hệ phiên bản', async () => {
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-AI-TEST',
        fullName: 'Đoàn Kim Oanh',
        dateOfBirth: '14/02/1988',
        sex: 'FEMALE',
      });

      const c = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-10-27',
      });

      // Lưu ảnh CT
      const img = await storage.saveCTImage(DOC_A, {
        caseId: c.caseId,
        ownerId: DOC_A,
        imageVersion: 1,
        orderIndex: 0,
        source: 'LIBRARY',
        mimeType: 'image/jpeg',
        width: 512,
        height: 512,
        byteSize: 154511,
        sha256: '925E9AB76B0A7EE5FF91F202DE4AFE25A5BFA3007CFAC7FC292F098542AE4A69',
        localFileRef: 'app://storage/ct/img_001.jpg',
        state: 'ACTIVE',
      });

      expect(img.imageId).toBeDefined();

      // Lưu kết quả AI
      const pred = await storage.savePredictionResult(DOC_A, {
        imageId: img.imageId,
        imageVersion: 1,
        classificationStatus: 'PASS',
        scores: [0.972849, 0.000188, 0.026962],
        label: 'BENIGN',
        explanationStatus: 'UNAVAILABLE',
        modelVersion: 'Adaptive-AACNN-ViT-FP32-v1',
        preprocessingVersion: 'Pillow-Nearest-v1',
        executionSource: 'LOCAL',
        mode: 'REAL',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 1175,
        state: 'CURRENT',
      });

      expect(pred.resultId).toBeDefined();

      const latest = await storage.getLatestPrediction(DOC_A, img.imageId);
      expect(latest?.label).toBe('BENIGN');
      expect(latest?.scores?.[0]).toBeCloseTo(0.972849, 5);

      // Thống kê bác sĩ
      const stats = await storage.getDoctorStats(DOC_A);
      expect(stats.patientCount).toBe(1);
      expect(stats.activeCaseCount).toBe(1);
      expect(stats.analyzedImageCount).toBe(1);
      expect(stats.labelDistribution.benign).toBe(1);
      expect(stats.labelDistribution.malignant).toBe(0);
    });
  });

  describe('6. Chính sách tài khoản bị khóa (AUTH-08: Purge Synced Data, Retain Drafts)', () => {
    it('chỉ xóa dữ liệu đã đồng bộ (synced) và bảo toàn nháp chưa đồng bộ (pending/conflict)', async () => {
      // 1. Tạo 1 bệnh nhân đã đồng bộ và 1 bệnh nhân nháp chưa đồng bộ
      const pSynced = await storage.createPatient(DOC_A, {
        patientCode: 'BN-SYNCED-01',
        fullName: 'Bệnh Nhân Đã Đồng Bộ',
        dateOfBirth: '01/01/1980',
        sex: 'MALE',
      });
      // Giả lập trạng thái đã đồng bộ thành công
      pSynced.syncState = 'synced';
      // Ghi đè vào storage
      const keys = (storage as any).getKeys(DOC_A);
      const patients = await (storage as any).readEncryptedTable(DOC_A, keys.patients);
      const updatedPatients = patients.map((p: any) =>
        p.patientId === pSynced.patientId ? { ...p, syncState: 'synced' } : p,
      );
      await (storage as any).writeEncryptedTable(DOC_A, keys.patients, updatedPatients);

      const pDraft = await storage.createPatient(DOC_A, {
        patientCode: 'BN-DRAFT-02',
        fullName: 'Bệnh Nhân Nháp Chưa Đồng Bộ',
        dateOfBirth: '02/02/1990',
        sex: 'FEMALE',
      });
      // Mặc định createPatient sinh ra syncState === 'pending'
      expect(pDraft.syncState).toBe('pending');

      // 2. Tạo 1 ca bệnh synced gắn với pSynced và 1 ca bệnh draft gắn với pDraft
      const cSynced = await storage.createCase(DOC_A, {
        patientId: pSynced.patientId,
        scanDate: '2026-10-20',
        clinicalNote: 'Ca bệnh cũ đã đồng bộ lên cloud',
      });
      const cases = await (storage as any).readEncryptedTable(DOC_A, keys.cases);
      const updatedCases = cases.map((c: any) =>
        c.caseId === cSynced.caseId ? { ...c, syncState: 'synced' } : c,
      );
      await (storage as any).writeEncryptedTable(DOC_A, keys.cases, updatedCases);

      const cDraft = await storage.createCase(DOC_A, {
        patientId: pDraft.patientId,
        scanDate: '2026-10-27',
        clinicalNote: 'Ca bệnh mới vừa nhập offline chưa đồng bộ',
      });
      expect(cDraft.syncState).toBe('pending');

      // Kiểm tra trước khi khóa: cả 2 bệnh nhân và 2 ca bệnh đều tồn tại
      expect(await storage.getPatients(DOC_A)).toHaveLength(2);
      expect(await storage.getCases(DOC_A)).toHaveLength(2);

      // 3. Thực thi chính sách AUTH-08 khi tài khoản bị khóa
      const purgeSummary = await storage.purgeSyncedDataOnAccountLocked(DOC_A);

      expect(purgeSummary.purgedPatientsCount).toBe(1);
      expect(purgeSummary.retainedDraftPatientsCount).toBe(1);
      expect(purgeSummary.purgedCasesCount).toBe(1);
      expect(purgeSummary.retainedDraftCasesCount).toBe(1);

      // 4. Kiểm tra dữ liệu thực tế trong storage sau khi khóa
      const remainingPatients = await storage.getPatients(DOC_A);
      expect(remainingPatients).toHaveLength(1);
      expect(remainingPatients[0].patientCode).toBe('BN-DRAFT-02');
      expect(remainingPatients[0].syncState).toBe('pending');

      const remainingCases = await storage.getCases(DOC_A);
      expect(remainingCases).toHaveLength(1);
      expect(remainingCases[0].caseId).toBe(cDraft.caseId);
      expect(remainingCases[0].syncState).toBe('pending');
    });

    it('bảo toàn bệnh nhân đã đồng bộ khi bệnh nhân đó có ca nháp chưa đồng bộ, không làm đứt gãy liên kết hồ sơ', async () => {
      // Tình huống thực tế:
      // Bệnh nhân P1 đã được tạo và đồng bộ lên server từ trước (syncState = 'synced').
      // Hôm nay bác sĩ tạo một ca chụp CT mới C1 cho P1 ở chế độ offline (syncState = 'pending').
      // Tài khoản bị khóa: chính sách AUTH-08 không được xóa P1 vì nếu xóa P1 thì C1 sẽ mồ côi (mất liên kết).

      const p1 = await storage.createPatient(DOC_A, {
        patientCode: 'BN-LINK-SYNCED',
        fullName: 'Trần Văn Đồng Bộ',
        dateOfBirth: '12/12/1984',
        sex: 'MALE',
      });
      // Đánh dấu p1 đã đồng bộ
      const keys = (storage as any).getKeys(DOC_A);
      const patients = await (storage as any).readEncryptedTable(DOC_A, keys.patients);
      const updatedPatients = patients.map((p: any) =>
        p.patientId === p1.patientId ? { ...p, syncState: 'synced' } : p,
      );
      await (storage as any).writeEncryptedTable(DOC_A, keys.patients, updatedPatients);

      // Tạo một bệnh nhân khác p2 đã đồng bộ và chỉ có ca đã đồng bộ (sẽ bị xóa sạch)
      const p2 = await storage.createPatient(DOC_A, {
        patientCode: 'BN-FULL-SYNCED',
        fullName: 'Ngô Thị Sạch Sẽ',
        dateOfBirth: '05/05/1979',
        sex: 'FEMALE',
      });
      const patients2 = await (storage as any).readEncryptedTable(DOC_A, keys.patients);
      const updatedPatients2 = patients2.map((p: any) =>
        p.patientId === p2.patientId ? { ...p, syncState: 'synced' } : p,
      );
      await (storage as any).writeEncryptedTable(DOC_A, keys.patients, updatedPatients2);

      // Ca c1 gắn với p1 là NHÁP CHƯA ĐỒNG BỘ (pending)
      const c1Draft = await storage.createCase(DOC_A, {
        patientId: p1.patientId,
        scanDate: '2026-10-27',
        clinicalNote: 'Ca nháp mới chụp hôm nay chưa kịp sync',
      });
      expect(c1Draft.syncState).toBe('pending');

      // Ca c2 gắn với p2 là ĐÃ ĐỒNG BỘ (synced)
      const c2Synced = await storage.createCase(DOC_A, {
        patientId: p2.patientId,
        scanDate: '2026-10-20',
        clinicalNote: 'Ca cũ đã đồng bộ tuần trước',
      });
      const cases = await (storage as any).readEncryptedTable(DOC_A, keys.cases);
      const updatedCases = cases.map((c: any) =>
        c.caseId === c2Synced.caseId ? { ...c, syncState: 'synced' } : c,
      );
      await (storage as any).writeEncryptedTable(DOC_A, keys.cases, updatedCases);

      // Kiểm tra trước khi khóa: có 2 bệnh nhân, 2 ca
      expect(await storage.getPatients(DOC_A)).toHaveLength(2);
      expect(await storage.getCases(DOC_A)).toHaveLength(2);

      // Kích hoạt xử lý tài khoản bị khóa
      const purgeResult = await storage.purgeSyncedDataOnAccountLocked(DOC_A);

      // P2 bị xóa (vì p2 synced và không có ca nháp nào phụ thuộc)
      // P1 ĐƯỢC GIỮ LẠI dù p1 đã synced (vì c1Draft phụ thuộc vào p1)
      expect(purgeResult.purgedPatientsCount).toBe(1);
      expect(purgeResult.retainedDraftPatientsCount).toBe(1);
      // C2 bị xóa (vì c2 synced), C1 được giữ lại (vì c1 pending)
      expect(purgeResult.purgedCasesCount).toBe(1);
      expect(purgeResult.retainedDraftCasesCount).toBe(1);

      // Kiểm tra sau khi khóa
      const remainingPatients = await storage.getPatients(DOC_A);
      expect(remainingPatients).toHaveLength(1);
      expect(remainingPatients[0].patientId).toBe(p1.patientId);
      expect(remainingPatients[0].patientCode).toBe('BN-LINK-SYNCED');

      const remainingCases = await storage.getCases(DOC_A);
      expect(remainingCases).toHaveLength(1);
      expect(remainingCases[0].caseId).toBe(c1Draft.caseId);
      expect(remainingCases[0].patientId).toBe(p1.patientId); // Liên kết khóa ngoại hoàn toàn nguyên vẹn!
    });
  });

  describe('7. Đồng bộ hóa Outbox & Hợp nhất đám mây (Sync Outbox & Merge)', () => {
    it('đánh dấu synced theo đúng revision và bảo vệ dữ liệu pending khi phát hiện xung đột', async () => {
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-SYNC-01',
        fullName: 'Phạm Minh Tuấn',
        dateOfBirth: '12/12/1982',
        sex: 'MALE',
      });
      const c = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-11-12',
      });

      const pendingBefore = await storage.getPendingSyncItems(DOC_A);
      expect(pendingBefore.patients).toHaveLength(1);
      expect(pendingBefore.cases).toHaveLength(1);

      // Đánh dấu đã đồng bộ đúng revision
      await storage.markPatientSynced(DOC_A, p.patientId, p.revision);
      await storage.markCaseSynced(DOC_A, c.caseId, c.revision);

      const pendingAfter = await storage.getPendingSyncItems(DOC_A);
      expect(pendingAfter.patients).toHaveLength(0);
      expect(pendingAfter.cases).toHaveLength(0);

      // Kéo bản mới từ cloud về khi local đang synced -> updated
      const mergeUpdated = await storage.upsertPatientFromCloud(DOC_A, {
        ...p,
        fullName: 'Phạm Minh Tuấn (Cập nhật)',
        revision: 3,
      });
      expect(mergeUpdated).toBe('updated');
      const reloadedP = await storage.getPatientById(DOC_A, p.patientId);
      expect(reloadedP?.fullName).toBe('Phạm Minh Tuấn (Cập nhật)');
      expect(reloadedP?.syncState).toBe('synced');

      // Sửa cục bộ (trở về pending với revision 4) nhưng nhận được bản cloud revision 6 -> conflict
      await storage.updatePatient(DOC_A, p.patientId, { phone: '0909123456' });
      const mergeConflict = await storage.upsertPatientFromCloud(DOC_A, {
        ...p,
        fullName: 'Tên từ thiết bị khác',
        revision: 6,
      });
      expect(mergeConflict).toBe('conflict');
      const conflictedP = await storage.getPatientById(DOC_A, p.patientId);
      expect(conflictedP?.syncState).toBe('conflict');
      expect(conflictedP?.phone).toBe('0909123456'); // Giữ nguyên dữ liệu cục bộ, không ghi đè
    });
  });

  describe('8. Chính sách vòng đời dữ liệu, Cascade Soft-Delete & Gỡ bỏ ảnh CT (Chính sách 1A, 2A, 4A, 5A)', () => {
    it('Cascade Soft-Delete & Restore: Xóa mềm bệnh nhân sẽ tự động xóa mềm các ca con, khôi phục bệnh nhân sẽ khôi phục ca con (5A)', async () => {
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-CASCADE-01',
        fullName: 'Lê Hoàng Long',
        dateOfBirth: '01/01/1975',
        sex: 'MALE',
      });
      const c1 = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-11-14',
      });
      const c2 = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-11-15',
      });
      // Hoàn tất ca c2
      await storage.completeCase(DOC_A, c2.caseId);

      // Xóa mềm bệnh nhân
      await storage.trashPatient(DOC_A, p.patientId);

      // Kiểm tra: Bệnh nhân và cả 2 ca con đều TRASHED
      const trashedP = await storage.getPatientById(DOC_A, p.patientId);
      expect(trashedP?.status).toBe('TRASHED');
      const activeCases = await storage.getCases(DOC_A, p.patientId, false);
      expect(activeCases).toHaveLength(0); // Không xuất hiện trong danh sách active
      const allCases = await storage.getCases(DOC_A, p.patientId, true);
      expect(allCases).toHaveLength(2);
      expect(allCases.every((c) => c.status === 'TRASHED')).toBe(true);

      // Khôi phục bệnh nhân
      await storage.restorePatient(DOC_A, p.patientId);

      // Kiểm tra: Bệnh nhân ACTIVE, c1 về DRAFT, c2 về COMPLETED
      const restoredP = await storage.getPatientById(DOC_A, p.patientId);
      expect(restoredP?.status).toBe('ACTIVE');
      const restoredCases = await storage.getCases(DOC_A, p.patientId, false);
      expect(restoredCases).toHaveLength(2);
      const reC1 = restoredCases.find((c) => c.caseId === c1.caseId);
      const reC2 = restoredCases.find((c) => c.caseId === c2.caseId);
      expect(reC1?.status).toBe('DRAFT');
      expect(reC2?.status).toBe('COMPLETED');
    });

    it('Khôi phục ca bệnh đơn lẻ từ thùng rác (4A)', async () => {
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-CASE-RESTORE',
        fullName: 'Trần Văn Cường',
        dateOfBirth: '15/05/1980',
        sex: 'MALE',
      });
      const c = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-11-15',
      });

      // Xóa ca
      await storage.trashCase(DOC_A, c.caseId);
      const casesActiveAfterTrash = await storage.getCases(DOC_A, p.patientId, false);
      expect(casesActiveAfterTrash).toHaveLength(0);

      // Khôi phục ca
      const restored = await storage.restoreCase(DOC_A, c.caseId);
      expect(restored).toBe(true);

      const casesActiveAfterRestore = await storage.getCases(DOC_A, p.patientId, false);
      expect(casesActiveAfterRestore).toHaveLength(1);
      expect(casesActiveAfterRestore[0].status).toBe('DRAFT');
      expect(casesActiveAfterRestore[0].trashedAt).toBeUndefined();
    });

    it('Xóa lát cắt CT, đánh dấu REMOVED, hủy kết quả AI sang SUPERSEDED và cập nhật ca (1A, 2A)', async () => {
      const p = await storage.createPatient(DOC_A, {
        patientCode: 'BN-IMG-DEL',
        fullName: 'Ngô Thu Thảo',
        dateOfBirth: '20/03/1990',
        sex: 'FEMALE',
      });
      const c = await storage.createCase(DOC_A, {
        patientId: p.patientId,
        scanDate: '2026-11-15',
      });

      // Thêm 2 ảnh CT
      const img1 = await storage.saveCTImage(DOC_A, {
        caseId: c.caseId,
        ownerId: DOC_A,
        imageVersion: 1,
        orderIndex: 0,
        source: 'LIBRARY',
        mimeType: 'image/png',
        width: 512,
        height: 512,
        byteSize: 1024,
        sha256: 'abc1',
        localFileRef: 'file:///sandbox/img1.png',
        state: 'ACTIVE',
      });
      const img2 = await storage.saveCTImage(DOC_A, {
        caseId: c.caseId,
        ownerId: DOC_A,
        imageVersion: 1,
        orderIndex: 1,
        source: 'LIBRARY',
        mimeType: 'image/png',
        width: 512,
        height: 512,
        byteSize: 2048,
        sha256: 'abc2',
        localFileRef: 'file:///sandbox/img2.png',
        state: 'ACTIVE',
      });

      // Lưu kết quả AI cho cả 2 ảnh
      await storage.savePredictionResult(DOC_A, {
        imageId: img1.imageId,
        imageVersion: 1,
        classificationStatus: 'PASS',
        label: 'MALIGNANT',
        scores: [0.05, 0.9, 0.05],
        explanationStatus: 'UNAVAILABLE',
        modelVersion: '1.0.0',
        preprocessingVersion: '1.0.0',
        executionSource: 'LOCAL',
        mode: 'REAL',
        state: 'CURRENT',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 1200,
      });
      await storage.savePredictionResult(DOC_A, {
        imageId: img2.imageId,
        imageVersion: 1,
        classificationStatus: 'PASS',
        label: 'BENIGN',
        scores: [0.85, 0.1, 0.05],
        explanationStatus: 'UNAVAILABLE',
        modelVersion: '1.0.0',
        preprocessingVersion: '1.0.0',
        executionSource: 'LOCAL',
        mode: 'REAL',
        state: 'CURRENT',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 1100,
      });

      // Xóa lát cắt img1 (ảnh Malignant)
      const removed = await storage.removeCTImage(DOC_A, img1.imageId);
      expect(removed).toBe(true);

      // 1. Chỉ còn img2 đang ACTIVE trong getImagesByCaseId
      const activeImages = await storage.getImagesByCaseId(DOC_A, c.caseId);
      expect(activeImages).toHaveLength(1);
      expect(activeImages[0].imageId).toBe(img2.imageId);

      // 2. Kết quả AI của img1 đã bị chuyển sang SUPERSEDED
      const latestPred1 = await storage.getLatestPrediction(DOC_A, img1.imageId);
      expect(latestPred1).toBeNull(); // Không còn kết quả CURRENT

      const latestPred2 = await storage.getLatestPrediction(DOC_A, img2.imageId);
      expect(latestPred2?.label).toBe('BENIGN');
      expect(latestPred2?.state).toBe('CURRENT');

      // 3. Ca bệnh được tăng revision để đồng bộ
      const reloadedCase = await storage.getCaseById(DOC_A, c.caseId);
      expect(reloadedCase?.syncState).toBe('pending');
      expect(reloadedCase?.revision).toBe(2);
    });
  });
});
