# Thông điệp, nhãn và quy tắc giao diện

## Thông điệp chuẩn (dùng đúng câu chữ)

| Mã | Tiếng Việt | English |
| --- | --- | --- |
| MSG-01 | Kết quả AI chỉ hỗ trợ tham khảo, không thay thế kết luận của bác sĩ. | AI results are for reference only and do not replace the physician’s conclusion. |
| MSG-02 | Điểm (score) là đầu ra của mô hình, chưa được hiệu chuẩn thành xác suất mắc bệnh. | Scores are model outputs and are not calibrated disease probabilities. |
| MSG-03 | Grad-CAM thể hiện vùng ảnh đóng góp vào dự đoán của nhánh CNN, không phải vị trí khối u đã được xác nhận. | Grad-CAM shows image regions contributing to the CNN branch’s prediction; it is not a confirmed tumor location. |
| MSG-04 | Ảnh chụp lại có thể khác ảnh CT gốc và nằm ngoài phân bố dữ liệu huấn luyện. | Re-photographed images may differ from the original CT and fall outside the training data distribution. |
| MSG-05 | Lần đăng nhập đầu tiên trên thiết bị cần kết nối mạng. | The first sign-in on this device requires an internet connection. |
| MSG-06 | Tài khoản đang chờ quản trị viên duyệt. | Your account is awaiting administrator approval. |
| MSG-07 | Tài khoản đã bị khóa. Liên hệ quản trị viên. Dữ liệu chưa đồng bộ được giữ an toàn trên máy. | Your account has been locked. Contact the administrator. Unsynced data is kept safely on this device. |
| MSG-08 | Không kết nối được máy chủ. Bạn vẫn có thể làm việc ngoại tuyến; dữ liệu sẽ được đồng bộ sau. | Cannot reach the server. You can keep working offline; data will sync later. |
| MSG-09 | Mô hình phân tích chưa sẵn sàng trên thiết bị này. | The analysis model is not ready on this device. |
| MSG-10 | Phân tích ảnh không thành công. Hãy thử lại. | Image analysis failed. Please try again. |
| MSG-11 | Thiếu Grad-CAM cho ảnh này. Kết quả phân loại vẫn được giữ. | Grad-CAM is missing for this image. The classification result is kept. |
| MSG-12 | Ca sẽ được hoàn tất với kết quả một phần. | The case will be completed with partial results. |
| MSG-13 | Xóa vĩnh viễn? Dữ liệu sẽ không thể khôi phục. | Delete permanently? This data cannot be recovered. |
| MSG-14 | Còn {n} thay đổi chưa đồng bộ. | {n} changes have not been synced. |
| MSG-15 | Chỉ hỗ trợ ảnh JPEG hoặc PNG. | Only JPEG or PNG images are supported. |
| MSG-16 | Bạn có cập nhật mới trong LungCT. | You have a new update in LungCT. |

## Nhãn trạng thái

| Tiếng Việt | English | Dùng cho |
| --- | --- | --- |
| Chờ duyệt | Pending approval | Trạng thái tài khoản |
| Hoạt động | Active | Trạng thái tài khoản |
| Bị khóa | Locked | Trạng thái tài khoản |
| Nháp | Draft | Trạng thái ca |
| Hoàn tất | Completed | Trạng thái ca |
| Kết quả một phần | Partial results | Cờ ca |
| Thùng rác | Trash | Trạng thái/khu vực |
| Chờ phân tích | Pending analysis | classificationStatus PENDING |
| Đang phân tích | Analyzing | RUNNING |
| Đã phân tích | Analyzed | PASS |
| Phân tích lỗi | Analysis failed | FAIL |
| Có Grad-CAM | Grad-CAM available | explanationStatus PASS |
| Grad-CAM không có vùng nổi bật | Grad-CAM: no salient region | ZERO_CAM |
| Không hỗ trợ Grad-CAM | Grad-CAM unavailable | UNAVAILABLE |
| Thiếu Grad-CAM | Grad-CAM missing | FAIL |
| Lành tính | Benign | Nhãn AI |
| Ác tính | Malignant | Nhãn AI |
| Bình thường | Normal | Nhãn AI |
| Trên điện thoại | On device | executionSource LOCAL |
| Máy chủ | Server | executionSource SERVER |
| Đã đồng bộ | Synced | syncState |
| Chờ đồng bộ | Waiting to sync | DIRTY/PENDING_UPLOAD |
| Đang đồng bộ | Syncing | Đang chạy |
| Xung đột | Conflict | CONFLICT |
| Đang ngoại tuyến | Offline | Banner |
| Mô hình sẵn sàng | Model ready | AI-06 |
| Mô hình chưa sẵn sàng | Model not ready | AI-06 |
| DỮ LIỆU MÔ PHỎNG — KHÔNG PHẢI KẾT QUẢ AI THẬT | SIMULATED DATA — NOT A REAL AI RESULT | mode MOCK |

## Quy tắc giao diện (từ đặc tả chức năng)

- **Bắt buộc** — Không dùng màu làm dấu hiệu trạng thái duy nhất; luôn kèm chữ và/hoặc biểu tượng có nhãn truy cập.
- **Bắt buộc** — Màu heatmap Grad-CAM là bảng màu khoa học cố định theo pipeline nguồn (notebook dùng ‘jet’ với độ phủ mặc định 0,4); không đổi theo màu thương hiệu hay theme. Có chú giải thang màu.
- **Bắt buộc** — Không đưa URL backend, IP, đường dẫn tệp, ghi chú lập trình, TODO hay log vào giao diện và PDF.
- **Bắt buộc** — Khu vực “Kết quả AI” và “Nhận xét của bác sĩ” tách biệt rõ, có tiêu đề riêng.
- **Bắt buộc** — Lời nhắc MSG-01–MSG-03 xuất hiện trên SCR-R01 và trong PDF.
- **Bắt buộc** — Chữ rõ: cỡ chữ thân tối thiểu theo khuyến nghị nền tảng (iOS Body 17 pt; Android body 14–16 sp) và co giãn theo cài đặt hệ thống.
- **Đề xuất thẩm mỹ** — Phong cách tổng thể thoáng, nhiều khoảng trắng, góc bo mềm, nhất quán với bộ icon pastel ấm, viền xám than mảnh.
- **Đề xuất thẩm mỹ** — Màu thương hiệu pastel ấm dùng cho nền nhấn, nút phụ, minh họa; màu trạng thái (lỗi/cảnh báo/thành công) dùng sắc độ đủ tương phản, không dùng pastel quá nhạt cho chữ.
- **Đề xuất thẩm mỹ** — Tab dưới 5 mục cho bác sĩ; 3 mục cho quản trị viên (Tài khoản, Thống kê, Tôi).
- **Đề xuất thẩm mỹ** — Danh sách dạng thẻ có thumbnail ảnh; ảnh CT luôn trên nền trung tính tối để dễ đọc.

## Quy tắc nghiệp vụ có ảnh hưởng tới UI

- **BR-OWN-01** — Mọi bệnh nhân, ca, ảnh, kết quả, nhận xét, PDF có ownerId; chỉ chủ sở hữu đọc/ghi. Kiểm soát ở dịch vụ (quy tắc Firebase/backend) và trong kho cục bộ, không chỉ ẩn nút.
- **BR-OWN-02** — Dữ liệu cục bộ tách theo accountId (CSDL, thư mục tệp, outbox, khóa). Đăng nhập tài khoản khác trên cùng thiết bị không thấy dữ liệu của tài khoản trước.
- **BR-OWN-03** — Quản trị viên chỉ đọc dữ liệu tài khoản và số liệu tổng hợp; mọi truy vấn trả hồ sơ/ảnh cho phiên admin bị từ chối.
- **BR-AUTH-01** — Lần đăng nhập đầu tiên trên một thiết bị bắt buộc trực tuyến và tài khoản ACTIVE.
- **BR-AUTH-02** — Không lưu mật khẩu nguyên văn ở bất kỳ đâu; bộ kiểm chứng cục bộ và khóa nằm trong kho an toàn hệ điều hành.
- **BR-AUTH-03** — Không giới hạn thời gian ngoại tuyến 24 giờ. Không có giới hạn thời gian ngoại tuyến nào khác trong các nguồn hiện hành.
- **BR-AUTH-04** — Khi có mạng, kiểm tra trạng thái tài khoản TRƯỚC mọi thao tác đồng bộ. Lỗi mạng/máy chủ không được hiểu là bị khóa.
- **BR-AUTH-05** — Khi bị khóa: đăng xuất, vô hiệu phiên, dừng đồng bộ, dọn dữ liệu đã đồng bộ theo chính sách, giữ dirty draft và phần phụ thuộc tối thiểu ở trạng thái khóa.
- **BR-IMG-01** — Chỉ nhận JPEG/PNG xác định theo nội dung; ảnh 2D; không xử lý DICOM hay khối CT 3D.
- **BR-IMG-02** — Chỉ thêm/thay/gỡ ảnh khi ca ở DRAFT (hoặc nháp hiệu chỉnh).
- **BR-IMG-03** — Thay ảnh tạo imageVersion mới; mọi kết quả gắn với imageVersion; kết quả của phiên bản cũ là SUPERSEDED và không bao giờ hiển thị cho phiên bản mới; kết quả trả về muộn của tác vụ cũ bị loại.
- **BR-IMG-04** — Ảnh chụp lại bằng camera được gắn nguồn CAMERA và cảnh báo; không mặc định chất lượng tương đương ảnh CT xuất trực tiếp; kết quả trên ảnh chụp phim cần đánh giá riêng.
- **BR-AI-01** — Phân tích mặc định chạy trên điện thoại (local). Luồng local không gọi API ngầm, không phụ thuộc mạng, Metro, USB hay máy tính.
- **BR-AI-02** — Phân tích máy chủ là tùy chọn khi có mạng, trả cùng hợp đồng kết quả và cùng classOrder/preprocessing/modelVersion; không là điều kiện để app hoạt động.
- **BR-AI-03** — classOrder cố định [Benign, Malignant, Normal]. Mỗi kết quả lưu modelVersion, preprocessingVersion, executionSource (local|server), mode (real|mock).
- **BR-AI-04** — Phân biệt lỗi phân loại (classificationStatus = FAIL: không có scores) với lỗi giải thích (explanationStatus = FAIL/ZERO_CAM/UNAVAILABLE: scores vẫn hợp lệ và được giữ). Thử lại CAM dùng đúng modelVersion của kết quả hiện hành.
- **BR-AI-05** — Scores không được gọi là xác suất mắc bệnh; Grad-CAM không được gọi là vị trí/đường viền khối u; màu heatmap chỉ so sánh tương đối trong cùng một ảnh.
- **BR-AI-06** — Không tạo heatmap giả, kết quả giả hay mô hình placeholder trong bản phát hành. Mock chỉ có trong dev build, luôn gắn nhãn, không vào thống kê và không cho hoàn tất ca.
- **BR-AI-07** — Gói nguồn (.zip/.keras/.h5) không đồng nghĩa mobile-ready. Chỉ ghi mobile-ready cho từng nền tảng khi có artifact, code tích hợp, parity, Grad-CAM thật và minh chứng thiết bị thật.
- **BR-AI-08** — Không tự đổi kiến trúc Adaptive để chạy được trên điện thoại. Nếu runtime không đáp ứng, ghi BLOCKED kèm bằng chứng và xin Jim quyết định.
- **BR-CASE-01** — Hoàn tất yêu cầu ≥ 1 ảnh và 0 ảnh RUNNING. Ca có ảnh lỗi/thiếu CAM được hoàn tất dưới dạng “kết quả một phần” sau xác nhận (chính sách khi 0 ảnh PASS: Q-13).
- **BR-CASE-02** — Hoàn tất tạo snapshot bất biến; PDF của ca hoàn tất chỉ lấy từ snapshot. Sửa sau hoàn tất qua bản hiệu chỉnh có lý do và tăng completionVersion.
- **BR-CASE-03** — Hoàn tất được phép ngoại tuyến (cục bộ) theo đề xuất; quan hệ với xác nhận trung tâm chưa chốt (Q-08). Không áp dụng lại quy định cũ cấm hoàn tất ngoại tuyến.
- **BR-DEL-01** — Xóa thông thường là xóa mềm (TRASHED), có xác nhận; xóa bệnh nhân kéo theo ca của bệnh nhân (đề xuất, Q-23).
- **BR-DEL-02** — Xóa vĩnh viễn chỉ từ Thùng rác, có xác nhận mức cao, xóa tệp cục bộ và tạo tombstone để không hồi sinh.
- **BR-DEL-03** — Không xóa mục đang RUNNING; phải hủy hoặc chờ.
- **BR-SYNC-01** — Mỗi thao tác outbox có operationId ổn định; gửi lại không tạo bản ghi trùng.
- **BR-SYNC-02** — Retry có giới hạn và backoff; lỗi mạng giữ outbox.
- **BR-SYNC-03** — Revision không khớp → CONFLICT, không ghi đè âm thầm; quy tắc giải quyết chi tiết chưa chốt (Q-14).
- **BR-SYNC-04** — Migration, đăng xuất, đổi tài khoản, xóa cache không được làm mất nháp và outbox.
- **BR-SYNC-05** — Thống kê không đếm retry, phiên bản ảnh bị thay, mock, mục trong thùng rác; tổng các nhóm không chồng lấp.
- **BR-UI-01** — Mọi trạng thái hiển thị bằng chữ (và biểu tượng), không chỉ bằng màu.
- **BR-UI-02** — Không hiển thị URL backend, IP, đường dẫn tệp, stack trace hay log trong giao diện bác sĩ; lỗi kỹ thuật chỉ kèm mã tra cứu.
- **BR-UI-03** — Thông báo đẩy và nội dung trên màn hình khóa chỉ chứa nội dung chung.