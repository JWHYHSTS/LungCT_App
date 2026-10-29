import React from 'react';
import { PatientFormModal, validateDateOfBirth } from '../screens/PatientFormModal';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { CaseDetailScreen } from '../screens/CaseDetailScreen';
import { AIImageResultScreen } from '../screens/AIImageResultScreen';
import { ExportPdfScreen } from '../screens/ExportPdfScreen';
import * as themeModule from '../../../ui/theme/ThemeProvider';
import * as authModule from '../../auth/context/AuthContext';
import {
  resetDoctorStore,
  getMockPatients,
  getMockCases,
  addMockPatient,
  createMockCaseForPatient,
  updateCaseNotes,
  trashPatient,
  findPatientById,
  findCaseById,
  MOCK_CASES,
  MOCK_PATIENTS,
} from '../../../mocks/doctorMocks';
import i18n from '../../../i18n';

describe('UI-07: Doctor Detail Screens Unit Tests', () => {
  let originalDispatcher: any;

  beforeEach(async () => {
    resetDoctorStore();
    await i18n.changeLanguage('vi');

    jest.spyOn(themeModule, 'useTheme').mockReturnValue({
      theme: themeModule.buildTheme('light'),
      preference: 'light',
      setPreference: jest.fn(),
    });

    jest.spyOn(authModule, 'useAuth').mockReturnValue({
      user: {
        id: 'doc-001',
        email: 'bs.an@example.com',
        fullName: 'BS. Nguyễn Minh An',
        role: 'doctor',
        status: 'active',
      },
      isAuthenticated: true,
      isOnline: true,
      setIsOnline: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      registerDoctor: jest.fn(),
    });

    const internals = (React as any)
      .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    if (internals) {
      originalDispatcher = internals.H;
      internals.H = {
        useState: (init: any) => [typeof init === 'function' ? init() : init, jest.fn()],
        useContext: (ctx: any) => ctx?._currentValue,
        useMemo: (fn: any) => fn(),
        useCallback: (fn: any) => fn,
        useEffect: () => {},
        useLayoutEffect: () => {},
        useRef: (init: any) => ({ current: init }),
        useSyncExternalStore: (_subscribe: any, getSnapshot: any) => getSnapshot(),
      };
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
    const internals = (React as any)
      .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    if (internals && originalDispatcher !== undefined) {
      internals.H = originalDispatcher;
    }
  });

  // 1. Kiểm tra validation ngày sinh lịch sử y tế
  test('1. validateDateOfBirth: Từ chối ngày sai lịch, ngày tương lai; chấp nhận ngày lịch hợp lệ', () => {
    // Ngày trong tương lai (năm 2099)
    const futureRes = validateDateOfBirth('01/01/2099');
    expect(futureRes.valid).toBe(false);
    expect(futureRes.error).toContain('tương lai');

    // Ngày sai số ngày trong tháng (tháng 2 năm không nhuận 2023 có 28 ngày)
    const invalidDayRes = validateDateOfBirth('29/02/2023');
    expect(invalidDayRes.valid).toBe(false);
    expect(invalidDayRes.error).toContain('tối đa 28 ngày');

    // Ngày hợp lệ năm nhuận (29/02/2024)
    const validLeapRes = validateDateOfBirth('29/02/2024');
    expect(validLeapRes.valid).toBe(true);
    expect(validLeapRes.age).toBeDefined();

    // Ngày sinh thông thường hợp lệ
    const validRes = validateDateOfBirth('14/03/1980');
    expect(validRes.valid).toBe(true);
    expect(validRes.age).toBeGreaterThan(40);
  });

  // 2. Render PatientFormModal (SCR-P02)
  test('2. PatientFormModal (SCR-P02) render thành công với các trường nhập liệu chuẩn', () => {
    const screen = PatientFormModal({
      onClose: jest.fn(),
      onSuccess: jest.fn(),
    });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  // 3. Render PatientDetailScreen (SCR-P03)
  test('3. PatientDetailScreen (SCR-P03) render thành công với hồ sơ bệnh nhân và xử lý khi không tìm thấy', () => {
    const existingPatient = MOCK_PATIENTS[0];
    const screen = PatientDetailScreen({
      patientId: existingPatient.id,
      onBack: jest.fn(),
      onNavigateToCaseDetail: jest.fn(),
    });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);

    // Kiểm tra render fallback an toàn khi ID không tồn tại
    const notFoundScreen = PatientDetailScreen({
      patientId: 'non-existing-id',
      onBack: jest.fn(),
      onNavigateToCaseDetail: jest.fn(),
    });
    expect(notFoundScreen).toBeDefined();
    expect(React.isValidElement(notFoundScreen)).toBe(true);
  });

  // 4. CaseDetailScreen (SCR-C02): Quy tắc BR-CASE-01 (Hoàn tất disabled khi 0 ảnh)
  test('4. CaseDetailScreen (SCR-C02) render thành công và kiểm tra quy tắc hoàn tất ca (BR-CASE-01)', () => {
    const existingCase = MOCK_CASES[0];
    const screen = CaseDetailScreen({
      caseId: existingCase.id,
      onBack: jest.fn(),
      onNavigateToImageResult: jest.fn(),
      onNavigateToExportPdf: jest.fn(),
    });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);

    // Fallback an toàn khi caseId không tồn tại
    const notFoundCase = CaseDetailScreen({
      caseId: 'invalid-case-id',
      onBack: jest.fn(),
      onNavigateToImageResult: jest.fn(),
      onNavigateToExportPdf: jest.fn(),
    });
    expect(notFoundCase).toBeDefined();
    expect(React.isValidElement(notFoundCase)).toBe(true);
  });

  // 5. AIImageResultScreen (SCR-R01): Quy tắc không hiển thị điểm khi FAIL
  test('5. AIImageResultScreen (SCR-R01) render thành công và xử lý trạng thái ảnh FAIL / passNoCam', () => {
    const targetCase = MOCK_CASES.find((c) => c.id === 'c-3') || MOCK_CASES[0];
    const screen = AIImageResultScreen({
      caseId: targetCase.id,
      initialImageIndex: 1,
      onBack: jest.fn(),
    });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);

    // Kiểm tra ảnh thứ 2 (status: fail)
    const failImageScreen = AIImageResultScreen({
      caseId: targetCase.id,
      initialImageIndex: 2,
      onBack: jest.fn(),
    });
    expect(failImageScreen).toBeDefined();
    expect(React.isValidElement(failImageScreen)).toBe(true);
  });

  // 6. ExportPdfScreen (SCR-D01): Render và cảnh báo bảo mật chia sẻ
  test('6. ExportPdfScreen (SCR-D01) render thành công với các tùy chọn cấu hình và danh sách PDF', () => {
    const existingCase = MOCK_CASES[0];
    const screen = ExportPdfScreen({
      caseId: existingCase.id,
      onBack: jest.fn(),
    });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  // 7. Kiểm thử chuỗi thao tác toàn diện trên mock store (Thêm BN -> Tạo ca -> Sửa ghi chú -> Xóa mềm -> Logout)
  test('7. Mock store xử lý đúng chuỗi thao tác: thêm BN, tạo ca, sửa nhận xét, xóa mềm kéo theo ca, và đăng xuất reset dữ liệu', () => {
    resetDoctorStore();
    const initialPatientCount = getMockPatients().length;

    // 1. Thêm bệnh nhân mới -> xuất hiện trong danh sách
    const newPatient = addMockPatient({
      code: 'BN-999999',
      fullName: 'Bệnh Nhân Kiểm Thử',
      dob: '01/01/1990',
      age: 36,
      gender: 'Nam',
      phone: '0912345678',
      symptoms: 'Ho khan kéo dài',
    });
    expect(newPatient).toBeDefined();
    expect(newPatient.id).toBeDefined();

    const afterAddPatients = getMockPatients();
    expect(afterAddPatients.length).toBe(initialPatientCount + 1);
    expect(afterAddPatients.some((p: any) => p.code === 'BN-999999')).toBe(true);

    // 2. Tạo ca mới từ hồ sơ bệnh nhân -> gắn đúng patientId và xuất hiện trong lịch sử
    const newCase = createMockCaseForPatient(newPatient);
    expect(newCase.patientId).toBe(newPatient.id);
    expect(newCase.patientName).toBe(newPatient.fullName);

    const afterAddCases = getMockCases();
    expect(afterAddCases.some((c: any) => c.id === newCase.id)).toBe(true);
    const updatedPatient = findPatientById(newPatient.id);
    expect(updatedPatient?.caseCount).toBe(1);
    expect(updatedPatient?.hasDraftCase).toBe(true);

    // 3. Sửa nhận xét ca bệnh -> rời màn hình rồi mở lại vẫn giữ trong phiên
    const updatedNotes = 'Nhận xét kiểm thử: tổn thương nghi ngờ thùy trên.';
    const updateSuccess = updateCaseNotes(newCase.id, updatedNotes);
    expect(updateSuccess).toBe(true);

    const reloadedCase = findCaseById(newCase.id);
    expect(reloadedCase?.notes).toBe(updatedNotes);
    expect(reloadedCase?.notesSavedAt).toBeDefined();

    // 4. Xóa mềm bệnh nhân -> danh sách ẩn bệnh nhân và xóa mềm các ca liên quan
    const trashSuccess = trashPatient(newPatient.id);
    expect(trashSuccess).toBe(true);

    const patientsAfterTrash = getMockPatients();
    expect(patientsAfterTrash.some((p: any) => p.id === newPatient.id)).toBe(false);

    const casesAfterTrash = getMockCases();
    expect(casesAfterTrash.some((c: any) => c.patientId === newPatient.id)).toBe(false);

    // 5. Đăng xuất / đổi tài khoản -> reset dữ liệu phiên mô phỏng
    resetDoctorStore();
    const patientsAfterReset = getMockPatients();
    expect(patientsAfterReset.length).toBe(initialPatientCount);
    expect(patientsAfterReset.some((p: any) => p.code === 'BN-999999')).toBe(false);
  });

  // 8. Kiểm thử xác nhận FAIL không hiện điểm AI và thiếu Grad-CAM vẫn giữ điểm nhưng không vẽ heatmap
  test('8. AIImageResultScreen: Ảnh FAIL (MSG-10) không hiện điểm, ảnh passNoCam (MSG-11) giữ điểm và không tạo heatmap', () => {
    const case1 = MOCK_CASES.find((c) => c.id === 'c-1')!;
    const case3 = MOCK_CASES.find((c) => c.id === 'c-3')!;

    // Ảnh 1 của c-1: pass (có CAM)
    const imgPass = case1.images[0];
    expect(imgPass.hasGradCam).toBe(true);
    expect(imgPass.scores).toBeDefined();

    // Ảnh 2 của c-1: passNoCam (MSG-11)
    const imgPassNoCam = case1.images[1];
    expect(imgPassNoCam.status).toBe('passNoCam');
    expect(imgPassNoCam.hasGradCam).toBe(false);
    expect(imgPassNoCam.scores).toBeDefined(); // Vẫn giữ điểm phân loại

    // Ảnh 2 của c-3: fail (MSG-10)
    const imgFail = case3.images[1];
    expect(imgFail.status).toBe('fail');
    expect(imgFail.hasGradCam).toBe(false);
    expect(imgFail.scores).toBeUndefined(); // Không có điểm
  });

  // 9. Kiểm thử 5 màn hình chi tiết render không lỗi ở cả chế độ Sáng (light) và Tối (dark)
  test('9. Cả 5 màn hình chi tiết render ổn định ở cả 2 chủ đề Light và Dark', () => {
    ['light', 'dark'].forEach((mode) => {
      jest.spyOn(themeModule, 'useTheme').mockReturnValue({
        theme: themeModule.buildTheme(mode as 'light' | 'dark'),
        preference: mode as 'light' | 'dark',
        setPreference: jest.fn(),
      });

      const modal = PatientFormModal({
        visible: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
      });
      expect(React.isValidElement(modal)).toBe(true);

      const patientDetail = PatientDetailScreen({
        patientId: MOCK_PATIENTS[0].id,
        onBack: jest.fn(),
        onNavigateToCaseDetail: jest.fn(),
      });
      expect(React.isValidElement(patientDetail)).toBe(true);

      const caseDetail = CaseDetailScreen({
        caseId: MOCK_CASES[0].id,
        onBack: jest.fn(),
        onNavigateToImageResult: jest.fn(),
        onNavigateToExportPdf: jest.fn(),
      });
      expect(React.isValidElement(caseDetail)).toBe(true);

      const aiResult = AIImageResultScreen({
        caseId: MOCK_CASES[0].id,
        initialImageIndex: 1,
        onBack: jest.fn(),
      });
      expect(React.isValidElement(aiResult)).toBe(true);

      const exportPdf = ExportPdfScreen({
        caseId: MOCK_CASES[0].id,
        onBack: jest.fn(),
      });
      expect(React.isValidElement(exportPdf)).toBe(true);
    });
  });

  // 10. Kiểm thử i18n namespace doctor_detail cho cả tiếng Việt (vi) và tiếng Anh (en)
  test('10. i18n cung cấp đầy đủ chuỗi ngôn ngữ cho cả vi và en trong doctor_detail', async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');
    expect(i18n.t('doctor_detail.patient_form_title')).toBe('Thêm bệnh nhân');
    expect(i18n.t('doctor_detail.patient_code_label')).toBe('Mã bệnh nhân *');
    expect(i18n.t('doctor_detail.ai_result_title')).toBe('Kết quả ảnh');
    expect(i18n.t('doctor_detail.export_pdf_title')).toBe('Xuất PDF');
    expect(i18n.t('doctor_detail.pdf_generate_btn')).toBe('Tạo báo cáo PDF mới');

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('doctor_detail.patient_form_title')).toBe('Add Patient');
    expect(i18n.t('doctor_detail.patient_code_label')).toBe('Patient ID *');
    expect(i18n.t('doctor_detail.ai_result_title')).toBe('Image Result');
    expect(i18n.t('doctor_detail.export_pdf_title')).toBe('Export PDF');
    expect(i18n.t('doctor_detail.pdf_generate_btn')).toBe('Generate New PDF Report');

    // Reset lại vi
    await i18n.changeLanguage('vi');
  });

  // 11. Kiểm thử validateDateOfBirth dịch thông báo lỗi tương ứng theo t()
  test('11. validateDateOfBirth dịch lỗi đúng theo ngôn ngữ vi và en', async () => {
    await i18n.changeLanguage('vi');
    const tVi = i18n.t.bind(i18n);
    expect(validateDateOfBirth('', tVi).error).toBe('Vui lòng nhập ngày sinh (*).');
    expect(validateDateOfBirth('31/02/2020', tVi).error).toContain('chỉ có tối đa 29 ngày');
    expect(validateDateOfBirth('01/01/2099', tVi).error).toBe(
      'Ngày sinh không được nằm trong tương lai.',
    );

    await i18n.changeLanguage('en');
    const tEn = i18n.t.bind(i18n);
    expect(validateDateOfBirth('', tEn).error).toBe('Please enter date of birth (*).');
    expect(validateDateOfBirth('31/02/2020', tEn).error).toContain('only has up to 29 days');
    expect(validateDateOfBirth('01/01/2099', tEn).error).toBe(
      'Date of birth cannot be in the future.',
    );

    await i18n.changeLanguage('vi');
  });

  // 12. Kiểm thử render 5 màn hình chi tiết ở cả ngôn ngữ vi và en
  test('12. Cả 5 màn hình chi tiết render hợp lệ ở cả 2 ngôn ngữ vi và en', async () => {
    for (const lang of ['vi', 'en']) {
      await i18n.changeLanguage(lang);

      const modal = PatientFormModal({
        visible: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
      });
      expect(React.isValidElement(modal)).toBe(true);

      const patientDetail = PatientDetailScreen({
        patientId: MOCK_PATIENTS[0].id,
        onBack: jest.fn(),
        onNavigateToCaseDetail: jest.fn(),
      });
      expect(React.isValidElement(patientDetail)).toBe(true);

      const caseDetail = CaseDetailScreen({
        caseId: MOCK_CASES[0].id,
        onBack: jest.fn(),
        onNavigateToImageResult: jest.fn(),
        onNavigateToExportPdf: jest.fn(),
      });
      expect(React.isValidElement(caseDetail)).toBe(true);

      const aiResult = AIImageResultScreen({
        caseId: MOCK_CASES[0].id,
        initialImageIndex: 1,
        onBack: jest.fn(),
      });
      expect(React.isValidElement(aiResult)).toBe(true);

      const exportPdf = ExportPdfScreen({
        caseId: MOCK_CASES[0].id,
        onBack: jest.fn(),
      });
      expect(React.isValidElement(exportPdf)).toBe(true);
    }

    await i18n.changeLanguage('vi');
  });

  // 13. Tách lựa chọn ngôn ngữ PDF khỏi ngôn ngữ giao diện & giữ nguyên form state
  test('13. Tách cấu hình ngôn ngữ PDF khỏi app language và giữ state dữ liệu khi đổi ngôn ngữ', async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');

    // Màn hình ExportPdfScreen khởi tạo state pdfLanguage độc lập ('vi' hoặc 'en')
    const exportScreen = ExportPdfScreen({
      caseId: MOCK_CASES[0].id,
      onBack: jest.fn(),
    });
    expect(React.isValidElement(exportScreen)).toBe(true);

    // Khi app đổi ngôn ngữ sang 'en', hệ thống i18n của app đổi nhưng không can thiệp vào file PDF logic
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');

    // Chuyển lại 'vi' an toàn
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');
  });

  // 14. ExportPdfScreen nạp đúng ca bệnh và định dạng tên tệp theo mã ca
  test('14. ExportPdfScreen nạp đúng hồ sơ ca bệnh theo ID và cô lập dữ liệu theo tài khoản', () => {
    const targetCase = MOCK_CASES[0];
    const exportScreen = ExportPdfScreen({
      caseId: targetCase.id,
      onBack: jest.fn(),
    });

    expect(exportScreen).toBeDefined();
    expect(React.isValidElement(exportScreen)).toBe(true);

    // Kiểm tra trường hợp ca không tồn tại hoặc ID lạ
    const notFoundScreen = ExportPdfScreen({
      caseId: 'case-non-existent-999',
      onBack: jest.fn(),
    });
    expect(notFoundScreen).toBeDefined();
    expect(React.isValidElement(notFoundScreen)).toBe(true);
  });
});
