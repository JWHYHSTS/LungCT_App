import tensorflow as tf
from tensorflow.keras import layers, regularizers
import numpy as np
from pathlib import Path
import sys, json

sys.path.append('ai/models/extracted/20261122T082142_409115Z')
import custom_layers

print("Loading Keras model...")
keras_model = tf.keras.models.load_model('ai/models/extracted/20261122T082142_409115Z/fusion/model.keras', compile=False)

# Let's inspect the exact layers
print("Building differentiable Grad-CAM module...")

class UnifiedGradCamModel(tf.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
        self.target_layer = model.get_layer('conv5_block3_out')
        # Sub-model for CNN backbone up to conv5_block3_out
        self.cnn_backbone = tf.keras.Model(
            inputs=model.inputs[0],
            outputs=self.target_layer.output
        )

        # Build head submodel taking (p_input, vit_input) -> scores
        p_in = tf.keras.Input(shape=(2048,), name='p_input')
        vit_in = tf.keras.Input(shape=(768,), name='vit_input')

        # Connect the layers with approximate gelu and relu using pure builtin differentiable ops
        # Note: Dense weights in keras are W and b
        d_dense = model.get_layer('dense')
        x = tf.where(d_dense(p_in) > 0.0, d_dense(p_in), 0.0)

        d_cnn_tok = model.get_layer('cnn_token')
        cnn_tok = tf.where(d_cnn_tok(x) > 0.0, d_cnn_tok(x), 0.0)

        ln_vit = model.get_layer('layer_normalization')
        v = ln_vit(vit_in)

        d_dense_1 = model.get_layer('dense_1')
        v_h1 = d_dense_1(v)
        # Approximate GELU: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
        v_gelu1 = 0.5 * v_h1 * (1.0 + tf.tanh(0.7978845608 * (v_h1 + 0.044715 * tf.pow(v_h1, 3))))

        d_vit_tok = model.get_layer('vit_token')
        v_h2 = d_vit_tok(v_gelu1)
        vit_tok = 0.5 * v_h2 * (1.0 + tf.tanh(0.7978845608 * (v_h2 + 0.044715 * tf.pow(v_h2, 3))))

        # AdaptiveGate
        gate_layer = model.get_layer('adaptive_gate')
        gate_concat = tf.concat([cnn_tok, vit_tok], axis=-1)
        gate_h1 = tf.where(gate_layer.d1(gate_concat) > 0.0, gate_layer.d1(gate_concat), 0.0)
        alpha = tf.sigmoid(gate_layer.logit(gate_h1))
        gated = alpha * cnn_tok + (1.0 - alpha) * vit_tok

        # MultiHeadAttention
        tokens = tf.stack([cnn_tok, vit_tok], axis=1) # (1, 2, 256)
        attn_layer = model.get_layer('cross_attn')
        attn_out = attn_layer(tokens, tokens, training=False)
        add_out = tokens + attn_out
        ln1_layer = model.get_layer('layer_normalization_1')
        norm_out = ln1_layer(add_out)
        flat_out = tf.reshape(norm_out, [-1, 512])

        fused = tf.concat([gated, cnn_tok, vit_tok, flat_out], axis=-1)

        d_dense_4 = model.get_layer('dense_4')
        h4 = d_dense_4(fused)
        h4_gelu = 0.5 * h4 * (1.0 + tf.tanh(0.7978845608 * (h4 + 0.044715 * tf.pow(h4, 3))))

        d_dense_5 = model.get_layer('dense_5')
        h5 = d_dense_5(h4_gelu)
        h5_gelu = 0.5 * h5 * (1.0 + tf.tanh(0.7978845608 * (h5 + 0.044715 * tf.pow(h5, 3))))

        d_dense_6 = model.get_layer('dense_6')
        h6 = d_dense_6(h5_gelu)
        h6_gelu = 0.5 * h6 * (1.0 + tf.tanh(0.7978845608 * (h6 + 0.044715 * tf.pow(h6, 3))))

        d_classifier = model.get_layer('classifier')
        scores = tf.nn.softmax(d_classifier(h6_gelu), axis=-1)

        self.head = tf.keras.Model(inputs=[p_in, vit_in], outputs=scores)

    @tf.function(input_signature=[
        tf.TensorSpec(shape=[1, 512, 512, 3], dtype=tf.float32, name='image_input'),
        tf.TensorSpec(shape=[1, 768], dtype=tf.float32, name='vit_cls_input'),
        tf.TensorSpec(shape=[1], dtype=tf.int32, name='target_class')
    ])
    def __call__(self, image, vit_cls, target_class):
        # 1. Forward CNN backbone
        activations = self.cnn_backbone(image, training=False) # (1, 16, 16, 2048)
        p = tf.reduce_mean(activations, axis=[1, 2]) # (1, 2048)

        # 2. Differentiable Head with gradient
        with tf.GradientTape() as tape:
            tape.watch(p)
            scores = self.head([p, vit_cls], training=False)
            idx = target_class[0]
            # Use argmax if idx < 0
            selected_idx = tf.where(idx >= 0, idx, tf.cast(tf.argmax(scores[0]), tf.int32))
            one_hot = tf.one_hot(selected_idx, 3, dtype=tf.float32)
            obj = tf.reduce_sum(scores * one_hot)

        grad_p = tape.gradient(obj, p) # (1, 2048)
        # Weights for Grad-CAM
        weights = tf.reshape(grad_p, [1, 1, 1, 2048])
        cam = tf.nn.relu(tf.reduce_sum(activations * weights, axis=-1))[0] # (16, 16)
        max_val = tf.reduce_max(cam)
        norm_cam = tf.where(max_val > 1e-12, cam / max_val, tf.zeros_like(cam))

        return scores, norm_cam

unified_mod = UnifiedGradCamModel(keras_model)
print("Testing eager call with dummy inputs...")
img = tf.zeros([1, 512, 512, 3], dtype=tf.float32)
vit = tf.zeros([1, 768], dtype=tf.float32)
cls_idx = tf.constant([0], dtype=tf.int32)
scores, cam = unified_mod(img, vit, cls_idx)
print("Eager execution success! scores:", scores.shape, "cam:", cam.shape)

print("Converting to TFLite flatbuffer...")
converter = tf.lite.TFLiteConverter.from_concrete_functions([unified_mod.__call__.get_concrete_function()])
tflite_bytes = converter.convert()
out_path = Path("ai/conversion/fusion_model_with_gradcam.tflite")
out_path.write_bytes(tflite_bytes)
print(f"SUCCESS! Exported unified Grad-CAM model to {out_path} ({len(tflite_bytes)} bytes)")
