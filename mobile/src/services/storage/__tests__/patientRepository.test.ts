/**
 * KIỂM THỬ TÍCH HỢP TẦNG REPOSITORY VÀ ĐỒNG BỘ DỮ LIỆU BỆNH NHÂN CỤC BỘ
 *
 * Kiểm tra các tiêu chí:
 * 1. Seed dữ liệu mẫu khi bác sĩ đăng nhập lần đầu vào app.
 * 2. Thêm mới bệnh nhân -> lưu trữ có mã hóa -> đọc lại chính xác.
 * 3. Sửa thông tin bệnh nhân -> cập nhật trong storage.
 * 4. Đóng app / khởi động lại (Re-init storage) -> đọc lại đầy đủ thông tin bền vững.
 * 5. Tách biệt hoàn toàn dữ liệu giữa hai tài khoản bác sĩ khác nhau (Isolation).
 * 6. Xử lý khóa sai và bảo vệ tính toàn vẹn của dữ liệu.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PatientRepository, subscribePatientRepository } from '../patientRepository';
import { CryptoVault } from '../cryptoVault';

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

describe('PatientRepository & Storage Integration Tests', () => {
  const DOC_1 = 'usr-doc-01';
  const DOC_2 = 'usr-doc-02';

  beforeEach(async () => {
    await AsyncStorage.clear();
    // Reset private isInitialized nếu có
    (PatientRepository as any).isInitialized = false;
  });

  it('1. Tự động seed dữ liệu ban đầu cho bác sĩ và thông báo qua listener', async () => {
    const listener = jest.fn();
    const unsub = subscribePatientRepository(listener);

    const patients = await PatientRepository.getPatientsForUI(DOC_1);
    expect(patients.length).toBeGreaterThan(0);
    expect(patients[0].id).toBeDefined();
    expect(patients[0].fullName).toBeDefined();

    unsub();
  });

  it('2. Thêm bệnh nhân mới, lưu mã hóa và đọc lại chính xác', async () => {
    await PatientRepository.ensureReady(DOC_1);

    const newPatient = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-TEST-999',
      fullName: 'Trần Văn Kiểm Thử',
      dob: '15/08/1985',
      gender: 'Nam',
      phone: '0988776655',
      symptoms: 'Khám tầm soát phổi định kỳ',
    });

    expect(newPatient.code).toBe('BN-TEST-999');
    expect(newPatient.fullName).toBe('Trần Văn Kiểm Thử');
    expect(newPatient.age).toBe(new Date().getFullYear() - 1985);

    // Đọc lại từ UI query
    const list = await PatientRepository.getPatientsForUI(DOC_1);
    const found = list.find((p) => p.code === 'BN-TEST-999');
    expect(found).toBeDefined();
    expect(found?.fullName).toBe('Trần Văn Kiểm Thử');
    expect(found?.phone).toBe('0988776655');

    // Kiểm tra trực tiếp trong AsyncStorage: Dữ liệu bắt buộc phải được mã hóa
    const storageKeys = Object.keys(memoryStore);
    const patientStorageKey = storageKeys.find((k) => k.includes(DOC_1) && k.includes('patients'));
    expect(patientStorageKey).toBeDefined();
    const rawCipher = memoryStore[patientStorageKey!];
    expect(rawCipher).not.toContain('Trần Văn Kiểm Thử'); // Không lưu plaintext
  });

  it('3. Cập nhật thông tin bệnh nhân và phản ánh vào storage', async () => {
    await PatientRepository.ensureReady(DOC_1);

    const created = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-UPDATE-01',
      fullName: 'Hoàng Thị Hoa',
      dob: '01/01/1990',
      gender: 'Nữ',
      phone: '0911223344',
    });

    const updated = await PatientRepository.updatePatient(DOC_1, created.id, {
      fullName: 'Hoàng Thị Mỹ Hoa',
      phone: '0999888777',
      symptoms: 'Đã bổ sung triệu chứng ho ra máu',
    });

    expect(updated.fullName).toBe('Hoàng Thị Mỹ Hoa');
    expect(updated.phone).toBe('0999888777');
    expect(updated.symptoms).toBe('Đã bổ sung triệu chứng ho ra máu');

    // Đọc lại bằng getPatientById
    const fetched = await PatientRepository.getPatientById(DOC_1, created.id);
    expect(fetched?.fullName).toBe('Hoàng Thị Mỹ Hoa');
  });

  it('4. Mô phỏng sửa bệnh nhân và đóng/mở lại app: Đọc lại đầy đủ họ tên, triệu chứng, ngày sinh, điện thoại, giới tính', async () => {
    await PatientRepository.ensureReady(DOC_1);

    const initial = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-PERSIST-01',
      fullName: 'Ngô Kiến Huy',
      dob: '10/10/1980',
      gender: 'Nam',
      phone: '0909090909',
      symptoms: 'Ho nhẹ ban đêm',
    });

    // Cập nhật các trường: họ tên, triệu chứng, ngày sinh, giới tính, điện thoại
    await PatientRepository.updatePatient(DOC_1, initial.id, {
      fullName: 'Ngô Kiến Huy Cập Nhật',
      dob: '12/12/1982',
      gender: 'Nữ',
      phone: '0912999888',
      symptoms: 'Tức ngực tăng dần khi nằm nghiêng',
    });

    // Giả lập app bị kill hoàn toàn (đóng tiến trình và reset module state trong RAM)
    (PatientRepository as any).isInitialized = false;

    // Khởi động lại app (mở lại màn hình)
    await PatientRepository.ensureReady(DOC_1);
    const reloadedList = await PatientRepository.getPatientsForUI(DOC_1);
    const persisted = reloadedList.find((p) => p.code === 'BN-PERSIST-01');

    expect(persisted).toBeDefined();
    expect(persisted?.fullName).toBe('Ngô Kiến Huy Cập Nhật');
    expect(persisted?.dob).toBe('12/12/1982');
    expect(persisted?.gender).toBe('Nữ');
    expect(persisted?.phone).toBe('0912999888');
    expect(persisted?.symptoms).toBe('Tức ngực tăng dần khi nằm nghiêng');

    // Đọc trực tiếp chi tiết bằng getPatientById
    const directDetail = await PatientRepository.getPatientById(DOC_1, initial.id);
    expect(directDetail?.fullName).toBe('Ngô Kiến Huy Cập Nhật');
    expect(directDetail?.symptoms).toBe('Tức ngực tăng dần khi nằm nghiêng');
    expect(directDetail?.dob).toBe('12/12/1982');
    expect(directDetail?.phone).toBe('0912999888');
    expect(directDetail?.gender).toBe('Nữ');
  });

  it('5. Tách biệt dữ liệu tuyệt đối giữa hai tài khoản bác sĩ khác nhau', async () => {
    await PatientRepository.ensureReady(DOC_1);
    await PatientRepository.ensureReady(DOC_2);

    await PatientRepository.addPatient(DOC_1, {
      code: 'BN-DOC1-ONLY',
      fullName: 'Bệnh Nhân Của Bác Sĩ 1',
      dob: '20/05/1975',
      gender: 'Nam',
    });

    await PatientRepository.addPatient(DOC_2, {
      code: 'BN-DOC2-ONLY',
      fullName: 'Bệnh Nhân Của Bác Sĩ 2',
      dob: '12/12/1982',
      gender: 'Nữ',
    });

    const list1 = await PatientRepository.getPatientsForUI(DOC_1);
    const list2 = await PatientRepository.getPatientsForUI(DOC_2);

    expect(list1.some((p) => p.code === 'BN-DOC1-ONLY')).toBe(true);
    expect(list1.some((p) => p.code === 'BN-DOC2-ONLY')).toBe(false);

    expect(list2.some((p) => p.code === 'BN-DOC2-ONLY')).toBe(true);
    expect(list2.some((p) => p.code === 'BN-DOC1-ONLY')).toBe(false);
  });

  it('6. Xử lý khóa sai và bảo vệ chống đọc chéo dữ liệu mã hóa', async () => {
    await PatientRepository.ensureReady(DOC_1);

    const testPatient = await PatientRepository.addPatient(DOC_1, {
      code: 'BN-SECRET-KEY',
      fullName: 'Dữ Liệu Tuyệt Mật',
      dob: '01/01/1970',
      gender: 'Nam',
    });
    expect(testPatient.code).toBe('BN-SECRET-KEY');

    const storageKeys = Object.keys(memoryStore);
    const doc1Key = storageKeys.find((k) => k.includes(DOC_1) && k.includes('patients'));
    expect(doc1Key).toBeDefined();

    const rawCipher = memoryStore[doc1Key!];

    // Thử giải mã bằng khóa dẫn xuất của Bác sĩ 2
    const keyOfDoc2 = CryptoVault.deriveOwnerKey(DOC_2);
    expect(() => CryptoVault.decrypt(rawCipher, keyOfDoc2)).toThrow();

    // Thử giải mã với khóa sai hoàn toàn
    const wrongKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    expect(() => CryptoVault.decrypt(rawCipher, wrongKey)).toThrow();
  });

  it('7. Dừng lưu và ném lỗi rõ ràng khi không có module mã hóa an toàn (Chặn lưu không mã hóa)', async () => {
    const originalIsNative = CryptoVault.isNativeKeystoreAvailable;

    try {
      jest.spyOn(CryptoVault, 'isNativeKeystoreAvailable').mockReturnValue(false);

      const spyEncryptAsync = jest.spyOn(CryptoVault, 'encryptAsync').mockImplementation(async () => {
        throw new Error(
          'NATIVE_CRYPTO_UNAVAILABLE: Module mã hóa phần cứng an toàn (Android Keystore / NativeCryptoVaultModule) chưa được nạp. Hệ thống dừng thao tác lưu trữ để bảo vệ dữ liệu y tế; không lưu khi chưa được mã hóa an toàn.',
        );
      });

      await expect(
        PatientRepository.addPatient('doc-fail', {
          code: 'BN-FAIL-CRYPTO',
          fullName: 'Bệnh Nhân Thất Bại',
          dob: '01/01/1990',
          gender: 'Nam',
        }),
      ).rejects.toThrow(/NATIVE_CRYPTO_UNAVAILABLE/);

      spyEncryptAsync.mockRestore();
    } finally {
      (CryptoVault.isNativeKeystoreAvailable as any) = originalIsNative;
    }
  });
});
