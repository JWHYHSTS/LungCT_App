"""
Script đối chiếu 3 ảnh CT thực tế (Benign, Malignant, Normal) giữa Keras và TFLite
với bộ trọng số mới 20261122T082142_409115Z.
Dùng ONNX Runtime cho nhánh ViT và tiền xử lý chuẩn rgb-nearest-source-resize-v1.
"""
import os, sys, json
from pathlib import Path
import numpy as np
from PIL import Image

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

ROOT = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT / "ai" / "models" / "extracted" / "20261122T082142_409115Z"
CONVERSION_DIR = ROOT / "ai" / "conversion"
DATASET_DIR = Path(r"D:\TAILIEUDAIHOC\HK7\KLTN\Dataset\archive\The IQ-OTHNCCD lung cancer dataset")

sys.path.insert(0, str(EXTRACTED_DIR))
import custom_layers
import tensorflow as tf
import onnxruntime as ort

def evaluate_three_real_samples():
    config = json.loads((EXTRACTED_DIR / "config.json").read_text(encoding="utf-8"))
    class_names = config["CLASS_NAMES"]

    print("[*] Nạp ViT ONNX model...")
    onnx_path = ROOT / "mobile" / "android" / "app" / "src" / "main" / "assets" / "models" / "vit_cls.onnx"
    session_options = ort.SessionOptions()
    session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    ort_session = ort.InferenceSession(str(onnx_path), session_options, providers=["CPUExecutionProvider"])
    ort_in_name = ort_session.get_inputs()[0].name

    print("[*] Nạp Keras Fusion model...")
    keras_path = EXTRACTED_DIR / "fusion" / "model.keras"
    keras_model = tf.keras.models.load_model(str(keras_path), compile=False, safe_mode=True)

    print("[*] Nạp TFLite Fusion model...")
    tflite_path = CONVERSION_DIR / "fusion_model_20261122T082142_409115Z.tflite"
    interp = tf.lite.Interpreter(str(tflite_path))
    interp.allocate_tensors()
    in_details = interp.get_input_details()
    out_details = interp.get_output_details()

    sample_files = [
        ("Benign", DATASET_DIR / "Bengin cases" / "Bengin case (114).jpg"),
        ("Malignant", DATASET_DIR / "Malignant cases" / "Malignant case (1).jpg"),
        ("Normal", DATASET_DIR / "Normal cases" / "Normal case (1).jpg"),
    ]

    print("\n" + "="*80)
    print(" KẾT QUẢ ĐỐI CHIẾU SUY LUẬN TRÊN 3 ẢNH CT THẬT ĐẠI DIỆN 3 LỚP")
    print("="*80)

    results = []
    for true_label, img_path in sample_files:
        if not img_path.exists():
            print(f"[-] Không tìm thấy ảnh: {img_path}")
            continue

        with Image.open(img_path) as original:
            rgb = original.convert("RGB").copy()

        # Tiền xử lý CNN: [1, 512, 512, 3] trong [0.0, 1.0]
        cnn_input = np.asarray(rgb.resize(tuple(config["IMG_SIZE"]), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0

        # Tiền xử lý ViT: [1, 3, 224, 224] chuẩn hóa (x/255.0 - 0.5) / 0.5
        vit_img = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
        vit_arr = (np.asarray(vit_img, dtype=np.float32) / 255.0 - 0.5) / 0.5
        vit_input = np.transpose(vit_arr, (2, 0, 1))[None].astype(np.float32) # [1, 3, 224, 224]

        # Trích xuất CLS token qua ONNX Runtime
        cls_token = ort_session.run(None, {ort_in_name: vit_input})[0].astype(np.float32)

        # Keras inference
        keras_out = np.asarray(keras_model((cnn_input, cls_token), training=False))[0]
        keras_pred = class_names[int(keras_out.argmax())]

        # TFLite inference
        for item in in_details:
            if "vit" in item["name"]:
                interp.set_tensor(item["index"], cls_token)
            else:
                interp.set_tensor(item["index"], cnn_input)
        interp.invoke()
        tflite_out = interp.get_tensor(out_details[0]["index"])[0]
        tflite_pred = class_names[int(tflite_out.argmax())]

        diff = float(np.max(np.abs(keras_out - tflite_out)))

        print(f"\n[Ảnh]: {img_path.name} (Nhãn thực tế ground truth: {true_label})")
        print(f"  - Keras dự đoán : {keras_pred}")
        print(f"    Điểm số: Benign={keras_out[0]:.6f}, Malignant={keras_out[1]:.6f}, Normal={keras_out[2]:.6f}")
        print(f"  - TFLite dự đoán: {tflite_pred}")
        print(f"    Điểm số: Benign={tflite_out[0]:.6f}, Malignant={tflite_out[1]:.6f}, Normal={tflite_out[2]:.6f}")
        print(f"  - Sai số lớn nhất: {diff:.2e} | Khớp nhãn: {keras_pred == tflite_pred}")

        results.append({
            "image": img_path.name,
            "true_label": true_label,
            "keras_pred": keras_pred,
            "keras_scores": keras_out.tolist(),
            "tflite_pred": tflite_pred,
            "tflite_scores": tflite_out.tolist(),
            "max_abs_error": diff,
            "label_match": (keras_pred == tflite_pred)
        })

    out_file = CONVERSION_DIR / "real_samples_parity.json"
    out_file.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[+] Báo cáo đã lưu tại: {out_file}")

if __name__ == "__main__":
    evaluate_three_real_samples()
