import tensorflow as tf
from tensorflow.keras import layers, regularizers

@tf.keras.utils.register_keras_serializable(package="LungCT")
class ResNetPreprocess(layers.Layer):
    """Chuyển RGB [0,1] sang preprocessing ResNet ImageNet đúng một lần."""
    def call(self, x): return tf.keras.applications.resnet.preprocess_input(x * 255.0)

@tf.keras.utils.register_keras_serializable(package="LungCT")
class StackTokens(layers.Layer):
    def call(self, inputs): return tf.stack(inputs, axis=1)
    def compute_output_shape(self, shapes): return (shapes[0][0], len(shapes), shapes[0][-1])

@tf.keras.utils.register_keras_serializable(package="LungCT")
class AdaptiveGate(layers.Layer):
    """Học alpha trong [0,1] để trộn hai token có cùng chiều."""
    def __init__(self, d_hidden=128, dropout=0.25, l2=1e-4, **kwargs):
        super().__init__(**kwargs)
        self.d_hidden, self.dropout_rate, self.l2_rate = d_hidden, dropout, l2
        self.concat = layers.Concatenate()
        self.d1 = layers.Dense(d_hidden, activation="relu", kernel_regularizer=regularizers.l2(l2))
        self.drop = layers.Dropout(dropout)
        self.logit = layers.Dense(1, kernel_initializer="zeros", bias_initializer="zeros")
    def build(self, input_shape):
        # Tạo biến rõ ràng để Keras khôi phục sublayer weights an toàn.
        a, b = input_shape
        if a[-1] != b[-1]: raise ValueError("Hai token phải cùng chiều.")
        self.concat.build(input_shape)
        self.d1.build((a[0], a[-1] + b[-1]))
        self.drop.build((a[0], self.d_hidden))
        self.logit.build((a[0], self.d_hidden))
        super().build(input_shape)
    def call(self, inputs, training=None):
        a, b = inputs
        alpha = tf.sigmoid(self.logit(self.drop(self.d1(self.concat([a, b])), training=training)))
        return alpha * a + (1-alpha) * b
    def get_config(self):
        return {**super().get_config(), "d_hidden": self.d_hidden,
                "dropout": self.dropout_rate, "l2": self.l2_rate}

