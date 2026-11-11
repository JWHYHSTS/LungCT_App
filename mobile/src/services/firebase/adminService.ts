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
import { AdminDoctorAccount, DoctorAccountStatus } from '../../mocks/adminMocks';

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

