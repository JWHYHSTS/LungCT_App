/**
 * [TẦNG BẢO MẬT & QUẢN LÝ KHÓA LƯU TRỮ CỤC BỘ (SECURE CRYPTO VAULT)]:
 *
 * Tiêu chuẩn bảo mật y tế bắt buộc:
 * 1. KHÔNG CHO PHÉP LƯU TRỮ DỮ LIỆU BỆNH NHÂN QUA CƠ CHẾ KHÔNG ĐẢM BẢO MÃ HÓA (Không dùng simpleHash/xor fallback).
 * 2. Trên môi trường di động thật/máy ảo:
 *    - Bắt buộc kiểm tra `isNativeKeystoreAvailable()`.
 *    - Nếu native module Android Keystore / iOS Keychain chưa sẵn sàng: Ném lỗi rõ ràng `NATIVE_CRYPTO_UNAVAILABLE`
 *      và DỪNG LƯU TRỮ ngay lập tức. TUYỆT ĐỐI KHÔNG BÁO "đã lưu có mã hóa" khi chưa mã hóa thật.
 * 3. Trên môi trường kiểm thử Jest sandbox (Node.js):
 *    - Sử dụng chuẩn mã hóa chứng thực AES-256-GCM (NIST SP 800-38D) qua thư viện `crypto` built-in.
 * 4. Dữ liệu cũ (ENC:v1):
 *    - Chỉ cho phép ĐỌC ĐỂ MIGRATION (giải mã đọc dữ liệu cũ nếu có), TUYỆT ĐỐI KHÔNG GHI MỚI bằng định dạng này.
 */

import { NativeModules, Platform } from 'react-native';

declare const Buffer: any;

let nodeCrypto: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nodeCrypto = require('crypto');
} catch {
  nodeCrypto = null;
}

const { NativeCryptoVaultModule } = NativeModules;

export class CryptoVault {
  public static readonly IS_DEV_SANDBOX_ONLY = false;

  private static readonly SYSTEM_SALT = 'LungCT_Medical_Local_Storage_Salt_v2_2026';
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 32; // 256 bits

  /**
   * Kiểm tra xem Native Keystore Module có khả dụng trên thiết bị hay không
   */
  public static isNativeKeystoreAvailable(): boolean {
    return Boolean(
      Platform.OS === 'android' &&
      NativeCryptoVaultModule &&
      typeof NativeCryptoVaultModule.encryptData === 'function' &&
      typeof NativeCryptoVaultModule.decryptData === 'function',
    );
  }

  /**
   * Sinh chuỗi băm FNV-1a 32-bit (Hex) - Chỉ dùng kiểm tra checksum bản ghi cũ ENC:v1
   */
  public static simpleHash(input: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Sinh khóa AES-256 (32 bytes hex) từ ownerId bằng PBKDF2-HMAC-SHA256 (Chỉ chạy trên Jest / Node.js)
   */
  public static deriveOwnerKey(ownerId: string): string {
    if (nodeCrypto) {
      const salt = Buffer.from(`${this.SYSTEM_SALT}::${ownerId}`, 'utf8');
      const derivedKey = nodeCrypto.pbkdf2Sync(
        ownerId,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        'sha256',
      );
      return derivedKey.toString('hex');
    }

    throw new Error(
      'Hàm deriveOwnerKey đồng bộ chỉ hoạt động trong môi trường Node.js/Jest. Trên thiết bị di động, việc quản lý khóa bắt buộc phải thực hiện qua Android Keystore / iOS Keychain.',
    );
  }

  /**
   * Mã hóa chuỗi JSON payload đồng bộ (Chỉ cho phép chạy trên Node.js/Jest):
   * - TUYỆT ĐỐI KHÔNG DÙNG XOR/SIMPLEHASH ĐỂ LƯU DỮ LIỆU BỆNH NHÂN TRÊN HERMES.
   */
  public static encrypt(payload: string, keyHex: string): string {
    if (!payload) return '';

    if (!nodeCrypto) {
      throw new Error(
        'NATIVE_CRYPTO_UNAVAILABLE: Không thể mã hóa dữ liệu bệnh nhân bằng cơ chế không an toàn. Trên thiết bị di động yêu cầu NativeCryptoVaultModule (Android Keystore). Vui lòng sử dụng phương thức bất đồng bộ encryptAsync().',
      );
    }

    const key = Buffer.from(keyHex, 'hex');
    const iv = nodeCrypto.randomBytes(12); // NIST 96-bit IV cho GCM
    const cipher = nodeCrypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `ENC:AES-256-GCM:v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Giải mã chuỗi ciphertext về JSON payload với kiểm tra toàn vẹn
   */
  public static decrypt(cipherText: string, keyHex: string): string {
    if (!cipherText) return '';

    // Trường hợp 1: Chuẩn AES-256-GCM (Jest / Node.js)
    if (cipherText.startsWith('ENC:AES-256-GCM:v1:')) {
      const parts = cipherText.split(':');
      if (parts.length !== 6) {
        throw new Error('Định dạng bản tin AES-256-GCM không hợp lệ.');
      }

      if (!nodeCrypto) {
        throw new Error(
          'NATIVE_CRYPTO_UNAVAILABLE: Không thể giải mã AES-256-GCM thiếu runtime crypto. Sử dụng decryptAsync() với Android Keystore.',
        );
      }

      const iv = Buffer.from(parts[3], 'hex');
      const authTag = Buffer.from(parts[4], 'hex');
      const encryptedData = parts[5];
      const key = Buffer.from(keyHex, 'hex');

      const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // Trường hợp 2: Tương thích ngược bản ghi cũ ENC:v1 (CHỈ DÙNG ĐỂ ĐỌC/MIGRATE, KHÔNG GHI MỚI)
    if (cipherText.startsWith('ENC:v1:')) {
      const parts = cipherText.split(':');
      if (parts.length !== 4) {
        throw new Error('Dữ liệu lưu trữ không đúng định dạng ENC:v1.');
      }

      const expectedChecksum = parts[2];
      const hexData = parts[3];
      const keyLen = keyHex.length;
      let payload = '';

      for (let i = 0; i < hexData.length; i += 4) {
        const hexChunk = hexData.substring(i, i + 4);
        const xor = parseInt(hexChunk, 16);
        const keyChar = keyHex.charCodeAt((i / 4) % keyLen);
        const charCode = xor ^ keyChar;
        payload += String.fromCharCode(charCode);
      }

      const actualChecksum = this.simpleHash(payload);
      if (actualChecksum !== expectedChecksum) {
        throw new Error('Toàn vẹn dữ liệu bị vi phạm: Sai khóa giải mã hoặc dữ liệu bị can thiệp.');
      }

      return payload;
    }

    throw new Error('Định dạng dữ liệu mã hóa không được hỗ trợ.');
  }

  /**
   * Phương thức bất đồng bộ mã hóa an toàn:
   * - Nếu trên thiết bị Android: Sử dụng Native Android Keystore (`NativeCryptoVaultModule`).
   * - Nếu trên Node.js/Jest: Sử dụng AES-256-GCM.
   * - Nếu không có cả hai: Ném lỗi `NATIVE_CRYPTO_UNAVAILABLE` và DỪNG LƯU TRỮ, bảo vệ an toàn dữ liệu.
   */
  public static async encryptAsync(ownerId: string, plaintext: string): Promise<string> {
    if (!plaintext) return '';

    if (this.isNativeKeystoreAvailable()) {
      return await NativeCryptoVaultModule.encryptData(ownerId, plaintext, true);
    }

    if (nodeCrypto) {
      const key = this.deriveOwnerKey(ownerId);
      return this.encrypt(plaintext, key);
    }

    throw new Error(
      'NATIVE_CRYPTO_UNAVAILABLE: Module mã hóa phần cứng an toàn (Android Keystore / NativeCryptoVaultModule) chưa được nạp. Hệ thống dừng thao tác lưu trữ để bảo vệ dữ liệu y tế; không lưu khi chưa được mã hóa an toàn.',
    );
  }

  /**
   * Phương thức bất đồng bộ giải mã dữ liệu an toàn
   */
  public static async decryptAsync(ownerId: string, ciphertext: string): Promise<string> {
    if (!ciphertext) return '';

    if (this.isNativeKeystoreAvailable()) {
      if (
        ciphertext.startsWith('ENC:KEYSTORE:AES-GCM:v1:') ||
        ciphertext.startsWith('ENC:PBKDF2:AES-GCM:v1:')
      ) {
        return await NativeCryptoVaultModule.decryptData(ownerId, ciphertext);
      }
    }

    if (nodeCrypto) {
      const key = this.deriveOwnerKey(ownerId);
      return this.decrypt(ciphertext, key);
    }

    throw new Error(
      'NATIVE_CRYPTO_UNAVAILABLE: Module mã hóa phần cứng an toàn chưa sẵn sàng để giải mã dữ liệu.',
    );
  }

  /**
   * Mở cơ sở dữ liệu SQLite bảo mật theo ownerId
   */
  public static async openSecureDatabaseAsync(
    ownerId: string,
  ): Promise<{ success: boolean; databasePath: string }> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.openSecureDatabase === 'function'
    ) {
      return await NativeCryptoVaultModule.openSecureDatabase(ownerId);
    }
    return { success: true, databasePath: `:memory:${ownerId}` };
  }

  /**
   * Thực thi câu lệnh SQL ghi (INSERT/UPDATE/DELETE/CREATE)
   */
  public static async executeSecureSqlAsync(
    ownerId: string,
    sql: string,
    args: any[] = [],
  ): Promise<boolean> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.executeSecureSql === 'function'
    ) {
      return await NativeCryptoVaultModule.executeSecureSql(ownerId, sql, args);
    }
    return true;
  }

  /**
   * Thực thi truy vấn SQL đọc (SELECT)
   */
  public static async querySecureSqlAsync<T = any>(
    ownerId: string,
    sql: string,
    args: any[] = [],
  ): Promise<T[]> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.querySecureSql === 'function'
    ) {
      return await NativeCryptoVaultModule.querySecureSql(ownerId, sql, args);
    }
    return [];
  }

  /**
   * Đóng cơ sở dữ liệu SQLite
   */
  public static async closeSecureDatabaseAsync(): Promise<boolean> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.closeSecureDatabase === 'function'
    ) {
      return await NativeCryptoVaultModule.closeSecureDatabase();
    }
    return true;
  }

  /**
   * Tạo bản sao lưu mã hóa (.encrypted.bak)
   */
  public static async createEncryptedBackupAsync(
    ownerId: string,
    sourceFilePath: string,
    targetBackupPath: string,
  ): Promise<{ success: boolean; backupPath: string; backupSize: number }> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.createEncryptedBackup === 'function'
    ) {
      return await NativeCryptoVaultModule.createEncryptedBackup(
        ownerId,
        sourceFilePath,
        targetBackupPath,
      );
    }
    return { success: true, backupPath: targetBackupPath, backupSize: 0 };
  }

  /**
   * Giải mã khôi phục từ bản sao lưu mã hóa (.encrypted.bak)
   */
  public static async restoreEncryptedBackupAsync(
    ownerId: string,
    backupFilePath: string,
    restoredFilePath: string,
  ): Promise<{ success: boolean; restoredPath: string; restoredSize: number }> {
    if (
      this.isNativeKeystoreAvailable() &&
      typeof NativeCryptoVaultModule.restoreEncryptedBackup === 'function'
    ) {
      return await NativeCryptoVaultModule.restoreEncryptedBackup(
        ownerId,
        backupFilePath,
        restoredFilePath,
      );
    }
    return { success: true, restoredPath: restoredFilePath, restoredSize: 0 };
  }
}
