# Bản đồ Cấu trúc Dự án (Project Map)

Tài liệu này hệ thống hóa toàn bộ cấu trúc thư mục và các file cốt lõi của dự án `LungCT_DoAn`, giúp các thành viên mới nắm bắt nhanh ranh giới trách nhiệm của từng phân hệ.

---

## 1. Tổng quan cấu trúc gốc (Workspace Root)

```text
LungCT_DoAn/
├── ai/                      # Nghiên cứu mô hình AI & Artifacts
│   ├── models/source/       # Gói nguồn mô hình gốc (Primary FP32 & LightCandidate FP16)
│   └── notebooks/           # Jupyter notebook tái lập và cải tiến huấn luyện
├── docs/                    # Tài liệu kỹ thuật, đặc tả và học tập
│   ├── architecture/        # Sơ đồ kiến trúc hệ thống và pipeline (.drawio)
│   ├── learning/            # Tài liệu giải thích kiến trúc & mã nguồn
│   ├── requirements/        # Đặc tả yêu cầu, biên bản tiếp nhận đầu vào
│   └── ui_handoff/          # Toàn bộ bộ bàn giao thiết kế (Tokens, Figma layout, Theme)
├── evidence/                # Minh chứng kiểm thử thực tế và số đo hiệu năng
│   ├── android/             # Minh chứng riêng trên thiết bị thật Android (Redmi 13)
│   ├── ios/                 # Minh chứng riêng trên thiết bị thật iOS (iPhone)
│   └── shared/              # Minh chứng dùng chung (Unit tests, UI theme)
├── mobile/                  # Mã nguồn ứng dụng di động React Native + TypeScript + Expo
├── reports/                 # Báo cáo khóa luận tốt nghiệp
│   ├── android/             # Báo cáo khóa luận 5 chương của Dương Hải Đăng
│   └── ios/                 # Khu vực lưu trữ tài liệu tham khảo phân hệ iOS cũ
├── AGENTS.md                # Quy tắc cốt lõi bắt buộc dành cho trợ lý AI và nhà phát triển
└── README.md                # Hướng dẫn tổng quan đồ án
```

---

## 2. Chi tiết phân hệ ứng dụng di động (`mobile/`)

```text
mobile/
├── assets/                  # Tài nguyên đồ họa tĩnh (icons, splash, favicon)
├── src/
│   ├── config/              # Cấu hình tham số và các quyết định chưa chốt
│   │   └── ui-decisions.ts  # Chứa Q-15, Q-09, mốc thời gian lọc thống kê
│   ├── features/            # Các tính năng theo phân hệ
│   │   └── dev/screens/     # Màn hình nội bộ phục vụ phát triển
│   │       └── ThemePreviewScreen.tsx # Màn hình xem thử và kiểm tra 48 token màu
│   └── ui/
│       └── theme/           # Hệ thống theme màu, khoảng cách và kiểu chữ
│           ├── __tests__/   # Kiểm thử tự động tỷ lệ tương phản WCAG & tính hợp lệ của token
│           ├── contrast.ts  # Thuật toán tính độ sáng tương đối (Luminance) và tương phản (WCAG)
│           ├── dark.ts      # Bảng 48 token ngữ nghĩa cho chế độ Tối (Dark mode)
│           ├── heatmap.ts   # Bảng màu Grad-CAM khoa học cố định (jet palette) & canvas ảnh CT
│           ├── index.ts     # Điểm xuất khẩu tập trung của module theme
│           ├── light.ts     # Bảng 48 token ngữ nghĩa cho chế độ Sáng (Light mode)
│           ├── palette.ts   # Bảng màu gốc (Primitive palette)
│           ├── spacing.ts   # Hệ số khoảng cách và bán kính bo góc chuẩn
│           ├── ThemeProvider.tsx # Context Provider quản lý trạng thái Theme và hook useTheme()
│           ├── types.ts     # Định nghĩa kiểu dữ liệu chặt chẽ cho ColorTokens và Theme
│           └── typography.ts# Thang kích thước và độ đậm font chữ
├── App.tsx                  # Điểm khởi nhập (Entry Point) bọc ThemeProvider
├── eslint.config.js         # Cấu hình linter ESLint (flat config chuẩn Expo)
├── .prettierrc              # Cấu hình định dạng mã nguồn nhất quán
├── package.json             # Danh sách dependencies và các lệnh typecheck, test, lint, format
└── tsconfig.json            # Cấu hình TypeScript Strict Mode và Jest types
```

---

## 3. Ranh giới trách nhiệm quan trọng

1. **Không can thiệp mã màu**: Các mã màu trong `light.ts`, `dark.ts` được ánh xạ trực tiếp từ Figma tokens và đã vượt qua 32 bài kiểm tra WCAG; tuyệt đối không tự sửa mã hex.
2. **Quyết định chưa chốt đặt tại `src/config/ui-decisions.ts`**: Khi có sự thống nhất từ giảng viên về định dạng hiển thị hoặc giới hạn bảo mật, chỉ cần cập nhật tại file này.
3. **Phân tách nền tảng**: Mã nguồn dùng chung đặt trực tiếp trong `src/`; các logic đặc thù cho phần cứng máy ảnh hoặc runtime AI sau này sẽ phân tách dạng `*.android.tsx` và `*.ios.tsx`.
