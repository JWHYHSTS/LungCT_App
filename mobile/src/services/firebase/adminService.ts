import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import {
  AdminDoctorAccount,
  AdminOverviewStats,
  DoctorAccountStatus,
} from '../../mocks/adminMocks';

/**
 * Lắng nghe danh sách toàn bộ tài khoản bác sĩ theo thời gian thực từ Cloud Firestore.
 * Chỉ tài khoản Admin mới có quyền đọc (tuân thủ Security Rules: isAdmin()).
 */
export function subscribeDoctorAccounts(
  onUpdate: (doctors: AdminDoctorAccount[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = collection(firestore, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const doctors: AdminDoctorAccount[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role === 'doctor') {
          doctors.push({
            id: docSnap.id,
            email: data.email || '',
            fullName: data.fullName || '',
            workplace: data.workplace || '',
            specialty: data.specialty || '',
            status: (data.status as DoctorAccountStatus) || 'pending',
            registeredAt: data.createdAt || new Date().toISOString(),
            lockReason: data.lockReason,
          });
        }
      });
      onUpdate(doctors);
    },
    (err) => {
      console.error('[adminService] Error fetching doctors from Firestore:', err);
      if (onError) onError(err);
    },
  );
}

/**
 * Lấy chi tiết 1 tài khoản bác sĩ theo ID từ Cloud Firestore.
 */
export async function getDoctorAccountById(doctorId: string): Promise<AdminDoctorAccount | null> {
  try {
    const userRef = doc(firestore, 'users', doctorId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      email: data.email || '',
      fullName: data.fullName || '',
      workplace: data.workplace || '',
      specialty: data.specialty || '',
      status: (data.status as DoctorAccountStatus) || 'pending',
      registeredAt: data.createdAt || new Date().toISOString(),
      lockReason: data.lockReason,
    };
  } catch (err) {
    console.error('[adminService] Error getting doctor by ID:', err);
    return null;
  }
}

/**
 * Admin duyệt tài khoản bác sĩ: Chuyển trạng thái sang 'active'.
 */
export async function approveDoctorInFirestore(doctorId: string): Promise<void> {
  const userRef = doc(firestore, 'users', doctorId);
  await updateDoc(userRef, {
    status: 'active',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Admin khóa tài khoản bác sĩ: Chuyển trạng thái sang 'locked' kèm lý do.
 */
export async function lockDoctorInFirestore(doctorId: string, reason: string): Promise<void> {
  const userRef = doc(firestore, 'users', doctorId);
  await updateDoc(userRef, {
    status: 'locked',
    lockReason: reason,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Thống kê tổng hợp hệ thống cho Quản trị viên trực tiếp từ Cloud Firestore.
 * TUÂN THỦ BR-OWN-03: Chỉ tổng hợp số đếm ẩn danh (trạng thái tài khoản bác sĩ,
 * số ca hoàn tất và số lượng phân bố nhãn AI), tuyệt đối không trích xuất PII/PHI hay ảnh CT.
 */
export async function fetchAdminOverviewStatsFromFirestore(
  period: '7d' | '30d' | 'all',
): Promise<AdminOverviewStats> {
  let activeDoctors = 0;
  let pendingDoctors = 0;

  const doctorsQuery = query(collection(firestore, 'users'), where('role', '==', 'doctor'));
  const userSnaps = await getDocs(doctorsQuery);
  userSnaps.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status === 'active') activeDoctors += 1;
    else if (data.status === 'pending') pendingDoctors += 1;
  });

  let completedCases = 0;
  let analyzedImages = 0;
  const aiBreakdown = { benign: 0, malignant: 0, normal: 0 };

  const nowMs = Date.now();
  const days = period === '7d' ? 7 : 30;
  const thresholdMs = nowMs - days * 24 * 60 * 60 * 1000;

  const casesSnaps = await getDocs(collection(firestore, 'cases'));
  casesSnaps.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status === 'TRASHED') return;

    if (period !== 'all') {
      const scanMs = new Date(data.scanDate || data.updatedAt || data.createdAt).getTime();
      if (!isNaN(scanMs) && scanMs < thresholdMs) return;
    }

    if (data.status === 'COMPLETED') {
      completedCases += 1;
    }

    const summary = data.aiSummary;
    if (summary && typeof summary.analyzedCount === 'number') {
      analyzedImages += summary.analyzedCount;
      const counts = summary.labelCounts || {};
      aiBreakdown.benign += typeof counts.benign === 'number' ? counts.benign : 0;
      aiBreakdown.malignant += typeof counts.malignant === 'number' ? counts.malignant : 0;
      aiBreakdown.normal += typeof counts.normal === 'number' ? counts.normal : 0;
    }
  });

  return {
    period,
    activeDoctors,
    pendingDoctors,
    completedCases,
    analyzedImages,
    aiBreakdown,
  };
}

