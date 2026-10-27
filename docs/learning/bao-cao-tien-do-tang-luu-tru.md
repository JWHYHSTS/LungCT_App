# TÀI LIỆU TIẾN ĐỘ & BÁO CÁO KỸ THUẬT: TẦNG LƯU TRỮ CỤC BỘ (LOCAL STORAGE LAYER)
## PHỤC VỤ BÁO CÁO KHÓA LUẬN TỐT NGHIỆP ANDROID & IOS

> **Lưu ý nguyên tắc**:
> - Tài liệu này ghi chép chi tiết, trung thực và khách quan toàn bộ quá trình nghiên cứu, thiết kế, triển khai và kiểm nghiệm tầng lưu trữ dữ liệu y tế cục bộ.
> - Phân định rõ ràng: phần dùng chung (Cross-platform Core), phần chuyên biệt cho Android, phần chuyên biệt cho iOS.
> - Tuyệt đối không nhận kết quả giả lập (Jest sandbox) hoặc máy ảo (Android Emulator) là kết quả trên thiết bị thật.
> - Mọi dữ liệu kiểm thử 100% là dữ liệu giả định tổng hợp (synthetic mock data), không dùng dữ liệu bệnh nhân thật.

---

### 1. MỤC TIÊU NGHIÊN CỨU & YÊU CẦU ĐẶC TẢ

1. **Tuân thủ quy chuẩn bảo mật y tế (AGENTS.md & QĐ 5.1/KT)**:
   - Hồ sơ bệnh nhân (PII) và thông tin ca bệnh (PHI) không được lưu trữ dưới dạng bản rõ (plaintext).
   - Cơ chế mã hóa phải đạt cấp độ mật mã học tiêu chuẩn (AES-256), chống can thiệp và kiểm tra tính toàn vẹn (Authenticated Encryption).
2. **Kiến trúc bền vững & Tách biệt trách nhiệm (Repository Pattern)**:
   - Tách biệt hoàn toàn giữa giao diện người dùng (UI Screens) và công nghệ lưu trữ vật lý (Storage Engine).
   - Thiết kế sẵn sàng chuyển đổi giữa AsyncStorage adapter (môi trường dev) sang SQLite mã hóa chuẩn (SQLCipher) mà không ảnh hưởng tầng Domain/UI.
3. **Cô lập dữ liệu đa người dùng (Multi-Tenancy Isolation)**:
   - Đảm bảo bác sĩ này không thể xem, sửa hoặc rò rỉ dữ liệu của bác sĩ khác trên cùng một thiết bị chia sẻ.
4. **Xử lý tài khoản bị khóa theo đặc tả AUTH-08**:
   - Khi phát hiện tài khoản bị khóa trên máy chủ, ứng dụng phải tự động xóa dữ liệu đã đồng bộ (`synced`), đồng thời **bảo toàn nguyên vẹn dữ liệu nháp chưa đồng bộ (`pending` / `conflict`)** và các liên kết phụ thuộc, không làm mất công sức của bác sĩ.

---

### 2. CÔNG VIỆC ĐÃ TRIỂN KHAI & CÔNG NGHỆ ÁP DỤNG

#### A. Phần dùng chung (Cross-Platform Core - TypeScript / React Native)
- **Cấu trúc thực thể dữ liệu (`types.ts`)**:
  - Bám sát 100% Bảng 101–106 trong Đặc tả Chức năng:
    - `AccountEntity`: Quản lý vai trò (DOCTOR, ADMIN), trạng thái tài khoản (ACTIVE, LOCKED, PENDING_APPROVAL).
    - `PatientEntity`: Thông tin bệnh nhân kèm mã bệnh nhân duy nhất theo bác sĩ (Q-20), vòng đời (ACTIVE, TRASHED), trạng thái đồng bộ (`synced`, `pending`, `conflict`).
    - `CaseEntity`: Ca bệnh CT phổi với mã ca tự sinh `CA-YYYY-NNNNNN`, ghi chú lâm sàng, nhận xét bác sĩ, trạng thái (`DRAFT`, `COMPLETED`, `TRASHED`).
    - `CTImageEntity`: Quản lý lát cắt CT, hash SHA-256, kích thước byte, độ phân giải, định dạng mime.
    - `AIPredictionResultEntity`: Kết quả phân loại 3 lớp [Benign, Malignant, Normal], phân biệt `mode: 'REAL'` và `mode: 'MOCK'`, trạng thái Grad-CAM.
    - `DoctorStatsProjection`: Thống kê số lượng bệnh nhân, ca bệnh, phân bố nhãn thực tế.
- **Giao thức Adapter chuẩn (`storageInterface.ts`)**:
  - Khai báo giao diện `ILocalStorageAdapter` với đầy đủ các thao tác CRUD, khởi tạo `initialize()`, migration schema `migrateSchemaIfNeeded(ownerId)`, thống kê `getDoctorStats(ownerId)` và xử lý khóa tài khoản `purgeSyncedDataOnAccountLocked(ownerId)`.
- **Bộ mã hóa & Bảo vệ dữ liệu (`cryptoVault.ts`)**:
  - Nâng cấp từ thuật toán XOR/FNV sơ khai sang chuẩn mã hóa chứng thực **AES-256-GCM (Galois/Counter Mode)**.
  - Sử dụng IV 96-bit sinh ngẫu nhiên cho từng bản tin và Authentication Tag 128-bit chống can thiệp dữ liệu.
  - Hàm dẫn xuất khóa **PBKDF2-HMAC-SHA256 với 100,000 vòng lặp** chuẩn NIST.
  - Hỗ trợ tương thích ngược (Backward Compatibility) tự động giải mã format cũ `ENC:v1:...` để phục vụ migration dữ liệu êm ái.
- **Dịch vụ lưu trữ cục bộ (`localStorageService.ts`)**:
  - Đóng gói logic phân vùng dữ liệu theo tiền tố `@lungct_db/v1/{ownerId}/...`.
  - Quản lý phiên bản schema `CURRENT_SCHEMA_VERSION = 1`.
  - Bắt lỗi trùng lặp mã bệnh nhân (Q-20) theo từng bác sĩ.
  - Cơ chế xóa thùng rác mềm (`TRASHED`) và khôi phục (`restore`).
  - **Thuật toán xử lý tài khoản bị khóa (AUTH-08 nâng cao)**:
    - Lọc và xóa ca bệnh đã đồng bộ (`synced`), giữ lại ca nháp (`pending`/`conflict`).
    - Thu thập `patientIdsRequiredByDraftCases`.
    - Lọc bệnh nhân: Giữ lại bệnh nhân chưa đồng bộ HOẶC bệnh nhân đã đồng bộ nhưng đang có ca nháp gắn liền để bảo đảm toàn vẹn khóa ngoại (Foreign Key Integrity) và không làm mất liên kết của ca nháp.
    - Giữ lại toàn bộ ảnh CT và kết quả AI gắn với các ca nháp còn giữ lại.

#### B. Phần chuyên biệt cho Android
- **Quản lý khóa phần cứng mục tiêu**: **Android Keystore System**.
  - Thiết kế khóa master AES-256 được sinh từ CSPRN và lưu trữ trong vùng phần cứng an toàn (TEE/StrongBox Keymaster), ngăn chặn trích xuất khóa qua root hoặc dịch ngược APK.
- **Engine lưu trữ mục tiêu**: **SQLCipher for Android / SQLite Encrypted**.
  - Mã hóa toàn bộ tệp cơ sở dữ liệu ở tầng trang lưu trữ (Page-level encryption, default 4096-byte pages) bằng AES-256-CBC.
- **Trạng thái hiện tại**: Đã chuẩn bị kiến trúc template trong `mobile/native-templates/android/`.

#### C. Phần chuyên biệt cho iOS
- **Quản lý khóa phần cứng mục tiêu**: **iOS Keychain Services & Secure Enclave**.
  - Sử dụng thuộc tính `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` hoặc xác thực sinh trắc học Touch ID / Face ID.
- **Engine lưu trữ mục tiêu**: **SQLCipher for iOS / CoreData Encrypted**.
- **Trạng thái hiện tại**: Đã thiết kế giao diện Adapter độc lập để liên kết runtime iOS trong giai đoạn kiểm thử nền tảng Apple.

---

### 3. CÁCH THỨC VÀ KẾT QUẢ KIỂM THỬ THỰC TẾ

> **Nguyên tắc kiểm thử**: Sử dụng 100% dữ liệu giả định tổng hợp (synthetic mock data), tuyệt đối không dùng thông tin bệnh nhân thật.

#### A. Kết quả trên môi trường Jest Sandbox (Node.js runtime)
- **Tệp kiểm thử**: `mobile/src/services/storage/__tests__/localStorageService.test.ts`.
- **Kết quả**: **13/13 test cases PASSED** (100% thành công):
  1. `mã hóa payload JSON bằng AES-256-GCM và giải mã chính xác`: Pass.
  2. `từ chối giải mã và báo lỗi xác thực khi bị can thiệp dữ liệu hoặc sai khóa bác sĩ (AEAD Auth)`: Pass.
  3. `từ chối giải mã và ném lỗi rõ ràng khi gặp khóa sai hoặc dữ liệu hỏng định dạng`: Pass.
  4. `tương thích ngược: giải mã chính xác các bản ghi định dạng cũ ENC:v1 để phục vụ migration`: Pass.
  5. `tạo thành công bệnh nhân mới và đọc lại`: Pass.
  6. `ngăn chặn tạo trùng patientCode cho cùng một bác sĩ (Q-20)`: Pass.
  7. `cho phép cập nhật thông tin và chuyển bệnh nhân vào thùng rác`: Pass.
  8. `bảo toàn nguyên vẹn dữ liệu khi service bị đóng và nạp lại từ AsyncStorage (Persistence)`: Pass.
  9. `kiểm tra và thực thi migration schema thành công (migrateSchemaIfNeeded)`: Pass.
  10. `Bác sĩ B không thể đọc hoặc thấy dữ liệu của Bác sĩ A (Multi-Tenancy Isolation)`: Pass.
  11. `lưu ảnh CT và kết quả phân tích AI đúng quan hệ phiên bản`: Pass.
  12. `chính sách AUTH-08: chỉ xóa dữ liệu đã đồng bộ (synced) và bảo toàn nháp chưa đồng bộ (pending/conflict)`: Pass.
  13. `chính sách AUTH-08: bảo toàn bệnh nhân đã đồng bộ khi có ca nháp chưa đồng bộ, không làm đứt gãy liên kết hồ sơ`: Pass.
- **Kiểm tra chất lượng mã nguồn**:
  - `npm run lint`: Đạt **0 errors, 0 warnings**.
  - `npm test`: **12/12 test suites, 126/126 tests passed**.

#### B. Kết quả trên Máy ảo Android (Android Emulator)
- **Trạng thái**: **CHƯA KIỂM CHỨNG TẦNG LƯU TRỮ TRÊN MÁY ẢO**.
- **Lý do**:
  - Module `localStorageService.ts` hiện đang là adapter độc lập, chưa được nối dây vào giao diện các màn hình UI (hiện UI vẫn đang chạy với `doctorMocks.ts`).
  - Thư viện `crypto` của Node.js cần được cầu nối qua module native để chạy trong JavaScript engine (Hermes) của Android/iOS.
  - Do đó, chu kỳ đóng hẳn app (kill process) và mở lại trên máy ảo Android để kiểm tra dữ liệu tầng này chưa được thực hiện.

#### C. Kết quả trên Điện thoại thật (Redmi 13 / iPhone)
- **Trạng thái**: **CHƯA THỰC HIỆN**.
- Không coi kết quả Jest hay máy ảo là kết quả trên điện thoại thật. Sẽ tiến hành đo kiểm khi nạp bản build APK/IPA có cấu hình native storage hoàn chỉnh.

---

### 4. CÁC GIỚI HẠN HIỆN TẠI & ĐIỂM CẦN QUYẾT ĐỊNH

1. **Ranh giới an toàn của PBKDF2 hiện tại**:
   - Đầu vào của PBKDF2 hiện tại là `ownerId` kết hợp một chuỗi salt tĩnh trong code.
   - Do `ownerId` là mã tài khoản công khai và salt nằm trong code, đây **chưa phải là bí mật bảo mật thực thụ**. Khóa bí mật bắt buộc phải được sinh từ phần cứng an toàn (Android Keystore / iOS Keychain).
2. **Môi trường thực thi của thư viện crypto**:
   - Thư viện `crypto` hiện tại là Node.js built-in, mới chỉ chạy trong môi trường Node/Jest, chưa thể chạy trực tiếp trên Hermes engine của ứng dụng di động nếu thiếu native polyfill/module.
3. **Điểm cần quyết định đối với chính sách AUTH-08**:
   - Trong tình huống "Bệnh nhân đã sync nhưng có ca nháp chưa sync", phương án hiện tại là **giữ lại bản ghi bệnh nhân để bảo toàn khóa ngoại**.
   - Cần xin ý kiến hội đồng/người hướng dẫn: Liệu có được giữ bản ghi bệnh nhân đã sync hay phải bóc tách thông tin bệnh nhân lưu riêng vào snapshot của ca nháp rồi xóa hẳn bệnh nhân khỏi bảng patients. Dự án chưa tự nhận đã tuân thủ 100% nếu chưa có quyết định cuối cùng.
