# Minh Chứng Thực Nghiệm Mốc MOB-02 (On-Device AI FP32)

Thư mục này lưu trữ ảnh chụp màn hình, trích xuất UI hierarchy và dữ liệu kiểm thử thực tế phục vụ nghiệm thu mốc MOB-02.

## 1. Nguồn gốc & Bản quyền dữ liệu kiểm thử

- **Ảnh CT Lành tính (`test_benign_384x384.jpg`, `benign_case_114.jpg`)**:
  - Nguồn gốc: Trích xuất từ bộ dữ liệu công khai phục vụ nghiên cứu học thuật của đề tài (IQ-OTH/NCCD Lung Cancer Dataset / The Cancer Imaging Archive - TCIA).
  - Bản quyền: Sử dụng cho mục đích nghiên cứu phi thương mại, giáo dục và làm đồ án tốt nghiệp.
  - Bảo mật dữ liệu: Toàn bộ thông tin định danh bệnh nhân (PII/PHI) trong metadata DICOM đã được ẩn danh hóa (de-identified) hoàn toàn trước khi chuyển sang định dạng JPEG.
- **Ảnh CT Ác tính (`test_malignant_600x450.jpg`, `malignant_case_1.jpg`)**:
  - Tương tự, trích xuất từ tập kiểm thử công khai đã ẩn danh hóa.
- **Tệp lỗi (`corrupted_image.jpg`, 51 bytes)**:
  - Tệp giả lập do nhóm nghiên cứu tạo ra (chuỗi byte hỏng) nhằm kiểm thử cơ chế bắt lỗi giải mã ảnh y tế `ERR_DECODE` (MSG-10).

## 2. Phân loại cấu trúc minh chứng

1. `user_picker/`:
   - Chứa ảnh chụp màn hình kiểm thử trực tiếp trình chọn ảnh hệ thống Android PhotoPicker (`ACTION_GET_CONTENT` / URI `content://`) ở lần chạy Run 2:
     - `run2_content_uri_malignant_600x450_dialog.png` & `_screen.png`: Suy luận ảnh ác tính kích thước $600 \times 450$.
     - `run2_content_uri_benign_384x384_dialog.png` & `_screen.png`: Suy luận ảnh lành tính kích thước $384 \times 384$.
     - `run2_picker_cancelled.png`: Thao tác hủy chọn ảnh an toàn.
     - `run2_corrupted_image_dialog.png` & `_dismissed.png`: Bắt lỗi tệp hỏng MSG-10 và xóa trạng thái cũ.
2. Các tệp ảnh chụp quy trình kiểm thử ngoại tuyến (offline, tắt mạng, tắt Metro bundler) và trích xuất bố cục XML máy ảo Android Emulator API 34.

## 3. Quy định lưu trữ

- Không lưu trữ tệp mô hình nhị phân nặng (`.tflite`, `.onnx`, `.data` >100MB).
- Không lưu trữ file cài đặt nhị phân APK (`.apk` >500MB).
- Không lưu trữ bất kỳ dữ liệu bệnh án nhạy cảm nào chưa được cấp phép.
