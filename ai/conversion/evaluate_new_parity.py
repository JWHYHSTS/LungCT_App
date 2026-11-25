"""
Script đối chiếu suy luận giữa Keras Fusion Model và TFLite Fusion Model
Đợt chạy: 20261122T082142_409115Z (LungCT Primary FP32)
"""
import os
import sys
import json
from pathlib import Path
import numpy as np

# Cố định console utf-8
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

ROOT = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT / "ai" / "models" / "extracted" / "20261122T082142_409115Z"
CONVERSION_DIR = ROOT / "ai" / "conversion"

sys.path.insert(0, str(EXTRACTED_DIR))
import custom_layers
import tensorflow as tf

def run_parity():
    keras_path = EXTRACTED_DIR / "fusion" / "model.keras"
    tflite_path = CONVERSION_DIR / "fusion_model_20261122T082142_409115Z.tflite"

    print(f"[*] Loading Keras model from: {keras_path}")
    keras_model = tf.keras.models.load_model(str(keras_path), compile=False, safe_mode=True)

    print(f"[*] Loading TFLite model from: {tflite_path}")
    interp = tf.lite.Interpreter(str(tflite_path))
    interp.allocate_tensors()

    in_details = interp.get_input_details()
    out_details = interp.get_output_details()
    
    print("\nTFLite Input Details:")
    for item in in_details:
        print(f"  - index {item['index']}: {item['name']}, shape={item['shape']}, dtype={item['dtype']}")
    print("TFLite Output Details:")
    for item in out_details:
        print(f"  - index {item['index']}: {item['name']}, shape={item['shape']}, dtype={item['dtype']}")

    class_names = ["Benign", "Malignant", "Normal"]
    np.random.seed(42)

    # Thử nghiệm trên 10 trường hợp đa dạng
    max_error_overall = 0.0
    all_matched = True
    test_results = []

    print("\n" + "="*80)
    print(" BẮT ĐẦU KIỂM TRA PARITY GIỮA KERAS VÀ TFLITE TRÊN CÁC VÉC-TƠ ĐẠI DIỆN")
    print("="*80)

    for case_id in range(1, 11):
        # Tạo cnn_input [1, 512, 512, 3] trong [0.0, 1.0] và cls_token [1, 768]
        if case_id == 1:
            # Zeros
            cnn_input = np.zeros((1, 512, 512, 3), dtype=np.float32)
            cls_token = np.zeros((1, 768), dtype=np.float32)
            desc = "Zeros input"
        elif case_id == 2:
            # Ones
            cnn_input = np.ones((1, 512, 512, 3), dtype=np.float32)
            cls_token = np.ones((1, 768), dtype=np.float32)
            desc = "Ones input"
        elif case_id == 3:
            # Reference inputs summary
            ref_path = CONVERSION_DIR / "reference_inputs_summary.json"
            if ref_path.exists():
                ref_data = json.loads(ref_path.read_text(encoding="utf-8"))
                cnn_val = ref_data["cnn_arr_first_10"][0]
                vit_val = ref_data["vit_tensor_first_10"][0]
                cnn_input = np.full((1, 512, 512, 3), cnn_val, dtype=np.float32)
                cls_token = np.full((1, 768), vit_val, dtype=np.float32)
                desc = f"Reference inputs constant (cnn={cnn_val:.4f}, vit={vit_val:.4f})"
            else:
                cnn_input = np.random.uniform(0.0, 1.0, (1, 512, 512, 3)).astype(np.float32)
                cls_token = np.random.normal(0.0, 0.5, (1, 768)).astype(np.float32)
                desc = "Random uniform 1"
        else:
            # Random samples simulating CT pixel intensity distribution
            cnn_input = np.random.beta(0.5, 0.5, (1, 512, 512, 3)).astype(np.float32)
            cls_token = np.random.normal(0.0, 0.3, (1, 768)).astype(np.float32)
            desc = f"Simulated CT distribution case {case_id}"

        # 1. Keras inference
        # Keras model inputs: (image_input, vit_features_input)
        keras_out = np.asarray(keras_model((cnn_input, cls_token), training=False))[0]
        keras_label = class_names[int(keras_out.argmax())]

        # 2. TFLite inference
        for item in in_details:
            if "vit" in item["name"]:
                interp.set_tensor(item["index"], cls_token)
            else:
                interp.set_tensor(item["index"], cnn_input)
        interp.invoke()
        tflite_out = interp.get_tensor(out_details[0]["index"])[0]
        tflite_label = class_names[int(tflite_out.argmax())]

        diffs = np.abs(keras_out - tflite_out)
        max_diff = float(np.max(diffs))
        max_error_overall = max(max_error_overall, max_diff)
        matched = (keras_label == tflite_label)
        if not matched:
            all_matched = False

        print(f"Case {case_id:2d} [{desc}]:")
        print(f"  Keras : Benign={keras_out[0]:.6f}, Malignant={keras_out[1]:.6f}, Normal={keras_out[2]:.6f} => {keras_label}")
        print(f"  TFLite: Benign={tflite_out[0]:.6f}, Malignant={tflite_out[1]:.6f}, Normal={tflite_out[2]:.6f} => {tflite_label}")
        print(f"  Max Diff: {max_diff:.2e} | Label Match: {matched}")
        print("-" * 60)

        test_results.append({
            "case_id": case_id,
            "desc": desc,
            "keras_scores": keras_out.tolist(),
            "keras_label": keras_label,
            "tflite_scores": tflite_out.tolist(),
            "tflite_label": tflite_label,
            "max_abs_error": max_diff,
            "matched": matched
        })

    print(f"\n[+] TỔNG KẾT PARITY:")
    print(f"  - Số trường hợp kiểm tra: {len(test_results)}")
    print(f"  - Tỷ lệ khớp nhãn: 100% ({'ĐẠT' if all_matched else 'KHÔNG ĐẠT'})")
    print(f"  - Sai số tuyệt đối lớn nhất: {max_error_overall:.2e} (Tiêu chí: < 1e-4 -> {'ĐẠT' if max_error_overall < 1e-4 else 'KHÔNG ĐẠT'})")

    report_path = CONVERSION_DIR / "parity_20261122T082142_409115Z.json"
    report_data = {
        "run_id": "20261122T082142_409115Z",
        "keras_model": str(keras_path),
        "tflite_model": str(tflite_path),
        "max_error_overall": max_error_overall,
        "all_matched": all_matched,
        "criteria": "max_error < 1e-4 and 100% label match",
        "status": "PASS" if (all_matched and max_error_overall < 1e-4) else "FAIL",
        "cases": test_results
    }
    report_path.write_text(json.dumps(report_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[+] Báo cáo parity đã lưu tại: {report_path}")

if __name__ == "__main__":
    run_parity()
