import React, { createContext, useContext, useState } from 'react';

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
   * Đăng nhập giả lập để demo UI (UI-05).
   * TODO(AUTH-02): Thay thế bằng xác thực thật qua backend JWT / Keystore.
   */
  login: (email: string) => Promise<{ success: boolean; status?: 'active' | 'pending' | 'locked' }>;
  logout: () => void;
  /**
   * Đăng ký tài khoản bác sĩ giả lập.
   * Chuyển trạng thái sang PENDING (Chờ duyệt).
   */
  registerDoctor: (data: {
    fullName: string;
    email: string;
    workplace: string;
    specialty: string;
  }) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // TODO(AUTH-02): Triển khai xác thực thật qua AuthService / SecureStore.
  const login = async (email: string) => {
    const trimmed = email.trim().toLowerCase();

    // Giả lập trạng thái tài khoản theo đặc tả UI-05
    if (trimmed.includes('pending')) {
      return { success: false, status: 'pending' as const };
    }
    if (trimmed.includes('locked')) {
      return { success: false, status: 'locked' as const };
    }

    // QUY TẮC MÔ PHỎNG (MOCK DEMO ONLY):
    // Phân quyền theo từ khóa email chỉ dùng tạm trong môi trường phát triển (UI-05) để phục vụ kiểm thử hai giao diện.
    // TUYỆT ĐỐI KHÔNG dùng quy tắc email.includes('admin') trong backend/xác thực thật (AUTH-02);
    // vai trò người dùng trong hệ thống thật sẽ do Backend API trả về thông qua JWT claim / database role.
    const role: UserRole = trimmed.includes('admin') ? 'admin' : 'doctor';
    const profile: UserProfile = {
      id: trimmed.includes('admin') ? 'usr-admin-01' : 'usr-doc-01',
      email: trimmed,
      fullName: trimmed.includes('admin') ? 'Quản trị viên' : 'BS. Nguyễn Minh An',
      role,
      workplace: 'Bệnh viện Thực hành A',
      specialty: 'Chẩn đoán hình ảnh',
      status: 'active',
    };

    setUser(profile);
    return { success: true, status: 'active' as const };
  };

  const logout = () => {
    setUser(null);
  };

  const registerDoctor = async (data: {
    fullName: string;
    email: string;
    workplace: string;
    specialty: string;
  }) => {
    // Demo chuyển sang chờ duyệt (SCR-A04)
    return { success: true };
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
