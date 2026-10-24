# Thư viện component

Mỗi component Figma (trang 01) = 1 file trong `src/ui/components/`. Biến thể Figma → prop union; thuộc tính text/boolean → prop. Kích thước, màu, bo góc lấy từ `useTheme()` — KHÔNG ghi mã hex trong component.

| Component | Biến thể | Props | Ghi chú |
| --- | --- | --- | --- |
| Button | Style: primary | secondary | tertiary | danger · Size: L (48) | M (40) · State: default | disabled | loading | label, leadingIcon?, onPress | Pressable; loading → ActivityIndicator + khóa bấm lặp; danger chỉ cho thao tác nguy hiểm |
| IconButton | Style: plain | tonal · State: default | disabled | icon, accessibilityLabel (bắt buộc) | 44×44 |
| TextField | State: default | focused | filled | error | disabled | label, value, placeholder, helper?, error?, trailingIcon? | Viền border.control (focus: border.focus 2px; lỗi: status.danger.fg) + chữ lỗi + icon, không chỉ màu |
| SearchField | — | placeholder, value | icon search 20 |
| FilterChip | selected: boolean | label | radius full; accessibilityState.selected |
| StatusBadge | tone: neutral | info | success | warning | danger | pending | brand | label, icon | radius full, labelS; luôn có chữ (BR-UI-01) |
| AILabel | class: Benign | Malignant | Normal | — | “Lành tính / Ác tính / Bình thường”; màu colors.ai.* |
| Banner | type: offline | syncing | error | warning | info | locked | mock | title, body | accessibilityLiveRegion=polite |
| TopBar | type: root | stack | modal | title, actions[] | root: titleL; stack: nút back + titleS; modal: nút close |
| TabBar | role: doctor (5) | admin (3) | active | Bác sĩ: Trang chủ, Bệnh nhân, Ca bệnh, Thống kê, Tôi · Admin: Tài khoản, Thống kê, Tôi; nhãn luôn hiện |
| ListRow | type: patient | case | account | setting | notification | title, subtitle, leadingIcon, badges[] | thẻ bo 16, padding 16/12, chevron phải |
| CTImage | overlay: none | gradcam | uri, opacity (0–1, mặc định 0.4) | nền #111210 cố định; zoom/pan; KHÔNG dùng ảnh bệnh nhân thật trong demo |
| HeatmapLegend | — | — | thang jet + “Thấp / Mức đóng góp tương đối trong ảnh này / Cao” |
| ImageTile | status: pending | running | pass | passNoCam | fail | mock | index, thumbnail, aiClass? | tách lỗi phân loại và lỗi Grad-CAM (BR-AI-04) |
| Toggle · Checkbox | value / state | label | Switch hệ thống chấp nhận được nếu khớp màu brand |
| Segmented | items: 2 | 3 | selectedIndex | Ảnh gốc / Grad-CAM; 7 ngày / 30 ngày / Tất cả |
| Slider | — | value 0–100, step 5 | độ phủ Grad-CAM |
| Dialog | type: default | destructive | title, body, cancelLabel, confirmLabel | scrim 50%; destructive: focus mặc định vào Hủy |
| BottomSheet · Snackbar | Snackbar: info | success | error | title/options · message, action? | Android Back đóng sheet |
| EmptyState | type: noData | noResult | error | offline | title, body, action? | icon trong vòng tròn 72 |
| SectionHeader · StatCard · ProgressBar · Skeleton | StatCard tone: neutral | brand | warning | title/action · label/value · label/progress | StatCard chỉ đếm số lượng, không hiển thị độ chính xác mô hình |
| ScoreRow | class × top: yes | no | label, value (0–1) | đủ 3 lớp theo thứ tự cố định [Benign, Malignant, Normal]; số 3 chữ số thập phân “0,712” (Q-15 đề xuất A); gọi là “điểm”, không gọi “xác suất” |

Kích thước/khoảng cách thực tế của từng component xem trong `reference/screens-v2/layout-json/*.json` (ví dụ Button: padding 13/20, gap 8, radius 12, chữ labelL).
