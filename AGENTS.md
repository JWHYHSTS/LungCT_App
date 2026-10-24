# QUY TẮC PHÁT TRIỂN DỰ ÁN KHÓA LUẬN LUNGCT (AGENTS.MD)

Tài liệu này là **bộ quy tắc bắt buộc** dành cho tất cả trợ lý AI (Antigravity/Agent) và các nhà phát triển khi tham gia xây dựng dự án khóa luận `LungCT_DoAn`. Mọi thao tác phải tuân thủ nghiêm ngặt các điều khoản dưới đây.

---

## PHẦN I. NGUYÊN TẮC CỐT LÕI VÀ PHẠM VI KHỞI TẠO

1. **Phân tách phạm vi độc lập tuyệt đối**:
   - `LungCT_DoAn` là dự án độc lập, khép kín, chứa đầy đủ mã nguồn, mô hình, cấu hình mẫu, tài liệu, báo cáo và kiểm thử để bàn giao.
   - Thư mục bên ngoài `LungCT_LamViecRieng` chỉ dành cho prompt AI, tài liệu cá nhân, ghi chép và bản nháp.
   - Xóa hoặc di chuyển `LungCT_LamViecRieng` **không được phép** ảnh hưởng đến `LungCT_DoAn`.
   - Tuyệt đối không tạo code, script, cấu hình, symlink hay tài liệu trong đồ án có đường dẫn trỏ sang thư mục làm việc riêng.

2. **Giới hạn phạm vi khởi tạo ban đầu (Lệnh hiện tại)**:
   - Chỉ tạo khung thư mục, các tệp `README.md`, `AGENTS.md`, `.gitignore` và `.gitkeep`.
   - Chưa khởi tạo framework (React Native, FastAPI), chưa cài đặt thư viện/dependencies.
   - Không tạo mã nguồn ứng dụng giả, backend giả, mô hình giả hoặc dữ liệu/báo cáo giả.
   - Không tự ý giải nén, chuyển đổi hay huấn luyện mô hình khi chưa có lệnh giao cụ thể.
   - Việc chưa có tài liệu và mô hình đầu vào ở bước khởi tạo là hoàn toàn bình thường. Không yêu cầu người dùng cung cấp trước mới tạo khung.

3. **Nguyên tắc tiếp nhận và xử lý tài liệu khi người dùng bổ sung**:
   - Khi người dùng bổ sung tài liệu và giao lệnh tiếp theo, AI phải chủ động đọc kỹ hướng dẫn, đặc tả (`docs/requirements/`), sơ đồ kiến trúc (`docs/architecture/`) và hai báo cáo (`reports/`) để đối chiếu, cập nhật quy tắc.
   - **Không tự ý theo dõi thư mục (polling) hay tự động triển khai code ngay khi thấy tệp mới xuất hiện**. Chỉ bắt đầu khi có lệnh rõ ràng từ người dùng.
   - Nếu tệp tài liệu ở định dạng nhị phân/Word mà công cụ không đọc được trực tiếp, phải báo rõ cho người dùng; **tuyệt đối không tự nhận là đã đọc hoặc đoán mò nội dung**.
   - Không sao chép nguyên văn nhật ký chat, ghi chép cá nhân vào đồ án.
   - Nếu tài liệu có điểm mâu thuẫn, phải chỉ rõ điều khoản và phạm vi ảnh hưởng. Ưu tiên cao nhất là chỉ đạo trực tiếp mới nhất của người dùng; không tự ý thay đổi phạm vi khóa luận.

---

## PHẦN II. QUY TẮC TRIỂN KHAI VÀ PHÁT TRIỂN SAU NÀY

### 1. Công nghệ và Chức năng hệ thống
- **Công nghệ cốt lõi**: Ứng dụng di động sử dụng **React Native + TypeScript**; Backend sử dụng **FastAPI (Python)**.
- **Dịch vụ phụ trợ**: Firebase, bộ lưu trữ cục bộ (local storage / SQLite / MMKV), cơ chế phân quyền người dùng và chính sách đồng bộ dữ liệu phải bám sát theo đặc tả người dùng cung cấp (`docs/requirements/`).
- Tuyệt đối không tự ý thay đổi framework, không tự ý nới lỏng hoặc sửa đổi chính sách offline hay phạm vi nghiệp vụ.
- Phân biệt minh bạch giữa mã nguồn dùng chung (`shared`) và logic chuyên biệt cho Android / iOS.
- Bản đặc tả chức năng là căn cứ cao nhất để triển khai tính năng; prompt khởi tạo này không thay thế cho toàn bộ đặc tả chi tiết.
- **Quy chuẩn giao diện người dùng (UI/UX) và Bộ Icon Hệ Thống**: 
  - Giao diện người dùng trên điện thoại phải sạch sẽ, thân thiện, mang tính y tế chuyên nghiệp; **không hiển thị URL backend, thông tin log/debug kỹ thuật** không phục vụ thao tác của bác sĩ / người dùng.
  - **Bộ icon đồ họa chuẩn**: Toàn bộ icon hệ thống được lưu trữ nguyên bản tại `LungCT-Icons/` (gồm 3 thư mục: `svg/`, `png-32px/`, `png-64px/` với 48 icon y tế đồng nhất).
  - **Nguyên tắc quản lý asset**: Tuyệt đối giữ nguyên cấu trúc, tên tệp và phong cách của `LungCT-Icons/`. Khi phát triển giao diện ứng dụng, chỉ chọn lọc và đóng gói những icon thực sự sử dụng vào ứng dụng di động (`mobile/assets/icons/`), không đưa toàn bộ thư mục `LungCT-Icons/` vào bundle cài đặt nhằm kiểm soát dung lượng cài đặt (.apk, .ipa) trên điện thoại.

### 2. Mô hình AI và Triển khai trên Thiết bị Di động (On-Device Edge AI)
- **Kiến trúc mô hình chính**: Mô hình chính là **Adaptive AACNN-ViT**. Phải bảo toàn đầy đủ các nhánh CNN (kèm module trích xuất đặc trưng / fusion), khối Vision Transformer (ViT) và các bước tiền xử lý chuyên biệt (preprocessing).
- Tuyệt đối không tự ý thay thế bằng kiến trúc khác (như MobileNet thuần, ResNet...) hoặc tùy tiện cắt bỏ một nhánh để làm nhẹ mô hình khi chưa được phép.
- **Bảo toàn gói nguồn**: Gói tệp ZIP và mã băm `.sha256` trong `ai/models/source/` phải được giữ nguyên bản làm mốc đối chứng.
- **Tích hợp mô hình**:
  - Khi được giao lệnh tích hợp, giải nén vào `ai/models/extracted/{primary|light_candidate}/`. Tránh nhân bản trọng số dư thừa.
  - Tuyệt đối không đóng gói toàn bộ gói nghiên cứu, checkpoint huấn luyện vào bộ cài đặt của ứng dụng di động.
  - Artifact tối ưu cho di động sẽ được lưu tại:
    - `mobile/assets/models/android/`
    - `mobile/assets/models/ios/`
    *(Chưa tạo hai thư mục này ở bước khởi tạo khung)*.
  - Backend sử dụng mô hình đặt trong đồ án với đường dẫn tương đối tính từ thư mục gốc ổn định hoặc qua biến môi trường; không phụ thuộc thư mục chạy lệnh hay đường dẫn tuyệt đối của máy cá nhân.
  - **Lưu ý kỹ thuật**: Tệp ZIP, `.keras`, hay `.h5` **không phải** là artifact có thể tự chạy trực tiếp trong React Native.
  - Việc lựa chọn runtime di động (TFLite, ONNX Runtime, ExecuTorch, CoreML...) chỉ được quyết định sau khi kiểm tra khả năng thực thi đồng thời cả **phân loại (classification)** và **bản đồ nhiệt (Grad-CAM)**. Không khẳng định tương thích trước khi kiểm chứng thực tế.
  - Bảo tồn toàn vẹn processor, custom layers, thứ tự nhãn lớp (class order: Benign, Malignant, Normal), pipeline tiền xử lý, phiên bản và checksum.
  - **Mô hình ứng viên nhẹ (LightCandidate)**: Là phương án nghiên cứu so sánh, đánh giá tối ưu hóa; không được tự ý dùng nó để thay thế mô hình chính (Primary).
  - Mọi manifest phải phản ánh đúng tệp và kết quả đo đạc thực tế. Việc tối ưu dung lượng, RAM, thời gian đáp ứng phải có số liệu đo lường cụ thể; không suy diễn hiệu năng thiết bị chỉ dựa trên kích thước tệp nén ZIP.

### 3. Grad-CAM và Kiểm thử trên Thiết bị Thực tế
- **Yêu cầu On-Device Offline hoàn toàn**: Tính năng suy luận mô hình Adaptive và xuất bản đồ nhiệt Grad-CAM thật sự **phải chạy trực tiếp trên điện thoại** trong điều kiện:
  - Tắt toàn bộ kết nối mạng (Wifi, 4G/5G).
  - Ngắt kết nối cáp USB với máy tính.
  - Tắt máy chủ đóng gói Metro Bundler.
  - Hoạt động độc lập không phụ thuộc máy tính cá nhân.
- Tuyệt đối không sử dụng server trung gian, không dùng kết quả giả lập hay ảnh CAM sinh sẵn để thay thế cho yêu cầu tính toán on-device cục bộ.
- **Phạm vi toán học của Grad-CAM**: Phải bảo toàn đúng cơ chế của nghiên cứu gốc: giải thích trên các lớp tích chập của nhánh CNN khi vector CLS của nhánh ViT được cố định (fixed/conditioned).
- Kiểm tra đối chiếu ma trận tiền xử lý, thứ tự lớp, vector điểm số, nhãn dự đoán và bản đồ nhiệt CAM giữa môi trường nghiên cứu (Python/Colab) và runtime di động trước và sau khi chuyển đổi.
- **Môi trường kiểm thử thực tế**:
  - Phân hệ Android: Kiểm thử thực tế trên thiết bị **Redmi 13**.
  - Phân hệ iOS: Kiểm thử thực tế trên thiết bị **iPhone thực tế** được cấp phát.
- Phải lưu trữ riêng biệt số đo và minh chứng của từng nền tảng (`evidence/android/`, `evidence/ios/`).
- Đo đạc chi tiết: Thời gian suy luận (inference latency), thời gian tính CAM, lượng tiêu thụ RAM đỉnh, dung lượng artifact và kích thước file cài đặt (`.apk`, `.ipa`).
- Tuyệt đối không lấy số đo trên Colab hoặc Android để gán sang kết quả của iOS và ngược lại.

### 4. Dữ liệu, Huấn luyện và Đánh giá Nghiên cứu
- Tỷ lệ phân chia tập dữ liệu chuẩn: **Train / Validation / Test tương ứng 70 / 15 / 15** (cho phép sai số nhỏ do làm tròn và phân tầng stratified).
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
6. **Kiểm tra và Git Commit**: Kiểm tra trạng thái git và thực hiện commit với thông điệp rõ ràng theo chuẩn Conventional Commits.
7. **Báo cáo kết quả trên khung chat**:
   - Tóm tắt những gì đã làm và lý do.
   - Danh sách các tệp chính đã tạo / chỉnh sửa.
   - Các mục cụ thể trong từng báo cáo đã được cập nhật.
   - Kết quả kiểm thử thực tế và đường dẫn tệp minh chứng (`evidence/`).
   - Mã băm commit hoặc lý do chưa commit được.
   - Các vấn đề hoặc hạn chế còn tồn đọng cần giải quyết tiếp.
