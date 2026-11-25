/**
 * Pipeline Hằng số & Cấu hình Edge AI Chẩn Đoán CT Phổi
 *
 * Tuân thủ quy chuẩn AGENTS.md:
 * - Bảo tồn thứ tự 3 phân lớp mục tiêu: [Benign, Malignant, Normal]
 * - Kiểu dữ liệu FP32 nguyên bản
 * - Thông báo minh bạch: Grad-CAM CHƯA KHẢ DỤNG trên thiết bị di động
 */

export const MODEL_CLASSES = ['Benign', 'Malignant', 'Normal'] as const;
export type ModelClass = (typeof MODEL_CLASSES)[number];

export interface SuspiciousRegion {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  areaPx: number;
  areaRatio: number;
  camMax: number;
  camMean: number;
}

export interface PipelinePredictionResult {
  predictedClass: ModelClass;
  probabilities: {
    Benign: number;
    Malignant: number;
    Normal: number;
  };
  latency: {
    vitInferenceMs: number;
    fusionInferenceMs: number;
    gradcamMs?: number;
    totalInferenceMs: number;
    modelLoadMs: number;
  };
  gradcamAvailable: boolean;
  gradcamStatus?: 'PENDING' | 'PASS' | 'ZERO_CAM' | 'UNAVAILABLE' | 'FAIL';
  gradcamUri?: string;
  gradcamNotice: string;
  isMock: false;
  verifiedSource: 'on_device_fp32';
  modelVersion?: string;
  modelSha256?: string;

  // Thuật toán phân đoạn & Đánh tô vùng nghi ngờ Colab (Mục 24.2 & 28)
  lungMaskStatus?: string;
  lungHotRatio?: number;
  lungCamRatio?: number;
  drawSuspicious?: boolean;
  decisionReason?: string;
  suspiciousCount?: number;
  lungMaskUri?: string;
  suspiciousOverlayUri?: string;
  triPanelUri?: string;
  suspiciousRegions?: SuspiciousRegion[];
}

export const GRADCAM_UNAVAILABLE_NOTICE =
  'Grad-CAM chưa khả dụng hoặc chưa được tính toán cho lát cắt này.';
