# Thư mục Bàn giao Giao diện (UI Handoff) — Dự án LungCT

Thư mục này chứa toàn bộ tài nguyên bàn giao thiết kế giao diện người dùng (UI/UX) và bộ kit triển khai giao diện cho ứng dụng di động **LungCT** (React Native + TypeScript + Expo).

---

## 1. Liên kết Figma Thiết kế

- **Bản đầy đủ (59 khung, trạng thái, bản Tối, bản EN, Android/iOS, prototype)**:  
  [https://www.figma.com/design/A2e74JAAzntE0zUesryOlF](https://www.figma.com/design/A2e74JAAzntE0zUesryOlF)
- **Bản rút gọn 17 màn hình chính**:  
  [https://www.figma.com/design/vKyEGtdUW2w7fmf82uU1F3](https://www.figma.com/design/vKyEGtdUW2w7fmf82uU1F3)

---

## 2. Nguyên tắc Định hướng: Nghiệp vụ và Giao diện

- **Căn cứ nghiệp vụ**: Tệp đặc tả chức năng [`docs/requirements/LungCT_DacTa_ChucNang.docx`](../requirements/LungCT_DacTa_ChucNang.docx) là căn cứ cao nhất về mặt nghiệp vụ, logic luồng khám, quản lý bệnh nhân, phân tích AI on-device, quy tắc an toàn y tế và chính sách ngoại tuyến (local-first).
- **Căn cứ giao diện**: Thiết kế Figma và Bộ bàn giao giao diện trong thư mục này (`docs/ui_handoff/`) là căn cứ chuẩn mực về mặt thị giác, tỷ lệ bố cục, kiểu chữ, khoảng cách, bộ màu sắc (Design Tokens) và tương tác người dùng.
- **Nguyên tắc xử lý khi có khác biệt**:
  - Không tự ý loại bỏ hoặc cắt giảm bất kỳ chức năng nghiệp vụ nào được quy định trong đặc tả chức năng.
  - Phân định rõ 3 cấp độ nhãn quy định trong bộ bàn giao:
    - **BẮT BUỘC**: Bám sát 100% theo quy tắc nghiệp vụ (`BR-`), thông điệp (`MSG-`), và yêu cầu chức năng.
    - **ĐỀ XUẤT**: Các phương án bố trí giao diện (thứ tự khối, tiêu chí lọc, vị trí nút) cần nhóm phát triển phê duyệt.
    - **CHƯA CHỐT Q-xx**: Các vấn đề mở (Q-01 đến Q-27) được vẽ theo phương án đề xuất của đặc tả và phải được cấu hình hóa trong `ui-decisions.ts` (không hardcode).

---

## 3. Tình trạng Truy cập Figma và Giới hạn Kỹ thuật

- **Kiểm tra trực tuyến**: Liên kết Figma đã được xác thực mở thành công trong môi trường duyệt web thực tế, nhận diện tệp thiết kế *“LungCT — UI/UX Design System & App (v0.1)”* với đầy đủ các phân trang (`01 · Nền tảng & Thành phần`, `02 · Màn hình & Prototype (VN · Sáng)`, `03 · Tối · EN · Android/iOS · Luồng`).
- **Giới hạn kỹ thuật**: Canvas thiết kế của Figma được kết xuất bằng công nghệ WebGL/WASM nhị phân và yêu cầu phiên đăng nhập tài khoản / phân quyền Dev Mode để truy xuất cây layer qua DOM. Vì vậy, trợ lý AI không thể quét DOM trực tiếp các node trên canvas Figma qua mạng.
- **Phương án giải quyết**: Toàn bộ dữ liệu thiết kế đã được trích xuất hoàn chỉnh thành tài nguyên cục bộ ngay trong thư mục này (cây bố cục `layout-json`, ảnh chuẩn `png/` @2x, đồ họa vector `svg/`, mã nguồn theme TypeScript đã kiểm thử, bộ icon chuẩn y tế và từ điển đa ngôn ngữ). Các bước xây dựng UI sẽ khai thác trực tiếp từ tài nguyên cục bộ này để đảm bảo độ chính xác tuyệt đối mà không phụ thuộc vào kết nối mạng tới Figma.

---

## 4. Cấu trúc Thành phần trong Thư mục

| Thành phần | Định dạng / Vị trí | Mô tả nội dung |
| :--- | :--- | :--- |
| **Bảng ánh xạ tên tệp chuẩn hóa** | [`file-name-mapping.md`](./file-name-mapping.md) | Bảng tra cứu đối chiếu chi tiết tên cũ → tên mới chuẩn hóa (kebab-case tiếng Anh) của 17 bộ tài nguyên màn hình (`.json`, `.png`, `.svg`), tệp tổng quan và kết quả đối chiếu bộ icon. |
| **Đặc tả UI/UX toàn diện** | [`LungCT_DacTa_UIUX.docx`](./LungCT_DacTa_UIUX.docx) | Bản đặc tả thiết kế UI/UX chi tiết từ Figma: 55+ khung màn hình, 31 nhóm component, 27 mã SCR, 153 liên kết prototype, 48 design token màu, bảng phân tích khác biệt Android/iOS và 27 mục chưa chốt Q-xx. |
| **Bộ Kit Bàn giao Giao diện** | [`LungCT-UI-Handoff/`](./LungCT-UI-Handoff/) | Thư mục bộ kit hoàn chỉnh phục vụ dựng giao diện React Native + Expo. |
| ↳ Hướng dẫn triển khai | [`ANTIGRAVITY/`](./LungCT-UI-Handoff/ANTIGRAVITY/) | 10 tệp câu lệnh chi tiết từ `00-cach-dung.md` đến `09-toi-tieng-anh-kiem-tra-cuoi.md`. |
| ↳ Mã nguồn Theme | [`code/src/ui/theme/`](./LungCT-UI-Handoff/code/src/ui/theme/) | Bộ theme TypeScript hoàn chỉnh (`palette.ts`, `light.ts`, `dark.ts`, `spacing.ts`, `typography.ts`, `heatmap.ts`, `ThemeProvider.tsx`, v.v.) đã vượt qua 32/32 unit tests. |
| ↳ Tài liệu thiết kế | [`design/`](./LungCT-UI-Handoff/design/) | 5 tệp markdown: Design tokens, đặc tả từng khung (66 khung), thư viện component (22 nhóm), thông điệp MSG-01..16 & quy tắc, bản đồ điều hướng 17 màn. |
| ↳ Bố cục & Ảnh tham chiếu | [`reference/screens-v2/`](./LungCT-UI-Handoff/reference/screens-v2/) | 17 bộ tài nguyên màn hình chuẩn (mỗi màn gồm đủ `.json`, `.png` @2x, `.svg` đồng nhất tên kebab-case) và mã plugin dựng Figma. |
| ↳ Bộ Icon Hệ thống | [`assets/icons/`](./LungCT-UI-Handoff/assets/icons/) | 64 icon y tế đồng nhất (SVG, PNG 32px, PNG 64px) kèm tệp kê khai `manifest.json`. |
| ↳ Đa ngôn ngữ (i18n) | [`i18n/`](./LungCT-UI-Handoff/i18n/) | Từ điển song ngữ Việt - Anh (`vi.json`, `en.json`) chứa 16 thông điệp nghiệp vụ, nhãn trạng thái và 385 chuỗi giao diện. |

---

*Tài liệu được cập nhật ngày 25/10/2026 sau khi hoàn thành chuẩn hóa tên tệp tài nguyên trong bộ bàn giao giao diện LungCT.*
