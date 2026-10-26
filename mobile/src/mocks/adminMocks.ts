/**
 * Mock Store chuyên biệt cho Phân hệ Quản trị viên (Admin - UI-08).
 * TUÂN THỦ NGHIÊM NGẶT BR-OWN-03:
 * - Quản trị viên chỉ quản lý thông tin tài khoản và xem số liệu thống kê tổng hợp vĩ mô.
 * - TUYỆT ĐỐI KHÔNG chứa hoặc import dữ liệu hồ sơ bệnh nhân, ca chụp hay ảnh CT y tế.
 */

export type DoctorAccountStatus = 'pending' | 'active' | 'locked';

export interface AdminDoctorAccount {
  id: string;
  fullName: string;
  email: string;
  workplace: string;
  specialty: string;
  registeredAt: string;
  status: DoctorAccountStatus;
  lockReason?: string;
}

export interface AdminAuditLog {
  id: string;
  accountId: string;
  action: 'approve' | 'lock';
  performedAt: string;
  performedBy: string;
  reason?: string;
}

export interface AdminOverviewStats {
  period: '7d' | '30d' | 'all';
  activeDoctors: number;
  pendingDoctors: number;
  completedCases: number;
  analyzedImages: number;
  aiBreakdown: {
    benign: number;
    malignant: number;
    normal: number;
  };
}

// Danh sách tài khoản bác sĩ ban đầu
const INITIAL_DOCTORS: AdminDoctorAccount[] = [
  {
    id: 'doc-001',
    fullName: 'BS. Phạm Thu Hà',
    email: 'ha.pham@example.com',
    workplace: 'Bệnh viện Thực hành A',
    specialty: 'Chẩn đoán hình ảnh',
    registeredAt: '23/10/2026 14:20',
    status: 'pending',
  },
  {
    id: 'doc-002',
    fullName: 'BS. Lê Văn Nam',
    email: 'nam.le@example.com',
    workplace: 'Bệnh viện Đa khoa Trung tâm',
    specialty: 'Nội hô hấp',
    registeredAt: '22/10/2026 09:15',
    status: 'pending',
  },
  {
    id: 'doc-003',
    fullName: 'BS. Nguyễn Minh An',
    email: 'bs.an@example.com',
    workplace: 'Bệnh viện Phổi Trung ương',
    specialty: 'Chẩn đoán hình ảnh',
    registeredAt: '15/10/2026 08:30',
    status: 'active',
  },
  {
    id: 'doc-004',
    fullName: 'BS. Trần Thị Mai',
    email: 'mai.tran@example.com',
    workplace: 'Bệnh viện Ung bướu',
    specialty: 'Giải phẫu bệnh',
    registeredAt: '10/10/2026 11:00',
    status: 'active',
  },
  {
    id: 'doc-005',
    fullName: 'BS. Hoàng Quốc Bảo',
    email: 'bao.hoang@example.com',
    workplace: 'Phòng khám Đa khoa Quốc tế',
    specialty: 'Ngoại lồng ngực',
    registeredAt: '01/10/2026 16:45',
    status: 'locked',
    lockReason: 'Thông tin chứng chỉ hành nghề chưa được xác thực qua hệ thống y tế.',
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-001',
    accountId: 'doc-005',
    action: 'lock',
    performedAt: '05/10/2026 10:15',
    performedBy: 'admin@example.com',
    reason: 'Thông tin chứng chỉ hành nghề chưa được xác thực qua hệ thống y tế.',
  },
];

let doctorsStore: AdminDoctorAccount[] = [...INITIAL_DOCTORS];
let auditLogsStore: AdminAuditLog[] = [...INITIAL_AUDIT_LOGS];
const listeners: (() => void)[] = [];

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeAdminStore = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const resetAdminStore = () => {
  doctorsStore = [...INITIAL_DOCTORS];
  auditLogsStore = [...INITIAL_AUDIT_LOGS];
  notify();
};

export const getAdminDoctors = (): AdminDoctorAccount[] => {
  return [...doctorsStore];
};

export const findAdminDoctorById = (id: string): AdminDoctorAccount | undefined => {
  return doctorsStore.find((d) => d.id === id);
};

export const approveDoctorAccount = (id: string, performedBy = 'admin@example.com'): boolean => {
  const target = doctorsStore.find((d) => d.id === id);
  if (!target) return false;

  target.status = 'active';
  target.lockReason = undefined;

  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    accountId: id,
    action: 'approve',
    performedAt: 'Vừa xong',
    performedBy,
  });

  notify();
  return true;
};

export const lockDoctorAccount = (
  id: string,
  reason: string,
  performedBy = 'admin@example.com',
): boolean => {
  const trimmed = reason.trim();
  if (!trimmed) return false;

  const target = doctorsStore.find((d) => d.id === id);
  if (!target) return false;

  target.status = 'locked';
  target.lockReason = trimmed;

  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    accountId: id,
    action: 'lock',
    performedAt: 'Vừa xong',
    performedBy,
    reason: trimmed,
  });

  notify();
  return true;
};

export const getAuditLogsForDoctor = (accountId: string): AdminAuditLog[] => {
  return auditLogsStore.filter((l) => l.accountId === accountId);
};

/**
 * Số liệu thống kê tổng hợp vĩ mô theo kỳ (BR-OWN-03).
 * Chỉ thống kê số lượng ca/ảnh đã đồng bộ, không trích xuất thông tin cá nhân hay hình ảnh bệnh nhân.
 */
export const getAdminStatsByPeriod = (period: '7d' | '30d' | 'all'): AdminOverviewStats => {
  if (period === '7d') {
    return {
      period: '7d',
      activeDoctors: 18,
      pendingDoctors: 2,
      completedCases: 84,
      analyzedImages: 252,
      aiBreakdown: {
        benign: 86,
        malignant: 54,
        normal: 112,
      },
    };
  }

  if (period === '30d') {
    return {
      period: '30d',
      activeDoctors: 24,
      pendingDoctors: 2,
      completedCases: 312,
      analyzedImages: 1046,
      aiBreakdown: {
        benign: 352,
        malignant: 214,
        normal: 480,
      },
    };
  }

  return {
    period: 'all',
    activeDoctors: 35,
    pendingDoctors: 2,
    completedCases: 1240,
    analyzedImages: 4180,
    aiBreakdown: {
      benign: 1420,
      malignant: 890,
      normal: 1870,
    },
  };
};
