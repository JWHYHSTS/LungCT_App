package com.anonymous.mobile

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.net.Uri
import android.util.Base64
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileInputStream
import java.io.FileNotFoundException
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
  private var tailInterpreter: Interpreter? = null
  private var w1Data: FloatArray? = null
  private var w0Data: FloatArray? = null
  private var isInitialized = false

  // Direct buffers cho mô hình đa đầu ra và Grad-CAM tail
  private var outA0Buf: FloatBuffer? = null
  private var outActivationsBuf: FloatBuffer? = null
  private var outCnnTokBuf: FloatBuffer? = null
  private var outVitTokBuf: FloatBuffer? = null
  private var outScoresBuf: FloatBuffer? = null

  private var tailVitBuf: FloatBuffer? = null
  private var tailCnnBuf: FloatBuffer? = null
  private var tailOutBuf: FloatBuffer? = null

  private var pickerPromise: Promise? = null
  private val PICK_IMAGE_REQUEST_CODE = 41285

  private var cameraPromise: Promise? = null
  private var cameraPhotoFile: File? = null
  private val TAKE_PHOTO_REQUEST_CODE = 41286
  private val CAMERA_PERMISSION_REQUEST_CODE = 41287

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
          // Sao chép an toàn ảnh đã chọn vào sandbox dicom_cases của app
          val casesDir = File(reactContext.filesDir, "dicom_cases").apply { if (!exists()) mkdirs() }
          var displayName = "picked_${System.currentTimeMillis()}.jpg"
          var fileSize = -1L

          reactContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
              val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
              val sizeIndex = cursor.getColumnIndex(android.provider.OpenableColumns.SIZE)
              if (nameIndex != -1 && !cursor.isNull(nameIndex)) {
                val origName = cursor.getString(nameIndex)
                if (!origName.isNullOrBlank()) displayName = origName
              }
              if (sizeIndex != -1 && !cursor.isNull(sizeIndex)) {
                fileSize = cursor.getLong(sizeIndex)
              }
            }
          }

          val safeName = "ct_${System.currentTimeMillis()}_${displayName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")}"
          val targetFile = File(casesDir, safeName)
          reactContext.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(targetFile).use { output ->
              input.copyTo(output)
            }
          }

          val map = Arguments.createMap().apply {
            putBoolean("canceled", false)
            putString("uri", Uri.fromFile(targetFile).toString())
            putString("filePath", targetFile.absolutePath)
            putString("originalUri", uri.toString())
            putString("name", displayName)
            putDouble("size", if (fileSize > 0) fileSize.toDouble() else targetFile.length().toDouble())
          }
          promise.resolve(map)
        } catch (e: Exception) {
          promise.reject("ERR_PICKER", "Lỗi đọc hoặc sao chép ảnh đã chọn vào sandbox: ${e.message}", e)
        }
      } else if (requestCode == TAKE_PHOTO_REQUEST_CODE) {
        val promise = cameraPromise
        val photoFile = cameraPhotoFile
        cameraPromise = null
        cameraPhotoFile = null

        if (promise == null) return

        if (resultCode == Activity.RESULT_CANCELED || photoFile == null || !photoFile.exists() || photoFile.length() == 0L) {
          if (photoFile != null && photoFile.exists() && photoFile.length() == 0L) {
            photoFile.delete()
          }
          val map = Arguments.createMap().apply {
            putBoolean("canceled", true)
          }
          promise.resolve(map)
          return
        }

        if (resultCode != Activity.RESULT_OK) {
          val map = Arguments.createMap().apply {
            putBoolean("canceled", true)
          }
          promise.resolve(map)
          return
        }

        try {
          val map = Arguments.createMap().apply {
            putBoolean("canceled", false)
            putString("uri", Uri.fromFile(photoFile).toString())
            putString("filePath", photoFile.absolutePath)
            putString("name", photoFile.name)
            putDouble("size", photoFile.length().toDouble())
          }
          promise.resolve(map)
        } catch (e: Exception) {
          promise.reject("ERR_CAMERA", "Lỗi xử lý ảnh chụp từ camera: ${e.message}", e)
        }
      }
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  companion object {
    const val CURRENT_MODEL_RUN_ID = "20261122T082142_409115Z_GRADCAM"
    const val EXPECTED_FUSION_SHA256 = "cfdfc1ff4e42992475805531e505369214a7a1b7908bd9db41c00d3968fcaba9"
    const val EXPECTED_FUSION_BYTES = 110005844L
    const val EXPECTED_TAIL_BYTES = 9206972L
    const val EXPECTED_WEIGHTS_BYTES = 4718592L

    // Bảng tra cứu màu Jet 256 phần tử chuẩn xác 100% từ Matplotlib Jet Colormap (định dạng ARGB)
    val JET_LUT = intArrayOf(
      -16777089, -16777084, -16777080, -16777075, -16777071, -16777066, -16777062, -16777057, -16777053, -16777048,
      -16777044, -16777039, -16777034, -16777030, -16777025, -16777021, -16777016, -16777012, -16777007, -16777003,
      -16776998, -16776994, -16776989, -16776984, -16776980, -16776975, -16776971, -16776966, -16776962, -16776961,
      -16776961, -16776961, -16776961, -16775937, -16774913, -16773889, -16772865, -16771841, -16770817, -16769793,
      -16768769, -16767745, -16766721, -16765697, -16764673, -16763649, -16762625, -16761601, -16760577, -16759553,
      -16758529, -16757505, -16756481, -16755457, -16754433, -16753409, -16752385, -16751361, -16750337, -16749313,
      -16748289, -16747265, -16746241, -16745217, -16744193, -16743169, -16742145, -16741121, -16740097, -16739073,
      -16738049, -16737025, -16736001, -16734977, -16733953, -16732929, -16731905, -16730881, -16729857, -16728833,
      -16727809, -16726785, -16725761, -16724737, -16723713, -16722689, -16721665, -16720642, -16719622, -16718601,
      -16586508, -16388879, -16191251, -15928086, -15730457, -15532828, -15335455, -15138851, -14876710, -14680105,
      -14483500, -14286896, -14024755, -13828150, -13631545, -13434941, -13172800, -12976195, -12779590, -12582985,
      -12386381, -12124240, -11927635, -11731030, -11534426, -11272285, -11075680, -10879075, -10682470, -10485866,
      -10223725, -10027120, -9830515, -9633911, -9371770, -9175165, -8978560, -8781955, -8585351, -8323210,
      -8126605, -7930000, -7733396, -7471255, -7274650, -7078045, -6881441, -6619300, -6422695, -6226090,
      -6029485, -5832881, -5570740, -5374135, -5177530, -4980926, -4718785, -4522180, -4325575, -4128970,
      -3932366, -3670225, -3473620, -3277015, -3080411, -2818270, -2621665, -2425060, -2228456, -2031851,
      -1769710, -1573105, -1376500, -1179896, -918523, -722942, -527360, -331776, -70400, -5888,
      -6912, -7680, -8704, -9728, -10496, -11520, -12544, -13568, -14336, -15360,
      -16384, -17152, -18176, -19200, -20224, -20992, -22016, -23040, -23808, -24832,
      -25856, -26624, -27648, -28672, -29696, -30464, -31488, -32512, -33280, -34304,
      -35328, -36096, -37120, -38144, -39168, -39936, -40960, -41984, -42752, -43776,
      -44800, -45824, -46592, -47616, -48640, -49408, -50432, -51456, -52224, -53248,
      -54272, -55296, -56064, -57088, -58112, -58880, -59904, -126464, -389376, -718080,
      -981248, -1309952, -1572864, -1900544, -2228224, -2490368, -2818048, -3080192, -3407872, -3670016,
      -3997696, -4259840, -4587520, -4849664, -5177344, -5505024, -5767168, -6094848, -6356992, -6684672,
      -6946816, -7274496, -7536640, -7864320, -8126464, -8454144
    )

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

  data class SuspiciousRegionData(
    val id: Int,
    val x: Int,
    val y: Int,
    val w: Int,
    val h: Int,
    val areaPx: Int,
    val areaRatio: Float,
    val camMax: Float,
    val camMean: Float
  )

  private class CompStat(
    val id: Int,
    var area: Int = 0,
    var minX: Int = Int.MAX_VALUE,
    var minY: Int = Int.MAX_VALUE,
    var maxX: Int = Int.MIN_VALUE,
    var maxY: Int = Int.MIN_VALUE
  )

  private data class ColorQuad(
    val color: Int,
    val r: Int,
    val g: Int,
    val b: Int
  )

  private fun getEllipseOffsets(kInput: Int): List<Pair<Int, Int>> {
    val k = maxOf(3, if (kInput % 2 == 0) kInput + 1 else kInput)
    val rx = k / 2.0
    val ry = k / 2.0
    val rx2 = rx * rx
    val ry2 = ry * ry
    val offsets = ArrayList<Pair<Int, Int>>()
    val half = k / 2
    for (dy in -half..half) {
      val dy2 = dy * dy
      for (dx in -half..half) {
        val dx2 = dx * dx
        if ((dx2 / rx2) + (dy2 / ry2) <= 1.05) {
          offsets.add(Pair(dx, dy))
        }
      }
    }
    return offsets
  }

  private fun binaryDilate(src: BooleanArray, w: Int, h: Int, offsets: List<Pair<Int, Int>>): BooleanArray {
    val dst = BooleanArray(w * h)
    for (y in 0 until h) {
      val rowOff = y * w
      for (x in 0 until w) {
        if (src[rowOff + x]) {
          for (off in offsets) {
            val nx = x + off.first
            val ny = y + off.second
            if (nx in 0 until w && ny in 0 until h) {
              dst[ny * w + nx] = true
            }
          }
        }
      }
    }
    return dst
  }

  private fun binaryErode(src: BooleanArray, w: Int, h: Int, offsets: List<Pair<Int, Int>>): BooleanArray {
    val dst = BooleanArray(w * h)
    for (y in 0 until h) {
      val rowOff = y * w
      for (x in 0 until w) {
        if (!src[rowOff + x]) continue
        var all = true
        for (off in offsets) {
          val nx = x + off.first
          val ny = y + off.second
          if (nx !in 0 until w || ny !in 0 until h || !src[ny * w + nx]) {
            all = false
            break
          }
        }
        dst[rowOff + x] = all
      }
    }
    return dst
  }

  private fun binaryOpen(src: BooleanArray, w: Int, h: Int, offsets: List<Pair<Int, Int>>): BooleanArray {
    return binaryDilate(binaryErode(src, w, h, offsets), w, h, offsets)
  }

  private fun binaryClose(src: BooleanArray, w: Int, h: Int, offsets: List<Pair<Int, Int>>): BooleanArray {
    return binaryErode(binaryDilate(src, w, h, offsets), w, h, offsets)
  }

  private fun connectedComponentsWithStats(
    mask: BooleanArray,
    w: Int,
    h: Int
  ): Pair<IntArray, List<CompStat>> {
    val n = w * h
    val labels = IntArray(n)
    val stats = ArrayList<CompStat>()
    stats.add(CompStat(0, 0, 0, 0, 0, 0))

    val queue = IntArray(n)
    var currentLabel = 0

    for (idx in 0 until n) {
      if (!mask[idx] || labels[idx] != 0) continue

      currentLabel++
      var head = 0
      var tail = 0
      queue[tail++] = idx
      labels[idx] = currentLabel

      val y0 = idx / w
      val x0 = idx % w
      val stat = CompStat(currentLabel, 0, x0, y0, x0, y0)

      while (head < tail) {
        val cur = queue[head++]
        val cy = cur / w
        val cx = cur % w
        stat.area++
        if (cx < stat.minX) stat.minX = cx
        if (cx > stat.maxX) stat.maxX = cx
        if (cy < stat.minY) stat.minY = cy
        if (cy > stat.maxY) stat.maxY = cy

        for (dy in -1..1) {
          val ny = cy + dy
          if (ny !in 0 until h) continue
          val rowOff = ny * w
          for (dx in -1..1) {
            if (dx == 0 && dy == 0) continue
            val nx = cx + dx
            if (nx !in 0 until w) continue
            val nIdx = rowOff + nx
            if (mask[nIdx] && labels[nIdx] == 0) {
              labels[nIdx] = currentLabel
              queue[tail++] = nIdx
            }
          }
        }
      }
      stats.add(stat)
    }

    return Pair(labels, stats)
  }

  private fun fillHoles(mask: BooleanArray, w: Int, h: Int): BooleanArray {
    val n = w * h
    val isOutside = BooleanArray(n)
    val queue = IntArray(n)
    var head = 0
    var tail = 0

    for (x in 0 until w) {
      if (!mask[x] && !isOutside[x]) {
        isOutside[x] = true
        queue[tail++] = x
      }
      val bIdx = (h - 1) * w + x
      if (!mask[bIdx] && !isOutside[bIdx]) {
        isOutside[bIdx] = true
        queue[tail++] = bIdx
      }
    }
    for (y in 0 until h) {
      val lIdx = y * w
      if (!mask[lIdx] && !isOutside[lIdx]) {
        isOutside[lIdx] = true
        queue[tail++] = lIdx
      }
      val rIdx = y * w + (w - 1)
      if (!mask[rIdx] && !isOutside[rIdx]) {
        isOutside[rIdx] = true
        queue[tail++] = rIdx
      }
    }

    while (head < tail) {
      val cur = queue[head++]
      val cy = cur / w
      val cx = cur % w

      if (cx > 0) {
        val nIdx = cur - 1
        if (!mask[nIdx] && !isOutside[nIdx]) {
          isOutside[nIdx] = true
          queue[tail++] = nIdx
        }
      }
      if (cx < w - 1) {
        val nIdx = cur + 1
        if (!mask[nIdx] && !isOutside[nIdx]) {
          isOutside[nIdx] = true
          queue[tail++] = nIdx
        }
      }
      if (cy > 0) {
        val nIdx = cur - w
        if (!mask[nIdx] && !isOutside[nIdx]) {
          isOutside[nIdx] = true
          queue[tail++] = nIdx
        }
      }
      if (cy < h - 1) {
        val nIdx = cur + w
        if (!mask[nIdx] && !isOutside[nIdx]) {
          isOutside[nIdx] = true
          queue[tail++] = nIdx
        }
      }
    }

    val filled = BooleanArray(n)
    for (i in 0 until n) {
      filled[i] = !isOutside[i]
    }
    return filled
  }

  private fun taoMaskPhoi(origPixels: IntArray, w: Int, h: Int): Pair<BooleanArray?, String> {
    val n = w * h
    val gray = IntArray(n)
    for (i in 0 until n) {
      val p = origPixels[i]
      val r = (p shr 16) and 0xFF
      val g = (p shr 8) and 0xFF
      val b = p and 0xFF
      gray[i] = (0.299 * r + 0.587 * g + 0.114 * b).toInt().coerceIn(0, 255)
    }

    val blurH = IntArray(n)
    for (y in 0 until h) {
      val row = y * w
      for (x in 0 until w) {
        val x0 = (x - 2).coerceIn(0, w - 1)
        val x1 = (x - 1).coerceIn(0, w - 1)
        val x2 = x
        val x3 = (x + 1).coerceIn(0, w - 1)
        val x4 = (x + 2).coerceIn(0, w - 1)
        val sum = gray[row + x0] + 4 * gray[row + x1] + 6 * gray[row + x2] + 4 * gray[row + x3] + gray[row + x4]
        blurH[row + x] = sum / 16
      }
    }
    val blur = IntArray(n)
    for (y in 0 until h) {
      val y0 = (y - 2).coerceIn(0, h - 1) * w
      val y1 = (y - 1).coerceIn(0, h - 1) * w
      val y2 = y * w
      val y3 = (y + 1).coerceIn(0, h - 1) * w
      val y4 = (y + 2).coerceIn(0, h - 1) * w
      for (x in 0 until w) {
        val sum = blurH[y0 + x] + 4 * blurH[y1 + x] + 6 * blurH[y2 + x] + 4 * blurH[y3 + x] + blurH[y4 + x]
        blur[y2 + x] = sum / 16
      }
    }

    val hist = IntArray(256)
    for (i in 0 until n) {
      hist[blur[i]]++
    }
    var totalSum = 0L
    for (t in 0..255) totalSum += t * hist[t].toLong()

    var weightB = 0L
    var sumB = 0L
    var maxVar = 0.0
    var otsuThreshold = 128

    for (t in 0..255) {
      weightB += hist[t]
      if (weightB == 0L) continue
      val weightF = n - weightB
      if (weightF == 0L) break

      sumB += t * hist[t].toLong()
      val meanB = sumB.toDouble() / weightB
      val meanF = (totalSum - sumB).toDouble() / weightF
      val varBetween = weightB.toDouble() * weightF.toDouble() * (meanB - meanF) * (meanB - meanF)
      if (varBetween > maxVar) {
        maxVar = varBetween
        otsuThreshold = t
      }
    }

    val sang = BooleanArray(n)
    for (i in 0 until n) {
      sang[i] = blur[i] >= otsuThreshold
    }

    val elip3 = getEllipseOffsets(3)
    val sangOpen = binaryOpen(sang, w, h, elip3)

    val (nhanSang, statsSang) = connectedComponentsWithStats(sangOpen, w, h)
    if (statsSang.size < 2) {
      return Pair(null, "KHONG_THAY_THAN_NGUOI")
    }
    var thanId = 1
    var maxThanArea = statsSang[1].area
    for (i in 2 until statsSang.size) {
      if (statsSang[i].area > maxThanArea) {
        maxThanArea = statsSang[i].area
        thanId = i
      }
    }

    val than = BooleanArray(n)
    for (i in 0 until n) {
      than[i] = nhanSang[i] == thanId
    }

    val thanDay = fillHoles(than, w, h)

    val toi = BooleanArray(n)
    for (i in 0 until n) {
      toi[i] = thanDay[i] && !sang[i]
    }

    val elip5 = getEllipseOffsets(5)
    val toiOpen = binaryOpen(toi, w, h, elip5)

    val (nhanToi, statsToi) = connectedComponentsWithStats(toiOpen, w, h)
    val minLungArea = (0.005f * w * h).toInt()
    val ungVien = ArrayList<CompStat>()
    for (i in 1 until statsToi.size) {
      if (statsToi[i].area >= minLungArea) {
        ungVien.add(statsToi[i])
      }
    }
    ungVien.sortByDescending { it.area }
    if (ungVien.isEmpty()) {
      return Pair(null, "KHONG_THAY_PHOI")
    }

    val topLungs = ungVien.take(2).map { it.id }.toSet()
    val phoi = BooleanArray(n)
    for (i in 0 until n) {
      phoi[i] = topLungs.contains(nhanToi[i])
    }

    val kVal = Math.round(minOf(w, h) * 0.03f).toInt()
    val elipK = getEllipseOffsets(kVal)
    val phoiClose = binaryClose(phoi, w, h, elipK)
    val phoiDay = fillHoles(phoiClose, w, h)
    val phoiDayDilated = binaryDilate(phoiDay, w, h, elipK)

    var lungCount = 0
    for (i in 0 until n) {
      if (phoiDayDilated[i]) lungCount++
    }
    val lungRatio = lungCount.toFloat() / n
    if (lungRatio < 0.03f) {
      return Pair(null, "MASK_QUA_NHO")
    }

    return Pair(phoiDayDilated, "OK")
  }

  private fun timVungNghiNgo(
    cam: FloatArray,
    mask: BooleanArray,
    w: Int,
    h: Int,
    kVal: Int
  ): Pair<List<SuspiciousRegionData>, BooleanArray> {
    val n = w * h
    val elipK = getEllipseOffsets(kVal)
    val loi = binaryErode(mask, w, h, elipK)

    val nong = BooleanArray(n)
    for (i in 0 until n) {
      nong[i] = (cam[i] >= 0.50f) && mask[i]
    }

    val (nhanNong, statsNong) = connectedComponentsWithStats(nong, w, h)
    val minArea = (0.002f * w * h).toInt()

    class UngVien(val camMax: Float, val id: Int, val area: Int, val stat: CompStat)
    val ungVienList = ArrayList<UngVien>()

    for (i in 1 until statsNong.size) {
      val st = statsNong[i]
      if (st.area < minArea) continue

      var overlapLoi = 0
      var cMax = 0.0f
      for (idx in 0 until n) {
        if (nhanNong[idx] == i) {
          if (loi[idx]) overlapLoi++
          if (cam[idx] > cMax) cMax = cam[idx]
        }
      }

      val ratioInCore = overlapLoi.toFloat() / st.area
      if (ratioInCore < 0.60f) continue

      ungVienList.add(UngVien(cMax, i, st.area, st))
    }

    ungVienList.sortByDescending { it.camMax }

    val filteredList = ArrayList<UngVien>()
    if (ungVienList.isNotEmpty()) {
      val manhNhat = ungVienList[0].camMax
      val thresholdSecondary = 0.75f * manhNhat
      for (u in ungVienList) {
        if (u.camMax >= thresholdSecondary) {
          filteredList.add(u)
        }
      }
    }

    val selected = filteredList.take(3)
    val maskVung = BooleanArray(n)
    val vungList = ArrayList<SuspiciousRegionData>()

    for ((index, u) in selected.withIndex()) {
      var sumCam = 0.0f
      for (idx in 0 until n) {
        if (nhanNong[idx] == u.id) {
          maskVung[idx] = true
          sumCam += cam[idx]
        }
      }
      val bw = u.stat.maxX - u.stat.minX + 1
      val bh = u.stat.maxY - u.stat.minY + 1
      val camMean = sumCam / u.area

      vungList.add(
        SuspiciousRegionData(
          id = index + 1,
          x = u.stat.minX,
          y = u.stat.minY,
          w = bw,
          h = bh,
          areaPx = u.area,
          areaRatio = u.area.toFloat() / n,
          camMax = u.camMax,
          camMean = camMean
        )
      )
    }

    return Pair(vungList, maskVung)
  }

  private fun quyetDinhVe(
    nhan: String,
    diem: Float,
    trangThaiMask: String,
    tongCam: Float
  ): Pair<Boolean, String> {
    if (nhan == "Normal") {
      return Pair(false, "Dự đoán Normal: không vẽ vùng nghi ngờ.")
    }
    if (diem < 0.80f) {
      val pct = (diem * 100).toInt()
      return Pair(false, "Độ tin cậy ${pct}% thấp hơn ngưỡng 80%: chỉ hiển thị kết quả phân loại.")
    }
    if (tongCam <= 1e-12f) {
      return Pair(false, "Grad-CAM bằng 0: không có vùng để vẽ.")
    }
    if (trangThaiMask != "OK") {
      return Pair(false, "Không tách được vùng phổi ($trangThaiMask): không vẽ.")
    }
    return Pair(true, "Vẽ vùng nghi ngờ trong phổi.")
  }

  private fun renderOverlays(
    lungMask: BooleanArray?,
    maskVung: BooleanArray,
    vungList: List<SuspiciousRegionData>,
    predictedLabel: String,
    w: Int,
    h: Int,
    camDir: File,
    timestamp: Long
  ): Pair<String?, String?> {
    val n = w * h

    val quad = when (predictedLabel) {
      "Malignant" -> ColorQuad(0xFFE61919.toInt(), 230, 25, 25)
      "Benign" -> ColorQuad(0xFFFF8C00.toInt(), 255, 140, 0)
      else -> ColorQuad(0xFFE61919.toInt(), 230, 25, 25)
    }
    val classColor = quad.color
    val classR = quad.r
    val classG = quad.g
    val classB = quad.b

    var lungContourUri: String? = null
    if (lungMask != null) {
      val lungEdge = BooleanArray(n)
      for (y in 0 until h) {
        val row = y * w
        for (x in 0 until w) {
          if (lungMask[row + x]) {
            if (x == 0 || x == w - 1 || y == 0 || y == h - 1 ||
                !lungMask[row + x - 1] || !lungMask[row + x + 1] ||
                !lungMask[(y - 1) * w + x] || !lungMask[(y + 1) * w + x]) {
              lungEdge[row + x] = true
            }
          }
        }
      }
      val elip3 = getEllipseOffsets(3)
      val dilated = binaryDilate(lungEdge, w, h, elip3)

      val contourPixels = IntArray(n)
      val greenColor = 0xFF00C800.toInt()
      for (i in 0 until n) {
        if (dilated[i]) {
          contourPixels[i] = greenColor
        }
      }
      val contourFile = File(camDir, "lung_contour_${timestamp}.png")
      val contourBmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
      contourBmp.setPixels(contourPixels, 0, w, 0, 0, w, h)
      FileOutputStream(contourFile).use { fos ->
        contourBmp.compress(Bitmap.CompressFormat.PNG, 100, fos)
      }
      contourBmp.recycle()
      lungContourUri = Uri.fromFile(contourFile).toString()
    }

    var suspiciousOverlayUri: String? = null
    var hasSuspiciousPixels = false
    for (i in 0 until n) {
      if (maskVung[i]) {
        hasSuspiciousPixels = true
        break
      }
    }

    if (hasSuspiciousPixels) {
      val vungEdge = BooleanArray(n)
      for (y in 0 until h) {
        val row = y * w
        for (x in 0 until w) {
          if (maskVung[row + x]) {
            if (x == 0 || x == w - 1 || y == 0 || y == h - 1 ||
                !maskVung[row + x - 1] || !maskVung[row + x + 1] ||
                !maskVung[(y - 1) * w + x] || !maskVung[(y + 1) * w + x]) {
              vungEdge[row + x] = true
            }
          }
        }
      }
      val elip3 = getEllipseOffsets(3)
      val dilated = binaryDilate(vungEdge, w, h, elip3)

      val suspPixels = IntArray(n)
      val tintColor = Color.argb(89, classR, classG, classB)
      for (i in 0 until n) {
        if (dilated[i]) {
          suspPixels[i] = classColor
        } else if (maskVung[i]) {
          suspPixels[i] = tintColor
        }
      }

      val suspBmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
      suspBmp.setPixels(suspPixels, 0, w, 0, 0, w, h)
      val suspCanvas = Canvas(suspBmp)
      val boxPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.0f
        color = classColor
        isAntiAlias = true
      }
      val textPaint = Paint().apply {
        color = classColor
        textSize = 18.0f
        isFakeBoldText = true
        isAntiAlias = true
      }

      for (v in vungList) {
        suspCanvas.drawRect(v.x.toFloat(), v.y.toFloat(), (v.x + v.w).toFloat(), (v.y + v.h).toFloat(), boxPaint)
        val textY = maxOf(18.0f, v.y.toFloat() - 4.0f)
        suspCanvas.drawText("${v.id}", v.x.toFloat() + 2.0f, textY, textPaint)
      }

      val suspFile = File(camDir, "suspicious_overlay_${timestamp}.png")
      FileOutputStream(suspFile).use { fos ->
        suspBmp.compress(Bitmap.CompressFormat.PNG, 100, fos)
      }
      suspBmp.recycle()
      suspiciousOverlayUri = Uri.fromFile(suspFile).toString()
    }

    return Pair(lungContourUri, suspiciousOverlayUri)
  }

  @Synchronized
  private fun ensureInitialized() {
    if (isInitialized && ortSession != null && tfliteInterpreter != null && tailInterpreter != null && w1Data != null && w0Data != null) return

    val modelsDir = File(reactContext.filesDir, "models")
    if (!modelsDir.exists()) modelsDir.mkdirs()

    val vitOnnxFile = File(modelsDir, "vit_cls.onnx")
    val vitDataFile = File(modelsDir, "vit_cls.onnx.data")
    val fusionFile = File(modelsDir, "fusion_model.tflite")
    val tailFile = File(modelsDir, "gradcam_tail.tflite")
    val weightsFile = File(modelsDir, "gradcam_weights.bin")
    val versionMarkerFile = File(modelsDir, "model_version.txt")

    // Kiểm tra tính đồng bộ của bộ mô hình (Cache Invalidation theo run_id & byte size)
    val cachedVersion = if (versionMarkerFile.exists()) {
      try { versionMarkerFile.readText().trim() } catch (e: Exception) { "" }
    } else ""

    val needsUpdate = !fusionFile.exists() ||
                      fusionFile.length() != EXPECTED_FUSION_BYTES ||
                      !tailFile.exists() ||
                      tailFile.length() != EXPECTED_TAIL_BYTES ||
                      !weightsFile.exists() ||
                      weightsFile.length() != EXPECTED_WEIGHTS_BYTES ||
                      cachedVersion != CURRENT_MODEL_RUN_ID

    if (needsUpdate) {
      android.util.Log.i("LungCtPipeline", "[MODEL_CACHE] Phát hiện phiên bản mô hình mới hoặc cache cũ ('$cachedVersion' != '$CURRENT_MODEL_RUN_ID'). Đang đồng bộ từ APK assets...")
      try {
        reactContext.assets.open("models/fusion_model.tflite").use { input ->
          FileOutputStream(fusionFile).use { output -> input.copyTo(output) }
        }
        reactContext.assets.open("models/gradcam_tail.tflite").use { input ->
          FileOutputStream(tailFile).use { output -> input.copyTo(output) }
        }
        reactContext.assets.open("models/gradcam_weights.bin").use { input ->
          FileOutputStream(weightsFile).use { output -> input.copyTo(output) }
        }
        versionMarkerFile.writeText(CURRENT_MODEL_RUN_ID)
        android.util.Log.i(
          "LungCtPipeline",
          "[MODEL_CACHE] Đã cập nhật toàn bộ bundle mô hình on-device thành công: fusion=${fusionFile.length()}B, tail=${tailFile.length()}B, weights=${weightsFile.length()}B, run_id=$CURRENT_MODEL_RUN_ID"
        )
      } catch (e: Exception) {
        android.util.Log.e("LungCtPipeline", "[MODEL_CACHE] Lỗi cập nhật bundle mô hình từ assets: ${e.message}", e)
      }
    }

    // 1. Nạp ViT ONNX + data nếu chưa có
    if (!vitOnnxFile.exists() || vitOnnxFile.length() == 0L) {
      try {
        reactContext.assets.open("models/vit_cls.onnx").use { input ->
          FileOutputStream(vitOnnxFile).use { output -> input.copyTo(output) }
        }
      } catch (e: Exception) {
        android.util.Log.w("LungCtPipeline", "Không thể copy vit_cls.onnx từ assets: ${e.message}")
      }
    }
    if (!vitDataFile.exists() || vitDataFile.length() == 0L) {
      try {
        reactContext.assets.open("models/vit_cls.onnx.data").use { input ->
          FileOutputStream(vitDataFile).use { output -> input.copyTo(output) }
        }
      } catch (e: Exception) {
        android.util.Log.w("LungCtPipeline", "Không thể copy vit_cls.onnx.data từ assets: ${e.message}")
      }
    }

    // Đóng interpreter cũ nếu nạp lại model mới
    if (needsUpdate) {
      if (tfliteInterpreter != null) {
        try { tfliteInterpreter?.close() } catch (e: Exception) {}
        tfliteInterpreter = null
      }
      if (tailInterpreter != null) {
        try { tailInterpreter?.close() } catch (e: Exception) {}
        tailInterpreter = null
      }
      w1Data = null
      w0Data = null
    }

    // Khởi tạo OrtSession
    if (ortEnv == null) {
      ortEnv = OrtEnvironment.getEnvironment()
    }
    if (ortSession == null) {
      val sessionOptions = OrtSession.SessionOptions()
      ortSession = ortEnv!!.createSession(vitOnnxFile.absolutePath, sessionOptions)
    }

    // Khởi tạo Fusion TFLite Interpreter từ memory-mapped ByteBuffer
    if (tfliteInterpreter == null) {
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
    }

    // Khởi tạo Grad-CAM Tail Interpreter từ memory-mapped ByteBuffer với batch=256
    if (tailInterpreter == null) {
      FileInputStream(tailFile).use { fileInputStream ->
        val fileChannel = fileInputStream.channel
        val tailModelBuffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, 0L, fileChannel.size())
        val tailOptions = Interpreter.Options().apply {
          setNumThreads(4)
        }
        val interp = Interpreter(tailModelBuffer, tailOptions)
        interp.resizeInput(0, intArrayOf(256, 256))
        interp.resizeInput(1, intArrayOf(256, 256))
        interp.allocateTensors()
        tailInterpreter = interp
      }
    }

    // Nạp ma trận trọng số W1 (512x256) và W0 (2048x512) từ gradcam_weights.bin
    if (w1Data == null || w0Data == null) {
      FileInputStream(weightsFile).use { fileInputStream ->
        val fileChannel = fileInputStream.channel
        val byteBuf = fileChannel.map(FileChannel.MapMode.READ_ONLY, 0L, fileChannel.size())
        byteBuf.order(ByteOrder.LITTLE_ENDIAN)
        val floatBuf = byteBuf.asFloatBuffer()

        val w1 = FloatArray(512 * 256)
        floatBuf.get(w1)
        w1Data = w1

        val w0 = FloatArray(2048 * 512)
        floatBuf.get(w0)
        w0Data = w0
      }
    }

    // Cấp phát các Direct FloatBuffers dùng chung cho suy luận đa đầu ra và Grad-CAM
    if (outA0Buf == null) {
      outA0Buf = ByteBuffer.allocateDirect(1 * 512 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      outActivationsBuf = ByteBuffer.allocateDirect(1 * 16 * 16 * 2048 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      outCnnTokBuf = ByteBuffer.allocateDirect(1 * 256 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      outVitTokBuf = ByteBuffer.allocateDirect(1 * 256 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      outScoresBuf = ByteBuffer.allocateDirect(1 * 3 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()

      tailVitBuf = ByteBuffer.allocateDirect(256 * 256 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      tailCnnBuf = ByteBuffer.allocateDirect(256 * 256 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
      tailOutBuf = ByteBuffer.allocateDirect(256 * 3 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
    }

    android.util.Log.i(
      "LungCtPipeline",
      "[MODEL_LOADED] Sẵn sàng suy luận on-device & Grad-CAM: run_id=$CURRENT_MODEL_RUN_ID, fusion_size=${fusionFile.length()} bytes, tail_size=${tailFile.length()} bytes, weights_size=${weightsFile.length()} bytes"
    )

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

    if (pickerPromise != null || cameraPromise != null) {
      promise.reject("ERR_BUSY", "Trình chọn ảnh hoặc máy ảnh đang mở. Vui lòng hoàn tất hoặc hủy thao tác hiện tại.")
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
   * Mở Intent chụp ảnh từ Camera:
   * Chụp ảnh và lưu trực tiếp vào thư mục an toàn của app (reactContext.filesDir/dicom_cases)
   */
  @ReactMethod
  fun takePhotoWithCamera(promise: Promise) {
    val currentActivity = reactContext.currentActivity
    if (currentActivity == null) {
      promise.reject("ERR_NO_ACTIVITY", "Không tìm thấy Activity hiện tại để mở máy ảnh.")
      return
    }

    val hasCameraPermission = ContextCompat.checkSelfPermission(
      currentActivity,
      android.Manifest.permission.CAMERA
    ) == PackageManager.PERMISSION_GRANTED

    if (!hasCameraPermission) {
      if (currentActivity is PermissionAwareActivity) {
        currentActivity.requestPermissions(
          arrayOf(android.Manifest.permission.CAMERA),
          CAMERA_PERMISSION_REQUEST_CODE,
          object : PermissionListener {
            override fun onRequestPermissionsResult(
              requestCode: Int,
              permissions: Array<String>,
              grantResults: IntArray
            ): Boolean {
              if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                  launchCameraIntent(currentActivity, promise)
                } else {
                  val map = Arguments.createMap().apply {
                    putBoolean("canceled", true)
                    putString("error", "PERMISSION_DENIED")
                  }
                  promise.resolve(map)
                }
                return true
              }
              return false
            }
          }
        )
        return
      } else {
        promise.reject("ERR_PERMISSION", "Không thể yêu cầu quyền Camera từ Activity hiện tại.")
        return
      }
    }

    launchCameraIntent(currentActivity, promise)
  }

  private fun launchCameraIntent(activity: Activity, promise: Promise) {
    try {
      val casesDir = File(reactContext.filesDir, "dicom_cases").apply { if (!exists()) mkdirs() }
      val photoFile = File(casesDir, "camera_${System.currentTimeMillis()}.jpg")
      cameraPhotoFile = photoFile
      cameraPromise = promise

      val authority = "${reactContext.packageName}.fileprovider"
      val photoUri = androidx.core.content.FileProvider.getUriForFile(
        reactContext,
        authority,
        photoFile
      )

      val intent = Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE).apply {
        putExtra(android.provider.MediaStore.EXTRA_OUTPUT, photoUri)
        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

      activity.startActivityForResult(intent, TAKE_PHOTO_REQUEST_CODE)
    } catch (e: Exception) {
      cameraPromise = null
      cameraPhotoFile?.let { if (it.exists() && it.length() == 0L) it.delete() }
      cameraPhotoFile = null
      promise.reject("ERR_LAUNCH_CAMERA", "Không thể khởi chạy máy ảnh: ${e.message}", e)
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

      // 5. Chạy Fusion TFLite đa đầu ra:
      // Inputs:
      // Input 0: serving_default_vit_features_input:0 [1, 768] Float32
      // Input 1: serving_default_image_input:0 [1, 512, 512, 3] Float32
      val clsInput = Array(1) { clsToken }
      val inputs = arrayOf<Any>(clsInput, cnnBuffer)

      val outA0 = outA0Buf!!.apply { rewind() }
      val outActivations = outActivationsBuf!!.apply { rewind() }
      val outCnnTok = outCnnTokBuf!!.apply { rewind() }
      val outVitTok = outVitTokBuf!!.apply { rewind() }
      val outScores = outScoresBuf!!.apply { rewind() }

      val outputsMap = HashMap<Int, Any>()
      outputsMap[0] = outA0
      outputsMap[1] = outActivations
      outputsMap[2] = outCnnTok
      outputsMap[3] = outVitTok
      outputsMap[4] = outScores

      val fusionStart = System.currentTimeMillis()
      tfliteInterpreter!!.runForMultipleInputsOutputs(inputs, outputsMap)
      val fusionDuration = System.currentTimeMillis() - fusionStart

      outScores.rewind()
      val benignScore = outScores.get(0).toDouble()
      val malignantScore = outScores.get(1).toDouble()
      val normalScore = outScores.get(2).toDouble()
      val scores = doubleArrayOf(benignScore, malignantScore, normalScore)

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

      // 6. Tính toán giải thích Grad-CAM On-Device thuần túy (conv5_block3_out)
      val gradcamStart = System.currentTimeMillis()
      var gradcamAvailable = false
      var gradcamStatus = "UNAVAILABLE"
      var gradcamUri: String? = null
      var gradcamNotice = ""

      var lungMaskStatus = "UNCHECKED"
      var lungHotRatio = 0.0
      var lungCamRatio = 0.0
      var drawSuspicious = false
      var decisionReason = ""
      var suspiciousCount = 0
      var lungMaskUri: String? = null
      var suspiciousOverlayUri: String? = null
      var triPanelUri: String? = null
      var finalVungList: List<SuspiciousRegionData> = emptyList()

      try {
        val w1 = w1Data
        val w0 = w0Data
        val tailInterp = tailInterpreter
        val vBatch = tailVitBuf
        val cBatch = tailCnnBuf
        val tOut = tailOutBuf

        if (w1 != null && w0 != null && tailInterp != null && vBatch != null && cBatch != null && tOut != null) {
          val vitTok = FloatArray(256)
          outVitTok.rewind()
          outVitTok.get(vitTok)

          val cnnTok = FloatArray(256)
          outCnnTok.rewind()
          outCnnTok.get(cnnTok)

          val a0 = FloatArray(512)
          outA0.rewind()
          outA0.get(a0)

          val eps = 1e-3f

          // Chuẩn bị vBatch (256 hàng sao chép vitTok)
          vBatch.rewind()
          for (r in 0 until 256) {
            vBatch.put(vitTok)
          }
          vBatch.rewind()

          val tailInputs = arrayOf<Any>(vBatch, cBatch)
          val tailOutputsMap = HashMap<Int, Any>()
          tailOutputsMap[0] = tOut

          // 6.1. Positive perturbation (cnnTok[c] + eps)
          cBatch.rewind()
          for (r in 0 until 256) {
            for (c in 0 until 256) {
              val base = cnnTok[c]
              cBatch.put(if (c == r) base + eps else base)
            }
          }
          cBatch.rewind()
          tOut.rewind()

          tailInterp.runForMultipleInputsOutputs(tailInputs, tailOutputsMap)

          val sPos = FloatArray(256)
          tOut.rewind()
          for (r in 0 until 256) {
            sPos[r] = tOut.get(r * 3 + maxIdx)
          }

          // 6.2. Negative perturbation (cnnTok[c] - eps)
          cBatch.rewind()
          for (r in 0 until 256) {
            for (c in 0 until 256) {
              val base = cnnTok[c]
              cBatch.put(if (c == r) base - eps else base)
            }
          }
          cBatch.rewind()
          vBatch.rewind()
          tOut.rewind()

          tailInterp.runForMultipleInputsOutputs(tailInputs, tailOutputsMap)

          val sNeg = FloatArray(256)
          tOut.rewind()
          for (r in 0 until 256) {
            sNeg[r] = tOut.get(r * 3 + maxIdx)
          }

          // 6.3. Đạo hàm sai phân trung tâm v_grad (d score_c / d cnn_tok)
          val vGrad = FloatArray(256)
          for (j in 0 until 256) {
            vGrad[j] = (sPos[j] - sNeg[j]) / (2.0f * eps)
          }

          // 6.4. Lan truyền ngược qua W1 (512x256) với đạo hàm ReLU cnn_tok > 0
          val d1 = FloatArray(512)
          for (i in 0 until 512) {
            var sum = 0.0f
            val rowOff = i * 256
            for (j in 0 until 256) {
              if (cnnTok[j] > 0.0f) {
                sum += vGrad[j] * w1[rowOff + j]
              }
            }
            d1[i] = sum
          }

          // 6.5. Lan truyền ngược qua W0 (2048x512) với đạo hàm ReLU a0 > 0
          val w = FloatArray(2048)
          for (k in 0 until 2048) {
            var sum = 0.0f
            val rowOff = k * 512
            for (i in 0 until 512) {
              if (a0[i] > 0.0f) {
                sum += d1[i] * w0[rowOff + i]
              }
            }
            w[k] = sum
          }

          // 6.6. Trọng số kết hợp tuyến tính với Activations conv5_block3_out (16x16x2048)
          val cam16 = FloatArray(16 * 16)
          var maxCam = 0.0f
          outActivations.rewind()
          for (pos in 0 until 256) {
            val cellOff = pos * 2048
            var sum = 0.0f
            for (k in 0 until 2048) {
              sum += w[k] * outActivations.get(cellOff + k)
            }
            val relu = if (sum > 0.0f) sum else 0.0f
            cam16[pos] = relu
            if (relu > maxCam) maxCam = relu
          }

          val targetW = origW
          val targetH = origH
          val nTarget = targetW * targetH
          val camNorm = FloatArray(nTarget)
          val camPixels = IntArray(nTarget)

          var tongCam = 0.0f
          val scaleX = 15.0f / (targetW - 1).coerceAtLeast(1)
          val scaleY = 15.0f / (targetH - 1).coerceAtLeast(1)

          if (maxCam > 1e-12f) {
            for (y in 0 until targetH) {
              val gy = y * scaleY
              val y0 = gy.toInt().coerceIn(0, 15)
              val y1 = (y0 + 1).coerceIn(0, 15)
              val dy = gy - y0
              val rowOffset = y * targetW

              for (x in 0 until targetW) {
                val gx = x * scaleX
                val x0 = gx.toInt().coerceIn(0, 15)
                val x1 = (x0 + 1).coerceIn(0, 15)
                val dx = gx - x0

                val c00 = cam16[y0 * 16 + x0]
                val c01 = cam16[y0 * 16 + x1]
                val c10 = cam16[y1 * 16 + x0]
                val c11 = cam16[y1 * 16 + x1]

                val interp = (1.0f - dx) * (1.0f - dy) * c00 +
                             dx * (1.0f - dy) * c01 +
                             (1.0f - dx) * dy * c10 +
                             dx * dy * c11

                val norm = (interp / maxCam).coerceIn(0.0f, 1.0f)
                camNorm[rowOffset + x] = norm
                tongCam += norm
                val lutIdx = (norm * 255.0f).toInt().coerceIn(0, 255)
                camPixels[rowOffset + x] = JET_LUT[lutIdx]
              }
            }
          }

          // 6.7. Xử lý bão hòa Softmax (ZERO_CAM) và lưu Bitmap bản đồ nhiệt
          val camDir = File(reactContext.cacheDir, "gradcam_cache").apply { if (!exists()) mkdirs() }
          val renderTimestamp = System.currentTimeMillis()

          if (maxCam <= 1e-12f) {
            gradcamAvailable = false
            gradcamStatus = "ZERO_CAM"
            gradcamNotice = "Bản đồ nhiệt bằng 0 do gradient bão hòa (độ tin cậy tiệm cận tuyệt đối)"
          } else {
            val camFile = File(camDir, "cam_${renderTimestamp}.png")
            val camBitmap = Bitmap.createBitmap(camPixels, targetW, targetH, Bitmap.Config.ARGB_8888)
            FileOutputStream(camFile).use { fos ->
              camBitmap.compress(Bitmap.CompressFormat.PNG, 100, fos)
            }
            camBitmap.recycle()

            gradcamAvailable = true
            gradcamStatus = "PASS"
            gradcamUri = Uri.fromFile(camFile).toString()
            gradcamNotice = "Grad-CAM On-Device Native (conv5_block3_out, Jet Colormap)"
          }

          // 6.8. Phân đoạn phổi & Đánh tô vùng nghi ngờ Colab (Mục 24.2 & Mục 28)
          val (lungMask, maskStatus) = taoMaskPhoi(origPixels, targetW, targetH)
          lungMaskStatus = maskStatus

          var camInLung = 0.0f
          var hotInLung = 0
          var hotCount = 0

          for (i in 0 until nTarget) {
            val v = camNorm[i]
            val isHot = v >= 0.50f
            if (isHot) hotCount++
            if (lungMask != null && lungMask[i]) {
              camInLung += v
              if (isHot) hotInLung++
            }
          }

          lungCamRatio = if (tongCam > 0f && lungMask != null) (camInLung / tongCam).toDouble() else 0.0
          lungHotRatio = if (hotCount > 0 && lungMask != null) (hotInLung.toDouble() / hotCount.toDouble()) else 0.0

          val (shouldDraw, decisionReasonText) = quyetDinhVe(predictedLabel, maxScore.toFloat(), maskStatus, tongCam)
          drawSuspicious = shouldDraw
          decisionReason = decisionReasonText
          var maskVung = BooleanArray(nTarget)

          val kVal = Math.round(minOf(targetW, targetH) * 0.03f).toInt()
          if (drawSuspicious && lungMask != null) {
            val (vList, mVung) = timVungNghiNgo(camNorm, lungMask, targetW, targetH, kVal)
            if (vList.isEmpty()) {
              drawSuspicious = false
              decisionReason = "Vùng chú ý của mô hình không nằm trong phổi: không vẽ để tránh khoanh sai chỗ."
            } else {
              finalVungList = vList
              suspiciousCount = vList.size
              maskVung = mVung
            }
          }

          // 6.9. Render ảnh viền phổi và ảnh lớp phủ vùng nghi ngờ
          val (contourUri, overlayUri) = renderOverlays(
            lungMask,
            maskVung,
            finalVungList,
            predictedLabel,
            targetW,
            targetH,
            camDir,
            renderTimestamp
          )
          lungMaskUri = contourUri
          suspiciousOverlayUri = overlayUri
          triPanelUri = null
        }
      } catch (camErr: Throwable) {
        android.util.Log.e("LungCtPipeline", "Lỗi tính Grad-CAM", camErr)
        gradcamAvailable = false
        gradcamStatus = "FAIL"
        gradcamNotice = "Lỗi khi sinh bản đồ nhiệt Grad-CAM: ${camErr.message}"
      }
      val gradcamDuration = System.currentTimeMillis() - gradcamStart

      val totalDuration = System.currentTimeMillis() - totalStart

      android.util.Log.i(
        "LungCtPipeline",
        "[INFERENCE_RUN] model=$CURRENT_MODEL_RUN_ID, source=$sourceDesc, origSize=${origW}x${origH}, pred=$predictedLabel, " +
        "Benign=${"%.6f".format(benignScore)}, Malignant=${"%.6f".format(malignantScore)}, Normal=${"%.6f".format(normalScore)}, " +
        "vitLatency=${vitDuration}ms, fusionLatency=${fusionDuration}ms, gradcamLatency=${gradcamDuration}ms, total=${totalDuration}ms, gradcamStatus=$gradcamStatus, suspiciousCount=$suspiciousCount"
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
          putDouble("gradcamMs", gradcamDuration.toDouble())
          putDouble("totalInferenceMs", (vitDuration + fusionDuration + gradcamDuration).toDouble())
          putDouble("totalOverallMs", totalDuration.toDouble())
        }
        putMap("latency", latencyMap)

        putBoolean("gradcamAvailable", gradcamAvailable)
        putString("gradcamStatus", gradcamStatus)
        if (gradcamUri != null) {
          putString("gradcamUri", gradcamUri)
        }
        putString("gradcamNotice", gradcamNotice)

        putString("lungMaskStatus", lungMaskStatus)
        putDouble("lungHotRatio", lungHotRatio)
        putDouble("lungCamRatio", lungCamRatio)
        putBoolean("drawSuspicious", drawSuspicious)
        putString("decisionReason", decisionReason)
        putInt("suspiciousCount", suspiciousCount)
        if (lungMaskUri != null) putString("lungMaskUri", lungMaskUri)
        if (suspiciousOverlayUri != null) putString("suspiciousOverlayUri", suspiciousOverlayUri)
        if (triPanelUri != null) putString("triPanelUri", triPanelUri)

        val regionsArray = Arguments.createArray()
        for (v in finalVungList) {
          val rMap = Arguments.createMap().apply {
            putInt("id", v.id)
            putInt("x", v.x)
            putInt("y", v.y)
            putInt("w", v.w)
            putInt("h", v.h)
            putInt("areaPx", v.areaPx)
            putDouble("areaRatio", v.areaRatio.toDouble())
            putDouble("camMax", v.camMax.toDouble())
            putDouble("camMean", v.camMean.toDouble())
          }
          regionsArray.pushMap(rMap)
        }
        putArray("suspiciousRegions", regionsArray)

        putBoolean("isMock", false)
        putString("verifiedSource", "on_device_fp32")
        putString("modelVersion", CURRENT_MODEL_RUN_ID)
        putString("modelSha256", EXPECTED_FUSION_SHA256)
        putString("imageSource", sourceDesc)
        putInt("imageWidth", origW)
        putInt("imageHeight", origH)
      }

      promise.resolve(resultMap)
    } catch (e: Throwable) {
      android.util.Log.e("LungCtPipeline", "Lỗi thực thi suy luận pipeline", e)
      promise.reject("ERR_INFERENCE", "Lỗi thực thi suy luận pipeline: ${e.message}", e)
    }
  }

  @ReactMethod
  fun runInferenceFromBase64(base64Image: String, promise: Promise) {
    Thread {
      try {
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
      } catch (e: Throwable) {
        android.util.Log.e("LungCtPipeline", "Lỗi thực thi pipeline base64", e)
        promise.reject("ERR_INFERENCE", "Lỗi thực thi pipeline base64: ${e.message}", e)
      }
    }.start()
  }

  @ReactMethod
  fun runInferenceFromFilePath(filePath: String, promise: Promise) {
    Thread {
      try {
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
      } catch (e: Throwable) {
        android.util.Log.e("LungCtPipeline", "Lỗi thực thi pipeline từ file path", e)
        promise.reject("ERR_INFERENCE", "Lỗi thực thi pipeline từ file path: ${e.message}", e)
      }
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
    } catch (e: Throwable) {
      android.util.Log.e("LungCtPipeline", "Lỗi đọc tệp ảnh ${file.name}", e)
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
    } catch (e: Throwable) {
      android.util.Log.e("LungCtPipeline", "Lỗi đọc tệp từ URI $uri", e)
      promise.reject("ERR_READ_URI", "Lỗi đọc tệp từ URI $uri: ${e.message}", e)
    }
  }

  /**
   * Xóa an toàn tệp vật lý trong bộ nhớ thiết bị (cache PDF, ảnh CT bị xóa).
   * Không bao giờ ném Exception làm sập app.
   */
  @ReactMethod
  fun deleteLocalFile(filePath: String, promise: Promise) {
    try {
      val cleanPath = filePath.removePrefix("file://")
      val file = File(cleanPath)
      if (file.exists()) {
        val deleted = file.delete()
        promise.resolve(deleted)
      } else {
        promise.resolve(true)
      }
    } catch (e: Throwable) {
      android.util.Log.w("LungCtPipeline", "Lỗi khi xóa tệp $filePath: ${e.message}")
      promise.resolve(false)
    }
  }

  /**
   * Đọc tệp cục bộ và chuyển đổi sang chuỗi Base64.
   * Phục vụ nhúng ảnh CT / Grad-CAM trực tiếp vào HTML báo cáo PDF để WebView không bị chặn bởi chính sách file://.
   */
  @ReactMethod
  fun readFileAsBase64(filePath: String, promise: Promise) {
    try {
      val bytes = if (filePath.startsWith("content://")) {
        val uri = Uri.parse(filePath)
        reactContext.contentResolver.openInputStream(uri)?.use { it.readBytes() }
          ?: throw FileNotFoundException("Không thể mở Content URI: $filePath")
      } else {
        val rawPath = if (filePath.startsWith("file://")) {
          try {
            Uri.parse(filePath).path ?: filePath.removePrefix("file://")
          } catch (_: Throwable) {
            filePath.removePrefix("file://")
          }
        } else {
          filePath
        }
        val decodedPath = try {
          java.net.URLDecoder.decode(rawPath, "UTF-8")
        } catch (_: Throwable) {
          rawPath
        }
        val file = File(decodedPath)
        val targetFile = if (file.exists()) file else File(rawPath)
        if (!targetFile.exists()) {
          android.util.Log.w("LungCtPipeline", "readFileAsBase64: Tệp không tồn tại: $decodedPath (raw: $rawPath)")
          promise.reject("ERR_NOT_FOUND", "Tệp không tồn tại: $decodedPath")
          return
        }
        targetFile.readBytes()
      }
      val base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
      android.util.Log.i("LungCtPipeline", "readFileAsBase64 thành công cho $filePath (${bytes.size} bytes)")
      promise.resolve(base64)
    } catch (e: Throwable) {
      android.util.Log.e("LungCtPipeline", "Lỗi đọc tệp sang Base64 từ $filePath", e)
      promise.reject("ERR_READ_BASE64", "Lỗi đọc tệp sang Base64: ${e.message}", e)
    }
  }

  /**
   * Lưu trữ bền vững tệp PDF báo cáo từ cache sang thư mục lưu trữ vĩnh viễn (dicom_reports).
   * Giúp tệp PDF không bị hệ điều hành xóa khi dọn dẹp cache.
   */
  @ReactMethod
  fun persistPdfFile(cacheUri: String, targetFileName: String, promise: Promise) {
    try {
      val cleanCachePath = cacheUri.removePrefix("file://")
      val sourceFile = File(cleanCachePath)
      if (!sourceFile.exists()) {
        promise.resolve(cacheUri)
        return
      }
      val reportsDir = File(reactContext.filesDir, "dicom_reports").apply { if (!exists()) mkdirs() }
      val destFile = File(reportsDir, targetFileName)
      sourceFile.copyTo(destFile, overwrite = true)
      promise.resolve(Uri.fromFile(destFile).toString())
    } catch (e: Throwable) {
      android.util.Log.w("LungCtPipeline", "Không thể lưu tệp PDF vào dicom_reports: ${e.message}")
      promise.resolve(cacheUri)
    }
  }
}
