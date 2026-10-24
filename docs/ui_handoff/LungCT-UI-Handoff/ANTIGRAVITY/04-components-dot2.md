# UI-04 — Component đặc thù LungCT (đợt 2)

**Đầu vào.** `design/03-components.md`, `design/04-thong-diep-va-quy-tac.md`, `code/src/ui/theme/heatmap.ts`, layout-json của màn 15 (Chi tiết ca) và 16 (Kết quả ảnh AI).

**Làm:** `Toggle`, `Checkbox`, `Segmented`, `Slider` (0–100, bước 5), `Dialog` (default/destructive, scrim 50%), `BottomSheet`, `Snackbar`, `ProgressBar`, `Skeleton`, `CTImageView` (nền `IMAGE_CANVAS`, zoom/pan bằng `react-native-gesture-handler` + `react-native-reanimated`, lớp heatmap với độ phủ từ props), `HeatmapLegend`, `ImageTile` (6 trạng thái), `ScoreRow`, `ScoreCard` (3 dòng theo thứ tự cố định Benign, Malignant, Normal; lớp cao nhất nhấn mạnh; định dạng từ `ui-decisions.ts` → “0,712”).

**Ràng buộc bắt buộc.**
- Heatmap dùng `HEATMAP_STOPS`, mặc định `HEATMAP_DEFAULT_OPACITY` (0.4), không theo theme (BR-AI-05). Luôn có `HeatmapLegend` khi bật lớp.
- `ScoreCard` luôn kèm MSG-02; chữ “điểm”, không “xác suất”.
- `ImageTile` tách lỗi phân loại (FAIL) và thiếu Grad-CAM (PassNoCAM) (BR-AI-04).
- Ảnh CT trong Gallery là ảnh giả lập có nhãn “ẢNH GIẢ LẬP”, không dùng dữ liệu bệnh nhân thật.
- Destructive dialog: focus mặc định vào nút Hủy.

**Kiểm thử.** Test: `ScoreCard` luôn render đúng 3 dòng đúng thứ tự dù dữ liệu vào sai thứ tự; format 0.7123 → “0,712”; `ImageTile` mỗi trạng thái hiện đúng nhãn chữ.

**Minh chứng.** Gallery + ảnh so với `reference/screens-v2/png/16-ai-image-result.png`.

**Hoàn thành khi** đủ khung 6 bước trong `00-cach-dung.md`.
