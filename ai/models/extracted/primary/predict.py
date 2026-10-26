"""Inference CPU offline: python predict.py --image PATH --output result.json."""
import os
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
import argparse, json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
import tensorflow as tf
import torch
from transformers import ViTModel, ViTImageProcessor
import custom_layers  # Registers the serialized LungCT classes.

def predict(image_path):
    """Load both branches locally; preserve resize, normalization and class order."""
    root = Path(__file__).resolve().parent
    config = json.loads((root / "config.json").read_text(encoding="utf-8"))
    with Image.open(image_path) as original:
        rgb = original.convert("RGB").copy()
    cnn = np.asarray(rgb.resize(tuple(config["IMG_SIZE"]), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0
    processor = ViTImageProcessor.from_pretrained(root / "vit", local_files_only=True)
    vit = ViTModel.from_pretrained(root / "vit", local_files_only=True).float().eval()
    resized = rgb.resize(tuple(config["VIT_SIZE"]), Image.Resampling.NEAREST)
    batch = processor(images=[resized], return_tensors="pt")
    with torch.inference_mode():
        cls = vit(**batch).last_hidden_state[:,0,:].numpy().astype(np.float32)
    model = tf.keras.models.load_model(root / "fusion" / "model.keras", compile=False, safe_mode=True)
    scores = np.asarray(model((cnn, cls), training=False))[0]
    assert np.isfinite(scores).all() and np.allclose(scores.sum(), 1, atol=1e-4)
    names = config["CLASS_NAMES"]
    return {"class_order": names, "scores": scores.tolist(), "label": names[int(scores.argmax())],
            "execution_source": "computer_cpu_offline", "mobile_ready": False}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = predict(args.image)
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))
