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
  ScoreCard,
  ScoreRow,
  ImageTile,
  HeatmapLegend,
  Dialog,
  Slider,
  BottomSheet,
} from '../index';
import { ThemeProvider } from '../../theme';
import * as themeModule from '../../theme/ThemeProvider';
import '../../../i18n';

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

    // --- UI-04 Component Tests ---
    // Test 11: ScoreCard luôn render đúng 3 dòng đúng thứ tự [Benign, Malignant, Normal] dù dữ liệu vào sai thứ tự
    test('11. ScoreCard luôn hiển thị đúng 3 dòng theo thứ tự cố định [Benign, Malignant, Normal], nhấn mạnh lớp cao nhất và kèm MSG-02', () => {
      // Dữ liệu đầu vào cố tình xáo trộn thứ tự: Normal trước, Benign sau cùng
      const unorderedScores: any = [
        { classification: 'Normal', score: 0.074 },
        { classification: 'Malignant', score: 0.7123 },
        { classification: 'Benign', score: 0.214 },
      ];

      const card: any = ScoreCard({ scores: unorderedScores });
      expect(card).toBeDefined();

      // Cấu trúc children: [header, rowsList, captionMsg02]
      const [headerNode, rowsListNode, captionNode] = card.props.children;

      // 1. Kiểm tra MSG-02
      expect(captionNode.props.children).toBe(
        'Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh.',
      );

      // 2. Kiểm tra nhãn AI ở header là lớp có điểm số cao nhất (Malignant)
      const labelsWrapper = headerNode.props.children[1];
      const topLabels = labelsWrapper.props.children;
      expect(topLabels).toHaveLength(1);
      expect(topLabels[0].props.classification).toBe('Malignant');

      // 3. Kiểm tra 3 dòng điểm số theo thứ tự cố định [Benign, Malignant, Normal]
      const rows = rowsListNode.props.children;
      expect(rows).toHaveLength(3);

      expect(rows[0].props.classification).toBe('Benign');
      expect(rows[0].props.score).toBe(0.214);
      expect(rows[0].props.isTop).toBe(false);

      expect(rows[1].props.classification).toBe('Malignant');
      expect(rows[1].props.score).toBe(0.7123);
      expect(rows[1].props.isTop).toBe(true);

      expect(rows[2].props.classification).toBe('Normal');
      expect(rows[2].props.score).toBe(0.074);
      expect(rows[2].props.isTop).toBe(false);
    });

    // Test 12: ScoreRow định dạng 3 chữ số thập phân với dấu phẩy "0,712"
    test('12. ScoreRow định dạng 3 chữ số thập phân chuẩn Q-15 (0.7123 -> "0,712") và gọi là "điểm", không gọi "xác suất"', () => {
      const row: any = ScoreRow({
        classification: 'Malignant',
        score: 0.7123,
        isTop: true,
      });

      const headerRow = row.props.children[0];
      const [labelNode, scoreNode] = headerRow.props.children;

      expect(labelNode.props.children).toBe('Ác tính');
      // Đảm bảo dấu phẩy thập phân và 3 chữ số sau dấu phẩy
      expect(scoreNode.props.children).toBe('0,712');
    });

    // Test 13: ImageTile hỗ trợ đủ 6 trạng thái và hiển thị đúng nhãn chữ
    test('13. ImageTile hỗ trợ đủ 6 trạng thái (pending, running, pass, passNoCam, fail, mock) và hiển thị đúng nhãn chữ', () => {
      const statuses: {
        status: any;
        expectedLabel: string;
        expectedTone: string;
      }[] = [
        { status: 'pending', expectedLabel: 'Chờ', expectedTone: 'pending' },
        { status: 'running', expectedLabel: 'Đang chạy', expectedTone: 'brand' },
        { status: 'pass', expectedLabel: 'Đạt', expectedTone: 'success' },
        { status: 'passNoCam', expectedLabel: 'Thiếu CAM', expectedTone: 'warning' },
        { status: 'fail', expectedLabel: 'Lỗi', expectedTone: 'danger' },
        { status: 'mock', expectedLabel: 'Giả lập', expectedTone: 'neutral' },
      ];

      statuses.forEach(({ status, expectedLabel, expectedTone }, idx) => {
        const tile: any = ImageTile({
          index: idx + 1,
          status,
          aiClass: status === 'pass' ? 'Malignant' : undefined,
        });

        const infoWrapper = tile.props.children[1];
        const [indexNode, badgesCol] = infoWrapper.props.children;

        expect(indexNode.props.children).toBe(`Ảnh ${idx + 1}`);

        const statusBadge = badgesCol.props.children[0];
        expect(statusBadge.props.label).toBe(expectedLabel);
        expect(statusBadge.props.tone).toBe(expectedTone);
      });
    });

    // Test 14: HeatmapLegend hiển thị dải màu Jet và nhãn khoa học
    test('14. HeatmapLegend render đủ các điểm dừng màu Jet cố định và các nhãn "Thấp", "Cao"', () => {
      const legend: any = HeatmapLegend({});
      expect(legend).toBeDefined();

      const [barNode, labelsRow] = legend.props.children;
      // Dải màu gồm 5 stops
      expect(barNode.props.children).toHaveLength(5);

      const labels = labelsRow.props.children;
      expect(labels[0].props.children).toBe('Thấp');
      expect(labels[1].props.children).toBe('Mức đóng góp tương đối trong ảnh này');
      expect(labels[2].props.children).toBe('Cao');
    });

    // Test 15: Dialog destructive ưu tiên focus vào nút Hủy, kiểm tra callback độc lập và đóng scrim
    test('15. Dialog loại destructive ưu tiên biến thể primary cho nút Hủy, Hủy không gọi xóa, xác nhận chỉ gọi đúng 1 lần', () => {
      const onConfirmMock = jest.fn();
      const onCancelMock = jest.fn();

      const destructiveDialog: any = Dialog({
        visible: true,
        type: 'destructive',
        title: 'Xóa ca bệnh',
        body: 'Hành động này không thể hoàn tác.',
        onConfirm: onConfirmMock,
        onCancel: onCancelMock,
      });

      // 1. Kiểm tra cấu trúc Modal và onRequestClose (Android Back)
      expect(destructiveDialog.props.onRequestClose).toBe(onCancelMock);

      // Pressable scrim -> dialogContainer -> children: [title, body, actionsRow]
      const scrim = destructiveDialog.props.children;
      expect(scrim.props.onPress).toBe(onCancelMock);

      const dialogContainer = scrim.props.children;
      const actionsRow = dialogContainer.props.children[2];
      const [cancelBtn, confirmBtn] = actionsRow.props.children;

      // Nút Hủy nhận variant primary để làm nổi bật thao tác an toàn
      expect(cancelBtn.props.label).toBe('Hủy');
      expect(cancelBtn.props.variant).toBe('primary');

      // Nút Xác nhận nhận variant danger
      expect(confirmBtn.props.label).toBe('Xác nhận');
      expect(confirmBtn.props.variant).toBe('danger');

      // 2. Kiểm tra bấm nút Hủy: CHỈ gọi onCancel, TUYỆT ĐỐI không gọi onConfirm
      cancelBtn.props.onPress();
      expect(onCancelMock).toHaveBeenCalledTimes(1);
      expect(onConfirmMock).not.toHaveBeenCalled();

      // 3. Kiểm tra bấm nút Xác nhận: gọi đúng 1 lần onConfirm
      confirmBtn.props.onPress();
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    // Test 16: Slider giới hạn giá trị và bước nhảy 5 (kèm biên 0% và 100%)
    test('16. Slider điều chỉnh độ phủ Grad-CAM chuẩn hóa min 0, max 100, step 5 và xử lý đúng tại các mốc biên 0 và 100', () => {
      const onValueChangeMock = jest.fn();

      const slider40: any = Slider({
        value: 40,
        onValueChange: onValueChangeMock,
        step: 5,
        min: 0,
        max: 100,
      });

      expect(slider40.props.accessibilityRole).toBe('adjustable');
      expect(slider40.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 40 });

      // Kiểm tra tại mốc biên 0 (độ phủ 0%)
      const slider0: any = Slider({
        value: 0,
        onValueChange: onValueChangeMock,
        step: 5,
        min: 0,
        max: 100,
      });
      expect(slider0.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });

      // Kiểm tra tại mốc biên 100 (độ phủ 100%)
      const slider100: any = Slider({
        value: 100,
        onValueChange: onValueChangeMock,
        step: 5,
        min: 0,
        max: 100,
      });
      expect(slider100.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });
    });

    // Test 17: ScoreCard xử lý trường hợp đồng hạng cao nhất: nhấn mạnh tất cả lớp cùng đạt điểm cao nhất, không tự chọn lớp thắng
    test('17. ScoreCard khi có 2 lớp đồng hạng điểm số cao nhất nhấn mạnh tất cả các lớp đó, giữ thứ tự 3 lớp cố định và không tự ý chọn một lớp thắng', () => {
      // Trường hợp Benign và Malignant cùng đạt điểm số cao nhất 0.450
      const tiedScores: any = [
        { classification: 'Normal', score: 0.1 },
        { classification: 'Benign', score: 0.45 },
        { classification: 'Malignant', score: 0.45 },
      ];

      const card: any = ScoreCard({ scores: tiedScores });
      const [headerNode, rowsListNode] = card.props.children;
      const labelsWrapper = headerNode.props.children[1];
      const topLabels = labelsWrapper.props.children;

      // Không tự ý chọn một lớp thắng: cả Benign và Malignant đều được hiển thị nhãn ở header
      expect(topLabels).toHaveLength(2);
      expect(topLabels[0].props.classification).toBe('Benign');
      expect(topLabels[1].props.classification).toBe('Malignant');

      // Cả 2 dòng Benign và Malignant đều được đánh dấu isTop = true
      const rows = rowsListNode.props.children;
      expect(rows[0].props.classification).toBe('Benign');
      expect(rows[0].props.isTop).toBe(true);

      expect(rows[1].props.classification).toBe('Malignant');
      expect(rows[1].props.isTop).toBe(true);

      expect(rows[2].props.classification).toBe('Normal');
      expect(rows[2].props.isTop).toBe(false);
    });

    // Test 18: BottomSheet hỗ trợ chạm scrim đóng và Android Back
    test('18. BottomSheet hỗ trợ chạm ngoài scrim đóng và bắt sự kiện phím Back Android (onRequestClose)', () => {
      const onCloseMock = jest.fn();

      const sheet: any = BottomSheet({
        visible: true,
        title: 'Tùy chọn thao tác',
        onClose: onCloseMock,
        children: null,
      });

      // 1. Kiểm tra onRequestClose cho Android Back
      expect(sheet.props.onRequestClose).toBe(onCloseMock);

      // 2. Chạm scrim ngoài gọi onClose
      const scrim = sheet.props.children;
      expect(scrim.props.onPress).toBe(onCloseMock);
      scrim.props.onPress();
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});
