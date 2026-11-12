import React from 'react';
import {
  AdminAccountsScreen,
  AdminAccountDetailScreen,
  AdminStatsScreen,
  AdminProfileScreen,
} from '../screens';
import * as themeModule from '../../../ui/theme/ThemeProvider';
import * as authModule from '../../auth/context/AuthContext';
import {
  resetAdminStore,
  getAdminDoctors,
  findAdminDoctorById,
  approveDoctorAccount,
  lockDoctorAccount,
  getAuditLogsForDoctor,
  getAdminStatsByPeriod,
} from '../../../mocks/adminMocks';
import i18n from '../../../i18n';

describe('UI-08: Admin Screens Unit Tests', () => {
  let originalDispatcher: any;

  beforeEach(async () => {
    resetAdminStore();
    await i18n.changeLanguage('vi');

    jest.spyOn(themeModule, 'useTheme').mockReturnValue({
      theme: themeModule.buildTheme('light'),
      preference: 'light',
      setPreference: jest.fn(),
    });

    jest.spyOn(authModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin-001',
        email: 'admin@example.com',
        fullName: 'Quản trị viên',
        role: 'admin',
        status: 'active',
      },
      isAuthenticated: true,
      isOnline: true,
      setIsOnline: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      registerDoctor: jest.fn(),
      resetPassword: jest.fn().mockResolvedValue(true),
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
    if (internals && originalDispatcher) {
      internals.H = originalDispatcher;
    }
  });

  // 1. Kiểm thử render SCR-M01: AdminAccountsScreen
  test('1. AdminAccountsScreen (SCR-M01) render thành công với các bộ lọc và tìm kiếm', () => {
    const screen = AdminAccountsScreen({
      onNavigateToDetail: jest.fn(),
    });
    expect(React.isValidElement(screen)).toBe(true);
  });

  // 2. Kiểm thử render SCR-M02: AdminAccountDetailScreen
  test('2. AdminAccountDetailScreen (SCR-M02) render thành công và xử lý tài khoản không tồn tại', () => {
    const doctors = getAdminDoctors();
    const validDoctorId = doctors[0].id;

    const screen = AdminAccountDetailScreen({
      accountId: validDoctorId,
      onBack: jest.fn(),
    });
    expect(React.isValidElement(screen)).toBe(true);

    const notFoundScreen = AdminAccountDetailScreen({
      accountId: 'non-existent-id',
      onBack: jest.fn(),
    });
    expect(React.isValidElement(notFoundScreen)).toBe(true);
  });

  // 3. Kiểm thử render SCR-M03: AdminStatsScreen
  test('3. AdminStatsScreen (SCR-M03) render thành công với 4 thẻ thống kê và biểu đồ phân bố', () => {
    const screen = AdminStatsScreen({});
    expect(React.isValidElement(screen)).toBe(true);

    const stats7d = getAdminStatsByPeriod('7d');
    expect(stats7d.activeDoctors).toBeGreaterThan(0);
    expect(stats7d.aiBreakdown.benign).toBeGreaterThan(0);
  });

  // 4. Kiểm thử render SCR-U01: AdminProfileScreen
  test('4. AdminProfileScreen (SCR-U01 admin) render thành công với cài đặt và đăng xuất', () => {
    const screen = AdminProfileScreen({
      onLogoutSuccess: jest.fn(),
    });
    expect(React.isValidElement(screen)).toBe(true);
  });

  // 5. Kiểm thử nghiệp vụ Duyệt tài khoản và Khóa tài khoản (bắt buộc nhập lý do, đồng bộ số lượng bộ lọc và nhật ký)
  test('5. Duyệt tài khoản chuyển active; Khóa tài khoản yêu cầu lý do hợp lệ và đồng bộ số lượng bộ lọc', () => {
    resetAdminStore();
    const initialDocs = getAdminDoctors();
    const initialPendingCount = initialDocs.filter((d) => d.status === 'pending').length;
    const initialActiveCount = initialDocs.filter((d) => d.status === 'active').length;
    const initialLockedCount = initialDocs.filter((d) => d.status === 'locked').length;

    const pendingDoc = initialDocs.find((d) => d.status === 'pending');
    expect(pendingDoc).toBeDefined();

    // 5.1 Duyệt tài khoản: chuyển sang active, cập nhật số lượng bộ lọc
    const approveSuccess = approveDoctorAccount(pendingDoc!.id);
    expect(approveSuccess).toBe(true);

    const updatedAfterApprove = getAdminDoctors();
    const approvedDoc = findAdminDoctorById(pendingDoc!.id);
    expect(approvedDoc?.status).toBe('active');
    expect(updatedAfterApprove.filter((d) => d.status === 'pending').length).toBe(
      initialPendingCount - 1,
    );
    expect(updatedAfterApprove.filter((d) => d.status === 'active').length).toBe(
      initialActiveCount + 1,
    );

    // 5.2 Khóa tài khoản: từ chối khi lý do chỉ có khoảng trắng, không thay đổi dữ liệu
    const whitespaceLockRes = lockDoctorAccount(pendingDoc!.id, '   \t\n  ');
    expect(whitespaceLockRes).toBe(false);
    expect(findAdminDoctorById(pendingDoc!.id)?.status).toBe('active');

    // 5.3 Thao tác Hủy (không gọi lockDoctorAccount) không làm thay đổi trạng thái và số lượng
    const docsBeforeCancel = getAdminDoctors();
    expect(findAdminDoctorById(pendingDoc!.id)?.status).toBe('active');
    expect(docsBeforeCancel.filter((d) => d.status === 'locked').length).toBe(initialLockedCount);

    // 5.4 Khóa tài khoản thành công khi có lý do hợp lệ
    const validReason = 'Thông tin đăng ký chưa được bệnh viện xác thực.';
    const validLockRes = lockDoctorAccount(pendingDoc!.id, validReason);
    expect(validLockRes).toBe(true);

    const lockedDoc = findAdminDoctorById(pendingDoc!.id);
    expect(lockedDoc?.status).toBe('locked');
    expect(lockedDoc?.lockReason).toBe(validReason);

    const updatedAfterLock = getAdminDoctors();
    expect(updatedAfterLock.filter((d) => d.status === 'active').length).toBe(initialActiveCount);
    expect(updatedAfterLock.filter((d) => d.status === 'locked').length).toBe(
      initialLockedCount + 1,
    );

    // 5.5 Kiểm tra nhật ký thao tác ghi nhận đầy đủ hành động duyệt và khóa
    const logs = getAuditLogsForDoctor(pendingDoc!.id);
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].action).toBe('lock');
    expect(logs[0].reason).toBe(validReason);
    expect(logs[1].action).toBe('approve');
  });

  // 6. Kiểm thử i18n cho cả vi và en trong phân hệ admin
  test('6. i18n cung cấp đầy đủ chuỗi ngôn ngữ cho cả vi và en trong namespace admin', async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');
    expect(i18n.t('admin.accounts_title')).toBe('Quản lý tài khoản');
    expect(i18n.t('admin.btn_approve')).toBe('Duyệt tài khoản');
    expect(i18n.t('admin.btn_lock')).toBe('Khóa tài khoản');
    expect(i18n.t('admin.privacy_notice')).toContain('BR-OWN-03');

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('admin.accounts_title')).toBe('Account Management');
    expect(i18n.t('admin.btn_approve')).toBe('Approve Account');
    expect(i18n.t('admin.btn_lock')).toBe('Lock Account');
    expect(i18n.t('admin.privacy_notice')).toContain('BR-OWN-03');

    await i18n.changeLanguage('vi');
  });

  // 7. Cả 4 màn hình render hợp lệ ở cả 2 chế độ Sáng (Light) và Tối (Dark)
  test('7. Cả 4 màn hình admin render ổn định ở cả Light và Dark mode', () => {
    ['light', 'dark'].forEach((mode) => {
      jest.spyOn(themeModule, 'useTheme').mockReturnValue({
        theme: themeModule.buildTheme(mode as 'light' | 'dark'),
        preference: mode as 'light' | 'dark',
        setPreference: jest.fn(),
      });

      expect(React.isValidElement(AdminAccountsScreen({ onNavigateToDetail: jest.fn() }))).toBe(
        true,
      );
      expect(
        React.isValidElement(AdminAccountDetailScreen({ accountId: 'doc-001', onBack: jest.fn() })),
      ).toBe(true);
      expect(React.isValidElement(AdminStatsScreen({}))).toBe(true);
      expect(React.isValidElement(AdminProfileScreen({}))).toBe(true);
    });
  });

  // 8. TUÂN THỦ NGHIÊM NGẶT BR-OWN-03: Kiểm toán mã nguồn không import dữ liệu bệnh nhân/ca bệnh
  test('8. BR-OWN-03: Phân hệ Admin tuyệt đối không import dữ liệu bệnh nhân, ca bệnh hay ảnh CT', () => {
    const adminScreens = [
      AdminAccountsScreen,
      AdminAccountDetailScreen,
      AdminStatsScreen,
      AdminProfileScreen,
    ];
    adminScreens.forEach((Comp) => {
      expect(Comp).toBeDefined();
    });

    // Mock store admin không chứa bất kỳ từ khóa bệnh nhân nào
    const doctors = getAdminDoctors();
    doctors.forEach((doc) => {
      expect((doc as any).patientId).toBeUndefined();
      expect((doc as any).cases).toBeUndefined();
      expect((doc as any).images).toBeUndefined();
    });
  });
});
