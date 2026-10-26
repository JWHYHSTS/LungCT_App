"""
Script đối chiếu toàn diện End-to-End Pipeline giữa:
1. Pipeline Gốc: Ảnh -> ViT PyTorch -> CLS Token -> Fusion Keras -> 3 Class Probabilities
2. Pipeline Di động/Chuyển đổi: Ảnh -> ViT ONNX (ONNX Runtime) -> CLS Token -> Fusion TFLite (LiteRT) -> 3 Class Probabilities

Chạy trên máy tính cá nhân, cùng tiền xử lý 'rgb-nearest-source-resize-v1'. (MOB-01)
"""

import os
import sys
import json
import argparse
from pathlib import Path
from PIL import Image
import numpy as np

# Thiết lập UTF-8 console output trên Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT_DIR / "ai" / "models" / "extracted" / "primary"
CONVERSION_DIR = ROOT_DIR / "ai" / "conversion"

def evaluate_e2e_pipeline(image_path: str, output_json: str = None):
    # Nạp dynamic custom layers cho Keras
    sys.path.insert(0, str(EXTRACTED_DIR))
    import custom_layers
    import tensorflow as tf
    import torch
    from transformers import ViTModel, ViTImageProcessor
    import onnxruntime as ort

    img_p = Path(image_path)
    if not img_p.exists():
        raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")

    config = json.loads((EXTRACTED_DIR / "config.json").read_text(encoding="utf-8"))
    class_names = config["CLASS_NAMES"]
    vit_path = EXTRACTED_DIR / "vit"
    keras_path = EXTRACTED_DIR / "fusion" / "model.keras"
    onnx_path = CONVERSION_DIR / "vit_cls.onnx"
    tflite_path = CONVERSION_DIR / "fusion_model.tflite"

    print("="*60)
    print(" BẮT ĐẦU ĐỐI CHIẾU TOÀN DIỆN END-TO-END PIPELINE")
    print(f" Ảnh: {img_p}")
    print(f" Tiền xử lý: {config['PREPROCESS_VERSION']}")
    print("="*60)

    # 1. Tiền xử lý chung
    with Image.open(img_p) as original:
        rgb = original.convert("RGB").copy()

    # Nhánh CNN: [1, 512, 512, 3] trong [0.0, 1.0]
    cnn_input = np.asarray(rgb.resize(tuple(config["IMG_SIZE"]), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0

    # Nhánh ViT: [1, 3, 224, 224]
    processor = ViTImageProcessor.from_pretrained(vit_path, local_files_only=True)
    vit_resized = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
    batch = processor(images=[vit_resized], return_tensors="pt")
    pixel_values_pt = batch["pixel_values"]
    pixel_values_np = pixel_values_pt.numpy()

    # 2. Pipeline Gốc: PyTorch ViT -> Keras Fusion
    print("\n[+] Đang chạy Pipeline Gốc (PyTorch ViT + Keras Fusion)...")
    vit_model = ViTModel.from_pretrained(vit_path, local_files_only=True).float().eval()
    with torch.inference_mode():
        cls_pytorch = vit_model(pixel_values=pixel_values_pt).last_hidden_state[:, 0, :].numpy().astype(np.float32)

    keras_model = tf.keras.models.load_model(keras_path, compile=False, safe_mode=True)
    orig_output = np.asarray(keras_model((cnn_input, cls_pytorch), training=False))[0]
    orig_label = class_names[int(orig_output.argmax())]

    # 3. Pipeline Chuyển đổi: ONNX ViT -> TFLite Fusion
    print("[+] Đang chạy Pipeline Chuyển đổi (ONNX Runtime ViT + TFLite Fusion)...")
    session_options = ort.SessionOptions()
    session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    session = ort.InferenceSession(str(onnx_path), session_options, providers=["CPUExecutionProvider"])
    cls_onnx = session.run(None, {session.get_inputs()[0].name: pixel_values_np})[0].astype(np.float32)

    interp = tf.lite.Interpreter(str(tflite_path))
    interp.allocate_tensors()
    in_details = interp.get_input_details()
    out_details = interp.get_output_details()

    for item in in_details:
        if "vit" in item["name"]:
            interp.set_tensor(item["index"], cls_onnx)
        else:
            interp.set_tensor(item["index"], cnn_input)

    interp.invoke()
    converted_output = interp.get_tensor(out_details[0]["index"])[0]
    converted_label = class_names[int(converted_output.argmax())]

    # 4. So sánh sai số
    cls_abs_diff = np.abs(cls_pytorch - cls_onnx)
    cls_max_error = float(np.max(cls_abs_diff))

    scores_abs_diff = np.abs(orig_output - converted_output)
    scores_max_error = float(np.max(scores_abs_diff))

    report = {
        "image_path": str(img_p),
        "class_order": class_names,
        "original_pipeline": {
            "vit_framework": f"PyTorch {torch.__version__}",
            "fusion_framework": f"Keras {tf.__version__}",
            "cls_vector_head": cls_pytorch[0][:5].tolist(),
            "scores": orig_output.tolist(),
            "predicted_label": orig_label
        },
        "converted_pipeline": {
            "vit_framework": f"ONNX Runtime {ort.__version__}",
            "fusion_framework": "TensorFlow Lite (XNNPACK)",
            "cls_vector_head": cls_onnx[0][:5].tolist(),
            "scores": converted_output.tolist(),
            "predicted_label": converted_label
        },
        "parity_analysis": {
            "cls_max_absolute_error": cls_max_error,
            "scores_absolute_differences": scores_abs_diff.tolist(),
            "scores_max_absolute_error": scores_max_error,
            "labels_matched": (orig_label == converted_label)
        },
        "environment": {
            "python": sys.version.split()[0],
            "tensorflow": tf.__version__,
            "torch": torch.__version__,
            "onnxruntime": ort.__version__
        }
    }

    print("\n" + "="*60)
    print(" KẾT QUẢ ĐỐI CHIẾU END-TO-END PIPELINE (ORIGINAL vs CONVERTED)")
    print("="*60)
    print(f"Ảnh: {img_p.name}")
    print(f"Thứ tự nhãn: {class_names}")
    print(f"Original  Scores: {orig_output} -> {orig_label}")
    print(f"Converted Scores: {converted_output} -> {converted_label}")
    print(f"Sai số vector CLS lớn nhất : {cls_max_error:.8e}")
    print(f"Sai số xác suất lớp lớn nhất: {scores_max_error:.8e}")
    print(f"Nhãn trùng khớp: {report['parity_analysis']['labels_matched']}")
    print("="*60)

    if output_json:
        Path(output_json).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[+] Đã lưu báo cáo E2E vào: {output_json}")

    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chương trình đối chiếu End-to-End Pipeline Gốc vs Chuyển đổi (MOB-01)")
    parser.add_argument("--image", required=True, help="Đường dẫn tới tệp ảnh CT")
    parser.add_argument("--output", default="ai/conversion/e2e_pipeline_evaluation.json", help="Tệp JSON xuất kết quả")
    args = parser.parse_args()
    evaluate_e2e_pipeline(args.image, args.output)
