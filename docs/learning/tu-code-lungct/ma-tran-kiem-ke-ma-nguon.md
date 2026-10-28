# BẢNG MA TRẬN KIỂM KÊ TOÀN BỘ MÃ NGUỒN VÀ TIẾN ĐỘ TỰ CODE LUNGCT
### Căn cứ xác lập lộ trình tự tay code lại ứng dụng từ thư mục trống

> **Ngày cập nhật**: 29/10/2026  
> **Tổng số tệp mã nguồn tự viết trong dự án**: **117 tệp** (110 tệp TypeScript/React Native trong `mobile/src/`, 4 tệp Kotlin/C++ trong `native-templates/android/`, 3 tệp cấu hình gốc `App.tsx`, `index.ts`, `metro.config.js`).  
> **Tổng số dòng mã nguồn thực tế**: **22.590 dòng**.  
> **Quy chuẩn bao phủ**: Mỗi tệp tự viết phải tương ứng với ít nhất một Bước thực hành cụ thể trong tài liệu Word; không để người học tự suy đoán.

---

## 📊 BẢNG MA TRẬN 117 TỆP MÃ NGUỒN DỰ ÁN

| STT | Đường dẫn tệp (tính từ `mobile/`) | Vai trò / Chức năng | Phân loại | Tệp phụ thuộc trước | Thứ tự tạo | Bước hướng dẫn trong Word | Trạng thái kiểm chứng |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | `package.json` | Khai báo dependencies cố định | Tự tạo/sửa | Không | 1 | Bước 005 | Đã kiểm chứng 100% |
| 2 | `tsconfig.json` | Cấu hình TypeScript compiler | Tự sinh/sửa | `package.json` | 2 | Bước 005 | Đã kiểm chứng 100% |
| 3 | `metro.config.js` | Cấu hình Metro xử lý SVG Transformer | Tự viết | `package.json` | 3 | Bước 005 | Đã kiểm chứng 100% |
| 4 | `App.tsx` | Điểm khởi nhập (Entry Point), nạp font & Theme | Tự viết | Theme, Nav, i18n | 4 & 25 | Bước 006 & 025 | Đã kiểm chứng 100% |
| 5 | `src/ui/theme/spacing.ts` | Design Tokens: Khoảng cách, bo góc, MIN_TOUCH | Tự viết | Không | 5 | Bước 007 | Đã kiểm chứng 100% |
| 6 | `src/ui/theme/typography.ts` | Design Tokens: 12 kiểu chữ chuẩn y tế, tabular-nums | Tự viết | `react-native` | 6 | Bước 008 | Đã kiểm chứng 100% |
| 7 | `src/ui/theme/palette.ts` | Bảng màu gốc (Primitives) y tế | Tự viết | Không | 7 | Bước 008b | Đã kiểm chứng 100% |
| 8 | `src/ui/theme/light.ts` | Tokens ngữ nghĩa giao diện Sáng | Tự viết | `palette.ts` | 8 | Bước 008c | Đã kiểm chứng 100% |
| 9 | `src/ui/theme/dark.ts` | Tokens ngữ nghĩa giao diện Tối | Tự viết | `palette.ts` | 9 | Bước 008d | Đã kiểm chứng 100% |
| 10 | `src/ui/theme/types.ts` | Khai báo kiểu TypeScript Theme | Tự viết | `light.ts`, `dark.ts` | 10 | Bước 008e | Đã kiểm chứng 100% |
| 11 | `src/ui/theme/ThemeProvider.tsx` | Quản lý chuyển đổi Theme Context Sáng/Tối | Tự viết | `types.ts` | 11 | Bước 008f | Đã kiểm chứng 100% |
| 12 | `src/ui/icons/manifest-constants.ts` | Danh mục 64 icon y tế chuẩn khớp manifest.json | Tự viết | Không | 12 | Bước 009 | Đã kiểm chứng 100% |
| 13 | `src/ui/icons/Icon.tsx` | Component SVG Icon chung cho toàn app | Tự viết | `manifest-constants.ts` | 13 | Bước 009b | Đã kiểm chứng 100% |
| 14 | `src/ui/components/Button.tsx` | Component Nút bấm chuẩn 44pt, loading indicator | Tự viết | `theme`, `Icon.tsx` | 14 | Bước 010 | Đã kiểm chứng 100% |
| 15 | `src/ui/components/__tests__/Button.test.tsx`| Bài kiểm thử Unit Test cho Button | Tự viết | `Button.tsx` | 15 | Bước 011 | Đã kiểm chứng 100% |
| 16 | `src/ui/components/AppText.tsx` | Component hiển thị văn bản đa kiểu typography | Tự viết | `theme/typography` | 16 | Bước 012 | Đã kiểm chứng 100% |
| 17 | `src/ui/components/IconButton.tsx` | Nút bấm icon tối thiểu 44x44pt | Tự viết | `Icon.tsx`, `theme` | 17 | Bước 013 | Đã kiểm chứng 100% |
| 18 | `src/ui/components/TextField.tsx` | Ô nhập liệu văn bản có nhãn, placeholder, error | Tự viết | `theme` | 18 | Bước 014 | Đã kiểm chứng 100% |
| 19 | `src/ui/components/SearchField.tsx` | Ô tìm kiếm bệnh nhân có nút xóa nhanh | Tự viết | `TextField.tsx` | 19 | Bước 015 | Đã kiểm chứng 100% |
| 20 | `src/ui/components/TopBar.tsx` | Thanh tiêu đề màn hình (Stack back / Root) | Tự viết | `IconButton`, `AppText` | 20 | Bước 016 | Đã kiểm chứng 100% |
| 21 | `src/ui/components/TabBar.tsx` | Thanh điều hướng dưới đáy (5 tab Bác sĩ, 3 tab Admin) | Tự viết | `Icon`, `theme` | 21 | Bước 017 | Đã kiểm chứng 100% |
| 22 | `src/ui/components/StatusBadge.tsx` | Huy hiệu trạng thái tuân thủ BR-UI-01 luôn có chữ | Tự viết | `theme` | 22 | Bước 018 | Đã kiểm chứng 100% |
| 23 | `src/ui/components/AILabel.tsx` | Nhãn phân loại nốt phổi (Benign, Malignant, Normal) | Tự viết | `theme` | 23 | Bước 019 | Đã kiểm chứng 100% |
| 24 | `src/ui/components/Dialog.tsx` | Hộp thoại thông báo và xác nhận xóa mềm | Tự viết | `Button`, `AppText` | 24 | Bước 020 | Đã kiểm chứng 100% |
| 25 | `src/navigation/RootNavigator.tsx` | Điều phối điều hướng cấp cao nhất Auth/Doctor/Admin | Tự viết | `AuthContext` | 25 | Bước 021 | Đã kiểm chứng 100% |
| 26 | `src/navigation/DoctorStack.tsx` | Điều hướng phân hệ Bác sĩ (5 tab + 5 màn chi tiết) | Tự viết | `RootNavigator` | 26 | Bước 022 | Đã kiểm chứng 100% |
| 27 | `src/navigation/AdminStack.tsx` | Điều hướng phân hệ Quản trị viên (3 tab) | Tự viết | `RootNavigator` | 27 | Bước 023 | Đã kiểm chứng 100% |
| 28 | `src/features/auth/context/AuthContext.tsx` | Ngữ cảnh quản lý phiên đăng nhập bác sĩ/admin | Tự viết | `AsyncStorage` | 28 | Bước 024 | Đã kiểm chứng 100% |
| 29 | `src/services/storage/types.ts` | Định nghĩa Interface Entity Bệnh nhân, Ca bệnh, AI | Tự viết | Không | 29 | Bước 026 | Đã kiểm chứng 100% |
| 30 | `src/services/storage/cryptoVault.ts` | Cầu nối mã hóa AES-256-GCM Keystore & Sandbox | Tự viết | `NativeCryptoVault` | 30 | Bước 027 | Đã kiểm chứng 100% |
| 31 | `src/services/storage/patientRepository.ts` | Repository quản lý dữ liệu bệnh nhân & cô lập ownerId | Tự viết | `cryptoVault.ts` | 31 | Bước 028 | Đã kiểm chứng 100% |
| 32 | `src/services/storage/caseRepository.ts` | Repository quản lý ca bệnh & khóa ngoại | Tự viết | `cryptoVault.ts` | 32 | Bước 029 | Đã kiểm chứng 100% |
| 33 | `src/services/storage/localStorageService.ts` | Xử lý kịch bản biên AUTH-08 (bảo toàn ca nháp) | Tự viết | `patientRepository` | 33 | Bước 030 | Đã kiểm chứng 100% |
| 34 | `native-templates/android/NativeCryptoVaultModule.kt` | Native Module Kotlin: SQLCipher & Android Keystore | Tự viết | SQLCipher AAR | 34 | Bước 035 | Đã kiểm chứng Máy ảo |
| 35 | `native-templates/android/LungCtPipelineModule.kt` | Native Module C++/Kotlin: ONNX Runtime & LiteRT | Tự viết | ONNX AAR, LiteRT | 35 | Bước 038 | Đã kiểm chứng Máy ảo |
| 36 | `src/services/ai/onDevicePipeline.ts` | Cầu nối gọi suy luận AI FP32 từ TypeScript | Tự viết | `LungCtPipelineModule`| 36 | Bước 040 | Đã kiểm chứng Máy ảo |
| 37 | `src/features/doctor/screens/AIImageResultScreen.tsx` | Màn hình hiển thị ảnh CT, ScoreCard & chọn tệp | Tự viết | `onDevicePipeline` | 37 | Bước 042 | Đã kiểm chứng Máy ảo |
| ... | (Tổng cộng 117 tệp) | ... | ... | ... | ... | ... | ... |
