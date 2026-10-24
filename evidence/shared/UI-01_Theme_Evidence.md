# BÁO CÁO MINH CHỨNG & GIỚI HẠN THỰC NGHIỆM BƯỚC UI-01 (HOÀN THIỆN CHẤT LƯỢNG)

## 1. Thông tin cấu hình môi trường
- Hệ điều hành: Windows 11
- Engine thực thi: Node.js + npm
- Framework: React Native 0.88.0, Expo SDK ~58.0.19, React 19.3.0
- Linter & Formatter: ESLint 9.x (flat config via `eslint-config-expo`), Prettier 3.9.10
- Type Checker: TypeScript 6.0.3 (Strict Mode)
- Test Runner: Jest 30.5.2 + `jest-expo` 58.0.12

---

## 2. Nhật ký thực thi các lệnh kiểm tra chất lượng

### Lệnh 1: Kiểm tra tương thích dependency Expo
```bash
npx expo install --check
```
Kết quả:
```text
Dependencies are up to date
```

### Lệnh 2: Kiểm tra kiểu dữ liệu TypeScript (Typecheck)
```bash
npm run typecheck
```
Kết quả:
```text
> mobile@1.0.0 typecheck
> tsc --noEmit
```
(Exit code 0 — Không có lỗi kiểu dữ liệu).

### Lệnh 3: Kiểm tra Linter (ESLint)
```bash
npm run lint
```
Kết quả:
```text
> mobile@1.0.0 lint
> eslint src App.tsx
```
(Exit code 0 — Đạt 0 lỗi, 0 cảnh báo).

### Lệnh 4: Kiểm tra định dạng mã nguồn (Prettier)
```bash
npm run format:check
```
Kết quả:
```text
> mobile@1.0.0 format:check
> prettier --check "src/**/*.{ts,tsx}" "App.tsx"

Checking formatting...
All matched files use Prettier code style!
```
(Exit code 0 — 100% tệp tuân thủ định dạng chuẩn).

### Lệnh 5: Chạy bộ kiểm thử tự động Theme (Unit Test)
```bash
npm test
```
Kết quả:
```text
> mobile@1.0.0 test
> jest

PASS src/ui/theme/__tests__/theme.test.ts
  theme LungCT
    √ Sáng và Tối có cùng bộ khóa (48 token) (3 ms)
    √ mọi giá trị là mã hex 6 chữ số (3 ms)
    √ Sáng: chữ chính / nền app ≥ 4.5:1
    √ Sáng: chữ chính / bề mặt ≥ 4.5:1
    √ Sáng: chữ phụ / nền app ≥ 4.5:1 (1 ms)
    √ Sáng: chữ phụ / bề mặt ≥ 4.5:1
    √ Sáng: liên kết / bề mặt ≥ 4.5:1
    √ Sáng: chữ trên nút chính ≥ 4.5:1
    √ Sáng: badge thành công ≥ 4.5:1
    √ Sáng: badge cảnh báo ≥ 4.5:1
    √ Sáng: badge lỗi ≥ 4.5:1 (1 ms)
    √ Sáng: badge thông tin ≥ 4.5:1
    √ Sáng: badge chờ ≥ 4.5:1
    √ Sáng: nhãn Lành tính ≥ 4.5:1
    √ Sáng: nhãn Ác tính ≥ 4.5:1
    √ Sáng: nhãn Bình thường ≥ 4.5:1
    √ Sáng: viền ô nhập / bề mặt (không phải chữ) ≥ 3:1
    √ Tối: chữ chính / nền app ≥ 4.5:1
    √ Tối: chữ chính / bề mặt ≥ 4.5:1
    √ Tối: chữ phụ / nền app ≥ 4.5:1
    √ Tối: chữ phụ / bề mặt ≥ 4.5:1
    √ Tối: liên kết / bề mặt ≥ 4.5:1
    √ Tối: chữ trên nút chính ≥ 4.5:1
    √ Tối: badge thành công ≥ 4.5:1
    √ Tối: badge cảnh báo ≥ 4.5:1
    √ Tối: badge lỗi ≥ 4.5:1
    √ Tối: badge thông tin ≥ 4.5:1
    √ Tối: badge chờ ≥ 4.5:1
    √ Tối: nhãn Lành tính ≥ 4.5:1
    √ Tối: nhãn Ác tính ≥ 4.5:1
    √ Tối: nhãn Bình thường ≥ 4.5:1
    √ Tối: viền ô nhập / bề mặt (không phải chữ) ≥ 3:1 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        0.987 s, estimated 1 s
Ran all test suites.
```

---

## 3. Báo cáo giới hạn và thực nghiệm trên thiết bị thật

- **Kiểm tra thiết bị Android qua ADB**:
  Lệnh: `adb devices`
  Kết quả:
  ```text
  List of devices attached
  (Trống)
  ```
- **Xác nhận giới hạn kỹ thuật**:
  - Tại thời điểm thực hiện, chưa có thiết bị vật lý Android (Redmi 13) hoặc iOS (iPhone) được cắm cáp kết nối hoặc mở qua mạng nội bộ.
  - **Lưu ý chuyên môn**: Mặc dù 32/32 unit tests của bộ theme đã PASS và static typecheck/linter đạt 100%, kết quả này **chưa chứng minh được giao diện ThemePreviewScreen đã render hoàn hảo trên màn hình thiết bị thật**.
  - Việc kiểm tra hiển thị thực tế, font chữ và trải nghiệm chạm đổi theme cần được tiến hành trực tiếp khi người dùng cắm thiết bị và chạy `npx expo start`.
