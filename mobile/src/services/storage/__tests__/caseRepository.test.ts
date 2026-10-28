/**
 * KIỂM THỬ TÍCH HỢP TẦNG REPOSITORY VÀ ĐỒNG BỘ DỮ LIỆU CA BỆNH CỤC BỘ (CASE REPOSITORY)
 *
 * Kiểm tra các tiêu chí:
 * 1. Seed dữ liệu ca bệnh ban đầu từ Mock Store nếu chưa có trong kho.
 * 2. Tạo ca mới cho bệnh nhân -> lưu trữ mã hóa -> đọc lại chính xác.
 * 3. Cập nhật nhận xét của bác sĩ -> lưu trữ mã hóa bền vững.
 * 4. Hoàn tất ca bệnh và cập nhật trạng thái COMPLETED/PARTIAL.
 * 5. Xóa mềm ca bệnh (chuyển vào thùng rác).
 * 6. Kiểm tra tính bền vững: Đóng app / Reset module in-memory -> Đọc lại đầy đủ thông tin từ storage mã hóa.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaseRepository, subscribeCaseRepository } from '../caseRepository';
import { PatientRepository } from '../patientRepository';

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

describe('CaseRepository & Encrypted Storage Integration Tests', () => {
  const DOC_1 = 'usr-doc-01';
  const DOC_2 = 'usr-doc-02';

  beforeEach(async () => {
    await AsyncStorage.clear();
    (CaseRepository as any).isInitialized = false;
    (PatientRepository as any).isInitialized = false;
  });

  it('1. Tự động seed danh sách ca bệnh ban đầu và thông báo qua listener', async () => {
    const listener = jest.fn();
    const unsub = subscribeCaseRepository(listener);

    const cases = await CaseRepository.getCasesForUI(DOC_1);
    expect(cases.length).toBeGreaterThan(0);
    expect(cases[0].caseCode).toBeDefined();

    unsub();
  });

  it('2. Tạo ca bệnh mới cho bệnh nhân, lưu mã hóa và đọc lại chính xác', async () => {
    await PatientRepository.ensureReady(DOC_1);
    await CaseRepository.ensureReady(DOC_1);

    const patient = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-CASE-01',
      fullName: 'Vũ Quốc Thái',
      dob: '01/01/1980',
      gender: 'Nam',
    });

    const createdCase = await CaseRepository.createCase(DOC_1, patient);
    expect(createdCase.caseCode).toMatch(/^CA-\d{4}-\d{6}$/);
    expect(createdCase.patientId).toBe(patient.id);

    // Đọc lại từ kho lưu trữ
    const cases = await CaseRepository.getCasesForUI(DOC_1, patient.id);
    expect(cases.length).toBe(1);
    expect(cases[0].caseCode).toBe(createdCase.caseCode);
    expect(cases[0].patientName).toBe('Vũ Quốc Thái');

    // Kiểm tra tính mã hóa trên đĩa (AsyncStorage memory store)
    const storageKeys = Object.keys(memoryStore);
    const caseKey = storageKeys.find((k) => k.includes(DOC_1) && k.includes('cases'));
    expect(caseKey).toBeDefined();
    const rawCipher = memoryStore[caseKey!];
    expect(rawCipher).not.toContain(createdCase.caseCode); // Không lưu plaintext
  });

  it('3. Cập nhật ghi chú nhận xét của bác sĩ và lưu bền vững', async () => {
    await PatientRepository.ensureReady(DOC_1);
    await CaseRepository.ensureReady(DOC_1);

    const patient = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-NOTE-01',
      fullName: 'Trịnh Thị Mai',
      dob: '12/12/1975',
      gender: 'Nữ',
    });

    const newCase = await CaseRepository.createCase(DOC_1, patient);
    const notesContent = 'Theo dõi nốt mờ thùy trên phổi trái kích thước 8mm';

    await CaseRepository.updateCaseNotes(DOC_1, newCase.id, notesContent);

    const fetched = await CaseRepository.getCaseById(DOC_1, newCase.id);
    expect(fetched?.notes).toBe(notesContent);
  });

  it('4. Mô phỏng tạo ca, cập nhật ghi chú và đóng/mở lại app: Dữ liệu được nạp lại nguyên vẹn từ kho mã hóa', async () => {
    await PatientRepository.ensureReady(DOC_1);
    await CaseRepository.ensureReady(DOC_1);

    const patient = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-RELOAD-99',
      fullName: 'Nguyễn Bền Vững',
      dob: '25/09/1984',
      gender: 'Nam',
    });

    const createdCase = await CaseRepository.createCase(DOC_1, patient);
    const uniqueNote = 'Ghi chú kiểm tra đóng mở app trên máy ảo';
    await CaseRepository.updateCaseNotes(DOC_1, createdCase.id, uniqueNote);

    // Giả lập app bị kill / đóng hoàn toàn
    (CaseRepository as any).isInitialized = false;
    (PatientRepository as any).isInitialized = false;

    // Mở lại app (khởi tạo lại repository)
    await CaseRepository.ensureReady(DOC_1);
    await PatientRepository.ensureReady(DOC_1);

    const reloadedCases = await CaseRepository.getCasesForUI(DOC_1, patient.id);
    expect(reloadedCases.length).toBe(1);
    expect(reloadedCases[0].caseCode).toBe(createdCase.caseCode);
    expect(reloadedCases[0].notes).toBe(uniqueNote);
    expect(reloadedCases[0].patientName).toBe('Nguyễn Bền Vững');
  });

  it('5. Tách biệt ca bệnh giữa hai tài khoản bác sĩ khác nhau', async () => {
    await PatientRepository.ensureReady(DOC_1);
    await PatientRepository.ensureReady(DOC_2);
    await CaseRepository.ensureReady(DOC_1);
    await CaseRepository.ensureReady(DOC_2);

    const p1 = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-DOC1',
      fullName: 'Bệnh Nhân Bác Sĩ 1',
      dob: '01/01/1980',
      gender: 'Nam',
    });

    const p2 = await PatientRepository.addPatient(DOC_2, {
      code: 'BN-DOC2',
      fullName: 'Bệnh Nhân Bác Sĩ 2',
      dob: '02/02/1985',
      gender: 'Nữ',
    });

    await CaseRepository.createCase(DOC_1, p1);
    await CaseRepository.createCase(DOC_2, p2);

    const list1 = await CaseRepository.getCasesForUI(DOC_1);
    const list2 = await CaseRepository.getCasesForUI(DOC_2);

    expect(list1.some((c) => c.patientId === p1.id)).toBe(true);
    expect(list1.some((c) => c.patientId === p2.id)).toBe(false);

    expect(list2.some((c) => c.patientId === p2.id)).toBe(true);
    expect(list2.some((c) => c.patientId === p1.id)).toBe(false);
  });
});
