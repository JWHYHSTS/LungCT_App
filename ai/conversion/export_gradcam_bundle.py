import tensorflow as tf
import numpy as np
from pathlib import Path
import sys, json

sys_path = 'ai/models/extracted/20261122T082142_409115Z'
sys.path.append(sys_path)
import custom_layers

print("Loading Keras model...")
model = tf.keras.models.load_model(f'{sys_path}/fusion/model.keras', compile=False)

target = model.get_layer('conv5_block3_out')
d_dense = model.get_layer('dense')
W0, b0 = d_dense.get_weights() # W0: (2048, 512)
d_cnn_tok = model.get_layer('cnn_token')
W1, b1 = d_cnn_tok.get_weights() # W1: (512, 256)
d_vit_tok = model.get_layer('vit_token')

print("1. Building multi-output fusion model...")
multi_model = tf.keras.Model(
    inputs=model.inputs,
    outputs=[
        model.output, # 0: scores (1, 3)
        target.output, # 1: activations (1, 16, 16, 2048)
        d_cnn_tok.output, # 2: cnn_tok (1, 256)
        d_vit_tok.output, # 3: vit_tok (1, 256)
        d_dense.output, # 4: a0 (1, 512)
        d_cnn_tok.output # 5: a1 (1, 256)
    ]
)

conv_multi = tf.lite.TFLiteConverter.from_keras_model(multi_model)
tflite_multi = conv_multi.convert()
multi_path = Path("ai/conversion/fusion_model_multi.tflite")
multi_path.write_bytes(tflite_multi)
print(f"Exported multi-output model: {multi_path} ({len(tflite_multi)} bytes)")

print("2. Building gradcam_tail model...")
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

conv_tail = tf.lite.TFLiteConverter.from_keras_model(tail_model)
tflite_tail = conv_tail.convert()
tail_path = Path("ai/conversion/gradcam_tail.tflite")
tail_path.write_bytes(tflite_tail)
print(f"Exported tail model: {tail_path} ({len(tflite_tail)} bytes)")

print("3. Exporting weights W0 and W1...")
# W1 is (512, 256) -> float32 array
# W0 is (2048, 512) -> float32 array
weights_path = Path("ai/conversion/gradcam_weights.bin")
with open(weights_path, "wb") as f:
    # Header: int32 num_weights, shape dims
    # Let's save W1 first (512*256 floats), then W0 (2048*512 floats)
    w1_bytes = W1.astype(np.float32).tobytes()
    w0_bytes = W0.astype(np.float32).tobytes()
    f.write(w1_bytes)
    f.write(w0_bytes)
print(f"Exported weights: {weights_path} ({weights_path.stat().st_size} bytes)")

print("4. Testing TFLite inference using the exported files...")
interp_multi = tf.lite.Interpreter(model_path=str(multi_path))
interp_multi.allocate_tensors()

interp_tail = tf.lite.Interpreter(model_path=str(tail_path))
# Set batch dimension of tail model to 256
interp_tail.resize_tensor_input(0, [256, 256])
interp_tail.resize_tensor_input(1, [256, 256])
interp_tail.allocate_tensors()

print("All TFLite models allocated successfully!")
