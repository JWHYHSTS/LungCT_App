# Tài liệu kiến trúc điều hướng và xác thực - Gói UI-05

Tài liệu này cung cấp giải thích chi tiết về cấu trúc mã nguồn, giải pháp kiến trúc và luồng điều hướng được xây dựng trong gói **UI-05** nhằm phục vụ học tập, nắm bắt và kế thừa cho các giai đoạn tiếp theo.

---

## 1. Tổng quan kiến trúc điều hướng (Navigation Architecture)

Trong LungCT Mobile, hệ thống điều hướng được xây dựng dựa trên **React Navigation v7** theo mô hình trạng thái xác thực cấp cao (State-driven Root Navigation):

```
RootNavigator
│
├── [Chưa đăng nhập: isAuthenticated = false]
│   └── AuthStack (Native Stack)
│       ├── LoginScreen (SCR-A02: Màn hình Đăng nhập)
│       ├── RegisterScreen (SCR-A03: Màn hình Đăng ký bác sĩ)
│       └── AccountStatusScreen (SCR-A04: Màn hình Trạng thái tài khoản Chờ duyệt / Bị khóa)
│
└── [Đã đăng nhập: isAuthenticated = true]
    ├── [user.role === 'doctor']
    │   └── DoctorTabs (Bottom Tab Navigator - 5 tabs chuẩn hóa với custom TabBar)
    │       ├── HomeTab (Trang chủ)
    │       ├── PatientsTab (Bệnh nhân)
    │       ├── CasesTab (Ca bệnh)
    │       ├── StatisticsTab (Thống kê)
    │       └── ProfileTab (Tôi)
    │
    └── [user.role === 'admin']
        └── AdminTabs (Bottom Tab Navigator - 3 tabs chuẩn hóa với custom TabBar)
            ├── AccountsTab (Tài khoản)
            ├── StatisticsTab (Thống kê)
            └── ProfileTab (Tôi)
```

### Điểm nổi bật:
1. **Không dùng `NavigationContainer` lồng nhau vô cội vạ**: `NavigationContainer` chỉ đặt tại `RootNavigator.tsx` bọc toàn bộ cây điều hướng, tích hợp sẵn Theme Sáng / Tối và cấu hình font Be Vietnam Pro.
2. **Loại bỏ nguy cơ lộ màn hình**: Người dùng chưa đăng nhập không thể điều hướng tới các tab nghiệp vụ; người dùng đã đăng nhập không thể quay ngược lại màn hình đăng nhập bằng phím Back nếu chưa thực hiện đăng xuất.
3. **Phân quyền tuyệt đối**: Chỉ có 2 vai trò chuẩn theo tài liệu nghiệp vụ: `doctor` và `admin`. Không tự ý thêm vai trò khác.

---

## 2. Tách bạch Giao diện (UI), Dữ liệu giả lập (Mock) và Xác thực thật

Nhằm bảo đảm tính minh bạch trong quá trình phát triển mã nguồn mở và dễ dàng thay thế ở giai đoạn backend integration:

- **Tầng Giao diện (Presentation Layer)**:
  - `LoginScreen.tsx`, `RegisterScreen.tsx`, `AccountStatusScreen.tsx`.
  - Toàn bộ giao diện sử dụng các thành phần dùng chung (Design System) từ `src/ui/components`: `AppText`, `Button`, `TextField`, `TopBar`, `StatusBadge`, `Checkbox`, `Dialog`.
- **Tầng Giả lập dữ liệu (Mock Engine)**:
  - Nằm trong `src/features/auth/context/AuthContext.tsx`.
  - Quy tắc phân quyền mock được ghi chú rõ ràng bằng thẻ `TODO(AUTH-02)`:
    - Nếu email chứa chữ `"admin"` (ví dụ `admin@lungct.vn`) -> Gán vai trò `admin`.
    - Nếu email là `pending@lungct.vn` -> Trạng thái tài khoản `pending` (MSG-06).
    - Nếu email là `locked@lungct.vn` -> Trạng thái tài khoản `locked` (MSG-07).
    - Các trường hợp còn lại -> Gán vai trò `doctor`.
  - Mô phỏng mạng ngoại tuyến: Biến `isOnline` có thể bật/tắt trực tiếp trên UI để kiểm thử hành vi offline-first.
- **Tầng Xác thực thật (Production Integration Hook)**:
  - Khi hoàn thiện API backend ở gói `AUTH-02`, chỉ cần thay thế phần thân của các hàm `login()`, `registerDoctor()`, `checkAccountStatus()` trong `AuthContext.tsx` bằng lời gọi API thực tế qua Axios/Fetch và lưu trữ JWT token vào `SecureStore` (Expo SecureStore). Toàn bộ giao diện và cấu trúc điều hướng giữ nguyên.

---

## 3. Xử lý phím Back Android cho Form có dữ liệu (Dirty Form Prevention)

Trên nền tảng Android, người dùng thường có thói quen bấm phím Back vật lý (hoặc cử chỉ vuốt cạnh màn hình) để quay lại. Nếu đang điền form đăng ký dài mà bị quay lại, toàn bộ dữ liệu sẽ mất.

### Giải pháp kỹ thuật trong `RegisterScreen.tsx`:
1. **Theo dõi trạng thái form bẩn (`isFormDirty`)**:
   ```typescript
   const isFormDirty = Boolean(
     fullName.trim() ||
     email.trim() ||
     workplace.trim() ||
     licenseNumber.trim() ||
     password.trim() ||
     confirmPassword.trim()
   );
   ```
2. **Lắng nghe sự kiện phần cứng `hardwareBackPress`**:
   ```typescript
   useEffect(() => {
     const onHardwareBackPress = () => {
       if (isFormDirty) {
         setShowDiscardDialog(true);
         return true; // Chặn hành vi back mặc định của hệ thống Android
       }
       return false; // Cho phép back bình thường nếu form chưa nhập gì
     };

     const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
     return () => backHandler.remove();
   }, [isFormDirty]);
   ```
3. **Hiển thị Dialog xác nhận**:
   - Tiêu đề: "Bỏ thông tin đã nhập?"
   - Lựa chọn:
     - Nút "Tiếp tục sửa" (`cancel`): Đóng hộp thoại, giữ nguyên form.
     - Nút "Bỏ thông tin" (`destructive`): Đóng hộp thoại và thực hiện `onNavigateBack()`.

---

## 4. Tích hợp Custom TabBar vào React Navigation

React Navigation mặc định sử dụng tab bar native của thư viện. Để đảm bảo 100% độ nhất quán với Design System và tuân thủ Figma LungCT v1:

- Trong `DoctorTabs.tsx` và `AdminTabs.tsx`, thuộc tính `tabBar` của `Tab.Navigator` được truyền hàm render tùy biến:
  ```typescript
  tabBar={({ state, navigation }) => {
    const currentRoute = state.routes[state.index].name;
    return (
      <TabBar
        tabs={tabs}
        activeTab={currentRoute}
        onTabPress={(key) => navigation.navigate(key)}
      />
    );
  }}
  ```
- Nhờ đó, toàn bộ chiều cao tab (60dp), vùng chạm trợ năng (≥44x44), huy hiệu số (badge), nhãn chữ typography, màu sắc thương hiệu `brand.primary` và chế độ Tối/Sáng đều được quản lý tập trung qua component `TabBar` chuẩn hóa ở gói UI-03.

---

## 5. Danh mục Unit Tests cho Điều hướng & Xác thực và Giới hạn Kiểm thử

Bộ kiểm thử [authNavigation.test.tsx](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/auth/__tests__/authNavigation.test.tsx) bao gồm 7 kiểm thử tập trung vào logic trạng thái xác thực và phân quyền:

1. **Test 1 - Đăng nhập mặc định chuyển vào DoctorTabs**:
   - Khi `login('doctor@lungct.vn', 'password123')` thành công, `isAuthenticated = true`, `user.role = 'doctor'`, trạng thái sẵn sàng cho 5 tab bác sĩ.
2. **Test 2 - Đăng nhập tài khoản admin chuyển vào AdminTabs**:
   - Khi email chứa `admin` (ví dụ `admin@lungct.vn`), gán `user.role = 'admin'`, trạng thái sẵn sàng cho 3 tab quản trị viên.
3. **Test 3 - Đăng ký bác sĩ mới đưa vào trạng thái chờ duyệt**:
   - Sau khi hoàn thành form đăng ký, tài khoản có `status = 'pending'`, sẵn sàng điều hướng sang `AccountStatusScreen` hiển thị biểu tượng chờ duyệt (MSG-06).
4. **Test 4 - Tài khoản bị khóa điều hướng sang màn hình thông báo khóa**:
   - Khi trạng thái tài khoản là `locked`, sẵn sàng điều hướng sang `AccountStatusScreen` với thông điệp tài khoản bị khóa (MSG-07).
5. **Test 5 - Đăng xuất xóa phiên và đưa về LoginScreen**:
   - Khi gọi `logout()`, `isAuthenticated` trở về `false`, xóa sạch thông tin người dùng khỏi bộ nhớ trạng thái.
6. **Test 6 - Tài khoản pending / locked không cấp quyền truy cập**:
   - Kiểm tra logic của `AuthContext`: Tài khoản có trạng thái `pending` hoặc `locked` luôn giữ `isAuthenticated = false` và `user = null`.
7. **Test 7 - Đăng xuất xóa sạch dữ liệu phiên**:
   - Khi gọi `logout()`, `isAuthenticated` lập tức chuyển thành `false` và `user` thành `null`.

> [!NOTE]
> **Giới hạn kiểm thử Unit Test**:
> - Các bài kiểm thử trong `authNavigation.test.tsx` hiện kiểm tra trực tiếp logic trạng thái xác thực của **AuthContext / AuthProvider** và các hàm render màn hình độc lập, **chưa render toàn bộ cây React Navigation thật (`NavigationContainer` + `RootNavigator`) trong Jest** (do môi trường Jest chưa mock toàn bộ các native modules lồng nhau của React Navigation v7 và Reanimated).
> - Việc bảo đảm tài khoản `pending`/`locked` không hiển thị tab nghiệp vụ và thao tác `logout()` gỡ bỏ hoàn toàn nhánh nghiệp vụ (`DoctorApp`/`AdminApp`) được đảm bảo nhờ:
>   1. **Kiến trúc khai báo điều kiện (Conditional Rendering)** trong [RootNavigator.tsx](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/navigation/RootNavigator.tsx): khi `!isAuthenticated`, chỉ duy nhất `<Stack.Screen name="Auth" component={AuthStack} />` tồn tại trên cây điều hướng.
>   2. **Kiểm chứng thực nghiệm trực tiếp trên máy ảo Android**: Đã thử nghiệm đăng nhập, chuyển tab, đăng ký form và đăng xuất; xác nhận sau khi đăng xuất thì phím Back phần cứng không thể quay lại màn hình nghiệp vụ.

---

## 6. Cơ chế phân biệt Giả lập (Mock) và Hệ thống thật

Trong giai đoạn xây dựng giao diện (UI-05):
- **Dấu hiệu nhận biết mô phỏng trên UI**:
  - `LoginScreen`: Badge mạng hiển thị rõ `Mô phỏng: Online` hoặc `Mô phỏng: Offline`.
  - `MockRoleScreen`: Hiển thị rõ nhãn phụ `(Mô phỏng)`, ví dụ: *"Khu vực Bác sĩ (Mô phỏng)"*, *"Người dùng mô phỏng: doctor@lungct.vn"*.
  - `AccountStatusScreen`: Khi bấm nút "Kiểm tra lại trạng thái", hộp thoại Dialog giải thích rõ: *"[Chế độ mô phỏng] Tài khoản vẫn đang chờ duyệt / bị khóa. Khi kết nối API thật (AUTH-02), trạng thái sẽ được đồng bộ trực tiếp từ máy chủ."*
- **Quy tắc phân quyền email "admin"**:
  - Quy tắc `email.toLowerCase().includes('admin')` **chỉ tồn tại cục bộ trong mock demo của AuthContext** nhằm giúp người thẩm định kiểm tra giao diện 3 tab của quản trị viên và 5 tab của bác sĩ.
  - Quy tắc này sẽ được thay thế 100% bằng Claims / Role trả về từ Token xác thực JWT khi kết nối dịch vụ backend thật ở gói AUTH-02.

---

## 7. Xử lý chức năng "Quên mật khẩu?" và Nâng cấp Trợ năng TextField

1. **Liên kết Quên mật khẩu**:
   - Khi thiết bị ở trạng thái ngoại tuyến (`isOffline = true`), nút bị vô hiệu hóa mờ đi (`opacity: 0.5`).
   - Khi trực tuyến, liên kết kích hoạt hộp thoại `Dialog` thông báo minh bạch: *"Chức năng đặt lại mật khẩu qua email chưa được kích hoạt trong phiên bản này. Vui lòng liên hệ quản trị viên hệ thống để được hỗ trợ."* (Tuyệt đối không im lặng và không báo thành công giả).
2. **Nút ẩn/hiện mật khẩu trên TextField & Cơ chế lưu giữ văn bản**:
   - Bổ sung prop `trailingIconAccessibilityLabel` và gán thuộc tính trợ năng `accessibilityRole="button"`, `accessibilityLabel="Ẩn mật khẩu" / "Hiện mật khẩu"`.
   - **Làm rõ cơ chế render**: Khi người dùng bấm nút icon mắt, state `showPassword` thay đổi và component cha/con **hoàn toàn có thể re-render lại**. Tuy nhiên, nội dung văn bản trong ô nhập **không bị mất** là nhờ cơ chế **Controlled Component** trong React: chuỗi ký tự mật khẩu được lưu trữ an toàn trong React state (`value={password}` và `onChangeText={setPassword}`), chứ không phải vì `TextInput` không re-render.
   - Các thuộc tính và cách dùng cũ của `TextField` trên toàn bộ 17 màn hình khác được bảo toàn nguyên vẹn.

---

## 8. Tồn đọng kỹ thuật cần lưu ý từ UI-04

Theo yêu cầu nghiệp vụ và rà soát kỹ thuật:
- **Pinch-zoom hai ngón và độ khớp ảnh CT–Grad-CAM**: Vẫn giữ nguyên ghi nhận tồn đọng chưa được xác minh đầy đủ trên thiết bị vật lý có màn hình cảm ứng đa điểm thật (do môi trường hiện tại đang thử nghiệm trên máy ảo điều khiển bằng chuột qua ADB). Cần bố trí thiết bị Android thật để nghiệm thu cử chỉ zoom 2 ngón và độ đồng bộ transform giữa ảnh CT gốc và lớp phủ nhiệt Grad-CAM.

