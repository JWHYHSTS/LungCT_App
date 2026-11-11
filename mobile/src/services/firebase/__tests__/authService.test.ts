import {
  firebaseLogin,
  firebaseRegisterDoctor,
  firebaseLogout,
  firebaseResetPassword,
} from '../authService';
import * as fbAuth from 'firebase/auth';
import * as fbFirestore from 'firebase/firestore';

jest.mock('../firebaseConfig', () => ({
  auth: { currentUser: null },
  firestore: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('Firebase Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. firebaseRegisterDoctor tạo tài khoản trên Auth và lưu hồ sơ pending trên Firestore', async () => {
    (fbAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'uid-test-123',
        email: 'doc.dang@example.com',
      },
    });
    (fbFirestore.doc as jest.Mock).mockReturnValue('users/uid-test-123');
    (fbFirestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    (fbAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const result = await firebaseRegisterDoctor({
      fullName: 'Dương Hải Đăng',
      email: 'doc.dang@example.com',
      password: 'password123',
      workplace: 'Bệnh viện ĐH Sư phạm',
      specialty: 'Chẩn đoán hình ảnh',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('pending');
    expect(fbAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'doc.dang@example.com',
      'password123',
    );
    expect(fbFirestore.setDoc).toHaveBeenCalledWith(
      'users/uid-test-123',
      expect.objectContaining({
        id: 'uid-test-123',
        email: 'doc.dang@example.com',
        fullName: 'Dương Hải Đăng',
        role: 'doctor',
        status: 'pending',
      }),
    );
    // Bắt buộc signOut ngay lập tức vì tài khoản còn ở trạng thái pending
    expect(fbAuth.signOut).toHaveBeenCalled();
  });

  test('2. firebaseLogin từ chối truy cập và đăng xuất nếu tài khoản đang pending', async () => {
    (fbAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'uid-test-pending',
        email: 'pending@example.com',
      },
    });
    (fbFirestore.doc as jest.Mock).mockReturnValue('users/uid-test-pending');
    (fbFirestore.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        fullName: 'Bác sĩ A',
        role: 'doctor',
        status: 'pending',
      }),
    });
    (fbAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const result = await firebaseLogin('pending@example.com', 'password123');

    expect(result.success).toBe(false);
    expect(result.status).toBe('pending');
    expect(fbAuth.signOut).toHaveBeenCalled();
  });

  test('3. firebaseLogin từ chối truy cập và đăng xuất nếu tài khoản bị locked', async () => {
    (fbAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'uid-test-locked',
        email: 'locked@example.com',
      },
    });
    (fbFirestore.doc as jest.Mock).mockReturnValue('users/uid-test-locked');
    (fbFirestore.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        fullName: 'Bác sĩ B',
        role: 'doctor',
        status: 'locked',
      }),
    });
    (fbAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const result = await firebaseLogin('locked@example.com', 'password123');

    expect(result.success).toBe(false);
    expect(result.status).toBe('locked');
    expect(fbAuth.signOut).toHaveBeenCalled();
  });

  test('4. firebaseLogin thành công khi tài khoản active', async () => {
    (fbAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'uid-test-active',
        email: 'active@example.com',
      },
    });
    (fbFirestore.doc as jest.Mock).mockReturnValue('users/uid-test-active');
    (fbFirestore.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        fullName: 'Bác sĩ C',
        role: 'doctor',
        status: 'active',
        workplace: 'BV Bạch Mai',
        specialty: 'Hô hấp',
      }),
    });

    const result = await firebaseLogin('active@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.status).toBe('active');
    expect(result.profile?.fullName).toBe('Bác sĩ C');
    expect(result.profile?.role).toBe('doctor');
    expect(fbAuth.signOut).not.toHaveBeenCalled();
  });

  test('5. firebaseLogout gọi signOut', async () => {
    (fbAuth.signOut as jest.Mock).mockResolvedValue(undefined);
    await firebaseLogout();
    expect(fbAuth.signOut).toHaveBeenCalled();
  });

  test('6. firebaseResetPassword gửi email đặt lại mật khẩu', async () => {
    (fbAuth.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);
    const success = await firebaseResetPassword('forgot@example.com');
    expect(success).toBe(true);
    expect(fbAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'forgot@example.com',
    );
  });
});

