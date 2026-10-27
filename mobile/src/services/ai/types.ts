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
    totalInferenceMs: number;
    modelLoadMs: number;
  };
  gradcamAvailable: false;
  gradcamNotice: string;
  isMock: false;
  verifiedSource: 'on_device_fp32';
}

export const GRADCAM_UNAVAILABLE_NOTICE =
  'Grad-CAM chưa khả dụng ngoại tuyến: Kiến trúc Adaptive Fusion sử dụng Cross-Attention và Adaptive Gate phi tuyến tính, các runtime di động (TFLite, ONNX Runtime) chỉ hỗ trợ Forward-pass và không có Autograd để tính Gradient ngược.';
