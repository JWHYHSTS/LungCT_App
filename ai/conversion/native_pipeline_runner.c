#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "tflite/c/c_api.h"
#include "onnxruntime_c_api.h"

// Helper to get time in milliseconds
static double get_time_ms() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000.0 + ts.tv_nsec / 1000000.0;
}

int main(int argc, char** argv) {
    printf("=== NATIVE ON-DEVICE PIPELINE RUNNER (x86_64 FP32) ===\n");

    const char* base_dir = "/data/local/tmp/native_test";
    char tflite_path[512], onnx_path[512], cnn_bin[512], vit_bin[512], cls_bin[512];
    snprintf(tflite_path, sizeof(tflite_path), "%s/fusion_model.tflite", base_dir);
    snprintf(onnx_path, sizeof(onnx_path), "%s/vit_cls.onnx", base_dir);
    snprintf(cnn_bin, sizeof(cnn_bin), "%s/cnn_input_512x512.bin", base_dir);
    snprintf(vit_bin, sizeof(vit_bin), "%s/vit_input_224x224.bin", base_dir);
    snprintf(cls_bin, sizeof(cls_bin), "%s/cls_ref_768.bin", base_dir);

    // 1. Load test tensors
    float* cnn_data = (float*)malloc(1 * 512 * 512 * 3 * sizeof(float));
    float* vit_data = (float*)malloc(1 * 3 * 224 * 224 * sizeof(float));
    float* cls_ref_data = (float*)malloc(1 * 768 * sizeof(float));

    FILE* f_cnn = fopen(cnn_bin, "rb");
    if (!f_cnn) { printf("Error opening cnn bin\n"); return 1; }
    fread(cnn_data, sizeof(float), 1 * 512 * 512 * 3, f_cnn);
    fclose(f_cnn);

    FILE* f_vit = fopen(vit_bin, "rb");
    if (!f_vit) { printf("Error opening vit bin\n"); return 1; }
    fread(vit_data, sizeof(float), 1 * 3 * 224 * 224, f_vit);
    fclose(f_vit);

    FILE* f_cls = fopen(cls_bin, "rb");
    if (!f_cls) { printf("Error opening cls bin\n"); return 1; }
    fread(cls_ref_data, sizeof(float), 1 * 768, f_cls);
    fclose(f_cls);

    printf("[1/4] Loaded test tensors from disk successfully.\n");

    // ----------------------------------------------------
    // BRANCH 1: FUSION TFLITE STANDALONE (WITH REFERENCE CLS)
    // ----------------------------------------------------
    printf("\n--- RUNNING BRANCH 1: FUSION TFLITE (STANDALONE) ---\n");
    double t0 = get_time_ms();
    TfLiteModel* model = TfLiteModelCreateFromFile(tflite_path);
    if (!model) { printf("Failed to load TFLite model\n"); return 1; }
    TfLiteInterpreterOptions* options = TfLiteInterpreterOptionsCreate();
    TfLiteInterpreterOptionsSetNumThreads(options, 4);
    TfLiteInterpreter* interpreter = TfLiteInterpreterCreate(model, options);
    TfLiteInterpreterAllocateTensors(interpreter);
    double t_tflite_load = get_time_ms() - t0;
    printf("TFLite load time: %.2f ms\n", t_tflite_load);

    // Input 0: serving_default_vit_features_input:0 [1, 768]
    TfLiteTensor* input_cls = TfLiteInterpreterGetInputTensor(interpreter, 0);
    TfLiteTensorCopyFromBuffer(input_cls, cls_ref_data, 768 * sizeof(float));

    // Input 1: serving_default_image_input:0 [1, 512, 512, 3]
    TfLiteTensor* input_cnn = TfLiteInterpreterGetInputTensor(interpreter, 1);
    TfLiteTensorCopyFromBuffer(input_cnn, cnn_data, 512 * 512 * 3 * sizeof(float));

    double t_fusion_start = get_time_ms();
    TfLiteInterpreterInvoke(interpreter);
    double t_fusion_dur = get_time_ms() - t_fusion_start;

    const TfLiteTensor* output_tensor = TfLiteInterpreterGetOutputTensor(interpreter, 0);
    float fusion_scores[3];
    TfLiteTensorCopyToBuffer(output_tensor, fusion_scores, 3 * sizeof(float));

    printf("Branch 1 Fusion Latency: %.2f ms\n", t_fusion_dur);
    printf("Branch 1 Scores: Benign=%.8f, Malignant=%.8f, Normal=%.8f\n",
           fusion_scores[0], fusion_scores[1], fusion_scores[2]);

    // ----------------------------------------------------
    // BRANCH 2: VIT ONNX STANDALONE
    // ----------------------------------------------------
    printf("\n--- RUNNING BRANCH 2: VIT ONNX (STANDALONE) ---\n");
    const OrtApi* g_ort = OrtGetApiBase()->GetApi(ORT_API_VERSION);
    OrtEnv* env;
    g_ort->CreateEnv(ORT_LOGGING_LEVEL_WARNING, "VitRunner", &env);

    OrtSessionOptions* session_options;
    g_ort->CreateSessionOptions(&session_options);
    g_ort->SetIntraOpNumThreads(session_options, 4);

    double t_ort_load_start = get_time_ms();
    OrtSession* session;
    OrtStatus* status = g_ort->CreateSession(env, onnx_path, session_options, &session);
    double t_ort_load = get_time_ms() - t_ort_load_start;
    if (status != NULL) {
        const char* msg = g_ort->GetErrorMessage(status);
        printf("ORT CreateSession Error: %s\n", msg);
        g_ort->ReleaseStatus(status);
        return 1;
    }
    printf("ViT ONNX load time: %.2f ms\n", t_ort_load);

    OrtMemoryInfo* memory_info;
    g_ort->CreateCpuMemoryInfo(OrtArenaAllocator, OrtMemTypeDefault, &memory_info);

    int64_t input_shape[4] = {1, 3, 224, 224};
    OrtValue* input_tensor = NULL;
    g_ort->CreateTensorWithDataAsOrtValue(memory_info, vit_data, 1 * 3 * 224 * 224 * sizeof(float),
                                         input_shape, 4, ONNX_TENSOR_ELEMENT_DATA_TYPE_FLOAT,
                                         &input_tensor);

    const char* input_names[] = {"pixel_values"};
    const char* output_names[] = {"cls_token"};
    OrtValue* output_tensor_ort = NULL;

    double t_vit_start = get_time_ms();
    status = g_ort->Run(session, NULL, input_names, (const OrtValue* const*)&input_tensor, 1,
                        output_names, 1, &output_tensor_ort);
    double t_vit_dur = get_time_ms() - t_vit_start;

    if (status != NULL) {
        printf("ORT Run Error: %s\n", g_ort->GetErrorMessage(status));
        g_ort->ReleaseStatus(status);
        return 1;
    }
    printf("Branch 2 ViT Latency: %.2f ms\n", t_vit_dur);

    float* vit_out_data;
    g_ort->GetTensorMutableData(output_tensor_ort, (void**)&vit_out_data);
    printf("Branch 2 ViT CLS Head (5 values): %.8f, %.8f, %.8f, %.8f, %.8f\n",
           vit_out_data[0], vit_out_data[1], vit_out_data[2], vit_out_data[3], vit_out_data[4]);

    // Compare with reference CLS head
    double max_cls_diff = 0.0;
    for (int i = 0; i < 768; i++) {
        double diff = abs(vit_out_data[i] - cls_ref_data[i]);
        if (diff > max_cls_diff) max_cls_diff = diff;
    }
    printf("Max absolute error vs MOB-01 CLS: %.8e\n", max_cls_diff);

    // ----------------------------------------------------
    // STEP 4: END-TO-END PIPELINE (VIT ONNX -> CLS -> FUSION TFLITE)
    // ----------------------------------------------------
    printf("\n--- RUNNING FULL END-TO-END PIPELINE ON-DEVICE ---\n");
    // Connect ViT output directly into Fusion TFLite input 0
    TfLiteTensorCopyFromBuffer(input_cls, vit_out_data, 768 * sizeof(float));
    TfLiteTensorCopyFromBuffer(input_cnn, cnn_data, 512 * 512 * 3 * sizeof(float));

    double t_e2e_fusion_start = get_time_ms();
    TfLiteInterpreterInvoke(interpreter);
    double t_e2e_fusion_dur = get_time_ms() - t_e2e_fusion_start;

    float e2e_scores[3];
    TfLiteTensorCopyToBuffer(output_tensor, e2e_scores, 3 * sizeof(float));

    printf("Full Pipeline Inference Latency: ViT=%.2f ms + Fusion=%.2f ms = Total=%.2f ms\n",
           t_vit_dur, t_e2e_fusion_dur, t_vit_dur + t_e2e_fusion_dur);
    printf("Final E2E Scores: Benign=%.8f, Malignant=%.8f, Normal=%.8f\n",
           e2e_scores[0], e2e_scores[1], e2e_scores[2]);

    const char* pred_label = "Benign";
    if (e2e_scores[1] > e2e_scores[0] && e2e_scores[1] > e2e_scores[2]) pred_label = "Malignant";
    else if (e2e_scores[2] > e2e_scores[0] && e2e_scores[2] > e2e_scores[1]) pred_label = "Normal";

    printf("Predicted Label: %s\n", pred_label);

    // Clean up
    g_ort->ReleaseValue(output_tensor_ort);
    g_ort->ReleaseValue(input_tensor);
    g_ort->ReleaseMemoryInfo(memory_info);
    g_ort->ReleaseSession(session);
    g_ort->ReleaseSessionOptions(session_options);
    g_ort->ReleaseEnv(env);

    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);

    free(cnn_data);
    free(vit_data);
    free(cls_ref_data);

    printf("\n=== ON-DEVICE NATIVE PIPELINE FINISHED SUCCESSFULLY ===\n");
    return 0;
}
