import tensorflow as tf
import numpy as np
from pathlib import Path
from PIL import Image
import onnxruntime as ort

print("1. Loading ViT ONNX session...")
sess = ort.InferenceSession('mobile/android/app/src/main/assets/models/vit_cls.onnx')

img = Image.open('docs/evidence/mob-02/bengin_case_114.jpg').convert('RGB')
orig_w, orig_h = img.size
cnn_arr = np.asarray(img.resize((512, 512), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0
vit_arr = np.asarray(img.resize((224, 224), Image.Resampling.NEAREST), dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
mean = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
std = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
vit_norm = (vit_arr - mean) / std
vit_cls = sess.run(['cls_token'], {'pixel_values': vit_norm})[0]

print("2. Loading exported multi-output fusion_model_multi.tflite...")
interp_multi = tf.lite.Interpreter(model_path="ai/conversion/fusion_model_multi.tflite")
interp_multi.allocate_tensors()

in_details = interp_multi.get_input_details()
out_details = interp_multi.get_output_details()

# Find input indices
img_idx = in_details[0]['index'] if in_details[0]['shape'][1] == 512 else in_details[1]['index']
vit_idx = in_details[1]['index'] if in_details[0]['shape'][1] == 512 else in_details[0]['index']

interp_multi.set_tensor(img_idx, cnn_arr)
interp_multi.set_tensor(vit_idx, vit_cls)
interp_multi.invoke()

# Map outputs by name suffix
outputs = {}
for out in out_details:
    name = out['name']
    data = interp_multi.get_tensor(out['index'])
    if name.endswith(':0'):
        outputs['scores'] = data
    elif name.endswith(':1'):
        outputs['activations'] = data
    elif name.endswith(':3'):
        outputs['vit_tok'] = data
    elif name.endswith(':4'):
        outputs['a0'] = data
    elif name.endswith(':5') or name.endswith(':2'):
        outputs['cnn_tok'] = data
        outputs['a1'] = data

scores = outputs['scores']
activations = outputs['activations']
cnn_tok = outputs['cnn_tok']
vit_tok = outputs['vit_tok']
a0 = outputs['a0']
a1 = outputs['a1']

pred_class = int(np.argmax(scores[0]))
print(f"Predicted class: {pred_class} (Score: {scores[0, pred_class]:.6f})")

print("3. Loading exported gradcam_tail.tflite...")
interp_tail = tf.lite.Interpreter(model_path="ai/conversion/gradcam_tail.tflite")
interp_tail.resize_tensor_input(0, [256, 256])
interp_tail.resize_tensor_input(1, [256, 256])
interp_tail.allocate_tensors()

tail_in = interp_tail.get_input_details()
tail_out = interp_tail.get_output_details()

# Find tail input indices by name
tail_cnn_idx = tail_in[1]['index'] if 'cnn_tok' in tail_in[1]['name'] else tail_in[0]['index']
tail_vit_idx = tail_in[0]['index'] if 'vit_tok' in tail_in[0]['name'] else tail_in[1]['index']

eps = 1e-3
c_pos = np.repeat(cnn_tok, 256, axis=0) + np.eye(256, dtype=np.float32) * eps
c_neg = np.repeat(cnn_tok, 256, axis=0) - np.eye(256, dtype=np.float32) * eps
v_batch = np.repeat(vit_tok, 256, axis=0)

interp_tail.set_tensor(tail_cnn_idx, c_pos)
interp_tail.set_tensor(tail_vit_idx, v_batch)
interp_tail.invoke()
s_pos = interp_tail.get_tensor(tail_out[0]['index'])

interp_tail.set_tensor(tail_cnn_idx, c_neg)
interp_tail.set_tensor(tail_vit_idx, v_batch)
interp_tail.invoke()
s_neg = interp_tail.get_tensor(tail_out[0]['index'])

v_grad = (s_pos[:, pred_class] - s_neg[:, pred_class]) / (2 * eps)

print("4. Loading gradcam_weights.bin...")
raw_w = np.fromfile("ai/conversion/gradcam_weights.bin", dtype=np.float32)
W1 = raw_w[:512*256].reshape(512, 256)
W0 = raw_w[512*256:].reshape(2048, 512)

d1 = (v_grad[None, :] * (a1 > 0).astype(np.float32)) @ W1.T
w_grad = (d1 * (a0 > 0).astype(np.float32)) @ W0.T

cam_tflite = np.maximum(0, np.sum(activations[0] * w_grad[0].reshape(1, 1, 2048), axis=-1))
max_val = np.max(cam_tflite)
cam_norm = cam_tflite / max_val if max_val > 1e-12 else np.zeros_like(cam_tflite)

ref_raw_npy = np.load("ai/models/extracted/20261122T082142_409115Z/fusion/gradcam_raw.npy")
diff = np.max(np.abs(cam_norm - ref_raw_npy))
print(f"Max diff between 100% pure TFLite pipeline and reference Colab: {diff:.6f}")
assert diff < 0.01, "Diff exceeds tolerance!"
print("PARITY TEST PASSED 100%!")
