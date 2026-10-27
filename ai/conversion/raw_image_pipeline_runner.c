#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <fcntl.h>
#include <unistd.h>
#include <math.h>

#include <android/imagedecoder.h>
#include <android/bitmap.h>

#include "tflite/c/c_api.h"
#include "onnxruntime_c_api.h"

static double get_time_ms() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000.0 + ts.tv_nsec / 1000000.0;
}

// Nearest-neighbor resizing and normalization
static void preprocess_nearest(const uint8_t* src_rgba, int src_w, int src_h,
                               int dst_w, int dst_h,
                               float* out_tensor, int is_chw,
                               float mean_val, float std_val, float scale) {
    for (int y = 0; y < dst_h; y++) {
        int src_y = (int)((y * (int64_t)src_h) / dst_h);
        if (src_y >= src_h) src_y = src_h - 1;
        for (int x = 0; x < dst_w; x++) {
            int src_x = (int)((x * (int64_t)src_w) / dst_w);
            if (src_x >= src_w) src_x = src_w - 1;

            int src_idx = (src_y * src_w + src_x) * 4;
            float r = src_rgba[src_idx + 0] * scale;
            float g = src_rgba[src_idx + 1] * scale;
            float b = src_rgba[src_idx + 2] * scale;

            r = (r - mean_val) / std_val;
            g = (g - mean_val) / std_val;
            b = (b - mean_val) / std_val;

            if (is_chw) {
                // CHW format: [3, dst_h, dst_w]
                int plane = dst_h * dst_w;
                int pos = y * dst_w + x;
                out_tensor[0 * plane + pos] = r;
                out_tensor[1 * plane + pos] = g;
                out_tensor[2 * plane + pos] = b;
            } else {
                // HWC format: [dst_h, dst_w, 3]
                int pos = (y * dst_w + x) * 3;
                out_tensor[pos + 0] = r;
                out_tensor[pos + 1] = g;
                out_tensor[pos + 2] = b;
            }
        }
    }
}

int main(int argc, char** argv) {
    printf("=== ON-DEVICE END-TO-END PIPELINE: FROM RAW CT IMAGE FILE ===\n");
    const char* image_path = "/data/local/tmp/native_test/bengin_case_114.jpg";
    const char* tflite_path = "/data/local/tmp/native_test/fusion_model.tflite";
    const char* onnx_path = "/data/local/tmp/native_test/vit_cls.onnx";

    if (argc > 1) image_path = argv[1];
    if (argc > 2) tflite_path = argv[2];
    if (argc > 3) onnx_path = argv[3];


    printf("[Step 1] Decoding image via Android NDK AImageDecoder: %s\n", image_path);
    int fd = open(image_path, O_RDONLY);
    if (fd < 0) {
        printf("Error: Cannot open image file %s\n", image_path);
        return 1;
    }

    AImageDecoder* decoder = NULL;
    int res = AImageDecoder_createFromFd(fd, &decoder);
    if (res != ANDROID_IMAGE_DECODER_SUCCESS || !decoder) {
        printf("Error: AImageDecoder_createFromFd failed with code %d\n", res);
        close(fd);
        return 1;
    }

    const AImageDecoderHeaderInfo* header = AImageDecoder_getHeaderInfo(decoder);
    int orig_w = AImageDecoderHeaderInfo_getWidth(header);
    int orig_h = AImageDecoderHeaderInfo_getHeight(header);
    printf("Original CT Image dimensions: %d x %d\n", orig_w, orig_h);

    AImageDecoder_setAndroidBitmapFormat(decoder, ANDROID_BITMAP_FORMAT_RGBA_8888);
    AImageDecoder_setUnpremultipliedRequired(decoder, true);

    size_t stride = AImageDecoder_getMinimumStride(decoder);
    size_t decode_size = stride * orig_h;
    uint8_t* raw_rgba = (uint8_t*)malloc(decode_size);

    double t_dec_start = get_time_ms();
    res = AImageDecoder_decodeImage(decoder, raw_rgba, stride, decode_size);
    double t_dec_dur = get_time_ms() - t_dec_start;
    AImageDecoder_delete(decoder);
    close(fd);

    if (res != ANDROID_IMAGE_DECODER_SUCCESS) {
        printf("Error: AImageDecoder_decodeImage failed with code %d\n", res);
        free(raw_rgba);
        return 1;
    }
    printf("Decoded successfully in %.2f ms. First pixel RGBA: (%d, %d, %d, %d)\n",
           t_dec_dur, raw_rgba[0], raw_rgba[1], raw_rgba[2], raw_rgba[3]);

    // [Step 2] On-Device Preprocessing
    printf("\n[Step 2] On-Device Preprocessing matching bundle config 'rgb-nearest-source-resize-v1'\n");
    // CNN branch: (512, 512), range [0, 1], HWC
    float* cnn_input = (float*)malloc(1 * 512 * 512 * 3 * sizeof(float));
    double t_prep_cnn_start = get_time_ms();
    preprocess_nearest(raw_rgba, orig_w, orig_h, 512, 512, cnn_input, 0, 0.0f, 1.0f, 1.0f / 255.0f);
    double t_prep_cnn_dur = get_time_ms() - t_prep_cnn_start;
    printf("CNN Preprocessing: shape [1, 512, 512, 3], range [0, 1] in %.2f ms\n", t_prep_cnn_dur);

    // ViT branch: (224, 224), ImageNet mean/std (0.5, 0.5, 0.5), CHW
    float* vit_input = (float*)malloc(1 * 3 * 224 * 224 * sizeof(float));
    double t_prep_vit_start = get_time_ms();
    preprocess_nearest(raw_rgba, orig_w, orig_h, 224, 224, vit_input, 1, 0.5f, 0.5f, 1.0f / 255.0f);
    double t_prep_vit_dur = get_time_ms() - t_prep_vit_start;
    printf("ViT Preprocessing: shape [1, 3, 224, 224], normalized (x-0.5)/0.5 in %.2f ms\n", t_prep_vit_dur);

    // [Step 3] ViT ONNX Inference on Android
    printf("\n[Step 3] Running ViT ONNX Runtime (x86_64 FP32)...\n");
    const OrtApi* g_ort = OrtGetApiBase()->GetApi(ORT_API_VERSION);
    OrtEnv* env;
    g_ort->CreateEnv(ORT_LOGGING_LEVEL_WARNING, "VitRunnerApp", &env);
    OrtSessionOptions* session_options;
    g_ort->CreateSessionOptions(&session_options);
    g_ort->SetIntraOpNumThreads(session_options, 4);

    double t_vit_load_start = get_time_ms();
    OrtSession* session;
    OrtStatus* status = g_ort->CreateSession(env, onnx_path, session_options, &session);
    double t_vit_load = get_time_ms() - t_vit_load_start;
    if (status != NULL) {
        printf("Error CreateSession: %s\n", g_ort->GetErrorMessage(status));
        return 1;
    }
    printf("ViT Model loaded in %.2f ms\n", t_vit_load);

    OrtMemoryInfo* memory_info;
    g_ort->CreateCpuMemoryInfo(OrtArenaAllocator, OrtMemTypeDefault, &memory_info);
    int64_t input_shape[4] = {1, 3, 224, 224};
    OrtValue* vit_tensor = NULL;
    g_ort->CreateTensorWithDataAsOrtValue(memory_info, vit_input, 1 * 3 * 224 * 224 * sizeof(float),
                                         input_shape, 4, ONNX_TENSOR_ELEMENT_DATA_TYPE_FLOAT,
                                         &vit_tensor);

    const char* input_names[] = {"pixel_values"};
    const char* output_names[] = {"cls_token"};
    OrtValue* vit_out_tensor = NULL;

    double t_vit_inf_start = get_time_ms();
    status = g_ort->Run(session, NULL, input_names, (const OrtValue* const*)&vit_tensor, 1,
                        output_names, 1, &vit_out_tensor);
    double t_vit_inf_dur = get_time_ms() - t_vit_inf_start;
    if (status != NULL) {
        printf("Error Run ViT: %s\n", g_ort->GetErrorMessage(status));
        return 1;
    }
    printf("ViT Inference completed in %.2f ms\n", t_vit_inf_dur);

    float* vit_cls_vector;
    g_ort->GetTensorMutableData(vit_out_tensor, (void**)&vit_cls_vector);
    printf("ViT CLS Vector Head (first 5): [%.8f, %.8f, %.8f, %.8f, %.8f]\n",
           vit_cls_vector[0], vit_cls_vector[1], vit_cls_vector[2], vit_cls_vector[3], vit_cls_vector[4]);

    // [Step 4] Fusion TFLite Inference on Android
    printf("\n[Step 4] Running Fusion TFLite (XNNPACK CPU FP32)...\n");
    double t_tf_load_start = get_time_ms();
    TfLiteModel* model = TfLiteModelCreateFromFile(tflite_path);
    TfLiteInterpreterOptions* options = TfLiteInterpreterOptionsCreate();
    TfLiteInterpreterOptionsSetNumThreads(options, 4);
    TfLiteInterpreter* interpreter = TfLiteInterpreterCreate(model, options);
    TfLiteInterpreterAllocateTensors(interpreter);
    double t_tf_load = get_time_ms() - t_tf_load_start;
    printf("Fusion TFLite loaded in %.2f ms\n", t_tf_load);

    // Input 0: serving_default_vit_features_input:0 [1, 768]
    TfLiteTensor* in_cls = TfLiteInterpreterGetInputTensor(interpreter, 0);
    TfLiteTensorCopyFromBuffer(in_cls, vit_cls_vector, 768 * sizeof(float));

    // Input 1: serving_default_image_input:0 [1, 512, 512, 3]
    TfLiteTensor* in_cnn = TfLiteInterpreterGetInputTensor(interpreter, 1);
    TfLiteTensorCopyFromBuffer(in_cnn, cnn_input, 512 * 512 * 3 * sizeof(float));

    double t_fusion_start = get_time_ms();
    TfLiteInterpreterInvoke(interpreter);
    double t_fusion_dur = get_time_ms() - t_fusion_start;
    printf("Fusion Inference completed in %.2f ms\n", t_fusion_dur);

    const TfLiteTensor* out_scores_tensor = TfLiteInterpreterGetOutputTensor(interpreter, 0);
    float final_scores[3];
    TfLiteTensorCopyToBuffer(out_scores_tensor, final_scores, 3 * sizeof(float));

    printf("\n=== FINAL PIPELINE RESULTS FROM RAW IMAGE FILE ===\n");
    printf("Preprocessing Latency: Decode=%.2f ms, CNN Prep=%.2f ms, ViT Prep=%.2f ms\n",
           t_dec_dur, t_prep_cnn_dur, t_prep_vit_dur);
    printf("Inference Latency: ViT=%.2f ms, Fusion=%.2f ms, Total=%.2f ms\n",
           t_vit_inf_dur, t_fusion_dur, t_vit_inf_dur + t_fusion_dur);
    printf("3-Class Softmax Scores:\n");
    printf("  [0] Benign    : %.8f\n", final_scores[0]);
    printf("  [1] Malignant : %.8f\n", final_scores[1]);
    printf("  [2] Normal    : %.8f\n", final_scores[2]);

    const char* label = "Benign";
    if (final_scores[1] > final_scores[0] && final_scores[1] > final_scores[2]) label = "Malignant";
    else if (final_scores[2] > final_scores[0] && final_scores[2] > final_scores[1]) label = "Normal";
    printf("Predicted Diagnosis: %s\n", label);

    // Clean up
    free(raw_rgba);
    free(cnn_input);
    free(vit_input);

    g_ort->ReleaseValue(vit_out_tensor);
    g_ort->ReleaseValue(vit_tensor);
    g_ort->ReleaseMemoryInfo(memory_info);
    g_ort->ReleaseSession(session);
    g_ort->ReleaseSessionOptions(session_options);
    g_ort->ReleaseEnv(env);

    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);

    printf("\n=== RAW IMAGE PIPELINE RUNNER FINISHED SUCCESSFULLY ===\n");
    return 0;
}
