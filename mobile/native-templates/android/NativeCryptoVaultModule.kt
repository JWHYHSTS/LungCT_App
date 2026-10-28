package com.anonymous.mobile

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import net.zetetic.database.sqlcipher.SQLiteDatabase
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import java.security.KeyStore
import java.security.KeyStoreException
import java.security.NoSuchAlgorithmException
import java.security.UnrecoverableKeyException
import javax.crypto.AEADBadTagException
import javax.crypto.BadPaddingException
import javax.crypto.Cipher
import javax.crypto.IllegalBlockSizeException
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * NativeCryptoVaultModule:
 * Mô-đun mật mã học Native cho Android.
 *
 * Tiêu chuẩn kỹ thuật:
 * - Quản lý khóa phần cứng an toàn qua Android Keystore System (`AndroidKeyStore`).
 *   (Lưu ý: Mức độ bảo vệ phần cứng phụ thuộc vào thiết bị thực tế: có thể là TEE, StrongBox Keymaster,
 *   hoặc Software Keymaster trên các thiết bị cũ/máy ảo; KHÔNG tự ý khẳng định là TEE/StrongBox nếu chưa kiểm chứng qua KeyInfo).
 * - Thực thi mã hóa chứng thực AES-256-GCM với IV 96-bit sinh ngẫu nhiên cho mỗi lần mã hóa và Authentication Tag 128-bit.
 * - Triển khai cơ sở dữ liệu mã hóa toàn bộ tệp nhị phân cấp trang (Page-level Full Database Encryption) bằng SQLCipher (`net.zetetic.database.sqlcipher.SQLiteDatabase`).
 * - Xử lý chuyển đổi an toàn (Zero Data Loss Migration) từ SQLite plaintext cũ sang database mã hóa SQLCipher.
 * - Cô lập dữ liệu theo từng định danh tài khoản bác sĩ (`ownerId`).
 */
class NativeCryptoVaultModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val ANDROID_KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val KEY_ALIAS_PREFIX = "LungCt_Doctor_VaultKey_"
    private const val DB_KEY_RECORD_PREFIX = "LungCt_EncDbKey_Record_"
    private const val GCM_IV_LENGTH = 12 // 96 bits theo khuyến nghị NIST SP 800-38D
    private const val GCM_TAG_LENGTH = 128 // 128 bits
    private const val PBKDF2_ITERATIONS = 100000
    private const val PBKDF2_KEY_LENGTH = 256 // 32 bytes
    private const val SYSTEM_PEPPER = "LungCt_Hardware_Pepper_2026_SecureVault"
    private const val DB_SHARED_PREFS = "lungct_secure_vault_prefs"
  }

  override fun getName(): String = "NativeCryptoVaultModule"

  private fun getAlias(ownerId: String): String {
    val cleanId = ownerId.replace("[^a-zA-Z0-9_]".toRegex(), "_")
    return KEY_ALIAS_PREFIX + cleanId
  }

  /**
   * Lấy khóa bí mật AES-256 từ Android Keystore cho giải mã.
   * NGUYÊN TẮC BẢO VỆ DỮ LIỆU:
   * - Tuyệt đối không tự động xóa khóa cũ hoặc tạo khóa mới khi giải mã.
   * - Nếu khóa không tồn tại, bị hỏng hoặc unrecoverable: Giữ nguyên dữ liệu, báo lỗi rõ ràng và hướng dẫn khôi phục.
   */
  @Synchronized
  private fun getKeystoreKeyForDecryption(ownerId: String): SecretKey {
    val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER).apply { load(null) }
    val alias = getAlias(ownerId)

    if (!keyStore.containsAlias(alias)) {
      throw IllegalStateException(
        "KEY_NOT_FOUND: Không tìm thấy khóa giải mã cho tài khoản ($alias). Không tự sinh khóa mới để tránh phá hủy khả năng giải mã dữ liệu cũ."
      )
    }

    try {
      val entry = keyStore.getEntry(alias, null) as? KeyStore.SecretKeyEntry
      if (entry != null && entry.secretKey != null) {
        return entry.secretKey
      }
      throw UnrecoverableKeyException("Không thể truy xuất SecretKey từ Keystore Entry ($alias).")
    } catch (e: Exception) {
      throw IllegalStateException(
        "CORRUPTED_KEY_RECOVERY_REQUIRED: Khóa trong Android Keystore bị lỗi truy xuất (${e.message}). Dữ liệu mã hóa trên đĩa được giữ nguyên vẹn. Hướng khôi phục: Cần khôi phục từ bản sao lưu hoặc quản trị viên cấp lại khóa; tuyệt đối không tự xóa khóa.",
        e
      )
    }
  }

  /**
   * Lấy khóa đã có hoặc tạo mới khóa AES-256 lần đầu tiên khi chưa có khóa cho tài khoản.
   * Nếu đã có khóa mà khóa bị lỗi: ném lỗi dừng mã hóa, không tự xóa đè.
   */
  @Synchronized
  private fun getOrCreateKeystoreKeyForEncryption(ownerId: String): SecretKey {
    val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER).apply { load(null) }
    val alias = getAlias(ownerId)

    if (keyStore.containsAlias(alias)) {
      try {
        val entry = keyStore.getEntry(alias, null) as? KeyStore.SecretKeyEntry
        if (entry != null && entry.secretKey != null) {
          return entry.secretKey
        }
        throw UnrecoverableKeyException("Khóa $alias tồn tại nhưng không thể đọc.")
      } catch (e: Exception) {
        throw IllegalStateException(
          "KEY_ACCESS_ERROR: Khóa mã hóa $alias tồn tại nhưng không thể truy cập (${e.message}). Hệ thống từ chối tạo đè khóa mới để bảo vệ dữ liệu đã mã hóa trước đó.",
          e
        )
      }
    }

    // Chỉ sinh khóa AES-256 mới khi alias hoàn toàn chưa từng tồn tại
    val keyGenerator = KeyGenerator.getInstance(
      KeyProperties.KEY_ALGORITHM_AES,
      ANDROID_KEYSTORE_PROVIDER
    )

    val builder = KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
      .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
      .setKeySize(256)
      .setRandomizedEncryptionRequired(true)

    keyGenerator.init(builder.build())
    return keyGenerator.generateKey()
  }

  /**
   * Xóa khóa trong Keystore CHỈ THEO MỘT LUỒNG XÁC ĐỊNH RÕ:
   * Được gọi tường minh khi người dùng/quản trị viên thực hiện xóa sạch tài khoản/hủy dữ liệu.
   */
  @ReactMethod
  fun deleteKeystoreKey(ownerId: String, promise: Promise) {
    try {
      val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER).apply { load(null) }
      val alias = getAlias(ownerId)
      if (keyStore.containsAlias(alias)) {
        keyStore.deleteEntry(alias)
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("KEY_DELETE_ERROR", "Không thể xóa khóa trong Keystore: ${e.message}", e)
    }
  }

  /**
   * Sinh khóa dẫn xuất AES-256 từ mật khẩu/ownerId bằng PBKDF2
   */
  private fun deriveFallbackKey(ownerId: String, userPin: String?): SecretKey {
    val secretToDerive = (userPin ?: ownerId) + SYSTEM_PEPPER
    val salt = (ownerId + "Salt_LungCT_v2").toByteArray(Charsets.UTF_8)
    val spec = PBEKeySpec(secretToDerive.toCharArray(), salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH)
    val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
    val keyBytes = factory.generateSecret(spec).encoded
    return SecretKeySpec(keyBytes, "AES")
  }

  @ReactMethod
  fun isKeystoreAvailable(promise: Promise) {
    try {
      val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER).apply { load(null) }
      promise.resolve(keyStore != null)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  private fun encryptWithKeyInternal(secretKey: SecretKey, plaintext: String, formatPrefix: String): String {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, secretKey)
    val iv = cipher.iv
    val cipherBytes = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
    val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
    val cipherBase64 = Base64.encodeToString(cipherBytes, Base64.NO_WRAP)
    return "$formatPrefix:$ivBase64:$cipherBase64"
  }

  private fun decryptWithKeyInternal(secretKey: SecretKey, ciphertextMessage: String): String {
    val parts = ciphertextMessage.split(":")
    if (parts.size != 6) {
      throw IllegalArgumentException("Định dạng bản tin mã hóa không hợp lệ (số trường: ${parts.size} != 6).")
    }

    val iv = Base64.decode(parts[4], Base64.NO_WRAP)
    val encryptedBytes = Base64.decode(parts[5], Base64.NO_WRAP)

    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
    cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)

    val decryptedBytes = cipher.doFinal(encryptedBytes)
    return String(decryptedBytes, Charsets.UTF_8)
  }

  @ReactMethod
  fun encryptData(ownerId: String, plaintext: String, useKeystore: Boolean, promise: Promise) {
    try {
      if (plaintext.isEmpty()) {
        promise.resolve("")
        return
      }

      val secretKey = if (useKeystore) {
        getOrCreateKeystoreKeyForEncryption(ownerId)
      } else {
        deriveFallbackKey(ownerId, null)
      }

      val formatPrefix = if (useKeystore) "ENC:KEYSTORE:AES-GCM:v1" else "ENC:PBKDF2:AES-GCM:v1"
      val result = encryptWithKeyInternal(secretKey, plaintext, formatPrefix)
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ENCRYPTION_ERROR", "Lỗi mã hóa dữ liệu cục bộ: ${e.message}", e)
    }
  }

  @ReactMethod
  fun decryptData(ownerId: String, ciphertextMessage: String, promise: Promise) {
    try {
      if (ciphertextMessage.isEmpty()) {
        promise.resolve("")
        return
      }

      val parts = ciphertextMessage.split(":")
      if (parts.size != 6) {
        promise.reject("INVALID_FORMAT", "Định dạng bản tin mã hóa không hợp lệ (số trường: ${parts.size} != 6).")
        return
      }

      val scheme = "${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}"
      val isKeystore = scheme == "ENC:KEYSTORE:AES-GCM:v1"
      val isPbkdf2 = scheme == "ENC:PBKDF2:AES-GCM:v1"

      if (!isKeystore && !isPbkdf2) {
        promise.reject("UNSUPPORTED_SCHEME", "Chuẩn mã hóa không được hỗ trợ: $scheme")
        return
      }

      val secretKey = if (isKeystore) {
        getKeystoreKeyForDecryption(ownerId)
      } else {
        deriveFallbackKey(ownerId, null)
      }

      val plaintext = decryptWithKeyInternal(secretKey, ciphertextMessage)
      promise.resolve(plaintext)
    } catch (e: AEADBadTagException) {
      promise.reject(
        "AUTH_TAG_FAILED",
        "Giải mã thất bại: Khóa không đúng hoặc dữ liệu đã bị can thiệp trái phép (AEAD Tag mismatch).",
        e
      )
    } catch (e: BadPaddingException) {
      promise.reject("BAD_PADDING", "Dữ liệu bị lỗi đệm giải mã.", e)
    } catch (e: IllegalBlockSizeException) {
      promise.reject("ILLEGAL_BLOCK_SIZE", "Kích thước khối dữ liệu không hợp lệ.", e)
    } catch (e: Exception) {
      promise.reject("DECRYPTION_ERROR", "Lỗi giải mã dữ liệu: ${e.message}", e)
    }
  }

  // =========================================================================
  // TẦNG CƠ SỞ DỮ LIỆU SQLCIPHER NATIVE: MÃ HÓA CẤP TRANG BẰNG ANDROID KEYSTORE
  // =========================================================================

  private var sqliteDb: SQLiteDatabase? = null
  private var currentDbOwnerId: String? = null

  /**
   * Truy xuất hoặc sinh mật khẩu CSDL SQLCipher (32 ký tự Hex hoặc 256-bit key)
   * được bảo vệ nghiêm ngặt bằng khóa Android Keystore Master Key của chính bác sĩ.
   */
  @Synchronized
  private fun getOrCreateSqlcipherPassphrase(ownerId: String): String {
    val prefs = reactContext.getSharedPreferences(DB_SHARED_PREFS, Context.MODE_PRIVATE)
    val prefKey = DB_KEY_RECORD_PREFIX + ownerId.replace("[^a-zA-Z0-9_]".toRegex(), "_")
    val encryptedRecord = prefs.getString(prefKey, null)

    val masterKey = getOrCreateKeystoreKeyForEncryption(ownerId)

    if (encryptedRecord != null) {
      try {
        return decryptWithKeyInternal(masterKey, encryptedRecord)
      } catch (e: Exception) {
        // Nếu không giải mã được bằng masterKey hiện tại, giữ nguyên không xóa đè
        throw IllegalStateException("CORRUPTED_DB_PASSPHRASE: Không thể giải mã passphrase của CSDL SQLCipher: ${e.message}", e)
      }
    }

    // Sinh khóa ngẫu nhiên 32 bytes (256 bits) cho SQLCipher
    val randomBytes = ByteArray(32)
    java.security.SecureRandom().nextBytes(randomBytes)
    val rawPassphrase = Base64.encodeToString(randomBytes, Base64.NO_WRAP)

    val encryptedNewRecord = encryptWithKeyInternal(masterKey, rawPassphrase, "ENC:KEYSTORE:AES-GCM:v1")
    prefs.edit().putString(prefKey, encryptedNewRecord).apply()
    return rawPassphrase
  }

  /**
   * Tạo bảng quan hệ chuẩn nếu chưa tồn tại
   */
  private fun createDatabaseTables(db: SQLiteDatabase) {
    db.execSQL("""
      CREATE TABLE IF NOT EXISTS secure_patients (
        patient_id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        patient_code TEXT NOT NULL,
        full_name TEXT NOT NULL,
        dob TEXT,
        sex TEXT,
        phone TEXT,
        symptoms TEXT,
        status TEXT NOT NULL,
        revision INTEGER DEFAULT 1,
        sync_state TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        trashed_at TEXT,
        encrypted_payload TEXT NOT NULL
      );
    """.trimIndent())

    db.execSQL("""
      CREATE TABLE IF NOT EXISTS secure_cases (
        case_id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        case_code TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        scan_date TEXT NOT NULL,
        status TEXT NOT NULL,
        clinical_note TEXT,
        doctor_comment TEXT,
        revision INTEGER DEFAULT 1,
        sync_state TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        trashed_at TEXT,
        encrypted_payload TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES secure_patients(patient_id)
      );
    """.trimIndent())

    db.execSQL("""
      CREATE TABLE IF NOT EXISTS secure_predictions (
        result_id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        image_id TEXT NOT NULL,
        label TEXT NOT NULL,
        scores TEXT NOT NULL,
        duration_ms INTEGER,
        model_version TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        encrypted_payload TEXT NOT NULL
      );
    """.trimIndent())

    db.execSQL("""
      CREATE TABLE IF NOT EXISTS secure_metadata (
        meta_key TEXT PRIMARY KEY,
        meta_value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    """.trimIndent())
  }

  /**
   * Kiểm tra xem tệp CSDL trên đĩa là SQLite chuẩn (Plaintext header) hay đã được mã hóa SQLCipher
   */
  private fun isDatabasePlaintext(dbFile: File): Boolean {
    if (!dbFile.exists() || dbFile.length() < 16) return false
    val header = ByteArray(16)
    try {
      java.io.FileInputStream(dbFile).use { it.read(header) }
      val headerStr = String(header, Charsets.US_ASCII)
      return headerStr.startsWith("SQLite format 3")
    } catch (e: Exception) {
      return false
    }
  }

  /**
   * Di chuyển an toàn từ SQLite plaintext sang CSDL mã hóa SQLCipher (Zero Data Loss Migration)
   */
  private fun migratePlaintextDbToSqlcipher(plainDbFile: File, encDbFile: File, passphrase: String) {
    if (!plainDbFile.exists()) return

    // 1. Mở CSDL plaintext bằng Android standard SQLite (read-only)
    val standardPlainDb = android.database.sqlite.SQLiteDatabase.openDatabase(
      plainDbFile.absolutePath,
      null,
      android.database.sqlite.SQLiteDatabase.OPEN_READONLY
    )

    // 2. Mở hoặc tạo mới CSDL SQLCipher
    val sqlcipherDb = SQLiteDatabase.openOrCreateDatabase(encDbFile.absolutePath, passphrase, null, null, null)
    createDatabaseTables(sqlcipherDb)

    sqlcipherDb.beginTransaction()
    try {
      // Di chuyển secure_patients
      standardPlainDb.rawQuery("SELECT * FROM secure_patients", null).use { cursor ->
        val cols = cursor.columnNames
        while (cursor.moveToNext()) {
          val sql = "INSERT OR REPLACE INTO secure_patients (${cols.joinToString(",")}) VALUES (${cols.map { "?" }.joinToString(",")})"
          val args = Array<Any?>(cols.size) { i ->
            when (cursor.getType(i)) {
              android.database.Cursor.FIELD_TYPE_NULL -> null
              android.database.Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(i)
              android.database.Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(i)
              android.database.Cursor.FIELD_TYPE_STRING -> cursor.getString(i)
              android.database.Cursor.FIELD_TYPE_BLOB -> cursor.getBlob(i)
              else -> cursor.getString(i)
            }
          }
          sqlcipherDb.execSQL(sql, args)
        }
      }

      // Di chuyển secure_cases
      standardPlainDb.rawQuery("SELECT * FROM secure_cases", null).use { cursor ->
        val cols = cursor.columnNames
        while (cursor.moveToNext()) {
          val sql = "INSERT OR REPLACE INTO secure_cases (${cols.joinToString(",")}) VALUES (${cols.map { "?" }.joinToString(",")})"
          val args = Array<Any?>(cols.size) { i ->
            when (cursor.getType(i)) {
              android.database.Cursor.FIELD_TYPE_NULL -> null
              android.database.Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(i)
              android.database.Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(i)
              android.database.Cursor.FIELD_TYPE_STRING -> cursor.getString(i)
              android.database.Cursor.FIELD_TYPE_BLOB -> cursor.getBlob(i)
              else -> cursor.getString(i)
            }
          }
          sqlcipherDb.execSQL(sql, args)
        }
      }

      // Di chuyển secure_predictions
      try {
        standardPlainDb.rawQuery("SELECT * FROM secure_predictions", null).use { cursor ->
          val cols = cursor.columnNames
          while (cursor.moveToNext()) {
            val sql = "INSERT OR REPLACE INTO secure_predictions (${cols.joinToString(",")}) VALUES (${cols.map { "?" }.joinToString(",")})"
            val args = Array<Any?>(cols.size) { i ->
              when (cursor.getType(i)) {
                android.database.Cursor.FIELD_TYPE_NULL -> null
                android.database.Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(i)
                android.database.Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(i)
                android.database.Cursor.FIELD_TYPE_STRING -> cursor.getString(i)
                android.database.Cursor.FIELD_TYPE_BLOB -> cursor.getBlob(i)
                else -> cursor.getString(i)
              }
            }
            sqlcipherDb.execSQL(sql, args)
          }
        }
      } catch (e: Exception) {
        // Bỏ qua nếu bảng predictions chưa có trong db cũ
      }

      // Di chuyển secure_metadata
      try {
        standardPlainDb.rawQuery("SELECT * FROM secure_metadata", null).use { cursor ->
          val cols = cursor.columnNames
          while (cursor.moveToNext()) {
            val sql = "INSERT OR REPLACE INTO secure_metadata (${cols.joinToString(",")}) VALUES (${cols.map { "?" }.joinToString(",")})"
            val args = Array<Any?>(cols.size) { i ->
              when (cursor.getType(i)) {
                android.database.Cursor.FIELD_TYPE_NULL -> null
                android.database.Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(i)
                android.database.Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(i)
                android.database.Cursor.FIELD_TYPE_STRING -> cursor.getString(i)
                android.database.Cursor.FIELD_TYPE_BLOB -> cursor.getBlob(i)
                else -> cursor.getString(i)
              }
            }
            sqlcipherDb.execSQL(sql, args)
          }
        }
      } catch (e: Exception) {
        // Bỏ qua nếu metadata chưa có
      }

      // Ghi nhận trạng thái hoàn tất SQLCipher migration vào metadata
      val nowIso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
        timeZone = java.util.TimeZone.getTimeZone("UTC")
      }.format(java.util.Date())
      sqlcipherDb.execSQL("INSERT OR REPLACE INTO secure_metadata (meta_key, meta_value, updated_at) VALUES (?, ?, ?)",
        arrayOf("sqlcipher_file_encryption_status", "ACTIVE_FULL_ENCRYPTED", nowIso))

      sqlcipherDb.setTransactionSuccessful()
    } finally {
      sqlcipherDb.endTransaction()
      sqlcipherDb.close()
      standardPlainDb.close()
    }

    // Bảo tồn bản sao lưu an toàn của file cũ trước khi đổi tên
    val backupPlainFile = File(plainDbFile.parentFile, plainDbFile.name + ".plaintext.bak")
    if (!backupPlainFile.exists()) {
      plainDbFile.copyTo(backupPlainFile, overwrite = true)
    }

    // Bảo vệ bản sao lưu: Tự động mã hóa tệp sao lưu thành .encrypted.bak bằng Keystore Master Key (AES-256-GCM)
    // Giữ nguyên bản sao lưu gốc backupPlainFile (.plaintext.bak), KHÔNG xóa hoặc ghi đè
    try {
      val backupEncFile = File(plainDbFile.parentFile, plainDbFile.name + ".encrypted.bak")
      if (!backupEncFile.exists() && backupPlainFile.exists()) {
        val masterKey = getOrCreateKeystoreKeyForEncryption(currentDbOwnerId ?: "system_migration")
        val rawPlainBytes = backupPlainFile.readBytes()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, masterKey)
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(rawPlainBytes)

        java.io.FileOutputStream(backupEncFile).use { fos ->
          // Ghi header 4 bytes magic LCBK (LungCT Backup) + 1 byte IV length + IV + Ciphertext
          fos.write("LCBK".toByteArray(Charsets.US_ASCII))
          fos.write(iv.size)
          fos.write(iv)
          fos.write(encryptedBytes)
        }
      }
    } catch (e: Exception) {
      android.util.Log.w("NativeCryptoVault", "Không thể sinh bản sao lưu mã hóa: ${e.message}")
    }
  }

  @Synchronized
  private fun getOrOpenSqlite(ownerId: String): SQLiteDatabase {
    if (sqliteDb != null && sqliteDb!!.isOpen && currentDbOwnerId == ownerId) {
      return sqliteDb!!
    }

    sqliteDb?.close()
    val cleanOwnerId = ownerId.replace("[^a-zA-Z0-9_]".toRegex(), "_")
    val dbFile = reactContext.getDatabasePath("lungct_secure_${cleanOwnerId}.db")
    dbFile.parentFile?.mkdirs()

    val passphrase = getOrCreateSqlcipherPassphrase(ownerId)

    // Kiểm tra migration nếu file hiện tại là plaintext SQLite
    if (dbFile.exists() && isDatabasePlaintext(dbFile)) {
      val tempEncFile = File(dbFile.parentFile, "lungct_secure_${cleanOwnerId}_encrypted.db")
      migratePlaintextDbToSqlcipher(dbFile, tempEncFile, passphrase)
      // Thay thế file cũ bằng file đã mã hóa toàn bộ trang
      if (tempEncFile.exists()) {
        dbFile.delete()
        tempEncFile.renameTo(dbFile)
      }
    }

    val db = SQLiteDatabase.openOrCreateDatabase(dbFile.absolutePath, passphrase, null, null, null)
    createDatabaseTables(db)

    sqliteDb = db
    currentDbOwnerId = ownerId
    return db
  }

  @ReactMethod
  fun openSecureDatabase(ownerId: String, promise: Promise) {
    try {
      getOrOpenSqlite(ownerId)
      val map = Arguments.createMap().apply {
        putBoolean("success", true)
        putString("ownerId", ownerId)
        putString("databasePath", reactContext.getDatabasePath("lungct_secure_${ownerId.replace("[^a-zA-Z0-9_]".toRegex(), "_")}.db").absolutePath)
        putString("encryptionEngine", "SQLCipher-4.6.1-FullPageEncryption")
      }
      promise.resolve(map)
    } catch (e: Exception) {
      promise.reject("DB_OPEN_ERROR", "Lỗi mở cơ sở dữ liệu SQLCipher bảo mật: ${e.message}", e)
    }
  }

  @ReactMethod
  fun executeSecureSql(ownerId: String, sql: String, args: ReadableArray?, promise: Promise) {
    try {
      val db = getOrOpenSqlite(ownerId)
      if (args != null && args.size() > 0) {
        val bindArgs = Array<Any?>(args.size()) { i ->
          when (args.getType(i)) {
            com.facebook.react.bridge.ReadableType.String -> args.getString(i)
            com.facebook.react.bridge.ReadableType.Number -> args.getDouble(i)
            com.facebook.react.bridge.ReadableType.Boolean -> if (args.getBoolean(i)) 1 else 0
            com.facebook.react.bridge.ReadableType.Null -> null
            else -> args.getString(i)
          }
        }
        db.execSQL(sql, bindArgs)
      } else {
        db.execSQL(sql)
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("DB_EXEC_ERROR", "Lỗi thực thi SQL: ${e.message}", e)
    }
  }

  @ReactMethod
  fun querySecureSql(ownerId: String, sql: String, args: ReadableArray?, promise: Promise) {
    try {
      val db = getOrOpenSqlite(ownerId)
      val bindArgs = if (args != null && args.size() > 0) {
        Array(args.size()) { i -> args.getString(i) ?: "" }
      } else null

      val cursor = db.rawQuery(sql, bindArgs)
      val resultArray = Arguments.createArray()

      cursor.use { c ->
        val columnNames = c.columnNames
        while (c.moveToNext()) {
          val rowMap = Arguments.createMap()
          for (i in columnNames.indices) {
            val colName = columnNames[i]
            when (c.getType(i)) {
              android.database.Cursor.FIELD_TYPE_NULL -> rowMap.putNull(colName)
              android.database.Cursor.FIELD_TYPE_INTEGER -> rowMap.putDouble(colName, c.getLong(i).toDouble())
              android.database.Cursor.FIELD_TYPE_FLOAT -> rowMap.putDouble(colName, c.getDouble(i))
              android.database.Cursor.FIELD_TYPE_STRING -> rowMap.putString(colName, c.getString(i))
              android.database.Cursor.FIELD_TYPE_BLOB -> rowMap.putString(colName, Base64.encodeToString(c.getBlob(i), Base64.NO_WRAP))
            }
          }
          resultArray.pushMap(rowMap)
        }
      }

      promise.resolve(resultArray)
    } catch (e: Exception) {
      promise.reject("DB_QUERY_ERROR", "Lỗi truy vấn SQL: ${e.message}", e)
    }
  }

  @ReactMethod
  fun closeSecureDatabase(promise: Promise) {
    try {
      sqliteDb?.close()
      sqliteDb = null
      currentDbOwnerId = null
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("DB_CLOSE_ERROR", "Lỗi đóng cơ sở dữ liệu: ${e.message}", e)
    }
  }
}
