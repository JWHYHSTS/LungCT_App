import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { initializeAuth, getAuth } = FirebaseAuth;
// getReactNativePersistence được cung cấp bởi gói React Native của Firebase Auth
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRNPersistence = (FirebaseAuth as any).getReactNativePersistence;

/**
 * Cấu hình Firebase Client cho ứng dụng di động LungCT.
 * Khớp trực tiếp với project_id 'lungct1' và package 'com.anonymous.mobile'
 * theo tệp google-services.json.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyB8YFtuc3cfyEzF28JSJ90WRgV8BF6CwRE',
  authDomain: 'lungct1.firebaseapp.com',
  projectId: 'lungct1',
  storageBucket: 'lungct1.firebasestorage.app',
  messagingSenderId: '808040645362',
  appId: '1:808040645362:android:11584e94371054049ec66b',
};

// Khởi tạo hoặc lấy instance FirebaseApp duy nhất
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Authentication với cơ chế lưu phiên an toàn qua AsyncStorage trên React Native
let authInstance: FirebaseAuth.Auth;
try {
  authInstance = initializeAuth(firebaseApp, {
    persistence: typeof getRNPersistence === 'function' ? getRNPersistence(AsyncStorage) : undefined,
  });
} catch {
  // Nếu đã được khởi tạo trong môi trường hot-reload, lấy instance hiện tại
  authInstance = getAuth(firebaseApp);
}

export const auth: FirebaseAuth.Auth = authInstance;

// Khởi tạo Cloud Firestore instance
export const firestore: Firestore = getFirestore(firebaseApp);
