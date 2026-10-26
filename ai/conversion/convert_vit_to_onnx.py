"""
Script khảo sát chuyển đổi nhánh Vision Transformer (ViT) sang ONNX
Giữ nguyên 100% kiến trúc ViT-Base và trọng số FP32 gốc từ gói Primary.
Mã nhiệm vụ: MOB-01 (LungCT)
"""
import os
import sys
import hashlib
from pathlib import Path
import torch
from transformers import ViTModel

# Cố định đầu ra UTF-8 cho console Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

ROOT = Path(__file__).resolve().parent.parent.parent
VIT_DIR = ROOT / "ai" / "models" / "extracted" / "primary" / "vit"
OUT_DIR = ROOT / "ai" / "conversion"

class ViTCLSExtractor(torch.nn.Module):
    """Bọc mô hình ViT để trả về trực tiếp vector CLS token [batch_size, 768]."""
    def __init__(self, vit_model):
        super().__init__()
        self.vit = vit_model
        
    def forward(self, pixel_values):
        outputs = self.vit(pixel_values=pixel_values)
        # Lấy CLS token tại vị trí index 0: [batch_size, 768]
        return outputs.last_hidden_state[:, 0, :]

def convert_vit_to_onnx():
    if not (VIT_DIR / "model.safetensors").exists():
        raise FileNotFoundError(f"Không tìm thấy trọng số ViT tại: {VIT_DIR}")

    print(f"[*] 1. Nạp mô hình ViT PyTorch FP32 từ: {VIT_DIR}")
    vit = ViTModel.from_pretrained(str(VIT_DIR), local_files_only=True).float().eval()
    
    wrapper = ViTCLSExtractor(vit)
    wrapper.eval()
    
    # Tensor đầu vào giả lập: shape [1, 3, 224, 224] theo đúng cấu hình config.json (VIT_SIZE: 224x224)
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)
    
    out_onnx = OUT_DIR / "vit_cls.onnx"
    print(f"[*] 2. Đang thực hiện xuất ONNX (opset_version=14)...")
    
    torch.onnx.export(
        wrapper,
        dummy_input,
        str(out_onnx),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["pixel_values"],
        output_names=["cls_token"],
        dynamic_axes={
            "pixel_values": {0: "batch_size"},
            "cls_token": {0: "batch_size"}
        }
    )
    
    onnx_bytes = out_onnx.read_bytes()
    sha256_hash = hashlib.sha256(onnx_bytes).hexdigest()
    size_mb = len(onnx_bytes) / (1024 * 1024)
    
    print("\n" + "="*50)
    print(" KẾT QUẢ XUẤT ONNX CHO NHÁNH VISION TRANSFORMER")
    print("="*50)
    print(f"Tệp đích : {out_onnx}")
    print(f"Kích thước: {len(onnx_bytes):,} bytes (~{size_mb:.2f} MB)")
    print(f"SHA256   : {sha256_hash}")
    print(f"Đầu vào  : pixel_values [batch_size, 3, 224, 224], float32")
    print(f"Đầu ra   : cls_token [batch_size, 768], float32")
    print("="*50)
    
    # Kiểm tra tính hợp lệ của tệp ONNX
    import onnx
    model_proto = onnx.load(str(out_onnx))
    onnx.checker.check_model(model_proto)
    print("[+] Kiểm tra onnx.checker.check_model thành công: Graph hợp lệ 100%!")

if __name__ == "__main__":
    convert_vit_to_onnx()
