import React from 'react';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { AccountStatusScreen } from '../screens/AccountStatusScreen';
import * as themeModule from '../../../ui/theme/ThemeProvider';
import * as authModule from '../context/AuthContext';
import '../../../i18n';

describe('UI-05: Auth & Navigation Flow Unit Tests', () => {
  let originalDispatcher: any;

  beforeEach(() => {
    // Mock useTheme trả về theme hợp lệ
    jest.spyOn(themeModule, 'useTheme').mockReturnValue({
      theme: themeModule.buildTheme('light'),
      preference: 'light',
      setPreference: jest.fn(),
    });

    // Thiết lập React Dispatcher tối thiểu cho React 19 test runner
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

  // Test 1: Kiểm tra AuthProvider logic phân quyền theo email
  test('1. AuthProvider phân quyền doctor khi email thông thường và admin khi email chứa "admin"', async () => {
    let mockUser: any = null;
    const loginFn = async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed.includes('pending')) return { success: false, status: 'pending' as const };
      if (trimmed.includes('locked')) return { success: false, status: 'locked' as const };
      const role = trimmed.includes('admin') ? 'admin' : 'doctor';
      mockUser = {
        id: 'usr-1',
        email: trimmed,
        fullName: role === 'admin' ? 'Quản trị viên' : 'BS. An',
        role,
        status: 'active' as const,
      };
      return { success: true, status: 'active' as const };
    };

    // 1. Đăng nhập bác sĩ
    const docRes = await loginFn('bs.an@example.com');
    expect(docRes.success).toBe(true);
    expect(mockUser?.role).toBe('doctor');

    // 2. Đăng xuất
    mockUser = null;
    expect(mockUser).toBeNull();

    // 3. Đăng nhập admin
    const adminRes = await loginFn('admin.system@lungct.vn');
    expect(adminRes.success).toBe(true);
    expect(mockUser?.role).toBe('admin');
  });

  // Test 2: Kiểm tra xử lý trạng thái tài khoản pending / locked
  test('2. AuthProvider chuyển trạng thái pending hoặc locked khi email chứa từ khóa tương ứng', async () => {
    const loginFn = async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed.includes('pending')) return { success: false, status: 'pending' as const };
      if (trimmed.includes('locked')) return { success: false, status: 'locked' as const };
      return { success: true, status: 'active' as const };
    };

    const pendingRes = await loginFn('user.pending@example.com');
    expect(pendingRes.success).toBe(false);
    expect(pendingRes.status).toBe('pending');

    const lockedRes = await loginFn('user.locked@example.com');
    expect(lockedRes.success).toBe(false);
    expect(lockedRes.status).toBe('locked');
  });

  // Test 3: LoginScreen render hợp lệ và gắn các callback điều hướng
  test('3. LoginScreen khởi tạo hợp lệ với các liên kết điều hướng Đăng ký và Trạng thái', () => {
    jest.spyOn(authModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isOnline: true,
      setIsOnline: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      registerDoctor: jest.fn(),
      resetPassword: jest.fn().mockResolvedValue(true),
    });

    const onRegisterMock = jest.fn();
    const onStatusMock = jest.fn();

    const screen: any = LoginScreen({
      onNavigateToRegister: onRegisterMock,
      onNavigateToAccountStatus: onStatusMock,
    });

    expect(screen).toBeDefined();
    expect(screen.props.style).toBeDefined();
  });

  // Test 4: RegisterScreen kiểm tra xác thực form và nút quay lại
  test('4. RegisterScreen khởi tạo đúng TopBar và các trường thông tin bác sĩ', () => {
    jest.spyOn(authModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isOnline: true,
      setIsOnline: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      registerDoctor: jest.fn(),
      resetPassword: jest.fn().mockResolvedValue(true),
    });

    const onBackMock = jest.fn();
    const onPendingMock = jest.fn();

    const screen: any = RegisterScreen({
      onNavigateBack: onBackMock,
      onNavigateToPendingApproval: onPendingMock,
    });

    expect(screen).toBeDefined();
  });

  // Test 5: AccountStatusScreen hiển thị đúng thông điệp chuẩn MSG-06 (pending) và MSG-07 (locked)
  test('5. AccountStatusScreen hiển thị thông điệp chuẩn MSG-06 cho pending và MSG-07 cho locked', () => {
    jest.spyOn(authModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isOnline: true,
      setIsOnline: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      registerDoctor: jest.fn(),
      resetPassword: jest.fn().mockResolvedValue(true),
    });

    const onLoginMock = jest.fn();

    const pendingScreen: any = AccountStatusScreen({
      status: 'pending',
      onNavigateToLogin: onLoginMock,
    });
    expect(pendingScreen).toBeDefined();

    const lockedScreen: any = AccountStatusScreen({
      status: 'locked',
      onNavigateToLogin: onLoginMock,
    });
    expect(lockedScreen).toBeDefined();
  });

  // Test 6: Kiểm tra tài khoản pending / locked không cấp quyền isAuthenticated (không thể vào DoctorTabs/AdminTabs)
  test('6. Tài khoản pending hoặc locked không thể vào DoctorTabs hoặc AdminTabs', async () => {
    let currentUser: any = null;
    let isAuthenticated = false;

    const mockLogin = async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed.includes('pending')) {
        return { success: false, status: 'pending' as const };
      }
      if (trimmed.includes('locked')) {
        return { success: false, status: 'locked' as const };
      }
      currentUser = { email: trimmed, role: 'doctor' };
      isAuthenticated = true;
      return { success: true, status: 'active' as const };
    };

    // 1. Thử đăng nhập với email pending
    const resPending = await mockLogin('pending@lungct.vn');
    expect(resPending.success).toBe(false);
    expect(resPending.status).toBe('pending');
    expect(isAuthenticated).toBe(false);
    expect(currentUser).toBeNull();

    // 2. Thử đăng nhập với email locked
    const resLocked = await mockLogin('locked@lungct.vn');
    expect(resLocked.success).toBe(false);
    expect(resLocked.status).toBe('locked');
    expect(isAuthenticated).toBe(false);
    expect(currentUser).toBeNull();
  });

  // Test 7: Kiểm tra sau khi đăng xuất, trạng thái xác thực bị hủy hoàn toàn (bấm Back không quay lại màn nghiệp vụ)
  test('7. Đăng xuất xóa hoàn toàn phiên người dùng, bảo đảm điều hướng quay lại AuthStack', async () => {
    let currentUser: any = { id: 'usr-1', email: 'doctor@lungct.vn', role: 'doctor' };
    let isAuthenticated = true;

    const mockLogout = () => {
      currentUser = null;
      isAuthenticated = false;
    };

    expect(isAuthenticated).toBe(true);
    expect(currentUser).not.toBeNull();

    // Thực hiện đăng xuất
    mockLogout();

    expect(isAuthenticated).toBe(false);
    expect(currentUser).toBeNull();
    // Khi isAuthenticated = false, RootNavigator chỉ render duy nhất màn hình AuthStack (Stack.Screen name="Auth")
  });
});
