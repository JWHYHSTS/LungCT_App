import tensorflow as tf
import numpy as np
from pathlib import Path
import sys, json

sys.path.append('ai/models/extracted/20261122T082142_409115Z')
import custom_layers

model = tf.keras.models.load_model('ai/models/extracted/20261122T082142_409115Z/fusion/model.keras', compile=False)

# Build the Head Model taking (p_input: (1, 2048), vit_input: (1, 768)) -> scores: (1, 3)
p_in = tf.keras.Input(shape=(2048,), name='p_input')
vit_in = tf.keras.Input(shape=(768,), name='vit_input')

x = model.get_layer('dense')(p_in)
x = model.get_layer('dropout')(x, training=False)
cnn_tok = model.get_layer('cnn_token')(x)

v = model.get_layer('layer_normalization')(vit_in)
v = model.get_layer('dense_1')(v)
v = model.get_layer('dropout_1')(v, training=False)
vit_tok = model.get_layer('vit_token')(v)

gated = model.get_layer('adaptive_gate')([cnn_tok, vit_tok])
tokens = model.get_layer('stack_tokens')([cnn_tok, vit_tok])
attn = model.get_layer('cross_attn')(tokens, tokens, training=False)
add_out = model.get_layer('add')([tokens, attn])
norm_out = model.get_layer('layer_normalization_1')(add_out)
flat_out = model.get_layer('attn_flat')(norm_out)

fused = model.get_layer('fusion_concat')([gated, cnn_tok, vit_tok, flat_out])

h = model.get_layer('dense_4')(fused)
h = model.get_layer('dropout_4')(h, training=False)
h = model.get_layer('dense_5')(h)
h = model.get_layer('dropout_5')(h, training=False)
h = model.get_layer('dense_6')(h)
h = model.get_layer('dropout_6')(h, training=False)
scores = model.get_layer('classifier')(h)

head_model = tf.keras.Model(inputs=[p_in, vit_in], outputs=scores)

class HeadGradModule(tf.Module):
    def __init__(self, head):
        super().__init__()
        self.head = head

    @tf.function(input_signature=[
        tf.TensorSpec(shape=[1, 2048], dtype=tf.float32, name='p_input'),
        tf.TensorSpec(shape=[1, 768], dtype=tf.float32, name='vit_input'),
        tf.TensorSpec(shape=[1], dtype=tf.int32, name='class_idx')
    ])
    def __call__(self, p, vit, class_idx):
        with tf.GradientTape() as tape:
            tape.watch(p)
            scores = self.head([p, vit], training=False)
            idx = class_idx[0]
            obj = scores[0, idx]
        grad_p = tape.gradient(obj, p) # shape (1, 2048)
        return scores, grad_p

mod = HeadGradModule(head_model)
p_dummy = tf.zeros([1, 2048], dtype=tf.float32)
v_dummy = tf.zeros([1, 768], dtype=tf.float32)
c_dummy = tf.constant([0], dtype=tf.int32)
s, g = mod(p_dummy, v_dummy, c_dummy)
print("Eager execution of HeadGradModule OK! scores:", s.shape, "grad_p:", g.shape)

# Convert to ONNX using tf2onnx
import tf2onnx
spec = (
    tf.TensorSpec(shape=[1, 2048], dtype=tf.float32, name='p_input'),
    tf.TensorSpec(shape=[1, 768], dtype=tf.float32, name='vit_input'),
    tf.TensorSpec(shape=[1], dtype=tf.int32, name='class_idx')
)
model_proto, _ = tf2onnx.convert.from_function(
    mod.__call__,
    input_signature=spec,
    opset=17,
    output_path='ai/conversion/gradcam_head.onnx'
)
print("ONNX CONVERSION SUCCESS! File saved to ai/conversion/gradcam_head.onnx")
