LungCT Primary model source bundle
Primary model: Adaptive AACNN-ViT. This is NOT a mobile-ready runtime artifact.
Fusion: fusion/model.keras and fusion/best.weights.h5.
ViT: vit/ with pretrained weights, config and processor. Load from local folder after download.
Class order: Benign, Malignant, Normal.
CNN input: RGB resized to 512x512 nearest, float32 [0,1]; model contains ResNet preprocessing.
ViT input: RGB resized to 224x224 nearest, then saved ViT processor; CLS at index 0.
Custom Keras classes: ResNetPreprocess, StackTokens, AdaptiveGate (definitions in custom_layers.py; import this module before loading).
Load Keras with compile=False and safe_mode=True after registering these classes.
Use the environment and metadata files for reproducibility.
Run offline on a computer: python predict.py --image /path/to/image.png --output result.json
The package includes one-image offline parity evidence; validate more representative images before deployment.
Grad-CAM in this notebook explains the CNN branch while the ViT CLS is fixed.
Android/iOS conversion, parity, offline runtime and offline Grad-CAM are still NOT VERIFIED.
Review source/model/data licenses before distribution.
