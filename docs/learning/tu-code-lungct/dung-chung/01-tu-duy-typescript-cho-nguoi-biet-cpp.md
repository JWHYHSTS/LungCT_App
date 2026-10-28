# CHƯƠNG 1: TƯ DUY TYPESCRIPT VÀ REACT NATIVE DÀNH CHO NGƯỜI BIẾT C++
### Chuyển đổi tư duy lập trình từ C++ cơ bản sang môi trường Web & Di động hiện đại

> **Mục tiêu bài học**:
> - Hiểu rõ sự khác biệt giữa mô hình biên dịch tĩnh của C++ và mô hình thông dịch/JIT của TypeScript/JavaScript.
> - Làm quen với hệ thống kiểu tĩnh của TypeScript từ góc nhìn của lập trình viên C++.
> - Nắm bắt khái niệm bất đồng bộ (Asynchronous), Vòng lặp sự kiện (Event Loop), Promise và `async`/`await`.
> - Hiểu cách React Native xây dựng giao diện từ các hàm thành phần (Functional Components), Props và State.

---

## 💡 1. BẢNG SO SÁNH KHÁI NIỆM: C++ VS TYPESCRIPT / REACT NATIVE

| Khái niệm trong C++ | Khái niệm tương đương trong TypeScript / React | Sự khác biệt cốt lõi cần lưu ý |
| :--- | :--- | :--- |
| `int`, `float`, `double` | `number` | TypeScript gom tất cả số nguyên và số thực thành kiểu `number` (chuẩn IEEE 754 64-bit float). Không có `int` riêng! |
| `std::string`, `char*` | `string` | Chuỗi trong TypeScript là bất biến (immutable), được bọc trong nháy đơn `'...'` hoặc template string `` `...` ``. |
| `bool` | `boolean` | Giá trị chỉ có `true` hoặc `false`. Lưu ý các giá trị "truthy" và "falsy" khi viết câu điều kiện. |
| `void*`, con trỏ thô | `any` hoặc `unknown` | `any` bỏ qua kiểm tra kiểu (nguy hiểm, giống ép kiểu bừa bãi); `unknown` an toàn hơn, bắt buộc phải kiểm tra kiểu trước khi dùng. |
| `nullptr` | `null` và `undefined` | `null` là giá trị rỗng được gán chủ động; `undefined` là biến chưa được khởi tạo hoặc thuộc tính không tồn tại. |
| `struct`, `class` (dữ liệu) | `interface` hoặc `type` | Chỉ dùng để kiểm tra kiểu lúc biên dịch (compile-time); khi chuyển thành JavaScript sẽ biến mất hoàn toàn (zero runtime overhead). |
| Mảng tĩnh `int arr[10]` | Mảng động `number[]` hoặc `Array<number>` | Mảng trong TypeScript co giãn tự động giống `std::vector<T>` trong C++, hỗ trợ các hàm cực mạnh như `.map()`, `.filter()`. |
| Con trỏ hàm / Lambda `std::function` | Arrow Function `(param) => { ... }` | Cú pháp viết hàm ngắn gọn, tự động giữ ngữ cảnh con trỏ `this`. |
| Luồng thực thi đa luồng `std::thread` | Bất đồng bộ đơn luồng (`async`/`await`, Event Loop) | JavaScript chạy trên một luồng chính duy nhất (Single-threaded). Các tác vụ I/O, mạng, đọc đĩa được đẩy ra hàng đợi sự kiện. |

---

## 🧩 2. CƠ CHẾ BẤT ĐỒNG BỘ: TỪ `std::future` ĐẾN `Promise` VÀ `async/await`

### Trong C++:
Khi đọc một tệp từ đĩa hoặc gọi mạng, nếu bạn gọi hàm đồng bộ, luồng hiện tại sẽ **bị chặn cứng (blocking)**:
```cpp
// C++ Blocking call
std::string data = ReadDatabaseSync("usr-doc-01"); // Luồng giao diện bị đơ đến khi đọc xong!
```
Để không bị đơ giao diện, C++ phải tạo một thread mới:
```cpp
std::future<std::string> fut = std::async(std::launch::async, ReadDatabaseSync, "usr-doc-01");
// Phải quản lý thread, lock, mutex... rất phức tạp
```

### Trong TypeScript / React Native:
Toàn bộ giao diện di động chạy trên **JS Thread**. Nếu bạn chặn JS Thread quá 16ms, ứng dụng sẽ bị tụt khung hình (giật lag, đơ nút bấm). Do đó, 100% tác vụ I/O, Database, Mạng và AI đều là **Bất đồng bộ (Non-blocking)** qua `Promise`:

```typescript
// Hàm trả về một Promise (giống như std::future trong C++)
async function getPatients(ownerId: string): Promise<PatientEntity[]> {
  // Từ khóa 'await' tạm dừng hàm này lại, nhường luồng cho giao diện vẽ tiếp
  // Khi nào CSDL đọc xong, hàm sẽ tự động chạy tiếp từ điểm này!
  const data = await cryptoVault.querySecureSqlAsync(ownerId, "SELECT * FROM patients");
  return data;
}
```

> [!IMPORTANT]
> **Quy tắc vàng cho người học C++**:
> - Bất cứ hàm nào có từ khóa `async` thì kết quả trả về luôn được bọc trong một `Promise<T>`.
> - Muốn lấy giá trị thực từ `Promise`, bạn **bắt buộc phải dùng từ khóa `await`** trước lời gọi hàm, hoặc dùng `.then()`.
> - Từ khóa `await` chỉ được phép viết bên trong một hàm có khai báo `async`.

---

## 🎨 3. TƯ DUY COMPONENT TRONG REACT NATIVE

Trong C++ GUI (như Qt hoặc Win32 API), bạn thường tạo một cửa sổ và gọi hàm sửa đổi trực tiếp (Imperative Programming):
```cpp
// C++ Imperative GUI: Ra lệnh trực tiếp
button->SetText("Lưu kết quả");
button->SetColor(RED);
```

Trong React Native, bạn lập trình theo tư duy **Khai báo (Declarative Programming)**: Giao diện là một hàm số nhận đầu vào là Dữ liệu (`State` và `Props`) để trả về hình ảnh hiển thị:
$$\text{UI} = f(\text{State}, \text{Props})$$

```typescript
// Component là một hàm trả về mã JSX (giống như HTML)
export const SaveButton = ({ isLoading, onPress }: { isLoading: boolean; onPress: () => void }) => {
  return (
    <Button 
      title={isLoading ? "Đang lưu..." : "Lưu kết quả"}
      disabled={isLoading}
      onPress={onPress}
    />
  );
};
```

Khi trạng thái `isLoading` đổi từ `false` sang `true`, React sẽ **tự động vẽ lại (re-render)** nút bấm với dòng chữ "Đang lưu...". Bạn không cần phải tìm con trỏ của nút bấm để gọi lệnh cập nhật thủ công!

---

## 📝 4. BÀI TẬP TỰ LUYỆN TẬP TƯ DUY

1. **Câu hỏi 1**: Tại sao trong file [`AIImageResultScreen.tsx`](file:///c:/Users/thudi/OneDrive/Desktop/LungCT_Workspace/LungCT_DoAn/mobile/src/features/doctor/screens/AIImageResultScreen.tsx), khi tính toán thời gian `startedAt` và `finishedAt`, chúng ta không thể dùng một biến toàn cục C++ tĩnh `static int timer`?
   - *Gợi ý trả lời*: Vì trong React Native, mỗi lần màn hình hiển thị hoặc chuyển đổi trạng thái, component sẽ được gọi lại. Sử dụng biến trạng thái cục bộ của lượt chạy (`runSessionId`, `timestamp`) giúp đảm bảo tính cô lập và tránh việc hai lần phân tích AI bị ghi đè dữ liệu lên nhau.
2. **Câu hỏi 2**: Viết một interface TypeScript mô tả một ca bệnh phổi (`LungCase`) gồm: mã ca bệnh (chuỗi), độ tuổi (số), triệu chứng (danh sách chuỗi), và trạng thái đã duyệt (đúng/sai).
