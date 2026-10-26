/**
 * Dữ liệu giả lập (Mock Data) chuẩn hóa cho gói UI-06 (5 tab chính của bác sĩ).
 *
 * CẢNH BÁO MINH BẠCH:
 * - Mọi đối tượng ở đây đều mang cờ `isMock: true`.
 * - Phục vụ hiển thị giao diện mẫu, kiểm thử đơn vị và khảo sát trên máy ảo.
 * - Tuyệt đối không dùng làm dữ liệu lâm sàng hoặc xác thực thật.
 */

export interface MockPatient {
  id: string;
  code: string;
  fullName: string;
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  caseCount: number;
  lastCaseDate: string;
  hasDraftCase: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict';
  isMock: true;
}

export interface MockCase {
  id: string;
  caseCode: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  captureDate: string;
  status: 'DRAFT' | 'COMPLETED' | 'PARTIAL';
  imageCount: number;
  aiLabelSummary?: 'Lành tính' | 'Ác tính' | 'Bình thường';
  aiScore?: number;
  isPartial?: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict';
  isMock: true;
}

export interface MockStatsData {
  period: '7d' | '30d' | 'all';
  patientCount: number;
  completedCaseCount: number;
  draftCaseCount: number;
  analyzedImageCount: number;
  labelDistribution: {
    benign: number; // Lành tính
    malignant: number; // Ác tính
    normal: number; // Bình thường
  };
  unitNotes: {
    caseUnit: 'ca';
    imageUnit: 'ảnh';
    syncFormulaNote: string;
  };
  isMock: true;
}

export interface MockDoctorProfile {
  id: string;
  fullName: string;
  email: string;
  workplace: string;
  specialty: string;
  role: 'Bác sĩ';
  status: 'Hoạt động';
  pendingSyncCount: number;
  isMock: true;
}

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'p-1',
    code: 'BN-000123',
    fullName: 'Nguyễn Văn An',
    age: 58,
    gender: 'Nam',
    caseCount: 2,
    lastCaseDate: '20/10/2026',
    hasDraftCase: true,
    syncStatus: 'synced',
    isMock: true,
  },
  {
    id: 'p-2',
    code: 'BN-000124',
    fullName: 'Trần Thị Bình',
    age: 45,
    gender: 'Nữ',
    caseCount: 1,
    lastCaseDate: '18/10/2026',
    hasDraftCase: false,
    syncStatus: 'pending',
    isMock: true,
  },
  {
    id: 'p-3',
    code: 'BN-000125',
    fullName: 'Lê Hoàng Cường',
    age: 62,
    gender: 'Nam',
    caseCount: 3,
    lastCaseDate: '15/10/2026',
    hasDraftCase: true,
    syncStatus: 'synced',
    isMock: true,
  },
  {
    id: 'p-4',
    code: 'BN-000126',
    fullName: 'Phạm Thị Dung',
    age: 51,
    gender: 'Nữ',
    caseCount: 1,
    lastCaseDate: '12/10/2026',
    hasDraftCase: false,
    syncStatus: 'synced',
    isMock: true,
  },
];

export const MOCK_CASES: MockCase[] = [
  {
    id: 'c-1',
    caseCode: 'CA-2026-000045',
    patientId: 'p-1',
    patientName: 'Nguyễn Văn An',
    patientCode: 'BN-000123',
    captureDate: '20/10/2026',
    status: 'DRAFT',
    imageCount: 2,
    aiLabelSummary: 'Lành tính',
    aiScore: 0.712,
    isPartial: false,
    syncStatus: 'pending',
    isMock: true,
  },
  {
    id: 'c-2',
    caseCode: 'CA-2026-000044',
    patientId: 'p-2',
    patientName: 'Trần Thị Bình',
    patientCode: 'BN-000124',
    captureDate: '18/10/2026',
    status: 'COMPLETED',
    imageCount: 4,
    aiLabelSummary: 'Bình thường',
    aiScore: 0.895,
    isPartial: false,
    syncStatus: 'synced',
    isMock: true,
  },
  {
    id: 'c-3',
    caseCode: 'CA-2026-000043',
    patientId: 'p-3',
    patientName: 'Lê Hoàng Cường',
    patientCode: 'BN-000125',
    captureDate: '15/10/2026',
    status: 'PARTIAL',
    imageCount: 3,
    aiLabelSummary: 'Ác tính',
    aiScore: 0.841,
    isPartial: true,
    syncStatus: 'synced',
    isMock: true,
  },
  {
    id: 'c-4',
    caseCode: 'CA-2026-000042',
    patientId: 'p-1',
    patientName: 'Nguyễn Văn An',
    patientCode: 'BN-000123',
    captureDate: '10/10/2026',
    status: 'COMPLETED',
    imageCount: 2,
    aiLabelSummary: 'Lành tính',
    aiScore: 0.784,
    isPartial: false,
    syncStatus: 'synced',
    isMock: true,
  },
];

export const MOCK_STATS: Record<'7d' | '30d' | 'all', MockStatsData> = {
  '7d': {
    period: '7d',
    patientCount: 6,
    completedCaseCount: 4,
    draftCaseCount: 1,
    analyzedImageCount: 9,
    labelDistribution: {
      benign: 3,
      malignant: 2,
      normal: 4,
    },
    unitNotes: {
      caseUnit: 'ca',
      imageUnit: 'ảnh',
      syncFormulaNote:
        'Chỉ đếm số lượng ảnh thực tế; không hiển thị độ chính xác mô hình. Không tính ảnh giả lập, ảnh bị thay hoặc mục trong thùng rác.',
    },
    isMock: true,
  },
  '30d': {
    period: '30d',
    patientCount: 18,
    completedCaseCount: 12,
    draftCaseCount: 3,
    analyzedImageCount: 28,
    labelDistribution: {
      benign: 9,
      malignant: 5,
      normal: 14,
    },
    unitNotes: {
      caseUnit: 'ca',
      imageUnit: 'ảnh',
      syncFormulaNote:
        'Chỉ đếm số lượng ảnh thực tế; không hiển thị độ chính xác mô hình. Không tính ảnh giả lập, ảnh bị thay hoặc mục trong thùng rác.',
    },
    isMock: true,
  },
  all: {
    period: 'all',
    patientCount: 42,
    completedCaseCount: 36,
    draftCaseCount: 5,
    analyzedImageCount: 84,
    labelDistribution: {
      benign: 28,
      malignant: 16,
      normal: 40,
    },
    unitNotes: {
      caseUnit: 'ca',
      imageUnit: 'ảnh',
      syncFormulaNote:
        'Chỉ đếm số lượng ảnh thực tế; không hiển thị độ chính xác mô hình. Không tính ảnh giả lập, ảnh bị thay hoặc mục trong thùng rác.',
    },
    isMock: true,
  },
};

export const MOCK_DOCTOR_PROFILE: MockDoctorProfile = {
  id: 'doc-001',
  fullName: 'BS. Nguyễn Minh An',
  email: 'bs.an@example.com',
  workplace: 'Bệnh viện Thực hành A',
  specialty: 'Chẩn đoán hình ảnh',
  role: 'Bác sĩ',
  status: 'Hoạt động',
  pendingSyncCount: 3,
  isMock: true,
};
