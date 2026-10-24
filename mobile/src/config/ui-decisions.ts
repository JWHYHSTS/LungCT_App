/**
 * @file ui-decisions.ts
 * Lưu trữ các lựa chọn CHƯA CHỐT (pending decisions / proposals) được tham chiếu ở tầng UI.
 *
 * NGUYÊN TẮC:
 * 1. Mọi mục ở đây chỉ là đề xuất kỹ thuật hoặc giá trị chờ quyết định từ người hướng dẫn/đặc tả chính thức.
 * 2. Tuyệt đối không tự ý xem bất kỳ giá trị nào là chính sách kinh doanh/nghiệp vụ đã chốt.
 * 3. Cho phép thay đổi linh hoạt tập trung tại một nơi thay vì rải rác trong các component.
 */

/**
 * Cấu hình hiển thị định dạng điểm số AI [CHƯA CHỐT Q-15].
 *
 * Lý do thiết kế & ràng buộc:
 * - Theo BR-AI-05 và thiết kế đề xuất A, điểm số phân loại 3 lớp (Benign, Malignant, Normal)
 *   được hiển thị với 3 chữ số thập phân, sử dụng dấu phẩy làm dấu ngăn cách (ví dụ "0,712").
 * - Thuật ngữ y tế: gọi là "điểm" (score), không gọi là "xác suất" (probability) để tránh gây hiểu nhầm về chẩn đoán xác định.
 * - Trạng thái: Đề xuất phương án A (Chờ duyệt chính thức theo Q-15).
 */
export const SCORE_FORMAT_DECISION = {
  code: 'Q-15',
  status: 'PENDING_DECISION',
  decimalPlaces: 3,
  decimalSeparator: ',',
  format: (value: number): string => {
    return value.toFixed(3).replace('.', ',');
  },
} as const;

/**
 * Cấu hình các mốc thời gian lọc thống kê trên màn hình tổng quan bác sĩ / quản trị [ĐỀ XUẤT].
 *
 * Lý do thiết kế:
 * - Cho phép chuyển đổi nhanh giữa các khoảng thời gian xem báo cáo phân tích.
 * - Trạng thái: Đề xuất kỹ thuật gồm 3 mốc (7 ngày, 30 ngày, toàn bộ lịch sử).
 */
export const STATS_TIME_RANGES_DECISION = {
  status: 'PROPOSAL',
  ranges: ['7d', '30d', 'all'] as const,
  defaultRange: '7d',
} as const;

/**
 * Cấu hình số lần nhập sai mật khẩu tối đa khi thiết bị ngoại tuyến [CHƯA CHỐT Q-09].
 *
 * CẢNH BÁO VỀ Ý NGHĨA KỸ THUẬT:
 * - Giá trị `null` ở đây CHỈ mang ý nghĩa kỹ thuật là THÔNG SỐ CHƯA ĐƯỢC ĐẶC TẢ/THỐNG NHẤT
 *   trong tài liệu yêu cầu hiện tại, KHÔNG ĐỒNG NGHĨA với chính sách bảo mật cho phép người dùng
 *   thử mật khẩu vô hạn lần khi offline.
 * - Khi triển khai chức năng xác thực offline (BR-AUTH-02), tham số này bắt buộc phải được
 *   hội đồng / giảng viên hướng dẫn phê duyệt chính thức để tránh nguy cơ tấn công brute-force cục bộ.
 *
 * TODO(UI-05): Rà soát lại với giảng viên để chốt ngưỡng số lần thử (ví dụ: 5 lần) trước khi khóa tạm thời.
 */
export const OFFLINE_MAX_PASSWORD_ATTEMPTS_DECISION = {
  code: 'Q-09',
  status: 'PENDING_DECISION',
  maxAttempts: null as number | null,
} as const;
