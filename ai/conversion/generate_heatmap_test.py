import tensorflow as tf
import numpy as np
from pathlib import Path
import sys, json
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import onnxruntime as ort

sys_path = 'ai/models/extracted/20261122T082142_409115Z'
sys.path.append(sys_path)
import custom_layers

model = tf.keras.models.load_model(f'{sys_path}/fusion/model.keras', compile=False)
sess = ort.InferenceSession('mobile/android/app/src/main/assets/models/vit_cls.onnx')

target = model.get_layer('conv5_block3_out')
d_dense = model.get_layer('dense')
W0, b0 = d_dense.get_weights()
d_cnn_tok = model.get_layer('cnn_token')
W1, b1 = d_cnn_tok.get_weights()
d_vit_tok = model.get_layer('vit_token')

multi_model = tf.keras.Model(
    inputs=model.inputs,
    outputs=[
        model.output,
        target.output,
        d_cnn_tok.output,
        d_vit_tok.output,
        d_dense.output,
        d_cnn_tok.output
    ]
)

cnn_tok_in = tf.keras.Input(shape=(256,), name='cnn_tok')
vit_tok_in = tf.keras.Input(shape=(256,), name='vit_tok')

gated = model.get_layer('adaptive_gate')([cnn_tok_in, vit_tok_in])
tokens = model.get_layer('stack_tokens')([cnn_tok_in, vit_tok_in])
attn = model.get_layer('cross_attn')(tokens, tokens, training=False)
add_out = model.get_layer('add')([tokens, attn])
norm_out = model.get_layer('layer_normalization_1')(add_out)
flat_out = model.get_layer('attn_flat')(norm_out)

fused = model.get_layer('fusion_concat')([gated, cnn_tok_in, vit_tok_in, flat_out])

h = model.get_layer('dense_4')(fused)
h = model.get_layer('dense_5')(h)
h = model.get_layer('dense_6')(h)
scores_tensor = model.get_layer('classifier')(h)
tail_model = tf.keras.Model(inputs=[cnn_tok_in, vit_tok_in], outputs=scores_tensor)

# Run on Benign case 114
img_path = 'docs/evidence/mob-02/bengin_case_114.jpg'
orig_img = Image.open(img_path).convert('RGB')
orig_w, orig_h = orig_img.size

cnn_arr = np.asarray(orig_img.resize((512, 512), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0
vit_arr = np.asarray(orig_img.resize((224, 224), Image.Resampling.NEAREST), dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
mean = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
std = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
vit_norm = (vit_arr - mean) / std
vit_cls = sess.run(['cls_token'], {'pixel_values': vit_norm})[0]

scores, activations, cnn_tok_val, vit_tok_val, a0, a1 = multi_model([cnn_arr, vit_cls], training=False)
scores = scores.numpy()
activations = activations.numpy()
cnn_tok_val = cnn_tok_val.numpy()
vit_tok_val = vit_tok_val.numpy()
a0 = a0.numpy()
a1 = a1.numpy()

pred_class = int(np.argmax(scores[0]))

eps = 1e-3
c_pos = np.repeat(cnn_tok_val, 256, axis=0) + np.eye(256, dtype=np.float32) * eps
c_neg = np.repeat(cnn_tok_val, 256, axis=0) - np.eye(256, dtype=np.float32) * eps
v_b = np.repeat(vit_tok_val, 256, axis=0)

s_pos = tail_model([c_pos, v_b], training=False).numpy()
s_neg = tail_model([c_neg, v_b], training=False).numpy()
v_grad = (s_pos[:, pred_class] - s_neg[:, pred_class]) / (2 * eps)

d1 = (v_grad[None, :] * (a1 > 0).astype(np.float32)) @ W1.T
w_grad = (d1 * (a0 > 0).astype(np.float32)) @ W0.T

cam_fast = np.maximum(0, np.sum(activations[0] * w_grad[0].reshape(1, 1, 2048), axis=-1))
max_fast = float(np.max(cam_fast))
cam_norm = cam_fast / max_fast if max_fast > 1e-12 else np.zeros_like(cam_fast)

# Resize CAM to original size using PIL bilinear
cam_img = Image.fromarray((cam_norm * 255.0).astype(np.uint8), mode='L')
cam_resized = cam_img.resize((orig_w, orig_h), Image.Resampling.BILINEAR)
cam_arr_resized = np.asarray(cam_resized, dtype=np.float32) / 255.0

# Apply Jet colormap
jet = plt.colormaps['jet']
heatmap = (jet(cam_arr_resized)[:, :, :3] * 255.0).astype(np.uint8)

# Overlay on original image with alpha 0.4
orig_np = np.asarray(orig_img)
overlay = (orig_np * 0.6 + heatmap * 0.4).astype(np.uint8)

Image.fromarray(overlay).save('ai/conversion/benign_114_overlay_test.png')
Image.fromarray(heatmap).save('ai/conversion/benign_114_heatmap_only.png')
print("Successfully generated overlay and heatmap test images!")
