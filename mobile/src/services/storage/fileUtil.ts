import { NativeModules } from 'react-native';

/**
 * Tiện ích xóa tệp an toàn trong bộ nhớ thiết bị Android.
 * - Gọi Native Module LungCtPipeline.deleteLocalFile (C++/Java File.delete)
 * - Tự động bỏ qua lỗi và không bao giờ ném Exception gây gián đoạn UI.
 */
export async function deletePhysicalFile(filePath?: string | null): Promise<boolean> {
  if (!filePath) return false;
  try {
    if (NativeModules.LungCtPipeline?.deleteLocalFile) {
      return await NativeModules.LungCtPipeline.deleteLocalFile(filePath);
    }
  } catch (err) {
    console.warn('[deletePhysicalFile] Không thể xóa tệp vật lý:', err);
  }
  return false;
}
