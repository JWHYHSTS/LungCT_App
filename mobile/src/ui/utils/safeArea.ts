import { useSafeAreaInsets as useNativeSafeAreaInsets } from 'react-native-safe-area-context';

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_INSETS: EdgeInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * Safe wrapper quanh useSafeAreaInsets.
 * Trong môi trường test hoặc khi chưa có SafeAreaProvider, tự động fallback về { top: 0, right: 0, bottom: 0, left: 0 }
 * mà không gây văng Exception ("No safe area value available").
 */
export function useAppSafeAreaInsets(): EdgeInsets {
  try {
    return useNativeSafeAreaInsets();
  } catch {
    return DEFAULT_INSETS;
  }
}
