import tensorflow as tf
import numpy as np
import time

sys_path = 'ai/models/extracted/20261122T082142_409115Z'
import sys
sys.path.append(sys_path)
import custom_layers

model = tf.keras.models.load_model(f'{sys_path}/fusion/model.keras', compile=False)

# Target: conv5_block3_out
target = model.get_layer('conv5_block3_out')
grad_model = tf.keras.Model(model.inputs, [target.output, model.output])

# Test image: Bengin case 114
from PIL import Image
import onnxruntime as ort

sess = ort.InferenceSession('mobile/android/app/src/main/assets/models/vit_cls.onnx')
img = Image.open('docs/evidence/mob-02/bengin_case_114.jpg').convert('RGB')
cnn_arr = np.asarray(img.resize((512, 512), Image.Resampling.NEAREST), dtype=np.float32)[None] / 255.0
vit_arr = np.asarray(img.resize((224, 224), Image.Resampling.NEAREST), dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
mean = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
std = np.array([0.5, 0.5, 0.5], dtype=np.float32).reshape(1, 3, 1, 1)
vit_norm = (vit_arr - mean) / std
vit_cls = sess.run(['cls_token'], {'pixel_values': vit_norm})[0]

t_img = tf.convert_to_tensor(cnn_arr)
t_vit = tf.convert_to_tensor(vit_cls)

# Reference Ground Truth Grad-CAM from GradientTape
with tf.GradientTape() as tape:
    tape.watch(t_img)
    activations, scores = grad_model([t_img, t_vit], training=False)
    objective = scores[0, 0] # Class 0: Benign

grads_ref = tape.gradient(objective, activations)
weights_ref = tf.reduce_mean(grads_ref, axis=(1, 2), keepdims=True)
cam_ref = tf.nn.relu(tf.reduce_sum(activations * weights_ref, axis=-1))[0]
cam_ref = (cam_ref / tf.reduce_max(cam_ref)).numpy()

raw_npy = np.load(f'{sys_path}/fusion/gradcam_raw.npy')
print("Diff between Ground Truth Tape and saved gradcam_raw.npy:", np.max(np.abs(cam_ref - raw_npy)))

# Now: Let's test the Sub-graph from p to scores:
# p is avg_pool of activations
p_val = tf.reduce_mean(activations, axis=[1, 2]) # (1, 2048)

# Now, with GradientTape watching p:
with tf.GradientTape() as tape_p:
    tape_p.watch(p_val)
    # Forward through head
    d_dense = model.get_layer('dense')
    x = d_dense(p_val)
    cnn_tok = model.get_layer('cnn_token')(x)
    
    ln_vit = model.get_layer('layer_normalization')
    v = ln_vit(t_vit)
    d_dense_1 = model.get_layer('dense_1')
    v = d_dense_1(v)
    vit_tok = model.get_layer('vit_token')(v)
    
    gated = model.get_layer('adaptive_gate')([cnn_tok, vit_tok])
    tokens = model.get_layer('stack_tokens')([cnn_tok, vit_tok])
    attn = model.get_layer('cross_attn')(tokens, tokens, training=False)
    add_out = model.get_layer('add')([tokens, attn])
    norm_out = model.get_layer('layer_normalization_1')(add_out)
    flat_out = model.get_layer('attn_flat')(norm_out)
    
    fused = model.get_layer('fusion_concat')([gated, cnn_tok, vit_tok, flat_out])
    
    h = model.get_layer('dense_4')(fused)
    h = model.get_layer('dense_5')(h)
    h = model.get_layer('dense_6')(h)
    head_scores = model.get_layer('classifier')(h)
    obj_p = head_scores[0, 0]

grad_p_val = tape_p.gradient(obj_p, p_val)
weights_p = tf.reshape(grad_p_val, [1, 1, 1, 2048])
cam_p = tf.nn.relu(tf.reduce_sum(activations * weights_p, axis=-1))[0]
cam_p = (cam_p / tf.reduce_max(cam_p)).numpy()

print("Diff between Tape on p and full model Tape:", np.max(np.abs(cam_p - cam_ref)))
print("Score parity:", np.max(np.abs(scores.numpy() - head_scores.numpy())))
