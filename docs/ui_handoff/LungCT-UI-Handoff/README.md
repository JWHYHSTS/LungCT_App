# LungCT — Bộ bàn giao giao diện (UI Handoff Kit)

Bộ này chứa **mọi thứ cần để dựng lại giao diện LungCT trong React Native + TypeScript + Expo giống thiết kế Figma**: mã màu đã kiểm thử, kiểu chữ, khoảng cách, icon, ảnh chuẩn từng màn hình, cấu trúc bố cục chi tiết (JSON), đặc tả từng khung, chuỗi chữ Việt/Anh và câu lệnh giao việc cho Antigravity theo từng bước.

> Phạm vi: **chỉ giao diện** (UI, điều hướng, dữ liệu giả lập). Chưa gồm backend, Firebase, SQLite, mô hình AI — các phần đó làm theo đặc tả chức năng và quy định Antigravity riêng.

## Bắt đầu ở đâu

1. Đọc `ANTIGRAVITY/00-cach-dung.md` (5 phút).
2. Giao cho Antigravity lần lượt các file `ANTIGRAVITY/01-…` đến `09-…`, **mỗi lần một file**, chờ báo cáo + minh chứng rồi mới giao file tiếp theo.

## Nội dung

| Thư mục | Có gì | Dùng để |
| --- | --- | --- |
| `ANTIGRAVITY/` | 10 file câu lệnh, từ thiết lập theme đến kiểm tra cuối | Dán/giao từng file cho Antigravity |
| `code/src/ui/theme/` | `palette.ts`, `light.ts`, `dark.ts`, `types.ts`, `spacing.ts`, `typography.ts`, `heatmap.ts`, `ThemeProvider.tsx`, `contrast.ts`, `index.ts`, `__tests__/theme.test.ts` | Chép nguyên vào app. Đã kiểm tra kiểu (tsc strict) và chạy 32/32 phép thử (khớp khóa Sáng/Tối, mã hex hợp lệ, tương phản WCAG ≥ 4.5:1 cho chữ) |
| `design/01-design-tokens.md` | Bảng 48 token màu Sáng/Tối, kiểu chữ, khoảng cách, bo góc, đổ bóng | Tra cứu |
| `design/02-dac-ta-tung-khung.md` | Đặc tả UI của 66 khung (chức năng, quy tắc, trạng thái, khác biệt Android/iOS, nhãn BẮT BUỘC/ĐỀ XUẤT/CHƯA CHỐT) | Yêu cầu chi tiết từng màn |
| `design/03-components.md` | 22 nhóm component: biến thể, props, ghi chú | Dựng thư viện component |
| `design/04-thong-diep-va-quy-tac.md` | MSG-01…16 Việt/Anh, nhãn trạng thái, quy tắc UI và nghiệp vụ | Câu chữ chuẩn, ràng buộc |
| `design/05-man-hinh-va-dieu-huong.md` | Bản đồ 17 màn chuẩn, đi tới đâu khi bấm, cấu trúc React Navigation | Điều hướng |
| `reference/screens-v2/png/` | 17 ảnh màn hình chuẩn @2x (780 px ngang; đã chuẩn hóa tên kebab-case `01-login.png`..`17-export-pdf.png`) | So khớp giao diện bằng mắt |
| `reference/screens-v2/svg/` | 17 SVG cùng nội dung (chuẩn hóa tên kebab-case `01-login.svg`..`17-export-pdf.svg`) | Đo đạc chi tiết |
| `reference/screens-v2/layout-json/` | Cây bố cục từng màn: hướng xếp, gap, padding, kích thước, màu (kèm tên token), chữ (kèm style), icon, hành vi bấm (chuẩn hóa `01-login.json`..`17-export-pdf.json`) | **Nguồn chính xác nhất để code y hệt** |
| `reference/screens-v2/figma-plugin-source.js` | Mã dựng 17 màn trong Figma | Đối chiếu khi JSON chưa rõ |
| `assets/icons/` | 64 icon SVG + PNG 32/64 + manifest | Dùng trực tiếp |
| `i18n/vi.json`, `i18n/en.json` | 16 thông điệp MSG, nhãn trạng thái, 385 chuỗi giao diện đã dịch | Đa ngôn ngữ Việt/Anh |

## Liên kết Figma

- Bản đầy đủ (59 khung, trạng thái, bản Tối, bản EN, Android/iOS, prototype): https://www.figma.com/design/A2e74JAAzntE0zUesryOlF
- Bản rút gọn 17 màn hình chính: https://www.figma.com/design/vKyEGtdUW2w7fmf82uU1F3

## Nguyên tắc không được vi phạm khi code

- Không ghi mã hex trong màn hình/component: luôn dùng `useTheme().theme.colors…`.
- Trạng thái luôn có chữ + icon, không chỉ màu (BR-UI-01).
- Điểm AI gọi là “điểm (score)”, không gọi “xác suất”; Grad-CAM không phải “vị trí khối u” (BR-AI-05, MSG-01…03).
- Heatmap dùng thang jet cố định, độ phủ mặc định 40% (`heatmap.ts`), không đổi theo theme.
- Không dùng ảnh bệnh nhân thật trong demo; dữ liệu giả lập phải gắn nhãn rõ.
- Không hiển thị URL backend, IP, đường dẫn tệp, stack trace trên giao diện (BR-UI-02).
- Mục **CHƯA CHỐT Q-xx** phải để trong hằng số/cấu hình để đổi dễ khi nhóm chốt.

Tạo ngày 25/10/2026 từ Figma LungCT v1/v2 và đặc tả chức năng `LungCT_DacTa_ChucNang.docx`.
