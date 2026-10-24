/**
 * Bảng màu bản đồ Grad-CAM — CỐ ĐỊNH, không thuộc theme Sáng/Tối.
 *
 * BR-AI-05: màu heatmap là thang khoa học "jet", không đổi theo thương hiệu hay chế độ tối.
 * Độ phủ mặc định 40% (khớp notebook); người dùng chỉnh 0–100% bước 5% (AI-04).
 * Luôn hiển thị chú giải thang màu (HeatmapLegend) khi bật lớp Grad-CAM.
 */
export const HEATMAP_STOPS: ReadonlyArray<{ position: number; color: string }> = [
  { position: 0, color: '#00008F' },
  { position: 0.35, color: '#0073FF' },
  { position: 0.6, color: '#99FF8C' },
  { position: 0.8, color: '#FFD900' },
  { position: 1, color: '#E61A0D' },
];

/** Độ phủ mặc định của lớp Grad-CAM (0–1). */
export const HEATMAP_DEFAULT_OPACITY = 0.4;

/** Bước chỉnh độ phủ trên thanh trượt (0–1). */
export const HEATMAP_OPACITY_STEP = 0.05;

/** Nền vùng xem ảnh CT — cố định, không đổi theo theme. */
export const IMAGE_CANVAS = '#111210';
