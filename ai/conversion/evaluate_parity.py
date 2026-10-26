"""
Script đối chiếu suy luận giữa mô hình Keras và mô hình TFLite
Mã nhiệm vụ: MOB-01 (LungCT)
"""
import os
import sys
import json
import argparse
from pathlib import Path
import numpy as np
from PIL import Image

# Cố định đầu ra UTF-8 cho console Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

# Cố định môi trường CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

ROOT = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT / "ai" / "models" / "extracted" / "primary"
CONVERSION_DIR = ROOT / "ai" / "conversion"

def evaluate_parity(image_path: str, output_json: str = None):
    # Nạp các thư viện bên trong hàm sau khi argparse xử lý
    sys.path.insert(0, str(EXTRACTED_DIR))
    import custom_layers
    import tensorflow as tf
    import torch
    from transformers import ViTModel, ViTImageProcessor

    img_p = Path(image_path)
    if not img_p.exists():
        raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")
        
    config = json.loads((EXTRACTED_DIR / "config.json").read_text(encoding="utf-8"))
    class_names = config["CLASS_NAMES"]
    
    print(f"[*] 1. Tiền xử lý ảnh theo hợp đồng nghiên cứu ({config['PREPROCESS_VERSION']}): {image_path}")
    with Image.open(img_p) as original:
        rgb = original.convert("RGB").copy()
        
    # Tiền xử lý cho nhánh CNN: [1, 512, 512, 3] trong [0.0, 1.0]
    cnn_input = np.asarray(rgb.resize(tuple(config["IMG_SIZE"]), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0
    
    print("[*] 2. Nạp ViT PyTorch và trích xuất CLS token từ chính ảnh này...")
    vit_path = EXTRACTED_DIR / "vit"
    processor = ViTImageProcessor.from_pretrained(vit_path, local_files_only=True)
    vit_model = ViTModel.from_pretrained(vit_path, local_files_only=True).float().eval()
    
    vit_resized = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
    batch = processor(images=[vit_resized], return_tensors="pt")
    with torch.inference_mode():
        cls_token = vit_model(**batch).last_hidden_state[:, 0, :].numpy().astype(np.float32)
        
    print(f"    - CLS token shape: {cls_token.shape}, mean: {float(cls_token.mean()):.4f}")
    
    print("[*] 3. Chạy suy luận trên mô hình Keras gốc...")
    keras_model = tf.keras.models.load_model(EXTRACTED_DIR / "fusion" / "model.keras", compile=False, safe_mode=True)
    keras_scores = np.asarray(keras_model((cnn_input, cls_token), training=False))[0]
    keras_label = class_names[int(keras_scores.argmax())]
    
    print("[*] 4. Chạy suy luận trên mô hình TFLite đã chuyển đổi...")
    tflite_path = CONVERSION_DIR / "fusion_model.tflite"
    interp = tf.lite.Interpreter(str(tflite_path))
    interp.allocate_tensors()
    
    in_details = interp.get_input_details()
    out_details = interp.get_output_details()
    
    for item in in_details:
        if "vit" in item["name"]:
            interp.set_tensor(item["index"], cls_token)
        else:
            interp.set_tensor(item["index"], cnn_input)
            
    interp.invoke()
    tflite_scores = interp.get_tensor(out_details[0]["index"])[0]
    tflite_label = class_names[int(tflite_scores.argmax())]
    
    abs_errors = np.abs(keras_scores - tflite_scores)
    max_abs_error = float(np.max(abs_errors))
    
    report = {
        "image_path": str(img_p),
        "class_order": class_names,
        "keras_output": {
            "scores": keras_scores.tolist(),
            "label": keras_label
        },
        "tflite_output": {
            "scores": tflite_scores.tolist(),
            "label": tflite_label
        },
        "absolute_differences": abs_errors.tolist(),
        "max_absolute_error": max_abs_error,
        "label_matched": (keras_label == tflite_label),
        "environment": {
            "python": sys.version.split()[0],
            "tensorflow": tf.__version__,
            "torch": torch.__version__
        }
    }
    
    print("\n" + "="*50)
    print(" KẾT QUẢ ĐỐI CHIẾU PARITY KERAS vs TFLITE")
    print("="*50)
    print(f"Ảnh đầu vào: {img_p.name}")
    print(f"Thứ tự nhãn: {class_names}")
    print(f"Keras Output : {keras_scores} -> {keras_label}")
    print(f"TFLite Output: {tflite_scores} -> {tflite_label}")
    print(f"Sai số tuyệt đối từng lớp: {abs_errors}")
    print(f"Sai số lớn nhất (Max Abs Error): {max_abs_error:.8e}")
    print(f"Nhãn trùng khớp: {report['label_matched']}")
    print("="*50)
    
    if output_json:
        Path(output_json).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[+] Đã lưu báo cáo đối chiếu vào: {output_json}")
        
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chương trình đối chiếu suy luận Keras vs TFLite trên ảnh CT đối chứng (MOB-01)")
    parser.add_argument("--image", required=True, help="Đường dẫn tới tệp ảnh CT (.png hoặc .jpg)")
    parser.add_argument("--output", default="ai/conversion/parity_evaluation.json", help="Tệp JSON xuất kết quả đối chiếu")
    args = parser.parse_args()
    evaluate_parity(args.image, args.output)
