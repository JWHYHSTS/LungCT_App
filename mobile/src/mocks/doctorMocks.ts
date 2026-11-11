/**
 * Quản lý kho lưu trữ mô phỏng trong phiên (In-Memory Mock Store) cho vai trò Bác sĩ.
 *
 * CẢNH BÁO MINH BẠCH VỀ TÍNH BỀN VỮNG:
 * - Khi chưa tích hợp SQLite / Firebase thật, dữ liệu được lưu tạm thời trong bộ nhớ phiên (RAM).
 * - Các thao tác: Thêm bệnh nhân, Thêm ca mới, Lưu nhận xét, Hoàn tất ca, Xóa mềm ca/bệnh nhân
 *   sẽ cập nhật nhất quán giữa tất cả các màn hình (Danh sách và Chi tiết).
 * - Thông báo người dùng luôn ghi rõ: "Đã lưu tạm trong phiên mô phỏng; dữ liệu có thể mất khi khởi động lại app".
 */

import { type AIClass } from '../ui/components/AILabel';

export interface MockPatient {
  id: string;
  code: string;
  fullName: string;
  dob: string; // DD/MM/YYYY
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone?: string;
  symptoms?: string;
  caseCount: number;
  lastCaseDate: string;
  hasDraftCase: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict';
  isTrashed?: boolean;
  isMock: true;
}

export type CTImageStatus = 'pending' | 'running' | 'pass' | 'passNoCam' | 'fail' | 'mock';

export interface MockCTImage {
  id: string;
  index: number;
  sliceNumber: number;
  source: 'gallery' | 'camera';
  status: CTImageStatus;
  uri?: string;
  filePath?: string;
  originalFileName?: string;
  aiClass?: AIClass;
  scores?: {
    benign: number;
    malignant: number;
    normal: number;
  };
  hasGradCam: boolean;
  mockWatermark?: string;
  failReason?: string;
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
  notes?: string;
  notesSavedAt?: string;
  images: MockCTImage[];
  isTrashed?: boolean;
  isMock: true;
}

export interface MockStatsData {
  period: '7d' | '30d' | 'all';
  patientCount: number;
  completedCaseCount: number;
  draftCaseCount: number;
  analyzedImageCount: number;
  labelDistribution: {
    benign: number;
    malignant: number;
    normal: number;
  };
  unitNotes: {
    caseUnit: 'ca';
    imageUnit: 'ảnh';
    syncFormulaNote: string;
  };
  isMock: boolean;
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

const INITIAL_PATIENTS: MockPatient[] = [
  {
    id: 'p-1',
    code: 'BN-000123',
    fullName: 'Nguyễn Văn An',
    dob: '12/05/1968',
    age: 58,
    gender: 'Nam',
    phone: '0912345678',
    symptoms: 'Ho khan kéo dài, đau tức ngực nhẹ',
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
    dob: '24/09/1981',
    age: 45,
    gender: 'Nữ',
    phone: '0987654321',
    symptoms: 'Khó thở khi gắng sức',
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
    dob: '05/02/1964',
    age: 62,
    gender: 'Nam',
    phone: '0903112233',
    symptoms: 'Sút cân không rõ nguyên nhân, ho đờm có lẫn máu',
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
    dob: '18/11/1975',
    age: 51,
    gender: 'Nữ',
    phone: '',
    symptoms: 'Khám tầm soát định kỳ',
    caseCount: 1,
    lastCaseDate: '12/10/2026',
    hasDraftCase: false,
    syncStatus: 'synced',
    isMock: true,
  },
];

const INITIAL_CASES: MockCase[] = [
  {
    id: 'c-1',
    caseCode: 'CA-2026-000045',
    patientId: 'p-1',
    patientName: 'Nguyễn Văn An',
    patientCode: 'BN-000123',
    captureDate: '20/10/2026',
    status: 'DRAFT',
    imageCount: 3,
    aiLabelSummary: 'Lành tính',
    aiScore: 0.712,
    isPartial: false,
    syncStatus: 'pending',
    notes: 'Tổn thương dạng kính mờ (GGO) phân thùy trên phổi phải, viền rõ nét.',
    notesSavedAt: '20/10/2026 10:45',
    images: [
      {
        id: 'img-1-1',
        index: 1,
        sliceNumber: 42,
        source: 'gallery',
        status: 'pass',
        aiClass: 'Benign',
        scores: { benign: 0.712, malignant: 0.214, normal: 0.074 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
      {
        id: 'img-1-2',
        index: 2,
        sliceNumber: 43,
        source: 'gallery',
        status: 'passNoCam',
        aiClass: 'Benign',
        scores: { benign: 0.685, malignant: 0.231, normal: 0.084 },
        hasGradCam: false,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
      {
        id: 'img-1-3',
        index: 3,
        sliceNumber: 44,
        source: 'camera',
        status: 'mock',
        aiClass: 'Normal',
        scores: { benign: 0.125, malignant: 0.052, normal: 0.823 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
    ],
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
    notes: 'Nhu mô hai phổi thông khí tốt, không thấy nốt mờ bất thường.',
    notesSavedAt: '18/10/2026 14:20',
    images: [
      {
        id: 'img-2-1',
        index: 1,
        sliceNumber: 20,
        source: 'gallery',
        status: 'pass',
        aiClass: 'Normal',
        scores: { benign: 0.065, malignant: 0.04, normal: 0.895 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
      {
        id: 'img-2-2',
        index: 2,
        sliceNumber: 21,
        source: 'gallery',
        status: 'pass',
        aiClass: 'Normal',
        scores: { benign: 0.082, malignant: 0.035, normal: 0.883 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
    ],
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
    notes: 'Khối đặc bờ tua gai kích thước 22mm thùy dưới phổi trái, nghi ngờ tiến triển ác tính.',
    notesSavedAt: '15/10/2026 16:15',
    images: [
      {
        id: 'img-3-1',
        index: 1,
        sliceNumber: 35,
        source: 'gallery',
        status: 'pass',
        aiClass: 'Malignant',
        scores: { benign: 0.098, malignant: 0.841, normal: 0.061 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
      {
        id: 'img-3-2',
        index: 2,
        sliceNumber: 36,
        source: 'gallery',
        status: 'fail',
        scores: undefined,
        hasGradCam: false,
        failReason: 'Không thể phân tích ảnh này. Vui lòng thử lại hoặc kiểm tra thông báo lỗi.',
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
    ],
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
    notes: 'Theo dõi nốt vôi hóa cũ.',
    notesSavedAt: '10/10/2026 09:30',
    images: [
      {
        id: 'img-4-1',
        index: 1,
        sliceNumber: 15,
        source: 'gallery',
        status: 'pass',
        aiClass: 'Benign',
        scores: { benign: 0.784, malignant: 0.126, normal: 0.09 },
        hasGradCam: true,
        mockWatermark: 'ẢNH GIẢ LẬP',
      },
    ],
    isMock: true,
  },
];

// Khởi tạo state trong bộ nhớ phiên
let patientsStore: MockPatient[] = [...INITIAL_PATIENTS];
let casesStore: MockCase[] = [...INITIAL_CASES];
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

export const subscribeDoctorStore = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getMockPatients = (): MockPatient[] => {
  return patientsStore.filter((p) => !p.isTrashed);
};

export const getMockCases = (): MockCase[] => {
  return casesStore.filter((c) => !c.isTrashed);
};

export const findPatientById = (id: string): MockPatient | undefined => {
  return patientsStore.find((p) => p.id === id && !p.isTrashed);
};

export const findPatientByCode = (code: string): MockPatient | undefined => {
  return patientsStore.find(
    (p) => p.code.trim().toLowerCase() === code.trim().toLowerCase() && !p.isTrashed,
  );
};

export const findCaseById = (id: string): MockCase | undefined => {
  return casesStore.find((c) => c.id === id && !c.isTrashed);
};

export const getCasesByPatientId = (patientId: string): MockCase[] => {
  return casesStore.filter((c) => c.patientId === patientId && !c.isTrashed);
};

export const addMockPatient = (
  patientData: Omit<
    MockPatient,
    'id' | 'caseCount' | 'lastCaseDate' | 'hasDraftCase' | 'syncStatus' | 'isMock'
  >,
): MockPatient => {
  const newPatient: MockPatient = {
    ...patientData,
    id: `p-${Date.now()}`,
    caseCount: 0,
    lastCaseDate: 'Hôm nay',
    hasDraftCase: false,
    syncStatus: 'pending',
    isMock: true,
  };
  patientsStore = [newPatient, ...patientsStore];
  notify();
  return newPatient;
};

export const updateMockPatient = (
  patientId: string,
  data: Partial<
    Omit<MockPatient, 'id' | 'code' | 'caseCount' | 'lastCaseDate' | 'hasDraftCase' | 'isMock'>
  >,
): MockPatient | null => {
  let updatedPatient: MockPatient | null = null;
  patientsStore = patientsStore.map((p) => {
    if (p.id === patientId) {
      updatedPatient = {
        ...p,
        ...data,
      };
      return updatedPatient;
    }
    return p;
  });

  if (updatedPatient) {
    notify();
  }
  return updatedPatient;
};

export const createMockCaseForPatient = (patient: MockPatient): MockCase => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${year}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newCase: MockCase = {
    id: `c-${Date.now()}`,
    caseCode: `CA-${year}-${randomNum}`,
    patientId: patient.id,
    patientName: patient.fullName,
    patientCode: patient.code,
    captureDate: dateStr,
    status: 'DRAFT',
    imageCount: 0,
    syncStatus: 'pending',
    notes: '',
    notesSavedAt: `${dateStr} ${timeStr}`,
    images: [],
    isMock: true,
  };

  casesStore = [newCase, ...casesStore];

  // Cập nhật số ca của bệnh nhân
  patientsStore = patientsStore.map((p) => {
    if (p.id === patient.id) {
      return {
        ...p,
        caseCount: p.caseCount + 1,
        lastCaseDate: dateStr,
        hasDraftCase: true,
      };
    }
    return p;
  });

  notify();
  return newCase;
};

export const updateCaseNotes = (caseId: string, notes: string): boolean => {
  let found = false;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  casesStore = casesStore.map((c) => {
    if (c.id === caseId) {
      found = true;
      return {
        ...c,
        notes,
        notesSavedAt: `${dateStr} ${timeStr}`,
      };
    }
    return c;
  });

  if (found) notify();
  return found;
};

export const addImageToCase = (
  caseId: string,
  source: 'gallery' | 'camera',
  initialStatus: CTImageStatus = 'mock',
  extraData?: {
    uri?: string;
    filePath?: string;
    originalFileName?: string;
  },
): MockCTImage | null => {
  let newImage: MockCTImage | null = null;
  casesStore = casesStore.map((c) => {
    if (c.id === caseId) {
      const nextIndex = c.images.length + 1;
      newImage = {
        id: `img-${caseId}-${nextIndex}-${Date.now()}`,
        index: nextIndex,
        sliceNumber: 30 + nextIndex,
        source,
        status: initialStatus,
        uri: extraData?.uri,
        filePath: extraData?.filePath,
        originalFileName: extraData?.originalFileName,
        aiClass: initialStatus === 'pending' ? undefined : 'Benign',
        scores:
          initialStatus === 'pending'
            ? undefined
            : { benign: 0.725, malignant: 0.185, normal: 0.09 },
        hasGradCam: initialStatus !== 'pending',
        mockWatermark: initialStatus === 'pending' ? undefined : 'ẢNH GIẢ LẬP',
      };
      return {
        ...c,
        imageCount: nextIndex,
        images: [...c.images, newImage],
      };
    }
    return c;
  });

  if (newImage) notify();
  return newImage;
};

export const completeCase = (caseId: string): { success: boolean; reason?: string } => {
  const target = casesStore.find((c) => c.id === caseId);
  if (!target) return { success: false, reason: 'Không tìm thấy ca bệnh.' };

  // BR-CASE-01: Hoàn tất yêu cầu >= 1 ảnh và 0 ảnh RUNNING
  if (target.images.length === 0) {
    return {
      success: false,
      reason: 'Cần ít nhất 1 ảnh để hoàn tất ca bệnh (BR-CASE-01).',
    };
  }

  const hasRunning = target.images.some((img) => img.status === 'running');
  if (hasRunning) {
    return {
      success: false,
      reason: 'Đang phân tích ảnh — vui lòng chờ xong hoặc hủy trước khi hoàn tất (BR-CASE-01).',
    };
  }

  const hasFail = target.images.some((img) => img.status === 'fail' || img.status === 'passNoCam');
  const finalStatus = hasFail ? 'PARTIAL' : 'COMPLETED';

  casesStore = casesStore.map((c) => {
    if (c.id === caseId) {
      return {
        ...c,
        status: finalStatus,
        isPartial: hasFail,
      };
    }
    return c;
  });

  // Cập nhật trạng thái hasDraftCase của bệnh nhân
  const remainingDrafts = casesStore.filter(
    (c) => c.patientId === target.patientId && c.status === 'DRAFT' && !c.isTrashed,
  );
  patientsStore = patientsStore.map((p) => {
    if (p.id === target.patientId) {
      return {
        ...p,
        hasDraftCase: remainingDrafts.length > 0,
      };
    }
    return p;
  });

  notify();
  return { success: true };
};

export const trashPatient = (patientId: string): boolean => {
  let found = false;
  patientsStore = patientsStore.map((p) => {
    if (p.id === patientId) {
      found = true;
      return { ...p, isTrashed: true };
    }
    return p;
  });

  // Kéo theo xóa mềm các ca của bệnh nhân (BR-DEL-01 / Q-23 đề xuất A)
  casesStore = casesStore.map((c) => {
    if (c.patientId === patientId) {
      return { ...c, isTrashed: true };
    }
    return c;
  });

  if (found) notify();
  return found;
};

export const trashCase = (caseId: string): boolean => {
  let found = false;
  let targetPatientId = '';
  casesStore = casesStore.map((c) => {
    if (c.id === caseId) {
      found = true;
      targetPatientId = c.patientId;
      return { ...c, isTrashed: true };
    }
    return c;
  });

  if (found && targetPatientId) {
    const activeCases = casesStore.filter((c) => c.patientId === targetPatientId && !c.isTrashed);
    const hasDraft = activeCases.some((c) => c.status === 'DRAFT');
    patientsStore = patientsStore.map((p) => {
      if (p.id === targetPatientId) {
        return {
          ...p,
          caseCount: activeCases.length,
          hasDraftCase: hasDraft,
        };
      }
      return p;
    });
    notify();
  }
  return found;
};

export const resetDoctorStore = (): void => {
  patientsStore = [...INITIAL_PATIENTS];
  casesStore = [...INITIAL_CASES];
  notify();
};

export const MOCK_PATIENTS = INITIAL_PATIENTS;
export const MOCK_CASES = INITIAL_CASES;

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
