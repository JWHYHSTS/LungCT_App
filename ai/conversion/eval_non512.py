import sys
import json
import numpy as np
import onnxruntime as ort
import tensorflow as tf
from PIL import Image

onnx_path = "ai/conversion/vit_cls.onnx"
tflite_path = "ai/conversion/fusion_model.tflite"

session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
interp = tf.lite.Interpreter(tflite_path)
interp.allocate_tensors()
in_details = interp.get_input_details()
out_details = interp.get_output_details()

def run_image(img_path):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    
    # ViT preprocessing: Pillow resize to (224, 224) NEAREST, normalize (x/255.0 - 0.5) / 0.5, shape [1, 3, 224, 224] (CHW)
    vit_img = img.resize((224, 224), Image.Resampling.NEAREST)
    vit_arr = np.array(vit_img, dtype=np.float32)
    vit_tensor = ((vit_arr / 255.0 - 0.5) / 0.5).transpose(2, 0, 1)[np.newaxis, ...]
    
    # ONNX forward
    cls_token = session.run(None, {"pixel_values": vit_tensor})[0] # [1, 768]
    
    # CNN preprocessing: Pillow resize to (512, 512) NEAREST, normalize x / 255.0, shape [1, 512, 512, 3] (HWC)
    cnn_img = img.resize((512, 512), Image.Resampling.NEAREST)
    cnn_tensor = (np.array(cnn_img, dtype=np.float32) / 255.0)[np.newaxis, ...]
    
    # TFLite forward
    for item in in_details:
        if "vit" in item["name"]:
            interp.set_tensor(item["index"], cls_token)
        else:
            interp.set_tensor(item["index"], cnn_tensor)
    interp.invoke()
    scores = interp.get_tensor(out_details[0]["index"])[0]
    classes = ["Benign", "Malignant", "Normal"]
    pred = classes[int(np.argmax(scores))]
    
    res = {
        "image": img_path,
        "width": w,
        "height": h,
        "vit_tensor_slice": vit_tensor[0, 0, :3, :3].tolist(),
        "cnn_tensor_slice": cnn_tensor[0, :3, :3, 0].tolist(),
        "cls_token_head": cls_token[0, :5].tolist(),
        "scores": {
            "Benign": float(scores[0]),
            "Malignant": float(scores[1]),
            "Normal": float(scores[2])
        },
        "predicted": pred
    }
    print(f"=== {img_path} ({w}x{h}) ===")
    print(f"Scores: Benign={scores[0]:.6f}, Malignant={scores[1]:.6f}, Normal={scores[2]:.6f} => {pred}")
    print(f"CLS head: {cls_token[0, :5]}")
    return res

results = []
results.append(run_image("docs/evidence/mob-02/test_benign_384x384.jpg"))
results.append(run_image("docs/evidence/mob-02/test_malignant_600x450.jpg"))

with open("docs/evidence/mob-02/pc_non512_eval.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
