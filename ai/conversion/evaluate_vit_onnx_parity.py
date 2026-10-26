"""
Script đối chiếu đầu ra giữa ViT PyTorch gốc và vit_cls.onnx chạy qua ONNX Runtime (MOB-01)
Chạy trên cùng tensor ảnh nguồn và lưu sai số tuyệt đối của vector CLS.
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

def evaluate_vit_onnx_parity(image_path: str, output_json: str = None):
    import torch
    from transformers import ViTModel, ViTImageProcessor
    import onnxruntime as ort

    img_p = Path(image_path)
    if not img_p.exists():
        raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")

    config = json.loads((EXTRACTED_DIR / "config.json").read_text(encoding="utf-8"))
    vit_path = EXTRACTED_DIR / "vit"
    onnx_path = CONVERSION_DIR / "vit_cls.onnx"

    if not onnx_path.exists():
        raise FileNotFoundError(f"Không tìm thấy tệp ONNX: {onnx_path}")

    print(f"[*] 1. Đọc và tiền xử lý ảnh cho ViT: {image_path}")
    with Image.open(img_p) as original:
        rgb = original.convert("RGB").copy()

    # ViT tiền xử lý
    processor = ViTImageProcessor.from_pretrained(vit_path, local_files_only=True)
    vit_resized = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
    batch = processor(images=[vit_resized], return_tensors="pt")
    pixel_values_pt = batch["pixel_values"] # torch.Tensor [1, 3, 224, 224]
    pixel_values_np = pixel_values_pt.numpy() # np.ndarray [1, 3, 224, 224]

    print("[*] 2. Chạy suy luận ViT PyTorch...")
    vit_model = ViTModel.from_pretrained(vit_path, local_files_only=True).float().eval()
    with torch.inference_mode():
        pytorch_cls = vit_model(pixel_values=pixel_values_pt).last_hidden_state[:, 0, :].numpy().astype(np.float32)

    print("[*] 3. Chạy suy luận ViT ONNX Runtime...")
    session_options = ort.SessionOptions()
    session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    session = ort.InferenceSession(str(onnx_path), session_options, providers=["CPUExecutionProvider"])
    
    input_name = session.get_inputs()[0].name
    onnx_cls = session.run(None, {input_name: pixel_values_np})[0].astype(np.float32)

    print("[*] 4. So sánh vector CLS (768 chiều)...")
    abs_diff = np.abs(pytorch_cls - onnx_cls)
    max_abs_error = float(np.max(abs_diff))
    mean_abs_error = float(np.mean(abs_diff))
    cosine_sim = float(
        np.dot(pytorch_cls[0], onnx_cls[0]) / 
        (np.linalg.norm(pytorch_cls[0]) * np.linalg.norm(onnx_cls[0]))
    )

    report = {
        "image_path": str(img_p),
        "cls_vector_dimension": int(pytorch_cls.shape[1]),
        "pytorch_cls_stats": {
            "mean": float(np.mean(pytorch_cls)),
            "std": float(np.std(pytorch_cls)),
            "min": float(np.min(pytorch_cls)),
            "max": float(np.max(pytorch_cls)),
            "first_5_values": pytorch_cls[0][:5].tolist()
        },
        "onnx_cls_stats": {
            "mean": float(np.mean(onnx_cls)),
            "std": float(np.std(onnx_cls)),
            "min": float(np.min(onnx_cls)),
            "max": float(np.max(onnx_cls)),
            "first_5_values": onnx_cls[0][:5].tolist()
        },
        "max_abs_error": max_abs_error,
        "mean_abs_error": mean_abs_error,
        "cosine_similarity": cosine_sim,
        "environment": {
            "python": sys.version.split()[0],
            "torch": torch.__version__,
            "onnxruntime": ort.__version__
        }
    }

    print("\n" + "="*55)
    print(" KẾT QUẢ ĐỐI CHIẾU VECTOR CLS (ViT PyTorch vs ViT ONNX)")
    print("="*55)
    print(f"Ảnh đầu vào: {img_p.name}")
    print(f"Kích thước vector: {pytorch_cls.shape}")
    print(f"PyTorch CLS [0:5]: {pytorch_cls[0][:5]}")
    print(f"ONNX    CLS [0:5]: {onnx_cls[0][:5]}")
    print(f"Sai số tuyệt đối trung bình (Mean Abs Error): {mean_abs_error:.8e}")
    print(f"Sai số tuyệt đối lớn nhất  (Max Abs Error) : {max_abs_error:.8e}")
    print(f"Độ tương đồng Cosine (Cosine Similarity)   : {cosine_sim:.10f}")
    print("="*55)

    if output_json:
        Path(output_json).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[+] Đã lưu báo cáo đối chiếu ViT vào: {output_json}")

    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chương trình đối chiếu ViT PyTorch vs ViT ONNX (MOB-01)")
    parser.add_argument("--image", required=True, help="Đường dẫn tới tệp ảnh CT")
    parser.add_argument("--output", default="ai/conversion/vit_parity_evaluation.json", help="Tệp JSON xuất kết quả")
    args = parser.parse_args()
    evaluate_vit_onnx_parity(args.image, args.output)
