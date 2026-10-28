# CHƯƠNG 1: TƯ DUY TYPESCRIPT VÀ REACT NATIVE DÀNH CHO NGƯỜI BIẾT C++
### Chuyển đổi tư duy lập trình từ C++ cơ bản sang môi trường Web & Di động hiện đại

> **Mục tiêu bài học**:
> - Hiểu rõ sự khác biệt giữa mô hình biên dịch tĩnh của C++ và mô hình thông dịch/JIT của TypeScript/JavaScript.
> - Làm quen với hệ thống kiểu tĩnh của TypeScript từ góc nhìn của lập trình viên C++ (không cần biết trước kiến thức web nâng cao).
> - Nắm bắt khái niệm bất đồng bộ (Asynchronous) qua ví dụ đời thường dễ hiểu: Thẻ rung gọi cà phê (Promise) và Đợi phục vụ (`async`/`await`).
> - Hiểu cách React Native xây dựng giao diện từ các hàm thành phần (Functional Components), Props và State.

---

## 💡 1. BẢNG SO SÁNH KHÁI NIỆM: C++ VS TYPESCRIPT / REACT NATIVE

| Khái niệm trong C++ cơ bản | Khái niệm tương đương trong TypeScript / React | Sự khác biệt cốt lõi người mới cần lưu ý |
| :--- | :--- | :--- |
| `int`, `float`, `double` | `number` | TypeScript gom tất cả số nguyên và số thực thành kiểu `number` (chuẩn 64-bit float). Không có kiểu `int` riêng biệt! |
| `std::string`, `char[]` | `string` | Chuỗi trong TypeScript là bất biến (immutable), được bọc trong nháy đơn `'...'` hoặc dấu huyền `` `...${bien}...` `` để ghép chuỗi. |
| `bool` | `boolean` | Giá trị chỉ có `true` hoặc `false`. Cần lưu ý các giá trị coi như sai (falsy): `0`, `""`, `null`, `undefined`, `NaN`. |
| Con trỏ `NULL` / `nullptr` | `null` và `undefined` | `null`: Bạn chủ động gán biến là rỗng; `undefined`: Biến vừa khai báo nhưng chưa được gán giá trị nào cả. |
| `struct SinhVien { ... }` | `interface Patient { ... }` | Dùng để định nghĩa khuôn mẫu dữ liệu lúc viết mã; khi dịch ra JavaScript để chạy trên app, `interface` sẽ tự động biến mất hoàn toàn. |
| Mảng tĩnh `int arr[10]` | Mảng co giãn `number[]` | Mảng trong TypeScript tự động tăng giảm kích thước, hỗ trợ sẵn các hàm duyệt mảng như `.map()` (biến đổi), `.filter()` (lọc phần tử). |
| Con trỏ hàm / Hàm truyền vào hàm | Arrow Function `(x) => { ... }` | Cú pháp viết hàm ngắn gọn: dấu `=>` thay cho việc khai báo tên hàm rườm rà. |
| Đơn luồng tuần tự (Chờ đọc đĩa) | Bất đồng bộ (`async` / `await`) | Không làm đơ ứng dụng khi đang đọc ảnh nặng hoặc truy vấn cơ sở dữ liệu. |

---

## ☕ 2. GIẢI THÍCH BẤT ĐỒNG BỘ: VÍ DỤ "THẺ RUNG GỌI CÀ PHÊ"

Nếu bạn chỉ mới học C++ cơ bản (lập trình màn hình console đen trắng), toàn bộ mã lệnh chạy tuần tự từ trên xuống dưới:
```cpp
// Tư duy tuần tự trong C++ cơ bản:
std::cout << "1. Bắt đầu đọc ảnh CT từ đĩa...\n";
DocTepAnhNang("anh_ct_phoi.jpg"); // Hàm này chạy mất 2 giây -> MÀN HÌNH ĐƠ CỨNG 2 GIÂY!
std::cout << "2. Đọc xong, hiển thị lên màn hình!\n";
```
Nếu áp dụng cách này lên điện thoại di động: **Trong 2 giây đó, người dùng chạm vào màn hình sẽ không có phản hồi gì, nút bấm bị đơ, hệ điều hành Android sẽ hiện cảnh báo "Ứng dụng không phản hồi (ANR)" và buộc đóng app!**

### Giải pháp trong TypeScript: "Thẻ rung gọi cà phê" (Promise)
Hãy tưởng tượng bạn đi mua trà sữa hoặc cà phê:
1. Bạn gọi món và trả tiền tại quầy thu ngân.
2. Thu ngân không bắt bạn đứng chôn chân tại quầy để đợi pha xong, mà đưa cho bạn một **chiếc thẻ rung báo hiệu**. Chiếc thẻ rung này trong lập trình gọi là một **`Promise` (Lời hứa)**.
3. Trong lúc chiếc thẻ chưa rung, bạn có thể tự do đi tìm bàn ngồi, lướt web, nghe nhạc (Ứng dụng di động vẫn mượt mà, người dùng bấm nút back, cuộn trang bình thường).
4. Khi nước pha xong, thẻ rung lên: Bạn cầm thẻ quay lại lấy ly nước (Dữ liệu đã sẵn sàng).

```typescript
// 1. Hàm đọc ảnh trả về một "Chiếc thẻ rung" (Promise)
function docAnhCTAsync(duongDan: string): Promise<string> {
  // Trả về lời hứa: Hệ thống sẽ đọc file ngầm, khi xong sẽ báo
}

// 2. Cách dùng trong thực tế với async / await:
async function xuLyChanDoan() {
  console.log("1. Gửi yêu cầu đọc ảnh...");
  
  // Từ khóa 'await' có nghĩa là: "Tạm dừng đoạn mã này lại đợi ly cà phê pha xong,
  // nhưng KHÔNG ĐƯỢC làm đơ ứng dụng, để luồng chính tiếp tục vẽ giao diện!"
  const duLieuAnh = await docAnhCTAsync("anh_ct.jpg");
  
  console.log("2. Đã có ảnh, bắt đầu chạy AI!");
}
```

> [!IMPORTANT]
> **2 Quy tắc bắt buộc ghi nhớ**:
> 1. Hàm nào có chữ `async` ở đầu thì giá trị nó trả về luôn là một `Promise`.
> 2. Muốn "đợi" kết quả của một `Promise` mà không làm đơ app, đặt chữ `await` trước tên hàm đó. Từ khóa `await` chỉ được đứng trong hàm có chữ `async`.

---

## 🎨 3. TƯ DUY GIAO DIỆN REACT NATIVE: "GIAO DIỆN LÀ BẢN VẼ CỦA DỮ LIỆU"

Trong lập trình C++ cổ điển, nếu muốn đổi chữ trên nút bấm, bạn phải tìm đúng nút đó và ra lệnh:
```cpp
nutBam->SetText("Đang phân tích...");
nutBam->SetColor(GRAY);
```

Trong React Native, bạn **không bao giờ ra lệnh trực tiếp cho nút bấm**. Thay vào đó, bạn quản lý một biến trạng thái gọi là **`State`**:

```typescript
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

export const NutChanDoan = () => {
  // Khai báo biến trạng thái: dangChay (true/false)
  const [dangChay, setDangChay] = useState(false);

  const bamNut = async () => {
    setDangChay(true); // 1. Đổi trạng thái sang "Đang chạy" -> Giao diện TỰ ĐỘNG vẽ lại chữ "Đang chạy..."
    await chayMoHinhAI(); // 2. Đợi AI suy luận ngầm
    setDangChay(false); // 3. Xong việc -> Giao diện TỰ ĐỘNG vẽ lại chữ "Bắt đầu chẩn đoán"
  };

  return (
    <Button 
      title={dangChay ? "Đang chạy mô hình AI..." : "Bắt đầu chẩn đoán"} 
      disabled={dangChay}
      onPress={bamNut}
    />
  );
};
```

---

## 📝 4. BÀI TẬP TỰ LUYỆN TẬP VÀ ĐÁP ÁN

### Bài tập 1: Khai báo cấu trúc dữ liệu
Hãy viết một `interface` bằng TypeScript đặt tên là `ThongTinBenhNhan` gồm các thông tin:
- Mã bệnh nhân (`maBN`): chuỗi ký tự.
- Tuổi (`tuoi`): số nguyên.
- Có tiền sử hút thuốc lá hay không (`hutThuoc`): đúng/sai.
- Danh sách triệu chứng (`trieuChung`): mảng các chuỗi ký tự.

<details>
<summary>👉 Nhấn vào đây để xem đáp án Bài tập 1</summary>

```typescript
export interface ThongTinBenhNhan {
  maBN: string;
  tuoi: number;
  hutThuoc: boolean;
  trieuChung: string[]; // hoặc Array<string>
}
```
</details>

### Bài tập 2: Giải thích cơ chế luồng
Tại sao khi gọi hàm suy luận AI `runNativePipelineFromFilePath(path)` trong [`AIImageResultScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/AIImageResultScreen.tsx), chúng ta bắt buộc phải dùng `await`? Điều gì sẽ xảy ra nếu ta bỏ quên chữ `await`?

<details>
<summary>👉 Nhấn vào đây để xem đáp án Bài tập 2</summary>

- **Khi có `await`**: JavaScript sẽ đợi tiến trình native C++ (ONNX Runtime + LiteRT) chạy xong lát cắt và trả về kết quả dự đoán thực tế (xác suất Lành tính, Ác tính).
- **Nếu bỏ quên `await`**: Biến nhận kết quả sẽ chỉ nhận một đối tượng `Promise` rỗng (chiếc thẻ rung chưa có nước). Ứng dụng sẽ ngay lập tức chạy dòng code tiếp theo khi mô hình AI chưa tính toán xong, dẫn đến việc lấy dữ liệu xác suất bị `undefined` và gây lỗi sập app (Crash).
</details>
