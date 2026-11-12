import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../../services/firebase/firebaseConfig';
import {
  firebaseLogin,
  firebaseRegisterDoctor,
  firebaseLogout,
  firebaseResetPassword,
  RegisterDoctorParams,
} from '../../../services/firebase/authService';
import { resetDoctorStore } from '../../../mocks/doctorMocks';

export type UserRole = 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  workplace?: string;
  specialty?: string;
  status: 'active' | 'pending' | 'locked';
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  /**
   * Đăng nhập người dùng qua Firebase Authentication & Cloud Firestore.
   * Phân quyền thực tế và trạng thái phê duyệt (active/pending/locked)
   * được kiểm soát nghiêm ngặt từ Firestore; không gán admin theo từ khóa email.
   */
  login: (
    email: string,
    password?: string,
  ) => Promise<{ success: boolean; status?: 'active' | 'pending' | 'locked'; error?: string }>;
  logout: () => Promise<void>;
  /**
   * Đăng ký tài khoản bác sĩ mới trên Firebase Authentication.
   * Trạng thái ban đầu bắt buộc là 'pending' (Chờ duyệt) theo đặc tả SCR-A04.
   */
  registerDoctor: (data: RegisterDoctorParams) => Promise<{ success: boolean; error?: string }>;
  /**
   * Gửi liên kết đặt lại mật khẩu qua email người dùng bằng Firebase Auth.
   */
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Lắng nghe trạng thái phiên đăng nhập Firebase khi khởi chạy app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        return;
      }

      try {
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const docData = userSnap.data();
          const role: UserRole = docData.role === 'admin' ? 'admin' : 'doctor';
          const status: 'active' | 'pending' | 'locked' =
            docData.status === 'locked'
              ? 'locked'
              : docData.status === 'pending'
                ? 'pending'
                : 'active';

          if (status === 'active') {
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              fullName: docData.fullName || fbUser.displayName || 'Bác sĩ',
              role,
              workplace: docData.workplace,
              specialty: docData.specialty,
              status: 'active',
            });
            return;
          }
        }
        // Nếu chưa được duyệt hoặc bị khóa, không duy trì phiên hoạt động
        await firebaseLogout();
        setUser(null);
      } catch {
        // Lỗi kết nối đám mây, giữ nguyên trạng thái phiên hiện tại
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    if (!isOnline) {
      return {
        success: false,
        error: 'Thiết bị đang ở chế độ ngoại tuyến. Vui lòng kết nối Internet để xác thực tài khoản.',
      };
    }

    const res = await firebaseLogin(email, password);
    if (res.success && res.profile) {
      setUser(res.profile);
      return { success: true, status: 'active' as const };
    }

    return {
      success: false,
      status: res.status,
      error: res.error,
    };
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } finally {
      resetDoctorStore();
      setUser(null);
    }
  };

  const registerDoctor = async (data: RegisterDoctorParams) => {
    if (!isOnline) {
      return {
        success: false,
        error: 'Thiết bị đang ở chế độ ngoại tuyến. Không thể đăng ký tài khoản mới.',
      };
    }

    const res = await firebaseRegisterDoctor(data);
    return {
      success: res.success,
      error: res.error,
    };
  };

  const resetPassword = async (targetEmail: string) => {
    if (!isOnline) {
      return false;
    }
    return await firebaseResetPassword(targetEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null && user.status === 'active',
        isOnline,
        setIsOnline,
        login,
        logout,
        registerDoctor,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
