"""
Script kiểm chứng đối chiếu mở rộng 30 ảnh từ tập test (MOB-01)
Kiểm tra Pipeline Gốc (PyTorch ViT + Keras Fusion) vs Pipeline Chuyển đổi (ONNX Runtime ViT + TFLite Fusion).

Yêu cầu:
- 10 ảnh mỗi lớp ('Benign', 'Malignant', 'Normal') từ split_manifest.json tập test.
- Chọn cố định seed (42), không trùng SHA256.
- Giữ nguyên kiến trúc FP32, trọng số và tiền xử lý 'rgb-nearest-source-resize-v1'.
- Tách thời gian nạp mô hình khỏi thời gian suy luận từng ảnh.
- Lưu danh sách ảnh, SHA256, điểm 3 lớp, sai số từng ảnh, số trường hợp khác nhãn.
- Tính sai số lớn nhất/trung bình, tổng hợp thời gian suy luận.
- Xuất kết quả ra cả JSON và CSV.
"""

import os
import sys
import time
import json
import csv
import random
import argparse
from pathlib import Path
from PIL import Image
import numpy as np

# Đảm bảo UTF-8 stream trên Windows console
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
EXTRACTED_DIR = ROOT_DIR / "ai" / "models" / "extracted" / "primary"
CONVERSION_DIR = ROOT_DIR / "ai" / "conversion"
DEFAULT_DATASET_DIR = ROOT_DIR.parent / "IQ_OTHNCCD"

def select_30_test_images(manifest_path: Path, seed: int = 42):
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    test_set = manifest.get("test", [])
    
    # Gom nhóm theo lớp và sắp xếp ổn định trước khi sample
    by_class = {"Benign": [], "Malignant": [], "Normal": []}
    for item in sorted(test_set, key=lambda x: x["relative_path"]):
        by_class[item["class_name"]].append(item)
        
    rng = random.Random(seed)
    selected = []
    
    for c in ["Benign", "Malignant", "Normal"]:
        items = by_class[c]
        # Loại trùng lặp SHA256 nếu có
        seen_sha = set()
        unique_items = []
        for it in items:
            if it["sha256"] not in seen_sha:
                seen_sha.add(it["sha256"])
                unique_items.append(it)
                
        if len(unique_items) < 10:
            raise ValueError(f"Không đủ 10 ảnh không trùng SHA256 cho lớp {c} (chỉ có {len(unique_items)})")
            
        chosen = rng.sample(unique_items, 10)
        selected.extend(chosen)
        
    return selected

def evaluate_batch_30(dataset_dir: str = str(DEFAULT_DATASET_DIR), seed: int = 42,
                       output_json: str = "ai/conversion/batch30_parity_evaluation.json",
                       output_csv: str = "ai/conversion/batch30_parity_evaluation.csv"):
    ds_dir = Path(dataset_dir)
    if not ds_dir.exists():
        raise FileNotFoundError(f"Không tìm thấy thư mục dataset: {dataset_dir}")
        
    # Nạp dynamic custom layers cho Keras
    sys.path.insert(0, str(EXTRACTED_DIR))
    import custom_layers
    import tensorflow as tf
    import torch
    from transformers import ViTModel, ViTImageProcessor
    import onnxruntime as ort

    config = json.loads((EXTRACTED_DIR / "config.json").read_text(encoding="utf-8"))
    class_names = config["CLASS_NAMES"]
    vit_path = EXTRACTED_DIR / "vit"
    keras_path = EXTRACTED_DIR / "fusion" / "model.keras"
    onnx_path = CONVERSION_DIR / "vit_cls.onnx"
    tflite_path = CONVERSION_DIR / "fusion_model.tflite"

    print("="*70)
    print(" BẮT ĐẦU ĐỐI CHIẾU MỞ RỘNG 30 ẢNH TẬP TEST (MOB-01)")
    print(f" Dataset thư mục: {ds_dir}")
    print(f" Cố định seed: {seed}")
    print(f" Tiền xử lý: {config['PREPROCESS_VERSION']}")
    print("="*70)

    # 1. Chọn 30 ảnh
    selected_samples = select_30_test_images(EXTRACTED_DIR / "split_manifest.json", seed=seed)
    print(f"[+] Đã chọn thành công 30 ảnh từ tập test (10 Benign, 10 Malignant, 10 Normal)")

    # 2. Đo thời gian nạp mô hình gốc
    print("\n[+] Đang nạp các mô hình của Pipeline Gốc (ViT PyTorch + Keras Fusion)...")
    t0_orig_load = time.perf_counter()
    processor = ViTImageProcessor.from_pretrained(vit_path, local_files_only=True)
    vit_model = ViTModel.from_pretrained(vit_path, local_files_only=True).float().eval()
    keras_model = tf.keras.models.load_model(keras_path, compile=False, safe_mode=True)
    orig_load_time_sec = time.perf_counter() - t0_orig_load
    print(f"    -> Thời gian nạp Pipeline Gốc: {orig_load_time_sec:.4f} giây")

    # 3. Đo thời gian nạp mô hình chuyển đổi
    print("[+] Đang nạp các mô hình của Pipeline Chuyển đổi (ViT ONNX + TFLite Fusion)...")
    t0_conv_load = time.perf_counter()
    session_options = ort.SessionOptions()
    session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    onnx_session = ort.InferenceSession(str(onnx_path), session_options, providers=["CPUExecutionProvider"])
    onnx_in_name = onnx_session.get_inputs()[0].name

    tflite_interp = tf.lite.Interpreter(str(tflite_path))
    tflite_interp.allocate_tensors()
    tf_in_details = tflite_interp.get_input_details()
    tf_out_details = tflite_interp.get_output_details()
    conv_load_time_sec = time.perf_counter() - t0_conv_load
    print(f"    -> Thời gian nạp Pipeline Chuyển đổi: {conv_load_time_sec:.4f} giây")

    # 4. Chạy suy luận tuần tự trên 30 ảnh
    results = []
    orig_inference_times = []
    conv_inference_times = []

    print("\n[+] Đang tiến hành chạy đối chiếu từng ảnh...")
    for idx, sample in enumerate(selected_samples, 1):
        rel_path = sample["relative_path"]
        img_path = ds_dir / Path(rel_path)
        if not img_path.exists():
            raise FileNotFoundError(f"Tệp ảnh không tồn tại: {img_path}")

        # Tiền xử lý
        with Image.open(img_path) as original:
            rgb = original.convert("RGB").copy()

        # Nhánh CNN: [1, 512, 512, 3] trong [0.0, 1.0]
        cnn_input = np.asarray(rgb.resize(tuple(config["IMG_SIZE"]), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0

        # Nhánh ViT: [1, 3, 224, 224]
        vit_resized = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
        batch = processor(images=[vit_resized], return_tensors="pt")
        pixel_values_pt = batch["pixel_values"]
        pixel_values_np = pixel_values_pt.numpy()

        # --- A. Pipeline Gốc ---
        t0_orig_inf = time.perf_counter()
        with torch.inference_mode():
            cls_pt = vit_model(pixel_values=pixel_values_pt).last_hidden_state[:, 0, :].numpy().astype(np.float32)
        orig_scores = np.asarray(keras_model((cnn_input, cls_pt), training=False))[0]
        orig_inf_time = time.perf_counter() - t0_orig_inf
        orig_inference_times.append(orig_inf_time)
        orig_label = class_names[int(orig_scores.argmax())]

        # --- B. Pipeline Chuyển đổi ---
        t0_conv_inf = time.perf_counter()
        cls_onnx = onnx_session.run(None, {onnx_in_name: pixel_values_np})[0].astype(np.float32)
        for item in tf_in_details:
            if "vit" in item["name"]:
                tflite_interp.set_tensor(item["index"], cls_onnx)
            else:
                tflite_interp.set_tensor(item["index"], cnn_input)
        tflite_interp.invoke()
        conv_scores = tflite_interp.get_tensor(tf_out_details[0]["index"])[0]
        conv_inf_time = time.perf_counter() - t0_conv_inf
        conv_inference_times.append(conv_inf_time)
        conv_label = class_names[int(conv_scores.argmax())]

        # Tính toán sai số
        cls_diff = np.abs(cls_pt - cls_onnx)
        cls_max_err = float(np.max(cls_diff))
        cls_mean_err = float(np.mean(cls_diff))

        scores_diff = np.abs(orig_scores - conv_scores)
        score_max_err = float(np.max(scores_diff))
        score_mean_err = float(np.mean(scores_diff))

        is_label_matched = (orig_label == conv_label)

        record = {
            "index": idx,
            "relative_path": rel_path,
            "ground_truth_label": sample["class_name"],
            "sha256": sample["sha256"],
            "original_scores": [float(x) for x in orig_scores],
            "converted_scores": [float(x) for x in conv_scores],
            "original_predicted_label": orig_label,
            "converted_predicted_label": conv_label,
            "label_matched": is_label_matched,
            "score_absolute_differences": [float(x) for x in scores_diff],
            "score_max_abs_error": score_max_err,
            "score_mean_abs_error": score_mean_err,
            "cls_max_abs_error": cls_max_err,
            "cls_mean_abs_error": cls_mean_err,
            "original_inference_time_sec": orig_inf_time,
            "converted_inference_time_sec": conv_inf_time
        }
        results.append(record)
        print(f"[{idx:02d}/30] {sample['class_name']:<9} | {rel_path:<32} | Match: {str(is_label_matched):<5} | MaxScoreErr: {score_max_err:.2e} | TimeOrig: {orig_inf_time*1000:6.1f}ms | TimeConv: {conv_inf_time*1000:6.1f}ms")

    # 5. Tổng hợp thống kê
    all_score_max_errors = [r["score_max_abs_error"] for r in results]
    all_score_mean_errors = [r["score_mean_abs_error"] for r in results]
    all_cls_max_errors = [r["cls_max_abs_error"] for r in results]
    all_cls_mean_errors = [r["cls_mean_abs_error"] for r in results]
    mismatched_labels = [r for r in results if not r["label_matched"]]

    summary = {
        "evaluation_scope": "30 test images from split_manifest.json (10 per class)",
        "random_seed": seed,
        "class_order": class_names,
        "environment": {
            "python": sys.version.split()[0],
            "tensorflow": tf.__version__,
            "torch": torch.__version__,
            "onnxruntime": ort.__version__
        },
        "model_loading_times_sec": {
            "original_pipeline_load_sec": orig_load_time_sec,
            "converted_pipeline_load_sec": conv_load_time_sec
        },
        "inference_latency_summary_sec": {
            "original_pipeline": {
                "mean_sec": float(np.mean(orig_inference_times)),
                "std_sec": float(np.std(orig_inference_times)),
                "min_sec": float(np.min(orig_inference_times)),
                "max_sec": float(np.max(orig_inference_times)),
                "mean_ms": float(np.mean(orig_inference_times) * 1000)
            },
            "converted_pipeline": {
                "mean_sec": float(np.mean(conv_inference_times)),
                "std_sec": float(np.std(conv_inference_times)),
                "min_sec": float(np.min(conv_inference_times)),
                "max_sec": float(np.max(conv_inference_times)),
                "mean_ms": float(np.mean(conv_inference_times) * 1000)
            }
        },
        "parity_error_summary": {
            "cls_vector_parity": {
                "max_abs_error_across_all_samples": float(np.max(all_cls_max_errors)),
                "mean_abs_error_across_all_samples": float(np.mean(all_cls_mean_errors))
            },
            "class_scores_parity": {
                "max_abs_error_across_all_samples": float(np.max(all_score_max_errors)),
                "mean_abs_error_across_all_samples": float(np.mean(all_score_mean_errors))
            },
            "label_matching": {
                "total_samples": len(results),
                "matched_count": len(results) - len(mismatched_labels),
                "mismatched_count": len(mismatched_labels),
                "match_rate_percentage": 100.0 * (len(results) - len(mismatched_labels)) / len(results)
            }
        },
        "per_sample_results": results
    }

    # Xuất JSON
    out_json_p = Path(output_json)
    out_json_p.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n[+] Đã lưu báo cáo JSON: {out_json_p}")

    # Xuất CSV
    out_csv_p = Path(output_csv)
    with open(out_csv_p, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "index", "relative_path", "ground_truth", "sha256",
            "orig_score_benign", "orig_score_malignant", "orig_score_normal", "orig_label",
            "conv_score_benign", "conv_score_malignant", "conv_score_normal", "conv_label",
            "label_matched", "score_max_abs_err", "score_mean_abs_err",
            "cls_max_abs_err", "cls_mean_abs_err", "orig_latency_ms", "conv_latency_ms"
        ])
        for r in results:
            writer.writerow([
                r["index"],
                r["relative_path"],
                r["ground_truth_label"],
                r["sha256"],
                f"{r['original_scores'][0]:.8f}",
                f"{r['original_scores'][1]:.8f}",
                f"{r['original_scores'][2]:.8f}",
                r["original_predicted_label"],
                f"{r['converted_scores'][0]:.8f}",
                f"{r['converted_scores'][1]:.8f}",
                f"{r['converted_scores'][2]:.8f}",
                r["converted_predicted_label"],
                r["label_matched"],
                f"{r['score_max_abs_error']:.8e}",
                f"{r['score_mean_abs_error']:.8e}",
                f"{r['cls_max_abs_error']:.8e}",
                f"{r['cls_mean_abs_error']:.8e}",
                f"{r['original_inference_time_sec']*1000:.2f}",
                f"{r['converted_inference_time_sec']*1000:.2f}"
            ])
    print(f"[+] Đã lưu báo cáo CSV: {out_csv_p}")

    print("\n" + "="*70)
    print(" TỔNG HỢP KẾT QUẢ ĐỐI CHIẾU 30 ẢNH")
    print("="*70)
    print(f"Tổng số ảnh: {len(results)} (10 Benign, 10 Malignant, 10 Normal)")
    print(f"Số trường hợp khác nhãn: {len(mismatched_labels)} / {len(results)}")
    print(f"Độ khớp nhãn: {summary['parity_error_summary']['label_matching']['match_rate_percentage']:.2f}%")
    print(f"Sai số xác suất lớp lớn nhất (Max Abs Error): {summary['parity_error_summary']['class_scores_parity']['max_abs_error_across_all_samples']:.8e}")
    print(f"Sai số xác suất lớp trung bình (Mean Abs Error): {summary['parity_error_summary']['class_scores_parity']['mean_abs_error_across_all_samples']:.8e}")
    print(f"Sai số vector CLS lớn nhất : {summary['parity_error_summary']['cls_vector_parity']['max_abs_error_across_all_samples']:.8e}")
    print(f"Thời gian nạp mô hình: Gốc = {orig_load_time_sec:.3f}s | Chuyển đổi = {conv_load_time_sec:.3f}s")
    print(f"Độ trễ suy luận trung bình: Gốc = {summary['inference_latency_summary_sec']['original_pipeline']['mean_ms']:.1f}ms | Chuyển đổi = {summary['inference_latency_summary_sec']['converted_pipeline']['mean_ms']:.1f}ms")
    print("="*70)

    return summary

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kiểm chứng đối chiếu 30 ảnh tập test giữa Pipeline Gốc và Chuyển đổi (MOB-01)")
    parser.add_argument("--dataset-dir", default=str(DEFAULT_DATASET_DIR), help="Đường dẫn tới thư mục IQ_OTHNCCD")
    parser.add_argument("--seed", type=int, default=42, help="Seed ngẫu nhiên cố định")
    parser.add_argument("--output-json", default="ai/conversion/batch30_parity_evaluation.json", help="Đường dẫn tệp JSON đầu ra")
    parser.add_argument("--output-csv", default="ai/conversion/batch30_parity_evaluation.csv", help="Đường dẫn tệp CSV đầu ra")
    args = parser.parse_args()
    evaluate_batch_30(args.dataset_dir, args.seed, args.output_json, args.output_csv)
