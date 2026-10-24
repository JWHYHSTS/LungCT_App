# UI-05 — Điều hướng và 3 màn xác thực

**Đầu vào.** `design/05-man-hinh-va-dieu-huong.md` (cấu trúc React Navigation), layout-json + PNG số 01 Đăng nhập, 02 Đăng ký, 03 Chờ duyệt; đặc tả SCR-A02, A03, A04 trong `design/02-dac-ta-tung-khung.md`.

**Yêu cầu.**
1. Cài `@react-navigation/native`, `native-stack`, `bottom-tabs` (hoặc expo-router tương đương — chọn một, ghi lý do trong báo cáo). Dựng `RootStack` = AuthStack | DoctorTabs | AdminTabs; tab bar dùng component `TabBar` của UI-03.
2. Code 3 màn **giống ảnh chuẩn**: bố cục, thứ tự khối, khoảng cách, chữ, màu. Dữ liệu giả lập; nút “Đăng nhập” với email chứa `admin` → AdminTabs, còn lại → DoctorTabs (chỉ để demo UI, ghi `TODO(AUTH-02)` thay bằng xác thực thật).
3. Trạng thái phải có (theo đặc tả): A02 ngoại tuyến (banner + Quên mật khẩu/Đăng ký disabled kèm lý do), lỗi, loading (khóa bấm lặp); A03 lỗi theo trường + hỏi “Bỏ thông tin đã nhập?”; A04 chờ duyệt / bị khóa (MSG-06, MSG-07).
4. Bàn phím không che ô nhập (KeyboardAvoidingView iOS; Android `adjustResize`); hỗ trợ Autofill mật khẩu (`textContentType`/`autoComplete`).

**Kiểm thử.** Test điều hướng: Login → Register → AccountStatus → Login; test trạng thái disabled khi trường trống.

**Minh chứng.** Ảnh 3 màn trên điện thoại đặt cạnh PNG chuẩn (cùng tỉ lệ), ghi các điểm còn lệch.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
