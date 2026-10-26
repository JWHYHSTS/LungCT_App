# Báo Cáo Kỹ Thuật Khảo Sát & Thử Nghiệm Chuyển Đổi Mô Hình Edge AI (MOB-01 / MOB-02)

**Thời điểm cập nhật**: 26/10/2026 23:55 (UTC+7)  
**Môi trường thực nghiệm**: Python 3.14.2 / TensorFlow 2.22.0-rc0 / PyTorch 2.14.1+cpu / Transformers 5.20.2 / Keras 3.16.0.dev trên Windows  
**Thiết bị đích khảo sát**: Xiaomi Redmi 13 (Android) & iPhone (iOS)  
**Tài liệu chuẩn đối chiếu**: `AGENTS.md` (Phần II, Mục 2 & 3), `docs/architecture/LungCT_Pipeline.drawio` (Trang 3).

---

## 1. Kiểm Tra Toàn Diện Đầu Vào Thực Tế Trong Dự Án

### 1.1. Hiện trạng gói nguồn mô hình chính (Primary FP32)
- **Tệp lưu trữ**: `ai/models/source/primary/LungCT_Primary_20261024T050904_329781Z.zip`
  - Dung lượng: **923,085,894 bytes** (~880.3 MB).
  - Checksum SHA256: `3105a53e1d32e5a919caa28f70d4a468a7d942e984593b25c4fb602a27ecd7c7` (Khớp tuyệt đối 100% với tệp `.sha256` đi kèm).
- **Thư mục giải nén (`ai/models/extracted/primary/`)**: Chứa 46 tệp gồm:
  - Nhánh Fusion Keras: `fusion/model.keras` (287,507,235 bytes ~ 274.19 MB), `fusion/best.weights.h5` (287,320,808 bytes ~ 274.01 MB), `custom_layers.py`.
  - Nhánh ViT PyTorch: `vit/model.safetensors` (345,579,424 bytes ~ 329.57 MB), `vit/config.json`, `vit/preprocessor_config.json`.
  - Metadata & Bằng chứng gốc: `config.json`, `bundle_manifest.json`, `split_manifest.json`, `fusion/artifact_manifest.json`, `fusion/gradcam_status.json`, `fusion/gradcam_raw.npy`, `offline_prediction.json`, `offline_parity.json`.

### 1.2. Nhận diện các đầu vào còn thiếu cho việc chạy On-Device
1. **Thiếu tệp ảnh CT mẫu độc lập**:
   - Trong kho mã, tập dữ liệu gốc không được đưa vào Git thông thường (tuân thủ quy định `AGENTS.md` và `split_manifest.json`).
   - Tệp ảnh CT đối chứng `Benign/Bengin case (114).jpg` (SHA256: `925e9ab76b0a7ee5ff91f202de4afe25a5bfa3007cfac7fc292f098542ae4a69`) chỉ được lưu vết qua kết quả `new_image_result.json` và `offline_prediction.json` từ Colab; hiện chưa có tệp ảnh nhị phân mẫu đặt sẵn trong kho cục bộ.
2. **Thiếu artifact di động cho nhánh ViT**:
   - Nhánh ViT hiện đang ở dạng `model.safetensors` (329.57 MB) dành cho PyTorch trên máy tính/Colab, chưa được xuất sang runtime di động.
3. **Thiếu module tiền xử lý ảnh trên di động**:
   - `predict.py` sử dụng thư viện Python `PIL` và `transformers.ViTImageProcessor`. Trên React Native (Android/iOS) cần viết adapter native hoặc module C++ để tiền xử lý ảnh nhị phân thành 2 kích thước `512x512` (CNN) và `224x224` (ViT).

---

## 2. Thông Số Kiến Trúc Mô Hình Adaptive AACNN-ViT

- **Framework gốc**: TensorFlow 2.21.0 + PyTorch 2.11.0 + Transformers 5.20.2 (Google Colab, GPU Tesla T4).
- **Thứ tự 3 phân lớp mục tiêu (Class Order)**: Cố định tuyệt đối:
  $$\text{class\_order} = [\text{"Benign" (Lành tính)},\ \text{"Malignant" (Ác tính)},\ \text{"Normal" (Bình thường)}]$$
- **Thông số đầu vào (Inputs)**:
  1. `image_input`: Shape `[None, 512, 512, 3]`, kiểu `float32`, dải giá trị $[0.0, 1.0]$. Bên trong mô hình tích hợp lớp tùy biến `ResNetPreprocess` tự động nhân với $255.0$ và trừ trung bình ImageNet.
  2. `vit_features_input`: Shape `[None, 768]`, kiểu `float32`, là vector đặc trưng CLS token trích xuất từ lớp ẩn cuối cùng của Vision Transformer.
- **Cấu trúc mạng Fusion**:
  - `cnn_token`: Dense(256), `vit_token`: Dense(256).
  - `StackTokens`: Xếp chồng thành tensor `[None, 2, 256]`, đưa qua `MultiHeadAttention` (cross-attention) và `LayerNormalization`.
  - `AdaptiveGate`: Mạng nơ-ron nhỏ học hệ số $\alpha \in [0, 1]$ qua Sigmoid để hòa trộn động: $\alpha \cdot \text{CNN} + (1-\alpha) \cdot \text{ViT}$.
  - Nối ghép `fusion_concat` (1280-d) qua chuỗi Dense (1024 -> 512 -> 256) và Softmax đầu ra (3 phân lớp).
- **Thông số đầu ra (Outputs)**:
  - Vector xác suất 3 phân lớp Softmax: Shape `[None, 3]`, kiểu `float32`, tổng xác suất bằng $1.0$.

---

## 3. Thực Nghiệm Chuyển Đổi TFLite & Phân Tích Kích Thước

### 3.1. Quá trình chuyển đổi và Mã tái lập
- Đã thiết lập script chuyển đổi có thể chạy lại độc lập: `ai/conversion/convert_to_tflite.py` (SHA256: `9ddb67db42442f78fdca895483a59b5fdd187de9edaa50e27588c93dcb1c7018`).
- Mô hình xuất ra: `ai/conversion/fusion_model.tflite`
  - Dung lượng: **110,029,372 bytes (~104.93 MB)**.
  - Checksum SHA256: `86e8f75c01a9e6c2c7943336454006c7040f0a08781c603ced595a93aba0067e`.
- **Thông số flatbuffer của `fusion_model.tflite`**:
  - Input 0: `serving_default_vit_features_input:0` (`[1, 768]`, `float32`)
  - Input 1: `serving_default_image_input:0` (`[1, 512, 512, 3]`, `float32`)
  - Output 0: `StatefulPartitionedCall_1:0` (`[1, 3]`, `float32`)

### 3.2. Phân tích nguyên nhân giảm dung lượng (Từ 274.2 MB xuống 104.93 MB)
*Làm rõ nguyên nhân kỹ thuật, không quy đồng hoàn toàn cho việc loại đồ thị huấn luyện:*
1. **Loại bỏ trạng thái Optimizer của AdamW (Nguyên nhân lớn nhất: chiếm ~168.18 MB)**:
   - Khi kiểm tra cấu trúc nhị phân của `fusion/best.weights.h5` và `fusion/model.keras`, tệp chứa nhóm dữ liệu `optimizer/vars` với 138 biến trạng thái động lượng (momentum $m_t$ và vận tốc $v_t$ của thuật toán AdamW).
   - Tổng dung lượng của riêng nhóm `optimizer/vars` là **176,345,132 bytes (~168.18 MB)** (chiếm hơn 61% tổng kích thước tệp Keras). TFLite chỉ phục vụ suy luận nên loại bỏ hoàn toàn các biến optimizer này.
2. **Kích thước trọng số mạng thực tế (Model Weights: ~105.26 MB)**:
   - Toàn bộ trọng số của các tầng mạng (`layers/*`) trong Keras chiếm đúng **110,371,344 bytes (~105.26 MB)** (tương ứng 27,592,836 tham số float32).
   - Tệp `fusion_model.tflite` sau chuyển đổi có kích thước **104.93 MB** (110,029,372 bytes), tương đương gần như hoàn hảo với kích thước trọng số mạng thô ban đầu, cộng với phần overhead cấu trúc flatbuffer của TFLite.
3. **Loại bỏ siêu dữ liệu Keras**: Các tệp JSON định nghĩa cấu trúc đồ thị Keras (`config.json`), metadata huấn luyện và thuộc tính serialization được lược bỏ.

---

## 4. Kết Quả Đối Chiếu Parity Thực Nghiệm Trên Ảnh Nguồn Thật

### 4.1. Dữ liệu đối chứng và xác thực mã băm SHA256
- **Nguồn ảnh**: Tệp ảnh CT thật được xác định tại thư mục dữ liệu `../IQ_OTHNCCD/Benign/Bengin case (114).jpg` (tương đương đường dẫn `Benign/Bengin case (114).jpg` trong nghiên cứu).
- **Kiểm tra mã băm SHA256**:
  - SHA256 tính toán từ tệp: `925e9ab76b0a7ee5ff91f202de4afe25a5bfa3007cfac7fc292f098542ae4a69`.
  - SHA256 ghi nhận trong `split_manifest.json` (tệp metadata nghiên cứu từ gói Primary): `925e9ab76b0a7ee5ff91f202de4afe25a5bfa3007cfac7fc292f098542ae4a69`.
  - **Kết luận**: Khớp tuyệt đối 100% giữa ảnh thực tế và metadata tập test của đồ án.
- **Phân định với bằng chứng cũ `offline_parity.json`**:
  - `offline_parity.json` là chỉ số có sẵn từ Colab CPU (`5.0291419e-08`).
  - Dưới đây là các kết quả đo đạc thực nghiệm **MỚI** được chạy trực tiếp trên môi trường máy tính cục bộ.

### 4.2. Kết quả đối chiếu Keras vs TFLite (Fusion Branch)
- **Script thực hiện**: [ai/conversion/evaluate_parity.py](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/evaluate_parity.py).
- **Tệp báo cáo**: [ai/conversion/parity_evaluation.json](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/parity_evaluation.json).
- **Đầu vào**: Ảnh thật `Bengin case (114).jpg` + vector CLS (768 chiều) sinh ra từ ViT PyTorch cho chính ảnh này. Tiền xử lý `rgb-nearest-source-resize-v1`.
- **Kết quả so sánh 3 lớp (`['Benign', 'Malignant', 'Normal']`)**:
  - Keras gốc: `[0.97284973, 0.00018841, 0.02696186]` -> Nhãn: **Benign**
  - TFLite đã chuyển đổi: `[0.97284973, 0.00018841, 0.02696182]` -> Nhãn: **Benign**
  - Sai số tuyệt đối từng lớp: `[0.0, 5.3842086e-10, 3.9115548e-08]`
  - **Sai số lớn nhất (Max Absolute Error)**: `3.91155481e-08`
  - **Độ trùng khớp nhãn**: **Khớp hoàn toàn (True)**.

### 4.3. Kết quả đối chiếu ViT PyTorch vs ViT ONNX Runtime (ViT Branch)
- **Script thực hiện**: [ai/conversion/evaluate_vit_onnx_parity.py](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/evaluate_vit_onnx_parity.py).
- **Tệp báo cáo**: [ai/conversion/vit_parity_evaluation.json](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/vit_parity_evaluation.json).
- **Đầu vào**: Tensor ảnh `[1, 3, 224, 224]` chuẩn hóa theo cấu hình ViT gốc.
- **Kết quả so sánh vector CLS (768 chiều)**:
  - Vector CLS PyTorch (5 phần tử đầu): `[-0.08057447, 0.14308186, -0.08138369, 0.18068577, 0.12781984]`
  - Vector CLS ONNX (5 phần tử đầu): `[-0.08057445, 0.14308275, -0.08138393, 0.18068613, 0.12782039]`
  - Sai số tuyệt đối trung bình (Mean Abs Error): `3.86745029e-07`
  - **Sai số tuyệt đối lớn nhất (Max Abs Error)**: `1.75833702e-06`
  - **Độ tương đồng Cosine (Cosine Similarity)**: `1.0000000000` (Gần như trùng khớp tuyệt đối).

### 4.4. Kết quả nối thử End-to-End Pipeline trên máy tính (Ảnh đơn đối chứng)
- **Script thực hiện**: [ai/conversion/evaluate_e2e_pipeline.py](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/evaluate_e2e_pipeline.py).
- **Tệp báo cáo**: [ai/conversion/e2e_pipeline_evaluation.json](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/e2e_pipeline_evaluation.json).
- **Kiến trúc so sánh**:
  - *Pipeline Gốc*: Ảnh -> ViT PyTorch -> CLS Token -> Fusion Keras -> 3 Class Probabilities.
  - *Pipeline Di động/Chuyển đổi*: Ảnh -> ViT ONNX (ONNX Runtime) -> CLS Token -> Fusion TFLite (LiteRT) -> 3 Class Probabilities.
- **Kết quả đối chiếu End-to-End**:
  - Pipeline Gốc: `[0.97284973, 0.00018841, 0.02696186]` -> Nhãn: **Benign**
  - Pipeline Chuyển đổi: `[0.97284931, 0.00018841, 0.02696226]` -> Nhãn: **Benign**
  - Sai số tuyệt đối các lớp: `[4.1723251e-07, 2.0663720e-09, 4.0046871e-07]`
  - **Sai số xác suất lớp lớn nhất**: `4.17232513e-07`
  - **Nhãn dự đoán**: **Trùng khớp 100% (Benign)**.

### 4.5. Kết quả kiểm chứng mở rộng trên 30 ảnh tập test theo `split_manifest`
- **Script thực hiện**: [ai/conversion/evaluate_batch_30.py](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/evaluate_batch_30.py).
- **Bằng chứng xuất ra**:
  - Báo cáo JSON chi tiết: [ai/conversion/batch30_parity_evaluation.json](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/batch30_parity_evaluation.json).
  - Bảng tổng hợp CSV: [ai/conversion/batch30_parity_evaluation.csv](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/batch30_parity_evaluation.csv).
- **Quy tắc chọn mẫu**:
  - Tập test gồm 159 ảnh (`split_manifest.json`): 16 Benign, 82 Malignant, 61 Normal.
  - Chọn ngẫu nhiên có cố định seed (`seed = 42`): lấy đúng **10 ảnh Benign, 10 ảnh Malignant, 10 ảnh Normal**.
  - Kiểm tra đảm bảo không trùng SHA256 và giữ nguyên vẹn 100% kiến trúc FP32, trọng số mạng và tiền xử lý chuẩn `rgb-nearest-source-resize-v1`.
- **Tổng hợp kết quả đo đạc Parity (30/30 ảnh)**:
  - **Số trường hợp khác nhãn**: **0 / 30 trường hợp** (Độ khớp nhãn đạt **100.00%**).
  - **Sai số xác suất lớp lớn nhất (Max Absolute Error)**: **`8.34465027e-07`** (ghi nhận tại ảnh Normal `Normal case (254).jpg`).
  - **Sai số xác suất lớp trung bình (Mean Absolute Error)**: **`2.06830961e-08`**.
  - **Sai số vector CLS (768 chiều) lớn nhất**: **`3.29315662e-06`**.
  - **Sai số vector CLS trung bình**: **`4.27375200e-07`**.
- **Đo lường thời gian thực thi (Thông số cấu hình đo đạc thực tế)**:
  - **Cấu hình phần cứng thử nghiệm**:
    - CPU: Intel(R) Core(TM) Ultra 5 225H (14 Cores / 14 Logical Processors).
    - RAM: 32 GB (Khả dụng ~30.92 GB).
    - Hệ điều hành: Windows 11 (build 26100), Python 3.14.2.
  - **Cấu hình Runtime, Luồng & Execution Provider / Delegate**:
    - *Pipeline Gốc*: PyTorch 2.14.1+cpu (14 luồng tính toán `num_threads = 14`, 14 interop threads) + TensorFlow/Keras 2.22.0-rc0 (intra/inter-op threads mặc định theo CPU).
    - *Pipeline Chuyển đổi*: ONNX Runtime 1.31.0 (`providers = ['CPUExecutionProvider']`, GraphOptimizationLevel = `ORT_ENABLE_ALL`) + TensorFlow Lite (Delegate: **XNNPACK** cho CPU).
  - **Warm-up**: Không thực hiện warm-up trước vòng lặp đo đạc; chạy tuần tự từ ảnh 1 đến 30 (cold run theo đúng thứ tự mảng).
  - **Phạm vi tính thời gian (Scope of Measurement)**:
    - *Thời gian nạp mô hình (Cold Load Time)*: Đo bằng `time.perf_counter()` riêng biệt trước khi nạp ảnh đầu tiên (chỉ tính thời gian nạp trọng số và khởi tạo session/interpreter, không tính thời gian đọc ảnh).
      - Pipeline Gốc: **`2.3263 giây`**.
      - Pipeline Chuyển đổi: **`0.8989 giây`**.
    - *Thời gian suy luận mỗi ảnh (Inference Latency)*: Đo độc lập trên từng ảnh bằng `time.perf_counter()`, chỉ bao gồm thời gian chạy hàm suy luận của 2 nhánh mô hình (trích xuất CLS vector + tính toán fusion probabilities), **không bao gồm thời gian đọc tệp từ ổ đĩa và tiền xử lý ảnh PIL**.
      - Pipeline Gốc: Trung bình **`155.52 giây/ảnh`** (155,515.5 ms, dải từ 133.76s đến 212.16s).
      - Pipeline Chuyển đổi: Trung bình **`1.17 giây/ảnh`** (1,170.9 ms, dải từ 851.8 ms đến 2,113.7 ms).
  - **Số đo sơ bộ trong cấu hình thử nghiệm hiện tại**:
    - Đây là **số đo sơ bộ thu được trong cấu hình thử nghiệm hiện tại** trên máy tính phục vụ kiểm chứng tính tương đương đầu ra (Parity).
    - Sự chênh lệch thời gian giữa hai pipeline phản ánh cấu hình runtime thực tế lúc đo (Keras/PyTorch eager inference trên CPU đa luồng so với ONNX Runtime và TFLite XNNPACK delegate trên cùng CPU). Số liệu này dùng để tái lập và đối chiếu kỹ thuật, không dùng để kết luận hiệu năng cố định giữa các framework.
- **Ranh giới và nguyên tắc kỹ thuật bắt buộc**:
  - Toàn bộ các phép đo trên là **kiểm chứng chuyển đổi và đối chiếu FP32 trên máy tính cá nhân**, **CHƯA CHẠY TRÊN REDMI 13** và **CHƯA CÓ GRAD-CAM NGOẠI TUYẾN**.
  - Không thực hiện lượng tử hóa (Quantization INT8/FP16) hay thay đổi kiến trúc trong bước này.

---

## 5. Đánh Giá Bản Chất Kỹ Thuật Của Grad-CAM Trên TFLite

> [!IMPORTANT]
> **ĐÍNH CHÍNH VÀ LÀM RÕ NGUYÊN TẮC GRAD-CAM**:
> Tuyệt đối không gọi CAM dựa trên trọng số tầng Dense là "tương đương Grad-CAM" khi chưa chứng minh được sự phù hợp toán học với kiến trúc **Adaptive AACNN-ViT**.

1. **Bản chất toán học của Grad-CAM trong nghiên cứu**:
   - Grad-CAM yêu cầu tính đạo hàm riêng $\frac{\partial y^c}{\partial A^k}$ từ điểm số phân lớp $y^c$ quay ngược về feature map $A^k$ của tầng `conv5_block3_out` trong điều kiện vector CLT của ViT được cố định.
   - Do có sự xuất hiện của khối **Cross-Attention (`MultiHeadAttention`)** và **Cổng hòa trộn động (`AdaptiveGate`)**, mối quan hệ giữa feature map CNN và điểm số đầu ra là **phi tuyến tính phức tạp**, không thể biểu diễn đơn giản bằng phép nhân trọng số tầng Dense cuối cùng như kiến trúc CNN thuần túy (Global Average Pooling + Dense của bài báo CAM gốc).
2. **Xuất thêm activation không tự giải quyết được phần gradient**:
   - Việc chuyển đổi mô hình TFLite sang dạng Multi-Output (trả về cả xác suất và feature map tensor $16 \times 16 \times 2048$) chỉ mới cung cấp $A^k$ (Activation Map).
   - TFLite là forward-only, **không tính được gradient $\frac{\partial y^c}{\partial A^k}$**. Nếu không có gradient, bản đồ nhiệt sinh ra sẽ thiếu trọng số tầm quan trọng của từng kênh đặc trưng, làm mất tính chính xác của thuật toán giải thích y khoa.

---

## 6. Đính Chính Bảng So Sánh Runtime Di Động & Kết Quả Thử Nghiệm ViT Thực Tế

*Phân định rõ giữa nhận định tài liệu và kết quả thực nghiệm đã kiểm chứng trên máy:*

| Runtime | Khả năng nạp nhánh Fusion (Đã thử nghiệm thực tế) | Khả năng nạp nhánh ViT (Đã thử nghiệm thực tế) | Hỗ trợ tính toán Grad-CAM ngoại tuyến | Trạng thái tích hợp React Native |
| :--- | :--- | :--- | :--- | :--- |
| **TensorFlow Lite (TFLite)** | **ĐÃ XÁC THỰC**: Chuyển đổi thành công sang `fusion_model.tflite` (104.93 MB), nạp và chạy suy luận flatbuffer thành công. | *Chưa thử nghiệm trực tiếp sang TFLite*: Cần chuyển đổi ViT PyTorch sang TFLite, có rủi ro không tương thích toán tử Attention. | **BỊ CHẶN**: Runtime forward-only không tính được gradient đạo hàm ngược. | Có thư viện cộng đồng (`react-native-fast-tflite`). |
| **ONNX Runtime Mobile** | *Nhận định tài liệu*: Cho phép xuất đồ thị Keras và PyTorch sang `.onnx`. Chưa thử nghiệm nhánh Fusion. | **ĐÃ XÁC THỰC**: Xuất thành công `vit_cls.onnx` (1.08 MB graph + 327.29 MB data) từ `model.safetensors` bằng PyTorch + ONNX opset 18. Graph pass 100% `onnx.checker`. | *Lưu ý kỹ thuật*: Trích xuất tensor trung gian thuận tiện hơn TFLite, nhưng **vẫn không tự động tính gradient ngược nếu runtime tắt autograd**. | Có thư viện chính thức `onnxruntime-react-native` từ Microsoft. |
| **ExecuTorch** | *Nhận định tài liệu*: Khó khăn vì phải viết lại nhánh ResNet Keras sang PyTorch. Chưa thử nghiệm. | *Nhận định tài liệu*: Tối ưu cho PyTorch. Chưa thử nghiệm. | *Nhận định tài liệu*: Chưa có bằng chứng chạy được Grad-CAM ngoại tuyến trên thiết bị di động. | Đang ở giai đoạn thử nghiệm sớm (early stage). |

### 6.1. Chi tiết thực nghiệm chuyển đổi nhánh Vision Transformer (ViT)
- **Kiến trúc và Trọng số**: Giữ nguyên vẹn 100% kiến trúc `google/vit-base-patch16-224-in21k` và trọng số FP32 gốc từ gói Primary (`vit/model.safetensors`, 329.57 MB). Chưa thực hiện bất kỳ hình thức lượng tử hóa (quantization) hay thay đổi cấu trúc nào.
- **Script chuyển đổi có thể tái lập**: [ai/conversion/convert_vit_to_onnx.py](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/ai/conversion/convert_vit_to_onnx.py).
- **Môi trường chuyển đổi**: Python 3.14.2 / PyTorch 2.14.1+cpu / Transformers 5.20.2 / ONNX 1.23.2 / ONNXScript 0.7.2.
- **Artifact xuất ra**:
  - `ai/conversion/vit_cls.onnx`: Graph protobuf **1,135,005 bytes (~1.08 MB)**. SHA256: `b97950375ff74c296dbf26d538bac381e957114ec0d0e01b02d3d37dbe938f8e`.
  - `ai/conversion/vit_cls.onnx.data`: Trọng số ngoài (external data) **343,194,624 bytes (~327.29 MB)**. SHA256: `638cc20dfbd00150cee9e59075c2cf5308e6d3c69fd24dfb1f7151170c6c4320`.
- **Thông số kỹ thuật đồ thị ONNX**:
  - Đầu vào: `pixel_values` shape `[batch_size, 3, 224, 224]`, kiểu `float32`.
  - Đầu ra: `cls_token` shape `[batch_size, 768]`, kiểu `float32`.
  - Đã kiểm tra tính toàn vẹn: `onnx.checker.check_model()` vượt qua 100% không có lỗi cấu trúc đồ thị.

> **Đánh giá tổng hợp về Runtime**: Cả 2 nhánh mô hình đều đã có đường dẫn chuyển đổi khả thi (nhánh CNN/Fusion -> TFLite 104.9 MB; nhánh ViT -> ONNX 328.4 MB). Tuy nhiên, **vẫn chưa chốt runtime chính thức** vì còn cần đánh giá tính tương thích của runtime phối hợp trên điện thoại thật và giải pháp cho bài toán Grad-CAM ngoại tuyến.

---

## 7. Danh Mục Tệp Dự Kiến Đưa Vào Git Trong `ai/models/extracted/primary/` & `ai/conversion/`

Để tuân thủ nghiêm ngặt quy tắc quản lý mã nguồn (không đưa tệp nhị phân nặng >100MB vào Git và không stage toàn bộ thư mục giải nén ngoài ý muốn), danh mục tệp được phân loại rõ ràng:

### A. Các tệp dự kiến theo dõi trong Git (Mã nguồn, Metadata, Bằng chứng JSON/văn bản nhỏ):
- `ai/models/extracted/primary/custom_layers.py` (Mã định nghĩa 3 lớp Keras tùy biến)
- `ai/models/extracted/primary/predict.py` (Script chạy suy luận CPU độc lập)
- `ai/models/extracted/primary/config.json` (Cấu hình kích thước, nhãn lớp, seed)
- `ai/models/extracted/primary/bundle_manifest.json` (Danh mục checksum tệp gốc)
- `ai/models/extracted/primary/environment.json` (Thông số môi trường Colab)
- `ai/models/extracted/primary/pip-freeze.txt` (Danh sách thư viện chi tiết)
- `ai/models/extracted/primary/class_weights.json` (Trọng số phân lớp)
- `ai/models/extracted/primary/preflight.json` (Kết quả chạy thử preflight)
- `ai/models/extracted/primary/offline_parity.json` (Kết quả đối chiếu Colab vs CPU có sẵn)
- `ai/models/extracted/primary/offline_prediction.json` (Kết quả dự đoán mẫu có sẵn)
- `ai/models/extracted/primary/vit_processor.json` & `vit_source.json` (Cấu hình nạp ViT)
- `ai/models/extracted/primary/fusion/artifact_manifest.json` (Manifest nhánh Fusion)
- `ai/models/extracted/primary/fusion/gradcam_status.json` (Trạng thái Grad-CAM gốc)
- `ai/models/extracted/primary/fusion/gradcam_raw.npy` (Mảng CAM thô đối chứng 16x16, 1.1 KB)
- `ai/models/extracted/primary/fusion/history.json`, `training.json`, `summary.txt` (Số liệu huấn luyện)
- `ai/models/extracted/primary/fusion/test_metrics.json`, `validation_metrics.json` (Bằng chứng nghiên cứu)
- `ai/models/extracted/primary/fusion/test_predictions.csv`, `validation_predictions.csv` (Dữ liệu dự đoán)
- `ai/models/extracted/primary/vit/config.json`, `preprocessor_config.json` (Cấu hình ViT)
- `ai/conversion/convert_to_tflite.py` (Script chuyển đổi Fusion sang TFLite)
- `ai/conversion/convert_vit_to_onnx.py` (Script chuyển đổi ViT sang ONNX)
- `ai/conversion/evaluate_parity.py` (Script đối chiếu Parity Keras vs TFLite)
- `ai/conversion/evaluate_vit_onnx_parity.py` (Script đối chiếu Parity ViT PyTorch vs ONNX)
- `ai/conversion/evaluate_e2e_pipeline.py` (Script đối chiếu Parity toàn diện End-to-End Pipeline)
- `ai/conversion/evaluate_batch_30.py` (Script kiểm chứng đối chiếu mở rộng 30 ảnh tập test)
- `ai/conversion/parity_evaluation.json` (Bằng chứng đối chiếu Keras vs TFLite)
- `ai/conversion/vit_parity_evaluation.json` (Bằng chứng đối chiếu ViT PyTorch vs ONNX)
- `ai/conversion/e2e_pipeline_evaluation.json` (Bằng chứng đối chiếu toàn diện End-to-End ảnh đơn)
- `ai/conversion/batch30_parity_evaluation.json` (Bằng chứng JSON đối chiếu mở rộng 30 ảnh)
- `ai/conversion/batch30_parity_evaluation.csv` (Bảng CSV chi tiết đối chiếu mở rộng 30 ảnh)

### B. Các tệp nhị phân lớn BẮT BUỘC LOẠI BỎ (Đã chặn trong `.gitignore`):
- `ai/models/extracted/primary/fusion/model.keras` (~274.2 MB)
- `ai/models/extracted/primary/fusion/best.weights.h5` (~274.0 MB)
- `ai/models/extracted/primary/vit/model.safetensors` (~329.6 MB)
- `ai/conversion/fusion_model.tflite` (~104.9 MB)
- `ai/conversion/vit_cls.onnx` & `vit_cls.onnx.data` (~328.4 MB)


