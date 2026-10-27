package com.anonymous.mobile

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.channels.FileChannel
import java.util.Collections
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import ai.onnxruntime.OnnxTensor
import org.tensorflow.lite.Interpreter

class LungCtPipelineModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var ortEnv: OrtEnvironment? = null
  private var ortSession: OrtSession? = null
  private var tfliteInterpreter: Interpreter? = null
  private var isInitialized = false

  private var pickerPromise: Promise? = null
  private val PICK_IMAGE_REQUEST_CODE = 41285

  private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      if (requestCode == PICK_IMAGE_REQUEST_CODE) {
        val promise = pickerPromise
        pickerPromise = null
        if (promise == null) return

        if (resultCode == Activity.RESULT_CANCELED) {
          // Người dùng hủy chọn ảnh
          val map = Arguments.createMap().apply {
            putBoolean("canceled", true)
          }
          promise.resolve(map)
          return
        }

        if (resultCode != Activity.RESULT_OK || data == null || data.data == null) {
          val map = Arguments.createMap().apply {
            putBoolean("canceled", true)
          }
          promise.resolve(map)
          return
        }

        val uri: Uri = data.data!!
        try {
          // Lấy thông tin tệp từ URI
          var displayName = "selected_image.jpg"
          var fileSize = -1L

          reactContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
              val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
              val sizeIndex = cursor.getColumnIndex(android.provider.OpenableColumns.SIZE)
              if (nameIndex != -1 && !cursor.isNull(nameIndex)) {
                displayName = cursor.getString(nameIndex)
              }
              if (sizeIndex != -1 && !cursor.isNull(sizeIndex)) {
                fileSize = cursor.getLong(sizeIndex)
              }
            }
          }

          val map = Arguments.createMap().apply {
            putBoolean("canceled", false)
            putString("uri", uri.toString())
            putString("name", displayName)
            putDouble("size", fileSize.toDouble())
          }
          promise.resolve(map)
        } catch (e: Exception) {
          promise.reject("ERR_PICKER", "Lỗi đọc thông tin ảnh đã chọn: ${e.message}", e)
        }
      }
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  companion object {
    /**
     * Thuật toán lấy mẫu Nearest Neighbour Resampling tổng quát khớp 100% với Pillow:
     * C source Pillow (Geometry.c):
     *   a0 = in_size / out_size
     *   xo = a0 * 0.5
     *   xin = (int)xo; xo += a0
     */
    fun getPillowNearestIndices(inSize: Int, outSize: Int): IntArray {
      val indices = IntArray(outSize)
      val scale = inSize.toDouble() / outSize.toDouble()
      var pos = scale * 0.5
      for (i in 0 until outSize) {
        var idx = pos.toInt()
        if (idx >= inSize) idx = inSize - 1
        if (idx < 0) idx = 0
        indices[i] = idx
        pos += scale
      }
      return indices
    }
  }

  override fun getName(): String = "LungCtPipelineModule"

  @Synchronized
  private fun ensureInitialized() {
    if (isInitialized && ortSession != null && tfliteInterpreter != null) return

    val modelsDir = File(reactContext.filesDir, "models")
    if (!modelsDir.exists()) modelsDir.mkdirs()

    val vitOnnxFile = File(modelsDir, "vit_cls.onnx")
    val vitDataFile = File(modelsDir, "vit_cls.onnx.data")
    val fusionFile = File(modelsDir, "fusion_model.tflite")

    // 1. Nạp ViT ONNX + data
    if (!vitOnnxFile.exists() || vitOnnxFile.length() == 0L) {
      try {
        reactContext.assets.open("models/vit_cls.onnx").use { input ->
          FileOutputStream(vitOnnxFile).use { output -> input.copyTo(output) }
        }
      } catch (e: Exception) {
        // Assets có thể không tồn tại nếu đã được nạp trước đó vào filesDir
      }
    }
    if (!vitDataFile.exists() || vitDataFile.length() == 0L) {
      try {
        reactContext.assets.open("models/vit_cls.onnx.data").use { input ->
          FileOutputStream(vitDataFile).use { output -> input.copyTo(output) }
        }
      } catch (e: Exception) {
        // Assets có thể không tồn tại nếu đã được nạp trước đó vào filesDir
      }
    }

    // 2. Nạp Fusion TFLite
    if (!fusionFile.exists() || fusionFile.length() == 0L) {
      try {
        reactContext.assets.open("models/fusion_model.tflite").use { input ->
          FileOutputStream(fusionFile).use { output -> input.copyTo(output) }
        }
      } catch (e: Exception) {
        // Assets có thể không tồn tại nếu đã được nạp trước đó vào filesDir
      }
    }

    // Khởi tạo OrtSession
    if (ortEnv == null) {
      ortEnv = OrtEnvironment.getEnvironment()
    }
    val sessionOptions = OrtSession.SessionOptions()
    ortSession = ortEnv!!.createSession(vitOnnxFile.absolutePath, sessionOptions)

    // Khởi tạo TFLite Interpreter từ memory-mapped ByteBuffer
    FileInputStream(fusionFile).use { fileInputStream ->
      val fileChannel = fileInputStream.channel
      val startOffset = 0L
      val declaredLength = fileChannel.size()
      val tfliteModelBuffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
      val tfliteOptions = Interpreter.Options().apply {
        setNumThreads(4)
      }
      tfliteInterpreter = Interpreter(tfliteModelBuffer, tfliteOptions)
    }

    isInitialized = true
  }

  /**
   * Mở Intent chọn ảnh của hệ thống Android:
   * Cho phép người dùng duyệt và chọn bất kỳ tệp ảnh nào từ bộ nhớ máy, thẻ nhớ, Google Photos...
   */
  @ReactMethod
  fun pickImageFromDevice(promise: Promise) {
    val currentActivity = reactContext.currentActivity
    if (currentActivity == null) {
      promise.reject("ERR_NO_ACTIVITY", "Không tìm thấy Activity hiện tại để mở trình chọn ảnh.")
      return
    }

    if (pickerPromise != null) {
      promise.reject("ERR_BUSY", "Trình chọn ảnh đang mở. Vui lòng hoàn tất hoặc hủy thao tác hiện tại.")
      return
    }

    pickerPromise = promise
    try {
      val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
        type = "image/*"
        addCategory(Intent.CATEGORY_OPENABLE)
        putExtra(Intent.EXTRA_LOCAL_ONLY, true)
      }
      currentActivity.startActivityForResult(
        Intent.createChooser(intent, "Chọn ảnh CT từ thiết bị"),
        PICK_IMAGE_REQUEST_CODE
      )
    } catch (e: Exception) {
      pickerPromise = null
      promise.reject("ERR_LAUNCH_PICKER", "Không thể khởi chạy trình chọn ảnh: ${e.message}", e)
    }
  }

  /**
   * Liệt kê các tệp ảnh CT có sẵn trong thư mục máy:
   * 1. /data/user/0/com.anonymous.mobile/files/test_images (reactContext.filesDir/test_images)
   * 2. /sdcard/Download
   */
  @ReactMethod
  fun listAvailableTestImages(promise: Promise) {
    try {
      val resultList = Arguments.createArray()
      val dirsToScan = listOf(
        File(reactContext.filesDir, "test_images"),
        File("/sdcard/Download")
      )

      val seenNames = HashSet<String>()
      for (dir in dirsToScan) {
        if (dir.exists() && dir.isDirectory) {
          val files = dir.listFiles()
          if (files != null) {
            for (f in files) {
              if (f.isFile && (f.name.endsWith(".jpg", true) || f.name.endsWith(".png", true))) {
                if (!seenNames.contains(f.name)) {
                  seenNames.add(f.name)
                  val item = Arguments.createMap().apply {
                    putString("name", f.name)
                    putString("path", f.absolutePath)
                    putDouble("size", f.length().toDouble())
                  }
                  resultList.pushMap(item)
                }
              }
            }
          }
        }
      }
      promise.resolve(resultList)
    } catch (e: Exception) {
      promise.reject("ERR_LIST_FILES", "Không thể liệt kê tệp ảnh: ${e.message}")
    }
  }

  /**
   * Hàm cốt lõi thực thi toàn bộ pipeline ViT ONNX + Fusion TFLite trên Bitmap đã giải mã
   */
  private fun executePipelineOnBitmap(
    bitmap: Bitmap,
    decodeDuration: Long,
    totalStart: Long,
    sourceDesc: String,
    promise: Promise
  ) {
    try {
      val origW = bitmap.width
      val origH = bitmap.height

      val origPixels = IntArray(origW * origH)
      bitmap.getPixels(origPixels, 0, origW, 0, 0, origW, origH)

      // 2. Tiền xử lý ViT: Bitmap -> 224x224 RGB -> FloatBuffer [1, 3, 224, 224], (x/255.0 - 0.5)/0.5
      val prepVitStart = System.currentTimeMillis()
      val vitBuffer = FloatBuffer.allocate(1 * 3 * 224 * 224)
      val plane = 224 * 224

      // Lấy mẫu theo quy chuẩn Nearest neighbor chuẩn xác theo thuật toán Pillow Resample
      val xIndicesVit = getPillowNearestIndices(origW, 224)
      val yIndicesVit = getPillowNearestIndices(origH, 224)

      for (y in 0 until 224) {
        val origY = yIndicesVit[y]
        val rowOffset = origY * origW
        val vitRowOffset = y * 224

        for (x in 0 until 224) {
          val origX = xIndicesVit[x]
          val pixel = origPixels[rowOffset + origX]
          val idx = vitRowOffset + x

          val r = ((pixel shr 16) and 0xFF) / 255.0f
          val g = ((pixel shr 8) and 0xFF) / 255.0f
          val b = (pixel and 0xFF) / 255.0f

          vitBuffer.put(idx, (r - 0.5f) / 0.5f)
          vitBuffer.put(plane + idx, (g - 0.5f) / 0.5f)
          vitBuffer.put(2 * plane + idx, (b - 0.5f) / 0.5f)
        }
      }
      vitBuffer.rewind()
      val prepVitDuration = System.currentTimeMillis() - prepVitStart

      // 3. Tiền xử lý CNN: Bitmap -> 512x512 RGB -> FloatBuffer [1, 512, 512, 3], x/255.0 (HWC)
      val prepCnnStart = System.currentTimeMillis()
      val cnnBuffer = ByteBuffer.allocateDirect(1 * 512 * 512 * 3 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()

      if (origW == 512 && origH == 512) {
        for (i in 0 until (512 * 512)) {
          val pixel = origPixels[i]
          val r = ((pixel shr 16) and 0xFF) / 255.0f
          val g = ((pixel shr 8) and 0xFF) / 255.0f
          val b = (pixel and 0xFF) / 255.0f
          cnnBuffer.put(r)
          cnnBuffer.put(g)
          cnnBuffer.put(b)
        }
      } else {
        // Nearest resize sang 512x512 theo thuật toán Pillow nếu ảnh có kích thước khác 512
        val xIndicesCnn = getPillowNearestIndices(origW, 512)
        val yIndicesCnn = getPillowNearestIndices(origH, 512)

        for (y in 0 until 512) {
          val origY = yIndicesCnn[y]
          val rowOffset = origY * origW
          for (x in 0 until 512) {
            val origX = xIndicesCnn[x]
            val pixel = origPixels[rowOffset + origX]
            val r = ((pixel shr 16) and 0xFF) / 255.0f
            val g = ((pixel shr 8) and 0xFF) / 255.0f
            val b = (pixel and 0xFF) / 255.0f
            cnnBuffer.put(r)
            cnnBuffer.put(g)
            cnnBuffer.put(b)
          }
        }
      }
      cnnBuffer.rewind()
      val prepCnnDuration = System.currentTimeMillis() - prepCnnStart

      // 4. Khởi tạo & Chạy ViT ONNX
      ensureInitialized()
      val vitStart = System.currentTimeMillis()
      val tensorShape = longArrayOf(1, 3, 224, 224)
      val vitTensor = OnnxTensor.createTensor(ortEnv, vitBuffer, tensorShape)
      val vitResult = ortSession!!.run(Collections.singletonMap("pixel_values", vitTensor))
      val vitDuration = System.currentTimeMillis() - vitStart

      val outputValue = vitResult.get(0).value as Array<FloatArray>
      val clsToken = outputValue[0] // 768 floats (1D FloatArray)

      // 5. Chạy Fusion TFLite với inputs: [clsToken (1, 768), cnnBuffer (1, 512, 512, 3)]
      val fusionStart = System.currentTimeMillis()
      
      // Thứ tự inputs của Fusion TFLite:
      // Input 0: serving_default_vit_features_input:0 [1, 768] Float32
      // Input 1: serving_default_image_input:0 [1, 512, 512, 3] Float32
      val clsInput = Array(1) { clsToken }
      val inputs = arrayOf<Any>(clsInput, cnnBuffer)
      
      val outputsMap = HashMap<Int, Any>()
      val outputScores = Array(1) { FloatArray(3) }
      outputsMap[0] = outputScores

      tfliteInterpreter!!.runForMultipleInputsOutputs(inputs, outputsMap)
      val fusionDuration = System.currentTimeMillis() - fusionStart

      val scores = outputScores[0]
      val benignScore = scores[0].toDouble()
      val malignantScore = scores[1].toDouble()
      val normalScore = scores[2].toDouble()

      // Tìm lớp dự đoán cao nhất
      var maxIdx = 0
      var maxScore = scores[0]
      for (i in 1 until 3) {
        if (scores[i] > maxScore) {
          maxScore = scores[i]
          maxIdx = i
        }
      }
      val predictedLabel = when (maxIdx) {
        0 -> "Benign"
        1 -> "Malignant"
        else -> "Normal"
      }
      val totalDuration = System.currentTimeMillis() - totalStart

      android.util.Log.i(
        "LungCtPipeline",
        "[INFERENCE_RUN] source=$sourceDesc, origSize=${origW}x${origH}, pred=$predictedLabel, " +
        "Benign=${"%.6f".format(benignScore)}, Malignant=${"%.6f".format(malignantScore)}, Normal=${"%.6f".format(normalScore)}, " +
        "vitLatency=${vitDuration}ms, fusionLatency=${fusionDuration}ms, total=${totalDuration}ms"
      )

      // Trả kết quả WritableMap về React Native
      val resultMap = Arguments.createMap().apply {
        putString("predictedClass", predictedLabel)
        
        val probMap = Arguments.createMap().apply {
          putDouble("Benign", benignScore)
          putDouble("Malignant", malignantScore)
          putDouble("Normal", normalScore)
        }
        putMap("probabilities", probMap)

        val latencyMap = Arguments.createMap().apply {
          putDouble("decodeMs", decodeDuration.toDouble())
          putDouble("prepVitMs", prepVitDuration.toDouble())
          putDouble("prepCnnMs", prepCnnDuration.toDouble())
          putDouble("vitInferenceMs", vitDuration.toDouble())
          putDouble("fusionInferenceMs", fusionDuration.toDouble())
          putDouble("totalInferenceMs", (vitDuration + fusionDuration).toDouble())
          putDouble("totalOverallMs", totalDuration.toDouble())
        }
        putMap("latency", latencyMap)

        putBoolean("gradcamAvailable", false)
        putString("gradcamNotice", "Grad-CAM chưa được kiểm chứng trên mobile (MSG-11)")
        putBoolean("isMock", false)
        putString("verifiedSource", "on_device_fp32")
        putString("imageSource", sourceDesc)
        putInt("imageWidth", origW)
        putInt("imageHeight", origH)
      }

      promise.resolve(resultMap)
    } catch (e: Exception) {
      promise.reject("ERR_INFERENCE", "Lỗi thực thi suy luận pipeline: ${e.message}", e)
    }
  }

  @ReactMethod
  fun runInferenceFromBase64(base64Image: String, promise: Promise) {
    Thread {
      val totalStart = System.currentTimeMillis()
      val imageBytes = try {
        Base64.decode(base64Image, Base64.DEFAULT)
      } catch (e: Exception) {
        promise.reject("ERR_DECODE", "Tệp ảnh CT không hợp lệ hoặc chuỗi Base64 bị hỏng: ${e.message}")
        return@Thread
      }

      val decodeStart = System.currentTimeMillis()
      val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
      if (bitmap == null) {
        promise.reject("ERR_DECODE", "Không thể giải mã định dạng ảnh (BitmapFactory trả về null) (MSG-10)")
        return@Thread
      }
      val decodeDuration = System.currentTimeMillis() - decodeStart

      executePipelineOnBitmap(bitmap, decodeDuration, totalStart, "base64", promise)
    }.start()
  }

  @ReactMethod
  fun runInferenceFromFilePath(filePath: String, promise: Promise) {
    Thread {
      val totalStart = System.currentTimeMillis()
      
      // Xử lý URI content:// hoặc file:// hoặc path thông thường
      if (filePath.startsWith("content://") || filePath.startsWith("file://")) {
        runWithUri(Uri.parse(filePath), totalStart, promise)
        return@Thread
      }

      val file = File(filePath)
      if (!file.exists() || !file.isFile) {
        // Thử tìm trong thư mục test_images cục bộ của app nếu là tên tệp tương đối
        val fallbackFile = File(File(reactContext.filesDir, "test_images"), file.name)
        if (fallbackFile.exists()) {
          runWithFile(fallbackFile, totalStart, promise)
          return@Thread
        }
        promise.reject("ERR_FILE_NOT_FOUND", "Không tìm thấy tệp ảnh CT tại đường dẫn: $filePath (MSG-10)")
        return@Thread
      }
      runWithFile(file, totalStart, promise)
    }.start()
  }

  private fun runWithFile(file: File, totalStart: Long, promise: Promise) {
    try {
      val decodeStart = System.currentTimeMillis()
      val bitmap = BitmapFactory.decodeFile(file.absolutePath)
      if (bitmap == null) {
        promise.reject("ERR_DECODE", "Tệp ảnh bị lỗi hoặc hỏng định dạng, không thể giải mã: ${file.name} (MSG-10)")
        return
      }
      val decodeDuration = System.currentTimeMillis() - decodeStart
      executePipelineOnBitmap(bitmap, decodeDuration, totalStart, file.name, promise)
    } catch (e: Exception) {
      promise.reject("ERR_READ_FILE", "Lỗi đọc tệp ảnh ${file.name}: ${e.message}", e)
    }
  }

  private fun runWithUri(uri: Uri, totalStart: Long, promise: Promise) {
    try {
      val decodeStart = System.currentTimeMillis()
      val inputStream: InputStream? = reactContext.contentResolver.openInputStream(uri)
      if (inputStream == null) {
        promise.reject("ERR_OPEN_URI", "Không thể mở luồng đọc dữ liệu từ URI: $uri (MSG-10)")
        return
      }
      val bitmap = BitmapFactory.decodeStream(inputStream)
      inputStream.close()
      if (bitmap == null) {
        promise.reject("ERR_DECODE", "Không thể giải mã hình ảnh từ URI: $uri. Định dạng không hợp lệ hoặc tệp bị hỏng (MSG-10)")
        return
      }
      val decodeDuration = System.currentTimeMillis() - decodeStart
      executePipelineOnBitmap(bitmap, decodeDuration, totalStart, uri.lastPathSegment ?: "uri_image", promise)
    } catch (e: Exception) {
      promise.reject("ERR_READ_URI", "Lỗi đọc tệp từ URI $uri: ${e.message}", e)
    }
  }
}
