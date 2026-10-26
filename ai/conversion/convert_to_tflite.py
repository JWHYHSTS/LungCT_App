"""
Script chuyển đổi mô hình Fusion Keras sang TFLite (.tflite)
Mã nhiệm vụ: MOB-01 (LungCT)
"""
import os
import sys
import hashlib
import argparse
from pathlib import Path

# Cố định đầu ra UTF-8 cho console Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

# Cố định môi trường CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

ROOT = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT / "ai" / "models" / "extracted" / "primary"
CONVERSION_DIR = ROOT / "ai" / "conversion"

def convert_fusion_to_tflite(keras_model_path: str = None, output_tflite_path: str = None):
    # Nạp custom_layers trước khi nạp model Keras
    sys.path.insert(0, str(EXTRACTED_DIR))
    import custom_layers
    import tensorflow as tf

    keras_path = Path(keras_model_path) if keras_model_path else (EXTRACTED_DIR / "fusion" / "model.keras")
    out_path = Path(output_tflite_path) if output_tflite_path else (CONVERSION_DIR / "fusion_model.tflite")

    if not keras_path.exists():
        raise FileNotFoundError(f"Không tìm thấy mô hình: {keras_path}")

    print(f"[*] Đang nạp mô hình Keras: {keras_path}")
    model = tf.keras.models.load_model(str(keras_path), compile=False, safe_mode=True)
    
    print("[*] Khởi tạo TFLiteConverter...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = []
    
    print("[*] Đang thực hiện chuyển đổi flatbuffer...")
    tflite_bytes = converter.convert()
    
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(tflite_bytes)
    
    sha256_hash = hashlib.sha256(tflite_bytes).hexdigest()
    size_mb = len(tflite_bytes) / (1024 * 1024)
    print(f"[+] Chuyển đổi thành công: {out_path}")
    print(f"    - Kích thước: {len(tflite_bytes):,} bytes (~{size_mb:.2f} MB)")
    print(f"    - SHA256: {sha256_hash}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chuyển đổi mô hình Keras Fusion sang TFLite flatbuffer (MOB-01)")
    parser.add_argument("--model", default=None, help="Đường dẫn tệp model.keras nguồn (mặc định lấy từ extracted/primary/fusion/model.keras)")
    parser.add_argument("--output", default=None, help="Đường dẫn tệp .tflite xuất ra (mặc định ai/conversion/fusion_model.tflite)")
    args = parser.parse_args()
    convert_fusion_to_tflite(args.model, args.output)
