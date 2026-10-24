# Đặc tả UI theo từng khung màn hình (Figma LungCT v1 — bản đầy đủ)

Nguồn: ghi chú vàng đặt dưới mỗi khung ở trang 02 của file Figma https://www.figma.com/design/A2e74JAAzntE0zUesryOlF (chép tự động từ mã dựng Figma, khớp 100% với file).

Quy ước nhãn: **BẮT BUỘC** = theo đặc tả chức năng; **ĐỀ XUẤT** = lựa chọn thiết kế, có thể đổi; **CHƯA CHỐT Q-xx** = mục mở trong đặc tả, đã vẽ theo phương án đề xuất — code phải dễ đổi (đặt trong hằng số/cấu hình).

Tổng: 66 mục (59 khung trang 02 + 7 khung Android/iOS ở trang 03).

## SCR-A01 · Khởi động

*Khung Figma:* `SCR-A01 · Khởi động · loading`

*Nhãn:* BẮT BUỘC: AI-06 khi khởi động · ĐỀ XUẤT: tên/logo hiển thị

- Chức năng: AI-06, AUTH-03
- Nội dung: tên app (từ cấu hình) + chỉ báo tải. Không có thao tác.
- Ra: lần đầu → SCR-U03 → SCR-A02; phiên còn hiệu lực + kho mở được → SCR-H01 (bác sĩ) / SCR-M01 (admin).
- Offline: vẫn tiếp tục vào đăng nhập ngoại tuyến (AUTH-03).
- Android: SplashScreen API 12+; iOS: launch screen tĩnh.

## SCR-A01 · Lỗi khởi động

*Khung Figma:* `SCR-A01 · Khởi động · error`

*Nhãn:* BẮT BUỘC: không xóa dữ liệu tự động

- Trạng thái error: không mở được kho an toàn/CSDL → hướng dẫn + mã tra cứu + Thử lại.
- Quy tắc: KHÔNG tự xóa dữ liệu; không hiển thị đường dẫn tệp/stack trace (BR-UI-02).

## SCR-U03 · Thông báo riêng tư (lần đầu)

*Khung Figma:* `SCR-U03 · Thông báo bảo vệ riêng tư`

*Nhãn:* BẮT BUỘC: hiển thị trước khi dùng · ĐỀ XUẤT: câu chữ minh họa

- Chức năng: SET-03, SET-01
- Vào: lần đầu mở app; khi nội dung đổi phiên bản; từ liên kết ở SCR-A03.
- Ra: SCR-A02 hoặc quay lại SCR-A03.
- Chữ dài: cuộn được, nút chính luôn trong safe area (footer cố định).
- Nội dung các đoạn là bản nháp minh họa theo BR-OWN-03, BR-AUTH-02, BR-AI-01, MSG-01 — nội dung pháp lý chính thức do nhóm cung cấp.

## SCR-A02 · Đăng nhập

*Khung Figma:* `SCR-A02 · Đăng nhập · trực tuyến`

*Nhãn:* BẮT BUỘC: BR-AUTH-01/02/03

- Chức năng: AUTH-02, AUTH-03, SET-01
- Chính: Đăng nhập (disabled khi trường trống). Phụ: Quên mật khẩu? · Đăng ký.
- Ra: SCR-H01 (bác sĩ) / SCR-M01 (admin); SCR-A04 (chờ duyệt/khóa); SCR-A03; SCR-A05.
- Nền tảng: Autofill Android / Password AutoFill iOS; bàn phím email; nút Tiếp/Xong chuyển trường.
- Trạng thái kết nối luôn hiển thị bằng chữ + biểu tượng (BR-UI-01).

## SCR-A02 · Ngoại tuyến (AUTH-03)

*Khung Figma:* `SCR-A02 · Đăng nhập · ngoại tuyến`

*Nhãn:* BẮT BUỘC: không giới hạn 24h · CHƯA CHỐT Q-09

- Chỉ tài khoản đã đăng nhập trực tuyến ít nhất một lần trên thiết bị (BR-AUTH-01) mới đăng nhập ngoại tuyến được; xác thực bằng bộ kiểm chứng cục bộ trong kho an toàn (BR-AUTH-02).
- KHÔNG giới hạn 24 giờ ngoại tuyến (BR-AUTH-03).
- Quên mật khẩu, Đăng ký: disabled kèm lý do. Lần đầu trên máy: MSG-05.
- Số lần sai cho phép khi ngoại tuyến [CHƯA CHỐT Q-09].

## SCR-A02 · Lỗi

*Khung Figma:* `SCR-A02 · Đăng nhập · lỗi`

*Nhãn:* BẮT BUỘC: không chỉ báo lỗi bằng màu

- Lỗi theo AUTH-02 A1–A6 / AUTH-03 A1–A4 hiển thị dạng banner + viền đỏ trường. Thông điệp chung, không tiết lộ email có tồn tại hay không.
- Lỗi mạng/máy chủ không được hiểu là “bị khóa” (BR-AUTH-04): dùng MSG-08.

## SCR-A02 · Đang xử lý

*Khung Figma:* `SCR-A02 · Đăng nhập · loading`

- Nút hiển thị tiến trình và bị khóa chống bấm lặp; trường nhập giữ giá trị.

## SCR-A03 · Đăng ký

*Khung Figma:* `SCR-A03 · Đăng ký`

*Nhãn:* BẮT BUỘC: chờ admin duyệt · CHƯA CHỐT Q-09

- Chức năng: AUTH-01, SET-03
- Trường theo AUTH-01; liên kết “Thông báo bảo vệ riêng tư” mở SCR-U03.
- Thành công → SCR-A04 (Chờ duyệt). Hủy khi đã nhập → modal “Bỏ thông tin đã nhập?”.
- Offline: banner + nút disabled. Lỗi hiển thị theo từng trường.
- Bàn phím không che trường (iOS KeyboardAvoiding; Android adjustResize).
- Chính sách mật khẩu cụ thể [CHƯA CHỐT Q-09].

## SCR-A04 · Chờ duyệt

*Khung Figma:* `SCR-A04 · Trạng thái tài khoản · chờ duyệt`

*Nhãn:* BẮT BUỘC: MSG-06

- Chức năng: AUTH-01, AUTH-02 (A2)
- Thông điệp MSG-06. “Kiểm tra lại trạng thái” chỉ bật khi có mạng (offline: disabled).
- Trạng thái bằng chữ + biểu tượng, không chỉ màu.

## SCR-A04 · Bị khóa

*Khung Figma:* `SCR-A04 · Trạng thái tài khoản · bị khóa`

*Nhãn:* BẮT BUỘC: BR-AUTH-05 · CHƯA CHỐT Q-11

- Chức năng: AUTH-02 (A3), AUTH-08
- Thông điệp MSG-07. Khi bị khóa: đăng xuất, dừng đồng bộ, giữ dirty draft an toàn (BR-AUTH-05).
- Từ chối đăng ký (REJECTED) có hay không [CHƯA CHỐT Q-11] — chưa vẽ trạng thái này.

## SCR-A05 · Quên mật khẩu

*Khung Figma:* `SCR-A05 · Quên mật khẩu · đã gửi`

*Nhãn:* BẮT BUỘC: thông điệp chung

- Chức năng: AUTH-05
- Thông điệp kết quả CHUNG (không tiết lộ email có tồn tại).
- Trạng thái: loading · success (hình này) · offline: nút disabled + banner Offline · error.

## SCR-A06 · Đổi mật khẩu

*Khung Figma:* `SCR-A06 · Đổi mật khẩu`

*Nhãn:* CHƯA CHỐT Q-09 · ĐỀ XUẤT: câu chữ cảnh báo

- Chức năng: AUTH-06 · Vào/ra: SCR-U01.
- Lưu disabled khi chưa đủ trường; offline: disabled + banner.
- Cảnh báo A4: xử lý khi thiết bị khác đang ngoại tuyến [CHƯA CHỐT Q-09] — câu chữ banner là đề xuất.

## SCR-H01 · Trang chủ bác sĩ

*Khung Figma:* `SCR-H01 · Trang chủ · trực tuyến`

*Nhãn:* BẮT BUỘC: trạng thái mô hình (AI-06) · ĐỀ XUẤT: thứ tự khối, 2 thẻ số liệu

- Chức năng: HOME-01, CASE-01, STA-01, AI-06
- Khối: lời chào + chỉ báo đồng bộ (TopBar) · thẻ trạng thái mô hình · Tạo ca mới · thống kê rút gọn · ca cần xử lý · bệnh nhân gần đây.
- Tạo ca mới → bottom sheet chọn bệnh nhân. Chuông → SCR-N01; biểu tượng đồng bộ → SCR-Y01.
- Loading: skeleton từng khối. Android: Back ở tab gốc → thoát app.
- Số liệu là dữ liệu giả lập.

## SCR-H01 · Ngoại tuyến · Mô hình NOT_AVAILABLE/CORRUPTED

*Khung Figma:* `SCR-H01 · Trang chủ · ngoại tuyến + mô hình lỗi`

*Nhãn:* BẮT BUỘC: AI chạy offline (Q-01/Q-03)

- Offline: banner MSG-08 + số thay đổi chờ (MSG-14). Mọi chức năng cục bộ vẫn dùng được.
- Mô hình lỗi (MSG-09): chặn Phân tích, vẫn cho tạo ca/thêm ảnh; hướng dẫn cài lại app khi CORRUPTED (AI-06 A1).
- Hai trạng thái độc lập — vẽ chung một khung để tiết kiệm diện tích.

## SCR-H01 · Empty

*Khung Figma:* `SCR-H01 · Trang chủ · empty`

- Bác sĩ mới, chưa có bệnh nhân/ca: thay khối danh sách bằng trạng thái rỗng có hành động chính.

## SCR-H01 · Bottom sheet chọn bệnh nhân (CASE-01)

*Khung Figma:* `SCR-H01 · Tạo ca mới · chọn bệnh nhân`

*Nhãn:* BẮT BUỘC: CASE-01

- Tạo ca mới → chọn bệnh nhân có sẵn hoặc “Tạo bệnh nhân mới” (SCR-P02, quay lại luồng với bệnh nhân được chọn sẵn).
- Chọn xong → tạo ca DRAFT → SCR-C02.
- Android: Back đóng sheet; iOS: vuốt xuống đóng.

## SCR-P01 · Danh sách bệnh nhân

*Khung Figma:* `SCR-P01 · Danh sách bệnh nhân`

*Nhãn:* ĐỀ XUẤT: tiêu chí lọc

- Chức năng: PAT-02, PAT-01
- Mỗi dòng: mã, họ tên, tuổi/giới, số ca, ngày ca gần nhất, nhãn đồng bộ (chữ + biểu tượng).
- Chính: Thêm bệnh nhân (nút nổi). Phụ: Lọc, Sắp xếp (bottom sheet).
- Kéo để làm mới chỉ kích hoạt đồng bộ khi có mạng.
- Các tiêu chí lọc cụ thể là đề xuất (đặc tả chỉ ghi “chip bộ lọc, sắp xếp”).

## SCR-P01 · Trạng thái

*Khung Figma:* `SCR-P01 · empty / no-result`

- Trên: no-result (có từ khóa/bộ lọc → “Xóa bộ lọc”).
- Dưới: empty (chưa có bệnh nhân → “Thêm bệnh nhân”).
- loading: Skeleton/ListRow ×5; offline: banner + danh sách cục bộ; syncing: nhãn từng dòng.

## SCR-P01 · Bottom sheet bộ lọc

*Khung Figma:* `SCR-P01 · Bộ lọc (bottom sheet)`

*Nhãn:* ĐỀ XUẤT: tiêu chí

- Tiêu chí lọc/sắp xếp là ĐỀ XUẤT thiết kế, cần nhóm xác nhận.

## SCR-P02 · Tạo/sửa bệnh nhân

*Khung Figma:* `SCR-P02 · Biểu mẫu bệnh nhân · tạo`

*Nhãn:* CHƯA CHỐT Q-20

- Chức năng: PAT-01, PAT-04
- Trường theo PAT-01; * = bắt buộc. Lưu disabled khi chưa đủ trường bắt buộc. Ghi chú nằm cuối (cuộn).
- Ngày sinh: Android DatePicker Material; iOS UIDatePicker. dd/MM/yyyy (VI).
- Triệu chứng/Tiền sử/Ghi chú ≤ 2.000 ký tự, textarea tự giãn.
- Danh sách trường bắt buộc + cách sinh mã [CHƯA CHỐT Q-20] — vẽ theo đề xuất: mã, họ tên, ngày sinh, giới tính.

## SCR-P02 · Lỗi & thoát khi đã nhập

*Khung Figma:* `SCR-P02 · Biểu mẫu bệnh nhân · lỗi + bỏ thay đổi`

*Nhãn:* BẮT BUỘC: PAT-01 A1–A3

- A1 mã trùng trong dữ liệu của chính bác sĩ; A2 ngày sinh tương lai/không hợp lệ; A3 thoát khi đã nhập → hộp thoại.
- Lỗi bằng chữ dưới trường + viền + biểu tượng.

## SCR-P03 · Chi tiết bệnh nhân

*Khung Figma:* `SCR-P03 · Chi tiết bệnh nhân`

*Nhãn:* BẮT BUỘC: chỉ dữ liệu của chính bác sĩ (BR-OWN-01)

- Chức năng: PAT-03, PAT-04, PAT-05, CASE-01
- Khối hồ sơ (triệu chứng/tiền sử thu gọn – mở rộng) + danh sách ca (trạng thái chữ + biểu tượng + nhãn AI).
- TopBar: Sửa → SCR-P02; menu ⋯ → “Chuyển vào thùng rác” (Android overflow; iOS action sheet/context menu).
- Trạng thái: loading · empty (chưa có ca) · offline · unavailable (đã bị xóa).

## SCR-P03 · Xóa mềm (PAT-05)

*Khung Figma:* `SCR-P03 · Xóa mềm bệnh nhân`

*Nhãn:* CHƯA CHỐT Q-23

- Xóa thông thường là xóa mềm (TRASHED) có xác nhận (BR-DEL-01). Sau khi xác nhận: quay về SCR-P01 + snackbar “Đã chuyển vào Thùng rác · HOÀN TÁC”.
- Kéo theo các ca [CHƯA CHỐT Q-23] — vẽ theo đề xuất A. Không xóa khi có ảnh RUNNING (BR-DEL-03).

## SCR-C01 · Danh sách ca / Lịch sử

*Khung Figma:* `SCR-C01 · Danh sách ca / Lịch sử`

*Nhãn:* ĐỀ XUẤT: cách tóm tắt nhãn AI của ca

- Chức năng: CASE-06
- Mỗi dòng: mã ca, bệnh nhân, ngày chụp, trạng thái (chữ + biểu tượng), số ảnh, tóm tắt nhãn AI, cờ “Một phần”, nhãn đồng bộ/xung đột.
- Tóm tắt nhãn AI của ca nhiều ảnh: vẽ nhãn của ảnh có điểm cao nhất — ĐỀ XUẤT.
- Trạng thái: loading · empty · no-result · offline (dùng EmptyState/Banner chung).

## SCR-C02 · Ca nháp rỗng

*Khung Figma:* `SCR-C02 · Ca nháp · 0 ảnh`

*Nhãn:* BẮT BUỘC: BR-CASE-01

- empty (0 ảnh): hướng dẫn thêm ảnh. Hoàn tất disabled kèm lý do (BR-CASE-01).
- Menu ⋯: Xuất PDF (nháp) · Chuyển vào thùng rác.

## SCR-C02 · running (AI-01)

*Khung Figma:* `SCR-C02 · Ca nháp · đang phân tích`

*Nhãn:* BẮT BUỘC: AI on-device offline · CHƯA CHỐT Q-27

- Tiến trình theo ca + trạng thái từng ảnh; nút Hủy.
- Phân tích tuần tự, chỉ khi app mở [CHƯA CHỐT Q-27] — vẽ theo đề xuất.
- Chạy trên điện thoại, không cần mạng (BR-AI-01). Nguồn thực thi hiển thị “Trên thiết bị”.

## SCR-C02 · Biên tập nháp (trung tâm xử lý ca)

*Khung Figma:* `SCR-C02 · Ca nháp · kết quả một phần`

*Nhãn:* BẮT BUỘC: BR-AI-04, BR-IMG-02 · CHƯA CHỐT Q-13

- Chức năng: CASE-02/03/04/05/07, AI-01..04, PDF-01, TRS-01
- Lưới ảnh: thumbnail, số thứ tự, nguồn (thư viện/camera), trạng thái phân loại + Grad-CAM, nhãn AI (lỗi phân loại ≠ lỗi Grad-CAM, BR-AI-04).
- Nhận xét ca tự lưu + “Đã lưu lúc …”. Chạm ảnh → SCR-R01; nhấn giữ/⋯ → menu ảnh.
- Back (Android)/vuốt mép (iOS): lưu trước khi rời.
- Nhận xét bắt buộc khi hoàn tất? [CHƯA CHỐT Q-13].

## SCR-C02 · Ca hoàn tất (locked)

*Khung Figma:* `SCR-C02 · Ca hoàn tất · chỉ đọc`

*Nhãn:* ĐỀ XUẤT: CASE-07 · CHƯA CHỐT Q-08, Q-13

- Snapshot bất biến (BR-CASE-02): mọi thứ chỉ đọc; chọn phiên bản hoàn tất; nhãn “Một phần”.
- Chính: Xuất PDF → SCR-D01.
- “Tạo bản hiệu chỉnh” (CASE-07) là ĐỀ XUẤT, quy trình chi tiết [CHƯA CHỐT Q-13].
- Hoàn tất ngoại tuyến có hiệu lực cục bộ [CHƯA CHỐT Q-08].

## SCR-C02 · Menu từng ảnh

*Khung Figma:* `SCR-C02 · Menu ảnh`

*Nhãn:* CHƯA CHỐT Q-02

- Thay/Gỡ ảnh, Phân tích lại, Hủy (khi đang chạy) — chỉ khi ca DRAFT (BR-IMG-02). Thay ảnh tạo imageVersion mới, kết quả cũ SUPERSEDED (BR-IMG-03). Gỡ ảnh có xác nhận.
- “Phân tích bằng máy chủ” (AI-03) chỉ hiện nếu giữ chức năng [CHƯA CHỐT Q-02]; luôn có xác nhận gửi ảnh, không phải mặc định.

## SCR-C03 · Nguồn ảnh

*Khung Figma:* `SCR-C03 · Thêm/Thay ảnh (bottom sheet)`

*Nhãn:* BẮT BUỘC: JPEG/PNG theo nội dung · CHƯA CHỐT Q-26

- Chức năng: CASE-02, CASE-03
- Android 13+: Photo Picker hệ thống. iOS: PHPicker; quyền Camera có chuỗi mô tả Info.plist.
- Giải thích quyền trước hộp thoại hệ điều hành.
- MSG-15 khi sai định dạng (BR-IMG-01). Giới hạn dung lượng/số ảnh [CHƯA CHỐT Q-26].

## SCR-C03 · permission-denied

*Khung Figma:* `SCR-C03 · Quyền camera bị từ chối`

- Khi quyền bị từ chối: giải thích + “Mở Cài đặt” (Android App info; iOS trang cài đặt của app). Thư viện vẫn dùng được.
- processing: “Đang kiểm tra ảnh…”; error từng ảnh: MSG-15.

## SCR-C04 · Xem trước ảnh chụp

*Khung Figma:* `SCR-C04 · Xem trước ảnh chụp`

*Nhãn:* CHƯA CHỐT Q-16

- Chức năng: CASE-02 · Cảnh báo MSG-04 (BR-IMG-04: nguồn CAMERA).
- processing · error lưu ảnh. Giao diện camera (hệ thống hay trong app) chưa chốt thư viện.
- Chụp lại: cho phân tích + cảnh báo [CHƯA CHỐT Q-16] — vẽ theo đề xuất A.

## SCR-C05 · Modal hoàn tất

*Khung Figma:* `SCR-C05 · Hoàn tất ca (kết quả một phần)`

*Nhãn:* BẮT BUỘC: BR-CASE-01/02 · CHƯA CHỐT Q-13

- Chức năng: CASE-05, CASE-07
- Bảng trạng thái từng ảnh (Phân loại / Grad-CAM), cảnh báo MSG-12, MSG-01.
- Disabled khi còn ảnh RUNNING. Bản hiệu chỉnh: thêm trường “Lý do hiệu chỉnh”.
- Android: dialog/bottom sheet toàn chiều cao; iOS: sheet.
- Nhận xét bắt buộc? Cho hoàn tất khi 0 ảnh có kết quả? [CHƯA CHỐT Q-13].

## SCR-R01 · Xem kết quả ảnh (pass)

*Khung Figma:* `SCR-R01 · Kết quả ảnh · Grad-CAM (cuộn đầy đủ)`

*Nhãn:* BẮT BUỘC: MSG-01/02/03, BR-AI-05 · CHƯA CHỐT Q-15

- Chức năng: AI-05, AI-04, CASE-04
- Vùng ảnh zoom/pan (chụm/kéo); công tắc Gốc/Grad-CAM; độ phủ 0–100% (mặc định 40%); chú giải thang màu jet cố định (BR-AI-05).
- Ảnh x/y + trước/sau. Nhãn AI + điểm 3 lớp theo thứ tự cố định [Benign, Malignant, Normal] (BR-AI-03).
- Metadata: trạng thái phân loại/giải thích, modelVersion, nguồn thực thi, thời điểm, thời gian xử lý (giá trị ‹…› lấy từ dữ liệu thật).
- Lời nhắc MSG-01–03 bắt buộc. Màn ngang/lớn: 2 cột (đề xuất).
- Định dạng điểm [CHƯA CHỐT Q-15] — vẽ đề xuất A.

## SCR-R01 · Chế độ ảnh gốc

*Khung Figma:* `SCR-R01 · Ảnh gốc`

- Segmented “Ảnh gốc” ẩn lớp heatmap, chú giải và thanh trượt.
- Cử chỉ chụm/kéo giống nhau trên Android/iOS; “Đặt lại” đưa về vừa khung.

## SCR-R01 · error (classificationStatus = FAIL)

*Khung Figma:* `SCR-R01 · Phân loại lỗi (FAIL)`

*Nhãn:* BẮT BUỘC: BR-AI-04/06

- MSG-10. Không hiển thị điểm/nhãn khi phân loại lỗi (BR-AI-04). Không có kết quả giả (BR-AI-06).
- Thông tin kỹ thuật chỉ kèm mã tra cứu, không stack trace (BR-UI-02).

## SCR-R01 · partial (explanationStatus = FAIL / ZERO_CAM / UNAVAILABLE)

*Khung Figma:* `SCR-R01 · Thiếu Grad-CAM (zero-cam/unavailable)`

*Nhãn:* BẮT BUỘC: tách lỗi giải thích khỏi lỗi phân loại

- MSG-11. Công tắc Grad-CAM bị vô hiệu kèm lý do; điểm và nhãn vẫn hiển thị.

## SCR-R01 · mock

*Khung Figma:* `SCR-R01 · Mock (chỉ dev build)`

*Nhãn:* BẮT BUỘC: nhãn MOCK, không có trong bản phát hành

- Mock chỉ có trong dev build, luôn gắn nhãn nổi bật; không tính vào thống kê (BR-AI-06, BR-SYNC-05).
- Ca hoàn tất (locked): như màn pass nhưng nhận xét ảnh chỉ đọc.

## SCR-D01 · Xuất PDF

*Khung Figma:* `SCR-D01 · Xuất PDF`

*Nhãn:* BẮT BUỘC: MSG-01–03 trong PDF · CHƯA CHỐT Q-25

- Chức năng: PDF-01, PDF-02
- Tùy chọn: ngôn ngữ PDF (VI/EN), kèm Grad-CAM, phiên bản ca. PDF của ca hoàn tất chỉ lấy từ snapshot (BR-CASE-02). PDF luôn có MSG-01–03.
- Trạng thái: loading (đang tạo) · success · error · empty (chưa xuất).
- Mẫu PDF (logo, chữ ký) [CHƯA CHỐT Q-25].

## SCR-D01 · Chia sẻ

*Khung Figma:* `SCR-D01 · Xác nhận chia sẻ`

*Nhãn:* BẮT BUỘC: xác nhận trước khi chia sẻ

- Xác nhận trước khi mở bảng chia sẻ hệ điều hành (Android Sharesheet; iOS UIActivityViewController).

## SCR-T01 · Thùng rác

*Khung Figma:* `SCR-T01 · Thùng rác`

*Nhãn:* BẮT BUỘC: BR-DEL-02 · CHƯA CHỐT Q-12

- Chức năng: TRS-01, TRS-02 · Vào từ SCR-U01/U02.
- Nhóm: Bệnh nhân / Ca; ngày xóa. Chính: Khôi phục. Phụ: Xóa vĩnh viễn, Dọn thùng rác (xác nhận mức cao).
- Xóa vĩnh viễn: xóa tệp cục bộ + tombstone (BR-DEL-02).
- Tự xóa sau N ngày? [CHƯA CHỐT Q-12] — hiện không tự xóa.

## SCR-T01 · Xác nhận mức cao

*Khung Figma:* `SCR-T01 · Xác nhận xóa vĩnh viễn`

- MSG-13. Nút nguy hiểm tách biệt, focus mặc định vào Hủy. Offline: thao tác được ghi vào outbox, đồng bộ sau.

## SCR-S01 · Thống kê cá nhân

*Khung Figma:* `SCR-S01 · Thống kê cá nhân`

*Nhãn:* ĐỀ XUẤT: mốc thời gian · CHƯA CHỐT Q-21

- Chức năng: STA-01
- Bộ chọn thời gian (các mốc 7/30 ngày/Tất cả là ĐỀ XUẤT) · thẻ chỉ số · biểu đồ + bảng · ghi chú định nghĩa đếm (BR-SYNC-05).
- Offline: tính trên dữ liệu thiết bị. Không hiển thị độ chính xác mô hình.
- Xuất bảng [CHƯA CHỐT Q-21].

## SCR-N01 · Thông báo

*Khung Figma:* `SCR-N01 · Thông báo`

*Nhãn:* BẮT BUỘC: BR-UI-03

- Chức năng: NOT-01
- Tiêu đề, nội dung, thời điểm, chấm chưa đọc (kèm chữ “Chưa đọc” cho trình đọc màn hình). Chạm → màn liên quan.
- Thông báo đẩy/màn hình khóa chỉ chứa nội dung chung MSG-16 (BR-UI-03).
- loading · empty.

## SCR-U01 · Hồ sơ cá nhân

*Khung Figma:* `SCR-U01 · Hồ sơ cá nhân`

- Chức năng: AUTH-04, AUTH-06, AUTH-07
- Họ tên, email, nơi công tác, chuyên khoa, vai trò, trạng thái, thời điểm kiểm tra trạng thái gần nhất.
- Ra: SCR-A06, SCR-U02, SCR-T01, SCR-Y01, SCR-A02 (đăng xuất).
- Admin dùng cùng màn (ẩn Thùng rác/Đồng bộ).

## SCR-U01 · Modal đăng xuất

*Khung Figma:* `SCR-U01 · Đăng xuất (còn thay đổi chưa đồng bộ)`

*Nhãn:* BẮT BUỘC: BR-SYNC-04 · CHƯA CHỐT Q-10

- MSG-14. Đăng xuất không làm mất nháp và outbox (BR-SYNC-04).
- Có xóa dữ liệu cục bộ khi đăng xuất / nhiều tài khoản trên một máy [CHƯA CHỐT Q-10] — vẽ theo đề xuất A (giữ dữ liệu, tách theo tài khoản).

## SCR-U02 · Cài đặt

*Khung Figma:* `SCR-U02 · Cài đặt`

*Nhãn:* ĐỀ XUẤT: Tự phân tích bật mặc định · CHƯA CHỐT Q-24

- Chức năng: SET-01, SET-02, SET-03, AI-06, NOT-01
- Ngôn ngữ VI/EN; giao diện Sáng/Tối/Theo hệ thống; Tự phân tích (đề xuất mặc định bật); quyền thiết bị (Mở Cài đặt hệ thống); quyền riêng tư (SCR-U03); thông tin mô hình (không hiển thị đường dẫn tệp/URL — AI-06).
- Trạng thái: model not ready · permission denied.
- Cập nhật mô hình [CHƯA CHỐT Q-24].

## SCR-Y01 · Trung tâm đồng bộ

*Khung Figma:* `SCR-Y01 · Trung tâm đồng bộ`

*Nhãn:* BẮT BUỘC: BR-SYNC-01..04

- Chức năng: SYN-01, SYN-02, AUTH-08
- Tổng chờ gửi/lỗi/xung đột; lần đồng bộ thành công gần nhất; danh sách xung đột.
- Kiểm tra trạng thái tài khoản trước mọi đồng bộ (BR-AUTH-04). Retry có backoff (BR-SYNC-02). Không ghi đè âm thầm (BR-SYNC-03).
- Offline: nút disabled. empty: đã đồng bộ hết. locked: dừng đồng bộ.

## SCR-Y01 · Modal chọn phiên bản

*Khung Figma:* `SCR-Y01 · So sánh & chọn phiên bản`

*Nhãn:* CHƯA CHỐT Q-14

- So sánh hai phiên bản theo từng mục, người dùng chọn. Quy tắc chi tiết (tombstone thắng sửa đổi, dirty draft khi mở khóa) [CHƯA CHỐT Q-14] — vẽ theo đề xuất.

## SCR-M01 · Quản trị: Danh sách tài khoản

*Khung Figma:* `SCR-M01 · Danh sách tài khoản`

*Nhãn:* BẮT BUỘC: BR-OWN-03 · CHƯA CHỐT Q-22

- Chức năng: ADM-01, ADM-02
- Tìm kiếm, lọc trạng thái (Chờ duyệt mặc định), danh sách tài khoản. Chạm → SCR-M02.
- Admin KHÔNG thấy bệnh nhân, ca, ảnh (BR-OWN-03).
- Trạng thái: loading · empty · error · offline.
- Admin chỉ dùng trực tuyến [CHƯA CHỐT Q-22] — vẽ theo đề xuất.

## SCR-M01 · offline

*Khung Figma:* `SCR-M01 · Ngoại tuyến (chỉ xem dữ liệu cũ)`

- Dữ liệu cũ + nhãn thời gian; mọi thao tác quản trị disabled.

## SCR-M02 · Chi tiết tài khoản

*Khung Figma:* `SCR-M02 · Chi tiết tài khoản · chờ duyệt`

*Nhãn:* BẮT BUỘC: không có dữ liệu bệnh nhân/ảnh · CHƯA CHỐT Q-11

- Chức năng: ADM-01, ADM-02
- Họ tên, email, nơi công tác, chuyên khoa, trạng thái, thời điểm đăng ký/duyệt/khóa, lý do khóa; nhật ký thao tác quản trị.
- Hành động theo trạng thái: Chờ duyệt → Duyệt / Khóa; Hoạt động → Khóa; Đã khóa → Mở khóa.
- already-processed: thông báo khi admin khác đã xử lý.
- “Từ chối đăng ký” [CHƯA CHỐT Q-11] — chưa vẽ nút này.

## SCR-M02 · Modal xác nhận + lý do

*Khung Figma:* `SCR-M02 · Xác nhận khóa + lý do`

*Nhãn:* BẮT BUỘC: xác nhận + lý do

- Khóa/Mở khóa cần xác nhận và lý do; ghi nhật ký. Hệ quả phía bác sĩ: AUTH-08, BR-AUTH-05.
- Offline: nút disabled.

## SCR-M03 · Quản trị: Thống kê tổng hợp

*Khung Figma:* `SCR-M03 · Thống kê tổng hợp`

*Nhãn:* BẮT BUỘC: chỉ số liệu tổng hợp · CHƯA CHỐT Q-21

- Chức năng: ADM-03
- Thẻ + bảng số liệu tổng hợp; ghi chú “chỉ dữ liệu đã đồng bộ, không gồm mock”.
- Trạng thái: loading · empty · offline · error.
- Ngưỡng ẩn nhóm nhỏ, xuất bảng [CHƯA CHỐT Q-21]. Số liệu minh họa.

## SCR-U01 · biến thể Admin

*Khung Figma:* `SCR-U01 · Hồ sơ (Quản trị viên)`

*Nhãn:* ĐỀ XUẤT: tab admin 3 mục · CHƯA CHỐT Q-19

- Cùng màn U01, ẩn Thùng rác và Trung tâm đồng bộ (admin không có dữ liệu ca). Tab bar admin 3 mục (đề xuất).
- Cách tạo admin đầu tiên [CHƯA CHỐT Q-19].

## SCR-A02 · Ngoại tuyến, tài khoản chưa thiết lập trên máy

*Khung Figma:* `SCR-A02 · Ngoại tuyến · chưa thiết lập trên máy`

*Nhãn:* BẮT BUỘC: BR-AUTH-01

- Nguồn: KienTruc trang 3 — nhánh “Thiết bị đã thiết lập cho tài khoản này? → chưa → Chưa thể đăng nhập lần đầu trên thiết bị, cần mạng”.
- Thông điệp MSG-05. Nút Đăng nhập disabled cho tới khi có mạng.

## SCR-A02 · Ngoại tuyến, sai mật khẩu

*Khung Figma:* `SCR-A02 · Ngoại tuyến · sai mật khẩu`

*Nhãn:* BẮT BUỘC: BR-AUTH-02 · CHƯA CHỐT Q-09

- Nguồn: KienTruc trang 3 — “Mật khẩu đúng? → sai → Từ chối, cho nhập lại”. So khớp bộ kiểm chứng băm cục bộ, không lưu mật khẩu nguyên văn (BR-AUTH-02).
- Giới hạn số lần sai [CHƯA CHỐT Q-09] — chưa hiển thị bộ đếm.

## AI-03 · Xác nhận gửi ảnh (tùy chọn khi có mạng)

*Khung Figma:* `SCR-C02 · Xác nhận phân tích bằng máy chủ`

*Nhãn:* CHƯA CHỐT Q-02 · BẮT BUỘC: local là mặc định (BR-AI-01)

- Nguồn: Pipeline trang 4–5 — nhánh “server” qua HTTPS → FastAPI → job, trả cùng hợp đồng kết quả, executionSource = server.
- Không phải mặc định; chỉ hiện khi có mạng và tài khoản hợp lệ. Có giữ chức năng hay không và chính sách chọn nguồn mặc định [CHƯA CHỐT Q-02].

## SCR-C03 · processing — kiểm tra ảnh

*Khung Figma:* `SCR-C03 · Đang kiểm tra ảnh`

*Nhãn:* BẮT BUỘC: BR-IMG-01, BR-IMG-04 · CHƯA CHỐT Q-26

- Nguồn: Pipeline trang 4 — “Kiểm tra ảnh: định dạng, dung lượng, pixel; ảnh chụp phim: ngoài phân bố”.
- Kết quả từng tệp bằng chữ + biểu tượng; tệp lỗi không được thêm (MSG-15). Ngưỡng dung lượng/điểm ảnh [CHƯA CHỐT Q-26].

## Android · A02

*Khung Figma:* `Android · SCR-A02 · Đăng nhập (Autofill)`

*Nhãn:* BẮT BUỘC: theo đặc tả VI · A02

- Gợi ý Autofill do hệ điều hành vẽ (minh họa vị trí). Bàn phím email; nút IME “Tiếp”. Status bar 32dp, thanh cử chỉ 24dp, edge-to-edge.

## Android · H01 · nút Back hệ thống

*Khung Figma:* `Android · SCR-H01 · Back ở tab gốc`

*Nhãn:* ĐỀ XUẤT: hỏi xác nhận khi thoát

- Ở tab gốc, Back → thoát app; đặc tả ghi “hỏi xác nhận tùy chọn” nên hộp thoại này là ĐỀ XUẤT. iOS không có nút Back hệ thống.

## Android · P02 · chọn ngày

*Khung Figma:* `Android · SCR-P02 · DatePicker Material`

- DatePicker dạng hộp thoại Material (hệ điều hành vẽ; khung này minh họa). Định dạng dd/MM/yyyy khi tiếng Việt; không sau hôm nay, không trước 01/01/1900.

## iOS · P02 · chọn ngày

*Khung Figma:* `iOS · SCR-P02 · UIDatePicker (wheel)`

- UIDatePicker kiểu wheel hoặc compact (hệ điều hành vẽ; khung này minh họa).

## Android · P03 · menu thêm

*Khung Figma:* `Android · SCR-P03 · Overflow menu`

- Android dùng overflow menu từ nút ⋯; iOS dùng action sheet/context menu (xem khung C02 · Menu ảnh ở trang 02 cho kiểu sheet).

## Android · C03 · Photo Picker (Android 13+)

*Khung Figma:* `Android · SCR-C03 · Photo Picker hệ thống`

*Nhãn:* BẮT BUỘC: theo đặc tả VI · C03

- Dùng Photo Picker hệ thống: không cần quyền đọc toàn bộ bộ nhớ. iOS dùng PHPicker. Ô xám = ảnh của thư viện (minh họa).

## Android · D01 · Sharesheet

*Khung Figma:* `Android · SCR-D01 · Sharesheet`

*Nhãn:* BẮT BUỘC: xác nhận trước khi chia sẻ

- Bảng chia sẻ hệ thống (Android Sharesheet; iOS UIActivityViewController) chỉ mở SAU hộp thoại “Chia sẻ dữ liệu nhạy cảm?”. Ứng dụng đích là ô minh họa, không ghi tên thương hiệu.
