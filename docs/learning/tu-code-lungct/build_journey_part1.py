# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN GIÁO TRÌNH 'CÙNG TÔI XÂY ỨNG DỤNG LUNGCT TỪ ĐẦU'
(Xây dựng từng mốc theo chuỗi phụ thuộc thực tế, chia nhỏ từng phân đoạn,
hướng dẫn chi tiết từng dòng code, cách nối ghép vào App đang chạy và quan sát tương tác)
"""

from build_large_curriculum import add_full_step

def append_journey_milestones_part1(doc):
    # =========================================================================
    # MỐC 1: KHỞI TẠO DỰ ÁN TRẮNG VÀ CHẠY THỬ MÀN HÌNH ĐẦU TIÊN
    # =========================================================================
    
    # BƯỚC 1: Khởi tạo thư mục và dự án
    add_full_step(
        doc, step_num=1,
        title="Tạo Thư Mục Thực Hành Và Khởi Tạo Dự Án Trắng Với Expo Blank-TypeScript",
        purpose="Tạo thư mục độc lập ở gốc ổ đĩa và dùng công cụ npx create-expo-app để sinh bộ khung dự án React Native TypeScript chuẩn.",
        terminal_location="Cửa sổ Windows PowerShell tại gốc ổ đĩa C:\\.",
        shell_action="""# 1. Tạo thư mục thực hành độc lập (tránh OneDrive đồng bộ gây lỗi khóa file EBUSY)
mkdir C:\\Practice_LungCT
cd C:\\Practice_LungCT

# 2. Khởi tạo dự án React Native mẫu trắng với TypeScript
npx create-expo-app@latest mobile -t blank-typescript
cd mobile""",
        code_file_path="package.json (Do công cụ tự sinh)",
        full_code="""// Tệp package.json do công cụ tự sinh (bạn KHÔNG cần tự gõ lại tệp này):
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios"
  },
  "dependencies": {
    "expo": "~58.0.19",
    "react": "19.3.0",
    "react-native": "0.88.0"
  },
  "devDependencies": {
    "@types/react": "~19.3.0",
    "typescript": "~6.0.3"
  },
  "private": true
}""",
        line_by_line_explanation=[
            ["mkdir C:\\Practice_LungCT", "Lệnh tạo thư mục thực hành mới ở gốc ổ đĩa để đường dẫn tệp ngắn nhất (tránh lỗi MAX_PATH > 260 ký tự trên Windows)."],
            ["npx create-expo-app@latest mobile -t blank-typescript", "Công cụ chính thức tải về mẫu dự án React Native trống có sẵn cấu hình TypeScript chuẩn."],
            ["\"main\": \"index.ts\"", "Khai báo điểm khởi nhập của ứng dụng JavaScript/TypeScript."],
            ["\"react-native\": \"0.88.0\"", "Phiên bản React Native hiện đại với kiến trúc mới New Architecture."]
        ],
        comment_guide="Phân biệt rõ: Đây là các tệp do công cụ npx tự động sinh ra; bạn chỉ cần quan sát để hiểu cấu trúc dự án, không phải tự tay gõ lại từng dòng.",
        wiring_guide="Sau khi lệnh chạy xong, toàn bộ cấu trúc dự án đã sẵn sàng tại C:\\Practice_LungCT\\mobile.",
        run_and_verify="Kiểm tra trong PowerShell bằng lệnh 'ls'. Thấy xuất hiện thư mục node_modules, tệp App.tsx, package.json và tsconfig.json.",
        troubleshooting="Nếu npx báo lỗi mạng: Đảm bảo máy tính có kết nối Internet ổn định; có thể đổi sang mạng 4G phát từ điện thoại nếu mạng trường bị chặn npm.",
        checklist="[ ] Thư mục C:\\Practice_LungCT\\mobile đã được tạo thành công\n[ ] package.json có chứa phiên bản React Native 0.88\n[ ] Không thao tác trong thư mục Desktop bị OneDrive đồng bộ"
    )

    # BƯỚC 2: Chạy app lần đầu tiên
    add_full_step(
        doc, step_num=2,
        title="Khởi Chạy Ứng Dụng Lần Đầu Tiên Lên Máy Ảo Android LumaCT_Phone",
        purpose="Xác minh liên kết giữa Metro Bundler, ADB và máy ảo Android hoạt động ổn định trước khi viết bất kỳ dòng mã nào.",
        terminal_location="PowerShell tại thư mục C:\\Practice_LungCT\\mobile.",
        shell_action="npx expo start --android",
        code_file_path="App.tsx (Mặc định do công cụ sinh)",
        full_code="""// App.tsx mặc định do công cụ sinh ra:
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});""",
        line_by_line_explanation=[
            ["npx expo start --android", "Lệnh khởi động máy chủ Metro Bundler và tự động cài đặt Expo Go/Dev Client sang máy ảo Android đang mở."],
            ["export default function App()", "Component gốc đầu tiên được React Native nạp lên màn hình."],
            ["<Text>Open up App.tsx...</Text>", "Đoạn văn bản mặc định hiển thị ở giữa màn hình điện thoại."],
            ["flex: 1, alignItems: 'center'...", "Thuộc tính Flexbox giúp căn giữa nội dung theo cả chiều dọc và chiều ngang."]
        ],
        comment_guide="Giữ nguyên cửa sổ PowerShell này chạy ngầm trong suốt quá trình phát triển để Metro Bundler tự động cập nhật mã mỗi khi bạn lưu file.",
        wiring_guide="Ứng dụng đang hiển thị màn hình trắng với dòng chữ ở giữa. Mọi thay đổi trong code sẽ phản chiếu ngay lập tức (Fast Refresh).",
        run_and_verify="Mở máy ảo LumaCT_Phone: Thấy xuất hiện dòng chữ 'Open up App.tsx to start working on your app!' trên nền trắng.",
        troubleshooting="Nếu báo 'No Android connected devices': Gõ lệnh 'adb devices' ở một tab PowerShell khác để kiểm tra xem máy ảo đã kết nối thành công chưa.",
        checklist="[ ] Máy ảo Android LumaCT_Phone hiển thị ứng dụng thành công\n[ ] Metro Bundler ở trạng thái sẵn sàng lắng nghe thay đổi mã nguồn"
    )

    # BƯỚC 3: Cài đặt các thư viện phụ thuộc cần thiết
    add_full_step(
        doc, step_num=3,
        title="Cài Đặt Các Gói Thư Viện Nền Tảng Cho Giao Diện Và Điều Hướng",
        purpose="Bổ sung các thư viện chính thức đã kiểm chứng tương thích với React Native 0.88: Navigation, Safe Area, SVG và Font.",
        terminal_location="Mở MỘT CỬA SỔ POWERSHELL THỨ HAI tại C:\\Practice_LungCT\\mobile.",
        shell_action="""# Cài đặt thư viện điều hướng và an toàn giao diện:
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens react-native-svg
npm install @react-native-async-storage/async-storage expo-font expo-localization i18next react-i18next""",
        code_file_path="package.json (Cập nhật dependencies)",
        full_code="""// Các dependencies được tự động thêm vào package.json:
// "@react-navigation/native": "^7.5.1",
// "react-native-screens": "~4.30.0",
// "react-native-svg": "15.16.0",
// "expo-font": "~58.0.10" """,
        line_by_line_explanation=[
            ["@react-navigation/native", "Thư viện điều phối chuyển đổi qua lại giữa các màn hình di động."],
            ["react-native-safe-area-context", "Bảo vệ giao diện không bị chèn vào tai thỏ (Notch) hoặc thanh điều hướng Android."],
            ["react-native-svg", "Vẽ các biểu tượng y tế dạng vector độ phân giải cao không bị vỡ hạt."],
            ["expo-font", "Nạp font chữ Be Vietnam Pro trực tiếp từ bộ nhớ ứng dụng."]
        ],
        comment_guide="Giải thích lý do dùng cửa sổ PowerShell thứ hai: Để không phải tắt Metro Bundler đang chạy ở cửa sổ thứ nhất.",
        wiring_guide="Các thư viện sau khi cài đặt sẽ nằm trong node_modules và sẵn sàng để import vào các tệp tiếp theo.",
        run_and_verify="Mở package.json kiểm tra thấy xuất hiện đủ danh sách các gói vừa cài đặt.",
        troubleshooting="Nếu gặp xung đột phiên bản ERESOLVE: Thêm cờ '--legacy-peer-deps' vào sau lệnh npm install.",
        checklist="[ ] Đã cài đặt đủ các gói phụ thuộc giao diện\n[ ] Metro Bundler ở cửa sổ 1 vẫn chạy bình thường không bị crash"
    )

    # BƯỚC 4: Chuẩn bị Asset Fonts Be Vietnam Pro
    add_full_step(
        doc, step_num=4,
        title="Tạo Thư Mục Assets Và Đặt Bộ Font Be Vietnam Pro Chuẩn Y Tế",
        purpose="Chuẩn bị 3 tệp font (.ttf) tiếng Việt chuẩn y tế (Regular, Medium, SemiBold) để ứng dụng hiển thị giao diện chuyên nghiệp theo Figma.",
        terminal_location="PowerShell cửa sổ 2 tại C:\\Practice_LungCT\\mobile.",
        shell_action="""# 1. Tạo thư mục chứa font chữ
mkdir -p assets/fonts

# 2. Bạn sao chép 3 tệp font từ dự án gốc hoặc tải từ Google Fonts:
#    - assets/fonts/BeVietnamPro-Regular.ttf
#    - assets/fonts/BeVietnamPro-Medium.ttf
#    - assets/fonts/BeVietnamPro-SemiBold.ttf""",
        code_file_path="assets/fonts/ (3 tệp font nhị phân .ttf)",
        full_code="""// 3 tệp nhị phân font chữ y tế bắt buộc phải có mặt:
// assets/fonts/BeVietnamPro-Regular.ttf   (Nét chữ thông thường 400)
// assets/fonts/BeVietnamPro-Medium.ttf    (Nét chữ trung bình 500)
// assets/fonts/BeVietnamPro-SemiBold.ttf  (Nét chữ đậm tiêu đề 600)""",
        line_by_line_explanation=[
            ["mkdir -p assets/fonts", "Lệnh tạo thư mục chứa tài nguyên phông chữ trong dự án di động."],
            ["BeVietnamPro-Regular.ttf", "Font chữ tối ưu hóa cho hiển thị tiếng Việt có dấu, không bị lỗi hiển thị ô vuông."],
            ["BeVietnamPro-SemiBold.ttf", "Dùng cho tiêu đề các thẻ bệnh nhân và số liệu điểm số chẩn đoán AI."]
        ],
        comment_guide="Font chữ là tài nguyên nhị phân (asset); bạn lấy từ thư mục assets/fonts của dự án gốc đặt vào thư mục mới.",
        wiring_guide="Font này sẽ được nạp trong App.tsx thông qua hook useFonts() ở các bước sau.",
        run_and_verify="Gõ 'ls assets/fonts/' trong PowerShell: Thấy hiển thị đủ 3 tệp .ttf.",
        troubleshooting="Nếu đặt sai tên tệp: Hệ thống sẽ không tìm thấy font. Đảm bảo viết hoa/thường chính xác từng ký tự.",
        checklist="[ ] Thư mục assets/fonts chứa đủ 3 tệp BeVietnamPro\n[ ] Dung lượng mỗi tệp khoảng 200KB - 300KB"
    )

print("[*] Module append_journey_milestones_part1 ready.")
