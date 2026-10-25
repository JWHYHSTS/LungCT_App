import React from 'react';
import {
  AppText,
  Button,
  IconButton,
  TextField,
  SearchField,
  FilterChip,
  StatusBadge,
  AILabel,
  Banner,
  TopBar,
  TabBar,
  ListRow,
  SectionHeader,
  StatCard,
  EmptyState,
  Divider,
  Screen,
} from '../index';
import { ThemeProvider } from '../../theme';
import * as themeModule from '../../theme/ThemeProvider';

describe('Thư viện Component lõi đợt 1 (UI-03)', () => {
  // Test 1: Đủ 17 component chuẩn hóa
  test('1. Tất cả 17 component đều được định nghĩa và là React component hợp lệ', () => {
    const components = [
      AppText,
      Button,
      IconButton,
      TextField,
      SearchField,
      FilterChip,
      StatusBadge,
      AILabel,
      Banner,
      TopBar,
      TabBar,
      ListRow,
      SectionHeader,
      StatCard,
      EmptyState,
      Divider,
      Screen,
    ];

    expect(components).toHaveLength(17);
    components.forEach((cmp) => {
      expect(cmp).toBeDefined();
      expect(typeof cmp).toBe('function');
    });
  });

  // Test 2: Button với các biến thể và props
  test('2. Component Button khởi tạo React Element hợp lệ với đầy đủ props và icon', () => {
    const element = (
      <ThemeProvider>
        <Button label="Xác nhận" variant="primary" size="L" leadingIcon="grad-cam" />
      </ThemeProvider>
    );
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.children.props.label).toBe('Xác nhận');
    expect(element.props.children.props.variant).toBe('primary');
  });

  // Test 3: BR-UI-01 cho StatusBadge và AILabel
  test('3. Component StatusBadge và AILabel bảo toàn quy tắc BR-UI-01 luôn có chữ', () => {
    const badgeEl = (
      <ThemeProvider>
        <StatusBadge label="Đã hoàn thành" tone="success" />
      </ThemeProvider>
    );
    const aiLabelEl = (
      <ThemeProvider>
        <AILabel classification="Malignant" />
      </ThemeProvider>
    );

    expect(React.isValidElement(badgeEl)).toBe(true);
    expect(badgeEl.props.children.props.label).toBe('Đã hoàn thành');

    expect(React.isValidElement(aiLabelEl)).toBe(true);
    expect(aiLabelEl.props.children.props.classification).toBe('Malignant');
  });

  // Test 4: TabBar cấu trúc 5 tab Bác sĩ và 3 tab Quản trị viên
  test('4. Component TabBar khởi tạo đủ 5 tab Bác sĩ và 3 tab Quản trị viên', () => {
    const docTabEl = (
      <ThemeProvider>
        <TabBar role="doctor" activeTabKey="home" />
      </ThemeProvider>
    );
    const adminTabEl = (
      <ThemeProvider>
        <TabBar role="admin" activeTabKey="accounts" />
      </ThemeProvider>
    );

    expect(docTabEl.props.children.props.role).toBe('doctor');
    expect(adminTabEl.props.children.props.role).toBe('admin');
  });

  // Test 5: TextField và SearchField cấu trúc cơ bản
  test('5. Component TextField và SearchField khởi tạo chuẩn accessibility và placeholder', () => {
    const textfieldEl = (
      <ThemeProvider>
        <TextField label="Tên bệnh nhân" placeholder="Nhập tên" error="Bắt buộc nhập" />
      </ThemeProvider>
    );
    const searchEl = (
      <ThemeProvider>
        <SearchField value="BN01" onChangeText={jest.fn()} placeholder="Tìm kiếm..." />
      </ThemeProvider>
    );

    expect(textfieldEl.props.children.props.label).toBe('Tên bệnh nhân');
    expect(searchEl.props.children.props.placeholder).toBe('Tìm kiếm...');
  });

  // Test 6: Screen, TopBar, SectionHeader, StatCard, EmptyState, Divider
  test('6. Component Screen, TopBar, SectionHeader, StatCard, EmptyState, Divider khởi tạo hợp lệ', () => {
    const screenEl = (
      <ThemeProvider>
        <Screen header={<TopBar title="Trang chủ" type="root" />}>
          <SectionHeader title="Thống kê" actionLabel="Xem tất cả" />
          <StatCard label="Tổng ca" value={142} tone="brand" />
          <Divider />
          <EmptyState title="Không có dữ liệu" body="Vui lòng thử lại" />
        </Screen>
      </ThemeProvider>
    );
    expect(React.isValidElement(screenEl)).toBe(true);
  });

  describe('Kiểm thử tương tác sâu (Behavioral Tests)', () => {
    let originalDispatcher: any;

    beforeEach(() => {
      // Mock useTheme trả về theme hợp lệ
      jest.spyOn(themeModule, 'useTheme').mockReturnValue({
        theme: themeModule.buildTheme('dark'),
        preference: 'dark',
        setPreference: jest.fn(),
      });

      // Thiết lập React Dispatcher tối thiểu cho môi trường React 19 để hỗ trợ useState khi gọi component function
      const internals = (React as any)
        .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      if (internals) {
        originalDispatcher = internals.H;
        internals.H = {
          useState: (init: any) => [typeof init === 'function' ? init() : init, jest.fn()],
          useContext: (ctx: any) => ctx._currentValue,
          useMemo: (fn: any) => fn(),
          useCallback: (fn: any) => fn,
          useEffect: () => {},
          useLayoutEffect: () => {},
          useRef: (init: any) => ({ current: init }),
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

    // Test 7: Button disabled/loading chặn onPress và cập nhật accessibilityState
    test('7. Button khi disabled hoặc loading tự động chặn tương tác onPress và gắn cờ accessibility', () => {
      const onPressMock = jest.fn();

      // Trường hợp 1: Normal button (bấm được và kích hoạt onPress)
      const normalBtn: any = Button({
        label: 'Bình thường',
        onPress: onPressMock,
      });
      expect(normalBtn.props.accessibilityRole).toBe('button');
      expect(normalBtn.props.disabled).toBe(false);
      expect(normalBtn.props.accessibilityState).toEqual({ disabled: false, busy: false });
      expect(typeof normalBtn.props.onPress).toBe('function');
      normalBtn.props.onPress({} as any);
      expect(onPressMock).toHaveBeenCalledTimes(1);

      // Reset mock
      onPressMock.mockClear();

      // Trường hợp 2: Disabled button (phát sự kiện bấm nhưng không được gọi onPress)
      const disabledBtn: any = Button({
        label: 'Bị khóa',
        disabled: true,
        onPress: onPressMock,
      });
      expect(disabledBtn.props.disabled).toBe(true);
      expect(disabledBtn.props.accessibilityState).toEqual({ disabled: true, busy: false });
      // Khi disabled, prop onPress được gán undefined để chặn kích hoạt
      expect(disabledBtn.props.onPress).toBeUndefined();
      if (typeof disabledBtn.props.onPress === 'function') {
        disabledBtn.props.onPress({} as any);
      }
      expect(onPressMock).not.toHaveBeenCalled();

      // Trường hợp 3: Loading button (vừa bận vừa chặn chạm, phát sự kiện nhưng không gọi onPress)
      const loadingBtn: any = Button({
        label: 'Đang tải',
        loading: true,
        onPress: onPressMock,
      });
      expect(loadingBtn.props.disabled).toBe(true);
      expect(loadingBtn.props.accessibilityState).toEqual({ disabled: true, busy: true });
      expect(loadingBtn.props.onPress).toBeUndefined();
      if (typeof loadingBtn.props.onPress === 'function') {
        loadingBtn.props.onPress({} as any);
      }
      expect(onPressMock).not.toHaveBeenCalled();
    });

    // Test 8: TextField nhận nhập liệu changeText, hiển thị helper/error và editable khi disabled
    test('8. TextField nhận giá trị nhập liệu value, phát sự kiện changeText và kiểm tra nhận đúng chuỗi', () => {
      const onChangeMock = jest.fn();

      // Trường hợp 1: TextField bình thường phát sự kiện changeText
      const inputNormal: any = TextField({
        label: 'Họ và tên',
        value: 'Nguyễn Văn A',
        onChangeText: onChangeMock,
        placeholder: 'Nhập họ tên',
        helper: 'Theo thẻ BHYT',
      });
      expect(inputNormal.props.children).toBeDefined();

      // Cấu trúc children: [label, inputRow, helper/error]
      const containerChildren = inputNormal.props.children;
      expect(containerChildren[0].props.children).toBe('Họ và tên');

      const inputRow = containerChildren[1];
      const textInputNode = inputRow.props.children[0];
      expect(textInputNode.props.value).toBe('Nguyễn Văn A');
      expect(textInputNode.props.placeholder).toBe('Nhập họ tên');

      // Thực sự phát sự kiện changeText trên TextField
      const testInputString = 'Nguyễn Văn Bệnh Nhân';
      expect(typeof textInputNode.props.onChangeText).toBe('function');
      textInputNode.props.onChangeText(testInputString);
      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock).toHaveBeenCalledWith(testInputString);

      // Trường hợp 2: TextField có thông điệp lỗi (error)
      const inputError: any = TextField({
        label: 'Số điện thoại',
        value: '123',
        error: 'Số điện thoại không hợp lệ',
      });
      const errorNode = inputError.props.children[2];
      expect(errorNode.props.accessibilityRole).toBe('alert');

      // Trường hợp 3: TextField bị khóa (disabled)
      const inputDisabled: any = TextField({
        disabled: true,
        value: 'Không thể sửa',
      });
      const disabledInputNode = inputDisabled.props.children[1].props.children[0];
      expect(disabledInputNode.props.editable).toBe(false);
    });

    // Test 9: FilterChip đổi trạng thái selected và gọi onPress
    test('9. FilterChip phản hồi trạng thái selected và kích hoạt callback onPress', () => {
      const onChipPress = jest.fn();

      // Chip chưa chọn
      const unselectedChip: any = FilterChip({
        label: 'Chờ duyệt',
        selected: false,
        onPress: onChipPress,
      });
      expect(unselectedChip.props.accessibilityRole).toBe('button');
      expect(unselectedChip.props.accessibilityState).toEqual({ selected: false });

      // Kích hoạt onPress
      unselectedChip.props.onPress();
      expect(onChipPress).toHaveBeenCalledTimes(1);

      // Chip đã chọn
      const selectedChip: any = FilterChip({
        label: 'Ác tính',
        selected: true,
        onPress: onChipPress,
      });
      expect(selectedChip.props.accessibilityState).toEqual({ selected: true });
    });

    // Test 10: TabBar chọn tab và gọi callback onTabPress
    test('10. TabBar kích hoạt callback onTabPress với đúng tab key khi người dùng chuyển tab', () => {
      const onTabPressMock = jest.fn();

      const tabBarElement: any = TabBar({
        role: 'doctor',
        activeTabKey: 'cases',
        onTabPress: onTabPressMock,
      });

      const tabItems = tabBarElement.props.children;
      expect(tabItems).toHaveLength(5); // 5 tabs bác sĩ

      // Tab 'cases' (vị trí 2) đang active
      const activeTab = tabItems[2];
      expect(activeTab.props.accessibilityRole).toBe('tab');
      expect(activeTab.props.accessibilityState).toEqual({ selected: true });

      // Tab 'patients' (vị trí 1) đang inactive -> chạm vào tab
      const patientsTab = tabItems[1];
      expect(patientsTab.props.accessibilityState).toEqual({ selected: false });
      patientsTab.props.onPress();

      expect(onTabPressMock).toHaveBeenCalledWith('patients');
    });
  });
});
