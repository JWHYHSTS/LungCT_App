import { NativeModules } from 'react-native';

const PipelineModule = NativeModules.LungCtPipelineModule || NativeModules.LungCtPipeline;

/**
 * Tiện ích xóa tệp an toàn trong bộ nhớ thiết bị Android.
 * - Gọi Native Module LungCtPipelineModule.deleteLocalFile (C++/Java File.delete)
 * - Tự động bỏ qua lỗi và không bao giờ ném Exception gây gián đoạn UI.
 */
export async function deletePhysicalFile(filePath?: string | null): Promise<boolean> {
  if (!filePath) return false;
  try {
    if (PipelineModule?.deleteLocalFile) {
      return await PipelineModule.deleteLocalFile(filePath);
    }
  } catch (err) {
    console.warn('[deletePhysicalFile] Không thể xóa tệp vật lý:', err);
  }
  return false;
}

/**
 * Đọc tệp cục bộ sang chuỗi Base64 qua Native Module (hoặc Node fs trong môi trường test).
 * Phục vụ nhúng ảnh trực tiếp vào HTML xuất báo cáo PDF để WebView không bị chặn bởi file:// scheme.
 */
export async function readFileAsBase64(filePath?: string | null): Promise<string> {
  if (!filePath) return '';
  try {
    if (PipelineModule?.readFileAsBase64) {
      return await PipelineModule.readFileAsBase64(filePath);
    }
    // Fallback cho môi trường Node / Jest testing
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      const cleanPath = filePath.startsWith('file://') ? filePath.substring(7) : filePath;
      if (fs.existsSync(cleanPath)) {
        return fs.readFileSync(cleanPath).toString('base64');
      }
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('[readFileAsBase64] Không thể đọc tệp sang Base64:', err);
  }
  return '';
}

/**
 * Sao chép tệp PDF từ cache tạm thời sang vùng lưu trữ vĩnh viễn (dicom_reports)
 */
export async function persistPdfFile(
  cacheUri: string,
  targetFileName: string,
): Promise<string> {
  if (!cacheUri) return '';
  try {
    if (PipelineModule?.persistPdfFile) {
      return await PipelineModule.persistPdfFile(cacheUri, targetFileName);
    }
  } catch (err) {
    console.warn('[persistPdfFile] Không thể lưu tệp PDF vào dicom_reports:', err);
  }
  return cacheUri;
}

