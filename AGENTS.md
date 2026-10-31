# QUY TẮC PHÁT TRIỂN DỰ ÁN KHÓA LUẬN LUNGCT (AGENTS.MD)

Tài liệu này là **bộ quy tắc bắt buộc** dành cho tất cả trợ lý AI (Antigravity/Agent) và các nhà phát triển khi tham gia xây dựng dự án khóa luận `LungCT` (Repository: `LungCT_App`). Mọi thao tác phải tuân thủ nghiêm ngặt các điều khoản dưới đây theo Đề cương chi tiết mới nhất của sinh viên **Dương Hải Đăng**.

---

## PHẦN I. THÔNG TIN ĐỀ TÀI VÀ PHẠM VI MỚI

1. **Thông tin chung**:
   - **Tên đề tài**: “Phát triển ứng dụng chẩn đoán ung thư phổi trên thiết bị di động”.
   - **Sinh viên thực hiện đề tài ứng dụng**: **DƯƠNG HẢI ĐĂNG** — MSSV: **49.01.103.020** (Sư phạm Tin học, ĐH Sư phạm TP.HCM).
   - **Giảng viên hướng dẫn**: **ThS. TRỊNH HUY HOÀNG**.
   - **Tên ứng dụng**: **LungCT**.
   - **Nền tảng mục tiêu**: **Chỉ phát triển, kiểm thử và đóng gói Android** (React Native + TypeScript, tận dụng tối đa mã nguồn hiện có).
   - **Repository mới**: `LungCT_App`, thuộc đúng tài khoản GitHub của Dương Hải Đăng.

2. **Định hướng công nghệ cốt lõi**:
   - **Kiến trúc On-Device Edge AI thuần túy**: Mô hình học sâu lai **Adaptive AACNN-ViT** chạy trực tiếp 100% trên thiết bị Android; **tuyệt đối không gửi ảnh đến API/backend để phân loại hoặc sinh bản đồ nhiệt Grad-CAM**.
   - Không giữ chế độ API/On-device song song hay cơ chế fallback sang máy chủ suy luận.
   - **Dịch vụ Đám mây (Firebase)**: Firebase vẫn thuộc phạm vi đề tài, phục vụ các chức năng quản lý người dùng và nghiệp vụ: **Firebase Authentication** (xác thực, phiên làm việc), **Cloud Firestore** (đồng bộ hồ sơ ca bệnh, phân quyền), **Cloud Storage** (lưu trữ sao lưu hồ sơ khi trực tuyến) và **Firebase Cloud Messaging** (thông báo đẩy). Firebase KHÔNG làm máy chủ suy luận AI.
   - **Đầu vào hình ảnh**: Lát cắt ảnh CT 2D định dạng JPG/PNG từ bộ dữ liệu IQ-OTH/NCCD; không tự mở rộng sang DICOM 3D hay khối thể tích.
   - **Mô hình AI**: Sử dụng mô hình đã huấn luyện; bảo toàn cấu hình, kiến trúc và thứ tự 3 nhãn lớp (`["Benign", "Malignant", "Normal"]`). Không tự ý thay kiến trúc, thay checkpoint hay huấn luyện lại chỉ để demo chạy được.

3. **Chuyển đổi phạm vi và Lưu trữ lịch sử kế thừa**:
   - Dừng hoàn toàn workflow và tác vụ phát triển iOS. Các cấu hình/tài liệu iOS cũ được chuyển vào khu vực lưu trữ có chú thích (`docs/archive/` hoặc `reports/ios/` với ghi chú rõ ràng), bảo toàn nguyên trạng lịch sử đóng góp và quyền tác giả của giai đoạn trước.
   - Duy trì **một bản thảo khóa luận duy nhất** cho đề tài Android của Dương Hải Đăng theo cấu trúc 5 chương trong Đề cương chi tiết đã duyệt. Không cập nhật hai báo cáo Android/iOS song song.
   - Giữ nguyên `applicationId` (`com.anonymous.mobile` hoặc cấu hình định danh Android hiện tại) và khóa ký debug/release hiện có để bảo toàn khả năng cài đặt cập nhật.

---

## PHẦN II. NGUYÊN TẮC CỐT LÕI VÀ BẢO TỒN HIỆN TRẠNG

1. **Phân tách phạm vi độc lập tuyệt đối**:
   - Dự án là một kho độc lập, khép kín, chứa đầy đủ mã nguồn, mô hình, cấu hình mẫu, tài liệu, báo cáo và kiểm thử để bàn giao.
   - Tuyệt đối không tạo code, script, cấu hình, symlink hay tài liệu trong đồ án có đường dẫn trỏ sang thư mục làm việc riêng bên ngoài máy.
   - Không dùng mặc định đường dẫn máy cũ (như `C:\Users\thudi...` hay `C:\LungCT...`). Tìm và cấu hình đúng theo môi trường hiện tại trên laptop của Đăng (`C:\Users\John\AppData\Local\Android\Sdk`, OpenJDK 17, Node v22.19.0).
   - Không tự ý `git reset --hard`, `git clean -fd`, sửa lịch sử commit cũ hoặc ghi đè các thay đổi chưa commit.

2. **Bảo toàn native source và tài nguyên đang bị Git bỏ qua**:
   - Thư mục `mobile/native-templates/android` và các cấu hình tái tạo native phải luôn được theo dõi trong Git để bảo đảm ứng dụng có thể build lại 100% từ môi trường sạch.
   - Các artifact mô hình (`fusion_model.tflite`, `vit_cls.onnx`, `vit_cls.onnx.data`) trong assets Android phải có checksum SHA-256 xác thực và tài liệu hướng dẫn đặt đúng vị trí.

---

## PHẦN III. QUY TẮC MÔ HÌNH AI VÀ GRAD-CAM TRÊN ANDROID

1. **Pipeline On-Device Native**:
   - Toàn bộ chuỗi xử lý: Chọn/chụp ảnh → Lưu vào sandbox ứng dụng → Tiền xử lý ma trận (Nearest Resampling, chuẩn hóa Float32) → ViT ONNX Runtime trích token CLS (768 chiều) → Fusion TFLite (LiteRT) phân loại 3 lớp → Xuất điểm số điểm tin cậy → Hiển thị và lưu trữ lịch sử.
   - Cặp runtime hiện tại (ViT ONNX + Fusion TFLite) được giữ làm chuẩn đối chứng đang hoạt động ổn định trên Android.
   - Thứ tự lớp đầu ra cố định từ cấu hình huấn luyện: `0: Benign`, `1: Malignant`, `2: Normal`. Không thay đổi thứ tự đầu ra.
   - Điểm số là dự đoán hỗ trợ tham khảo, không phải xác suất mắc bệnh đã được xác nhận lâm sàng.
   - Khi suy luận gặp lỗi, báo lỗi thật minh bạch và cho người dùng thử lại; tuyệt đối không dùng kết quả mock giả tạo, không dùng điểm cũ hay gọi API máy chủ.
   - Tách biệt kết quả theo owner / case / image / version; khi thay đổi ảnh, kết quả cũ phải lập tức mất hiệu lực.

2. **Quy tắc về Grad-CAM**:
   - Grad-CAM là yêu cầu trong đề cương cần tiếp tục nghiên cứu và thực hiện trực tiếp trên Android, không tự bỏ khỏi phạm vi.
   - Tuyệt đối không gọi server/API để sinh bản đồ nhiệt.
   - Tuyệt đối không dùng overlay ảnh chụp sẵn, không dùng attention map hay bản đồ kích hoạt trung bình rồi gán nhãn là Grad-CAM.
   - Không mô tả heatmap là vị trí tổn thương đã được xác nhận lâm sàng.
   - Nếu tính năng Grad-CAM on-device chưa hoàn thành hoặc đang trong giai đoạn chuyển đổi runtime, phải giữ nguyên trạng thái chưa hoàn thành (`gradcamAvailable: false`), thông báo rõ nguyên nhân kỹ thuật và giải pháp tiếp theo.

---

## PHẦN IV. QUY TRÌNH THỰC HIỆN VÀ BÁO CÁO CHUẨN

1. **Quy trình triển khai**:
   - Đọc kỹ hiện trạng mã nguồn, tài liệu và đề cương trước khi sửa đổi.
   - Thực hiện thay đổi tập trung, đúng phạm vi Android On-Device.
   - Chạy kiểm thử tự động (`npm test`, `npm run typecheck`, `npm run lint`) và thu thập minh chứng thực tế.
   - Cập nhật tài liệu kỹ thuật trong `docs/` và bản thảo khóa luận duy nhất của Đăng trong `reports/android/`.
   - Kiểm tra `git status` và `git diff` sạch sẽ, chuẩn bị thông điệp commit chuẩn conventional commits.

2. **Mẫu báo cáo kết quả trên khung chat (6 mục bắt buộc)**:
   - **Mục 1. Yêu cầu vừa thực hiện**: Mục tiêu và phạm vi lệnh.
   - **Mục 2. Công việc đã làm**: Thay đổi cụ thể, lý do; danh sách tệp tạo/sửa (dùng đường dẫn tương đối trong đồ án).
   - **Mục 3. Kiểm tra và kết quả**: Kiểm tra thực tế đã chạy (typecheck, tests, build) và kết quả chi tiết.
   - **Mục 4. Tài liệu và khóa luận**: Nêu tài liệu và mục đã cập nhật trong bản thảo khóa luận của Đăng.
   - **Mục 5. Git và Repository mới**: Tóm tắt thay đổi chờ commit, trạng thái remote và hướng dẫn push.
   - **Mục 6. Vấn đề còn lại và bước tiếp theo**: Nêu rõ lỗi, phần còn thiếu hoặc bước tiếp theo cụ thể.
- Cố định (lock) tệp manifest phân chia và giá trị random seed.
- Kỹ thuật tăng cường dữ liệu (Data Augmentation) chỉ áp dụng trên tập Train; nhánh CNN và nhánh ViT phải nhận cùng một ảnh biến đổi đồng nhất cho mỗi mẫu tương ứng.
- Kiểm tra nguy cơ trùng lặp ảnh (duplicate images) và nguy cơ rò rỉ dữ liệu cùng bệnh nhân (patient leakage) giữa các tập khi có siêu dữ liệu nhóm bệnh nhân.
- Không tự ý khẳng định việc phân chia độc lập theo bệnh nhân (patient-level split) nếu không có đủ dữ liệu y khoa để chứng minh.
- **Tập Test**: Tuyệt đối không dùng tập Test để chọn mô hình, chọn bản nén hay điều chỉnh siêu tham số.
- Không tự ý huấn luyện lại hoặc chỉnh sửa pipeline nghiên cứu ngoài phạm vi được chỉ đạo.
- Không tuyên bố mô hình tổng quát hóa tốt trên ảnh ngoài tập dữ liệu nếu chưa thực hiện đánh giá độc lập phù hợp.

---

## PHẦN III. QUY CHUẨN MÃ NGUỒN (CODE STANDARDS)

1. **Linter & Formatter**: Duy trì cấu hình ESLint, Prettier, Black, Flake8 thống nhất trong dự án.
2. **Quy ước đặt tên**:
   - TypeScript / JavaScript: `camelCase` cho biến và hàm; `PascalCase` cho Component, Type, Interface và Class.
   - Python: `snake_case` cho biến, hàm, module; `PascalCase` cho Class; `UPPER_SNAKE_CASE` cho hằng số.
   - Tên định danh phải rõ nghĩa, tránh viết tắt tối nghĩa và không trộn lẫn tiếng Việt / tiếng Anh tùy tiện trong mã nguồn kỹ thuật.
3. **Kiến trúc mã nguồn**:
   - Tách biệt rõ ràng trách nhiệm từng module (Separation of Concerns). Tránh lặp code (DRY), không viết file quá dài; không dồn logic nghiệp vụ hoặc tính toán nặng vào tầng giao diện (UI).
   - Khai báo kiểu dữ liệu tường minh; không lạm dụng `any` trong TypeScript, không bỏ qua cảnh báo của TypeScript compiler.
4. **Xử lý lỗi và An toàn**:
   - Kiểm tra kỹ dữ liệu đầu vào, xử lý ngoại lệ có ý nghĩa; không "nuốt lỗi" (`catch {}` rỗng) hoặc báo thành công giả tạo.
   - Tuyệt đối không hardcode API key, mật khẩu, JWT token, URL máy tính cá nhân (`localhost:8000` trên thiết bị thật) hay đường dẫn tuyệt đối riêng của máy phát triển.
5. **Chú thích mã nguồn (Comments & Docstrings)**:
   - Comment giải thích **lý do thiết kế**, giả định kỹ thuật, đơn vị đo lường, ràng buộc y khoa hoặc thuật toán đặc biệt; không bình luận mô tả lại cú pháp hiển nhiên của ngôn ngữ.
   - Các hàm và module cốt lõi phải có JSDoc / Docstring chuẩn về mục đích, tham số đầu vào, giá trị trả về và các lỗi có thể ném ra.
   - Ghi chú `TODO`/`FIXME` phải chỉ rõ vấn đề kỹ thuật và hành động cụ thể cần làm; cấm ghi chú mơ hồ kiểu "sửa sau", "fix tạm".
   - **Bảo mật y tế**: Tuyệt đối không ghi thông tin nhạy cảm của bệnh nhân (PII/PHI), mật khẩu, token hoặc chứng chỉ vào console log.
6. **Kiểm thử chất lượng**: Mọi thay đổi logic đều phải đi kèm kiểm thử tương ứng; chỉ báo đạt đối với các test suite đã được chạy thực tế và pass hoàn toàn.

---

## PHẦN IV. TÀI NGUYÊN THAM KHẢO VÀ MINH CHỨNG KHOA HỌC

- Ưu tiên tham chiếu các bài báo y khoa/AI gốc, kho mã nguồn chính thức của tác giả, tài liệu kỹ thuật chuẩn của framework và trang phát hành bộ dữ liệu CT phổi chính thống.
- Mọi tài liệu tham khảo phải ghi rõ: Tên tài liệu, Tác giả/Tổ chức, Năm xuất bản / Phiên bản, URL hoặc mã DOI, Ngày truy cập và Nội dung chắt lọc áp dụng.
- Phân định rạch ròi 3 phần:
  1. Đóng góp nguyên bản của tác giả nghiên cứu gốc.
  2. Phần nhóm sinh viên tiến hành tái lập (reproduction).
  3. Phần nhóm sinh viên đề xuất cải tiến và tối ưu hóa (improvements/optimizations).
- Luôn kiểm tra giấy phép bản quyền (License) của dataset, pretrained weights và thư viện trước khi phân phối.
- Bộ dữ liệu lớn (dataset) **không đưa vào Git thông thường**. Chỉ lưu trữ hướng dẫn tải và cấu hình nạp dữ liệu.
- Mọi dữ liệu hình ảnh bệnh nhân sử dụng cho mục đích demo phải là dữ liệu ẩn danh / giả lập y tế.
- Tuyệt đối không làm giả nguồn tài liệu, không bịa đặt số liệu thực nghiệm, độ chính xác mô hình hay kết quả kiểm thử.
- Bản vẽ kiến trúc và tài liệu chính thức không được chứa nhãn tạm bợ, lặt vặt (như "chưa chạy", "chưa chốt").
- Báo cáo khoa học và nhật ký kiểm thử phải phản ánh trung thực mọi hạn chế, lỗi phát sinh và số đo thực tế.

---

## PHẦN V. QUY TẮC QUẢN LÝ PHIÊN BẢN (GIT) VÀ BÀN GIAO

- **Phạm vi Git**: Chỉ khởi tạo và quản lý kho Git duy nhất bên trong thư mục `LungCT_DoAn`.
- Không tạo các kho Git lồng nhau bên trong các thư mục con.
- Không can thiệp hoặc sửa đổi cấu hình Git toàn cục của người dùng.
- Tệp `.gitignore` phải lọc sạch các thư mục rác, dependencies, môi trường ảo, cache, tệp tạm thời và các khóa bảo mật.
- Tuyệt đối không đưa tệp nhị phân lớn (mô hình nặng, dataset, video) vào Git thông thường. Kiểm tra và áp dụng Git LFS (`.gitattributes`) đúng cách khi cần theo dõi các artifact lớn trong kho lưu trữ.
- **Bản đóng gói bàn giao cuối cùng cho giảng viên**: Phải chứa đầy đủ các tệp mô hình thật cần thiết để ứng dụng và backend vận hành trực tiếp; không được chỉ nộp tệp con trỏ Git LFS hay đường dẫn tải từ xa.
- Trước khi thực hiện commit:
  - Phải kiểm tra kỹ `git status` và `git diff --staged`.
  - Chỉ stage các tệp thuộc đúng phạm vi nhiệm vụ được giao.
  - Không tự ý commit đè lên các thay đổi đang có sẵn của người khác.
  - Không tự ý cấu hình định danh cá nhân giả lập khi chưa có sự cho phép của người dùng; không tự ý thực hiện `git push`.

---

## PHẦN VI. QUY TRÌNH THỰC HIỆN VÀ ĐỒNG BỘ HAI BÁO CÁO KHÓA LUẬN

### 1. Quy trình chuẩn 7 bước cho mọi lệnh triển khai về sau
1. **Đọc hiện trạng**: Đọc kỹ mã nguồn, tài liệu liên quan (`docs/`), sơ đồ kiến trúc và nội dung hiện tại của hai báo cáo.
2. **Thực hiện thay đổi**: Viết code, cấu hình hoặc sửa đổi đúng trọng tâm phạm vi được giao.
3. **Kiểm thử & Thu thập minh chứng**: Chạy kiểm thử tự động, chạy ứng dụng thực nghiệm và lưu trữ log/ảnh chụp vào `evidence/`.
4. **Cập nhật tài liệu kỹ thuật**: Cập nhật tài liệu trong `docs/` và sơ đồ `.drawio` tương ứng nếu kiến trúc thay đổi.
5. **Cập nhật nội dung CẢ HAI báo cáo khóa luận**:
   - Phản ánh trung thực các thay đổi kỹ thuật vào các chương/mục liên quan trong cả hai báo cáo: Báo cáo Android (`reports/android/`) và Báo cáo iOS (`reports/ios/`).
   - Phần dùng chung phải đồng bộ nhất quán; phần riêng phải phản ánh đúng đóng góp của từng nền tảng.
   - Tuyệt đối không chỉ ghi nhật ký thay đổi (changelog) sơ sài rồi xem như đã cập nhật báo cáo.
   - Giữ nguyên mẫu định dạng chuẩn, số thứ tự hình vẽ, bảng biểu, trích dẫn tài liệu.
   - Không được sao chép số đo hay minh chứng từ báo cáo Android sang iOS và ngược lại.
   - Nếu một thay đổi chỉ tác động đến một hệ điều hành, phải cập nhật báo cáo của nền tảng còn lại ở phần giao tiếp kiến trúc hoặc tổng quan tương quan nếu phù hợp; không bịa đặt nội dung hình thức.
   - Nếu thiếu tệp báo cáo hoặc định dạng tệp không thể chỉnh sửa trực tiếp, phải thông báo rõ ràng cho người dùng phần chưa thể hoàn thành.
6. **Kiểm tra trạng thái Git**: Kiểm tra `git status` và `git diff`, đảm bảo không stage nhầm tệp ngoài phạm vi, thông tin bảo mật hay file nhị phân lớn. Cung cấp nội dung thông điệp commit chuẩn xác để người dùng trực tiếp kiểm tra và commit bằng giao diện Antigravity; trợ lý AI không tự ý commit, amend hay push.
7. **Báo cáo kết quả trên khung chat theo mẫu chuẩn 6 mục**:
   - **Mục 1. Yêu cầu vừa thực hiện**: Mục tiêu và phạm vi lệnh.
   - **Mục 2. Công việc đã làm**: Thay đổi cụ thể, lý do; danh sách tệp tạo/sửa (dùng đường dẫn tương đối trong đồ án); phân biệt phần mới làm với phần có sẵn.
   - **Mục 3. Kiểm tra và kết quả**: Kiểm tra thực tế đã chạy và kết quả; phân biệt kiểm tra tĩnh, chạy trên máy tính và chạy trên điện thoại thật; chỉ báo đạt các mục đã thực nghiệm.
   - **Mục 4. Tài liệu và hai báo cáo**: Nêu tài liệu và mục đã cập nhật; ghi nhận trung thực tình trạng báo cáo/đặc tả; cập nhật cả hai báo cáo khi có file đầu vào.
   - **Mục 5. Git**: Tóm tắt thay đổi chờ commit; cung cấp nội dung commit phù hợp để người dùng commit qua giao diện Antigravity.
   - **Mục 6. Vấn đề còn lại và bước tiếp theo**: Nêu rõ lỗi, phần còn thiếu hoặc bị chặn; đề xuất bước tiếp theo cụ thể.
