# Tài Liệu Giải Thích Code: Lưu Cài Đặt Ngoại Tuyến, Chế Độ Tối, Tiếng Anh & Kiểm Tra Cuối (UI-09)

Tài liệu này giải thích chi tiết kiến trúc, các quyết định thiết kế và cách tổ chức mã nguồn trong giai đoạn hoàn thiện giao diện cuối cùng (UI-09) cho đồ án LungCT.

---

## 1. Tổng Quan Kiến Trúc Quản Lý Giao Diện & Ngôn Ngữ Bền Vững (SET-01, SET-02)

Trong giai đoạn UI-09, hệ thống hoàn thiện lưu trữ bền vững và quản lý trạng thái của hai cài đặt cốt lõi theo đúng yêu cầu handoff:

1. **Lưu trữ bền vững bằng AsyncStorage (`settingsStorage.ts`)**:
   - Thư viện: `@react-native-async-storage/async-storage`.
   - Khóa lưu trữ:
     - `@lungct/theme_preference`: Lưu chuỗi `'system'`, `'light'`, hoặc `'dark'`.
     - `@lungct/language_preference`: Lưu chuỗi `'vi'` hoặc `'en'`.
   - **Xử lý ngoại lệ an toàn & Fallback dữ liệu hỏng**:
     - Khi đọc dữ liệu: Nếu giá trị lưu trong storage bị sai khác hoặc không thuộc danh sách hợp lệ, hệ thống fallback an toàn về `'system'` cho theme và `null` cho ngôn ngữ (để nhận diện theo máy qua `expo-localization`).
     - Khi gặp lỗi đọc/ghi I/O (ví dụ: bộ nhớ đầy, lỗi native module): Bắt ngoại lệ và ghi log cảnh báo (`console.warn`), không bao giờ ném lỗi (throw error) gây sập ứng dụng (crash).
     - Toàn bộ hành vi này được bảo đảm bởi 14 unit tests trong [settingsStorage.test.ts](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/config/__tests__/settingsStorage.test.ts).

2. **Quản lý chủ đề màu sắc (Theme Management - SET-02)**:
   - Hệ thống hỗ trợ đầy đủ 3 tùy chọn: Sáng (`light`), Tối (`dark`), và **Theo hệ thống (`system`)**.
   - `ThemeProvider` khởi tạo trạng thái và nạp cấu hình đã lưu từ `loadStoredThemePreference()`.
   - **Phản hồi thay đổi theme của Android**: Khi người dùng chọn chế độ "Theo hệ thống" (`preference === 'system'`), ứng dụng sử dụng hook `useColorScheme()` từ React Native để liên tục theo dõi hệ điều hành Android. Khi Android đổi giữa Dark và Light mode (ví dụ: `cmd uimode night yes/no`), toàn bộ bảng màu của ứng dụng tự động chuyển đổi tức thời.
   - Khi người dùng chọn cố định `light` hoặc `dark`, cài đặt được ghi đè và lưu vào AsyncStorage; khi chọn lại `Theo hệ thống`, preference trở về `'system'` và tiếp tục lắng nghe Android.

3. **Quản lý đa ngôn ngữ (Localization - SET-01)**:
   - Sử dụng thư viện `i18next` và `react-i18next`.
   - Cung cấp hai từ điển hoàn chỉnh: [vi.json](file:///C:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/i18n/vi.json) (Tiếng Việt) và [en.json](file:///C:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/i18n/en.json) (Tiếng Anh).
   - Khi khởi động: Tải cài đặt ngôn ngữ đã lưu qua `loadStoredLanguagePreference()`. Nếu đã lưu trước đó, `i18n.changeLanguage(saved)` được gọi ngay lập tức để đồng bộ giao diện; nếu chưa có, nhận diện ngôn ngữ máy qua `expo-localization`.
   - Khi người dùng đổi ngôn ngữ trong giao diện: Sự kiện `i18n.on('languageChanged')` tự động lưu ngôn ngữ mới vào AsyncStorage.

4. **Thực nghiệm Cold Restart thực tế**:
   - Khác với việc chỉ test hàm `buildTheme` đơn thuần trong Jest, cơ chế lưu trữ đã được kiểm chứng thực nghiệm bằng việc tắt hẳn ứng dụng (`adb shell am force-stop`) và mở lại (cold start). Giao diện khôi phục chính xác ngôn ngữ và theme đã chọn mà không bị hoàn nguyên về mặc định.

---

## 2. Kiểm Toán Mã Nguồn Tự Động (Static Source Audit)

Để đảm bảo chất lượng công nghiệp theo tiêu chuẩn y tế và yêu cầu handoff:
1. **Kiểm toán mã màu Hex (`sourceAudit.test.ts`)**:
   - Quét toàn bộ cây thư mục `src/` để đảm bảo **không còn bất kỳ mã hex `#RRGGBB` tự do nào** nằm trong component hoặc màn hình (ngoại trừ thư mục quản trị theme `src/ui/theme/`).
   - Bảng màu khoa học y tế cố định của bản đồ nhiệt Grad-CAM (`HEATMAP_STOPS`), nền canvas ảnh CT (`IMAGE_CANVAS`) và các màu phôi CT giả lập (`MOCK_CT_*`) được cô lập chặt chẽ trong [heatmap.ts](file:///C:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/ui/theme/heatmap.ts) theo quy định y tế BR-AI-05 (thang đo khoa học jet scale không bị đổi màu theo theme ứng dụng).
2. **Kiểm toán chuỗi ký tự hiển thị**:
   - Toàn bộ chuỗi giao diện hiển thị cho người dùng (tiêu đề, nhãn trường, placeholder, thông báo lỗi, nội dung modal, huy hiệu và nhãn trợ năng) đều được bọc qua hàm `t(...)`.
   - Danh mục khóa giữa hai từ điển `vi.json` và `en.json` được kiểm thử cấu trúc đối xứng tự động (đạt 100% không thiếu khóa).

---

## 3. Tiêu Chuẩn Trợ Năng (Accessibility) & Co Giãn Cỡ Chữ

1. **Vùng chạm tối thiểu (Touch Target Size)**:
   - Tất cả các nút bấm (`Button`, `IconButton`, `FilterChip`, `Toggle`, `Checkbox`, v.v.) đều được thiết kế với kích thước tối thiểu $\ge 44 \times 44$ pt theo quy chuẩn giao diện y tế và khuyến nghị của Apple/Google.
2. **Nhãn trợ năng (Screen Reader Support)**:
   - Mọi nút bấm dạng icon hoặc hình ảnh đều được cung cấp `accessibilityLabel` rõ nghĩa (hỗ trợ chuyển ngữ VI/EN) và `accessibilityRole="button"`.
   - Các trường văn bản có `accessibilityLabel` chỉ định rõ mục đích nhập liệu.
3. **Co giãn phông chữ hệ thống (System Font Scaling)**:
   - Các component hiển thị văn bản sử dụng `AppText` với kích thước tương đối và khoảng đệm linh hoạt, ngăn ngừa việc vỡ khung, tràn dòng hoặc che khuất nút bấm khi người dùng bật cỡ chữ lớn (lên tới 200%).

---

## 4. Tình Trạng Dịch Vụ Ngoài & Dữ Liệu Mô Phỏng

Căn cứ hiện trạng thực tế của đồ án:
- **Dịch vụ Firebase & Backend FastAPI**: Hiện tại chưa được tích hợp trực tiếp vào ứng dụng di động; toàn bộ dữ liệu tài khoản, hồ sơ bệnh nhân, ca chụp và điểm AI đang hoạt động trong bộ nhớ mô phỏng phiên làm việc (`mock data` trong `src/mocks/`).
- **Bộ nhớ bền vững Cài đặt (AsyncStorage)**: Đã hoàn thành cho `SET-01` (ngôn ngữ) và `SET-02` (giao diện). Dữ liệu bệnh án và ca bệnh offline vẫn đang ở dạng mock in-memory và sẽ được chuyển sang SQLite ở giai đoạn cơ sở dữ liệu ngoại tuyến (`DATA-01`).
- Trên tất cả các màn hình chi tiết, danh sách ca và xuất PDF đều hiển thị thông báo minh bạch dữ liệu lưu tạm để bác sĩ và người dùng không hiểu nhầm là đã ghi vào cơ sở dữ liệu bệnh viện trung tâm.
