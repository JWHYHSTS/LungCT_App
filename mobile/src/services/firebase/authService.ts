import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';
import { UserProfile, UserRole } from '../../features/auth/context/AuthContext';

export interface RegisterDoctorParams {
  fullName: string;
  email: string;
  password?: string;
  workplace: string;
  specialty: string;
}

export interface AuthActionResult {
  success: boolean;
  status?: 'active' | 'pending' | 'locked';
  error?: string;
  profile?: UserProfile;
}

/**
 * Đăng nhập bằng Firebase Authentication và kiểm tra trạng thái phê duyệt trong Cloud Firestore.
 */
export async function firebaseLogin(
  email: string,
  password?: string,
): Promise<AuthActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  const pwd = password || 'password123';

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, pwd);
    const fbUser = credential.user;

    // Đọc hồ sơ người dùng từ Cloud Firestore (bảo vệ phân quyền)
    const userDocRef = doc(firestore, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // Trường hợp tài khoản tồn tại trên Auth nhưng chưa có doc Firestore
      // Tạo doc mặc định ở trạng thái Chờ duyệt (pending)
      const fallbackProfile: UserProfile = {
        id: fbUser.uid,
        email: cleanEmail,
        fullName: fbUser.displayName || 'Bác sĩ',
        role: 'doctor',
        status: 'pending',
      };
      await setDoc(userDocRef, {
        ...fallbackProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await signOut(auth);
      return { success: false, status: 'pending' };
    }

    const docData = userSnap.data();
    const role: UserRole = docData.role === 'admin' ? 'admin' : 'doctor';
    const status: 'active' | 'pending' | 'locked' =
      docData.status === 'locked'
        ? 'locked'
        : docData.status === 'pending'
          ? 'pending'
          : 'active';

    const profile: UserProfile = {
      id: fbUser.uid,
      email: cleanEmail,
      fullName: docData.fullName || fbUser.displayName || 'Người dùng',
      role,
      workplace: docData.workplace,
      specialty: docData.specialty,
      status,
    };

    // Kiểm tra trạng thái tài khoản: Nếu chờ duyệt hoặc bị khóa -> Đăng xuất ngay
    if (status !== 'active') {
      await signOut(auth);
      return { success: false, status };
    }

    return { success: true, status: 'active', profile };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Đăng ký tài khoản bác sĩ trên Firebase Authentication.
 * Sau khi tạo Auth, lập tức ghi nhận hồ sơ vào Firestore với trạng thái 'pending' (Chờ duyệt).
 */
export async function firebaseRegisterDoctor(
  params: RegisterDoctorParams,
): Promise<AuthActionResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const pwd = params.password || 'password123';

  try {
    let fbUser;
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, pwd);
      fbUser = credential.user;
    } catch (authErr: unknown) {
      // Nếu email đã được tạo trên Auth trước đó (do lần bấm trước bị lỗi kết nối Firestore),
      // thử đăng nhập để hoàn tất ghi hồ sơ Firestore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((authErr as any)?.code === 'auth/email-already-in-use') {
        try {
          const credLogin = await signInWithEmailAndPassword(auth, cleanEmail, pwd);
          fbUser = credLogin.user;
          // Kiểm tra xem hồ sơ Firestore đã tồn tại chưa
          const existingSnap = await getDoc(doc(firestore, 'users', fbUser.uid));
          if (existingSnap.exists()) {
            await signOut(auth);
            return {
              success: false,
              error: 'Email này đã được đăng ký trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.',
            };
          }
        } catch {
          return {
            success: false,
            error: 'Email này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại mật khẩu hoặc đăng nhập.',
          };
        }
      } else {
        throw authErr;
      }
    }

    // Đảm bảo token xác thực đã sẵn sàng cho kết nối mạng của Firestore
    try {
      if (typeof fbUser.getIdToken === 'function') {
        await fbUser.getIdToken(true);
      }
    } catch {
      // Bỏ qua nếu môi trường test
    }

    // Cập nhật displayName trên Firebase Auth
    if (params.fullName) {
      try {
        await updateProfile(fbUser, { displayName: params.fullName });
      } catch {
        // Không chặn nếu updateProfile gặp trục trặc mạng nhỏ
      }
    }

    // Ghi nhận hồ sơ vào Cloud Firestore với trạng thái 'pending' (Bắt buộc duyệt trước khi dùng)
    const profile: UserProfile = {
      id: fbUser.uid,
      email: cleanEmail,
      fullName: params.fullName,
      role: 'doctor',
      workplace: params.workplace,
      specialty: params.specialty,
      status: 'pending',
    };

    const userDocRef = doc(firestore, 'users', fbUser.uid);

    // Cơ chế ghi hồ sơ an toàn với retry ngắn nếu token đang đồng bộ
    let writeSuccess = false;
    let lastWriteErr: unknown;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        if (typeof fbUser.getIdToken === 'function') {
          await fbUser.getIdToken(true);
        }
        await setDoc(userDocRef, {
          ...profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        writeSuccess = true;
        break;
      } catch (writeErr) {
        lastWriteErr = writeErr;
        // Đợi 500ms để Firebase Auth đồng bộ token sang Firestore transport
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!writeSuccess) {
      throw lastWriteErr;
    }

    // Đăng xuất ngay để tài khoản không được truy cập app trước khi Quản trị viên duyệt
    await signOut(auth);

    return { success: true, status: 'pending', profile };
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (err as any)?.code || '';
    let errorMsg = err instanceof Error ? err.message : String(err);

    if (code === 'auth/weak-password') {
      errorMsg = 'Mật khẩu quá yếu. Vui lòng đặt mật khẩu từ 6 ký tự trở lên.';
    } else if (code === 'auth/invalid-email') {
      errorMsg = 'Định dạng email không hợp lệ.';
    } else if (code === 'auth/email-already-in-use') {
      errorMsg = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
    } else if (errorMsg.includes('Missing or insufficient permissions')) {
      errorMsg = 'Hệ thống đang đồng bộ phân quyền. Vui lòng thử lại sau giây lát.';
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Đăng xuất khỏi Firebase Authentication.
 */
export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

/**
 * Gửi email đặt lại mật khẩu qua Firebase Authentication.
 */
export async function firebaseResetPassword(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return true;
  } catch {
    return false;
  }
}

