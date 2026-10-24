# Design tokens LungCT

Mã nguồn tương ứng: `code/src/ui/theme/` (đã kiểm thử: 32/32 phép thử, gồm khớp khóa Sáng/Tối và độ tương phản WCAG).

## Màu ngữ nghĩa (48 token × 2 chế độ)

| Token (code) | Biến Figma | Sáng | Tối |
| --- | --- | --- | --- |
| `colors.bg.app` | `color/bg/app` | #FAF8F2 (neutral/50) | #171814 (neutral/950) |
| `colors.bg.surface` | `color/bg/surface` | #FFFFFF (neutral/0) | #22231F (neutral/900) |
| `colors.bg.surfaceAlt` | `color/bg/surface-alt` | #F2EFE7 (neutral/100) | #2C2E28 (neutral/850) |
| `colors.bg.sunken` | `color/bg/sunken` | #E4E0D6 (neutral/200) | #34362F (neutral/800) |
| `colors.bg.brandSubtle` | `color/bg/brand-subtle` | #EEF7F5 (teal/50) | #1B3F3B (teal/900) |
| `colors.bg.inverse` | `color/bg/inverse` | #22231F (neutral/900) | #F2EFE7 (neutral/100) |
| `colors.bg.imageCanvas` | `color/bg/image-canvas` | #111210 (neutral/1000) | #111210 (neutral/1000) |
| `colors.bg.scrim` | `color/bg/scrim` | #171814 (neutral/950) | #111210 (neutral/1000) |
| `colors.text.primary` | `color/text/primary` | #22231F (neutral/900) | #F2EFE7 (neutral/100) |
| `colors.text.secondary` | `color/text/secondary` | #6B6E66 (neutral/600) | #CFCAC0 (neutral/300) |
| `colors.text.tertiary` | `color/text/tertiary` | #6B6E66 (neutral/600) | #ADA99F (neutral/400) |
| `colors.text.onBrand` | `color/text/on-brand` | #FFFFFF (neutral/0) | #171814 (neutral/950) |
| `colors.text.inverse` | `color/text/inverse` | #FAF8F2 (neutral/50) | #22231F (neutral/900) |
| `colors.text.link` | `color/text/link` | #2F6F67 (teal/700) | #7FC4B8 (teal/300) |
| `colors.text.disabled` | `color/text/disabled` | #ADA99F (neutral/400) | #6B6E66 (neutral/600) |
| `colors.border.default` | `color/border/default` | #E4E0D6 (neutral/200) | #34362F (neutral/800) |
| `colors.border.strong` | `color/border/strong` | #CFCAC0 (neutral/300) | #4D5048 (neutral/700) |
| `colors.border.focus` | `color/border/focus` | #2F6F67 (teal/700) | #7FC4B8 (teal/300) |
| `colors.border.icon` | `color/border/icon` | #4D5048 (neutral/700) | #CFCAC0 (neutral/300) |
| `colors.brand.primary` | `color/brand/primary` | #2F6F67 (teal/700) | #7FC4B8 (teal/300) |
| `colors.brand.primaryPressed` | `color/brand/primary-pressed` | #245650 (teal/800) | #A9D5CD (teal/200) |
| `colors.brand.accent` | `color/brand/accent` | #A9D5CD (teal/200) | #245650 (teal/800) |
| `colors.status.success.bg` | `color/status/success/bg` | #EAF2E3 (sage/100) | #2B3D20 (sage/900) |
| `colors.status.success.fg` | `color/status/success/fg` | #4E6E3A (sage/700) | #B8CFA7 (sage/200) |
| `colors.status.success.border` | `color/status/success/border` | #B8CFA7 (sage/200) | #4E6E3A (sage/700) |
| `colors.status.warning.bg` | `color/status/warning/bg` | #FCF5DC (yellow/100) | #4A3A10 (yellow/900) |
| `colors.status.warning.fg` | `color/status/warning/fg` | #7A5B12 (yellow/800) | #F8E6AA (yellow/200) |
| `colors.status.warning.border` | `color/status/warning/border` | #EBD27E (yellow/300) | #7A5B12 (yellow/800) |
| `colors.status.danger.bg` | `color/status/danger/bg` | #F8E3E0 (coral/100) | #4F2420 (coral/900) |
| `colors.status.danger.fg` | `color/status/danger/fg` | #A8443A (coral/700) | #E8A49A (coral/300) |
| `colors.status.danger.border` | `color/status/danger/border` | #E8A49A (coral/300) | #A8443A (coral/700) |
| `colors.status.info.bg` | `color/status/info/bg` | #E3EEF5 (blue/100) | #1E3646 (blue/900) |
| `colors.status.info.fg` | `color/status/info/fg` | #3E6E8E (blue/600) | #ADCBDD (blue/200) |
| `colors.status.info.border` | `color/status/info/border` | #ADCBDD (blue/200) | #3E6E8E (blue/600) |
| `colors.status.neutral.bg` | `color/status/neutral/bg` | #F2EFE7 (neutral/100) | #2C2E28 (neutral/850) |
| `colors.status.neutral.fg` | `color/status/neutral/fg` | #4D5048 (neutral/700) | #E4E0D6 (neutral/200) |
| `colors.status.neutral.border` | `color/status/neutral/border` | #CFCAC0 (neutral/300) | #4D5048 (neutral/700) |
| `colors.status.pending.bg` | `color/status/pending/bg` | #FBEADB (orange/100) | #4F2E12 (orange/900) |
| `colors.status.pending.fg` | `color/status/pending/fg` | #8A4A17 (orange/800) | #EFB47A (orange/300) |
| `colors.status.pending.border` | `color/status/pending/border` | #EFB47A (orange/300) | #8A4A17 (orange/800) |
| `colors.ai.benign.bg` | `color/ai/benign/bg` | #E3EEF5 (blue/100) | #1E3646 (blue/900) |
| `colors.ai.benign.fg` | `color/ai/benign/fg` | #2A4B61 (blue/800) | #ADCBDD (blue/200) |
| `colors.ai.malignant.bg` | `color/ai/malignant/bg` | #F8E3E0 (coral/100) | #4F2420 (coral/900) |
| `colors.ai.malignant.fg` | `color/ai/malignant/fg` | #A8443A (coral/700) | #E8A49A (coral/300) |
| `colors.ai.normal.bg` | `color/ai/normal/bg` | #EAF2E3 (sage/100) | #2B3D20 (sage/900) |
| `colors.ai.normal.fg` | `color/ai/normal/fg` | #4E6E3A (sage/700) | #B8CFA7 (sage/200) |
| `colors.ai.barTrack` | `color/ai/bar-track` | #E4E0D6 (neutral/200) | #34362F (neutral/800) |
| `colors.border.control` | `color/border/control` | #8A8D84 (neutral/500) | #8A8D84 (neutral/500) |

Màu cố định ngoài theme: nền ảnh CT `#111210`; thang màu Grad-CAM “jet” (xem `code/src/ui/theme/heatmap.ts`, BR-AI-05).

## Kiểu chữ (font đề xuất: Be Vietnam Pro; dự phòng: font hệ thống / Inter)

| Style (code) | Figma | Cỡ / dòng | Độ đậm |
| --- | --- | --- | --- |
| `typography.display` | Display | 28 / 36 | SemiBold |
| `typography.titleL` | Title/L | 22 / 28 | SemiBold |
| `typography.titleM` | Title/M | 19 / 26 | SemiBold |
| `typography.titleS` | Title/S | 17 / 24 | SemiBold |
| `typography.bodyL` | Body/L | 17 / 24 | Regular |
| `typography.bodyM` | Body/M | 15 / 22 | Regular |
| `typography.bodyS` | Body/S | 13 / 18 | Regular |
| `typography.labelL` | Label/L | 17 / 22 | Medium |
| `typography.labelM` | Label/M | 15 / 20 | Medium |
| `typography.labelS` | Label/S | 13 / 16 | Medium |
| `typography.caption` | Caption | 12 / 16 | Regular |
| `typography.numericM` | Numeric/M | 15 / 20 | SemiBold |

## Khoảng cách và bo góc

- `spacing`: 0=0, 2xs=2, xs=4, sm=8, md=12, lg=16, xl=20, 2xl=24, 3xl=32, 4xl=40, 5xl=48
- `radius`: sm=8, md=12, lg=16, xl=24, full=999
- Lề màn hình 16; khoảng giữa khối 12–16; vùng chạm tối thiểu 44×44.

## Đổ bóng

- Elevation/1 Card · Elevation/2 Sheet · Elevation/3 Dialog (Android: `elevation` 1/4/8; iOS: shadowOpacity 0.06/0.10/0.16, shadowRadius 4/12/24 — ĐỀ XUẤT).
