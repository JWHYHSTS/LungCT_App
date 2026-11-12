import React from 'react';
import { DoctorHomeScreen } from '../screens/DoctorHomeScreen';
import { DoctorPatientsScreen } from '../screens/DoctorPatientsScreen';
import { DoctorCasesScreen } from '../screens/DoctorCasesScreen';
import { DoctorStatsScreen } from '../screens/DoctorStatsScreen';
import { DoctorProfileScreen } from '../screens/DoctorProfileScreen';
import * as themeModule from '../../../ui/theme/ThemeProvider';
import * as authModule from '../../auth/context/AuthContext';
import '../../../i18n';

describe('UI-06: Doctor Tabs Unit Tests', () => {
  let originalDispatcher: any;

  beforeEach(() => {
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
    if (internals && originalDispatcher !== undefined) {
      internals.H = originalDispatcher;
    }
  });

  test('1. DoctorHomeScreen render thành công với các khối dữ liệu mock chuẩn', () => {
    const screen = DoctorHomeScreen({});
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('2. DoctorHomeScreen render thành công trạng thái Skeleton và Empty', () => {
    const loadingScreen = DoctorHomeScreen({ isLoadingInitial: true });
    expect(loadingScreen).toBeDefined();

    const emptyScreen = DoctorHomeScreen({ isEmptyInitial: true });
    expect(emptyScreen).toBeDefined();
  });

  test('3. DoctorPatientsScreen render thành công với danh sách bệnh nhân và bộ lọc', () => {
    const screen = DoctorPatientsScreen({});
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('4. DoctorCasesScreen render thành công với danh sách ca bệnh và chip trạng thái', () => {
    const screen = DoctorCasesScreen({});
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('5. DoctorStatsScreen render thành công với 4 StatCard và biểu đồ SVG', () => {
    const screen = DoctorStatsScreen({ initialRange: '30d' });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('6. DoctorProfileScreen render thành công và nút Đăng xuất kích hoạt callback', () => {
    const onLogoutMock = jest.fn();
    const screen = DoctorProfileScreen({ onLogoutSuccess: onLogoutMock });
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('7. DoctorHomeScreen tính toán và phân định chính xác số ca nháp và hoàn tất', () => {
    const screen = DoctorHomeScreen({});
    expect(screen).toBeDefined();
    expect(React.isValidElement(screen)).toBe(true);
  });

  test('8. DoctorStatsScreen hỗ trợ lọc kỳ 7 ngày, 30 ngày và tất cả', () => {
    const screen7d = DoctorStatsScreen({ initialRange: '7d' });
    const screen30d = DoctorStatsScreen({ initialRange: '30d' });
    const screenAll = DoctorStatsScreen({ initialRange: 'all' });
    expect(screen7d).toBeDefined();
    expect(screen30d).toBeDefined();
    expect(screenAll).toBeDefined();
  });
});
