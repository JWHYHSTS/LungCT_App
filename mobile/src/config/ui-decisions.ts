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

/**
 * Tiêu chí lọc danh sách bệnh nhân trên màn hình Bác sĩ (SCR-P01) [ĐỀ XUẤT].
 *
 * Lý do thiết kế & ràng buộc:
 * - Đặc tả chỉ ghi "chip bộ lọc, sắp xếp" mà chưa chốt danh mục chip cố định.
 * - Khung Figma chuẩn minh họa 3 chip: "Tất cả", "Có ca nháp", "Chưa đồng bộ".
 * - Trạng thái: Đề xuất kỹ thuật cho gói UI-06.
 */
export const PATIENT_FILTER_DECISION = {
  status: 'PROPOSAL',
  chips: [
    { key: 'all', label: 'Tất cả' },
    { key: 'draft', label: 'Có ca nháp' },
    { key: 'unsynced', label: 'Chưa đồng bộ' },
  ] as const,
  defaultChip: 'all',
} as const;

/**
 * Tiêu chí lọc danh sách ca bệnh trên màn hình Bác sĩ (SCR-C01) [ĐỀ XUẤT].
 *
 * Lý do thiết kế & ràng buộc theo tài liệu handoff:
 * - Khung Figma chuẩn `06-doctor-cases` (cả JSON và SVG) minh họa chính xác 4 chip:
 *   1. "Tất cả" (all)
 *   2. "Nháp" (draft)
 *   3. "Hoàn tất" (completed)
 *   4. "Một phần" (partial)
 * - Về trạng thái "Đang phân tích" (RUNNING):
 *   + Theo đặc tả quy tắc (04-thong-diep-va-quy-tac.md, BR-AI-01/04 và 02-dac-ta-tung-khung.md),
 *     "Đang phân tích" (RUNNING) là trạng thái tác vụ phân tích AI On-device diễn ra tuần tự
 *     BÊN TRONG màn hình biên tập ca nháp (SCR-C02 `SCR-C02 · Ca nháp · đang phân tích`).
 *   + Ở cấp độ danh sách ca (SCR-C01), các ca có tiến trình đang xử lý thuộc nhóm ca nháp (DRAFT/RUNNING).
 *   + Nếu giảng viên/hội đồng yêu cầu tách riêng chip "Đang phân tích" ở danh sách tổng SCR-C01,
 *     chip này có thể được bổ sung độc lập tại cấu hình này mà không phá vỡ giao diện.
 * - Trạng thái: Đề xuất kỹ thuật cho gói UI-06 theo đúng khung Figma gốc `06-doctor-cases`.
 */
export const CASE_FILTER_DECISION = {
  status: 'PROPOSAL',
  chips: [
    { key: 'all', label: 'Tất cả' },
    { key: 'draft', label: 'Nháp' },
    { key: 'completed', label: 'Hoàn tất' },
    { key: 'partial', label: 'Một phần' },
  ] as const,
  defaultChip: 'all',
} as const;

/**
 * Cấu hình các trường bắt buộc và quy tắc kiểm tra tính hợp lệ khi thêm bệnh nhân [CHƯA CHỐT Q-20].
 *
 * Lý do thiết kế & ràng buộc theo tài liệu handoff:
 * - Theo 02-dac-ta-tung-khung.md (SCR-P02) và 07-man-chi-tiet-bac-si.md:
 *   + 4 trường bắt buộc (*) theo đề xuất Q-20: Mã bệnh nhân, Họ tên, Ngày sinh, Giới tính.
 *   + 2 trường không bắt buộc: Điện thoại, Triệu chứng.
 *   + Quy tắc ngày sinh: Phải đúng ngày lịch thực tế (hợp lệ theo tháng/năm nhuận) và không nằm trong tương lai.
 *   + Định dạng chuẩn hiển thị và nhập: DD/MM/YYYY.
 */
export const PATIENT_FORM_DECISION = {
  code: 'Q-20',
  status: 'PENDING_DECISION',
  requiredFields: ['code', 'fullName', 'dob', 'gender'] as const,
  dateFormat: 'DD/MM/YYYY',
  codePattern: /^[A-Za-z0-9-]{1,30}$/,
} as const;
