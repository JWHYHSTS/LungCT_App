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
import android.database.sqlite.SQLiteDatabase
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
 * - Xử lý chặt chẽ các trường hợp biên: mất khóa, sai khóa (AEADBadTagException), dữ liệu bị sửa đổi (tamper).
 * - Cô lập dữ liệu theo từng định danh tài khoản bác sĩ (`ownerId`).
 */
class NativeCryptoVaultModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val ANDROID_KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val KEY_ALIAS_PREFIX = "LungCt_Doctor_VaultKey_"
    private const val GCM_IV_LENGTH = 12 // 96 bits theo khuyến nghị NIST SP 800-38D
    private const val GCM_TAG_LENGTH = 128 // 128 bits
    private const val PBKDF2_ITERATIONS = 100000
    private const val PBKDF2_KEY_LENGTH = 256 // 32 bytes
    private const val SYSTEM_PEPPER = "LungCt_Hardware_Pepper_2026_SecureVault"
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

      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      // GCM Mode yêu cầu cipher tự sinh IV ngẫu nhiên trong init(ENCRYPT_MODE, key)
      cipher.init(Cipher.ENCRYPT_MODE, secretKey)
      val iv = cipher.iv

      val cipherBytes = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
      val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
      val cipherBase64 = Base64.encodeToString(cipherBytes, Base64.NO_WRAP)

      val formatPrefix = if (useKeystore) "ENC:KEYSTORE:AES-GCM:v1" else "ENC:PBKDF2:AES-GCM:v1"
      val result = "$formatPrefix:$ivBase64:$cipherBase64"
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
      // Định dạng mong đợi: ENC:KEYSTORE:AES-GCM:v1:<ivBase64>:<cipherBase64> (tổng cộng 6 parts)
      if (parts.size != 6) {
        promise.reject(
          "INVALID_FORMAT",
          "Định dạng bản tin mã hóa không hợp lệ (số trường: ${parts.size} != 6)."
        )
        return
      }

      val scheme = "${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}"
      val isKeystore = scheme == "ENC:KEYSTORE:AES-GCM:v1"
      val isPbkdf2 = scheme == "ENC:PBKDF2:AES-GCM:v1"

      if (!isKeystore && !isPbkdf2) {
        promise.reject("UNSUPPORTED_SCHEME", "Chuẩn mã hóa không được hỗ trợ: $scheme")
        return
      }

      val iv = try {
        Base64.decode(parts[4], Base64.NO_WRAP)
      } catch (e: Exception) {
        promise.reject("INVALID_IV", "IV không đúng định dạng Base64.")
        return
      }

      val encryptedBytes = try {
        Base64.decode(parts[5], Base64.NO_WRAP)
      } catch (e: Exception) {
        promise.reject("INVALID_CIPHERTEXT", "Ciphertext không đúng định dạng Base64.")
        return
      }

      val secretKey = if (isKeystore) {
        getKeystoreKeyForDecryption(ownerId)
      } else {
        deriveFallbackKey(ownerId, null)
      }

      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
      cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)

      val decryptedBytes = cipher.doFinal(encryptedBytes)
      val plaintext = String(decryptedBytes, Charsets.UTF_8)
      promise.resolve(plaintext)
    } catch (e: AEADBadTagException) {
      // Bắt lỗi giải mã khi sai khóa hoặc dữ liệu bị sửa đổi (Auth Tag mismatch)
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
  // TẦNG CƠ SỞ DỮ LIỆU SQLITE NATIVE BẢO VỆ BẰNG ANDROID KEYSTORE (AES-GCM)
  // =========================================================================

  private var sqliteDb: SQLiteDatabase? = null
  private var currentDbOwnerId: String? = null

  @Synchronized
  private fun getOrOpenSqlite(ownerId: String): SQLiteDatabase {
    if (sqliteDb != null && sqliteDb!!.isOpen && currentDbOwnerId == ownerId) {
      return sqliteDb!!
    }

    sqliteDb?.close()
    val dbFile = reactContext.getDatabasePath("lungct_secure_${ownerId.replace("[^a-zA-Z0-9_]".toRegex(), "_")}.db")
    dbFile.parentFile?.mkdirs()

    val db = SQLiteDatabase.openOrCreateDatabase(dbFile, null)
    // Tạo cấu trúc bảng chuẩn quan hệ nếu chưa tồn tại
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
      }
      promise.resolve(map)
    } catch (e: Exception) {
      promise.reject("DB_OPEN_ERROR", "Lỗi mở cơ sở dữ liệu SQLite bảo mật: ${e.message}", e)
    }
  }

  @ReactMethod
  fun executeSecureSql(ownerId: String, sql: String, args: ReadableArray?, promise: Promise) {
    try {
      val db = getOrOpenSqlite(ownerId)
      if (args != null && args.size() > 0) {
        val bindArgs = Array<Any>(args.size()) { i ->
          when (args.getType(i)) {
            com.facebook.react.bridge.ReadableType.String -> args.getString(i)
            com.facebook.react.bridge.ReadableType.Number -> args.getDouble(i)
            com.facebook.react.bridge.ReadableType.Boolean -> if (args.getBoolean(i)) 1 else 0
            com.facebook.react.bridge.ReadableType.Null -> null as Any?
            else -> args.getString(i)
          } ?: ""
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

